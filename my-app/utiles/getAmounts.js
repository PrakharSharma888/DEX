import {TOKEN_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS} from "../constrants/index";

import {Contract} from 'ethers';

export const getEtherBalance = async (
    provider,
    address, // user address
    contract = false
) => {
    try {
        if(contract){ // if the contract is true by the user then get balance of contract

            const balance = await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS)
            return balance;

        }
        else{ // else get the balance of the user
            const balance = await provider.getBalance(address);
            return balance;
        }
    } catch (error) {
        console.log(error)
        return 0;
    }
}

export const getCDTokensBalance = async (
    provider,
    address
) => {
    try {

        const tokenContract = new Contract(
            TOKEN_CONTRACT_ADDRESS,
            TOKEN_CONTRACT_ABI,
            provider
        );
        const balanceOfCrytoDevTokens = await tokenContract.balanceOf(address)
        return balanceOfCrytoDevTokens;

    } catch (error) {
        console.log(error)
        return 0;
    }
}

export const getLPTokensBalance = async (
    provider,
    address
) => {
    try {

        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        )

        const balance = await exchangeContract.balanceOf(address)
        
        return balance

    } catch (error) {
        console.log(error)
    }
}

export const getReserveOfCDTokens = async(
    provider
) => {
    try {
        
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );
        const reserve = await exchangeContract.getReserves()
        return reserve;

    } catch (error) {
        console.log(error);
        return 0;
    }
}