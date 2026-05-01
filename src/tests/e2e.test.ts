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

    await driver.wait(async () => {
      const state = await driver.executeScript("return document.readyState");
      return state === "complete";
    }, timeout);

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

    await driver.wait(until.urlContains("inventory"));

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
      "add-to-cart-sauce-labs-bolt-t-shirt",
    ];

    for (const [index, item] of buttonCartId.entries()) {
      const button = await driver.wait(
        until.elementLocated(By.id(item)),
        10000,
      );

      await button.click();

      await driver.wait(async () => {
        const text = await driver
          .findElement(By.className("shopping_cart_badge"))
          .getText();

        return Number(text) === index + 1;
      }, 10000);

      const badge = await driver
        .findElement(By.className("shopping_cart_badge"))
        .getText();

      expect(Number(badge)).toBe(index + 1);
    }

    await driver.findElement(By.className("shopping_cart_link")).click();

    await driver.wait(until.urlContains("cart"), timeout);

    await driver.findElement(By.id("checkout")).click();

    // ! ETAPA 1 do checkout
    await driver.wait(until.urlContains("checkout-step-one"), timeout);

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

    await driver.findElement(By.id("finish")).click();

    // ! Finalização
    await driver.wait(until.urlContains("checkout-complete"), timeout);

    const completeOrder = await driver
      .findElement(By.id("checkout_complete_container"))
      .findElement(By.className("complete-header"))
      .getText();

    expect(completeOrder).toBe("Thank you for your order!");

    const backHome = await driver.findElement(By.id("back-to-products"));
    expect(backHome).toBeDefined();
    await backHome.click();

    await driver.wait(until.urlContains("inventory"), timeout);

    const backToHomeTitle = await driver.getCurrentUrl();

    expect(backToHomeTitle).toBe("https://www.saucedemo.com/inventory.html");
  });
});

afterAll(async () => {
  await driver.quit();
});
