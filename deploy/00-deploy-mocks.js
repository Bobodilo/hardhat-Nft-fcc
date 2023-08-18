//Imports
const { network } = require("hardhat")
const { DECIMALS, INITIAL_PRICE } = require("../helper-hardhat-config")

// args, Base_fee, Gas_PRice_Link
const BASE_FEE = "250000000000000000" //0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas

// Get accounts
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const args = [BASE_FEE, GAS_PRICE_LINK]
    // if on devchain the deploy, log, from, args
    if (chainId == 31337) {
        log("Local network detected! Deploying mocks...")

        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })

        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })

        log("Mocks Deployed")
        log("----------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
