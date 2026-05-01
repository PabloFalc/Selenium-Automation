import { By, until, type WebDriver } from 'selenium-webdriver';
import { env } from '@/config/env';

export async function login(driver: WebDriver, timeout: number) {
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

  expect(user).toBeDefined();

  expect(password).toBeDefined();

  expect(button).toBeDefined();

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
    expect.arrayContaining([expect.stringContaining('inventory'), 'Swag Labs']),
  );
}
