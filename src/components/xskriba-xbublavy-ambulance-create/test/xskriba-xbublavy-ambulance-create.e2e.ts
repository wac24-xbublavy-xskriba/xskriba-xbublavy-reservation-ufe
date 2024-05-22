import { newE2EPage } from '@stencil/core/testing';

describe('xskriba-xbublavy-ambulance-create', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<xskriba-xbublavy-ambulance-create></xskriba-xbublavy-ambulance-create>');

    const element = await page.find('xskriba-xbublavy-ambulance-create');
    expect(element).toHaveClass('hydrated');
  });
});
