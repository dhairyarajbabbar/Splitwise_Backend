const jwt = require('jsonwebtoken');

async function getUser(token) {
    if (!token || token === 'undefined') return null;
    const mysecretkey = "itsmysecretkey";
    return jwt.verify(token, mysecretkey);
}
async function restricttologgedinusersonly(req, res, next) {
    console.log("headers: ", req.headers);
    console.log("cookies: ", req.cookies);
    if (!req.cookies || !req.cookies.accessToken) {
        // Send an error response instead of redirecting
        console.log(req.headers.cookies);
        return res.status(401).json({ error: 'Unauthorized - Access Token missing' });
    }
    const useruid = req.cookies.accessToken;
    console.log(useruid);
    const user = await getUser(useruid);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized - Invalid Access Token' });
    }
    req.user = user;
    next();
}

module.exports = {
    restricttologgedinusersonly,
};
