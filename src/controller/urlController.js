const shortid = require("shortid");

const urlModel = require("../model/urlModel");
const validator = require("validator");
const axios = require("axios");
const redis = require("redis");
const { promisify } = require("util");





//1. Connect to the redis server
const redisClient = redis.createClient(
  19994,
  "redis-19994.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("E6ceB1AxfJWzBfnhwQZP4Xc46ksNgdoT", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});



//2. Prepare the functions for each command

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);
















const shortUrl = async (req, res) => {
  try {
    if (Object.keys(req.body) === 0)
      return res.status(400).send({ status: false, message: "plz send url" });

    let { longUrl } = req.body;
   
    // let validUrl = false;

    // await axios(longUrl)
    //   .then((res) => {
    //     if (res.status == 201 || res.status == 200) {
    //       validUrl = true;
    //     }
    //   })
    //   .catch((err) => {});

    // if (validUrl === false)
    //   return res.status(400).send({ status: false, message: "Invalid Url" });

    if (!longUrl)
      return res.status(400).send({ status: false, msg: "plz provide URL" });

    if (!validator.isURL(longUrl))
      return res
        .status(400)
        .send({ status: false, message: "enter valid Url" });

       let getDataCache = await GET_ASYNC(`${req.body.longUrl}`)
       getDataCache = JSON.parse(getDataCache)
      //  console.log(getDataCache);

       if(getDataCache) return res.status(200).send({status:true,data:getDataCache,msg:"hit"})

    let checkUrlExist = await urlModel
      .findOne({ longUrl: longUrl })
      .select({ _id: 0, __v: 0 });

      if (checkUrlExist) {
      await SET_ASYNC(`${req.body.longUrl}`,JSON.stringify(checkUrlExist))
     return res.status(200).send({
          status: true,
          message: "URL already exist",
          data: checkUrlExist,
          msg:"hit 2"
        });
    } else {
      let shortIdCode = shortid.generate();

      let data = await urlModel.create({urlCode: shortIdCode,longUrl: longUrl,shortUrl: `${req.protocol}://${req.headers.host}/${shortIdCode}`,
      });
      
      
      let { _id, __v, ...otherData } = data._doc;
      await SET_ASYNC(`${req.body.longUrl}`,JSON.stringify(otherData))
      res.status(201).send({ status: true, data: otherData });
    }
  } catch (error) {
    console.log("error in shortUrl", error.message);
    res.status(500).send({ error: error.message });
  }
};

const getUrl = async (req, res) => {
  try {
    let { urlCode } = req.params;

    if (!urlCode)
      return res
        .status(400)
        .send({ status: false, message: "plz provide urlCode" });
    // get 
    let getDataCache = await GET_ASYNC(`${req.params.urlCode}`)
    console.log(getDataCache)
    if(getDataCache){

      return res.status(302).redirect(getDataCache)
    
    }
      
   
    let result = await urlModel.findOne({ urlCode: urlCode });
    
    console.log(JSON.stringify(result.longUrl))
    if (!result)
      return res.status(404).send({
        status: false,
        message: `URL Not found with this code ${urlCode}`,
      });

    if (result) {
      await SET_ASYNC(`${req.params.urlCode}`,JSON.stringify(result.longUrl))
      return res.status(302).redirect(result.longUrl);
    }
  } catch (error) {
    console.log("error in geturl", error.message);
    res.send({ error: error.message });
  }
};

module.exports = { shortUrl, getUrl };
