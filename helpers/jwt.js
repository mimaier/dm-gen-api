const {expressjwt:expressJwt} = require('express-jwt'); 

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            `${api}/users/login`,
            `${api}/users/register`,
        ]
    })
}
async function isRevoked(req, token){
    if(!token.payload.isAdmin) {
       return true;
    }
}

module.exports = authJwt