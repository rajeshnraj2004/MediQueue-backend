import crypto from 'crypto';

/**
 * @desc    Create a Razorpay Order (simulated / real based on env keys)
 * @route   POST /api/payments/create-order
 * @access  Private (User)
 *
 * If RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are present in .env, creates a real
 * Razorpay order. Otherwise, returns a simulated order object so the UI still works.
 */
export const createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, message: 'Amount is required' });
        }

        const hasRazorpayKeys =
            process.env.RAZORPAY_KEY_ID &&
            process.env.RAZORPAY_KEY_SECRET &&
            process.env.RAZORPAY_KEY_SECRET !== 'your_razorpay_key_secret';

        if (hasRazorpayKeys) {
            // --- REAL Razorpay Integration ---
            // Dynamically import to avoid crashing if package isn't installed yet
            const Razorpay = (await import('razorpay')).default;
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });

            const options = {
                amount: amount * 100, // Razorpay works in paise
                currency,
                receipt: receipt || `rcpt_${Date.now()}`,
            };

            const order = await razorpay.orders.create(options);
            return res.status(201).json({ success: true, data: order });
        } else {
            // --- SIMULATED Order (for development without Razorpay keys) ---
            const simulatedOrder = {
                id: `order_sim_${Date.now()}`,
                entity: 'order',
                amount: amount * 100,
                amount_paid: 0,
                amount_due: amount * 100,
                currency,
                receipt: receipt || `rcpt_${Date.now()}`,
                status: 'created',
                created_at: Math.floor(Date.now() / 1000),
                simulated: true, // Flag so the frontend knows this is mocked
            };
            return res.status(201).json({ success: true, data: simulatedOrder, simulated: true });
        }
    } catch (error) {
        console.error('Payment order creation failed:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Verify Razorpay Payment Signature
 * @route   POST /api/payments/verify
 * @access  Private (User)
 */
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, simulated } = req.body;

        // If this was a simulated order, skip real verification
        if (simulated) {
            return res.json({
                success: true,
                message: 'Simulated payment verified successfully',
                paymentId: razorpay_payment_id || `pay_sim_${Date.now()}`,
            });
        }

        const hasSecret =
            process.env.RAZORPAY_KEY_SECRET &&
            process.env.RAZORPAY_KEY_SECRET !== 'your_razorpay_key_secret';

        if (!hasSecret) {
            return res.status(400).json({ success: false, message: 'Razorpay secret not configured' });
        }

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        res.json({
            success: true,
            message: 'Payment verified successfully',
            paymentId: razorpay_payment_id,
        });
    } catch (error) {
        console.error('Payment verification failed:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
