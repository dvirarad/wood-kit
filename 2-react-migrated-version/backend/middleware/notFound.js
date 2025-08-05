const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'Not Found',
    suggestions: [
      'Check the URL spelling',
      'Verify the API version (v1)',
      'Check if the endpoint exists in documentation'
    ],
    availableRoutes: {
      products: '/api/v1/products',
      orders: '/api/v1/orders',
      reviews: '/api/v1/reviews',
      admin: '/api/v1/admin',
      health: '/health'
    }
  });
};

module.exports = notFound;