const express = require("express");
const fs = require("fs");
const puppeteer = require('puppeteer-core');
const path = require("path");
const bodyParser = require('body-parser');
//'chrome' | 'chrome-beta' | 'chrome-canary' | 'chrome-dev'
const pdfGenerator = async (content,margins=null) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        // Use puppeteer-core's executablePath to reference the bundled Chromium
        executablePath: puppeteer.executablePath('chrome'),
    });
    const page = await browser.newPage();
    await page.setContent(content);

    try {
        return await page.pdf({
            margin: margins??{bottom:0,left:0,right:0,top:0},
            printBackground: true,
            preferCSSPageSize:true,
            format:"A4",
        });
    } catch (e) {
        throw new Error(`Error generating PDF: ${e.message}`);
    } finally {
        await browser.close();
    }
}

const app = express();
const port = 3000;
app.use(express.json({ limit: '50mb' }));
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
            const pdf = await pdfGenerator(data.html,data.margins);
            await fs.promises.writeFile(`${__dirname}/pdfs/${fileName}.pdf`, pdf);
        }

        res.sendFile(`${fileName}.pdf`, {
            root: path.join(__dirname + "/pdfs")
        }, function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ message: "Error sending PDF" });
            } else {
                fs.promises.unlink(`${__dirname}/pdfs/${fileName}.pdf`)
                    .catch(error => console.error("Error deleting PDF file:", error));
            }
        });
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: e.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
