import {composeLoginWithToken} from "../contrib/api/composeLoginWithToken.mjs";
import {composeGetCsrfToken} from "../contrib/api/composeGetCsrfToken.mjs";
import {composeLogout} from "../contrib/api/composeLogout.mjs";
import {composeInitiateLoginWithOpenId} from "../contrib/api/composeInitiateLoginWithOpenId.mjs";
import {
    createAppServicesInstance,
    getServiceBuilder,
    SCOPE_REQUEST
} from "velor-services/injection/ServicesContext.mjs";
import {mergeDefaultApiOptions} from "velor-api/api/application/services/mergeDefaultApiOptions.mjs";
import {getResourceApi} from "velor-api/api/api/ResourceApi.mjs";
import {
    s_fetch,
    s_urlProvider
} from "velor-api/api/application/services/apiServiceKeys.mjs";
import {getProvider} from "velor-services/injection/baseServices.mjs";
import {getFullHostUrls} from "../../application/services/requestServices.mjs";

export const api =
    async ({services, request, rest}, use) => {

        let apiServices = createAppServicesInstance(
            mergeDefaultApiOptions({
                factories: {
                    [s_urlProvider]: () => {
                        return {
                            getUrl(name) {
                                return this.urls[name];
                            },
                            urls: getFullHostUrls(services)
                        };
                    },
                    [s_fetch]: {
                        scope: SCOPE_REQUEST,
                        factory: (services) => {
                            return {
                                async send(url, options) {
                                    let context = getProvider(services)['context']();
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
                        }
                    }
                }
            })
        );

        function createResourceApiWithContext(context) {
            let clone = getServiceBuilder(apiServices).clone()
                .addScope(SCOPE_REQUEST, {context})
                .done();
            return getResourceApi(clone);
        }

        await use({
            loginWithToken: composeLoginWithToken(services, request),
            initiateLoginWithOpenId: composeInitiateLoginWithOpenId(services, request, rest),
            getCsrfToken: composeGetCsrfToken(services, request),
            logout: composeLogout(services, request),
            services: apiServices,
            resources: createResourceApiWithContext,
        });
    }