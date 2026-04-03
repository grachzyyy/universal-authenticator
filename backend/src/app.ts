import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authController from './controllers/authController';
import devicesController from './controllers/devicesController';
import syncController from './controllers/syncController';
import recoveryController from './controllers/recoveryController';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

app.use('/auth', authController);
app.use('/devices', devicesController);
app.use('/sync', syncController);
app.use('/recovery', recoveryController);

app.get('/', (_req, res) => {
  res.json({ message: 'Universal Authenticator backend is running' });
});

export default app;
