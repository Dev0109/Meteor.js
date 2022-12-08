import { ReportService } from "../report-service";
import "jQuery.print/jQuery.print.js";
import { UtilityService } from "../../utility-service";
import LoadingOverlay from "../../LoadingOverlay";
import { TaxRateService } from "../../settings/settings-service";
import GlobalFunctions from "../../GlobalFunctions";
import moment from "moment";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import Datehandler from "../../DateHandler";
let defaultCurrencyCode = CountryAbbr; // global variable "AUD"


let reportService = new ReportService();
let utilityService = new UtilityService();
let taxRateService = new TaxRateService();

Template.generalledger.inheritsHelpersFrom('vs1_report_template');
// Template.generalledger.inheritsEventsFrom('vs1_report_template');
// Template.generalledger.inheritsHooksFrom('vs1_report_template');

Template.generalledger.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.records = new ReactiveVar([]);
  templateObject.grandrecords = new ReactiveVar();
  templateObject.dateAsAt = new ReactiveVar();
  templateObject.deptrecords = new ReactiveVar();

  FxGlobalFunctions.initVars(templateObject);

  templateObject.reportOptions = new ReactiveVar([]);
});

Template.generalledger.onRendered(() => {
  LoadingOverlay.show();
  const templateObject = Template.instance();
  let taxRateService = new TaxRateService();
  let utilityService = new UtilityService();

  // var data = Template.parentData(function (data) {return data instanceof MyDocument;});
  // let salesOrderTable;
  // var splashArray = new Array();
  // var today = moment().format("DD/MM/YYYY");
  // var currentDate = new Date();
  // var begunDate = moment(currentDate).format("DD/MM/YYYY");
  // let fromDateMonth = currentDate.getMonth() + 1;
  // let fromDateDay = currentDate.getDate();
  // if (currentDate.getMonth() + 1 < 10) {
  //   fromDateMonth = "0" + (currentDate.getMonth() + 1);
  // }

  // let imageData = localStorage.getItem("Image");
  // if (imageData) {
  //   $("#uploadedImage").attr("src", imageData);
  //   $("#uploadedImage").attr("width", "50%");
  // }

  // let prevMonth = moment().subtract(1, 'months').format('MM')



  // if (currentDate.getDate() < 10) {
  //   fromDateDay = "0" + currentDate.getDate();
  // }
  // let getDateFrom = currentDate2.getFullYear() + "-" + (currentDate2.getMonth()) + "-" + ;
  // var fromDate =
  //   fromDateDay + "/" + prevMonth + "/" + currentDate.getFullYear();
  const dataTableList = [];
  const deptrecords = [];
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

  templateObject.initDate = () => {
    Datehandler.initOneMonth();
  };

  templateObject.initDate();

  templateObject.setDateAs = ( dateFrom = null ) => {
    templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
  };

  templateObject.getGeneralLedgerReports = function (dateFrom,dateTo,ignoreDate) {

    templateObject.setDateAs(dateFrom);

    if (!localStorage.getItem("VS1GeneralLedger_Report")) {
      LoadingOverlay.show();
      reportService.getGeneralLedgerDetailsData(dateFrom, dateTo, ignoreDate).then(function (data) {
          let totalRecord = [];
          let grandtotalRecord = [];
          if (data.tgeneralledgerreport.length) {
            localStorage.setItem("VS1GeneralLedger_Report",JSON.stringify(data) || "");
            let records = [];
            let allRecords = [];
            let current = [];

            let totalNetAssets = 0;
            let GrandTotalLiability = 0;
            let GrandTotalAsset = 0;
            let incArr = [];
            let cogsArr = [];
            let expArr = [];
            let accountData = data.tgeneralledgerreport;
            let accountType = "";
            for (let i = 0; i < accountData.length; i++) {
              let recordObj = {};
              recordObj.Id = data.tgeneralledgerreport[i].PURCHASEORDERID;
              recordObj.AccountName = data.tgeneralledgerreport[i].ACCOUNTNAME;
              recordObj.paymentId = data.tgeneralledgerreport[i].PAYMENTID;
              recordObj.saleId = data.tgeneralledgerreport[i].SALEID;
              recordObj.type = data.tgeneralledgerreport[i].TYPE;
              recordObj.cheqNumber = data.tgeneralledgerreport[i].CHEQUENUMBER;
              recordObj.dataArr = [
                "",
                data.tgeneralledgerreport[i].ACCOUNTNUMBER,

                // data.tgeneralledgerreport[i].MEMO || "-",
                // moment(data.tgeneralledgerreport[i].DATE).format("DD MMM YYYY") || '-',
                data.tgeneralledgerreport[i].DATE != ""? moment(data.tgeneralledgerreport[i].DATE).format("DD/MM/YYYY"): data.tgeneralledgerreport[i].DATE,
                data.tgeneralledgerreport[i]["CLIENT NAME"],
                data.tgeneralledgerreport[i].TYPE,
                // utilityService.modifynegativeCurrencyFormat(
                //   data.tgeneralledgerreport[i].AMOUNTINC
                // ) || "-",
                // // utilityService.modifynegativeCurrencyFormat(data.tgeneralledgerreport[i].Current) || '-',
                // utilityService.modifynegativeCurrencyFormat(
                //   data.tgeneralledgerreport[i].DEBITSEX
                // ) || "-",
                // utilityService.modifynegativeCurrencyFormat(
                //   data.tgeneralledgerreport[i].CREDITSEX
                // ) || "-",
                // utilityService.modifynegativeCurrencyFormat(data.tgeneralledgerreport[i].Current) || '-',
                {
                  type: "amount",
                  value:utilityService.modifynegativeCurrencyFormat(data.tgeneralledgerreport[i].DEBITSEX) || "-",
                  amount: data.tgeneralledgerreport[i].DEBITSEX || "-",
                },
                {
                  type: "amount",
                  value:utilityService.modifynegativeCurrencyFormat(data.tgeneralledgerreport[i].CREDITSEX) || "-",
                  amount: data.tgeneralledgerreport[i].CREDITSEX || "-",
                },
                {
                  type: "amount",
                  value:utilityService.modifynegativeCurrencyFormat(data.tgeneralledgerreport[i].AMOUNTINC) || "-",
                  amount: data.tgeneralledgerreport[i].AMOUNTINC || "-",
                },
                // utilityService.modifynegativeCurrencyFormat(data.tgeneralledgerreport[i]["60-90Days"]) || '-',
                // utilityService.modifynegativeCurrencyFormat(data.tgeneralledgerreport[i][">90Days"]) || '-',

                //
              ];
              //
              //   if((data.tgeneralledgerreport[i].AmountDue != 0) || (data.tgeneralledgerreport[i].Current != 0)
              //   || (data.tgeneralledgerreport[i]["1-30Days"] != 0) || (data.tgeneralledgerreport[i]["30-60Days"] != 0)
              // || (data.tgeneralledgerreport[i]["60-90Days"] != 0) || (data.tgeneralledgerreport[i][">90Days"] != 0)){
              //
              //   }

              records.push(recordObj);
            }
            records = _.sortBy(records, "AccountName");
            records = _.groupBy(records, "AccountName");

            for (let key in records) {
              let obj = [{ key: key }, { data: records[key] }];
              allRecords.push(obj);
            }

            let iterator = 0;
            for (let i = 0; i < allRecords.length; i++) {
              let amountduetotal = 0;
              let Currenttotal = 0;
              let lessTnMonth = 0;
              let oneMonth = 0;
              let twoMonth = 0;
              let threeMonth = 0;
              let Older = 0;
              const currencyLength = Currency.length;
              for (let k = 0; k < allRecords[i][1].data.length; k++) {
                // amountduetotal = amountduetotal + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[4]);
                Currenttotal = Currenttotal +utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5].value);
                oneMonth = oneMonth +utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6].value);
                twoMonth =twoMonth +utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7].value);
              }
              let val = [
                "Total " + allRecords[i][0].key + "",
                "",
                "",
                "",
                "",
                // "",

                // utilityService.modifynegativeCurrencyFormat(Currenttotal),
                // utilityService.modifynegativeCurrencyFormat(oneMonth),
                // utilityService.modifynegativeCurrencyFormat(twoMonth),
                {type: "amount",value:utilityService.modifynegativeCurrencyFormat(Currenttotal),amount: Currenttotal,},
                {type: "amount",value: utilityService.modifynegativeCurrencyFormat(oneMonth),amount: oneMonth,},
                {type: "amount",value: utilityService.modifynegativeCurrencyFormat(twoMonth),amount: twoMonth,},
              ];
              current.push(val);
            }

            //grandtotalRecord
            let grandamountduetotal = 0;
            let grandCurrenttotal = 0;
            let grandlessTnMonth = 0;
            let grandoneMonth = 0;
            let grandtwoMonth = 0;
            let grandthreeMonth = 0;
            let grandOlder = 0;

            for (let n = 0; n < current.length; n++) {
              const grandcurrencyLength = Currency.length;
              grandtwoMonth =grandtwoMonth +utilityService.convertSubstringParseFloat(current[n][5].value);
              grandthreeMonth =grandthreeMonth +utilityService.convertSubstringParseFloat(current[n][6].value);
              grandOlder =grandOlder +utilityService.convertSubstringParseFloat(current[n][7].value);
            }

            let grandval = [
              "Grand Total " + "",
              "",
              "",
              "",
              "",
              // "",
              // utilityService.modifynegativeCurrencyFormat(grandtwoMonth),
              // utilityService.modifynegativeCurrencyFormat(grandthreeMonth),
              // utilityService.modifynegativeCurrencyFormat(grandOlder),

              {
                type: "amount",
                value:
                  utilityService.modifynegativeCurrencyFormat(grandthreeMonth),
                amount: grandthreeMonth,
              },
              {
                type: "amount",
                value: utilityService.modifynegativeCurrencyFormat(grandOlder),
                amount: grandOlder,
              },
              {
                type: "amount",
                value:
                  utilityService.modifynegativeCurrencyFormat(grandtwoMonth),
                amount: grandtwoMonth,
              },
            ];

            for (let key in records) {
              let dataArr = current[iterator];
              let obj = [
                { key: key },
                { data: records[key] },
                { total: [{ dataArr: dataArr }] },
              ];
              totalRecord.push(obj);
              iterator += 1;
            }

            templateObject.records.set(totalRecord);
            templateObject.grandrecords.set(grandval);

            if (templateObject.records.get()) {
              setTimeout(function () {
                $("td a").each(function () {
                  if (
                    $(this)
                      .text()
                      .indexOf("-" + Currency) >= 0
                  )
                    $(this).addClass("text-danger");
                });
                $("td").each(function () {
                  if (
                    $(this)
                      .text()
                      .indexOf("-" + Currency) >= 0
                  )
                    $(this).addClass("text-danger");
                });

                $("td").each(function () {
                  let lineValue = $(this).first().text()[0];
                  if (lineValue != undefined) {
                    if (lineValue.indexOf(Currency) >= 0)
                      $(this).addClass("text-right");
                  }
                });

                $("td").each(function () {
                  if (
                    $(this)
                      .first()
                      .text()
                      .indexOf("-" + Currency) >= 0
                  )
                    $(this).addClass("text-right");
                });

                $(".fullScreenSpin").css("display", "none");
              }, 100);
            }
          } else {
            let records = [];
            let recordObj = {};
            recordObj.Id = "";
            recordObj.type = "";
            recordObj.AccountName = " ";
            recordObj.dataArr = [
              "-",
              "-",
              "-",
              "-",
              "-",
              "-",
              "-",
              "-",
              "-",
              // "-",
            ];

            records.push(recordObj);
            templateObject.records.set(records);
            templateObject.grandrecords.set("");
          }
          LoadingOverlay.hide();
        }).catch(function (err) {
          LoadingOverlay.hide();
        });
    } else {
      LoadingOverlay.show();
      let data = JSON.parse(localStorage.getItem("VS1GeneralLedger_Report"));
      let totalRecord = [];
      let grandtotalRecord = [];

      if (data.tgeneralledgerreport.length) {
        let records = [];
        let allRecords = [];
        let current = [];

        let totalNetAssets = 0;
        let GrandTotalLiability = 0;
        let GrandTotalAsset = 0;
        let incArr = [];
        let cogsArr = [];
        let expArr = [];
        let accountData = data.tgeneralledgerreport;
        let accountType = "";
        for (let i = 0; i < accountData.length; i++) {
          let recordObj = {};
          recordObj.Id = data.tgeneralledgerreport[i].PURCHASEORDERID;
          recordObj.AccountName = data.tgeneralledgerreport[i].ACCOUNTNAME;
          recordObj.paymentId = data.tgeneralledgerreport[i].PAYMENTID;
          recordObj.saleId = data.tgeneralledgerreport[i].SALEID;
          recordObj.cheqNumber = data.tgeneralledgerreport[i].CHEQUENUMBER;
          recordObj.type = data.tgeneralledgerreport[i].TYPE;

          recordObj.dataArr = [
            "",
            data.tgeneralledgerreport[i].ACCOUNTNUMBER,

            // data.tgeneralledgerreport[i].MEMO || "-",
            // moment(data.tgeneralledgerreport[i].DATE).format("DD MMM YYYY") || '-',
            data.tgeneralledgerreport[i].DATE != ""
            ? moment(data.tgeneralledgerreport[i].DATE).format("DD/MM/YYYY")
            : data.tgeneralledgerreport[i].DATE,
            data.tgeneralledgerreport[i]["CLIENT NAME"],
            data.tgeneralledgerreport[i].TYPE,
            // utilityService.modifynegativeCurrencyFormat(data.tgeneralledgerreport[i].Current) || '-',
            {
              type: "amount",
              value:
                utilityService.modifynegativeCurrencyFormat(
                  data.tgeneralledgerreport[i].DEBITSEX
                ) || "-",
              amount: data.tgeneralledgerreport[i].DEBITSEX || "-",
            },
            {
              type: "amount",
              value:
                utilityService.modifynegativeCurrencyFormat(
                  data.tgeneralledgerreport[i].CREDITSEX
                ) || "-",
              amount: data.tgeneralledgerreport[i].CREDITSEX || "-",
            },
            {
              type: "amount",
              value:
                utilityService.modifynegativeCurrencyFormat(
                  data.tgeneralledgerreport[i].AMOUNTINC
                ) || "-",
              amount: data.tgeneralledgerreport[i].AMOUNTINC || "-",
            },

            // utilityService.modifynegativeCurrencyFormat(data.tgeneralledgerreport[i]["60-90Days"]) || '-',
            // utilityService.modifynegativeCurrencyFormat(data.tgeneralledgerreport[i][">90Days"]) || '-',

            //
          ];
          //
          //   if((data.tgeneralledgerreport[i].AmountDue != 0) || (data.tgeneralledgerreport[i].Current != 0)
          //   || (data.tgeneralledgerreport[i]["1-30Days"] != 0) || (data.tgeneralledgerreport[i]["30-60Days"] != 0)
          // || (data.tgeneralledgerreport[i]["60-90Days"] != 0) || (data.tgeneralledgerreport[i][">90Days"] != 0)){
          //
          //   }

          records.push(recordObj);

        }
        records = _.sortBy(records, "AccountName");
        records = _.groupBy(records, "AccountName");

        for (let key in records) {
          let obj = [{ key: key }, { data: records[key] }];
          allRecords.push(obj);
        }

        let iterator = 0;
        for (let i = 0; i < allRecords.length; i++) {
          let amountduetotal = 0;
          let Currenttotal = 0;
          let lessTnMonth = 0;
          let oneMonth = 0;
          let twoMonth = 0;
          let threeMonth = 0;
          let Older = 0;
          const currencyLength = Currency.length;
          for (let k = 0; k < allRecords[i][1].data.length; k++) {
            // amountduetotal = amountduetotal + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[4]);
            Currenttotal = Currenttotal +utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5].value);
            oneMonth = oneMonth +utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6].value);
            twoMonth =twoMonth +utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7].value);
          }
          let val = [
            "Total " + allRecords[i][0].key + "",
            "",
            "",
            "",
            "",
            // "",

            {
              type: "amount",
              value: utilityService.modifynegativeCurrencyFormat(Currenttotal),
              amount: Currenttotal,
            },
            {
              type: "amount",
              value: utilityService.modifynegativeCurrencyFormat(oneMonth),
              amount: oneMonth,
            },
            {
              type: "amount",
              value: utilityService.modifynegativeCurrencyFormat(twoMonth),
              amount: twoMonth,
            },
          ];
          current.push(val);
        }

        //grandtotalRecord
        let grandamountduetotal = 0;
        let grandCurrenttotal = 0;
        let grandlessTnMonth = 0;
        let grandoneMonth = 0;
        let grandtwoMonth = 0;
        let grandthreeMonth = 0;
        let grandOlder = 0;

        for (let n = 0; n < current.length; n++) {
          const grandcurrencyLength = Currency.length;
          grandtwoMonth =grandtwoMonth +utilityService.convertSubstringParseFloat(current[n][5].value);
          grandthreeMonth =grandthreeMonth +utilityService.convertSubstringParseFloat(current[n][6].value);
          grandOlder =grandOlder +utilityService.convertSubstringParseFloat(current[n][7].value);
        }

        let grandval = [
          "Grand Total " + "",
          "",
          "",
          "",
          "",
          // "",

          {
            type: "amount",
            value: utilityService.modifynegativeCurrencyFormat(grandtwoMonth),
            amount: grandtwoMonth,
          },
          {
            type: "amount",
            value: utilityService.modifynegativeCurrencyFormat(grandthreeMonth),
            amount: grandthreeMonth,
          },
          {
            type: "amount",
            value: utilityService.modifynegativeCurrencyFormat(grandOlder),
            amount: grandOlder,
          },
        ];

        for (let key in records) {
          let dataArr = current[iterator];
          let obj = [
            { key: key },
            { data: records[key] },
            { total: [{ dataArr: dataArr }] },
          ];
          totalRecord.push(obj);
          iterator += 1;
        }


        templateObject.records.set(totalRecord);
        templateObject.grandrecords.set(grandval);

        if (templateObject.records.get()) {
          setTimeout(function () {
            $("td a").each(function () {
              if (
                $(this)
                  .text()
                  .indexOf("-" + Currency) >= 0
              )
                $(this).addClass("text-danger");
            });
            $("td").each(function () {
              if (
                $(this)
                  .text()
                  .indexOf("-" + Currency) >= 0
              )
                $(this).addClass("text-danger");
            });

            $("td").each(function () {
              let lineValue = $(this).first().text()[0];
              if (lineValue != undefined) {
                if (lineValue.indexOf(Currency) >= 0)
                  $(this).addClass("text-right");
              }
            });

            $("td").each(function () {
              if (
                $(this)
                  .first()
                  .text()
                  .indexOf("-" + Currency) >= 0
              )
                $(this).addClass("text-right");
            });

            $(".fullScreenSpin").css("display", "none");
          }, 100);
        }
      } else {
        let records = [];
        let recordObj = {};
        recordObj.Id = "";
        recordObj.type = "";
        recordObj.AccountName = " ";
        recordObj.dataArr = [ "-", "-", "-", "-", "-", "-", "-", "-", "-"];

        records.push(recordObj);
        templateObject.records.set(records);

        $(".fullScreenSpin").css("display", "none");
      templateObject.grandrecords.set("");
      }
      LoadingOverlay.hide();
    }
  };

  templateObject.getGeneralLedgerReports(
    GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
    GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
    false
  );

  templateObject.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateFrom').val()) )

  templateObject.getDepartments = function () {
    reportService.getDepartment().then(function (data) {
      for (let i in data.tdeptclass) {
        let deptrecordObj = {
          id: data.tdeptclass[i].Id || " ",
          department: data.tdeptclass[i].DeptClassName || " ",
        };

        deptrecords.push(deptrecordObj);
        templateObject.deptrecords.set(deptrecords);
      }
    });
  };
  // templateObject.getAllProductData();
  templateObject.getDepartments();

});

