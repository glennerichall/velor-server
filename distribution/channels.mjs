import {getChannelFrom} from "velor-distribution/distribution/channels.mjs";

export const CHANNEL_CLIENT_PREFIX = "client";
export const CHANNEL_SESSION_ID = "session";
export const CHANNEL_WS_ID = "ws";
export const CHANNEL_USER_ID = "user";


// client/**
export function getChannelForClient(...args) {
    return getChannelFrom(CHANNEL_CLIENT_PREFIX, ...args);
}


// client/session/:sessionId
export function getChannelForSession(sessionId) {
    return getChannelForClient(CHANNEL_SESSION_ID, sessionId);
}


// client/ws/:wsId
export function getChannelForWsId(wsId) {
    return getChannelForClient(CHANNEL_WS_ID, wsId);
}

// client/user/:userId
export function getChannelForUserId(userId) {
    return getChannelForClient(CHANNEL_USER_ID, userId);
}
