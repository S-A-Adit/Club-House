import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { q } from './db.js';

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const { rows } = await q('SELECT * FROM users WHERE LOWER(email)=LOWER($1)', [email]);
        const user = rows[0];
        if (!user) return done(null, false, { message: 'Invalid email or password' });

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return done(null, false, { message: 'Invalid email or password' });

        return done(null, {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          is_member: user.is_member,
          is_admin: user.is_admin
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);
passport.serializeUser((user,done) =>{
  done(null, user.id);
});

passport.deserializeUser(async(id, done) =>{
  try {
   const { rows } = await q('SELECT id, first_name, last_name, email, is_member, is_admin FROM users WHERE id=$1', [id]);
    if (!rows[0]) return done(null, false);
    return done(null, rows[0]);
  } catch (e) {
    done(e);
  }
});

export default passport;
