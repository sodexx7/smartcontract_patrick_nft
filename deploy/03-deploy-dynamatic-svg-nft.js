const {network} = require("hardhat")
const {developmentChains, networkConfig} = require("../helper-hardhat-config")
const {verify} = require("../utils/verify")
const fs = require("fs")

// require("hardhat-deploy")  => {getNamedAccounts,deployments}
module.exports = async function({getNamedAccounts,deployments}){
    const {deploy,log} = deployments
    const {deployer} = await getNamedAccounts()

    const chainId = network.config.chainId
    let ethusdPriceFeedAddress

    if(developmentChains.includes(network.name)){
        const ethUsdAggregator = await ethers.getContract("MockV3Aggregator")
        ethusdPriceFeedAddress = ethUsdAggregator.address 
    } else{
        ethusdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }
    log("---------------------------")
    const lowSVG = await fs.readFileSync("./images/dynamaicNft/frown.svg",{encoding:"utf8"})
    const highSVG = await fs.readFileSync("./images/dynamaicNft/happy.svg",{encoding:"utf8"})


    args = [ethusdPriceFeedAddress,lowSVG,highSVG]
    const dynamaicNft = await deploy("DynamicSvgNft",{
        from:deployer,
        args:args,
        log:true,
        waitConfirmations:network.config.blockConfirmations || 1,
    })

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying......")
        await verify(dynamaicNft.address,args)
    }
}

module.exports.tags = ["all","dynamicSvgNft","main"]