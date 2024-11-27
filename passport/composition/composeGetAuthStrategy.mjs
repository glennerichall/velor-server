export function composeGetAuthStrategy(strategies) {

    return (req, res, next) => {
        let provider = req.query.provider;
        let strategy = strategies[provider];

        if (!strategy) {
            return res.sendStatus(404);
        }

        req.authStrategy = strategy;

        next();
    }
}