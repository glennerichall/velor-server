import {composeLoginWithToken} from "../contrib/api/composeLoginWithToken.mjs";
import {composeGetCsrfToken} from "../contrib/api/composeGetCsrfToken.mjs";
import {composeLogout} from "../contrib/api/composeLogout.mjs";
import {composeInitiateLoginWithOpenId} from "../contrib/api/composeInitiateLoginWithOpenId.mjs";
import {
    createAppServicesInstance,
    getServiceBinder,
    getServiceBuilder,
    SCOPE_REQUEST
} from "velor-services/injection/ServicesContext.mjs";
import {mergeDefaultApiOptions} from "velor-api/api/application/services/mergeDefaultApiOptions.mjs";
import {getResourceApi} from "velor-api/api/api/ResourceApi.mjs";
import {
    s_fetch,
    s_requestStore,
    s_urlProvider
} from "velor-api/api/application/services/serviceKeys.mjs";
import {getProvider} from "velor-services/application/services/baseServices.mjs";
import {MapArray} from "velor-utils/utils/map.mjs";
import {getFullHostUrls} from "../../application/services/constants.mjs";
import {ApiKeyApi} from "velor-contrib/api/ApiKeyApi.mjs";
import {doNotThrowOnStatusRule} from "velor-api/api/ops/rules.mjs";

export const api =
    async ({services, request, rest}, use) => {

        let urlProvider = {
            getUrl(name) {
                return this.urls[name];
            },
            urls: getFullHostUrls(services)
        };

        let fetch = {
            async send(url, options) {
                let context = getProvider(this)['context']();

                let method = options.method.toLowerCase();
                let req = request(context)[method](url);

                for (let [key, value] of options.headers.entries()) {
                    req.set(key, value);
                }

                if (options.body) {
                    req = req.send(options.body);
                }

                let response = await req;

                return {
                    ok: response.ok,
                    data: response.body,
                    body: response.body,
                    text: () => response.text,
                    status: response.status,
                    headers: {
                        get(key) {
                            return response.headers[key];
                        }
                    }
                }
            },
        }

        let apiServices = createAppServicesInstance(
            mergeDefaultApiOptions({
                factories: {
                    [s_urlProvider]: () => urlProvider,
                    [s_fetch]: () => fetch,
                    [s_requestStore]: () => new MapArray()
                }
            })
        );

        function getServicesForCurrentContext(context) {
            return getServiceBuilder(apiServices).clone()
                .addScope(SCOPE_REQUEST, {context})
                .done();
        }

        function createResourceApiWithContext(context = {}) {
            let clone = getServicesForCurrentContext(context);
            return getResourceApi(clone);
        }

        function createApiKeys(context) {
            let services = getServicesForCurrentContext(context);
            return getServiceBinder(services).createInstance(ApiKeyApi,
                doNotThrowOnStatusRule(400, 404, 403, 401));
        }

        await use({
            loginWithToken: composeLoginWithToken(services, request),
            initiateLoginWithOpenId: composeInitiateLoginWithOpenId(services, request, rest),
            getCsrfToken: composeGetCsrfToken(services, request),
            logout: composeLogout(services, request),
            services: apiServices,
            resources: createResourceApiWithContext,
            apiKeys: createApiKeys

        });
    }