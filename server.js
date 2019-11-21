const http = require("http");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer"); // v1.0.5
const upload = multer();
const express = require("express"),
  app = express();
const router = express.Router();
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.gmail,
    pass: process.env.pas
  }
});
async function elchapo() {
  var student = require(process.env.pat);
  //var student = require("/app/.data/users.json"); /*gets json file containing user details*/
  var users = student["users"];
  var admission; /*variable to store admission status*/
  var user;
  for (user of users) {
    try {
      const browser = await puppeteer.launch({
        args: ["--no-sandbox"]
      });
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(4000);
      await page.goto("https://www.jamb.org.ng/eFacility./");
      await page.focus("#email");
      await page.keyboard.type(user["mail"]);
      await page.focus("#password");
      await page.keyboard.type(user["password"]);
      await page.click("#lnkLogin");
      await page.waitForSelector("#ctl00");
      await page.evaluate(() => {
        document.querySelectorAll("a[href='CAPSDirect']")[0].click();
      });
      await page.waitForNavigation({ waitUntil: "networkidle0" });
      await page.evaluate(() => {
        document.querySelectorAll("span[class='nav-label']")[3].click();
      });
      await page.waitForNavigation({ waitUntil: "networkidle0" });
      admission = await page.evaluate(() => {
        return document.querySelectorAll("div[class='col-lg-6']")[4].innerHTML;
      });
      await page.screenshot({ path: __dirname + "/public/puppetr.png" });
      await browser.close();
      var message = {
        from: "autocapsbot@gmail.com", // sender address
        to: user["email"], // list of receivers
        subject: "Subject of your email", // Subject line
        html: admission // plain text body
      };
      await console.log({ text: admission });
      transporter.sendMail(message);
      /*transporter.sendMail({
        from: 'autocapsbot@gmail.com',
        to: 'owoeyepo@gmail.com',
        subject: 'Message',
        text: 'I hope this message gets delivered!'
    })*/
      console.log("sent!");
    } catch (error) {
      function check() {
        return user;
      }
      //console.error(error);
      //users.splice(users.findIndex(user), 1);
      //fs.writeFileSync("public/new.json", JSON.stringify({"users": users}));
      //console.log(users.findIndex(check))
      console.log(user)
    }
  }
}

var now = new Date();
var hour = now.getHours();
var minutes = now.getMinutes();
console.log(hour);
console.log(minutes);
if (hour == 16){
  console.log("Time to Send!");
  setTimeout(elchapo,43200)
};
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());
router.get("/", async function (req, res) {
  res.sendFile(path.join(__dirname + "/public/index.html"));
  console.log("response");
});
router.get("/style.css", async function(req, res) {
  res.sendFile(path.join(__dirname + "/public/style.css"));
  console.log("response");
});
router.get("/client.js", async function(req, res) {
  res.sendFile(path.join(__dirname + "/public/client.js"));
  console.log("response");
});
app.post("/form", upload.array(), async function(req, res, next) {
  console.log(req.body);
  var data = JSON.parse(fs.readFileSync(process.env.pat)); 
  data.users.push(req.body);
  console.log(data);
  fs.writeFileSync(process.env.pat, JSON.stringify(data));
  res.json(data);
});
app.use("/", router);
app.listen(3000);