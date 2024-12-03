import {getFullHostUrls} from "../../application/services/requestServices.mjs";
import {getEnvValue} from "velor-services/injection/baseServices.mjs";
import {
    AUTH_TOKEN_SECRET,
    COOKIE_SECRETS
} from "../../application/services/serverEnvKeys.mjs";
import {
    getMagicLinkLoginUrl,
    getTokenLoginUrl
} from "velor-contrib/contrib/getUrl.mjs";
import {
    URL_CSRF,
    URL_LOGIN,
    URL_LOGIN_SUCCESS
} from "velor-contrib/contrib/urls.mjs";
import {mailEmitter} from "./mailerTransport.mjs";
import {
    getClientProvider,
    getMessageBuilder
} from "velor-distribution/application/services/distributionServices.mjs";
import {EventQueue} from "../../core/EventQueue.mjs";
import {identOp} from "velor-utils/utils/functional.mjs";
import {RPC_REQUIRE_LOGIN} from "velor-contrib/api/rpc.mjs";
import {Emitter} from "velor-utils/utils/Emitter.mjs";
import {getChannelForWsId} from "../../distribution/channels.mjs";
import {sign} from 'cookie-signature';

export const api =
    async ({services, request, rest}, use) => {

        // simulate a connection to websocket
        let websocket = new Emitter({async: true});
        websocket.send = async function (data) {
            this.emit('message', data);
        };

        const mailerEventQueue = new EventQueue(mailEmitter);
        const webSocketEventQueue = new EventQueue(websocket);

        mailerEventQueue.initialize();
        webSocketEventQueue.initialize();

        function keepContext(response) {
            return response.context;
        }

        async function loginWithMagicLink(email) {
            // 1 - A request is made to backend to send an email with magic link

            // we first need a csrf token
            const urls = getFullHostUrls(services);
            const magicLinkLoginUrl = getMagicLinkLoginUrl(urls);
            const {context} = await getCsrfToken().expect(200);

            // we then need to connect to websocket
            // stub a websocket connection
            let wsId = 'a-ws-id-should-be-unique-and-crypto-random';
            await getClientProvider(services).subscribe(websocket, getChannelForWsId(wsId));

            // on the upgrade, we received the websocket id
            context.cookies.ws = 's:' + sign(wsId, getEnvValue(services, COOKIE_SECRETS));

            // do the request to send a magic link
            await request(context)
                .post(magicLinkLoginUrl)
                .send({email})
                .expect(201);

            // 2 - The email is received with url in message body (here in tests, the url parameter)
            const {url: urlInMagicLink} = await waitOnMagicLink();

            // 3- We click on the link received in the magic link email
            // from another browser, with no context.
            // Calling #then triggers the request to be sent by supertest.
            // The promise does not resolve until websocket replies 200.
            let emailLinkPromise = request().get(urlInMagicLink)
                .expect(302)
                .expect('location', urls[URL_LOGIN_SUCCESS])
                .then(identOp);

            // 4 - After receiving the email url request in 3, Backend will ask
            // browser through ws to make the login call using fetch,
            // so it can send back the session cookie to the browser.
            let data = await webSocketEventQueue.waitDequeue('message');

            // unpack websocket data
            // data = fromWsData(data);
            let message = getMessageBuilder(services).unpack(data);

            if (message.isCommand && message.command === RPC_REQUIRE_LOGIN) {

                // 5 - The frontend makes the call from within its session.
                const response = await request(context).get(url);

                // 6 - If the calls succeeds, the frontend replies to the rpc call
                // made through the ws.
                let status = response.status;
                if (response.status === 302) {
                    status = 200;
                }
                let reply = getMessageBuilder(services).newReply(message, {status});
                websocket.send(reply.buffer);
            }

            // 7 - The request from the email is redirected to login success page.
            await emailLinkPromise;
        }

        async function waitOnMagicLink() {
            let [msg] = await mailerEventQueue.waitDequeue('sendMail');

            // this url will be called by fetch directly
            const match = msg.text.match(/(?<url>(https?:\/)?\/[\w-]+(\.[\w-]+)?(:\d+)?(\/\S*)?)/g)
            const url = match[match.length - 1];

            return {
                url,
                msg
            };
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
            waitOnMagicLink,
            loginWithMagicLink
        });
    }