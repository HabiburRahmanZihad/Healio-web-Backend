<div align="center">
    <img src="public/Healio_logo_png.png" alt="Healio Logo" width="220" />
  <h1>⚙️ HEALIO BACKEND</h1>
  <p><strong>The High-Performance Core Engine for Modern Healthcare</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-18.x-43853D?style=for-the-badge&logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-5.0-black?style=for-the-badge&logo=express" alt="Express.js" />
    <img src="https://img.shields.io/badge/Prisma-7.3.0-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-16.x-316192?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  </p>
</div>

---

## ⚡ Overview

The **Healio Backend** is an enterprise-ready healthcare e-commerce engine designed for speed, security, and scalability. It serves as the "System Core" for the Healio Nexus, handling mission-critical health data, complex order fulfillment, and multi-role access control.

> [!TIP]
> For interactive API exploration, refer to our [Postman Testing Guide](POSTMAN_TESTING.md).

---

## 🛡️ Technical Architecture

Healio uses a modular, role-based architecture to ensure relational integrity and high availability.

### 🛠️ The Tech Stack
| Layer | technology | Rationale |
| :--- | :--- | :--- |
| **Logic** | `Express.js (v5)` | Fast, minimalist, and robust request handling. |
| **Database** | `PostgreSQL` | Relational consistency for healthcare inventories. |
| **ORM** | `Prisma` | Type-safe migrations and intuitive data modeling. |
| **Auth** | `Better-Auth` | Modern, secure authentication with multi-provider support. |
| **Mailer** | `Nodemailer` | Reliable transactional email delivery for system alerts. |
| **Validation** | `Zod` | Schema-driven data validation for zero-compromise security. |

---

## 🚀 Key Modules & Features

### 🔐 System Security (RBAC)
- **Granular Permissions**: Fine-grained access control for `ADMIN`, `SELLER`, and `CUSTOMER`.
- **Session Intelligence**: Secure session management with automated refresh protocols.
- **Identity Link**: Cross-node identity verification via Better-Auth.

### 📦 Pharmaceutical Inventory Matrix
- **Audited Listings**: Real-time stock tracking with manufacturer and category auditing.
- **Flash Sale Logic**: Specialized pricing overrides for synchronized sales events.
- **Category Hierarchy**: Recursive category management for complex medicine taxonomies.

### 🛒 Fiscal & Order Protocols
- **Transaction Integrity**: ACID-compliant order processing via PostgreSQL transactions.
- **Lifecycle Tracking**: Precise order status management (Placed → Processing → Shipped → Delivered).
- **Revenue Analytics**: Real-time aggregation of fiscal data for Admin Command Center.

---

## 📊 Data Modeling (Mermaid)

```mermaid
erDiagram
    USER ||--o{ MEDICINE : manages
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    CATEGORY ||--o{ MEDICINE : contains
    MEDICINE ||--o{ REVIEW : receives
    MEDICINE ||--o{ ORDER_ITEM : included_in
    ORDER ||--o{ ORDER_ITEM : contains
```

---

## 📂 System Structure
```text
src/
├── app.ts          # Core application configuration
├── server.ts       # Main entry point & port binding
├── config/         # Environment & System constants
├── controllers/    # Request processing & signal logic
├── middlewares/    # Security & Validation guards
├── modules/        # Feature-specific business logic
├── lib/            # Shared libraries (Prisma Node, Auth Node)
└── scripts/        # Seeding & Maintenance automation
```

---

## ⚙️ Deployment & Scaling

### 1. Prerequisites
- Node.js 18+ & npm/pnpm
- PostgreSQL Instance (Local or Cloud)

### 2. Ignition Flow
```bash
npm install                     # Install dependencies
cp .env.example .env            # Configure environmental variables
npx prisma migrate dev          # Sync database schema
npm run dev                     # Start development engine
```

### 3. Production Seeding
To initialize the system with an administrative account:
```bash
# Ensure ALLOW_ADMIN_SIGNUP=true in .env
npm run seed:admin
```

---

## 📄 License & Creator

Developed with 💎 Precision & ❤️ Care by **[Habibur Rahman Zihad](https://habibur-rahman-zihad.vercel.app/)**

*Licensed under the ISC License. All rights reserved.*
