import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

export async function createDriver() {
  const options = new chrome.Options();

  // ! Importante se o navegador for o brave
  options.setChromeBinaryPath(
    "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  );

  options.addArguments("--headless=new");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  return driver;
}
