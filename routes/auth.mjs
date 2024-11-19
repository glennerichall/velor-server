import {validateSession} from "../session/createSessionValidation.mjs";

import {
    URL_CONFIRM_EMAIL,
    URL_LOGIN,
    URL_LOGIN_FAILURE,
    URL_LOGIN_SUCCESS,
    URL_LOGOUT,
    URL_PASSPORT_CALLBACK
} from "velor-contrib/contrib/urls.mjs";

import {
    verifyAuthentication,
    verifyCsrfToken
} from "../auth/verification.mjs";

import {composeRenderLoginFailure} from "../passport/composition/composeRenderLoginFailure.mjs";
import {composeGetAuthStrategy} from "../passport/composition/composeGetAuthStrategy.mjs";
import {composeRenderLoginSuccess} from "../passport/composition/composeRenderLoginSuccess.mjs";
import {composePostConfirmEmail} from "../passport/composition/composePostConfirmEmail.mjs";
import {composeConfirmEmailCallback} from "../passport/composition/composeConfirmEmailCallback.mjs";
import {initiateAuth} from "../passport/middlewares/initiateAuth.mjs";
import {authenticate} from "../passport/middlewares/authenticate.mjs";
import {createStrategies} from "../passport/strategies/createStrategies.mjs";
import {logout} from "../passport/handlers/logout.mjs";
import {login} from "../passport/handlers/login.mjs";


export function createAuthConfiguration(services, providers) {

    const strategies = createStrategies(services, providers);
    const logo = '/resources/logo.svg';

    // strategy will be available from req.authStrategy
    const getAuthStrategy = composeGetAuthStrategy(strategies);

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

        // {
        //     name: URL_CONFIRM_EMAIL,
        //     path: '/email/confirm',
        //     // sending an email confirmation with a link to GET /email/confirm
        //     post: [
        //         validateSession,
        //         verifyAuthentication,
        //         verifyCsrfToken,
        //         composePostConfirmEmail(
        //             email.sendEmail,
        //             email.clientSecret,
        //             email.redirectUrl,
        //             user.getUser,
        //             user.getProfile,
        //             user.getLoginAuth
        //         )
        //     ],
        //     // receiving the link from the confirmation email
        //     get: composeConfirmEmailCallback(
        //         email.clientSecret,
        //         database.getTokens,
        //         database.createToken
        //     )
        // },

        {
            name: URL_LOGOUT,
            path: '/logout',
            post: [
                validateSession,
                verifyAuthentication,
                verifyCsrfToken,
                logout
            ]
        },

        {
            // The user initiates the authentication process
            // If it is not redirected to a federated authenticator by the login strategy
            // then it will be considered authenticated and logged in, unless an error is thrown.
            name: URL_LOGIN,
            path: '/login/:provider',
            get: [
                getAuthStrategy,
                initiateAuth
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