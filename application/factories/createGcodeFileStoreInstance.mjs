import {FileStore} from "../../file/FileStore.mjs";
import {getEnv} from "velor/utils/injection/baseServices.mjs";

export function createGcodeFileStoreInstance(services) {
    const env = getEnv(services);

    const {
        ZUPFE_AWS_GCODE_BUCKET
    } = env;

    return new FileStore(ZUPFE_AWS_GCODE_BUCKET, env);
}