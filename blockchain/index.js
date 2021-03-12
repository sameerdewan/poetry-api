const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const ethers = require('ethers').ethers;
const path = require('path');
const matic = require('../axios-gas-costs').matic;

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
    let gasCost;
    if (process.env.ENV === 'DEVELOPMENT') {
        gasCost = await web3.eth.getGasPrice();
    }
    else if (process.env.ENV === 'PRODUCTION') {
        gasCost = await matic();
    } 
    else { throw new Error('environment not configured properly') }
    const encodedABI = poetryContract.methods.compose(username, fileName, hashedData).encodeABI();
    const from = await wallet.getAddress();
    const nonce = await web3.eth.getTransactionCount(from);
    const tx = {
        from,
        to: address,
        gasLimit: web3.utils.toHex(4712388),
        gasPrice: web3.utils.toHex(gasCost),
        nonce: web3.utils.toHex(nonce),
        data: encodedABI
    };
    const signedTx = await wallet.signTransaction(tx);
    web3.eth.sendSignedTransaction(signedTx)
    // .on('error', console.log)
    .on('receipt', console.log);
}

module.exports = {
    poetryPersist
};
