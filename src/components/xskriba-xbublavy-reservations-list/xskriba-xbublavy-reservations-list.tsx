import { Component, Element, Host, Prop, State, Watch, forceUpdate, h } from '@stencil/core'
import { href } from 'stencil-router-v2'

import { Calendar, EventClickArg, EventContentArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import { h as preactH } from '@fullcalendar/core/preact'

import {
  Ambulance,
  AmbulanceApiFactory,
  Patient,
  PatientApiFactory,
  Reservation
} from '../../api/reservation'
import { formatFullName } from '../../utils/utils'
import { EXAMINATION_TYPE } from '../../global/constants'

@Component({
  tag: 'xskriba-xbublavy-reservations-list',
  styleUrl: 'xskriba-xbublavy-reservations-list.css',
  shadow: true
})
export class XskribaXbublavyReservationsList {
  @Element() host: HTMLElement

  @Prop() apiBase: string
  @Prop() ambulance: Ambulance | null
  @Prop() patient: Patient | null

  @State() reservations: Reservation[] = []
  @State() calendar: Calendar

  @State() private selectedReservationId: Reservation['id'] | null = null

  private initializeCalendar(calendarEl: HTMLElement) {
    this.calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
      initialView: 'timeGridWeek',
      nowIndicator: true,
      weekNumberCalculation: 'ISO',
      aspectRatio: 2.5,
      now: new Date().toISOString(),
      eventClassNames: ['event'],
      eventDisplay: 'block',
      displayEventTime: true,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridWeek,dayGridMonth,listWeek'
      },
      businessHours: [
        {
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: this.ambulance?.officeHours.open || undefined,
          endTime: this.ambulance?.officeHours.close || undefined
        }
      ],
      eventClick: arg => this.handleReservationEventClick(arg),
      eventContent: arg => this.getEventContent(arg)
    })

    this.calendar.render()
  }

  private createCalendar() {
    const calendarEl = this.host.shadowRoot?.getElementById('calendar')
    if (!calendarEl) throw new Error('Calendar element not found')
    this.initializeCalendar(calendarEl)
  }

  private async getReservations(): Promise<Reservation[]> {
    try {
      const response = this.ambulance?.id
        ? await AmbulanceApiFactory(undefined, this.apiBase).getAmbulanceReservationsById(
            this.ambulance.id
          )
        : this.patient?.id
        ? await PatientApiFactory(undefined, this.apiBase).getPatientReservations(this.patient.id)
        : null

      if (!response) return []

      return response.data
    } catch (err) {
      console.error(err.message)
      return []
    }
  }

  private handleReservationEventClick(arg: EventClickArg) {
    this.selectedReservationId = arg.event.id
  }

  private addEvents(reservations: Reservation[]) {
    for (const reservation of reservations) {
      this.calendar.addEvent({
        id: reservation.id,
        title: this.patient
          ? reservation.ambulance.name
          : this.ambulance
          ? formatFullName(reservation.patient.firstName, reservation.patient.lastName)
          : '',
        description: EXAMINATION_TYPE[reservation.examinationType],
        start: reservation.start,
        end: reservation.end,
        extendedProps: {
          ambulanceId: reservation.ambulance.id,
          patientId: reservation.patient.id
        }
      })
    }
  }

  componentDidLoad() {
    this.createCalendar()
    this.addEvents(this.reservations)
  }

  async componentWillLoad() {
    this.reservations = await this.getReservations()
  }

  disconnectedCallback() {
    if (this.calendar) {
      this.calendar.destroy()
    }
  }

  @Watch('patient')
  @Watch('ambulance')
  async onUserChange() {
    this.createCalendar()
    this.reservations = await this.getReservations()
    this.addEvents(this.reservations)
    forceUpdate(this)
  }

  render() {
    return (
      <Host>
        {(this.patient || this.ambulance) && (
          <sl-drawer
            label="Reservation Detail"
            open={this.selectedReservationId}
            on-sl-hide={() => this.handleCloseReservationDetail()}
            class="drawer"
          >
            {this.selectedReservationId && (
              <xskriba-xbublavy-reservation-detail
                api-base={this.apiBase}
                ambulance-reservation-id={this.ambulance?.id}
                patient-reservation-id={this.patient?.id}
                reservation-id={this.selectedReservationId}
                onReservationDeleted={() => this.handleReservationDeleted()}
              ></xskriba-xbublavy-reservation-detail>
            )}

            <sl-button
              slot="footer"
              variant="primary"
              onclick={() => this.handleCloseReservationDetail()}
            >
              Close
            </sl-button>
          </sl-drawer>
        )}

        <header>
          <h2>Reservations</h2>

          {this.patient && (
            <sl-button
              variant="primary"
              size="medium"
              pill
              {...href(`/patient/${this.patient.id}/reservations/create`)}
            >
              Create Reservation
            </sl-button>
          )}
        </header>

        <section>
          <div id="calendar"></div>
        </section>
      </Host>
    )
  }

  private getEventContent(arg: EventContentArg) {
    return preactH('div', { className: 'event' }, [
      preactH('span', {}, arg.event.title),
      preactH('small', {}, arg.event.extendedProps.description)
    ])
  }

  private handleCloseReservationDetail() {
    this.selectedReservationId = null
  }

  private async handleReservationDeleted() {
    this.selectedReservationId = null
    this.createCalendar()
    this.reservations = await this.getReservations()
    this.addEvents(this.reservations)
    forceUpdate(this)
  }
}
