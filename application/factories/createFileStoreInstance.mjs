import {AWSFileStore} from "../../files/AWSFileStore.mjs";
import {getEnvValue} from "velor-services/application/services/baseServices.mjs";
import {
    AWS_ACCESS_KEY_ID,
    AWS_REGION,
    AWS_SECRET_ACCESS_KEY
} from "../services/envKeys.mjs";

export function createFileStoreInstance(services) {

    const secretAccessKey = getEnvValue(services, AWS_SECRET_ACCESS_KEY);
    const accessKeyId = getEnvValue(services, AWS_ACCESS_KEY_ID);
    const region = getEnvValue(services, AWS_REGION);

    let configs = {
        accessKeyId,
        secretAccessKey,
        region
    };

    return new AWSFileStore(configs);
}