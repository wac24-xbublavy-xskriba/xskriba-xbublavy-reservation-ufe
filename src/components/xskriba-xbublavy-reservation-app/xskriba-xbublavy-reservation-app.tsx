import { Component, Host, h } from '@stencil/core'

declare global {
  interface Window {
    navigation: any
  }
}

@Component({
  tag: 'xskriba-xbublavy-reservation-app',
  styleUrl: 'xskriba-xbublavy-reservation-app.css',
  shadow: true
})
export class XskribaXbublavyReservationApp {
  render() {
    return (
      <Host>
        <h1>Welcome to Reservation App!</h1>
        <p>Under construction...</p>
        <small>By Peter Škríba & Adam Bublavý</small>
      </Host>
    )
  }
}
