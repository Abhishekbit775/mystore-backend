import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// Health check
app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// Create a Stripe Checkout session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;

    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      ssuccess_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: {
        cartItems: JSON.stringify(
          items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          }))  
        ),
      },
    });  

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Save order after successful payment
app.post('/save-order', async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Verify the payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Check if order already saved (prevent duplicates on page refresh)
    const existing = await Order.findOne({ stripeSessionId: sessionId });
    if (existing) {
      return res.json({ order: existing, alreadySaved: true });
    }

    // Pull cart items from session metadata
    const items = JSON.parse(session.metadata.cartItems);
    const total = session.amount_total / 100; // Stripe stores in cents

    const order = await Order.create({
      items,
      total,
      stripeSessionId: sessionId,
    });

    console.log('💾 Order saved:', order._id);
    res.json({ order, alreadySaved: false });
  } catch (err) {
    console.error('Save order error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all orders (admin endpoint)
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});