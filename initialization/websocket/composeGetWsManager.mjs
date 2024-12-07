import {getWsManagerProvider} from "../../application/services/serverServices.mjs";

export function composeGetWsManager(services) {
    return (req, res, next) => {
        let manager = getWsManagerProvider(services).getFromRequest(req);
        if (!manager) {
            return res.status(404).send("Not Found");
        }
        req.manager = manager;
        next();
    }
}