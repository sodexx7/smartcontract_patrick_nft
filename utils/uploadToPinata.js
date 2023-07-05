const pinataSDK= require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
const { Console } = require("console")
require("dotenv").config()

const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret=process.env.PINATA_API_SECRET
const pinata= new pinataSDK(pinataApiKey,pinataApiSecret)

async function storeImages(imageFilePath){
    const fullImagePath = path.resolve(imageFilePath)
    const files = fs.readdirSync(fullImagePath)
    let responses = []
    console.log("Uploading to IPFS!")
    for(const fileindex in files){
        const readableStreamForFile = fs.createReadStream(`${fullImagePath}/${files[fileindex]}`)
        try{
            const options = {
                pinataMetadata: {
                    name: files[fileindex],
                },
            }
            const response =  await pinata.pinFileToIPFS(readableStreamForFile,options)
            responses.push(response)
        } catch(error){
            console.log(error)
        }
    }
    return {responses,files}
}

async function storeTokenUriMetadata(metadata){
    try{
        const options = {
            pinataMetadata: {
                name: metadata.name,
            },
        }
        const response = await pinata.pinJSONToIPFS(metadata,options)
        // console.log("pinjson",response)
        return response
    }catch(error){
        console.log(error)
    }
    return null;
}

module.exports = {storeImages,storeTokenUriMetadata}
