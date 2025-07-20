# Database Schema Overview

---

## CART
| Column      | Type     | Constraints                | Notes                       |
|-------------|----------|---------------------------|-----------------------------|
| id          | integer  | PK, NOT NULL, auto-incr   |                             |
| user_id     | integer  | FK, NOT NULL, UNIQUE      | References USER(id), one cart per user |
| created_at  | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP |   |

## CART_ITEM
| Column      | Type     | Constraints                | Notes                       |
|-------------|----------|---------------------------|-----------------------------|
| id          | integer  | PK, NOT NULL, auto-incr   |                             |
| cart_id     | integer  | FK, NOT NULL, ON DELETE CASCADE | References CART(id)         |
| product_id  | integer  | FK, NOT NULL, ON DELETE CASCADE | References PRODUCT(id)      |
| quantity    | integer  | NOT NULL                  |                             |
| UNIQUE(cart_id, product_id) |          | Ensures one product per cart item |

## CATEGORY
| Column      | Type     | Constraints                | Notes                       |
|-------------|----------|---------------------------|-----------------------------|
| id          | integer  | PK, NOT NULL, auto-incr   |                             |
| name        | character varying | NOT NULL, UNIQUE   |                             |

## CONVERSATION
| Column      | Type     | Constraints                | Notes                       |
|-------------|----------|---------------------------|-----------------------------|
| id          | integer  | PK, NOT NULL, auto-incr   |                             |
| user_id     | integer  | FK, ON DELETE SET NULL    | References USER(id)         |
| topic       | character varying |                   |                             |
| context     | text     |                           |                             |
| created_at  | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP |   |
| updated_at  | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP |   |

## KNEX_MIGRATIONS
| Column      | Type     | Constraints                | Notes                       |
|-------------|----------|---------------------------|-----------------------------|
| id          | integer  | PK, NOT NULL, auto-incr   |                             |
| name        | character varying |                   |                             |
| batch       | integer  |                           |                             |
| migration_time| timestamp with time zone |         |                             |

## KNEX_MIGRATIONS_LOCK
| Column      | Type     | Constraints                | Notes                       |
|-------------|----------|---------------------------|-----------------------------|
| index       | integer  | PK, NOT NULL, auto-incr   |                             |
| is_locked   | integer  |                           |                             |

## MESSAGE
| Column         | Type     | Constraints                | Notes                       |
|----------------|----------|---------------------------|-----------------------------|
| id             | integer  | PK, NOT NULL, auto-incr   |                             |
| user_id        | integer  | FK, ON DELETE SET NULL    | References USER(id)         |
| conversation_id| integer  | FK, ON DELETE CASCADE     | References CONVERSATION(id) |
| sender         | character varying | NOT NULL          |                             |
| content        | text     | NOT NULL                  |                             |
| created_at     | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP |   |

## NOTIFICATION
| Column      | Type     | Constraints                | Notes                       |
|-------------|----------|---------------------------|-----------------------------|
| id          | integer  | PK, NOT NULL, auto-incr   |                             |
| user_id     | integer  | FK, ON DELETE CASCADE     | References USER(id)         |
| type        | character varying | NOT NULL          |                             |
| content     | text     | NOT NULL                  |                             |
| read        | boolean  | NOT NULL DEFAULT false    |                             |
| created_at  | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP |   |

## ORDER
| Column          | Type     | Constraints                | Notes                       |
|-----------------|----------|---------------------------|-----------------------------|
| id              | integer  | PK, NOT NULL, auto-incr   |                             |
| user_id         | integer  | FK, ON DELETE CASCADE     | References USER(id)         |
| total_price     | numeric  | NOT NULL                  |                             |
| created_at      | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP |   |
| delivery_address| character varying |                   |                             |
| delivery_status | character varying | NOT NULL DEFAULT 'pending' |   |
| delivery_eta    | timestamp with time zone |           |                             |
| payment_status  | character varying | NOT NULL DEFAULT 'pending' |   |

## ORDER_ITEM
| Column         | Type     | Constraints                | Notes                       |
|----------------|----------|---------------------------|-----------------------------|
| id             | integer  | PK, NOT NULL, auto-incr   |                             |
| order_id       | integer  | FK, ON DELETE CASCADE     | References ORDER(id)        |
| product_id     | integer  | FK, ON DELETE CASCADE     | References PRODUCT(id)      |
| quantity       | integer  | NOT NULL                  |                             |
| price_at_purchase| numeric| NOT NULL                  |                             |
| UNIQUE(order_id, product_id) |          | Ensures one product per order item |

