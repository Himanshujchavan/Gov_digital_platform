const jwt = require('jsonwebtoken');

function getJwtPublicKey() {
  const key = process.env.JWT_PUBLIC_KEY;
  if (!key) {
    throw new Error('JWT_PUBLIC_KEY is not configured');
  }
  return key.replace(/\\n/g, '\n');
}

function extractUserFromAuthHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, getJwtPublicKey(), {
    algorithms: ['RS256'],
  });

  return {
    id: decoded.sub,
    username: decoded.username,
    fullName: decoded.fullName,
    email: decoded.email,
    role: decoded.role,
    department: decoded.department,
  };
}

module.exports = { extractUserFromAuthHeader };
