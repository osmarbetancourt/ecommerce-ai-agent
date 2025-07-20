# API Endpoints Documentation

## Products

### GET /api/products
- **Description:** List all products
- **Example:**
  ```http
  GET /api/products
  ```
- **Response:** Array of product objects

### GET /api/products/:id
- **Description:** Get a single product by ID
- **Example:**
  ```http
  GET /api/products/1
  ```
- **Response:** Product object or 404 if not found

### POST /api/products
- **Description:** Create a new product
- **Example:**
  ```http
  POST /api/products
  Content-Type: application/json
  {
    "name": "Product Name",
    "price": 9.99,
    "category_id": 1
  }
  ```
- **Required Body Params:**
  - name (string)
  - price (number)
  - category_id (integer)
- **Response:** Created product object

### PUT /api/products/:id
- **Description:** Update a product
- **Example:**
  ```http
  PUT /api/products/1
  Content-Type: application/json
  {
    "name": "Updated Name",
    "price": 19.99
  }
  ```
- **Response:** Updated product object or 404 if not found

### DELETE /api/products/:id
- **Description:** Delete a product
- **Example:**
  ```http
  DELETE /api/products/1
  ```
- **Response:** `{ success: true }` or 404 if not found

---

## Categories

### GET /api/categories
- **Description:** List all categories
- **Example:**
  ```http
  GET /api/categories
  ```
- **Response:** Array of category objects

### GET /api/categories/:id
- **Description:** Get a single category by ID
- **Example:**
  ```http
  GET /api/categories/1
  ```
- **Response:** Category object or 404 if not found

### POST /api/categories
- **Description:** Create a new category
- **Example:**
  ```http
  POST /api/categories
  Content-Type: application/json
  {
    "name": "Category Name"
  }
  ```
- **Required Body Params:**
  - name (string)
- **Response:** Created category object

### PUT /api/categories/:id
- **Description:** Update a category
- **Example:**
  ```http
  PUT /api/categories/1
  Content-Type: application/json
  {
    "name": "Updated Category Name"
  }
  ```
- **Response:** Updated category object or 404 if not found

### DELETE /api/categories/:id
- **Description:** Delete a category
- **Example:**
  ```http
  DELETE /api/categories/1
  ```
- **Response:** `{ success: true }` or 404 if not found

---

## Carts

### GET /api/carts
- **Description:** List all carts
- **Example:**
  ```http
  GET /api/carts
  ```
- **Response:** Array of cart objects

### GET /api/carts/:id
- **Description:** Get a single cart by ID (includes items)
- **Example:**
  ```http
  GET /api/carts/1
  ```
- **Response:** Cart object with items array or 404 if not found

### POST /api/carts
- **Description:** Create a new cart
- **Example:**
  ```http
  POST /api/carts
  Content-Type: application/json
  {}
  ```
- **Response:** Created cart object

### PUT /api/carts/:id
- **Description:** Update a cart
- **Example:**
  ```http
  PUT /api/carts/1
  Content-Type: application/json
  {}
  ```
- **Response:** Updated cart object or 404 if not found

### DELETE /api/carts/:id
- **Description:** Delete a cart
- **Example:**
  ```http
  DELETE /api/carts/1
  ```
- **Response:** `{ success: true }` or 404 if not found

---

## Cart Items

### GET /api/cart-items
- **Description:** List all cart items
- **Example:**
  ```http
  GET /api/cart-items
  ```
- **Response:** Array of cart item objects

### GET /api/cart-items/cart/:cartId
- **Description:** Get all items for a specific cart
- **Example:**
  ```http
  GET /api/cart-items/cart/1
  ```
- **Response:** Array of cart item objects for the cart

### GET /api/cart-items/:id
- **Description:** Get a single cart item by ID
- **Example:**
  ```http
  GET /api/cart-items/1
  ```
- **Response:** Cart item object or 404 if not found

### POST /api/cart-items
- **Description:** Add a new item to a cart
- **Example:**
  ```http
  POST /api/cart-items
  Content-Type: application/json
  {
    "cart_id": 1,
    "product_id": 2,
    "quantity": 3
  }
  ```
- **Required Body Params:**
  - cart_id (integer)
  - product_id (integer)
  - quantity (integer)
- **Response:** Created cart item object

