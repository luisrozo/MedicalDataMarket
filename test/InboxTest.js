var IPFSInbox = artifacts.require("./IPFSInbox.sol");

contract("IPFSInbox", function(accounts) {

    it("should distribute ether between accounts", async () => {
        const ipfsInbox = await IPFSInbox.deployed();

        // Testing with a 30ETH offer
        var offerPrice = 30;

        var customer = accounts[1];
        var owner1 = accounts[2];
        var owner2 = accounts[3];
        var owner3 = accounts[4];
        var owners = [owner1, owner2, owner3];

        var initialCustomerBalance = await web3.eth.getBalance(customer);
        var initialOwner1Balance = await web3.eth.getBalance(owner1);
        var initialOwner2Balance = await web3.eth.getBalance(owner2);
        var initialOwner3Balance = await web3.eth.getBalance(owner3);        
        
        var weiToPass = offerPrice * 1000000000000000000;
        
        ipfsInbox.send(customer, owners, { from: customer, value: weiToPass })
            .then(async () => {
                var expectedCustomerBalance = initialCustomerBalance - offerPrice;
                var expectedOwner1Balance = initialOwner1Balance + offerPrice/3;
                var expectedOwner2Balance = initialOwner2Balance + offerPrice/3;
                var expectedOwner3Balance = initialOwner3Balance + offerPrice/3;

                var newCustomerBalance = await web3.eth.getBalance(customer);
                var newOwner1Balance = await web3.eth.getBalance(owner1);
                var newOwner2Balance = await web3.eth.getBalance(owner2);
                var newOwner3Balance = await web3.eth.getBalance(owner3);

                assert.equal(expectedCustomerBalance, newCustomerBalance, "Customer must have -30 ETH");
                assert.equal(expectedOwner1Balance, newOwner1Balance, "Owner 1 must have +10 ETH");
                assert.equal(expectedOwner2Balance, newOwner2Balance, "Owner 2 must have +10 ETH");
                assert.equal(expectedOwner3Balance, newOwner3Balance, "Owner 3 must have +10 ETH");
            });        
    });
});