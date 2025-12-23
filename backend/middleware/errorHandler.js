const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            message: messages.join(', ')
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
};

module.exports = errorHandler;