### PUT /api/cart-items/:id
- **Description:** Update a cart item
- **Example:**
  ```http
  PUT /api/cart-items/1
  Content-Type: application/json
  {
    "quantity": 5
  }
  ```
- **Response:** Updated cart item object or 404 if not found

### DELETE /api/cart-items/:id
- **Description:** Remove a cart item
- **Example:**
  ```http
  DELETE /api/cart-items/1
  ```
- **Response:** `{ success: true }` or 404 if not found

---

## Orders

### GET /api/orders
- **Description:** List all orders
- **Example:**
  ```http
  GET /api/orders
  ```
- **Response:** Array of order objects

### GET /api/orders/:id
- **Description:** Get a single order by ID (includes items)
- **Example:**
  ```http
  GET /api/orders/1
  ```
- **Response:** Order object with items array or 404 if not found

### POST /api/orders
- **Description:** Create a new order
- **Example:**
  ```http
  POST /api/orders
  Content-Type: application/json
  {
    "user_id": 1,
    "total_price": 99.99
  }
  ```
- **Required Body Params:**
  - user_id (integer)
  - total_price (number)
- **Response:** Created order object

### PUT /api/orders/:id
- **Description:** Update an order
- **Example:**
  ```http
  PUT /api/orders/1
  Content-Type: application/json
  {
    "total_price": 120.00
  }
  ```
- **Response:** Updated order object or 404 if not found

### DELETE /api/orders/:id
- **Description:** Delete an order
- **Example:**
  ```http
  DELETE /api/orders/1
  ```
- **Response:** `{ success: true }` or 404 if not found

---

## Order Items

### GET /api/order-items
- **Description:** List all order items
- **Example:**
  ```http
  GET /api/order-items
  ```
- **Response:** Array of order item objects

### GET /api/order-items/order/:orderId
- **Description:** Get all items for a specific order
- **Example:**
  ```http
  GET /api/order-items/order/1
  ```
- **Response:** Array of order item objects for the order

### GET /api/order-items/:id
- **Description:** Get a single order item by ID
- **Example:**
  ```http
  GET /api/order-items/1
  ```
- **Response:** Order item object or 404 if not found

### POST /api/order-items
- **Description:** Add an item to an order
- **Example:**
  ```http
  POST /api/order-items
  Content-Type: application/json
  {
    "order_id": 1,
    "product_id": 2,
    "quantity": 3,
    "price_at_purchase": 9.99
  }
  ```
- **Required Body Params:**
  - order_id (integer)
  - product_id (integer)
  - quantity (integer)
  - price_at_purchase (number)
- **Response:** Created order item object

### PUT /api/order-items/:id
- **Description:** Update an order item
- **Example:**
  ```http
  PUT /api/order-items/1
  Content-Type: application/json
  {
    "quantity": 5
  }
  ```
- **Response:** Updated order item object or 404 if not found

### DELETE /api/order-items/:id
- **Description:** Remove an item from an order
- **Example:**
  ```http
  DELETE /api/order-items/1
  ```
- **Response:** `{ success: true }` or 404 if not found

---

## Users

### POST /api/users/oauth/google
   ```http
   POST /api/users/oauth/google
   Content-Type: application/json
   {
     "code": "<Google OAuth Code>"
   }
   ```
**Required Body Params:**
  - code (string)
**Response:**
  - User object
  - JWT is set as an httpOnly cookie (not returned in response body)

### GET /api/users/me
- **Description:** Get the current authenticated user's info from JWT cookie
- **Example:**
  ```http
  GET /api/users/me
  ```
- **Response:**
  - `{ user: { ...user fields... } }` if authenticated
  - 401 if not authenticated
  - 404 if user not found

### GET /api/users
- **Description:** List all users
- **Example:**
  ```http
  GET /api/users
  ```
- **Response:** Array of user objects

### GET /api/users/:id
- **Description:** Get a single user by ID
- **Example:**
  ```http
  GET /api/users/1
  ```
- **Response:** User object or 404 if not found

### POST /api/users/register
- **Description:** Register a new user
- **Example:**
  ```http
  POST /api/users/register
  Content-Type: application/json
  {
    "name": "User Name",
    "email": "user@example.com"
  }
  ```
- **Required Body Params:**
  - name (string)
  - email (string)
- **Response:** Created user object

