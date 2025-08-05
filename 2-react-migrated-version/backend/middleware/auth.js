// Simple session-based admin authentication
let adminSession = null;

// Simple admin auth middleware
const adminOnly = (req, res, next) => {
  if (!adminSession || adminSession.expires < Date.now()) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required'
    });
  }
  
  req.admin = adminSession;
  next();
};

// Optional auth middleware (always allows through)
const optionalAuth = (req, res, next) => {
  next();
};

// Simple admin login handler
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Create simple session (expires in 24 hours)
    adminSession = {
      username: ADMIN_USERNAME,
      loginTime: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        username: ADMIN_USERNAME,
        sessionExpires: adminSession.expires
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

module.exports = { 
  adminOnly, 
  optionalAuth, 
  adminLogin 
};