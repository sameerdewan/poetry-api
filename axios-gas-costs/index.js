const axios = require('axios').default;
const Web3 = require('web3');

async function getETH_USD() {
    const usdToEthResponse = await axios.get(process.env.ETHEREUM_USD_URL);
    return usdToEthResponse.data.prices[1];
}

async function matic() {
    const maticResponse = await axios.get(process.env.MATIC_URL);
    const gasPriceAverageInWei = maticResponse.data.fastest;
    const gasPriceAverageInEth = Web3.utils.toWei(gasPriceAverageInWei, 'ether');
    const ethUSD = await getETH_USD();
    return gasPriceAverageInEth * ethUSD;
}

module.exports = {
    matic
}
