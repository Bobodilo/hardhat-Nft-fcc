const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")

let tokenUris = [
    "ipfs://QmYrrtdqHCeTbtqpCrQaSGuy5D5adN2s5P2QQkqvRhCzE7",
    "ipfs://QmXcgWzfm7fxrmgBzdFTxZBWomhMAumFxb2xEWnZes5Xaf",
    "ipfs://QmUSVRBFRzidj9Xk2ExZGZuhHQ7Nb592StCGT4seSbv9GX",
]

const FUND_AMOUNT = "1000000000000000000000"
const imagesLocation = "./images/randomNft"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            traits_type: "Cuteness",
            value: 100,
        },
    ],
}

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock

    //get the IPFS hashes of our images

    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }
    //1. With our won IPFS node. hhtps://docs.ipfs.io
    //2. pinata https://www.pinata.cloud/
    //3. nft.storage https://nft.storage/

    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txreceipt = await tx.wait(1)
        subscriptionId = 1
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("_______________________________________")

    const mintFee = networkConfig[chainId].mintFee
    const gasLane = networkConfig[chainId].gasLane
    const callbackGasLimit = networkConfig[chainId].callbackGasLimit
    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        gasLane,
        callbackGasLimit,
        tokenUris,
        mintFee,
    ]

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("_______________________________________")

    if (chainId == 31337) {
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address)
    }

    //verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("verifying...")
        await verify(randomIpfsNft.address, args)
    }

    log("NFT deployed!")
}

const handleTokenUris = async () => {
    tokenUris = []
    // store the image in IPFS
    // store the metadata in IPFS
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (imageUploadResponseIndex in imageUploadResponses) {
        // create metadata
        // upload the meatadat
        let tokenUriMetadata = { ...metadataTemplate }
        // Drop the extension .png
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "")
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}... `)
        //Store the JSON to pinata IPFS
        const metadaUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadaUploadResponse.IpfsHash}`)
    }
    console.log("Token URIs Uploaded! They are")
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "randomIpfs", "main"]
