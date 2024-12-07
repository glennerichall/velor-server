export function handleUpgrade(req, res) {
    const {manager, wsSocket, head} = req;
    manager.handleUpgrade(req, wsSocket, head);
}