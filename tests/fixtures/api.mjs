import {getFullHostUrls} from "../../application/services/requestServices.mjs";
import {getEnvValue} from "velor-services/injection/baseServices.mjs";
import {AUTH_TOKEN_SECRET} from "../../application/services/serverEnvKeys.mjs";
import {getTokenLoginUrl} from "velor-contrib/contrib/getUrl.mjs";
import {
    URL_CSRF,
    URL_LOGIN
} from "velor-contrib/contrib/urls.mjs";
import {mailEmitter} from "./mailerTransport.mjs";


export const api =
    async ({services, request, rest}, use) => {


        function onMagicLinkMailReceived(listener) {
            return new Promise((resolve, reject) => {
                mailEmitter.once('sendMail', async msg => {
                    try {
                        // this url will be called by fetch directly
                        const match = msg.text.match(/(?<url>https?:\/\/[\w-]+(\.[\w-]+)?(:\d+)?(\/\S*)?)/g)
                        const url = match[1];

                        if (listener instanceof Function) {
                            await listener(url, msg);
                        }
                        resolve(url, msg);
                    } catch (e) {
                        reject(e);
                    }
                })
            });
        }

        function loginWithToken({token, context} = {}) {
            let urls = getFullHostUrls(services);
            token = token ?? getEnvValue(services, AUTH_TOKEN_SECRET);

            if (!context) {
                context = getCsrfToken().then(response => response.context);
            }

            return request(context)
                .post(getTokenLoginUrl(urls))
                .set('Authorization', token);
        }

        async function logout(context) {
            const urls = getFullHostUrls(services);
            return request(context).delete(urls[URL_LOGIN]);
        }

        function getCsrfToken(context) {
            let urls = getFullHostUrls(services);
            return request(context).get(urls[URL_CSRF]);
        }

        await use({
            loginWithToken,
            logout,
            getCsrfToken,
            onMagicLinkMailReceived
        });
    }