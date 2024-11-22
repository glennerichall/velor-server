import {getCreateSql} from "./getCreateSql.mjs";

let sql = await getCreateSql(process.env.SCHEMA ?? "@{SCHEMA}");
console.log(sql);