import { Component, Host, Prop, State, forceUpdate, h } from '@stencil/core'
import { createRouter, href, match, Route } from 'stencil-router-v2'
import dayjs from 'dayjs'

import addIcon from '@shoelace-style/shoelace/dist/assets/icons/person-plus-fill.svg'
import homeIcon from '@shoelace-style/shoelace/dist/assets/icons/house-fill.svg'
import ambulanceIcon from '@shoelace-style/shoelace/dist/assets/icons/hospital-fill.svg'
import patientIcon from '@shoelace-style/shoelace/dist/assets/icons/person-vcard-fill.svg'
import successIcon from '@shoelace-style/shoelace/dist/assets/icons/check2-circle.svg'
import dangerIcon from '@shoelace-style/shoelace/dist/assets/icons/exclamation-octagon.svg'

import {
  type Ambulance,
  type Patient,
  type Reservation,
  AmbulanceApiFactory,
  PatientApiFactory
} from '../../api/reservation'
import { formatFullName } from '../../utils/utils'
import { EXAMINATION_TYPE } from '../../global/constants'

const Router = createRouter()

export type Toast = {
  message: string
  description?: string
  variant: 'success' | 'danger'
}

@Component({
  tag: 'xskriba-xbublavy-reservation-app',
  styleUrl: 'xskriba-xbublavy-reservation-app.css',
  shadow: true
})
export class XskribaXbublavyReservationApp {
  @Prop() apiBase: string

  @State() private toast: Toast | null = null

  @State() private ambulances: Ambulance[] = []
  @State() private patients: Patient[] = []

  @State() private selectedAmbulance: Ambulance | null = null
  @State() private selectedPatient: Patient | null = null

  @State() createdReservation: Reservation | null = null

  private async getAmbulances(): Promise<Ambulance[]> {
    try {
      const response = await AmbulanceApiFactory(undefined, this.apiBase).getAmbulances()
      return response.data
    } catch (err) {
      alert(err.message)
      return []
    }
  }

  private async getPatients(): Promise<Patient[]> {
    try {
      const response = await PatientApiFactory(undefined, this.apiBase).getPatients()
      return response.data
    } catch (err) {
      alert(err.message)
      return []
    }
  }

  private handleSelectAmbulance(ambulance: Ambulance) {
    this.selectedAmbulance = ambulance
    this.selectedPatient = null
  }

  private handleSelectPatient(patient: Patient) {
    this.selectedPatient = patient
    this.selectedAmbulance = null
  }

  async componentWillLoad() {
    this.ambulances = await this.getAmbulances()
    this.patients = await this.getPatients()
  }

  private renderAmbulance(ambulance: Ambulance) {
    return (
      <sl-menu-item
        onclick={() => this.handleSelectAmbulance(ambulance)}
        disabled={this.selectedAmbulance?.id === ambulance.id}
      >
        {ambulance.name}
      </sl-menu-item>
    )
  }

  private renderPatient(patient: Patient) {
    return (
      <sl-menu-item
        onclick={() => this.handleSelectPatient(patient)}
        disabled={this.selectedPatient?.id === patient.id}
      >
        {patient.firstName} {patient.lastName}
      </sl-menu-item>
    )
  }

