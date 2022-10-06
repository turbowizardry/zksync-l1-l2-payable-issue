import { Contract, Provider } from 'zksync-web3'

const COUNTER_ADDRESS = '0xcf15d6cD67C704532eE5Ef03e32Af96E97B02Bd1';
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
