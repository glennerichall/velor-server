import {MessageReceiver} from "velor-distribution/distribution/MessageReceiver.mjs";
import {getPubSub} from "velor-distribution/application/services/distributionServices.mjs";

export class FrontendDispatcher {
    getReceiver(wsClient) {
        return new MessageReceiver(getPubSub(this));
    }
}