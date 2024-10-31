export class MagicLinkTokenStorage {
    #database;

    constructor(database) {
        this.#database = database;
    }

    async set(auth, value) {
        const tokens = await this.#database.queryTokensForAuth(auth.id);
        let promises = [];
        const tokenByValue = {};

        // clear expired tokens
        for (let token of tokens) {
            if (!value[token.value]) {
                const p = this.#database.deleteToken(token.id);
                promises.push(p);
            }
            tokenByValue[token.value] = token;
        }
        await Promise.all(promises);
        promises = [];

        // add new tokens
        for (let token in value) {
            if (!tokenByValue[token]) {
                const p = this.#database.createToken(auth.id, {
                    value: token,
                    expiration: new Date(value[token] * 1000)
                });
                promises.push(p);
            }
        }
        return Promise.all(promises);
    }

    async get(auth) {
        const tokens = await this.#database.queryTokensForAuth(auth.id);
        return tokens.reduce((prev, cur) => {
            prev[cur.value] = cur.expiration;
            return prev;
        }, {});
    }

    async delete(auth) {
        return this.#database.deleteTokensForUser(auth.id);
    }

}