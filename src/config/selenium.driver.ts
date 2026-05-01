import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

export async function createDriver() {
  const options = new chrome.Options();
  const chromeBinary = process.env.CHROME_BIN ?? process.env.CHROME_PATH;
  const chromeDriverBinary =
    process.env.CHROMEDRIVER_BIN ?? process.env.CHROMEDRIVER_PATH;

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

  if (chromeBinary) {
    options.setChromeBinaryPath(chromeBinary);
  }

  const builder = new Builder().forBrowser('chrome').setChromeOptions(options);

  if (chromeDriverBinary) {
    builder.setChromeService(new chrome.ServiceBuilder(chromeDriverBinary));
  }

  const driver = await builder.build();

  return driver;
}
