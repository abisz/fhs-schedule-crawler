// const moment = require('moment');

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
      .map((e) => {
        e.date = this.parseDay(e.raw);
        return e;
      })
      .map((e) => {
        e.events = this.parseEvents(e.raw);
        return e;
      })
      .map((e) => {
        delete e.raw;
        return e;
      });
    /* eslint-enable no-param-reassign */
  }

  parseDay(e) {
    return e.match(this.regDay)[1].split(' ')[1];
    // toISOString() returns "previous" day (I guess because of timezone issues)
    // return moment(date, 'DD-MM-YYYY').toISOString();
  }

  parseEvents(e) {
    return e
      .match(this.regTrs)
      .slice(2)
      .map(f => this.parseEvent(f));
  }

  parseEvent(e) {
    const details = e
      .match(this.regTds)
      .splice(0, 3)
      .map((f) => {
        const a = f.match(/<td.*>(.*?)<\/td>/i);
        return a ? a[1] : a;
      });

    return {
      start: details[0].match(/\d\d:\d\d/)[0],
      end: details[1].match(/\d\d:\d\d/)[0],
      event: details[2],
    };
  }
}

module.exports = Parser;
