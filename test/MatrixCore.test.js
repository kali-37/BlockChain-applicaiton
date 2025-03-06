// test/SimplifiedMatrixCore.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimplifiedMatrixCore", function () {
  let Matrix;
  let matrixContract;
  let owner;
  let companyWallet;
  let rootUser;
  let user1;
  let user2;
  let user3;
  let matrixAddress;

  const LEVEL_1_PRICE = ethers.parseEther("100");
  const SERVICE_FEE = ethers.parseEther("15");
  const TOTAL_REGISTRATION_COST = LEVEL_1_PRICE + SERVICE_FEE;
  
  beforeEach(async function () {
    // Get signers
    [owner, companyWallet, rootUser, user1, user2, user3] = await ethers.getSigners();
    
    // Deploy contract - ethers v6 way
    Matrix = await ethers.getContractFactory("SimplifiedMatrixCore");
    matrixContract = await Matrix.deploy(companyWallet.address, rootUser.address);
    
    // Wait for deployment to complete
    await matrixContract.waitForDeployment();
    matrixAddress = await matrixContract.getAddress();
  });

  describe("Deployment", function () {
    it("Should set the right company wallet", async function () {
      expect(await matrixContract.companyWallet()).to.equal(companyWallet.address);
    });

    it("Should register root user", async function () {
      expect(await matrixContract.isUserRegistered(rootUser.address)).to.equal(true);
      expect(await matrixContract.getUserLevel(rootUser.address)).to.equal(19);
    });

    it("Should set the right owner", async function () {
      expect(await matrixContract.owner()).to.equal(owner.address);
    });
  });

  describe("Registration", function () {
    it("Should allow user registration", async function () {
      // User1 registers with rootUser as referrer
      await matrixContract.connect(user1).register(rootUser.address, {
        value: TOTAL_REGISTRATION_COST
      });

      // Check registration
      expect(await matrixContract.isUserRegistered(user1.address)).to.equal(true);
      expect(await matrixContract.getUserLevel(user1.address)).to.equal(1);
      expect(await matrixContract.getUserReferrer(user1.address)).to.equal(rootUser.address);
    });

    it("Should transfer level fee to referrer and service fee to company", async function () {
      const rootUserBalanceBefore = await ethers.provider.getBalance(rootUser.address);
      const companyBalanceBefore = await ethers.provider.getBalance(companyWallet.address);
      
      // User1 registers with rootUser as referrer
      await matrixContract.connect(user1).register(rootUser.address, {
        value: TOTAL_REGISTRATION_COST
      });
      
      const rootUserBalanceAfter = await ethers.provider.getBalance(rootUser.address);
      const companyBalanceAfter = await ethers.provider.getBalance(companyWallet.address);
      
      // Check balances - ethers v6 uses BigInt
      expect(rootUserBalanceAfter - rootUserBalanceBefore).to.equal(LEVEL_1_PRICE);
      expect(companyBalanceAfter - companyBalanceBefore).to.equal(SERVICE_FEE);
    });

    it("Should reject registration with invalid referrer", async function () {
      // Try to register with non-existent referrer
      await expect(
        matrixContract.connect(user1).register(user2.address, {
          value: TOTAL_REGISTRATION_COST
        })
      ).to.be.revertedWith("Invalid referrer");
    });

    it("Should reject registration with insufficient payment", async function () {
      // Try to register with insufficient payment
      await expect(
        matrixContract.connect(user1).register(rootUser.address, {
          value: ethers.parseEther("50")
        })
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Level Upgrade", function () {
    beforeEach(async function () {
      // Register users for upgrade tests
      await matrixContract.connect(user1).register(rootUser.address, {
        value: TOTAL_REGISTRATION_COST
      });
      
      await matrixContract.connect(user2).register(user1.address, {
        value: TOTAL_REGISTRATION_COST
      });
    });

    it("Should allow level upgrade", async function () {
      // Calculate level 2 upgrade cost
      const level2Cost = ethers.parseEther("150");
      
      // Upgrade user1 to level 2
      await matrixContract.connect(user1).upgradeLevel(2, rootUser.address, {
        value: level2Cost
      });
      
      // Check level
      expect(await matrixContract.getUserLevel(user1.address)).to.equal(2);
    });

    it("Should split upgrade fee between upline and company", async function () {
      // Calculate level 2 upgrade cost
      const level2Cost = ethers.parseEther("150");
      const companyFee = (level2Cost * 20n) / 100n; // 20% company fee
      const uplineFee = level2Cost - companyFee;
      
      const rootUserBalanceBefore = await ethers.provider.getBalance(rootUser.address);
      const companyBalanceBefore = await ethers.provider.getBalance(companyWallet.address);
      
      // Upgrade user1 to level 2
      await matrixContract.connect(user1).upgradeLevel(2, rootUser.address, {
        value: level2Cost
      });
      
      const rootUserBalanceAfter = await ethers.provider.getBalance(rootUser.address);
      const companyBalanceAfter = await ethers.provider.getBalance(companyWallet.address);
      
      // Check balances
      expect(rootUserBalanceAfter - rootUserBalanceBefore).to.equal(uplineFee);
      expect(companyBalanceAfter - companyBalanceBefore).to.equal(companyFee);
    });

    it("Should reject level skipping", async function () {
      // Try to upgrade from level 1 to level 3
      await expect(
        matrixContract.connect(user1).upgradeLevel(3, rootUser.address, {
          value: ethers.parseEther("200")
        })
      ).to.be.revertedWith("Can only upgrade to next level");
    });

    it("Should reject upgrade with insufficient payment", async function () {
      // Try to upgrade with insufficient payment
      await expect(
        matrixContract.connect(user1).upgradeLevel(2, rootUser.address, {
          value: ethers.parseEther("100")
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should verify upline is registered and has sufficient level", async function () {
      // Calculate level 2 upgrade cost
      const level2Cost = ethers.parseEther("150");
      
      // Try to upgrade with an invalid upline
      await expect(
        matrixContract.connect(user1).upgradeLevel(2, user3.address, {
          value: level2Cost
        })
      ).to.be.revertedWith("Invalid upline address");
      
      // Now register user3 but at level 1
      await matrixContract.connect(user3).register(rootUser.address, {
        value: TOTAL_REGISTRATION_COST
      });
      
      // Try to upgrade with an upline that has a lower level
      await expect(
        matrixContract.connect(user1).upgradeLevel(2, user3.address, {
          value: level2Cost
        })
      ).to.be.revertedWith("Upline level too low");
    });
  });
});