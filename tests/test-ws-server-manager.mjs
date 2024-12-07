import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import sinon from "sinon";
import {WsManagerPolicy} from "../sockets/core/WsManagerPolicy.mjs";
import {Emitter} from "velor-utils/utils/Emitter.mjs";
import {getLogger} from "velor-services/injection/services.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();


describe('WsManagerPolicy', () => {
    let manager, services,
        verifyClient,
        acceptMessage;

    beforeEach(async ({websocket}) => {
        ({
            manager, services,
            verifyClient,
            acceptMessage
        } = websocket);
    })

    it('should correctly count clients', () => {
        expect(manager.count()).to.equal(0);
        manager.appendClient({id: 'client1', ws: new Emitter()});
        manager.appendClient({id: 'client2', ws: new Emitter()});
        manager.appendClient({id: 'client3', ws: new Emitter()});
        expect(manager.count()).to.equal(3);
    });

    it('should retrieve a client by ID', () => {
        const client1 = {id: 'client1', ws: new Emitter()};
        const client2 = {id: 'client2', ws: new Emitter()};
        manager.appendClient(client1);
        manager.appendClient(client2);
        expect(manager.getClient('client1')).to.equal(client1);
        expect(manager.getClient('client2')).to.equal(client2);
    });

    it('should reject a ws message if acceptMessage returns false', async () => {
        const wsClient = {ws: new Emitter()};
        acceptMessage.returns(false);
        const loggerSpy = sinon.spy(getLogger(services), 'debug');
        manager.appendClient(wsClient);
        await manager.onClientData(wsClient, {});
        expect(loggerSpy).calledOnce;
        expect(loggerSpy).calledWithMatch(/message was discarded/);
    });

    it('should close all clients when manager is closed', () => {
        const client = {id: 'client1', ws: new Emitter(), close: sinon.stub()};
        manager.appendClient(client);
        manager.close();
        expect(client.close.calledOnce).to.be.true;
        expect(manager.count()).to.equal(0);
    });


    it('should remove client on close', () => {
        const client1 = {
            id: 'client1',
            ws: new Emitter(),
            close() {
                this.ws.emit('close');
            }
        };
        let client2 = {id: 'client2', ws: new Emitter()};
        manager.appendClient(client1);
        manager.appendClient(client2);
        expect(manager.count()).to.equal(2);
        client1.close();
        expect(manager.count()).to.equal(1);
        expect(manager.getClient('client2')).to.equal(client2);
    });
});
