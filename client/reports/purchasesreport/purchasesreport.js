import {
    ReportService
} from "../report-service";
import 'jQuery.print/jQuery.print.js';
import { UtilityService } from "../../utility-service";
import { TaxRateService } from "../../settings/settings-service";
import LoadingOverlay from "../../LoadingOverlay";
import GlobalFunctions from "../../GlobalFunctions";
import Datehandler from "../../DateHandler";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";



const reportService = new ReportService();
const utilityService = new UtilityService();
const taxRateService = new TaxRateService();

let defaultCurrencyCode = CountryAbbr;

Template.purchasesreport.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar([]);
    templateObject.grandrecords = new ReactiveVar();
    templateObject.dateAsAt = new ReactiveVar();
    templateObject.deptrecords = new ReactiveVar();


   // Currency related vars //
   templateObject.currencyList = new ReactiveVar([]);
   templateObject.activeCurrencyList = new ReactiveVar([]);
   templateObject.tcurrencyratehistory = new ReactiveVar([]);
});

Template.purchasesreport.onRendered(() => {
    $('.fullScreenSpin').css('display', 'inline-block');
    const templateObject = Template.instance();
    var deptrecords = [];
    templateObject.initDate = () => {
        Datehandler.initOneMonth();
    };

    templateObject.initDate();

    templateObject.setDateAs = ( dateFrom = null ) => {
        templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
    };
    
    let currenctURL = FlowRouter.current().queryParams;
        
    templateObject.getPurchasesReports = function (dateFrom, dateTo, ignoreDate) {
        templateObject.setDateAs(dateFrom);
        LoadingOverlay.show();
        if (!localStorage.getItem('VS1Purchase_Report')) {
        reportService.getPurchasesDetailsData(dateFrom, dateTo, ignoreDate).then(function (data) {
            let totalRecord = [];
            let grandtotalRecord = [];

            if (data.tbillreport.length) {
            localStorage.setItem("VS1Purchase_Report", JSON.stringify(data) || "");
            let records = [];
            let allRecords = [];
            let current = [];

            let totalNetAssets = 0;
            let GrandTotalLiability = 0;
            let GrandTotalAsset = 0;
            let incArr = [];
            let cogsArr = [];
            let expArr = [];
            let accountData = data.tbillreport;
            let accountType = "";
            let purchaseID = "";
            let balance = 0;

            accountData.forEach((account) => {

                if (account.Type == "Bill") {
                    purchaseID = account.PurchaseOrderID;
                }
                balance = account.Type == "Credit" ? account.Balance : account.Balance;

                let recordObj = {
                    Id : account.PurchaseOrderID,
                    type : account.Type,
                    Company : account.Company,
                    entries : account
                };

                if (currenctURL.contact !== undefined && currenctURL.contact !== "undefined") {
                    if (currenctURL.contact.replace(/\s/g, "") == account.Company.replace(/\s/g, "")) {
                        records.push(recordObj);
                    }
                } else {
                    records.push(recordObj);
                }

            });


            // for (let i = 0; i < accountData.length; i++) {
            //     if (data.tbillreport[i].Type == "Bill") {
            //     purchaseID = data.tbillreport[i].PurchaseOrderID;
            //     }
            //     if (data.tbillreport[i].Type == "Credit") {
            //         balance = data.tbillreport[i].Balance;
            //     } else {
            //         balance = data.tbillreport[i].Balance;
            //     }
            //     let recordObj = {};
            //     recordObj.Id = data.tbillreport[i].PurchaseOrderID;
            //     recordObj.type = data.tbillreport[i].Type;
            //     recordObj.Company = data.tbillreport[i].Company;
            //     recordObj.dataArr = [
            //     "", data.tbillreport[i].Type,
            //     data.tbillreport[i].BillNumber,
            //     // moment(data.tbillreport[i].InvoiceDate).format("DD MMM YYYY") || '-',
            //     data.tbillreport[i].OrderDate != ""
            //         ? moment(data.tbillreport[i].OrderDate).format("DD/MM/YYYY")
            //         : data.tbillreport[i].OrderDate,
            //     data.tbillreport[i].Phone || "-",
            //     utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]["Total Amount (Ex)"]) || "0.00",
            //     utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]["Total Tax"]) || "0.00",
            //     utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]["Total Amount (Inc)"]) || "0.00",
            //     utilityService.modifynegativeCurrencyFormat(balance) || "0.00"

            //     //
            //     ];

            //     //   if((data.tbillreport[i].AmountDue != 0) || (data.tbillreport[i].Current != 0)
            //     //   || (data.tbillreport[i]["30Days"] != 0) || (data.tbillreport[i]["60Days"] != 0)
            //     // || (data.tbillreport[i]["90Days"] != 0) || (data.tbillreport[i]["120Days"] != 0)){
            //     //
            //     //   }
            //     if (currenctURL.contact !== undefined && currenctURL.contact !== "undefined") {
            //     if (currenctURL.contact.replace(/\s/g, "") == data.tbillreport[i].Company.replace(/\s/g, "")) {
            //         records.push(recordObj);
            //     }
            //     } else {
            //     records.push(recordObj);
            //     }
            // }

            records = _.sortBy(records, "Company");
            records = _.groupBy(records, "Company");

            for (let key in records) {
                let obj = {
                    title: key,
                    entries: records[key],
                    total: {}
                };
                allRecords.push(obj);
            }


            allRecords.forEach((record) => {
                let totalAmountEx = 0;
                let totalTax = 0;
                let amountInc = 0;
                let balance = 0;
                let twoMonth = 0;
                let threeMonth = 0;
                let Older = 0;

                record.entries.forEach((entry) => {
                    totalAmountEx = totalAmountEx + parseFloat(entry.entries["Total Amount (Ex)"]);
                    totalTax = totalTax + parseFloat(entry.entries["Total Tax"]);
                    amountInc = amountInc + parseFloat(entry.entries["Total Amount (Inc)"]);
                    balance = balance + parseFloat(entry.entries.Balance);
                });

                record.total = {
                    Title: "Total " + record.title,
                    TotalAmountEx: totalAmountEx,
                    TotalTax: totalTax,
                    AmountInc: amountInc,
                    Balance: balance
                };

                current.push(record.total);


            });


            // let iterator = 0;
            // for (let i = 0; i < allRecords.length; i++) {
            //     let totalAmountEx = 0;
            //     let totalTax = 0;
            //     let amountInc = 0;
            //     let balance = 0;
            //     let twoMonth = 0;
            //     let threeMonth = 0;
            //     let Older = 0;
            //     const currencyLength = Currency.length;
            //     for (let k = 0; k < allRecords[i][1].data.length; k++) {
            //     totalAmountEx = totalAmountEx + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
            //     totalTax = totalTax + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
            //     amountInc = amountInc + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
            //     balance = balance + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);
            //     }
            //     let val = [
            //     "Total " + allRecords[i][0].key + "",
            //     "",
            //     "",
            //     "",
            //     "",
            //     utilityService.modifynegativeCurrencyFormat(totalAmountEx),
            //     utilityService.modifynegativeCurrencyFormat(totalTax),
            //     utilityService.modifynegativeCurrencyFormat(amountInc),
            //     utilityService.modifynegativeCurrencyFormat(balance)
            //     ];
            //     current.push(val);
            // }

            //grandtotalRecord
            let grandamountduetotal = 0;
            let grandtotalAmountEx = 0;
            let grandtotalTax = 0;
            let grandamountInc = 0;
            let grandbalance = 0;

            current.forEach((total) => {
                grandtotalAmountEx = grandtotalAmountEx + parseFloat(total.TotalAmountEx);
                grandtotalTax = grandtotalTax + parseFloat(total.TotalTax);
                grandamountInc = grandamountInc + parseFloat(total.AmountInc);
                grandbalance = grandbalance + parseFloat(total.Balance);
            });

            // for (let n = 0; n < current.length; n++) {
            //     const grandcurrencyLength = Currency.length;

            //     grandtotalAmountEx = grandtotalAmountEx + utilityService.convertSubstringParseFloat(current[n][5]);
            //     grandtotalTax = grandtotalTax + utilityService.convertSubstringParseFloat(current[n][6]);
            //     grandamountInc = grandamountInc + utilityService.convertSubstringParseFloat(current[n][7]);
            //     grandbalance = grandbalance + utilityService.convertSubstringParseFloat(current[n][8]);
            // }

            // let grandval = [
            //     "Grand Total " + "",
            //     "",
            //     "",
            //     "",
            //     "",
            //     utilityService.modifynegativeCurrencyFormat(grandtotalAmountEx),
            //     utilityService.modifynegativeCurrencyFormat(grandtotalTax),
            //     utilityService.modifynegativeCurrencyFormat(grandamountInc),
            //     utilityService.modifynegativeCurrencyFormat(grandbalance)
            // ];

            let grandValObj = {
                Title: 'Grand Total ',
                TotalAmountEx: grandtotalAmountEx,
                TotalTax: grandtotalTax,
                AmountInc: grandamountInc,
                Balance: grandbalance
            };

            // for (let key in records) {
            //     let dataArr = current[iterator];
            //     let obj = [
            //     {
            //         key: key
            //     }, {
            //         data: records[key]
            //     }, {
            //         total: [
            //         {
            //             dataArr: dataArr
            //         }
            //         ]
            //     }
            //     ];
            //     totalRecord.push(obj);
            //     iterator += 1;
            // }

            // templateObject.records.set(totalRecord);
            // templateObject.grandrecords.set(grandval);


            templateObject.records.set(allRecords);
            templateObject.grandrecords.set(grandValObj);

            if (templateObject.records.get()) {
                setTimeout(function () {
                $("td a").each(function () {
                    if ($(this).text().indexOf("-" + Currency) >= 0) 
                    $(this).addClass("text-danger");
                    }
                );
                $("td").each(function () {
                    if ($(this).text().indexOf("-" + Currency) >= 0) 
                    $(this).addClass("text-danger");
                    }
                );

                $("td").each(function () {
                    let lineValue = $(this).first().text()[0];
                    if (lineValue != undefined) {
                    if (lineValue.indexOf(Currency) >= 0) 
                        $(this).addClass("text-right");
                    }
                    });

                $("td").each(function () {
                    if ($(this).first().text().indexOf("-" + Currency) >= 0) 
                    $(this).addClass("text-right");
                    }
                );

                $(".fullScreenSpin").css("display", "none");
                }, 100);
            }
            }
        }).catch(function (err) {
            //Bert.alert('<strong>' + err + '</strong>!', 'danger');
            LoadingOverlay.hide();
        });
    } else {
        data = JSON.parse(localStorage.getItem('VS1Purchase_Report'));
        if (data.tbillreport.length) {
            // localStorage.setItem("VS1Purchase_Report", JSON.stringify(data) || "");
            let records = [];
            let allRecords = [];
            let current = [];

            let totalNetAssets = 0;
            let GrandTotalLiability = 0;
            let GrandTotalAsset = 0;
            let incArr = [];
            let cogsArr = [];
            let expArr = [];
            let accountData = data.tbillreport;
            let accountType = "";
            let purchaseID = "";
            let balance = 0;

            accountData.forEach((account) => {

                if (account.Type == "Bill") {
                    purchaseID = account.PurchaseOrderID;
                }
                balance = account.Type == "Credit" ? account.Balance : account.Balance;

                let recordObj = {
                    Id : account.PurchaseOrderID,
                    type : account.Type,
                    Company : account.Company,
                    entries : account
                };

                if (currenctURL.contact !== undefined && currenctURL.contact !== "undefined") {
                    if (currenctURL.contact.replace(/\s/g, "") == account.Company.replace(/\s/g, "")) {
                        records.push(recordObj);
                    }
                } else {
                    records.push(recordObj);
                }

            });


            // for (let i = 0; i < accountData.length; i++) {
            //     if (data.tbillreport[i].Type == "Bill") {
            //     purchaseID = data.tbillreport[i].PurchaseOrderID;
            //     }
            //     if (data.tbillreport[i].Type == "Credit") {
            //         balance = data.tbillreport[i].Balance;
            //     } else {
            //         balance = data.tbillreport[i].Balance;
            //     }
            //     let recordObj = {};
            //     recordObj.Id = data.tbillreport[i].PurchaseOrderID;
            //     recordObj.type = data.tbillreport[i].Type;
            //     recordObj.Company = data.tbillreport[i].Company;
            //     recordObj.dataArr = [
            //     "", data.tbillreport[i].Type,
            //     data.tbillreport[i].BillNumber,
            //     // moment(data.tbillreport[i].InvoiceDate).format("DD MMM YYYY") || '-',
            //     data.tbillreport[i].OrderDate != ""
            //         ? moment(data.tbillreport[i].OrderDate).format("DD/MM/YYYY")
            //         : data.tbillreport[i].OrderDate,
            //     data.tbillreport[i].Phone || "-",
            //     utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]["Total Amount (Ex)"]) || "0.00",
            //     utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]["Total Tax"]) || "0.00",
            //     utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]["Total Amount (Inc)"]) || "0.00",
            //     utilityService.modifynegativeCurrencyFormat(balance) || "0.00"

            //     //
            //     ];

            //     //   if((data.tbillreport[i].AmountDue != 0) || (data.tbillreport[i].Current != 0)
            //     //   || (data.tbillreport[i]["30Days"] != 0) || (data.tbillreport[i]["60Days"] != 0)
            //     // || (data.tbillreport[i]["90Days"] != 0) || (data.tbillreport[i]["120Days"] != 0)){
            //     //
            //     //   }
            //     if (currenctURL.contact !== undefined && currenctURL.contact !== "undefined") {
            //     if (currenctURL.contact.replace(/\s/g, "") == data.tbillreport[i].Company.replace(/\s/g, "")) {
            //         records.push(recordObj);
            //     }
            //     } else {
            //     records.push(recordObj);
            //     }
            // }

            records = _.sortBy(records, "Company");
            records = _.groupBy(records, "Company");

            for (let key in records) {
                let obj = {
                    title: key,
                    entries: records[key],
                    total: {}
                };
                allRecords.push(obj);
            }


            allRecords.forEach((record) => {
                let totalAmountEx = 0;
                let totalTax = 0;
                let amountInc = 0;
                let balance = 0;
                let twoMonth = 0;
                let threeMonth = 0;
                let Older = 0;

                record.entries.forEach((entry) => {
                    totalAmountEx = totalAmountEx + parseFloat(entry.entries["Total Amount (Ex)"]);
                    totalTax = totalTax + parseFloat(entry.entries["Total Tax"]);
                    amountInc = amountInc + parseFloat(entry.entries["Total Amount (Inc)"]);
                    balance = balance + parseFloat(entry.entries.Balance);
                });

                record.total = {
                    Title: "Total " + record.title,
                    TotalAmountEx: totalAmountEx,
                    TotalTax: totalTax,
                    AmountInc: amountInc,
                    Balance: balance
                };

                current.push(record.total);


            });


            // let iterator = 0;
            // for (let i = 0; i < allRecords.length; i++) {
            //     let totalAmountEx = 0;
            //     let totalTax = 0;
            //     let amountInc = 0;
            //     let balance = 0;
            //     let twoMonth = 0;
            //     let threeMonth = 0;
            //     let Older = 0;
            //     const currencyLength = Currency.length;
            //     for (let k = 0; k < allRecords[i][1].data.length; k++) {
            //     totalAmountEx = totalAmountEx + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
            //     totalTax = totalTax + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
            //     amountInc = amountInc + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
            //     balance = balance + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);
            //     }
            //     let val = [
            //     "Total " + allRecords[i][0].key + "",
            //     "",
            //     "",
            //     "",
            //     "",
            //     utilityService.modifynegativeCurrencyFormat(totalAmountEx),
            //     utilityService.modifynegativeCurrencyFormat(totalTax),
            //     utilityService.modifynegativeCurrencyFormat(amountInc),
            //     utilityService.modifynegativeCurrencyFormat(balance)
            //     ];
            //     current.push(val);
            // }

            //grandtotalRecord
            let grandamountduetotal = 0;
            let grandtotalAmountEx = 0;
            let grandtotalTax = 0;
            let grandamountInc = 0;
            let grandbalance = 0;

            current.forEach((total) => {
                grandtotalAmountEx = grandtotalAmountEx + parseFloat(total.TotalAmountEx);
                grandtotalTax = grandtotalTax + parseFloat(total.TotalTax);
                grandamountInc = grandamountInc + parseFloat(total.AmountInc);
                grandbalance = grandbalance + parseFloat(total.Balance);
            });

            // for (let n = 0; n < current.length; n++) {
            //     const grandcurrencyLength = Currency.length;

            //     grandtotalAmountEx = grandtotalAmountEx + utilityService.convertSubstringParseFloat(current[n][5]);
            //     grandtotalTax = grandtotalTax + utilityService.convertSubstringParseFloat(current[n][6]);
            //     grandamountInc = grandamountInc + utilityService.convertSubstringParseFloat(current[n][7]);
            //     grandbalance = grandbalance + utilityService.convertSubstringParseFloat(current[n][8]);
            // }

            // let grandval = [
            //     "Grand Total " + "",
            //     "",
            //     "",
            //     "",
            //     "",
            //     utilityService.modifynegativeCurrencyFormat(grandtotalAmountEx),
            //     utilityService.modifynegativeCurrencyFormat(grandtotalTax),
            //     utilityService.modifynegativeCurrencyFormat(grandamountInc),
            //     utilityService.modifynegativeCurrencyFormat(grandbalance)
            // ];

            let grandValObj = {
                Title: 'Grand Total ',
                TotalAmountEx: grandtotalAmountEx,
                TotalTax: grandtotalTax,
                AmountInc: grandamountInc,
                Balance: grandbalance
            };

            // for (let key in records) {
            //     let dataArr = current[iterator];
            //     let obj = [
            //     {
            //         key: key
            //     }, {
            //         data: records[key]
            //     }, {
            //         total: [
            //         {
            //             dataArr: dataArr
            //         }
            //         ]
            //     }
            //     ];
            //     totalRecord.push(obj);
            //     iterator += 1;
            // }

            // templateObject.records.set(totalRecord);
            // templateObject.grandrecords.set(grandval);


            templateObject.records.set(allRecords);
            templateObject.grandrecords.set(grandValObj);

            if (templateObject.records.get()) {
                setTimeout(function () {
                $("td a").each(function () {
                    if ($(this).text().indexOf("-" + Currency) >= 0) 
                    $(this).addClass("text-danger");
                    }
                );
                $("td").each(function () {
                    if ($(this).text().indexOf("-" + Currency) >= 0) 
                    $(this).addClass("text-danger");
                    }
                );

                $("td").each(function () {
                    let lineValue = $(this).first().text()[0];
                    if (lineValue != undefined) {
                    if (lineValue.indexOf(Currency) >= 0) 
                        $(this).addClass("text-right");
                    }
                    });

                $("td").each(function () {
                    if ($(this).first().text().indexOf("-" + Currency) >= 0) 
                    $(this).addClass("text-right");
                    }
                );

                $(".fullScreenSpin").css("display", "none");
                }, 100);
            }
            }
    }
    };

    var getLoadDate = moment().format("YYYY-MM-DD");
    let getDateFrom =  moment().subtract(1, "months").format("YYYY-MM-DD");
    $("#dateFrom").val(moment(getDateFrom).format('DD/MM/YYYY'));
    $("#dateTo").val(moment(getLoadDate).format('DD/MM/YYYY'));
    templateObject.getPurchasesReports(getDateFrom, getLoadDate, false);

    templateObject.getDepartments = function() {
        reportService.getDepartment().then(function(data) {
            for (let i in data.tdeptclass) {

                let deptrecordObj = {
                    id: data.tdeptclass[i].Id || ' ',
                    department: data.tdeptclass[i].DeptClassName || ' ',
                };

                deptrecords.push(deptrecordObj);
                templateObject.deptrecords.set(deptrecords);

            }
        });

    }

    templateObject.getPurchasesReports(
        GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
        GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
        false
    );
      
    templateObject.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateFrom').val()) )
    
    // templateObject.getAllProductData();
    templateObject.getDepartments();


});

