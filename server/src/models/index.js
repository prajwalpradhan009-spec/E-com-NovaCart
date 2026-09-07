import mongoose from 'mongoose';

const { Schema } = mongoose;
const ref = (model) => ({ type: Schema.Types.ObjectId, ref: model, required: true });
const options = { timestamps: true, toJSON: { virtuals: true, versionKey: false, transform: (_, value) => { value.id = value._id; delete value._id; return value; } } };

export const User = mongoose.model('User', new Schema({ name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true }, password: { type: String, required: true }, phone: String, role: { type: String, enum: ['customer', 'admin'], default: 'customer' }, address: String }, options));
export const Category = mongoose.model('Category', new Schema({ name: { type: String, required: true, unique: true }, description: String, image: String }, options));
export const Product = mongoose.model('Product', new Schema({ categoryId: ref('Category'), name: { type: String, required: true }, description: String, price: { type: Number, required: true }, discount: { type: Number, default: 0 }, stock: { type: Number, default: 0 }, image: String, brand: String, rating: { type: Number, default: 0 } }, options));
export const Cart = mongoose.model('Cart', new Schema({ userId: { ...ref('User'), unique: true } }, options));
export const CartItem = mongoose.model('CartItem', new Schema({ cartId: ref('Cart'), productId: ref('Product'), quantity: { type: Number, min: 1, default: 1 }, price: { type: Number, required: true } }, options));
export const Order = mongoose.model('Order', new Schema({ userId: ref('User'), totalAmount: Number, status: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' }, shippingAddress: String, paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' } }, options));
export const OrderItem = mongoose.model('OrderItem', new Schema({ orderId: ref('Order'), productId: ref('Product'), quantity: Number, price: Number }, options));
export const Payment = mongoose.model('Payment', new Schema({ orderId: ref('Order'), paymentMethod: String, transactionId: String, amount: Number, status: String }, options));
export const Review = mongoose.model('Review', new Schema({ userId: ref('User'), productId: ref('Product'), rating: { type: Number, min: 1, max: 5, required: true }, comment: String }, options));
export const Wishlist = mongoose.model('Wishlist', new Schema({ userId: ref('User'), productId: ref('Product') }, { ...options, indexes: [{ unique: true, fields: ['userId', 'productId'] }] }));
