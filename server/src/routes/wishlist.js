import { Router } from 'express';
import { Wishlist, Product } from '../models/index.js';
import { protect } from '../middleware/auth.js';
const router = Router();
router.get('/', protect, async (req, res) => res.json({ success: true, data: await Wishlist.find({ userId: req.user.id }).populate('productId') }));
router.post('/', protect, async (req, res) => res.status(201).json({ success: true, data: await Wishlist.findOneAndUpdate({ userId: req.user.id, productId: req.body.productId }, { userId: req.user.id, productId: req.body.productId }, { upsert: true, new: true }) }));
router.delete('/:productId', protect, async (req, res) => { await Wishlist.deleteOne({ userId: req.user.id, productId: req.params.productId }); res.json({ success: true, message: 'Removed from wishlist' }); });
export default router;
