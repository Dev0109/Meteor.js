import {ReactiveVar} from 'meteor/reactive-var';
import { TaxRateService } from "../settings/settings-service";
Template.allreports.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.isBalanceSheet = new ReactiveVar();
    templateObject.isBalanceSheet.set(false);
    templateObject.isProfitLoss = new ReactiveVar();
    templateObject.isProfitLoss.set(false);
    templateObject.isPLMonthly = new ReactiveVar();
    templateObject.isPLMonthly.set(false);
    templateObject.isPLQuarterly = new ReactiveVar();
    templateObject.isPLQuarterly.set(false);
    templateObject.isPLYearly = new ReactiveVar();
    templateObject.isPLYearly.set(false);
    templateObject.isPLYTD = new ReactiveVar();
    templateObject.isPLYTD.set(false);
    templateObject.isJobSalesSummary = new ReactiveVar();
    templateObject.isJobSalesSummary.set(false);
    templateObject.isAgedReceivables = new ReactiveVar();
    templateObject.isAgedReceivables.set(false);
    templateObject.isAgedReceivablesSummary = new ReactiveVar();
    templateObject.isAgedReceivablesSummary.set(false);
    templateObject.isProductSalesReport = new ReactiveVar();
    templateObject.isProductSalesReport.set(false);
    templateObject.isSalesReport = new ReactiveVar();
    templateObject.isSalesReport.set(false);
    templateObject.isJobProfitReport = new ReactiveVar();
    templateObject.isJobProfitReport.set(false);
    templateObject.isSupplierDetails = new ReactiveVar();
    templateObject.isSupplierDetails.set(false);
    templateObject.isSupplierProduct = new ReactiveVar();
    templateObject.isSupplierProduct.set(false);
    templateObject.isCustomerDetails = new ReactiveVar();
    templateObject.isCustomerDetails.set(false);
    templateObject.isCustomerSummary = new ReactiveVar();
    templateObject.isCustomerSummary.set(false);
    templateObject.isLotReport = new ReactiveVar();
    templateObject.isLotReport.set(false);
    templateObject.isStockValue = new ReactiveVar();
    templateObject.isStockValue.set(false);
    templateObject.isStockQuantity = new ReactiveVar();
    templateObject.isStockQuantity.set(false);
    templateObject.isStockMovementReport = new ReactiveVar();
    templateObject.isStockMovementReport.set(false);
    templateObject.isPayrollHistoryReport = new ReactiveVar();
    templateObject.isPayrollHistoryReport.set(false);
    templateObject.isForeignExchangeHistoryList = new ReactiveVar();
    templateObject.isForeignExchangeHistoryList.set(false);
    templateObject.isForeignExchangeList = new ReactiveVar();
    templateObject.isForeignExchangeList.set(false);
    templateObject.isSalesSummaryReport = new ReactiveVar();
    templateObject.isSalesSummaryReport.set(false);
    templateObject.isGeneralLedger = new ReactiveVar();
    templateObject.isGeneralLedger.set(false);
    templateObject.isTaxSummaryReport = new ReactiveVar();
    templateObject.isTaxSummaryReport.set(false);
    templateObject.isTrialBalance = new ReactiveVar();
    templateObject.isTrialBalance.set(false);
    templateObject.isTimeSheetSummary = new ReactiveVar();
    templateObject.isTimeSheetSummary.set(false);
    templateObject.isPayrollLeaveAccrued = new ReactiveVar();
    templateObject.isPayrollLeaveAccrued.set(false);
    templateObject.isPayrollLeaveTaken = new ReactiveVar();
    templateObject.isPayrollLeaveTaken.set(false);
    templateObject.isSerialNumberReport = new ReactiveVar();
    templateObject.isSerialNumberReport.set(false);
    templateObject.is1099Transaction = new ReactiveVar();
    templateObject.is1099Transaction.set(false);
    templateObject.isAccountsLists = new ReactiveVar();
    templateObject.isAccountsLists.set(false);
    templateObject.isBinLocations = new ReactiveVar();
    templateObject.isBinLocations.set(false);
    templateObject.isTransactionJournal = new ReactiveVar();
    templateObject.isTransactionJournal.set(false);
    templateObject.isUnpaidBills = new ReactiveVar();
    templateObject.isUnpaidBills.set(false);
    templateObject.isUnpaidPO = new ReactiveVar();
    templateObject.isUnpaidPO.set(false);
    templateObject.isBackOrderedPO = new ReactiveVar();
    templateObject.isBackOrderedPO.set(false);
    templateObject.isSalesOrderConverted = new ReactiveVar();
    templateObject.isSalesOrderConverted.set(false);
    templateObject.isSalesOrderUnconverted = new ReactiveVar();
    templateObject.isSalesOrderUnconverted.set(false);
    templateObject.isPaymentMethodsList = new ReactiveVar();
    templateObject.isPaymentMethodsList.set(false);
    templateObject.isBackOrderedInvoices = new ReactiveVar();
    templateObject.isBackOrderedInvoices.set(false);
    templateObject.isQuotesConverted = new ReactiveVar();
    templateObject.isQuotesConverted.set(false);
    templateObject.isQuotesUnconverted = new ReactiveVar();
    templateObject.isQuotesUnconverted.set(false);
    templateObject.isInvoicesPaid = new ReactiveVar();
    templateObject.isInvoicesPaid.set(false);
    templateObject.isInvoicesUnpaid = new ReactiveVar();
    templateObject.isInvoicesUnpaid.set(false);
    templateObject.isTimeSheetDetails = new ReactiveVar();
    templateObject.isTimeSheetDetails.set(false);
    templateObject.isChequeList = new ReactiveVar();
    templateObject.isChequeList.set(false);
    templateObject.isJournalEntryList = new ReactiveVar();
    templateObject.isJournalEntryList.set(false);
    templateObject.isStockAdjustmentList = new ReactiveVar();
    templateObject.isStockAdjustmentList.set(false);
    templateObject.isAgedPayables = new ReactiveVar();
    templateObject.isAgedPayables.set(false);
    templateObject.isAgedPayablesSummary = new ReactiveVar();
    templateObject.isAgedPayablesSummary.set(false);
    templateObject.isPurchaseReport = new ReactiveVar();
    templateObject.isPurchaseReport.set(false);
    templateObject.isPurchaseSummaryReport = new ReactiveVar();
    templateObject.isPurchaseSummaryReport.set(false);
    templateObject.isPrintStatement = new ReactiveVar();
    templateObject.isPrintStatement.set(false);
    templateObject.isExecutiveSummary = new ReactiveVar();
    templateObject.isExecutiveSummary.set(false);
    templateObject.isCashReport = new ReactiveVar();
    templateObject.isCashReport.set(false);
    templateObject.isProfitabilityReport = new ReactiveVar();
    templateObject.isProfitabilityReport.set(false);
    templateObject.isPerformanceReport = new ReactiveVar();
    templateObject.isPerformanceReport.set(false);
    templateObject.isBalanceSheetReport = new ReactiveVar();
    templateObject.isBalanceSheetReport.set(false);
    templateObject.isIncomeReport = new ReactiveVar();
    templateObject.isIncomeReport.set(false);
    templateObject.isPositionReport = new ReactiveVar();
    templateObject.isPositionReport.set(false);
    templateObject.accountantList = new ReactiveVar([]);
});
Template.allreports.onRendered(() => {
    let templateObject = Template.instance();
    let isBalanceSheet = Session.get('cloudBalanceSheet');
    let isProfitLoss = Session.get('cloudProfitLoss');
    let isPLMonthly = Session.get('cloudPLMonthly');
    let isPLQuarterly = Session.get('cloudPLQuarterly');
    let isPLYearly = Session.get('cloudPLYearly');
    let isPLYTD = Session.get('cloudPLYTD');
    let isJobSalesSummary = Session.get('cloudJobSalesSummary');
    let isAgedReceivables = Session.get('cloudAgedReceivables');
    let isAgedReceivablesSummary = Session.get('cloudAgedReceivablesSummary');
    let isProductSalesReport = Session.get('cloudProductSalesReport');
    let isSalesReport = Session.get('cloudSalesReport');
    let isJobProfitReport = Session.get('cloudJobProfit');
    let isSupplierDetails = Session.get('cloudSupplierDetails');
    let isSupplierProduct = Session.get('cloudSupplierProduct');
    let isCustomerDetails = Session.get('cloudCustomerDetails');
    let isCustomerSummary = Session.get('cloudCustomerSummary');
    let isLotReport = Session.get('cloudLotReport');
    let isStockValue = Session.get('cloudStockValue');
    let isStockQuantity = Session.get('cloudStockQuantity');
    let isStockMovementReport = Session.get('cloudStockMovementReport');
    let isPayrollHistoryReport = Session.get('cloudPayrollHistoryReport');
    let isForeignExchangeHistoryList = Session.get('cloudForeignExchangeHistoryList');
    let isForeignExchangeList = Session.get('cloudForeignExchangeList');
    let isSalesSummaryReport = Session.get('cloudSalesSummaryReport');
    let isGeneralLedger = Session.get('cloudGeneralLedger');
    let isTaxSummaryReport = Session.get('cloudTaxSummaryReport');
    let isTrialBalance = Session.get('cloudTrialBalance');
    let isTimeSheetSummary = Session.get('cloudTimeSheetSummary');
    let isPayrollLeaveAccrued = Session.get('cloudPayrollLeaveAccrued');
    let isPayrollLeaveTaken = Session.get('cloudPayrollLeaveTaken');
    let isSerialNumberReport = Session.get('cloudSerialNumberReport');
    let is1099Transaction = Session.get('cloud1099Transaction');
    let isAccountsLists = Session.get('cloudAccountList');
    let isBinLocations = Session.get('cloudBinLocations');
    let isTransactionJournal = Session.get('cloudTransactionJournal');
    let isUnpaidBills = Session.get('cloudBillsUnpaid');
    let isUnpaidPO = Session.get('cloudPurchaseOrderUnpaid');
    let isBackOrderedPO = Session.get('cloudPurchaseOrderBO');
    let isSalesOrderConverted = Session.get('cloudSalesOrderConverted');
    let isSalesOrderUnconverted = Session.get('cloudSalesOrderUnconverted');
    let isPaymentMethodsList = Session.get('cloudPaymentMethodList');
    let isBackOrderedInvoices = Session.get('cloudInvoicesBackOrdered');
    let isQuotesConverted = Session.get('cloudQuotesConverted');
    let isQuotesUnconverted = Session.get('cloudQuotesUnconverted');
    let isInvoicesPaid = Session.get('cloudInvoicesPaid');
    let isInvoicesUnpaid = Session.get('cloudInvoicesUnpaid');
    let isTimeSheetDetails = Session.get('cloudTimeSheet');
    let isChequeList = Session.get('cloudChequeList');
    let isStockAdjustmentList = Session.get('cloudStockAdjustmentList');
    let isJournalEntryList = Session.get('cloudJournalEntryList');
    let isAgedPayables = Session.get('cloudAgedPayables');
    let isAgedPayablesSummary = Session.get('cloudAgedPayablesSummary');
    let isPurchaseReport = Session.get('cloudPurchaseReport');
    let isPurchaseSummaryReport = Session.get('cloudPurchaseSummaryReport');
    let isPrintStatement = Session.get('cloudPrintStatement');
    let isExecutiveSummary = Session.get('cloudExecutiveSummary');
    let isCashReport = Session.get('cloudCashReport');
    let isProfitabilityReport = Session.get('cloudProfitabilityReport');
    let isPerformanceReport = Session.get('cloudPerformanceReport');
    let isBalanceSheetReport = Session.get('cloudBalanceSheetReport');
    let isIncomeReport = Session.get('cloudIncomeReport');
    let isPositionReport = Session.get('cloudPositionReport');
    const taxRateService = new TaxRateService();

    const accountantList = [];

    if (isProfitLoss == true) {
        templateObject.isProfitLoss.set(true);
    }
    if (isPLMonthly == true) {
        templateObject.isPLMonthly.set(true);
    }
    if (isPLQuarterly == true) {
        templateObject.isPLQuarterly.set(true);
    }
    if (isPLYearly == true) {
        templateObject.isPLYearly.set(true);
    }
    if (isPLYTD == true) {
        templateObject.isPLYTD.set(true);
    }
    if (isJobSalesSummary == true) {
        templateObject.isJobSalesSummary.set(true);
    }
    if (isBalanceSheet == true) {
        templateObject.isBalanceSheet.set(true);
    }
    if (isAgedReceivables == true) {
        templateObject.isAgedReceivables.set(true);
    }
    if (isAgedReceivablesSummary == true) {
        templateObject.isAgedReceivablesSummary.set(true);
    }
    if (isProductSalesReport == true) {
        templateObject.isProductSalesReport.set(true);
    }
    if (isSalesReport == true) {
        templateObject.isSalesReport.set(true);
    }
    if (isJobProfitReport == true) {
        templateObject.isJobProfitReport.set(true);
    }
    if (isSupplierDetails == true) {
        templateObject.isSupplierDetails.set(true);
    }
    if (isSupplierProduct == true) {
        templateObject.isSupplierProduct.set(true);
    }
    if (isCustomerDetails == true) {
        templateObject.isCustomerDetails.set(true);
    }
    if (isCustomerSummary == true) {
        templateObject.isCustomerSummary.set(true);
    }
    if (isLotReport == true) {
        templateObject.isLotReport.set(true);
    }
    if (isStockValue == true) {
        templateObject.isStockValue.set(true);
    }
    if (isStockQuantity == true) {
        templateObject.isStockQuantity.set(true);
    }
    if (isStockMovementReport == true) {
        templateObject.isStockMovementReport.set(true);
    }
    if (isPayrollHistoryReport == true) {
        templateObject.isPayrollHistoryReport.set(true);
    }
    if (isForeignExchangeHistoryList == true) {
        templateObject.isForeignExchangeHistoryList.set(true);
    }
    if (isForeignExchangeList == true) {
        templateObject.isForeignExchangeList.set(true);
    }
    if (isSalesSummaryReport == true) {
        templateObject.isSalesSummaryReport.set(true);
    }
    if (isGeneralLedger == true) {
        templateObject.isGeneralLedger.set(true);
    }
    if (isTaxSummaryReport == true) {
        templateObject.isTaxSummaryReport.set(true);
    }
    if (isTrialBalance == true) {
        templateObject.isTrialBalance.set(true);
    }
    if (isTimeSheetSummary == true) {
        templateObject.isTimeSheetSummary.set(true);
    }
    if (isPayrollLeaveAccrued == true) {
        templateObject.isPayrollLeaveAccrued.set(true);
    }
    if (isPayrollLeaveTaken == true) {
        templateObject.isPayrollLeaveTaken.set(true);
    }
    if (isSerialNumberReport == true) {
        templateObject.isSerialNumberReport.set(true);
    }
    if (is1099Transaction == true) {
        templateObject.is1099Transaction.set(true);
    }
    if (isAccountsLists == true) {
        templateObject.isAccountsLists.set(true);
    }
    if (isBinLocations == true) {
        templateObject.isBinLocations.set(true);
    }
    if (isTransactionJournal == true) {
        templateObject.isTransactionJournal.set(true);
    }
    if (isUnpaidBills == true) {
        templateObject.isUnpaidBills.set(true);
    }
    if (isUnpaidPO == true) {
        templateObject.isUnpaidPO.set(true);
    }
    if (isBackOrderedPO == true) {
        templateObject.isBackOrderedPO.set(true);
    }
    if (isSalesOrderConverted == true) {
        templateObject.isSalesOrderConverted.set(true);
    }
    if (isSalesOrderUnconverted == true) {
        templateObject.isSalesOrderUnconverted.set(true);
    }
    if (isPaymentMethodsList == true) {
        templateObject.isPaymentMethodsList.set(true);
    }
    if (isBackOrderedInvoices == true) {
        templateObject.isBackOrderedInvoices.set(true);
    }
    if (isQuotesConverted == true) {
        templateObject.isQuotesConverted.set(true);
    }
    if (isQuotesUnconverted == true) {
        templateObject.isQuotesUnconverted.set(true);
    }
    if (isInvoicesPaid == true) {
        templateObject.isInvoicesPaid.set(true);
    }
    if (isInvoicesUnpaid == true) {
        templateObject.isInvoicesUnpaid.set(true);
    }
    if (isTimeSheetDetails == true) {
        templateObject.isTimeSheetDetails.set(true);
    }
    if (isChequeList == true) {
        templateObject.isChequeList.set(true);
    }
    if (isStockAdjustmentList == true) {
        templateObject.isStockAdjustmentList.set(true);
    }
    if (isJournalEntryList == true) {
        templateObject.isJournalEntryList.set(true);
    }
    if (isAgedPayables == true) {
        templateObject.isAgedPayables.set(true);
    }
    if (isAgedPayablesSummary == true) {
        templateObject.isAgedPayablesSummary.set(true);
    }
    if (isPurchaseReport == true) {
        templateObject.isPurchaseReport.set(true);
    }
    if (isPurchaseSummaryReport == true) {
        templateObject.isPurchaseSummaryReport.set(true);
    }
    if (isPrintStatement == true) {
        templateObject.isPrintStatement.set(true);
    }
    if (isExecutiveSummary == true) {
        templateObject.isExecutiveSummary.set(true);
    }
    if (isCashReport == true) {
        templateObject.isCashReport.set(true);
    }
    if (isProfitabilityReport == true) {
        templateObject.isProfitabilityReport.set(true);
    }
    if (isPerformanceReport == true) {
        templateObject.isPerformanceReport.set(true);
    }
    if (isBalanceSheetReport == true) {
        templateObject.isBalanceSheetReport.set(true);
    }
    if (isIncomeReport == true) {
        templateObject.isIncomeReport.set(true);
    }
    if (isPositionReport == true) {
        templateObject.isPositionReport.set(true);
    }
    templateObject.getAccountantList = function() {
        getVS1Data('TReportsAccountantsCategory').then(function(dataObject) {

                //         if(dataObject.length == 0){
                //           taxRateService.getAccountantCategory().then(function (data) {
                //               let lineItems = [];
                //               let lineItemObj = {};
                //               for(let i=0; i<data.tdeptclass.length; i++){
                //                   var dataList = {
                //                     id: data.tdeptclass[i].Id || ' ',
                //                     firstname: data.tdeptclass[i].FirstName || '-',
                //                     lastname: data.tdeptclass[i].LastName || '-',
                //                     companyname: data.tdeptclass[i].CompanyName || '-',
                //                     address: data.tdeptclass[i].Address || '-',
                //                     docname: data.tdeptclass[i].DocName || '-',
                //                     towncity: data.tdeptclass[i].TownCity || '-',
                //                     postalzip: data.tdeptclass[i].PostalZip || '-',
                //                     stateregion: data.tdeptclass[i].StateRegion || '-',
                //                     country: data.tdeptclass[i].Country || '-',
                //                     status:data.tdeptclass[i].Active || 'false',
                //                   };

                //                   dataTableList.push(dataList);
                //               }

                //               templateObject.datatablerecords.set(dataTableList);

                //               if(templateObject.datatablerecords.get()){

                //                   Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'accountantList', function(error, result){
                //                       if(error){

                //                       }else{
                //                           if(result){
                //                               for (let i = 0; i < result.customFields.length; i++) {
                //                                   let customcolumn = result.customFields;
                //                                   let columData = customcolumn[i].label;
                //                                   let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                //                                   let hiddenColumn = customcolumn[i].hidden;
                //                                   let columnClass = columHeaderUpdate.split('.')[1];
                //                                   let columnWidth = customcolumn[i].width;
                //                                   let columnindex = customcolumn[i].index + 1;

                //                                   if(hiddenColumn == true){
                //                                       $("."+columnClass+"").addClass('hiddenColumn');
                //                                       $("."+columnClass+"").removeClass('showColumn');
                //                                   }
                //                                   else if(hiddenColumn == false){
                //                                       $("."+columnClass+"").removeClass('hiddenColumn');
                //                                       $("."+columnClass+"").addClass('showColumn');
                //                                   }
                //                               }
                //                           }
                //                       }
                //                   });

                //                   setTimeout(function () {
                //                       MakeNegative();
                //                   }, 100);
                //               }

                //               $('.fullScreenSpin').css('display','none');
                //               setTimeout(function () {
                //                   $('#accountantList').DataTable({
                //                       columnDefs: [
                //                           {type: 'date', targets: 0},
                //                           { "orderable": false, "targets": -1 }
                //                       ],
                //                       "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                //                       buttons: [
                //                           {
                //                               extend: 'excelHtml5',
                //                               text: '',
                //                               download: 'open',
                //                               className: "btntabletocsv hiddenColumn",
                //                               filename: "departmentlist_"+ moment().format(),
                //                               orientation:'portrait',
                //                               exportOptions: {
                //                                   columns: ':visible'
                //                               }
                //                           },{
                //                               extend: 'print',
                //                               download: 'open',
                //                               className: "btntabletopdf hiddenColumn",
                //                               text: '',
                //                               title: 'Department List',
                //                               filename: "departmentlist_"+ moment().format(),
                //                               exportOptions: {
                //                                   columns: ':visible'
                //                               }
                //                           }],
                //                       select: true,
                //                       destroy: true,
                //                       colReorder: true,
                //                       colReorder: {
                //                           fixedColumnsRight: 1
                //                       },
                //                       // bStateSave: true,
                //                       // rowId: 0,
                //                       paging: false,
                // //                      "scrollY": "400px",
                // //                      "scrollCollapse": true,
                //                       info: true,
                //                       responsive: true,
                //                       "order": [[ 0, "asc" ]],
                //                       action: function () {
                //                           $('#accountantList').DataTable().ajax.reload();
                //                       },
                //                       "fnDrawCallback": function (oSettings) {
                //                           setTimeout(function () {
                //                               MakeNegative();
                //                           }, 100);
                //                       },

                //                   }).on('page', function () {
                //                       setTimeout(function () {
                //                           MakeNegative();
                //                       }, 100);
                //                       let draftRecord = templateObject.datatablerecords.get();
                //                       templateObject.datatablerecords.set(draftRecord);
                //                   }).on('column-reorder', function () {

                //                   }).on( 'length.dt', function ( e, settings, len ) {
                //                       setTimeout(function () {
                //                           MakeNegative();
                //                       }, 100);
                //                   });

                //                   // $('#accountantList').DataTable().column( 0 ).visible( true );
                //                   $('.fullScreenSpin').css('display','none');
                //               }, 0);

                //               var columns = $('#accountantList th');
                //               let sTible = "";
                //               let sWidth = "";
                //               let sIndex = "";
                //               let sVisible = "";
                //               let columVisible = false;
                //               let sClass = "";
                //               $.each(columns, function(i,v) {
                //                   if(v.hidden == false){
                //                       columVisible =  true;
                //                   }
                //                   if((v.className.includes("hiddenColumn"))){
                //                       columVisible = false;
                //                   }
                //                   sWidth = v.style.width.replace('px', "");

                //                   let datatablerecordObj = {
                //                       sTitle: v.innerText || '',
                //                       sWidth: sWidth || '',
                //                       sIndex: v.cellIndex || '',
                //                       sVisible: columVisible || false,
                //                       sClass: v.className || ''
                //                   };
                //                   tableHeaderList.push(datatablerecordObj);
                //               });
                //               templateObject.tableheaderrecords.set(tableHeaderList);
                //               $('div.dataTables_filter input').addClass('form-control form-control-sm');

                //           }).catch(function (err) {
                //               swal({
                //                   title: 'Oooops...',
                //                   text: err,
                //                   type: 'error',
                //                   showCancelButton: false,
                //                   confirmButtonText: 'Try Again'
                //               }).then((result) => {
                //                   if (result.value) {
                //                       Meteor._reload.reload();
                //                   } else if (result.dismiss === 'cancel') {

                //                   }
                //               });
                //               $('.fullScreenSpin').css('display','none');
                //               // Meteor._reload.reload();
                //           });
                //         }
                //         else{
                let data = JSON.parse(dataObject[0].data);

                // for(let i=0; i<useData.length; i++){
                var dataInfo = {
                    id: data.Id || '',
                    firstname: data.FirstName || '-',
                    lastname: data.LastName || '-',
                    companyname: data.CompanyName || '-',
                    address: data.Address || '-',
                    towncity: data.TownCity || '-',
                    postalzip: data.PostalZip || '-',
                    stateregion: data.StateRegion || '-',
                    country: data.Country || '-',
                };
                accountantList.push(dataInfo);
                // }
                templateObject.accountantList.set(accountantList);
                // }
            })
            .catch(function(err) {
                taxRateService.getAccountantCategory().then(function(data) {
                    for (let i = 0; i < data.tdeptclass.length; i++) {
                        var dataList = {
                            id: data.tdeptclass[i].Id || '',
                            firstname: data.tdeptclass[i].FirstName || '-',
                            lastname: data.tdeptclass[i].LastName || '-',
                            companyname: data.tdeptclass[i].CompanyName || '-',
                            address: data.tdeptclass[i].Address || '-',
                            docname: data.tdeptclass[i].DocName || '-',
                            towncity: data.tdeptclass[i].TownCity || '-',
                            postalzip: data.tdeptclass[i].PostalZip || '-',
                            stateregion: data.tdeptclass[i].StateRegion || '-',
                            country: data.tdeptclass[i].Country || '-',
                            status: data.tdeptclass[i].Active || 'false',
                        };

                        accountantList.push(dataList);
                    }

                    templateObject.accountantList.set(accountantList);

                }).catch(function(err) {

                });
            });
    }
    templateObject.getAccountantList();

    $('.c-report-favourite-icon').on("click", function() {
        if (!$(this).hasClass('marked-star')) {
            $(this).addClass('marked-star');
        } else {
            $(this).removeClass('marked-star');
        }
    });
});
Template.allreports.events({
    'click .reportComingSoon': function(event) {
        swal('Coming Soon', '', 'info');
    },
    'click .chkBalanceSheet': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudBalanceSheet', true);
            templateObject.isBalanceSheet.set(true);
        } else {
            Session.setPersistent('cloudBalanceSheet', false);
            templateObject.isBalanceSheet.set(false);
        }
    },
    'click .chkProfitLoss': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudProfitLoss', true);
            templateObject.isProfitLoss.set(true);
        } else {
            Session.setPersistent('cloudProfitLoss', false);
            templateObject.isProfitLoss.set(false);
        }
    },
    'click .chkPLMonthly': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudPLMonthly', true);
            templateObject.isPLMonthly.set(true);
        } else {
            Session.setPersistent('cloudPLMonthly', false);
            templateObject.isPLMonthly.set(false);
        }
    },
    'click .chkPLQuarterly': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudPLQuarterly', true);
            templateObject.isPLQuarterly.set(true);
        } else {
            Session.setPersistent('cloudPLQuarterly', false);
            templateObject.isPLQuarterly.set(false);
        }
    },
    'click .chkPLYearly': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudPLYearly', true);
            templateObject.isPLYearly.set(true);
        } else {
            Session.setPersistent('cloudPLYearly', false);
            templateObject.isPLYearly.set(false);
        }
    },
    'click .chkPLYTD': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudPLYTD', true);
            templateObject.isPLYTD.set(true);
        } else {
            Session.setPersistent('cloudPLYTD', false);
            templateObject.isPLYTD.set(false);
        }
    },
    'click .chkJobSalesSummary': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudJobSalesSummary', true);
            templateObject.isJobSalesSummary.set(true);
        } else {
            Session.setPersistent('cloudJobSalesSummary', false);
            templateObject.isJobSalesSummary.set(false);
        }
    },
    'click .chkAgedReceivables': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudAgedReceivables', true);
            templateObject.isAgedReceivables.set(true);
        } else {
            Session.setPersistent('cloudAgedReceivables', false);
            templateObject.isAgedReceivables.set(false);
        }
    },
    'click .chkAgedReceivablesSummary': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudAgedReceivablesSummary', true);
            templateObject.isAgedReceivablesSummary.set(true);
        } else {
            Session.setPersistent('cloudAgedReceivablesSummary', false);
            templateObject.isAgedReceivablesSummary.set(false);
        }
    },
    'click .chkProductSalesReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudProductSalesReport', true);
            templateObject.isProductSalesReport.set(true);
        } else {
            Session.setPersistent('cloudProductSalesReport', false);
            templateObject.isProductSalesReport.set(false);
        }
    },
    'click .chkSalesReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudSalesReport', true);
            templateObject.isSalesReport.set(true);
        } else {
            Session.setPersistent('cloudSalesReport', false);
            templateObject.isSalesReport.set(false);
        }
    },
    'click .chkJobProfitReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudJobProfit', true);
            templateObject.isJobProfitReport.set(true);
        } else {
            Session.setPersistent('cloudJobProfit', false);
            templateObject.isJobProfitReport.set(false);
        }
    },
    'click .chkSupplierDetails': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudSupplierDetails', true);
            templateObject.isSupplierDetails.set(true);
        } else {
            Session.setPersistent('cloudSupplierDetails', false);
            templateObject.isSupplierDetails.set(false);
        }
    },
    'click .chkSupplierProduct': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudSupplierProduct', true);
            templateObject.isSupplierProduct.set(true);
        } else {
            Session.setPersistent('cloudSupplierProduct', false);
            templateObject.isSupplierProduct.set(false);
        }
    },
    'click .chkCustomerDetails': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudCustomerDetails', true);
            templateObject.isCustomerDetails.set(true);
        } else {
            Session.setPersistent('cloudCustomerDetails', false);
            templateObject.isCustomerDetails.set(false);
        }
    },
    'click .chkCustomerSummary': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudCustomerSummary', true);
            templateObject.isCustomerSummary.set(true);
        } else {
            Session.setPersistent('cloudCustomerSummary', false);
            templateObject.isCustomerSummary.set(false);
        }
    },
    'click .chkLotReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudLotReport', true);
            templateObject.isLotReport.set(true);
        } else {
            Session.setPersistent('cloudLotReport', false);
            templateObject.isLotReport.set(false);
        }
    },
    'click .chkStockValue': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudStockValue', true);
            templateObject.isStockValue.set(true);
        } else {
            Session.setPersistent('cloudStockValue', false);
            templateObject.isStockValue.set(false);
        }
    },
    'click .chkStockQuantity': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudStockQuantity', true);
            templateObject.isStockQuantity.set(true);
        } else {
            Session.setPersistent('cloudStockQuantity', false);
            templateObject.isStockQuantity.set(false);
        }
    },
    'click .chkStockMovementReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudStockMovementReport', true);
            templateObject.isStockMovementReport.set(true);
        } else {
            Session.setPersistent('cloudStockMovementReport', false);
            templateObject.isStockMovementReport.set(false);
        }
    },
    'click .chkPayrollHistoryReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudPayrollHistoryReport', true);
            templateObject.isPayrollHistoryReport.set(true);
        } else {
            Session.setPersistent('cloudPayrollHistoryReport', false);
            templateObject.isPayrollHistoryReport.set(false);
        }
    },
    'click .chkForeignExchangeHistoryList': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudForeignExchangeHistoryList', true);
            templateObject.isForeignExchangeHistoryList.set(true);
        } else {
            Session.setPersistent('cloudForeignExchangeHistoryList', false);
            templateObject.isForeignExchangeHistoryList.set(false);
        }
    },
    'click .chkForeignExchangeList': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudForeignExchangeList', true);
            templateObject.isForeignExchangeList.set(true);
        } else {
            Session.setPersistent('cloudForeignExchangeList', false);
            templateObject.isForeignExchangeList.set(false);
        }
    },
    'click .chkSalesSummaryReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudSalesSummaryReport', true);
            templateObject.isSalesSummaryReport.set(true);
        } else {
            Session.setPersistent('cloudSalesSummaryReport', false);
            templateObject.isSalesSummaryReport.set(false);
        }
    },
    'click .chkGeneralLedger': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudGeneralLedger', true);
            templateObject.isGeneralLedger.set(true);
        } else {
            Session.setPersistent('cloudGeneralLedger', false);
            templateObject.isGeneralLedger.set(false);
        }
    },
    'click .chkTaxSummaryReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudTaxSummaryReport', true);
            templateObject.isTaxSummaryReport.set(true);
        } else {
            Session.setPersistent('cloudTaxSummaryReport', false);
            templateObject.isTaxSummaryReport.set(false);
        }
    },
    'click .chkTrialBalance': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudTrialBalance', true);
            templateObject.isTrialBalance.set(true);
        } else {
            Session.setPersistent('cloudTrialBalance', false);
            templateObject.isTrialBalance.set(false);
        }
    },
    'click .chkTimeSheetSummary': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudTimeSheetSummary', true);
            templateObject.isTimeSheetSummary.set(true);
        } else {
            Session.setPersistent('cloudTimeSheetSummary', false);
            templateObject.isTimeSheetSummary.set(false);
        }
    },
    'click .chkSerialNumberReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudSerialNumberReport', true);
            templateObject.isSerialNumberReport.set(true);
        } else {
            Session.setPersistent('cloudSerialNumberReport', false);
            templateObject.isSerialNumberReport.set(false);
        }
    },
    'click .chk1099Transaction': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloud1099Transaction', true);
            templateObject.is1099Transaction.set(true);
        } else {
            Session.setPersistent('cloud1099Transaction', false);
            templateObject.is1099Transaction.set(false);
        }
    },
    'click .chkAccountsLists': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudAccountList', true);
            templateObject.isAccountsLists.set(true);
        } else {
            Session.setPersistent('cloudAccountList', false);
            templateObject.isAccountsLists.set(false);
        }
    },
    'click .chkBinLocationsList': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudBinLocations', true);
            templateObject.isBinLocations.set(true);
        } else {
            Session.setPersistent('cloudBinLocations', false);
            templateObject.isBinLocations.set(false);
        }
    },
    'click .chkTransactionJournal': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudTransactionJournal', true);
            templateObject.isTransactionJournal.set(true);
        } else {
            Session.setPersistent('cloudTransactionJournal', false);
            templateObject.isTransactionJournal.set(false);
        }
    },
    'click .chkUnpaidBills': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudBillsUnpaid', true);
            templateObject.isUnpaidBills.set(true);
        } else {
            Session.setPersistent('cloudBillsUnpaid', false);
            templateObject.isUnpaidBills.set(false);
        }
    },
    'click .chkUnpaidPO': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudPurchaseOrderBO', true);
            templateObject.isUnpaidPO.set(true);
        } else {
            Session.setPersistent('cloudPurchaseOrderBO', false);
            templateObject.isUnpaidPO.set(false);
        }
    },
    'click .chkBackOrderedPO': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudPurchaseOrderBO', true);
            templateObject.isBackOrderedPO.set(true);
        } else {
            Session.setPersistent('cloudPurchaseOrderBO', false);
            templateObject.isBackOrderedPO.set(false);
        }
    },
    'click .chkSalesOrderConverted': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudSalesOrderConverted', true);
            templateObject.isSalesOrderConverted.set(true);
        } else {
            Session.setPersistent('cloudSalesOrderConverted', false);
            templateObject.isSalesOrderConverted.set(false);
        }
    },
    'click .chkSalesOrderUnconverted': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudSalesOrderUnconverted', true);
            templateObject.isSalesOrderUnconverted.set(true);
        } else {
            Session.setPersistent('cloudSalesOrderUnconverted', false);
            templateObject.isSalesOrderUnconverted.set(false);
        }
    },
    'click .chkPaymentMethodsList': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudPaymentMethodList', true);
            templateObject.isPaymentMethodsList.set(true);
        } else {
            Session.setPersistent('cloudPaymentMethodList', false);
            templateObject.isPaymentMethodsList.set(false);
        }
    },
    'click .chkBackOrderedInvoices': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudInvoicesBackOrdered', true);
            templateObject.isBackOrderedInvoices.set(true);
        } else {
            Session.setPersistent('cloudInvoicesBackOrdered', false);
            templateObject.isBackOrderedInvoices.set(false);
        }
    },
    'click .chkQuotesConverted': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudQuotesConverted', true);
            templateObject.isQuotesConverted.set(true);
        } else {
            Session.setPersistent('cloudQuotesConverted', false);
            templateObject.isQuotesConverted.set(false);
        }
    },
    'click .chkQuotesUnconverted': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudQuotesUnconverted', true);
            templateObject.isQuotesUnconverted.set(true);
        } else {
            Session.setPersistent('cloudQuotesUnconverted', false);
            templateObject.isQuotesUnconverted.set(false);
        }
    },
    'click .chkInvoicesPaid': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudInvoicesPaid', true);
            templateObject.isInvoicesPaid.set(true);
        } else {
            Session.setPersistent('cloudInvoicesPaid', false);
            templateObject.isInvoicesPaid.set(false);
        }
    },
    'click .chkInvoicesUnpaid': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudInvoicesUnpaid', true);
            templateObject.isInvoicesUnpaid.set(true);
        } else {
            Session.setPersistent('cloudInvoicesUnpaid', false);
            templateObject.isInvoicesUnpaid.set(false);
        }
    },
    'click .chkTimeSheet': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudTimeSheet', true);
            templateObject.isTimeSheetDetails.set(true);
        } else {
            Session.setPersistent('cloudTimeSheet', false);
            templateObject.isTimeSheetDetails.set(false);
        }
    },
    'click .chkChequeList': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudChequeList', true);
            templateObject.isChequeList.set(true);
        } else {
            Session.setPersistent('cloudChequeList', false);
            templateObject.isChequeList.set(false);
        }
    },
    'click .chkPayrollLeaveAccrued': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudPayrollLeaveAccrued', true);
            templateObject.isPayrollLeaveAccrued.set(true);
        } else {
            Session.setPersistent('cloudPayrollLeaveAccrued', false);
            templateObject.isPayrollLeaveAccrued.set(false);
        }
    },
    'click .chkPayrollLeaveTaken': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudPayrollLeaveTaken', true);
            templateObject.isPayrollLeaveTaken.set(true);
        } else {
            Session.setPersistent('cloudPayrollLeaveTaken', false);
            templateObject.isPayrollLeaveTaken.set(false);
        }
    },
    'click .chkStockAdjustmentList': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudStockAdjustmentList', true);
            templateObject.isStockAdjustmentList.set(true);
        } else {
            Session.setPersistent('cloudStockAdjustmentList', false);
            templateObject.isStockAdjustmentList.set(false);
        }
    },
    'click .chkJournalEntryList': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudJournalEntryList', true);
            templateObject.isJournalEntryList.set(true);
        } else {
            Session.setPersistent('cloudJournalEntryList', false);
            templateObject.isJournalEntryList.set(false);
        }
    },
    'click .chkAgedPayables': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudAgedPayables', true);
            templateObject.isAgedPayables.set(true);
        } else {
            Session.setPersistent('cloudAgedPayables', false);
            templateObject.isAgedPayables.set(false);
        }
    },
    'click .chkAgedPayablesSummary': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudAgedPayablesSummary', true);
            templateObject.isAgedPayablesSummary.set(true);
        } else {
            Session.setPersistent('cloudAgedPayablesSummary', false);
            templateObject.isAgedPayablesSummary.set(false);
        }
    },
    'click .chkPurchaseReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudPurchaseReport', true);
            templateObject.isPurchaseReport.set(true);
        } else {
            Session.setPersistent('cloudPurchaseReport', false);
            templateObject.isPurchaseReport.set(false);
        }
    },
    'click .chkPurchaseSummaryReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudPurchaseSummaryReport', true);
            templateObject.isPurchaseSummaryReport.set(true);
        } else {
            Session.setPersistent('cloudPurchaseSummaryReport', false);
            templateObject.isPurchaseSummaryReport.set(false);
        }
    },
    'click .chkPrintStatement': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudPrintStatement', true);
            templateObject.isPrintStatement.set(true);
        } else {
            Session.setPersistent('cloudPrintStatement', false);
            templateObject.isPrintStatement.set(false);
        }
    },
    'click .chkExecutiveSummary': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudExecutiveSummary', true);
            templateObject.isExecutiveSummary.set(true);
        } else {
            Session.setPersistent('cloudExecutiveSummary', false);
            templateObject.isExecutiveSummary.set(false);
        }
    },
    'click .chkCashReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudCashReport', true);
            templateObject.isCashReport.set(true);
        } else {
            Session.setPersistent('cloudCashReport', false);
            templateObject.isCashReport.set(false);
        }
    },
    'click .chkProfitabilityReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudProfitabilityReport', true);
            templateObject.isProfitabilityReport.set(true);
        } else {
            Session.setPersistent('cloudProfitabilityReport', false);
            templateObject.isProfitabilityReport.set(false);
        }
    },
    'click .chkPerformanceReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudPerformanceReport', true);
            templateObject.isPerformanceReport.set(true);
        } else {
            Session.setPersistent('cloudPerformanceReport', false);
            templateObject.isPerformanceReport.set(false);
        }
    },
    'click .chkBalanceSheetReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudBalanceSheetReport', true);
            templateObject.isBalanceSheetReport.set(true);
        } else {
            Session.setPersistent('cloudBalanceSheetReport', false);
            templateObject.isBalanceSheetReport.set(false);
        }
    },
    'click .chkIncomeReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudIncomeReport', true);
            templateObject.isIncomeReport.set(true);
        } else {
            Session.setPersistent('cloudIncomeReport', false);
            templateObject.isIncomeReport.set(false);
        }
    },
    'click .chkPositionReport': function(event) {
        let templateObject = Template.instance();
        if ($(event.target).is(':checked')) {
            Session.setPersistent('cloudPositionReport', true);
            templateObject.isPositionReport.set(true);
        } else {
            Session.setPersistent('cloudPositionReport', false);
            templateObject.isPositionReport.set(false);
        }
    },
    'click .showhidden_fin': function(event) {
        if (event.target.id === "ellipsis_fin") {
            $('#ellipsis_fin').hide();
            $('#chevron_up_fin').show();
        } else {
            $('#chevron_up_fin').hide();
            $('#ellipsis_fin').show();
        }
    },
    'click .showhidden_account': function(event) {
        if (event.target.id === "ellipsis_account") {
            $('#ellipsis_account').hide();
            $('#chevron_up_account').show();
        } else {
            $('#chevron_up_account').hide();
            $('#ellipsis_account').show();
        }
    },
    'click .showhidden_sales': function(event) {
        if (event.target.id === "ellipsis_sales") {
            $('#ellipsis_sales').hide();
            $('#chevron_up_sales').show();
        } else {
            $('#chevron_up_sales').hide();
            $('#ellipsis_sales').show();
        }
    },
    'click .showhidden_purchases': function(event) {
        if (event.target.id === "ellipsis_purchases") {
            $('#ellipsis_purchases').hide();
            $('#chevron_up_purchases').show();
        } else {
            $('#chevron_up_purchases').hide();
            $('#ellipsis_purchases').show();
        }
    },
    'click .showhidden_inventory': function(event) {
        if (event.target.id === "ellipsis_inventory") {
            $('#ellipsis_inventory').hide();
            $('#chevron_up_inventory').show();
        } else {
            $('#chevron_up_inventory').hide();
            $('#ellipsis_inventory').show();
        }
    },
    'click .btnBatchUpdate': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        batchUpdateCall();
    },
    'click .reportpage': function() {
        setTimeout(function() {
            Meteor._reload.reload();
        }, 100);
    }
});

