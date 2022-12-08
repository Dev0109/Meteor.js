import { ReportService } from "../report-service";
import "jQuery.print/jQuery.print.js";
import { UtilityService } from "../../utility-service";
import LoadingOverlay from "../../LoadingOverlay";
import { TaxRateService } from "../../settings/settings-service";
import Datehandler from "../../DateHandler";
import CachedHttp from "../../lib/global/CachedHttp";
import erpObject from "../../lib/global/erp-objects";
import GlobalFunctions from "../../GlobalFunctions";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";

let taxRateService = new TaxRateService();
let reportService = new ReportService();
let utilityService = new UtilityService();
let defaultCurrencyCode = CountryAbbr;

Template.jobprofitabilityreport.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.dateAsAt = new ReactiveVar();
  templateObject.records = new ReactiveVar([]);
  templateObject.reportOptions = new ReactiveVar([]);

  FxGlobalFunctions.initVars(templateObject);
});

Template.jobprofitabilityreport.onRendered(() => {
  const templateObject = Template.instance();
  LoadingOverlay.show();

  templateObject.initDate = () => {
    Datehandler.initOneMonth();
  };

  templateObject.setDateAs = ( dateFrom = null ) => {
    templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
  };

  templateObject.setReportOptions = async function ( ignoreDate = true, formatDateFrom = new Date(),  formatDateTo = new Date() ) {
    let defaultOptions = templateObject.reportOptions.get();
    if (defaultOptions) {
      defaultOptions.fromDate = formatDateFrom;
      defaultOptions.toDate = formatDateTo;
      defaultOptions.ignoreDate = ignoreDate;
    } else {
      defaultOptions = {
        fromDate: moment().subtract(1, "months").format("YYYY-MM-DD"),
        toDate: moment().format("YYYY-MM-DD"),
        ignoreDate: true
      };
    }
    $('.edtReportDates').attr('disabled', false)
    if( ignoreDate == true ){
      $('.edtReportDates').attr('disabled', true);
      templateObject.dateAsAt.set("Current Date");
    }
    $("#dateFrom").val(moment(defaultOptions.fromDate).format('DD/MM/YYYY'));
    $("#dateTo").val(moment(defaultOptions.toDate).format('DD/MM/YYYY'));
    templateObject.dateAsAt.set(moment(defaultOptions.toDate).format('DD/MM/YYYY'));
    await templateObject.reportOptions.set(defaultOptions);
    await templateObject.getJobProfitabilityReportData();
  };

  templateObject.loadReport = async  (dateFrom = null, dateTo = null, ignoreDate = false) => {
    LoadingOverlay.show();
    templateObject.setDateAs( dateFrom );
    // let data = [];
    // if (!localStorage.getItem('VS1JobProfitability_Report')) {
    //   const options = await templateObject.reportOptions.get();
    //   let dateFrom = moment(options.fromDate).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD");
    //   let dateTo = moment(options.toDate).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD");
    //   let ignoreDate = options.ignoreDate || false;
    //   data = await reportService.getJobProfitabilityReport( dateFrom, dateTo, ignoreDate);
    //   if( data.tjobprofitability.length > 0 ){
    //     localStorage.setItem('VS1JobProfitability_Report', JSON.stringify(data)||'');
    //   }
    // }else{
    //   data = JSON.parse(localStorage.getItem('VS1JobProfitability_Report'));
    // }

    // const options = await templateObject.reportOptions.get();
    // let dateFrom = moment(options.fromDate).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD");
    // let dateTo = moment(options.toDate).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD");
    // let ignoreDate = options.ignoreDate || false;

    let data = await CachedHttp.get(erpObject.TJobProfitability, async () => {
      return await reportService.getJobProfitabilityReport( dateFrom, dateTo, ignoreDate);
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      validate: (cachedResponse) => {
        return false;
      }
    });

    data = data.response;


    let reportData = [];
    if( data.tjobprofitability.length > 0 ){
      for (const item of data.tjobprofitability ) {
        let isExist = reportData.filter((subitem) => {
          if( subitem.CompanyName == item.CompanyName ){
              subitem.SubAccounts.push(item)
              return subitem
          }
        });

        if( isExist.length == 0 ){
          reportData.push({
              // TotalOrCost: 0,
              // TotalCrCost: 0,
              SubAccounts: [item],
              ...item
          });
        }
        $(".fullScreenSpin").css("display", "none");
      }
    }
    // let useData = reportData.filter((item) => {
    //   let TotalOrCost = 0;
    //   let TotalCrCost = 0;
    //   item.SubAccounts.map((subitem) => {
    //     TotalOrCost += subitem.Linecost;
    //     TotalCrCost += subitem.linecostinc;
    //   });
    //   item.TotalOrCost = TotalOrCost;
    //   item.TotalCrCost = TotalCrCost;
    //   return item;
    // });
    templateObject.records.set(reportData);
    if (templateObject.records.get()) {
      setTimeout(function () {
        $("td a").each(function () {
          if ( $(this).text().indexOf("-" + Currency) >= 0 ) {
            $(this).addClass("text-danger");
            $(this).removeClass("fgrblue");
          }
        });
        $("td").each(function () {
          if ($(this).text().indexOf("-" + Currency) >= 0) {
            $(this).addClass("text-danger");
            $(this).removeClass("fgrblue");
          }
        });
        $(".fullScreenSpin").css("display", "none");
      }, 1000);
    }

    LoadingOverlay.hide();
  }

  // templateObject.setReportOptions();


  templateObject.initDate();
  
  templateObject.loadReport(
    GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
    GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
    false
  );
  templateObject.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateFrom').val()) )
  LoadingOverlay.hide();
});

