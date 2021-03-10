const router = require('express').Router();
const fileUpload = require('express-fileupload');
const crypto = require('crypto');
const fs = require('fs');
const util = require('util');
const PoetrySystemJWT = require('../jwt');

const readFile = util.promisify(fs.readFile);
const poetryJWT = new PoetrySystemJWT();

router.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

router.post('/', async (req, res) => {
    try {
        const file = req.files.file.tempFilePath;
        const hash = crypto.createHash('sha256');
        const data = await readFile(file);
        hash.setEncoding('hex');
        hash.update(data);
        hash.end();
        res.status(200).json({ hash: hash.read() })
    } catch (error) {
        console.log({error})
    }
});

module.exports = router;
