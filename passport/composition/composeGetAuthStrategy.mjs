export function composeGetAuthStrategy(strategies) {

    return (req, res, next) => {
        let provider = req.query.provider ?? req.params.provider; // query for initiate, params for callback
        let strategy = strategies[provider];

        if (!strategy) {
            return res.sendStatus(404);
        }

        strategy.use();
        req.authStrategy = strategy;

        next();
    }
}