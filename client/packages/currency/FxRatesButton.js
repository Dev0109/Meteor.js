import { TaxRateService } from "../../settings/settings-service";
import { ReactiveVar } from "meteor/reactive-var";
import { CountryService } from "../../js/country-service";
import { SideBarService } from "../../js/sidebar-service";
import "../../lib/global/indexdbstorage.js";
import FxApi from "../../settings/currencies-setting/FxApi";
import { isCurrencyEnable } from "./CurrencyWidget";
import FxGlobalFunctions from "./FxGlobalFunctions";
let sideBarService = new SideBarService();

let defaultCurrencyCode = CountryAbbr; // global variable "AUD"

Template.FxRatesButton.onCreated(function () {
  const templateObject = Template.instance();
});

Template.FxRatesButton.onRendered(() => {
  
});

Template.FxRatesButton.events({
  
});

Template.FxRatesButton.helpers({
  isCurrencyEnable: () => FxGlobalFunctions.isCurrencyEnabled()


});

export function triggerChangeEventOnRequiredFields() {
  $("#newCurrencyModal .addNewCurrency input[required]").each((i, element) => {
    $(element).trigger("change");
  });
}
