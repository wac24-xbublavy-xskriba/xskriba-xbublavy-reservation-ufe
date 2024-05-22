import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core'
import { href } from 'stencil-router-v2'
import { z } from 'zod'

import backIcon from '@shoelace-style/shoelace/dist/assets/icons/chevron-left.svg'
import dangerIcon from '@shoelace-style/shoelace/dist/assets/icons/exclamation-octagon.svg'

// TODO: delete button, update mutation, get patient by id

import { PatientApiFactory, Sex, type Patient } from '../../api/reservation'

const schema = z
  .object({
    firstName: z.string({ required_error: 'First name is required' }),
    lastName: z.string({ required_error: 'Last name is required' }),
    birthday: z
      .string({ required_error: 'Birthday is required' })
      .date('Birthday must be a valid date'),
    sex: z.nativeEnum(Sex, { required_error: 'Sex is required' }),
    bio: z.string().optional()
  })
  .required()
  .strict()

@Component({
  tag: 'xskriba-xbublavy-patient-create',
  styleUrl: 'xskriba-xbublavy-patient-create.css',
  shadow: true
})
export class XskribaXbublavyPatientCreate {
  @Prop() apiBase: string
  @Prop() userId: string

  @State() isValid: boolean = false
  @State() globalError: string | null = null
  @State() errors: Partial<Record<keyof Patient, string>> = {}
  @State() entry: Partial<Omit<Patient, 'id'>> = {
    firstName: '',
    lastName: '',
    birthday: undefined,
    sex: undefined,
    bio: ''
  }

  @Event() patientCreated: EventEmitter<Patient>

  private validateField<TName extends keyof Omit<Patient, 'id'>>(
    name: TName,
    value: Patient[TName]
  ) {
    try {
      schema.shape[name].parse(value)
      this.errors = { ...this.errors, [name]: undefined }
    } catch (e) {
      this.errors = { ...this.errors, [name]: e.errors[0].message }
    }
  }

  private handleInput<TName extends keyof Omit<Patient, 'id'>>(event: InputEvent) {
    const target = event.target as HTMLInputElement

    const name = target.name as TName
    const value = target.value as Patient[TName]

    this.entry[name] = value
    this.validateField(name, value)
  }

  private async handleSubmit(event: Event) {
    event.preventDefault()
    this.globalError = null

    try {
      const result = schema.parse(this.entry)

      await PatientApiFactory(undefined, this.apiBase).createPatient({ id: '1', ...result })

      this.patientCreated.emit({ id: '1', ...result })
    } catch (e) {
      this.globalError = 'An error occurred while creating the patient. Please try again.'
    }
  }

  render() {
    const canSubmit =
      Object.values(this.errors).every(error => !error) &&
      this.entry.firstName &&
      this.entry.lastName &&
      this.entry.birthday &&
      this.entry.sex

    const isUpdate = !!this.userId

    return (
      <Host>
        <sl-card class="wrapper">
          <header slot="header">
            <sl-icon-button
              src={backIcon}
              label="Back"
              {...href(isUpdate ? `/patient/${this.userId}/reservations` : '/')}
            ></sl-icon-button>

            <h3>{isUpdate ? 'My Profile' : 'Create Patient'}</h3>
          </header>

          <form onSubmit={event => this.handleSubmit(event)} class="validity-styles">
            <div>
              <sl-input
                name="firstName"
                label="Name"
                placeholder="John"
                value={this.entry?.firstName}
                on-sl-input={event => this.handleInput(event)}
                help-text={this.errors.firstName}
                disabled={isUpdate}
                required
              ></sl-input>

              <sl-input
                name="lastName"
                label="Surname"
                placeholder="Doe"
                value={this.entry?.lastName}
                on-sl-input={event => this.handleInput(event)}
                help-text={this.errors.lastName}
                disabled={isUpdate}
                required
              ></sl-input>
            </div>

            <div>
              <sl-input
                type="date"
                name="birthday"
                label="Date of Birth"
                value={this.entry?.birthday}
                on-sl-input={event => this.handleInput(event)}
                help-text={this.errors.birthday}
                disabled={isUpdate}
                required
              ></sl-input>

              <sl-select
                name="sex"
                label="Sex"
                placeholder="Select one"
                on-sl-input={event => this.handleInput(event)}
                value={this.entry?.sex}
                help-text={this.errors.sex}
                disabled={isUpdate}
                required
              >
                {Object.values(Sex).map(sex => (
                  <sl-option value={sex}>{sex}</sl-option>
                ))}
              </sl-select>
            </div>

            <sl-textarea
              label="Bio"
              name="bio"
              value={this.entry?.bio}
              on-sl-input={event => this.handleInput(event)}
              placeholder="Please tell us more about yourself."
              help-text={this.errors.bio}
              resize="auto"
            ></sl-textarea>

            {this.globalError && (
              <sl-alert variant="danger" open>
                <sl-icon slot="icon" src={dangerIcon}></sl-icon>
                <strong>{this.globalError}</strong>
              </sl-alert>
            )}

            <footer>
              <sl-button disabled={!canSubmit} type="submit" variant="primary">
                {isUpdate ? 'Update Profile' : 'Create Patient'}
              </sl-button>
            </footer>
          </form>
        </sl-card>
      </Host>
    )
  }
}
