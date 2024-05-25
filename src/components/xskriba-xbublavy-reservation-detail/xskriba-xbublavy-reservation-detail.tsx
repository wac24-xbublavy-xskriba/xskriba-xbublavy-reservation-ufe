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
import { z } from 'zod'
import dayjs from 'dayjs'

import dangerIcon from '@shoelace-style/shoelace/dist/assets/icons/exclamation-octagon.svg'
import trashIcon from '@shoelace-style/shoelace/dist/assets/icons/trash3-fill.svg'

import { ReservationApiFactory, Reservation, ReservationInput } from '../../api/reservation'
import { formatFullName } from '../../utils/utils'
import { EXAMINATION_TYPE, SEX_TYPE } from '../../global/constants'

const schema = z.object({
  message: z.string().optional()
})

export type FormData = Pick<ReservationInput, 'message'>

const defaultReservation: Partial<FormData> = {
  message: ''
}

@Component({
  tag: 'xskriba-xbublavy-reservation-detail',
  styleUrl: 'xskriba-xbublavy-reservation-detail.css',
  shadow: true
})
export class XskribaXbublavyReservationDetail {
  @Prop() apiBase: string
  @Prop() patientReservationId: string | null
  @Prop() ambulanceReservationId: string | null
  @Prop() reservationId: string

  @State() isLoading: boolean = false
  @State() isDeleteDialogOpen: boolean = false
  @State() isValid: boolean = false
  @State() globalError: string | null = null
  @State() errors: Partial<Record<keyof FormData, string>> = {}
  @State() reservation: Reservation | null = null
  @State() entry: Partial<Reservation> = defaultReservation

  @Event() reservationDeleted: EventEmitter<void>
  @Event() reservationUpdated: EventEmitter<void>

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

    if (!this.patientReservationId || !this.reservation) return

    try {
      const data = schema.parse(this.entry)
      const api = ReservationApiFactory(undefined, this.apiBase)

      await api.updateReservation(this.reservation.id, { ...this.reservation, ...data })

      await this.reloadReservation()

      this.reservationUpdated.emit()
    } catch (err) {
      console.error(err.message)
      this.globalError = 'An error occurred while creating the ambulance. Please try again.'
    } finally {
      this.isLoading = false
    }
  }

  private async handleDelete() {
    this.isLoading = true

    try {
      if (this.patientReservationId || this.ambulanceReservationId) {
        await ReservationApiFactory(undefined, this.apiBase).deleteReservation(this.reservationId)
        this.reservationDeleted.emit()
        this.isDeleteDialogOpen = false
      }
    } catch (err) {
      console.error(err.message)
      this.globalError = 'An error occurred while deleting the patient. Please try again.'
    } finally {
      this.isLoading = false
    }
  }

  private async getReservation(reservationId: Reservation['id']): Promise<Reservation | null> {
    try {
      const response = await ReservationApiFactory(undefined, this.apiBase).getReservationById(
        reservationId
      )
      return response.data
    } catch (err) {
      console.error(err.message)
      return null
    }
  }

  private async reloadReservation() {
    if (this.reservationId) {
      const reservation = await this.getReservation(this.reservationId)
      if (reservation) {
        this.entry = { message: reservation.message }
        this.reservation = reservation
      }
    }
  }

  private handleOpenDialog() {
    this.isDeleteDialogOpen = true
  }

  async componentWillLoad() {
    await this.reloadReservation()
  }

  @Watch('patientReservationId')
  @Watch('ambulanceReservationId')
  @Watch('reservationId')
  async onReservationChange() {
    await this.reloadReservation()
    forceUpdate(this)
  }

  render() {
    const canSubmit = Object.values(this.errors).every(error => !error) && this.entry.message

    if (!this.reservation) return <sl-spinner></sl-spinner>

    return (
      <Host>
        <sl-dialog open={this.isDeleteDialogOpen} label={`Do you want to remove this reservation?`}>
          This action cannot be undone. Are you sure you want to delete this reservation?
          <sl-button
            onclick={() => this.handleDelete()}
            disabled={this.isLoading}
            loading={this.isLoading}
            slot="footer"
            variant="danger"
          >
            Yes, Delete Reservation
          </sl-button>
        </sl-dialog>

        <sl-card>
          <div class="wrapper">
            <sl-badge variant="primary" pill class="badge">
              {this.ambulanceReservationId ? 'Patient' : 'Ambulance'}
            </sl-badge>

            <header>
              <h3>
                {this.ambulanceReservationId
                  ? formatFullName(
                      this.reservation.patient.firstName,
                      this.reservation.patient.lastName
                    )
                  : this.reservation?.ambulance?.name}
              </h3>

              <span>
                {this.ambulanceReservationId
                  ? this.reservation.patient.bio
                  : this.reservation.ambulance.address}
              </span>
            </header>

            <footer>
              {this.ambulanceReservationId && <small>Birthday</small>}

              {this.ambulanceReservationId && (
                <sl-tag size="small" class="date">
                  {dayjs(this.reservation.patient.birthday).format('LL')}
                </sl-tag>
              )}

              {this.ambulanceReservationId && <small>Sex</small>}

              {this.ambulanceReservationId && (
                <sl-tag variant="success" size="small" class="date">
                  {SEX_TYPE[this.reservation.patient.sex]}
                </sl-tag>
              )}

              {this.patientReservationId && (
                <div>
                  <sl-tag size="medium">{this.reservation.ambulance.officeHours.open}</sl-tag>
                  <small>-</small>
                  <sl-tag size="medium">{this.reservation.ambulance.officeHours.close}</sl-tag>
                </div>
              )}
            </footer>
          </div>
        </sl-card>

        <sl-card>
          <div class="reservation">
            <small>from:</small>
            <sl-tag variant="primary" size="large" class="date">
              {dayjs.utc(this.reservation.start).format('LL')}
              <small>-</small>
              {dayjs.utc(this.reservation.start).format('LT')}
            </sl-tag>

            <small>to:</small>
            <sl-tag variant="primary" size="large" class="date">
              {dayjs.utc(this.reservation.end).format('LL')}
              <small>-</small>
              {dayjs.utc(this.reservation.end).format('LT')}
            </sl-tag>
          </div>

          <sl-divider></sl-divider>

          <div class="reservation">
            <small>Examination:</small>
            <sl-tag variant="success" class="date">
              {EXAMINATION_TYPE[this.reservation.examinationType]}
            </sl-tag>
          </div>
        </sl-card>

        <form onSubmit={event => this.handleSubmit(event)} class="validity-styles">
          <sl-textarea
            label="Message"
            name="message"
            value={this.entry?.message || ''}
            on-sl-input={event => this.handleInput(event)}
            placeholder="Enter a message for the reservation"
            help-text={this.errors.message}
            disabled={this.ambulanceReservationId}
            resize="auto"
          ></sl-textarea>

          {this.globalError && (
            <sl-alert variant="danger" open>
              <sl-icon slot="icon" src={dangerIcon}></sl-icon>
              <strong>{this.globalError}</strong>
            </sl-alert>
          )}

          {this.patientReservationId && (
            <sl-button
              disabled={!canSubmit || this.isLoading}
              loading={this.isLoading}
              type="submit"
              variant="primary"
            >
              Update Reservation
            </sl-button>
          )}
        </form>

        <sl-button
          slot="footer"
          onclick={() => this.handleOpenDialog()}
          disabled={this.isLoading}
          variant="danger"
          size="medium"
          class="end"
          outline
        >
          Delete Reservation
          <sl-icon slot="suffix" src={trashIcon} label="Delete"></sl-icon>
        </sl-button>
      </Host>
    )
  }
}
