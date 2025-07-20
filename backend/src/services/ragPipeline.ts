// backend/src/services/ragPipeline.ts
// RAG pipeline for AI agent: prompt building, LLM call, URL context

import axios from 'axios';
import cheerio from 'cheerio';
import { InferenceClient } from "@huggingface/inference";
const HF_API_TOKEN = process.env.HF_API_TOKEN;
const LLM_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';
const inference = new InferenceClient(HF_API_TOKEN);

// --- URL Safety & Fetching ---
export async function isUrlSafe(url: string): Promise<boolean> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey) return false;
  const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
  const payload = {
    client: { clientId: "ecommerce-ai-agent", clientVersion: "1.0" },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }]
    }
  };
  try {
    const res = await axios.post(apiUrl, payload);
    // If matches found, URL is unsafe
    return !res.data.matches;
  } catch (err) {
    // On error, be safe and block
    return false;
  }
}

export async function fetchAndParseUrl(url: string): Promise<string | null> {
  try {
    const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = res.data;
    const $ = cheerio.load(html);
    // Remove script, style, and noscript tags
    $('script, style, noscript').remove();
    // Get visible text from body
    const text = $('body').text();
    // Clean up whitespace
    return text.replace(/\s+/g, ' ').trim();
  } catch {
    return null;
  }
}

// --- Prompt Building ---
// Build prompt for agent LLM response WITHOUT cart context (for add-to-cart)
export function buildAgentPrompt(
  conversation: Array<{ role: string; content: string }>,
  userInput: string
): Array<{ role: string; content: string }> {
  const personaMessage: { role: string; content: string } = {
    role: 'system',
    content: 'You are a helpful AI agent for the groceries store Fresh Food. Use the conversation history to answer user questions.'
  };
  const userMessage: { role: string; content: string } = {
    role: 'user',
    content: userInput
  };
  return [
    personaMessage,
    ...conversation,
    userMessage
  ];
}
export function buildPrompt(
  contextChunks: Array<{ text: string }>,
  conversation: Array<{ role: string; content: string }>,
  userInput: string
): Array<{ role: string; content: string }> {
  // Persona and instructions for the agent
  const personaMessage: { role: string; content: string } = {
    role: 'system',
    content: 'You are a helpful AI agent for the groceries store Fresh Food. Use the provided context and conversation history to answer user questions.'
  };

  // Merge cart instruction and cart summary into one system message
  let cartContext = '';
  if (contextChunks.length > 0) {
    cartContext = contextChunks.map(chunk => chunk.text).join('\n\n');
  } else {
    cartContext = 'No additional context provided.';
  }
  const cartInstructionAndSummary: { role: string; content: string } = {
    role: 'system',
    content: cartContext
  };

  // User message
  const userMessage: { role: string; content: string } = {
    role: 'user',
    content: userInput
  };

  // Assemble prompt
  return [
    personaMessage,
    cartInstructionAndSummary,
    ...conversation,
    userMessage
  ];
}


// --- LLM Call ---
// --- Utility: Robust ingredient extraction from LLM response ---
/**
 * Extracts ingredient names from an LLM response string.
 * Handles numbered, bulleted, and plain lists, and ignores extra info.
 */
