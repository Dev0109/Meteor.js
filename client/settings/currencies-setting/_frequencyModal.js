import {TaxRateService} from "../settings-service";
import {ReactiveVar} from "meteor/reactive-var";
import {CountryService} from "../../js/country-service";
import {SideBarService} from "../../js/sidebar-service";
import {HTTP} from "meteor/http";
import "../../lib/global/indexdbstorage.js";
import FxSettingsEditor from "../fxupdate/FxSettingsEditor";
import FxUpdateSetting, {FxFrequencyDaily} from "../fxupdate/Model/FxUpdateSetting";
import {DailyFrequencyModel, MonthlyFrequencyModel, OneTimeOnlyFrequencyModel, OnEventFrequencyModel, WeeklyFrequencyModel} from "./Model/FrequencyModel";
import LoadingOverlay from "../../LoadingOverlay";
import {updateAllCurrencies} from "./currencies";
import CronSetting from "../../CronSetting";
import FormFrequencyModel from "./Model/FormFrequencyModel";
import moment from "moment";
import erpObject from "../../lib/global/erp-objects";
import CachedHttp from "../../lib/global/CachedHttp";
import CurrencyApi from "../../js/Api/CurrencyApi";
import ApiService from "../../js/Api/Module/ApiService";
import { getXeCurrencyKeys } from "../xe-currencies/xe-currencies";
import FxApi from "./FxApi";

let sideBarService = new SideBarService();
let taxRateService = new TaxRateService();

const employeeId = Session.get("mySessionEmployeeLoggedID");

let currentDate = new Date();
let currentFormatedDate = currentDate.getDay() + "/" + currentDate.getMonth() + "/" + currentDate.getFullYear();

let fxUpdateObject;

let FxEditorSetting = new FxSettingsEditor({
  onEditEnabled: () => {
    // This is the default object to build when you click here
    fxUpdateObject = new FxUpdateSetting({
      transactionType: "daily",
      frequency: new FxFrequencyDaily({days: "*", every: "1", startTime: "08:00:00", startDate: currentFormatedDate})
    });
  },
  onEditDisabled: () => {
    fxUpdateObject = null;
  },
  onCanceled: () => {},
  onSaved: () => {}
});

Template._frequencyModal.onCreated(function () {
  const templateObject = Template.instance();
});

