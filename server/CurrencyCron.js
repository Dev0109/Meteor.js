import { Meteor, fetch } from "meteor/meteor";
import moment from "moment";
import CronSetting from "./Currency/CronSetting";
import FxApi from "./Currency/FxApi";
FutureTasks = new Meteor.Collection("cron-jobs");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

Meteor.startup(() => {
  const currentDate = new Date();


  // /**
  //  * We first need to find saved crons
  //  */
  // FutureTasks.find().forEach(function (setting) {

  //   // then we compare the dates,
  //   if (setting.startAt < currentDate) {
  //     // we came to the day when we have to add the cron job to start starting from now
  //     Meteor.call("addCurrencyCron", setting);
  //   } else {
  //     // we havent came to the execution date, so we'll be scheduling it again
  //     Meteor.call("scheduleCron", setting);
  //   }
  // });
  // SyncedCron.start();



  /**
   * step 1 : We need to get the list of schedules
   * The future stasks
   */
  let futureCrons = FutureTasks.find() || [];

  

  /**
   * Step 2 : We need to check if their date is reached
   * if reached then run add the cron
   * else do nohing
   */

   futureCrons.forEach((setting) => {
    // then we compare the dates,
    if (setting.startAt < currentDate) {
      // we came to the day when we have to add the cron job to start starting from now
      setting.isFuture = false;
      Meteor.call("addCurrencyCron", setting);
    } else {
      // we havent came to the execution date, so we'll be scheduling it again
      Meteor.call("scheduleCron", setting);
    }
  });

  /**
   * Step 3: Start
   */
  SyncedCron.start();
});

async function _getCurrencies(erpGet, cb = (error, result) => {}) {
  const apiUrl = `https://${erpGet.ERPIPAddress}:${erpGet.ERPPort}/erpapi/TCurrency?ListType=Detail`;
  const _headers = {
    database: erpGet.ERPDatabase,
    username: erpGet.ERPUsername,
    password: erpGet.ERPPassword,
    // url: apiUrl,
  };

  try {
    /**
     * Here we GET all tCurrency of the currency user
     */
    Meteor.http.call("GET", apiUrl, { headers: _headers }, (error, result) => {
      if (error) {
        cb(error, null);
      } else {
        cb(null, result);
      }
    });
  } catch (error) {
    cb(error, null);
  }
}

async function _updateCurrencies(currencies = [], erpGet, callback = (currencies = []) => {}, apiKey = "") {
  FxApi.getAllRates('*', "AUD", 1, (result) => {
    if(result) {
      Meteor.wrapAsync(_updateRates)(currencies, result.to, erpGet);
    }
  }, apiKey);
}

/**
 * This function will simply update rates from db
 * with one call API to FX
 *
 * @param {*} dbCurrencies
 * @param {*} FxCurrencies
 * @returns
 */
function _updateRates(dbCurrencies = [], FxCurrencies = [], erpGet, callback = (currencies = []) => {}) {
  let _currencies = [];
  if(dbCurrencies) {


      dbCurrencies.forEach((dbCurrency, index) => {
        const fxCurrencyRates = FxCurrencies.find((fxCurrency) => fxCurrency.quotecurrency == dbCurrency.fields.Code);

        if(fxCurrencyRates) {
          dbCurrency.fields.BuyRate = fxCurrencyRates.mid;
          dbCurrency.fields.SellRate = fxCurrencyRates.inverse;
          _currencies.push(dbCurrency);
        }
      });


      Meteor.wrapAsync(_saveCurrency)({
        type: "TCurrency",
        objects: _currencies
      }, erpGet, (error, result) => {
        if(error) {
         
        } else {
         
        }
      });
  }

}

