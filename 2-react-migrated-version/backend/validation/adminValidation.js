const Joi = require('joi');

const dimensionSchema = Joi.object({
  min: Joi.number().min(0),
  max: Joi.number().min(0),
  default: Joi.number().min(0),
  multiplier: Joi.number().min(0)
});

const adminValidation = {
  login: Joi.object({
    body: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required()
    })
  }),

  updatePricing: Joi.object({
    body: Joi.object({
      basePrice: Joi.number().min(0),
      dimensions: Joi.object({
        length: dimensionSchema,
        width: dimensionSchema,
        height: dimensionSchema,
        depth: dimensionSchema,
        steps: dimensionSchema
      }),
      options: Joi.object({
        lacquer: Joi.object({
          available: Joi.boolean(),
          price: Joi.number().min(0)
        }),
        handrail: Joi.object({
          available: Joi.boolean(),
          price: Joi.number().min(0)
        })
      })
    })
  }),

  moderateReview: Joi.object({
    body: Joi.object({
      status: Joi.string().valid('pending', 'approved', 'rejected', 'spam').required(),
      moderationNotes: Joi.string().max(500)
    })
  })
};

module.exports = { adminValidation };