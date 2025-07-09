// middleware/admin.js
module.exports = (req, res, next) => {
  const { email } = req.user || {};
  if (email !== 'sonalijatav100@gmail.com') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};




