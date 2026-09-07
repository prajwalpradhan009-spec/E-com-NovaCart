import { Router } from 'express';
import { Review, Product } from '../models/index.js';
import { protect } from '../middleware/auth.js';
const router = Router();
router.get('/products/:id/reviews', async (req, res) => res.json({ success: true, data: await Review.find({ productId: req.params.id }).populate('userId', 'name') }));
router.post('/products/:id/reviews', protect, async (req, res) => { const review = await Review.create({ ...req.body, productId: req.params.id, userId: req.user.id }); const all = await Review.find({ productId: req.params.id }); await Product.findByIdAndUpdate(req.params.id, { rating: all.reduce((sum, item) => sum + item.rating, 0) / all.length }); res.status(201).json({ success: true, data: review }); });
router.put('/reviews/:id', protect, async (req, res) => { const review = await Review.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, { new: true, runValidators: true }); if (!review) return res.status(404).json({ success: false, message: 'Review not found' }); res.json({ success: true, data: review }); });
router.delete('/reviews/:id', protect, async (req, res) => { await Review.deleteOne({ _id: req.params.id, userId: req.user.id }); res.json({ success: true, message: 'Review deleted' }); });
export default router;
