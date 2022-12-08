import {Meteor} from "meteor/meteor";
import Base64 from "../Lib/Base64";

class FxApi {
  /**
     *
     * @param {String} to
     * @param {String} from
     * @param {float} amount
     * @returns {Promise<{buy: float, sell: float}>}
     */
  async getExchangeRate(to = "EUR", from = "AUD", amount = 1, callback = response => {}) {
    // const response = await fetch(`https://xecdapi.xe.com/v1/convert_to.json/?to=${to}&from=${from}&amount=${amount}&inverse=true`, {
    //    data: postData,
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: "Basic " + await this.getEmployeeFxCurrencyCredentials(),
    //   },
    // });

    // if (response.status >= 200 && response.status <= 302) {
    //   let data = await response.json();

    //   const buyRate = data.from[0].mid;
    //   const sellRate = data.from[0].inverse;

    //   callback({
    //     buy: buyRate,
    //     sell: sellRate,
    //   });
    // } else {
    //   callback({
    //     buy: 1.21,
    //     sell: 1.19,
    //   });
    // }

    Meteor.http.get(`https://xecdapi.xe.com/v1/convert_to.json/?to=${to}&from=${from}&amount=${amount}&inverse=true`, {
      // data: postData,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + (
        await this.getEmployeeFxCurrencyCredentials())
      }
    }, (error, response) => {
      if (error) {
        callback({buy: 1.21, sell: 1.19});
      } else {
        if (response.status >= 200 && response.status <= 302) {
          let data = response.data;

          const buyRate = data.from[0].mid;
          const sellRate = data.from[0].inverse;

          callback({buy: buyRate, sell: sellRate});
        } else {
          callback({buy: 1.21, sell: 1.19});
        }
      }
    });
  }

  async getAllRates(to = "*", from = "AUD", amount = 1, callback = result => {}, apiKey = "") {

    Meteor.http.get(`https://xecdapi.xe.com/v1/convert_from.json/?to=${to}&from=${from}&amount=${amount}&inverse=true`, {
      // data: postData,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + apiKey
      }
    }, (error, response) => {
      if (error) {
        callback(null);
      } else {
        if (response.data.to) {
          let data = response.data;

          callback(data);
          return data;
        } else {
          callback(null);
        }
        return null;
      }
    });
  }

  getRate(currency = "AUD", rateList = []) {
    let _rate = 0;

    rateList.forEach((rate, index) => {
      if (index == currency) {
        _rate = rate;
      }
    });

    return _rate;
  }

  /**
     * This function should return the buy rate
     */
  async getBuyRate(to = "EUR", from = "AUD") {
    const response = await fetch(`https://xecdapi.xe.com/v1/convert_to.json/?to=${to}&from=${from}&amount=1&inverse=false`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + (
        await this.getEmployeeFxCurrencyCredentials())
      }
    });

    if (response.status >= 200 && response.status <= 302) {
      let data = await response.json();
      const rate = data.from[0].mid;
      return rate;
    }
  }

  async getSellRate(to = "EUR", from = "AUD") {
    const response = await fetch(`https://xecdapi.xe.com/v1/convert_to.json/?to=${to}&from=${from}&amount=1&inverse=true`, {
      // Authorization: `${FxApi.ApiID}:${FxApi.ApiKey}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + (
        await this.getEmployeeFxCurrencyCredentials())
      }
    });

    if (response.status >= 200 && response.status <= 302) {
      let data = await response.json();

      const rate = data.from[0].inverse;

      return rate;
    }
  }

  /**
     * This function will return employeeCredentials;
     */
  async getEmployeeFxCurrencyCredentials(ApiID = "userheight41774646", ApiKey = "lgfqm73fb3id5vmqhnnfkgkk0v") {
    // here we need to load from db the user credentials

    const encoded = Base64.encode(`${ApiID}:${ApiKey}`);

    return encoded;
  }
}

export default FxApi = new FxApi();
