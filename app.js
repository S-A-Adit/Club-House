import express from 'express';
import expressEjsLayouts from 'express-ejs-layouts';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import morgan from 'morgan';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import methodOverride from 'method-override';
import passport from './src/passport.js';
import { pool } from './src/db.js';

import indexRoutes from './src/routes/index.js';
import authRoutes from './src/routes/auth.js';
import messageRoutes from './src/routes/message.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));


// middleware
app.use(expressEjsLayouts)
app.set('layout','layout');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));

const PgStore = pgSession(session);

app.use(
  session({
    store: new PgStore({
      pool, // Reuse existing pg Pool
      tableName: 'session'
      // By default, connect-pg-simple will attempt to create table if missing on first write
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7  // 7 days
      // secure: true, sameSite:'lax' // enable secure in production over HTTPS
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// locals for templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  next();
});

// routes
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/', messageRoutes);

// 404 fallback
app.use((req, res) => res.status(404).send('Not found'));

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Club running on http://localhost:${PORT}`);
});
