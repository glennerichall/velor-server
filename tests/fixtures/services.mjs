import {DATABASE_CONNECTION_STRING} from "velor-database/application/services/databaseEnvKeys.mjs";


export const services = [
    async ({}, use, testInfo) => {



        use(services);
    },
    {scope: 'worker'}
]