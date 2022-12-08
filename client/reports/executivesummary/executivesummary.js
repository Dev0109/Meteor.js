import { ReportService } from "../report-service";
import { SalesBoardService } from "../../js/sales-service";
import 'jQuery.print/jQuery.print.js';
import { UtilityService } from "../../utility-service";
import GlobalFunctions from "../../GlobalFunctions";
import LoadingOverlay from "../../LoadingOverlay";
import { TaxRateService } from "../../settings/settings-service";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import Datehandler from "../../DateHandler";

let defaultCurrencyCode = CountryAbbr; // global variable "AUD"

let reportService = new ReportService();
let utilityService = new UtilityService();
let taxRateService = new TaxRateService();
let salesService = new SalesBoardService();
let initCurrency = Currency;

Template.executivesummaryreport.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.titleDE = new ReactiveVar();
  templateObject.titleMonth1 = new ReactiveVar();
  templateObject.titleMonth2 = new ReactiveVar();

  // Cash Panel
  templateObject.cashReceived1 = new ReactiveVar();
  templateObject.cashSpent1 = new ReactiveVar();
  templateObject.cashSurplus1 = new ReactiveVar();
  templateObject.bankBalance1 = new ReactiveVar();
  templateObject.cashReceived2 = new ReactiveVar();
  templateObject.cashSpent2 = new ReactiveVar();
  templateObject.cashSurplus2 = new ReactiveVar();
  templateObject.bankBalance2 = new ReactiveVar();
  // Profitability Panel
  templateObject.totalSales1 = new ReactiveVar();
  templateObject.grossProfit1 = new ReactiveVar();
  templateObject.totalExpense1 = new ReactiveVar();
  templateObject.nettProfit1 = new ReactiveVar();
  templateObject.totalSales2 = new ReactiveVar();
  templateObject.grossProfit2 = new ReactiveVar();
  templateObject.totalExpense2 = new ReactiveVar();
  templateObject.nettProfit2 = new ReactiveVar();
  // Performance Panel
  templateObject.grossProfitMargin1 = new ReactiveVar();
  templateObject.netProfitMargin1 = new ReactiveVar();
  templateObject.returnOnInvestment1 = new ReactiveVar();
  templateObject.grossProfitMargin2 = new ReactiveVar();
  templateObject.netProfitMargin2 = new ReactiveVar();
  templateObject.returnOnInvestment2 = new ReactiveVar();
  // Balance Sheet Panel
  templateObject.totalAgedReceivables1 = new ReactiveVar();
  templateObject.totalAgedPayables1 = new ReactiveVar();
  templateObject.totalNettAssets1 = new ReactiveVar();
  templateObject.totalAgedReceivables2 = new ReactiveVar();
  templateObject.totalAgedPayables2 = new ReactiveVar();
  templateObject.totalNettAssets2 = new ReactiveVar();
  // Income Panel
  templateObject.totalInvoiceCount1 = new ReactiveVar();
  templateObject.totalInvoiceValue1 = new ReactiveVar();
  templateObject.averageInvoiceValue1 = new ReactiveVar();
  templateObject.totalInvoiceCount2 = new ReactiveVar();
  templateObject.totalInvoiceValue2 = new ReactiveVar();
  templateObject.averageInvoiceValue2 = new ReactiveVar();
  // Position Panel
  templateObject.avgDebtors1 = new ReactiveVar();
  templateObject.avgCreditors1 = new ReactiveVar();
  templateObject.shortTermCash1 = new ReactiveVar();
  templateObject.currentAsset1 = new ReactiveVar();
  templateObject.termAsset1 = new ReactiveVar();
  templateObject.avgDebtors2 = new ReactiveVar();
  templateObject.avgCreditors2 = new ReactiveVar();
  templateObject.shortTermCash2 = new ReactiveVar();
  templateObject.currentAsset2 = new ReactiveVar();
  templateObject.termAsset2 = new ReactiveVar();
  templateObject.titleMonth1 = new ReactiveVar();
  templateObject.titleMonth2 = new ReactiveVar();

  templateObject.dateAsAt = new ReactiveVar();
  templateObject.currencyList = new ReactiveVar([]);
  templateObject.activeCurrencyList = new ReactiveVar([]);
  templateObject.tcurrencyratehistory = new ReactiveVar([]);
  // FxGlobalFunctions.initVars(templateObject);
});

