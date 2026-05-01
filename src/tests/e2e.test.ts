import { By, until, type WebDriver, type WebElement } from 'selenium-webdriver';
import { env } from '@/config/env';
import { createDriver } from '@/config/selenium.driver';

let driver: WebDriver;

beforeAll(async () => {
  driver = await createDriver();
});

const timeout = 20 * 1000;

jest.setTimeout(60 * 1000);

async function findById(id: string) {
  return driver.wait(until.elementLocated(By.id(id)), timeout);
}

async function click(element: WebElement) {
  await driver.wait(until.elementIsVisible(element), timeout);
  await driver.wait(until.elementIsEnabled(element), timeout);
  await driver.executeScript(
    'arguments[0].scrollIntoView({ block: "center" });',
    element,
  );
  await element.click();
}

async function clickAndWait(element: WebElement, urlPart: string) {
  await click(element);

  await driver.wait(until.urlContains(urlPart), 5 * 1000).catch(async () => {
    await driver.executeScript('arguments[0].click();', element);
    await driver.wait(until.urlContains(urlPart), timeout);
  });
}

async function fazerLogin() {
  await driver.get('https://www.saucedemo.com/');

  const user = await findById('user-name');
  const password = await findById('password');
  const button = await findById('login-button');

  await user.clear();
  await password.clear();
  await user.sendKeys(env.USER);
  await password.sendKeys(env.PASSWORD);
  await clickAndWait(button, 'inventory');

  expect(
    await Promise.all([driver.getCurrentUrl(), driver.getTitle()]),
  ).toEqual(
    expect.arrayContaining([expect.stringContaining('inventory'), 'Swag Labs']),
  );

  console.log('STEP: login');
}

async function adicionarProdutoEEntrarNoCarrinho() {
  const item = await findById('add-to-cart-sauce-labs-backpack');

  await click(item);
  await findById('remove-sauce-labs-backpack');

  const cartLink = await driver.wait(
    until.elementLocated(By.className('shopping_cart_link')),
    timeout,
  );

  await clickAndWait(cartLink, 'cart');
  console.log('STEP: produto no carrinho');
}

async function finalizarCheckout() {
  const checkoutBtn = await findById('checkout');
  await clickAndWait(checkoutBtn, 'checkout-step-one');

  const firstName = await findById('first-name');
  const lastName = await findById('last-name');
  const zipCode = await findById('postal-code');
  const continueButton = await findById('continue');

  await firstName.sendKeys('Pablo');
  await lastName.sendKeys('Falc');
  await zipCode.sendKeys('086');

  await driver.wait(async () => {
    return (
      (await firstName.getAttribute('value')) === 'Pablo' &&
      (await lastName.getAttribute('value')) === 'Falc' &&
      (await zipCode.getAttribute('value')) === '086'
    );
  }, timeout);

  await clickAndWait(continueButton, 'checkout-step-two');

  const finishBtn = await findById('finish');
  await clickAndWait(finishBtn, 'checkout-complete');

  const completeOrder = await driver
    .findElement(By.id('checkout_complete_container'))
    .findElement(By.className('complete-header'))
    .getText();

  expect(completeOrder).toBe('Thank you for your order!');

  const backHome = await findById('back-to-products');
  await clickAndWait(backHome, 'inventory');

  expect(await driver.getCurrentUrl()).toBe(
    'https://www.saucedemo.com/inventory.html',
  );

  console.log('STEP: checkout finalizado');
}

describe('Teste completo e2e de Swag Labs', () => {
  it('deve logar, adicionar produto e finalizar compra', async () => {
    await fazerLogin();
    await adicionarProdutoEEntrarNoCarrinho();
    await finalizarCheckout();
  });
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});
