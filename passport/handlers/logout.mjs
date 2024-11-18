import {getEmitter} from "../../application/services/serverServices.mjs";
import {EVENT_USER_LOGOUT} from "../../application/services/serverEventKeys.mjs";

export async function logout(req, res) {
    return new Promise((resolve, reject) => {
        req.logout(async err => {
            if (err) {
                reject(err);
            } else {
                getEmitter(req).emit(EVENT_USER_LOGOUT, req);
                res.sendStatus(201);
                resolve();
            }
        });
    });

}