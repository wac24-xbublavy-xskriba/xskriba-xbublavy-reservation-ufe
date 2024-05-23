import {
  Component,
  Element,
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

import { Calendar, EventClickArg, EventContentArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import { h as preactH } from '@fullcalendar/core/preact'

import { Ambulance, Patient, Reservation } from '../../api/reservation'

@Component({
  tag: 'xskriba-xbublavy-reservations-list',
  styleUrl: 'xskriba-xbublavy-reservations-list.css',
  shadow: true
})
export class XskribaXbublavyReservationsList {
  @Element() host: HTMLElement

  @Prop() ambulance: Ambulance | null
  @Prop() patient: Patient | null

  @State() calendar: Calendar

  @Event() reservationEventClicked: EventEmitter<Reservation['id']>

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
      events: [
        {
          id: 'a',
          title: 'my event',
          start: '2024-05-22',
          description: 'This is a cool event',
          extendedProps: {
            test: 'test'
          }
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

  private handleReservationEventClick(arg: EventClickArg) {
    this.reservationEventClicked.emit(arg.event.id)
  }

  componentDidLoad() {
    this.createCalendar()
  }

  disconnectedCallback() {
    if (this.calendar) {
      this.calendar.destroy()
    }
  }

  @Watch('patient')
  @Watch('ambulance')
  onUserChange() {
    this.createCalendar()
    forceUpdate(this)
  }

  render() {
    return (
      <Host>
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
    return preactH('div', {}, [
      preactH('p', {}, arg.event.title),
      preactH('i', {}, arg.event.extendedProps.description)
    ])
  }
}
