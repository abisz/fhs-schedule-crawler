const Nightmare = require('nightmare');

class Scraper {
  constructor() {
    this.nightmare = Nightmare({
      show: false,
    });
  }

  scrapeEvents(config) {
    return this.nightmare
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
}

module.exports = Scraper;
