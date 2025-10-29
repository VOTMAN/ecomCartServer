# 🛒 Mock E-Commerce Cart

A simple **full-stack shopping cart** .  

---

## Tech Stack

**Frontend:** React + Tailwind CSS  
**Backend:** Node.js + Express.js  
**Database:** MongoDB (via Mongoose)  
**External API:** [FakeStoreAPI](https://fakestoreapi.com/) for mock products  
**Build Tool:** Vite  
**Package Manager:** npm or yarn  

---

## Features

### Product Page
- Fetches live data from [FakeStore API](https://fakestoreapi.com/products)
- Displays product grid with image, name, and price
- "Add to Cart" button dynamically based on if the cart contains that specific item or not
- Shows current quantity directly on the product card

![Screenshot of Homepage](/public/products.png)

### Cart Page
- Displays all items added to the cart
- Increment/decrement item quantities using `+` and `–`
- Remove items from cart
- Automatically updates the total cost
- Reflects changes immediately across pages

![Screenshot of Cart Page](/public/cart.png)

### Checkout Page
- Simple form: Name + Email
- Submits checkout request to backend
- Generates a **mock receipt** (with order ID, timestamp, and summary)
- Clears both the MongoDB cart and the local cart after successful checkout

![Screenshot of Checkout Page](/public/checkout.png)
![Screenshot of Receipt Page](/public/receipt.png)

### Persistent Cart
- Each user gets a unique cart ID stored in `localStorage`
- Cart persists across page reloads (until checkout)

---

## Project Structure
```
ecom-cart
├── server/ (backend)
│ ├── models/
│ │ └── Cart.js # Mongoose schema for cart data
│ └── index.js # Express server, routes, and Mongo connection
│
├── src/ (frontend)
│ ├── components/
│ │ ├── Navbar.jsx
│ │ ├── ProductCard.jsx
│ │ └── ReceiptModal.jsx
│ ├── context/
│ │ └── CartContext.jsx # Global cart state (via Context API)
│ ├── pages/
│ │ ├── Products.jsx
│ │ ├── Cart.jsx
│ │ └── Checkout.jsx
│ ├── utils/
│ │ └── useCartId.js # Generates/returns unique cartId from localStorage
│ ├── App.jsx
│ ├── main.jsx
│ └── index.css
|── index.html
|── .env # Contains MONGODB_URL
│── vite.config.js
│── package.json
└── README.md
```

---

## Setup Instructions

### Clone the Repository
```bash
git clone https://github.com/VOTMAN/ecomCart.git
```

Install node modules
```bash
cd ecomCart
npm install
```

Create a .env file in the root of the folder:

```bash
MONGODB_URL=mongodb+srv://<your_username>:<your_password>@cluster.rcbzija.mongodb.net/assignment?appName=Cluster
```
**The frontend and backend needs to be run seperately in different terminals** 

Start the frontend server:

```bash
npm run dev
```

Start the backend server:

```bash
npm run start
```

> Frontend runs on http://localhost:5173

> By default, backend runs on http://localhost:5000

---
🔗 API Endpoints

```
> Products
GET /api/products → Fetches 10 products from FakeStore API

> Cart

POST	/api/cart	Add or update item { cartId, prodId, qty }
DELETE	/api/cart/:id?cartId=xxx	Remove item from cart
GET	/api/cart?cartId=xxx	Get current cart

> Checkout
POST /api/checkout?cartId=xxx
```
---

## How It Works

- On first load, the frontend generates a unique cartId (via crypto.randomUUID()).
- Products are fetched from FakeStore API and displayed.
- When “Add to Cart” is clicked:
- Frontend sends { cartId, prodId, qty } to backend.
- Backend fetches product details (from FakeStore) and stores them in MongoDB.
- Cart totals are recalculated on every add/remove/update.

On checkout:
- A mock receipt is returned.
- Cart is deleted from MongoDB.
- Local cart (and cartId) are cleared from browser storage.
