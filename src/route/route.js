
const express = require("express")
const router = express.Router()
const {shortUrl, getUrl}= require("../controller/urlController.js")


router.post("/url/shorten", shortUrl)
router.get("/:urlCode", getUrl)




router.all("/*", (req,res)=>{
    res.status(400).send({msg:"plz send correct url"})
})



module.exports=router