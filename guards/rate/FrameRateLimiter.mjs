export class FrameRateLimiterError extends Error {
    constructor(info) {
        super();
        this.info = info;
    }
}

const kp_streams = Symbol();
const kp_cleanUpTimer = Symbol();
const kp_configs = Symbol();
const km_calculateIntrinsicRate = Symbol();

export class FrameRateLimiter {


    constructor(configs = {}) {
        this[kp_configs] = {
            cleanup: 1000 * 60 * 10, // 10 minutes
            maxRate: 6, //6fps
            ...configs
        };
        this[kp_streams] = new Map();
        const {
            cleanup
        } = this[kp_configs];
        this[kp_cleanUpTimer] = setInterval(() => this.cleanUp(), cleanup);
    }

    cleanUp() {
        const {
            cleanup
        } = this[kp_configs];
        const cleanUpTime = Date.now() - cleanup;
        for (let [key, streamInfo] of this[kp_streams]) {
            if (streamInfo.lastFrameTime < cleanUpTime) {
                // If last frame time is more than 10 minutes ago, delete the stream
                this[kp_streams].delete(key);
            }
        }
    }

    // Sets or updates the max rate for a specific key (client)
    setMaxRate(key, maxRatePerSecond) {
        let streamInfo = this[kp_streams].get(key);
        if (!streamInfo) {
            // Initialize stream info if it doesn't exist
            streamInfo = {
                lastFrameTime: 0,
                frameCount: 0,
                intrinsicRate: 0,
                maxRate: maxRatePerSecond,
            };
        } else {
            // Update max rate for existing stream
            streamInfo.maxRate = maxRatePerSecond;
        }
        this[kp_streams].set(key, streamInfo);
    }

    async consume(key, points) {
        const currentTime = new Date().getTime();
        let streamInfo = this[kp_streams].get(key);

        if (!streamInfo) {
            let {
                maxRate
            } = this[kp_configs];
            this.setMaxRate(key, maxRate);
            streamInfo = this[kp_streams].get(key);
        }

        const elapsedTime = currentTime - streamInfo.lastFrameTime;

        // Calculate interval based on client's max rate
        const desiredInterval = 1000 / (streamInfo.maxRate * points);

        if (elapsedTime >= desiredInterval || streamInfo.frameCount === 0) {
            // If enough time has passed since the last frame, or if it's the first frame
            streamInfo.frameCount++;
            this[km_calculateIntrinsicRate](key, currentTime);
            streamInfo.lastFrameTime = currentTime;
            this[kp_streams].set(key, streamInfo);
        } else {
            throw new FrameRateLimiterError(streamInfo);
        }
    }

    [km_calculateIntrinsicRate](key, currentTime) {
        const streamInfo = this[kp_streams].get(key);
        const durationInSeconds = (currentTime - streamInfo.lastFrameTime) / 1000;
        if (durationInSeconds > 0 && streamInfo.frameCount > 1) {
            streamInfo.intrinsicRate = streamInfo.frameCount / durationInSeconds;
        }
    }

    getIntrinsicRate(key) {
        const streamInfo = this[kp_streams].get(key);
        if (streamInfo) {
            return streamInfo.intrinsicRate;
        }
        return 0; // No data available for this key
    }

    dispose() {
        if (this[kp_cleanUpTimer]) {
            clearInterval(this[kp_cleanUpTimer]);
            this[kp_cleanUpTimer] = null;
        }
        this[kp_streams].clear();
    }
}