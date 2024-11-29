import {getFullHostUrls} from "../../application/services/requestServices.mjs";
import {getEnvValue} from "velor-services/injection/baseServices.mjs";
import {AUTH_TOKEN_SECRET} from "../../application/services/serverEnvKeys.mjs";
import {
    getMagicLInkLoginUrl,
    getTokenLoginUrl
} from "velor-contrib/contrib/getUrl.mjs";
import {
    URL_CSRF,
    URL_LOGIN
} from "velor-contrib/contrib/urls.mjs";
import {mailEmitter} from "./mailerTransport.mjs";
import {getMessageBuilder} from "velor-distribution/application/services/distributionServices.mjs";


export const api =
    async ({services, request, rest}, use) => {

        function sendMagicLink(email) {
            const urls = getFullHostUrls(services);
            const url = getMagicLInkLoginUrl(urls);
            const context = getCsrfToken();

            return request(context)
                .post(url)
                .send({email})
                .expect(201)
                .then(response => response.context);
        }

        function handleWebSocketMessage(websocket, url) {
            return async data => {
                data = fromWsData(data);

                let message = getMessageBuilder(services).unpack(data);

                if (message.isCommand && message.command === RPC_REQUIRE_LOGIN) {

                    // 5 - The frontend makes the call from within its session.
                    const response = await this.request().get(url);

                    // 6 - If the calls succeeds, the frontend replies to the rpc call
                    //     made through the ws.
                    let status = response.status;
                    if (response.status === 302) {
                        status = 200;
                    }

                    let reply = getMessageBuilder(services).newReply(message, {status});
                    websocket.send(reply.buffer);
                }
            };
        }

        async function loginWithMagicLink(email, onMessage) {
            const linkPromise = onMagicLinkMailReceived(async (url, msg) => {

                // 2 - The email is received with url in message body (here in tests, the url parameter)


                // 4 - After receiving the email url request, Backend will ask frontend through ws to make the login call
                //     so it can send back the session cookie to the browser. Register a RPC handler to make the login call
                //     from the frontend and reply the result to backend.
                websocket.on('message', handleWebSocketMessage(websocket, url));

                // 3.1 - The url in the link will be called by fetching directly (no session) since it may be called
                //     from within another browser or even another computer.
                const accept = () => request().get(url);

                // 3.2 - We wait that the backend receives and responds from the url call
                let response;
                if (onMessage instanceof Function) {
                    response = await onMessage(url, msg, accept, this);
                } else {
                    response = await accept();
                }
                // 7 - The request from the email is redirected to login success page.
                return response;
            });


            // 1 - A request is made to backend to send an email with magic link
            const requestPromise = sendMagicLink(email);
            const [response] = await Promise.all([requestPromise, linkPromise]);
            return response;
        }

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
            onMagicLinkMailReceived,
            loginWithMagicLink
        });
    }