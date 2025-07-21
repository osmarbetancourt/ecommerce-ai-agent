# System Diagrams & Coverage – Ecommerce AI Agent

## 1. Database Entity-Relationship Diagram (ERD)
```mermaid
erDiagram
  USER ||--o{ CART : ""
  USER ||--o{ ORDER : ""
  USER ||--o{ REVIEW : ""
  USER ||--o{ NOTIFICATION : ""
  USER ||--o{ PAYMENT_METHOD : ""
  USER ||--o{ MESSAGE : ""
  USER ||--o{ CONVERSATION : ""
  USER ||--o{ TRANSACTION : ""
  USER ||--o{ ROLE : "by role field"
  CART ||--o{ CART_ITEM : ""
  CART_ITEM }o--|| PRODUCT : ""
  PRODUCT }o--|| CATEGORY : ""
  PRODUCT ||--o{ REVIEW : ""
  PRODUCT ||--o{ ORDER_ITEM : ""
  CATEGORY ||--o{ PRODUCT : ""
  ORDER ||--o{ ORDER_ITEM : ""
  ORDER ||--o{ TRANSACTION : ""
  ORDER_ITEM }o--|| PRODUCT : ""
  CONVERSATION ||--o{ MESSAGE : ""
  MESSAGE }o--|| USER : ""
  MESSAGE }o--|| CONVERSATION : ""
  NOTIFICATION }o--|| USER : ""
  PAYMENT_METHOD }o--|| USER : ""
  PAYMENT_METHOD }o--|| PAYMENT_METHOD_TYPE : ""
  PAYMENT_METHOD_TYPE ||--o{ PAYMENT_METHOD : ""
  TRANSACTION }o--|| USER : ""
  TRANSACTION }o--|| ORDER : ""
  TRANSACTION }o--|| PAYMENT_METHOD : ""
  REVIEW }o--|| PRODUCT : ""
  REVIEW }o--|| USER : ""
  SEARCH_INDEX }o--|| PRODUCT : "by ref_id"
  SEARCH_INDEX }o--|| USER : "by ref_id"
  SEARCH_INDEX }o--|| ORDER : "by ref_id"
```

---

## 2. API Coverage Matrix

| DB Table/Entity       | Related Endpoints                                  |
|-----------------------|----------------------------------------------------|
| USER                  | /api/users, /api/users/register, /api/users/oauth/google |
| CART                  | /api/carts, /api/cart-items                        |
| CART_ITEM             | /api/cart-items                                    |
| CATEGORY              | /api/categories                                    |
| PRODUCT               | /api/products, /api/search-index, /api/reviews     |
| ORDER                 | /api/orders, /api/order-items, /api/transactions   |
| ORDER_ITEM            | /api/order-items                                   |
| PAYMENT_METHOD        | /api/payment-methods                               |
| PAYMENT_METHOD_TYPE   | /api/payment-method-types                          |
| TRANSACTION           | /api/transactions                                  |
| REVIEW                | /api/reviews                                       |
| CONVERSATION          | /api/conversations                                 |
| MESSAGE               | /api/messages                                      |
| NOTIFICATION          | /api/notifications                                 |
| ROLE                  | /api/roles                                         |
| SEARCH_INDEX          | /api/search-index                                  |

---

## 3. Test Coverage Matrix

| Test File                | Endpoints Covered (CRUD)                        | Related Entities     |
|--------------------------|-------------------------------------------------|---------------------|
| carts.test.ts            | /api/carts (+cart-items)                        | CART, CART_ITEM     |
| categories.test.ts       | /api/categories                                 | CATEGORY            |
| orders.test.ts           | /api/orders                                     | ORDER, ORDER_ITEM   |
| products.test.ts         | /api/products                                   | PRODUCT             |
| order_items.test.ts      | /api/order-items                                | ORDER_ITEM, PRODUCT |
| users.test.ts            | /api/users, /api/users/register, /api/users/oauth/google | USER        |
| conversation_and_messages.test.ts | /api/conversations, /api/messages      | CONVERSATION, MESSAGE|
| notifications.test.ts    | /api/notifications                              | NOTIFICATION, USER  |
| payment_methods.test.ts  | /api/payment-methods, /api/payment-method-types | PAYMENT_METHOD, PAYMENT_METHOD_TYPE |
| roles.test.ts            | /api/roles                                      | ROLE                |
| transactions.test.ts     | /api/transactions                               | TRANSACTION, ORDER, USER, PAYMENT_METHOD |
| search_index.test.ts     | /api/search-index                               | SEARCH_INDEX, PRODUCT|
| reviews.test.ts          | /api/reviews                                    | REVIEW, PRODUCT, USER|

---

## 4. User Purchase Process Flow (Mermaid Flowchart)

