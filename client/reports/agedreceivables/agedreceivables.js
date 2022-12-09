import {ReportService} from "../report-service";
import 'jQuery.print/jQuery.print.js';
import {UtilityService} from "../../utility-service";
import { TaxRateService } from "../../settings/settings-service";
import LoadingOverlay from "../../LoadingOverlay";
import GlobalFunctions from "../../GlobalFunctions";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import Datehandler from "../../DateHandler";

const reportService = new ReportService();
const utilityService = new UtilityService();
const taxRateService = new TaxRateService();

let defaultCurrencyCode = CountryAbbr;


Template.agedreceivables.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar([]);
    templateObject.grandrecords = new ReactiveVar();
    templateObject.dateAsAt = new ReactiveVar();
    templateObject.deptrecords = new ReactiveVar();


      // Currency related vars //
  FxGlobalFunctions.initVars(templateObject);
});

Template.agedreceivables.onRendered(() => {
    $('.fullScreenSpin').css('display', 'inline-block');
    const deptrecords = [];
    const templateObject = Template.instance();

    templateObject.initDate = () => {
        Datehandler.initOneMonth();
    };
    templateObject.setDateAs = ( dateFrom = null ) => {
        templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
    };
    
    templateObject.initUploadedImage = () => {
        let imageData = localStorage.getItem("Image");
        if (imageData) {
          $("#uploadedImage").attr("src", imageData);
          $("#uploadedImage").attr("width", "50%");
        }
    };

    let currenctURL = FlowRouter.current().queryParams;
    let contactName = FlowRouter.current().queryParams.contact ||'';
    let contactID = FlowRouter.current().queryParams.contactid ||'';

    templateObject.getAgedReceivableReports = async function ( dateFrom, dateTo, ignoreDate ) {
        templateObject.records.set('');
        templateObject.grandrecords.set('');
        //if(FlowRouter.current().queryParams.contact){

        //}else{
            let data = [];
            if (!localStorage.getItem('VS1AgedReceivables_Report')) {
                data = await reportService.getAgedReceivableDetailsData(dateFrom, dateTo, ignoreDate, contactID);
            }else{
                data = JSON.parse(localStorage.getItem('VS1AgedReceivables_Report'));
            }
            let totalRecord = [];
            let grandtotalRecord = [];
            if (data.tarreport.length > 0 ) {
                localStorage.setItem('VS1AgedReceivables_Report', JSON.stringify(data));
                let records = [];
                let allRecords = [];
                let current = [];

                let totalNetAssets = 0;
                let GrandTotalLiability = 0;
                let GrandTotalAsset = 0;
                let incArr = [];
                let cogsArr = [];
                let expArr = [];
                let accountData = data.tarreport;
                let accountType = '';
                accountData.forEach((account) => {

                    if (account.AmountDue < 0) {
                        accountType = "Refund";
                    } else {
                        accountType = account.Type || '';
                    }

                    let recordObj = {
                        Id: account.SaleID,
                        type: accountType, 
                        SupplierName: account.Name,
                        entries: account
                    };

                    if (
                        (account.AmountDue != 0) 
                        || (daccount.Current != 0)
                        || (account["1-30Days"] != 0) 
                        || (account["30-60Days"] != 0)
                        || (account["60-90Days"] != 0) 
                        || (account[">90Days"] != 0)
                        ) {
                        if ((currenctURL.contact !== undefined) && (currenctURL.contact !== "undefined")) {

                            if (currenctURL.contact.replace(/\s/g, '') == account.Name.replace(/\s/g, '')) {
                                records.push(recordObj);
                            }
                        } else {
                            records.push(recordObj);
                        }

                    }
                    
                    

                });

            // for (let i = 0; i < accountData.length; i++) {

            //     if (data.tarreport[i].AmountDue < 0) {
            //         accountType = "Refund";
            //     } else {
            //         accountType = data.tarreport[i].Type || '';
            //     }
            //     let recordObj = {};
            //     recordObj.Id = data.tarreport[i].SaleID;
            //     recordObj.type = accountType;
            //     recordObj.SupplierName = data.tarreport[i].Name;
            //     recordObj.dataArr = [
            //         '',
            //         accountType,
            //         data.tarreport[i].InvoiceNumber,
            //         // moment(data.tarreport[i].InvoiceDate).format("DD MMM YYYY") || '-',
            //         data.tarreport[i].DueDate != '' ? moment(data.tarreport[i].DueDate).format("DD/MM/YYYY") : data.tarreport[i].DueDate,
            //         // data.tarreport[i].InvoiceNumber || '-',
            //         utilityService.modifynegativeCurrencyFormat(data.tarreport[i].AmountDue) || '-',
            //         utilityService.modifynegativeCurrencyFormat(data.tarreport[i].Current) || '-',
            //         utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["1-30Days"]) || '-',
            //         utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["30-60Days"]) || '-',
            //         utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["60-90Days"]) || '-',
            //         utilityService.modifynegativeCurrencyFormat(data.tarreport[i][">90Days"]) || '-',

            //         //
            //     ];

            //     if (
            //         (data.tarreport[i].AmountDue != 0) 
            //         || (data.tarreport[i].Current != 0)
            //         || (data.tarreport[i]["1-30Days"] != 0) 
            //         || (data.tarreport[i]["30-60Days"] != 0)
            //         || (data.tarreport[i]["60-90Days"] != 0) 
            //         || (data.tarreport[i][">90Days"] != 0)
            //         ) {
            //         if ((currenctURL.contact !== undefined) && (currenctURL.contact !== "undefined")) {

            //             if (currenctURL.contact.replace(/\s/g, '') == data.tarreport[i].Name.replace(/\s/g, '')) {
            //                 records.push(recordObj);
            //             }
            //         } else {
            //             records.push(recordObj);
            //         }

            //     }

            // }
            records = _.sortBy(records, 'SupplierName');
            records = _.groupBy(records, 'SupplierName');


            for (let key in records) {
                //  let obj = [{
                //             key: key
                //         }, {
                //             data: records[key]
                //         }
                //     ];
        
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
                    oneMonth = oneMonth + parseFloat(entry.entries["1-30Days"]);
                    twoMonth = twoMonth + parseFloat(entry.entries["30-60Days"]);
                    threeMonth = threeMonth + parseFloat(entry.entries["60-90Days"]);
                    Older = Older + parseFloat(entry.entries[">90Days"]);

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
            //     let val = ['Total ' + allRecords[i][0].key + '', '', '', '', utilityService.modifynegativeCurrencyFormat(amountduetotal), utilityService.modifynegativeCurrencyFormat(Currenttotal),
            //         utilityService.modifynegativeCurrencyFormat(oneMonth), utilityService.modifynegativeCurrencyFormat(twoMonth), utilityService.modifynegativeCurrencyFormat(threeMonth), utilityService.modifynegativeCurrencyFormat(Older)];
            //     current.push(val);

            // }

            //grandtotalRecord
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
            //     grandoneMonth = grandoneMonth + utilityService.convertSubstringParseFloat(current[n][6]);
            //     grandtwoMonth = grandtwoMonth + utilityService.convertSubstringParseFloat(current[n][7]);
            //     grandthreeMonth = grandthreeMonth + utilityService.convertSubstringParseFloat(current[n][8]);
            //     grandOlder = grandOlder + utilityService.convertSubstringParseFloat(current[n][9]);
            //     //}
            //     // let val = ['Total ' + allRecords[i][0].key+'', '', '', '', utilityService.modifynegativeCurrencyFormat(Currenttotal), utilityService.modifynegativeCurrencyFormat(lessTnMonth),
            //     //     utilityService.modifynegativeCurrencyFormat(oneMonth), utilityService.modifynegativeCurrencyFormat(twoMonth), utilityService.modifynegativeCurrencyFormat(threeMonth), utilityService.modifynegativeCurrencyFormat(Older)];
            //     // current.push(val);
            // }

            // let grandval = ['Grand Total ' + '', '', '', '', utilityService.modifynegativeCurrencyFormat(grandamountduetotal), utilityService.modifynegativeCurrencyFormat(grandCurrenttotal),
            //     utilityService.modifynegativeCurrencyFormat(grandoneMonth), utilityService.modifynegativeCurrencyFormat(grandtwoMonth), utilityService.modifynegativeCurrencyFormat(grandthreeMonth), utilityService.modifynegativeCurrencyFormat(grandOlder)];

            let grandValObj = {
                Title: 'Grand Total ',
                TotalAmountDue: grandamountduetotal,
                TotalCurrent: grandCurrenttotal,
                OneMonth: grandoneMonth,
                TwoMonth: grandtwoMonth,
                ThreeMonth: grandthreeMonth,
                OlderMonth: grandOlder
            };


            // for (let key in records) {
            //     let dataArr = current[iterator]
            //         let obj = [{
            //                 key: key
            //             }, {
            //                 data: records[key]
            //             }, {
            //                 total: [{
            //                         dataArr: dataArr
            //                     }
            //                 ]
            //             }
            //         ];
            //     totalRecord.push(obj);
            //     iterator += 1;
            // }

            // templateObject.records.set(totalRecord);
            // templateObject.grandrecords.set(grandval);

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

        } else {
            let records = [];
            let recordObj = {};
            recordObj.Id = '';
            recordObj.type = '';
            recordObj.SupplierName = ' ';
            recordObj.dataArr = [
                '-',
                '-',
                '-',
                '-',
                '-',
                '-',
                '-',
                '-',
                '-',
                '-'
            ];

            records.push(recordObj);
            templateObject.records.set(records);
            templateObject.grandrecords.set('');
            $('.fullScreenSpin').css('display', 'none');
        }

      //}
    };

    let url = location.href;
    if (url.indexOf('?dateFrom') > 0) {
        localStorage.setItem('VS1AgedReceivables_Report','');
        url = new URL(window.location.href);
        $("#dateFrom").val(moment(url.searchParams.get("dateFrom")).format("DD/MM/YYYY"));
        $("#dateTo").val(moment(url.searchParams.get("dateTo")).format("DD/MM/YYYY"));
        templateObject.getAgedReceivableReports(
            GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
            GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
            false
        );
    } else {
        $("#dateFrom").val(moment().subtract(1, "months").format("DD/MM/YYYY"));
        $("#dateTo").val(moment().format("DD/MM/YYYY"));
        templateObject.getAgedReceivableReports(
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
    templateObject.getDepartments();
    templateObject.initDate();
    templateObject.initUploadedImage();    
    templateObject.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateFrom').val()) )  
});

Template.agedreceivables.events({
    'click #btnSummary': function() {
        FlowRouter.go('/agedreceivablessummary');
    },
    'click td a': async function (event) {
        let id = $(event.target).closest('tr').attr('id').split("item-value-");
        var accountName = id[1].split('_').join(' ');
        let toDate = moment($('#dateTo').val()).clone().endOf('month').format('YYYY-MM-DD');
        let fromDate = moment($('#dateFrom').val()).clone().startOf('year').format('YYYY-MM-DD');
        //Session.setPersistent('showHeader',true);
        await clearData('TAccountRunningBalanceReport');
        window.open('/balancetransactionlist?accountName=' + accountName + '&toDate=' + toDate + '&fromDate=' + fromDate + '&isTabItem=' + false, '_self');
    },
    'click .btnRefresh': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        localStorage.setItem('VS1AgedReceivables_Report', '');
        Meteor._reload.reload();
    },
    'click td a': function (event) {
        let redirectid = $(event.target).closest('tr').attr('id');

        let transactiontype = $(event.target).closest('tr').attr('class'); ;

        if (redirectid && transactiontype) {
            if (transactiontype === 'Quote') {
                window.open('/quotecard?id=' + redirectid, '_self');
            } else if (transactiontype === 'Sales Order') {
                window.open('/salesordercard?id=' + redirectid, '_self');
            } else if (transactiontype === 'Invoice') {
                window.open('/invoicecard?id=' + redirectid, '_self');
            }else if (transactiontype === 'Refund') {
                window.open('/invoicecard?id=' + redirectid, '_self');
            } else if (transactiontype === 'Customer Payment') {
                // window.open('/paymentcard?id=' + redirectid,'_self');
            }
        }
        // window.open('/balancetransactionlist?accountName=' + accountName+ '&toDate=' + toDate + '&fromDate=' + fromDate + '&isTabItem='+false,'_self');
    },
    'click .btnPrintReport': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block')
        playPrintAudio();
        setTimeout(async function(){
            let targetElement = document.getElementsByClassName('printReport')[0];
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

            let docTitle = "Aged Receivables Report.pdf";


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
                return new Promise((resolve, reject)=>{
                    html2pdf().set(opt).from(source).toPdf().output('datauristring').then(dataObject=>{
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
                        // return storage.includes('BasedOnType_') && employeeId == Session.get('mySessionEmployeeLoggedID')
                        return storage.includes('BasedOnType_');
                    });
                    let i = basedOnTypeStorages.length;
                    if (i > 0) {
                        while (i--) {
                            values.push(localStorage.getItem(basedOnTypeStorages[i]));
                        }
                    }
                    for (let j = 0; j< values.length; j++) {
                        let value = values[j];
                        let reportData = JSON.parse(value);
                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                        if (reportData.BasedOnType.includes("P")) {
                            if (reportData.FormID == 1) {
                                let formIds = reportData.FormIDs.split(',');
                                if (formIds.includes("134")) {
                                    reportData.FormID = 134;
                                    reportData.attachments = await getAttachments();
                                    Meteor.call('sendNormalEmail', reportData);
                                    resolve()
                                }
                            } else {
                                if (reportData.FormID == 134) {
                                    reportData.attachments = await getAttachments();
                                    Meteor.call('sendNormalEmail', reportData);
                                    resolve()
                                }
                            }

                            if(j == values.length -1) {resolve()}
                        }
                    }
                   
                })
            }

            await checkBasedOnType()
            $('.fullScreenSpin').css('display', 'none');

            document.title = 'Aged Receivables Report';
            $(".printReport").print({
                title: document.title + " | Aged Receivables | " + loggedCompany,
                noPrintSelector: ".addSummaryEditor",
            });
            targetElement.style.width = "100%";
            targetElement.style.backgroundColor = "#ffffff";
            targetElement.style.padding = "0px";
            targetElement.style.fontSize = "1rem";
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

        const filename = loggedCompany + '-Aged Receivables' + '.csv';
        utilityService.exportReportToCsvTable('tableExport', filename, 'csv');
        let rows = [];
        // reportService.getAgedReceivableDetailsData(formatDateFrom,formatDateTo,false).then(function (data) {
        //     if(data.tarreport){
        //         rows[0] = ['Contact','Type', 'Invoice No', 'Due Date', 'Amount Due', 'Currenct', '1 - 30 Days', '30 - 60 Days', '60 - 90 Days', '> 90 Days'];
        //         data.tarreport.forEach(function (e, i) {
        //             rows.push([
        //               data.tarreport[i].Name,
        //               data.tarreport[i].Type,
        //               data.tarreport[i].InvoiceNumber,
        //               data.tarreport[i].DueDate !=''? moment(data.tarreport[i].DueDate).format("DD/MM/YYYY"): data.tarreport[i].DueDate,
        //               utilityService.modifynegativeCurrencyFormat(data.tarreport[i].AmountDue) || '-',
        //               utilityService.modifynegativeCurrencyFormat(data.tarreport[i].Current) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["1-30Days"]) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["30-60Days"]) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.tarreport[i]["60-90Days"]) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.tarreport[i][">90Days"]) || '0.00']);
        //         });
        //         setTimeout(function () {
        //             utilityService.exportReportToCsv(rows, filename, 'xls');
        //             $('.fullScreenSpin').css('display','none');
        //         }, 1000);
        //     }
        //
        // });
    },
    "click #ignoreDate": function () {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        localStorage.setItem("VS1AgedReceivables_Report", "");
        $("#dateFrom").attr("readonly", true);
        $("#dateTo").attr("readonly", true);
        templateObject.getAgedReceivableReports(null, null, true);
    },
    "change #dateTo, change #dateFrom": (e) => {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        localStorage.setItem("VS1AgedReceivables_Report", "");
        templateObject.getAgedReceivableReports(
          GlobalFunctions.convertYearMonthDay($('#dateFrom').val()), 
          GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
          false
        )
    },
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
    ...Datehandler.getDateRangeEvents(),
    // CURRENCY MODULE
    ...FxGlobalFunctions.getEvents(),
  "click .currency-modal-save": e => {
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
        let _currency = _currencyList.find(c => c.id == currencyId);
        _currency.active = true;
        _currencySelectedList.push(_currency);
      });
    } else {
      let _currency = _currencyList.find(c => c.code == defaultCurrencyCode);
      _currency.active = true;
      _currencySelectedList.push(_currency);
    }

    _currencyList.forEach((value, index) => {
      if (_currencySelectedList.some(c => c.id == _currencyList[index].id)) {
        _currencyList[index].active = _currencySelectedList.find(c => c.id == _currencyList[index].id).active;
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

Template.agedreceivables.helpers({
    records: () => {
        return Template.instance().records.get();
    },

    redirectionType(item) {
       if (item.type === 'Invoice') {
          return '/invoicecard?id=' + item.entries.InvoiceNumber;
        } else {
          return '#noInfoFound';
        }
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
        return Template.instance().deptrecords.get().sort(function (a, b) {
            if (a.department == 'NA') {
                return 1;
            } else if (b.department == 'NA') {
                return -1;
            }
            return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
        });
    },

    formatPrice: (amount, days = null) => {
        if(days != null) {
            amount = amount[days];
        }
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
          amount = amount[days];
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
      if(days != null) {
          amount = amount[days];
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

