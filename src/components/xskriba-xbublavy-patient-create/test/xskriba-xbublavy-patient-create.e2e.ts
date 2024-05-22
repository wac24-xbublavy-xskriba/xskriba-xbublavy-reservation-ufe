import { newE2EPage } from '@stencil/core/testing';

describe('xskriba-xbublavy-patient-create', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<xskriba-xbublavy-patient-create></xskriba-xbublavy-patient-create>');

    const element = await page.find('xskriba-xbublavy-patient-create');
    expect(element).toHaveClass('hydrated');
  });
});
