// const  {ethers}  = require("hardhat")
const  ethers  = require("@nomicfoundation/hardhat-ethers");
console.log("ethers")
console.log(ethers)

const networkConfig = {
    11155111: {
        name: "sepolia",
        vrfcoordinatorv2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        mintFee:ethers.parseEther("0.01"), 
        gasLane:"0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        subscriptionId:"0",
        callbackGasLimit:"500000",// 500,000
        interval:"30"

    },
    5: {
        name: "goerli",
        vrfcoordinatorv2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        mintFee:ethers.parseEther("0.01"),
        gasLane:"0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId:"11114",
        callbackGasLimit:"500000" ,// 500,000
        interval:"30",
        ethUsdPriceFeed:"0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"

    },
    31337:{
        name:"hardhat",
        mintFee: ethers.utils.parseEther("0.01"),
        gasLane:"0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        callbackGasLimit:"500000",// 500,000
        interval:"30"
    }
    

}

const developmentChains = ["hardhat","localhost"]

module.exports={
    networkConfig,
    developmentChains
}