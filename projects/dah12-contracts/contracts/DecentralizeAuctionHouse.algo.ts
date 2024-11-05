import { Contract } from '@algorandfoundation/tealscript';

export class DecentralizedAuctionHouse extends Contract {
  assetId = GlobalStateKey<AssetID>();

  startingPrice = GlobalStateKey<uint64>();

  highestBid = GlobalStateKey<uint64>();

  highestBidder = GlobalStateKey<Address>();

  isActive = GlobalStateKey<boolean>();

  createAuction(assetId: AssetID, startingPrice: uint64): void {
    assert(this.txn.sender === this.app.creator);

    this.assetId.value = assetId;
    this.startingPrice.value = startingPrice;
    this.highestBid.value = startingPrice;
    this.highestBidder.value = this.app.creator;
    this.isActive.value = true;
  }

  placeBid(bidTxn: PayTxn): void {
    assert(this.isActive.value);
    assert(bidTxn.amount > this.highestBid.value);

    // Refund previous highest bidder if applicable
    this.refundPreviousBidder();

    // Update highest bid and highest bidder
    this.highestBid.value = bidTxn.amount;
    this.highestBidder.value = bidTxn.sender;
  }

  private refundPreviousBidder(): void {
    if (this.highestBidder.value !== this.app.creator) {
      sendPayment({
        receiver: this.highestBidder.value,
        amount: this.highestBid.value,
      });
    }
  }

  finalizeAuction(): void {
    assert(this.txn.sender === this.app.creator);
    assert(this.isActive.value);

    // Transfer the asset to the highest bidder
    sendAssetTransfer({
      xferAsset: this.assetId.value,
      assetAmount: 1, // assuming one unit is auctioned
      assetReceiver: this.highestBidder.value,
    });

    sendPayment({
      receiver: this.app.creator,
      amount: this.highestBid.value,
    });

    // Mark the auction as inactiven
    this.isActive.value = false;
  }

  cancelAuction(): void {
    assert(this.txn.sender === this.app.creator);
    assert(this.isActive.value);

    // Refund the highest bidder if applicable
    this.refundPreviousBidder();

    // Mark the auction as inactive
    this.isActive.value = false;
  }

  deleteApplication(): void {
    assert(this.txn.sender === this.app.creator);

    // Transfer remaining asset back to creator if any exist
    const remainingAssetAmount = this.app.address.assetBalance(this.assetId.value);

    if (remainingAssetAmount > 0) {
      sendAssetTransfer({
        xferAsset: this.assetId.value,
        assetReceiver: this.app.creator,
        assetAmount: remainingAssetAmount,
        assetCloseTo: this.app.creator,
      });
    }

    // Send remaining balance to the creator and close account
    sendPayment({
      receiver: this.app.creator,
      amount: this.app.address.balance,
      closeRemainderTo: this.app.creator,
    });
  }
}
