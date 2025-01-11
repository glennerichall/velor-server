import {getExpressApp,} from "../../application/services/services.mjs";
import {setupServer} from "../../initialization/setupServer.mjs";

import {setupRoutes} from "../../initialization/setupRoutes.mjs";

export const rest =
    async ({services}, use, testInfo) => {
        let application = getExpressApp(services);

        let beforeAllRoutesInTest = (req, res, next) => next();
        const beforeAll = (callback) => beforeAllRoutesInTest = callback;

        let afterAllRoutesInTest = (req, res, next) => next();
        const afterAll = (callback) => afterAllRoutesInTest = callback;

        const routes = setupRoutes(services);

        application
            .use((req, res, next) => {
                // do not use as arg directly,
                // beforeAllRoutesInTest may be changed while running test
                beforeAllRoutesInTest(req, res, next);
            })

            .use(routes)

            // this is only for tests
            .post('/validate-csrf', (req, res) => {
                res.sendStatus(200);
            })

            .use((req, res, next) => {
                // do not use as arg directly,
                // afterAllRoutesInTest may be changed while running test
                afterAllRoutesInTest(req, res, next);
            });

        // setup must be called after routes have been mounted
        await setupServer(services);

        await use({
            beforeAll,
            afterAll
        });

    }
