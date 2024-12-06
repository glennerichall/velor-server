export function setCsrfToken(req, csrf) {
    if (csrf) {
        return req.set('x-csrf-token', csrf);
    }
    return req;
}