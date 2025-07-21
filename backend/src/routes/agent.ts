
// backend/src/routes/agent.ts
import express from 'express';
import { jwtMiddleware } from '../middleware/auth';
import { buildPrompt, callLLM, extractUrls, isUrlSafe, fetchAndParseUrl, trimConversationToFitTokens, countTokens } from '../services/ragPipeline';
import knex from 'knex';
import config from '../../knexfile';

const router = express.Router();
const db = knex(config[process.env.NODE_ENV || 'development']);

// Helper: get or create one conversation per user
async function getOrCreateConversation(userId: number) {
  let conversation = await db('conversation').where({ user_id: userId }).first();
  if (!conversation) {
    const [idObj] = await db('conversation').insert({ user_id: userId }).returning('id');
    const conversationId = typeof idObj === 'object' ? idObj.id : idObj;
    conversation = await db('conversation').where({ id: conversationId }).first();
  }
  return conversation;
}

// Helper: get messages for a conversation
async function getConversationMessages(conversationId: number) {
  return await db('message').where({ conversation_id: conversationId }).orderBy('created_at');
}

// GET /api/agent/conversation - Return current user's conversation messages
router.get('/conversation', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated.' });
  try {
    const conversation = await db('conversation').where({ user_id: userId }).first();
    if (!conversation) {
      return res.json({ history: [] });
    }
    const messages = await getConversationMessages(conversation.id);
    // Return as { role, content }
    const history = messages.map(msg => ({ role: msg.sender, content: msg.content }));
    res.json({ history });
  } catch (err) {
    console.error('[agent/get/conversation] Error:', err);
    res.status(500).json({ error: 'Error fetching conversation.' });
  }
});
// POST /api/agent/chat
router.post('/chat', jwtMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = (req as any).user?.id;
    if (!userId || !message) return res.status(400).json({ error: 'Missing userId or message.' });

    // Enforce one conversation per user
    const conversation = await getOrCreateConversation(userId);
    const conversationId = conversation.id;

    // Get conversation history
    const messages = await getConversationMessages(conversationId);
    const history = messages.map(msg => ({ role: msg.sender, content: msg.content }));

    // --- AGENT ACTION LOGIC ---
    // Import new functions
    const { handleAgentAction, detectIntentWithLLM, callLLM } = await import('../services/ragPipeline');

    // Get last assistant suggestion (if any)
    let pendingAction: string | undefined = undefined;
    if (history.length >= 2) {
      const lastAssistantMsg = history[history.length - 1];
      const lastUserMsg = history[history.length - 2];
      // Simple heuristic: if last assistant message contains "Would you like me to" or "Should I", treat as pending action
      if (lastAssistantMsg.role === 'assistant' && /would you like me to|should i/i.test(lastAssistantMsg.content)) {
        pendingAction = lastUserMsg.content;
      }
    }

    // Decide and execute agent action
    const actionResult = await handleAgentAction(history, message, pendingAction); // logs prompt with [callLLM][intent] and [callLLM][agent] as needed

    // Extract URLs and inject a summary (do not fetch or parse)
    const urls = extractUrls(message);
    const contextChunks: { text: string }[] = [];
    if (urls.length > 0) {
      contextChunks.push({ text: `[User mentioned URLs: ${urls.join(', ')}]` });
    }

    // --- Always inject live cart items into prompt context ---
    async function injectLiveCartContext(contextChunks: { text: string }[]) {
      const cart = await db('cart').where({ user_id: userId }).first();
      const cartItems = cart ? await db('cart_item').where({ cart_id: cart.id }) : [];
      let cartSummary;
      if (cartItems.length > 0) {
        const productIds = cartItems.map(item => item.product_id);
        const products = await db('product').whereIn('id', productIds);
        const itemsText = cartItems.map(item => {
          const product = products.find(p => p.id === item.product_id);
          return product ? `${item.quantity} x ${product.name}` : null;
        }).filter(Boolean).join(', ');
        cartSummary = `User's cart contains: ${itemsText}.`;
      } else {
        cartSummary = `User's cart is empty.`;
      }
      contextChunks.push({ text: cartSummary });
    }

    await injectLiveCartContext(contextChunks);
    // Build prompt
    const promptMessages = buildPrompt(contextChunks, history, message);
    const trimmedPrompt = await trimConversationToFitTokens(promptMessages, 4000);

    let responseText: string | undefined = undefined;
    let actionStatus: string | null = null;
    let cartLog: any = null;

    // --- Perform backend cart actions if confirmed and intent is actionable ---
    if (actionResult.confirmed && actionResult.intent.action !== 'unknown') {
      try {
        if (actionResult.intent.action === 'end_session') {
          // End session: delete conversation/messages and return thank you
          if (conversation) {
            await db('message').where({ conversation_id: conversation.id }).del();
            await db('conversation').where({ id: conversation.id }).del();
          }
          responseText = 'Thank you for being with us. Your session has ended and your conversation was safely deleted.';
          actionStatus = 'Session ended.';
          cartLog = null;
        } else if (actionResult.intent.action === 'add_to_cart') {
          // Use LLM-powered extraction utility for product name
          const { extractProductsFromMessage } = await import('../services/ragPipeline');
          const extraction = await extractProductsFromMessage(message, 'add');
          if (extraction.products.length > 1) {
            actionStatus = 'Bulk add to cart is not yet supported. Please specify only one product.';
            responseText = actionStatus;
            cartLog = null;
          } else if (extraction.products.length === 1) {
            const productName = extraction.products[0].toLowerCase().trim();
            const cart = await db('cart').where({ user_id: userId }).first();
            if (!cart) throw new Error('Cart not found');
            // Fuzzy search: get all products where name contains the query
            let products = await db('product').whereRaw('LOWER(name) LIKE ?', [`%${productName}%`]);
            // Rank: exact match first, then partial
            products = products.sort((a, b) => {
              const aName = a.name.toLowerCase();
              const bName = b.name.toLowerCase();
              if (aName === productName && bName !== productName) return -1;
              if (bName === productName && aName !== productName) return 1;
              if (aName.startsWith(productName) && !bName.startsWith(productName)) return -1;
              if (bName.startsWith(productName) && !aName.startsWith(productName)) return 1;
              return aName.localeCompare(bName);
            });
            // If still no results, try keyword search
            if (!products || products.length === 0) {
              const keywords = productName.split(/\s+/).filter(k => k.length > 2);
              if (keywords.length > 0) {
                const keywordQuery = keywords.map(k => `LOWER(name) LIKE '%${k}%'`).join(' OR ');
                products = await db('product').whereRaw(keywordQuery);
              }
            }
            if (!products || products.length === 0) throw new Error('Product not found');
            // If multiple candidates, use LLM to pick best match
            let selectedProduct = products[0];
            if (products.length > 1) {
              const productList = products.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
              const rerankPrompt = [
                { role: 'system', content: `You are an AI assistant for a supermarket. The user asked to add "${productName}" to their cart.` },
                { role: 'user', content: `Here are the matching products:\n${productList}\n\nWhich product best matches the user's request? Reply with the product name.` }
              ];
              const llmResponse = await callLLM(rerankPrompt, 'ranking');
              const llmReply = llmResponse.trim().toLowerCase();
              const found = products.find(p => p.name.toLowerCase().includes(llmReply));
              if (found) selectedProduct = found;
            }
            // Add the selected product to cart
            await db('cart_item').insert({ cart_id: cart.id, product_id: selectedProduct.id, quantity: 1 });
            actionStatus = `Added ${selectedProduct.name} to cart.`;
            const cartItems = await db('cart_item').where({ cart_id: cart.id });
            cartLog = { cartId: cart.id, items: cartItems };
          } else {
            actionStatus = 'No product specified.';
            responseText = actionStatus;
            cartLog = null;
          }
        } else if (actionResult.intent.action === 'make_dish') {
          // Feature in development: dish creation
          actionStatus = 'Sorry, dish creation is not supported yet. We are working on this feature.';
          responseText = actionStatus;
          cartLog = null;
        } else if (actionResult.intent.action === 'remove_from_cart') {
          // Use LLM-powered extraction utility
          const { extractProductsFromMessage } = await import('../services/ragPipeline');
          const extraction = await extractProductsFromMessage(message, 'remove');
          const cart = await db('cart').where({ user_id: userId }).first();
          if (!cart) throw new Error('Cart not found');
          if (extraction.all) {
            await db('cart_item').where({ cart_id: cart.id }).del();
            actionStatus = 'Removed all items from cart.';
            cartLog = { cartId: cart.id, items: [] };
          } else if (extraction.products.length > 1) {
            actionStatus = 'Bulk remove from cart is not yet supported. Please specify only one product.';
            responseText = actionStatus;
            cartLog = null;
          } else if (extraction.products.length === 1) {
            const productName = extraction.products[0].toLowerCase().trim();
            // Fuzzy search for products in cart matching the name
            const cartItems = await db('cart_item').where({ cart_id: cart.id });
            if (!cartItems || cartItems.length === 0) throw new Error('Cart is empty');
            const productIds = cartItems.map(item => item.product_id);
            let products = await db('product').whereIn('id', productIds).andWhereRaw('LOWER(name) LIKE ?', [`%${productName}%`]);
            // If still no results, try keyword search
            if (!products || products.length === 0) {
              const keywords = productName.split(/\s+/).filter(k => k.length > 2);
              if (keywords.length > 0) {
                const keywordQuery = keywords.map(k => `LOWER(name) LIKE '%${k}%'`).join(' OR ');
                products = await db('product').whereIn('id', productIds).andWhereRaw(keywordQuery);
              }
            }
            if (!products || products.length === 0) throw new Error('Product not found in cart');
            // If multiple candidates, use LLM to pick best match
            let selectedProduct = products[0];
            if (products.length > 1) {
              const productList = products.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
              const rerankPrompt = [
                { role: 'system', content: `You are an AI assistant for a supermarket. The user asked to remove "${productName}" from their cart.` },
                { role: 'user', content: `Here are the matching products in the cart:\n${productList}\n\nWhich product best matches the user's request? Reply with the product name.` }
              ];
              const llmResponse = await callLLM(rerankPrompt, 'ranking');
              const llmReply = llmResponse.trim().toLowerCase();
              const found = products.find(p => p.name.toLowerCase().includes(llmReply));
              if (found) selectedProduct = found;
            }
            // Remove one instance of the selected product from cart
            const items = await db('cart_item').where({ cart_id: cart.id, product_id: selectedProduct.id });
            if (items.length === 0) throw new Error('Product not in cart');
            await db('cart_item').where({ id: items[0].id }).del();
            actionStatus = `Removed one ${selectedProduct.name} from cart.`;
            const updatedCartItems = await db('cart_item').where({ cart_id: cart.id });
            cartLog = { cartId: cart.id, items: updatedCartItems };
          } else {
            actionStatus = 'No product specified.';
            responseText = actionStatus;
            cartLog = null;
          }
        } else if (actionResult.intent.action === 'show_cart') {
          // Directly return backend cart summary
          const cart = await db('cart').where({ user_id: userId }).first();
          const cartItems = cart ? await db('cart_item').where({ cart_id: cart.id }) : [];
          cartLog = { cartId: cart ? cart.id : null, items: cartItems };
          actionStatus = 'Show cart requested.';
          if (cartItems.length > 0) {
            const productIds = cartItems.map(item => item.product_id);
            const products = await db('product').whereIn('id', productIds);
            const itemsText = cartItems.map(item => {
              const product = products.find(p => p.id === item.product_id);
              return product ? `* ${item.quantity} x ${product.name}` : null;
            }).filter(Boolean).join('\n');
            responseText = `Your cart contains:\n\n${itemsText}`;
          } else {
            responseText = 'Your cart is empty.';
          }
        } else if (actionResult.intent.action === 'recommend_product') {
          actionStatus = `Product recommendation requested: ${actionResult.intent.query}`;
        }
      } catch (err) {
        actionStatus = `Action error: ${err instanceof Error ? err.message : String(err)}`;
      }
    }

    // For non-show_cart, use LLM response, but skip for add_to_cart and remove_from_cart
    if (responseText === undefined) {
      if (actionResult.intent.action === 'add_to_cart' || actionResult.intent.action === 'remove_from_cart') {
        // Do NOT call LLM, always use backend status message
        responseText = actionStatus || 'Action completed.';
      } else {
        responseText = await callLLM(trimmedPrompt, 'agent');
      }
    }

    // Store user and assistant messages unless session was ended (conversation deleted)
    let finalResponse = responseText;
    if (actionStatus && /^Action error:/i.test(actionStatus)) {
      finalResponse = 'Sorry, something went wrong with your request. This might be because the product was not found in your cart, or there was a technical issue. Would you like to see your cart contents or try again?'
        + '\n\n[Note: This action was decided by our AI assistant. The message is generated by the backend for clarity.]';
    } else if (actionStatus && (/^Added /i.test(actionStatus) || /^Removed /i.test(actionStatus))) {
      finalResponse = actionStatus + '\n\n[Note: This action was decided by our AI assistant. The message is generated by the backend for clarity.]';
    }

    // Only insert messages if conversation still exists and session is not ended
    if (actionResult.intent.action !== 'end_session') {
      const stillExists = await db('conversation').where({ id: conversationId }).first();
      if (stillExists) {
        await db('message').insert({ conversation_id: conversationId, sender: 'user', content: message });
        await db('message').insert({ conversation_id: conversationId, sender: 'assistant', content: finalResponse });
      }
    }
    res.json({ response: finalResponse, conversationId, action: actionResult, actionStatus, cartLog });
  } catch (err) {
    console.error('[agent/chat] Error:', err);
    res.status(500).json({ error: 'Agent error.' });
  }
});

