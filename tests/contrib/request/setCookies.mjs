export    function setCookies(req, cookies) {
    if (cookies) {
        let header = Object.keys(cookies)
            .map(key => `${key}=${cookies[key]}`)
            .join(';');
        req = req.set('cookie', header);
    }
    return req;
}