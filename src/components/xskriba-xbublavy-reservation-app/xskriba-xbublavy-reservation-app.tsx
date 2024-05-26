import { Component, Host, Prop, State, Watch, forceUpdate, h } from '@stencil/core'
import { createRouter, href, match, Route } from 'stencil-router-v2'
import dayjs from 'dayjs'

import {
  type Ambulance,
  type Patient,
  type Reservation,
  AmbulanceApiFactory,
  PatientApiFactory
} from '../../api/reservation'
import { formatFullName } from '../../utils/utils'
import { EXAMINATION_TYPE } from '../../global/constants'
import { setBaseUrl, withBase } from '../../store/baseUrlStore'

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
  @Prop() baseUrl: string = ''

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
    this.handleBaseUrlChange(this.baseUrl)
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

  @Watch('baseUrl')
  handleBaseUrlChange(newValue: string) {
    setBaseUrl(newValue)
  }

  render() {
    console.debug('api-base:', this.apiBase)
    console.debug('base-url:', this.baseUrl)

    const isCreateRoute = [withBase('/ambulance'), withBase('/patient')].includes(Router.activePath)
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
          {this.toast?.variant === 'success' ? (
            <xskriba-xbublavy-check2-circle-icon slot="icon"></xskriba-xbublavy-check2-circle-icon>
          ) : (
            <xskriba-xbublavy-exclamation-octagon-icon slot="icon"></xskriba-xbublavy-exclamation-octagon-icon>
          )}

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
                  withBase(
                    this.selectedAmbulance
                      ? `/ambulance/${this.selectedAmbulance.id}/reservations`
                      : this.selectedPatient
                      ? `/patient/${this.selectedPatient.id}/reservations`
                      : '/'
                  )
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
                      withBase(
                        this.selectedAmbulance
                          ? `/ambulance/${this.selectedAmbulance.id}`
                          : this.selectedPatient
                          ? `/patient/${this.selectedPatient.id}`
                          : '/'
                      )
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
                  withBase(
                    this.selectedAmbulance
                      ? `/ambulance/${this.selectedAmbulance.id}/reservations`
                      : this.selectedPatient
                      ? `/patient/${this.selectedPatient.id}/reservations`
                      : '/'
                  )
                )}
                variant="primary"
                size="large"
                outline
                circle
              >
                <xskriba-xbublavy-house-fill-icon></xskriba-xbublavy-house-fill-icon>
              </sl-button>
            )}

            <sl-dropdown distance={8} placement="bottom-end">
              <sl-button slot="trigger" variant="primary" size="large" circle>
                <xskriba-xbublavy-person-plus-fill-icon></xskriba-xbublavy-person-plus-fill-icon>
              </sl-button>

              <sl-menu>
                <sl-menu-item {...href(withBase('/ambulance'))}>
                  <xskriba-xbublavy-hospital-fill-icon slot="prefix"></xskriba-xbublavy-hospital-fill-icon>
                  Create Ambulance
                </sl-menu-item>

                <sl-menu-item {...href(withBase('/patient'))}>
                  <xskriba-xbublavy-person-vcard-fill-icon slot="prefix"></xskriba-xbublavy-person-vcard-fill-icon>
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
                path={withBase('/')}
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
                path={withBase('/')}
                to={withBase(
                  this.selectedAmbulance
                    ? `/ambulance/${this.selectedAmbulance.id}/reservations`
                    : this.selectedPatient
                    ? `/patient/${this.selectedPatient.id}/reservations`
                    : '/'
                )}
              />
            )}

            {/* AMBULANCE ROUTES */}
            {this.selectedAmbulance && (
              <Route
                path={match(withBase('/ambulance/:userId/reservations'), {
                  exact: true,
                  strict: true
                })}
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
                    onReservationCreatedShowed={() => this.handleReservationCreatedShowed()}
                  />
                )}
              />
            )}
            {this.selectedAmbulance && (
              <Route
                path={match(withBase('/ambulance/:userId'), { exact: true, strict: true })}
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
              path={withBase('/ambulance')}
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
                path={match(withBase('/patient/:userId/reservations/create'), {
                  exact: true,
                  strict: true
                })}
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
                path={match(withBase('/patient/:userId/reservations'), {
                  exact: true,
                  strict: true
                })}
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
                    onReservationCreatedShowed={() => this.handleReservationCreatedShowed()}
                  />
                )}
              />
            )}
            {this.selectedPatient && (
              <Route
                path={match(withBase('/patient/:userId'), { exact: true, strict: true })}
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
              path={withBase('/patient')}
              render={() => (
                <xskriba-xbublavy-patient-create
                  api-base={this.apiBase}
                  onPatientCreated={patient => this.handlePatientCreated(patient.detail)}
                />
              )}
            />

            {/* REDIRECT */}
            <Route path={/^(?!.*ui\/?$).*/} to={withBase('/')} />
          </Router.Switch>
        </main>
      </Host>
    )
  }

  /* AMBULANCE */

  private async handleAmbulanceCreated(ambulance: Ambulance) {
    this.ambulances = await this.getAmbulances()
    this.handleSelectAmbulance(ambulance)
    Router.push(withBase(`/ambulance/${ambulance.id}/reservations`))
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
    Router.push(withBase('/'))
    this.handleToastShow({
      message: `Ambulance ${ambulanceName} deleted`,
      variant: 'success'
    })
  }

  /* PATIENT */

  private async handlePatientCreated(patient: Patient) {
    this.patients = await this.getPatients()
    this.handleSelectPatient(patient)
    Router.push(withBase(`/patient/${patient.id}/reservations`))
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
    Router.push(withBase('/'))
    this.handleToastShow({
      message: `Patient ${patientName} deleted`,
      variant: 'success'
    })
  }

  /* RESERVATION */
  private handleReservationCreated(reservation: Reservation) {
    Router.push(withBase(`/patient/${reservation.patient.id}/reservations`))
    this.createdReservation = reservation
    this.handleToastShow({
      message: `Reservation for ${EXAMINATION_TYPE[reservation.examinationType]} created`,
      description: `In ambulance ${reservation.ambulance.name} on ${dayjs(reservation.start).format(
        'LL'
      )}`,
      variant: 'success'
    })
  }

  private handleReservationCreatedShowed() {
    this.createdReservation = null
  }

  /* TOAST */
  private handleToastHide() {
    this.toast = null
  }

  private handleToastShow(toast: Toast) {
    this.toast = toast
  }
}
