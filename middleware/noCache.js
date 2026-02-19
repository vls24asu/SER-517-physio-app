// Middleware to prevent caching of pages
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

// Middleware specifically for authenticated pages
const noCacheAuth = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  // Prevent back button after logout
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
};

module.exports = { noCache, noCacheAuth };
