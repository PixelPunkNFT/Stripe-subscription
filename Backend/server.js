const express = require("express");
const app = express();
const stripe = require('stripe')('YOUR_API_STRIPE');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const YOUR_DOMAIN = 'http://localhost:3000';

// Gestisci la creazione di una sessione di checkout
app.post('/create-checkout-session', async (req, res) => {
  try {
   
    // Crea una sessione di checkout
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: 'price_1Nz3z6ASFrJ98yo7C3GwWs86',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${YOUR_DOMAIN}/create-portal-session/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}?canceled=true`,
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error('Errore durante la creazione della sessione di checkout:', error);
    res.sendStatus(500);
  }
});

// Gestisci la creazione di una sessione di portale di fatturazione
app.post('/create-portal-session', async (req, res) => {
  const { session_id } = req.body;
  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
  const returnUrl = YOUR_DOMAIN;
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: checkoutSession.customer,
    return_url: returnUrl,
  });
  res.redirect(303, portalSession.url);
});


app.listen(4242, () => console.log('Running on port 4242'));