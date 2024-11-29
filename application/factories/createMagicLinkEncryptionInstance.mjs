import {getEnvValue} from "velor-services/injection/baseServices.mjs";
import {
    MAGIC_LINK_ENCRYPT_IV,
    MAGIC_LINK_ENCRYPT_KEY
} from "../services/serverEnvKeys.mjs";
import {EncryptionProvider} from "../../core/EncryptionProvider.mjs";

export function createMagicLinkEncryptionInstance(services) {
    const key = getEnvValue(services, MAGIC_LINK_ENCRYPT_KEY);
    const iv = getEnvValue(services, MAGIC_LINK_ENCRYPT_IV);

    if (!key || !iv) {
        throw new Error("Provide user encryption key and iv");
    }

    return new EncryptionProvider(
        Buffer.from(key, 'hex'),
        Buffer.from(iv, 'hex'));
}