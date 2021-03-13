const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

class PoetrySystemJWT {
    constructor() {
        if (process.env.ENV === 'DEVELOPMENT') {
            this.privateKey = fs.readFileSync(path.resolve(__dirname, '../../../../../appdata/keys/private.key'), 'utf8');
            this.publicKey = fs.readFileSync(path.resolve(__dirname, '../../../../../appdata/keys/public.key'), 'utf8');
        }
        this.signPayloadGetToken = this.signPayloadGetToken.bind(this);
        this.verifyToken = this.verifyToken.bind(this);
        this.middleware = this.middleware.bind(this);
    }
    
    signPayloadGetToken(payload) {
        return jwt.sign(payload, this.privateKey, { algorithm: 'RS256', expiresIn: '1d' });
    }

    verifyToken(token) {
        return jwt.verify(token, this.publicKey, { algorithms: ['RS256'] });
    }

    middleware(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        try {
            req.jwt = this.verifyToken(token);
            next();
        } catch (error) {
            res.status(403).json({ error: error.message });
        }
    }
}

module.exports = PoetrySystemJWT;
