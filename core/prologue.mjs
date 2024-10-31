import cookieSession from "cookie-session";
import corsMiddleware from "cors";

export const pauseHandler = (req, res, next) => {
    if (req.app.get('paused')) {
        return res.status(503).send('Server is temporarily unavailable.');
    }
    next();
}

export const createSessionParserInstance = ({secret1, secret2, sameSite}) => {
    let now = new Date();

    return cookieSession({
        name: 'session',
        keys: [
            secret1,
            secret2
        ],
        expires: new Date(now.getFullYear() + 100, now.getMonth(), now.getDate()),
        sameSite,
        secure: true,
    });
};

export const corsProvider = ({allowCors}) => {
    return corsMiddleware(
        {
            origin: allowCors.split(';'),
            credentials: true
        }
    );
};
