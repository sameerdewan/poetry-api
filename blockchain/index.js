const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const ethers = require('ethers').ethers;
const path = require('path');
const matic = require('../axios-gas-costs').matic;
const HashRecord = require('../db/models/HashRecord');

function getContractData() {
    if (process.env.ENV === 'DEVELOPMENT') {
        const { abi, address } = require(path.resolve(__dirname, '../../../../../appdata/contractData.json'));
        return { abi, address };
    } 
    else if (process.env.ENV === 'PRODUCTION') { } 
    else { throw new Error('environment not configured properly') }
}

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER));
const { abi, address } = getContractData();
const poetryContract = new web3.eth.Contract(abi, address);
const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);

async function poetryPersist({ username, fileName, hashedData }) {
    try {
        let gasPrice, gasLimit;
        if (process.env.ENV === 'DEVELOPMENT') {
            gasPrice = await web3.eth.getGasPrice();
            gasLimit = process.env.GAS_LIMIT;
        } else if (process.env.ENV === 'PRODUCTION') {
            gasPrice = await matic();
            const block = await web3.eth.getBlock('latest');
            gasLimit = block.gasLimit / block.transactions.length;
        } else {
            throw new Error('environment not configured properly');
        }
        const encodedABI = poetryContract.methods.compose(username, fileName, hashedData).encodeABI();
        const from = await wallet.getAddress();
        const nonce = await web3.eth.getTransactionCount(from);
        const tx = {
            from,
            to: address,
            gasLimit: web3.utils.toHex(gasLimit),
            gasPrice: web3.utils.toHex(gasPrice),
            nonce: web3.utils.toHex(nonce),
            data: encodedABI
        };
        const signedTx = await wallet.signTransaction(tx);
        web3.eth.sendSignedTransaction(signedTx)
        .on('error', async (error) => {
            await HashRecord.findOneAndUpdate(
                { username, fileName, hash: hashedData },
                { $set: { status: 'failed', message: JSON.stringify(error, null, 2) } }
            ).exec();
        })
        .on('receipt', async (receipt) => {
            await HashRecord.findOneAndUpdate(
                { username, fileName, hash: hashedData },
                { $set: { status: 'done', tx: receipt.transactionHash } }
            ).exec();
        });
    } catch (error) {
        await HashRecord.findOneAndUpdate(
            { username, fileName, hash: hashedData },
            { $set: { status: 'failed', message: JSON.stringify(error, null, 2) } }
        ).exec();
    }
}

module.exports = {
    poetryPersist
};
