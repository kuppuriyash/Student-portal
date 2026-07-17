import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import connectDB from './configs/db.js';
import MongoStore from 'connect-mongo';

import AuthRouter from './routes/AuthRoutes.js';
import ThumbnailRouter from './routes/ThumbnailRoutes.js';
import UserRouter from './routes/UserController.js';

dotenv.config();

if (!process.env.MONGO_URL) {
  throw new Error("MONGO_URL is not provided");
}
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not provided");
}

const mongoUrl = process.env.MONGO_URL;
const sessionSecret = process.env.SESSION_SECRET;

await connectDB();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173", "http://localhost:3000"
  ],
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  store: MongoStore.create({
    mongoUrl: mongoUrl,
    collectionName: "sessions"
  })
}));

app.use('/api/auth', AuthRouter);
app.use('/api/thumbnail', ThumbnailRouter);
app.use('/api/user', UserRouter);

app.get('/', (req, res) => {
  res.send('Server is Live!');
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
