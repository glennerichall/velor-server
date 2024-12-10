export function verifyWsId(req, res, next) {
    if (!req.wsId) {
        return res.status(400).send("Missing WS-ID");
    }
    next();
}