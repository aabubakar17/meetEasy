const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Stripe } = require("stripe");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Use environment variable

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "gbp",
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error.message);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
