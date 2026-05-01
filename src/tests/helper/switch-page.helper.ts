import type { WebDriver } from "selenium-webdriver";

export async function switchPageForce(
  driver: WebDriver,
  timeout: number,
  url: string,
) {
  await driver
    .wait(async () => {
      const url = await driver.getCurrentUrl();

      return url.includes(url);
    }, timeout)
    .catch(async () => {
      await driver.get(`https://www.saucedemo.com/${url}.html`);
    });
}
