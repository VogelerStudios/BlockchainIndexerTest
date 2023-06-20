class Collection {
  data: any;
  transactions: {
    address: string;
    fromAddress: string;
    tokenId: string;
    amount: number;
    time: number | 0;
  }[];
  purchases: {
    address: string;
    amount: number;
  };
  currentOwners: {
    address: string;
    amount: number;
  };
  ownerChurn: {
    address: string;
    churn: number;
  };
  holdTimeByOwner: {
    wallet: string;
    holdTime: number;
  };

  constructor(data) {
    this.data = data;
    this.transactions = [];
    this.purchases = {};
    this.currentOwners = {};
    this.ownerChurn = {};
    this.holdTimeByOwner = [];
  }

  getTransactions() {
    for (const transaction of this.data) {
      const {
        to_address: address,
        from_address: fromAddress,
        token_id: tokenId,
        amount: txAmount,
        block_timestamp,
      } = transaction;
      this.transactions.push({
        address,
        fromAddress,
        tokenId,
        amount: parseInt(txAmount),
        time: parseInt(block_timestamp),
      });
      this.purchases[address] =
        (this.purchases[address] || 0) + parseInt(txAmount);
      this.currentOwners[address] =
        (this.currentOwners[address] || 0) + parseInt(txAmount);
      this.currentOwners[fromAddress] =
        (this.currentOwners[fromAddress] || 0) - parseInt(txAmount);
    }
  }

  calculateOwnerChurn() {
    for (const [wallet, totalAmount] of Object.entries(this.purchases)) {
      const currentAmount = this.currentOwners[wallet];
      const retention = (currentAmount * 100) / totalAmount;
      const churn = 100 - retention;
      this.ownerChurn[wallet] = churn;
    }
  }

  getChurnByAddress(address: string) {
    return this.ownerChurn[address] || null;
  }

  getAverageChurnRate() {
    let counter = 0;
    let totalChurn: number = 0;
    for (const [wallet, churnRate] of Object.entries(this.purchases)) {
      totalChurn += churnRate;
      counter++;
    }

    return totalChurn / counter;
  }

  calcualateHoldTime() {
    // go through transactions, add buys
    for (const transaction of this.transactions) {
      const { address: toAddress, time } = transaction;
      this.holdTimeByOwner[toAddress] = time;
    }

    // go through transactions, substract sells
    // Note, we could probably do this in one run, but doing it this way to put together an MVP.
    // Still O(n) time complexity
    for (const transaction of this.transactions) {
      const { fromAddress, time } = transaction;
      const heldTime = time - this.holdTimeByOwner[fromAddress];
      this.holdTimeByOwner[fromAddress] = heldTime > 0 ? heldTime : 0;
    }
  }

  getHoldTimeByWallet(wallet) {
    return this.holdTimeByOwner[wallet];
  }

  getAverageHoldTime() {
    let counter = 0;
    let totalHoldTime = 0;
    for (const [wallet, holdTime] of Object.entries(this.holdTimeByOwner)) {
      totalHoldTime += holdTime;
      counter++;
    }

    return Math.floor(totalHoldTime / counter);
  }
}

export default Collection;