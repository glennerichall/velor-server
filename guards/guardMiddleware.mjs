import {isAuthenticated} from "./predicates.mjs";
import {getLogger} from "velor-services/application/services/services.mjs";

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
export const logErrors = (err, req, res, next) => {
    getLogger(req).error("Unhandled error " + err.message);
    res.sendStatus(500);
};

export const isLoggedIn = guard(isAuthenticated, 401);