import { newSpecPage } from '@stencil/core/testing';
import { XskribaXbublavyPatientCreate } from '../xskriba-xbublavy-patient-create';

describe('xskriba-xbublavy-patient-create', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [XskribaXbublavyPatientCreate],
      html: `<xskriba-xbublavy-patient-create></xskriba-xbublavy-patient-create>`,
    });
    expect(page.root).toEqualHtml(`
      <xskriba-xbublavy-patient-create>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </xskriba-xbublavy-patient-create>
    `);
  });
});
