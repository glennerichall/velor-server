import {allAsync} from "velor-utils/utils/predicates.mjs";

export const isAuthenticated = async req => req.isAuthenticated();

export const isSessionValid = async req => !req.sessionError;

export const isSessionValidAndAuthenticated = allAsync(
    isSessionValid,
    isAuthenticated);