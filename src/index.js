#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const program = require('commander');
const debug = require('debug')('fhs-schedule-crawler');

const app = require('../package.json');

const Calendar = require('./Calendar.js');
const Parser = require('./Parser.js');
const Scraper = require('./Scraper.js');

const parser = new Parser();
const scraper = new Scraper();
const cal = new Calendar('./client_secret.json');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const login = () => {
  debug('Start login process');
  return new Promise((resolve) => {
    rl.question('Please enter your fhs-code (fhsxxxxx): \n', (code) => {
      // Todo: hide password
      rl.question('Please enter your password: \n', (password) => {
        rl.close();
        resolve({ username: code, password });
      });
    });
  });
};

const initCredentials = () => {
  const configPath = `${__dirname}/../config.json`;
  return new Promise((resolve) => {
    fs.stat(configPath, (err) => {
      if (!err) {
        debug('Config file found');
        // eslint-disable-next-line global-require, import/no-dynamic-require
        const config = require(configPath);
        resolve(config);
      } else if (err.code === 'ENOENT') {
        debug('No Config file found');
        login()
          .then((creds) => {
            fs.writeFileSync(configPath, `{
  "username": "${creds.username}",
  "password": "${creds.password}"
}
            `);
            resolve(creds);
          });
      } else {
        debug('Error occured while searching config file');
        debug(err);
        process.exit();
      }
    });
  });
};

const init = (config) => {
  program
    .version(app.version)
    .option('-l, --login', 'Login with new user credentials')
    .option('-i, --init', 'Init Calender')
    .parse(process.argv);

  if (program.login) {
    debug('Login option chosen');
  } else if (program.init) {
    scraper.scrapeEvents(config)
    // Todo: check why this happens
    // .then(parser.getEvents) throws error
      .then(raw => parser.getEvents(raw))
      .then(cal.init, config.username);
  }
};

initCredentials()
.then(init)
.catch((err) => {
  debug('Error in program:');
  debug(err);
});
