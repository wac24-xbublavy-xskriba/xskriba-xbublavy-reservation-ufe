import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core'
import { href } from 'stencil-router-v2'
import dayjs from 'dayjs'

import { type Ambulance, type Patient } from '../../api/reservation'
import { EXAMINATION_TYPE } from '../../global/constants'
import { withBase } from '../../store/baseUrlStore'

@Component({
  tag: 'xskriba-xbublavy-main-menu',
  styleUrl: 'xskriba-xbublavy-main-menu.css',
  shadow: true
})
export class XskribaXbublavyMainMenu {
  @Prop() ambulances: Ambulance[] = []
  @Prop() patients: Patient[] = []

  @Event() selectAmbulance: EventEmitter<Ambulance>
  @Event() selectPatient: EventEmitter<Patient>

  private renderAmbulance(ambulance: Ambulance) {
    return (
      <sl-menu-item onclick={() => this.selectAmbulance.emit(ambulance)}>
        <div class="wrapper">
          <small>{ambulance.name}</small>
          <div class="types">
            {ambulance.medicalExaminations?.map(type => (
              <sl-tag variant="primary" size="small">
                {EXAMINATION_TYPE[type]}
              </sl-tag>
            ))}
          </div>
        </div>
      </sl-menu-item>
    )
  }

  private renderPatient(patient: Patient) {
    return (
      <sl-menu-item onclick={() => this.selectPatient.emit(patient)}>
        <div class="wrapper">
          <small>{`${patient.firstName} ${patient.lastName}`}</small>
          <sl-tag variant="primary" size="small">
            {dayjs(patient.birthday).format('LL')}
          </sl-tag>
        </div>
      </sl-menu-item>
    )
  }

  render() {
    return (
      <Host>
        {!this.ambulances.length && !this.patients.length && (
          <sl-alert variant="warning" open>
            <xskriba-xbublavy-exclamation-triangle-icon slot="icon"></xskriba-xbublavy-exclamation-triangle-icon>
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

            <sl-menu>{this.ambulances.map(this.renderAmbulance, this)}</sl-menu>
          </sl-dropdown>

          <sl-dropdown distance={4} placement="bottom-center">
            <sl-button slot="trigger" size="large" caret pill disabled={!this.patients.length}>
              Select Patient
            </sl-button>

            <sl-menu>{this.patients.map(this.renderPatient, this)}</sl-menu>
          </sl-dropdown>
        </section>

        <div class="divider">
          <sl-divider></sl-divider>
          <small>or</small>
          <sl-divider></sl-divider>
        </div>

        <section>
          <sl-button {...href(withBase('/ambulance'))} size="large" variant="primary" pill>
            Create Ambulance
          </sl-button>

          <sl-button {...href(withBase('/patient'))} size="large" variant="primary" pill>
            Create Patient
          </sl-button>
        </section>
      </Host>
    )
  }
}
