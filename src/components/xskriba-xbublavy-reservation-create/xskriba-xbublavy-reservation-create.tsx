import { Component, Host, Prop, h } from '@stencil/core'

import { Patient } from '../../api/reservation'

@Component({
  tag: 'xskriba-xbublavy-reservation-create',
  styleUrl: 'xskriba-xbublavy-reservation-create.css',
  shadow: true
})
export class XskribaXbublavyReservationCreate {
  @Prop() apiBase: string
  @Prop() patient: Patient | null

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
