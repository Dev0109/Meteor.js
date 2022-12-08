import { ReportService } from "../report-service";
import { SalesBoardService } from "../../js/sales-service";
import "jQuery.print/jQuery.print.js";
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

Template.exebalancesheetreport.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.titleMonth1 = new ReactiveVar();
    templateObject.titleMonth2 = new ReactiveVar();

    templateObject.totalAgedReceivables1 = new ReactiveVar();
    templateObject.totalAgedPayables1 = new ReactiveVar();
    templateObject.totalNettAssets1 = new ReactiveVar();
    templateObject.totalAgedReceivables2 = new ReactiveVar();
    templateObject.totalAgedPayables2 = new ReactiveVar();
    templateObject.totalNettAssets2 = new ReactiveVar();

    templateObject.dateAsAt = new ReactiveVar();
    templateObject.currencyList = new ReactiveVar([]);
    templateObject.activeCurrencyList = new ReactiveVar([]);
    templateObject.tcurrencyratehistory = new ReactiveVar([]);
});

Template.exebalancesheetreport.onRendered(() => {
    const templateObject = Template.instance();

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
    templateObject.initDate = () => {
        Datehandler.initOneMonth();
    };

    templateObject.setDateAs = ( dateFrom = null ) => {
        templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
    };

    templateObject.initDate();

    let totalAgedReceivables = [0, 0];
    let totalAgedPayables = [0, 0];
    let totalNettAssets = [0, 0];

    let varianceRed = "#ff420e";
    let varianceGreen = "#579D1C"; //#1cc88a

    templateObject.setFieldVariance = function (fieldVal1, fieldVal2, fieldSelector) {
        var fieldVariance = 0;
        var fieldVariance = 0;
        if (fieldVal1 == 0 && fieldVal2 == 0) {
            fieldVariance = 0;
        } else if (fieldVal1 == 0) {
            fieldVariance = fieldVal2;
        } else if (fieldVal2 == 0) {
            fieldVariance = (-1) * fieldVal1;
        } else {
            // if (fieldVal2 >= fieldVal1) {
            //     fieldVariance = (fieldVal2 / fieldVal1) * 100;
            // } else {
            //     fieldVariance = (fieldVal1 / fieldVal2) * (-100);
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
            // if (fieldSelector == "spnTotalAgedPayablesVariance")
            //     $('.' + fieldSelector).css("color", varianceRed);
            // else
            //     $('.' + fieldSelector).css("color", varianceGreen);
        } else {
            $('.' + fieldSelector).css("color", varianceRed);
            // if (fieldSelector == "spnTotalAgedPayablesVariance")
            //     $('.' + fieldSelector).css("color", varianceGreen);
            // else
            //     $('.' + fieldSelector).css("color", varianceRed);
        }
        // if (fieldSelector == "spnTotalAgedPayablesVariance") {
        //     fieldVariance = (-1) * fieldVariance;
        // }
        $('.' + fieldSelector).html(fieldVariance.toFixed(2));
    }

    templateObject.getBalanceSheetReports = async (dateAsOf, ignoreDate = false) => {
        LoadingOverlay.show();
        templateObject.setDateAs( dateAsOf );
        try {
            let data = await reportService.getCardDataReport(dateAsOf);
            if (data.tcarddatareport) {
                let resData = data.tcarddatareport[0];
                totalAgedReceivables[0] = parseFloat(resData.Bal_Debtors1);
                totalAgedReceivables[1] = parseFloat(resData.Bal_Debtors2);
                totalAgedPayables[0] = parseFloat(resData.Bal_Creditors1);
                totalAgedPayables[1] = parseFloat(resData.Bal_Creditors2);
                totalNettAssets[0] = parseFloat(resData.Bal_NetAsset1);
                totalNettAssets[1] = parseFloat(resData.Bal_NetAsset2);
            }

            templateObject.totalAgedReceivables1.set(utilityService.modifynegativeCurrencyFormat(totalAgedReceivables[0].toFixed(2)));
            templateObject.totalAgedPayables1.set(utilityService.modifynegativeCurrencyFormat(totalAgedPayables[0].toFixed(2)));
            templateObject.totalNettAssets1.set(utilityService.modifynegativeCurrencyFormat(totalNettAssets[0].toFixed(2)));
            templateObject.totalAgedReceivables2.set(utilityService.modifynegativeCurrencyFormat(totalAgedReceivables[1].toFixed(2)));
            templateObject.totalAgedPayables2.set(utilityService.modifynegativeCurrencyFormat(totalAgedPayables[1].toFixed(2)));
            templateObject.totalNettAssets2.set(utilityService.modifynegativeCurrencyFormat(totalNettAssets[1].toFixed(2)));

            templateObject.setFieldVariance(totalAgedReceivables[0], totalAgedReceivables[1], "spnTotalAgedReceivablesVariance");
            templateObject.setFieldVariance(totalAgedPayables[0], totalAgedPayables[1], "spnTotalAgedPayablesVariance");
            templateObject.setFieldVariance(totalNettAssets[0], totalNettAssets[1], "spnTotalNettAssetVariance");
        } catch (err) {

        }
        LoadingOverlay.hide();
    };

    var currentDate = new Date();
    var getLoadDate = moment(currentDate).format("YYYY-MM-DD");
    // var getLoadDate = currentDate.getFullYear() + '-' + ("0" + (currentDate.getMonth() + 1)).slice(-2) + '-' + ("0" + (currentDate.getDate())).slice(-2);
    let pDate = FlowRouter.current().queryParams.viewDate || getLoadDate;
    let strDate = "";
    if (pDate.length == 10)
    strDate = pDate;
    else
    strDate = pDate.substring(1, 11);
    arrDate = strDate.split("-");
    let newbalanceDate = new Date(arrDate[0], eval(arrDate[1]) - 1, arrDate[2]);
    templateObject.setMonthsOnHeader(arrDate[0], eval(arrDate[1]) - 1, arrDate[2]);
    templateObject.getBalanceSheetReports(
        GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
        false
      );
    templateObject.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateFrom').val()) )
});

function sortByAlfa(a, b) {
    return a.currency - b.currency;
}
Template.exebalancesheetreport.helpers({
    titleMonth1: () => {
        return Template.instance().titleMonth1.get();
    },
    titleMonth2: () => {
        return Template.instance().titleMonth2.get();
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
    },
    dateAsAt: () => {
        //var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];;
        //var date = new Date();
        //var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return Template.instance().dateAsAt.get() || "-";
    }
});

Template.exebalancesheetreport.events({
    "click #ignoreDate": function () {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        $("#dateFrom").attr("readonly", true);
        templateObject.getBalanceSheetReports(null, true);
    },
    "change .edtReportDates": (e) => {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        let balanceDate = $("#dateFrom").val();
        let arrDate = balanceDate.split("/");
        templateObject.setMonthsOnHeader(arrDate[2], eval(arrDate[1]) - 1, arrDate[0]);
        localStorage.setItem("VS1BalanceSheet_Report", "");
        templateObject.getBalanceSheetReports(
          GlobalFunctions.convertYearMonthDay($('#dateFrom').val()), 
          false
        )
    },
    ...Datehandler.getDateRangeEvents(),
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
        document.title = "Balance Sheet (Executive) Report";
        $(".printReport").print({
            title: document.title + " | Balance Sheet (Executive) | " + loggedCompany,
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

        const filename = loggedCompany + "-Balance Sheet" + ".csv";
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
    ...FxGlobalFunctions.getEvents(),
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
