import { ReactiveVar } from "meteor/reactive-var";
import { HTTP } from "meteor/http";
import { updateAllCurrencies } from "../settings/currencies-setting/currencies";

const currentDate = new Date();
let currentFormatedDate =
  currentDate.getDay() +
  "/" +
  currentDate.getMonth() +
  "/" +
  currentDate.getFullYear();

Template.updateCurrencies.onCreated(function () {
  const templateObject = Template.instance();

  templateObject.jsonResponse = new ReactiveVar();
});

Template.updateCurrencies.onRendered(function () {
  let templateObject = Template.instance();

  const targetUserId = FlowRouter.getParam("_userId");

  updateAllCurrencies(targetUserId);

  templateObject.jsonResponse.set(JSON.stringify({
    success: true,
  }));


  //updateAllCurrencies(targetUserId);
});

Template.updateCurrencies.helpers({
  jsonResponse: () => {
    return Template.instance().jsonResponse.get();
  }
});
