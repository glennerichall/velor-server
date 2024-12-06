export class RateLimiterComposite {
    #limiters;

    constructor(...rateLimiters) {
        this.#limiters = rateLimiters;
    }

    async consume(key, points) {
        for (let limiter of this.#limiters) {
            await limiter.consume(key, points);
        }
    }

}