Template.generalledger.events({
  "change input[type='checkbox']": (event) => {
    // This should be global
    $(event.currentTarget).attr(
      "checked",
      $(event.currentTarget).prop("checked")
    );
  },
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
  "click td a": async function (event) {
    let id = $(event.target).closest("tr").attr("id").split("item-value-");
    var accountName = id[1].split("_").join(" ");
    let toDate = moment($("#dateTo").val())
      .clone()
      .endOf("month")
      .format("YYYY-MM-DD");
    let fromDate = moment($("#dateFrom").val())
      .clone()
      .startOf("year")
      .format("YYYY-MM-DD");
    //Session.setPersistent('showHeader',true);
    await clearData("TAccountRunningBalanceReport");
    window.open(
      "/balancetransactionlist?accountName=" +
        accountName +
        "&toDate=" +
        toDate +
        "&fromDate=" +
        fromDate +
        "&isTabItem=" +
        false,
      "_self"
    );
  },
  "click #dropdownDateRang": function (e) {
    let dateRangeID = e.target.id;
    $("#btnSltDateRange").addClass("selectedDateRangeBtnMod");
    $("#selectedDateRange").show();
    if (dateRangeID == "thisMonth") {
      document.getElementById("selectedDateRange").value = "This Month";
    } else if (dateRangeID == "thisQuarter") {
      document.getElementById("selectedDateRange").value = "This Quarter";
    } else if (dateRangeID == "thisFinYear") {
      document.getElementById("selectedDateRange").value =
        "This Financial Year";
    } else if (dateRangeID == "lastMonth") {
      document.getElementById("selectedDateRange").value = "Last Month";
    } else if (dateRangeID == "lastQuarter") {
      document.getElementById("selectedDateRange").value = "Last Quarter";
    } else if (dateRangeID == "lastFinYear") {
      document.getElementById("selectedDateRange").value =
        "Last Financial Year";
    } else if (dateRangeID == "monthToDate") {
      document.getElementById("selectedDateRange").value = "Month to Date";
    } else if (dateRangeID == "quarterToDate") {
      document.getElementById("selectedDateRange").value = "Quarter to Date";
    } else if (dateRangeID == "finYearToDate") {
      document.getElementById("selectedDateRange").value = "Year to Date";
    }
  },
  "click #ignoreDate":  (e, templateObject) => {
    localStorage.setItem("VS1GeneralLedger_Report", "");
    templateObject.getGeneralLedgerReports(
      null,
      null,
      true
    )
  },
  "change #dateTo, change #dateFrom": (e) => {
    let templateObject = Template.instance();
    localStorage.setItem("VS1GeneralLedger_Report", "");
    templateObject.getGeneralLedgerReports(
      GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
      GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
      false
    )
  },
  ...Datehandler.getDateRangeEvents(),
  // "change #dateTo": function () {
  //   let templateObject = Template.instance();
  //   $(".fullScreenSpin").css("display", "inline-block");
  //   $("#dateFrom").attr("readonly", false);
  //   $("#dateTo").attr("readonly", false);
  //   templateObject.records.set("");
  //   templateObject.grandrecords.set("");
  //   setTimeout(function () {
  //     var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
  //     var dateTo = new Date($("#dateTo").datepicker("getDate"));

  //     let formatDateFrom =
  //       dateFrom.getFullYear() +
  //       "-" +
  //       (dateFrom.getMonth() + 1) +
  //       "-" +
  //       dateFrom.getDate();
  //     let formatDateTo =
  //       dateTo.getFullYear() +
  //       "-" +
  //       (dateTo.getMonth() + 1) +
  //       "-" +
  //       dateTo.getDate();

  //     //templateObject.getGeneralLedgerReports(formatDateFrom,formatDateTo,false);
  //     var formatDate =
  //       dateTo.getDate() +
  //       "/" +
  //       (dateTo.getMonth() + 1) +
  //       "/" +
  //       dateTo.getFullYear();
  //     //templateObject.dateAsAt.set(formatDate);
  //     if (
  //       $("#dateFrom").val().replace(/\s/g, "") == "" &&
  //       $("#dateFrom").val().replace(/\s/g, "") == ""
  //     ) {
  //       templateObject.getGeneralLedgerReports("", "", true);
  //       templateObject.dateAsAt.set("Current Date");
  //     } else {
  //       templateObject.getGeneralLedgerReports(
  //         formatDateFrom,
  //         formatDateTo,
  //         false
  //       );
  //       templateObject.dateAsAt.set(formatDate);
  //     }
  //   }, 500);
  // },
  // "change #dateFrom": function () {
  //   let templateObject = Template.instance();
  //   $(".fullScreenSpin").css("display", "inline-block");
  //   $("#dateFrom").attr("readonly", false);
  //   $("#dateTo").attr("readonly", false);
  //   templateObject.records.set("");
  //   templateObject.grandrecords.set("");
  //   setTimeout(function () {
  //     var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
  //     var dateTo = new Date($("#dateTo").datepicker("getDate"));

  //     let formatDateFrom =
  //       dateFrom.getFullYear() +
  //       "-" +
  //       (dateFrom.getMonth() + 1) +
  //       "-" +
  //       dateFrom.getDate();
  //     let formatDateTo =
  //       dateTo.getFullYear() +
  //       "-" +
  //       (dateTo.getMonth() + 1) +
  //       "-" +
  //       dateTo.getDate();

  //     //templateObject.getGeneralLedgerReports(formatDateFrom,formatDateTo,false);
  //     var formatDate =
  //       dateTo.getDate() +
  //       "/" +
  //       (dateTo.getMonth() + 1) +
  //       "/" +
  //       dateTo.getFullYear();
  //     //templateObject.dateAsAt.set(formatDate);
  //     if (
  //       $("#dateFrom").val().replace(/\s/g, "") == "" &&
  //       $("#dateFrom").val().replace(/\s/g, "") == ""
  //     ) {
  //       templateObject.getGeneralLedgerReports("", "", true);
  //       templateObject.dateAsAt.set("Current Date");
  //     } else {
  //       templateObject.getGeneralLedgerReports(
  //         formatDateFrom,
  //         formatDateTo,
  //         false
  //       );
  //       templateObject.dateAsAt.set(formatDate);
  //     }
  //   }, 500);
  // },
  "click .btnRefresh": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    localStorage.setItem("VS1GeneralLedger_Report", "");
    Meteor._reload.reload();
  },
  // "click td a": function (event) {
  //   let redirectid = $(event.target).closest("tr").attr("id");

  //   let transactiontype = $(event.target).closest("tr").attr("class");

  //   if (redirectid && transactiontype) {
  //     if (transactiontype === "Bill") {
  //       window.open("/billcard?id=" + redirectid, "_self");
  //     } else if (transactiontype === "PO") {
  //       window.open("/purchaseordercard?id=" + redirectid, "_self");
  //     } else if (transactiontype === "Credit") {
  //       window.open("/creditcard?id=" + redirectid, "_self");
  //     } else if (transactiontype === "Supplier Payment") {
  //       window.open("/supplierpaymentcard?id=" + redirectid, "_self");
  //     }
  //   }
  //   // window.open('/balancetransactionlist?accountName=' + accountName+ '&toDate=' + toDate + '&fromDate=' + fromDate + '&isTabItem='+false,'_self');
  // },
  "click .btnPrintReport": function (event) {
    playPrintAudio();
    setTimeout(function(){
    let values = [];
    let basedOnTypeStorages = Object.keys(localStorage);
    basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
      let employeeId = storage.split("_")[2];
      return (
        // storage.includes("BasedOnType_") && employeeId == Session.get("mySessionEmployeeLoggedID")
        storage.includes("BasedOnType_")
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

    document.title = "General Ledger Report";
    $(".printReport").print({
      title: "General Ledger | " + loggedCompany,
      noPrintSelector: ".addSummaryEditor",
    });
  }, delayTimeAfterSound);
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

    const filename = loggedCompany + "-General Ledger" + ".csv";
    utilityService.exportReportToCsvTable("tblgeneralledger", filename, "csv");
    let rows = [];
    // reportService.getGeneralLedgerDetailsData(formatDateFrom,formatDateTo,false).then(function (data) {
    //     if(data.tgeneralledgerreport){
    //         rows[0] = ['Account Name','Type', 'No.', 'Client Name', 'Memo', 'Amount', 'Debits', 'Credit'];
    //         data.tgeneralledgerreport.forEach(function (e, i) {
    //             rows.push([
    //               data.tgeneralledgerreport[i].ACCOUNTNAME,
    //               data.tgeneralledgerreport[i].TYPE,
    //               data.tgeneralledgerreport[i].ID,
    //               data.tgeneralledgerreport[i]["CLIENT NAME"],
    //               data.tgeneralledgerreport[i].MEMO,
    //               data.tgeneralledgerreport[i].DATE !=''? moment(data.tgeneralledgerreport[i].DATE).format("DD/MM/YYYY"): data.tgeneralledgerreport[i].DATE,
    //               utilityService.modifynegativeCurrencyFormat(data.tgeneralledgerreport[i].AMOUNTINC) || '0.00',
    //               utilityService.modifynegativeCurrencyFormat(data.tgeneralledgerreport[i].DEBITSEX) || '0.00',
    //               utilityService.modifynegativeCurrencyFormat(data.tgeneralledgerreport[i].CREDITSEX) || '0.00']);
    //         });
    //         setTimeout(function () {
    //             utilityService.exportReportToCsv(rows, filename, 'xls');
    //             $('.fullScreenSpin').css('display','none');
    //         }, 1000);
    //     }
    //
    // });
  },
//   "change .edtReportDates": async function () {
//     $(".fullScreenSpin").css("display", "inline-block");
//     localStorage.setItem('VS1GeneralLedger_Report', '');
//     let templateObject = Template.instance();
//     var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
//     var dateTo = new Date($("#dateTo").datepicker("getDate"));
//     await templateObject.setReportOptions(false, dateFrom, dateTo);
// },
//
// "click #ignoreDate": async function () {
//     $(".fullScreenSpin").css("display", "inline-block");
//     $("#dateFrom").attr("readonly", true);
//     $("#dateTo").attr("readonly", true);
//     localStorage.setItem('VS1GeneralLedger_Report', '');
//     let templateObject = Template.instance();
//     templateObject.dateAsAt.set("Current Date");
//     await templateObject.setReportOptions(true);
// },
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
  ...FxGlobalFunctions.getEvents(),
  "click [href='#noInfoFound']": function () {
    swal({
        title: 'Information',
        text: "No further information available on this column",
        type: 'warning',
        confirmButtonText: 'Ok'
      })
  },
});

