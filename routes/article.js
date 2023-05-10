const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const request = require("request");
const http = require("http");
const summarize = require("../openaicom");
const { title } = require("process");
const artRouter = express.Router();

const fetchImageSize = require("../getImagesize");

async function findBiggestImage(imageUrls) {
  try {
    let biggestImageUrl = "";
    let biggestImageSize = 0;

    for (const imageUrl of imageUrls) {
      await fetchImageSize(imageUrl)
        .then((imageSize) => {
          const size = imageSize.width * imageSize.height;
          if (size > biggestImageSize) {
            biggestImageUrl = imageUrl;
            biggestImageSize = size;
          }
        })
        .catch((error) => {
          console.error("Error fetching image size:", error);
        });
    }

    return biggestImageUrl;
  } catch (error) {
    console.error("Error finding the biggest image:", error);
  }
}

const testfunc = async (url, prompt) => {
  var contents = [];
  var imageUrls = [];
  var title = "";

  await axios.get(url).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);
    title = $("title").text();
    $("p").each((index, element) => {
      const text = $(element).text();
      contents.push(text);
    });
    $("img").each((index, element) => {
      const imgUrl = $(element).attr("src");
      imageUrls.push(imgUrl);
    });
    imageUrls = imageUrls.filter(
      (item) =>
        item.slice(item.length - 4, item.length) !== ".svg" &&
        item.slice(item.length - 4, item.length) !== ".png"
    );
    imageUrls = imageUrls.filter((item) => item.slice(0, 4) == "http");
  });

  const summarizedContent = await summarize(contents + "\\n" + prompt);
  const mainImgUrl = await findBiggestImage(imageUrls)
    .then((mainImgUrl) => {
      return mainImgUrl;
    })
    .catch((error) => {
      console.error("Error finding the biggest image:", error);
    });
  return {
    url: url,
    headline: title,
    content: summarizedContent,
    imgurl: mainImgUrl,
  };
};

// POST
artRouter.post("/", async (req, res) => {
  const urls = req.body.urls;
  const prompt = req.body.prompt;

  const result = await Promise.all(urls.map((url) => testfunc(url, prompt)));
  const totalcontents = result.map((item) => {
    return item.content;
  });

  const totalresult = await summarize(totalcontents + "\\n" + prompt);
  res.status(201).send({
    result: result,
    totalreulst: totalresult,
  });
});

module.exports = artRouter;
