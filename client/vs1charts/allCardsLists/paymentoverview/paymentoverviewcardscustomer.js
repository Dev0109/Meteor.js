import { ReactiveVar } from 'meteor/reactive-var';
import { PaymentsService} from '../../../payments/payments-service';
import {UtilityService} from "../../../utility-service";
import {SideBarService} from '../../../js/sidebar-service';
import '../../../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.paymentoverviewcardscustomer.onCreated(function() {
    const templateObject = Template.instance();
});

Template.paymentoverviewcardscustomer.onRendered(function() {
    var url = window.location.href;
    let customerID = 0;
    if (url.indexOf("customerscard?id=") > 0) {
        newurl = new URL(window.location.href);
        customerID = ( !isNaN(newurl.searchParams.get("id")) )? newurl.searchParams.get("id") : 0;
    }
    if (url.indexOf("customerscard?jobid=") > 0) {
        newurl = new URL(window.location.href);
        customerID = ( !isNaN(newurl.searchParams.get("jobid")) )? newurl.searchParams.get("jobid") : 0;
    }

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



    // if ((!localStorage.getItem('VS1OverDueInvoiceQty_dash')) && (!localStorage.getItem('VS1OverDueInvoiceAmt_dash'))) {
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
                        if( customerID != 0 ){
                            if (data.tsaleslist[i].Balance != 0 && data.tsaleslist[i].ClientId == customerID ) {
                                itemsAwaitingPaymentcount.push(dataListAwaitingCust);
                                totAmount += Number(data.tsaleslist[i].Balance);
                                let date = new Date(data.tsaleslist[i].dueDate);
                                if (date < new Date() ) {
                                    itemsOverduePaymentcount.push(dataListAwaitingCust);
                                    totAmountOverDue += Number(data.tsaleslist[i].Balance);
                                }
                            }
                        }else{
                            if (data.tsaleslist[i].Balance != 0 ) {
                                itemsAwaitingPaymentcount.push(dataListAwaitingCust);
                                totAmount += Number(data.tsaleslist[i].Balance);
                                let date = new Date(data.tsaleslist[i].dueDate);
                                if (date < new Date() ) {
                                    itemsOverduePaymentcount.push(dataListAwaitingCust);
                                    totAmountOverDue += Number(data.tsaleslist[i].Balance);
                                }
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
                    if( customerID != 0 ){
                        if (data.tsaleslist[i].Balance != 0 && data.tsaleslist[i].ClientId == customerID ) {
                            itemsAwaitingPaymentcount.push(dataListAwaitingCust);
                            totAmount += Number(data.tsaleslist[i].Balance);
                            let date = new Date(data.tsaleslist[i].dueDate);
                            if (date < new Date() ) {
                                itemsOverduePaymentcount.push(dataListAwaitingCust);
                                totAmountOverDue += Number(data.tsaleslist[i].Balance);
                            }
                        }
                    }else{
                        if (data.tsaleslist[i].Balance != 0 ) {
                            itemsAwaitingPaymentcount.push(dataListAwaitingCust);
                            totAmount += Number(data.tsaleslist[i].Balance);
                            let date = new Date(data.tsaleslist[i].dueDate);
                            if (date < new Date() ) {
                                itemsOverduePaymentcount.push(dataListAwaitingCust);
                                totAmountOverDue += Number(data.tsaleslist[i].Balance);
                            }
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
                    if( customerID != 0 ){
                        if (data.tsaleslist[i].Balance != 0 && data.tsaleslist[i].ClientId == customerID ) {
                            itemsAwaitingPaymentcount.push(dataListAwaitingCust);
                            totAmount += Number(data.tsaleslist[i].Balance);
                            let date = new Date(data.tsaleslist[i].dueDate);
                            if (date < new Date() ) {
                                itemsOverduePaymentcount.push(dataListAwaitingCust);
                                totAmountOverDue += Number(data.tsaleslist[i].Balance);
                            }
                        }
                    }else{
                        if (data.tsaleslist[i].Balance != 0 ) {
                            itemsAwaitingPaymentcount.push(dataListAwaitingCust);
                            totAmount += Number(data.tsaleslist[i].Balance);
                            let date = new Date(data.tsaleslist[i].dueDate);
                            if (date < new Date() ) {
                                itemsOverduePaymentcount.push(dataListAwaitingCust);
                                totAmountOverDue += Number(data.tsaleslist[i].Balance);
                            }
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

//   }else{
//     $('.invoiceOutstandingQTY').text(OUTSTANDING_INVOICES_QUANTITY);
//     $('invoiceOutstandingAmt').text(utilityService.modifynegativeCurrencyFormat(OUTSTANDING_INVOICES_AMOUNT));
//     $('.invoiceOverDueAmt').text(utilityService.modifynegativeCurrencyFormat(OVERDUE_INVOICES_AMOUNT));
//     $('.invoiceOverDueQTY').text(OVERDUE_INVOICES_QUANTITY);
//   }

});

Template.paymentoverviewcardscustomer.helpers({

});
