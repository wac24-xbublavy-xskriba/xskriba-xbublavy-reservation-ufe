import { newE2EPage } from '@stencil/core/testing';

describe('xskriba-xbublavy-reservations-list', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<xskriba-xbublavy-reservations-list></xskriba-xbublavy-reservations-list>');

    const element = await page.find('xskriba-xbublavy-reservations-list');
    expect(element).toHaveClass('hydrated');
  });
});
