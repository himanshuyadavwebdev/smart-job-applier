export function errorHandler(err, req, res, next) {
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', err.stack || err.message);
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validation failed.', errors });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({
      success: false,
      message: `A record with that ${field || 'value'} already exists.`,
      errors: [],
    });
  }

  if (err.message && err.message.includes('Only PDF and DOCX')) {
    return res.status(400).json({ success: false, message: err.message, errors: [] });
  }

  if (err.message && err.message.includes('File too large')) {
    return res.status(400).json({ success: false, message: 'File size exceeds the 5MB limit.', errors: [] });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'An internal server error occurred.' : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
  });
}
