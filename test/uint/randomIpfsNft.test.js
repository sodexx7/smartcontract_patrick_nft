const { assert, expect } = require("chai")
const { network,deployments,ethers} = require("hardhat")
const { developmentChains,networkConfig} = require("../../helper-hardhat-config")


// basic funciton create or import  require chai
// which funciton should test 
    // create constrcuct  done 
    // mock vrf in local network done 
    // withdraw funciton test  done
    // all the emit or errors tested. todo: RandomIpfsNft_TransferFailed
 

// questions:
// when test RandomIpfsNft, how to use or connected  VRFCoordinatorV2Mock ?
    // When test in the local network, should deployed VRFCoordinatorV2Mock into localhost

// tips
//  1. test funcitons can reuse the deployed functions 

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIpfsNft  Uint Tests",function(){
        let vrfCoordinatorV2Mock,RandomIpfsNft,deployer,other_caller,RandomIpfsNft_mintFee

        beforeEach(async function(){
            const accounts = await ethers.getSigners()
            deployer = accounts[0]
            other_caller = accounts[1]
            await deployments.fixture(["all"])
            RandomIpfsNft = await ethers.getContract("RandomIpfsNft",deployer)
            RandomIpfsNft_mintFee = networkConfig[network.config.chainId].mintFee.toString()
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock",deployer)
        })

        describe("Constructor",()=>{
            it("Initializes the RandomIpfsNft correctly.",async()=>{
                const name = await RandomIpfsNft.name()
                const symbol = await RandomIpfsNft.symbol()
                const tokenCounter = await RandomIpfsNft.getTokenCounter()
                const toeknUris0 = await RandomIpfsNft.getDogTokenUris(0)
                const toeknUris1 = await RandomIpfsNft.getDogTokenUris(1)
                const toeknUris2 = await RandomIpfsNft.getDogTokenUris(2)
                const mintFee = await RandomIpfsNft.getMintFee()

                
                assert.equal(name,"Rondom IPFS NFT")
                assert.equal(symbol,"RIN")
                assert.equal(tokenCounter.toString(),"0")

                assert.equal(toeknUris0,"ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo")
                assert.equal(toeknUris1,"ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d")
                assert.equal(toeknUris2,"ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm")
                // console.log("networkConfig[network.config.chainId]",networkConfig[network.config.chainId])
                // console.log("networkConfig[network.config.chainId].mintFee",networkConfig[network.config.chainId].mintFee.toString())
                assert.equal(mintFee,RandomIpfsNft_mintFee)

            })
        
            describe("requestNft",function(){
                // todo1: more test case scenarios, using foundry fuzze, such as more mintFee, or less mintFee
                // todo2: how to get the value of s_requestIdToSender 
                it("reverts when don't pay enough mintFee",async function(){
                    await expect(RandomIpfsNft.requestNft()).to.be.revertedWith("RandomIpfsNft_NeedMoreETHSent")
                })

                // it("record requestId to msg.sender when requestNft success",async function(){
                //     await RandomIpfsNft({value:RandomIpfsNft_mintFee})
                //     // RandomIpfsNft.get

                // })
                it("emits event on requestNft",async function(){
                    const tx = await RandomIpfsNft.requestNft({value:RandomIpfsNft_mintFee})
                    // console.log("tx",tx)
                    const txRecepit = await tx.wait(1)
                    // todo 1. two transactions in one call, get the requestId and requester
                    // tood 2. why requestNft can't directly get rhe requestId as there are returns(UINT256)
                    // console.log("txRecepit-all",txRecepit)
                    // console.log("requestId-0",txRecepit.events[0].topics)
                    // console.log("requestId-1",txRecepit.events[1].args.requestId)
                    await expect(RandomIpfsNft.requestNft({value:RandomIpfsNft_mintFee})).to.emit(RandomIpfsNft,"NftRequested") 
                })
               
            })
        })
        // when call fulfillRandomWords. the fulfillRandomWords is callback funciton when requestRandomWords is success exected.
        describe("fulfillRandomWords",function(){

            // first assume the nft success minted 
            beforeEach(async function(){
                const tx = await RandomIpfsNft.requestNft({value:RandomIpfsNft_mintFee})
                // console.log("tx",tx)
                const txRecepit = await tx.wait(1)
                // console.log("txRecepit",tx)
                const tx1 = await vrfCoordinatorV2Mock.fulfillRandomWords(txRecepit.events[1].args.requestId.toString(),RandomIpfsNft.address)
            })
            
            // todo RandomIpfsNft_RangeOutOfBounds test 
            // todo NftMinted
            it("Nft success minted ",async function(){
                await new Promise(async(resolve,reject)=>{
                    RandomIpfsNft.on("NftMinted",async ()=>{
                        console.log("Found the event!")
                        try {
                            // console the nft address 
                            // _safeMint(dogOwner, newTokenId);
                            // tokenId=> owner ?=>url
                            //  tokenId => url 
                            // toodo ,more case test 
                            const tokenCounter = await  RandomIpfsNft.getTokenCounter() // 0=>1 ==1 
                            assert.equal(tokenCounter.toString(),1)

                            // const DogTokenUris = await  RandomIpfsNft.getDogTokenUris(0) // have testd in the Initializes the RandomIpfsNft correctly.
                            // console.log("DogTokenUris",DogTokenUris)

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

        describe("withdraw",function(){
            // let txRandomIpfsNft;

            beforeEach(async function(){
                // txRandomIpfsNft = await RandomIpfsNft.requestNft({value:RandomIpfsNft_mintFee})
                // console.log("tx",tx)
                // const txRecepit = await tx.wait(1)
                // // console.log("txRecepit",tx)
                // const tx1 = await vrfCoordinatorV2Mock.fulfillRandomWords(txRecepit.events[1].args.requestId.toString(),RandomIpfsNft.address)
            })

            it("withdraw fail by non-owner",async()=>{
                await expect(RandomIpfsNft.connect(other_caller).withdraw()).to.be.revertedWith("Ownable: caller is not the owner"); 

            })

            // it("withdraw fail when ther are no eth in RandomIpfsNft",async()=>{
            //     // toodo , creat one smart contract, which can't received the eth
            //     await expect(RandomIpfsNft.withdraw()).to.be.revertedWith("RandomIpfsNft_TransferFailed"); 
            // })

            it("withdraw successed after requestNft called",async()=>{
                // test todo owner's balance 
                const balanceBefore = await RandomIpfsNft.provider.getBalance(RandomIpfsNft.address);
                console.log("balanceBefore",balanceBefore)
                await RandomIpfsNft.requestNft({value:RandomIpfsNft_mintFee})
                const balanceAfter = await RandomIpfsNft.provider.getBalance(RandomIpfsNft.address)
                assert.equal(balanceAfter,RandomIpfsNft_mintFee);
                await RandomIpfsNft.withdraw()
                const balanceLast = await RandomIpfsNft.provider.getBalance(RandomIpfsNft.address)
                assert.equal(balanceLast,0);

                // const txRecepit = await txRandomIpfsNft.wait(1)
                // await vrfCoordinatorV2Mock.fulfillRandomWords(txRecepit.events[1].args.requestId.toString(),RandomIpfsNft.address)
            
            })

            it("withdraw 0 while not call requestNft ",async()=>{
                const balanceBefore = await RandomIpfsNft.provider.getBalance(RandomIpfsNft.address);
                assert.equal(balanceBefore,0);
                console.log("balanceBefore",balanceBefore)
                await RandomIpfsNft.withdraw()
                const balanceLast = await RandomIpfsNft.provider.getBalance(RandomIpfsNft.address)
                assert.equal(balanceLast,0);
            })
        })

        describe("Expection test",function(){

            it("getBreedFromModdedRng test success",async()=>{
                // const random_number  = random.int(0, 100)
                const result = await RandomIpfsNft.getBreedFromModdedRng(99)
                // todo equal many values 
                console.log("success result",result) 
            
            })

            it("getBreedFromModdedRng test expection",async()=>{
                // const random_number  = random.int(100, )
                await expect(RandomIpfsNft.getBreedFromModdedRng(200)).to.be.revertedWith("RandomIpfsNft_RangeOutOfBounds") 
                
            })
        })
    })





//  fulfillRandomWords

// local environment test 
// fist deploy the needed vrf contracts

// test nets test
