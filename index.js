const express = require("express");
const fs = require("fs");
const puppeteer = require('puppeteer');
const path = require("path");
import bodyParser from 'body-parser';


const pdfGenerator = async (content) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(content);
    return await page.pdf({
        margin: {bottom: '50mm'},
        printBackground: true,
    });
}


const app = express();
const port = 3000;
app.use(express.json({limit: '50mb'}));
app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: '50mb',
        parameterLimit: 50000,
    }),
);

app.post('', async (req, res) => {
    let data = req.body;
    const fileName = data.fileName;
    try {
        if (!fs.existsSync(`${__dirname}/pdfs/${fileName}.pdf`)) {
            const pdf = await pdfGenerator(data.html);
            await fs.promises.writeFile(`${__dirname}/pdfs/${fileName}.pdf`, pdf);
        }
        await res.sendFile(`${fileName}.pdf`, {
            root: path.join(__dirname + "/pdfs")
        }, function (err) {
            if (err) {
                console.log(err);
            } else {
                fs.promises.unlink(`${__dirname}/pdfs/${fileName}.pdf`)
            }

        });
    } catch (e) {
        res.status(400);
        res.send();
    }
});
app.listen(port);