/*
 Authentication is heavily based on the quickstarter
 https://developers.google.com/google-apps/calendar/quickstart/nodejs
 */

const fs = require('fs'),
  readline = require('readline'),
  google = require('googleapis'),
  googleAuth = require('google-auth-library'),
  config = require('./config.json'),
  Promise = require('bluebird');

function Calendar () {
  this.TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
    '/.credentials/';
  this.TOKEN_PATH = this.TOKEN_DIR + 'calendar-nodejs-quickstart.json';

  // authorization "modes"
  this.SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.readonly'
  ];
}

Calendar.prototype.authorize = function (credentials, cb) {

  const clientSecret = credentials.installed.client_secret,
    clientId = credentials.installed.client_id,
    redirectUrl = credentials.installed.redirect_uris[0],
    auth = new googleAuth(),
    oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  fs.readFile(this.TOKEN_PATH, (err, token) => {
    if (err) {
      this.getNewToken(oauth2Client, cb);
    } else {
      try {
        oauth2Client.credentials = JSON.parse(token);
        cb(oauth2Client);
      } catch (e) {
        console.log('Error parsing the token:', e);
      }
    }
  });
};

Calendar.prototype.getNewToken = function (oauth2Client, cb) {

  const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES
    }),
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

  console.log('Authorize this app by visiting this url:', authUrl);

  rl.question('Enter the code from that page here: ', code => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log('Error while trying to retrieve access token:', err);
        return;
      }

      oauth2Client.credentials = token;
      this.storeToken(token);
      cb(oauth2Client);
    });
  });
};

Calendar.prototype.storeToken = function (token) {
  try {
    fs.statSync(this.TOKEN_DIR);
  } catch (e) {
    fs.mkdirSync(this.TOKEN_DIR);
  }

  fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), err => {
    if (err) {
      console.log('Error while storing the token:', err);
      return;
    }
    console.log('Token stored to ', this.TOKEN_PATH);
  });
};

Calendar.prototype.getCalendarList = function () {

  const calendarAPI = google.calendar('v3'),
    authPromise = this.getAuth();

  return new Promise(function (resolve, reject) {
    authPromise
      .then(function (auth) {
        calendarAPI.calendarList.list({
          auth: auth
        }, (err, response) => {

          if (err) {
            return reject(err);
          }

          return resolve(response);
        });

      })
      .catch(function (err) {
        return reject(err);
      });
  });
};

Calendar.prototype.getAuth = function () {

  const that = this;

  return new Promise(function (resolve, reject) {
    if (that.auth) {
      resolve(that.auth);
    } else {
      fs.readFile('client_secret.json', (err, content) => {
        if (err) return reject(err);

        try {
          that.authorize(JSON.parse(content), function (auth) {
            that.auth = auth;
            resolve(that.auth);
          });
        } catch (e) {
          return reject(e);
        }
      });
    }
  });
};

module.exports = Calendar;

(function calenderSiaf() {
  'use strict';

  const cal = new Calendar();

  cal.getCalendarList()
    .then( calendarList => {
      console.log('calendarList', calendarList);
    })
    .catch( err => {
      console.log('Error', err)
    });

  // fs.readFile('client_secret.json', (err, content) => {
  //   if (err) {
  //     console.log('Error loading client secret file:', err);
  //     return;
  //   }
  //
  //   try {
  //     cal.authorize(JSON.parse(content), function (auth) {
  //       var calendar = google.calendar('v3');
  //
  //       calendar.calendarList.list({
  //         auth: auth
  //       }, (err, response) => {
  //         if (err) {
  //           console.log('Error while getting calendar list:', err);
  //           return;
  //         }
  //
  //         let schedule = response.items.filter(c => c.summary === config.username)[0];
  //         console.log(config.username, schedule);
  //
  //         if ( ! schedule ) {
  //           console.log('Create new calendar');
  //
  //           calendar.calendars.insert({
  //             auth: auth,
  //             resource: {
  //               summary: config.username,
  //               timeZone: 'Europe/Vienna'
  //             }
  //           }, (err, newCalendar) => {
  //
  //             if (err) {
  //               console.log('Error while creating new calendar:', err);
  //               return;
  //             }
  //
  //             console.log('new calendar:', newCalendar);
  //
  //           });
  //
  //         } else {
  //           console.log('Calendar already exists');
  //         }
  //
  //       });
  //
  //     });
  //   } catch (err) {
  //     console.log('Error parsing credentials:', err);
  //
  //   }
  //
  // });
})();