const shortid = require("shortid");

const urlModel = require("../model/urlModel");
const validator = require("validator");
const axios = require("axios");

const shortUrl = async (req, res) => {
  try {
    if (Object.keys(req.body) === 0)
      return res.status(400).send({ status: false, message: "plz send url" });

    let { longUrl } = req.body;

    let validUrl = false;

    await axios(longUrl)
      .then((res) => {
        if (res.status == 201 || res.status == 200) {
          validUrl = true;
        }
      })
      .catch((err) => {
        console.log("error in url validation axios call", err);
      });

    if (validUrl == false)
      return res.status(400).send({ status: false, message: "Invalid Url" });

    if (!longUrl)
      return res.status(400).send({ status: false, msg: "plz provide URL" });

    if (!validator.isURL(longUrl))
      return res
        .status(400)
        .send({ status: false, message: "enter valid Url" });

    let checkUrlExist = await urlModel
      .findOne({ longUrl: longUrl })
      .select({ _id: 0, __v: 0 });

    if (checkUrlExist) {
      res
        .status(200)
        .send({
          status: true,
          message: "URL already exist",
          data: checkUrlExist,
        });
    } else {
      let shortIdCode = shortid.generate();

      let data = await urlModel.create({
        urlCode: shortIdCode,
        longUrl: longUrl,
        shortUrl: `${req.protocol}://${req.headers.host}/${shortIdCode}`,
      });
   

      let { _id, __v, ...otherData } = data._doc;
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

    let result = await urlModel.findOne({ urlCode: urlCode });

    if (!result)
      return res.status(404).send({
        status: false,
        message: `URL Not found with this code ${urlCode}`,
      });

    if (result) {
      return res.status(302).redirect(result.longUrl);
    }
  } catch (error) {
    console.log("error in geturl", error.message);
    res.send({ error: error.message });
  }
};

module.exports = { shortUrl, getUrl };
