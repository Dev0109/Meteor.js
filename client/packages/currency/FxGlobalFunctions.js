import CachedHttp from "../../lib/global/CachedHttp";
import erpObject from "../../lib/global/erp-objects";
import LoadingOverlay from "../../LoadingOverlay";
import {TaxRateService} from "../../settings/settings-service";
import {UtilityService} from "../../utility-service";

export default class FxGlobalFunctions {
  /**
     *
     * Call this in the onCreated method of blaze template
     *
     * @param {BlazeTemplate} templateObject
     */
  static initVars(templateObject) {
    templateObject.currencyList = new ReactiveVar([]);
    templateObject.activeCurrencyList = new ReactiveVar([]);
    templateObject.tcurrencyratehistory = new ReactiveVar([]);
  }

  static async loadDefaultCurrencyForReport(defaultCurrencyCode = "AUD") {
    $("#sltCurrency").attr("disabled", true);
    // $(".exchange-rate-js").attr("disabled", false);
    // $("#exchange_rate").attr("disabled", false);
    const currency = await FxGlobalFunctions.loadDefaultCurrency(defaultCurrencyCode);
    if (currency) {
      const currencyCode = currency.Code;
      const currencySymbol = currency.CurrencySymbol || "$";
      const currencyRate = (
        $(".currency-js").attr("type") == "buy"
        ? currency.BuyRate
        : currency.SellRate) || 1; // We can make this dynamic
      if ($("#sltCurrency").val() == "") {
        $("#sltCurrency").val(currencyCode);
        $("#sltCurrency").attr("currency-symbol", currencySymbol);
        $("#exchange_rate").val(currencyRate);
        $(".exchange-rate-js").val(currencyRate);

        setTimeout(() => {
          $(".exchange-rate-js").trigger("change");
        }, 500);
      }
    }
    $("#sltCurrency").attr("disabled", false);
    // $(".exchange-rate-js").attr("disabled", false);
    // $("#exchange_rate").attr("disabled", false);
  }

  static async loadDefaultCurrency(defaultCurrencyCode = "AUD", fromLocal = true) {
    let data = await CachedHttp.get(erpObject.TCurrency, async () => {
      return await new TaxRateService().getCurrencies();
    }, {
      usIndexDb: true,
      useLocalStorage: false,
      fallBackToLocal: true,
      validate: cachedResponse => {
        return fromLocal;
      }
    });

    let currencies = data.response.tcurrency;
    if (currencies[0].fields) {
      currencies = currencies.map(c => c.fields);
    }

    return currencies.find(currency => currency.Code == defaultCurrencyCode);
  }

  /**
     *
     */
  static async loadCurrency(ui, defaultCurrencyCode) {
    let taxRateService = new TaxRateService();

    //let ui = Template.instance();

    if ((await ui.currencyList.get().length) == 0) {
      LoadingOverlay.show();

      const result = await taxRateService.getCurrencies();

      let currencies = result.tcurrency.map(currency => {
        return {
          ...currency,
          id: currency.Id || "",
          code: currency.Code || "-",
          currency: currency.Currency || "NA",
          symbol: currency.CurrencySymbol || "NA",
          buyrate: currency.BuyRate || "-",
          sellrate: currency.SellRate || "-",
          country: currency.Country || "NA",
          description: currency.CurrencyDesc || "-",
          ratelastmodified: currency.RateLastModified || "-",
          active: currency.Code == defaultCurrencyCode
            ? true
            : false
        };
      });

      currencies = currencies.sort((a, b) => {
        return a.currency.split("")[0].toLowerCase().localeCompare(b.currency.split("")[0].toLowerCase());
      });

      ui.currencyList.set(currencies);

      //   await loadCurrencyHistory(ui);
      await this.loadCurrencyHistory(ui);
      LoadingOverlay.hide();
      //});
    }
  }

  static async loadCurrencyHistory(ui) {
    let taxRateService = new TaxRateService();
    let result = await taxRateService.getCurrencyHistory();
    const data = result.tcurrencyratehistory;
    ui.tcurrencyratehistory.set(data);
    LoadingOverlay.hide();
  }

  static handleChangedCurrency(currency = "AUD", defaultCurrencyCode) {
    if (currency != defaultCurrencyCode) {
      $("#sltCurrency").trigger("change");
    }
  }

  /**
     *
     * This will all events of Fx Module
     *
     * @returns
     */
  static getEvents() {
    return {
      "click .fx-rate-btn": async (e, ui) => {
        await FxGlobalFunctions.loadCurrency(ui, CountryAbbr);
      }
    };
  }

  static isCurrencyEnabled() {
    return Session.get("CloudUseForeignLicence");
  }

  static getCurrentCurrencySymbol(onNull = "N/A") {
    return localStorage.getItem("_SELECTED_CURRENCY_SYMBOL") || onNull;
  }

  static convertToForeignAmount(amount = "$1.5", rate = 1.87, withSymbol = false) {
    let utilityService = new UtilityService();
    const currency = utilityService.extractCurrency(amount);

    //amount = utilityService.removeCurrency(amount, currency);

    amount = amount.replace(/[^0-9.-]+/g, "");

    let convert = (amount * rate).toFixed(2);
    //convert = convert.toFixed(2);

    if (withSymbol) {
      return `${withSymbol}${convert}`;
    }
    return convert;
  }

  /**
     *
     * @param {String} tableId selector #tableId
     */
  static convertToForeignEveryFieldsInTableId(tableId) {
    setTimeout(() => {
      $(tableId + " tbody").find("tr").each((index, tr) => {
        const toConvert = $(tr).find(".convert-to-foreign:not(.hiddenColumn)");
        const rate = $("#exchange_rate").val();

        toConvert.each((index, element) => {
          const mainClass = element.classList[0]; // we get the class of the non foreign html
          const mainElement = $(tr).find(`td.${mainClass}:not(.convert-to-foreign):not(.hiddenColumn)`); //document.querySelector(`#tblBillLine tbody td.${mainClass}:not(.convert-to-foreign):not(.hiddenColumn)`);

          const targetElement = $(tr).find(`td.${mainClass}.convert-to-foreign:not(.hiddenColumn)`);

          let value = $(mainElement).children().length > 0
            ? $(mainElement).find("input").val()
            : $(mainElement).text();

          value = FxGlobalFunctions.convertToForeignAmount(value, rate, FxGlobalFunctions.getCurrentCurrencySymbol());

          if (targetElement.children().length > 0) {
            $(targetElement).find("input").val(value);
          } else {
            $(targetElement).text(value);
          }
        });
      });
    }, 500);
  }

  /**
     * This function toggle the display manually via front end
     * It shouldn't be handled this way
     * @param {boolean} show
     */
  static toggleVisbilityOfValuesToConvert(show = false) {
    if (show) {
      $(".convert-to-foreign").addClass("fx-enabled");
    } else {
      $(".convert-to-foreign").removeClass("fx-enabled");
    }
  }
}
