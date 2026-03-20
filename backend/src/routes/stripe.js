const express = require('express');
const { pool } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const PRICE_ID = 'price_1TDAQoF6GiAaSF2MuZizMm9p';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Create checkout session
router.post('/create-checkout', auth, async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    const u = user.rows[0];

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'line_items[0][price]': PRICE_ID,
        'line_items[0][quantity]': '1',
        'customer_email': u.email,
        'client_reference_id': u.id,
        'success_url': `${FRONTEND_URL}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${FRONTEND_URL}/upgrade/cancel`,
        'metadata[user_id]': u.id,
      })
    });

    const session = await response.json();
    if (session.error) return res.status(400).json({ error: session.error.message });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Stripe webhook - upgrade user to pro
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const stripe = require('stripe')(STRIPE_SECRET);
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.user_id || session.client_reference_id;
    if (userId) {
      await pool.query('UPDATE users SET plan = $1 WHERE id = $2', ['pro', userId]);
      console.log(`User ${userId} upgraded to Pro`);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customers = await fetch(`https://api.stripe.com/v1/customers/${subscription.customer}`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET}` }
    });
    const customer = await customers.json();
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [customer.email]);
    if (user.rows[0]) {
      await pool.query('UPDATE users SET plan = $1 WHERE id = $2', ['free', user.rows[0].id]);
    }
  }

  res.json({ received: true });
});

// Get subscription status
router.get('/subscription', auth, async (req, res) => {
  const user = await pool.query('SELECT plan FROM users WHERE id = $1', [req.userId]);
  res.json({ plan: user.rows[0]?.plan });
});

// Customer portal (manage subscription)
router.post('/portal', auth, async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    const u = user.rows[0];

    // Find Stripe customer
    const customers = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(u.email)}&limit=1`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET}` }
    });
    const data = await customers.json();
    const customer = data.data?.[0];
    if (!customer) return res.status(404).json({ error: 'No subscription found' });

    const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'customer': customer.id,
        'return_url': `${FRONTEND_URL}/`,
      })
    });

    const session = await response.json();
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
