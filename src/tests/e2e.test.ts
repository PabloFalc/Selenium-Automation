import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { By, until, type WebDriver } from 'selenium-webdriver';
import { env } from '@/config/env';
import { createDriver } from '@/config/selenium.driver';

let driver: WebDriver;
const timeout = 20 * 1000;

beforeAll(async () => {
  driver = await createDriver();
});

jest.setTimeout(60 * 1000);

async function waitForInteractable(locator: By) {
  const element = await driver.wait(until.elementLocated(locator), timeout);

  await driver.wait(until.elementIsVisible(element), timeout);
  await driver.wait(until.elementIsEnabled(element), timeout);

  return element;
}

async function saveFailureArtifacts() {
  if (!driver) {
    return;
  }

  try {
    await mkdir('artifacts', { recursive: true });
    await writeFile(
      join('artifacts', 'e2e-failure.png'),
      await driver.takeScreenshot(),
      'base64',
    );
    await writeFile(
      join('artifacts', 'e2e-page-source.html'),
      await driver.getPageSource(),
    );
  } catch (error) {
    console.warn('Nao foi possivel salvar artifacts de falha:', error);
  }
}

describe('Teste completo e2e de Swag Labs', () => {
  it('deve logar, adicionar produto e finalizar compra', async () => {
    try {
      await driver.get('https://www.saucedemo.com/');
      console.log('STEP: abriu site');

      console.log('STEP: login page carregada');
      const user = await waitForInteractable(By.id('user-name'));
      const password = await waitForInteractable(By.id('password'));
      const button = await waitForInteractable(By.id('login-button'));

      await user.clear();
      await password.clear();

      await user.sendKeys(env.USER);
      await password.sendKeys(env.PASSWORD);
      await button.click();

      await driver.wait(until.urlContains('inventory'), timeout);
      console.log('STEP: logou');

      expect(
        await Promise.all([driver.getCurrentUrl(), driver.getTitle()]),
      ).toEqual(
        expect.arrayContaining([
          expect.stringContaining('inventory'),
          'Swag Labs',
        ]),
      );

      const item = await waitForInteractable(
        By.id('add-to-cart-sauce-labs-backpack'),
      );

      await item.click();

      const removeBtn = await driver.findElements(
        By.id('remove-sauce-labs-backpack'),
      );

      console.log('ADICIONADO:', removeBtn.length);

      const cartLink = await waitForInteractable(
        By.className('shopping_cart_link'),
      );

      await cartLink.click();

      await driver
        .wait(async () => {
          const url = await driver.getCurrentUrl();

          return url.includes('cart');
        }, timeout)
        .catch(async () => {
          console.log('Forcando navegacao para o carrinho');
          await driver.get('https://www.saucedemo.com/cart.html');
        });

      console.log(await driver.getCurrentUrl());
      await driver.wait(until.urlContains('cart'), timeout);

      const checkoutBtn = await waitForInteractable(By.id('checkout'));

      await checkoutBtn.click();

      // ! ETAPA 1 do checkout
      await driver.wait(until.urlContains('checkout-step-one'), timeout);
      console.log('STEP: checkout step 1');

      const [firstName, lastName, zipCode, continueButton] = await Promise.all([
        waitForInteractable(By.id('first-name')),
        waitForInteractable(By.id('last-name')),
        waitForInteractable(By.id('postal-code')),
        waitForInteractable(By.id('continue')),
      ]);

      await firstName.sendKeys('Pablo');
      await lastName.sendKeys('Falc');
      await zipCode.sendKeys('086');

      await continueButton.click();

      // ! ETAPA 2 do checkout
      await driver.wait(until.urlContains('checkout-step-two'), timeout);
      console.log('STEP: checkout step 2');

      const finishBtn = await waitForInteractable(By.id('finish'));
      await finishBtn.click();

      // ! Finalizacao
      await driver.wait(until.urlContains('checkout-complete'), timeout);
      console.log('STEP: checkout complete');
      const completeOrder = await driver
        .findElement(By.id('checkout_complete_container'))
        .findElement(By.className('complete-header'))
        .getText();

      expect(completeOrder).toBe('Thank you for your order!');

      const backHome = await waitForInteractable(By.id('back-to-products'));
      await backHome.click();

      await driver.wait(until.urlContains('inventory'), timeout);
      console.log('STEP: end');
      const backToHomeTitle = await driver.getCurrentUrl();

      expect(backToHomeTitle).toBe('https://www.saucedemo.com/inventory.html');
    } catch (error) {
      await saveFailureArtifacts();
      throw error;
    }
  });
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});
