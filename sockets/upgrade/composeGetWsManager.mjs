import {getWsManagerProvider} from "../../application/services/services.mjs";

export function composeGetWsManager(services) {
    return (req, res, next) => {
        let manager = getWsManagerProvider(services).getFromRequest(req);
        if (!manager) {
            return res.status(404).send();
        }
        req.manager = manager;
        next();
    }
}