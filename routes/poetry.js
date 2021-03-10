const router = require('express').Router();
const fileUpload = require('express-fileupload');
const crypto = require('crypto');
const fs = require('fs');
const util = require('util');
const PoetrySystemJWT = require('../jwt');
const HashRecord = require('../db/models/HashRecord');

const readFile = util.promisify(fs.readFile);
const poetryJWT = new PoetrySystemJWT();

router.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

router.post('/', poetryJWT.middleware, async (req, res) => {
    try {
        const file = req.files.file.tempFilePath;
        const data = await readFile(file);
        const hash = crypto.createHash('sha256');
        hash.setEncoding('hex');
        hash.update(data);
        hash.end();
        const hashRecord = new HashRecord({
            username: req.jwt.username,
            hash: hash.read(),
            tx: '',
            contract: '',
            network: req.body.network,
            fileName: req.files.file.name
        });
        await hashRecord.save();
        res.status(200).json({ hashRecord });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/retrieve', async (req, res) => {
    try {
        const file = req.files.file.tempFilePath;
        const data = await readFile(file);
        const hash = crypto.createHash('sha256');
        hash.setEncoding('hex');
        hash.update(data);
        hash.end();
        const hashRecord = await HashRecord.findOne({ hash: hash.read() }).exec();
        if (!hashRecord) {
            return res.status(404).json({ error: 'Hash not found' });
        }
        res.status(200).json({ hashRecord });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
