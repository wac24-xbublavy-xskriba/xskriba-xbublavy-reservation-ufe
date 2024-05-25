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
import trashIcon from '@shoelace-style/shoelace/dist/assets/icons/trash3-fill.svg'

import { PatientApiFactory, Sex, type Patient } from '../../api/reservation'
import { formatFullName } from '../../utils/utils'
import { SEX_TYPE } from '../../global/constants'

const schema = z.object({
  id: z.string().optional(),
  firstName: z.string({ required_error: 'First name is required' }).trim(),
  lastName: z.string({ required_error: 'Last name is required' }).trim(),
  birthday: z
    .string({ required_error: 'Birthday is required' })
    .date('Birthday must be a valid date')
    .refine(
      date => {
        return dayjs(date).isBefore(dayjs())
      },
      {
        message: 'Birthday must be in the past'
      }
    ),
  sex: z.nativeEnum(Sex, { required_error: 'Sex is required' }),
  bio: z.string().default('')
})

const defaultPatient: Partial<Patient> = {
  id: undefined,
  firstName: '',
  lastName: '',
  birthday: '',
  sex: undefined,
  bio: ''
}

@Component({
  tag: 'xskriba-xbublavy-patient-create',
  styleUrl: 'xskriba-xbublavy-patient-create.css',
  shadow: true
})
export class XskribaXbublavyPatientCreate {
  @Prop() apiBase: string
  @Prop() userId: string

  @State() isLoading: boolean = false
  @State() isDeleteDialogOpen: boolean = false
  @State() isValid: boolean = false
  @State() globalError: string | null = null
  @State() errors: Partial<Record<keyof Patient, string>> = {}
  @State() entry: Partial<Patient> = defaultPatient

  @Event() patientCreated: EventEmitter<Patient>
  @Event() patientUpdated: EventEmitter<Patient>
  @Event() patientDeleted: EventEmitter<string>

  private validateField<TName extends keyof Patient>(name: TName, value: Patient[TName]) {
    try {
      schema.shape[name].parse(value)
      this.errors = { ...this.errors, [name]: undefined }
    } catch (e) {
      this.errors = { ...this.errors, [name]: e.errors[0].message }
    }
  }

  private handleInput<TName extends keyof Patient>(event: InputEvent) {
    const target = event.target as HTMLInputElement

    const name = target.name as TName
    const value = target.value as Patient[TName]

    this.entry[name] = value
    this.validateField(name, value)
  }

  private async handleSubmit(event: Event) {
    event.preventDefault()
    this.isLoading = true
    this.globalError = null

    try {
      const data = schema.parse(this.entry)
      const api = PatientApiFactory(undefined, this.apiBase)

      const result = this.userId
        ? await api.updatePatient(this.userId, data)
        : await api.createPatient(data)

      await this.reloadPatient()

      if (!this.userId) {
        this.patientCreated.emit(result.data)
      }

      if (this.userId) {
        this.patientUpdated.emit(result.data)
      }
    } catch (e) {
      console.error(e)
      this.globalError = 'An error occurred while creating the patient. Please try again.'
    } finally {
      this.isLoading = false
    }
  }

  private async handleDelete() {
    this.isLoading = true

    try {
      if (this.userId) {
        await PatientApiFactory(undefined, this.apiBase).deletePatient(this.userId)
        this.patientDeleted.emit(formatFullName(this.entry.firstName, this.entry.lastName))
        this.isDeleteDialogOpen = false
      }
    } catch (e) {
      console.error(e)
      this.globalError = 'An error occurred while deleting the patient. Please try again.'
    } finally {
      this.isLoading = false
    }
  }

  private async getPatient(patientId: Patient['id']): Promise<Patient | null> {
    try {
      const response = await PatientApiFactory(undefined, this.apiBase).getPatientById(patientId)
      return response.data
    } catch (err) {
      alert(err.message)
      return null
    }
  }

  private async reloadPatient() {
    if (this.userId) {
      const patient = await this.getPatient(this.userId)
      if (patient) this.entry = patient
    }
  }

