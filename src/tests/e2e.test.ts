import { By, until, type WebDriver } from "selenium-webdriver";
import { env } from "@/config/env";
import { createDriver } from "@/config/selenium.driver";

let driver: WebDriver;

beforeAll(async () => {
  driver = await createDriver();
});

const timeout = 60 * 1000;

jest.setTimeout(60 * 1000);

describe("Teste completo e2e de Swag Labs", () => {
  it("deve logar, adicionar produto e finalizar compra", async () => {
    await driver.get("https://www.saucedemo.com/");
    console.log("STEP: abriu site");

    await driver.wait(async () => {
      const state = await driver.executeScript("return document.readyState");
      return state === "complete";
    }, timeout);

    console.log("STEP: login page carregada");
    const user = await driver.wait(
      until.elementLocated(By.id("user-name")),
      timeout,
    );

    const password = await driver.wait(
      until.elementLocated(By.id("password")),
      timeout,
    );

    const button = await driver.wait(
      until.elementLocated(By.id("login-button")),
      timeout,
    );

    expect(user).toBeDefined();

    expect(password).toBeDefined();

    expect(button).toBeDefined();

    await user.clear();
    await password.clear();

    await user.sendKeys(env.USER);
    await password.sendKeys(env.PASSWORD);
    await button.click();

    await driver.wait(until.urlContains("inventory"), timeout);
    console.log("STEP: logou");

    expect(
      await Promise.all([driver.getCurrentUrl(), driver.getTitle()]),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("inventory"),
        "Swag Labs",
      ]),
    );

    // ! Adicionando produtos ao carrinho
    const buttonCartId = [
      "add-to-cart-sauce-labs-backpack",
      "add-to-cart-sauce-labs-fleece-jacket",
      "add-to-cart-sauce-labs-onesie",
    ];

    for (const [index, item] of buttonCartId.entries()) {
      const button = await driver.wait(
        until.elementLocated(By.id(item)),
        timeout,
      );

      await button.click();
      console.log(`STEP: adicionou produto ${index + 1}`);
    }

    const cartLink = await driver.wait(
      until.elementLocated(By.id("shopping_cart_container")),
      timeout,
    );

    await cartLink.click();

    console.log("SETP: CARRINHO");

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes("cart");
    }, timeout);

    await driver.wait(until.urlContains("cart"), timeout);
    console.log("página carregada");

    const checkoutBtn = await driver.wait(
      until.elementLocated(By.id("checkout")),
      timeout,
    );

    await driver.wait(until.elementIsVisible(checkoutBtn), timeout);
    await driver.wait(until.elementIsEnabled(checkoutBtn), timeout);

    await checkoutBtn.click();

    // ! ETAPA 1 do checkout
    await driver.wait(until.urlContains("checkout-step-one"), timeout);
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
  });
});

afterAll(async () => {
  await driver.quit();
});
