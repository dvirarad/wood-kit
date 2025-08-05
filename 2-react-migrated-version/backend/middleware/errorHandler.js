const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error Details:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return res.status(404).json({
      success: false,
      message,
      error: 'Invalid ID format'
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value for ${field}`;
    return res.status(400).json({
      success: false,
      message,
      error: 'Resource already exists'
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: message,
      details: Object.keys(err.errors)
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: 'Authentication failed'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      error: 'Please login again'
    });
  }

  // Rate limiting error
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests',
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: err.retryAfter
    });
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large',
      error: 'Maximum file size exceeded'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Invalid file upload',
      error: 'Unexpected file field'
    });
  }

  // Payment errors (Stripe)
  if (err.type === 'StripeCardError') {
    return res.status(400).json({
      success: false,
      message: 'Payment failed',
      error: err.message,
      code: err.code
    });
  }

  if (err.type === 'StripeInvalidRequestError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment request',
      error: err.message
    });
  }

  // Email service errors
  if (err.code && err.code.toString().startsWith('4')) {
    return res.status(400).json({
      success: false,
      message: 'Email service error',
      error: 'Failed to send email'
    });
  }

  // Default server error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.stack,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error
    })
  });
};

module.exports = errorHandler;