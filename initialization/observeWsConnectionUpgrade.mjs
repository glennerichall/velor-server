import {
    getRateLimiter,
    getServer,
    getWsManagerProvider
} from "../application/services/serverServices.mjs";
import {getLogger} from "velor-services/injection/services.mjs";
import {makeRequestScope} from "../core/makeRequestScope.mjs";
import {limitByPathAndIp} from "../guards/rate/rateLimiterCreation.mjs";
import {socketConnectionUpgradeLimiter} from "../guards/rate/limiterConfigs.mjs";
import {chainHandlers} from "../core/chainHandlers.mjs";

function composeConformRequest(services) {

    return (req, res, next) => {
        const forwardedFor = req.headers['x-forwarded-for'];

        // Get actual client ip if behind reverse proxy
        req.ip = forwardedFor ? forwardedFor.split(',')[0].trim() :
            req.socket.remoteAddress;

        // api from websocket are not patched with custom properties
        // when bootstrapped. Inject the services into the request so
        // authentication can be done.
        makeRequestScope(services, req);

        next();
    };
}

function composeGuardRequest(services) {
    const rateLimiter = getRateLimiter(services, socketConnectionUpgradeLimiter);

    return async (req, res, next) => {
        try {
            const key = limitByPathAndIp(req);
            await rateLimiter.consume(key, 1);
            next();
        } catch (e) {
            return res.status(429).send("Too Many Requests");
        }
    }
}

function composeGetWsManager(services) {
    return (req, res, next) => {
        let manager = getWsManagerProvider(services).getFromRequest(req);
        if (!manager) {
            return res.status(404).send("Not Found");
        }
        req.manager = manager;
        next();
    }
}

function composeResponse(services) {
    return wss => {
        return {
            status(code) {
                this.code = code;
                return this;
            },

            send(message) {
                // manually respond a http message
                getLogger(services).debug(`WSS connection refused with status[${this.code}] message: ${this.message}`);
                wss.write(`HTTP/1.1 ${this.code} ${message}\r\n\r\n`);
                wss.destroy();
            }
        }
    };
}

async function verifyClient(req, res, next) {
    const {manager} = req;
    let response = await manager.verifyClient(req, req.wss, req.head);
    if (response !== true) {
        return res.status(response.status).send(response.message);
    }
    next();
}

function handleUpgrade(req, res) {
    const {manager, wss, head} = req;
    manager.handleUpgrade(req, wss, head);
}

export function observeWsConnectionUpgrade(services) {
    const server = getServer(services);
    const conformRequest = composeConformRequest(services);
    const guardRequest = composeGuardRequest(services);
    const getWsManager = composeGetWsManager(services);
    const getResponse = composeResponse(services);

    server.on('upgrade', async (req, wss, head) => {
        let res = getResponse(wss);
        req.wss = wss;
        req.head = head;

        await chainHandlers(
            conformRequest,
            guardRequest,
            getWsManager,
            verifyClient,
            handleUpgrade
        )(req, res);

    });
}