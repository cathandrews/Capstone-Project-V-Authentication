/**
 * Middleware: Validates if the authenticated user has the required role(s).
 * Usage: authorizeRoles("management", "admin")
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Authorization required" });
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Access denied: insufficient role" });
    }

    next();
  };
};

module.exports = authorizeRoles;
