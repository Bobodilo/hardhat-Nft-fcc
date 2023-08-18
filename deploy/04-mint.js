const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()

    // Basic NFT
    const basicNft = await ethers.getContract("BasicNft", deployer)
    const basicMintTx = basicNft.mintNft()
    // await basicMintTx.wait(1)
    console.log(`Basic NFT of index 0 has a tokenURI of : ${await basicNft.tokenURI(0)} `)

    // Random IPFS NFT
    const randomIpfs = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfs.getMintFee()

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 600000) // 10 minutes
        randomIpfs.once("NftMinted", async () => {
            resolve()
        })
        const randomIpfsTx = await randomIpfs.requestNft({ value: mintFee })
        const randomIpfsTxReceipt = await randomIpfsTx.wait(1)
        if (developmentChains.includes(network.name)) {
            const requestId = randomIpfsTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfs.address)
        }
    })

    console.log(`Random IPFS NFT index 0 has a tokenURI of : ${await randomIpfs.tokenURI(0)} `)

    // Dynamic SVG NFT
    const highValue = await ethers.utils.parseEther("4000")
    const dynamicSvg = await ethers.getContract("DynamicSvgNft", deployer)
    const dynamicSvgTx = await dynamicSvg.mint(highValue)
    await dynamicSvgTx.wait(1)
    console.log(`Dynamic NFT of index 0 has a tokenURI of : ${await dynamicSvg.tokenURI(0)} `)
}

module.exports.tags = ["all", "mint"]
