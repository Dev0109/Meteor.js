import { ReactiveVar } from 'meteor/reactive-var';
import { PaymentsService} from '../../../payments/payments-service';
import {UtilityService} from "../../../utility-service";
import {SideBarService} from '../../../js/sidebar-service';
import '../../../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.paymentoverviewcards.onCreated(function() {
    const templateObject = Template.instance();
});

Template.paymentoverviewcards.onRendered(function() {
    let templateObject = Template.instance();
    let paymentService = new PaymentsService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];
    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlertOverview');
    }

    var today = moment().format('DD/MM/YYYY');
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    let fromDateMonth = (currentDate.getMonth() + 1);
    let fromDateDay = currentDate.getDate();
    if ((currentDate.getMonth() + 1) < 10) {
        fromDateMonth = "0" + (currentDate.getMonth() + 1);
    }

    if (currentDate.getDate() < 10) {
        fromDateDay = "0" + currentDate.getDate();
    }
    var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();


    var currentBeginDate = new Date();
    var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
    let fromDateMonth2 = currentBeginDate.getMonth();
    let fromDateDay2 = currentBeginDate.getDate();
    if ((currentBeginDate.getMonth() + 1) < 10) {
        fromDateMonth2 = "0" + (currentBeginDate.getMonth() + 1);
    } else {
        fromDateMonth2 = (currentBeginDate.getMonth() + 1);
    }

    if (currentBeginDate.getDate() < 10) {
        fromDateDay2 = "0" + currentBeginDate.getDate();
    }
    var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth2) + "-" + (fromDateDay2);
    let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

    function MakeNegative() {
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
        $('td.colStatus').each(function() {
            if ($(this).text() == "Deleted") $(this).addClass('text-deleted');
            if ($(this).text() == "Reconciled") $(this).addClass('text-reconciled');
            if ($(this).text() == "Paid") $(this).addClass('text-fullyPaid');
            if ($(this).text() == "Partial Paid") $(this).addClass('text-partialPaid');
        });
    };

    let OVERDUE_INVOICES_AMOUNT = localStorage.getItem('VS1OverDueInvoiceAmt_dash') || 0;
    let OVERDUE_INVOICES_QUANTITY = localStorage.getItem('VS1OverDueInvoiceQty_dash') || 0;

    let OUTSTANDING_INVOICES_AMOUNT = localStorage.getItem('VS1OutstandingInvoiceAmt_dash') || 0;
    let OUTSTANDING_INVOICES_QUANTITY = localStorage.getItem('VS1OutstandingInvoiceQty_dash') || 0;





    let OUTSTANDING_PAYABLES_AMOUNT = localStorage.getItem('VS1OutstandingPayablesAmt_dash') || 0;
    let OUTSTANDING_PAYABLES_QUANTITY = localStorage.getItem('VS1OutstandingPayablesQty_dash') || 0;

    let OVERDUE_PAYABLES_AMOUNT = localStorage.getItem('VS1OverDuePayablesAmt_dash') || 0;
    let OVERDUE_PAYABLES_QUANTITY = localStorage.getItem('VS1OverDuePayablesQty_dash') || 0;

    if ((!localStorage.getItem('VS1OverDuePayablesAmt_dash')) && (!localStorage.getItem('VS1OverDueInvoiceAmt_dash'))) {
    getVS1Data('TAwaitingCustomerPayment').then(function(dataObject) {
        if (dataObject.length == 0) {
            sideBarService.getAllAwaitingCustomerPayment(prevMonth11Date, toDate, true, initialReportLoad, 0,'').then(function(data) {
                let itemsAwaitingPaymentcount = [];
                let itemsOverduePaymentcount = [];
                let dataListAwaitingCust = {};
                let totAmount = 0;
                let totAmountOverDue = 0;
                let customerawaitingpaymentCount = '';
                for (let i = 0; i < data.tsaleslist.length; i++) {
                    if (data.tsaleslist[i].Type == "Invoice") {
                        dataListAwaitingCust = {
                            id: data.tsaleslist[i].SaleId || '',
                        };
                        if (data.tsaleslist[i].Balance != 0) {
                            itemsAwaitingPaymentcount.push(dataListAwaitingCust);
                            totAmount += Number(data.tsaleslist[i].Balance);
                            let date = new Date(data.tsaleslist[i].dueDate);
                            if (date < new Date()) {
                                itemsOverduePaymentcount.push(dataListAwaitingCust);
                                totAmountOverDue += Number(data.tsaleslist[i].Balance);
                            }
                        }
                    }
                }
                $('.invoiceOutstandingQTY').text(itemsAwaitingPaymentcount.length);
                $('.invoiceOverDueQTY').text(itemsOverduePaymentcount.length);
                $('.invoiceOutstandingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
                $('.invoiceOverDueAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountOverDue));
            });
        } else {
            let data = JSON.parse(dataObject[0].data);
            let useData = data.tsaleslist;
            let itemsAwaitingPaymentcount = [];
            let itemsOverduePaymentcount = [];
            let dataListAwaitingCust = {};
            let totAmount = 0;
            let totAmountOverDue = 0;
            let customerawaitingpaymentCount = '';
            for (let i = 0; i < data.tsaleslist.length; i++) {
                if (data.tsaleslist[i].Type == "Invoice") {
                    dataListAwaitingCust = {
                        id: data.tsaleslist[i].SaleId || '',
                    };
                    if (data.tsaleslist[i].Balance != 0) {
                        itemsAwaitingPaymentcount.push(dataListAwaitingCust);

                        totAmount += Number(data.tsaleslist[i].Balance);
                        let date = new Date(data.tsaleslist[i].dueDate);
                        if (date < new Date()) {
                            itemsOverduePaymentcount.push(dataListAwaitingCust);
                            totAmountOverDue += Number(data.tsaleslist[i].Balance);

                        }
                    }
                }
            }
            $('.invoiceOutstandingQTY').text(itemsAwaitingPaymentcount.length);
            $('.invoiceOverDueQTY').text(itemsOverduePaymentcount.length);
            $('.invoiceOutstandingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
            $('.invoiceOverDueAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountOverDue));
        }
    }).catch(function(err) {
        sideBarService.getAllAwaitingCustomerPayment(prevMonth11Date, toDate, true, initialReportLoad, 0,'').then(function(data) {
            let itemsAwaitingPaymentcount = [];
            let itemsOverduePaymentcount = [];
            let dataListAwaitingCust = {};
            let totAmount = 0;
            let totAmountOverDue = 0;
            let customerawaitingpaymentCount = '';
            for (let i = 0; i < data.tsaleslist.length; i++) {
                if (data.tsaleslist[i].Type == "Invoice") {
                    dataListAwaitingCust = {
                        id: data.tsaleslist[i].SaleId || '',
                    };
                    if (data.tsaleslist[i].Balance != 0) {
                        itemsAwaitingPaymentcount.push(dataListAwaitingCust);
                        totAmount += Number(data.tsaleslist[i].Balance);
                        let date = new Date(data.tsaleslist[i].dueDate);
                        if (date < new Date()) {
                            itemsOverduePaymentcount.push(dataListAwaitingCust);
                            totAmountOverDue += Number(data.tsaleslist[i].Balance);
                        }
                    }
                }
            }
            $('.invoiceOutstandingQTY').text(itemsAwaitingPaymentcount.length);
            $('.invoiceOverDueQTY').text(itemsOverduePaymentcount.length);
            $('.invoiceOutstandingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
            $('.invoiceOverDueAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountOverDue));
        });
    });

    getVS1Data('TAPReport').then(function(dataObject) {
        if (dataObject.length == 0) {
            paymentService.getOverviewAPDetails().then(function(data) {
                let itemsSuppAwaitingPaymentcount = [];
                let itemsSuppOverduePaymentcount = [];
                let dataListAwaitingSupp = {};
                let customerawaitingpaymentCount = '';
                let supptotAmount = 0;
                let supptotAmountOverDue = 0;
                for (let i = 0; i < data.tapreport.length; i++) {
                    dataListAwaitingSupp = {
                        id: data.tapreport[i].ClientID || '',
                    };
                    if (data.tapreport[i].AmountDue != 0) {
                        // supptotAmount = data.tpurchaseorder[i].TotalBalance + data.tpurchaseorder[i].TotalBalance;
                        supptotAmount += Number(data.tapreport[i].AmountDue);
                        itemsSuppAwaitingPaymentcount.push(dataListAwaitingSupp);
                        let date = new Date(data.tapreport[i].DueDate);
                        if (date < new Date()) {
                            supptotAmountOverDue += Number(data.tapreport[i].AmountDue);
                            itemsSuppOverduePaymentcount.push(dataListAwaitingSupp);
                        }
                    }

                }
                $('.SuppOutstandingQTY').text(itemsSuppAwaitingPaymentcount.length);
                $('.suppOverdueQTY').text(itemsSuppOverduePaymentcount.length);

                $('.SuppOutstandingAmt').text(utilityService.modifynegativeCurrencyFormat(supptotAmount));
                $('.suppOverdueAmount').text(utilityService.modifynegativeCurrencyFormat(supptotAmountOverDue));
            });
        } else {
            let data = JSON.parse(dataObject[0].data);
            let useData = data.tapreport;
            let itemsSuppAwaitingPaymentcount = [];
            let itemsSuppOverduePaymentcount = [];
            let dataListAwaitingSupp = {};
            let customerawaitingpaymentCount = '';
            let supptotAmount = 0;
            let supptotAmountOverDue = 0;
            for (let i = 0; i < useData.length; i++) {
                dataListAwaitingSupp = {
                    id: useData[i].ClientID || '',
                };
                if (useData[i].AmountDue != 0) {
                    // supptotAmount = data.tpurchaseorder[i].TotalBalance + data.tpurchaseorder[i].TotalBalance;
                    supptotAmount += Number(useData[i].AmountDue);
                    itemsSuppAwaitingPaymentcount.push(dataListAwaitingSupp);
                    let date = new Date(useData[i].DueDate);
                    if (date < new Date()) {
                        supptotAmountOverDue += Number(useData[i].AmountDue);
                        itemsSuppOverduePaymentcount.push(dataListAwaitingSupp);
                    }
                }

            }
            $('.SuppOutstandingQTY').text(itemsSuppAwaitingPaymentcount.length);
            $('.suppOverdueQTY').text(itemsSuppOverduePaymentcount.length);

            $('.SuppOutstandingAmt').text(utilityService.modifynegativeCurrencyFormat(supptotAmount));
            $('.suppOverdueAmount').text(utilityService.modifynegativeCurrencyFormat(supptotAmountOverDue));
        }
    }).catch(function(err) {
        paymentService.getOverviewAPDetails().then(function(data) {
            let itemsSuppAwaitingPaymentcount = [];
            let itemsSuppOverduePaymentcount = [];
            let dataListAwaitingSupp = {};
            let customerawaitingpaymentCount = '';
            let supptotAmount = 0;
            let supptotAmountOverDue = 0;
            for (let i = 0; i < data.tapreport.length; i++) {
                dataListAwaitingSupp = {
                    id: data.tapreport[i].ClientID || '',
                };
                if (data.tapreport[i].AmountDue != 0) {
                    // supptotAmount = data.tpurchaseorder[i].TotalBalance + data.tpurchaseorder[i].TotalBalance;
                    supptotAmount += Number(data.tapreport[i].AmountDue);
                    itemsSuppAwaitingPaymentcount.push(dataListAwaitingSupp);
                    let date = new Date(data.tapreport[i].DueDate);
                    if (date < new Date()) {
                        supptotAmountOverDue += Number(data.tapreport[i].AmountDue);
                        itemsSuppOverduePaymentcount.push(dataListAwaitingSupp);
                    }
                }

            }
            $('.SuppOutstandingQTY').text(itemsSuppAwaitingPaymentcount.length);
            $('.suppOverdueQTY').text(itemsSuppOverduePaymentcount.length);

            $('.SuppOutstandingAmt').text(utilityService.modifynegativeCurrencyFormat(supptotAmount));
            $('.suppOverdueAmount').text(utilityService.modifynegativeCurrencyFormat(supptotAmountOverDue));
        });
    });
  }else{
    $('.invoiceOutstandingQTY').text(OUTSTANDING_INVOICES_QUANTITY);
    $('.invoiceOutstandingAmt').text(utilityService.modifynegativeCurrencyFormat(OUTSTANDING_INVOICES_AMOUNT));
    $('.invoiceOverDueAmt').text(utilityService.modifynegativeCurrencyFormat(OVERDUE_INVOICES_AMOUNT));
    $('.invoiceOverDueQTY').text(OVERDUE_INVOICES_QUANTITY);

    $('.SuppOutstandingQTY').text(OUTSTANDING_PAYABLES_QUANTITY);
    $('.suppOverdueQTY').text(OVERDUE_PAYABLES_QUANTITY);
    $('.SuppOutstandingAmt').text(utilityService.modifynegativeCurrencyFormat(OUTSTANDING_PAYABLES_AMOUNT));
    $('.suppOverdueAmount').text(utilityService.modifynegativeCurrencyFormat(OVERDUE_PAYABLES_AMOUNT));
  }


});

Template.paymentoverviewcards.helpers({

});
