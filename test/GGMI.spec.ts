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
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      await tokenContract.mint(sender.address, toMint);
      expect(await tokenContract.totalSupply()).to.eq(toMint);
      expect(await tokenContract.balanceOf(sender.address)).to.eq(toMint);
    });
    it("owner should be able to call transfer", async () => {
      const { deployer, sender, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      await tokenContract.mint(deployer.address, toMint);
      expect(await tokenContract.transfer(sender.address, toMint));
      expect(await tokenContract.balanceOf(sender.address)).to.eq(toMint);
    });
    it("owner should be able to call transferFrom", async () => {
      const { deployer, receiver, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      await tokenContract.mint(deployer.address, toMint);
      await tokenContract.approve(deployer.address, toMint);
      expect(await tokenContract.balanceOf(deployer.address)).to.eq(toMint);
      expect(await tokenContract.allowance(deployer.address, deployer.address)).to.eq(toMint);
      expect(await tokenContract.transferFrom(deployer.address, receiver.address, toMint));
      expect(await tokenContract.balanceOf(receiver.address)).to.eq(toMint);
    });
    it("owner should be able to call burn", async () => {
      const { deployer, sender, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      await tokenContract.mint(deployer.address, toMint);
      expect(await tokenContract.burn(toMint));
      expect(await tokenContract.balanceOf(deployer.address)).to.eq(0);
    });
    it("owner should be able to mint", async () => {
      const { deployer, sender, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      expect(await tokenContract.mint(deployer.address, toMint));
    });
  });
});
