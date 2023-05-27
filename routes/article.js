const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const http = require("http");
const summarize = require("../func/openaicom");
const { title } = require("process");
const artRouter = express.Router();

const fetchImageSize = require("../func/getImagesize");

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

const testfunc = async (url, prompt, withimg) => {
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
    if (withimg) {
      $("img").each((index, element) => {
        var imgUrl = $(element).attr("src");
        if (imgUrl.slice(0, 4) !== "http") {
          const uurl = new URL(url);
          const mainurl = uurl.origin;
          imgUrl = mainurl + "/" + imgUrl;
        }
        imageUrls.push(imgUrl);
      });

      imageUrls = imageUrls.filter(
        (item) =>
          item.slice(item.length - 4, item.length) !== ".svg" &&
          item.slice(item.length - 4, item.length) !== ".png"
      );
    }
  });

  var mainImgUrl = "";

  if (withimg) {
    mainImgUrl = await findBiggestImage(imageUrls)
      .then((mainImgUrl) => {
        return mainImgUrl;
      })
      .catch((error) => {
        console.error("Error finding the biggest image:", error);
      });
  }
  const summarizedContent = await summarize(`${contents} \n ${prompt[0]}`);
  const summarizedHeadline = await summarize(`${contents} \n ${prompt[1]}`);
  return {
    url: url,
    headline: summarizedHeadline,
    content: summarizedContent,
    imgurl: mainImgUrl
  };
};

// "Summarize this article as " +
//   styles +
//   ".\n" +
//   "Write a summary with " +
//   tones +
//   ".";
// POST
artRouter.post("/", async (req, res) => {
  const urls = req.body.urls;
  const tones = req.body.tones;
  const styles = req.body.styles;
  const withimg = req.body.withimg;
  const withemoji = req.body.withemoji;
  // const prompt = `\n Create summarized content as ${styles} with ${tones} topic as text foramt and create headline from this article as json format. The keys are 'headline' and 'content'`;
  const prompt11 = `Summarize this articel as ${styles} which contanins different emojis at the first of every sentance and these emojis are related with the content of each sentance or paragraph, and as the topic of ${tones}`;
  var prompt1 = "";
  if (!withemoji) {
    prompt1 = `Summarize this articel as ${styles} and as the topic of ${tones}`;
  } else {
    prompt1 = `Summarize this articel as ${styles} which contanins different emojis at the first of every sentance and these emojis are related with the content of each sentance or paragraph, and as the topic of ${tones}`;
  }
  const prompt2 = "Create headline of this artice";
  const result = await Promise.all(
    urls.map((url) => testfunc(url, [prompt1, prompt2], withimg))
  );
  // const totalcontents = result.map((item) => {
  //   return item.content;
  // });

  // const totalresult = await summarize(totalcontents + "\\n" + prompt);
  res.status(201).send({
    result: result
    // totalreulst: totalresult
  });
});

module.exports = artRouter;