  render() {
    console.debug('api-base:', this.apiBase)

    const isCreateRoute = ['/ambulance', '/patient'].includes(Router.activePath)
    const isAmbulance = this.selectedAmbulance && !this.selectedPatient

    return (
      <Host>
        <sl-alert
          closable
          duration={3000}
          open={this.toast}
          variant={this.toast?.variant}
          sl-after-hide={() => this.handleToastHide()}
        >
          <sl-icon
            slot="icon"
            src={this.toast?.variant === 'success' ? successIcon : dangerIcon}
          ></sl-icon>

          <strong>{this.toast?.message}</strong>

          {this.toast?.description && <p>{this.toast?.description}</p>}
        </sl-alert>

        <header>
          <div class="header_left">
            <h1>Ambulance Reservation System</h1>
            <small>By Peter Škríba & Adam Bublavý</small>
          </div>

          <div class="header_right">
            {(this.selectedAmbulance || this.selectedPatient) && (
              <sl-button
                variant="text"
                size="large"
                {...href(
                  this.selectedAmbulance
                    ? `/ambulance/${this.selectedAmbulance.id}/reservations`
                    : this.selectedPatient
                    ? `/patient/${this.selectedPatient.id}/reservations`
                    : '/'
                )}
              >
                Reservations
              </sl-button>
            )}

            {!isCreateRoute && (this.selectedAmbulance || this.selectedPatient) ? (
              <sl-dropdown distance={8} placement="bottom-end">
                <sl-button slot="trigger" size="large" caret pill>
                  <div class="header_user">
                    <sl-avatar shape="circle" label="Circle avatar" class="avatar"></sl-avatar>

                    <div>
                      <h2>
                        {this.selectedAmbulance?.name ||
                          formatFullName(
                            this.selectedPatient?.firstName,
                            this.selectedPatient?.lastName
                          )}
                      </h2>

                      <sl-badge variant={isAmbulance ? 'success' : 'primary'} pill>
                        <span class="badge">{isAmbulance ? 'Ambulance' : 'Patient'}</span>
                      </sl-badge>
                    </div>
                  </div>
                </sl-button>

                <sl-menu>
                  <sl-menu-item
                    {...href(
                      this.selectedAmbulance
                        ? `/ambulance/${this.selectedAmbulance.id}`
                        : this.selectedPatient
                        ? `/patient/${this.selectedPatient.id}`
                        : '/'
                    )}
                  >
                    My Profile
                  </sl-menu-item>

                  <sl-divider></sl-divider>

                  <small class="submenu">Ambulances</small>
                  {this.ambulances.map(this.renderAmbulance, this)}

                  <small class="submenu">Patients</small>
                  {this.patients.map(this.renderPatient, this)}
                </sl-menu>
              </sl-dropdown>
            ) : (
              <sl-button
                {...href(
                  this.selectedAmbulance
                    ? `/ambulance/${this.selectedAmbulance.id}/reservations`
                    : this.selectedPatient
                    ? `/patient/${this.selectedPatient.id}/reservations`
                    : '/'
                )}
                variant="primary"
                size="large"
                outline
                circle
              >
                <sl-icon src={homeIcon} label="Home"></sl-icon>
              </sl-button>
            )}

            <sl-dropdown distance={8} placement="bottom-end">
              <sl-button slot="trigger" variant="primary" size="large" circle>
                <sl-icon src={addIcon} label="Create Profile"></sl-icon>
              </sl-button>

              <sl-menu>
                <sl-menu-item {...href('/ambulance')}>
                  <sl-icon slot="prefix" src={ambulanceIcon}></sl-icon>
                  Create Ambulance
                </sl-menu-item>

                <sl-menu-item {...href('/patient')}>
                  <sl-icon slot="prefix" src={patientIcon}></sl-icon>
                  Create Patient
                </sl-menu-item>
              </sl-menu>
            </sl-dropdown>
          </div>
        </header>

        <main>
          <Router.Switch>
            {!this.selectedAmbulance && !this.selectedPatient ? (
              <Route
                path="/"
                render={() => (
                  <xskriba-xbublavy-main-menu
                    ambulances={this.ambulances}
                    patients={this.patients}
                    onSelectAmbulance={ambulance => this.handleSelectAmbulance(ambulance.detail)}
                    onSelectPatient={patient => this.handleSelectPatient(patient.detail)}
                  />
                )}
              />
            ) : (
              <Route
                path="/"
                to={
                  this.selectedAmbulance
                    ? `/ambulance/${this.selectedAmbulance.id}/reservations`
                    : this.selectedPatient
                    ? `/patient/${this.selectedPatient.id}/reservations`
                    : '/'
                }
              />
            )}

            {/* AMBULANCE ROUTES */}
            {this.selectedAmbulance && (
              <Route
                path={match('/ambulance/:userId/reservations', { exact: true, strict: true })}
                render={() => (
                  <xskriba-xbublavy-reservations-list
                    api-base={this.apiBase}
                    ambulance={this.selectedAmbulance}
                    createdReservation={this.createdReservation}
                    onReservationUpdated={() =>
                      this.handleToastShow({ message: 'Reservation updated', variant: 'success' })
                    }
                    onReservationDeleted={() =>
                      this.handleToastShow({ message: 'Reservation deleted', variant: 'success' })
                    }
                  />
                )}
              />
            )}
            {this.selectedAmbulance && (
              <Route
                path={match('/ambulance/:userId', { exact: true, strict: true })}
                render={({ userId }) => (
                  <xskriba-xbublavy-ambulance-create
                    api-base={this.apiBase}
                    user-id={this.selectedAmbulance?.id || userId}
                    onAmbulanceDeleted={ambulanceName =>
                      this.handleAmbulanceDeleted(ambulanceName.detail)
                    }
                    onAmbulanceUpdated={ambulance => this.handleAmbulanceUpdated(ambulance.detail)}
                  />
                )}
              />
            )}
            <Route
              path="/ambulance"
              render={() => (
                <xskriba-xbublavy-ambulance-create
                  api-base={this.apiBase}
                  onAmbulanceCreated={ambulance => this.handleAmbulanceCreated(ambulance.detail)}
                />
              )}
            />

            {/* PATIENT ROUTES */}
            {this.selectedPatient && (
              <Route
                path={match('/patient/:userId/reservations/create', { exact: true, strict: true })}
                render={() => (
                  <xskriba-xbublavy-reservation-create
                    api-base={this.apiBase}
                    patient={this.selectedPatient}
                    onReservationCreated={reservation =>
                      this.handleReservationCreated(reservation.detail)
                    }
                  />
                )}
              />
            )}
            {this.selectedPatient && (
              <Route
                path={match('/patient/:userId/reservations', { exact: true, strict: true })}
                render={() => (
                  <xskriba-xbublavy-reservations-list
                    api-base={this.apiBase}
                    patient={this.selectedPatient}
                    createdReservation={this.createdReservation}
                    onReservationUpdated={() =>
                      this.handleToastShow({ message: 'Reservation updated', variant: 'success' })
                    }
                    onReservationDeleted={() =>
                      this.handleToastShow({ message: 'Reservation deleted', variant: 'success' })
                    }
                  />
                )}
              />
            )}
            {this.selectedPatient && (
              <Route
                path={match('/patient/:userId', { exact: true, strict: true })}
                render={({ userId }) => (
                  <xskriba-xbublavy-patient-create
                    api-base={this.apiBase}
                    user-id={this.selectedPatient?.id || userId}
                    onPatientDeleted={patientName => this.handlePatientDeleted(patientName.detail)}
                    onPatientUpdated={patient => this.handlePatientUpdated(patient.detail)}
                  />
                )}
              />
            )}
            <Route
              path="/patient"
              render={() => (
                <xskriba-xbublavy-patient-create
                  api-base={this.apiBase}
                  onPatientCreated={patient => this.handlePatientCreated(patient.detail)}
                />
              )}
            />

            {/* REDIRECT */}
          </Router.Switch>
        </main>
      </Host>
    )
  }

