const Joi = require('joi');

const reviewValidation = {
  create: Joi.object({
    body: Joi.object({
      productId: Joi.string().required(),
      customer: Joi.object({
        name: Joi.string().trim().max(100).required(),
        email: Joi.string().email().lowercase()
      }).required(),
      rating: Joi.number().integer().min(1).max(5).required(),
      title: Joi.string().trim().max(200),
      text: Joi.string().trim().min(10).max(2000).required(),
      language: Joi.string().valid('en', 'he', 'es').default('en')
    })
  }),

  moderate: Joi.object({
    body: Joi.object({
      status: Joi.string().valid('pending', 'approved', 'rejected', 'spam').required(),
      moderationNotes: Joi.string().max(500)
    })
  }),

  query: Joi.object({
    query: Joi.object({
      language: Joi.string().valid('en', 'he', 'es'),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(10),
      sort: Joi.string().default('-createdAt'),
      status: Joi.string().valid('pending', 'approved', 'rejected', 'spam').default('approved')
    })
  })
};

module.exports = { reviewValidation };