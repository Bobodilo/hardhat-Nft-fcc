const { assert, expect } = require("chai")
const { network, getNamedAccounts, ethers, deployments } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIpfsNft Unit Test", () => {
          let vrfCoordinatorV2Mock, deployer, mintFee, randomIpfs
          const chainId = network.config.chainId
          beforeEach(async () => {
              const accounts = await getNamedAccounts()
              deployer = accounts.deployer
              await deployments.fixture(["mocks", "randomIpfs"])
              randomIpfs = await ethers.getContract("RandomIpfsNft", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              mintFee = await randomIpfs.getMintFee()
          })
          describe("constructor", () => {
              it("Both contracts were deployed", async () => {
                  assert(randomIpfs.address)
                  assert(vrfCoordinatorV2Mock.address)
              })
              it("Sets the name and Symbol correctly", async () => {
                  const tokenName = await randomIpfs.name()
                  const tokenSymbol = await randomIpfs.symbol()
                  assert.equal(tokenName, "Random IPFS NFT")
                  assert.equal(tokenSymbol, "RIN")
              })
              it("Sets satrting values correctly", async () => {
                  const dogTokenUriZero = await randomIpfs.getTokenUris(0)
                  const isInitialized = await randomIpfs.getInitialized()
                  assert(dogTokenUriZero.includes("ipfs://"))
                  assert.equal(isInitialized, true)
              })
          })
          describe("Request NFt", () => {
              it("Reverts if mintfee is not sent", async () => {
                  await expect(randomIpfs.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__NeedMoreEthSent"
                  )
              })
              it("Reverts if not enough ETH is sent ", async () => {
                  await expect(
                      randomIpfs.requestNft({
                          value: ethers.utils.parseEther("0.0001"),
                      })
                  ).to.be.revertedWith("RandomIpfsNft__NeedMoreEthSent")
              })
              it("calls the vrf coordinator", async () => {
                  const tx = await randomIpfs.requestNft({ value: mintFee })
                  const txReceipt = await tx.wait(1)
                  assert(txReceipt)
              })
              it("emits an event when Id is Requested", async () => {
                  expect(await randomIpfs.requestNft({ value: mintFee })).to.emit(
                      randomIpfs,
                      "NftRequested"
                  )
              })
          })
          describe("fulfillRandomWords", () => {
              it("Mints NFT after random number is returned", async () => {
                  await new Promise(async (resolve, reject) => {
                      randomIpfs.once("NftMinted", async () => {
                          try {
                              const tokenUri = await randomIpfs.tokenURI("0")
                              const tokenCounter = await randomIpfs.getTokenCounter()
                              assert.equal(tokenUri.toString().includes("ipfs://"), true)
                              assert.equal(tokenCounter.toString(), "1")
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                          resolve()
                      })
                      try {
                          const tx = await randomIpfs.requestNft({ value: mintFee.toString() })
                          const txReceipt = await tx.wait(1)
                          const requestId = await txReceipt.events[1].args.requestId
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestId,
                              randomIpfs.address
                          )
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
              })
          })
          describe("GetBreedFromMoodedRng", () => {
              it("Should return PUG if moddedRng is < 10", async () => {
                  const Breed = await randomIpfs.callStatic.getBreedFromModdedRng(5)
                  assert.equal(Breed.toString(), "0")
              })
              it("Should return Shiba-Inu if moddedRng is between 10 - 39", async () => {
                  const Breed = await randomIpfs.callStatic.getBreedFromModdedRng(15)
                  assert.equal(Breed.toString(), "1")
              })
              it("Should return St.Bernard if moddedRng is between 40 - 99 ", async () => {
                  const Breed = await randomIpfs.callStatic.getBreedFromModdedRng(60)
                  assert.equal(Breed.toString(), "2")
              })
              it("Reverts if the number is > 99", async () => {
                  await expect(randomIpfs.callStatic.getBreedFromModdedRng(100)).to.be.revertedWith(
                      "RandomIpfsNft__RangeOutOfBounds"
                  )
              })
          })
          describe("Withdraw", () => {
              it("Only owner can withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const addedAccount = randomIpfs.connect(accounts[1])
                  await expect(addedAccount.withdraw()).to.be.revertedWith(
                      "Ownable: caller is not the owner"
                  )
              })
          })
      })
