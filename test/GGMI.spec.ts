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
      const { sender, tokenContract } = await loadFixture(deployContracts);
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
      const { deployer, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      await tokenContract.mint(deployer.address, toMint);
      expect(await tokenContract.burn(toMint));
      expect(await tokenContract.balanceOf(deployer.address)).to.eq(0);
    });
    it("User should NOT be able to transfer", async () => {
      const { sender, receiver, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      await tokenContract.mint(sender.address, toMint);
      await expect(tokenContract.connect(sender).transfer(receiver.address, toMint)).to.be.revertedWithCustomError(
        tokenContract,
        "EnforcedPause",
      );
    });
    it("User should NOT be able to transferFrom", async () => {
      const { sender, receiver, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.mint(sender.address, toMint);
      await tokenContract.connect(sender).approve(receiver.address, toMint);
      await tokenContract.pause();
      await expect(
        tokenContract.connect(receiver).transferFrom(sender.address, receiver.address, toMint),
      ).to.be.revertedWithCustomError(tokenContract, "EnforcedPause");
    });
    it("User should NOT be able to burn", async () => {
      const { deployer, sender, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      expect(await tokenContract.mint(deployer.address, toMint));
      await expect(tokenContract.connect(sender).burn(100)).to.be.revertedWithCustomError(
        tokenContract,
        "EnforcedPause",
      );
    });
  });
});
