import { newSpecPage } from '@stencil/core/testing';
import { XskribaXbublavyMainMenu } from '../xskriba-xbublavy-main-menu';

describe('xskriba-xbublavy-main-menu', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [XskribaXbublavyMainMenu],
      html: `<xskriba-xbublavy-main-menu></xskriba-xbublavy-main-menu>`,
    });
    expect(page.root).toEqualHtml(`
      <xskriba-xbublavy-main-menu>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </xskriba-xbublavy-main-menu>
    `);
  });
});
