//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@matterlabs/zksync-contracts/l1/contracts/zksync/interfaces/IZkSync.sol";

contract Governance {
  address public governor;

  constructor() {
      governor = msg.sender;
  }

  function testTransfer(
    address zkSyncAddress,
    address contractAddr,
    uint256 tipAmount,
    uint64 ergsLimit
  ) external payable {
    require(msg.value > tipAmount, "wrong amounts");

    callZkSync(
      zkSyncAddress, 
      contractAddr, 
      msg.value,
      msg.value - tipAmount,
      abi.encodeWithSignature(
        "increment()"
      ),
      ergsLimit
    );
  }

  function callZkSync(
    address zkSyncAddress, 
    address contractAddr,
    uint256 totalAmount,
    uint256 tipAmount,
    bytes memory data,
    uint64 ergsLimit
  ) private {
    IZkSync zksync = IZkSync(zkSyncAddress);

    zksync.requestL2Transaction{value: totalAmount}(
      contractAddr, 
      totalAmount - tipAmount,
      data, 
      ergsLimit, 
      new bytes[](0)
    );
  }
}
