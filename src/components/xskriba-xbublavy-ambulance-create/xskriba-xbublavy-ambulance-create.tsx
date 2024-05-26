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

import { AmbulanceApiFactory, MedicalExaminations, type Ambulance } from '../../api/reservation'
import { CreateAmbulanceSchema, CreateAmbulanceSchemaTransform } from '../../global/schemas'
import { isValidTimeBefore } from '../../utils/utils'

import { EXAMINATION_TYPE } from '../../global/constants'
import { withBase } from '../../store/baseUrlStore'

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
  @Event() ambulanceUpdated: EventEmitter<Ambulance>
  @Event() ambulanceDeleted: EventEmitter<string>

  private validateField<TName extends keyof FormData>(name: TName, value: FormData[TName]) {
    try {
      CreateAmbulanceSchema.shape[name].parse(value)
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
      const data = CreateAmbulanceSchemaTransform.parse(this.entry)
      const api = AmbulanceApiFactory(undefined, this.apiBase)

      const result = this.userId
        ? await api.updateAmbulance(this.userId, data)
        : await api.createAmbulance(data)

      await this.reloadAmbulance()

      if (!this.userId) this.ambulanceCreated.emit(result.data)
      if (this.userId) this.ambulanceUpdated.emit(result.data)
    } catch (e) {
      console.error(e)
      this.globalError = 'An error occurred while creating the ambulance. Please try again.'
    } finally {
      this.isLoading = false
    }
  }

  private async handleDelete() {
    this.isLoading = true

    try {
      if (this.userId) {
        await AmbulanceApiFactory(undefined, this.apiBase).deleteAmbulance(this.userId)
        this.ambulanceDeleted.emit(this.entry.name)
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
              <sl-button
                {...href(withBase(isProfile ? `/ambulance/${this.userId}/reservations` : '/'))}
                disabled={this.isLoading}
                variant="text"
                size="small"
                circle
              >
                <xskriba-xbublavy-chevron-left-icon></xskriba-xbublavy-chevron-left-icon>
              </sl-button>

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
                <xskriba-xbublavy-trash3-fill-icon></xskriba-xbublavy-trash3-fill-icon>
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
                <sl-option value={examination}>{EXAMINATION_TYPE[examination]}</sl-option>
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
                <xskriba-xbublavy-exclamation-octagon-icon slot="icon"></xskriba-xbublavy-exclamation-octagon-icon>
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
