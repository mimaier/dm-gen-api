const {expressjwt:expressJwt} = require('express-jwt'); 

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    console.log(`${api}/users/login`);

    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            `/api/v1/users/login`,
            `/api/v1/users/register`,
            `/api/v1/users/subtractfreegeneration/:id&:count`,
        ]
    })
}
async function isRevoked(req, token){
    if(!token.payload.isAdmin) {
       return true;
    }
}

module.exports = authJwt