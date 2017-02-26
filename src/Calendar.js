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
        events.forEach((e) => {
          this.cal.createEvent(
            calendar.id, e.event, e.start,
            // eslint-disable-next-line comma-dangle
            e.end, { location: e.location, description: e.hash }
          ).then((event) => {
            process.stdout.write(`Created event: ${event.summary}\n`);
          }).catch((err) => {
            debug('An error occurred while creating an event');
            debug(err);
          });
        });
      }).catch((err) => {
        debug('Error occurred while finding the calendar');
        debug(err);
      });
  }

  getEvents(calendarName) {
    debug('Starting Calendar.getEvents');
    return this.cal.findOrCreateCalendar(calendarName)
      .then(calendar => this.cal.events(calendar.id, {}));
  }
}

module.exports = Calendar;
