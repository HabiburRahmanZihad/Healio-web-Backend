# 💊 Helio Web: Complete Postman API Reference

This guide provides a comprehensive breakdown of every API endpoint in the **Helio Web Backend**. Use this to test functionality, verify role-based permissions, and understand the data structures.

---

## 🛠️ Global Configuration
- **Base URL**: `http://localhost:5000`
- **Headers**:
  - `Content-Type: application/json`
  - *Note*: Authentication is handled via session cookies by **Better Auth**. After logging in, Postman will automatically manage the cookies for subsequent requests.

---

## 🔐 Role Access Matrix
| Feature | Admin | Seller | Customer | Public |
| :--- | :---: | :---: | :---: | :---: |
| Browse Medicines | ✅ | ✅ | ✅ | ✅ |
| Manage Categories | ✅ | ❌ | ❌ | ❌ |
| Manage Users (Block) | ✅ | ❌ | ❌ | ❌ |
| Add/Edit Medicines | ❌ | ✅ | ❌ | ❌ |
| Place Orders | ❌ | ❌ | ✅ | ❌ |
| Cancel Orders | ❌ | ❌ | ✅ | ❌ |
| Leave Reviews | ❌ | ❌ | ✅ | ❌ |
| Manage Order Status | ✅ | ✅ | ❌ | ❌ |

---

## 🚀 Quick API Reference

| Method | Endpoint | Description | Access/Role |
| :--- | :--- | :--- | :--- |
| **AUTH** | | | |
| `POST` | `/api/auth/register` | Create a new account | Public |
| `POST` | `/api/auth/login` | Secure user login | Public |
| `GET` | `/api/auth/me` | Get current session data | Authenticated |
| **CATEGORIES** | | | |
| `GET` | `/api/categories` | List all categories | Public |
| `POST` | `/api/categories` | Add a new category | Admin |
| `DELETE` | `/api/categories/:id` | Remove a category | Admin |
| **MEDICINES** | | | |
| `GET` | `/api/medicines` | Query medicines (search/filter) | Public |
| `GET` | `/api/medicines/:id` | Get detailed medicine info | Public |
| `POST` | `/api/seller/medicines` | Add new inventory items | Seller |
| `PUT` | `/api/seller/medicines/:id` | Update stock/price/details | Seller (Own) |
| `DELETE` | `/api/seller/medicines/:id`| Remove inventory items | Seller (Own) |
| **ORDERS** | | | |
| `POST` | `/api/orders` | Checkout and place order | Customer |
| `GET` | `/api/seller/orders` | Get seller's orders | Seller |
| `GET` | `/api/orders` | View order history | Auth (Role based) |
| `GET` | `/api/orders/:id` | View specific order details | Auth |
| `PATCH` | `/api/seller/orders/:id`| Update order status | Seller |
| `PATCH` | `/api/orders/:id/status`| Update delivery status (Admin) | Admin |
| `PATCH` | `/api/orders/:id/cancel`| Cancel a pending order | Customer (Own) |
| `GET` | `/api/orders/seller/stats`| View sales analytics | Seller |
| **REVIEWS** | | | |
| `GET` | `/api/reviews/:medicineId`| See all medicine feedback | Public |
| `POST` | `/api/reviews` | Submit product review | Customer |
| **USERS/ADMIN** | | | |
| `GET` | `/api/users/me` | Fetch active user profile | Authenticated |
| `PATCH` | `/api/users/me` | Update personal profile | Authenticated |
| `GET` | `/api/admin/users` | List all system users | Admin |
| `PATCH` | `/api/admin/users/:id` | Block/Unblock a user | Admin |
| `GET` | `/api/admin/stats` | System-wide analytics | Admin |

---

## 🔑 Authentication (Better Auth)

### 1. Register User
- **URL**: `/api/auth/register` (or `/api/auth/sign-up/email`)
- **Method**: `POST`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "Full Name",
  "role": "CUSTOMER" 
}
```
- **Sample Response** (201):
```json
{
  "id": "user-uuid",
  "name": "Full Name",
  "email": "user@example.com",
  "role": "CUSTOMER"
}
```

### 2. Login
- **URL**: `/api/auth/login` (or `/api/auth/sign-in/email`)
- **Method**: `POST`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```
- **Sample Response** (200):
```json
{
  "session": { "token": "...", "expiresAt": "..." },
  "user": { "id": "...", "name": "...", "role": "..." }
}
```

---

## 🏥 Category Management (Admin Only)