### PUT /api/users/:id
- **Description:** Update a user profile
- **Example:**
  ```http
  PUT /api/users/1
  Content-Type: application/json
  {
    "name": "Updated Name",
    "avatar_url": "https://example.com/avatar.png"
  }
  ```
- **Response:** Updated user object or 404 if not found

### DELETE /api/users/:id
- **Description:** Delete a user
- **Example:**
  ```http
  DELETE /api/users/1
  ```
- **Response:** `{ success: true }` or 404 if not found



---

## Conversations

### GET /api/conversations
- **Description:** List all conversations
- **Example:**
  ```http
  GET /api/conversations
  ```
- **Response:** Array of conversation objects

### GET /api/conversations/:id
- **Description:** Get a single conversation by ID
- **Example:**
  ```http
  GET /api/conversations/1
  ```
- **Response:** Conversation object or 404 if not found

### POST /api/conversations
- **Description:** Create a new conversation
- **Example:**
  ```http
  POST /api/conversations
  Content-Type: application/json
  {
    "user_id": 1,
    "topic": "Order Help"
  }
  ```
- **Required Body Params:**
  - user_id (integer)
  - topic (string, optional)
  - context (string, optional)
- **Response:** Created conversation object

### PUT /api/conversations/:id
- **Description:** Update a conversation
- **Example:**
  ```http
  PUT /api/conversations/1
  Content-Type: application/json
  {
    "topic": "Updated Topic"
  }
  ```
- **Response:** Updated conversation object or 404 if not found

### DELETE /api/conversations/:id
- **Description:** Delete a conversation
- **Example:**
  ```http
  DELETE /api/conversations/1
  ```
- **Response:** `{ success: true }` or 404 if not found

---

## Messages

### GET /api/messages
- **Description:** List all messages
- **Example:**
  ```http
  GET /api/messages
  ```
- **Response:** Array of message objects

### GET /api/messages/conversation/:conversationId
- **Description:** Get all messages for a specific conversation
- **Example:**
  ```http
  GET /api/messages/conversation/1
  ```
- **Response:** Array of message objects for the conversation

### GET /api/messages/:id
- **Description:** Get a single message by ID
- **Example:**
  ```http
  GET /api/messages/1
  ```
- **Response:** Message object or 404 if not found

### POST /api/messages
- **Description:** Send a new message
- **Example:**
  ```http
  POST /api/messages
  Content-Type: application/json
  {
    "conversation_id": 1,
    "user_id": 2,
    "sender": "user",
    "content": "Hello!"
  }
  ```
- **Required Body Params:**
  - conversation_id (integer)
  - user_id (integer)
  - sender (string)
  - content (string)
- **Response:** Created message object

### PUT /api/messages/:id
- **Description:** Update a message
- **Example:**
  ```http
  PUT /api/messages/1
  Content-Type: application/json
  {
    "content": "Updated message"
  }
  ```
- **Response:** Updated message object or 404 if not found

### DELETE /api/messages/:id
- **Description:** Delete a message
- **Example:**
  ```http
  DELETE /api/messages/1
  ```
- **Response:** `{ success: true }` or 404 if not found

---

## Notifications

### GET /api/notifications
- **Description:** List all notifications
- **Example:**
  ```http
  GET /api/notifications
  ```
- **Response:** Array of notification objects

### GET /api/notifications/:id
- **Description:** Get a single notification by ID
- **Example:**
  ```http
  GET /api/notifications/1
  ```
- **Response:** Notification object or 404 if not found

### POST /api/notifications
- **Description:** Create a notification
- **Example:**
  ```http
  POST /api/notifications
  Content-Type: application/json
  {
    "user_id": 1,
    "type": "info",
    "content": "Your order has shipped!"
  }
  ```
- **Required Body Params:**
  - user_id (integer)
  - type (string)
  - content (string)
- **Response:** Created notification object

### PUT /api/notifications/:id
- **Description:** Mark as read/unread or update notification
- **Example:**
  ```http
  PUT /api/notifications/1
  Content-Type: application/json
  {
    "read": true
  }
  ```
- **Response:** Updated notification object or 404 if not found

### DELETE /api/notifications/:id
- **Description:** Delete a notification
- **Example:**
  ```http
  DELETE /api/notifications/1
  ```
- **Response:** `{ success: true }` or 404 if not found

---

