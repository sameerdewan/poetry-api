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

const readFile = util.promisify(fs.readFile);
const poetryJWT = new PoetrySystemJWT();

function getContractData() {
    if (process.env.ENV === 'DEVELOPMENT') {
        const { abi, address } = require(path.resolve(__dirname, '../../../../../appdata/contractData.json'));
        return { abi, address };
    } 
    else if (process.env.ENV === 'PRODUCTION') { } 
    else { throw new Error('environment not configured properly') }
}

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER));
const { abi, address } = getContractData();
const poetryContract = web3.eth.contract(abi).at(address)

router.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/',
    limits: { filesize: 20480 * 25600 }, // 500mb
    parseNested: false
}));

router.post('/', poetryJWT.middleware, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.jwt.username }).exec();
        assert.notDeepEqual(user.validated, false, 'User is not validated');
        assert.notDeepEqual(user.customerId, null, 'User does not have a customerId');
        assert.notDeepEqual(user.subscription, null, 'User does not have an active subscription');
        assert.notDeepEqual(user.subscriptionId, null, 'User does not have an active subscription id');
        const response = await axios.get(`${process.env.POETRY_PAYMENTS_URL}/products/${user.subscription}`);
        const { maxRequests } = response.data;
        assert.notDeepEqual(maxRequests >= true, true, 'User has hit their request quota');
        const file = req.files.useTempFiles;
        const data = await readFile(file);
        const hash = crypto.createHash('sha256');
        hash.setEncoding('hex');
        hash.update(data);
        hash.end();
        const hashedData = hash.read();
        const hashRecord = new HashRecord({
            username: req.jwt.username,
            hash: hashedData,
            contact: address,
            network: 'matic',
            fileName: req.files.file.name
        });
        await hashRecord.save();
        res.status(200).json({ hashRecord });
    } catch (error) {

    }
});

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
