// Simple token-based admin authentication
let adminSessions = new Map();

// Simple admin auth middleware
const adminOnly = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required'
    });
  }

  const token = authHeader.substring(7);
  const session = adminSessions.get(token);
  
  if (!session || session.expires < Date.now()) {
    if (session) {
      adminSessions.delete(token);
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
  
  req.admin = session;
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
    
    // Create simple session token (expires in 24 hours)
    const token = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session = {
      username: ADMIN_USERNAME,
      loginTime: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    adminSessions.set(token, session);
    
    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      data: {
        username: ADMIN_USERNAME,
        sessionExpires: session.expires
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