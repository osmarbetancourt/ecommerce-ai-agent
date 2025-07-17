## carts.test.ts

- **Endpoints Covered:**
  - `GET /api/carts` — Returns all carts
  - `GET /api/carts/:id` — Returns a single cart (with items)
  - `POST /api/carts` — Creates a new cart
  - `PUT /api/carts/:id` — Updates a cart
  - `DELETE /api/carts/:id` — Deletes a cart
- **Test Scenarios:**
  - Validates array response for listing
  - Handles non-existent cart (404)
  - Full CRUD flow: create, read, update, delete
  - Uses test environment flag for DB mutation tests
  - Sets up test category for product FK dependency
  - Checks cart items array structure

---

## categories.test.ts

- **Endpoints Covered:**
  - `GET /api/categories` — Returns all categories
  - `GET /api/categories/:id` — Returns a single category
  - `POST /api/categories` — Creates a new category
  - `PUT /api/categories/:id` — Updates a category
  - `DELETE /api/categories/:id` — Deletes a category
- **Test Scenarios:**
  - Validates array response for listing
  - Handles non-existent category (404)
  - Full CRUD flow: create, read, update, delete
  - Uses test environment flag for DB mutation tests
  - Confirms deletion by checking 404 after delete

---

## orders.test.ts

- **Endpoints Covered:**
  - `GET /api/orders` — Returns all orders
  - `GET /api/orders/:id` — Returns a single order (with items)
  - `PUT /api/orders/:id` — Updates an order
  - `DELETE /api/orders/:id` — Deletes an order
- **Test Scenarios:**
  - Validates array response for listing
  - Handles non-existent order (404)
  - Full CRUD flow: create, read, update, delete (creation test may be elsewhere)
  - Uses test environment flag for DB mutation tests
  - Checks order items array structure
  - Confirms deletion by checking 404 after delete

---

## products.test.ts

- **Endpoints Covered:**
  - `GET /api/products` — Returns all products
  - `GET /api/products/:id` — Returns a single product
  - `POST /api/products` — Creates a new product
  - `PUT /api/products/:id` — Updates a product
  - `DELETE /api/products/:id` — Deletes a product
- **Test Scenarios:**
  - Validates array response for listing
  - Handles non-existent product (404)
  - Full CRUD flow: create, read, update, delete
  - Uses test environment flag for DB mutation tests
  - Sets up test category for product FK dependency
  - Confirms deletion by checking 404 after delete

---

## order_items.test.ts

- **Endpoints Covered:**
  - `GET /api/order-items` — Returns all order items
  - `GET /api/order-items/order/:orderId` — Returns items for a specific order
  - `GET /api/order-items/:id` — Returns a single order item
  - `POST /api/order-items` — Adds an item to an order
  - `PUT /api/order-items/:id` — Updates an order item
  - `DELETE /api/order-items/:id` — Removes an item from an order
- **Test Scenarios:**
  - Validates array response for listing
  - Handles non-existent order item (404)
  - Full CRUD flow: create, read, update, delete
  - Sets up test user, order, category, and product for dependencies
  - Checks items for a specific order
  - Uses test environment flag for DB mutation tests

---

## cart items (in carts.test.ts)

- **Endpoints Covered:**
  - `GET /api/cart-items` — Returns all cart items
  - `GET /api/cart-items/cart/:cartId` — Returns items for a specific cart
  - `GET /api/cart-items/:id` — Returns a single cart item
  - `POST /api/cart-items` — Adds an item to a cart
  - `PUT /api/cart-items/:id` — Updates a cart item
  - `DELETE /api/cart-items/:id` — Removes an item from a cart
- **Test Scenarios:**
  - Validates array response for listing
  - Handles non-existent cart item (404)
  - Full CRUD flow: create, read, update, delete
  - Sets up test cart, category, and product for dependencies
  - Checks items for a specific cart
  - Uses test environment flag for DB mutation tests
  - Tests error handling for non-existent cart_id

---

## users.test.ts

- **Endpoints Covered:**
  - `POST /api/users/oauth/google` — Login/register via Google OAuth
  - `GET /api/users` — Returns all users
  - `POST /api/users/register` — Registers a new user
  - `PUT /api/users/:id` — Updates a user profile
  - `DELETE /api/users/:id` — Deletes a user
- **Test Scenarios:**
  - Mocks Google OAuth2Client for token verification
  - Validates user creation, update, and deletion via Google OAuth
  - Handles missing/invalid Google tokens and required fields
  - Validates array response for listing users
  - Full CRUD flow: register, update, delete
  - Handles duplicate email registration and missing fields
  - Uses test environment flag for DB mutation tests
  - Confirms deletion by checking user absence in list

---

## conversation_and_messages.test.ts

- **Endpoints Covered:**
  - `GET /api/conversations` — Returns all conversations
  - `GET /api/conversations/:id` — Returns a single conversation
  - `POST /api/conversations` — Creates a new conversation
  - `PUT /api/conversations/:id` — Updates a conversation
  - `DELETE /api/conversations/:id` — Deletes a conversation
  - `POST /api/messages` — Creates a message in a conversation
- **Test Scenarios:**
  - Sets up test user and conversation for dependencies
  - Validates array response for listing conversations
  - Handles non-existent conversation (404)
  - Full CRUD flow: create, read, update, delete for conversations
  - Creates a message in a conversation and validates response
  - Uses test environment flag for DB mutation tests
  - Confirms deletion by checking 404 after delete