Template.generalledger.helpers({
  convertAmount: (amount, currencyData) => {
    let currencyList = Template.instance().tcurrencyratehistory.get(); // Get tCurrencyHistory


    if (!amount || amount.trim() == "") {
      return "";
    }
    if (currencyData.code == defaultCurrencyCode) {
      // default currency
      return amount;
    }

    amount = utilityService.convertSubstringParseFloat(amount); // This will remove all currency symbol

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
  redirectionType(item) {
    if(item.type === 'PO') {
      return '/purchaseordercard?id=' + item.Id;
    } else if (item.type === 'Invoice') {
      return '/invoicecard?id=' + item.saleId;
    } else if (item.type === 'Bill') {
      return '/billcard?id=' + item.Id;
    } else if (item.type === 'Cheque') {
      return '/chequecard?id=' + item.Id;
    } else if (item.type === 'Un-Invoiced PO') {
      return '/purchaseordercard?id=' + item.Id;
    } else if (item.type === 'Supplier Payment') {
      return '/supplierpaymentcard?id=' + item.paymentId;
    } else if (item.type === 'Customer Payment') {
      return '/paymentcard?id=' + item.paymentId;
    } else if (item.type === 'Refund') {
      return 'refundcard?id=' + item.saleId;
    } else if (item.type === 'Closing Date Summary') {
      return '#noInfoFound';
    } else if (item.type === 'Stock Transfer') {
      return '#noInfoFound';
    } else if (item.type === 'Stock Adjustment') {
      return '/stockadjustmentcard?id=' + item.paymentId;
    } else if (item.type === 'Fixed Asset Depreciation') {
      return '#noInfoFound';
    }else if (item.type === 'Cash Sale') {
      return '#noInfoFound';
    } else if (item.type === 'Journal Entry') {
      return '#noInfoFound';
    } else if (item.type === 'Payroll Accrued Leave') {
      return '#noInfoFound';
    } else if (item.type === 'Payroll Nett Wages') {
      return '#noInfoFound';
    } else if (item.type === 'Payroll PAYG Tax') {
      return '#noInfoFound';
    } else if (item.type === 'Payroll Superannuation') {
      return '#noInfoFound';
    } else {
      return '#noInfoFound';
    }
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
  records: () => {
    return Template.instance().records.get();
  },

  grandrecords: () => {
    return Template.instance().grandrecords.get();
  },
  dateAsAt: () => {
    return Template.instance().dateAsAt.get() || "-";
  },
  companyname: () => {
    return loggedCompany;
  },
  deptrecords: () => {
    return Template.instance()
      .deptrecords.get()
      // .sort(function (a, b) {
      //   if (a.department == "NA") {
      //     return 1;
      //   } else if (b.department == "NA") {
      //     return -1;
      //   }
      //   return a.department.toUpperCase() > b.department.toUpperCase() ? 1 : -1;
      // });
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
