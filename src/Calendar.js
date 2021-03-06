const Calenduh = require('calenduh');
const debug = require('debug')('Calendar');

class Calendar {
  constructor(secret) {
    debug('New Calendar created');
    this.cal = new Calenduh(secret);
  }

  init(events, calendarName) {
    debug('Starting Calendar.init');
    this.cal.findOrCreateCalendar(calendarName)
      .then((calendar) => {
        debug('Successfully created/found calendar');
        this.createEvents(events.map(e => Object.assign(e, { calId: calendar.id })));
      }).catch((err) => {
        debug('Error occurred while finding the calendar');
        debug(err);
      });
  }

  getEvents(calendarName) {
    debug('Starting Calendar.getEvents');
    return this.cal.findOrCreateCalendar(calendarName)
      .then(calendar => this.cal.events(calendar.id)
          .then(events => ({
            calendar,
            events,
          })));
  }

  createEvents(events) {
    debug('createEvents()');

    return this.cal.createEvents(
      events[0].calId,
      events.map(e => Object.assign(e, {
        name: e.event,
        opts: {
          location: e.location,
          description: e.hash,
        },
      // eslint-disable-next-line comma-dangle
      }))
    );
  }

  deleteEvents(calendarId, eventIds) {
    debug('deleteEvents()');

    return this.cal.deleteEvents(calendarId, eventIds);
  }
}

module.exports = Calendar;
