import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {observeWsConnectionUpgrade} from "../initialization/observeWsConnectionUpgrade.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();


describe('observeWsConnectionUpgrade', () => {
    let manager, onUpgrade,
        wsSocket, req, head,
        wsServer, verifyClient,
        wsClient;

    beforeEach(async ({websocket}) => {
        ({
            manager, onUpgrade,
            wsSocket, req, head,
            wsServer, verifyClient,
            wsClient
        } = websocket);
    })

    it('should return 503 if closed', async () => {
        expect(manager.isOpened).to.be.true;
        manager.close();
        expect(manager.isOpened).to.be.false;
        await onUpgrade(req, wsSocket, head);
        expect(wsSocket.write).calledWith('HTTP/1.1 503 Unavailable\r\n\r\n');
    })

    it('should handle server upgrade', async () => {
        await onUpgrade(req, wsSocket, head);
        expect(wsServer.handleUpgrade).calledOnce;
    })

    it('should emit connection on upgrade', async () => {
        await onUpgrade(req, wsSocket, head);
        expect(wsServer.emit).calledOnce;
        expect(wsServer.emit).calledWith('connection', wsClient, req);
    })

    it('should call verify client', async () => {
        await onUpgrade(req, wsSocket, head);
        expect(verifyClient).calledOnce;
    })

    it('should deny if verification fails', async () => {
        verifyClient.returns(false);
        await onUpgrade(req, wsSocket, head);
        expect(wsSocket.write).calledWith('HTTP/1.1 401 Unauthorized\r\n\r\n');
    })

    it('should respond 404 when no manager mounted on path', async () => {
        req.originalUrl = 'https://localhost:3000/there/is/no/ws/manager/here';
        await onUpgrade(req, wsSocket, head);
        expect(wsSocket.write).calledWith('HTTP/1.1 404 Not Found\r\n\r\n');
    })
});
