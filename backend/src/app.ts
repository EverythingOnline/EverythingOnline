import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';
import adminRouter from './routes/admin.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
const devExtraOrigin = process.env.DEV_FRONTEND_ORIGIN || 'http://localhost:3001';
const allowedOrigins = [frontendOrigin, devExtraOrigin];
const clientDist = path.resolve(__dirname, '../../dist');
const indexFile = path.join(clientDist, 'index.html');

app.use(helmet());
app.use(
    cors({
        origin: (origin, callback) => {
            // allow requests with no origin (mobile apps, curl)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error('CORS not allowed'), false);
        },
    }),
);
app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);

app.use(express.static(clientDist));
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('*', (req, res) => {
    res.sendFile(indexFile, (err) => {
        if (err) {
            res.status(500).send('Unable to load the application');
        }
    });
});

app.use(errorHandler);

export default app;
