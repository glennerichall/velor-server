export function wsIdFromCookies(req, res, next) {
    req.wsId = req.signedCookies['ws'];
    next();
}