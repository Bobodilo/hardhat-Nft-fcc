const { network } = require("hardhat")
const { developmentsChains, networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let mockV3AggregatorAddress, mockV3Aggregator
    if (developmentChains.includes(network.name)) {
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
        mockV3AggregatorAddress = mockV3Aggregator.address
    } else {
        mockV3AggregatorAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    const lowSvg = await fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf8" })
    const highSvg = await fs.readFileSync("./images/dynamicNft/Happy.svg", { encoding: "utf8" })

    const args = [mockV3AggregatorAddress, lowSvg, highSvg]
    const dynamicSvg = await deploy("DynamicSvgNft", {
        from: deployer,
        log: true,
        args: args,
        waitConfiramations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("verifying...")
        await verify(dynamicSvg.address, args)
    }

    log("_______________________________________")
}

module.exports.tags = ["all", "dynamicSvg", "main"]