### 3. Get All Categories (Public)
- **URL**: `/api/categories`
- **Method**: `GET`
- **Sample Response**: `[{"id": "...", "name": "Herbal"}]`

### 4. Create Category (Admin)
- **URL**: `/api/categories`
- **Method**: `POST`
- **Body**: `{"name": "Homeopathy"}`
- **Sample Response**: `{"id": "...", "name": "Homeopathy"}`

### 5. Delete Category (Admin)
- **URL**: `/api/categories/:id`
- **Method**: `DELETE`
- **Sample Response**: `{"success": true, "message": "Category removed"}`

---

## 💊 Medicine Management

### 6. Get All Medicines (Public)
- **URL**: `/api/medicines`
- **Method**: `GET`
- **Params**: `search`, `category`, `manufacturer`, `minPrice`, `maxPrice`
- **Sample Response**: 
```json
{
  "success": true,
  "data": [{ "id": "...", "name": "Napa", "price": 10, "stock": 50 }]
}
```

### 7. Get Medicine Details (Public)
- **URL**: `/api/medicines/:id`
- **Method**: `GET`
- **Sample Response**:
```json
{
  "id": "...",
  "name": "Napa",
  "description": "...",
  "seller": { "name": "Beximco Pharm" },
  "reviews": [...]
}
```

### 8. Create Medicine (Seller)
- **URL**: `/api/seller/medicines`
- **Method**: `POST`
- **Body**:
```json
{
  "name": "Napa Extend",
  "description": "665mg Paracetamol for long relief",
  "price": 15.0,
  "stock": 500,
  "image": "https://example.com/napa.jpg",
  "manufacturer": "Beximco",
  "categoryId": "PASTE_CATEGORY_ID"
}
```

### 9. Update Medicine (Seller - Own Only)
- **URL**: `/api/seller/medicines/:id`
- **Method**: `PUT`
- **Body**: `{"price": 16.0, "stock": 450}`

### 10. Delete Medicine (Seller - Own Only)
- **URL**: `/api/seller/medicines/:id`
- **Method**: `DELETE`

---

## 🛒 Order System

### 11. Place Order (Customer)
- **URL**: `/api/orders`
- **Method**: `POST`
- **Body**:
```json
{
  "items": [
    { "medicineId": "ID_1", "quantity": 2 },
    { "medicineId": "ID_2", "quantity": 1 }
  ],
  "totalPrice": 45.0,
  "address": "123 Main St, Dhaka"
}
```
- **Sample Response**: `{"success": true, "data": {"id": "order-uuid", "status": "PLACED"}}`

### 12. Get My Orders (All Auth Roles)
- **URL**: `/api/orders`
- **Method**: `GET`
- *Note*: Customers see their own, Sellers see orders for their medicines, Admins see all.

### 13. Get Order Details (Auth)
- **URL**: `/api/orders/:id`
- **Method**: `GET`
- **Sample Response**:
```json
{
  "success": true,
  "message": "Order details fetched successfully",
  "data": {
    "id": "order-uuid",
    "status": "PLACED",
    "totalPrice": 45,
    "address": "...",
    "items": [
      { "medicine": { "name": "Napa" }, "quantity": 2 }
    ]
  }
}
```

### 14. Get Seller Orders (Seller)
- **URL**: `/api/seller/orders`
- **Method**: `GET`
- **Sample Response**:
```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "data": [
    { "id": "...", "status": "PLACED", "totalPrice": 100 }
  ]
}
```

### 15. Update Order Status (Seller Only)
- **URL**: `/api/seller/orders/:id`
- **Method**: `PATCH`
- **Body**: `{"status": "SHIPPED"}` // Options: PLACED, SHIPPED, DELIVERED, CANCELLED

### 16. Admin Update Status (Admin)
- **URL**: `/api/orders/:id/status`
- **Method**: `PATCH`
- **Body**: `{"status": "DELIVERED"}`

### 17. Cancel Order (Customer - Own Only)
- **URL**: `/api/orders/:id/cancel`
- **Method**: `PATCH`
- **Sample Response**:
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": "order-uuid",
    "status": "CANCELLED"
  }
}
```

### 18. Seller Stats (Seller)
- **URL**: `/api/orders/seller/stats`
- **Method**: `GET`
- **Sample Response**:
```json
{
  "success": true,
  "message": "Seller stats fetched successfully",
  "data": {
    "totalSales": 5000,
    "totalOrders": 12,
    "pendingOrders": 2
  }
}
```

---

## ⭐ Reviews & Ratings

### 19. Get Medicine Reviews (Public)
- **URL**: `/api/reviews/:medicineId`
- **Method**: `GET`
- **Sample Response**:
```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": [
    { "rating": 5, "comment": "Great!", "user": { "name": "John" } }
  ]
}
```

### 20. Leave Review (Customer)
- **URL**: `/api/reviews`
- **Method**: `POST`
- **Body**:
```json
{
  "rating": 5,
  "comment": "Very effective medicine.",
  "medicineId": "PASTE_MEDICINE_ID"
}
```
- **Sample Response**:
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": { "id": "review-uuid", "rating": 5, "comment": "..." }
}
```

