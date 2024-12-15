import {EVENT_USER_LOGOUT} from "../../application/services/eventKeys.mjs";
import {getUser} from "../../application/services/requestServices.mjs";
import {getEmitter} from "velor-services/application/services/services.mjs";

export async function logout(req, res) {
    return new Promise((resolve, reject) => {
        let user = getUser(req);
        req.logout(async err => {
            if (err) {
                reject(err);
            } else {
                getEmitter(req).emit(EVENT_USER_LOGOUT, user);
                res.sendStatus(200);
                resolve();
            }
        });
    });

}