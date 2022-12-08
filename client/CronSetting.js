export const _currentDate = new Date();

/**
 * @type {{cronjob: CallableFunction, id: string, startAt: Date}}
 */
export default class CronSetting {
  constructor({
    type = "Monthly",
    id = "email",
    active = false,
    every = 1,
    employeeId,
    toParse,
    startAt = new date(),
    isFuture = false,
    days = [],
    months = [],
    dayNumberOfMonth = 1,
    cronJob = () => {},
    parsed,
    base64XeCredentials = {},
  }) {
    this.type = type;
    this.active = active;
    this.every = every;
    this.id = id;
    this.employeeId = employeeId;
    this.toParse = toParse;
    this.startAt = this.convertToDate(startAt);
    this.cronJob = cronJob;
    this.days = days;
    this.isFuture = isFuture;

    this.months = months;
    this.dayNumberOfMonth = this.dayNumberOfMonth;

    this.base64XeCredentials = base64XeCredentials;


    // this is going to be used only if we use the regular perser
    this.parsed = parsed;
  }

  buildParsedText() {
    let text = "";

    if (this.type == "Monthly") {
      
      if (this.months.length > 0) {
        let lastMonth = this.months.pop();
        // We on a monthly one
        text += "every " + this.dayNumberOfMonth + " day of the month";
        text += " of " + this.months.join(",") + " and " + lastMonth;

        const date = this.convertToDate(this.startAt);
        const minutes = this.convertToDate(this.startAt).getMinutes();
        const hours = this.convertToDate(this.startAt).getHours();

        text += " at " + (
          hours < 10
          ? "0"
          : "") + hours + ":" + (
          minutes < 10
          ? "0"
          : "") + minutes;

        // text +=
        //   " starting on the " +
        //   date.getDay() +
        //   " day of " +
        //   date.toDateString().split(" ")[1] +
        //   " in " +
        //   date.toDateString().split(" ")[3];


        // this.parsed = later.parse.recur().every(this.dayNumberOfMonth).dayOfMonth()
        // .on((hours < 10? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes);

      }
    } else if (this.type == "Weekly") {
      const date = this.convertToDate(this.startAt);
      const minutes = this.convertToDate(this.startAt).getMinutes();
      const hours = this.convertToDate(this.startAt).getHours();

      text += " at " + (
        hours < 10
        ? "0"
        : "") + hours + ":" + (
        minutes < 10
        ? "0"
        : "") + minutes;
      text += " on " + this.days;

      text += " every " + this.every + " week";
      text += " starting on the " + this.convertDayNumberToString(date.getDate()) + " day in " + date.toDateString().split(" ")[1] + " in " + date.toDateString().split(" ")[3];
    } else if (this.type == "Daily") {
      const date = this.convertToDate(this.startAt);
      const minutes = this.convertToDate(this.startAt).getMinutes();
      const hours = this.convertToDate(this.startAt).getHours();

 
      // this.days = this.days.filter(Boolean);
    
      if (this.days.length >= 1 && this.days.length < 7) {
        const lastDay = this.days[this.days.length - 1];

        if (this.days.length == 1) {
          text += " at " + (
            hours < 10
            ? "0"
            : "") + hours + ":" + (
            minutes < 10
            ? "0"
            : "") + minutes;

          text += " every " + lastDay;

          text += " starting on the " + this.convertDayNumberToString(date.getDate()) 
                    + " day in " + date.toDateString().split(" ")[1] 
                    + " in " + date.toDateString().split(" ")[3];
        } else {
          //this.days.pop();  remove the last day
          //text += " on " + this.days.join(",") + " and " + lastDay;
          //text += " every week";
          //text += " starting on the " + this.convertDayNumberToString(date.getDate()) + " day in " + date.toDateString().split(" ")[1] + " in " + date.toDateString().split(" ")[3];


          // seems to be working
          // it will need attention on runnings 
          this.days.forEach((_day, index) => {
            if (index > 0) {
              text += " also ";
            }
            text += " at " + (
              hours < 10
              ? "0"
              : "") + hours + ":" + (
              minutes < 10
              ? "0"
              : "") + minutes;

            text += ` every ${this.convertDayNumberToString(this.getDayIndexOfTheWeek(_day))} day of the week`;
            text += " starting on the " + this.convertDayNumberToString(date.getDate()) + " day in " + date.toDateString().split(" ")[1] + " in " + date.toDateString().split(" ")[3];
          });
        } // multiple days
      } else if (this.days.length == 7) {
        // This is for every day
        // Works as expected

        text += " at " + (
          hours < 10
          ? "0"
          : "") + hours + ":" + (
          minutes < 10
          ? "0"
          : "") + minutes;

        text += " every day";

        text += " starting on the " + this.convertDayNumberToString(date.getDate()) 
                  + " day in " + date.toDateString().split(" ")[1] 
                  + " in " + date.toDateString().split(" ")[3];
      } else {
        // TODO: We must shedule throught database, we cannot schedule by using the parser

        text += " at " + (
          hours < 10
          ? "0"
          : "") + hours + ":" + (
          minutes < 10
          ? "0"
          : "") + minutes;

          // text += " every 5 mins";
           text += " every " + this.secondsToMinutes(this.daysToSeconds(this.every)) + " minutes";
          //  text += ` every ${this.every} day`;

        if(this.daysToSeconds(this.every) < 86400)  {
          text += ` every day`;
        } else if(this.daysToSeconds(this.every) < 86400 * 7) {
          text += ` every 1 week`;
        } else if(this.daysToSeconds(this.every) < 86400 * 30) {
          text += ` every 1 month`;
        } else if(this.daysToSeconds(this.every) < 86400 * 30 * 12) {
          text += ` every 1 year`;
        }

         


        // we cant schedule this in the future.
        // we must avoid or add a schedule
        text += " starting on the " + this.convertDayNumberToString(date.getDate()) 
          + " day in " + date.toDateString().split(" ")[1] 
          + " in " + date.toDateString().split(" ")[3];
        // this.isFuture = true; // we cant schedule using the parser, so we shedule it by hand


        // this.parsed = later.parse.recur()
        //   .every(this.daysToSeconds(this.every)).seconds() // converting days into seconds, in order to shedule far in future 
        //   .on((hours < 10? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes)
        //   .startingOn(10);
        
      }

      // text += " also at " + (
      //   hours < 10
      //   ? "0"
      //   : "") + hours + ":" + (
      //   minutes < 10
      //   ? "0"
      //   : "") + minutes;
    } else if (this.type == "OneTime") {
      const date = this.convertToDate(this.startAt);
      const minutes = this.convertToDate(this.startAt).getMinutes();
      const hours = this.convertToDate(this.startAt).getHours();

      text += " at " + (
        hours < 10
        ? "0"
        : "") + hours + ":" + (
        minutes < 10
        ? "0"
        : "") + minutes;

      if(_currentDate.getDate() == date.getDate()) {
        // same day
        text += " on " + this.getDayIndexOfTheWeek(date.toLocaleDateString(undefined, { weekday: 'long' }).split(',')[0].toLowerCase());
      } else {
        // next day
        text += " on " + this.getNextDay(date);
      }



      // text +=
      //   " starting on the " +
      //   date.getDay() +
      //   " day of " +
      //   date.toDateString().split(" ")[1] +
      //   " in " +
      //   date.toDateString().split(" ")[3];
    }

    this.toParse = text;
  }

