const Stripe = require('stripe');

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
    
    try {
        const { amount, currency, donation_by } = JSON.parse(event.body);
        
        // Initialize Stripe with secret key
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
        
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency || 'eur',
            metadata: {
                integration_check: 'accept_a_payment',
                donation_by: donation_by || 'Not specified' // Add donation by to metadata
            },
        });
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                clientSecret: paymentIntent.client_secret 
            }),
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: error.message 
            }),
        };
    }
};