export function extractIngredientsFromLLMResponse(response: string): string[] {
  // Find the section after 'ingredients' or 'list of ingredients' if present
  let lines = response.split(/\n|\r/).map(l => l.trim()).filter(l => l.length > 0);
  // If response contains a block after a phrase, focus on that block
  const startIdx = lines.findIndex(l => /ingredients/i.test(l));
  if (startIdx >= 0 && startIdx < lines.length - 1) {
    lines = lines.slice(startIdx + 1);
  }
  // Only keep lines that look like ingredients (numbered, bulleted, or plain)
  const ingredientLines = lines.filter(l =>
    /^\d+\./.test(l) || /^- /.test(l) || /^[a-zA-Z][a-zA-Z ,()'-]+$/.test(l)
  );
  // Clean up each line: remove numbers, dashes, extra info in parentheses, and after commas
  return ingredientLines.map(l => {
    let name = l.replace(/^\d+\.\s*|^-\s*/,'').trim();
    name = name.replace(/\(.*?\)/g, '').split(',')[0].trim();
    return name;
  }).filter(n => n.length > 0);
}
export async function callLLM(
  messages: Array<{ role: string; content: string }>,
  purpose: 'intent' | 'ingredients' | 'agent' | 'ranking' = 'agent'
): Promise<string> {
  // Log the full prompt for debugging, with purpose
  console.log(`[callLLM][${purpose}] Prompt sent to LLM:`, JSON.stringify(messages, null, 2));
  // Use Hugging Face Inference SDK chatCompletion for multi-turn chat
  const result = await inference.chatCompletion({
    model: LLM_MODEL,
    messages,
    parameters: { max_new_tokens: 400, temperature: 0.7, top_p: 0.9 }
  });
  return result.choices?.[0]?.message?.content || "";
}

// --- Token Counting & Trimming ---
export async function countTokens(text: string, modelName = 'mistralai/Mistral-7B-Instruct-v0.3'): Promise<number> {
  try {
    const HF_API_TOKEN = process.env.HF_API_TOKEN;
    const url = `https://api-inference.huggingface.co/tokenizer/${modelName}`;
    const headers = { Authorization: `Bearer ${HF_API_TOKEN}`, 'Content-Type': 'application/json' };
    const payload = { inputs: text };
    const response = await axios.post(url, payload, { headers });
    // Response: { token_count: number, tokens: [...] }
    if (response.data && typeof response.data.token_count === 'number') {
      return response.data.token_count;
    }
    // Fallback: try to count tokens array
    if (response.data && Array.isArray(response.data.tokens)) {
      return response.data.tokens.length;
    }
    // If response is not as expected, fallback below
  } catch (error) {
    console.error(`[countTokens] Online token counting error: ${error}`);
    // Fallback: estimate tokens by splitting on whitespace (approximate for English)
    if (typeof text === 'string' && text.length > 0) {
      // Roughly, 1 token per 0.75 words for English (OpenAI estimate)
      const wordCount = text.trim().split(/\s+/).length;
      return Math.max(1, Math.round(wordCount / 0.75));
    }
    return -1;
  }
  // Final fallback if all else fails
  return -1;
}

export async function trimConversationToFitTokens(conversation: Array<{ role: string; content: string }>, maxTokens: number): Promise<Array<{ role: string; content: string }>> {
  let trimmed = [...conversation];
  while (trimmed.length > 0) {
    const tokenCount = await countTokens(JSON.stringify(trimmed));
    if (tokenCount <= maxTokens) break;
    trimmed.shift(); // Remove oldest
  }
  return trimmed;
}

// --- Utility: Extract URLs ---
export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return text.match(urlRegex) || [];
}


// --- Utility: Extract product(s) from user message for add/remove actions ---
/**
 * Uses the LLM to extract product names from a user message for add/remove workflows.
 * Handles:
 *   - Single product: returns array with one product
 *   - Multiple products: returns array with multiple products
 *   - Remove all: returns special { all: true }
 */
export async function extractProductsFromMessage(message: string, action: 'add' | 'remove'): Promise<{ products: string[]; all: boolean }> {
  // Remove all detection (for remove only)
  const lower = message.toLowerCase();
  const removeAllPatterns = [
    /remove all( the)?( items| products)?( from (my )?cart)?/i,
    /remove everything( from (my )?cart)?/i,
    /delete all( the)?( items| products)?/i,
    /clear (my )?cart/i,
    /empty (my )?cart/i
  ];
  if (action === 'remove' && removeAllPatterns.some(re => re.test(message))) {
    return { products: [], all: true };
  }

  // LLM prompt for extraction
  const prompt = [
    { role: 'system', content: `You are an AI assistant for a supermarket. Extract the product(s) the user wants to ${action === 'add' ? 'add to' : 'remove from'} their cart. Reply with a comma-separated list of product names. If the user wants to remove all items, reply with "ALL".` },
    { role: 'user', content: message }
  ];
  const { callLLM } = await import('./ragPipeline');
  const llmResponse = await callLLM(prompt, 'agent');
  const response = llmResponse.trim();
  if (action === 'remove' && /^all$/i.test(response)) {
    return { products: [], all: true };
  }
  // Split response into products
  const products = response.split(/,|\n|\r/).map(p => p.trim()).filter(p => p.length > 0);
  return { products, all: false };
}




// --- LLM-based Confirmation Classification ---
/**
 * Uses the LLM to classify if the user's reply is a confirmation for a pending action.
 * @param conversation Array of previous messages (role, content)
 * @param pendingAction Description of the pending action (e.g., "add milk to cart")
 * @param userReply The user's reply (e.g., "go ahead", "yup")
 * @returns true if confirmed, false otherwise
 */
export async function classifyConfirmationWithLLM(
  conversation: Array<{ role: string; content: string }>,
  pendingAction: string,
  userReply: string
): Promise<boolean> {
  // Build a short prompt for the LLM
  const systemPrompt =
    `You are an AI assistant helping with groceries. The user previously requested: "${pendingAction}". You suggested: "Would you like me to proceed?". The user replied: "${userReply}". Is this a confirmation to proceed with the action? Answer "yes" or "no".`;

  // Use only the last few turns for context
  const promptMessages = [
    { role: 'system', content: systemPrompt }
  ];

  // Call the LLM
  const result = await callLLM(promptMessages, 'agent');
  // Normalize and check response
  const answer = result.trim().toLowerCase();
  return answer.startsWith('yes');
}


