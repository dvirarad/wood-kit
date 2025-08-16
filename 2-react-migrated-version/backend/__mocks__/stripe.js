// Mock for stripe
const mockStripe = jest.fn(() => ({
  paymentIntents: {
    create: jest.fn().mockResolvedValue({
      id: 'pi_test_payment_intent',
      client_secret: 'pi_test_payment_intent_secret',
      status: 'requires_payment_method',
      amount: 1000,
      currency: 'usd'
    }),
    retrieve: jest.fn().mockResolvedValue({
      id: 'pi_test_payment_intent',
      status: 'succeeded',
      amount: 1000,
      currency: 'usd'
    }),
    confirm: jest.fn().mockResolvedValue({
      id: 'pi_test_payment_intent',
      status: 'succeeded',
      amount: 1000,
      currency: 'usd'
    })
  },
  customers: {
    create: jest.fn().mockResolvedValue({
      id: 'cus_test_customer',
      email: 'test@example.com'
    })
  }
}));

module.exports = mockStripe;