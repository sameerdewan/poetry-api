const router = require('express').Router();
const fileUpload = require('express-fileupload');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const crypto = require('crypto');
const fs = require('fs');
const util = require('util');
const assert = require('assert').strict;
const PoetrySystemJWT = require('../jwt');
const User = require('../db/models/User');
const HashRecord = require('../db/models/HashRecord');
const { getContractData, poetryPersist, poetryLocate } = require('../blockchain');

const readFile = util.promisify(fs.readFile);
const poetryJWT = new PoetrySystemJWT();

router.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/',
    limits: { filesize: 20480 * 25600 }, // 500mb
    parseNested: false
}));

router.post('/', poetryJWT.middleware, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.jwt.username }).exec();
        if (!user) {
            res.sendStatus(404);
        }
        assert.notDeepEqual(user.validated, false, 'User is not validated');
        assert.notDeepEqual(user.customerId, null, 'User does not have a customerId');
        assert.notDeepEqual(user.subscription, null, 'User does not have an active subscription');
        assert.notDeepEqual(user.subscriptionId, null, 'User does not have an active subscription id');
        const stripeSubscription = await stripe.subscriptions.retrieve(user.subscriptionId);
        const productId = stripeSubscription.items.data[0].price.product;
        const stripeProduct = await stripe.products.retrieve(productId);
        const { maxRequests } = Number(stripeProduct.metaData);
        assert.notDeepEqual(user.monthToDatePings < maxRequests, true, `User has reached monthly ping limit: ${maxRequests}`);
        const file = req.files.file.tempFilePath;
        const data = await readFile(file);
        const hash = crypto.createHash('sha256');
        hash.setEncoding('hex');
        hash.update(data);
        hash.end();
        const hashedData = hash.read();
        const hashRecord = new HashRecord({
            username: req.jwt.username,
            hash: hashedData,
            contact: getContractData().address,
            fileName: req.files.file.name
        });
        await hashRecord.save();
        res.status(200).json({ hashRecord });
        poetryPersist({
            username: req.jwt.username,
            fileName: req.files.file.name,
            hashedData: new String(hashedData).valueOf() 
        });
    } catch (error) {
        res.send({error: error.message});
    }
});

router.post('/retrieve', poetryJWT.middleware, async (req, res) => {
    try {
        const file = req.files.file.tempFilePath;
        const data = await readFile(file);
        const hash = crypto.createHash('sha256');
        hash.setEncoding('hex');
        hash.update(data);
        hash.end();
        const hashedData = hash.read();
        const hashRecord = await HashRecord.findOne({ hash: hashedData }).exec();
        if (!hashRecord) {
            const response = await poetryLocate({
                hashedData: new String(hashedData).valueOf(), 
                username: req.jwt.username, 
                fileName: req.files.file.name
            });
            const { newHashRecord, error } = response;
            if (error) {
                return res.status(404).json({ error: 'Hash not found' });
            } else {
                return res.status(200).json({ hashRecord: newHashRecord });
            }
        }
        res.status(200).json({ hashRecord });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
