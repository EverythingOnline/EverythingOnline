import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';
import checkoutRouter from './routes/checkout.js';
import adminRouter from './routes/admin.js';
import adminOrdersRouter from './routes/adminOrders.js';
import authRouter from './routes/auth.js';
import errorHandler from './middleware/errorHandler.js';
import './jobs/expirePaymentsJob.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
const devExtraOrigin = process.env.DEV_FRONTEND_ORIGIN || 'http://localhost:3001';
const backendOrigin = process.env.BACKEND_ORIGIN || 'http://localhost:4000';
const allowedOrigins = [
    frontendOrigin,
    devExtraOrigin,
    backendOrigin,
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:4000',
];
const clientDist = path.resolve(__dirname, '../../dist');
const indexFile = path.join(clientDist, 'index.html');

// sanity checks for static assets at startup — helps diagnose missing build issues
try {
    // require fs here so it only runs in Node environment
    const fs = await import('fs');
    if (!fs.existsSync(clientDist)) {
        // log a clear warning so devs know to run the frontend build or use Vite
        // eslint-disable-next-line no-console
        console.warn(`Frontend dist not found at ${clientDist}. Use the Vite dev server or run a build.`);
    } else if (!fs.existsSync(indexFile)) {
        // eslint-disable-next-line no-console
        console.warn(`index.html not found in ${clientDist}. Frontend build may be incomplete.`);
    }
} catch (e) {
    // ignore — this file may be imported in environments where fs isn't available
}

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

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/orders', adminOrdersRouter);

app.use(express.static(clientDist));
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/', (req, res) => {
    res.redirect(frontendOrigin);
});
app.get('*', (req, res) => {
    res.sendFile(indexFile, (err) => {
        if (err) {
            res.status(500).send('Unable to load the application');
        }
    });
});

app.use(errorHandler);

export default app;
