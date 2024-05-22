import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core'
import { href } from 'stencil-router-v2'
import { z } from 'zod'

import backIcon from '@shoelace-style/shoelace/dist/assets/icons/chevron-left.svg'
import dangerIcon from '@shoelace-style/shoelace/dist/assets/icons/exclamation-octagon.svg'

// TODO: delete button, update mutation, get patient by id

import { AmbulanceApiFactory, MedicalExaminations, type Ambulance } from '../../api/reservation'
import { isValidTimeBefore } from '../../utils/utils'
import { TIME_REGEX } from '../../global/constants'

const schema = z
  .object({
    name: z.string({ required_error: 'Name is required' }),
    address: z.string({ required_error: 'Address is required' }),
    medicalExaminations: z.array(z.nativeEnum(MedicalExaminations), {
      required_error: 'Medical examinations are required'
    }),
    open: z
      .string({ required_error: 'Open time is required' })
      .refine(time => TIME_REGEX.test(time), {
        message: 'Invalid time format. Expected HH:MM in 24-hour format.'
      }),
    close: z
      .string({ required_error: 'Close time is required' })
      .refine(time => TIME_REGEX.test(time), {
        message: 'Invalid time format. Expected HH:MM in 24-hour format.'
      })
  })
  .required()
  .strict()

export type FormData = Omit<Ambulance, 'id' | 'officeHours'> & Ambulance['officeHours']

@Component({
  tag: 'xskriba-xbublavy-ambulance-create',
  styleUrl: 'xskriba-xbublavy-ambulance-create.css',
  shadow: true
})
export class XskribaXbublavyAmbulanceCreate {
  @Prop() apiBase: string
  @Prop() userId: string

  @State() isValid: boolean = false
  @State() globalError: string | null = null
  @State() errors: Partial<Record<keyof FormData, string>> = {}
  @State() entry: Partial<FormData> = {
    name: '',
    address: '',
    medicalExaminations: [],
    open: undefined,
    close: undefined
  }

  @Event() ambulanceCreated: EventEmitter<Ambulance>

  private validateField<TName extends keyof FormData>(name: TName, value: FormData[TName]) {
    console.log(value)
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
    this.globalError = null

    if (isValidTimeBefore(this.entry.open, this.entry.close)) {
      this.globalError = 'Close time must be after open time.'
      return
    }

    try {
      const result = schema
        .transform(({ open, close, ...data }) => ({ ...data, officeHours: { open, close } }))
        .parse(this.entry)

      await AmbulanceApiFactory(undefined, this.apiBase).createAmbulance({ id: '1', ...result })

      this.ambulanceCreated.emit({ id: '1', ...result })
    } catch (e) {
      this.globalError = 'An error occurred while creating the ambulance. Please try again.'
    }
  }

  render() {
    const canSubmit =
      Object.values(this.errors).every(error => !error) &&
      this.entry.name &&
      this.entry.address &&
      this.entry.medicalExaminations?.length &&
      this.entry.open &&
      this.entry.close

    const isUpdate = !!this.userId

    return (
      <Host>
        <sl-card class="wrapper">
          <header slot="header">
            <sl-icon-button
              src={backIcon}
              label="Back"
              {...href(isUpdate ? `/ambulance/${this.userId}/reservations` : '/')}
            ></sl-icon-button>

            <h3>{isUpdate ? 'My Profile' : 'Create Ambulance'}</h3>
          </header>

          <form onSubmit={event => this.handleSubmit(event)} class="validity-styles">
            <sl-input
              name="name"
              label="Name"
              placeholder="Medical Ambulance"
              value={this.entry?.name}
              on-sl-input={event => this.handleInput(event)}
              help-text={this.errors.name}
              disabled={isUpdate}
              required
            ></sl-input>

            <sl-input
              name="address"
              label="Address"
              placeholder="Bratislava 1"
              value={this.entry?.address}
              on-sl-input={event => this.handleInput(event)}
              help-text={this.errors.address}
              disabled={isUpdate}
              required
            ></sl-input>

            <sl-select
              name="medicalExaminations"
              label="Medical Examinations"
              placeholder="Select few"
              on-sl-input={event => this.handleInput(event)}
              value={this.entry?.medicalExaminations}
              help-text={this.errors.medicalExaminations}
              required
              multiple
            >
              {Object.values(MedicalExaminations).map(examination => (
                <sl-option value={examination}>{examination}</sl-option>
              ))}
            </sl-select>

            <div>
              <sl-input
                type="time"
                name="open"
                label="Open Time"
                value={this.entry?.open}
                on-sl-input={event => this.handleInput(event)}
                help-text={this.errors?.open}
                required
              ></sl-input>

              <sl-input
                type="time"
                name="close"
                label="Close Time"
                value={this.entry?.close}
                on-sl-input={event => this.handleInput(event)}
                help-text={this.errors?.close}
                required
              ></sl-input>
            </div>

            {this.globalError && (
              <sl-alert variant="danger" open>
                <sl-icon slot="icon" src={dangerIcon}></sl-icon>
                <strong>{this.globalError}</strong>
              </sl-alert>
            )}

            <footer>
              <sl-button disabled={!canSubmit} type="submit" variant="primary">
                {isUpdate ? 'Update Profile' : 'Create Ambulance'}
              </sl-button>
            </footer>
          </form>
        </sl-card>
      </Host>
    )
  }
}
