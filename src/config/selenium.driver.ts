import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

export async function createDriver() {
  const options = new chrome.Options();

  options.addArguments("--headless=new");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");
  options.addArguments("--disable-gpu");
  options.addArguments("--window-size=1920,1080");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  return driver;
}
