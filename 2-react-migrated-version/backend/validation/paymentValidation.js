const Joi = require('joi');

const paymentValidation = {
  createPaymentIntent: Joi.object({
    body: Joi.object({
      orderId: Joi.string().required(),
      amount: Joi.number().min(0).required(),
      currency: Joi.string().valid('ils', 'usd', 'eur').default('ils'),
      paymentMethod: Joi.string().valid('card', 'bank_transfer', 'cash').default('card'),
      customer: Joi.object({
        name: Joi.string().trim().max(100).required(),
        email: Joi.string().email().lowercase().required(),
        phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]+$/)
      }).required(),
      metadata: Joi.object({
        orderId: Joi.string(),
        customerNotes: Joi.string().max(500)
      })
    })
  }),

  confirmPayment: Joi.object({
    body: Joi.object({
      paymentIntentId: Joi.string().required(),
      paymentMethodId: Joi.string(),
      returnUrl: Joi.string().uri()
    })
  }),

  refund: Joi.object({
    body: Joi.object({
      paymentIntentId: Joi.string().required(),
      amount: Joi.number().min(0),
      reason: Joi.string().valid(
        'duplicate',
        'fraudulent', 
        'requested_by_customer',
        'expired_uncaptured_charge'
      ).default('requested_by_customer'),
      metadata: Joi.object({
        refundReason: Joi.string().max(500),
        orderId: Joi.string()
      })
    })
  }),

  webhook: Joi.object({
    body: Joi.object({
      id: Joi.string().required(),
      object: Joi.string().valid('event').required(),
      type: Joi.string().required(),
      data: Joi.object().required(),
      created: Joi.number().required(),
      livemode: Joi.boolean().required()
    })
  }),

  query: Joi.object({
    query: Joi.object({
      status: Joi.string().valid(
        'requires_payment_method',
        'requires_confirmation',
        'requires_action',
        'processing',
        'requires_capture',
        'canceled',
        'succeeded'
      ),
      customer: Joi.string(),
      orderId: Joi.string(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      sort: Joi.string().default('-created')
    })
  })
};

module.exports = { paymentValidation };