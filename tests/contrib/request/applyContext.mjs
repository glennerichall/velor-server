import {setCookies} from "./setCookies.mjs";
import {setCsrfToken} from "./setCsrf.mjs";
import {parseResponse} from "./parseResponse.mjs";

export function applyContext(req, context = {}) {

    const setContext = (req, ctx) => {
        let {
            cookies,
            csrf
        } = ctx;

        setCookies(req, cookies);
        setCsrfToken(req, csrf);
    };

    if (context instanceof Promise) {
        // the context is still not received from a previous request
        // just wait until it is received. When its received, since we
        // have hijacked the current request promise resolving, we set
        // the received context to the current request headers and then
        // we resolve the request promise using the original then method.
        let originalThen = req.then.bind(req);
        req.then = async (resolve, reject) => {
            let ctx = await context;
            setContext(req, ctx);
            originalThen(response => {
                parseResponse(response, ctx);
                resolve(response);
            }, reject);
        }
    } else {
        // If context is not a promise, directly set it into the req
        setContext(req, context);

        // capture the request response by hijacking the end
        // method of the stream
        const originalEnd = req.end.bind(req);
        req.end = callback =>
            originalEnd((err, response) => {
                response = parseResponse(response, context);
                callback(err, response);
            });
    }


    return req;
}