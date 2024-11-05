import React, { useState } from 'react';
import algosdk from 'algosdk';
import { DecentralizedAuctionHouse } from '@algorandfoundation/tealscript';

const App = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [assetId, setAssetId] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [auctionActive, setAuctionActive] = useState(false);

  const connectWallet = async () => {
    const algoWallet = window.AlgoSigner;

    if (algoWallet) {
      const accounts = await algoWallet.connect();
      setWalletAddress(accounts[0].address);
      console.log('Connected:', accounts[0].address);
    } else {
      alert('Please install Algorand Wallet');
    }
  };

  const createAuction = async () => {
    const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');

    const auctionContract = new DecentralizedAuctionHouse();

    try {
      await auctionContract.createAuction(assetId, startingPrice);
      setAuctionActive(true);
      console.log('Auction created successfully');
    } catch (error) {
      console.error('Error creating auction:', error);
    }
  };

  const placeBid = async () => {
    const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');

    try {
      // Assuming you have a function in your contract to handle bids
      await auctionContract.placeBid({ amount: bidAmount });
      console.log('Bid placed successfully');
    } catch (error) {
      console.error('Error placing bid:', error);
    }
  };

  const finalizeAuction = async () => {
    try {
      await auctionContract.finalizeAuction();
      console.log('Auction finalized successfully');
      setAuctionActive(false);
    } catch (error) {
      console.error('Error finalizing auction:', error);
    }
  };

  const cancelAuction = async () => {
    try {
      await auctionContract.cancelAuction();
      console.log('Auction canceled successfully');
      setAuctionActive(false);
    } catch (error) {
      console.error('Error canceling auction:', error);
    }
  };

  return (
    <div>
      <h1>Decentralized Auction House</h1>
      <button onClick={connectWallet}>Connect Wallet</button>

      {walletAddress && (
        <div>
          <p>Connected Wallet: {walletAddress}</p>
          <input
            type="text"
            placeholder="Asset ID"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
          />
          <input
            type="number"
            placeholder="Starting Price"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
          />
          <button onClick={createAuction}>Create Auction</button>

          {auctionActive && (
            <>
              <input
                type="number"
                placeholder="Bid Amount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
              <button onClick={placeBid}>Place Bid</button>
              <button onClick={finalizeAuction}>Finalize Auction</button>
              <button onClick={cancelAuction}>Cancel Auction</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
