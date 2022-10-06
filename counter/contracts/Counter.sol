//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Counter {
    uint256 public value = 0;

    address public governance;

    constructor(address newGovernance) {
        governance = newGovernance;
    }

    function increment() public payable {
        require(msg.sender == governance, "not gov");
        require(msg.value > 0, "no eth");

        value += 1;
    }
}
