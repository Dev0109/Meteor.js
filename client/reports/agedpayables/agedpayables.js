import {ReportService} from "../report-service";
import 'jQuery.print/jQuery.print.js';
import {UtilityService} from "../../utility-service";
import { SideBarService } from '../../js/sidebar-service';
import '../../lib/global/indexdbstorage.js'
import GlobalFunctions from "../../GlobalFunctions";
import LoadingOverlay from "../../LoadingOverlay";
import { TaxRateService } from "../../settings/settings-service";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import Datehandler from "../../DateHandler";


let sideBarService = new SideBarService();
let reportService = new ReportService();
let utilityService = new UtilityService();
let taxRateService = new TaxRateService();

let defaultCurrencyCode = CountryAbbr;


Template.agedpayables.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar([]);
    templateObject.grandrecords = new ReactiveVar();
    templateObject.dateAsAt = new ReactiveVar();
    templateObject.deptrecords = new ReactiveVar();

    // Currency related vars //
  //  templateObject.currencyList = new ReactiveVar([]);
  //  templateObject.activeCurrencyList = new ReactiveVar([]);
  //  templateObject.tcurrencyratehistory = new ReactiveVar([]);
    FxGlobalFunctions.initVars(templateObject);
    templateObject.reportOptions = new ReactiveVar();
});

