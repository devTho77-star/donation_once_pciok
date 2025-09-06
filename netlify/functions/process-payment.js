const Stripe = require('stripe');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { amount, currency, donation_by, name, email } = JSON.parse(event.body);

        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency || 'eur',
            receipt_email: email, // for sending receipt & retrieving later
            metadata: {
                integration_check: 'accept_a_payment',
                donation_by: donation_by || 'Not specified',
                name: name || 'N/A'
            },
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
