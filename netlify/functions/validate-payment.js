const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { paymentIntentId } = JSON.parse(event.body);
    if (!paymentIntentId) throw new Error('PaymentIntent ID missing');

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Payment not successful' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        amount: paymentIntent.amount,
        name: paymentIntent.metadata.name || 'N/A',
        email: paymentIntent.receipt_email || 'N/A',
        donationBy: paymentIntent.metadata.donation_by || 'N/A',
        paymentIntentId: paymentIntent.id,
      }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
