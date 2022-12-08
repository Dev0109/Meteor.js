import { TaxRateService } from "../../settings/settings-service";
import { ReactiveVar } from "meteor/reactive-var";
import { SideBarService } from "../../js/sidebar-service";
import "../../lib/global/indexdbstorage.js";
import FxGlobalFunctions from "./FxGlobalFunctions";
let sideBarService = new SideBarService();


Template.CurrencyRate.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.currencyData = new ReactiveVar();
});

Template.CurrencyRate.onRendered(function () {
  
});

Template.CurrencyRate.helpers({
  isCurrencyEnable: () => FxGlobalFunctions.isCurrencyEnabled()

});
