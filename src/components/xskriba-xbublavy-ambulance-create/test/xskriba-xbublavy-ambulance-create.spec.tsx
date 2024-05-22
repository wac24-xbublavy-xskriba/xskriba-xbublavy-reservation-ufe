import { newSpecPage } from '@stencil/core/testing';
import { XskribaXbublavyAmbulanceCreate } from '../xskriba-xbublavy-ambulance-create';

describe('xskriba-xbublavy-ambulance-create', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [XskribaXbublavyAmbulanceCreate],
      html: `<xskriba-xbublavy-ambulance-create></xskriba-xbublavy-ambulance-create>`,
    });
    expect(page.root).toEqualHtml(`
      <xskriba-xbublavy-ambulance-create>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </xskriba-xbublavy-ambulance-create>
    `);
  });
});
