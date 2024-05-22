import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'xskriba-xbublavy-ambulance-create',
  styleUrl: 'xskriba-xbublavy-ambulance-create.css',
  shadow: true,
})
export class XskribaXbublavyAmbulanceCreate {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
