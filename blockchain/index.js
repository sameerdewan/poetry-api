const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
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
const poetryContract = web3.eth.contract(abi).at(address);

async function poetryPersist({ username, fileName, hashedData }) {
    let gasCost;
    if (process.env.ENV === 'DEVELOPMENT') {
        gasCost = await web3.eth.getGasPrice();
    }
    else if (process.env.ENV === 'PRODUCTION') {
        gasCost = await matic();
    } 
    else { throw new Error('environment not configured properly') }
    const encodedABI = poetryContract.methods.compose(username, fileName, hashedData).encodedABI();
    const tx = {
        
    };
}

module.exports = {
    poetryPersist
};
