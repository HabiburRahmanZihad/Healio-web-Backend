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
  "role": "CUSTOMER" // Options: CUSTOMER, SELLER, ADMIN
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

---

## 🏥 Category Management (Admin Only)

### 3. Get All Categories (Public)
- **URL**: `/api/categories`
- **Method**: `GET`

### 4. Create Category (Admin)
- **URL**: `/api/categories`
- **Method**: `POST`
- **Body**: `{"name": "Homeopathy"}`

### 5. Delete Category (Admin)
- **URL**: `/api/categories/:id`
- **Method**: `DELETE`

---

## 💊 Medicine Management

### 6. Get All Medicines (Public)
- **URL**: `/api/medicines`
- **Method**: `GET`
- **Query Params**: `search`, `category`, `manufacturer`, `minPrice`, `maxPrice`

### 7. Get Medicine Details (Public)
- **URL**: `/api/medicines/:id`
- **Method**: `GET`

### 8. Create Medicine (Seller)
- **URL**: `/api/medicines`
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
- **URL**: `/api/medicines/:id`
- **Method**: `PUT`
- **Body**: (Partial updates allowed)
```json
{
  "price": 16.0,
  "stock": 450
}
```

### 10. Delete Medicine (Seller - Own Only)
- **URL**: `/api/medicines/:id`
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

### 12. Get My Orders (All Auth Roles)
- **URL**: `/api/orders`
- **Method**: `GET`
- *Note*: Customers see their own, Sellers see orders for their medicines, Admins see all.

### 13. Get Order Details (Auth)
- **URL**: `/api/orders/:id`
- **Method**: `GET`

### 14. Update Order Status (Seller/Admin)
- **URL**: `/api/orders/:id/status`
- **Method**: `PATCH`
- **Body**: `{"status": "SHIPPED"}` // Options: PLACED, SHIPPED, DELIVERED, CANCELLED

### 15. Cancel Order (Customer - Own Only)
- **URL**: `/api/orders/:id/cancel`
- **Method**: `PATCH`

### 16. Seller Stats (Seller)
- **URL**: `/api/orders/seller/stats`
- **Method**: `GET`

---

## ⭐ Reviews & Ratings

### 17. Get Medicine Reviews (Public)
- **URL**: `/api/reviews/:medicineId`
- **Method**: `GET`

### 18. Leave Review (Customer)
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

---

## 👤 User Profile

### 19. Get My Profile (Auth)
- **URL**: `/api/users/me` (or `/api/auth/me`)
- **Method**: `GET`

### 20. Update My Profile (Auth)
- **URL**: `/api/users/me`
- **Method**: `PATCH`
- **Body**: `{"name": "Updated Name", "phone": "017..."}`

---

## 🛡️ Administrative (Admin Only)

### 21. Get All Users
- **URL**: `/api/admin/users`
- **Method**: `GET`

### 22. Toggle User Block Status
- **URL**: `/api/admin/users/:id`
- **Method**: `PATCH`
- **Body**: `{"isBlocked": true}`

### 23. Admin Dashboard Stats
- **URL**: `/api/admin/stats`
- **Method**: `GET`

---

## 🏁 Testing Flow (Step-by-Step)
1. **Login as Admin** (`/api/auth/login`) -> Create Category (`/api/categories`).
2. **Register/Login as Seller** -> Create Medicine (`/api/medicines`).
3. **Register/Login as Customer** -> Place Order (`/api/orders`).
4. **Login as Seller** -> Update Status to `SHIPPED` (`/api/orders/:id/status`).
5. **Login as Admin** -> View Stats (`/api/admin/stats`).

**Done!** Use these endpoints to verify your backend integration. 🚀

