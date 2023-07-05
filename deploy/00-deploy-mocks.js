const {developmentChains} = require("../helper-hardhat-config")

const DECIMALS = "18"
const INITIAL_PRICE = ethers.utils.parseUnits("2000","ether")



const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9  // link per gas //link per gas calculated value based on the gas price of the chainId


// Eth price up $ 10000000000
// chainlink Nodes pay the gas fees to give us randomeness & d0 external execution
// So they price of requests changed based on the price of gas

module.exports = async ({getNamedAccounts,deployments})=>{
    const {deploy,log} = deployments
    const {deployer} = await getNamedAccounts()
    const args = [BASE_FEE,GAS_PRICE_LINK]

    // developmentChains the local testnet environments configs
    if(developmentChains.includes(network.name)){
        log("local network detected! Depployed mocks...");
        await deploy("VRFCoordinatorV2Mock",{
            from:deployer,
            log:true,
            args:args
        })
        await deploy("MockV3Aggregator",{
            from:deployer,
            log:true,
            args:[DECIMALS,INITIAL_PRICE]
        })
        log("Mocks Depployed!")
        log("------------------------")        
    }
}

module.exports.tags=["all","mocks"]