import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const ADDRESS_ONE = "0x0000000000000000000000000000000000000001";

describe("GGMI", () => {
  async function deployContracts() {
    const [deployer, sender, receiver] = await ethers.getSigners();
    const tokenFactory = await ethers.getContractFactory("GGMI");
    const tokenContract = await tokenFactory
      .connect(deployer)
      .deploy(deployer.address, "Gnosis Guild Membership Interest", "GGMI");

    return { deployer, sender, receiver, tokenContract };
  }

  describe("When not paused", async () => {
    it("User should be able to call transfer()", async () => {
      const { sender, receiver, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.mint(sender.address, toMint);
      expect(await tokenContract.connect(sender).transfer(receiver.address, toMint));
    });
    it("User should be able to call transferFrom()", async () => {
      const { sender, receiver, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.mint(sender.address, toMint);
      await tokenContract.connect(sender).approve(receiver.address, toMint);
      expect(await tokenContract.connect(receiver).transferFrom(sender.address, receiver.address, toMint));
    });
    it("User should be able to call burn()", async () => {
      const { sender, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      expect(await tokenContract.mint(sender.address, toMint));
      expect(await tokenContract.connect(sender).burn(100));
    });
  });

  describe("When paused", async () => {
    it("owner should be able to call mint()", async () => {
      const { sender, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      await tokenContract.mint(sender.address, toMint);
      expect(await tokenContract.totalSupply()).to.eq(toMint);
      expect(await tokenContract.balanceOf(sender.address)).to.eq(toMint);
    });
    it("owner should be able to call transfer()", async () => {
      const { deployer, sender, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      await tokenContract.mint(deployer.address, toMint);
      expect(await tokenContract.transfer(sender.address, toMint));
      expect(await tokenContract.balanceOf(sender.address)).to.eq(toMint);
    });
    it("owner should be able to call transferFrom()", async () => {
      const { deployer, sender, receiver, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.mint(sender.address, toMint);
      await tokenContract.pause();
      await tokenContract.connect(sender).approve(deployer.address, toMint);
      expect(await tokenContract.balanceOf(sender.address)).to.eq(toMint);
      expect(await tokenContract.allowance(sender.address, deployer.address)).to.eq(toMint);
      expect(await tokenContract.transferFrom(sender.address, receiver.address, toMint));
      expect(await tokenContract.balanceOf(receiver.address)).to.eq(toMint);
    });
    it("owner should be able to call burn()", async () => {
      const { deployer, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      await tokenContract.mint(deployer.address, toMint);
      expect(await tokenContract.burn(toMint));
      expect(await tokenContract.balanceOf(deployer.address)).to.eq(0);
    });
    it("authorized account should not be able to call mint()", async () => {
      const { deployer, sender, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      await tokenContract.grantAuthorization(deployer.address);
      await tokenContract.transferOwnership(ADDRESS_ONE);
      await expect(tokenContract.mint(sender.address, toMint)).to.be.revertedWithCustomError(
        tokenContract,
        "OwnableUnauthorizedAccount",
      );
    });
    it("authorized account should be able to call transfer()", async () => {
      const { deployer, sender, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      await tokenContract.mint(deployer.address, toMint);
      await tokenContract.grantAuthorization(deployer.address);
      await tokenContract.transferOwnership(ADDRESS_ONE);
      expect(await tokenContract.transfer(sender.address, toMint));
      expect(await tokenContract.balanceOf(sender.address)).to.eq(toMint);
    });
    it("authorized account should be able to call transferFrom()", async () => {
      const { deployer, sender, receiver, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      await tokenContract.approve(sender.address, toMint);
      await tokenContract.grantAuthorization(sender.address);
      await tokenContract.mint(deployer.address, toMint);
      expect(await tokenContract.balanceOf(deployer.address)).to.eq(toMint);
      expect(await tokenContract.allowance(deployer.address, sender.address)).to.eq(toMint);
      expect(await tokenContract.connect(sender).transferFrom(deployer.address, receiver.address, toMint));
      expect(await tokenContract.balanceOf(receiver.address)).to.eq(toMint);
    });
    it("authorized account should be able to call burn()", async () => {
      const { deployer, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      await tokenContract.mint(deployer.address, toMint);
      await tokenContract.grantAuthorization(deployer.address);
      await tokenContract.transferOwnership(ADDRESS_ONE);
      expect(await tokenContract.burn(toMint));
      expect(await tokenContract.balanceOf(deployer.address)).to.eq(0);
    });
    it("User should NOT be able to transfer()", async () => {
      const { sender, receiver, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.pause();
      await tokenContract.mint(sender.address, toMint);
      await expect(tokenContract.connect(sender).transfer(receiver.address, toMint)).to.be.revertedWithCustomError(
        tokenContract,
        "EnforcedPause",
      );
    });
    it("User should NOT be able to transferFrom()", async () => {
      const { sender, receiver, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await tokenContract.mint(sender.address, toMint);
      await tokenContract.connect(sender).approve(receiver.address, toMint);
      await tokenContract.pause();
      await expect(
        tokenContract.connect(receiver).transferFrom(sender.address, receiver.address, toMint),
      ).to.be.revertedWithCustomError(tokenContract, "EnforcedPause");
    });
    it("User should NOT be able to burn()", async () => {
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

  describe("mint()", async () => {
    it("should revert if not called by `owner`", async () => {
      const { sender, tokenContract } = await loadFixture(deployContracts);
      const toMint = ethers.parseEther("1");

      await expect(tokenContract.connect(sender).mint(sender.address, toMint))
        .to.be.revertedWithCustomError(tokenContract, "OwnableUnauthorizedAccount")
        .withArgs(sender.address);
    });
  });

  describe("grantAuthorization()", async () => {
    it("should revert if not called by `owner`", async () => {
      const { sender, tokenContract } = await loadFixture(deployContracts);
      await expect(tokenContract.connect(sender).grantAuthorization(sender.address))
        .to.be.revertedWithCustomError(tokenContract, "OwnableUnauthorizedAccount")
        .withArgs(sender.address);
    });
    it("should grant authorization to the given account", async () => {
      const { sender, tokenContract } = await loadFixture(deployContracts);

      expect(await tokenContract.authorized(sender.address)).to.equal(false);
      await tokenContract.grantAuthorization(sender.address);
      expect(await tokenContract.authorized(sender.address)).to.equal(true);
    });
    it("should emit AuthorizationGranted()", async () => {
      const { sender, tokenContract } = await loadFixture(deployContracts);

      await expect(await tokenContract.grantAuthorization(sender.address))
        .to.emit(tokenContract, "AuthorizationGranted")
        .withArgs(tokenContract.getAddress, sender.address);
    });
  });

  describe("revokeAuthorization()", async () => {
    it("should revert if not called by `owner`", async () => {
      const { sender, tokenContract } = await loadFixture(deployContracts);
      await expect(tokenContract.connect(sender).revokeAuthorization(sender.address))
        .to.be.revertedWithCustomError(tokenContract, "OwnableUnauthorizedAccount")
        .withArgs(sender.address);
    });
    it("should revoke authorization to the given account", async () => {
      const { sender, tokenContract } = await loadFixture(deployContracts);

      expect(await tokenContract.authorized(sender.address)).to.equal(false);
      await tokenContract.grantAuthorization(sender.address);
      expect(await tokenContract.authorized(sender.address)).to.equal(true);
      await tokenContract.revokeAuthorization(sender.address);
      expect(await tokenContract.authorized(sender.address)).to.equal(false);
    });
    it("should emit AuthorizationRevoked()", async () => {
      const { sender, tokenContract } = await loadFixture(deployContracts);

      await tokenContract.grantAuthorization(sender.address);
      await expect(await tokenContract.revokeAuthorization(sender.address))
        .to.emit(tokenContract, "AuthorizationRevoked")
        .withArgs(tokenContract.getAddress, sender.address);
    });
  });

  describe("pause()", async () => {
    it("should set `paused()` to true", async () => {
      const { tokenContract } = await loadFixture(deployContracts);

      expect(await tokenContract.paused()).to.equal(false);
      await tokenContract.pause();
      expect(await tokenContract.paused()).to.equal(true);
    });
  });

  describe("unpause()", async () => {
    it("should set `paused()` to false", async () => {
      const { tokenContract } = await loadFixture(deployContracts);

      expect(await tokenContract.paused()).to.equal(false);
      await tokenContract.pause();
      expect(await tokenContract.paused()).to.equal(true);
      await tokenContract.unpause();
      expect(await tokenContract.paused()).to.equal(false);
    });
  });

  describe("nonces()", async () => {
    it("should return the permit nonce for the given account", async () => {
      const { deployer, tokenContract } = await loadFixture(deployContracts);

      expect(await tokenContract.nonces(deployer.address)).to.equal(0);
    });
  });
});
