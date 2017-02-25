const Calenduh = require('calenduh');

class Calendar {
  constructor(secret) {
    this.cal = new Calenduh(secret);
  }

  init(events, calendarName) {
    this.cal.findOrCreateCalendar(calendarName)
      .then((calendar) => {
        events.forEach((e) => {
          this.cal.createEvent(
            calendar.id, e.event, e.start,
            // eslint-disable-next-line comma-dangle
            e.end, { location: e.location, description: e.hash }
          ).then((event) => {
            console.log(`Created event: ${event.summary}`);
          }).catch((err) => {
            console.log('An error occurred while creating an event');
            console.log(err);
          });
        });
      })
      .catch((err) => {
        console.log('Error occurred while finding the calendar');
        console.log(err);
      });
  }
}

module.exports = Calendar;
