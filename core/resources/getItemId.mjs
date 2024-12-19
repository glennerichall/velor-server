import {ITEM_PARAM} from "velor-api/api/api/ResourceApi.mjs";

export function getItemId(req) {
    return req.params[ITEM_PARAM];
}