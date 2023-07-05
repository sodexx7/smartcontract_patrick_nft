const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages,storeTokenUriMetadata} = require("../utils/uploadToPinata")

const imageLocation = "./images/randomNFT"

const metadataTemplate = {
    name:"",
    description:"",
    image:"",
    attributes:[
        {
            trait_type:"Cuteness",
            value:100,
        }
    ]
}
let toeknUris =   [
    'ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo',
    'ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d',
    'ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm'
  ]
const FUND_AMOUNT = "1000000000000000000000" //  ethers.utils.parseEther("1")  todo

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId 
    
    // get the IPFS hashes of our images
    if(process.env.UPLOAD_TO_PINATA == "true"){
        toeknUris = await handleTokenUris()
    }
    // 1. With out own IPFS Nodes https://docs.ipfs.tech/
    // 2. Pinata 
    // 3. nft.storage

    let vrfCoordinatorV2Mock,vrfCoordinatorV2Address, subScriptionId
    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txRecepit = await tx.wait(1)
        subScriptionId = txRecepit.events[0].args.subId
        await vrfCoordinatorV2Mock.fundSubscription(subScriptionId,FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfcoordinatorv2"]
        subScriptionId = networkConfig[chainId]["subscriptionId"]
    }
    log("-------------------------------------------------------")
    const args = [
        vrfCoordinatorV2Address,
        subScriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        toeknUris,
        networkConfig[chainId].mintFee
    ]
    const randomIpfsNft = await deploy("RandomIpfsNft",{
        from:deployer,
        args:args,
        log:true,
        waitConfirmations:network.config.blockConfirmations || 1,
    })
    log("-------------------------------------------------------")


    if(developmentChains.includes(network.name)){
        await vrfCoordinatorV2Mock.addConsumer(subScriptionId,randomIpfsNft.address)
        console.log("Consumer add subScriptionId randomIpfsNft.address",subScriptionId,randomIpfsNft.address)
        log("Consumer is added")
    }


    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying......")
        await verify(randomIpfsNft.address,args)
    }

}


async function handleTokenUris(){
    toeknUris = []
    // store the image in IPFS
    // Store the metadata in IPFS 
    const { responses:imageUploadResponse,files } = await storeImages(imageLocation)
    for(const imageUploadResponseIndex in imageUploadResponse){
        // create metadata
        // upload the metadata
        let toeknUrisMetadata = {...metadataTemplate}
        toeknUrisMetadata.name = files[imageUploadResponseIndex].replace(".png","")
        toeknUrisMetadata.description = `An adorable ${toeknUrisMetadata.name} pup!`
        toeknUrisMetadata.image = `ipfs://${imageUploadResponse[imageUploadResponseIndex].IpfsHash}`
        console.log(`Uploading ${toeknUrisMetadata.name}...`)
        // store the json to ipfs/pinata 
        const metadataUploadResponse =  await storeTokenUriMetadata(toeknUrisMetadata)
        toeknUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Token URIs Uploaded! They are:")
    console.log(toeknUris)
    return toeknUris
}

module.exports.tags = ["all","randomipfs","main"]

