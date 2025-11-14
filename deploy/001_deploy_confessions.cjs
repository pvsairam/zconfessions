module.exports = async function ({ deployments, getNamedAccounts }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying AnonymousConfessions with account:", deployer);

  const deployment = await deploy("AnonymousConfessions", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });

  console.log("\n✅ AnonymousConfessions deployed successfully!");
  console.log("Contract address:", deployment.address);
  console.log("Transaction hash:", deployment.transactionHash);
  console.log("\n📋 Add to your .env file:");
  console.log(`CONTRACT_ADDRESS=${deployment.address}`);
  console.log(`VITE_CONTRACT_ADDRESS=${deployment.address}`);
  console.log("\n🔍 View on Etherscan:");
  console.log(`https://sepolia.etherscan.io/address/${deployment.address}`);
};

module.exports.tags = ["AnonymousConfessions"];
