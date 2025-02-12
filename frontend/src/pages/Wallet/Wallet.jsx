import { ethers } from "ethers";
import { Redirect } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { networkData } from "../../scripts/network.js";

// components
import { ReceiveTokenModal } from "../../components/Modal/ReceiveToken/index";
import { SendTokenModal } from "../../components/Modal/SendToken/index";
import { WalletAddresses } from "./WalletAddresses";

// material ui
import { Grid, Container } from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";

import style from "./wallet.module.scss";

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    let id = setInterval(() => {
      savedCallback.current();
    }, delay);
    return () => clearInterval(id);
  }, [delay]);
}

export const Wallet = (props) => {
  useInterval(() => {
    getBalance();
  }, 5000);

  const [network, SetNetwork] = useState(networkData.kovan.rpc);
  const [chainID, SetChainID] = useState(networkData.kovan.chainID);
  const [explorer, SetExplorer] = useState(networkData.kovan.explorer);

  const [balances, setBalances] = useState([]);
  const [currentAddress, SetCurrentAddress] = useState(0);

  const [receiveTokenState, setReceiveTokenState] = useState(false);
  const [sendTokenState, setSendTokenState] = useState(false);
  const [tokenData, setTokenData] = useState();

  const [totalAmount, SetTotalAmount] = useState(0);

  const [transactions, SetTransactions] = useState([]);

  const openReceiveToken = () => {
    setReceiveTokenState(true);
    setSendTokenState(false);
  };

  const openSendToken = () => {
    setReceiveTokenState(false);
    setSendTokenState(true);
  };

  const handleClose = () => {
    setReceiveTokenState(false);
    setSendTokenState(false);
  };

  const changeNetwork = (input) => {
    // console.log(input);
    console.log("Network is changing");
    switch (input) {
      case "kovan":
        SetNetwork(networkData.kovan.rpc);
        SetChainID(networkData.kovan.chainID);
        SetExplorer(networkData.kovan.explorer);
        break;

      case "ethereum":
        SetNetwork(networkData.ethereumMainnet.rpc);
        SetChainID(networkData.ethereumMainnet.chainID);
        SetExplorer(networkData.ethereumMainnet.explorer);
        break;

      case "fantom-testnet":
        SetNetwork(networkData.fantomTestnet.rpc);
        SetChainID(networkData.fantomTestnet.chainID);
        SetExplorer(networkData.fantomTestnet.explorer);
        break;

      case "fantom-mainnet":
        SetNetwork(networkData.fantomMainnet.rpc);
        SetChainID(networkData.fantomMainnet.chainID);
        SetExplorer(networkData.fantomMainnet.explorer);
        break;
    }
  };

  const getBalance = () => {
    let networkChosen = network;

    const provider = new ethers.providers.JsonRpcProvider(networkChosen);
    // console.log(chainID);

    // console.log(props.address[currentAddress].address);

    axios
      .get(
        `https://project-v.salilnaik.repl.co/TokenBalances/address/${props.address[currentAddress].address}/chain/${chainID}/`
      )
      .then((result) => {
        console.log(result.data.tokens);
        setBalances(result.data.tokens);
        calculateTotal(result.data.tokens);
        return true;
      })
      .catch((err) => console.log(err));
  };

  const getTransactions = () => {
    axios
      .get(
        `https://project-v.salilnaik.repl.co/Transactions/address/${props.address[currentAddress].address}/chain/${chainID}`
      )
      .then((result) => {
        console.log(result.data);
        SetTransactions(result.data);
        return true;
      })
      .catch((err) => console.log(err));
  };

  const calculateTotal = (data) => {
    let count = 0;
    data.map((element) => {
      count = count + element.USD_value;
    });

    SetTotalAmount(count.toFixed(2));
  };

  return (
    <>
      <Container>
        {props.verified ? (
          <>
            <Grid container justify="center" className={style.dashboard}>
              <Grid item sm={5}>
                <p className={style.textSmall}>Total Amount</p>
                <p className={style.textBig}>$ {totalAmount} </p>
              </Grid>
              <Grid item sm={5}>
                <div className={style["btnContainer"]}>
                  <div onClick={openSendToken} className={style.btn}>
                    <SendIcon />
                    Send
                  </div>
                  <div onClick={openReceiveToken} className={style.btn}>
                    <AccountBalanceWalletIcon />
                    Receive
                  </div>
                </div>
              </Grid>
            </Grid>
            <Grid container justify="center">
              <Grid item sm={10}>
                <WalletAddresses
                  transactions={transactions}
                  network={network}
                  address={props.address}
                  balances={balances}
                  SetCurrentAddress={SetCurrentAddress}
                  setReceiveTokenState={setReceiveTokenState}
                  setSendTokenState={setSendTokenState}
                  setTokenData={setTokenData}
                  getTransactions={getTransactions}
                  changeNetwork={changeNetwork}
                  addNewAddress={props.addNewAddress}
                />
              </Grid>
            </Grid>

            {/* modals */}
            <ReceiveTokenModal
              open={receiveTokenState}
              onClose={handleClose}
              data={balances}
              walletAddress={props.address[currentAddress].address}
            />

            {/* Verify Modal */}
            <SendTokenModal
              open={sendTokenState}
              onClose={handleClose}
              data={balances}
              network={network}
              walletData={props.address[currentAddress]}
              explorer={explorer}
            />
          </>
        ) : (
          <Redirect to="/" />
        )}
      </Container>
    </>
  );
};
