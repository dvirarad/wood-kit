const validate = (schema) => {
  return (req, res, next) => {
    // Validate request body, query, and params
    const { error, value } = schema.validate({
      body: req.body,
      query: req.query,
      params: req.params
    }, {
      abortEarly: false, // Return all errors, not just the first one
      allowUnknown: true, // Allow unknown fields
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: 'Invalid request data',
        details: errorDetails
      });
    }

    // Replace request data with validated/sanitized data
    req.body = value.body || req.body;
    req.query = value.query || req.query;
    req.params = value.params || req.params;

    next();
  };
};

module.exports = validate;