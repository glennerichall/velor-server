import {parseCookies} from "./parseCookies.mjs";
import {parseCsrf} from "./parseCsrf.mjs";

export function parseResponse(response, context) {
    let cookies, csrf;
    if (response) {
        cookies = {
            ...context?.cookies,
            ...parseCookies(response)
        };
        csrf = parseCsrf(response) ?? context?.csrf;
    }
    response.context = {
        cookies,
        csrf
    };
    return response;
}