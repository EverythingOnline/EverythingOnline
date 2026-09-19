import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import requireAdminAuth from '../middleware/adminAuth.js';
import { createAdminProduct, getAdminProduct, listAdminProducts, removeAdminProduct, restoreAdminProduct, updateAdminProduct } from '../controllers/adminProductsController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const upload = multer({
    storage: multer.diskStorage({
        destination: uploadDirectory,
        filename: (_req, file, callback) => callback(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}`),
    }),
});

const router = Router();
router.use(requireAdminAuth);
router.get('/', listAdminProducts);
router.get('/:id', getAdminProduct);
router.post('/', upload.single('image'), createAdminProduct);
router.patch('/:id', upload.single('image'), updateAdminProduct);
router.patch('/:id/remove', removeAdminProduct);
router.patch('/:id/restore', restoreAdminProduct);

export default router;