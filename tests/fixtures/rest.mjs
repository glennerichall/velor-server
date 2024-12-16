import {getExpressApp,} from "../../application/services/services.mjs";
import {setupServer} from "../../initialization/setupServer.mjs";

import {setupRoutes} from "../../initialization/setupRoutes.mjs";
import {getRoleDAO} from "velor-dbuser/application/services/services.mjs";

export const rest =
    async ({services}, use, testInfo) => {
        let application = getExpressApp(services);

        let _beforeAll = (req, res, next) => next();
        const beforeAll = (callback) => _beforeAll = callback;

        let _afterAll = (req, res, next) => next();
        const afterAll = (callback) => _afterAll = callback;

        const routes = setupRoutes(services);

        application
            .use((req, res, next) => {
                _beforeAll(req, res, next);
            })

            .use(routes)

            // this is only for tests
            .post('/validate-csrf', (req, res) => {
                res.sendStatus(200);
            })

            .use((req, res, next) => {
                _afterAll(req, res, next);
            });

        // setup must be called after routes have been mounted
        await setupServer(services);

        // create normal role
        await getRoleDAO(services).saveOne({name: 'normal'});


        await use({
            beforeAll,
            afterAll
        });
    }
