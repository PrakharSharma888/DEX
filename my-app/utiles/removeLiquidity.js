import {Contract, utils, provider} from 'ethers'
import { EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS } from '../constrants/index'

export const removeLiquidity = async (
    signer,
    removeLPTokensWei
) => {

    const exchangeContract = new Contract(
        EXCHANGE_CONTRACT_ADDRESS,
        EXCHANGE_CONTRACT_ABI,
        signer
    );
    const tx = await exchangeContract.removeLiquidity(removeLPTokensWei);
    await tx.wait();
    window.alert("Liqudity Removed Successfully!")
}

export const getTokensAfterRemove = async (
    provider,
    removeLPTokensWei,
    _ethBalance,
    cryptoDevTokenReserve
) => {
    try {
        
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );

        const _totalSupply = await exchangeContract.totalSupply();
        const _removeEther = _ethBalance.mul(removeLPTokensWei).div(_totalSupply); 
        
        const _removeCD = cryptoDevTokenReserve.mul(removeLPTokensWei).div(_totalSupply)
        
        return {_removeCD, _removeEther}

    } catch (error) {
        console.log(error)
    }
}