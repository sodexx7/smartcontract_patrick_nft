const { network,getNamedAccounts,ethers } = require("hardhat")
const { developmentChains,networkConfig} = require("../../helper-hardhat-config")
const { assert,expect} = require("chai")

developmentChains.includes(network.name)
    ?describe.skip
    :describe("BasicNft Staging Test",async function(){
        let basicNft,deployer
        
        
        beforeEach(async()=>{
            deployer = (await getNamedAccounts()).deployer
            // basicNft = await ethers.getContract("BasicNft", deployer)
            
            basicNft = await ethers.getContractAt("BasicNft","0x1351b9e6fb7918d255293da71ee4445d8969c082",deployer)
            // console.log("basicNft",basicNft)
        })

        describe("Constructor",()=>{
            it("Initializes the NFT correctly.",async()=>{
                
                const name = await basicNft.name()
                console.log("name",name)
                const symbol = await basicNft.symbol()
                console.log("symbol",symbol)
                const tokenCounter = await basicNft.getTokenCounter()
                console.log("tokenCounter",tokenCounter)
                assert.equal(name,"Dogie")
                assert.equal(symbol,"DOG")
                assert.equal(tokenCounter.toString(),"6")
            })
            
        })

        describe("Mint NFT",()=>{
            beforeEach(async()=>{
                const txResponse = await basicNft.mintNft()
                await txResponse.wait(6)
            })
            
            it("Allow users to mint an NFT,and updates appropriately",async function(){
                const tokenURI = await basicNft.tokenURI(0)
                const tokenCounter = await basicNft.getTokenCounter()

                assert.equal(tokenCounter.toString(),"7")
                assert.equal(tokenURI,await basicNft.TOKEN_URI())
            })

            it("Show the correct balance and ownere of an NFT", async function(){
                const deployerAddress = deployer.address 
                const deployerBalance = await basicNft.balanceOf(deployerAddress)
                const owner = await basicNft.ownerOf("7")

                assert.equal(deployerBalance.toString(),"7")
                assert.equal(owner,deployerAddress)
            })
        })
    })