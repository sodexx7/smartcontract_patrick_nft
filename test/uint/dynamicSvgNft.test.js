const { assert, expect } = require("chai")
const { network,deployments,ethers} = require("hardhat")
const { developmentChains,networkConfig} = require("../../helper-hardhat-config")


!developmentChains.includes(network.name)
    ? describe.skip
    : describe("DynamicSvgNft  Uint Tests",function(){
        let MockV3Aggregator,DynamicSvgNft,deployer,other_caller,currentEthPrice

        beforeEach(async function(){
            const accounts = await ethers.getSigners()
            deployer = accounts[0]
            other_caller = accounts[1]
            await deployments.fixture(["all"])
            DynamicSvgNft = await ethers.getContract("DynamicSvgNft",deployer)
            MockV3Aggregator = await ethers.getContract("MockV3Aggregator",deployer)
            const currentEthPrice = await MockV3Aggregator.latestRoundData();
            console.log("priceData",parseInt(ethers.utils.formatUnits((parseInt(currentEthPrice.answer)).toString(),18))); // reference github
        })

        describe("Constructor",()=>{
            it("Initializes the DynamicSvgNft correctly.",async()=>{
                // display some infos  todo have more infos? 
                const name = await DynamicSvgNft.name()
                const symbol = await DynamicSvgNft.symbol()
                assert.equal(name,"Dynamic SVG NFT")
                assert.equal(symbol,"DSN")
            })
        })

        describe("Mint NFT",()=>{

            it("emit CreateNFT event while mint an NFT",async function(){
                await expect(DynamicSvgNft.mintNft(currentEthPrice)).to.emit(DynamicSvgNft,"CreateNFT") 

            })
            
            it("emit CreateNFT event  mint an NFT while the input value is higher than latest eth price",async function(){
                await DynamicSvgNft.mintNft(currentEthPrice+1)
                const tokenId = await  RandomIpfsNft.balanceOf(deployer.address)
                const tokenURIString = await   RandomIpfsNft.tokenURI(tokenId)
                console.log("happyImage",tokenURIString)

            })

            it("mint an NFT while the input value is smaller than latest eth price",async function(){
                await DynamicSvgNft.mintNft(currentEthPrice-1)
                const tokenId = await RandomIpfsNft.connect(other_caller).balanceOf(deployer.address)
                const tokenURIString = await   RandomIpfsNft.tokenURI(tokenId)
                console.log("sadImage",tokenURIString)
            })

            // it("Show the correct balance and ownere of an NFT", async function(){
            //     const deployerAddress = deployer.address 
            //     const deployerBalance = await basicNft.balanceOf(deployerAddress)
            //     const owner = await basicNft.ownerOf("0")

            //     assert.equal(deployerBalance.toString(),"1")
            //     assert.equal(owner,deployerAddress)
            // })
        })
      
    })