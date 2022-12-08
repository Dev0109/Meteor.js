import { ReportService } from "../report-service";
import 'jQuery.print/jQuery.print.js';
import { UtilityService } from "../../utility-service";
import { TaxRateService } from "../../settings/settings-service";
import LoadingOverlay from "../../LoadingOverlay";
import CachedHttp from "../../lib/global/CachedHttp";
import GlobalFunctions from "../../GlobalFunctions";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import Datehandler from "../../DateHandler";

const reportService = new ReportService();
const utilityService = new UtilityService();
const taxRateService = new TaxRateService();

let defaultCurrencyCode = CountryAbbr;

Template.taxsummaryreport.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar([]);
    templateObject.reportRecords = new ReactiveVar([]);
    templateObject.mainReportRecords = new ReactiveVar([]);
    templateObject.subReportRecords = new ReactiveVar([]);
    templateObject.isSub = new ReactiveVar([]);
    templateObject.grandRecords = new ReactiveVar();
    templateObject.mainGrandRecords = new ReactiveVar();
    templateObject.subGrandRecords = new ReactiveVar();
    templateObject.dateAsAt = new ReactiveVar();
    templateObject.deptrecords = new ReactiveVar();
    templateObject.reportOptions = new ReactiveVar([]);

    // Currency related vars //
    templateObject.currencyList = new ReactiveVar([]);
    templateObject.activeCurrencyList = new ReactiveVar([]);
    templateObject.tcurrencyratehistory = new ReactiveVar([]);
});