  private handleOpenDialog() {
    this.isDeleteDialogOpen = true
  }

  async componentWillLoad() {
    await this.reloadPatient()
  }

  @Watch('userId')
  async onUserChange() {
    await this.reloadPatient()
    forceUpdate(this)
  }

  render() {
    const canSubmit =
      Object.values(this.errors).every(error => !error) &&
      this.entry.firstName &&
      this.entry.lastName &&
      this.entry.birthday &&
      this.entry.sex

    const isProfile = !!this.userId

    return (
      <Host>
        <sl-dialog
          open={this.isDeleteDialogOpen && isProfile}
          label={`Do you want to remove patient ${formatFullName(
            this.entry.firstName,
            this.entry.lastName
          )}?`}
        >
          This action cannot be undone. Are you sure you want to delete this patient?
          <sl-button
            onclick={() => this.handleDelete()}
            disabled={this.isLoading}
            loading={this.isLoading}
            slot="footer"
            variant="danger"
          >
            Yes, Delete Patient
          </sl-button>
        </sl-dialog>

        <sl-card class="wrapper">
          <header slot="header">
            <div>
              <sl-icon-button
                src={backIcon}
                label="Back"
                {...href(isProfile ? `/patient/${this.userId}/reservations` : '/')}
                disabled={this.isLoading}
              ></sl-icon-button>

              <h3>{isProfile ? 'My Profile' : 'Create Patient'}</h3>
            </div>

            {isProfile && (
              <sl-button
                onclick={() => this.handleOpenDialog()}
                disabled={this.isLoading}
                variant="danger"
                size="medium"
                class="end"
                circle
              >
                <sl-icon src={trashIcon} label="Delete"></sl-icon>
              </sl-button>
            )}
          </header>

          <form onSubmit={event => this.handleSubmit(event)} class="validity-styles">
            <div>
              <sl-input
                name="firstName"
                label="Name"
                placeholder="John"
                value={this.entry?.firstName || ''}
                on-sl-input={event => this.handleInput(event)}
                help-text={this.errors.firstName}
                disabled={isProfile || this.isLoading}
                required
              ></sl-input>

              <sl-input
                name="lastName"
                label="Surname"
                placeholder="Doe"
                value={this.entry?.lastName || ''}
                on-sl-input={event => this.handleInput(event)}
                help-text={this.errors.lastName}
                disabled={isProfile || this.isLoading}
                required
              ></sl-input>
            </div>

            <div>
              <sl-input
                type="date"
                name="birthday"
                label="Date of Birth"
                value={this.entry?.birthday || ''}
                on-sl-input={event => this.handleInput(event)}
                help-text={this.errors.birthday}
                disabled={isProfile || this.isLoading}
                max={dayjs().format('YYYY-MM-DD')}
                required
              ></sl-input>

              <sl-select
                name="sex"
                label="Sex"
                placeholder="Select one"
                on-sl-input={event => this.handleInput(event)}
                value={this.entry?.sex || ''}
                help-text={this.errors.sex}
                disabled={isProfile || this.isLoading}
                required
              >
                {Object.values(Sex).map(sex => (
                  <sl-option value={sex}>{SEX_TYPE[sex]}</sl-option>
                ))}
              </sl-select>
            </div>

            <sl-textarea
              label="Bio"
              name="bio"
              value={this.entry?.bio || ''}
              on-sl-input={event => this.handleInput(event)}
              placeholder="Please tell us more about yourself."
              help-text={this.errors.bio}
              disabled={this.isLoading}
              resize="auto"
            ></sl-textarea>

            {this.globalError && (
              <sl-alert variant="danger" open>
                <sl-icon slot="icon" src={dangerIcon}></sl-icon>
                <strong>{this.globalError}</strong>
              </sl-alert>
            )}

            <footer>
              <sl-button
                disabled={!canSubmit || this.isLoading}
                loading={this.isLoading}
                type="submit"
                variant="primary"
              >
                {isProfile ? 'Update Profile' : 'Create Patient'}
              </sl-button>
            </footer>
          </form>
        </sl-card>
      </Host>
    )
  }
}