// --- Intent Detection ---
/**
 * Uses the LLM to classify user intent from a message, given fixed options.
 * Returns the intent name as a string (add_to_cart, remove_from_cart, show_cart, recommend_product, make_dish, end_session, unknown).
 */
export async function detectIntentWithLLM(userMessage: string): Promise<AgentIntent> {
  const systemPrompt = `You are an intent classifier for a grocery shopping assistant. The possible intents are:
- add_to_cart: The user wants to add a product or ingredient to their cart. Example: "Add milk to my cart."
- remove_from_cart: The user wants to remove a product or ingredient from their cart. Example: "Remove eggs from my cart."
- show_cart: The user wants to see the contents of their cart. Example: "Show me my cart."
- recommend_product: The user wants a product recommendation. Example: "Recommend a snack."
- make_dish: The user wants to make a dish and needs ingredients. Example: "I want to make lasagna."
- end_session: The user wants to end or pay for their cart, cancel their cart, or finish the shopping session. Examples: "Cancel my cart.", "Pay my cart.", "End my session.", "Checkout and finish."
- unknown: The user's intent does not match any of the above.
Classify the user's intent based on their message. Only reply with the intent name.`;
  const promptMessages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];
  const result = (await callLLM(promptMessages, 'intent')).trim();
  switch (result) {
    case 'add_to_cart': {
      const addMatch = userMessage.toLowerCase().match(/add (.+?) to (my )?cart/);
      return { action: 'add_to_cart', product: addMatch ? addMatch[1].trim() : '' };
    }
    case 'remove_from_cart': {
      let product = '';
      const removeMatch = userMessage.toLowerCase().match(/remove (.+?) from (my )?cart/);
      if (removeMatch) {
        product = removeMatch[1].trim();
      }
      if (!product && globalThis._lastAssistantMessage) {
        const msg = globalThis._lastAssistantMessage;
        const removedMatch = msg.match(/removed (the |a |an )?(.+?) from your cart/i);
        if (removedMatch) {
          product = removedMatch[2].trim();
        }
      }
      return { action: 'remove_from_cart', product };
    }
    case 'show_cart':
      return { action: 'show_cart' };
    case 'recommend_product': {
      const recommendMatch = userMessage.toLowerCase().match(/recommend (.+)/);
      return { action: 'recommend_product', query: recommendMatch ? recommendMatch[1].trim() : '' };
    }
    case 'make_dish': {
      const makeDishMatch = userMessage.toLowerCase().match(/(?:make|cook|prepare|i want to make|i want to cook|i want to prepare) (a |an |the )?([a-zA-Z ]+)/);
      const needForDishMatch = userMessage.toLowerCase().match(/items i need for (making|cooking|preparing) (a |an |the )?([a-zA-Z ]+)/);
      const dish = makeDishMatch ? makeDishMatch[2].trim() : (needForDishMatch ? needForDishMatch[3].trim() : '');
      return { action: 'make_dish', dish };
    }
    case 'end_session':
      return { action: 'end_session' };
    default:
      return { action: 'unknown' };
  }
}

export type AgentIntent =
  | { action: 'add_to_cart'; product: string }
  | { action: 'remove_from_cart'; product: string }
  | { action: 'show_cart' }
  | { action: 'recommend_product'; query?: string }
  | { action: 'make_dish'; dish: string }
  | { action: 'end_session' }
  | { action: 'unknown' };


// --- Agent Action Decision Logic ---
declare global {
  // Used for fallback product extraction in intent detection
  var _lastAssistantMessage: string | undefined;
}
/**
 * Decides and executes agent actions based on user message and conversation context.
 * If intent is direct, acts immediately. If reply is ambiguous, uses LLM for confirmation.
 */
export async function handleAgentAction(
  conversation: Array<{ role: string; content: string }>,
  userMessage: string,
  pendingAction?: string
): Promise<{ intent: AgentIntent; confirmed: boolean }> {
  // Detect intent from user message using LLM
  // Store last assistant message globally for fallback extraction
  const lastAssistantMsg = conversation.slice().reverse().find(msg => msg.role === 'assistant');
  if (lastAssistantMsg) {
    globalThis._lastAssistantMessage = lastAssistantMsg.content;
  } else {
    globalThis._lastAssistantMessage = '';
  }
  const intent = await detectIntentWithLLM(userMessage);

  // If intent is direct, act immediately
  if (intent.action !== 'unknown') {
    return { intent, confirmed: true };
  }

  // If there's a pending action and user reply is ambiguous, ask LLM for confirmation
  if (pendingAction) {
    const confirmed = await classifyConfirmationWithLLM(conversation, pendingAction, userMessage);
    return { intent: { action: 'unknown' }, confirmed };
  }

  // No action detected
  return { intent: { action: 'unknown' }, confirmed: false };
}
