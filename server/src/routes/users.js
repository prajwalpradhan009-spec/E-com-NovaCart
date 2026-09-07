import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { protect } from '../middleware/auth.js';
const router = Router();
router.get('/profile', protect, (req, res) => res.json({ success: true, data: req.user }));
router.put('/profile', protect, async (req, res) => { const allowed = ['name', 'phone', 'address']; await User.findByIdAndUpdate(req.user.id, Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key))), { new: true }); res.json({ success: true, data: await User.findById(req.user.id).select('-password') }); });
router.put('/change-password', protect, async (req, res) => { const user = await User.findById(req.user.id); if (!await bcrypt.compare(req.body.currentPassword || '', user.password)) return res.status(400).json({ success: false, message: 'Current password is incorrect' }); await User.findByIdAndUpdate(req.user.id, { password: await bcrypt.hash(req.body.newPassword, 12) }); res.json({ success: true, message: 'Password updated successfully' }); });
export default router;