  /**
     *  this will convert string into Date if is convertible
     * @param {string | Date} date
     * @returns {Date}
     */
  convertToDate(date) {
    if (date instanceof Date) {
      return date;
    }
    date = new Date(date);
    return date;
  }

  convertDayNumberToString(number) {
    let lastNumber = number.toString().slice(-1);
    let suffixe = "st";

    if (lastNumber == 1) {
      suffixe = "st";
    } else if (lastNumber == 2) {
      suffixe = "nd";
    } else if (lastNumber == 3) {
      suffixe = "rd";
    } else {
      suffixe = "th";
    }

    return number + suffixe;
  }

  getStartAt() {
    return this.convertToDate(this.startAt);
  }

  isFuture() {
    if (this.getStartAt() > new Date()) {
      return true;
    }
    return false;
  }

 
  /**
   * This will find the index of the day
   * @param {String} day 
   * @returns 
   */
  getDayIndexOfTheWeek(day = "monday") {
    if (day == "monday") {
      return 1;
    } else if (day == "tuesday") {
      return 2;
    } else if (day == "wednesday") {
      return 3;
    } else if (day == "thursday") {
      return 4;
    } else if (day == "friday") {
      return 5;
    } else if (day == "saturday") {
      return 6;
    } else if (day == "sunday") {
      return 7;
    }
  }



  /**
   * this will calculate days between two dates
   * @param {Date} firstDate 
   * @param {Date} lastDate 
   */
  calculateDaysDifferenceBetweenTwoDates(firstDate, lastDate) {
    let diff = firstDate.getTime() - lastDate.getTime();
    let days = diff / (1000 * 60 * 60 * 24); 
    return days;
  }


  /**
   * This function will calculate next day
   * @param {Date} date 
   */
  getNextDay(date = new Date()) {
    date.setDate(date.getDate() + 1) // We add one day

    let dayName = date.toLocaleDateString(undefined, { weekday: 'long' }); // monday

    return dayName;
  }

  /**
   *  This will convert days into seconds
   * @param {Number} days 
   * @returns 
   */
  daysToSeconds(days = 1) {
    const hours = 24;
    const minutes = 60;
    const seconds = 60;

    const calc = days * (hours * minutes * seconds );
    return calc;
  }

  /**
   * This will convert seconds to minutes
   * @param {Number} time 
   * @returns 
   */
  secondsToMinutes(time = 0) {
    var minutes = Math.floor(time / 60);

    return minutes;
  }
}
