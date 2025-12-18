import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { scheduleRouter } from './endpoints/schedule.js';
import { healthRouter } from './endpoints/health.js';

dotenv.config();

const app = express();
const PORT = process.env.API_ADDRESS || '0.0.0.0:4001';
const [host, port] = PORT.split(':');

// CORS configuration
const origins = process.env.ORIGIN ? process.env.ORIGIN.split(';') : ['http://localhost:3000'];
app.use(cors({
  origin: origins,
  methods: ['GET', 'CONNECT']
}));

app.use(express.json());

// Routes
app.use('/api/schedule', scheduleRouter);
app.use('/api/health', healthRouter);

app.listen(parseInt(port), host, () => {
  console.log(`API service started on ${host}:${port}`);
});
