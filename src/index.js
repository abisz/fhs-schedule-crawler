const config = require('../config.json');

const Nightmare = require('nightmare');
const Parser = require('./Parser.js');
const Calenduh = require('calenduh');

const parser = new Parser();
const cal = new Calenduh('./client_secret.json');
const nightmare = Nightmare({
  show: false,
});

function scrapeEvents() {
  return nightmare
    .cookies.clearAll()
    .goto('https://myfhs.fh-salzburg.ac.at/index.action')
    .type('#os_username', config.username)
    .type('#os_password', config.password)
    .click('#loginButton')
    .wait('#main')
    .goto(`https://intranet.fh-salzburg.ac.at/index.php?id=3341&type=98&druckliste=1&user=${config.username}&view=ss_studenten_veranstaltungen&suchsem=#now`)
    // this will redirect to a second login page
    .wait('form[action="/idp/Authn/UserPassword"]')
    .type('input[name="j_username"]', config.username)
    .type('input[name="j_password"]', config.password)
    .click('.such_button')
    // This is somehow needed - no idea what's going on!
    .wait(1000)
    .goto(`https://intranet.fh-salzburg.ac.at/index.php?id=3341&type=98&druckliste=1&user=${config.username}&view=ss_studenten_veranstaltungen&suchsem=#now`)
    .wait('.tx-mgstundenplan-pi1')
    // eslint-disable-next-line no-undef
    .evaluate(() => document.querySelector('.tx-mgstundenplan-pi1').innerHTML)
    .end();
}

function initCalendar(events) {
  cal.findOrCreateCalendar(config.username)
    .then((calendar) => {
      events.forEach((e) => {
        cal.createEvent(
          calendar.id,
          e.event,
          e.start,
          e.end,
          {
            location: e.location,
            description: e.hash,
          },
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

scrapeEvents()
  // Todo: check why this happens
  // .then(parser.getEvents) throws error
  .then(raw => parser.getEvents(raw))
  .then(initCalendar);