## PAYMENT_METHOD
| Column      | Type     | Constraints                | Notes                       |
|-------------|----------|---------------------------|-----------------------------|
| id          | integer  | PK, NOT NULL, auto-incr   |                             |
| user_id     | integer  | FK, ON DELETE CASCADE     | References USER(id)         |
| type_id     | integer  | FK, ON DELETE SET NULL    | References PAYMENT_METHOD_TYPE(id) |
| provider    | character varying |                   |                             |
| account     | character varying |                   |                             |
| details     | character varying |                   |                             |
| active      | boolean  | NOT NULL DEFAULT true     |                             |
| created_at  | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP |   |

## PAYMENT_METHOD_TYPE
| Column      | Type     | Constraints                | Notes                       |
|-------------|----------|---------------------------|-----------------------------|
| id          | integer  | PK, NOT NULL, auto-incr   |                             |
| name        | character varying | NOT NULL, UNIQUE   |                             |
| description | character varying |                   |                             |

## PRODUCT
| Column      | Type     | Constraints                | Notes                       |
|-------------|----------|---------------------------|-----------------------------|
| id          | integer  | PK, NOT NULL, auto-incr   |                             |
| name        | character varying | NOT NULL          |                             |
| description | text     |                           |                             |
| price       | numeric  | NOT NULL                  |                             |
| image_url   | text     |                           |                             |
| category_id | integer  | FK, ON DELETE SET NULL    | References CATEGORY(id)     |
| sale_price  | numeric  |                           |                             |
| on_sale     | boolean  | NOT NULL DEFAULT false    |                             |
| stock_quantity| integer| NOT NULL DEFAULT 0        |                             |
| tags        | text     |                           |                             |
| amount_unit | character varying |                   |                             |
| UNIQUE(name, category_id) |          | Ensures product name is unique per category |

## REVIEW
| Column      | Type     | Constraints                | Notes                       |
|-------------|----------|---------------------------|-----------------------------|
| id          | integer  | PK, NOT NULL, auto-incr   |                             |
| user_id     | integer  | FK, ON DELETE CASCADE     | References USER(id)         |
| product_id  | integer  | FK, ON DELETE CASCADE     | References PRODUCT(id)      |
| rating      | integer  | NOT NULL                  |                             |
| description | text     |                           |                             |
| created_at  | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP |   |
| UNIQUE(user_id, product_id) |          | Ensures one review per user per product |

## ROLE
| Column      | Type     | Constraints                | Notes                       |
|-------------|----------|---------------------------|-----------------------------|
| id          | integer  | PK, NOT NULL, auto-incr   |                             |
| name        | character varying | NOT NULL, UNIQUE   |                             |
| description | character varying |                   |                             |

## SEARCH_INDEX
| Column      | Type     | Constraints                | Notes                       |
|-------------|----------|---------------------------|-----------------------------|
| id          | integer  | PK, NOT NULL, auto-incr   |                             |
| type        | character varying | NOT NULL          |                             |
| ref_id      | integer  | NOT NULL                  | Refers to entity by type    |
| keywords    | text     | NOT NULL                  |                             |
| updated_at  | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP |   |
| INDEX(type, ref_id) |          | For fast lookup by type and reference |

## TRANSACTION
| Column          | Type     | Constraints                | Notes                       |
|-----------------|----------|---------------------------|-----------------------------|
| id              | integer  | PK, NOT NULL, auto-incr   |                             |
| user_id         | integer  | FK, ON DELETE CASCADE     | References USER(id)         |
| order_id        | integer  | FK, ON DELETE CASCADE     | References ORDER(id)        |
| payment_method_id| integer | FK, ON DELETE SET NULL    | References PAYMENT_METHOD(id)|
| status          | character varying | NOT NULL DEFAULT 'pending' |   |
| amount          | numeric  | NOT NULL                  |                             |
| transaction_id  | character varying | UNIQUE           |                             |
| created_at      | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP |   |

## USER
| Column      | Type     | Constraints                | Notes                       |
|-------------|----------|---------------------------|-----------------------------|
| id          | integer  | PK, NOT NULL, auto-incr   |                             |
| email       | character varying | NOT NULL, UNIQUE   |                             |
| name        | character varying |                   |                             |
| google_id   | character varying | UNIQUE             |                             |
| created_at  | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP |   |
| role        | character varying | NOT NULL DEFAULT 'user' |   |
| address     | character varying |                   |                             |
| phone       | character varying |                   |                             |
| avatar_url  | character varying |                   |                             |
| last_login  | timestamp with time zone |            |                             |
| INDEX(email) |          | For fast lookup by email |

---
# Notes
- All foreign keys specify ON DELETE rules for referential integrity.
- Unique constraints and indexes are added for data integrity and performance.
- Default values are specified for status, booleans, and timestamps.
- Composite unique constraints are used where appropriate (e.g., one review per user per product).
- For LLM/AI agents: This schema is normalized, supports all documented endpoints, and is optimized for query performance and data integrity.