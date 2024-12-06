export function parseCookies(response) {
    const rawCookies = response.header['set-cookie'];
    let parsedCookies = {};
    rawCookies?.forEach((rawCookie) => {
        const cookiePart = rawCookie.split(';')[0];

        // split only to the first = because value may be a base 64 terminated with a =
        const eqIndex = cookiePart.indexOf('=');
        const key = cookiePart.substring(0, eqIndex);
        const value = cookiePart.substring(eqIndex + 1);
        parsedCookies[key] = value;
    });
    return parsedCookies;
}
