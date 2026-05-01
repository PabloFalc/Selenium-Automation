import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

export async function createDriver() {
  const options = new chrome.Options();

  options.addArguments("--headless=new");

  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");
  options.addArguments("--disable-gpu");

  options.addArguments("--window-size=1920,1080");
  options.addArguments("--start-maximized");

  options.addArguments("--disable-infobars");
  options.addArguments("--disable-notifications");
  options.addArguments("--disable-extensions");
  options.addArguments("--disable-software-rasterizer");

  options.addArguments("--remote-allow-origins=*");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  return driver;
}
