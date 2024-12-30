import {
    URL_LOGIN,
    URL_LOGIN_FAILURE,
    URL_LOGIN_SUCCESS,
    URL_PASSPORT_CALLBACK
} from "velor-contrib/contrib/urls.mjs";

import {
    verifyAuthentication,
} from "../auth/verification.mjs";

import {composeRenderLoginFailure} from "../passport/composition/composeRenderLoginFailure.mjs";
import {composeGetAuthStrategy} from "../passport/composition/composeGetAuthStrategy.mjs";
import {composeRenderLoginSuccess} from "../passport/composition/composeRenderLoginSuccess.mjs";
import {initiateAuth} from "../passport/middlewares/initiateAuth.mjs";
import {authenticate} from "../passport/middlewares/authenticate.mjs";
import {createStrategies} from "../passport/strategies/createStrategies.mjs";
import {logout} from "../passport/handlers/logout.mjs";
import {composeCsrfProtection} from "../guards/composeCsrfProtection.mjs";
import {login} from "../passport/handlers/login.mjs";


export function createAuthConfiguration(services, providers) {

    const strategies = createStrategies(services, providers);
    const logo = '/resources/logo.svg';

    // strategy will be available from req.authStrategy
    const getAuthStrategy = composeGetAuthStrategy(strategies);
    let {csrfProtection} = composeCsrfProtection(services, {
        ignoredMethods: ['HEAD', 'OPTIONS']
    })

    return [
        {
            name: URL_LOGIN_SUCCESS,
            path: '/login_success',
            get: composeRenderLoginSuccess(logo)
        },

        {
            name: URL_LOGIN_FAILURE,
            path: '/login_failure',
            get: composeRenderLoginFailure(logo)
        },

        {
            // The user initiates the authentication process
            // If it is not redirected to a federated authenticator by the login strategy
            // then it will be considered authenticated and logged in, unless an error is thrown.
            name: URL_LOGIN,
            path: '/session/:provider',
            get: [
                csrfProtection,
                getAuthStrategy,
                initiateAuth
            ],
            delete: [
                verifyAuthentication,
                logout
            ]
        },

        {
            // Then, when the browser is redirected to the callback url,
            name: URL_PASSPORT_CALLBACK,
            path: '/redirect/:provider',
            get: [
                getAuthStrategy,
                authenticate,
                login
            ]
        }
    ];
}