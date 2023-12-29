const jwt=require('jsonwebtoken');
async function getUser(token){
    if(!token || token==='undefined')   return null;
    const mysecretkey="itsmysecretkey";
    return jwt.verify(token, mysecretkey);
}
async function restricttologgedinusersonly(req, res, next) {
    console.log(req.cookies);
    if (!req.cookies || !req.cookies.accessToken) {
        // console.log("hi from restricttoLoggedInUserOnly");
        return res.redirect("/login");
    }
    const useruid = req.cookies.accessToken;
    const user = await getUser(useruid);
    if(!user){
        return res.redirect("/login");
    }
    req.user = user;
    next();
}

module.exports = {
    restricttologgedinusersonly,
};