Template._frequencyModal.onRendered(function () {
  let templateObject = Template.instance();
  templateObject.assignFrequency = function (frequency) {
    if (frequency == "Weekly") {
      $("#frequencyWeekly").prop("checked", true);
      $("#frequencyMonthly").prop("checked", false);
      $("#frequencyDaily").prop("checked", false);
      $("#frequencyOnetimeonly").prop("checked", false);
      $("#frequencyOnevent").prop("checked", false);
      document.getElementById("monthlySettings").style.display = "none";
      document.getElementById("weeklySettings").style.display = "block";
      document.getElementById("dailySettings").style.display = "none";
      document.getElementById("oneTimeOnlySettings").style.display = "none";
    }

    if (frequency == "Daily") {
      $("#frequencyDaily").prop("checked", true);
      $("#frequencyWeekly").prop("checked", false);
      $("#frequencyMonthly").prop("checked", false);
      $("#frequencyOnetimeonly").prop("checked", false);
      $("#frequencyOnevent").prop("checked", false);
      document.getElementById("monthlySettings").style.display = "none";
      document.getElementById("weeklySettings").style.display = "none";
      document.getElementById("dailySettings").style.display = "block";
      document.getElementById("oneTimeOnlySettings").style.display = "none";
    }

    if (frequency == "Monthly") {
      $("#frequencyMonthly").prop("checked", true);
      $("#frequencyDaily").prop("checked", false);
      $("#frequencyWeekly").prop("checked", false);
      $("#frequencyOnetimeonly").prop("checked", false);
      $("#frequencyOnevent").prop("checked", false);
      document.getElementById("monthlySettings").style.display = "block";
      document.getElementById("weeklySettings").style.display = "none";
      document.getElementById("dailySettings").style.display = "none";
      document.getElementById("oneTimeOnlySettings").style.display = "none";
    }
  };

  templateObject.saveShedule = async e => {
    function convertDayNumberToString(number) {
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

    LoadingOverlay.show();
    // updateAllCurrencies();

    let reportSchedule = {
      type: "TReportSchedules",
      fields: {
        Active: true,
        BeginFromOption: "",
        ContinueIndefinitely: true,
        EmployeeId: employeeId,
        Every: 1,
        EndDate: "",
        FormID: 2,
        LastEmaileddate: "",
        MonthDays: 0,
        StartDate: "",
        WeekDay: 1,
        NextDueDate: ""
      }
    };

    let cronSetting = new CronSetting({
      id: 1,
      isProcessed: 1,
      employeeId: employeeId,
      startAt: new Date(),
      cronJob: () => updateAllCurrencies,
      type: fxUpdateObject == undefined
        ? null
        : fxUpdateObject.type,
      base64XeCredentials: await FxApi.getEmployeeFxCurrencyCredentials()
    });

    let _formFequencyModal = new FormFrequencyModel({});

    /**
         * If monthly
         */
    if (fxUpdateObject instanceof MonthlyFrequencyModel) {
      let checkedMonths = [];
      document.querySelectorAll(".months-input-js input[type=checkbox]:checked").forEach(element => {
        checkedMonths.push(element.getAttribute("value"));
      });

      fxUpdateObject.ofMonths = checkedMonths;
      fxUpdateObject.everyDay = $("#sltDay").val();
      fxUpdateObject.startDate = $("#edtMonthlyStartDate").val();
      fxUpdateObject.startTime = $("#edtMonthlyStartTime").val();

      // Updating object
      reportSchedule.fields.MonthDays = checkedMonths.join(",");
      reportSchedule.fields.Frequency = "M";
      reportSchedule.fields.StartDate = fxUpdateObject.getDate();

      cronSetting.startAt = fxUpdateObject.getDate();
      cronSetting.months = checkedMonths;
      cronSetting.dayNumberOfMonth = convertDayNumberToString(fxUpdateObject.everyDay);

      if ($(".months-input-js input.chkBox:checked").length == 0) {
        LoadingOverlay.hide();
        handleValidationError("You must select at least one month", "Cron Settings");
        return false;
      }

      _formFequencyModal = new FormFrequencyModel({MonthlyEveryDay: $("#sltDay").val(), MonthlyOfMonths: checkedMonths, MonthlyStartDate: $("#edtMonthlyStartDate").val(), MonthlyStartTime: $("#edtMonthlyStartTime").val()});

      //cronSetting.parsed = later.recur()
    } else if (fxUpdateObject instanceof WeeklyFrequencyModel) {
      const selectedDay = document.querySelector(".weekly-input-js input[type=checkbox]:checked").value;

      fxUpdateObject.selectedDays = selectedDay;
      fxUpdateObject.everyWeeks = $("#weeklyEveryXWeeks").val();
      fxUpdateObject.startDate = $("#edtWeeklyStartDate").val();
      fxUpdateObject.startTime = $("#edtWeeklyStartTime").val();

      // Updating object
      reportSchedule.fields.Frequency = "W";
      reportSchedule.fields.WeekDay = parseInt(selectedDay);
      reportSchedule.fields.Every = fxUpdateObject.everyWeeks;
      reportSchedule.fields.StartDate = fxUpdateObject.getDate();

      // cronSetting.type = "Weekly";
      cronSetting.days = fxUpdateObject.selectedDays;
      cronSetting.every = fxUpdateObject.everyWeeks;
      cronSetting.startAt = fxUpdateObject.getDate();

      if ($(".weekly-input-js input.chkBoxDays:checked").length == 0) {
        LoadingOverlay.hide();
        handleValidationError("You must select at least one day", "Cron Settings");
        return false;
      }

      _formFequencyModal = new FormFrequencyModel({WeeklyEvery: fxUpdateObject.everyWeeks, WeeklyStartDate: $("#edtWeeklyStartDate").val(), WeeklyStartTime: $("#edtWeeklyStartTime").val(), WeeklySelectDays: fxUpdateObject.selectedDays});
    } else if (fxUpdateObject instanceof DailyFrequencyModel) {
      reportSchedule.fields.Frequency = "D";

      reportSchedule.fields.SatAction = "P";
      reportSchedule.fields.SunAction = "P";
      reportSchedule.fields.Every = -1;
      if ($("#dailyWeekdays").prop("checked")) {
        let selectedDays = [];
        let selectedDayNumbers = [];
        document.querySelectorAll(".daily-input-js input[type=checkbox]:checked").forEach(element => {
          selectedDays.push(element.getAttribute("value"));
          selectedDayNumbers.push(parseInt(element.getAttribute("data-value")));
        });

        fxUpdateObject.weekDays = selectedDays;
        cronSetting.dayInNumbers = selectedDayNumbers;
        fxUpdateObject.every = null;

        reportSchedule.fields.SatAction = "D";
        reportSchedule.fields.SunAction = "D";

        cronSetting.days = selectedDays;

        if ($(".daily-input-js input.chkBoxDays:checked").length == 0) {
          LoadingOverlay.hide();
          handleValidationError("You must select at least one day", "Cron Settings");
          return false;
        }

        _formFequencyModal = new FormFrequencyModel({DailyWeekDays: selectedDays});
      } else if ($("#dailyEveryDay").prop("checked")) {
        cronSetting.dayInNumbers = [
          1,
          2,
          3,
          4,
          5,
          6,
          7
        ];
        fxUpdateObject.weekDays = [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday"
        ];
        fxUpdateObject.every = 1;

        reportSchedule.fields.Every = fxUpdateObject.every;

        cronSetting.every = 1;
        cronSetting.days = fxUpdateObject.weekDays;

        _formFequencyModal = new FormFrequencyModel({DailyEvery: fxUpdateObject.every, DailyWeekDays: fxUpdateObject.weekDays, DailyEveryDay: true});
      } else if ($("#dailyEvery").prop("checked")) {
        fxUpdateObject.weekDays = null;
        fxUpdateObject.every = parseInt($("#dailyEveryXDays").val());

        reportSchedule.fields.Every = fxUpdateObject.every;

        cronSetting.every = fxUpdateObject.every;

        _formFequencyModal = new FormFrequencyModel({DailyEvery: fxUpdateObject.every});
      }

      fxUpdateObject.startDate = $("#edtDailyStartDate").val();
      fxUpdateObject.startTime = $("#edtDailyStartTime").val();

      reportSchedule.fields.StartDate = fxUpdateObject.getDate();

      cronSetting.startAt = fxUpdateObject.getDate();

      _formFequencyModal.DailyStartDate = $("#edtDailyStartDate").val();
      _formFequencyModal.DailyStartTime = $("#edtDailyStartTime").val();
    } else if (fxUpdateObject instanceof OneTimeOnlyFrequencyModel) {
      fxUpdateObject.startDate = $("#edtOneTimeOnlyDate").val();
      fxUpdateObject.startTime = $("#edtOneTimeOnlyTime").val();

      reportSchedule.fields.Frequency = "";
      reportSchedule.fields.EndDate = fxUpdateObject.getDate();

      cronSetting.startAt = fxUpdateObject.getDate();

      _formFequencyModal = new FormFrequencyModel({OneTimeStartDate: fxUpdateObject.startDate, OneTimeStartTime: fxUpdateObject.startTime});
    } else if (fxUpdateObject instanceof OnEventFrequencyModel) {
      fxUpdateObject.onLogin = $("#settingsOnLogon").prop("checked");
      fxUpdateObject.onLogout = $("#settingsOnLogout").prop("checked");
      reportSchedule.fields.Frequency = "";

      _formFequencyModal = new FormFrequencyModel({OnEventLogIn: fxUpdateObject.onLogin, OnEventLogOut: fxUpdateObject.onLogout});
    }

    if (fxUpdateObject.startDate && fxUpdateObject.startTime) {
      if (moment(fxUpdateObject.getDate()).isBefore(new Date())) {
        LoadingOverlay.hide();
        handleValidationError("You cannot schedule before your current time", "Cron Settings");
        return false;
      }
    }

    _formFequencyModal.EmployeeId = employeeId;

    cronSetting.isProcessed = 1;
    cronSetting.type = fxUpdateObject.type;

    cronSetting.buildParsedText();
    try {
      var erpGet = erpDb();
      Meteor.call("addCurrencyCron", cronSetting, erpGet);
      _formFequencyModal.save();
      LoadingOverlay.hide(0);
      swal({title: "Success", text: "Fx update was scheduled successfully", type: "success", showCancelButton: false, confirmButtonText: "OK"}).then(() => {
        // window.open("/currenciessettings", "_self");
      });
    } catch (exception) {
      LoadingOverlay.hide(0);

      swal({title: "Oooops...", text: "Couldn't save schedule", type: "error", showCancelButton: true, confirmButtonText: "Try Again"}).then(result => {
        if (result.value) {
          $(".btnSaveFrequency").click();
          // Meteor._reload.reload();
        } else if (result.dismiss === "cancel") {}
      });
    }

    await templateObject._saveShedule(_formFequencyModal);
    LoadingOverlay.hide();
  };

  templateObject._loadDefault = async () => {
    //let defaultForm = await getVS1Data(erpObject.TCurrencyFrequencySettings);

    let data = await CachedHttp.get(erpObject.TCurrencyFrequencySettings, async () => {
      const currencyApi = new CurrencyApi();
      const apiEndPoint = currencyApi.collection.findByName(erpObject.TCurrencyFrequencySettings);
      const response = await apiEndPoint.fetch();

      if (response.ok) {
        const data = await response.json();

        return data;
      }
      return null;
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      validate: cachedResponse => {
        return true;
      }
    });

    const response = data.response;
    const currencySettings = response.tcurrencyfrequencysettings;

    return currencySettings.length > 0
      ? currencySettings[0]
      : null;
  };

  templateObject._saveShedule = async body => {
    // addVS1Data(erpObject.TCurrencyFrequencySettings, JSON.stringify(_formFequencyModal)).then(function (datareturn) {
    //   location.reload(true);
    //   $("#frequencyModal").modal("hide");
    // }).catch(function (err) {
    //   location.reload(true);
    // });

    try {
      const currencyApi = new CurrencyApi();
      const apiEndPoint = currencyApi.collection.findByName(erpObject.TCurrencyFrequencySettings);
      const response = await apiEndPoint.fetch(null, {
        method: "POST",
        headers: ApiService.getPostHeaders(),
        body: JSON.stringify({
          type: erpObject.TCurrencyFrequencySettings,
          fields: [
            body
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();

        return data;
      }
      return null;
    } catch (e) {
      swal({
        title: "Oooops...",
        // text: "Couldn't save schedule",
        text: e,
        type: "error",
        showCancelButton: true,
        confirmButtonText: "Try Again"
      }).then(result => {
        if (result.value) {
          $(".btnSaveFrequency").trigger("click");
          // Meteor._reload.reload();
        } else if (result.dismiss === "cancel") {}
      });
    }
  };

  templateObject.loadDefault = async () => {
    let defaultForm = await templateObject._loadDefault();
    if (!defaultForm) {
      document.querySelector("#frequencyDaily").click(); // this is the default
      return;
    }
    let defaultFormFrequency = new FormFrequencyModel(
      defaultForm.length > 0
      ? JSON.parse(defaultForm[0].data)
      : {});

    if (defaultFormFrequency.MonthlyStartDate) {
      // it is montly
      const monthly = $("#monthlySettings");
      document.querySelector("#frequencyMonthly").click();
      monthly.find("#sltDay").val(defaultFormFrequency.MonthlyEveryDay);
      monthly.find(".months-input-js input.chkBox").each((index, el) => {
        const value = $(el).attr("value");
        // if (defaultFormFrequency.MonthlyOfMonths.includes(value)) {
        //   $(el).prop("checked",defaultFormFrequency.MonthlyOfMonths.includes(value));
        // }
        $(el).prop("checked", defaultFormFrequency.MonthlyOfMonths.includes(value));
      });
      monthly.find("#edtMonthlyStartTime").val(defaultFormFrequency.MonthlyStartTime);
      monthly.find("#edtMonthlyStartDate").val(defaultFormFrequency.MonthlyStartDate);
    } else if (defaultFormFrequency.WeeklyStartDate) {
      const weekly = $("#weeklySettings");
      document.querySelector("#frequencyWeekly").click();

      weekly.find("#weeklyEveryXWeeks").val(defaultFormFrequency.WeeklyEvery);
      weekly.find(".weekly-input-js input.chkBoxDays").each((index, el) => {
        const value = $(el).attr("value");
        // if (value == defaultFormFrequency.WeeklySelectDays) {
        //    $(el).prop("checked", value == defaultFormFrequency.WeeklySelectDays);
        //   $(el).trigger('click');

        // }
        $(el).prop("checked", value == defaultFormFrequency.WeeklySelectDays);
      });

      weekly.find("#edtWeeklyStartTime").val(defaultFormFrequency.WeeklyStartTime);
      weekly.find("#edtWeeklyStartDate").val(defaultFormFrequency.WeeklyStartDate);
    } else if (defaultFormFrequency.DailyStartDate) {
      const daily = $("#dailySettings");
      document.querySelector("#frequencyDaily").click();

      if (defaultFormFrequency.DailyEveryDay) {
        daily.find("#dailyEveryDay").trigger("click");
      } else if (defaultFormFrequency.DailyEveryDay == null && defaultFormFrequency.DailyEvery == null && defaultFormFrequency.DailyWeekDays.length < 7) {
        document.querySelector("#dailyWeekdays").click();
        daily.find(".week-days-js input.chkBoxDays").each((index, el) => {
          const value = $(el).attr("value");
          $(el).prop("checked", defaultFormFrequency.DailyWeekDays.includes(value));
        });
      } else if (defaultFormFrequency.DailyEvery && defaultFormFrequency.DailyEveryDay == null && defaultFormFrequency.DailyWeekDays == null) {
        document.querySelector("#dailyEvery").click();
        daily.find("#dailyEveryXDays").val(defaultFormFrequency.DailyEvery);
      }
      daily.find("#edtDailyStartTime").val(defaultFormFrequency.DailyStartTime);
      daily.find("#edtDailyStartDate").val(defaultFormFrequency.DailyStartDate);
    } else if (defaultFormFrequency.OneTimeStartDate) {
      document.querySelector("#frequencyOnetimeonly").click();
      $("#edtOneTimeOnlyTime").val(defaultFormFrequency.OneTimeStartTime);
      $("#edtOneTimeOnlyDate").val(defaultFormFrequency.OneTimeStartDate);
    } else if (defaultFormFrequency.OnEventLogIn || defaultFormFrequency.OnEventLogOut) {
      document.querySelector("#frequencyOnevent").click();

      if (defaultFormFrequency.OnEventLogIn) {
        $("#settingsOnLogon").trigger("click");
      } else if (defaultFormFrequency.OnEventLogOut) {
        $("#settingsOnLogout").trigger("click");
      }
    }
  };

  // templateObject.loadDefault();
});

Template._frequencyModal.events({
  "change input[name=dailyRadio]": e => {
    $(".week-days-js input[type=checkbox].chkBoxDays").attr(
      "disabled", $(e.currentTarget).attr("data-value") == "week-days"
      ? false
      : true);
  },
  "shown.bs.modal #frequencyModal": (e, ui) => {
    ui.loadDefault();
  },
  "click .btnSaveFrequency": (e, ui) => {
    playSaveAudio();
    setTimeout(function(){
    ui.saveShedule();
  }, delayTimeAfterSound);
  },
  'click input[name="frequencyRadio"]': event => {
    if (event.target.id == "frequencyMonthly") {
      document.getElementById("monthlySettings").style.display = "block";
      document.getElementById("weeklySettings").style.display = "none";
      document.getElementById("dailySettings").style.display = "none";
      document.getElementById("oneTimeOnlySettings").style.display = "none";
      document.getElementById("onEventSettings").style.display = "none";

      fxUpdateObject = new MonthlyFrequencyModel({
        startDate: currentDate.toISOString().substring(0, 10),
        startTime: "08:00:00"
      });

      $("#edtMonthlyStartTime").val(fxUpdateObject.startTime);
      $("#edtMonthlyStartDate").val(fxUpdateObject.startDate);
    } else if (event.target.id == "frequencyWeekly") {
      document.getElementById("weeklySettings").style.display = "block";
      document.getElementById("monthlySettings").style.display = "none";
      document.getElementById("dailySettings").style.display = "none";
      document.getElementById("oneTimeOnlySettings").style.display = "none";
      document.getElementById("onEventSettings").style.display = "none";

      fxUpdateObject = new WeeklyFrequencyModel({
        startDate: currentDate.toISOString().substring(0, 10),
        startTime: "08:00:00"
      });

      $("#edtWeeklyStartTime").val(fxUpdateObject.startTime);
      $("#edtWeeklyStartDate").val(fxUpdateObject.startDate);
    } else if (event.target.id == "frequencyDaily") {
      document.getElementById("dailySettings").style.display = "block";
      document.getElementById("monthlySettings").style.display = "none";
      document.getElementById("weeklySettings").style.display = "none";
      document.getElementById("oneTimeOnlySettings").style.display = "none";
      document.getElementById("onEventSettings").style.display = "none";

      fxUpdateObject = new DailyFrequencyModel({
        startDate: currentDate.toISOString().substring(0, 10),
        startTime: "08:00:00"
      });

      $("#edtDailyStartTime").val(fxUpdateObject.startTime);
      $("#edtDailyStartDate").val(fxUpdateObject.startDate);
    } else if (event.target.id == "frequencyOnetimeonly") {
      document.getElementById("oneTimeOnlySettings").style.display = "block";
      document.getElementById("monthlySettings").style.display = "none";
      document.getElementById("weeklySettings").style.display = "none";
      document.getElementById("dailySettings").style.display = "none";
      document.getElementById("onEventSettings").style.display = "none";

      fxUpdateObject = new OneTimeOnlyFrequencyModel({
        startDate: currentDate.toISOString().substring(0, 10),
        startTime: "08:00:00"
      });

      $("#edtOneTimeOnlyTime").val(fxUpdateObject.startTime);
      $("#edtOneTimeOnlyDate").val(fxUpdateObject.startDate);
    } else if (event.target.id == "frequencyOnevent") {
      document.getElementById("onEventSettings").style.display = "block";
      document.getElementById("monthlySettings").style.display = "none";
      document.getElementById("weeklySettings").style.display = "none";
      document.getElementById("dailySettings").style.display = "none";
      document.getElementById("oneTimeOnlySettings").style.display = "none";

      fxUpdateObject = new OnEventFrequencyModel({onLogin: $("#settingsOnLogon").prop("checked"), onLogout: $("#settingsOnLogout").prop("checked")});
    } else {
      $("#frequencyModal").modal("toggle");
    }
  },
  'click input[name="settingsMonthlyRadio"]': event => {
    if (event.target.id == "settingsMonthlyEvery") {
      $(".settingsMonthlyEveryOccurence").attr("disabled", false);
      $(".settingsMonthlyDayOfWeek").attr("disabled", false);
      $(".settingsMonthlySpecDay").attr("disabled", true);
    } else if (event.target.id == "settingsMonthlyDay") {
      $(".settingsMonthlySpecDay").attr("disabled", false);
      $(".settingsMonthlyEveryOccurence").attr("disabled", true);
      $(".settingsMonthlyDayOfWeek").attr("disabled", true);
    } else {
      $("#frequencyModal").modal("toggle");
    }
  },
  'click input[name="dailyRadio"]': event => {
    if (event.target.id == "dailyEveryDay") {
      $(".dailyEveryXDays").attr("disabled", true);
    } else if (event.target.id == "dailyWeekdays") {
      $(".dailyEveryXDays").attr("disabled", true);
    } else if (event.target.id == "dailyEvery") {
      $(".dailyEveryXDays").attr("disabled", false);
    } else {
      $("#frequencyModal").modal("toggle");
    }
  },
  "click .weeklySettings .chkBoxDays": function (event) {
    var checkboxes = document.querySelectorAll(".weeklySettings .chkBoxDays");
    checkboxes.forEach(item => {
      if (item !== event.target) {
        item.checked = false;
      }
    });
  }
});
