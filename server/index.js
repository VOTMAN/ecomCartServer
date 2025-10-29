import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { configDotenv } from "dotenv";
import CartModel from "./models/Cart.js";

configDotenv({ quiet: true });

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Mongo connection error:", err));

/* ===========================
   GET /api/products
   Fetches products from Fake Store API
=========================== */
app.get("/api/products", async (req, res) => {
  try {
    const resp = await fetch("https://fakestoreapi.com/products?limit=10");
    const data = await resp.json();

    // Transform data to match your frontend's structure
    const finalData = data.map((p) => ({
      id: p.id,
      name: p.title,
      price: p.price,
      img: p.image,
    }));

    res.json(finalData);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
});

/* ===========================
   POST /api/cart
   Adds/updates product in the user's cart
=========================== */
app.post("/api/cart", async (req, res) => {
  const { cartId, prodId, qty } = req.body;

  if (!cartId || !prodId || !qty) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const resp = await fetch(`https://fakestoreapi.com/products/${prodId}`);
    if (!resp.ok) return res.status(404).json({ error: "Product not found" });
    const product = await resp.json();

    let cart = await CartModel.findOne({ cartId });
    if (!cart) {
      cart = new CartModel({ cartId, items: [], total: 0 });
    }

    const existingItem = cart.items.find((i) => i.productId === prodId);

    if (existingItem) {
      existingItem.qty += qty;
      if (existingItem.qty <= 0) {
        cart.items = cart.items.filter((i) => i.productId !== prodId);
      }
    } else if (qty > 0) {
      cart.items.push({
        productId: product.id,
        name: product.title,
        price: product.price,
        qty,
      });
    }

    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Error adding to cart", error: err.message });
  }
});

/* ===========================
   DELETE /api/cart/:id
   Removes a product from the cart
=========================== */
app.delete("/api/cart/:id", async (req, res) => {
  const { cartId } = req.query;
  const { id } = req.params;

  if (!cartId) {
    return res.status(400).json({ message: "Missing cartId" });
  }

  try {
    const cart = await CartModel.findOne({ cartId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item.productId != id);
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

    await cart.save();
    res.json({ message: "Item removed", cart });
  } catch (err) {
    res.status(500).json({ message: "Error deleting item", error: err.message });
  }
});

/* ===========================
   GET /api/cart
   Returns the user's cart
=========================== */
app.get("/api/cart", async (req, res) => {
  const { cartId } = req.query;
  try {
    const cart = await CartModel.findOne({ cartId });
    res.json(cart || { items: [], total: 0 });
  } catch (err) {
    res.status(500).json({ message: "Error getting cart", error: err.message });
  }
});

/* ===========================
   POST /api/checkout
   Clears the cart & returns mock receipt
=========================== */
app.post("/api/checkout", async (req, res) => {
  try {
    const { cartId, name, email } = req.body;

    if (!cartId || !name || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const cart = await CartModel.findOne({ cartId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const total = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

    const receipt = {
      name,
      email,
      cartId,
      items: cart.items,
      total,
      timestamp: new Date().toISOString(),
      orderId: Math.random().toString(36).substring(2, 10).toUpperCase(),
      message: "Mock checkout successful — no payment processed.",
    };

    await CartModel.deleteOne({ cartId });

    res.json(receipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Checkout failed", error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
