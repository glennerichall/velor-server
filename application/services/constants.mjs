import {
    getConstants,
    getEnvValue,
    isDevelopment
} from "velor-services/application/services/baseServices.mjs";
import {
    PREFERENCES,
    URLS
} from "./constKeys.mjs";
import {
    BACKEND_URL,
    FULL_HOST_URLS
} from "./envKeys.mjs";

export function getUrls(serviceAware) {
    return getConstants(serviceAware)[URLS];
}

export function getFullHostUrl(serviceAware) {
    const fullHostUrls = getEnvValue(serviceAware, FULL_HOST_URLS);
    const backendUrl = getEnvValue(serviceAware, BACKEND_URL);

    if (serviceAware.query?.host === 'off' || !fullHostUrls && serviceAware.query?.host !== 'on') {
        return '';

    } else if (typeof fullHostUrls === 'string') {
        return fullHostUrls;

    } else if (typeof fullHostUrls === 'function') {
        return fullHostUrls();

    } else if (!backendUrl || isDevelopment(serviceAware)) {
        const port = !!serviceAware.port ? `:${serviceAware.port}` : '';
        const host = serviceAware.get('host');
        return `${serviceAware.protocol}://${host}${port}`;
    }

    return backendUrl;
}

export function getFullHostUrls(serviceAware) {
    const urls = getUrls(serviceAware);
    const hostUrl = getFullHostUrl(serviceAware);
    let fullHostUrls = {}
    for (let key in urls) {
        fullHostUrls[key] = hostUrl + urls[key];
    }
    return fullHostUrls;
}

export function getPreferencesConfigs(serviceAware) {
    return getConstants(serviceAware)[PREFERENCES] ?? {};
}