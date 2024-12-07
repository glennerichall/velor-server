import {getRateLimiter} from "../../application/services/serverServices.mjs";
import {socketConnectionUpgradeLimiter} from "../../guards/rate/limiterConfigs.mjs";
import {limitByPathAndIp} from "../../guards/rate/rateLimiterCreation.mjs";

export function composeGuardRequest(services) {
    const rateLimiter = getRateLimiter(services, socketConnectionUpgradeLimiter);

    return async (req, res, next) => {
        try {
            const key = limitByPathAndIp(req);
            await rateLimiter.consume(key, 1);
            next();
        } catch (e) {
            return res.status(429).send("Too Many Requests");
        }
    }
}