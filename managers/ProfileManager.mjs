import jwt from 'jsonwebtoken';
import crypto from "crypto";
import {
    URL_AVATAR,
    URL_CONFIRM_EMAIL,
    URL_FILES,
    URL_PREFERENCE
} from "../../shared/constants/urls.mjs";
import axios from "axios";

async function createJwt(authId, content, ZUPFE_AUTH_EMAIL_CLIENT_SECRET, ttl = 60 * 10 /* 10 minutes */) {
    const token = jwt.sign({
            authId,
            iat: Math.floor(Date.now() / 1000),
            ...content
        },
        ZUPFE_AUTH_EMAIL_CLIENT_SECRET,
        {
            expiresIn: ttl,
            subject: 'email validation'
        });
    return token;
}

export async function validateConfirmationLink(database, token, ZUPFE_AUTH_EMAIL_CLIENT_SECRET) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, ZUPFE_AUTH_EMAIL_CLIENT_SECRET,
            async (err, decoded) => {
                if (err) {
                    reject(new Error(err.message));
                } else {
                    const existing = await database.authTokens.queryTokensForAuth(decoded.authId);
                    const expiration = new Date(decoded.exp * 1000);

                    for (let tok of existing) {
                        if (tok.value === token) {
                            reject(new Error('token already used'));
                            return;
                        }
                    }

                    await database.authTokens.createToken(decoded.authId, {
                        expiration,
                        value: token
                    });

                    resolve(decoded);
                }
            })
    });
}

export class ProfileManager {
    constructor(preferences, urls, mailer, database, env = process.env) {
        this._preferences = preferences;
        this._urls = urls;
        this._mailer = mailer;
        this._database = database;
        this._env = env;
    }

    async getAvatar(user) {
        throw new Error('Not implemented');
        // return await this.getAvatarStream(userId);
    }

    async getAvatarStream(user) {
        const auth = await this.getLoginAuth(user);
        const avatar = auth.avatar;
        const hash = crypto.createHash('md5').update(auth.email).digest("hex");

        // we need to transmit Cross-Origin-Resource-Policy header
        // since gravatar don't
        const url = `https://www.gravatar.com/avatar/${hash}?s=32&d=404`;

        try {
            const response = await axios({
                method: 'get',
                url,
                responseType: 'stream'
            });

            return response.data;
        } catch (e) {
        }

        try {
            const response = await axios({
                method: 'get',
                url: avatar,
                responseType: 'stream'
            })
            return response.data;
        } catch (e) {
            return null;
        }
    }

    async getLoginAuth(user) {
        let loginAuth = user.loginAuth;
        if (!loginAuth) {
            loginAuth = await this._database.auths
                .queryAuthById(user.primary_auth_id);
        }
        return loginAuth;
    }

    async getProfile(user) {
        let auth = await this.getLoginAuth(user);

        const avatar = this._urls[URL_AVATAR];

        const files = this._urls[URL_FILES];
        const preferences = this._urls[URL_PREFERENCE];

        const prefProfile = await this._preferences.getProfile(user);

        const prefProfileEmpty = Object.keys(prefProfile).length === 0

        let lastLogins = await this._database.users.queryForLastLogin(user.id);
        if (lastLogins.length >= 1) {
            lastLogins = lastLogins.map(login => login.date.toISOString())
        }

        let roles = await this._database.acl.queryRolesForUser(user.id);
        if (roles.length >= 1) {
            roles = roles.map(role => role.name);
        }

        let displayName = auth.displayname,
            firstName = auth.firstname,
            lastName = auth.lastname,
            email = auth.email,
            loginEmail = auth.email;

        let emailConfirmed = false;

        if (!prefProfileEmpty) {
            firstName = prefProfile.firstName;
            lastName = prefProfile.lastName;
            displayName = `${firstName} ${lastName}`;
            email = prefProfile.email;
            emailConfirmed = prefProfile.confirmed;
        }

        return {
            displayName,
            firstName,
            lastName,
            email,
            profileAccepted: !prefProfileEmpty,
            emailConfirmed,

            avatar,

            lastLogins,
            loginEmail,
            provider: auth.provider,
            files,
            preferences,

            roles
        };
    }

    async sendConfirmationEmail(user) {
        const profile = await this._preferences.getProfile(user);
        if (!profile) return null;
        if (profile.confirmed) {
            return false;
        }

        let loginAuth = await this.getLoginAuth(user);
        const email = profile.email;

        const ttl = 60 * 10;
        const token = await createJwt(loginAuth.id, {email, userId: user.id},
            this._env.ZUPFE_AUTH_EMAIL_CLIENT_SECRET, ttl);
        const redirectUrl = this._urls[URL_CONFIRM_EMAIL];
        const requestId = crypto.randomInt(10000);
        const content = `Please confirm your email by following the link below.
Your request id is ${requestId}.

${redirectUrl}?token=${token}

Link can only be used once and will expire in ${ttl / 60} minutes
`;
        const ok = await this._mailer.sendMail(email, 'ZupFe email confirmation', content);
        if (!ok) {
            throw new Error('Unable to send mail');
        }
        return requestId;
    }

    async validateEmailConfirmation(user, token) {
        const data = await validateConfirmationLink(this._database, token,
            this._env.ZUPFE_AUTH_EMAIL_CLIENT_SECRET);

        // link may have been clicked from another browser or session
        // so get the current user from token.
        if(!user) {
            user = await this._database.users.queryForUserById(data.userId);
        }

        if(!user) {
            throw new Error('Unable to find user for confirmation link');
        }

        const profile = await this._preferences.getProfile(user);

        if (!profile) {
            throw new Error('Unable to find current profile preferences');
        } else if (profile.confirmed) {
            throw new Error('Email was already confirmed');
        }

        profile.confirmed = true;
        await this._preferences.setProfile(user, profile);
        return profile;
    }
}