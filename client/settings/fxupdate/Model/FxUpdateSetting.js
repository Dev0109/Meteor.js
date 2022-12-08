/**
 *
 *
 * @type {{transactionType: string, reportNames: Array, frequency: FxFrequency, send: string, recipients: string}}
 */
export default class FxUpdateSetting {
  constructor({ transactionType, reportNames, frequency, send, recipients }) {
    this.transactionType = transactionType;
    this.reportNames = reportNames;
    this.frequency = frequency; // FxFrequency
    this.send = send;
    this.recipients = recipients;
  }
}

export class FxFrequency {
  constructor({ type, rythm, startTime, startDate }) {
    this.type = type;
    this.rythm = rythm;
    this.startDate = startDate;
    this.startTime = startTime;
  }

}

export class FxFrequencyMonthly extends FxFrequency {
  constructor({ everyDay, ofMonths }) {
    super({
      type: "monthly",
      rythm: "monthly",
    });
    this.name = "monthly";
    this.everyDay = everyDay;
    this.ofMonths = ofMonths;
  }
}

export class FxFrequencyWeekly extends FxFrequency {
  constructor({ days, every }) {
    super({
      type: "weekly",
      rythm: "weekly",
    });
    this.days = days;
    this.every = every;
  }
}

export class FxFrequencyDaily extends FxFrequency {
  constructor({ days, every, startDate, startTime }) {
    super({
      type: "daily",
      rythm: "daily",
      startDate: startDate,
      startTime: startTime,
    });
    this.days = days;
    this.every = every;
  }
}

export class FxFrequencyOnTime extends FxFrequency {
  constructor() {
    super({
      type: "onTime",
      rythm: "onTime",
    });
  }
}

export class FxFrequencyOnEvent extends FxFrequency {
  constructor({ onEvent }) {
    super({
      type: "onEvent",
      rythm: "onEvent",
    });
    this.onEvent;
  }
}