Template.taxsummaryreport.onRendered(() => {
    LoadingOverlay.show();
    const templateObject = Template.instance();

    // let salesOrderTable;
    // var splashArray = new Array();
    // var today = moment().format('DD/MM/YYYY');
    // var currentDate = new Date();
    // var begunDate = moment(currentDate).format("DD/MM/YYYY");
    // let fromDateMonth = (currentDate.getMonth() + 1);
    // let fromDateDay = currentDate.getDate();
    // if ((currentDate.getMonth() + 1) < 10) {
    //   fromDateMonth = "0" + (currentDate.getMonth() + 1);
    // }

    // let imageData = (localStorage.getItem("Image"));
    // if (imageData) {
    //   $('#uploadedImage').attr('src', imageData);
    //   $('#uploadedImage').attr('width', '50%');
    // }

    // if (currentDate.getDate() < 10) {
    //   fromDateDay = "0" + currentDate.getDate();
    // }
    // var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();


    // templateObject.dateAsAt.set(begunDate);
    // const dataTableList = [];
    // const deptrecords = [];
    // $("#date-input,#dateTo,#dateFrom").datepicker({
    //   showOn: 'button',
    //   buttonText: 'Show Date',
    //   buttonImageOnly: true,
    //   buttonImage: '/img/imgCal2.png',
    //   dateFormat: 'dd/mm/yy',
    //   showOtherMonths: true,
    //   selectOtherMonths: true,
    //   changeMonth: true,
    //   changeYear: true,
    //   yearRange: "-90:+10",
    //   onChangeMonthYear: function (year, month, inst) {
    //     // Set date to picker
    //     $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
    //     // Hide (close) the picker
    //     // $(this).datepicker('hide');
    //     // // Change ttrigger the on change function
    //     // $(this).trigger('change');
    //   }
    // });

    // $("#dateFrom").val(fromDate);
    // $("#dateTo").val(begunDate);

    templateObject.initDate = () => {
        Datehandler.initOneMonth();
    };

    templateObject.setDateAs = ( dateFrom = null ) => {
        templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
    };


    templateObject.initDate();


    templateObject.setReportOptions = async function(ignoreDate = true, formatDateFrom = new Date(), formatDateTo = new Date()) {
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
        templateObject.dateAsAt.set(moment(defaultOptions.fromDate).format('DD/MM/YYYY'));
        $('.edtReportDates').attr('disabled', false)
        if (ignoreDate == true) {
            $('.edtReportDates').attr('disabled', true);
            templateObject.dateAsAt.set("Current Date");
        }
        $("#dateFrom").val(moment(defaultOptions.fromDate).format('DD/MM/YYYY'));
        $("#dateTo").val(moment(defaultOptions.toDate).format('DD/MM/YYYY'));
        await templateObject.reportOptions.set(defaultOptions);
        // await templateObject.getTaxSummaryReports(defaultOptions.fromDate, defaultOptions.toDate, defaultOptions.ignoreDate);
        await templateObject.loadReport(defaultOptions.fromDate, defaultOptions.toDate, defaultOptions.ignoreDate);


    };



    templateObject.loadReport = async(dateFrom, dateTo, ignoreDate = false) => {
        LoadingOverlay.show();

        const _data = await CachedHttp.get("TTaxSummaryReport", async() => {
            return await reportService.getTaxSummaryData(dateFrom, dateTo, ignoreDate);
        }, {
            requestParams: {
                DateFrom: dateFrom,
                DateTo: dateTo,
                IgnoreDates: ignoreDate
            },
            useIndexDb: true,
            useLocalStorage: false,
            validate: cachedResponse => {
                if (GlobalFunctions.isSameDay(cachedResponse.response.Params.DateFrom, dateFrom) &&
                    GlobalFunctions.isSameDay(cachedResponse.response.Params.DateTo, dateTo) &&
                    cachedResponse.response.Params.IgnoreDates == ignoreDate) {
                    return true;
                }
                return false;
            }
        });

        let data = _data.response;

        if (data.ttaxsummaryreport) {
            const taxSummaryReport = data.ttaxsummaryreport;

            reportService.getTaxCodesDetailVS1().then(function(data) {
                const taxCodesDetail = data.ttaxcodevs1;

                localStorage.setItem('VS1TaxSummary_Report', JSON.stringify(data) || '');
                let records = [];
                let mainReportRecords = [];
                let subReportRecords = [];
                let netsubtotal = 0;
                let taxsubtotal = 0;
                let allRecords = [];
                let current = [];

                let totalNetAssets = 0;
                let GrandTotalLiability = 0;
                let GrandTotalAsset = 0;
                let incArr = [];
                let cogsArr = [];
                let expArr = [];
                let accountData = taxSummaryReport;
                let accountType = '';
                let subTaxSummaryData = [];

                accountData.forEach((account) => {
                    // let inputsexpurchases = utilityService.modifynegativeCurrencyFormat(data.INPUT_AmountEx) || 0;
                    // let inputsincpurchases = utilityService.modifynegativeCurrencyFormat(data.INPUT_AmountInc) || 0;
                    // let outputexsales = utilityService.modifynegativeCurrencyFormat(data.OUTPUT_AmountEx) || 0;
                    // let outputincsales = utilityService.modifynegativeCurrencyFormat(data.OUTPUT_AmountInc) || 0;
                    // let totalnet = utilityService.modifynegativeCurrencyFormat(data.TotalNet) || 0;
                    // let totaltax = utilityService.modifynegativeCurrencyFormat(data.TotalTax) || 0;
                    // let totaltax1 = utilityService.modifynegativeCurrencyFormat(data.TotalTax1) || 0;

                    let inputsexpurchases = account.INPUT_AmountEx || 0;
                    let inputsincpurchases = account.INPUT_AmountInc || 0;
                    let outputexsales = account.OUTPUT_AmountEx || 0;
                    let outputincsales = account.OUTPUT_AmountInc || 0;
                    let totalnet = account.TotalNet || 0;
                    let totaltax = account.TotalTax || 0;
                    let totaltax1 = account.TotalTax1 || 0;

                    const mainReportData = {
                        id: account.ID || '',
                        taxcode: account.TaxCode || '',
                        clientid: account.ClientID || '',
                        inputsexpurchases: inputsexpurchases,
                        inputsincpurchases: inputsincpurchases,
                        outputexsales: outputexsales,
                        outputincsales: outputincsales,
                        totalnet: totalnet || 0.00,
                        totaltax: totaltax || 0.00,
                        totaltax1: totaltax1 || 0.00,
                        taxrate: (account.TaxRate * 100).toFixed(2) + '%' || 0,
                        taxrate2: (account.TaxRate * 100).toFixed(2) || 0,
                        entries: account
                    };

                    mainReportRecords.push(mainReportData);

                    const taxDetail = taxCodesDetail.find((v) => v.CodeName === account.TaxCode);

                    if (taxDetail && taxDetail.Lines) {
                        netsubtotal = netsubtotal + parseFloat(totalnet);
                        taxsubtotal = taxsubtotal + parseFloat(totaltax);

                        taxDetail.Lines.forEach((line) => {
                            const tax = (parseFloat(inputsexpurchases) - parseFloat(outputexsales)) * line.Percentage / 100.0;

                            const subReportData = {
                                id: account.ID || '',
                                taxcode: account.TaxCode || '',
                                subtaxcode: line.SubTaxCode || '',
                                clientid: '',
                                inputsexpurchases: inputsexpurchases,
                                inputsincpurchases: inputsincpurchases,
                                outputexsales: outputexsales,
                                outputincsales: outputincsales,
                                totalnet: totalnet || 0.00,
                                totaltax: Math.abs(tax) || 0.00,
                                totaltax1: tax || 0.00,
                                taxrate: (line.Percentage).toFixed(2) + '%' || 0,
                                taxrate2: (line.Percentage).toFixed(2) || 0
                            };
                            subReportRecords.push(subReportData);
                        })

                        // for (let j = 0; j < taxDetail.Lines.length; j++) {
                        //   const tax = (utilityService.convertSubstringParseFloat(inputsexpurchases) - utilityService.convertSubstringParseFloat(outputexsales)) * taxDetail.Lines[j].Percentage / 100.0;
                        //   const subReportData = {
                        //     id: taxSummaryReport[i].ID || '',
                        //     taxcode: taxSummaryReport[i].TaxCode || '',
                        //     subtaxcode: taxDetail.Lines[j].SubTaxCode || '',
                        //     clientid: '',
                        //     inputsexpurchases: inputsexpurchases,
                        //     inputsincpurchases: inputsincpurchases,
                        //     outputexsales: outputexsales,
                        //     outputincsales: outputincsales,
                        //     totalnet: totalnet || 0.00,
                        //     totaltax: utilityService.modifynegativeCurrencyFormat(Math.abs(tax)) || 0.00,
                        //     totaltax1: utilityService.modifynegativeCurrencyFormat(tax) || 0.00,
                        //     taxrate: (taxDetail.Lines[j].Percentage).toFixed(2) + '%' || 0,
                        //     taxrate2: (taxDetail.Lines[j].Percentage).toFixed(2) || 0
                        //   };
                        //   subReportRecords.push(subReportData);
                        // }
                    }

                });

                // for (let i = 0; i < taxSummaryReport.length; i++) {

                //   let inputsexpurchases = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].INPUT_AmountEx) || 0;
                //   let inputsincpurchases = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].INPUT_AmountInc) || 0;
                //   let outputexsales = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].OUTPUT_AmountEx) || 0;
                //   let outputincsales = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].OUTPUT_AmountInc) || 0;
                //   let totalnet = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].TotalNet) || 0;
                //   let totaltax = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].TotalTax) || 0;
                //   let totaltax1 = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].TotalTax1) || 0;

                //   const mainReportData = {
                //     id: taxSummaryReport[i].ID || '',
                //     taxcode: taxSummaryReport[i].TaxCode || '',
                //     clientid: taxSummaryReport[i].ClientID || '',
                //     inputsexpurchases: inputsexpurchases,
                //     inputsincpurchases: inputsincpurchases,
                //     outputexsales: outputexsales,
                //     outputincsales: outputincsales,
                //     totalnet: totalnet || 0.00,
                //     totaltax: totaltax || 0.00,
                //     totaltax1: totaltax1 || 0.00,
                //     taxrate: (taxSummaryReport[i].TaxRate * 100).toFixed(2) + '%' || 0,
                //     taxrate2: (taxSummaryReport[i].TaxRate * 100).toFixed(2) || 0

                //   };

                //   mainReportRecords.push(mainReportData);

                //   const taxDetail = taxCodesDetail.find((v) => v.CodeName === taxSummaryReport[i].TaxCode);
                //   if (taxDetail && taxDetail.Lines) {
                //     for (let j = 0; j < taxDetail.Lines.length; j++) {
                //       const tax = (utilityService.convertSubstringParseFloat(inputsexpurchases) - utilityService.convertSubstringParseFloat(outputexsales)) * taxDetail.Lines[j].Percentage / 100.0;
                //       const subReportData = {
                //         id: taxSummaryReport[i].ID || '',
                //         taxcode: taxSummaryReport[i].TaxCode || '',
                //         subtaxcode: taxDetail.Lines[j].SubTaxCode || '',
                //         clientid: '',
                //         inputsexpurchases: inputsexpurchases,
                //         inputsincpurchases: inputsincpurchases,
                //         outputexsales: outputexsales,
                //         outputincsales: outputincsales,
                //         totalnet: totalnet || 0.00,
                //         totaltax: utilityService.modifynegativeCurrencyFormat(Math.abs(tax)) || 0.00,
                //         totaltax1: utilityService.modifynegativeCurrencyFormat(tax) || 0.00,
                //         taxrate: (taxDetail.Lines[j].Percentage).toFixed(2) + '%' || 0,
                //         taxrate2: (taxDetail.Lines[j].Percentage).toFixed(2) || 0
                //       };
                //       subReportRecords.push(subReportData);
                //     }
                //   }





                //   //   if((taxSummaryReport[i].AmountDue != 0) || (taxSummaryReport[i].Current != 0)
                //   //   || (taxSummaryReport[i]["30Days"] != 0) || (taxSummaryReport[i]["60Days"] != 0)
                //   // || (taxSummaryReport[i]["90Days"] != 0) || (taxSummaryReport[i]["120Days"] != 0)){
                //   //  records.push(recordObj);
                //   //}



                // }

                mainReportRecords = _.sortBy(mainReportRecords, 'taxcode');
                subReportRecords = _.sortBy(subReportRecords, 'subtaxcode');

                // templateObject.mainReportRecords.set(mainReportRecords);
                // templateObject.reportRecords.set(mainReportRecords);
                //   records = _.sortBy(records, 'SupplierName');
                // records = _.groupBy(records, 'SupplierName');


                // for (let key in records) {
                //   allRecords.push({
                //       title: key,
                //       entries: records[key],
                //       total: {} // will be filled later
                //   });
                // }

                let iterator = 0;
                let inputsexpurchasestotal = 0;
                let inputsincpurchasestotal = 0;
                let outputexsalestotal = 0;
                let outputincsalestotal = 0;
                let nettotal = 0;
                let taxtotal = 0;
                let taxratetotal = 0;
                let taxtotal1 = 0;

                mainReportRecords.forEach((record) => {
                    const currencyLength = Currency.length;
                    inputsexpurchasestotal = inputsexpurchasestotal + parseFloat(record.inputsexpurchases);
                    inputsincpurchasestotal = inputsincpurchasestotal + parseFloat(record.inputsincpurchases);
                    outputexsalestotal = outputexsalestotal + parseFloat(record.outputexsales);
                    outputincsalestotal = outputincsalestotal + parseFloat(record.outputincsales);
                    nettotal = nettotal + parseFloat(record.totalnet);
                    taxtotal = taxtotal + parseFloat(record.totaltax);
                    taxratetotal = taxratetotal + Number(record.taxrate2.replace(/[^0-9.-]+/g, "")) || 0;
                    taxtotal1 = taxtotal1 + parseFloat(record.totaltax1);

                    let val = {
                        InputsExPurchases: inputsexpurchasestotal,
                        InputsIncPurchases: inputsincpurchasestotal,
                        OutputExSales: outputexsalestotal,
                        OutputIncSales: outputincsalestotal,
                        Net: nettotal,
                        tax: taxtotal,
                        tax1: taxtotal1,
                        TaxRate: taxratetotal
                    }

                    current.push(val);



                });

                templateObject.mainReportRecords.set(mainReportRecords);
                templateObject.reportRecords.set(mainReportRecords); // this one will be used

                // for (let i = 0; i < mainReportRecords.length; i++) {



                //   const currencyLength = Currency.length;
                //   inputsexpurchasestotal = inputsexpurchasestotal + utilityService.convertSubstringParseFloat(mainReportRecords[i].inputsexpurchases);
                //   inputsincpurchasestotal = inputsincpurchasestotal + utilityService.convertSubstringParseFloat(mainReportRecords[i].inputsincpurchases);
                //   outputexsalestotal = outputexsalestotal + utilityService.convertSubstringParseFloat(mainReportRecords[i].outputexsales);
                //   outputincsalestotal = outputincsalestotal + utilityService.convertSubstringParseFloat(mainReportRecords[i].outputincsales);
                //   nettotal = nettotal + utilityService.convertSubstringParseFloat(mainReportRecords[i].totalnet);
                //   taxtotal = taxtotal + utilityService.convertSubstringParseFloat(mainReportRecords[i].totaltax);
                //   taxratetotal = taxratetotal + Number(mainReportRecords[i].taxrate2.replace(/[^0-9.-]+/g, "")) || 0;
                //   taxtotal1 = taxtotal1 + utilityService.convertSubstringParseFloat(mainReportRecords[i].totaltax1);

                //   let val = ['', utilityService.modifynegativeCurrencyFormat(inputsexpurchasestotal), utilityService.modifynegativeCurrencyFormat(inputsincpurchasestotal),
                //     utilityService.modifynegativeCurrencyFormat(outputexsalestotal), utilityService.modifynegativeCurrencyFormat(outputincsalestotal), utilityService.modifynegativeCurrencyFormat(nettotal), utilityService.modifynegativeCurrencyFormat(taxtotal), '', utilityService.modifynegativeCurrencyFormat(taxtotal1)];
                //   current.push(val);

                // }

                const mainGrandval = {
                    title: "Grand Total ",
                    total: {
                        net: utilityService.modifynegativeCurrencyFormat(nettotal),
                        tax: utilityService.modifynegativeCurrencyFormat(taxtotal)
                    }
                };

                // let mainGrandval = [
                //   "Grand Total " + "",
                //   // '','',
                //   "",
                //   "",
                //   // '',
                //   // '',
                //   utilityService.modifynegativeCurrencyFormat(nettotal),

                //               // taxratetotal.toFixed(2) + '%' || 0,
                //   "",
                //   utilityService.modifynegativeCurrencyFormat(taxtotal)
                // ];
                // utilityService.modifynegativeCurrencyFormat(taxtotal1)];

                const subGrandval = {
                    title: "Grand Total ",
                    total: {
                        net: utilityService.modifynegativeCurrencyFormat(netsubtotal),
                        tax: utilityService.modifynegativeCurrencyFormat(taxsubtotal)
                    }
                };

                // let subGrandval = ['Grand Total ' + '',
                //   '',
                //   '',
                //   '',
                // utilityService.modifynegativeCurrencyFormat(nettotal),
                //   '',
                // utilityService.modifynegativeCurrencyFormat(taxtotal)];

                //templateObject.records.set(totalRecord);


                templateObject.mainGrandRecords.set(mainGrandval);
                templateObject.subGrandRecords.set(subGrandval);
                templateObject.grandRecords.set(mainGrandval);

                let i = 0,
                    posToAdd = -1,
                    currentSubCode, subReportRecordsSize = subReportRecords.length;

                let subrecords = [];
                mainReportRecords.forEach((mainRecord) => {
                    mainRecord.subtaxcode = "";
                    subrecords.push(mainRecord);
                    let exist_subRecord = false;
                    subReportRecords.forEach((subRecord) => {
                        if (mainRecord.taxcode == subRecord.taxcode) {
                            subRecord.taxcode = "";
                            subrecords.push(subRecord);
                            exist_subRecord = true;
                        }
                    });
                    if (exist_subRecord == false) {
                        subrecords.pop();
                    }
                });

                // i should be iterated being lower than subReportRecordsSize, but iterated once more to summing last group
                // while (i <= subReportRecordsSize) {
                //   if (i === subReportRecordsSize || currentSubCode !== subReportRecords[i].subtaxcode) {
                //     if (posToAdd >= 0) {
                //       const taxDetail = taxCodesDetail.find((v) => v.CodeName === subReportRecords[i - 1].taxcode);

                //       const subReportData = {
                //         id: taxDetail.ID,
                //         taxcode: '',
                //         subtaxcode: subReportRecords[i - 1].subtaxcode || '',
                //         clientid: '',
                //         inputsexpurchases: inputsexpurchasestotal,
                //         inputsincpurchases: inputsincpurchasestotal,
                //         outputexsales: outputexsalestotal,
                //         outputincsales: outputincsalestotal,
                //         totalnet: nettotal || 0.00,
                //         totaltax: taxtotal || 0.00,
                //         totaltax1: taxtotal1 || 0.00,
                //         taxrate: (taxratetotal).toFixed(2) + '%' || 0,
                //         taxrate2: (taxratetotal).toFixed(2) || 0
                //       };
                //       subReportRecords.splice(posToAdd, 0, subReportData);

                //       // if this is last group summing, don't need to continue iterating
                //       if (i === subReportRecordsSize) break;

                //       i++;
                //       subReportRecordsSize++;
                //     }

                //     posToAdd = i;
                //     if (subReportRecords.length > 0) {
                //       currentSubCode = subReportRecords[i].subtaxcode;
                //     }

                //     inputsexpurchasestotal = 0;
                //     inputsincpurchasestotal = 0;
                //     outputexsalestotal = 0;
                //     outputincsalestotal = 0;
                //     nettotal = 0;
                //     taxtotal = 0;
                //     taxratetotal = 0;
                //     taxtotal1 = 0;
                //   }
                //   if (subReportRecords.length > 0) {
                //     inputsexpurchasestotal = inputsexpurchasestotal + parseFloat(subReportRecords[i].inputsexpurchases);
                //     inputsincpurchasestotal = inputsincpurchasestotal + parseFloat(subReportRecords[i].inputsincpurchases);
                //     outputexsalestotal = outputexsalestotal + parseFloat(subReportRecords[i].outputexsales);
                //     outputincsalestotal = outputincsalestotal + parseFloat(subReportRecords[i].outputincsales);
                //     nettotal = nettotal + parseFloat(subReportRecords[i].totalnet);
                //     taxtotal = taxtotal + parseFloat(subReportRecords[i].totaltax);
                //     taxratetotal = taxratetotal + Number(subReportRecords[i].taxrate2.replace(/[^0-9.-]+/g, "")) || 0;
                //     taxtotal1 = taxtotal1 + parseFloat(subReportRecords[i].totaltax1);
                //   }
                //   i++;
                // }
                templateObject.subReportRecords.set(subrecords);

                if ($("#subTaxCode").prop('checked') == true) {
                    templateObject.reportRecords.set(subrecords); // this one will be used
                }

                if (templateObject.mainReportRecords.get()) {
                    templateObject.stylizeForm();
                }
                // templateObject.isSub.set(false);
            });
            LoadingOverlay.hide();
        }


        LoadingOverlay.hide();

    }

    templateObject.getTaxSummaryReports = function(dateFrom, dateTo, ignoreDate) {
        if (!localStorage.getItem('VS1TaxSummary_Report')) {
            reportService.getTaxSummaryData(dateFrom, dateTo, ignoreDate).then(function(data) {
                let totalRecord = [];
                let grandtotalRecord = [];

                if (data.ttaxsummaryreport) {
                    const taxSummaryReport = data.ttaxsummaryreport;

                    reportService.getTaxCodesDetailVS1().then(function(data) {
                        const taxCodesDetail = data.ttaxcodevs1;
                        localStorage.setItem('VS1TaxSummary_Report', JSON.stringify(data) || '');
                        let records = [];
                        let mainReportRecords = [];
                        let subReportRecords = [];
                        let netsubtotal = 0;
                        let taxsubtotal = 0;
                        let allRecords = [];
                        let current = [];

                        let totalNetAssets = 0;
                        let GrandTotalLiability = 0;
                        let GrandTotalAsset = 0;
                        let incArr = [];
                        let cogsArr = [];
                        let expArr = [];
                        let accountData = taxSummaryReport;
                        let accountType = '';
                        let subTaxSummaryData = [];

                        taxSummaryReport.forEach((data) => {
                            // let inputsexpurchases = utilityService.modifynegativeCurrencyFormat(data.INPUT_AmountEx) || 0;
                            // let inputsincpurchases = utilityService.modifynegativeCurrencyFormat(data.INPUT_AmountInc) || 0;
                            // let outputexsales = utilityService.modifynegativeCurrencyFormat(data.OUTPUT_AmountEx) || 0;
                            // let outputincsales = utilityService.modifynegativeCurrencyFormat(data.OUTPUT_AmountInc) || 0;
                            // let totalnet = utilityService.modifynegativeCurrencyFormat(data.TotalNet) || 0;
                            // let totaltax = utilityService.modifynegativeCurrencyFormat(data.TotalTax) || 0;
                            // let totaltax1 = utilityService.modifynegativeCurrencyFormat(data.TotalTax1) || 0;

                            let inputsexpurchases = data.INPUT_AmountEx || 0;
                            let inputsincpurchases = data.INPUT_AmountInc || 0;
                            let outputexsales = data.OUTPUT_AmountEx || 0;
                            let outputincsales = data.OUTPUT_AmountInc || 0;
                            let totalnet = data.TotalNet || 0;
                            let totaltax = data.TotalTax || 0;
                            let totaltax1 = data.TotalTax1 || 0;

                            const mainReportData = {
                                id: data.ID || '',
                                taxcode: data.TaxCode || '',
                                clientid: data.ClientID || '',
                                inputsexpurchases: inputsexpurchases,
                                inputsincpurchases: inputsincpurchases,
                                outputexsales: outputexsales,
                                outputincsales: outputincsales,
                                totalnet: totalnet || 0.00,
                                totaltax: totaltax || 0.00,
                                totaltax1: totaltax1 || 0.00,
                                taxrate: (data.TaxRate * 100).toFixed(2) + '%' || 0,
                                taxrate2: (data.TaxRate * 100).toFixed(2) || 0,
                                entries: data
                            };

                            mainReportRecords.push(mainReportData);

                            const taxDetail = taxCodesDetail.find((v) => v.CodeName === data.TaxCode);
                            if (taxDetail && taxDetail.Lines) {
                                netsubtotal = netsubtotal + parseFloat(totalnet);
                                taxsubtotal = taxsubtotal + parseFloat(totaltax);

                                taxDetail.Lines.forEach((line) => {
                                    const tax = (utilityService.convertSubstringParseFloat(inputsexpurchases) - utilityService.convertSubstringParseFloat(outputexsales)) * taxDetail.Lines[j].Percentage / 100.0;

                                    const subReportData = {
                                        id: data.ID || '',
                                        taxcode: data.TaxCode || '',
                                        subtaxcode: line.SubTaxCode || '',
                                        clientid: '',
                                        inputsexpurchases: inputsexpurchases,
                                        inputsincpurchases: inputsincpurchases,
                                        outputexsales: outputexsales,
                                        outputincsales: outputincsales,
                                        totalnet: totalnet || 0.00,
                                        totaltax: utilityService.modifynegativeCurrencyFormat(Math.abs(tax)) || 0.00,
                                        totaltax1: utilityService.modifynegativeCurrencyFormat(tax) || 0.00,
                                        taxrate: (line.Percentage).toFixed(2) + '%' || 0,
                                        taxrate2: (line.Percentage).toFixed(2) || 0
                                    };
                                    subReportRecords.push(subReportData);


                                })

                                // for (let j = 0; j < taxDetail.Lines.length; j++) {
                                //   const tax = (utilityService.convertSubstringParseFloat(inputsexpurchases) - utilityService.convertSubstringParseFloat(outputexsales)) * taxDetail.Lines[j].Percentage / 100.0;
                                //   const subReportData = {
                                //     id: taxSummaryReport[i].ID || '',
                                //     taxcode: taxSummaryReport[i].TaxCode || '',
                                //     subtaxcode: taxDetail.Lines[j].SubTaxCode || '',
                                //     clientid: '',
                                //     inputsexpurchases: inputsexpurchases,
                                //     inputsincpurchases: inputsincpurchases,
                                //     outputexsales: outputexsales,
                                //     outputincsales: outputincsales,
                                //     totalnet: totalnet || 0.00,
                                //     totaltax: utilityService.modifynegativeCurrencyFormat(Math.abs(tax)) || 0.00,
                                //     totaltax1: utilityService.modifynegativeCurrencyFormat(tax) || 0.00,
                                //     taxrate: (taxDetail.Lines[j].Percentage).toFixed(2) + '%' || 0,
                                //     taxrate2: (taxDetail.Lines[j].Percentage).toFixed(2) || 0
                                //   };
                                //   subReportRecords.push(subReportData);
                                // }
                            }

                        });

                        // for (let i = 0; i < taxSummaryReport.length; i++) {

                        //   let inputsexpurchases = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].INPUT_AmountEx) || 0;
                        //   let inputsincpurchases = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].INPUT_AmountInc) || 0;
                        //   let outputexsales = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].OUTPUT_AmountEx) || 0;
                        //   let outputincsales = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].OUTPUT_AmountInc) || 0;
                        //   let totalnet = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].TotalNet) || 0;
                        //   let totaltax = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].TotalTax) || 0;
                        //   let totaltax1 = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].TotalTax1) || 0;

                        //   const mainReportData = {
                        //     id: taxSummaryReport[i].ID || '',
                        //     taxcode: taxSummaryReport[i].TaxCode || '',
                        //     clientid: taxSummaryReport[i].ClientID || '',
                        //     inputsexpurchases: inputsexpurchases,
                        //     inputsincpurchases: inputsincpurchases,
                        //     outputexsales: outputexsales,
                        //     outputincsales: outputincsales,
                        //     totalnet: totalnet || 0.00,
                        //     totaltax: totaltax || 0.00,
                        //     totaltax1: totaltax1 || 0.00,
                        //     taxrate: (taxSummaryReport[i].TaxRate * 100).toFixed(2) + '%' || 0,
                        //     taxrate2: (taxSummaryReport[i].TaxRate * 100).toFixed(2) || 0

                        //   };

                        //   mainReportRecords.push(mainReportData);

                        //   const taxDetail = taxCodesDetail.find((v) => v.CodeName === taxSummaryReport[i].TaxCode);
                        //   if (taxDetail && taxDetail.Lines) {
                        //     for (let j = 0; j < taxDetail.Lines.length; j++) {
                        //       const tax = (utilityService.convertSubstringParseFloat(inputsexpurchases) - utilityService.convertSubstringParseFloat(outputexsales)) * taxDetail.Lines[j].Percentage / 100.0;
                        //       const subReportData = {
                        //         id: taxSummaryReport[i].ID || '',
                        //         taxcode: taxSummaryReport[i].TaxCode || '',
                        //         subtaxcode: taxDetail.Lines[j].SubTaxCode || '',
                        //         clientid: '',
                        //         inputsexpurchases: inputsexpurchases,
                        //         inputsincpurchases: inputsincpurchases,
                        //         outputexsales: outputexsales,
                        //         outputincsales: outputincsales,
                        //         totalnet: totalnet || 0.00,
                        //         totaltax: utilityService.modifynegativeCurrencyFormat(Math.abs(tax)) || 0.00,
                        //         totaltax1: utilityService.modifynegativeCurrencyFormat(tax) || 0.00,
                        //         taxrate: (taxDetail.Lines[j].Percentage).toFixed(2) + '%' || 0,
                        //         taxrate2: (taxDetail.Lines[j].Percentage).toFixed(2) || 0
                        //       };
                        //       subReportRecords.push(subReportData);
                        //     }
                        //   }





                        //   //   if((taxSummaryReport[i].AmountDue != 0) || (taxSummaryReport[i].Current != 0)
                        //   //   || (taxSummaryReport[i]["30Days"] != 0) || (taxSummaryReport[i]["60Days"] != 0)
                        //   // || (taxSummaryReport[i]["90Days"] != 0) || (taxSummaryReport[i]["120Days"] != 0)){
                        //   //  records.push(recordObj);
                        //   //}



                        // }

                        mainReportRecords = _.sortBy(mainReportRecords, 'taxcode');
                        subReportRecords = _.sortBy(subReportRecords, 'subtaxcode');

                        // templateObject.mainReportRecords.set(mainReportRecords);
                        // templateObject.reportRecords.set(mainReportRecords);
                        //   records = _.sortBy(records, 'SupplierName');
                        // records = _.groupBy(records, 'SupplierName');

                        for (let key in records) {
                            allRecords.push({
                                title: key,
                                entries: records[key],
                                total: {} // will be filled later
                            });
                        }

                        let iterator = 0;
                        let inputsexpurchasestotal = 0;
                        let inputsincpurchasestotal = 0;
                        let outputexsalestotal = 0;
                        let outputincsalestotal = 0;
                        let nettotal = 0;
                        let taxtotal = 0;
                        let taxratetotal = 0;
                        let taxtotal1 = 0;

                        mainReportRecords.forEach((record) => {
                            const currencyLength = Currency.length;
                            inputsexpurchasestotal = inputsexpurchasestotal + parseFloat(record.inputsexpurchases);
                            inputsincpurchasestotal = inputsincpurchasestotal + parseFloat(record.inputsincpurchases);
                            outputexsalestotal = outputexsalestotal + parseFloat(record.outputexsales);
                            outputincsalestotal = outputincsalestotal + parseFloat(record.outputincsales);
                            nettotal = nettotal + parseFloat(record.totalnet);
                            taxtotal = taxtotal + parseFloat(record.totaltax);
                            taxratetotal = taxratetotal + Number(record.taxrate2.replace(/[^0-9.-]+/g, "")) || 0;
                            taxtotal1 = taxtotal1 + parseFloat(record.totaltax1);

                            let val = {
                                InputsExPurchases: inputsexpurchasestotal,
                                InputsIncPurchases: inputsincpurchasestotal,
                                OutputExSales: outputexsalestotal,
                                OutputIncSales: outputincsalestotal,
                                Net: nettotal,
                                tax: taxtotal,
                                tax1: taxtotal1,
                                TaxRate: taxratetotal
                            }

                            current.push(val);



                        });

                        templateObject.mainReportRecords.set(mainReportRecords);
                        templateObject.reportRecords.set(mainReportRecords);

                        // for (let i = 0; i < mainReportRecords.length; i++) {



                        //   const currencyLength = Currency.length;
                        //   inputsexpurchasestotal = inputsexpurchasestotal + utilityService.convertSubstringParseFloat(mainReportRecords[i].inputsexpurchases);
                        //   inputsincpurchasestotal = inputsincpurchasestotal + utilityService.convertSubstringParseFloat(mainReportRecords[i].inputsincpurchases);
                        //   outputexsalestotal = outputexsalestotal + utilityService.convertSubstringParseFloat(mainReportRecords[i].outputexsales);
                        //   outputincsalestotal = outputincsalestotal + utilityService.convertSubstringParseFloat(mainReportRecords[i].outputincsales);
                        //   nettotal = nettotal + utilityService.convertSubstringParseFloat(mainReportRecords[i].totalnet);
                        //   taxtotal = taxtotal + utilityService.convertSubstringParseFloat(mainReportRecords[i].totaltax);
                        //   taxratetotal = taxratetotal + Number(mainReportRecords[i].taxrate2.replace(/[^0-9.-]+/g, "")) || 0;
                        //   taxtotal1 = taxtotal1 + utilityService.convertSubstringParseFloat(mainReportRecords[i].totaltax1);

                        //   let val = ['', utilityService.modifynegativeCurrencyFormat(inputsexpurchasestotal), utilityService.modifynegativeCurrencyFormat(inputsincpurchasestotal),
                        //     utilityService.modifynegativeCurrencyFormat(outputexsalestotal), utilityService.modifynegativeCurrencyFormat(outputincsalestotal), utilityService.modifynegativeCurrencyFormat(nettotal), utilityService.modifynegativeCurrencyFormat(taxtotal), '', utilityService.modifynegativeCurrencyFormat(taxtotal1)];
                        //   current.push(val);

                        // }

                        const mainGrandval = {
                            title: "Grand Total ",
                            total: {
                                net: utilityService.modifynegativeCurrencyFormat(nettotal),
                                tax: utilityService.modifynegativeCurrencyFormat(taxtotal)
                            }
                        };

                        // let mainGrandval = [
                        //   "Grand Total " + "",
                        //   // '','',
                        //   "",
                        //   "",
                        //   // '',
                        //   // '',
                        //   utilityService.modifynegativeCurrencyFormat(nettotal),

                        //               // taxratetotal.toFixed(2) + '%' || 0,
                        //   "",
                        //   utilityService.modifynegativeCurrencyFormat(taxtotal)
                        // ];
                        // utilityService.modifynegativeCurrencyFormat(taxtotal1)];

                        const subGrandval = {
                            title: "Grand Total ",
                            total: {
                                net: utilityService.modifynegativeCurrencyFormat(netsubtotal),
                                tax: utilityService.modifynegativeCurrencyFormat(taxsubtotal)
                            }
                        };

                        // let subGrandval = ['Grand Total ' + '',
                        //   '',
                        //   '',
                        //   '',
                        // utilityService.modifynegativeCurrencyFormat(nettotal),
                        //   '',
                        // utilityService.modifynegativeCurrencyFormat(taxtotal)];

                        //templateObject.records.set(totalRecord);
                        templateObject.mainGrandRecords.set(mainGrandval);
                        templateObject.subGrandRecords.set(subGrandval);
                        templateObject.grandRecords.set(mainGrandval);

                        let i = 0,
                            posToAdd = -1,
                            currentSubCode, subReportRecordsSize = subReportRecords.length;

                        // i should be iterated being lower than subReportRecordsSize, but iterated once more to summing last group
                        while (i <= subReportRecordsSize) {
                            if (i === subReportRecordsSize || currentSubCode !== subReportRecords[i].subtaxcode) {
                                if (posToAdd >= 0) {
                                    const taxDetail = taxCodesDetail.find((v) => v.CodeName === subReportRecords[i - 1].taxcode);

                                    const subReportData = {
                                        id: taxDetail.ID,
                                        taxcode: '',
                                        subtaxcode: subReportRecords[i - 1].subtaxcode || '',
                                        clientid: '',
                                        inputsexpurchases: utilityService.modifynegativeCurrencyFormat(inputsexpurchasestotal),
                                        inputsincpurchases: utilityService.modifynegativeCurrencyFormat(inputsincpurchasestotal),
                                        outputexsales: utilityService.modifynegativeCurrencyFormat(outputexsalestotal),
                                        outputincsales: utilityService.modifynegativeCurrencyFormat(outputincsalestotal),
                                        totalnet: utilityService.modifynegativeCurrencyFormat(nettotal) || 0.00,
                                        totaltax: utilityService.modifynegativeCurrencyFormat(taxtotal) || 0.00,
                                        totaltax1: utilityService.modifynegativeCurrencyFormat(taxtotal1) || 0.00,
                                        taxrate: (taxratetotal).toFixed(2) + '%' || 0,
                                        taxrate2: (taxratetotal).toFixed(2) || 0
                                    };
                                    subReportRecords.splice(posToAdd, 0, subReportData);

                                    // if this is last group summing, don't need to continue iterating
                                    if (i === subReportRecordsSize) break;

                                    i++;
                                    subReportRecordsSize++;
                                }

                                posToAdd = i;
                                if (subReportRecords.length > 0) {
                                    currentSubCode = subReportRecords[i].subtaxcode;
                                }

                                inputsexpurchasestotal = 0;
                                inputsincpurchasestotal = 0;
                                outputexsalestotal = 0;
                                outputincsalestotal = 0;
                                nettotal = 0;
                                taxtotal = 0;
                                taxratetotal = 0;
                                taxtotal1 = 0;
                            }
                            if (subReportRecords.length > 0) {
                                inputsexpurchasestotal = inputsexpurchasestotal + utilityService.convertSubstringParseFloat(subReportRecords[i].inputsexpurchases);
                                inputsincpurchasestotal = inputsincpurchasestotal + utilityService.convertSubstringParseFloat(subReportRecords[i].inputsincpurchases);
                                outputexsalestotal = outputexsalestotal + utilityService.convertSubstringParseFloat(subReportRecords[i].outputexsales);
                                outputincsalestotal = outputincsalestotal + utilityService.convertSubstringParseFloat(subReportRecords[i].outputincsales);
                                nettotal = nettotal + utilityService.convertSubstringParseFloat(subReportRecords[i].totalnet);
                                taxtotal = taxtotal + utilityService.convertSubstringParseFloat(subReportRecords[i].totaltax);
                                taxratetotal = taxratetotal + Number(subReportRecords[i].taxrate2.replace(/[^0-9.-]+/g, "")) || 0;
                                taxtotal1 = taxtotal1 + utilityService.convertSubstringParseFloat(subReportRecords[i].totaltax1);
                            }
                            i++;
                        }
                        templateObject.subReportRecords.set(subReportRecords);

                        if (templateObject.mainReportRecords.get()) {
                            templateObject.stylizeForm();
                        }
                        templateObject.isSub.set(false);
                    });
                    LoadingOverlay.hide();
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
                    LoadingOverlay.hide();
                }

            }).catch(function(err) {
                //Bert.alert('<strong>' + err + '</strong>!', 'danger');
                LoadingOverlay.hide();
            });
        } else {
            let data = JSON.parse(localStorage.getItem('VS1TaxSummary_Report'));
            let totalRecord = [];
            let grandtotalRecord = [];

            if (data.ttaxsummaryreport.length) {
                let records = [];
                let reportrecords = [];
                let allRecords = [];
                let current = [];

                let totalNetAssets = 0;
                let GrandTotalLiability = 0;
                let GrandTotalAsset = 0;
                let incArr = [];
                let cogsArr = [];
                let expArr = [];
                let accountData = data.ttaxsummaryreport;
                let accountType = '';

                for (let i = 0; i < accountData.length; i++) {

                    let inputsexpurchases = utilityService.modifynegativeCurrencyFormat(data.ttaxsummaryreport[i].INPUT_AmountEx) || 0;
                    let inputsincpurchases = utilityService.modifynegativeCurrencyFormat(data.ttaxsummaryreport[i].INPUT_AmountInc) || 0;
                    let outputexsales = utilityService.modifynegativeCurrencyFormat(data.ttaxsummaryreport[i].OUTPUT_AmountEx) || 0;
                    let outputincsales = utilityService.modifynegativeCurrencyFormat(data.ttaxsummaryreport[i].OUTPUT_AmountInc) || 0;
                    let totalnet = utilityService.modifynegativeCurrencyFormat(data.ttaxsummaryreport[i].TotalNet) || 0;
                    let totaltax = utilityService.modifynegativeCurrencyFormat(data.ttaxsummaryreport[i].TotalTax) || 0;
                    let totaltax1 = utilityService.modifynegativeCurrencyFormat(data.ttaxsummaryreport[i].TotalTax1) || 0;
                    var dataList = {
                        id: data.ttaxsummaryreport[i].ID || '',
                        taxcode: data.ttaxsummaryreport[i].TaxCode || '',
                        clientid: data.ttaxsummaryreport[i].ClientID || '',
                        inputsexpurchases: inputsexpurchases,
                        inputsincpurchases: inputsincpurchases,
                        outputexsales: outputexsales,
                        outputincsales: outputincsales,
                        totalnet: totalnet || 0.00,
                        totaltax: totaltax || 0.00,
                        totaltax1: totaltax1 || 0.00,
                        taxrate: (data.ttaxsummaryreport[i].TaxRate * 100).toFixed(2) + '%' || 0,
                        taxrate2: (data.ttaxsummaryreport[i].TaxRate * 100).toFixed(2) || 0

                    };

                    reportrecords.push(dataList);



                    //   if((data.ttaxsummaryreport[i].AmountDue != 0) || (data.ttaxsummaryreport[i].Current != 0)
                    //   || (data.ttaxsummaryreport[i]["30Days"] != 0) || (data.ttaxsummaryreport[i]["60Days"] != 0)
                    // || (data.ttaxsummaryreport[i]["90Days"] != 0) || (data.ttaxsummaryreport[i]["120Days"] != 0)){
                    //  records.push(recordObj);
                    //}



                }

                reportrecords = _.sortBy(reportrecords, 'taxcode');
                templateObject.reportrecords.set(reportrecords);
                //   records = _.sortBy(records, 'SupplierName');
                // records = _.groupBy(records, 'SupplierName');
                for (let key in records) {
                    let obj = [{ key: key }, { data: records[key] }];
                    allRecords.push(obj);
                }

                let iterator = 0;
                let inputsexpurchasestotal = 0;
                let inputsincpurchasestotal = 0;
                let outputexsalestotal = 0;
                let outputincsalestotal = 0;
                let nettotal = 0;
                let taxtotal = 0;
                let taxratetotal = 0;
                let taxtotal1 = 0;
                for (let i = 0; i < reportrecords.length; i++) {



                    const currencyLength = Currency.length;
                    inputsexpurchasestotal = inputsexpurchasestotal + utilityService.convertSubstringParseFloat(reportrecords[i].inputsexpurchases);
                    inputsincpurchasestotal = inputsincpurchasestotal + utilityService.convertSubstringParseFloat(reportrecords[i].inputsincpurchases);
                    outputexsalestotal = outputexsalestotal + utilityService.convertSubstringParseFloat(reportrecords[i].outputexsales);
                    outputincsalestotal = outputincsalestotal + utilityService.convertSubstringParseFloat(reportrecords[i].outputincsales);
                    nettotal = nettotal + utilityService.convertSubstringParseFloat(reportrecords[i].totalnet);
                    taxtotal = taxtotal + utilityService.convertSubstringParseFloat(reportrecords[i].totaltax);
                    taxratetotal = taxratetotal + Number(reportrecords[i].taxrate2.replace(/[^0-9.-]+/g, "")) || 0;
                    taxtotal1 = taxtotal1 + utilityService.convertSubstringParseFloat(reportrecords[i].totaltax1);

                    let val = ['', utilityService.modifynegativeCurrencyFormat(inputsexpurchasestotal), utilityService.modifynegativeCurrencyFormat(inputsincpurchasestotal),
                        utilityService.modifynegativeCurrencyFormat(outputexsalestotal), utilityService.modifynegativeCurrencyFormat(outputincsalestotal), utilityService.modifynegativeCurrencyFormat(nettotal), utilityService.modifynegativeCurrencyFormat(taxtotal), '', utilityService.modifynegativeCurrencyFormat(taxtotal1)
                    ];
                    current.push(val);

                }


                let grandval = ['Grand Total ' + '',
                    // '','',
                    '',
                    '',
                    // '',
                    // '',
                    utilityService.modifynegativeCurrencyFormat(nettotal),

                    // taxratetotal.toFixed(2) + '%' || 0,
                    '',
                    utilityService.modifynegativeCurrencyFormat(taxtotal)
                ];
                // utilityService.modifynegativeCurrencyFormat(taxtotal1)];

                //templateObject.records.set(totalRecord);
                templateObject.grandrecords.set(grandval);


                if (templateObject.reportrecords.get()) {
                    setTimeout(function() {
                        $('td a').each(function() {
                            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                        });
                        $('td').each(function() {
                            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                        });

                        $('td').each(function() {

                            let lineValue = $(this).first().text()[0];
                            if (lineValue != undefined) {
                                if (lineValue.indexOf(Currency) >= 0) $(this).addClass('text-right')
                            }

                        });

                        $('td').each(function() {
                            if ($(this).first().text().indexOf('-' + Currency) >= 0) $(this).addClass('text-right')
                        });

                        $('td:nth-child(8)').each(function() {
                            $(this).addClass('text-right');
                        });
                        LoadingOverlay.hide();
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
                LoadingOverlay.hide();

            }

        }
    };

    templateObject.stylizeForm = function() {
        setTimeout(function() {
            $('td a').each(function() {
                if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
            });
            $('td').each(function() {
                if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
            });

            $('td').each(function() {

                let lineValue = $(this).first().text()[0];
                if (lineValue != undefined) {
                    if (lineValue.indexOf(Currency) >= 0) $(this).addClass('text-right')
                }

            });

            $('td').each(function() {
                if ($(this).first().text().indexOf('-' + Currency) >= 0) $(this).addClass('text-right')
            });

            $('td:nth-child(8)').each(function() {
                $(this).addClass('text-right');
            });
            LoadingOverlay.hide();
        }, 100);
    }

    // var currentDate2 = new Date();
    // var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
    // let getDateFrom = currentDate2.getFullYear() + "-" + (currentDate2.getMonth()) + "-" + currentDate2.getDate();
    // // templateObject.getTaxSummaryReports(getDateFrom, getLoadDate, false);
    templateObject.loadReport(
        GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
        GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
        false);
    templateObject.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateFrom').val()) )

    templateObject.getDepartments = function() {
            let deptrecords = [];
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
        // templateObject.getAllProductData();
    templateObject.getDepartments();




});

Template.taxsummaryreport.events({
    "click .chkAccBasis": function(event) {
        $(".tglAccBasis").toggle();
    },
    "click .rbAccrual": function(event) {
        $(".tglAccBasis").text("Accrual Basis");
        if ($(".chkAccBasis").is(":checked")) {
            // $('.chkAccBasis').trigger('click');
            $(".tglAccBasis").text("Accrual Basis");
        } else if ($(".chkAccBasis").is(":not(:checked)")) {
            $(".tglAccBasis").text("Accrual Basis");
            $(".chkAccBasis").trigger("click");
            $(".chkAccBasis").prop("checked", true);

            // $('.chkAccBasis').trigger('click');
        }
    },
    "click .rbCash": function(event) {
        $(".tglAccBasis").text("Cash Basis");
        if ($(".chkAccBasis").is(":checked")) {
            $(".tglAccBasis").text("Cash Basis");
        } else if ($(".chkAccBasis").is(":not(:checked)")) {
            $(".tglAccBasis").text("Cash Basis");
            $(".chkAccBasis").trigger("click");
            $(".chkAccBasis").prop("checked", true);

            // $('.chkAccBasis').trigger('click');
        }
    },
    "click #ignoreDate":  (e, templateObject) => {
        localStorage.setItem("VS1TaxSummary_Report", "");
        templateObject.loadReport(
          null, 
          null, 
          true
        );
    },
    "change #dateTo, change #dateFrom": (e, templateObject) => {
        templateObject.loadReport(
            GlobalFunctions.convertYearMonthDay($('#dateFrom').val()), 
            GlobalFunctions.convertYearMonthDay($('#dateTo').val()), 
            false
        );
    },
    ...Datehandler.getDateRangeEvents(),
    'click .btnRefresh': function() {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        // localStorage.setItem('VS1TaxSummary_Report', '');
        // Meteor._reload.reload();
        setTimeout(function() {
            var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
            var dateTo = new Date($("#dateTo").datepicker("getDate"));

            let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
            let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

            //templateObject.getTaxSummaryReports(formatDateFrom,formatDateTo,false);
            var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
            //templateObject.dateAsAt.set(formatDate);
            if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {
                // templateObject.getTaxSummaryReports('', '', true);
                templateObject.loadReport('', '', true);
                templateObject.dateAsAt.set('Current Date');
            } else {
                // templateObject.getTaxSummaryReports(formatDateFrom, formatDateTo, false);
                templateObject.loadReport(formatDateFrom, formatDateTo, false);
                templateObject.dateAsAt.set(formatDate);
            }
        }, 100);
        LoadingOverlay.hide();
    },
    'click td a': function(event) {
        let redirectid = $(event.target).closest('tr').attr('id');

        let transactiontype = $(event.target).closest('tr').attr('class');;

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
    'click .btnPrintReport': function(event) {
        playPrintAudio();
        setTimeout(function() {
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
                        if (formIds.includes("278")) {
                            reportData.FormID = 278;
                            Meteor.call('sendNormalEmail', reportData);
                        }
                    } else {
                        if (reportData.FormID == 278)
                            Meteor.call('sendNormalEmail', reportData);
                    }
                }
            });
            document.title = 'Tax Summary Report';
            $(".printReport").print({
                title: document.title + " | Tax Summary | " + loggedCompany,
                noPrintSelector: ".addSummaryEditor",
            });
        }, delayTimeAfterSound);
    },
    'click .btnExportReport': function() {
        LoadingOverlay.show();
        let utilityService = new UtilityService();
        let templateObject = Template.instance();
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        const filename = loggedCompany + '-Tax Summary' + '.csv';
        utilityService.exportReportToCsvTable('tableExport', filename, 'csv');
        let rows = [];
        // reportService.getTaxSummaryData(formatDateFrom,formatDateTo,false).then(function (data) {
        //     if(data.ttaxsummaryreport){
        //         rows[0] = ['Tax Code','INPUTS Ex (Purchases)', 'INPUTS Inc (Purchases)', 'OUTPUTS Ex (Sales)	', 'OUTPUTS Inc (Sales)', 'Total Net', 'Total Tax', 'Tax Rate', 'Total Taxt1'];
        //         data.ttaxsummaryreport.forEach(function (e, i) {
        //             rows.push([
        //               data.ttaxsummaryreport[i].TaxCode,
        //               utilityService.modifynegativeCurrencyFormat(data.ttaxsummaryreport[i].INPUT_AmountEx) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.ttaxsummaryreport[i].INPUT_AmountInc) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.ttaxsummaryreport[i].OUTPUT_AmountEx) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.ttaxsummaryreport[i].OUTPUT_AmountInc) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.ttaxsummaryreport[i].TotalTax) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.ttaxsummaryreport[i].TotalNet) || '0.00',
        //               (data.ttaxsummaryreport[i].TaxRate * 100).toFixed(2) + '%' || 0,
        //             utilityService.modifynegativeCurrencyFormat(data.ttaxsummaryreport[i].TotalTax1) || '0.00']);
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
    'click #mainTaxCode': function(event) {
        const reportData = Template.instance().mainReportRecords.get();
        Template.instance().reportRecords.set(reportData);
        const grandData = Template.instance().mainGrandRecords.get();
        Template.instance().grandRecords.set(grandData);
        Template.instance().isSub.set(false);
        Template.instance().stylizeForm();

    },
    'click #subTaxCode': function(event) {
        const reportData = Template.instance().subReportRecords.get();
        Template.instance().reportRecords.set(reportData);
        const grandData = Template.instance().subGrandRecords.get();
        Template.instance().grandRecords.set(grandData);
        Template.instance().isSub.set(true);
        Template.instance().stylizeForm();
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
Template.taxsummaryreport.helpers({
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
    reportRecords: () => {
        return Template.instance().reportRecords.get();
    },

    mainReportRecords: () => {
        return Template.instance().mainReportRecords.get();
    },

    subReportRecords: () => {
        return Template.instance().subReportRecords.get();
    },

    isSub: () => {
        return Template.instance().isSub.get();
    },

    grandRecords: () => {
        return Template.instance().grandRecords.get();
    },
    mainGrandRecords: () => {
        return Template.instance().mainGrandRecords.get();
    },
    subGrandRecords: () => {
        return Template.instance().subGrandRecords.get();
    },
    dateAsAt: () => {
        return Template.instance().dateAsAt.get() || '-';
    },
    companyname: () => {
        return loggedCompany;
    },
    deptrecords: () => {
        const deptData = Template.instance().deptrecords.get();
        if (deptData) {
            return deptData.sort(function(a, b) {
                if (a.department == 'NA') {
                    return 1;
                } else if (b.department == 'NA') {
                    return -1;
                }
                return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;

            });
        } else {
            return deptData;
        }
    },



    // FX Module //
    convertAmount: (amount, currencyData) => {
        let currencyList = Template.instance().tcurrencyratehistory.get(); // Get tCurrencyHistory

        if (isNaN(amount)) {
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
            isMinus == true ?
            `- ${currencyData.symbol} ${amount}` :
            `${currencyData.symbol} ${amount}`;


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

    formatPrice(amount) {

        let utilityService = new UtilityService();
        if (isNaN(amount)) {
            amount = (amount === undefined || amount === null || amount.length === 0) ? 0 : amount;
            amount = (amount) ? Number(amount.replace(/[^0-9.-]+/g, "")) : 0;
        }
        return utilityService.modifynegativeCurrencyFormat(amount) || 0.00;
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




/**
 *
 */
async function loadCurrency(templateObject) {
    //let templateObject = Template.instance();

    if ((await templateObject.currencyList.get().length) == 0) {
        LoadingOverlay.show();

        let _currencyList = [];
        const result = await taxRateService.getCurrencies();

        //taxRateService.getCurrencies().then((result) => {

        const data = result.tcurrency;

        for (let i = 0; i < data.length; i++) {
            // let taxRate = (data.tcurrency[i].fields.Rate * 100).toFixed(2) + '%';
            var dataList = {
                id: data[i].Id || "",
                code: data[i].Code || "-",
                currency: data[i].Currency || "NA",
                symbol: data[i].CurrencySymbol || "NA",
                buyrate: data[i].BuyRate || "-",
                sellrate: data[i].SellRate || "-",
                country: data[i].Country || "NA",
                description: data[i].CurrencyDesc || "-",
                ratelastmodified: data[i].RateLastModified || "-",
                active: data[i].Code == defaultCurrencyCode ? true : false, // By default if AUD then true
                //active: false,
                // createdAt: new Date(data[i].MsTimeStamp) || "-",
                // formatedCreatedAt: formatDateToString(new Date(data[i].MsTimeStamp))
            };

            _currencyList.push(dataList);
            //}
        }
        _currencyList = _currencyList.sort((a, b) => {
            return a.currency
                .split("")[0]
                .toLowerCase()
                .localeCompare(b.currency.split("")[0].toLowerCase());
        });

        templateObject.currencyList.set(_currencyList);

        await loadCurrencyHistory(templateObject);
        LoadingOverlay.hide();
        //});
    }
}

async function loadCurrencyHistory(templateObject) {
    let result = await taxRateService.getCurrencyHistory();
    const data = result.tcurrencyratehistory;
    templateObject.tcurrencyratehistory.set(data);
    LoadingOverlay.hide();
}