const { assert, expect } = require("chai")
const { deployments, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const lowTokenURI =
    "data:application/json;based64,eyJuYW1lIjoiRHluYW1pYyBTVkcgTkZUIiwgImRlc2NyaXB0aW9uIjoiQW4gTkZUIHRoYXQgY2hhbmdlcyBiYXNlZCBvbiB0aGUgQ2hhaW5saW5rIEZlZWQiLCJhdHRyaWJ1dGVzIjogIlt7InRyYWl0X3R5cGUiOiAiY29vbG5lc3MiLCAidmFsdWUiOiAxMDB9XSJkYXRhOiBpbWFnZS9zdmcreG1sO2Jhc2U2NFBEOTRiV3dnZG1WeWMybHZiajBpTVM0d0lpQmxibU52WkdsdVp6MGlkWFJtTFRnaVB6NDhJUzB0SUZWd2JHOWhaR1ZrSUhSdk9pQlRWa2NnVW1Wd2J5d2dkM2QzTG5OMlozSmxjRzh1WTI5dExDQkhaVzVsY21GMGIzSTZJRk5XUnlCU1pYQnZJRTFwZUdWeUlGUnZiMnh6SUMwdFBnbzhjM1puSUhkcFpIUm9QU0k0TURCd2VDSWdhR1ZwWjJoMFBTSTRNREJ3ZUNJZ2RtbGxkMEp2ZUQwaU1DQXdJRGN5SURjeUlpQnBaRDBpWlcxdmFta2lJSGh0Ykc1elBTSm9kSFJ3T2k4dmQzZDNMbmN6TG05eVp5OHlNREF3TDNOMlp5SStDaUFnUEdjZ2FXUTlJbU52Ykc5eUlqNEtJQ0FnSUR4d1lYUm9JR1pwYkd3OUlpTkdRMFZCTWtJaUlHUTlJazB6Tml3eE0yTXRNVEl1TmpneU15d3dMVEl6TERFd0xqTXhOemN0TWpNc01qTmpNQ3d4TWk0Mk9ESXlMREV3TGpNeE56Y3NNak1zTWpNc01qTmpNVEl1TmpneU1pd3dMREl6TFRFd0xqTXhOemdzTWpNdE1qTWdRelU1TERJekxqTXhOemNzTkRndU5qZ3lNaXd4TXl3ek5pd3hNM29pTHo0S0lDQThMMmMrQ2lBZ1BHY2dhV1E5SW1oaGFYSWlMejRLSUNBOFp5QnBaRDBpYzJ0cGJpSXZQZ29nSUR4bklHbGtQU0p6YTJsdUxYTm9ZV1J2ZHlJdlBnb2dJRHhuSUdsa1BTSnNhVzVsSWo0S0lDQWdJRHhqYVhKamJHVWdZM2c5SWpNMklpQmplVDBpTXpZaUlISTlJakl6SWlCbWFXeHNQU0p1YjI1bElpQnpkSEp2YTJVOUlpTXdNREF3TURBaUlITjBjbTlyWlMxdGFYUmxjbXhwYldsMFBTSXhNQ0lnYzNSeWIydGxMWGRwWkhSb1BTSXlJaTgrQ2lBZ0lDQThjR0YwYUNCbWFXeHNQU0p1YjI1bElpQnpkSEp2YTJVOUlpTXdNREF3TURBaUlITjBjbTlyWlMxc2FXNWxZMkZ3UFNKeWIzVnVaQ0lnYzNSeWIydGxMV3hwYm1WcWIybHVQU0p5YjNWdVpDSWdjM1J5YjJ0bExXMXBkR1Z5YkdsdGFYUTlJakV3SWlCemRISnZhMlV0ZDJsa2RHZzlJaklpSUdROUlrMHlOaTQxTERRNFl6RXVPRGMyT0MwekxqZ3pNallzTlM0NE1qTTVMVFl1TVRrMk5Td3hNQzAyWXpNdU9ETTBNeXd3TGpFNE1EUXNOeTR5T1RJMkxESXVORGt5Tml3NUxEWWlMejRLSUNBZ0lEeHdZWFJvSUdROUlrMHpNQ3d6TVdNd0xERXVOalUyT0MweExqTTBORGdzTXkwekxETmpMVEV1TmpVMU15d3dMVE10TVM0ek5ETXpMVE10TTJNd0xURXVOalUxTWl3eExqTTBORGN0TXl3ekxUTkRNamd1TmpVMU1pd3lPQ3d6TUN3eU9TNHpORFE0TERNd0xETXhJaTgrQ2lBZ0lDQThjR0YwYUNCa1BTSk5ORGdzTXpGak1Dd3hMalkxTmpndE1TNHpORFEzTERNdE15d3pjeTB6TFRFdU16UXpNeTB6TFROak1DMHhMalkxTlRJc01TNHpORFEzTFRNc015MHpVelE0TERJNUxqTTBORGdzTkRnc016RWlMejRLSUNBOEwyYytDand2YzNablBnPT0ifQ=="

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("DynamicSvg Tests", () => {
          let mockV3Aggregator, deployer, dynamicSvg
          const chainId = network.config.chainId
          beforeEach(async () => {
              const accounts = await getNamedAccounts()
              deployer = accounts.deployer
              await deployments.fixture(["mocks", "dynamicSvg"])
              dynamicSvg = await ethers.getContract("DynamicSvgNft", deployer)
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
          })
          describe("Constructor", () => {
              it("Sets the name correctly", async () => {
                  const tokenName = await dynamicSvg.name()
                  const tokenSymbol = await dynamicSvg.symbol()
                  assert.equal(tokenName, "Dynamic SVG NFT")
                  assert.equal(tokenSymbol, "DSN")
              })
              it("sets the aggregator addresses and the tokenCounter correctly", async () => {
                  const tokenCounter = await dynamicSvg.getTokenCounter()
                  const response = await dynamicSvg.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
                  assert.equal(tokenCounter, 0)
              })
          })
          describe("SvgImageURI", () => {
              it("Set the images correctly", async () => {
                  const lowimageURI = await dynamicSvg.getLowSVG()
                  const highmageURI = await dynamicSvg.getHighSVG()
                  // to be more specific we could paste the two image URI here and assert they match
                  assert(lowimageURI.includes("image/svg+xml"))
                  assert(highmageURI.includes("image/svg+xml"))
              })
          })
          describe("mint", () => {
              it("mints an NFt", async () => {
                  const tx = await dynamicSvg.mint(0)
                  await tx.wait(1)
                  const tokenCounter = await dynamicSvg.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "1")
              })
              it("emits an event when Nft created", async () => {
                  await expect(dynamicSvg.mint(9)).to.emit(dynamicSvg, "CreatedNFT")
              })
          })
          describe("tokenURI", () => {
              it("reverts if tokenId nonexistent", async () => {
                  await expect(dynamicSvg.tokenURI(1)).to.be.revertedWith(
                      "URI Query for nonexistent token"
                  )
              })
              it.only("Shows highSVG if price > highvalue", async () => {
                  const highValue = await ethers.utils.parseEther("100000000")
                  const tx = await dynamicSvg.mint(highValue)
                  await tx.wait(1)
                  const tokenURI = await dynamicSvg.tokenURI(0)
                  assert.equal(tokenURI, lowTokenURI)
              })
          })
      })
