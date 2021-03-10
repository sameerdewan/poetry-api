const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

class PoetrySystemJWT {
    constructor() {
        if (process.env.ENV === 'DEVELOPMENT') {
            this.privateKey = fs.readFileSync(path.resolve(__dirname, '../development/keys/private.key'));
            this.publicKey = fs.readFileSync(path.resolve(__dirname, '../development/keys/public.key'));
        }
        this.settings = {
            algorithm: 'HS256',
            expiresIn: "1d"
        };
    }
    
    signPayloadGetToken(payload) {
        return jwt.sign(payload, this.privateKey, this.settings);
    }

    verifyToken(token) {
        return jwt.verify(token, this.publicKey);
    }
}

module.exports = PoetrySystemJWT;
