import { Component, Host, Prop, h } from '@stencil/core'

@Component({
  tag: 'xskriba-xbublavy-reservation-detail',
  styleUrl: 'xskriba-xbublavy-reservation-detail.css',
  shadow: true
})
export class XskribaXbublavyReservationDetail {
  @Prop() apiBase: string
  @Prop() patientReservationId: string
  @Prop() ambulanceReservationId: string

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
