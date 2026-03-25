# AGNEYA - Premium Custom Printing & E-commerce Platform

AGNEYA is a modern, full-stack e-commerce platform specializing in custom printing services and ready-to-wear products. Built with a focus on visual excellence and premium user experience, the platform allows users to design their own products and shop from a curated collection with ease.

## 🚀 Key Features

### 🛍️ Premium Shopping Experience
- **Fluid UI**: Glassmorphic design with smooth animations and transitions using Framer Motion.
- **Skeleton Loading**: High-performance perceived loading states for a seamless browse.
- **Quick View**: Inspect product details and ratings without leaving the grid.
- **Wishlist**: Per-user persistent wishlist for tracking favorite items.
- **Advanced Search**: Real-time suggestions and smart filtering (category, price, stock).

### 🎨 Customizer Studio
- **Multi-Side Design**: Support for up to 10 custom sides (Front, Back, Sleeves, etc.) for any base product.
- **Real-time Preview**: Professional image gallery for viewing custom designs.
- **Direct Checkout**: Seamless transition from the design studio to the purchase flow.

### 📦 Order & Delivery Management
- **Dashboard**: Advanced sales analytics and customer insights for admins.
- **Real-time Alerts**: Instant notifications for new orders.
- **PDF Invoicing**: Automatic generation of professional invoices for every order.
- **Pincode Awareness**: Automatic detection of Post Office, City, and State based on PIN code during checkout.

### 💳 Secure Checkout
- **Shopping Bag**: Full-featured cart with quantity management and bulk checkout support.
- **Payment Integration**: Support for Razorpay and Manual UPI payments with automated verification paths.

## 🛠️ Tech Stack

- **Frontend**: React.js, Redux Toolkit, Framer Motion, React Helmet (SEO).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB.
- **Integrations**: Razorpay API, Indian Postal Pincode API.

## 📂 Project Structure

```text
├── agneya/             # Frontend React Application
│   ├── src/
│   │   ├── User/       # User-facing pages and components
│   │   ├── Admin/      # Admin dashboard and management tools
│   │   ├── shared/     # Utilities, context, and shared components
│   │   └── store/      # Redux state management
├── backend/            # Express.js Server & API
│   ├── models/         # MongoDB Schemas
│   ├── routes/         # API Endpoints
│   ├── controllers/    # Business Logic
│   └── uploads/        # Stored product and custom design images
```

## ⚙️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ashin248/AGNEYA-.git
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file with MONGODB_URI, JWT_SECRET, and RAZORPAY_KEY
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd agneya
   npm install
   npm run dev
   ```

---
Built with ❤️ by the Agneya Team.
