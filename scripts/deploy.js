// scripts/deploy.js
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment process...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(`Account balance: ${(await deployer.provider.getBalance(deployer.address)).toString()}`);

  // Deploy the contract
  const companyWallet = process.env.COMPANY_WALLET || deployer.address;
  const rootUser = process.env.ROOT_USER || deployer.address;

  console.log(`Company wallet: ${companyWallet}`);
  console.log(`Root user: ${rootUser}`);

  const MatrixCore = await ethers.getContractFactory("SimplifiedMatrixCore");
  const matrix = await MatrixCore.deploy(companyWallet, rootUser);
  
  await matrix.deployed();
  console.log(`Contract deployed to: ${matrix.address}`);

  // Save the contract address and ABI to a file
  const contractData = {
    address: matrix.address,
    abi: JSON.parse(matrix.interface.format('json'))
  };

  // Save the ABI to be used by Django
  const deployDirectory = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deployDirectory)) {
    fs.mkdirSync(deployDirectory);
  }

  fs.writeFileSync(
    path.join(deployDirectory, "contract-data.json"),
    JSON.stringify(contractData, null, 2)
  );

  console.log("Contract data saved to deployments/contract-data.json");

  // For direct use in Django, also save just the ABI
  fs.writeFileSync(
    path.join(deployDirectory, "contract_abi.json"),
    JSON.stringify(contractData.abi, null, 2)
  );

  console.log("Contract ABI saved to deployments/contract_abi.json");
  console.log("Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });