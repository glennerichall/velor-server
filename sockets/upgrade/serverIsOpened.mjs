export function serverIsOpened(req, res, next) {
    const {manager} = req;
    if (!manager.isOpened) {
        return res.status(503).send("Unavailable");
    }
    next();
}