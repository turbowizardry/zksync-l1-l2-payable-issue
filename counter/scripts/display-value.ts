import { Contract, Provider } from 'zksync-web3'

const COUNTER_ADDRESS = '0x45AF82B80F8CAC5E9430e4dD7D6854Fc177634a6';
const COUNTER_ABI = require('./counter.json');

async function main() {
    // Initialize the wallet.
    const l2Provider = new Provider('https://zksync2-testnet.zksync.dev');

    const counter = new Contract(
      COUNTER_ADDRESS,
      COUNTER_ABI,
      l2Provider
    );

    console.log(`The counter value is ${(await counter.value()).toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
