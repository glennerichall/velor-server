import {MessageFactory} from "../../distribution/MessageFactory.mjs";
import {getMessageBuilder} from "velor-backend/application/services/backendServices.mjs";

export function createMessageFactoryInstance(services) {
    let messageBuilder = getMessageBuilder(services);
    return new MessageFactory(messageBuilder);
}