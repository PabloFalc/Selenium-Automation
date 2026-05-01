import { By, type WebDriver } from "selenium-webdriver";
import { switchPageForce } from "../helper/switch-page.helper";

export async function completeCheckout(driver: WebDriver, timeout: number) {
  await switchPageForce(driver, timeout, "checkout-step-two");

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

  await switchPageForce(driver, timeout, "checkout-step-two");

  await driver.findElement(By.id("finish")).click();

  console.log("STEP: checkout step 3");
  await switchPageForce(driver, timeout, "checkout-complete");

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
