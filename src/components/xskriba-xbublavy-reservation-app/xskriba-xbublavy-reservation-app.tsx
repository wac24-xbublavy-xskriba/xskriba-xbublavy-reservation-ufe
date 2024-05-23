import { Component, Host, Prop, State, h } from '@stencil/core'
import { createRouter, href, match, Route } from 'stencil-router-v2'

import addIcon from '@shoelace-style/shoelace/dist/assets/icons/person-plus-fill.svg'
import homeIcon from '@shoelace-style/shoelace/dist/assets/icons/house-fill.svg'
import ambulanceIcon from '@shoelace-style/shoelace/dist/assets/icons/hospital-fill.svg'
import patientIcon from '@shoelace-style/shoelace/dist/assets/icons/person-vcard-fill.svg'

import { formatFullName } from '../../utils/utils'
import {
  Ambulance,
  Patient,
  AmbulanceApiFactory,
  PatientApiFactory,
  Reservation
} from '../../api/reservation'

const Router = createRouter()

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
  @Prop() apiBase: string

  @State() private ambulances: Ambulance[] = []
  @State() private patients: Patient[] = []

  @State() private selectedAmbulance: Ambulance | null = null
  @State() private selectedPatient: Patient | null = null

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
                path={match('/ambulance/:userId/reservations/:id', { exact: true, strict: true })}
                render={({ id }) => (
                  <xskriba-xbublavy-reservation-detail
                    api-base={this.apiBase}
                    ambulance-reservation-id={id}
                  />
                )}
              />
            )}
            {this.selectedAmbulance && (
              <Route
                path={match('/ambulance/:userId/reservations', { exact: true, strict: true })}
                render={() => (
                  <xskriba-xbublavy-reservations-list
                    api-base={this.apiBase}
                    ambulance={this.selectedAmbulance}
                    onReservationEventClicked={reservation =>
                      this.handleReservationEventClicked(reservation.detail)
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
                    onAmbulanceDeleted={() => this.handleAmbulanceDeleted()}
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
                  />
                )}
              />
            )}
            {this.selectedPatient && (
              <Route
                path={match('/patient/:userId/reservations/:id', { exact: true, strict: true })}
                render={({ id }) => (
                  <xskriba-xbublavy-reservation-detail
                    api-base={this.apiBase}
                    patient-reservation-id={id}
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
                    onReservationEventClicked={reservation =>
                      this.handleReservationEventClicked(reservation.detail)
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
                    onPatientDeleted={() => this.handlePatientDeleted()}
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
            <Route path={/.*/} to="/" />
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
  }

  private async handleAmbulanceDeleted() {
    this.ambulances = await this.getAmbulances()
    this.selectedAmbulance = null
    this.selectedPatient = null
    Router.push('/')
  }

  /* PATIENT */

  private async handlePatientCreated(patient: Patient) {
    this.patients = await this.getPatients()
    this.handleSelectPatient(patient)
    Router.push(`/patient/${patient.id}/reservations`)
  }

  private async handlePatientDeleted() {
    this.patients = await this.getPatients()
    this.selectedAmbulance = null
    this.selectedPatient = null
    Router.push('/')
  }

  /* RESERVATION */
  private handleReservationEventClicked(reservationId: Reservation['id']) {
    const name = this.selectedAmbulance ? 'ambulance' : this.selectedPatient ? 'patient' : null
    const userId = this.selectedAmbulance
      ? this.selectedAmbulance.id
      : this.selectedPatient
      ? this.selectedPatient.id
      : null
    if (!name || !userId) throw new Error('Invalid user type')
    Router.push(`/${name}/${userId}/reservations/${reservationId}`)
  }
}
