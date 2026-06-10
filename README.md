# ⚙️ MyStore Backend — Express API with Stripe & MongoDB

> Node.js + Express backend powering the [MyStore e-commerce app](https://github.com/Abhishekbit775/mystore-frontend). Handles Stripe checkout sessions, payment verification, and order persistence to MongoDB Atlas.

### 🌐 [Live API →](https://mystore-backend-mzo3.onrender.com) · 🛒 [Frontend Repo →](https://github.com/Abhishekbit775/mystore-frontend)

![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-API-635BFF?logo=stripe&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?logo=render&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

> ⚠️ **Cold-start note:** Hosted on Render's free tier, which spins down after inactivity. First request after a long pause may take **30–60 seconds** to wake up.

---

## 🧰 Tech Stack

- **Node.js + Express** for the API server
- **Stripe SDK** for hosted-checkout integration
- **Mongoose** as the ODM for MongoDB
- **MongoDB Atlas** (free tier) for cloud database
- **dotenv** for env-var management
- **cors** to allow the frontend (Vercel) to call this API

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check — returns `✅ Backend is running!` |
| `POST` | `/create-checkout-session` | Creates a Stripe Checkout session from cart items, returns redirect URL |
| `POST` | `/save-order` | Verifies a completed Stripe session and persists the order to MongoDB |
| `GET` | `/orders` | Returns all saved orders (newest first) — useful for admin views |

### Example: Creating a checkout session

```http
POST /create-checkout-session
Content-Type: application/json

{
  "items": [
    {
      "id": 1,
      "name": "Classic Sneakers",
      "price": 79.99,
      "image": "https://...",
      "quantity": 2
    }
  ]
}
```

Response:
```json
{ "url": "https://checkout.stripe.com/c/pay/cs_test_..." }
```

The frontend then redirects the user to that URL.

### Example: Saving an order after payment

```http
POST /save-order
Content-Type: application/json

{ "sessionId": "cs_test_a1b2c3..." }
```

The backend verifies the session is `paid` with Stripe before saving — this prevents fake orders even if someone hits the endpoint directly.

---

## 🗂️ Project Structure

```
├── models/
│   └── Order.js         # Mongoose schema for orders
├── server.js            # Express app + all routes
├── .env                 # Local environment variables (gitignored)
├── .gitignore
├── package.json
└── README.md
```

### `Order` schema

```js
{
  items: [{ id, name, price, image, quantity }],
  total: Number,
  stripeSessionId: String,   // unique — prevents duplicate saves on page refresh
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js (LTS)
- A Stripe account with a test secret key
- A MongoDB Atlas account with a connection string

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/Abhishekbit775/mystore-backend.git
cd mystore-backend

# 2. Install dependencies
npm install

# 3. Create a `.env` file with the variables below
# 4. Start the server
node server.js
```

Server runs on `http://localhost:4242`.

### Required environment variables

Create a `.env` file at the project root with these four variables:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mystore?appName=Cluster0
PORT=4242
FRONTEND_URL=http://localhost:5173
```

| Variable | Where to get it |
|---|---|
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) → Developers → API keys → Secret key |
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Clusters → Connect → Drivers (replace `<db_password>` with the real password) |
| `PORT` | Any free port (`4242` for local, `10000` for Render) |
| `FRONTEND_URL` | The frontend's origin — used in Stripe success/cancel redirects |

> 🔐 **Security:** Never commit `.env` to version control. It's already in `.gitignore`.

---

## 🌍 Production Deployment

This backend is deployed on **Render** with the following setup:

| Setting | Value |
|---|---|
| Runtime | Node |
| Build command | `npm install` |
| Start command | `node server.js` |
| Instance type | Free |
| Env vars | Same as local, with `FRONTEND_URL` set to the Vercel production URL and `PORT=10000` |

MongoDB Atlas's IP Access List is set to allow `0.0.0.0/0` so Render's dynamic IPs can connect.

---

## 🧠 What I Learned Building This

- Designing a **REST API** with clear endpoint responsibilities
- Integrating the **Stripe SDK** to create hosted checkout sessions and verify payments server-side
- Modeling data with **Mongoose** and connecting to **MongoDB Atlas** in the cloud
- Using **environment variables** to separate config from code and handle dev vs production
- Hitting and solving real production constraints — like Stripe's 500-character metadata limit (solved by trimming cart payloads before serializing)
- Configuring **CORS** for a cross-origin frontend/backend deployment
- Deploying a Node service to **Render**, configuring env vars and start commands

---

## 🗺️ Roadmap

- [ ] JWT-based authentication for protected routes
- [ ] User accounts model + `/orders/by-user` endpoint
- [ ] Admin-only endpoints (with role-based access)
- [ ] Stripe webhooks instead of frontend-triggered order save (more reliable)
- [ ] Rate limiting on public endpoints

---

## 📬 Connect

**Abhishek Kumar**

- 💼 [LinkedIn](https://www.linkedin.com/in/abhishek-kumar-b5a08a1b3/)
- 🐙 [GitHub](https://github.com/Abhishekbit775)
- 🛒 [Frontend Repo](https://github.com/Abhishekbit775/mystore-frontend)
- 🌐 [Live Demo](https://mystore-frontend-one.vercel.app)

---

## 📄 License

MIT — feel free to fork and adapt.