  /* AMBULANCE */

  private async handleAmbulanceCreated(ambulance: Ambulance) {
    this.ambulances = await this.getAmbulances()
    this.handleSelectAmbulance(ambulance)
    Router.push(`/ambulance/${ambulance.id}/reservations`)
    this.handleToastShow({
      message: `Ambulance ${ambulance.name} created`,
      variant: 'success'
    })
  }

  private async handleAmbulanceUpdated(ambulance: Ambulance) {
    this.handleToastShow({
      message: `Ambulance ${ambulance.name} updated`,
      variant: 'success'
    })
  }

  private async handleAmbulanceDeleted(ambulanceName: Ambulance['name']) {
    this.ambulances = await this.getAmbulances()
    this.selectedAmbulance = null
    this.selectedPatient = null
    forceUpdate(this)
    Router.push('/')
    this.handleToastShow({
      message: `Ambulance ${ambulanceName} deleted`,
      variant: 'success'
    })
  }

  /* PATIENT */

  private async handlePatientCreated(patient: Patient) {
    this.patients = await this.getPatients()
    this.handleSelectPatient(patient)
    Router.push(`/patient/${patient.id}/reservations`)
    this.handleToastShow({
      message: `Patient ${formatFullName(patient.firstName, patient.lastName)} created`,
      variant: 'success'
    })
  }

  private async handlePatientUpdated(patient: Patient) {
    this.handleToastShow({
      message: `Patient ${formatFullName(patient.firstName, patient.lastName)} updated`,
      variant: 'success'
    })
  }

  private async handlePatientDeleted(patientName: string) {
    this.patients = await this.getPatients()
    this.selectedAmbulance = null
    this.selectedPatient = null
    forceUpdate(this)
    Router.push('/')
    this.handleToastShow({
      message: `Patient ${patientName} deleted`,
      variant: 'success'
    })
  }

  /* RESERVATION */
  private handleReservationCreated(reservation: Reservation) {
    Router.push(`/patient/${reservation.patient.id}/reservations`)
    this.createdReservation = reservation
    this.handleToastShow({
      message: `Reservation for ${EXAMINATION_TYPE[reservation.examinationType]} created`,
      description: `In ambulance ${reservation.ambulance.name} on ${dayjs(reservation.start).format(
        'LL'
      )}`,
      variant: 'success'
    })
  }

  /* TOAST */
  private handleToastHide() {
    this.toast = null
  }

  private handleToastShow(toast: Toast) {
    this.toast = toast
  }
}
