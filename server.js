import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";

const app = express();
app.use(cors());

let browser;

// Initialize browser on startup
async function initBrowser() {
    browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
}

app.get("/warp/:url", async (req, res) => {
    try {
        const target = decodeURIComponent(req.params.url);

        // Validate URL
        if (!target.startsWith("http")) {
            return res.status(400).send("Invalid URL format");
        }

        // Create a new page
        const page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({ width: 1280, height: 720 });

        // Navigate to the URL with timeout
        await page.goto(target, { waitUntil: "networkidle2", timeout: 30000 });

        // Get the rendered HTML
        const html = await page.content();

        // Close the page
        await page.close();

        res.send(html);
    } catch (err) {
        res.status(500).send("Proxy error: " + err.message);
    }
});

const port = process.env.PORT || 3000;

// Start browser and server
initBrowser().then(() => {
    app.listen(port, () => console.log("Proxy running on port " + port));
}).catch(err => {
    console.error("Failed to start proxy:", err);
    process.exit(1);
});