Template.executivesummaryreport.onRendered(() => {
  const templateObject = Template.instance();
  let currentDate = new Date();
  templateObject.initDate = () => {
    Datehandler.initOneMonth();
  };

  templateObject.setDateAs = ( dateFrom = null ) => {
    templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
  };

  templateObject.initDate();

  let varianceRed = "#ff420e";
  let varianceGreen = "#579D1C"; //#1cc88a

  let cashReceived = [0, 0];
  let cashSpent = [0, 0];
  let cashSurplus = [0, 0];
  let bankBalance = [0, 0];

  let totalSales = [0, 0];
  let grossProfit = [0, 0];
  let totalExpense = [0, 0];
  let nettProfit = [0, 0];

  let grossProfitMargin = [0, 0];
  let netProfitMargin = [0, 0];
  let returnOnInvestment = [0, 0];

  let totalAgedReceivables = [0, 0];
  let totalAgedPayables = [0, 0];
  let totalNettAssets = [0, 0];

  let totalInvoiceCount = [0, 0];
  let totalInvoiceValue = [0, 0];
  let averageInvoiceValue = [0, 0];

  let avgDebtors = [0, 0];
  let avgCreditors = [0, 0];
  let shortTermCash = [0, 0];
  let currentAsset = [0, 0];
  let termAsset = [0, 0];

  templateObject.setTitleDE = (yy, mm, dd) => {
    var currentDate = new Date(yy, mm, dd);
    const monSml0 = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var currMonth = monSml0[currentDate.getMonth()] + " " + currentDate.getFullYear();
    templateObject.titleDE.set(currMonth);
  }

  templateObject.setMonthsOnHeader = (yy, mm, dd) => {
    var currentDate = new Date(yy, mm, dd);
    const monSml = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var currMonth1 = "", currMonth2 = "";
    if (currentDate.getMonth() == 0) {
      currMonth1 = monSml[10] + " " + (currentDate.getFullYear() - 1);
      currMonth2 = monSml[11] + " " + (currentDate.getFullYear() - 1);
    } else if (currentDate.getMonth() == 1) {
      currMonth1 = monSml[11] + " " + (currentDate.getFullYear() - 1);
      currMonth2 = monSml[0] + " " + currentDate.getFullYear();
    } else {
      currMonth1 = monSml[currentDate.getMonth() - 2] + " " + currentDate.getFullYear();
      currMonth2 = monSml[currentDate.getMonth() - 1] + " " + currentDate.getFullYear();
    }
    $(".titleMonth1").html(currMonth1);
    $(".titleMonth2").html(currMonth2);
  }

  templateObject.setFieldVariance = function (fieldVal1, fieldVal2, fieldSelector) {
    var fieldVariance = 0;
    if (fieldVal1 == 0 && fieldVal2 == 0) {
      fieldVariance = 0;
    } else if (fieldVal1 == 0) {
      fieldVariance = fieldVal2;
    } else if (fieldVal2 == 0) {
      fieldVariance = (-1) * fieldVal1;
    } else {
      // if (fieldVal2 >= fieldVal1) {
      //   fieldVariance = (fieldVal2 / fieldVal1) * 100;
      // } else {
      //   fieldVariance = (fieldVal1 / fieldVal2) * (-100);
      // }
      if (fieldVal1 > 0 && fieldVal2 > 0) {
        fieldVariance = (fieldVal2 / fieldVal1) * 100;
      }
      if (fieldVal1 > 0 && fieldVal2 < 0) {
        fieldVariance = (Math.abs(fieldVal2) / fieldVal1) * 100;
      }
      if (fieldVal1 < 0 && fieldVal2 > 0) {
        fieldVariance = (Math.abs(fieldVal1) / fieldVal2) * 100;
      }
      if (fieldVal1 < 0 && fieldVal2 < 0) {
        fieldVariance = (fieldVal2 / fieldVal1) * 100;
      }
    }
    if (fieldVariance == 0) {
      $('.' + fieldSelector).css("color", varianceGreen);
    } else if (fieldVariance > 0) {
      $('.' + fieldSelector).css("color", varianceGreen);
      // if (fieldSelector == "spnCashSpentVariance" || fieldSelector == "spnTotalExpenseVariance" || fieldSelector == "spnTotalAgedPayablesVariance")
      //   $('.' + fieldSelector).css("color", varianceRed);
      // else
      //   $('.' + fieldSelector).css("color", varianceGreen);
    } else {
      $('.' + fieldSelector).css("color", varianceRed);
      // if (fieldSelector == "spnCashSpentVariance" || fieldSelector == "spnTotalExpenseVariance" || fieldSelector == "spnTotalAgedPayablesVariance")
      //   $('.' + fieldSelector).css("color", varianceGreen);
      // else
      //   $('.' + fieldSelector).css("color", varianceRed);
    }
    // if (fieldSelector == "spnCashSpentVariance" || fieldSelector == "spnTotalExpenseVariance" || fieldSelector == "spnTotalAgedPayablesVariance") {
    //   fieldVariance = (-1) * fieldVariance;
    // }
    $('.' + fieldSelector).html(fieldVariance.toFixed(2));
  }

  templateObject.getDashboardExecutiveData = async (dateAsOf, dateChanged) => {
    LoadingOverlay.show();
    templateObject.setDateAs( dateAsOf );
    try {
      let data = await reportService.getCardDataReport(dateAsOf);
      if (data.tcarddatareport) {
        let resData = data.tcarddatareport[0];

        cashReceived[0] = parseFloat(resData.Cash_Received1);
        cashReceived[1] = parseFloat(resData.Cash_Received2);
        cashSpent[0] = parseFloat(resData.Cash_Spent1);
        cashSpent[1] = parseFloat(resData.Cash_Spent2);
        cashSurplus[0] = parseFloat(resData.Cash_Surplus1);
        cashSurplus[1] = parseFloat(resData.Cash_Surplus2);
        bankBalance[0] = parseFloat(resData.Cash_Balance1);
        bankBalance[1] = parseFloat(resData.Cash_Balance2);

        totalSales[0] = parseFloat(resData.Prof_Income1);
        totalSales[1] = parseFloat(resData.Prof_Income2);
        grossProfit[0] = parseFloat(resData.Prof_Gross1);
        grossProfit[1] = parseFloat(resData.Prof_Gross2);
        totalExpense[0] = parseFloat(resData.Prof_Expenses1);
        totalExpense[1] = parseFloat(resData.Prof_Expenses2);
        nettProfit[0] = parseFloat(resData.Prof_Net1);
        nettProfit[1] = parseFloat(resData.Prof_Net2);

        grossProfitMargin[0] = parseFloat(resData.Perf_GrossMargin1);
        grossProfitMargin[1] = parseFloat(resData.Perf_GrossMargin2);
        netProfitMargin[0] = parseFloat(resData.Perf_NetMargin1);
        netProfitMargin[1] = parseFloat(resData.Perf_NetMargin2);
        returnOnInvestment[0] = parseFloat(resData.Perf_ROI1);
        returnOnInvestment[1] = parseFloat(resData.Perf_ROI2);

        totalAgedReceivables[0] = parseFloat(resData.Bal_Debtors1);
        totalAgedReceivables[1] = parseFloat(resData.Bal_Debtors2);
        totalAgedPayables[0] = parseFloat(resData.Bal_Creditors1);
        totalAgedPayables[1] = parseFloat(resData.Bal_Creditors2);
        totalNettAssets[0] = parseFloat(resData.Bal_NetAsset1);
        totalNettAssets[1] = parseFloat(resData.Bal_NetAsset2);

        totalInvoiceCount[0] = parseInt(resData.Income_Invoices1);
        totalInvoiceCount[1] = parseInt(resData.Income_Invoices2);
        totalInvoiceValue[0] = parseFloat(resData.Income_Total1);
        totalInvoiceValue[1] = parseFloat(resData.Income_Total2);
        averageInvoiceValue[0] = parseFloat(resData.Income_Average1);
        averageInvoiceValue[1] = parseFloat(resData.Income_Average2);

        avgDebtors[0] = parseInt(resData.Pos_AvgDebtDays1);
        avgDebtors[1] = parseInt(resData.Pos_AvgDebtDays2);
        avgCreditors[0] = parseInt(resData.Pos_AvgCredDays1);
        avgCreditors[1] = parseInt(resData.Pos_AvgCredDays2);
        shortTermCash[0] = parseFloat(resData.Pos_CashForecast1);
        shortTermCash[1] = parseFloat(resData.Pos_CashForecast2);
        currentAsset[0] = parseFloat(resData.Pos_AssetToLiab1);
        currentAsset[1] = parseFloat(resData.Pos_AssetToLiab2);
        termAsset[0] = parseFloat(resData.Sheet_AssetToLiab1);
        termAsset[1] = parseFloat(resData.Sheet_AssetToLiab2);
      }

      templateObject.cashReceived1.set(utilityService.modifynegativeCurrencyFormat(cashReceived[0].toFixed(2)));
      templateObject.cashSpent1.set(utilityService.modifynegativeCurrencyFormat(cashSpent[0].toFixed(2)));
      templateObject.cashSurplus1.set(utilityService.modifynegativeCurrencyFormat(cashSurplus[0].toFixed(2)));
      templateObject.bankBalance1.set(utilityService.modifynegativeCurrencyFormat(bankBalance[0].toFixed(2)));
      templateObject.cashReceived2.set(utilityService.modifynegativeCurrencyFormat(cashReceived[1].toFixed(2)));
      templateObject.cashSpent2.set(utilityService.modifynegativeCurrencyFormat(cashSpent[1].toFixed(2)));
      templateObject.cashSurplus2.set(utilityService.modifynegativeCurrencyFormat(cashSurplus[1].toFixed(2)));
      templateObject.bankBalance2.set(utilityService.modifynegativeCurrencyFormat(bankBalance[1].toFixed(2)));

      templateObject.setFieldVariance(cashReceived[0], cashReceived[1], "spnCashReceivedVariance");
      templateObject.setFieldVariance(cashSpent[0], cashSpent[1], "spnCashSpentVariance");
      templateObject.setFieldVariance(cashSurplus[0], cashSurplus[1], "spnCashSurplusVariance");
      templateObject.setFieldVariance(bankBalance[0], bankBalance[1], "spnBankBalanceVariance");

      templateObject.totalSales1.set(utilityService.modifynegativeCurrencyFormat(totalSales[0].toFixed(2)));
      templateObject.grossProfit1.set(utilityService.modifynegativeCurrencyFormat(grossProfit[0].toFixed(2)));
      templateObject.totalExpense1.set(utilityService.modifynegativeCurrencyFormat(totalExpense[0].toFixed(2)));
      templateObject.nettProfit1.set(utilityService.modifynegativeCurrencyFormat(nettProfit[0].toFixed(2)));
      templateObject.totalSales2.set(utilityService.modifynegativeCurrencyFormat(totalSales[1].toFixed(2)));
      templateObject.grossProfit2.set(utilityService.modifynegativeCurrencyFormat(grossProfit[1].toFixed(2)));
      templateObject.totalExpense2.set(utilityService.modifynegativeCurrencyFormat(totalExpense[1].toFixed(2)));
      templateObject.nettProfit2.set(utilityService.modifynegativeCurrencyFormat(nettProfit[1].toFixed(2)));

      templateObject.setFieldVariance(totalSales[0], totalSales[1], "spnTotalSalesVariance");
      templateObject.setFieldVariance(grossProfit[0], grossProfit[1], "spnGrossProfitVariance");
      templateObject.setFieldVariance(totalExpense[0], totalExpense[1], "spnTotalExpenseVariance");
      templateObject.setFieldVariance(nettProfit[0], nettProfit[1], "spnNettProfitVariance");

      templateObject.grossProfitMargin1.set(utilityService.modifynegativeCurrencyFormat(grossProfitMargin[0].toFixed(2)));
      templateObject.netProfitMargin1.set(utilityService.modifynegativeCurrencyFormat(netProfitMargin[0].toFixed(2)));
      templateObject.returnOnInvestment1.set(returnOnInvestment[0].toFixed(2));
      templateObject.grossProfitMargin2.set(utilityService.modifynegativeCurrencyFormat(grossProfitMargin[1].toFixed(2)));
      templateObject.netProfitMargin2.set(utilityService.modifynegativeCurrencyFormat(netProfitMargin[1].toFixed(2)));
      templateObject.returnOnInvestment2.set(returnOnInvestment[1].toFixed(2));

      templateObject.setFieldVariance(grossProfitMargin[0], grossProfitMargin[1], "spnGrossProfitMarginVariance");
      templateObject.setFieldVariance(netProfitMargin[0], netProfitMargin[1], "spnNetProfitMarginVariance");
      templateObject.setFieldVariance(returnOnInvestment[0], returnOnInvestment[1], "spnReturnInvestVariance");

      templateObject.totalAgedReceivables1.set(utilityService.modifynegativeCurrencyFormat(totalAgedReceivables[0].toFixed(2)));
      templateObject.totalAgedPayables1.set(utilityService.modifynegativeCurrencyFormat(totalAgedPayables[0].toFixed(2)));
      templateObject.totalNettAssets1.set(utilityService.modifynegativeCurrencyFormat(totalNettAssets[0].toFixed(2)));
      templateObject.totalAgedReceivables2.set(utilityService.modifynegativeCurrencyFormat(totalAgedReceivables[1].toFixed(2)));
      templateObject.totalAgedPayables2.set(utilityService.modifynegativeCurrencyFormat(totalAgedPayables[1].toFixed(2)));
      templateObject.totalNettAssets2.set(utilityService.modifynegativeCurrencyFormat(totalNettAssets[1].toFixed(2)));

      templateObject.setFieldVariance(totalAgedReceivables[0], totalAgedReceivables[1], "spnTotalAgedReceivablesVariance");
      templateObject.setFieldVariance(totalAgedPayables[0], totalAgedPayables[1], "spnTotalAgedPayablesVariance");
      templateObject.setFieldVariance(totalNettAssets[0], totalNettAssets[1], "spnTotalNettAssetVariance");

      templateObject.totalInvoiceCount1.set(totalInvoiceCount[0]);
      templateObject.averageInvoiceValue1.set(utilityService.modifynegativeCurrencyFormat(averageInvoiceValue[0].toFixed(2)));
      templateObject.totalInvoiceValue1.set(utilityService.modifynegativeCurrencyFormat(totalInvoiceValue[0].toFixed(2)));
      templateObject.totalInvoiceCount2.set(totalInvoiceCount[1]);
      templateObject.averageInvoiceValue2.set(utilityService.modifynegativeCurrencyFormat(averageInvoiceValue[1].toFixed(2)));
      templateObject.totalInvoiceValue2.set(utilityService.modifynegativeCurrencyFormat(totalInvoiceValue[1].toFixed(2)));

      templateObject.setFieldVariance(totalInvoiceCount[0], totalInvoiceCount[1], "spnTotalInvoiceCountVariance");
      templateObject.setFieldVariance(averageInvoiceValue[0], averageInvoiceValue[1], "spnAverageInvoiceValueVariance");
      templateObject.setFieldVariance(totalInvoiceValue[0], totalInvoiceValue[1], "spnTotalInvoiceValueVariance");

      templateObject.avgDebtors1.set(avgDebtors[0]);
      templateObject.avgCreditors1.set(avgCreditors[0]);
      templateObject.shortTermCash1.set(utilityService.modifynegativeCurrencyFormat(shortTermCash[0].toFixed(2)));
      templateObject.currentAsset1.set(utilityService.modifynegativeCurrencyFormat(currentAsset[0].toFixed(2)));
      templateObject.termAsset1.set(utilityService.modifynegativeCurrencyFormat(termAsset[0].toFixed(2)));
      templateObject.avgDebtors2.set(avgDebtors[1]);
      templateObject.avgCreditors2.set(avgCreditors[1]);
      templateObject.shortTermCash2.set(utilityService.modifynegativeCurrencyFormat(shortTermCash[1].toFixed(2)));
      templateObject.currentAsset2.set(utilityService.modifynegativeCurrencyFormat(currentAsset[1].toFixed(2)));
      templateObject.termAsset2.set(utilityService.modifynegativeCurrencyFormat(termAsset[1].toFixed(2)));

      templateObject.setFieldVariance(avgDebtors[0], avgDebtors[1], "spnAverageDebtorsVariance");
      templateObject.setFieldVariance(avgCreditors[0], avgCreditors[1], "spnAverageCreditorsVariance");
      templateObject.setFieldVariance(shortTermCash[0], shortTermCash[1], "spnShortTermCashVariance");
      templateObject.setFieldVariance(currentAsset[0], currentAsset[1], "spnCurrentAssetVariance");
      templateObject.setFieldVariance(termAsset[0], termAsset[1], "spnTermAssetVariance");
    } catch (err) {

    }
    LoadingOverlay.hide();
  }
  templateObject.setTitleDE(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  templateObject.setMonthsOnHeader(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  templateObject.getDashboardExecutiveData(
    GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
    false
  );
  templateObject.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateFrom').val()) )

});

Template.executivesummaryreport.events({
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
  "click .btnRefresh": function () {
    LoadingOverlay.show();
    localStorage.setItem("VS1BalanceSheet_Report", "");
    Meteor._reload.reload();
    LoadingOverlay.hide();
  },
  "click .btnPrintReport": function (event) {
    playPrintAudio();
    setTimeout(function(){
    $("a").attr("href", "/");
    document.title = "Executive Summary Report";
    $(".printReport").print({
      title: document.title + " | Executive Summary | " + loggedCompany,
      noPrintSelector: ".addSummaryEditor",
      mediaPrint: false,
    });

    setTimeout(function () {
      $("a").attr("href", "#");
    }, 100);
  }, delayTimeAfterSound);
  },
  "click .btnExportReport": function () {
    LoadingOverlay.show();
    let utilityService = new UtilityService();
    let templateObject = Template.instance();
    let balanceDate = new Date($("#balancedate").datepicker("getDate"));

    let formatBalDate =
      balanceDate.getFullYear() +
      "-" +
      (balanceDate.getMonth() + 1) +
      "-" +
      balanceDate.getDate();

    const filename = loggedCompany + "-ExecutiveSummary" + ".csv";
    utilityService.exportReportToCsvTable("tableExport", filename, "csv");
    // let rows = [];
    // reportService.getBalanceSheetReport(formatBalDate).then(function (data) {
    //     if(data.balancesheetreport){
    //         rows[0] = ['Account Tree','Account Number', 'Sub Total', 'Totals'];
    //         data.balancesheetreport.forEach(function (e, i) {
    //             rows.push([data.balancesheetreport[i]['Account Tree'],data.balancesheetreport[i].AccountNumber, utilityService.modifynegativeCurrencyFormat(data.balancesheetreport[i]['Sub Account Total']),utilityService.modifynegativeCurrencyFormat(data.balancesheetreport[i]['Header Account Total'])]);
    //         });
    //         setTimeout(function () {
    //             utilityService.exportReportToCsv(rows, filename, 'xls');
    //             $('.fullScreenSpin').css('display','none');
    //         }, 1000);
    //     }
    //
    // });
    LoadingOverlay.hide();
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
  "click #ignoreDate": function () {
    let templateObject = Template.instance();
    LoadingOverlay.show();
    $("#dateFrom").attr("readonly", true);
    templateObject.getDashboardExecutiveData(null, true);
  },
  "change .edtReportDates": (e) => {
    let templateObject = Template.instance();
    LoadingOverlay.show();
    let balanceDate = $("#dateFrom").val();
    let arrDate = balanceDate.split("/");
    templateObject.setTitleDE(arrDate[2], eval(arrDate[1]) - 1, arrDate[0]);
    templateObject.setMonthsOnHeader(arrDate[2], eval(arrDate[1]) - 1, arrDate[0]);
    templateObject.getDashboardExecutiveData(
      GlobalFunctions.convertYearMonthDay($('#dateFrom').val()), 
      false
    )
  },
  ...Datehandler.getDateRangeEvents(),
  ...FxGlobalFunctions.getEvents(),
});

Template.executivesummaryreport.helpers({
  titleDE: () => {
    return Template.instance().titleDE.get() || '-';
  },
  dateAsAt: () => {
    return Template.instance().dateAsAt.get() || '-';
  },
  titleMonth1: () => {
    return Template.instance().titleMonth1.get();
  },
  titleMonth2: () => {
    return Template.instance().titleMonth2.get();
  },
  cashReceived1: () => {
    return Template.instance().cashReceived1.get() || 0;
  },
  cashSpent1: () => {
    return Template.instance().cashSpent1.get() || 0;
  },
  cashSurplus1: () => {
    return Template.instance().cashSurplus1.get() || 0;
  },
  bankBalance1: () => {
    return Template.instance().bankBalance1.get() || 0;
  },
  cashReceived2: () => {
    return Template.instance().cashReceived2.get() || 0;
  },
  cashSpent2: () => {
    return Template.instance().cashSpent2.get() || 0;
  },
  cashSurplus2: () => {
    return Template.instance().cashSurplus2.get() || 0;
  },
  bankBalance2: () => {
    return Template.instance().bankBalance2.get() || 0;
  },
  totalSales1: () => {
    return Template.instance().totalSales1.get() || 0;
  },
  grossProfit1: () => {
    return Template.instance().grossProfit1.get() || 0;
  },
  totalExpense1: () => {
    return Template.instance().totalExpense1.get() || 0;
  },
  nettProfit1: () => {
    return Template.instance().nettProfit1.get() || 0;
  },
  totalSales2: () => {
    return Template.instance().totalSales2.get() || 0;
  },
  grossProfit2: () => {
    return Template.instance().grossProfit2.get() || 0;
  },
  totalExpense2: () => {
    return Template.instance().totalExpense2.get() || 0;
  },
  nettProfit2: () => {
    return Template.instance().nettProfit2.get() || 0;
  },
  grossProfitMargin1: () => {
    return Template.instance().grossProfitMargin1.get() || 0;
  },
  netProfitMargin1: () => {
    return Template.instance().netProfitMargin1.get() || 0;
  },
  returnOnInvestment1: () => {
    return Template.instance().returnOnInvestment1.get() || 0;
  },
  grossProfitMargin2: () => {
    return Template.instance().grossProfitMargin2.get() || 0;
  },
  netProfitMargin2: () => {
    return Template.instance().netProfitMargin2.get() || 0;
  },
  returnOnInvestment2: () => {
    return Template.instance().returnOnInvestment2.get() || 0;
  },
  totalAgedReceivables1: () => {
    return Template.instance().totalAgedReceivables1.get() || 0;
  },
  totalAgedPayables1: () => {
    return Template.instance().totalAgedPayables1.get() || 0;
  },
  totalNettAssets1: () => {
    return Template.instance().totalNettAssets1.get() || 0;
  },
  totalAgedReceivables2: () => {
    return Template.instance().totalAgedReceivables2.get() || 0;
  },
  totalAgedPayables2: () => {
    return Template.instance().totalAgedPayables2.get() || 0;
  },
  totalNettAssets2: () => {
    return Template.instance().totalNettAssets2.get() || 0;
  },
  totalInvoiceCount1: () => {
    return Template.instance().totalInvoiceCount1.get() || 0;
  },
  averageInvoiceValue1: () => {
    return Template.instance().averageInvoiceValue1.get() || 0;
  },
  totalInvoiceValue1: () => {
    return Template.instance().totalInvoiceValue1.get() || 0;
  },
  totalInvoiceCount2: () => {
    return Template.instance().totalInvoiceCount2.get() || 0;
  },
  averageInvoiceValue2: () => {
    return Template.instance().averageInvoiceValue2.get() || 0;
  },
  totalInvoiceValue2: () => {
    return Template.instance().totalInvoiceValue2.get() || 0;
  },
  avgDebtors1: () => {
    return Template.instance().avgDebtors1.get() || 0;
  },
  avgCreditors1: () => {
    return Template.instance().avgCreditors1.get() || 0;
  },
  shortTermCash1: () => {
    return Template.instance().shortTermCash1.get() || 0;
  },
  currentAsset1: () => {
    return Template.instance().currentAsset1.get() || 0;
  },
  termAsset1: () => {
    return Template.instance().termAsset1.get() || 0;
  },
  avgDebtors2: () => {
    return Template.instance().avgDebtors2.get() || 0;
  },
  avgCreditors2: () => {
    return Template.instance().avgCreditors2.get() || 0;
  },
  shortTermCash2: () => {
    return Template.instance().shortTermCash2.get() || 0;
  },
  currentAsset2: () => {
    return Template.instance().currentAsset2.get() || 0;
  },
  termAsset2: () => {
    return Template.instance().termAsset2.get() || 0;
  },
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
    if (isMinus == true) amount = amount * -1; // Make it positive

    // get default currency symbol
    // let _defaultCurrency = currencyList.filter(
    //   (a) => a.Code == defaultCurrencyCode
    // )[0];

    //amount = amount.replace(_defaultCurrency.symbol, "");

    // amount =
    //   isNaN(amount) == true
    //     ? parseFloat(amount.substring(1))
    //     : parseFloat(amount);

    // Get the selected date
    let dateTo = $("#balancedate").val();
    const day = dateTo.split("/")[0];
    const m = dateTo.split("/")[1];
    const y = dateTo.split("/")[2];
    dateTo = new Date(y, m, day);
    dateTo.setMonth(dateTo.getMonth() - 1); // remove one month (because we added one before)

    // Filter by currency code
    currencyList = currencyList.filter((a) => a.Code == currencyData.code);

    // if(currencyList.length == 0) {
    //   currencyList = Template.instance().currencyList.get();
    //   currencyList = currencyList.filter((a) => a.Code == currencyData.code);
    // }

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
    //amount = amount + 0.36;
    amount = parseFloat(amount * rate); // Multiply by the rate
    amount = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }); // Add commas

    // amount = amount.toLocaleString();

    let convertedAmount =
      isMinus == true ?
        `- ${currencyData.symbol} ${amount}` :
        `${currencyData.symbol} ${amount}`;
    // let convertedAmount =
    //     isMinus == true ?
    //         `- ${amount}` :
    //         `${amount}`;

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
  isObject: (variable) => {
    return typeof variable === "object" && variable !== null;
  },
  currency: () => {
    return Currency;
  },
  companyname: () => {
    return loggedCompany;
  }
});

Template.registerHelper("equal", function (a, b) {
  return a == b;
});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});

Template.registerHelper("notEquals", function (a, b) {
  return a != b;
});

Template.registerHelper("containsequals", function (a, b) {
  let chechTotal = false;
  if (a.toLowerCase().indexOf(b.toLowerCase()) >= 0) {
    chechTotal = true;
  }
  return chechTotal;
});

Template.registerHelper("shortDate", function (a) {
  let dateIn = a;
  let dateOut = moment(dateIn, "DD/MM/YYYY").format("MMM YYYY");
  return dateOut;
});

Template.registerHelper("noDecimal", function (a) {
  let numIn = a;
  // numIn= $(numIn).val().substring(1);
  // numIn= $(numIn).val().replace('$','');

  // numIn= $numIn.text().replace('-','');
  let numOut = parseInt(numIn);
  return numOut;
});
