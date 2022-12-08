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


const reportService = new ReportService();
let utilityService = new UtilityService();
let taxRateService = new TaxRateService();
let defaultCurrencyCode = CountryAbbr;


Template.stockquantitybylocation.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.dateAsAt = new ReactiveVar();
  templateObject.reportOptions = new ReactiveVar();
  FxGlobalFunctions.initVars(templateObject);
  templateObject.records = new ReactiveVar([]);
});

Template.stockquantitybylocation.onRendered(() => {
  const templateObject = Template.instance();
  LoadingOverlay.show();

  templateObject.initDate = () => {
    Datehandler.initOneMonth();
    // const currentDate = new Date();

    // /**
    //  * This will init dates
    //  */
    // let begunDate = moment(currentDate).format("DD/MM/YYYY");
    // templateObject.dateAsAt.set(begunDate);

    // let fromDateMonth = currentDate.getMonth() + 1;
    // let fromDateDay = currentDate.getDate();
    // if (currentDate.getMonth() + 1 < 10) {
    //   fromDateMonth = "0" + (currentDate.getMonth() + 1);
    // }

    // let prevMonth = moment().subtract(1, "months").format("MM");

    // if (currentDate.getDate() < 10) {
    //   fromDateDay = "0" + currentDate.getDate();
    // }
    // // let getDateFrom = currentDate2.getFullYear() + "-" + (currentDate2.getMonth()) + "-" + ;
    // var fromDate =
    //   fromDateDay + "/" + prevMonth + "/" + currentDate.getFullYear();

    // $("#date-input,#dateTo,#dateFrom").datepicker({
    //   showOn: "button",
    //   buttonText: "Show Date",
    //   buttonImageOnly: true,
    //   buttonImage: "/img/imgCal2.png",
    //   dateFormat: "dd/mm/yy",
    //   showOtherMonths: true,
    //   selectOtherMonths: true,
    //   changeMonth: true,
    //   changeYear: true,
    //   yearRange: "-90:+10",
    //   onChangeMonthYear: function (year, month, inst) {
    //     // Set date to picker
    //     $(this).datepicker(
    //       "setDate",
    //       new Date(year, inst.selectedMonth, inst.selectedDay)
    //     );
    //     // Hide (close) the picker
    //     // $(this).datepicker('hide');
    //     // // Change ttrigger the on change function
    //     // $(this).trigger('change');
    //   },
    // });

    // $("#dateFrom").val(fromDate);
    // $("#dateTo").val(begunDate);

    // //--------- END OF DATE ---------------//
  };

  templateObject.setDateAs = ( dateFrom = null ) => {
    templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
  };


  templateObject.setReportOptions = async function ( ignoreDate = false, formatDateFrom = new Date(),  formatDateTo = new Date() ) {
    let defaultOptions = templateObject.reportOptions.get();
    if (defaultOptions) {
      defaultOptions.fromDate = formatDateFrom;
      defaultOptions.toDate = formatDateTo;
      defaultOptions.ignoreDate = ignoreDate;
    } else {
      defaultOptions = {
        fromDate: moment().subtract(1, "months").format("YYYY-MM-DD"),
        toDate: moment().format("YYYY-MM-DD"),
        ignoreDate: false
      };
    }
    let begunDate = moment(formatDateTo).format("DD/MM/YYYY");
    templateObject.dateAsAt.set(begunDate);
    $('.edtReportDates').attr('disabled', false)
    if( ignoreDate == true ){
      $('.edtReportDates').attr('disabled', true);
      templateObject.dateAsAt.set("Current Date");
    }
    $("#dateFrom").val(moment(defaultOptions.fromDate).format('DD/MM/YYYY'));
    $("#dateTo").val(moment(defaultOptions.toDate).format('DD/MM/YYYY'));
    await templateObject.reportOptions.set(defaultOptions);
    await templateObject.getStockLocationReportData();
  };


  templateObject.loadReport = async (dateFrom = null, dateTo = null, ignoreDate) => {
    LoadingOverlay.show();
    templateObject.setDateAs( dateFrom );
    // let data = [];
    // if (!localStorage.getItem('VS1StockQuantityLocation_Report')) {
    //   const options = await templateObject.reportOptions.get();
    //   let dateFrom = moment(options.fromDate).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD");
    //   let dateTo = moment(options.toDate).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD");
    //   let ignoreDate = options.ignoreDate || false;
    //   data = await reportService.getStockQuantityLocationReport( dateFrom, dateTo, ignoreDate);
    //   if( data.tstockquantitylocation.length > 0 ){
    //     localStorage.setItem('VS1StockQuantityLocation_Report', JSON.stringify(data)||'');
    //   }
    // }else{
    //   data = JSON.parse(localStorage.getItem('VS1StockQuantityLocation_Report'));
    // }

    let data = await CachedHttp.get(erpObject.TStockQuantityLocation, async () => {
      return await reportService.getStockQuantityLocationReport( dateFrom, dateTo, ignoreDate);
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      validate : (cachedResponse) => {
        return false;
      }
    });

    data = data.response;



    let reportData = [];
    if( data.tstockquantitylocation.length > 0 ){
      for (const item of data.tstockquantitylocation ) {   
        let isExist = reportData.filter((subitem) => {
          if( subitem.DepartmentID == item.DepartmentID ){
              subitem.SubAccounts.push(item)
              return subitem
          }
        });

        if( isExist.length == 0 ){
          reportData.push({
              TotalCost: 0,
              TotalValue: 0,
              SubAccounts: [item],
              ...item
          });
        }
        $(".fullScreenSpin").css("display", "none");
      }       
    }
    let useData = reportData.filter((item) => {
      let TotalCost = 0;
      let TotalValue = 0;
      item.SubAccounts.map((subitem) => {
        TotalCost += subitem.Cost;
        TotalValue += subitem.Value;
      });
      item.TotalCost = TotalCost;
      item.TotalValue = TotalValue;
      return item;
    });    
    templateObject.records.set(useData);
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

  templateObject.initDate();

  templateObject.loadReport(
    GlobalFunctions.convertYearMonthDay($('#dateFrom').val()), 
    GlobalFunctions.convertYearMonthDay($('#dateTo').val()), 
    false
  );
  templateObject.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateFrom').val()) )
});

Template.stockquantitybylocation.events({
  "click .btnRefresh": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    localStorage.setItem("VS1StockQuantityByLocation_Report", "");
    Meteor._reload.reload();
    $(".fullScreenSpin").css("display", "none");
  },
  "click .btnExportReport": function () {
    $(".fullScreenSpin").css("display", "inline-block");
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

    const filename =
      loggedCompany + "- Stock Quantity by Location Report" + ".csv";
    utilityService.exportReportToCsvTable("tableExport", filename, "csv");
    let rows = [];
    $(".fullScreenSpin").css("display", "none");
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

    document.title = "Stock Quantity by Location Report";
    $(".printReport").print({
      title: "Stock Quantity by Location Report | " + loggedCompany,
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
  //   $(".fullScreenSpin").css("display", "inline-block");
  //   localStorage.setItem("VS1StockQuantityLocation_Report", "");
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

  //   templateObject.setReportOptions(false, getDateFrom, getLoadDate);
  // },
  // "click #lastQuarter": function () {
  //   let templateObject = Template.instance();
  //   $(".fullScreenSpin").css("display", "inline-block");
  //   localStorage.setItem("VS1StockQuantityLocation_Report", "");
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
  //   templateObject.setReportOptions(false, getDateFrom, getLoadDate);
  // },
  // "click #last12Months": function () {
  //   let templateObject = Template.instance();
  //   $(".fullScreenSpin").css("display", "inline-block");
  //   localStorage.setItem("VS1StockQuantityLocation_Report", "");
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
  //   templateObject.setReportOptions(false, getDateFrom, getLoadDate);
  // },
  "click #ignoreDate":  (e, templateObject) => {
    //localStorage.setItem("VS1StockQuantityLocation_Report", "");
    // $("#dateFrom").attr("readonly", true);
    // $("#dateTo").attr("readonly", true);
    //templateObject.setReportOptions(true);
    templateObject.loadReport(
      null, 
      null, 
      true
    );
  },

   // CURRENCY MODULE //
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
    },
    ...Datehandler.getDateRangeEvents()
});

Template.stockquantitybylocation.helpers({
  dateAsAt: () => {
    return Template.instance().dateAsAt.get() || "-";
  },
  records: () => {
    return Template.instance().records.get();
  },
  redirectionType(item) {
    return 'productview?id=' + item.PartsId;
    if(item.type === 'PO') {
      return '#';
      
    } else {
      return '#';
      return '#noInfoFound';
    }
  },
  checkZero( value ){
    return ( value == 0 )? '': value;
  },
  formatDate: ( date ) => GlobalFunctions.formatDate(date),
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

  formatPrice( amount){

    let utilityService = new UtilityService();
    if( isNaN( amount ) ){
        amount = ( amount === undefined || amount === null || amount.length === 0 ) ? 0 : amount;
        amount = ( amount )? Number(amount.replace(/[^0-9.-]+/g,"")): 0;
    }
      return utilityService.modifynegativeCurrencyFormat(amount)|| 0.00;
  },
  formatTax( amount){

    if( isNaN( amount ) ){
        amount = ( amount === undefined || amount === null || amount.length === 0 ) ? 0 : amount;
        amount = ( amount )? Number(amount.replace(/[^0-9.-]+/g,"")): 0;
    }
      return amount + "%" || "0.00 %";
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