Template.jobprofitabilityreport.events({
  "click .btnRefresh": function () {
    LoadingOverlay.show();
    localStorage.setItem("VS1JobProfitability_Report", "");
    Meteor._reload.reload();
  },
  "click .btnExportReport": function () {
    LoadingOverlay.show();
    let utilityService = new UtilityService();
    let templateObject = Template.instance();
    var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
    var dateTo = new Date($("#dateTo").datepicker("getDate"));

    let formatDateFrom =
      dateFrom.getFullYear() +
      "-" +
      (dateFrom.getMonth() + 1) +
      "-" +
      dateFrom.getDate();
    let formatDateTo =
      dateTo.getFullYear() +
      "-" +
      (dateTo.getMonth() + 1) +
      "-" +
      dateTo.getDate();

    const filename = loggedCompany + "- Job Profitability Report" + ".csv";
    utilityService.exportReportToCsvTable("tableExport", filename, "csv");
    let rows = [];
  },
  "click .btnPrintReport": function (event) {
    playPrintAudio();
    setTimeout(function(){
    let values = [];
    let basedOnTypeStorages = Object.keys(localStorage);
    basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
      let employeeId = storage.split("_")[2];
      return (
        storage.includes("BasedOnType_") &&
        employeeId == Session.get("mySessionEmployeeLoggedID")
      );
    });
    let i = basedOnTypeStorages.length;
    if (i > 0) {
      while (i--) {
        values.push(localStorage.getItem(basedOnTypeStorages[i]));
      }
    }
    values.forEach((value) => {
      let reportData = JSON.parse(value);
      reportData.HostURL = $(location).attr("protocal")
        ? $(location).attr("protocal") + "://" + $(location).attr("hostname")
        : "http://" + $(location).attr("hostname");
      if (reportData.BasedOnType.includes("P")) {
        if (reportData.FormID == 1) {
          let formIds = reportData.FormIDs.split(",");
          if (formIds.includes("225")) {
            reportData.FormID = 225;
            Meteor.call("sendNormalEmail", reportData);
          }
        } else {
          if (reportData.FormID == 225)
            Meteor.call("sendNormalEmail", reportData);
        }
      }
    });

    document.title = "Job Profitability Report";
    $(".printReport").print({
      title: "Job Profitability Report | " + loggedCompany,
      noPrintSelector: ".addSummaryEditor",
    });
  }, delayTimeAfterSound);
  },
  "keyup #myInputSearch": function (event) {
    $(".table tbody tr").show();
    let searchItem = $(event.target).val();
    if (searchItem != "") {
      var value = searchItem.toLowerCase();
      $(".table tbody tr").each(function () {
        var found = "false";
        $(this).each(function () {
          if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
            found = "true";
          }
        });
        if (found == "true") {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
    } else {
      $(".table tbody tr").show();
    }
  },
  "blur #myInputSearch": function (event) {
    $(".table tbody tr").show();
    let searchItem = $(event.target).val();
    if (searchItem != "") {
      var value = searchItem.toLowerCase();
      $(".table tbody tr").each(function () {
        var found = "false";
        $(this).each(function () {
          if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
            found = "true";
          }
        });
        if (found == "true") {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
    } else {
      $(".table tbody tr").show();
    }
  },
  // "click #lastMonth": function () {
  //   let templateObject = Template.instance();
  //   LoadingOverlay.show();
  //   localStorage.setItem("VS1GeneralLedger_Report", "");
  //   $("#dateFrom").attr("readonly", false);
  //   $("#dateTo").attr("readonly", false);
  //   var currentDate = new Date();

  //   var prevMonthLastDate = new Date(
  //     currentDate.getFullYear(),
  //     currentDate.getMonth(),
  //     0
  //   );
  //   var prevMonthFirstDate = new Date(
  //     currentDate.getFullYear() - (currentDate.getMonth() > 0 ? 0 : 1),
  //     (currentDate.getMonth() - 1 + 12) % 12,
  //     1
  //   );

  //   var formatDateComponent = function (dateComponent) {
  //     return (dateComponent < 10 ? "0" : "") + dateComponent;
  //   };

  //   var formatDate = function (date) {
  //     return (
  //       formatDateComponent(date.getDate()) +
  //       "/" +
  //       formatDateComponent(date.getMonth() + 1) +
  //       "/" +
  //       date.getFullYear()
  //     );
  //   };

  //   var formatDateERP = function (date) {
  //     return (
  //       date.getFullYear() +
  //       "-" +
  //       formatDateComponent(date.getMonth() + 1) +
  //       "-" +
  //       formatDateComponent(date.getDate())
  //     );
  //   };

  //   var fromDate = formatDate(prevMonthFirstDate);
  //   var toDate = formatDate(prevMonthLastDate);

  //   $("#dateFrom").val(fromDate);
  //   $("#dateTo").val(toDate);

  //   var getLoadDate = formatDateERP(prevMonthLastDate);
  //   let getDateFrom = formatDateERP(prevMonthFirstDate);
  //   templateObject.dateAsAt.set(fromDate);

  //   // templateObject.getGeneralLedgerReports(getDateFrom, getLoadDate, false);
  // },
  // "click #lastQuarter": function () {
  //   let templateObject = Template.instance();
  //   LoadingOverlay.show();
  //   localStorage.setItem("VS1GeneralLedger_Report", "");
  //   $("#dateFrom").attr("readonly", false);
  //   $("#dateTo").attr("readonly", false);
  //   var currentDate = new Date();
  //   var begunDate = moment(currentDate).format("DD/MM/YYYY");

  //   var begunDate = moment(currentDate).format("DD/MM/YYYY");
  //   function getQuarter(d) {
  //     d = d || new Date();
  //     var m = Math.floor(d.getMonth() / 3) + 2;
  //     return m > 4 ? m - 4 : m;
  //   }

  //   var quarterAdjustment = (moment().month() % 3) + 1;
  //   var lastQuarterEndDate = moment()
  //     .subtract({ months: quarterAdjustment })
  //     .endOf("month");
  //   var lastQuarterStartDate = lastQuarterEndDate
  //     .clone()
  //     .subtract({ months: 2 })
  //     .startOf("month");

  //   var lastQuarterStartDateFormat =
  //     moment(lastQuarterStartDate).format("DD/MM/YYYY");
  //   var lastQuarterEndDateFormat =
  //     moment(lastQuarterEndDate).format("DD/MM/YYYY");

  //   templateObject.dateAsAt.set(lastQuarterStartDateFormat);
  //   $("#dateFrom").val(lastQuarterStartDateFormat);
  //   $("#dateTo").val(lastQuarterEndDateFormat);

  //   let fromDateMonth = getQuarter(currentDate);
  //   var quarterMonth = getQuarter(currentDate);
  //   let fromDateDay = currentDate.getDate();

  //   var getLoadDate = moment(lastQuarterEndDate).format("YYYY-MM-DD");
  //   let getDateFrom = moment(lastQuarterStartDateFormat).format("YYYY-MM-DD");
  //   // templateObject.getGeneralLedgerReports(getDateFrom, getLoadDate, false);
  // },
  // "click #last12Months": function () {
  //   let templateObject = Template.instance();
  //   LoadingOverlay.show();
  //   localStorage.setItem("VS1GeneralLedger_Report", "");
  //   $("#dateFrom").attr("readonly", false);
  //   $("#dateTo").attr("readonly", false);
  //   var currentDate = new Date();
  //   var begunDate = moment(currentDate).format("DD/MM/YYYY");

  //   let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
  //   let fromDateDay = currentDate.getDate();
  //   if (currentDate.getMonth() + 1 < 10) {
  //     fromDateMonth = "0" + (currentDate.getMonth() + 1);
  //   }
  //   if (currentDate.getDate() < 10) {
  //     fromDateDay = "0" + currentDate.getDate();
  //   }

  //   var fromDate =
  //     fromDateDay +
  //     "/" +
  //     fromDateMonth +
  //     "/" +
  //     Math.floor(currentDate.getFullYear() - 1);
  //   templateObject.dateAsAt.set(begunDate);
  //   $("#dateFrom").val(fromDate);
  //   $("#dateTo").val(begunDate);

  //   var currentDate2 = new Date();
  //   var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
  //   let getDateFrom =
  //     Math.floor(currentDate2.getFullYear() - 1) +
  //     "-" +
  //     Math.floor(currentDate2.getMonth() + 1) +
  //     "-" +
  //     currentDate2.getDate();
  //   // templateObject.getGeneralLedgerReports(getDateFrom, getLoadDate, false);
  // },
  "click #ignoreDate": (e, templateObject) => {
    // LoadingOverlay.show();
    localStorage.setItem("VS1GeneralLedger_Report", "");
    $("#dateFrom").attr("readonly", true);
    $("#dateTo").attr("readonly", true);
    templateObject.dateAsAt.set("Current Date");
    templateObject.loadReport(null, null,
      false
    );
  },

  // CURRENCY MODULE
  ...FxGlobalFunctions.getEvents(),
  "click .currency-modal-save": (e) => {
    //$(e.currentTarget).parentsUntil(".modal").modal("hide");
    LoadingOverlay.show();

    let templateObject = Template.instance();

    // Get all currency list
    let _currencyList = templateObject.currencyList.get();

    // Get all selected currencies
    const currencySelected = $(".currency-selector-js:checked");
    let _currencySelectedList = [];
    if (currencySelected.length > 0) {
      $.each(currencySelected, (index, e) => {
        const sellRate = $(e).attr("sell-rate");
        const buyRate = $(e).attr("buy-rate");
        const currencyCode = $(e).attr("currency");
        const currencyId = $(e).attr("currency-id");
        let _currency = _currencyList.find((c) => c.id == currencyId);
        _currency.active = true;
        _currencySelectedList.push(_currency);
      });
    } else {
      let _currency = _currencyList.find((c) => c.code == defaultCurrencyCode);
      _currency.active = true;
      _currencySelectedList.push(_currency);
    }

    _currencyList.forEach((value, index) => {
      if (_currencySelectedList.some((c) => c.id == _currencyList[index].id)) {
        _currencyList[index].active = _currencySelectedList.find(
          (c) => c.id == _currencyList[index].id
        ).active;
      } else {
        _currencyList[index].active = false;
      }
    });

    _currencyList = _currencyList.sort((a, b) => {
      if (a.code == defaultCurrencyCode) {
        return -1;
      }
      return 1;
    });

    // templateObject.activeCurrencyList.set(_activeCurrencyList);
    templateObject.currencyList.set(_currencyList);

    LoadingOverlay.hide();
  },
  "click [href='#noInfoFound']": function () {
    swal({
        title: 'Information',
        text: "No further information available on this column",
        type: 'warning',
        confirmButtonText: 'Ok'
      })
  },

   /**
   * This is the new way to handle any modification on the date fields
   */
    "change #dateTo, change #dateFrom": (e, templateObject) => {
      templateObject.loadReport(
        GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
        GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
        false
      );
      templateObject.dateAsAt.set($('#dateTo').val());
    },
    ...Datehandler.getDateRangeEvents()
});

Template.jobprofitabilityreport.helpers({
  dateAsAt: () => {
    return Template.instance().dateAsAt.get() || "-";
  },
  records: () => {
    return Template.instance().records.get();
  },

  redirectionType(item) {
    if(item.TransactionType === 'Invoice') {
      return '/invoicecard?id=' + item.SaleID;
    } else if (item.TransactionType === 'Quote') {
      return 'quotecard?id=' + item.saleId;
    } else if (item.TransactionType === 'Bill') {
      return '/billcard?id=' + item.saleId;
    } else if (item.TransactionType === 'Timesheet') {
      return '#noInfoFound';
    } else if (item.TransactionType === 'Refund') {
      return 'refundcard?id=' + item.SaleID;
    } else if (item.TransactionType === 'Purchase Order') {
      return '/purchaseordercard?id=' + item.saleId;
    } else {
      return '#noInfoFound';
    }
  },
  formatPrice( amount ){
    let utilityService = new UtilityService();
    if( isNaN( amount ) ){
        amount = ( amount === undefined || amount === null || amount.length === 0 ) ? 0 : amount;
        amount = ( amount )? Number(amount.replace(/[^0-9.-]+/g,"")): 0;
    }
    return ( amount != 0 )? utilityService.modifynegativeCurrencyFormat(amount): "" || "";
  },
  formatPercent( percentVal ){
      if( isNaN(percentVal) ){
          percentVal = ( percentVal === undefined || percentVal === null || percentVal.length === 0) ? 0 : percentVal;
          percentVal = ( percentVal )? Number(percentVal.replace(/[^0-9.-]+/g,"")): 0;
      }
      return ( percentVal != 0 )? `${parseFloat(percentVal).toFixed(2)}%` : '';
  },
  checkZero( value ){
    return ( value == 0 )? '': value;
  },
  formatDate: ( date ) => {
    return ( date )? moment(date).format("YYYY/MM/DD") : '';
  },
   // FX Module //
  convertAmount: (amount, currencyData) => {
    let currencyList = Template.instance().tcurrencyratehistory.get(); // Get tCurrencyHistory

    if(isNaN(amount)) {
      if (!amount || amount.trim() == "") {
        return "";
      }
      amount = utilityService.convertSubstringParseFloat(amount); // This will remove all currency symbol
    }
    // if (currencyData.code == defaultCurrencyCode) {
    //   // default currency
    //   return amount;
    // }


    // Lets remove the minus character
    const isMinus = amount < 0;
    if (isMinus == true) amount = amount * -1; // make it positive for now

    // // get default currency symbol
    // let _defaultCurrency = currencyList.filter(
    //   (a) => a.Code == defaultCurrencyCode
    // )[0];

    // amount = amount.replace(_defaultCurrency.symbol, "");


    // amount =
    //   isNaN(amount) == true
    //     ? parseFloat(amount.substring(1))
    //     : parseFloat(amount);



    // Get the selected date
    let dateTo = $("#dateTo").val();
    const day = dateTo.split("/")[0];
    const m = dateTo.split("/")[1];
    const y = dateTo.split("/")[2];
    dateTo = new Date(y, m, day);
    dateTo.setMonth(dateTo.getMonth() - 1); // remove one month (because we added one before)


    // Filter by currency code
    currencyList = currencyList.filter((a) => a.Code == currencyData.code);

    // Sort by the closest date
    currencyList = currencyList.sort((a, b) => {
      a = GlobalFunctions.timestampToDate(a.MsTimeStamp);
      a.setHours(0);
      a.setMinutes(0);
      a.setSeconds(0);

      b = GlobalFunctions.timestampToDate(b.MsTimeStamp);
      b.setHours(0);
      b.setMinutes(0);
      b.setSeconds(0);

      var distancea = Math.abs(dateTo - a);
      var distanceb = Math.abs(dateTo - b);
      return distancea - distanceb; // sort a before b when the distance is smaller

      // const adate= new Date(a.MsTimeStamp);
      // const bdate = new Date(b.MsTimeStamp);

      // if(adate < bdate) {
      //   return 1;
      // }
      // return -1;
    });

    const [firstElem] = currencyList; // Get the firest element of the array which is the closest to that date



    let rate = currencyData.code == defaultCurrencyCode ? 1 : firstElem.BuyRate; // Must used from tcurrecyhistory




    amount = parseFloat(amount * rate); // Multiply by the rate
    amount = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }); // Add commas

    let convertedAmount =
      isMinus == true
        ? `- ${currencyData.symbol} ${amount}`
        : `${currencyData.symbol} ${amount}`;


    return convertedAmount;
  },
  count: (array) => {
    return array.length;
  },
  countActive: (array) => {
    if (array.length == 0) {
      return 0;
    }
    let activeArray = array.filter((c) => c.active == true);
    return activeArray.length;
  },
  currencyList: () => {
    return Template.instance().currencyList.get();
  },
  isNegativeAmount(amount) {
    if (Math.sign(amount) === -1) {

      return true;
    }
    return false;
  },
  isOnlyDefaultActive() {
    const array = Template.instance().currencyList.get();
    if (array.length == 0) {
      return false;
    }
    let activeArray = array.filter((c) => c.active == true);

    if (activeArray.length == 1) {

      if (activeArray[0].code == defaultCurrencyCode) {
        return !true;
      } else {
        return !false;
      }
    } else {
      return !false;
    }
  },
  isCurrencyListActive() {
    const array = Template.instance().currencyList.get();
    let activeArray = array.filter((c) => c.active == true);

    return activeArray.length > 0;
  },
  isObject(variable) {
    return typeof variable === "object" && variable !== null;
  },
  currency: () => {
    return Currency;
  },

});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});

Template.registerHelper("notEquals", function (a, b) {
  return a != b;
});

Template.registerHelper("containsequals", function (a, b) {
  return a.indexOf(b) >= 0;
});
