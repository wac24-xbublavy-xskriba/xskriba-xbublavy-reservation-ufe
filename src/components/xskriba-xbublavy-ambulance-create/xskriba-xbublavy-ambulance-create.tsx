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
import trashIcon from '@shoelace-style/shoelace/dist/assets/icons/trash3-fill.svg'

// TODO: toast success

import { AmbulanceApiFactory, MedicalExaminations, type Ambulance } from '../../api/reservation'
import { isValidTimeBefore } from '../../utils/utils'
import { TIME_REGEX } from '../../global/constants'

const schema = z.object({
  id: z.string().optional(),
  name: z.string({ required_error: 'Name is required' }).trim(),
  address: z.string({ required_error: 'Address is required' }).trim(),
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

export type FormData = Omit<Ambulance, 'officeHours'> & Ambulance['officeHours']

const defaultAmbulance: Partial<FormData> = {
  name: '',
  address: '',
  medicalExaminations: [],
  open: undefined,
  close: undefined
}

@Component({
  tag: 'xskriba-xbublavy-ambulance-create',
  styleUrl: 'xskriba-xbublavy-ambulance-create.css',
  shadow: true
})
export class XskribaXbublavyAmbulanceCreate {
  @Prop() apiBase: string
  @Prop() userId: string

  @State() isLoading: boolean = false
  @State() isDeleteDialogOpen: boolean = false
  @State() isValid: boolean = false
  @State() globalError: string | null = null
  @State() errors: Partial<Record<keyof FormData, string>> = {}
  @State() entry: Partial<FormData> = defaultAmbulance

  @Event() ambulanceCreated: EventEmitter<Ambulance>
  @Event() ambulanceDeleted: EventEmitter<void>

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
    this.globalError = null

    if (isValidTimeBefore(this.entry.open, this.entry.close)) {
      this.globalError = 'Close time must be after open time.'
      this.isLoading = false
      return
    }

    try {
      const data = schema
        .transform(({ open, close, ...data }) => ({ ...data, officeHours: { open, close } }))
        .parse(this.entry)
      const api = AmbulanceApiFactory(undefined, this.apiBase)

      const result = this.userId
        ? await api.updateAmbulance(this.userId, data)
        : await api.createAmbulance(data)

      await this.reloadAmbulance()

      if (!this.userId) {
        this.ambulanceCreated.emit(result.data)
      }
    } catch (e) {
      console.error(e)
      this.globalError = 'An error occurred while creating the ambulance. Please try again.'
    } finally {
      this.isLoading = false
    }
  }

  private async handleDelete() {
    try {
      if (this.userId) {
        await AmbulanceApiFactory(undefined, this.apiBase).deleteAmbulance(this.userId)
        this.ambulanceDeleted.emit()
        this.isDeleteDialogOpen = false
      }
    } catch (e) {
      console.error(e)
      this.globalError = 'An error occurred while deleting the patient. Please try again.'
    } finally {
      this.isLoading = false
    }
  }

  private async getAmbulance(ambulanceId: Ambulance['id']): Promise<Ambulance | null> {
    try {
      const response = await AmbulanceApiFactory(undefined, this.apiBase).getAmbulanceById(
        ambulanceId
      )
      return response.data
    } catch (err) {
      alert(err.message)
      return null
    }
  }

  private async reloadAmbulance() {
    if (this.userId) {
      const ambulance = await this.getAmbulance(this.userId)
      if (ambulance) {
        const { officeHours, ...rest } = ambulance
        this.entry = { ...rest, ...officeHours }
      }
    }
  }

  private handleOpenDialog() {
    this.isDeleteDialogOpen = true
  }

  async componentWillLoad() {
    await this.reloadAmbulance()
  }

  @Watch('userId')
  async onUserChange() {
    await this.reloadAmbulance()
    forceUpdate(this)
  }

  render() {
    const canSubmit =
      Object.values(this.errors).every(error => !error) &&
      this.entry.name &&
      this.entry.address &&
      this.entry.medicalExaminations?.length &&
      this.entry.open &&
      this.entry.close

    const isProfile = !!this.userId

    return (
      <Host>
        <sl-dialog
          open={this.isDeleteDialogOpen && isProfile}
          label={`Do you want to remove ambulance ${this.entry.name}?`}
        >
          This action cannot be undone. Are you sure you want to delete this ambulance?
          <sl-button
            onclick={() => this.handleDelete()}
            disabled={this.isLoading}
            loading={this.isLoading}
            slot="footer"
            variant="danger"
          >
            Yes, Delete Ambulance
          </sl-button>
        </sl-dialog>

        <sl-card class="wrapper">
          <header slot="header">
            <div>
              <sl-icon-button
                src={backIcon}
                label="Back"
                {...href(isProfile ? `/ambulance/${this.userId}/reservations` : '/')}
                disabled={this.isLoading}
              ></sl-icon-button>

              <h3>{isProfile ? 'My Profile' : 'Create Ambulance'}</h3>
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
            <sl-input
              name="name"
              label="Name"
              placeholder="Medical Ambulance"
              value={this.entry?.name}
              on-sl-input={event => this.handleInput(event)}
              help-text={this.errors.name}
              disabled={isProfile || this.isLoading}
              required
            ></sl-input>

            <sl-input
              name="address"
              label="Address"
              placeholder="Bratislava 1"
              value={this.entry?.address}
              on-sl-input={event => this.handleInput(event)}
              help-text={this.errors.address}
              disabled={isProfile || this.isLoading}
              required
            ></sl-input>

            <sl-select
              name="medicalExaminations"
              label="Medical Examinations"
              placeholder="Select few"
              on-sl-input={event => this.handleInput(event)}
              value={this.entry?.medicalExaminations}
              help-text={this.errors.medicalExaminations}
              disabled={this.isLoading}
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
                disabled={this.isLoading}
                required
              ></sl-input>

              <sl-input
                type="time"
                name="close"
                label="Close Time"
                value={this.entry?.close}
                on-sl-input={event => this.handleInput(event)}
                help-text={this.errors?.close}
                disabled={this.isLoading}
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
              <sl-button
                disabled={!canSubmit || this.isLoading}
                loading={this.isLoading}
                type="submit"
                variant="primary"
              >
                {isProfile ? 'Update Profile' : 'Create Ambulance'}
              </sl-button>
            </footer>
          </form>
        </sl-card>
      </Host>
    )
  }
}
