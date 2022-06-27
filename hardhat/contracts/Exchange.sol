// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    
    address cryptoDevTokenAddress;

    constructor(address _cryptoDevToken) ERC20("CyptoDev LP token","CDLT"){
        require(_cryptoDevToken != address(0),"This is a null address");
        cryptoDevTokenAddress = _cryptoDevToken;
    }

    function getReserves() public view returns(uint){
        return ERC20(cryptoDevTokenAddress).balanceOf(address(this));
    }

    function addLiquidity(uint _amount) public payable returns(uint){
        uint liquidity;
        uint ethBalance = address(this).balance;
        uint cryptoDevReserve = getReserves();
        ERC20 cryptoDevsToken = ERC20(cryptoDevTokenAddress);

        if(cryptoDevReserve == 0){
            cryptoDevsToken.transferFrom(msg.sender, address(this), _amount);

            liquidity = ethBalance;
            _mint(msg.sender, liquidity);
        }
        else{
            uint ethReserve = ethBalance - msg.value;
            uint cryptoDevTokenAmount = (msg.value * cryptoDevReserve)/(ethReserve); // that the user can add
            require(_amount >= cryptoDevTokenAmount, "Amount is less then the required token amount");

            cryptoDevsToken.transferFrom(msg.sender, address(this), cryptoDevTokenAmount);
            liquidity = (msg.value * totalSupply())/(ethReserve);
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }

    function removeLiquidity(uint _amount) public returns(uint, uint){
        require(_amount > 0, "The amount should be greater then zero!");

        uint ethReserve = address(this).balance;
        uint _totalSupply = totalSupply();

        uint ethAmount = (_amount * ethReserve)/(_totalSupply);
        uint cryptoDevTokenAmount = (_amount * getReserves())/(_totalSupply);

        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(ethAmount);

        ERC20(cryptoDevTokenAddress).transfer(msg.sender, cryptoDevTokenAmount);
        return (ethAmount, cryptoDevTokenAmount);
    }

    function getAmountOfTokens(
     uint256 inputAmount,
     uint256 inputReserve,
     uint256 outputReserve) public pure returns(uint256){

        require(inputReserve > 0 && outputReserve > 0, "Insufficient Resourses");

        uint256 inputAmountWithFees = ((inputAmount)*99)/100;

        uint256 numerator = outputReserve * inputAmountWithFees; // Δy = (y * Δx) / (x + Δx)
        uint256 denomirator = inputReserve + inputAmountWithFees;

        return numerator / denomirator;
    }
}