const Calenduh = require('calenduh');
const async = require('async');
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

  // TODO: refactor this to use async (like deleteEvents)
  // TODO: move to Calenduh
  createEvents(events, i = 0, repeat = false) {
    debug(`createEvents ${i}/${events.length}`);

    if (i < events.length) {
      this.createEvent(events[i])
        .then(() => {
          setTimeout(() => {
            this.createEvents(events, i + 1);
          }, 100);
        })
        .catch(() => {
          if (!repeat) {
            setTimeout(() => {
              debug(`Second try creating event ${i}`);
              this.createEvents(events, i, true);
            }, 200);
          } else {
            console.error(`Couldn't create event ${i}`);
          }
        });
    }
  }

  createEvent(e) {
    debug(`createEvent ${e.event}`);
    return new Promise((resolve, reject) => {
      this.cal.createEvent(
        e.calId, e.event, e.start,
        // eslint-disable-next-line comma-dangle
        e.end, { location: e.location, description: e.hash }
      ).then((event) => {
        process.stdout.write(`Created event: ${event.summary}\n`);
        resolve();
      }).catch((err) => {
        debug('An error occurred while creating an event');
        debug(err);
        reject();
      });
    });
  }

  // TODO: move to Calenduh
  deleteEvents(calendarId, eventIds) {
    debug('deleteEvents()');

    return new Promise((resolve, reject) => {
      async.eachSeries(eventIds, (eventId, cb) => {
        debug(`deleting event ${eventId}`);
        this.cal.deleteEvent(calendarId, eventId)
          .then(() => cb())
          // can't pass err, because async would stop
          .catch(() => cb());
      }, (err) => {
        debug('finished deleting events');
        if (err) {
          debug('An error occurred while deleting');
          debug(err);
          return reject(err);
        }
        return resolve();
      });
    });
  }
}

module.exports = Calendar;
