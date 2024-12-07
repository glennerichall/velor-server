import sinon from "sinon";
import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {
    monitorClient,
    monitorServer
} from "../sockets/core/monitorClient.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('WebSocket Monitoring with Sinon', () => {
    let mockWebSocket;
    let mockWSServer;

    beforeEach(() => {
        mockWebSocket = {
            on: sinon.spy(),
            ping: sinon.spy(),
            terminate: sinon.spy(),
            isAlive: true,
        };

        mockWSServer = {
            on: sinon.spy(),
            clients: [mockWebSocket],
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('monitorClient', () => {
        it('should set up heartbeat listeners for the client', () => {
            monitorClient(mockWebSocket);

            expect(mockWebSocket.on).calledWith('open');
            expect(mockWebSocket.on).calledWith('ping');
            expect(mockWebSocket.on).calledWith('close');
        });

        it('should terminate the client if heartbeat is missed', () => {
            monitorClient(mockWebSocket);

            const heartbeatCallback = mockWebSocket.on.getCall(1).args[1];
            sinon.stub(global, 'setTimeout').callsFake((callback, delay) => {
                expect(delay).to.equal(31000);
                callback(); // Simulate timeout
                expect(mockWebSocket.terminate).calledOnce;
            });

            heartbeatCallback(); // Simulate heartbeat
        });

        it('should clear timeout on client close', () => {
            monitorClient(mockWebSocket);

            const closeCallback = mockWebSocket.on.getCall(2).args[1];
            const clearTimeoutSpy = sinon.spy(global, 'clearTimeout');

            closeCallback(); // Simulate close
            expect(clearTimeoutSpy.calledOnce).to.be.true;
        });
    });

    describe('monitorServer', () => {
        it('should set up connection and pong listeners for the server', () => {
            monitorServer(mockWSServer);

            expect(mockWSServer.on.calledWith('connection')).to.be.true;

            const connectionCallback = mockWSServer.on.getCall(0).args[1];
            const mockClient = { on: sinon.spy(), isAlive: true };
            connectionCallback(mockClient);

            expect(mockClient.on.calledWith('pong')).to.be.true;
        });

        it('should ping clients at regular intervals', () => {
            const clock = sinon.useFakeTimers();
            monitorServer(mockWSServer);

            clock.tick(30000); // Simulate the interval
            expect(mockWebSocket.ping.calledOnce).to.be.true;
            clock.restore();
        });

        it('should terminate inactive clients during heartbeat', async () => {
            const clock = sinon.useFakeTimers();
            mockWebSocket.isAlive = false;
            monitorServer(mockWSServer);

            clock.tick(30000); // Simulate the interval
            expect(mockWebSocket.terminate.calledOnce).to.be.true;
            clock.restore();
        });

        it('should clear interval on server close', () => {
            const clearIntervalSpy = sinon.spy(global, 'clearInterval');
            monitorServer(mockWSServer);

            const closeCallback = mockWSServer.on.getCall(1).args[1];
            closeCallback(); // Simulate server close
            expect(clearIntervalSpy.calledOnce).to.be.true;
        });
    });
});