---

## 👤 User Profile

### 21. Get My Profile (Auth)
- **URL**: `/api/users/me` (or `/api/auth/me`)
- **Method**: `GET`
- **Sample Response**:
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
}
```

### 22. Update My Profile (Auth)
- **URL**: `/api/users/me`
- **Method**: `PATCH`
- **Body**: `{"name": "New Name", "phone": "017..."}`
- **Sample Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { "name": "New Name", "phone": "017..." }
}
```

---

## 🛡️ Administrative (Admin Only)

### 23. Get All Users
- **URL**: `/api/admin/users`
- **Method**: `GET`
- **Sample Response**:
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    { "id": "...", "name": "John", "role": "CUSTOMER", "isBlocked": false }
  ]
}
```

### 24. Toggle User Block Status
- **URL**: `/api/admin/users/:id`
- **Method**: `PATCH`
- **Body**: `{"isBlocked": true}`
- **Sample Response**:
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": { "id": "...", "isBlocked": true }
}
```

### 25. Admin Dashboard Stats
- **URL**: `/api/admin/stats`
- **Method**: `GET`
- **Sample Response**:
```json
{
  "success": true,
  "message": "Dashboard stats fetched successfully",
  "data": {
    "totalUsers": 120,
    "totalOrders": 450,
    "totalRevenue": 15000
  }
}
```

---


## 👥 API Reference by Role

### 🌍 Public Endpoints (No Auth)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check |
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Secure user login |
| `GET` | `/api/categories` | Browse all medicine categories |
| `GET` | `/api/medicines` | Search and filter medicines |
| `GET` | `/api/medicines/:id` | Get individual medicine details |
| `GET` | `/api/reviews/:medicineId`| See feedback for a medicine |

### 👤 Customer Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth/me` | Fetch active session & role |
| `GET` | `/api/users/me` | Fetch your user profile |
| `PATCH` | `/api/users/me` | Update your display name/phone |
| `POST` | `/api/orders` | Checkout and place an order |
| `GET` | `/api/orders` | View your personal order history |
| `GET` | `/api/orders/:id` | View your specific order details |
| `PATCH` | `/api/orders/:id/cancel`| Cancel a pending order (PLACED) |
| `POST` | `/api/reviews` | Submit feedback for a medicine |

### 🏪 Seller Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth/me` | Fetch active session & role |
| `POST` | `/api/seller/medicines` | Add new medicine to inventory |
| `PUT` | `/api/seller/medicines/:id` | Update your medicine details |
| `DELETE` | `/api/seller/medicines/:id`| Remove your medicine |
| `GET` | `/api/seller/orders` | Get orders for your products |
| `PATCH` | `/api/seller/orders/:id`| Update order status (SHIPPED, etc.) |
| `GET` | `/api/orders/seller/stats`| View sales & revenue analytics |

### 🛡️ Admin Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth/me` | Fetch active session & role |
| `POST` | `/api/categories` | Create a new medicine category |
| `DELETE` | `/api/categories/:id` | Remove a category |
| `GET` | `/api/orders` | View every order in the system |
| `PATCH` | `/api/orders/:id/status`| Global order status override |
| `GET` | `/api/admin/users` | List all registered users |
| `PATCH` | `/api/admin/users/:id` | Block/Unblock a user account |
| `GET` | `/api/admin/stats` | System-wide performance stats |


---

## 🏁 Testing Flow (Step-by-Step)
1. **Login as Admin** (`/api/auth/login`) -> Create Category (`/api/categories`).
2. **Register/Login as Seller** -> Create Medicine (`/api/seller/medicines`).
3. **Register/Login as Customer** -> Place Order (`/api/orders`).
4. **Login as Seller** -> Update Status to `SHIPPED` (`/api/seller/orders/:id`).
5. **Login as Admin** -> View Stats (`/api/admin/stats`).

**Done!** Use these endpoints to verify your backend integration. 🚀

