const maxWrongAttemptsByIPperDay = 100;
const maxConsecutiveFailsByUsernameAndIP = 10;

// Login endpoint protection. Create 2 limiters.
// The first counts number of consecutive failed attempts and
// allows maximum 10 by username and IP pair per day.
export const consecutiveFailsByUsernameAndIPLimiter = {
    keyPrefix: 'login_fail_consecutive_username_and_ip',
    points: maxConsecutiveFailsByUsernameAndIP, // 10 attempts
    duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
    blockDuration: 60 * 60, // Block for 1 hour
};

// Login endpoint protection. Create 2 limiters.
// The second blocks IP for a day on 100 failed attempts per day,
// regardless of username
export const slowBruteByIPLimiter = {
    keyPrefix: 'login_fail_ip_per_day',
    points: maxWrongAttemptsByIPperDay, // 100 attempts
    duration: 60 * 60 * 24, // Store number for 1 day since first fail
    blockDuration: 60 * 60 * 24, // Block for 1 day,
};

// This limits 3 websocket connection attempts every 20 seconds.
export const socketConnectionUpgradeLimiter = {
    points: 3,
    keyPrefix: 'socket_upgrade_connection_fail',
    duration: 20 // seconds
};

// This limits 50 api calls per second for any route of the app.
export const globalLimiter = {
    points: 50,
    duration: 1,
    keyPrefix: 'global_request_per_route'
};

export const floodingLimiter = {};

export const streamLimiter = {
    points: 1000,
    duration: 30,
    keyPrefix: 'stream_limiter'
};

export const frameRateLimiter = {
    points: 12,             // 12 frames per second
    duration: 1,
    keyPrefix: 'frame_rate_limiter'
};

export const eventLimiter = {
    points: 12,             // 12 events per second
    duration: 1,
    keyPrefix: 'event_limiter'
}

export const replyLimiter = {
    points: 12,             // 12 events per second
    duration: 1,
    keyPrefix: 'reply_limiter'
}

export const adminLimiter = {
    points: 10,
    duration: 5,
    keyPrefix: 'admin_limiter'
}