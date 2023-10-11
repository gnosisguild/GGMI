import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Token", () => {
  async function deployContracts() {
    const [deployer, sender, receiver] = await ethers.getSigners();
    const tokenFactory = await ethers.getContractFactory("GGMI");
    const tokenContract = await tokenFactory.connect(deployer).deploy(deployer.address);

    return { deployer, sender, receiver, tokenContract };
  }

  describe("When paused", async () => {
    it("owner should be able to call mint", async () => {
      const { deployer, sender, receiver, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.utils.parseEther("1");

      await tokenContract.pause();
      await tokenContract.mint(sender.address, toMint);
      expect(await tokenContract.totalSupply()).to.eq(toMint);
      expect(await tokenContract.balanceOf(sender.address)).to.eq(toMint);
    });
    it("owner should be able to call transfer", async () => {
      const { deployer, sender, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.utils.parseEther("1");

      await tokenContract.pause();
      await tokenContract.mint(deployer.address, toMint);
      expect(await tokenContract.transfer(sender.address, toMint));
      expect(await tokenContract.balanceOf(sender.address)).to.eq(toMint);
    });
    it("owner should be able to call transferFrom");
    it("owner should be able to call burn");
    it("owner should be able to mint");
  });
});
