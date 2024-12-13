import {isAuthenticated} from "./predicates.mjs";

export const guard = (predicate, status = 403) => {
    return async (req, res, next) => {
        if (!await predicate(req)) {
            res.sendStatus(status);
        } else {
            next();
        }
    }
};

export const proceed = (req, res, next) => next();

export const isLoggedIn = guard(isAuthenticated, 401);