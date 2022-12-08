import moment from "moment";
import { UtilityService } from "./utility-service";

export default class GlobalFunctions {
  /**
     *
     * @param {string} timestamp
     * @returns {Date}
     */
  static timestampToDate(timestamp) {
    const date = new Date(timestamp);
    return date;
  }

  /**
     *
     * @param {string} myString
     * @returns {boolean}
     */
  static hasNumber(myString) {
    return /\d/.test(myString);
  }

  /**
     *
     * @param {Date} date1
     * @param {Date} date2
     * @return {boolean}
     */
  static isSameDay(date1, date2) {
    if (date1 instanceof Date == false) {
      date1 = new Date(date1);
    }

    if (date2 instanceof Date == false) {
      date2 = new Date(date2);
    }

    if (date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate() && date1.getFullYear() == date2.getFullYear()) {
      return true;
    } else {
      false;
    }
  }

  static convertYearMonthDay(date, split = "/", replace = "-") {
    const _date = date.split(split);
  
    let newDate = _date[2] + replace + _date[1] +  replace + _date[0];
    return newDate;
  }

  static async asyncForEach(array, callback = async (element, index, array = []) => {}) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  static formatDate(date) {
      return moment(date).format("DD/MM/YYYY");
  }

  static formatPrice(amount) {
    let utilityService = new UtilityService();
    if (isNaN(amount)) {
      amount = amount === undefined || amount === null || amount.length === 0
        ? 0
        : amount;
      amount = amount
        ? Number(amount.replace(/[^0-9.-]+/g, ""))
        : 0;
    }
    return utilityService.modifynegativeCurrencyFormat(amount) || 0.0;
  }
}