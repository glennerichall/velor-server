import {EncryptionProvider} from "../../core/EncryptionProvider.mjs";
import {getEnvValue} from "velor-services/application/services/baseServices.mjs";

import {
    USER_ENCRYPT_IV,
    USER_ENCRYPT_KEY
} from "../services/envKeys.mjs";

export function createUserSerializerInstance(services) {

    const key = getEnvValue(services, USER_ENCRYPT_KEY);
    const iv = getEnvValue(services, USER_ENCRYPT_IV);

    if (!key || !iv) {
        throw new Error("Provide user encryption key and iv");
    }

    const serializer = new EncryptionProvider(
        Buffer.from(key, 'hex'),
        Buffer.from(iv, 'hex'));

    return {
        serialize(user) {
            return serializer.encryptObject(user);
        },

        deserialize(data) {
            return serializer.decryptObject(data);
        }
    };
}