Template.allreports.helpers({
    isBalanceSheet: function() {
        return Template.instance().isBalanceSheet.get();
    },
    lastBatchUpdate: () => {
        let transactionTableLastUpdated = "";
        var currentDate = new Date();
        if (localStorage.getItem('VS1TransTableUpdate')) {
            transactionTableLastUpdated = moment(localStorage.getItem('VS1TransTableUpdate')).format("ddd MMM D, YYYY, hh:mm A");
        } else {
            transactionTableLastUpdated = moment(currentDate).format("ddd MMM D, YYYY, hh:mm A");
        }
        return transactionTableLastUpdated;
    },
    isAccountsLists: function() {
        return Template.instance().isAccountsLists.get();
    },
    isBinLocations: function() {
        return Template.instance().isBinLocations.get();
    },
    isTransactionJournal: function() {
        return Template.instance().isTransactionJournal.get();
    },
    isUnpaidBills: function() {
        return Template.instance().isUnpaidBills.get();
    },
    isUnpaidPO: function() {
        return Template.instance().isUnpaidPO.get();
    },
    isBackOrderedPO: function() {
        return Template.instance().isBackOrderedPO.get();
    },
    isSalesOrderConverted: function() {
        return Template.instance().isSalesOrderConverted.get();
    },
    isSalesOrderUnconverted: function() {
        return Template.instance().isSalesOrderUnconverted.get();
    },
    isPaymentMethodsList: function() {
        return Template.instance().isPaymentMethodsList.get();
    },
    isBackOrderedInvoices: function() {
        return Template.instance().isBackOrderedInvoices.get();
    },
    isQuotesConverted: function() {
        return Template.instance().isQuotesConverted.get();
    },
    isQuotesUnconverted: function() {
        return Template.instance().isQuotesUnconverted.get();
    },
    isInvoicesPaid: function() {
        return Template.instance().isInvoicesPaid.get();
    },
    isInvoicesUnpaid: function() {
        return Template.instance().isInvoicesUnpaid.get();
    },
    isPayrollLeaveAccrued: function() {
        return Template.instance().isPayrollLeaveAccrued.get();
    },
    isPayrollLeaveTaken: function() {
        return Template.instance().isPayrollLeaveTaken.get();
    },
    isTimeSheetDetails: function() {
        return Template.instance().isTimeSheetDetails.get();
    },
    isChequeList: function() {
        return Template.instance().isChequeList.get();
    },
    isStockAdjustmentList: function() {
        return Template.instance().isStockAdjustmentList.get();
    },
    isJournalEntryList: function() {
        return Template.instance().isJournalEntryList.get();
    },
    isProfitLoss: function() {
        return Template.instance().isProfitLoss.get();
    },
    isPLMonthly: function() {
        return Template.instance().isPLMonthly.get();
    },
    isPLQuarterly: function() {
        return Template.instance().isPLQuarterly.get();
    },
    isPLYearly: function() {
        return Template.instance().isPLYearly.get();
    },
    isPLYTD: function() {
        return Template.instance().isPLYTD.get();
    },
    isJobSalesSummary: function() {
        return Template.instance().isJobSalesSummary.get();
    },
    isAgedReceivables: function() {
        return Template.instance().isAgedReceivables.get();
    },
    isAgedReceivablesSummary: function() {
        return Template.instance().isAgedReceivablesSummary.get();
    },
    isProductSalesReport: function() {
        return Template.instance().isProductSalesReport.get();
    },
    isSalesReport: function() {
        return Template.instance().isSalesReport.get();
    },
    isJobProfitReport: function() {
        return Template.instance().isJobProfitReport.get();
    },
    isSupplierDetails: function() {
        return Template.instance().isSupplierDetails.get();
    },
    isSupplierProduct: function() {
        return Template.instance().isSupplierProduct.get();
    },
    isCustomerDetails: function() {
        return Template.instance().isCustomerDetails.get();
    },
    isCustomerSummary: function() {
        return Template.instance().isCustomerSummary.get();
    },
    isLotReport: function() {
        return Template.instance().isLotReport.get();
    },
    isStockValue: function() {
        return Template.instance().isStockValue.get();
    },
    isStockQuantity: function() {
        return Template.instance().isStockQuantity.get();
    },
    isStockMovementReport: function() {
        return Template.instance().isStockMovementReport.get();
    },
    isPayrollHistoryReport: function() {
        return Template.instance().isPayrollHistoryReport.get();
    },
    isForeignExchangeHistoryList: function() {
        return Template.instance().isForeignExchangeHistoryList.get();
    },
    isForeignExchangeList: function() {
        return Template.instance().isForeignExchangeList.get();
    },
    isSalesSummaryReport: function() {
        return Template.instance().isSalesSummaryReport.get();
    },
    isGeneralLedger: function() {
        return Template.instance().isGeneralLedger.get();
    },
    isTaxSummaryReport: function() {
        return Template.instance().isTaxSummaryReport.get();
    },
    isTrialBalance: function() {
        return Template.instance().isTrialBalance.get();
    },
    isTimeSheetSummary: function() {
        return Template.instance().isTimeSheetSummary.get();
    },
    isSerialNumberReport: function() {
        return Template.instance().isSerialNumberReport.get();
    },
    is1099Transaction: function() {
        return Template.instance().is1099Transaction.get();
    },
    isAgedPayables: function() {
        return Template.instance().isAgedPayables.get();
    },
    isAgedPayablesSummary: function() {
        return Template.instance().isAgedPayablesSummary.get();
    },
    isPurchaseReport: function() {
        return Template.instance().isPurchaseReport.get();
    },
    isPurchaseSummaryReport: function() {
        return Template.instance().isPurchaseSummaryReport.get();
    },
    isPrintStatement: function() {
        return Template.instance().isPrintStatement.get();
    },
    isExecutiveSummary: function() {
        return Template.instance().isExecutiveSummary.get();
    },
    isCashReport: function() {
        return Template.instance().isCashReport.get();
    },
    isProfitabilityReport: function() {
        return Template.instance().isProfitabilityReport.get();
    },
    isPerformanceReport: function() {
        return Template.instance().isPerformanceReport.get();
    },
    isBalanceSheetReport: function() {
        return Template.instance().isBalanceSheetReport.get();
    },
    isIncomeReport: function() {
        return Template.instance().isIncomeReport.get();
    },
    isPositionReport: function() {
        return Template.instance().isPositionReport.get();
    },
    isFavorite: function() {
        let isBalanceSheet = Template.instance().isBalanceSheet.get();
        let isProfitLoss = Template.instance().isProfitLoss.get();
        let isPLMonthly = Template.instance().isPLMonthly.get();
        let isPLQuarterly = Template.instance().isPLQuarterly.get();
        let isPLYearly = Template.instance().isPLYearly.get();
        let isPLYTD = Template.instance().isPLYTD.get();
        let isJobSalesSummary = Template.instance().isJobSalesSummary.get();
        let isAgedReceivables = Template.instance().isAgedReceivables.get();
        let isAgedReceivablesSummary = Template.instance().isAgedReceivablesSummary.get();
        let isProductSalesReport = Template.instance().isProductSalesReport.get();
        let isSalesReport = Template.instance().isSalesReport.get();
        let isJobProfitReport = Template.instance().isJobProfitReport.get();
        let isSupplierDetails = Template.instance().isSupplierDetails.get();
        let isSupplierProduct = Template.instance().isSupplierProduct.get();
        let isCustomerDetails = Template.instance().isCustomerDetails.get();
        let isCustomerSummary = Template.instance().isCustomerSummary.get();
        let isLotReport = Template.instance().isLotReport.get();
        let isStockValue = Template.instance().isStockValue.get();
        let isStockQuantity = Template.instance().isStockQuantity.get();
        let isStockMovementReport = Template.instance().isStockMovementReport.get();
        let isPayrollHistoryReport = Template.instance().isPayrollHistoryReport.get();
        let isForeignExchangeHistoryList = Template.instance().isForeignExchangeHistoryList.get();
        let isForeignExchangeList = Template.instance().isForeignExchangeList.get();
        let isSalesSummaryReport = Template.instance().isSalesSummaryReport.get();
        let isGeneralLedger = Template.instance().isGeneralLedger.get();
        let isTaxSummaryReport = Template.instance().isTaxSummaryReport.get();
        let isTrialBalance = Template.instance().isTrialBalance.get();
        let isTimeSheetSummary = Template.instance().isTimeSheetSummary.get();
        let isPayrollLeaveAccrued = Template.instance().isPayrollLeaveAccrued.get();
        let isPayrollLeaveTaken = Template.instance().isPayrollLeaveTaken.get();
        let isSerialNumberReport = Template.instance().isSerialNumberReport.get();
        let is1099Transaction = Template.instance().is1099Transaction.get();
        let isAccountsLists = Template.instance().isAccountsLists.get();
        let isBinLocations = Template.instance().isBinLocations.get();
        let isTransactionJournal = Template.instance().isTransactionJournal.get();
        let isUnpaidBills = Template.instance().isUnpaidBills.get();
        let isUnpaidPO = Template.instance().isUnpaidPO.get();
        let isBackOrderedPO = Template.instance().isBackOrderedPO.get();
        let isSalesOrderConverted = Template.instance().isSalesOrderConverted.get();
        let isSalesOrderUnconverted = Template.instance().isSalesOrderUnconverted.get();
        let isPaymentMethodsList = Template.instance().isPaymentMethodsList.get();
        let isBackOrderedInvoices = Template.instance().isBackOrderedInvoices.get();
        let isQuotesConverted = Template.instance().isQuotesConverted.get();
        let isQuotesUnconverted = Template.instance().isQuotesUnconverted.get();
        let isInvoicesPaid = Template.instance().isInvoicesPaid.get();
        let isInvoicesUnpaid = Template.instance().isInvoicesUnpaid.get();
        let isTimeSheetDetails = Template.instance().isTimeSheetDetails.get();
        let isChequeList = Template.instance().isChequeList.get();
        let isStockAdjustmentList = Template.instance().isStockAdjustmentList.get();
        let isJournalEntryList = Template.instance().isJournalEntryList.get();
        let isAgedPayables = Template.instance().isAgedPayables.get();
        let isAgedPayablesSummary = Template.instance().isAgedPayablesSummary.get();
        let isPurchaseReport = Template.instance().isPurchaseReport.get();
        let isPurchaseSummaryReport = Template.instance().isPurchaseSummaryReport.get();
        let isPrintStatement = Template.instance().isPrintStatement.get();
        let isExecutiveSummary = Template.instance().isExecutiveSummary.get();
        let isCashReport = Template.instance().isCashReport.get();
        let isProfitabilityReport = Template.instance().isProfitabilityReport.get();
        let isPerformanceReport = Template.instance().isPerformanceReport.get();
        let isBalanceSheetReport = Template.instance().isBalanceSheetReport.get();
        let isIncomeReport = Template.instance().isIncomeReport.get();
        let isPositionReport = Template.instance().isPositionReport.get();
        let isShowFavorite = false;

        if (isBalanceSheet || isProfitLoss || isAgedReceivables || isProductSalesReport || isSalesReport || isSalesSummaryReport || isGeneralLedger || isTaxSummaryReport || isTrialBalance || isExecutiveSummary || isCashReport || isProfitabilityReport || isPerformanceReport || isBalanceSheetReport || isIncomeReport || isPositionReport || is1099Transaction || isAccountsLists || isAgedPayables || isPurchaseReport || isPurchaseSummaryReport || isPrintStatement || isAgedReceivablesSummary || isAgedPayablesSummary || isJournalEntryList || isStockAdjustmentList || isChequeList || isTimeSheetDetails || isInvoicesPaid || isInvoicesUnpaid || isQuotesConverted || isQuotesUnconverted || isBackOrderedInvoices || isPaymentMethodsList || isSalesOrderConverted || isSalesOrderUnconverted || isBackOrderedPO || isUnpaidPO || isUnpaidBills || isTransactionJournal || isSerialNumberReport || isPayrollLeaveAccrued || isPayrollLeaveTaken || isForeignExchangeHistoryList || isForeignExchangeList || isBinLocations || isTimeSheetSummary || isPayrollHistoryReport || isStockValue || isStockMovementReport || isStockQuantity || isLotReport || isCustomerDetails || isCustomerSummary || isSupplierDetails || isSupplierProduct || isJobProfitReport || isPLMonthly || isPLQuarterly || isPLYearly || isPLYTD || isJobSalesSummary) {
            isShowFavorite = true;
        }
        return isShowFavorite;
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    },
    accountantList: () => {
        return Template.instance().accountantList.get().sort(function(a, b) {
            if (a.headDept == 'NA') {
                return 1;
            } else if (b.headDept == 'NA') {
                return -1;
            }
            return (a.headDept.toUpperCase() > b.headDept.toUpperCase()) ? 1 : -1;
            // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
        });
    },
});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});
