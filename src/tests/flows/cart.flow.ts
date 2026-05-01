import { By, until, type WebDriver } from "selenium-webdriver";
import { switchPageForce } from "../helper/switch-page.helper";

export async function addProductsToCartAndOpenCart(
  driver: WebDriver,
  timeout: number,
) {
  const itemId = "add-to-cart-sauce-labs-backpack";

  const item = await driver.wait(until.elementLocated(By.id(itemId)), timeout);

  await item.click();

  const removeBtn = await driver.findElements(
    By.id("remove-sauce-labs-backpack"),
  );

  expect(removeBtn).toBeDefined();

  const cartLink = await driver.wait(
    until.elementLocated(By.className("shopping_cart_link")),
    timeout,
  );

  expect(cartLink).toBeDefined();
  await cartLink.click();

  await switchPageForce(driver, timeout, "cart");

  console.log(await driver.getCurrentUrl());
  await driver.wait(until.urlContains("cart"), timeout);

  const checkoutBtn = await driver.wait(
    until.elementLocated(By.id("checkout")),
    timeout,
  );

  expect(checkoutBtn).toBeDefined();

  await driver.wait(until.elementIsVisible(checkoutBtn), timeout);
  await driver.wait(until.elementIsEnabled(checkoutBtn), timeout);

  await checkoutBtn.click();
}
