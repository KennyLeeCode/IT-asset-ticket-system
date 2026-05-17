const jwt = require("jsonwebtoken");

// This middleware checks that the request has a valid login token
// It runs before any protected route to make sure the user is logged in
function requireAuth(req, res, next) {
  // The token comes in the Authorization header formatted as: Bearer <token>
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. Please log in." });
  }

  try {
    // Verify the token using our secret key and attach the user info to the request
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token is invalid or expired." });
  }
}

// This middleware checks that the logged in user has one of the allowed roles
// Pass in an array of roles that are allowed, for example: requireRole(['admin', 'technician'])
function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to do this." });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
