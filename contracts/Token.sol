//SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    uint256 constant MAX_SUPPLY = 1_000_000 ether;
    
    event LogMint(address _owner, address _to, uint256 _amount);

    constructor(string memory _name, string memory _symbol) 
        Ownable(msg.sender) 
        ERC20(_name, _symbol)
    { }

    function mint(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Zero address!");
        require(_amount > 0, "amount equals zero!");
        require(totalSupply() + _amount <= MAX_SUPPLY, "Max supply reached!");
        _mint(_to, _amount);

        emit LogMint(msg.sender, _to, _amount);
    }
}