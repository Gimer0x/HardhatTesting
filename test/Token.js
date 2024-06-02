const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { expect } = require("chai");

const ZERO = 0;
const ONE = ethers.parseEther("1");
const ONE_MILLION = ethers.parseEther("1000000");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("Token Tests", function () {
  async function deployTokenFixture() {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.

    // Contracts are deployed using the first signer/account by default
    const [owner, sender, receiver] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("My Token", "MTK");

    await expect(token.mint(sender, ONE)).not.to.be.reverted;

    return { token, owner, sender, receiver};
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { token, owner, sender, receiver } = await loadFixture(deployTokenFixture);

      expect(await token.owner()).to.be.equal(owner);
    });

    it("Should validate the accounts balance", async () => {
      const { token, owner, sender, receiver } = await loadFixture(deployTokenFixture);
      expect(await token.balanceOf(owner)).to.be.equal(ZERO);
      expect(await token.balanceOf(sender)).to.be.equal(ONE);
    });

    it("Should not allow to mint more than Max Supply", async () => {
      const { token, owner, sender, receiver } = await loadFixture(deployTokenFixture);

      await expect(token.mint(sender, ONE_MILLION))
        .to.be.revertedWith("Max supply reached!");

    });

    it("Should not allow to mint to zero address", async () => {
      const { token, owner, sender, receiver } = await loadFixture(deployTokenFixture);
      await expect( token.mint(ZERO_ADDRESS, ONE))
        .to.be.revertedWith("Zero address!");
    })

    it("Should not allow other account to mint tokens", async () => {
      const { token, owner, sender, receiver } = await loadFixture(deployTokenFixture);

      await expect(token.connect(sender).mint(sender, ONE))
        .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
        .withArgs(sender.address);
    })

    it("Should emit an event when minting", async () => {
      const { token, owner, sender, receiver } = await loadFixture(deployTokenFixture);
      await expect(token.mint(sender, ONE))
        .to.emit(token, "LogMint")
        .withArgs(owner, sender, ONE);
    })

    it("Should transfer tokens", async () => {
      const { token, owner, sender, receiver } = await loadFixture(deployTokenFixture);

      await expect(token.connect(sender).transfer(receiver, ONE))
        .to.changeTokenBalances(token, [sender, receiver], [-ONE, ONE]);
    });

    it("Should validate Ether transfer", async () => {
      const { token, owner, sender, receiver } = await loadFixture(deployTokenFixture);
      await expect(() => sender.sendTransaction({to: receiver, value: 200}))
        .to.changeEtherBalances([sender, receiver], [-200, 200]);
    });

    it("Should validate allowance", async () => {
      const { token, owner, sender, receiver } = await loadFixture(deployTokenFixture);
      await expect(token.transferFrom(sender, receiver, ONE)).to.be.reverted;

      await token.connect(sender).approve(owner, ONE);

      await expect(token.transferFrom(sender, receiver, ONE))
        .to.changeTokenBalances(token, [sender, receiver], [-ONE, ONE]);

    })
  });
});
