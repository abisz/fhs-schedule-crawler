const he = require('he');
const hash = require('object-hash');
const moment = require('moment');

class Parser {

  constructor() {
    this.regScripts = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    this.regTables = /<table\b[^<]*(?:(?!<\/table>)<[^<]*)*<\/table>/gi;
    this.regTds = /<td\b[^<]*(?:(?!<\/td>)<[^<]*)*<\/td>/gi;
    this.regDay = /<b>(.*?)<\/b>/i;
    this.regTrs = /<tr\b[^<]*(?:(?!<\/tr>)<[^<]*)*<\/tr>/gi;
  }

  getEvents(raw) {
    // Todo: solve this linting problem
    /* eslint-disable no-param-reassign */
    return raw
      .replace(this.regScripts, '')
      .match(this.regTables)
      .slice(2)
      .map(e => Object({ raw: e }))
      .map((day) => {
        day.date = this.parseDay(day.raw);
        return day;
      })
      .map((day) => {
        day.events = this.parseEvents(day.raw, day.date);
        return day;
      })
      .map((e) => {
        delete e.raw;
        return e;
      })
      .map((e) => {
        e.hash = hash(e);
        return e;
      });
    /* eslint-enable no-param-reassign */
  }

  parseDay(e) {
    return e.match(this.regDay)[1].split(' ')[1];
  }

  parseEvents(e, day) {
    return e
      .match(this.regTrs)
      .slice(2)
      .map(f => this.parseEvent(f, day));
  }

  parseEvent(e, day) {
    const details = e
      .match(this.regTds)
      .map((f) => {
        const a = f.match(/<td.*>(.*?)<\/td>/i);
        return a ? a[1] : a;
      });

    const startTime = he.decode(details[0].match(/\d\d:\d\d/)[0]);
    const endTime = he.decode(details[1].match(/\d\d:\d\d/)[0]);

    const start = moment(`${day} ${startTime}`, 'DD.MM.YYYY HH:mm').toISOString();
    const end = moment(`${day} ${endTime}`, 'DD.MM.YYYY HH:mm').toISOString();

    return {
      start,
      end,
      event: details[2] ? he.decode(details[2]).trim() : '',
      location: details[5] ? he.decode(details[5]).trim() : '',
    };
  }
}

module.exports = Parser;
