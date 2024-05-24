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

import backIcon from '@shoelace-style/shoelace/dist/assets/icons/chevron-left.svg'
import dangerIcon from '@shoelace-style/shoelace/dist/assets/icons/exclamation-octagon.svg'

import {
  Examination,
  MedicalExaminations,
  Patient,
  PatientApiFactory,
  Reservation
} from '../../api/reservation'
import dayjs from 'dayjs'
import { EXAMINATION_TYPE } from '../../global/constants'

const schema = z.object({
  date: z.string({ required_error: 'Date is required' }).refine(
    date => {
      return dayjs(date).endOf('day').isAfter(dayjs().startOf('day'))
    },
    {
      message: 'Date must be in the future'
    }
  ),
  examinationType: z.nativeEnum(MedicalExaminations, {
    required_error: 'Examination type is required',
    invalid_type_error: 'Invalid examination type'
  })
})

export type FormData = z.input<typeof schema>

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
  @State() isLoading: boolean = false
  @State() isValid: boolean = false
  @State() globalError: string | null = null
  @State() errors: Partial<Record<keyof FormData, string>> = {}
  @State() entry: Partial<FormData> = defaultRequest

  @State() examinations: Examination[] = []

  @Event() reservationCreated: EventEmitter<Reservation>

  private validateField<TName extends keyof FormData>(name: TName, value: FormData[TName]) {
    try {
      schema.shape[name].parse(value)
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
    this.isLoading = true

    if (!this.patient) return

    try {
      const data = schema.parse(this.entry)
      const api = PatientApiFactory(undefined, this.apiBase)

      const result = await api.requestExamination(this.patient.id, data)

      this.examinations = result.data
    } catch (err) {
      console.error(err.message)
      this.globalError = 'An error occurred while creating the ambulance. Please try again.'
    } finally {
      this.isLoading = false
    }
  }

  @Watch('patient')
  onUserChange() {
    forceUpdate(this)
  }

  render() {
    const canSubmit =
      Object.values(this.errors).every(error => !error) &&
      this.entry.date &&
      this.entry.examinationType

    console.log(this.examinations)

    return (
      <Host>
        <sl-card>
          <article class="wrapper">
            <header>
              <sl-icon-button
                src={backIcon}
                label="Back"
                {...href(`/ambulance/${this.patient?.id}/reservations`)}
                disabled={this.isLoading}
              ></sl-icon-button>

              <h3>Request Reservation</h3>
            </header>

            <form onSubmit={event => this.handleSubmit(event)} class="validity-styles">
              <sl-input
                type="date"
                name="date"
                label="Date"
                value={this.entry?.date}
                on-sl-input={event => this.handleInput(event)}
                help-text={this.errors?.date}
                disabled={this.isLoading}
                required
              ></sl-input>

              <sl-select
                name="examinationType"
                label="Examination Type"
                placeholder="Select one"
                on-sl-input={event => this.handleInput(event)}
                value={this.entry?.examinationType}
                help-text={this.errors.examinationType}
                disabled={this.isLoading}
                required
              >
                {Object.values(MedicalExaminations).map(examination => (
                  <sl-option value={examination}>{EXAMINATION_TYPE[examination]}</sl-option>
                ))}
              </sl-select>

              <footer>
                <sl-button
                  disabled={!canSubmit || this.isLoading}
                  loading={this.isLoading}
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

          <div>
            <sl-card class="reservation">aa</sl-card>
            <sl-card class="reservation">aa</sl-card>
            <sl-card class="reservation">aa</sl-card>
          </div>
        </section>
      </Host>
    )
  }
}
