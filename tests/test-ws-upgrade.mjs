import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {observeWsConnectionUpgrade} from "../initialization/observeWsConnectionUpgrade.mjs";
import sinon from "sinon";
import {isServiceAware} from "velor-services/injection/ServicesContext.mjs";

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
        wsClient, services, clock;

    beforeEach(async ({websocket}) => {
        ({
            manager, onUpgrade,
            wsSocket, req, head,
            wsServer, verifyClient,
            wsClient, services
        } = websocket);
        clock =  sinon.useFakeTimers({
            shouldClearNativeTimers: true, // Automatically clear native timers
        });
    })

    afterEach(async () => {
        clock.restore();
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

    it('should read remote address from headers if behind proxy', async () => {
        req.headers['x-forwarded-for'] = '192.168.1.1';
        await onUpgrade(req, wsSocket, head);
        expect(req.ip).to.eq('192.168.1.1');
    })

    it('should read remote address socket', async () => {
        req = {
            ...req,
            headers: [],
            socket: {
                remoteAddress: '12.12.12.12'
            }
        };
        await onUpgrade(req, wsSocket, head);
        expect(req.ip).to.eq('12.12.12.12');
    })

    it('should make service aware', async () => {
        expect(isServiceAware(req)).to.be.false
        await onUpgrade(req, wsSocket, head);
        expect(isServiceAware(req)).to.be.true;
    })

    describe('rate limiting', () => {
        it('should rate limit 3 connection attempts', async () => {
            verifyClient.returns(false);
            await onUpgrade(req, wsSocket, head);
            clock.tick(1000);

            await onUpgrade(req, wsSocket, head);
            clock.tick(1000);

            await onUpgrade(req, wsSocket, head);
            clock.tick(17_999);

            // deny too many requests
            wsSocket.write.resetHistory();
            await onUpgrade(req, wsSocket, head);
            expect(wsSocket.write).calledWith('HTTP/1.1 429 Too Many Requests\r\n\r\n');
        })

        it('should rate limit per ip, path', async () => {

            let req2 = {
                ...req,
                headers: [],
                socket: {
                    remoteAddress: '12.12.12.12'
                }
            };
            verifyClient.returns(false);
            await onUpgrade(req, wsSocket, head);
            clock.tick(1000);

            await onUpgrade(req, wsSocket, head);
            clock.tick(1000);

            // other client tries
            await onUpgrade(req2, wsSocket, head);
            clock.tick(17_999);

            wsSocket.write.resetHistory();
            await onUpgrade(req, wsSocket, head);
            expect(wsSocket.write).calledWith('HTTP/1.1 401 Unauthorized\r\n\r\n');
        })

        it('should rate limit attempts per 20 seconds', async () => {
            verifyClient.returns(false);
            await onUpgrade(req, wsSocket, head);
            clock.tick(1000);

            await onUpgrade(req, wsSocket, head);
            clock.tick(1000);

            await onUpgrade(req, wsSocket, head);
            clock.tick(18_000);

            wsSocket.write.resetHistory();
            await onUpgrade(req, wsSocket, head);

            expect(wsSocket.write).calledWith('HTTP/1.1 401 Unauthorized\r\n\r\n');
        })
    })


});
