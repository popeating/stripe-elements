import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

const webhookSecret = process.env.WEBHOOK_SECRET_KEY;
export const config = {
  api: {
    bodyParser: false,
  },
};
const handler = async (req, res) => {
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    console.log(`Webhook Error: ${err.message}`);
    return;
  }
  const data = JSON.parse(buf);

  switch (event.type) {
    case 'payment_intent.created':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent was created for: ${data.data.object.amount}`);
      break;
    case 'payment_intent.succeeded,':
      const paymentMethod = event.data.object;
      console.log(
        `PaymentIntent was successfull for: ${data.data.object.amount}`
      );
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.json({ received: true });
};
export default handler;
