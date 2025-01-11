const kp_limiters = Symbol();

export class RateLimiterComposite {

    constructor(...rateLimiters) {
        this[kp_limiters] = rateLimiters;
    }

    async consume(key, points) {
        for (let limiter of this[kp_limiters]) {
            await limiter.consume(key, points);
        }
    }

}