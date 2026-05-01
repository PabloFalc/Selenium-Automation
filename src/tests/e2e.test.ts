import type { WebDriver } from "selenium-webdriver";
import { createDriver } from "@/config/selenium.driver";
import { addProductsToCartAndOpenCart } from "./flows/cart.flow";
import { completeCheckout } from "./flows/checkout.flow";
import { login } from "./flows/login.flow";

let driver: WebDriver;

beforeEach(async () => {
  driver = await createDriver();
});

const timeout = 10 * 1000;

jest.setTimeout(120 * 1000);

describe("Teste completo e2e de Swag Labs", () => {
  // it('deve fazer login', async () => {
  //   await login(driver, timeout);
  // });

  // it('deve adicionar produtos ao carrinho', async () => {
  //   await login(driver, timeout);
  //   await addProductsToCartAndOpenCart(driver, timeout);
  // });

  // it('deve concluir checkout', async () => {
  //   await login(driver, timeout);
  //   await addProductsToCartAndOpenCart(driver, timeout);
  //   await completeCheckout(driver, timeout);
  // });

  it("deve fazer o fluxo completo", async () => {
    await login(driver, timeout);
    await addProductsToCartAndOpenCart(driver, timeout);
    await completeCheckout(driver, timeout);
  });
});

afterEach(async () => {
  if (driver) {
    await driver.quit();
  }
});
