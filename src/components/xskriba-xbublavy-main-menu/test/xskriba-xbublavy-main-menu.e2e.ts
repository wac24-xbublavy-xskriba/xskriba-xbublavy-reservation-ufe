import { newE2EPage } from '@stencil/core/testing';

describe('xskriba-xbublavy-main-menu', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<xskriba-xbublavy-main-menu></xskriba-xbublavy-main-menu>');

    const element = await page.find('xskriba-xbublavy-main-menu');
    expect(element).toHaveClass('hydrated');
  });
});
