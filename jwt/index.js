const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

class PoetrySystemJWT {
    constructor() {
        if (process.env.ENV === 'DEVELOPMENT') {
            this.privateKey = fs.readFileSync(path.resolve(__dirname, '../../../../../appdata/keys/private.key'));
            this.publicKey = fs.readFileSync(path.resolve(__dirname, '../../../../../appdata/keys/public.key'));
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

    middleware(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        try {
            const user = this.verifyToken(token);
            req.user = user;
        } catch (error) {
            res.status(403).json({ error: error.message });
        }
        next();
    }
}

module.exports = PoetrySystemJWT;
 