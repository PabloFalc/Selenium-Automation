import { By, type WebDriver } from "selenium-webdriver";
import { switchPageForce } from "../helper/switch-page.helper";

export async function completeCheckout(driver: WebDriver, timeout: number) {
  await driver
    .wait(async () => {
      const url = await driver.getCurrentUrl();

      return url.includes("checkout-step-one");
    }, timeout)
    .catch(async () => {
      console.log(await driver.getCurrentUrl());
      await driver.get(`https://www.saucedemo.com/checkout-step-one.html`);
    });

  console.log("STEP: checkout step 1");

  const [firstName, lastName, zipCode, continueButton] = await Promise.all([
    driver.findElement(By.id("first-name")),
    driver.findElement(By.id("last-name")),
    driver.findElement(By.id("postal-code")),
    driver.findElement(By.id("continue")),
  ]);

  await firstName.sendKeys("Pablo");
  await lastName.sendKeys("Falc");
  await zipCode.sendKeys("086");

  await continueButton.click();

  await driver
    .wait(async () => {
      const url = await driver.getCurrentUrl();

      return url.includes("checkout-step-two");
    }, timeout)
    .catch(async () => {
      await driver.get(`https://www.saucedemo.com/checkout-step-two.html`);
    });

  await driver.findElement(By.id("finish")).click();

  await driver
    .wait(async () => {
      const url = await driver.getCurrentUrl();

      return url.includes("checkout-complete");
    }, timeout)
    .catch(async () => {
      await driver.get(`https://www.saucedemo.com/checkout-complete.html`);
    });

  const completeOrder = await driver
    .findElement(By.id("checkout_complete_container"))
    .findElement(By.className("complete-header"))
    .getText();

  expect(completeOrder).toBe("Thank you for your order!");

  const backHome = await driver.findElement(By.id("back-to-products"));

  expect(backHome).toBeDefined();

  await backHome.click();

  await switchPageForce(driver, timeout, "inventory");

  expect(await driver.getCurrentUrl()).toBe(
    "https://www.saucedemo.com/inventory.html",
  );
}
