import {MessageFactory} from "../../distribution/MessageFactory.mjs";
import {getMessageBuilder} from "velor-distribution/application/services/services.mjs";

export function createMessageFactoryInstance(services) {
    let messageBuilder = getMessageBuilder(services);
    return new MessageFactory(messageBuilder);
}