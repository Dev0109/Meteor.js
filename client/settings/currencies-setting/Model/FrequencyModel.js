import { updateAllCurrencies } from "../currencies";

export class MonthlyFrequencyModel {
  constructor({ everyDay, ofMonths, startTime, startDate }) {
    this.everyDay = everyDay;
    this.ofMonths = ofMonths;
    this.startDate = startDate;
    this.startTime = startTime;
    this.type = "Monthly";
  }

  getDate() {
    const date = this.startDate;
    const time = this.startTime;

    const sDate = date
      ? moment(date + " " + time).format("YYYY-MM-DD HH:mm")
      : moment().format("YYYY-MM-DD HH:mm");

    return sDate;
  }
}

export class WeeklyFrequencyModel {
  constructor({ selectedDays, everyWeeks, startTime, startDate }) {
    this.selectedDays = selectedDays;
    this.everyWeeks = everyWeeks;
    this.startDate = startDate;
    this.startTime = startTime;
    this.type = "Weekly";

  }

  getDate() {
    const date = this.startDate;
    const time = this.startTime;

    const sDate = date
      ? moment(date + " " + time).format("YYYY-MM-DD HH:mm")
      : moment().format("YYYY-MM-DD HH:mm");

    return sDate;
  }
}

export class DailyFrequencyModel {
  constructor({ weekDays, every, startTime, startDate }) {
    this.weekDays = weekDays;
    this.every = every;
    this.startDate = startDate;
    this.startTime = startTime;
    this.type = "Daily";

  }

  getDate() {
    const date = this.startDate;
    const time = this.startTime;

    const sDate = date
      ? moment(date + " " + time).format("YYYY-MM-DD HH:mm")
      : moment().format("YYYY-MM-DD HH:mm");

    return sDate;
  }
}

export class OneTimeOnlyFrequencyModel {
  constructor({ startTime, startDate }) {
    this.startDate = startDate;
    this.startTime = startTime;
    this.type = "OneTime";

  }

  getDate() {
    const date = this.startDate;
    const time = this.startTime;

    const sDate = date
      ? moment(date + " " + time).format("YYYY-MM-DD HH:mm")
      : moment().format("YYYY-MM-DD HH:mm");

    return sDate;
  }
}

export class OnEventFrequencyModel {
  constructor({ onLogin, onLogout }) {
    this.type = "OnEvent";

    this.onLogin = onLogin;
    this.onLogout = onLogout;
  }

  /**
   * This function will function on login
   */
  static onLogin(employeeId) {
    updateAllCurrencies({
      employeeId: employeeId
    });
    
  }

  /**
   * This function will run on logout
   */
  static onLogout(employeeId) {
    updateAllCurrencies({
      employeeId: employeeId
    });
    
  }
}

