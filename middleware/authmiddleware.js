const jwt = require("jsonwebtoken");


module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json("No Token Found");
  }

  try {
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id; 
    next();
  } catch (error) {
    console.error("JWT Error:", error.message); // This tells you if it's "expired" or "invalid signature"
    res.status(401).json("Invalid Token");
  }
};