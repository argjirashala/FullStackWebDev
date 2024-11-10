const jwt = require("jsonwebtoken");
const User = require("../models/user");

const tokenExtractor = async (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    request.token = authorization.substring(7);
  } else {
    request.token = null;
  }
  next();
};

const userExtractor = async (request, response, next) => {
  const token = request.token;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.SECRET);
      if (decodedToken.id) {
        request.user = await User.findById(decodedToken.id);
      } else {
        return response.status(401).json({ error: "token invalid" });
      }
    } catch (error) {
      return response.status(401).json({ error: "token invalid" });
    }
  } else {
    request.user = null;
  }
  next();
};

module.exports = {
  tokenExtractor,
  userExtractor,
};