function buildParser(cronSetting, parser ){
  let cronStartDate = moment(cronSetting.startAt).subtract(1, 'days');  
  //let cronStartDate = cronSetting.startAt;  
  if ( cronSetting.isProcessed == 1 ) {
    let parseTime = moment(cronStartDate).format('h:mm a');
    let parseDay = moment(cronStartDate).format('Do');
    let parseMonth = moment(cronStartDate).format('MMMM');
    let parseYear = moment(cronStartDate).format('YYYY');
    return parser.text(`at ${parseTime} every ${parseDay} day of ${parseMonth} in ${parseYear}`);
  }else{
    if( cronSetting.type == 'Daily' ){
      if( parseInt( cronSetting.every ) == 1 ){
        let parseTime = moment(cronStartDate).format('h:mm a');
        let parseDays = cronSetting.days.reduce((text, value, i, array) => text + (i < array.length - 1 ? ', ' : ' and ') + value);
        return parser.text(`at ${parseTime} on ${parseDays}`);
      }else{
        let parseHour = moment(cronStartDate).format('HH');
        let parseMinute = moment(cronStartDate).format('mm');
        return parser.cron(`${parseMinute} ${parseHour} */${cronSetting.every} * *`);
      }
    }else if( cronSetting.type == 'Weekly' ){
      let parseTime = moment(cronStartDate).format('h:mm a');
      return parser.text(`every ${cronSetting.every} week on ${cronSetting.days} at ${parseTime}`)
    }else if( cronSetting.type == 'Monthly' ){
      return parser.text(`${cronSetting.toParse}`);
    }else if( cronSetting.type == 'OneTime' ){
      let parseTime = moment(cronStartDate).format('h:mm a');
      let parseDay = moment(cronStartDate).format('Do');
      let parseMonth = moment(cronStartDate).format('MMMM');
      let parseYear = moment(cronStartDate).format('YYYY');
      return parser.text(`at ${parseTime} every ${parseDay} day of ${parseMonth} in ${parseYear}`);
    }
  }
}

/**
 * This functions will save one currency
 * @param {*} currency
 */
async function _saveCurrency(currency, erpGet, cb = (error, result) => {}) {
  const apiUrl = `https://${erpGet.ERPIPAddress}:${erpGet.ERPPort}/erpapi/TCurrency`;
  const _headers = {
    database: erpGet.ERPDatabase,
    username: erpGet.ERPUsername,
    password: erpGet.ERPPassword,
    // url: apiUrl,
  };

  /**
   * Here we will save ht big object list
   */
  Meteor.http.call(
    "POST",
    apiUrl,
    {
      data: currency,
      headers: _headers,
    },
    (error, result) => {
      if (error) {
        cb(error, null);
      } else {
        cb(null, result);
      }
    }
  );
}


Meteor.methods({
  /**
   * This functions is going to run when the cron is running
   * @param {*} cronSetting
   */
  runCron: async (cronSetting, erpGet) => {
    

    try {
      let response = Meteor.wrapAsync(_getCurrencies)( erpGet );
      if (response.data) {
        Meteor.wrapAsync(_updateCurrencies)(response.data.tcurrency, erpGet, cronSetting.base64XeCredentials);
      }
    } catch (error) {
    }

  },
  /**
   * This function will just add the cron job
   *
   * @param {Object} cronSetting
   * @returns
   */
  addCurrencyCron: (cronSetting, erpGet) => {
    // if(cronSetting.isFuture == true) {
    //   FutureTasks.insert(cronSetting);
    //   return true;
    // }


    const cronId = `currency-update-cron_${cronSetting.id}_${cronSetting.employeeId}`;
    SyncedCron.remove(cronId);



    return SyncedCron.add({
      name: cronId,
      schedule: function (parser) {       
        //  const parsed = parser.recur().on(cronSetting.dayInNumbers).dayOfWeek()
                        // .and().every(15).minute().startingOn(14);
                        
        //  const parsed = parser.text('at 5:00 am every 10th day of September in 2022');
        //  const parsed = parser.text('every 4th week');
        // return parser.text('every 10th day at 08:00 am on monday');
        // return parser.text('every 4 weeks on Wednesday at 08:00 am')
        // return parser.cron(`5 8 * * 4/Sun`);
        const parsed = buildParser(cronSetting, parser);
        // const parsed = parser.text('at 5:00 am and every 10th day on Friday')
        return parsed;
  
      },
      job: () => {
        if(cronSetting.isProcessed == 1 && cronSetting.type != 'OneTime' ){          
          cronSetting.isProcessed = 0;
          Meteor.call("addCurrencyCron", cronSetting);
        }else{
          Meteor.call("runCron", cronSetting, erpGet, function (error, results) {
          });
        }
      },
    });
  },
  /**
   * This function will shcedule the cron job if the date is different from today (future date)
   *
   * @param {Object} cronSetting
   */
  scheduleCron: (cronSetting) => {
    FutureTasks.insert(cronSetting);
  },
});
