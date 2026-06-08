import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  items: [{
    id: Number,
    name: String,
    price: Number,
    image: String,
    quantity: Number,
  }],
  total: Number,
  stripeSessionId: String,
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', orderSchema);