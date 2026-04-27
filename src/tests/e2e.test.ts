import { By, Key, until, type WebDriver } from "selenium-webdriver";
import { env } from "@/config/env";
import { createDriver } from "@/config/selenium.driver";

let driver: WebDriver;

beforeAll(async () => {
  driver = await createDriver();
});

jest.setTimeout(20 * 1000);

describe("Teste completo e2e de SwagLabs", () => {
  it("Deve ser possivel realizar login", async () => {
    await driver.get("https://www.saucedemo.com/");

    const user = await driver.wait(
      until.elementLocated(By.id("user-name")),
      10 * 1000,
    );

    const password = await driver.wait(
      until.elementLocated(By.id("password")),
      10 * 1000,
    );

    const button = await driver.wait(
      until.elementLocated(By.id("login-button")),
      10 * 1000,
    );

    expect(user).toBeDefined();

    expect(password).toBeDefined();

    expect(button).toBeDefined();

    user.clear();
    password.clear();

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
  });
});

afterAll(async () => {
  await driver.quit();
});