---

## notifications.test.ts

- **Endpoints Covered:**
  - `GET /api/notifications` — Returns all notifications
  - `GET /api/notifications/:id` — Returns a single notification
  - `POST /api/notifications` — Creates a notification
  - `PUT /api/notifications/:id` — Marks notification as read
  - `DELETE /api/notifications/:id` — Deletes a notification
- **Test Scenarios:**
  - Sets up test user for notification FK dependency
  - Validates array response for listing notifications
  - Handles non-existent notification (404)
  - Full CRUD flow: create, read, update, delete
  - Marks notification as read and validates response
  - Uses test environment flag for DB mutation tests
  - Confirms deletion by checking 404 after delete
  - Tests error handling for non-existent user_id

---

## payment_methods.test.ts

- **Endpoints Covered:**
  - `GET /api/payment-methods` — Returns all payment methods
  - `GET /api/payment-methods/user/:userId` — Returns payment methods for a user
  - `GET /api/payment-methods/:id` — Returns a single payment method
  - `POST /api/payment-methods` — Adds a payment method
  - `PUT /api/payment-methods/:id` — Updates a payment method
  - `DELETE /api/payment-methods/:id` — Deletes a payment method
- **Test Scenarios:**
  - Sets up test user and payment method type for dependencies
  - Validates array response for listing
  - Handles non-existent payment method (404)
  - Full CRUD flow: create, read, update, delete
  - Checks payment methods for a specific user
  - Uses test environment flag for DB mutation tests
  - Tests error handling for non-existent user_id
  - Confirms deletion by checking 404 after delete

---

## payment method types (in payment_methods.test.ts)

- **Endpoints Covered:**
  - `GET /api/payment-method-types` — Returns all payment method types
  - `GET /api/payment-method-types/:id` — Returns a single payment method type
  - `POST /api/payment-method-types` — Adds a payment method type
  - `PUT /api/payment-method-types/:id` — Updates a payment method type
  - `DELETE /api/payment-method-types/:id` — Deletes a payment method type
- **Test Scenarios:**
  - Validates array response for listing
  - Handles non-existent payment method type (404)
  - Full CRUD flow: create, read, update, delete
  - Uses test environment flag for DB mutation tests
  - Confirms deletion by checking 404 after delete

---

## roles.test.ts

- **Endpoints Covered:**
  - `GET /api/roles` — Returns all roles
  - `GET /api/roles/:id` — Returns a single role
  - `POST /api/roles` — Adds a role
  - `PUT /api/roles/:id` — Updates a role
  - `DELETE /api/roles/:id` — Deletes a role
- **Test Scenarios:**
  - Validates array response for listing
  - Handles non-existent role (404)
  - Full CRUD flow: create, read, update, delete
  - Uses test environment flag for DB mutation tests
  - Confirms deletion by checking 404 after delete

---

## transactions.test.ts

- **Endpoints Covered:**
  - `GET /api/transactions` — Returns all transactions
  - `GET /api/transactions/:id` — Returns a single transaction
  - `POST /api/transactions` — Creates a transaction
  - `GET /api/transactions/user/:userId` — Returns transactions for a user
  - `GET /api/transactions/order/:orderId` — Returns transactions for an order
  - `PUT /api/transactions/:id` — Updates a transaction
  - `DELETE /api/transactions/:id` — Deletes a transaction
- **Test Scenarios:**
  - Sets up test user, order, payment method type, and payment method for dependencies
  - Validates array response for listing
  - Handles non-existent transaction (404)
  - Full CRUD flow: create, read, update, delete
  - Checks transactions for a specific user and order
  - Uses test environment flag for DB mutation tests
  - Confirms deletion by checking 404 after delete

---

## search_index.test.ts

- **Endpoints Covered:**
  - `GET /api/search-index` — Returns all search index entries
  - `GET /api/search-index/:id` — Returns a single search index entry
  - `POST /api/search-index` — Adds a search index entry
  - `GET /api/search-index/search?q=keyword` — Searches index by keyword
  - `PUT /api/search-index/:id` — Updates a search index entry
  - `DELETE /api/search-index/:id` — Deletes a search index entry
- **Test Scenarios:**
  - Validates array response for listing
  - Handles non-existent search index entry (404)
  - Full CRUD flow: create, read, update, delete
  - Searches index by keyword and checks matching entries
  - Uses test environment flag for DB mutation tests
  - Confirms deletion by checking 404 after delete

---

## reviews.test.ts

- **Endpoints Covered:**
  - `GET /api/reviews` — Returns all reviews
  - `GET /api/reviews/:id` — Returns a single review
  - `POST /api/reviews` — Adds a review
  - `GET /api/reviews/product/:productId` — Returns reviews for a product
  - `PUT /api/reviews/:id` — Updates a review
  - `DELETE /api/reviews/:id` — Deletes a review
- **Test Scenarios:**
  - Sets up test user and product for dependencies
  - Validates array response for listing
  - Handles non-existent review (404)
  - Full CRUD flow: create, read, update, delete
  - Checks reviews for a specific product
  - Uses test environment flag for DB mutation tests
  - Confirms deletion by checking 404 after delete

---