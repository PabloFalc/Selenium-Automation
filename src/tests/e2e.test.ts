import { By, until, type WebDriver, type WebElement } from 'selenium-webdriver';
import { env } from '@/config/env';
import { createDriver } from '@/config/selenium.driver';

let driver: WebDriver;

beforeAll(async () => {
  driver = await createDriver();
});

const timeout = 20 * 1000;

jest.setTimeout(60 * 1000);

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

describe('Teste completo e2e de Swag Labs', () => {
  it('deve logar, adicionar produto e finalizar compra', async () => {
    await driver.get('https://www.saucedemo.com/');
    console.log('STEP: abriu site');

    console.log('STEP: login page carregada');
    const user = await driver.wait(
      until.elementLocated(By.id('user-name')),
      timeout,
    );

    const password = await driver.wait(
      until.elementLocated(By.id('password')),
      timeout,
    );

    const button = await driver.wait(
      until.elementLocated(By.id('login-button')),
      timeout,
    );

    await user.clear();
    await password.clear();

    await user.sendKeys(env.USER);
    await password.sendKeys(env.PASSWORD);
    await clickAndWait(button, 'inventory');
    console.log('STEP: logou');

    expect(
      await Promise.all([driver.getCurrentUrl(), driver.getTitle()]),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining('inventory'),
        'Swag Labs',
      ]),
    );

    const item = await driver.wait(
      until.elementLocated(By.id('add-to-cart-sauce-labs-backpack')),
      timeout,
    );

    await click(item);
    await driver.wait(
      until.elementLocated(By.id('remove-sauce-labs-backpack')),
      timeout,
    );

    const cartLink = await driver.wait(
      until.elementLocated(By.className('shopping_cart_link')),
      timeout,
    );

    await clickAndWait(cartLink, 'cart');
    console.log(await driver.getCurrentUrl());

    const checkoutBtn = await driver.wait(
      until.elementLocated(By.id('checkout')),
      timeout,
    );

    await clickAndWait(checkoutBtn, 'checkout-step-one');
    console.log('STEP: checkout step 1');

    const [firstName, lastName, zipCode, continueButton] = await Promise.all([
      driver.findElement(By.id('first-name')),
      driver.findElement(By.id('last-name')),
      driver.findElement(By.id('postal-code')),
      driver.findElement(By.id('continue')),
    ]);

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
    console.log('STEP: checkout step 2');

    const finishBtn = await driver.findElement(By.id('finish'));
    await clickAndWait(finishBtn, 'checkout-complete');
    console.log('STEP: checkout complete');
    const completeOrder = await driver
      .findElement(By.id('checkout_complete_container'))
      .findElement(By.className('complete-header'))
      .getText();

    expect(completeOrder).toBe('Thank you for your order!');

    const backHome = await driver.findElement(By.id('back-to-products'));
    await clickAndWait(backHome, 'inventory');
    console.log('STEP: end');
    const backToHomeTitle = await driver.getCurrentUrl();

    expect(backToHomeTitle).toBe('https://www.saucedemo.com/inventory.html');
  });
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});