Template.purchasesreport.events({
    'click #btnSummary': function() {
        FlowRouter.go('/purchasesummaryreport');
    },
    // 'change #dateTo': function() {
    //     let templateObject = Template.instance();
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     $('#dateFrom').attr('readonly', false);
    //     $('#dateTo').attr('readonly', false);
    //     templateObject.records.set('');
    //     templateObject.grandrecords.set('');
    //     setTimeout(function(){
    //     var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
    //     var dateTo = new Date($("#dateTo").datepicker("getDate"));

    //     let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
    //     let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

    //     //templateObject.getPurchasesReports(formatDateFrom,formatDateTo,false);
    //     var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
    //     //templateObject.dateAsAt.set(formatDate);
    //     if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {
    //         templateObject.getPurchasesReports('', '', true);
    //         templateObject.dateAsAt.set('Current Date');
    //     } else {
    //         templateObject.getPurchasesReports(formatDateFrom, formatDateTo, false);
    //         templateObject.dateAsAt.set(formatDate);
    //     }
    //     },500);
    // },
    // 'change #dateFrom': function() {
    //     let templateObject = Template.instance();
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     $('#dateFrom').attr('readonly', false);
    //     $('#dateTo').attr('readonly', false);
    //     templateObject.records.set('');
    //     templateObject.grandrecords.set('');
    //     setTimeout(function(){
    //     var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
    //     var dateTo = new Date($("#dateTo").datepicker("getDate"));

    //     let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
    //     let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

    //     //templateObject.getPurchasesReports(formatDateFrom,formatDateTo,false);
    //     var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
    //     //templateObject.dateAsAt.set(formatDate);
    //     if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {
    //         templateObject.getPurchasesReports('', '', true);
    //         templateObject.dateAsAt.set('Current Date');
    //     } else {
    //         templateObject.getPurchasesReports(formatDateFrom, formatDateTo, false);
    //         templateObject.dateAsAt.set(formatDate);
    //     }

    //     },500);
    // },
    'click .btnRefresh': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        localStorage.setItem('VS1Purchase_Report', '');
        Meteor._reload.reload();
    },
    'click td a': function(event) {
        let redirectid = $(event.target).closest('tr').attr('id');

        let transactiontype = $(event.target).closest('tr').attr('class');;

        if (redirectid && transactiontype) {
            if (transactiontype === 'Bill') {
                window.open('/billcard?id=' + redirectid, '_self');
            } else if (transactiontype === 'Purchase Order') {
                window.open('/purchaseordercard?id=' + redirectid, '_self');
            } else if (transactiontype === 'Credit') {
                window.open('/creditcard?id=' + redirectid, '_self');
            } else if (transactiontype === 'Supplier Payment') {
                window.open('/supplierpaymentcard?id=' + redirectid, '_self');
            }
        }
        // window.open('/balancetransactionlist?accountName=' + accountName+ '&toDate=' + toDate + '&fromDate=' + fromDate + '&isTabItem='+false,'_self');
    },
    'click .btnPrintReport': function(event) {
        $('.fullScreenSpin').css('display', 'inline-block')
        playPrintAudio();
        setTimeout(async function(){
            let targetElement = document.getElementsByClassName('printReport')[0]
            targetElement.style.width = "210mm";
            targetElement.style.backgroundColor = "#ffffff";
            targetElement.style.padding = "20px";
            targetElement.style.height = "fit-content";
            targetElement.style.fontSize = "13.33px";
            targetElement.style.color = "#000000";
            targetElement.style.overflowX = "visible";
            let targetTds = $(targetElement).find('.table-responsive #tableExport.table td');
            let targetThs = $(targetElement).find('.table-responsive #tableExport.table th');
            for (let k = 0; k< targetTds.length; k++) {
                $(targetTds[k]).attr('style', 'min-width: 0px !important')
            }
            for (let j = 0; j< targetThs.length; j++) {
                $(targetThs[j]).attr('style', 'min-width: 0px !important')
            }
            let docTitle = "Purchase Report.pdf";

            var opt = {
                margin: 0,
                filename: docTitle,
                image: {
                    type: 'jpeg',
                    quality: 0.98
                },
                html2canvas: {
                    scale: 2
                },
                jsPDF: {
                    unit: 'in',
                    format: 'a4',
                    orientation: 'portrait'
                }
            };
            let source = targetElement;
  
            async function getAttachments () {
              return new Promise(async(resolve, reject)=> {
                html2pdf().set(opt).from(source).toPdf().output('datauristring').then(function(dataObject){
                  let pdfObject = "";
                  let base64data = dataObject.split(',')[1];
                  pdfObject = {
                    filename: docTitle,
                    content: base64data,
                    encoding: 'base64'
                  }
                  let attachments = [];
                  attachments.push(pdfObject);
                  resolve(attachments)
                })
              })
            }

            async function checkBasedOnType() {
                return new Promise(async(resolve, reject)=>{
                    let values = [];
                    let basedOnTypeStorages = Object.keys(localStorage);
                    basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
                        let employeeId = storage.split('_')[2];
                        return storage.includes('BasedOnType_')
                        // return storage.includes('BasedOnType_') && employeeId == Session.get('mySessionEmployeeLoggedID')
                    });
                    let i = basedOnTypeStorages.length;
                    if (i > 0) {
                        while (i--) {
                            values.push(localStorage.getItem(basedOnTypeStorages[i]));
                        }
                    }
                    for(let j = 0; j< values.length; j++) {
                        let value = values[j]
                        let reportData = JSON.parse(value);
                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                        if (reportData.BasedOnType.includes("P")) {
                            if (reportData.FormID == 1) {
                                let formIds = reportData.FormIDs.split(',');
                                if (formIds.includes("70")) {
                                    reportData.FormID = 70;
                                    reportData.attachments = await getAttachments();
                                    Meteor.call('sendNormalEmail', reportData);
                                    resolve()
                                }
                            } else {
                                if (reportData.FormID == 70) {
                                    reportData.attachments = await getAttachments()
                                    Meteor.call('sendNormalEmail', reportData);
                                    resolve()
                                }
                            }
                        }
                        if(j == values.length -1) {resolve()}
                    }
                })
            }

            await checkBasedOnType()
            $('.fullScreenSpin').css('display', 'none')



            document.title = 'Purchase Report';
            $(".printReport").print({
                title: document.title + " | Purchase | " + loggedCompany,
                noPrintSelector: ".addSummaryEditor",
            });

            targetElement.style.width = "100%";
            targetElement.style.backgroundColor = "#ffffff";
            targetElement.style.padding = "0px";
            targetElement.style.fontSize = "1rem";
        }, delayTimeAfterSound);
    },
    'click .btnExportReport': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        let utilityService = new UtilityService();
        let templateObject = Template.instance();
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        const filename = loggedCompany + '-Purchase' + '.csv';
        utilityService.exportReportToCsvTable('tableExport', filename, 'csv');
        let rows = [];
        // reportService.getPurchasesDetailsData(formatDateFrom,formatDateTo,false).then(function (data) {
        //     if(data.tbillreport){
        //         rows[0] = ['Company', 'Type', 'Order No.', 'Order Date', 'Phone', 'Total Amount (Ex)', 'Total Tax', 'Total Amount (Inc)', 'Balance'];
        //         data.tbillreport.forEach(function (e, i) {
        //             rows.push([
        //               data.tbillreport[i].Company,
        //               data.tbillreport[i].Type,
        //               data.tbillreport[i].BillNumber,
        //               data.tbillreport[i].OrderDate !=''? moment(data.tbillreport[i].OrderDate).format("DD/MM/YYYY"): data.tbillreport[i].OrderDate,
        //                data.tbillreport[i].Phone || '-',
        //               utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]["Total Amount (Ex)"]) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]["Total Tax"]) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]["Total Amount (Inc)"]) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.tbillreport[i].Balance) || '0.00']);
        //         });
        //         setTimeout(function () {
        //             utilityService.exportReportToCsv(rows, filename, 'xls');
        //             $('.fullScreenSpin').css('display','none');
        //         }, 1000);
        //     }
        //
        // });
    },
    // 'click #lastMonth': function() {
    //     let templateObject = Template.instance();
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     localStorage.setItem('VS1Purchase_Report', '');
    //     $('#dateFrom').attr('readonly', false);
    //     $('#dateTo').attr('readonly', false);
    //     var currentDate = new Date();

    //     var prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    //     var prevMonthFirstDate = new Date(currentDate.getFullYear() - (currentDate.getMonth() > 0 ? 0 : 1), (currentDate.getMonth() - 1 + 12) % 12, 1);

    //     var formatDateComponent = function(dateComponent) {
    //         return (dateComponent < 10 ? '0' : '') + dateComponent;
    //     };

    //     var formatDate = function(date) {
    //         return formatDateComponent(date.getDate()) + '/' + formatDateComponent(date.getMonth() + 1) + '/' + date.getFullYear();
    //     };

    //     var formatDateERP = function(date) {
    //         return date.getFullYear() + '-' + formatDateComponent(date.getMonth() + 1) + '-' + formatDateComponent(date.getDate());
    //     };


    //     var fromDate = formatDate(prevMonthFirstDate);
    //     var toDate = formatDate(prevMonthLastDate);

    //     $("#dateFrom").val(fromDate);
    //     $("#dateTo").val(toDate);

    //     var getLoadDate = formatDateERP(prevMonthLastDate);
    //     let getDateFrom = formatDateERP(prevMonthFirstDate);
    //     templateObject.dateAsAt.set(fromDate);

    //     templateObject.getPurchasesReports(getDateFrom, getLoadDate, false);

    // },
    // 'click #lastQuarter': function() {
    //     let templateObject = Template.instance();
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     localStorage.setItem('VS1Purchase_Report', '');
    //     $('#dateFrom').attr('readonly', false);
    //     $('#dateTo').attr('readonly', false);
    //     var currentDate = new Date();
    //     var begunDate = moment(currentDate).format("DD/MM/YYYY");

    //     var begunDate = moment(currentDate).format("DD/MM/YYYY");

    //     function getQuarter(d) {
    //         d = d || new Date();
    //         var m = Math.floor(d.getMonth() / 3) + 2;
    //         return m > 4 ? m - 4 : m;
    //     }

    //     var quarterAdjustment = (moment().month() % 3) + 1;
    //     var lastQuarterEndDate = moment().subtract({
    //         months: quarterAdjustment
    //     }).endOf('month');
    //     var lastQuarterStartDate = lastQuarterEndDate.clone().subtract({
    //         months: 2
    //     }).startOf('month');

    //     var lastQuarterStartDateFormat = moment(lastQuarterStartDate).format("DD/MM/YYYY");
    //     var lastQuarterEndDateFormat = moment(lastQuarterEndDate).format("DD/MM/YYYY");

    //     templateObject.dateAsAt.set(lastQuarterStartDateFormat);
    //     $("#dateFrom").val(lastQuarterStartDateFormat);
    //     $("#dateTo").val(lastQuarterEndDateFormat);


    //     let fromDateMonth = getQuarter(currentDate);
    //     var quarterMonth = getQuarter(currentDate);
    //     let fromDateDay = currentDate.getDate();

    //     var getLoadDate = moment(lastQuarterEndDate).format("YYYY-MM-DD");
    //     let getDateFrom = moment(lastQuarterStartDateFormat).format("YYYY-MM-DD");
    //     templateObject.getPurchasesReports(getDateFrom, getLoadDate, false);

    // },
    // 'click #last12Months': function() {
    //     let templateObject = Template.instance();
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     localStorage.setItem('VS1Purchase_Report', '');
    //     $('#dateFrom').attr('readonly', false);
    //     $('#dateTo').attr('readonly', false);
    //     var currentDate = new Date();
    //     var begunDate = moment(currentDate).format("DD/MM/YYYY");

    //     let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
    //     let fromDateDay = currentDate.getDate();
    //     if ((currentDate.getMonth() + 1) < 10) {
    //         fromDateMonth = "0" + (currentDate.getMonth() + 1);
    //     }
    //     if (currentDate.getDate() < 10) {
    //         fromDateDay = "0" + currentDate.getDate();
    //     }

    //     var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + Math.floor(currentDate.getFullYear() - 1);
    //     templateObject.dateAsAt.set(begunDate);
    //     $("#dateFrom").val(fromDate);
    //     $("#dateTo").val(begunDate);

    //     var currentDate2 = new Date();
    //     var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
    //     let getDateFrom = Math.floor(currentDate2.getFullYear() - 1) + "-" + Math.floor(currentDate2.getMonth() + 1) + "-" + currentDate2.getDate();
    //     templateObject.getPurchasesReports(getDateFrom, getLoadDate, false);


    // },
    // 'click #ignoreDate': function() {
    //     let templateObject = Template.instance();
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     localStorage.setItem('VS1Purchase_Report', '');
    //     $('#dateFrom').attr('readonly', true);
    //     $('#dateTo').attr('readonly', true);
    //     templateObject.dateAsAt.set('Current Date');
    //     templateObject.getPurchasesReports('', '', true);

    // },
    "click #ignoreDate":  (e, templateObject) => {
        localStorage.setItem("VS1Purchase_Report", "");
        templateObject.getPurchasesReports(      
          null, 
          null, 
          true
        )
      },
      "change #dateTo, change #dateFrom": (e) => {
        let templateObject = Template.instance();
        localStorage.setItem("VS1Purchase_Report", "");
        templateObject.getPurchasesReports(
          GlobalFunctions.convertYearMonthDay($('#dateFrom').val()), 
          GlobalFunctions.convertYearMonthDay($('#dateTo').val()), 
          false
        )
      },
      ...Datehandler.getDateRangeEvents(),
    'keyup #myInputSearch': function(event) {
        $('.table tbody tr').show();
        let searchItem = $(event.target).val();
        if (searchItem != '') {
            var value = searchItem.toLowerCase();
            $('.table tbody tr').each(function() {
                var found = 'false';
                $(this).each(function() {
                    if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                        found = 'true';
                    }
                });
                if (found == 'true') {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        } else {
            $('.table tbody tr').show();
        }
    },
    'blur #myInputSearch': function(event) {
        $('.table tbody tr').show();
        let searchItem = $(event.target).val();
        if (searchItem != '') {
            var value = searchItem.toLowerCase();
            $('.table tbody tr').each(function() {
                var found = 'false';
                $(this).each(function() {
                    if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                        found = 'true';
                    }
                });
                if (found == 'true') {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        } else {
            $('.table tbody tr').show();
        }
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

});
Template.purchasesreport.helpers({
    records: () => {
        return Template.instance().records.get();
        //   .sort(function(a, b){
        //     if (a.accounttype == 'NA') {
        //   return 1;
        //       }
        //   else if (b.accounttype == 'NA') {
        //     return -1;
        //   }
        // return (a.accounttype.toUpperCase() > b.accounttype.toUpperCase()) ? 1 : -1;
        // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
        // });
    },

    grandrecords: () => {
        return Template.instance().grandrecords.get();
    },
    dateAsAt: () => {
        return Template.instance().dateAsAt.get() || '-';
    },
    companyname: () => {
        return loggedCompany;
    },
    deptrecords: () => {
        return Template.instance().deptrecords.get().sort(function(a, b) {
            if (a.department == 'NA') {
                return 1;
            } else if (b.department == 'NA') {
                return -1;
            }
            return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
        });
    },


    formatPrice( amount , key = null){
        if(key != null) {
            amount = amount[key];
        }
        let utilityService = new UtilityService();
        if( isNaN( amount ) ){
            amount = ( amount === undefined || amount === null || amount.length === 0 ) ? 0 : amount;
            amount = ( amount )? Number(amount.replace(/[^0-9.-]+/g,"")): 0;
        }
          return utilityService.modifynegativeCurrencyFormat(amount)|| 0.00;
      },
      checkZero( value ){
         return ( value == 0 )? '': value;
      },
      formatDate: ( date ) => {
          return ( date )? moment(date).format("DD/MM/YYYY") : '';
      },
    
      // FX Module //
      convertAmount: (amount, currencyData, key = null) => {
        if(key != null) {
            amount = amount[key];
        }
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
Template.registerHelper('equals', function(a, b) {
    return a === b;
});

Template.registerHelper('notEquals', function(a, b) {
    return a != b;
});

Template.registerHelper('containsequals', function(a, b) {
    return (a.indexOf(b) >= 0);
});


