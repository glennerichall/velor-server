import {Emitter} from "velor-utils/utils/Emitter.mjs";

export const mailEmitter = new Emitter(true);

export const mailerTransport = {
    sendMail(msg) {
        mailEmitter.emit('sendMail', msg);
    }
};