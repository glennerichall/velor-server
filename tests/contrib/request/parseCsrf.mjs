export function parseCsrf(response) {
    let csrf;
    if (response.body?.csrfToken) {
        csrf = response.body.csrfToken
    }
    return csrf;
}