Template.agedpayables.onRendered(() => {
    LoadingOverlay.show();
    const templateObject = Template.instance();

    templateObject.initDate = () => {
      Datehandler.initOneMonth();
    };
  
    templateObject.setDateAs = ( dateFrom = null ) => {
      templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
    };

    let currenctURL = FlowRouter.current().queryParams;
    let contactName = FlowRouter.current().queryParams.contact ||'';
    let contactID = FlowRouter.current().queryParams.contactid ||'';
    templateObject.getAgedPayableReports = function (dateFrom, dateTo, ignoreDate) {
       LoadingOverlay.show();
       templateObject.setDateAs( dateFrom );
       if (!localStorage.getItem('VS1AgedPayables_Report')) {
        sideBarService.getTAPReportPage(dateFrom, dateTo, ignoreDate,contactID).then(function (data) {
            let totalRecord = [];
            let grandtotalRecord = [];
            // if(data.Params.IgnoreDates == true){
            //   $('#dateFrom').attr('readonly', true);
            //   $('#dateTo').attr('readonly', true);
            // }else{

            //   $("#dateFrom").val(data.Params.DateFrom !=''? moment(data.Params.DateFrom).format("DD/MM/YYYY"): data.Params.DateFrom);
            //   $("#dateTo").val(data.Params.DateTo !=''? moment(data.Params.DateTo).format("DD/MM/YYYY"): data.Params.DateTo);
            // }
            let allRecords = [];
            if (data.tapreport.length) {
              
                localStorage.setItem('VS1AgedPayables_Report', JSON.stringify(data) || '');
                // localStorage.setItem('VS1AgedPayables_Report', JSON.stringify(data)||'');
                let records = [];
                let current = [];

                let totalNetAssets = 0;
                let GrandTotalLiability = 0;
                let GrandTotalAsset = 0;
                let incArr = [];
                let cogsArr = [];
                let expArr = [];
                let accountData = data.tapreport;
                let accountType = '';

                for (let i = 0; i < accountData.length; i++) {

                    let recordObj = {};
                    recordObj.Id = data.tapreport[i].PurchaseOrderID;
                    recordObj.type = data.tapreport[i].Type;
                    recordObj.SupplierName = data.tapreport[i].Name;
                    
                    // recordObj.dataArr = [
                    //     '',
                    //     data.tapreport[i].Type,
                    //     data.tapreport[i].PurchaseOrderID,
                    //     // moment(data.tapreport[i].InvoiceDate).format("DD MMM YYYY") || '-',
                    //     data.tapreport[i].DueDate != '' ? moment(data.tapreport[i].DueDate).format("DD/MM/YYYY") : data.tapreport[i].DueDate,
                    //     // data.tapreport[i].InvoiceNumber || '-',
                    //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i].AmountDue) || '-',
                    //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i].Current) || '-',
                    //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["30Days"]) || '-',
                    //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["60Days"]) || '-',
                    //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["90Days"]) || '-',
                    //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["120Days"]) || '-',

                    //   
                    // ];

                    recordObj.entries = data.tapreport[i];

                    records.push(recordObj);
                    // if ((data.tapreport[i].AmountDue != 0) || (data.tapreport[i].Current != 0)
                    //      || (data.tapreport[i]["30Days"] != 0) || (data.tapreport[i]["60Days"] != 0)
                    //      || (data.tapreport[i]["90Days"] != 0) || (data.tapreport[i]["120Days"] != 0)) {
                    //     if ((currenctURL.contact !== undefined) && (currenctURL.contact !== "undefined")) {
                    //
                    //         if (currenctURL.contact.replace(/\s/g, '') == data.tapreport[i].Name.replace(/\s/g, '')) {
                    //             records.push(recordObj);
                    //         }
                    //     } else {
                    //         records.push(recordObj);
                    //     }
                    // }

                }
                records = _.sortBy(records, 'SupplierName');
                records = _.groupBy(records, 'SupplierName');

                // i dont understand this...
                for (let key in records) {
                    // let obj = [{
                    //         // key: key,
                    //     }, {
                    //         // data: records[key]
                    //     }
                    // ];

                    let obj = {
                        title: key,
                        entries: records[key],
                        total: {}
                    }
                    allRecords.push(obj);
                }


             
                allRecords.forEach((record) => {
                   
                    let amountduetotal = 0;
                    let Currenttotal = 0;
                    let lessTnMonth = 0;
                    let oneMonth = 0;
                    let twoMonth = 0;
                    let threeMonth = 0;
                    let Older = 0;

                    record.entries.forEach((entry) => {
                        amountduetotal = amountduetotal + parseFloat(entry.entries.AmountDue);
                        Currenttotal = Currenttotal + parseFloat(entry.entries.Current);
                        oneMonth = oneMonth + parseFloat(entry.entries["30Days"]);
                        twoMonth = twoMonth + parseFloat(entry.entries["60Days"]);
                        threeMonth = threeMonth + parseFloat(entry.entries["90Days"]);
                        Older = Older + parseFloat(entry.entries["120Days"]);

                    });

                    record.total = { // new
                        Title: 'Total ' + record.title,
                        TotalAmountDue: amountduetotal,
                        TotalCurrent: Currenttotal,
                        OneMonth: oneMonth,
                        TwoMonth: twoMonth,
                        ThreeMonth: threeMonth,
                        OlderMonth: Older
                    }

                    // Used for grand total later
                    current.push(record.total);

                });
              


                // let iterator = 0;
                // for (let i = 0; i < allRecords.length; i++) {
                //     let amountduetotal = 0;
                //     let Currenttotal = 0;
                //     let lessTnMonth = 0;
                //     let oneMonth = 0;
                //     let twoMonth = 0;
                //     let threeMonth = 0;
                //     let Older = 0;
                //     const currencyLength = Currency.length;
                //     for (let k = 0; k < allRecords[i][1].data.length; k++) {
                //         amountduetotal = amountduetotal + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[4]);
                //         Currenttotal = Currenttotal + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
                //         oneMonth = oneMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
                //         twoMonth = twoMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
                //         threeMonth = threeMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);
                //         Older = Older + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[9]);
                //     }

                //     // wont be used anymore
                //     // let val = ['Total ' + allRecords[i][0].key + '', '', '', '', 
                //     // utilityService.modifynegativeCurrencyFormat(amountduetotal), 
                //     // utilityService.modifynegativeCurrencyFormat(Currenttotal),
                //     //     utilityService.modifynegativeCurrencyFormat(oneMonth), 
                //     //     utilityService.modifynegativeCurrencyFormat(twoMonth), 
                //     //     utilityService.modifynegativeCurrencyFormat(threeMonth), 
                //     //     utilityService.modifynegativeCurrencyFormat(Older)];


                //     //current.push(val); // OLD

                //     current.push({ // new
                //         Title: 'Total ' + allRecords[i][0].key,
                //         TotalAmountDue: amountduetotal,
                //         TotalCurrent: Currenttotal,
                //         OneMonth: oneMonth,
                //         TwoMonth: twoMonth,
                //         ThreeMonth: threeMonth,
                //         OlderMonth: Older
                //     });

                // }



                // grandtotalRecord
                let grandamountduetotal = 0.0;
                let grandCurrenttotal = 0.0;;
                let grandlessTnMonth = 0.0;
                let grandoneMonth = 0.0;
                let grandtwoMonth = 0.0;
                let grandthreeMonth = 0.0;
                let grandOlder = 0.0;

                current.forEach((total) => {
                    grandamountduetotal = grandamountduetotal + parseFloat(total.TotalAmountDue);
                    grandCurrenttotal = grandCurrenttotal + parseFloat(total.TotalCurrent);
                    // grandlessTnMonth = grandlessTnMonth + utilityService.convertSubstringParseFloat(current[n][5]);
                    grandoneMonth = grandoneMonth + parseFloat(total.OneMonth);
                    grandtwoMonth = grandtwoMonth + parseFloat(total.TwoMonth);
                    grandthreeMonth = grandthreeMonth + parseFloat(total.ThreeMonth);
                    grandOlder = grandOlder + parseFloat(total.OlderMonth);
                });

                // for (let n = 0; n < current.length; n++) {

                //     const grandcurrencyLength = Currency.length;

                //     //for (let m = 0; m < current[n].data.length; m++) {
                //     grandamountduetotal = grandamountduetotal + utilityService.convertSubstringParseFloat(current[n][4]);
                //     grandCurrenttotal = grandCurrenttotal + utilityService.convertSubstringParseFloat(current[n][5]);
                //     // grandlessTnMonth = grandlessTnMonth + utilityService.convertSubstringParseFloat(current[n][5]);
                //     grandoneMonth = grandoneMonth + utilityService.convertSubstringParseFloat(current[n][6]);
                //     grandtwoMonth = grandtwoMonth + utilityService.convertSubstringParseFloat(current[n][7]);
                //     grandthreeMonth = grandthreeMonth + utilityService.convertSubstringParseFloat(current[n][8]);
                //     grandOlder = grandOlder + utilityService.convertSubstringParseFloat(current[n][9]);
                //     //}
                //     // let val = ['Total ' + allRecords[i][0].key+'', '', '', '', utilityService.modifynegativeCurrencyFormat(Currenttotal), utilityService.modifynegativeCurrencyFormat(lessTnMonth),
                //     //     utilityService.modifynegativeCurrencyFormat(oneMonth), utilityService.modifynegativeCurrencyFormat(twoMonth), utilityService.modifynegativeCurrencyFormat(threeMonth), utilityService.modifynegativeCurrencyFormat(Older)];
                //     // current.push(val);

                // }

                // old code
                // let grandval = ['Grand Total ' + '', '', '', '',
                //     utilityService.modifynegativeCurrencyFormat(grandamountduetotal),
                //     // utilityService.modifynegativeCurrencyFormat(grandamountduetotal),
                //     utilityService.modifynegativeCurrencyFormat(grandCurrenttotal),
                //     utilityService.modifynegativeCurrencyFormat(grandoneMonth),
                //     utilityService.modifynegativeCurrencyFormat(grandtwoMonth),
                //     utilityService.modifynegativeCurrencyFormat(grandthreeMonth),
                //     utilityService.modifynegativeCurrencyFormat(grandOlder)];

                let grandValObj = {
                    Title: 'Grand Total ',
                    TotalAmountDue: grandamountduetotal,
                    TotalCurrent: grandCurrenttotal,
                    OneMonth: grandoneMonth,
                    TwoMonth: grandtwoMonth,
                    ThreeMonth: grandthreeMonth,
                    OlderMonth: grandOlder
                };

                // i dont understand this
                // for (let key in records) {
                //     let dataArr = current[iterator]
                //         let obj = [{
                //                 key: key
                //             }, {
                //                 data: records[key]
                //             }, {
                //                 total: dataArr
                //             }
                //         ];
                //     totalRecord.push(obj);
                //     iterator += 1;
                // }

                templateObject.records.set(allRecords);
                templateObject.grandrecords.set(grandValObj);
               
                if (templateObject.records.get()) {
                    
                    setTimeout(function () {
                        $('td a').each(function () {
                            if ($(this).text().indexOf('-' + Currency) >= 0)
                                $(this).addClass('text-danger')
                        });
                        $('td').each(function () {
                            if ($(this).text().indexOf('-' + Currency) >= 0)
                                $(this).addClass('text-danger')
                        });

                        $('td').each(function () {

                            let lineValue = $(this).first().text()[0];
                            if (lineValue != undefined) {
                                if (lineValue.indexOf(Currency) >= 0)
                                    $(this).addClass('text-right')
                            }

                        });

                        $('td').each(function () {
                            if ($(this).first().text().indexOf('-' + Currency) >= 0)
                                $(this).addClass('text-right')
                        });

                        $('td:nth-child(4)').each(function () {
                            $(this).addClass('text-right');
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    }, 100);
                }

            }else{
                templateObject.records.set(allRecords);
            } 
            LoadingOverlay.hide();


        }).catch(function (err) {
            //Bert.alert('<strong>' + err + '</strong>!', 'danger');
            LoadingOverlay.hide();
        });
        } else {
            let data = JSON.parse(localStorage.getItem('VS1AgedPayables_Report'));
            let totalRecord = [];
            let grandtotalRecord = [];
            // if(data.Params.IgnoreDates == true){
            //   $('#dateFrom').attr('readonly', true);
            //   $('#dateTo').attr('readonly', true);
            // }else{

            //   $("#dateFrom").val(data.Params.DateFrom !=''? moment(data.Params.DateFrom).format("DD/MM/YYYY"): data.Params.DateFrom);
            //   $("#dateTo").val(data.Params.DateTo !=''? moment(data.Params.DateTo).format("DD/MM/YYYY"): data.Params.DateTo);
            // }
            let allRecords = [];
            if (data.tapreport.length) {
                
                // localStorage.setItem('VS1AgedPayables_Report', JSON.stringify(data)||'');
                let records = [];
                let current = [];

                let totalNetAssets = 0;
                let GrandTotalLiability = 0;
                let GrandTotalAsset = 0;
                let incArr = [];
                let cogsArr = [];
                let expArr = [];
                let accountData = data.tapreport;
                let accountType = '';

                for (let i = 0; i < accountData.length; i++) {

                    let recordObj = {};
                    recordObj.Id = data.tapreport[i].PurchaseOrderID;
                    recordObj.type = data.tapreport[i].Type;
                    recordObj.SupplierName = data.tapreport[i].Name;
                    
                    // recordObj.dataArr = [
                    //     '',
                    //     data.tapreport[i].Type,
                    //     data.tapreport[i].PurchaseOrderID,
                    //     // moment(data.tapreport[i].InvoiceDate).format("DD MMM YYYY") || '-',
                    //     data.tapreport[i].DueDate != '' ? moment(data.tapreport[i].DueDate).format("DD/MM/YYYY") : data.tapreport[i].DueDate,
                    //     // data.tapreport[i].InvoiceNumber || '-',
                    //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i].AmountDue) || '-',
                    //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i].Current) || '-',
                    //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["30Days"]) || '-',
                    //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["60Days"]) || '-',
                    //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["90Days"]) || '-',
                    //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["120Days"]) || '-',

                    //   
                    // ];

                    recordObj.entries = data.tapreport[i];

                    records.push(recordObj);
                    // if ((data.tapreport[i].AmountDue != 0) || (data.tapreport[i].Current != 0)
                    //      || (data.tapreport[i]["30Days"] != 0) || (data.tapreport[i]["60Days"] != 0)
                    //      || (data.tapreport[i]["90Days"] != 0) || (data.tapreport[i]["120Days"] != 0)) {
                    //     if ((currenctURL.contact !== undefined) && (currenctURL.contact !== "undefined")) {
                    //
                    //         if (currenctURL.contact.replace(/\s/g, '') == data.tapreport[i].Name.replace(/\s/g, '')) {
                    //             records.push(recordObj);
                    //         }
                    //     } else {
                    //         records.push(recordObj);
                    //     }
                    // }

                }
                records = _.sortBy(records, 'SupplierName');
                records = _.groupBy(records, 'SupplierName');

                // i dont understand this...
                for (let key in records) {
                    // let obj = [{
                    //         // key: key,
                    //     }, {
                    //         // data: records[key]
                    //     }
                    // ];

                    let obj = {
                        title: key,
                        entries: records[key],
                        total: {}
                    }
                    allRecords.push(obj);
                }


             
                allRecords.forEach((record) => {
                   
                    let amountduetotal = 0;
                    let Currenttotal = 0;
                    let lessTnMonth = 0;
                    let oneMonth = 0;
                    let twoMonth = 0;
                    let threeMonth = 0;
                    let Older = 0;

                    record.entries.forEach((entry) => {
                        amountduetotal = amountduetotal + parseFloat(entry.entries.AmountDue);
                        Currenttotal = Currenttotal + parseFloat(entry.entries.Current);
                        oneMonth = oneMonth + parseFloat(entry.entries["30Days"]);
                        twoMonth = twoMonth + parseFloat(entry.entries["60Days"]);
                        threeMonth = threeMonth + parseFloat(entry.entries["90Days"]);
                        Older = Older + parseFloat(entry.entries["120Days"]);

                    });

                    record.total = { // new
                        Title: 'Total ' + record.title,
                        TotalAmountDue: amountduetotal,
                        TotalCurrent: Currenttotal,
                        OneMonth: oneMonth,
                        TwoMonth: twoMonth,
                        ThreeMonth: threeMonth,
                        OlderMonth: Older
                    }

                    // Used for grand total later
                    current.push(record.total);

                });
              


                // let iterator = 0;
                // for (let i = 0; i < allRecords.length; i++) {
                //     let amountduetotal = 0;
                //     let Currenttotal = 0;
                //     let lessTnMonth = 0;
                //     let oneMonth = 0;
                //     let twoMonth = 0;
                //     let threeMonth = 0;
                //     let Older = 0;
                //     const currencyLength = Currency.length;
                //     for (let k = 0; k < allRecords[i][1].data.length; k++) {
                //         amountduetotal = amountduetotal + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[4]);
                //         Currenttotal = Currenttotal + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
                //         oneMonth = oneMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
                //         twoMonth = twoMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
                //         threeMonth = threeMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);
                //         Older = Older + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[9]);
                //     }

                //     // wont be used anymore
                //     // let val = ['Total ' + allRecords[i][0].key + '', '', '', '', 
                //     // utilityService.modifynegativeCurrencyFormat(amountduetotal), 
                //     // utilityService.modifynegativeCurrencyFormat(Currenttotal),
                //     //     utilityService.modifynegativeCurrencyFormat(oneMonth), 
                //     //     utilityService.modifynegativeCurrencyFormat(twoMonth), 
                //     //     utilityService.modifynegativeCurrencyFormat(threeMonth), 
                //     //     utilityService.modifynegativeCurrencyFormat(Older)];


                //     //current.push(val); // OLD

                //     current.push({ // new
                //         Title: 'Total ' + allRecords[i][0].key,
                //         TotalAmountDue: amountduetotal,
                //         TotalCurrent: Currenttotal,
                //         OneMonth: oneMonth,
                //         TwoMonth: twoMonth,
                //         ThreeMonth: threeMonth,
                //         OlderMonth: Older
                //     });

                // }



                // grandtotalRecord
                let grandamountduetotal = 0.0;
                let grandCurrenttotal = 0.0;;
                let grandlessTnMonth = 0.0;
                let grandoneMonth = 0.0;
                let grandtwoMonth = 0.0;
                let grandthreeMonth = 0.0;
                let grandOlder = 0.0;

                current.forEach((total) => {
                    grandamountduetotal = grandamountduetotal + parseFloat(total.TotalAmountDue);
                    grandCurrenttotal = grandCurrenttotal + parseFloat(total.TotalCurrent);
                    // grandlessTnMonth = grandlessTnMonth + utilityService.convertSubstringParseFloat(current[n][5]);
                    grandoneMonth = grandoneMonth + parseFloat(total.OneMonth);
                    grandtwoMonth = grandtwoMonth + parseFloat(total.TwoMonth);
                    grandthreeMonth = grandthreeMonth + parseFloat(total.ThreeMonth);
                    grandOlder = grandOlder + parseFloat(total.OlderMonth);
                });

                // for (let n = 0; n < current.length; n++) {

                //     const grandcurrencyLength = Currency.length;

                //     //for (let m = 0; m < current[n].data.length; m++) {
                //     grandamountduetotal = grandamountduetotal + utilityService.convertSubstringParseFloat(current[n][4]);
                //     grandCurrenttotal = grandCurrenttotal + utilityService.convertSubstringParseFloat(current[n][5]);
                //     // grandlessTnMonth = grandlessTnMonth + utilityService.convertSubstringParseFloat(current[n][5]);
                //     grandoneMonth = grandoneMonth + utilityService.convertSubstringParseFloat(current[n][6]);
                //     grandtwoMonth = grandtwoMonth + utilityService.convertSubstringParseFloat(current[n][7]);
                //     grandthreeMonth = grandthreeMonth + utilityService.convertSubstringParseFloat(current[n][8]);
                //     grandOlder = grandOlder + utilityService.convertSubstringParseFloat(current[n][9]);
                //     //}
                //     // let val = ['Total ' + allRecords[i][0].key+'', '', '', '', utilityService.modifynegativeCurrencyFormat(Currenttotal), utilityService.modifynegativeCurrencyFormat(lessTnMonth),
                //     //     utilityService.modifynegativeCurrencyFormat(oneMonth), utilityService.modifynegativeCurrencyFormat(twoMonth), utilityService.modifynegativeCurrencyFormat(threeMonth), utilityService.modifynegativeCurrencyFormat(Older)];
                //     // current.push(val);

                // }

                // old code
                // let grandval = ['Grand Total ' + '', '', '', '',
                //     utilityService.modifynegativeCurrencyFormat(grandamountduetotal),
                //     // utilityService.modifynegativeCurrencyFormat(grandamountduetotal),
                //     utilityService.modifynegativeCurrencyFormat(grandCurrenttotal),
                //     utilityService.modifynegativeCurrencyFormat(grandoneMonth),
                //     utilityService.modifynegativeCurrencyFormat(grandtwoMonth),
                //     utilityService.modifynegativeCurrencyFormat(grandthreeMonth),
                //     utilityService.modifynegativeCurrencyFormat(grandOlder)];

                let grandValObj = {
                    Title: 'Grand Total ',
                    TotalAmountDue: grandamountduetotal,
                    TotalCurrent: grandCurrenttotal,
                    OneMonth: grandoneMonth,
                    TwoMonth: grandtwoMonth,
                    ThreeMonth: grandthreeMonth,
                    OlderMonth: grandOlder
                };

                // i dont understand this
                // for (let key in records) {
                //     let dataArr = current[iterator]
                //         let obj = [{
                //                 key: key
                //             }, {
                //                 data: records[key]
                //             }, {
                //                 total: dataArr
                //             }
                //         ];
                //     totalRecord.push(obj);
                //     iterator += 1;
                // }

                templateObject.records.set(allRecords);
                templateObject.grandrecords.set(grandValObj);
               
                if (templateObject.records.get()) {
                    
                    setTimeout(function () {
                        $('td a').each(function () {
                            if ($(this).text().indexOf('-' + Currency) >= 0)
                                $(this).addClass('text-danger')
                        });
                        $('td').each(function () {
                            if ($(this).text().indexOf('-' + Currency) >= 0)
                                $(this).addClass('text-danger')
                        });

                        $('td').each(function () {

                            let lineValue = $(this).first().text()[0];
                            if (lineValue != undefined) {
                                if (lineValue.indexOf(Currency) >= 0)
                                    $(this).addClass('text-right')
                            }

                        });

                        $('td').each(function () {
                            if ($(this).first().text().indexOf('-' + Currency) >= 0)
                                $(this).addClass('text-right')
                        });

                        $('td:nth-child(4)').each(function () {
                            $(this).addClass('text-right');
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    }, 100);
                }

            }else{
                templateObject.records.set(allRecords);
            } 
            LoadingOverlay.hide();
    }
    };


    let url = location.href;
    if (url.indexOf("?dateFrom") > 0) {
        url = new URL(window.location.href);
        var getDateFrom = url.searchParams.get("dateFrom");
        var getLoadDate = url.searchParams.get("dateTo");
        if( typeof getDateFrom === undefined || getDateFrom == "" || getDateFrom === null){
          let currentUrl = FlowRouter.current().queryParams;
          getDateFrom = currentUrl.dateFrom
          getLoadDate = currentUrl.dateTo
        }
        localStorage.setItem('VS1AgedPayables_Report', '');
        Datehandler.domDateToUpdate(getLoadDate);
        Datehandler.domDateFromUpdate(getDateFrom, templateObject);
        templateObject.getAgedPayableReports(
            GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
            GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
            false
          );
    }else{
        templateObject.getAgedPayableReports(
            GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
            GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
            false
        );
    }

    templateObject.getDepartments = function () {
        reportService.getDepartment().then(function (data) {
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
    // templateObject.getAllProductData();
    //templateObject.getDepartments();    
    templateObject.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateFrom').val()) )
    LoadingOverlay.hide();
});

Template.agedpayables.events({
    'click #btnSummary': function() {
        FlowRouter.go('/agedpayablessummary');
    },
    // 'change #dateTo': function () {
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

    //     //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
    //     var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
    //     //templateObject.dateAsAt.set(formatDate);
    //     if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {
    //         templateObject.getAgedPayableReports('', '', true);
    //         templateObject.dateAsAt.set('Current Date');
    //     } else {
    //         templateObject.getAgedPayableReports(formatDateFrom, formatDateTo, false);
    //         templateObject.dateAsAt.set(formatDate);
    //     }
    //     },500);
    // },
    // 'change #dateFrom': function () {
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

    //     //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
    //     var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
    //     //templateObject.dateAsAt.set(formatDate);
    //     if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {
    //         templateObject.getAgedPayableReports('', '', true);
    //         templateObject.dateAsAt.set('Current Date');
    //     } else {
    //         templateObject.getAgedPayableReports(formatDateFrom, formatDateTo, false);
    //         templateObject.dateAsAt.set(formatDate);
    //     }
    //     },500);
    // },
    'click .btnRefresh': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        Meteor._reload.reload();
    },
    'click td a': function (event) {
        let redirectid = $(event.target).closest('tr').attr('id');

        let transactiontype = $(event.target).closest('tr').attr('class'); ;

        if (redirectid && transactiontype) {
            if (transactiontype === 'Bill') {
                window.open('/billcard?id=' + redirectid, '_self');
            } else if (transactiontype === 'PO') {
                window.open('/purchaseordercard?id=' + redirectid, '_self');
            } else if (transactiontype === 'Credit') {
                window.open('/creditcard?id=' + redirectid, '_self');
            } else if (transactiontype === 'Supplier Payment') {
                window.open('/supplierpaymentcard?id=' + redirectid, '_self');
            }
        }
        // window.open('/balancetransactionlist?accountName=' + accountName+ '&toDate=' + toDate + '&fromDate=' + fromDate + '&isTabItem='+false,'_self');
    },
    'click .btnPrintReport': function (event) {
        playPrintAudio();
        setTimeout(function(){
        let values = [];
        let basedOnTypeStorages = Object.keys(localStorage);
        basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
            let employeeId = storage.split('_')[2];
            return storage.includes('BasedOnType_');
            // return storage.includes('BasedOnType_') && employeeId == Session.get('mySessionEmployeeLoggedID')
        });
        let i = basedOnTypeStorages.length;
        if (i > 0) {
            while (i--) {
                values.push(localStorage.getItem(basedOnTypeStorages[i]));
            }
        }
        values.forEach(value => {
            let reportData = JSON.parse(value);
            reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
            if (reportData.BasedOnType.includes("P")) {
                if (reportData.FormID == 1) {
                    let formIds = reportData.FormIDs.split(',');
                    if (formIds.includes("6")) {
                        reportData.FormID = 6;
                        Meteor.call('sendNormalEmail', reportData);
                    }
                } else {
                    if (reportData.FormID == 6)
                        Meteor.call('sendNormalEmail', reportData);
                }
            }
        });

        document.title = 'Aged Payables Report';
        $(".printReport").print({
            title: document.title + " | Aged Payables | " + loggedCompany,
            noPrintSelector: ".addSummaryEditor",
        });
    }, delayTimeAfterSound);
    },
    'click .btnExportReport': function () {
        $('.fullScreenSpin').css('display', 'inline-block');

        let utilityService = new UtilityService();
        let templateObject = Template.instance();
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        const filename = loggedCompany + ' - Aged Payables' + '.csv';
        utilityService.exportReportToCsvTable('tableExport', filename, 'csv');
        let rows = [];
        // reportService.getAgedPayableDetailsData(formatDateFrom,formatDateTo,false).then(function (data) {
        //     if(data.tapreport){
        //         rows[0] = ['Contact','Type', 'PO No.', 'Due Date', 'Amount Due', 'Currenct', '1 - 30 Days', '30 - 60 Days', '60 - 90 Days', '> 90 Days'];
        //         data.tapreport.forEach(function (e, i) {
        //             rows.push([
        //               data.tapreport[i].Name,
        //               data.tapreport[i].Type,
        //               data.tapreport[i].PurchaseOrderID,
        //               data.tapreport[i].DueDate !=''? moment(data.tapreport[i].DueDate).format("DD/MM/YYYY"): data.tapreport[i].DueDate,
        //               utilityService.modifynegativeCurrencyFormat(data.tapreport[i].AmountDue) || '-',
        //               utilityService.modifynegativeCurrencyFormat(data.tapreport[i].Current) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["30Days"]) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["60Days"]) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["90Days"]) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["120Days"]) || '0.00']);
        //         });
        //         setTimeout(function () {
        //
        //             $('.fullScreenSpin').css('display','none');
        //         }, 1000);
        //     }
        //
        // });
    },
    // "change .edtReportDates": async function () {
    //     $(".fullScreenSpin").css("display", "inline-block");
    //     localStorage.setItem('VS1AgedPayables_Report', '');
    //     let templateObject = Template.instance();
    //     var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
    //     var dateTo = new Date($("#dateTo").datepicker("getDate"));
    //     await templateObject.setReportOptions(false, dateFrom, dateTo);
       
    // },
    // "click #lastMonth": async function () {
    //     $(".fullScreenSpin").css("display", "inline-block");
    //     localStorage.setItem('VS1AgedPayables_Report', '');
    //     let templateObject = Template.instance();
    //     let fromDate = moment().subtract(1, "months").startOf("month").format("YYYY-MM-DD");
    //     let endDate = moment().subtract(1, "months").endOf("month").format("YYYY-MM-DD");
    //     await templateObject.setReportOptions(false, fromDate, endDate);
       
    // },
    // "click #lastQuarter": async function () {
    //     $(".fullScreenSpin").css("display", "inline-block");
    //     localStorage.setItem('VS1AgedPayables_Report', '');
    //     let templateObject = Template.instance();
    //     let fromDate = moment().subtract(1, "Q").startOf("Q").format("YYYY-MM-DD");
    //     let endDate = moment().subtract(1, "Q").endOf("Q").format("YYYY-MM-DD");
    //     await templateObject.setReportOptions(false, fromDate, endDate);
       
    // },
    // "click #last12Months": async function () {
    //     $(".fullScreenSpin").css("display", "inline-block");
    //     localStorage.setItem('VS1AgedPayables_Report', '');
    //     let templateObject = Template.instance();
    //     $("#dateFrom").attr("readonly", false);
    //     $("#dateTo").attr("readonly", false);
    //     var currentDate = new Date();
    //     var begunDate = moment(currentDate).format("DD/MM/YYYY");
    
    //     let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
    //     let fromDateDay = currentDate.getDate();
    //     if (currentDate.getMonth() + 1 < 10) {
    //       fromDateMonth = "0" + (currentDate.getMonth() + 1);
    //     }
    //     if (currentDate.getDate() < 10) {
    //       fromDateDay = "0" + currentDate.getDate();
    //     }
    
    //     var fromDate = fromDateDay + "/" + fromDateMonth + "/" + Math.floor(currentDate.getFullYear() - 1);
    //     templateObject.dateAsAt.set(begunDate);
    //     $("#dateFrom").val(fromDate);
    //     $("#dateTo").val(begunDate);
    
    //     var currentDate2 = new Date();
    //     var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
    //     let getDateFrom = Math.floor(currentDate2.getFullYear() - 1) + "-" + Math.floor(currentDate2.getMonth() + 1) + "-" + currentDate2.getDate();
    //     await templateObject.setReportOptions(false, getDateFrom, getLoadDate);
       
    // },
    'keyup #myInputSearch': function (event) {
        $('.table tbody tr').show();
        let searchItem = $(event.target).val();
        if (searchItem != '') {
            var value = searchItem.toLowerCase();
            $('.table tbody tr').each(function () {
                var found = 'false';
                $(this).each(function () {
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
    'blur #myInputSearch': function (event) {
        $('.table tbody tr').show();
        let searchItem = $(event.target).val();
        if (searchItem != '') {
            var value = searchItem.toLowerCase();
            $('.table tbody tr').each(function () {
                var found = 'false';
                $(this).each(function () {
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
    "click #ignoreDate": function () {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        localStorage.setItem("VS1AgedPayables_Report", "");
        $("#dateFrom").attr("readonly", true);
        $("#dateTo").attr("readonly", true);
        templateObject.getAgedPayableReports(null, null, true);
      },
      "change #dateTo, change #dateFrom": (e) => {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        localStorage.setItem("VS1AgedPayables_Report", "");
        templateObject.getAgedPayableReports(
          GlobalFunctions.convertYearMonthDay($('#dateFrom').val()), 
          GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
          false
        )
      },
    ...Datehandler.getDateRangeEvents(),
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
      }
});

Template.agedpayables.helpers({
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
  redirectionType(item) {
    if(item.type === 'PO') {
      return '/purchaseordercard?id=' + item.Id;
    } else if (item.type === 'Supplier Payment') {
      return '/supplierpaymentcard?id=' + item.Id;
    } else if (item.type === 'Bill') {
      return '/billcard?id=' + item.Id;
    } else if (item.type === 'Credit') {
      return '/creditcard?id=' + item.Id;
    } else {
      return '#noInfoFound';
    }
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
    return Template.instance().deptrecords.get().sort(function (a, b) {
      if (a.department == "NA") {
        return 1;
      } else if (b.department == "NA") {
        return -1;
      }
      return a.department.toUpperCase() > b.department.toUpperCase()
        ? 1
        : -1;
    });
  },
  formatPriceWithDays(amountData, days) {
    let amount = amountData[days + 'Days'];
    let utilityService = new UtilityService();
    if (isNaN(amount)) {
      amount = amount === undefined || amount === null || amount.length === 0
        ? 0
        : amount;
      amount = amount
        ? Number(amount.replace(/[^0-9.-]+/g, ""))
        : 0;
    }
    return utilityService.modifynegativeCurrencyFormat(amount) || 0.0;
  },
  formatPrice(amount) {
    let utilityService = new UtilityService();
    if (isNaN(amount)) {
      amount = amount === undefined || amount === null || amount.length === 0
        ? 0
        : amount;
      amount = amount
        ? Number(amount.replace(/[^0-9.-]+/g, ""))
        : 0;
    }
    return utilityService.modifynegativeCurrencyFormat(amount) || 0.0;
  },
  formatDate: ( date ) => {
    return ( date )? moment(date).format("DD/MM/YYYY") : '';
    },
  // FX Module
  convertAmount: (amount = 0.00, currencyData, days = null) => {
    if(days != null) {
        amount = amount[days + 'Days'];
    }
    let currencyList = Template.instance().tcurrencyratehistory.get(); // Get tCurrencyHistory

    if (isNaN(amount)) {
      if (!amount || amount.trim() == "") {
        return '';
      }
      amount = utilityService.convertSubstringParseFloat(amount); // This will remove all currency symbol
    }
    // if (currencyData.code == defaultCurrencyCode) {
    //    default currency
    //   return amount;
    // }

    // Lets remove the minus character
    const isMinus = amount < 0;
    if (isMinus == true) 
      amount = amount * -1; // make it positive for now
    
    //  get default currency symbol
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
    currencyList = currencyList.filter(a => a.Code == currencyData.code);

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

    let rate = currencyData.code == defaultCurrencyCode
      ? 1
      : firstElem.BuyRate; // Must used from tcurrecyhistory

    amount = parseFloat(amount * rate); // Multiply by the rate
    amount = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }); // Add commas

    let convertedAmount = isMinus == true
      ? `- ${currencyData.symbol} ${amount}`
      : `${currencyData.symbol} ${amount}`;

    return convertedAmount;
  },
  count: array => {
    return array.length;
  },
  countActive: array => {
    if (array.length == 0) {
      return 0;
    }
    let activeArray = array.filter(c => c.active == true);
    return activeArray.length;
  },
  currencyList: () => {
    return Template.instance().currencyList.get();
  },
  isNegativeAmount(amount, days = null) {
    if(days != null && days != undefined) {
        amount = amount[days + 'Days'];
    }
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
    let activeArray = array.filter(c => c.active == true);

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
    let activeArray = array.filter(c => c.active == true);

    return activeArray.length > 0;
  },
  isObject(variable) {
    return typeof variable === "object" && variable !== null;
  },
  currency: () => {
    return Currency;
  },
  getDays: (object, number = 30) => {
    return object[number + 'Days'];
  }
});
Template.registerHelper('equals', function (a, b) {
    return a === b;
});

Template.registerHelper('notEquals', function (a, b) {
    return a != b;
});

Template.registerHelper('containsequals', function (a, b) {
    return (a.indexOf(b) >= 0);
});


