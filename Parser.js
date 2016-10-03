const moment = require('moment');

function Parser () {
  this.regScripts = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  this.regTables = /<table\b[^<]*(?:(?!<\/table>)<[^<]*)*<\/table>/gi;
  this.regTds = /<td\b[^<]*(?:(?!<\/td>)<[^<]*)*<\/td>/gi;
  this.regDay = /<b>(.*?)<\/b>/i;
  this.regTrs =  /<tr\b[^<]*(?:(?!<\/tr>)<[^<]*)*<\/tr>/gi;
}

Parser.prototype.getEvents = function (raw) {

  const result = raw
    .replace(this.regScripts, '')
    .match(this.regTables)
    .slice(2)
    .map( e => {
      return { raw: e }
    })
    .map( e => {
      e.date = this.parseDay(e.raw);
      return e;
    })
    .map( e => {
      e.events = this.parseEvents(e.raw);
      return e;
    })
    .map( e => {
      delete e.raw;
      return e;
    });

  return result;

};

Parser.prototype.parseDay = function (e) {
  return moment(e.match(this.regDay)[1].split(' ')[1], 'DD-MM-YYYY').toISOString();
};

Parser.prototype.parseEvents = function (e) {

  return e
    .match(this.regTrs)
    .slice(2)
    .map( f => this.parseEvent(f) );
};

Parser.prototype.parseEvent = function (e) {
  const details = e
    .match(this.regTds)
    .splice(0, 3)
    .map( f => {
      const a = f.match(/<td.*>(.*?)<\/td>/i);
      return a ? a[1] : a;
    } );

  return {
    start: details[0].match(/\d\d:\d\d/)[0],
    end: details[1].match(/\d\d:\d\d/)[0],
    event: details[2]
  };
};

module.exports = Parser;

const fs = require('fs');

(function () {
  'use strict';

  const p = new Parser();

  const raw = fs.readFileSync('./raw.txt').toString();

  let events = p.getEvents(raw);

  console.log(events[Math.floor(Math.random() * events.length)]);

})();