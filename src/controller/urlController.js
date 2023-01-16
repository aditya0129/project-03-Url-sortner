const shortid = require("shortid");
const urlModel = require("../model/urlModel")





const shortUrl = async(req,res)=>{
    try {
       
        let {longUrl,urlCode} = req.body
        if(!longUrl) return res.status(400).send({status:false,msg:"plz provide URL"})
        // if(!urlCode) return res.status(400).send({status:false,msg:"plz provide urlcode"})


        let checkUrlExist = await urlModel.findOne({longUrl:longUrl})
        if(checkUrlExist) {
            res.status(200).send({status:true,data:{shortUrl:checkUrlExist.shortUrl}})
        }else{
          
               
                let shortIdCode= shortid.generate()
           
            let shortUrl = await urlModel.create({longUrl:longUrl,shortUrl:`http://localhost:3000/${shortIdCode}`,urlCode:shortIdCode})
            console.log(shortUrl);
            res.status(201).send({status:true,data:shortUrl})
        }
        
    } catch (error) {
        console.log("error in shortUrl", error.message);
        res.status(500).send({error:error.message})
    }
}



const getUrl = async (req,res)=>{
    let {urlCode}= req.params
    console.log(shortUrl);

    let result = await urlModel.findOne({urlCode:urlCode})
    console.log(result);
    res.status(200).redirect(result.longUrl)
}





module.exports = {shortUrl,getUrl}