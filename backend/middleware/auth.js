const jwt = require("jsonwebtoken");

/**
 * Middleware: Authenticates the user using JWT.
 * Attaches the decoded user object to the request if valid.
 */
const auth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // Reject if no token is provided
  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Handle invalid token
    res.status(401).json({ error: "Token is not valid" });
  }
};

module.exports = auth;
