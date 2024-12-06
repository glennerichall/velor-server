import * as cheerio from 'cheerio';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function parseCookies(response) {
    const raw = response.headers.get('set-cookie').split(',');
    return raw.map((entry) => {
        const parts = entry.split(';');
        const cookiePart = parts[0];
        return cookiePart;
    }).join(';');
}

export async function loginToKeycloak(initiatingRequestResponse, username, password) {

    let loginPageUrl = initiatingRequestResponse.headers['location'];

    // Step 1: Fetch the login page
    const response = await fetch(loginPageUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch login page: ${response.statusText}`);
    }
    const html = await response.text();

    // Extract cookies from the response
    // const rawCookies = response.headers.get('set-cookie');

    const cookies = parseCookies(response);

    // Step 2: Parse the HTML to extract the form
    const $ = cheerio.load(html);

    // Assuming there's only one form in the page or you can target it with a selector
    const form = $('form');
    const actionUrl = form.attr('action'); // Extract the action attribute of the form
    const method = form.attr('method') || 'POST'; // Default to POST if method is not specified

    // Collect all input fields and their values
    const formData = new URLSearchParams();
    form.find('input').each((_, input) => {
        const name = $(input).attr('name');
        const value = $(input).attr('value') || '';
        if (name) {
            formData.append(name, value);
        }
    });

    // Add the username and password to the form data
    formData.set('username', username);
    formData.set('password', password);

    // Step 3: Determine the full URL for the form action
    const actionFullUrl = new URL(actionUrl, loginPageUrl).href;

    // Step 4: Submit the form
    return await fetch(actionFullUrl, {
        method: method.toUpperCase(),
        redirect: "manual",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookies, // Include the extracted cookies
        },
        body: formData,
    });


}