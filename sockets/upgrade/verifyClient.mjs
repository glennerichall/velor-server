export async function verifyClient(req, res, next) {
    const {manager, wsSocket, head} = req;
    let response = await manager.verifyClient(req, wsSocket, head);
    if (response !== true) {
        let status = response.status ?? 401;
        let message = response.message;
        return res.status(status).send(message);
    }
    next();
}