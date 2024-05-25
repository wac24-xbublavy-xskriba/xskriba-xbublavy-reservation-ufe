import {
  Component,
  Event,
  EventEmitter,
  Host,
  Prop,
  State,
  Watch,
  forceUpdate,
  h
} from '@stencil/core'
import { href } from 'stencil-router-v2'
import { z } from 'zod'
import dayjs from 'dayjs'

import backIcon from '@shoelace-style/shoelace/dist/assets/icons/chevron-left.svg'
import dangerIcon from '@shoelace-style/shoelace/dist/assets/icons/exclamation-octagon.svg'
import infoIcon from '@shoelace-style/shoelace/dist/assets/icons/info-circle.svg'

import {
  type Examination,
  type Patient,
  type Reservation,
  MedicalExaminations,
  PatientApiFactory
} from '../../api/reservation'
import { EXAMINATION_TYPE } from '../../global/constants'
import { CreateExaminationSchema } from '../../global/schemas'

export type FormData = z.input<typeof CreateExaminationSchema>

const defaultRequest: Partial<FormData> = {
  date: dayjs().format('YYYY-MM-DD'),
  examinationType: undefined
}

@Component({
  tag: 'xskriba-xbublavy-reservation-create',
  styleUrl: 'xskriba-xbublavy-reservation-create.css',
  shadow: true
})
export class XskribaXbublavyReservationCreate {
  @Prop() apiBase: string
  @Prop() patient: Patient | null

  @State() isFetching: boolean = false
  @State() isFetched: boolean = false
  @State() isLoading: boolean = false
  @State() isValid: boolean = false
  @State() globalError: string | null = null
  @State() errors: Partial<Record<keyof FormData, string>> = {}
  @State() entry: Partial<FormData> = defaultRequest

  @State() examinations: Examination[] = []

  @Event() reservationCreated: EventEmitter<Reservation>

  private validateField<TName extends keyof FormData>(name: TName, value: FormData[TName]) {
    try {
      CreateExaminationSchema.shape[name].parse(value)
      this.errors = { ...this.errors, [name]: undefined }
    } catch (e) {
      this.errors = { ...this.errors, [name]: e.errors[0].message }
    }
  }

  private handleInput<TName extends keyof FormData>(event: InputEvent) {
    const target = event.target as HTMLInputElement

    const name = target.name as TName
    const value = target.value as FormData[TName]

    this.entry[name] = value
    this.validateField(name, value)
  }

  private async handleSubmit(event: Event) {
    event.preventDefault()
    this.isFetching = true
    this.globalError = null

    if (!this.patient) return

    try {
      const data = CreateExaminationSchema.parse(this.entry)
      const api = PatientApiFactory(undefined, this.apiBase)

      const result = await api.requestExamination(this.patient.id, data)

      this.examinations = result.data
    } catch (err) {
      console.error(err.message)
      this.globalError = 'An error occurred while creating the ambulance. Please try again.'
    } finally {
      this.isFetching = false
      this.isFetched = true
    }
  }

  private async handleCreateReservation(examination: Examination) {
    this.isLoading = true

    if (!this.patient) return

    try {
      const api = PatientApiFactory(undefined, this.apiBase)

      const result = await api.createReservation(this.patient.id, {
        ambulanceId: examination.ambulance.id,
        examinationType: examination.examinationType,
        start: dayjs.utc(examination.start).toISOString(),
        end: dayjs.utc(examination.end).toISOString(),
        patientId: this.patient.id
      })

      this.reservationCreated.emit(result.data)
    } catch (err) {
      console.error(err.message)
      this.globalError = 'An error occurred while creating the reservation. Please try again.'
    } finally {
      this.isLoading = false
    }
  }

  private renderExamination(examination: Examination) {
    return (
      <sl-card class="reservation">
        <header slot="header">
          <div>
            <h4>{examination.ambulance.name}</h4>
            <span>{examination.ambulance.address}</span>
          </div>

          <div class="hours">
            <span>Office Hours:</span>
            <div>
              <sl-tag size="medium">{examination.ambulance.officeHours.open}</sl-tag>
              <small>-</small>
              <sl-tag size="medium">{examination.ambulance.officeHours.close}</sl-tag>
            </div>
          </div>
        </header>

        <article>
          <span>from:</span>
          <sl-tag variant="primary" size="large" class="date">
            {dayjs.utc(examination.start).format('LL')}
            <small>-</small>
            {dayjs.utc(examination.start).format('LT')}
          </sl-tag>

          <span>to:</span>
          <sl-tag variant="primary" size="large" class="date">
            {dayjs.utc(examination.end).format('LL')}
            <small>-</small>
            {dayjs.utc(examination.end).format('LT')}
          </sl-tag>
        </article>

        <footer slot="footer">
          <sl-button
            disabled={this.isFetching || this.isLoading}
            loading={this.isLoading}
            variant="primary"
            onclick={() => this.handleCreateReservation(examination)}
          >
            Accept Reservation
          </sl-button>
        </footer>
      </sl-card>
    )
  }

  @Watch('patient')
  onUserChange() {
    this.examinations = []
    forceUpdate(this)
  }

  render() {
    const canSubmit =
      Object.values(this.errors).every(error => !error) &&
      this.entry.date &&
      this.entry.examinationType

    return (
      <Host>
        <sl-card>
          <article class="wrapper">
            <header>
              <sl-icon-button
                src={backIcon}
                label="Back"
                {...href(`/ambulance/${this.patient?.id}/reservations`)}
                disabled={this.isFetching || this.isLoading}
              ></sl-icon-button>

              <h3>Request Reservation</h3>
            </header>

            <form onSubmit={event => this.handleSubmit(event)} class="validity-styles">
              <sl-input
                type="date"
                name="date"
                label="Date"
                min={dayjs().format('YYYY-MM-DD')}
                value={this.entry?.date}
                on-sl-input={event => this.handleInput(event)}
                help-text={this.errors?.date}
                disabled={this.isFetching || this.isLoading}
                required
              ></sl-input>

              <sl-select
                name="examinationType"
                label="Examination Type"
                placeholder="Select one"
                on-sl-input={event => this.handleInput(event)}
                value={this.entry?.examinationType}
                help-text={this.errors.examinationType}
                disabled={this.isFetching || this.isLoading}
                required
              >
                {Object.values(MedicalExaminations).map(examination => (
                  <sl-option value={examination}>{EXAMINATION_TYPE[examination]}</sl-option>
                ))}
              </sl-select>

              <footer>
                <sl-button
                  disabled={!canSubmit || this.isFetching || this.isLoading}
                  loading={this.isFetching}
                  type="submit"
                  variant="primary"
                >
                  Send Request
                </sl-button>
              </footer>
            </form>

            {this.globalError && (
              <sl-alert variant="danger" open>
                <sl-icon slot="icon" src={dangerIcon}></sl-icon>
                <strong>{this.globalError}</strong>
              </sl-alert>
            )}
          </article>
        </sl-card>

        <section>
          {this.isFetching && <sl-spinner style={{ 'font-size': '3rem' }}></sl-spinner>}

          {this.isFetched && !this.examinations.length && (
            <sl-alert variant="primary" open>
              <sl-icon slot="icon" src={infoIcon}></sl-icon>
              <strong>No ambulance available for the selected date and examination type.</strong>
            </sl-alert>
          )}

          <div>{this.examinations.map(this.renderExamination, this)}</div>
        </section>
      </Host>
    )
  }
}
