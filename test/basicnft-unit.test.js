const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft Unit Test", () => {
          let basicNft, deployer
          beforeEach(async () => {
              const accounts = await getNamedAccounts()
              deployer = accounts.deployer

              await deployments.fixture("all")
              basicNft = await ethers.getContract("BasicNft")
          })
          it("was deployed", async () => {
              assert(basicNft.address)
          })
          describe("constructor", () => {
              it("Should set the name and symbol correctly ", async () => {
                  const tokenName = await basicNft.name()
                  const tokenSymbol = await basicNft.symbol()
                  assert.equal(tokenName, "Dogie")
                  assert.equal(tokenSymbol, "DOG")
              })
              it("Intiaizes the counter from 0", async () => {
                  const tokenMinted = await basicNft.getTokenCounter()
                  assert.equal(tokenMinted.toString(), "0")
              })
          })
          describe("minting", () => {
              beforeEach(async () => {
                  const txResponse = await basicNft.mintNft()
                  txResponse.wait(1)
              })
              it("it mints tokens properly", async () => {
                  const tokenURI = await basicNft.tokenURI(0)
                  const tokenCounter = await basicNft.getTokenCounter()

                  assert.equal(tokenCounter.toString(), "1")
                  assert(tokenURI, await basicNft.TOKEN_URI())
              })

              it("Shows the balance and the owner of an NFT", async () => {
                  const deployerBlance = await basicNft.balanceOf(deployer)
                  const owner = await basicNft.ownerOf("0")

                  assert.equal(deployerBlance.toString(), "1")
                  assert.equal(owner, deployer)
              })
          })
      })
