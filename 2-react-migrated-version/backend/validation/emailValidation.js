const Joi = require('joi');

const emailValidation = {
  send: Joi.object({
    body: Joi.object({
      to: Joi.alternatives().try(
        Joi.string().email(),
        Joi.array().items(Joi.string().email())
      ).required(),
      subject: Joi.string().max(200).required(),
      content: Joi.alternatives().try(
        Joi.string().required(),
        Joi.object({
          html: Joi.string(),
          text: Joi.string()
        }).or('html', 'text').required()
      ).required(),
      language: Joi.string().valid('en', 'he', 'es').default('en')
    })
  }),

  test: Joi.object({
    body: Joi.object({
      email: Joi.string().email().required()
    })
  })
};

module.exports = { emailValidation };