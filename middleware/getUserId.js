const jwt = require('jsonwebtoken');

const decodeUserId = (req, res, next) => {
  const token = req.headers.authorization;
  const decodedToken = jwt.decode(token);
  console.log(decodedToken);
  req.tockens = decodedToken;
  next();
};

module.exports = decodeUserId;
