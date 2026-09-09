require("node:fs").mkdirSync("work", { recursive: true });
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.CHROME_PATH ||
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("http://127.0.0.1:8000");
    await page.evaluate(async () => {
      await Promise.all(
        [...document.images].map((i) => {
          i.loading = "eager";
          return i.decode().catch(() => {});
        }),
      );
    });
    const audit = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      brokenImages: [...document.images]
        .filter((i) => !i.complete || i.naturalWidth === 0)
        .map((i) => i.src),
      brokenAnchors: [...document.querySelectorAll('a[href^="#"]')]
        .filter((a) => !document.getElementById(a.hash.slice(1)))
        .map((a) => a.hash),
    }));
    console.log(width, audit);
    if (
      audit.overflow ||
      audit.brokenImages.length ||
      audit.brokenAnchors.length
    )
      throw Error("Layout or asset check failed");
    await page.screenshot({ path: `work/${width}-full.png`, fullPage: true });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `work/${width}-top.png` });
    if (width < 1101) {
      await page.locator(".menu-btn").click();
      if (
        (await page.locator(".menu-btn").getAttribute("aria-expanded")) !==
        "true"
      )
        throw Error("Menu did not open");
      await page.keyboard.press("Escape");
      if (
        (await page.locator(".menu-btn").getAttribute("aria-expanded")) !==
        "false"
      )
        throw Error("Menu did not close");
    }
  }
  await page.locator("button[type=submit]").click();
  console.log(
    "Empty form invalid fields",
    await page.locator("[aria-invalid=true]").count(),
  );
  await page.fill("#name", "Test Person");
  await page.fill("#email", "test@example.com");
  await page.fill("#country", "New Zealand");
  await page.selectOption("#interest", "Technology & AI");
  await page.fill(
    "#message",
    "We would like to discuss an international technology partnership.",
  );
  await page.locator("button[type=submit]").click();
  console.log(
    "Valid form status",
    await page.locator("#form-status").innerText(),
  );
  if (!(await page.locator("#download").isVisible()))
    throw Error("Missing download");
  await page.goto("http://127.0.0.1:8000/legal.html");
  console.log("Legal sections", await page.locator("main section").count());
  console.log("Console errors", errors);
  await browser.close();
  if (errors.length) process.exit(1);
})();
