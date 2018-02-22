/**
 * A simple alexa skill that calls the TFL API for next stop information
 **/

'use strict';

const rp = require('request-promise');

const Alexa = require('alexa-sdk');

const APP_ID = "amzn1.ask.skill.d31788a4-09f1-4b5d-8e3b-2e3eb1ea0ca9";  // TODO replace with your app ID (OPTIONAL).

const SKILL_NAME = "Where's my train";


const INFO_URL = "https://api.tfl.gov.uk/Line/piccadilly/Arrivals/940GZZLUACT";
const PLATFORMS = ["Eastbound - Platform 4", "Eastbound - Platform 3"];


var options = {
  uri: INFO_URL,
  json: true // Automatically parses the JSON string in the response
};

function getTrainsForPlatform(predictions) {
  return predictions.filter(prediction => PLATFORMS.includes(prediction.platformName));
}

function getFirstTrain(trains) {
  const nextTrain = trains.reduce((prev, curr) => {
    return ((prev.timeToStation < curr.timeToStation) ? prev : curr);
  });
  return nextTrain;
}


function getNextTrain () {
  return rp(options)
    .then(function (predictions) {
      const trains = getTrainsForPlatform(predictions);
      const nextTrain = getFirstTrain(trains);
      console.log(nextTrain);

      return `The next train for ${nextTrain.towards} will be arriving at ${nextTrain.stationName} 
        on ${nextTrain.platformName} in ${nextTrain.timeToStation} seconds`;
    })
    .catch(function (err) {
      console.log(err);
      return "An Error Occured";
    });
}

const handlers = {
    'NextTrainIntent': function () {
        this.emit('GetInfo');
    },
    'GetInfo': function () {
	      getNextTrain().then((response) => {
          const speechOutput = response;
          const cardOut = response;
          this.emit(':tellWithCard', speechOutput, SKILL_NAME, cardOut);
        });
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = 'Not sure';
        const reprompt = 'try again';
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', 'Good bye');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', 'Ok');
    },
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
