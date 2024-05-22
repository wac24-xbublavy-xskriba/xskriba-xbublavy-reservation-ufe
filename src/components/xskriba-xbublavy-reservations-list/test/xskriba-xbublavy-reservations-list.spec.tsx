import { newSpecPage } from '@stencil/core/testing';
import { XskribaXbublavyReservationsList } from '../xskriba-xbublavy-reservations-list';

describe('xskriba-xbublavy-reservations-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [XskribaXbublavyReservationsList],
      html: `<xskriba-xbublavy-reservations-list></xskriba-xbublavy-reservations-list>`,
    });
    expect(page.root).toEqualHtml(`
      <xskriba-xbublavy-reservations-list>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </xskriba-xbublavy-reservations-list>
    `);
  });
});
