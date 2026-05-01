import { By, until, type WebDriver } from "selenium-webdriver";

export async function completeCheckout(driver: WebDriver, timeout: number) {
  await driver
    .wait(async () => {
      const url = await driver.getCurrentUrl();

      return url.includes("checkout-step-one");
    }, timeout)
    .catch(async () => {
      console.log("forçando navegação para a primeira etapa");
      await driver.get("https://www.saucedemo.com/checkout-step-one.html");
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

  // ! Etapa dois
  await driver.wait(until.urlContains("checkout-step-two"), timeout);
  console.log("STEP: checkout step 2");

  await driver.findElement(By.id("finish")).click();

  // ! Finalização
  await driver.wait(until.urlContains("checkout-complete"), timeout);
  console.log("STEP: checkout complete");
  const completeOrder = await driver
    .findElement(By.id("checkout_complete_container"))
    .findElement(By.className("complete-header"))
    .getText();

  expect(completeOrder).toBe("Thank you for your order!");

  const backHome = await driver.findElement(By.id("back-to-products"));
  expect(backHome).toBeDefined();
  await backHome.click();

  await driver.wait(until.urlContains("inventory"), timeout);
  console.log("STEP: end");
  const backToHomeTitle = await driver.getCurrentUrl();

  expect(backToHomeTitle).toBe("https://www.saucedemo.com/inventory.html");
}
