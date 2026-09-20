import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';
import checkoutRouter from './routes/checkout.js';
import adminRouter from './routes/admin.js';
import adminOrdersRouter from './routes/adminOrders.js';
import authRouter from './routes/auth.js';
import categoriesRouter from './routes/categories.js';
import adminProductsRouter from './routes/adminProducts.js';
import adminAnalyticsRouter from './routes/adminAnalytics.js';
import errorHandler from './middleware/errorHandler.js';
import './jobs/expirePaymentsJob.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
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
app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.resolve(__dirname, '../uploads')), express.static(path.resolve(__dirname, 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/admin/analytics', adminAnalyticsRouter);
app.use('/api/admin/orders', adminOrdersRouter);
app.get('/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

export default app;