```mermaid
flowchart TD
    A(User Registration/Login) --> B[Create Cart]
    B --> C[Add Products to Cart]
    C --> D[Review Cart]
    D --> E[Checkout/Create Order]
    E --> F[Select/Add Payment Method]
    F --> G[Create Transaction]
    G --> H[Order Confirmation]
    H --> I[Receive Notifications]
    I --> J[Delivery/Status Updates]
    J --> K[Leave Review]
```

---

## 5. Admin & Data Management Flow (Optional)

```mermaid
flowchart TD
    AA(Admin Login) --> AB[Manage Products/SKUs]
    AB --> AC[Bulk CSV Upload]
    AB --> AD[Edit/Delete Products]
    AA --> AE[Manage Users/Roles]
    AA --> AF[View Orders/Transactions]
    AA --> AG[Analytics & BI Dashboard]
    AG --> AH[Run Live SQL Queries]
    AG --> AI[Export Data to Tableau/PowerBI]
```

---

**Tip:** Use [Mermaid Live Editor](https://mermaid-js.github.io/mermaid-live-editor/) or a VSCode Mermaid extension to view and edit these diagrams.

If you want to add more flows (e.g., chatbot/LLM agent process, onboarding), just ask!

---

## 6. AI Agent Chatbot Workflow

```mermaid
flowchart TD
    %% User and Intent Detection
    A(("User sends message")) --> B(("LLM: detectIntentWithLLM"))
    B -->|add_to_cart| C1("Add to Cart")
    B -->|remove_from_cart| C2("Remove from Cart")
    B -->|show_cart| C3("Show Cart")
    B -->|recommend_product| C4("Recommend Product")
    B -->|make_dish| C5("Make Dish (LLM ingredient extraction)")
    B -->|end_session| C6("End Session")
    B -->|unknown| C7("Unknown Intent (confirmation classification if pending)")

    %% Add to Cart branch
    C1 --> D1("LLM: extractProductsFromMessage (extract product(s) from user message, LLM-powered)")
    D1 --> E1("DB: Fuzzy product search & ranking (LLM if multiple matches)")
    E1 --> F1("DB: Add product to cart")
    F1 --> G1("Backend Status: 'Added ... to cart.'")
    G1 --> RAGa

    %% Remove from Cart branch
    C2 --> D2("LLM: extractProductsFromMessage (extract product(s) from user message, LLM-powered)")
    D2 --> E2("DB: Fuzzy product search in cart & ranking (LLM if multiple matches)")
    E2 --> F2("DB: Remove product(s) from cart")
    F2 --> G2("Backend Status: 'Removed ... from cart.'")
    G2 --> RAGa

    %% Show Cart branch
    C3 --> D3("DB: Retrieve cart items")
    D3 --> RAGa

    %% Recommend Product branch
    C4 --> RAGa

    %% Make Dish branch
    C5 --> D5("LLM: Ingredient extraction (callLLM 'ingredients')")
    D5 --> E5("DB: Add ingredients to cart")
    E5 --> F5("Backend Status: 'Added to cart: ...'")
    F5 --> RAGa

    %% Unknown branch
    C7 --> D7("LLM: Confirmation Classification (callLLM 'confirmation')")
    D7 --> RAGa

    %% End Session branch (direct to post-processing)
    C6 --> D6("DB: Delete user conversation and messages")
    D6 --> G6("Backend Status: 'Session ended.'")
    G6 --> POSTPROC

    %% RAG Pipeline steps (context & prompt building)
    RAGa("Extract URLs from user message") --> RAGb("Build context chunks (URLs, cart summary, etc.)")
    RAGb --> RAGc("Inject live cart context into prompt")
    RAGc --> RAGd("Build prompt with persona, context, conversation history, user message")
    RAGd --> RAGe("Trim prompt to token limit (countTokens)")
    RAGe --> AGENT("LLM: callLLM('agent')")

    %% Post-Processing Logic (NEW MVP robust rules)
    AGENT --> INTENTCHECK{"Cart action (add/remove/make_dish)?"}
    INTENTCHECK -- Yes --> STATUSCHECK{"Backend status: Success or Error?"}
    STATUSCHECK -- Success --> USESTATUS("Respond with backend status (actionStatus)\n[optionally append friendly LLM phrase]\n[add AI note]")
    STATUSCHECK -- Error --> ERRORMSG("Respond with friendly error message:\n'Sorry, something went wrong...'\n[add AI note]")
    INTENTCHECK -- No --> LLMRESP("Respond with LLM reply (unless error)\n[add AI note if error]")
    USESTATUS --> Z(("Respond to user"))
    ERRORMSG --> Z
    LLMRESP --> Z

    %% End session bypasses RAG/LLM and goes straight to post-processing
    G6 --> USESTATUS
```