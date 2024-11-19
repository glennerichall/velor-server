export const pauseHandler = (req, res, next) => {
    if (req.app.get('paused')) {
        return res.status(503).send('Server is temporarily unavailable.');
    }
    next();
}