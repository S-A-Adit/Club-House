export const ensureAuth = (req,res,next) =>{
    if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

export const ensureAdmin = (req,res,next) =>{
  if (req.isAuthenticated() && req.user.is_admin) return next();
  res.status(403).send('Forbidden');
}