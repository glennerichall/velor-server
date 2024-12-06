export function wrapRateLimiterInMiddleware(limiter, getKey, pointsToConsume = 1) {
    return async (req, res, next) => {
        try {
            const key = getKey(req);
            const rlResolved = await limiter.consume(key, pointsToConsume);
            next();
        } catch (rlRejected) {
            if (rlRejected instanceof Error) {
                throw rlRejected;
            } else {
                res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
                res.status(429).send('Too Many Requests');
            }
        }
    }
}

export const limitByPathAndIp = req => req.path + "_" + req.ip;
export const limitByIp = req => req.ip;

// export function createRateLimiterMiddleware(services, configs, getKey = limitByPathAndIp) {
//     const rl = getFactories(services)[s_rateLimiter](configs);
//     return wrapRateLimiterInMiddleware(rl, getKey);
// }

