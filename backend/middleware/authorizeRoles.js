/**
 * Middleware: Authorizes access based on user roles.
 * @param {...string} roles - Allowed roles for the route.
 * @returns {Function} - Middleware function to check user roles.
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Access denied: insufficient role" });
    }
    // Proceed to the next middleware or route handler
    next();
  };
};

module.exports = authorizeRoles;
