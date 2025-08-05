const Joi = require('joi');

const orderValidation = {
  create: Joi.object({
    body: Joi.object({
      customer: Joi.object({
        name: Joi.string().trim().max(100).required(),
        email: Joi.string().email().lowercase().required(),
        phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]+$/).required(),
        address: Joi.string().trim().max(500).required()
      }).required(),
      items: Joi.array().items(
        Joi.object({
          productId: Joi.string().required(),
          quantity: Joi.number().integer().min(1).default(1),
          configuration: Joi.object({
            dimensions: Joi.object({
              length: Joi.number().min(0),
              width: Joi.number().min(0),
              height: Joi.number().min(0),
              depth: Joi.number().min(0),
              steps: Joi.number().integer().min(1)
            }),
            options: Joi.object({
              lacquer: Joi.boolean().default(false),
              handrail: Joi.boolean().default(false)
            })
          }).required()
        })
      ).min(1).required(),
      notes: Joi.string().max(1000),
      language: Joi.string().valid('en', 'he', 'es').default('en')
    })
  }),

  updateStatus: Joi.object({
    body: Joi.object({
      status: Joi.string().valid(
        'pending',
        'confirmed',
        'processing',
        'ready',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
      ).required(),
      note: Joi.string().max(500)
    })
  }),

  query: Joi.object({
    query: Joi.object({
      status: Joi.string().valid(
        'pending',
        'confirmed',
        'processing',
        'ready',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
      ),
      customer: Joi.string(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      sort: Joi.string().default('-createdAt')
    })
  })
};

module.exports = { orderValidation };