import {getChannelForSession} from "./channels.mjs";

export function forRequestSession(sessionInfo) {
    const sessionId = sessionInfo?.ws;
    return getChannelForSession(sessionId);
}