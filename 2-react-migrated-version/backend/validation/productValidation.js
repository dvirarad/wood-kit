const Joi = require('joi');

const dimensionSchema = Joi.object({
  min: Joi.number().min(0).required(),
  max: Joi.number().min(0).required(),
  default: Joi.number().min(0).required(),
  multiplier: Joi.number().min(0).required()
});

const translationSchema = Joi.object({
  en: Joi.string().required(),
  he: Joi.string().required(),
  es: Joi.string().required()
});

const productValidation = {
  create: Joi.object({
    body: Joi.object({
      productId: Joi.string().lowercase().trim().required(),
      name: translationSchema.required(),
      description: translationSchema.required(),
      basePrice: Joi.number().min(0).required(),
      currency: Joi.string().valid('NIS', 'USD', 'EUR').default('NIS'),
      dimensions: Joi.object({
        length: dimensionSchema,
        width: dimensionSchema,
        height: dimensionSchema,
        depth: dimensionSchema,
        steps: dimensionSchema
      }).required(),
      options: Joi.object({
        lacquer: Joi.object({
          available: Joi.boolean().default(true),
          price: Joi.number().min(0).default(0)
        }),
        handrail: Joi.object({
          available: Joi.boolean().default(false),
          price: Joi.number().min(0).default(0)
        })
      }),
      category: Joi.string().valid('bookshelf', 'stairs', 'furniture', 'outdoor', 'pet').required(),
      tags: Joi.array().items(Joi.string().trim().lowercase()),
      images: Joi.array().items(
        Joi.object({
          url: Joi.string().uri(),
          alt: Joi.string(),
          isPrimary: Joi.boolean().default(false)
        })
      ),
      isActive: Joi.boolean().default(true),
      inventory: Joi.object({
        inStock: Joi.boolean().default(true),
        stockLevel: Joi.number().min(0).default(100),
        lowStockThreshold: Joi.number().min(0).default(10)
      })
    })
  }),

  update: Joi.object({
    body: Joi.object({
      name: translationSchema,
      description: translationSchema,
      basePrice: Joi.number().min(0),
      currency: Joi.string().valid('NIS', 'USD', 'EUR'),
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
      }),
      category: Joi.string().valid('bookshelf', 'stairs', 'furniture', 'outdoor', 'pet'),
      tags: Joi.array().items(Joi.string().trim().lowercase()),
      images: Joi.array().items(
        Joi.object({
          url: Joi.string().uri(),
          alt: Joi.string(),
          isPrimary: Joi.boolean()
        })
      ),
      isActive: Joi.boolean(),
      inventory: Joi.object({
        inStock: Joi.boolean(),
        stockLevel: Joi.number().min(0),
        lowStockThreshold: Joi.number().min(0)
      })
    })
  }),

  calculatePrice: Joi.object({
    body: Joi.object({
      dimensions: Joi.object({
        length: Joi.number().min(0),
        width: Joi.number().min(0),
        height: Joi.number().min(0),
        depth: Joi.number().min(0),
        steps: Joi.number().min(1)
      }),
      options: Joi.object({
        lacquer: Joi.boolean(),
        handrail: Joi.boolean()
      })
    })
  })
};

module.exports = { productValidation };