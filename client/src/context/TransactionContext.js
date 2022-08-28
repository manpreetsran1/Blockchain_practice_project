import React, { Children, useEffect, useState } from "react";

import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constant";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  console.log("getEthereumContract");
  const provider = new ethers.providers.Web3Provider(ethereum);

  const signer = provider.getSigner();

  const TransactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return TransactionContract;

  console.log({ provider, signer, TransactionContract });
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [formData, setformData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };
  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please Install metamask");

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts) {
        setCurrentAccount(accounts[0]);
        getAllTransactions();
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please Install metamask");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const sendTransaction = async () => {
    const { addressTo, amount, keyword, message } = formData;

    try {
      if (!ethereum) return alert("Please Install metamask");
      let transactionContract = getEthereumContract();

      const parsedAmount = ethers.utils.parseEther(amount);

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208",
            value: parsedAmount._hex,
          },
        ],
      });

      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        keyword,
        message
      );
      setLoading(true);

      console.log(`Loading - ${transactionHash.hash}`);

      await transactionHash.wait();

      setLoading(false);

      console.log(`Success - ${transactionHash.hash}`);

      const transactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionCount.toNumber());
    } catch (error) {}
  };

  const checdkifTransactionExist = async () => {
    try {
      let transactionContract = getEthereumContract();

      console.log(transactionContract, "transactionContract");
      const transactionCount = await transactionContract.getTransactionCount();
      window.localStorage.setItem("transactionCount", transactionCount);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = getEthereumContract();

        const availableTransactions =
          await transactionsContract.getAllTransactions();

        const structuredTransactions = availableTransactions.map(
          (transaction) => ({
            addressTo: transaction.receiver,
            addressFrom: transaction.sender,
            timestamp: new Date(
              transaction.timestamp.toNumber() * 1000
            ).toLocaleString(),
            message: transaction.message,
            keyword: transaction.keyword,
            amount: parseInt(transaction.amount._hex) / 10 ** 18,
          })
        );

        console.log(structuredTransactions);

        setTransactions(structuredTransactions);
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checdkifTransactionExist();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet: connectWallet,
        currentAccount,
        handleChange,
        formData,
        sendTransaction,
        loading,
        transactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
