import erpObject from "../../../lib/global/erp-objects";
import ObjectManager from "../../ObjectManager/ObjectManager";

export default class PayRun {
  constructor({
    id = null,
    stpFilling = PayRun.STPFilling.draft, // draft, aproved, overdue
    calendar = {},
    calendarId = null,
    netPay = 0.0,
    superAnnuation = 0.0,
    taxes = 0.0,
    earnings = 0.0,
    wages = 0.0,
    employees = [],
    selected = false
  }) {
    this.id = id || ObjectManager.init(erpObject.TPayRunHistory);
    this.calendar = calendar;
    this.calendarId = parseInt(calendarId);
    this.netPay = netPay;
    this.superAnnuation = superAnnuation;
    this.taxes = taxes;
    this.earnings = earnings;
    this.employees = employees;
    this.wages = wages;
    this.stpFilling = stpFilling || PayRun.STPFilling.draft;
  }

  static STPFilling = {
    draft: "draft",
    overdue: "overdue",
    notfilled: "notfilled"
  };

  buildRemoteObject() {
    return {
      type: erpObject.TPayRunHistory,
      fields: this
    }
  }

  static fromList(arrayOfObjects = []) {
    return arrayOfObjects.map(object => new PayRun(object));
  }

  setMatchedCalendar(calendars = []) {
    this.calendar = calendars.find(c => c.ID == this.calendarId);
  }

  /**
   * 
   * @param {PayRun[]} payRuns 
   * @param {*} calendars 
   * @returns 
   */
  static fetchCalendars(payRuns, calendars) {
    return payRuns.map(payRun => {
      payRun.setMatchedCalendar(calendars);
      return payRun;
    })
  }
}