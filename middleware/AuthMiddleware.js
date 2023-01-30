const jwt = require('jsonwebtoken')

const authorizationMiddleware = (req,res,next)=>{
    const token = req.cookies.access_token;
    if(!token)
    {
        console.log('Not authorized');
        res.status(403).redirect('/users/login');
    }
    try{
        const user = jwt.verify(token, process.env.SECRET);
        const username = user;
        req.username = username;
        return next();
    } catch {
        console.log('Not authorized');
        res.status(403).redirect('/users/login');
    }
}

module.exports = {authorizationMiddleware}