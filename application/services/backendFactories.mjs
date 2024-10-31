import {createDatabaseManagerInstance} from "../factories/createDatabaseManagerInstance.mjs";
import {createDatabaseInstance} from "../factories/createDatabaseInstance.mjs";
import {createLocalPubSubInstance} from "../factories/createLocalPubSubInstance.mjs";
import {
    LocalAsyncKeyStore
} from "../../distribution/impl/LocalKeyStore.mjs";
import {createLoggerInstance} from "../factories/createLoggerInstance.mjs";
import {createMessageQueueInstance} from "../factories/createMessageQueueInstance.mjs";
import {createGcodeFileStoreInstance} from "../factories/createGcodeFileStoreInstance.mjs";
import {createSnapshotFileStoreInstance} from "../factories/createSnapshotFileStoreInstance.mjs";
import {createGcodeManagerInstance} from "../factories/createGcodeManagerInstance.mjs";
import {createSnapshotManagerInstance} from "../factories/createSnapshotManagerInstance.mjs";
import {createMessageFactoryInstance} from "../factories/createMessageFactoryInstance.mjs";
import {
    s_database,
    s_databaseManager,
    s_keyStore,
    s_messageQueue,
    s_pubSub,
} from "./backendServiceKeys.mjs";

export const backendFactories = {
    [s_pubSub]: createLocalPubSubInstance,
    [s_databaseManager]: createDatabaseManagerInstance,
    [s_database]: createDatabaseInstance,
    [s_keyStore]: LocalAsyncKeyStore,
    [s_messageQueue]: createMessageQueueInstance,
};
