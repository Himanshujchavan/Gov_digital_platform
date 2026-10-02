const { ApiResponse } = require('@maha-interop/shared');
const jwt = require('jsonwebtoken');
const axios = require('axios');

class AuthMiddleware {
  constructor() {
    // JWKS cache: stores the public key PEM and its expiry time
    this._cachedPublicKey = null;
    this._cacheExpiry = 0;
    this._cacheTtlMs = parseInt(process.env.JWKS_CACHE_TTL_MS) || 3600000; // 1 hour default
    this._jwksUrl = null; // built lazily from env
    this._algorithm = process.env.JWT_ALGORITHM || 'RS256';
  }

  _getJwksUrl() {
    if (!this._jwksUrl) {
      const authBase = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';
      this._jwksUrl = `${authBase}/auth/.well-known/jwks.json`;
    }
    return this._jwksUrl;
  }

  /**
   * Fetch the RSA public key from the auth-service JWKS endpoint.
   * Caches the key in memory for JWKS_CACHE_TTL_MS (default 1 hour).
   * Falls back to JWT_PUBLIC_KEY env var if JWKS fetch fails.
   */
  async _getPublicKey() {
    const now = Date.now();

    // Return cached key if still valid
    if (this._cachedPublicKey && now < this._cacheExpiry) {
      return this._cachedPublicKey;
    }

    // Try env var first (most efficient – no network call at all)
    if (process.env.JWT_PUBLIC_KEY) {
      this._cachedPublicKey = process.env.JWT_PUBLIC_KEY;
      this._cacheExpiry = now + this._cacheTtlMs;
      return this._cachedPublicKey;
    }

    // Fallback: fetch from JWKS endpoint
    try {
      const response = await axios.get(this._getJwksUrl(), { timeout: 5000 });
      const keys = response.data?.data?.keys || response.data?.keys || [];
      if (keys.length === 0) {
        throw new Error('No keys found in JWKS response');
      }

      const key = keys[0];
      // If the key has an x5c field with a PEM-like string, reconstruct it
      if (key.x5c && key.x5c[0]) {
        const raw = key.x5c[0];
        // Check if it already has PEM headers
        if (raw.includes('BEGIN')) {
          this._cachedPublicKey = raw.replace(/\\n/g, '\n');
        } else {
          // Wrap as PEM certificate
          this._cachedPublicKey = `-----BEGIN PUBLIC KEY-----\n${raw}\n-----END PUBLIC KEY-----`;
        }
      } else {
        throw new Error('JWKS key missing x5c field');
      }

      this._cacheExpiry = now + this._cacheTtlMs;
      return this._cachedPublicKey;
    } catch (err) {
      // If we had a previously cached key, keep using it (stale-while-revalidate)
      if (this._cachedPublicKey) {
        return this._cachedPublicKey;
      }
      throw new Error(`Failed to obtain JWT public key: ${err.message}`);
    }
  }

  async use(req, res, next) {
    // Allow CORS preflight requests through
    if (req.method === 'OPTIONS') {
      return next();
    }

    // Skip auth for auth-service endpoints (login, register, refresh, health, jwks)
    if (req.url.startsWith('/api/auth')) {
      return next();
    }

    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        ApiResponse.error('Unauthorized', 'Missing or invalid Bearer token')
      );
    }

    const token = authHeader.substring(7); // Strip 'Bearer '

    try {
      // LOCAL verification — no network call to auth-service per request
      const publicKey = await this._getPublicKey();
      const decoded = jwt.verify(token, publicKey, {
        algorithms: [this._algorithm],
      });

      // Attach user payload to request
      req.user = {
        id: decoded.sub,
        username: decoded.username,
        fullName: decoded.fullName,
        email: decoded.email,
        role: decoded.role,
        department: decoded.department,
      };

      next();
    } catch (error) {
      const message = error.name === 'TokenExpiredError'
        ? 'Token has expired'
        : 'Invalid or expired token';

      return res.status(401).json(
        ApiResponse.error('Unauthorized', message)
      );
    }
  }
}

module.exports = { AuthMiddleware };