// DELETE /api/agent/conversation/:userId - Wipe a user's conversation for fresh testing
router.delete('/conversation/:userId', jwtMiddleware, async (req, res) => {
  const paramUserId = Number(req.params.userId);
  const userId = (req as any).user?.id;
  if (!userId || !paramUserId || userId !== paramUserId) return res.status(403).json({ error: 'Forbidden: User mismatch.' });
  try {
    const conversation = await db('conversation').where({ user_id: userId }).first();
    if (conversation) {
      await db('message').where({ conversation_id: conversation.id }).del();
      await db('conversation').where({ id: conversation.id }).del();
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[agent/delete] Error:', err);
    res.status(500).json({ error: 'Delete error.' });
  }
});

// POST /api/agent/end - End the user's session, nuke conversation/messages, return thank you
router.post('/end', jwtMiddleware, async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated.' });
  try {
    const conversation = await db('conversation').where({ user_id: userId }).first();
    if (conversation) {
      await db('message').where({ conversation_id: conversation.id }).del();
      await db('conversation').where({ id: conversation.id }).del();
    }
    res.json({ message: 'Thank you for being with us. Your session has ended and your conversation was safely deleted.' });
  } catch (err) {
    console.error('[agent/end] Error:', err);
    res.status(500).json({ error: 'End session error.' });
  }
});
// ...existing code...

export default router;