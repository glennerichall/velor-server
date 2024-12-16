import {
    URL_ADMIN,
    URL_SYSTEM
} from "velor-contrib/contrib/urls.mjs";

export async function stripUrls(req, urls) {
    let needsAuth = [URL_ADMIN, URL_SYSTEM];

    let keys = Object.keys(urls)
        .filter(key => needsAuth.some(x => key.startsWith(x)));

    const method = '*';

    for (let key of keys) {
        const pathname = new URL(urls[key], 'http://example.com').pathname;
        const isAuthorized = await isRouteAuthorized(req, {pathname, method});

        if (!isAuthorized) {
            delete urls[key];
        }
    }
    return urls;
}