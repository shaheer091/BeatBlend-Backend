const jwt = require('jsonwebtoken');

const decodeUserId = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.decode(token);
    console.log('req.tockens', decodedToken);
    req.tockens = decodedToken;
    next();
  } catch (err) {
    console.log('getUserID middleware', err);
  }
};

module.exports = decodeUserId;
