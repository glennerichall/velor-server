import {
    s_expressApp,
    s_server,
    s_userManager
} from "./serverServiceKeys.mjs";
import {UserManager} from "../../managers/UserManager.mjs";
import {s_databaseStatements} from "velor-database/application/services/databaseServiceKeys.mjs";
import {statements} from "../../database/statements.mjs";
import {createServerInstance} from "../factories/createServerInstance.mjs";
import express from "express";


export const serverFactories = {
    [s_userManager]: UserManager,
    [s_databaseStatements]: () => statements,
    [s_server]: createServerInstance,
    [s_expressApp]: () => express(),
}