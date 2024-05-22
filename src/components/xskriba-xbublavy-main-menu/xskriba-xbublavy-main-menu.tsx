import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core'
import { href } from 'stencil-router-v2'

import alertIcon from '@shoelace-style/shoelace/dist/assets/icons/exclamation-triangle.svg'

import { Ambulance, Patient } from '../../api/reservation'

@Component({
  tag: 'xskriba-xbublavy-main-menu',
  styleUrl: 'xskriba-xbublavy-main-menu.css',
  shadow: true
})
export class XskribaXbublavyMainMenu {
  @Prop() ambulances: Ambulance[]
  @Prop() patients: Patient[]

  @Event() selectAmbulance: EventEmitter<Ambulance>
  @Event() selectPatient: EventEmitter<Patient>

  private renderAmbulances() {
    return this.ambulances.map(ambulance => (
      <sl-menu-item onclick={() => this.selectAmbulance.emit(ambulance)}>
        <div class="wrapper">
          <small>{ambulance.name}</small>
          <div class="types">
            {ambulance.medicalExaminations?.map(type => (
              <sl-tag variant="primary" size="small">
                {type}
              </sl-tag>
            ))}
          </div>
        </div>
      </sl-menu-item>
    ))
  }

  private renderPatients() {
    return this.patients.map(patient => (
      <sl-menu-item onclick={() => this.selectPatient.emit(patient)}>
        <div class="wrapper">
          <small>{`${patient.firstName} ${patient.lastName}`}</small>
          <sl-tag variant="primary" size="small">
            {patient.birthday}
          </sl-tag>
        </div>
      </sl-menu-item>
    ))
  }

  render() {
    return (
      <Host>
        {!this.ambulances.length && !this.patients.length && (
          <sl-alert variant="warning" open>
            <sl-icon slot="icon" src={alertIcon}></sl-icon>
            <strong>There are no ambulances or patients to select.</strong>
            <br />
            Please create an ambulance or patient to continue.
          </sl-alert>
        )}

        <section>
          <sl-dropdown distance={4} placement="bottom-center">
            <sl-button slot="trigger" size="large" caret pill disabled={!this.ambulances.length}>
              Select Ambulance
            </sl-button>

            <sl-menu>{this.renderAmbulances()}</sl-menu>
          </sl-dropdown>

          <sl-dropdown distance={4} placement="bottom-center">
            <sl-button slot="trigger" size="large" caret pill disabled={!this.patients.length}>
              Select Patient
            </sl-button>

            <sl-menu>{this.renderPatients()}</sl-menu>
          </sl-dropdown>
        </section>

        <div class="divider">
          <sl-divider></sl-divider>
          <small>or</small>
          <sl-divider></sl-divider>
        </div>

        <section>
          <sl-button {...href('/ambulance')} size="large" variant="primary" pill>
            Create Ambulance
          </sl-button>

          <sl-button {...href('/patient')} size="large" variant="primary" pill>
            Create Patient
          </sl-button>
        </section>
      </Host>
    )
  }
}
