import { BigNumber, Contract, ethers, Wallet } from 'ethers';
import { Provider, utils } from 'zksync-web3';
import * as dotenv from "dotenv";

dotenv.config();

const GOVERNANCE_ABI = require('./governance.json');
const GOVERNANCE_ADDRESS = '0xf45DaC8c4c6c228726931457CBb0d6C26649FB2C';
const COUNTER_ABI = require('./counter.json');
const COUNTER_ADDRESS = '0x45AF82B80F8CAC5E9430e4dD7D6854Fc177634a6';

async function main() {
    // Ethereum L1 provider
    const l1Provider = ethers.providers.getDefaultProvider(process.env.NODE_URL);

    // Governor wallet
    const wallet = new Wallet(process.env.PRIVATE_KEY || "", l1Provider);

    const govcontract = new Contract(
        GOVERNANCE_ADDRESS,
        GOVERNANCE_ABI,
        wallet
    );

    // Getting the current address of the zkSync L1 bridge
    const l2Provider = new Provider('https://zksync2-testnet.zksync.dev');
    const zkSyncAddress = await l2Provider.getMainContractAddress();
    // Getting the `Contract` object of the zkSync bridge
    const zkSyncContract = new Contract(
        zkSyncAddress,
        utils.ZKSYNC_MAIN_ABI,
        wallet
    );

    // Encoding the tx data the same way it is done on Ethereum.
    const counterInterface = new ethers.utils.Interface(COUNTER_ABI);
    const data = counterInterface.encodeFunctionData("increment", []);

    // The price of the L1 transaction requests depends on the gas price used in the call
    const gasPrice = await l1Provider.getGasPrice();

    // Here we define the constant for ergs limit .
    const ergsLimit = BigNumber.from(100000);
    // Getting the cost of the execution.
    const baseCost = await zkSyncContract.l2TransactionBaseCost(
        gasPrice,
        ergsLimit,
        ethers.utils.hexlify(data).length
    );

    const testFee = ethers.utils.parseEther("0.01");

    // Calling the L1 governance contract.
    const tx = await govcontract.testTransfer(
        zkSyncAddress, 
        COUNTER_ADDRESS, 
        baseCost,
        ergsLimit,
        {
            // Passing the necessary ETH `value` to cover the fee for the operation
            value: testFee.add(baseCost),
            gasPrice
        }
    );

    // Waiting until the L1 tx is complete.
    await tx.wait();

    // Getting the TransactionResponse object for the L2 transaction corresponding to the 
    // execution call
    const l2Response = await l2Provider.getL2TransactionFromPriorityOp(tx);

    // The receipt of the L2 transaction corresponding to the call to the Increment contract
    const l2Receipt = await l2Response.wait();
    console.log(l2Receipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
