import {getLogger} from "velor-services/application/services/services.mjs";

export function composeGetAuthStrategy(strategies) {

    return async (req, res, next) => {
        let provider = req.query.provider ?? req.params.provider; // query for initiate, params for callback
        let strategy = strategies[provider];

        if (!strategy) {
            return res.sendStatus(404);
        }

        try {
            await strategy.use();
        } catch (e) {
            getLogger(req).error('Unable to get auth strategy ' + e.message);
            throw e;
        }
        req.authStrategy = strategy;

        next();
    }
}