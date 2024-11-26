import {
    decryptObject,
    decryptText,
    encryptObject,
    encryptText
} from "velor-utils/utils/encryption.mjs";

export class EncryptionProvider {
    #key;
    #iv;

    constructor(key, iv) {
        this.#key = key;
        this.#iv = iv;
    }

    encryptText(text) {
        return encryptText(text, {
            key: this.#key,
            iv: this.#iv,
        });
    }

    encryptObject(obj) {
        return encryptObject(obj, {
            key: this.#key,
            iv: this.#iv,
        });
    }

    decryptText(text) {
        return decryptText(text, {
            key: this.#key,
            iv: this.#iv,
        });
    }

    decryptObject(obj) {
        return decryptObject(obj, {
            key: this.#key,
            iv: this.#iv,
        });
    }
}