## Payment Methods

### GET /api/payment-methods
- **Description:** List all payment methods
- **Example:**
  ```http
  GET /api/payment-methods
  ```
- **Response:** Array of payment method objects

### GET /api/payment-methods/user/:userId
- **Description:** Get payment methods for a specific user
- **Example:**
  ```http
  GET /api/payment-methods/user/1
  ```
- **Response:** Array of payment method objects for the user

### GET /api/payment-methods/:id
- **Description:** Get a single payment method by ID
- **Example:**
  ```http
  GET /api/payment-methods/1
  ```
- **Response:** Payment method object or 404 if not found

### POST /api/payment-methods
- **Description:** Add a payment method
- **Example:**
  ```http
  POST /api/payment-methods
  Content-Type: application/json
  {
    "user_id": 1,
    "type_id": 2,
    "provider": "Visa",
    "account": "1234",
    "details": "Credit Card",
    "active": true
  }
  ```
- **Required Body Params:**
  - user_id (integer)
  - type_id (integer)
  - provider (string, optional)
  - account (string, optional)
  - details (string, optional)
  - active (boolean, optional)
- **Response:** Created payment method object

### PUT /api/payment-methods/:id
- **Description:** Update a payment method
- **Example:**
  ```http
  PUT /api/payment-methods/1
  Content-Type: application/json
  {
    "provider": "Mastercard",
    "active": false
  }
  ```
- **Response:** Updated payment method object or 404 if not found

### DELETE /api/payment-methods/:id
- **Description:** Delete a payment method
- **Example:**
  ```http
  DELETE /api/payment-methods/1
  ```
- **Response:** `{ success: true }` or 404 if not found

---

## Payment Method Types

### GET /api/payment-method-types
- **Description:** List all payment method types
- **Example:**
  ```http
  GET /api/payment-method-types
  ```
- **Response:** Array of payment method type objects

### GET /api/payment-method-types/:id
- **Description:** Get a single payment method type by ID
- **Example:**
  ```http
  GET /api/payment-method-types/1
  ```
- **Response:** Payment method type object or 404 if not found

### POST /api/payment-method-types
- **Description:** Add a payment method type
- **Example:**
  ```http
  POST /api/payment-method-types
  Content-Type: application/json
  {
    "name": "Credit Card",
    "description": "Standard credit card"
  }
  ```
- **Required Body Params:**
  - name (string)
  - description (string, optional)
- **Response:** Created payment method type object

### PUT /api/payment-method-types/:id
- **Description:** Update a payment method type
- **Example:**
  ```http
  PUT /api/payment-method-types/1
  Content-Type: application/json
  {
    "description": "Updated description"
  }
  ```
- **Response:** Updated payment method type object or 404 if not found

### DELETE /api/payment-method-types/:id
- **Description:** Delete a payment method type
- **Example:**
  ```http
  DELETE /api/payment-method-types/1
  ```
- **Response:** `{ success: true }` or 404 if not found

---

## Reviews

### GET /api/reviews
- **Description:** List all reviews
- **Example:**
  ```http
  GET /api/reviews
  ```
- **Response:** Array of review objects

### GET /api/reviews/product/:productId
- **Description:** Get reviews for a specific product
- **Example:**
  ```http
  GET /api/reviews/product/1
  ```
- **Response:** Array of review objects for the product

### GET /api/reviews/:id
- **Description:** Get a single review by ID
- **Example:**
  ```http
  GET /api/reviews/1
  ```
- **Response:** Review object or 404 if not found

### POST /api/reviews
- **Description:** Add a review
- **Example:**
  ```http
  POST /api/reviews
  Content-Type: application/json
  {
    "user_id": 1,
    "product_id": 2,
    "rating": 5,
    "description": "Great product!"
  }
  ```
- **Required Body Params:**
  - user_id (integer)
  - product_id (integer)
  - rating (integer)
  - description (string)
- **Response:** Created review object

### PUT /api/reviews/:id
- **Description:** Update a review
- **Example:**
  ```http
  PUT /api/reviews/1
  Content-Type: application/json
  {
    "rating": 4,
    "description": "Updated review text"
  }
  ```
- **Response:** Updated review object or 404 if not found

### DELETE /api/reviews/:id
- **Description:** Delete a review
- **Example:**
  ```http
  DELETE /api/reviews/1
  ```
