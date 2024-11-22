import {getEnvValue} from "velor-services/injection/baseServices.mjs";
import {DATABASE_SCHEMA} from "velor-database/application/services/databaseEnvKeys.mjs";
import {composeStatements} from "../../database/composeStatements.mjs";

export function createStatementsInstance(services) {
    const schema = getEnvValue(services, DATABASE_SCHEMA);
    return composeStatements(schema);
}