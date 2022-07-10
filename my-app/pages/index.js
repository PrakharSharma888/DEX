import {BigNumber, providers, utils} from 'ethers';
import { solidityKeccak256 } from 'ethers/lib/utils';
import Head from "next/head";
import React,{
  useEffect, useRef, useState
} from 'react';
import web3Modal from "web3modal";
import styles from "../styles/Home.module.css";
import {addLiquidity, AddLiquidity, calculateCD} from '../utiles/addLiquidity';
import {getEtherBalance, getCDTokensBalance, getLPTokensBalance, getReserveOfCDTokens} from '../utiles/getAmounts';
import {removeLiquidity, getTokensAfterRemove} from '../utiles/removeLiquidity';
import {getAmountOfTokenReceivedFromSwap, swapTokens} from '../utiles/swap';

export default function Home() {
  const zero = BigNumber.from(0); // zero in the form of a big number

  const [loading, setLoading] = useState(false);
  const [liquidityTab, setLiquidityTab] = useState(true);
  const [ethBalance, setEtherBalance] = useState(zero); //eth held by the user
  const [reservedCD, setReservedCD] = useState(zero); //CD tokens held by the the contract
  const [cdBalance, setCDBalance] = useState(zero); // CD tokens held by the user
  const [lpBalance, setLpBalance] = useState(zero); // LP tokens by user
  const [addEther, setAddEther] = useState(zero); // amount of ether user wants to add to the liquidity
  const [addCDTokens, setAddCDTokens] = useState(zero);
  const [removeEther, setRemoveEther] = useState(zero);// based on lp tokens the user had
  const [removeCD, setRemoveCD] = useState(zero);
  const [removeLPTokens, setRemoveLPTokens] = useState("0")
  const [swapAmount, setSwapAmount] = useState("")
  const [tokensToBeReceivedAfterSwap, setTokensToBeReceivedAfterSwap] = useState(zero); //lp
  const [ethSelected, setEthSelected] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false)

  const web3ModalRef = useRef()

  const connectWallet = async () => {
    try {
      await getSignerOrProvider();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getSignerOrProvider = async(signer = false) => {

      const provider = await web3ModalRef.current.connect()
      const web3Provider = new providers.Web3Provider(provider)
      const {chainId} = await web3Provider.getNetwork()

      if(chainId != 4){
        window.alert("Wrong Network! Change to rinkeby");
        throw new Error("Change network to Rinkeby");
      }
      if(signer){
        const signer = await web3Provider.getSigner();
        return signer;
      }
      return web3Provider
  }

  const getAmounts = async() => {
    try {
    const provider = await getSignerOrProvider(false)
    const signer = await getSignerOrProvider(true)
    const address = await signer.getAddress()

    const _ethBalance = await getEtherBalance(
      provider,
      address,
    ) 
    const _cdBalance = await getCDTokensBalance(provider, address)
    const _lpBalance = await getLPTokensBalance(provider, address)
    const _CDReserve = await getReserveOfCDTokens(provider)
    const _ethBalanceContract = await getEtherBalance(provider, null, true)

    setReservedCD(_CDReserve);
    setEtherBalance(_ethBalance);
    setLpBalance(_lpBalance);
    setCDBalance(_cdBalance);
    setEtherBalance(_ethBalanceContract);

    } catch (error) {
      console.log(error)
  }
  }

  const _swapTokens = async () =>{
    try {
      
      const swapAmountWei = utils.parseEther(swapAmount);

      if(!swapAmountWei.eq(zero)){
        const signer = await getSignerOrProvider(true)
        setLoading(true)

        await swapTokens(
          signer,
          swapAmountWei,
          tokensToBeReceivedAfterSwap,
          ethSelected
        )
        setLoading(false)
        await getAmounts()// to get the updated number after swap
        setSwapAmount("")
      }

    } catch (error) {
      console.log(error)
      setSwapAmount("")
      setLoading(false)
    }
  }

  const _getAmountOfTokensReceivedFromSwap = async (_swapAmount) => {
    try {
      const _swapAmountWIE = utils.parseEther(_swapAmount.toString())

      if(!_swapAmountWIE.eq(zero)){
        const provider = await getSignerOrProvider();
        const _ethBalance = await getEtherBalance(provider, null, true)

        const amountOfTokens = await getAmountOfTokenReceivedFromSwap(
          _swapAmountWIE,
          provider,
          ethSelected,
          _ethBalance,
          reservedCD
        )
        setTokensToBeReceivedAfterSwap(amountOfTokens);
      }
      else{
        setTokensToBeReceivedAfterSwap(zero)
      }
    } catch (error) {
      console.log(error)
    }  
  }

  const _addLiquidity = async() => {
    try {
      const addEtherWei = utils.parseEther(addEther.toString())

      if(!addCDTokens.eq(zero) && !addEtherWei.eq(zero)){
        const signer = await getSignerOrProvider(true)
        setLoading(true)

        await addLiquidity(
          signer,
          addCDTokens,
          addEtherWei
        )
        setLoading(false)
        setAddCDTokens(zero)

        await getAmounts()
      }
      else{
        setLoading(false)
        setAddCDTokens(zero)
      }

    } catch (error) {
      console.log(error)
      setLoading(false);
      setAddCDTokens(zero);
    }
  }

  const _removeLiquidity = async() => { // to remove lp tokens
    try {
      const signer = await getSignerOrProvider(true)
      setLoading(true)
      const removeLPTokensWei = utils.parseEther(removeLPTokens)

      await removeLiquidity(signer,removeLPTokensWei)
      setLoading(false)
      await getAmounts();
      setRemoveCD(zero)
      setRemoveEther(zero)

    } catch (error) {
      console.log(error)
      setLoading(false);
      setRemoveCD(zero);
      setRemoveEther(zero);
    }
  }

  const _getTokensAfterRemove = async(_removeLPTokens) =>{
    try {
      const provider = await getSignerOrProvider();

      const removeLPTokensWei = utils.parseEther(_removeLPTokens)
      const _ethBalance = await getEtherBalance(provider,null, true)
      const cryptoDevTokenReserve = await getReserveOfCDTokens(provider)
      const { _removeCD, _removeEther } = await getTokensAfterRemove(
        provider,
        removeLPTokensWei,
        _ethBalance,
        cryptoDevTokenReserve);
      console.log("Okay bro",_removeEther, _removeCD)
      setRemoveCD(_removeCD)
      setRemoveEther(_removeEther)

    } catch (error) {
      console.log(error)
    }  // to remove assests
  }

  useEffect(()=>{
    if(!walletConnected){
      web3ModalRef.current = new web3Modal({
        network: 'rinkeby',
        providerOptions: [],
        disableInjectedProvider : false
    })
    }
    connectWallet()
    getAmounts();

  },[walletConnected])

const renderButton = () =>{

  if(!walletConnected){
    return(
      <button onClick={connectWallet} className={styles.button}>
        Connect Your Wallet
      </button>
    )
  }
  if(loading){
    return(
      <button className={styles.button}>
        Loading...
      </button>
    )
  }
  if(liquidityTab){
    return(
      <div>
        <div className={styles.description}>
          You Currently Have : 
          <br />
          {utils.formatEther(cdBalance)} CryptoDevs Token
          <br/>
          {utils.formatEther(ethBalance)} ETH
          <br/>
          {utils.formatEther(lpBalance)} Liquidity Provider (LP) Tokens
        </div>
      
      <div>
      {utils.parseEther(reservedCD.toString()).eq(zero) ? ( // if at initial level (true)
        <div>
        <input type="number" placeholder='Amount of Ether' onChange={(e) => {
          setAddEther(e.target.value || "0")
          }} className={styles.input} />

        <input type="number" placeholder='Amount of CryptoDev Tokens' onChange={(e) =>{
          setAddCDTokens(BigNumber.from(utils.parseEther(e.target.value || "0")))
          }} className={styles.input} />
          <button className={styles.button} onClick={_addLiquidity} >Add</button>
        </div>

      ):( // else giving the ratio to add liquid
          <div>
            <input type="number" placeholder='Amount Of Ether' onChange={ async (e) => {
              setAddEther(e.target.value || "0") 

              const _addCDTokens = await calculateCD(
                e.target.value || "0",
                ethBalance,
                reservedCD
                );
                setAddCDTokens(_addCDTokens)
            }} className={styles.input} />

            <div className={styles.inputDiv}>
              {`You will need ${utils.formatEther(addCDTokens)} Crypto Devs token to add`}
            </div>
            <button className={styles.button} onClick={_addLiquidity}>Add</button>
          </div>
      )}
      <div>
        <input type="number" placeholder="Amount of LP Tokens" onChange={ async (e) => {setRemoveLPTokens(e.target.value || "0")
        await _getTokensAfterRemove(e.target.value)
      }} className={styles.input} />
      </div>
        <div className={styles.inputDiv}>
          {`You will get ${removeCD} CryptoDev tokens and ${removeEther} ETH`}
        </div>
        <button className={styles.button1} onClick={_removeLiquidity}>Remove</button>
       </div>
      </div>
    );
  }
  else{ // not liquidity
    return (
      <div>
        <input type="number" placeholder='Amount' onChange={async(e) => {setSwapAmount(e.target.value || "")
        
        await _getAmountOfTokensReceivedFromSwap(e.target.value || "0");
        }} className={styles.input} value={swapAmount} />
      
      <select
      className={styles.select} name="dropdown" id='dropdown' onChange={async(e)=>{ 
        setEthSelected(!ethSelected)
        // initializeing back to zero
        await _getAmountOfTokensReceivedFromSwap(0)
        setSwapAmount("")
      }}>
        <option value="eth">Etherum</option>
        <option value="cryptodevtoken">CryptoDev Token</option>
      </select>
      <br/>
      <div className={styles.inputDiv}>
      {ethSelected
              ? `You will get ${utils.formatEther(
                  tokensToBeReceivedAfterSwap
                )} Crypto Dev Tokens`
              : `You will get ${utils.formatEther(
                  tokensToBeReceivedAfterSwap
                )} Eth`}
          </div>
          <button className={styles.button1} onClick={_swapTokens}>
            Swap
          </button>
      </div>
    );
  }
}

return (
  <div>
    <Head>
      <title>Decentralized Exchange</title>
    </Head>
    <div className={styles.main}>
      <div>
        <h1 className={styles.title}>Welcome to Crypto Devs Exchange!</h1>
        <div className={styles.description}>
          Exchange Ethereum &#60;&#62; Crypto Dev Tokens
        </div>
        <div>
          <button className={styles.button} onClick={() => {setLiquidityTab(true)}}>Liquidity</button>
          <button className={styles.button} onClick={() => {setLiquidityTab(false)}}>Swap</button>
        </div>
        {renderButton()}
      </div>
        <div>
          <img className={styles.image} src="./mybilli2.png" alt='Ok'/>
        </div>
    </div>
    <footer className={styles.footer}>
        Made with &#10084; by Prakhar Sharma
      </footer>
  </div>
)

}