- **Response:** `{ success: true }` or 404 if not found

---

## Roles

### GET /api/roles
- **Description:** List all roles
- **Example:**
  ```http
  GET /api/roles
  ```
- **Response:** Array of role objects

### GET /api/roles/:id
- **Description:** Get a single role by ID
- **Example:**
  ```http
  GET /api/roles/1
  ```
- **Response:** Role object or 404 if not found

### POST /api/roles
- **Description:** Add a role
- **Example:**
  ```http
  POST /api/roles
  Content-Type: application/json
  {
    "name": "admin"
  }
  ```
- **Required Body Params:**
  - name (string)
- **Response:** Created role object

### PUT /api/roles/:id
- **Description:** Update a role
- **Example:**
  ```http
  PUT /api/roles/1
  Content-Type: application/json
  {
    "name": "user"
  }
  ```
- **Response:** Updated role object or 404 if not found

### DELETE /api/roles/:id
- **Description:** Delete a role
- **Example:**
  ```http
  DELETE /api/roles/1
  ```
- **Response:** `{ success: true }` or 404 if not found

---

## Search Index

### GET /api/search-index
- **Description:** List all search index entries
- **Example:**
  ```http
  GET /api/search-index
  ```
- **Response:** Array of search index entry objects

### GET /api/search-index/search?q=keyword
- **Description:** Search index by keyword
- **Example:**
  ```http
  GET /api/search-index/search?q=shoes
  ```
- **Required Query Params:**
  - q (string)
- **Response:** Array of matching search index entry objects

### GET /api/search-index/:id
- **Description:** Get a single search index entry by ID
- **Example:**
  ```http
  GET /api/search-index/1
  ```
- **Response:** Search index entry object or 404 if not found

### POST /api/search-index
- **Description:** Add a search index entry
- **Example:**
  ```http
  POST /api/search-index
  Content-Type: application/json
  {
    "keywords": "shoes, sneakers",
    "product_id": 1
  }
  ```
- **Required Body Params:**
  - keywords (string)
  - product_id (integer, optional)
- **Response:** Created search index entry object

### PUT /api/search-index/:id
- **Description:** Update a search index entry
- **Example:**
  ```http
  PUT /api/search-index/1
  Content-Type: application/json
  {
    "keywords": "updated keywords"
  }
  ```
- **Response:** Updated search index entry object or 404 if not found

### DELETE /api/search-index/:id
- **Description:** Delete a search index entry
- **Example:**
  ```http
  DELETE /api/search-index/1
  ```
- **Response:** `{ success: true }` or 404 if not found

---

## Transactions

### GET /api/transactions
- **Description:** List all transactions
- **Example:**
  ```http
  GET /api/transactions
  ```
- **Response:** Array of transaction objects

### GET /api/transactions/user/:userId
- **Description:** Get transactions for a specific user
- **Example:**
  ```http
  GET /api/transactions/user/1
  ```
- **Response:** Array of transaction objects for the user

### GET /api/transactions/order/:orderId
- **Description:** Get transactions for a specific order
- **Example:**
  ```http
  GET /api/transactions/order/1
  ```
- **Response:** Array of transaction objects for the order

### GET /api/transactions/:id
- **Description:** Get a single transaction by ID
- **Example:**
  ```http
  GET /api/transactions/1
  ```
- **Response:** Transaction object or 404 if not found

### POST /api/transactions
- **Description:** Create a transaction (initiate payment)
- **Example:**
  ```http
  POST /api/transactions
  Content-Type: application/json
  {
    "user_id": 1,
    "order_id": 2,
    "amount": 99.99,
    "status": "pending"
  }
  ```
- **Required Body Params:**
  - user_id (integer)
  - order_id (integer)
  - amount (number)
  - status (string)
- **Response:** Created transaction object

### PUT /api/transactions/:id
- **Description:** Update a transaction (e.g., update status)
- **Example:**
  ```http
  PUT /api/transactions/1
  Content-Type: application/json
  {
    "status": "completed"
  }
  ```
- **Response:** Updated transaction object or 404 if not found

### DELETE /api/transactions/:id
- **Description:** Delete a transaction
- **Example:**
  ```http
  DELETE /api/transactions/1
  ```
- **Response:** `{ success: true }` or 404 if not found

---
