import {
    decryptObject,
    decryptText,
    encryptObject,
    encryptText
} from "velor-utils/utils/encryption.mjs";

const kp_key = Symbol();
const kp_iv = Symbol();

export class EncryptionProvider {

    constructor(key, iv) {
        this[kp_key] = key;
        this[kp_iv] = iv;
    }

    encryptText(text) {
        return encryptText(text, {
            key: this[kp_key],
            iv: this[kp_iv],
        });
    }

    encryptObject(obj) {
        return encryptObject(obj, {
            key: this[kp_key],
            iv: this[kp_iv],
        });
    }

    decryptText(text) {
        return decryptText(text, {
            key: this[kp_key],
            iv: this[kp_iv],
        });
    }

    decryptObject(obj) {
        return decryptObject(obj, {
            key: this[kp_key],
            iv: this[kp_iv],
        });
    }
}