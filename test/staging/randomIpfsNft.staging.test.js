const { network,getNamedAccounts,ethers } = require("hardhat")
const { developmentChains,networkConfig} = require("../../helper-hardhat-config")
const { assert,expect} = require("chai")

// test net should add to RandomIpfsNft the vrt https://vrf.chain.link/goerli/11114
// for the vrf should add subId, for the customer should add subID when it constructs

developmentChains.includes(network.name)
    ?describe.skip
    :describe("RandomIpfsNft  Staging Tests",async function(){
        let RandomIpfsNft,deployer,other_caller,RandomIpfsNft_mintFee

        beforeEach(async function(){
            RandomIpfsNft_mintFee = networkConfig[network.config.chainId].mintFee
            const accounts = await ethers.getSigners()
            // const accountTest =await getNamedAccounts()
            // console.log(accountTest)
            deployer = accounts[0]
            other_caller = accounts[1]
            RandomIpfsNft = await ethers.getContractAt("RandomIpfsNft","0x5010c99daA9eF9C9f9B0F92cC1d06e28fd00AEEd",deployer)
        })


        // describe("Constructor",function(){
        //     it("Initializes the RandomIpfsNft correctly.",async function(){
        //         const name = await RandomIpfsNft.name()
        //         console.log("name",name)
        //         const symbol = await RandomIpfsNft.symbol()
        //         console.log("symbol",symbol)
        //         const tokenCounter = await RandomIpfsNft.getTokenCounter()
        //         console.log("tokenCounter",tokenCounter)
        //         const toeknUris0 = await RandomIpfsNft.getDogTokenUris(0)
        //         const toeknUris1 = await RandomIpfsNft.getDogTokenUris(1)
        //         console.log("toeknUris1",toeknUris1)
        //         const toeknUris2 = await RandomIpfsNft.getDogTokenUris(2)
        //         console.log("toeknUris2",toeknUris2)
        //         const mintFee = await RandomIpfsNft.getMintFee()
        //         console.log("mintFee",mintFee)
                
        //         assert.equal(name.toString(),"Rondom IPFS NFT")

        //         assert.equal(symbol,"RIN")
        //         assert.equal(tokenCounter.toString(),"0")

        //         assert.equal(toeknUris0,"ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo")
        //         assert.equal(toeknUris1,"ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d")
        //         assert.equal(toeknUris2,"ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm")
        //         assert.equal(mintFee.toString(),RandomIpfsNft_mintFee)
        //         })
        // })

        describe("requestNft",function(){
            it("reverts when don't pay enough mintFee",async function(){
                await expect(RandomIpfsNft.requestNft({value:0})).to.be.reverted
                // await expect(RandomIpfsNft.requestNft()).to.be.revertedWith("RandomIpfsNft_NeedMoreETHSent")
            })
            // it("emits event on requestNft",async function(){
            //     await expect(RandomIpfsNft.requestNft({value:RandomIpfsNft_mintFee})).to.emit(RandomIpfsNft,"NftRequested") 
            // })
           
        })


        describe("fulfillRandomWords",function(){

            beforeEach(async function(){
                await RandomIpfsNft.requestNft({value:RandomIpfsNft_mintFee})
            })
            
            it("Nft success minted ",async function(){
                await new Promise(async(resolve,reject)=>{
                    RandomIpfsNft.on("NftMinted",async ()=>{
                        console.log("Found the event!")
                        try {
                            const tokenCounter = await  RandomIpfsNft.getTokenCounter() // 0=>1 ==1 
                            assert.equal(tokenCounter.toString(),1)

                            const tokenId = await  RandomIpfsNft.balanceOf(deployer.address)
                            console.log("owner,tokeId",deployer.address,tokenId)
                            assert.equal(tokenId.toString(),1)
                            
                        }catch(e){
                            reject(e)
                        }
                        resolve()
                    })
                })
            })
        })

        // describe("withdraw",function(){

        //     it("withdraw fail by non-owner",async()=>{
        //         await expect(RandomIpfsNft.connect(other_caller).withdraw()).to.be.revertedWith("Ownable: caller is not the owner"); 

        //     })

        //     // it("withdraw fail when ther are no eth in RandomIpfsNft",async()=>{
        //     //     // toodo , creat one smart contract, which can't received the eth
        //     //     await expect(RandomIpfsNft.withdraw()).to.be.revertedWith("RandomIpfsNft_TransferFailed"); 
        //     // })

        //     it("withdraw successed after requestNft called",async()=>{
        //         const balanceBefore = await RandomIpfsNft.provider.getBalance(RandomIpfsNft.address);
        //         console.log("balanceBefore",balanceBefore)
        //         await RandomIpfsNft.requestNft({value:RandomIpfsNft_mintFee})
        //         const balanceAfter = await RandomIpfsNft.provider.getBalance(RandomIpfsNft.address)
        //         assert.equal(balanceAfter,RandomIpfsNft_mintFee);
        //         await RandomIpfsNft.withdraw()
        //         const balanceLast = await RandomIpfsNft.provider.getBalance(RandomIpfsNft.address)
        //         assert.equal(balanceLast,0);
        //     })


        //     it("withdraw 0 while not call requestNft ",async()=>{
        //         const balanceBefore = await RandomIpfsNft.provider.getBalance(RandomIpfsNft.address);
        //         assert.equal(balanceBefore,0);
        //         console.log("balanceBefore",balanceBefore)
        //         await RandomIpfsNft.withdraw()
        //         const balanceLast = await RandomIpfsNft.provider.getBalance(RandomIpfsNft.address)
        //         assert.equal(balanceLast,0);
        //     })
        // })


        // describe("Expection test",function(){

        //     it("getBreedFromModdedRng test success",async()=>{
        //         // const random_number  = random.int(0, 100)
        //         const result = await RandomIpfsNft.getBreedFromModdedRng(99)
        //         // todo equal many values 
        //         console.log("success result",result) 
            
        //     })

        //     it("getBreedFromModdedRng test expection",async()=>{
        //         // const random_number  = random.int(100, )
        //         await expect(RandomIpfsNft.getBreedFromModdedRng(200)).to.be.revertedWith("RandomIpfsNft_RangeOutOfBounds") 
                
        //     })
        // })

    })

