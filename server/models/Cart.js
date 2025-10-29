import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  cartId: String,
  items: [
    {
      productId: Number,
      name: String,
      price: Number,
      qty: Number,
    },
  ],
  total: Number,
});

export default mongoose.model("Cart", cartSchema);
