export const notFound = (req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
export const errorHandler = (error, req, res, next) => { console.error(error); res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server error' }); };
