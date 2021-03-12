const router = require('express').Router();
const fileUpload = require('express-fileupload');
const axios = require('axios').default;
const crypto = require('crypto');
const fs = require('fs');
const util = require('util');
const assert = require('assert').strict;
const PoetrySystemJWT = require('../jwt');
const User = require('../db/models/User');
const HashRecord = require('../db/models/HashRecord');
const { poetryPersist } = require('../blockchain');

const readFile = util.promisify(fs.readFile);
const poetryJWT = new PoetrySystemJWT();

router.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/',
    limits: { filesize: 20480 * 25600 }, // 500mb
    parseNested: false
}));

// router.post('/', poetryJWT.middleware, async (req, res) => {
//     try {
//         const user = await User.findOne({ username: req.jwt.username }).exec();
//         assert.notDeepEqual(user.validated, false, 'User is not validated');
//         assert.notDeepEqual(user.customerId, null, 'User does not have a customerId');
//         assert.notDeepEqual(user.subscription, null, 'User does not have an active subscription');
//         assert.notDeepEqual(user.subscriptionId, null, 'User does not have an active subscription id');
//         const response = await axios.get(`${process.env.POETRY_PAYMENTS_URL}/products/${user.subscription}`);
//         const { maxRequests } = response.data;
//         assert.notDeepEqual(maxRequests >= true, true, 'User has hit their request quota');
//         const file = req.files.useTempFiles;
//         const data = await readFile(file);
//         const hash = crypto.createHash('sha256');
//         hash.setEncoding('hex');
//         hash.update(data);
//         hash.end();
//         const hashedData = hash.read();
//         const hashRecord = new HashRecord({
//             username: req.jwt.username,
//             hash: hashedData,
//             contact: address,
//             network: req.body.network,
//             fileName: req.files.file.name
//         });
//         await hashRecord.save();
//         res.status(200).json({ hashRecord });
//     } catch (error) {

//     }
// });

router.post('/', async (req, res) => {
    try {
        // const user = await User.findOne({ username: req.jwt.username }).exec();
        // assert.notDeepEqual(user.validated, false, 'User is not validated');
        // assert.notDeepEqual(user.customerId, null, 'User does not have a customerId');
        // assert.notDeepEqual(user.subscription, null, 'User does not have an active subscription');
        // assert.notDeepEqual(user.subscriptionId, null, 'User does not have an active subscription id');
        // const response = await axios.get(`${process.env.POETRY_PAYMENTS_URL}/products/${user.subscription}`);
        // const { maxRequests } = response.data;
        // assert.notDeepEqual(maxRequests >= true, true, 'User has hit their request quota');
        const file = req.files.file.tempFilePath;
        const data = await readFile(file);
        const hash = crypto.createHash('sha256');
        hash.setEncoding('hex');
        hash.update(data);
        hash.end();
        // const hashedData = hash.read();
        // const hashRecord = new HashRecord({
        //     username: req.jwt.username,
        //     hash: hashedData,
        //     contact: address,
        //     network: req.body.network,
        //     fileName: req.files.file.name
        // });
        // await hashRecord.save();
        res.status(200).json({ hash: hash.read() });
        poetryPersist({ username: 'sameerdewan', fileName: req.files.file.name, hashedData: hash.read() });
    } catch (error) {
        res.send({error});
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
