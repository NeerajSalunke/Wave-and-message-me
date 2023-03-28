import {useEffect, useState} from "react";
import {ethers} from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

const getEthereumObject = () => window.ethereum;

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
  try{
    const ethereum = getEthereumObject(); //If we have Metamask browser extension wallet installed, it will automatically inject a special object named ethereum into our window
    // this means, if we have metamask, then we have etherum object

    /*
    * First make sure we have access to the Ethereum object.
    */
    if(!ethereum)
    {
      console.log("Make sure you have metamask");
      return null;
    }
    
    console.log("We have the etheruem object",ethereum);
    const accounts = await ethereum.request({method:"eth_accounts"});

    if(accounts.length !== 0)
    {
      const account = accounts[0];
      console.log("Found an authorized account:",account);
      
      return account;
    }
    else
    {
      console.error("No authorized account found");
      return null;
    }
  }
  catch(error)
  {
    console.error(error);
    return null;
  }
}

function App() {

  const[currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0x8AFd794A5D1BCFa8327507b18C0984147DAC7a91";
  const contractABI=abi.abi;

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async() => {
    try{
      const { ethereum } = window;
      if(ethereum)
      {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave=>{
          wavesCleaned.push({
            address:wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message            
          })
        })

         /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      }
      else
      {
        console.log("Ethereum obk=ject does not exist");
      }
    }
    catch(error)
    {
      console.log(error);
    }
  }


  const connectWallet = async () => {
    try{
      const ethereum = getEthereumObject();
      if(!ethereum)
      {
        alert("Get Metamask");
        return;
      }
      const accounts = await ethereum.request({
        method:"eth_requestAccounts",
      });

      console.log("Connected",accounts[0]);
      setCurrentAccount(accounts[0]);
    }
    catch(error)
    {
      console.error(error);
    }
  }

  const wave =async () => {
    try{
      const {ethereum}=window;
      if(ethereum) 
      {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count",count.toNumber());

        let msg=document.querySelector('input[name="msg"]');
        console.log("msg:",msg.value);

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(msg.value);
        console.log("Mining...",waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined--",waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count",count.toNumber());
      }
      else
      {
        console.log("Etheruem object does not exist");
      }
    }
    catch(error)
    {
      console.error(error);
    }
  }



  /*
   * The passed callback function will be run when the page loads.
   * More technically, when the App component "mounts".
   */
  useEffect(() => {
    getAllWaves();
    findMetaMaskAccount().then((account) => {
      if (account !== null) {
        setCurrentAccount(account);
      }
    });
  }, []);


  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          Hey there
        </div>
        <div className="bio">
          I am Neeraj. To share any messages, just type it and wave at me .
        </div>
        <form>
          <label htmlFor="msg">Enter message</label>
          <input type="text" id="msg" name="msg"/>
        </form>
        <button className="waveButton" onClick={wave}>
          Wave at me
        </button>

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave,index)=>{
          return(
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default App;
