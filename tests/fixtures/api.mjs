import {composeLoginWithToken} from "../contrib/api/composeLoginWithToken.mjs";
import {composeGetCsrfToken} from "../contrib/api/composeGetCsrfToken.mjs";
import {composeLogout} from "../contrib/api/composeLogout.mjs";
import {composeInitiateLoginWithOpenId} from "../contrib/api/composeInitiateLoginWithOpenId.mjs";

export const api =
    async ({services, request, rest}, use) => {

        await use({
            loginWithToken: composeLoginWithToken(services, request),
            initiateLoginWithOpenId: composeInitiateLoginWithOpenId(services, request, rest),
            getCsrfToken: composeGetCsrfToken(services, request),
            logout: composeLogout(services, request),
        });
    }