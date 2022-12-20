import { PaymentsService } from '../payments/payments-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { EmployeeProfileService } from "../js/profile-service";
import { AccountService } from "../accounts/account-service";
import { UtilityService } from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.bankingoverview.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.awaitingcustpaymentCount = new ReactiveVar();
    templateObject.awaitingsupppaymentCount = new ReactiveVar();

    templateObject.overduecustpaymentCount = new ReactiveVar();
    templateObject.overduesupppaymentCount = new ReactiveVar();
    templateObject.bankaccountdatarecord = new ReactiveVar([]);

    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
});

Template.bankingoverview.onRendered(function() {
    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    let paymentService = new PaymentsService();
    let accountService = new AccountService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];

    var today = moment().format('DD/MM/YYYY');
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    let fromDateMonth = (currentDate.getMonth() + 1);
    let fromDateDay = currentDate.getDate();
    if ((currentDate.getMonth()+1) < 10) {
        fromDateMonth = "0" + (currentDate.getMonth()+1);
    }

    if (currentDate.getDate() < 10) {
        fromDateDay = "0" + currentDate.getDate();
    }
    var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();


    // set initial table rest_data
    function init_reset_data() {
      let reset_data = [
        { index: 0, label: "id", class: "SortDate", width: "0", active: false, display: false },
        { index: 1, label: "Date", class: "PaymentDate", width: "80", active: true, display: true },
        { index: 2, label: "Trans ID", class: "AccountId", width: "80", active: true, display: true },
        { index: 3, label: "Account", class: "BankAccount", width: "100", active: true, display: true },
        { index: 4, label: "Type", class: "Type", width: "120", active: true, display: true },
        { index: 5, label: "Amount", class: "PaymentAmount", width: "80", active: true, display: true },
        { index: 6, label: "Amount (Inc)", class: "DebitEx", width: "120", active: true, display: true },
        { index: 7, label: "Department", class: "Department", width: "80", active: true, display: true },
        { index: 8, label: "Chq Ref No", class: "chqrefno", width: "110", active: false, display: true },
        { index: 9, label: "Comments", class: "Notes", width: "", active: true, display: true },
      ];

      let templateObject = Template.instance();
      templateObject.reset_data.set(reset_data);
    }
  init_reset_data();
  // set initial table rest_data


  // custom field displaysettings
   templateObject.initCustomFieldDisplaySettings = function(data, listType) {
    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    showCustomFieldDisplaySettings(reset_data);

    try {
      getVS1Data("VS1_Customize").then(function (dataObject) {
        if (dataObject.length == 0) {
          sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')), listType).then(function (data) {
              reset_data = data.ProcessLog.Obj.CustomLayout[0].Columns;
              showCustomFieldDisplaySettings(reset_data);
          }).catch(function (err) {
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          if(data.ProcessLog.Obj.CustomLayout.length > 0){
           for (let i = 0; i < data.ProcessLog.Obj.CustomLayout.length; i++) {
             if(data.ProcessLog.Obj.CustomLayout[i].TableName == listType){
               reset_data = data.ProcessLog.Obj.CustomLayout[i].Columns;
               showCustomFieldDisplaySettings(reset_data);
             }
           }
         };
          // handle process here
        }
      });
    } catch (error) {
    }
    return;
  }

  function showCustomFieldDisplaySettings(reset_data) {

    let custFields = [];
    let customData = {};
    let customFieldCount = reset_data.length;

    for (let r = 0; r < customFieldCount; r++) {
      customData = {
        active: reset_data[r].active,
        id: reset_data[r].index,
        custfieldlabel: reset_data[r].label,
        class: reset_data[r].class,
        display: reset_data[r].display,
        width: reset_data[r].width ? reset_data[r].width : ''
      };
      custFields.push(customData);
    }
    templateObject.displayfields.set(custFields);
  }

  templateObject.initCustomFieldDisplaySettings("", "tblBankingOverview");
  // custom field displaysettings

    $("#date-input,#dateTo,#dateFrom").datepicker({
        showOn: 'button',
        buttonText: 'Show Date',
        buttonImageOnly: true,
        buttonImage: '/img/imgCal2.png',
        dateFormat: 'dd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
        onChangeMonthYear: function(year, month, inst){
        // Set date to picker
        $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
        // Hide (close) the picker
        // $(this).datepicker('hide');
        // // Change ttrigger the on change function
        // $(this).trigger('change');
       }
    });

    $("#dateFrom").val(fromDate);
    $("#dateTo").val(begunDate);

    function MakeNegative() {
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
    };

    getVS1Data('TAccountVS1').then(function(dataObject) {
        if (dataObject.length == 0) {
          sideBarService.getAccountListVS1().then(async function(data) {
            addVS1Data('TAccountVS1',JSON.stringify(data));
              let arrayDataUse = [];
              let totalAmountCalculation = '';
              for (let i = 0; i < data.taccountvs1.length; i++) {
                if ((data.taccountvs1[i].fields.AccountTypeName == 'CCARD') && (data.taccountvs1[i].fields.Balance != 0) || (data.taccountvs1[i].fields.AccountTypeName == 'BANK') && (data.taccountvs1[i].fields.Balance != 0)) {
                    arrayDataUse.push(data.taccountvs1[i].fields);
                      arrayDataUse.push(data.taccountvs1[i]);
                      let filterDueDateData = _.filter(arrayDataUse, function(data) {
                          return data.AccountName
                      });

                      let groupData = _.omit(_.groupBy(filterDueDateData, 'AccountName'), ['']);
                      totalAmountCalculation = _.map(groupData, function(value, key) {
                          let totalBalance = 0;
                          let creditcard = 'fas fa-credit-card';
                          for (let i = 0; i < value.length; i++) {
                              totalBalance += value[i].Balance;
                              let accountName = value[i].AccountName.toLowerCase();
                              if (accountName.includes("credit")) {
                                  creditcard = 'fas fa-credit-card';
                              } else if (accountName.includes("mastercard")) {
                                  creditcard = 'fab fa-cc-mastercard'
                              } else if (accountName.includes("bank")) {
                                  creditcard = 'fab fa-cc-visa'
                              }
                          }
                          let userObject = {};
                          userObject.name = key;
                          userObject.totalbalance = utilityService.modifynegativeCurrencyFormat(totalBalance);
                          userObject.card = creditcard;
                          userObject.cardAccountID = 'banking-' + key.replaceAll(' ', '').toLowerCase();
                          return userObject;

                      });

                  }
              }
              let sortedArray = [];
              sortedArray = await totalAmountCalculation.sort(function(a, b) {
                  return b.totalbalance - a.totalbalance;
              });
              let getTop4Data = _.take(sortedArray, 4);
              let newObjData = '';
              let newObjDataArr = [];

              templateObject.bankaccountdatarecord.set(getTop4Data);
          }).catch(function(err) {
          });
        } else {
            let data = JSON.parse(dataObject[0].data);
            let useData = data.taccountvs1;
            let itemsAwaitingPaymentcount = [];
            let itemsOverduePaymentcount = [];
            let dataListAwaitingCust = {};
            let totAmount = 0;
            let totAmountOverDue = 0;
            let customerawaitingpaymentCount = '';
            var groups = {};
            let arrayDataUse = [];
            let totalAmountCalculation = '';
            for (let i = 0; i < useData.length; i++) {
                if ((data.taccountvs1[i].fields.AccountTypeName == 'CCARD') && (data.taccountvs1[i].fields.Balance != 0) || (data.taccountvs1[i].fields.AccountTypeName == 'BANK') && (data.taccountvs1[i].fields.Balance != 0)) {
                    arrayDataUse.push(data.taccountvs1[i].fields);
                    let filterDueDateData = _.filter(arrayDataUse, function(data) {
                        return data.AccountName
                    });
                    let groupData = _.omit(_.groupBy(filterDueDateData, 'AccountName'), ['']);
                    totalAmountCalculation = _.map(groupData, function(value, key) {
                        let totalBalance = 0;
                        let creditcard = 'fas fa-credit-card';
                        let id = 0;
                        for (let i = 0; i < value.length; i++) {
                            id = value[i].ID;
                            totalBalance += value[i].Balance;
                            let accountName = value[i].AccountName.toLowerCase();
                            if (accountName.includes("credit")) {
                                creditcard = 'fas fa-credit-card';
                            } else if (accountName.includes("mastercard")) {
                                creditcard = 'fab fa-cc-mastercard'
                            } else if (accountName.includes("bank")) {
                                creditcard = 'fab fa-cc-visa'
                            }
                        }
                        let userObject = {};
                        userObject.id = id;
                        userObject.name = key;
                        userObject.totalbalance = utilityService.modifynegativeCurrencyFormat(totalBalance);
                        userObject.card = creditcard;
                        userObject.cardAccountID = 'banking-' + key.replaceAll(' ', '').toLowerCase();
                        return userObject;

                    });

                }
            }
            let sortedArray = [];
            sortedArray = totalAmountCalculation.sort(function(a, b) {
                return b.totalbalance - a.totalbalance;
            });
            let getTop4Data = sortedArray;
            let newObjData = '';
            let newObjDataArr = [];
            templateObject.bankaccountdatarecord.set(getTop4Data);

        }
    }).catch(function(err) {
      sideBarService.getAccountListVS1().then(async function(data) {
        addVS1Data('TAccountVS1',JSON.stringify(data));
          let arrayDataUse = [];
          let totalAmountCalculation = '';
          for (let i = 0; i < data.taccountvs1.length; i++) {
            if ((data.taccountvs1[i].fields.AccountTypeName == 'CCARD') && (data.taccountvs1[i].fields.Balance != 0) || (data.taccountvs1[i].fields.AccountTypeName == 'BANK') && (data.taccountvs1[i].fields.Balance != 0)) {
                arrayDataUse.push(data.taccountvs1[i].fields);
                  arrayDataUse.push(data.taccountvs1[i]);
                  let filterDueDateData = _.filter(arrayDataUse, function(data) {
                      return data.AccountName
                  });

                  let groupData = _.omit(_.groupBy(filterDueDateData, 'AccountName'), ['']);
                  totalAmountCalculation = _.map(groupData, function(value, key) {
                      let totalBalance = 0;
                      let creditcard = 'fas fa-credit-card';
                      for (let i = 0; i < value.length; i++) {
                          totalBalance += value[i].Balance;
                          let accountName = value[i].AccountName.toLowerCase();
                          if (accountName.includes("credit")) {
                              creditcard = 'fas fa-credit-card';
                          } else if (accountName.includes("mastercard")) {
                              creditcard = 'fab fa-cc-mastercard'
                          } else if (accountName.includes("bank")) {
                              creditcard = 'fab fa-cc-visa'
                          }
                      }
                      let userObject = {};
                      userObject.name = key;
                      userObject.totalbalance = utilityService.modifynegativeCurrencyFormat(totalBalance);
                      userObject.card = creditcard;
                      userObject.cardAccountID = 'banking-' + key.replaceAll(' ', '').toLowerCase();
                      return userObject;

                  });

              }
          }
          let sortedArray = [];
          sortedArray = await totalAmountCalculation.sort(function(a, b) {
              return b.totalbalance - a.totalbalance;
          });
          let getTop4Data = _.take(sortedArray, 4);
          let newObjData = '';
          let newObjDataArr = [];

          templateObject.bankaccountdatarecord.set(getTop4Data);
      }).catch(function(err) {
      });
    });

/*
    getVS1Data('TPurchaseOrderEx').then(function(dataObject) {
        if (dataObject.length == 0) {
            paymentService.getOverviewAwaitingSupplierDetails().then(function(data) {
                let itemsSuppAwaitingPaymentcount = [];
                let itemsSuppOverduePaymentcount = [];
                let dataListAwaitingSupp = {};
                let customerawaitingpaymentCount = '';
                let supptotAmount = 0;
                let supptotAmountOverDue = 0;
                for (let i = 0; i < data.tpurchaseorder.length; i++) {
                    dataListAwaitingSupp = {
                        id: data.tpurchaseorder[i].Id || '',
                    };
                    if (data.tpurchaseorder[i].TotalBalance > 0) {
                        // supptotAmount = data.tpurchaseorder[i].TotalBalance + data.tpurchaseorder[i].TotalBalance;
                        supptotAmount += Number(data.tpurchaseorder[i].TotalBalance);
                        itemsSuppAwaitingPaymentcount.push(dataListAwaitingSupp);
                        let date = new Date(data.tpurchaseorder[i].DueDate);
                        if (date < new Date()) {
                            supptotAmountOverDue += Number(data.tpurchaseorder[i].TotalBalance);
                            itemsSuppOverduePaymentcount.push(dataListAwaitingSupp);
                        }
                    }

                }
                $('#suppAwaiting').text(itemsSuppAwaitingPaymentcount.length);
                $('#suppOverdue').text(itemsSuppOverduePaymentcount.length);

                $('.suppAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(supptotAmount));
                $('.suppOverdueAmt').text(utilityService.modifynegativeCurrencyFormat(supptotAmountOverDue));
                // templateObject.awaitingpaymentCount.set(itemsAwaitingPaymentcount.length);
            });
        } else {
            let data = JSON.parse(dataObject[0].data);
            let useData = data.tpurchaseorderex;
            let itemsSuppAwaitingPaymentcount = [];
            let itemsSuppOverduePaymentcount = [];
            let dataListAwaitingSupp = {};
            let customerawaitingpaymentCount = '';
            let supptotAmount = 0;
            let supptotAmountOverDue = 0;
            for (let i = 0; i < useData.length; i++) {
                dataListAwaitingSupp = {
                    id: useData[i].Id || '',
                };
                if (useData[i].TotalBalance > 0) {
                    // supptotAmount = data.tpurchaseorder[i].TotalBalance + data.tpurchaseorder[i].TotalBalance;
                    supptotAmount += Number(useData[i].TotalBalance);
                    itemsSuppAwaitingPaymentcount.push(dataListAwaitingSupp);
                    let date = new Date(useData[i].DueDate);
                    if (date < new Date()) {
                        supptotAmountOverDue += Number(useData[i].TotalBalance);
                        itemsSuppOverduePaymentcount.push(dataListAwaitingSupp);
                    }
                }

            }
            $('#suppAwaiting').text(itemsSuppAwaitingPaymentcount.length);
            $('#suppOverdue').text(itemsSuppOverduePaymentcount.length);

            $('.suppAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(supptotAmount));
            $('.suppOverdueAmt').text(utilityService.modifynegativeCurrencyFormat(supptotAmountOverDue));

        }
    }).catch(function(err) {
        paymentService.getOverviewAwaitingSupplierDetails().then(function(data) {
            let itemsSuppAwaitingPaymentcount = [];
            let itemsSuppOverduePaymentcount = [];
            let dataListAwaitingSupp = {};
            let customerawaitingpaymentCount = '';
            let supptotAmount = 0;
            let supptotAmountOverDue = 0;
            for (let i = 0; i < data.tpurchaseorder.length; i++) {
                dataListAwaitingSupp = {
                    id: data.tpurchaseorder[i].Id || '',
                };
                if (data.tpurchaseorder[i].TotalBalance > 0) {
                    // supptotAmount = data.tpurchaseorder[i].TotalBalance + data.tpurchaseorder[i].TotalBalance;
                    supptotAmount += Number(data.tpurchaseorder[i].TotalBalance);
                    itemsSuppAwaitingPaymentcount.push(dataListAwaitingSupp);
                    let date = new Date(data.tpurchaseorder[i].DueDate);
                    if (date < new Date()) {
                        supptotAmountOverDue += Number(data.tpurchaseorder[i].TotalBalance);
                        itemsSuppOverduePaymentcount.push(dataListAwaitingSupp);
                    }
                }

            }
            $('#suppAwaiting').text(itemsSuppAwaitingPaymentcount.length);
            $('#suppOverdue').text(itemsSuppOverduePaymentcount.length);

            $('.suppAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(supptotAmount));
            $('.suppOverdueAmt').text(utilityService.modifynegativeCurrencyFormat(supptotAmountOverDue));
            // templateObject.awaitingpaymentCount.set(itemsAwaitingPaymentcount.length);
        });
    });
    */

    templateObject.resetData = function (dataVal) {
        window.open('/bankingoverview?page=last', '_self');
    }

    // $('#tblBankingOverview').DataTable();
    templateObject.getAllBankAccountData = async function(viewdeleted) {
      var currentBeginDate = new Date();
      var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
      let fromDateMonth = (currentBeginDate.getMonth() + 1);
      let fromDateDay = currentBeginDate.getDate();
      if((currentBeginDate.getMonth()+1) < 10){
          fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
      }else{
        fromDateMonth = (currentBeginDate.getMonth()+1);
      }

      if(currentBeginDate.getDate() < 10){
          fromDateDay = "0" + currentBeginDate.getDate();
      }
      var toDate = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);
      let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        getVS1Data('TBankAccountReport').then(function(dataObject) {

            if (dataObject.length == 0) {
                sideBarService.getAllBankAccountDetails(prevMonth11Date,toDate, true,initialReportLoad,0).then(function(data) {
                    addVS1Data('TBankAccountReport', JSON.stringify(data));
                    let lineItems = [];
                    let lineItemObj = {};
                    let lineID = "";
                    for (let i = 0; i < data.tbankaccountreport.length; i++) {
                        let amount = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].Amount) || 0.00;
                        let amountInc = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].Amountinc) || 0.00;
                        let creditEx = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].TotalCreditInc) || 0.00;
                        let openningBalance = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].OpeningBalanceInc) || 0.00;
                        let closingBalance = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].ClosingBalanceInc) || 0.00;
                        let accountType = data.tbankaccountreport[i].Type || '';
                        // Currency+''+data.tbankaccountreport[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                        // let balance = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].Balance)|| 0.00;
                        // let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].TotalPaid)|| 0.00;
                        // let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].TotalBalance)|| 0.00;
                        if (data.tbankaccountreport[i].Type == "Un-Invoiced PO") {
                            lineID = data.tbankaccountreport[i].PurchaseOrderID;
                        } else if (data.tbankaccountreport[i].Type == "PO") {
                            lineID = data.tbankaccountreport[i].PurchaseOrderID;
                        } else if (data.tbankaccountreport[i].Type == "Invoice") {
                            lineID = data.tbankaccountreport[i].SaleID;
                        } else if (data.tbankaccountreport[i].Type == "Credit") {
                            lineID = data.tbankaccountreport[i].PurchaseOrderID;
                        } else if (data.tbankaccountreport[i].Type == "Supplier Payment") {
                            lineID = data.tbankaccountreport[i].PaymentID;
                        } else if (data.tbankaccountreport[i].Type == "Bill") {
                            lineID = data.tbankaccountreport[i].PurchaseOrderID;
                        } else if (data.tbankaccountreport[i].Type == "Customer Payment") {
                            lineID = data.tbankaccountreport[i].PaymentID;
                        } else if (data.tbankaccountreport[i].Type == "Journal Entry") {
                            lineID = data.tbankaccountreport[i].SaleID;
                        } else if (data.tbankaccountreport[i].Type == "UnInvoiced SO") {
                            lineID = data.tbankaccountreport[i].SaleID;
                        } else if (data.tbankaccountreport[i].Type == "Cheque") {
                            if (Session.get('ERPLoggedCountry') == "Australia") {
                                accountType = "Cheque";
                            } else if (Session.get('ERPLoggedCountry') == "United States of America") {
                                accountType = "Check";
                            } else {
                                accountType = "Cheque";
                            }

                            lineID = data.tbankaccountreport[i].PurchaseOrderID;
                        } else if (data.tbankaccountreport[i].Type == "Check") {
                            lineID = data.tbankaccountreport[i].PurchaseOrderID;
                        }else {
                            lineID = data.tbankaccountreport[i].TransID;
                        }


                        var dataList = {
                            id: lineID || '',
                            sortdate: data.tbankaccountreport[i].Date != '' ? moment(data.tbankaccountreport[i].Date).format("YYYY/MM/DD") : data.tbankaccountreport[i].Date,
                            paymentdate: data.tbankaccountreport[i].Date != '' ? moment(data.tbankaccountreport[i].Date).format("DD/MM/YYYY") : data.tbankaccountreport[i].Date,
                            customername: data.tbankaccountreport[i].ClientName || '',
                            paymentamount: amount || 0.00,
                            amountinc: amountInc || 0.00,
                            creditex: creditEx || 0.00,
                            openingbalance: openningBalance || 0.00,
                            closingbalance: closingBalance || 0.00,
                            accountnumber: data.tbankaccountreport[i].AccountNumber || '',
                            accounttype: data.tbankaccountreport[i].AccountType || '',
                            // balance: balance || 0.00,
                            bankaccount: data.tbankaccountreport[i].AccountName || '',
                            department: data.tbankaccountreport[i].ClassName || '',
                            chqrefno: data.tbankaccountreport[i].ChqRefNo || '',
                            receiptno: data.tbankaccountreport[i].ReceiptNo || '',
                            jobname: data.tbankaccountreport[i].jobname || '',
                            paymentmethod: data.tbankaccountreport[i].PaymentMethod || '',
                            type: accountType || '',
                            notes: data.tbankaccountreport[i].Notes || ''
                        };
                        if (data.tbankaccountreport[i].Type.replace(/\s/g, '') != "") {
                            dataTableList.push(dataList);
                        }

                    }


                    //awaitingpaymentCount
                    templateObject.datatablerecords.set(dataTableList);
                    if (templateObject.datatablerecords.get()) {


                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                    }

                    $('.fullScreenSpin').css('display', 'none');
                    setTimeout(function() {
                        $('#tblBankingOverview').DataTable({
                            // dom: 'lBfrtip',
                            "columnDefs": [{ "targets": 0, "type": "date" }],
                            "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            buttons: [{
                                extend: 'csvHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Banking Overview - " + moment().format(),
                                orientation: 'portrait',
                                exportOptions: {
                                    columns: ':visible'
                                }
                            }, {
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Payment Overview',
                                filename: "Banking Overview - " + moment().format(),
                                exportOptions: {
                                    columns: ':visible'
                                }
                            },
                                      {
                                          extend: 'excelHtml5',
                                          title: '',
                                          download: 'open',
                                          className: "btntabletoexcel hiddenColumn",
                                          filename: "Banking Overview - " + moment().format(),
                                          orientation: 'portrait',
                                          exportOptions: {
                                              columns: ':visible'
                                          }
                                      }
                                     ],
                            select: true,
                            destroy: true,
                            colReorder: true,
                            // bStateSave: true,
                            // rowId: 0,
                            pageLength: initialReportDatatableLoad,
                            "bLengthChange": false,
                            lengthMenu: [ [initialReportDatatableLoad, -1], [initialReportDatatableLoad, "All"] ],
                            info: true,
                            responsive: true,
                            "order": [[ 0, "desc" ],[ 2, "desc" ]],
                            // "aaSorting": [[1,'desc']],
                            action: function() {
                                $('#tblBankingOverview').DataTable().ajax.reload();
                            },
                            "fnDrawCallback": function (oSettings) {
                              let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                                $('.paginate_button.page-item').removeClass('disabled');
                                $('#tblBankingOverview_ellipsis').addClass('disabled');

                                if (oSettings._iDisplayLength == -1) {
                                    if (oSettings.fnRecordsDisplay() > 150) {
                                        $('.paginate_button.page-item.previous').addClass('disabled');
                                        $('.paginate_button.page-item.next').addClass('disabled');
                                    }
                                } else {}
                                if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                    $('.paginate_button.page-item.next').addClass('disabled');
                                }
                                $('.paginate_button.next:not(.disabled)', this.api().table().container())
                                .on('click', function () {
                                    $('.fullScreenSpin').css('display', 'inline-block');
                                    let dataLenght = oSettings._iDisplayLength;

                                    var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                                    var dateTo = new Date($("#dateTo").datepicker("getDate"));

                                    let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                                    let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                                    if(data.Params.IgnoreDates == true){
                                      sideBarService.getAllBankAccountDetails(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                                          getVS1Data('TBankAccountReport').then(function (dataObjectold) {
                                              if (dataObjectold.length == 0) {}
                                              else {
                                                  let dataOld = JSON.parse(dataObjectold[0].data);
                                                  var thirdaryData = $.merge($.merge([], dataObjectnew.tbankaccountreport), dataOld.tbankaccountreport);
                                                  let objCombineData = {
                                                      Params: dataOld.Params,
                                                      tbankaccountreport: thirdaryData
                                                  }

                                                  addVS1Data('TBankAccountReport', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                      templateObject.resetData(objCombineData);
                                                      $('.fullScreenSpin').css('display', 'none');
                                                  }).catch(function (err) {
                                                      $('.fullScreenSpin').css('display', 'none');
                                                  });

                                              }
                                          }).catch(function (err) {});

                                      }).catch(function (err) {
                                          $('.fullScreenSpin').css('display', 'none');
                                      });
                                    }else{
                                    sideBarService.getAllBankAccountDetails(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                                        getVS1Data('TBankAccountReport').then(function (dataObjectold) {
                                            if (dataObjectold.length == 0) {}
                                            else {
                                                let dataOld = JSON.parse(dataObjectold[0].data);
                                                var thirdaryData = $.merge($.merge([], dataObjectnew.tbankaccountreport), dataOld.tbankaccountreport);
                                                let objCombineData = {
                                                    Params: dataOld.Params,
                                                    tbankaccountreport: thirdaryData
                                                }

                                                addVS1Data('TBankAccountReport', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                    templateObject.resetData(objCombineData);
                                                    $('.fullScreenSpin').css('display', 'none');
                                                }).catch(function (err) {
                                                    $('.fullScreenSpin').css('display', 'none');
                                                });

                                            }
                                        }).catch(function (err) {});

                                    }).catch(function (err) {
                                        $('.fullScreenSpin').css('display', 'none');
                                    });
                                  }
                                });

                                setTimeout(function () {
                                    MakeNegative();
                                }, 100);
                            },
                            language: { search: "",searchPlaceholder: "Search List..." },
                            "fnInitComplete": function () {
                              this.fnPageChange('last');
                              if(data.Params.Search.replace(/\s/g, "") == ""){
                                $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblBankingOverview_filter");
                              }else{
                                $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblBankingOverview_filter");
                              }
                                $("<button class='btn btn-primary btnRefreshBankingOverview' type='button' id='btnRefreshBankingOverview' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblBankingOverview_filter");

                                $('.myvarFilterForm').appendTo(".colDateFilter");
                            },
                            "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                              let countTableData = data.Params.Count || 0; //get count from API data

                                return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                            }

                        }).on('page', function() {
                            setTimeout(function() {
                                MakeNegative();
                            }, 100);
                            let draftRecord = templateObject.datatablerecords.get();
                            templateObject.datatablerecords.set(draftRecord);

                        }).on('column-reorder', function() {

                        });
                        $('.fullScreenSpin').css('display', 'none');

                    }, 0);

                    var columns = $('#tblBankingOverview th');
                    let sTible = "";
                    let sWidth = "";
                    let sIndex = "";
                    let sVisible = "";
                    let columVisible = false;
                    let sClass = "";
                    $.each(columns, function(i, v) {
                        if (v.hidden == false) {
                            columVisible = true;
                        }
                        if ((v.className.includes("hiddenColumn"))) {
                            columVisible = false;
                        }
                        sWidth = v.style.width.replace('px', "");

                        let datatablerecordObj = {
                            sTitle: v.innerText || '',
                            sWidth: sWidth || '',
                            sIndex: v.cellIndex || 0,
                            sVisible: columVisible || false,
                            sClass: v.className || ''
                        };
                        tableHeaderList.push(datatablerecordObj);
                    });
                    templateObject.tableheaderrecords.set(tableHeaderList);
                    $('div.dataTables_filter input').addClass('form-control form-control-sm');
                    $('#tblBankingOverview tbody').on('click', 'tr', function() {
                        var listData = $(this).closest('tr').attr('id');
                        var transactiontype = $(event.target).closest("tr").find(".colType").text();
                        if ((listData) && (transactiontype)) {
                            if (transactiontype == "Un-Invoiced PO") {
                                FlowRouter.go('/purchaseordercard?id=' + listData);
                            } else if (transactiontype == "PO") {
                                FlowRouter.go('/purchaseordercard?id=' + listData);
                            } else if (transactiontype == "Invoice") {
                                FlowRouter.go('/invoicecard?id=' + listData);
                            } else if (transactiontype == "Credit") {
                                FlowRouter.go('/creditcard?id=' + listData);
                            } else if (transactiontype == "Supplier Payment") {
                                FlowRouter.go('/supplierpaymentcard?id=' + listData);
                            } else if (transactiontype == "Bill") {
                                FlowRouter.go('/billcard?id=' + listData);
                            } else if (transactiontype == "Customer Payment") {
                                FlowRouter.go('/paymentcard?id=' + listData);
                            } else if (transactiontype == "Journal Entry") {
                                FlowRouter.go('/journalentrycard?id=' + listData);
                            } else if (transactiontype == "UnInvoiced SO") {
                                FlowRouter.go('/salesordercard?id=' + listData);
                            } else if (transactiontype == "Cheque") {
                                FlowRouter.go('/chequecard?id=' + listData);
                            } else if (transactiontype == "Check") {
                                FlowRouter.go('/chequecard?id=' + listData);
                            } else if (transactiontype == "Deposit Entry") {
                                FlowRouter.go('/depositcard?id=' + listData);
                            }else {
                                FlowRouter.go('/chequelist');
                            }

                        }
                    });

                }).catch(function(err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display', 'none');
                    // Meteor._reload.reload();
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tbankaccountreport;
                if(data.Params.IgnoreDates == true){
                  $('#dateFrom').attr('readonly', true);
                  $('#dateTo').attr('readonly', true);
                  //FlowRouter.go('/bankingoverview?ignoredate=true');
                }else{
                  $('#dateFrom').attr('readonly', false);
                  $('#dateTo').attr('readonly', false);
                  $("#dateFrom").val(data.Params.DateFrom !=''? moment(data.Params.DateFrom).format("DD/MM/YYYY"): data.Params.DateFrom);
                  $("#dateTo").val(data.Params.DateTo !=''? moment(data.Params.DateTo).format("DD/MM/YYYY"): data.Params.DateTo);
                }
                let lineItems = [];
                let lineItemObj = {};
                let lineID = "";
                for (let i = 0; i < useData.length; i++) {
                    let amount = utilityService.modifynegativeCurrencyFormat(useData[i].Amount) || 0.00;
                    let amountInc = utilityService.modifynegativeCurrencyFormat(useData[i].Amountinc) || 0.00;
                    let creditEx = utilityService.modifynegativeCurrencyFormat(useData[i].TotalCreditInc) || 0.00;
                    let openningBalance = utilityService.modifynegativeCurrencyFormat(useData[i].OpeningBalanceInc) || 0.00;
                    let closingBalance = utilityService.modifynegativeCurrencyFormat(useData[i].ClosingBalanceInc) || 0.00;
                    let accountType = useData[i].Type || '';
                    // Currency+''+data.tbankaccountreport[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                    // let balance = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].Balance)|| 0.00;
                    // let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].TotalPaid)|| 0.00;
                    // let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].TotalBalance)|| 0.00;
                    if (useData[i].Type == "Un-Invoiced PO") {
                        lineID = useData[i].PurchaseOrderID;
                    } else if (useData[i].Type == "PO") {
                        lineID = useData[i].PurchaseOrderID;
                    } else if (useData[i].Type == "Invoice") {
                        lineID = useData[i].SaleID;
                    } else if (useData[i].Type == "Credit") {
                        lineID = useData[i].PurchaseOrderID;
                    } else if (useData[i].Type == "Supplier Payment") {
                        lineID = useData[i].PaymentID;
                    } else if (useData[i].Type == "Bill") {
                        lineID = useData[i].PurchaseOrderID;
                    } else if (useData[i].Type == "Customer Payment") {
                        lineID = useData[i].PaymentID;
                    } else if (useData[i].Type == "Journal Entry") {
                        lineID = useData[i].SaleID;
                    } else if (useData[i].Type == "UnInvoiced SO") {
                        lineID = useData[i].SaleID;
                    } else if (data.tbankaccountreport[i].Type == "Cheque") {
                        if (Session.get('ERPLoggedCountry') == "Australia") {
                            accountType = "Cheque";
                        } else if (Session.get('ERPLoggedCountry') == "United States of America") {
                            accountType = "Check";
                        } else {
                            accountType = "Cheque";
                        }

                        lineID = useData[i].PurchaseOrderID;
                    } else if (useData[i].Type == "Check") {
                        lineID = useData[i].PurchaseOrderID;
                    }else {
                        lineID = useData[i].TransID;
                    }


                    var dataList = {
                        id: lineID || '',
                        sortdate: useData[i].Date != '' ? moment(useData[i].Date).format("YYYY/MM/DD") : useData[i].Date,
                        paymentdate: useData[i].Date != '' ? moment(useData[i].Date).format("DD/MM/YYYY") : useData[i].Date,
                        customername: useData[i].ClientName || '',
                        paymentamount: amount || 0.00,
                        amountinc: amountInc || 0.00,
                        creditex: creditEx || 0.00,
                        openingbalance: openningBalance || 0.00,
                        closingbalance: closingBalance || 0.00,
                        accountnumber: useData[i].AccountNumber || '',
                        accounttype: useData[i].AccountType || '',
                        // balance: balance || 0.00,
                        bankaccount: useData[i].AccountName || '',
                        department: useData[i].ClassName || '',
                        chqrefno: useData[i].ChqRefNo || '',
                        receiptno: useData[i].ReceiptNo || '',
                        jobname: useData[i].jobname || '',
                        paymentmethod: useData[i].PaymentMethod || '',
                        type: accountType || '',
                        notes: useData[i].Notes || ''
                    };
                    if (useData[i].Type.replace(/\s/g, '') != "") {
                        dataTableList.push(dataList);
                    }

                }


                //awaitingpaymentCount
                templateObject.datatablerecords.set(dataTableList);
                if (templateObject.datatablerecords.get()) {

                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display', 'none');
                setTimeout(function() {
                    $('#tblBankingOverview').DataTable({
                        // dom: 'lBfrtip',
                        "columnDefs": [{ "targets": 0, "type": "date" }],
                        "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                            extend: 'csvHtml5',
                            text: '',
                            download: 'open',
                            className: "btntabletocsv hiddenColumn",
                            filename: "Banking Overview - " + moment().format(),
                            orientation: 'portrait',
                            exportOptions: {
                                columns: ':visible'
                            }
                        }, {
                            extend: 'print',
                            download: 'open',
                            className: "btntabletopdf hiddenColumn",
                            text: '',
                            title: 'Payment Overview',
                            filename: "Banking Overview - " + moment().format(),
                            exportOptions: {
                                columns: ':visible'
                            }
                        },
                                  {
                                      extend: 'excelHtml5',
                                      title: '',
                                      download: 'open',
                                      className: "btntabletoexcel hiddenColumn",
                                      filename: "Banking Overview - " + moment().format(),
                                      orientation: 'portrait',
                                      exportOptions: {
                                          columns: ':visible'
                                      }
                                  }
                                 ],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: initialReportDatatableLoad,
                        "bLengthChange": false,
                        lengthMenu: [ [initialReportDatatableLoad, -1], [initialReportDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[ 0, "desc" ],[ 2, "desc" ]],
                        // "aaSorting": [[1,'desc']],
                        action: function() {
                            $('#tblBankingOverview').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                          let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                            $('.paginate_button.page-item').removeClass('disabled');
                            $('#tblBankingOverview_ellipsis').addClass('disabled');

                            if (oSettings._iDisplayLength == -1) {
                                if (oSettings.fnRecordsDisplay() > 150) {
                                    $('.paginate_button.page-item.previous').addClass('disabled');
                                    $('.paginate_button.page-item.next').addClass('disabled');
                                }
                            } else {}
                            if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                $('.paginate_button.page-item.next').addClass('disabled');
                            }
                            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                            .on('click', function () {
                                $('.fullScreenSpin').css('display', 'inline-block');
                                let dataLenght = oSettings._iDisplayLength;

                                var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                                var dateTo = new Date($("#dateTo").datepicker("getDate"));

                                let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                                let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                                if(data.Params.IgnoreDates == true){
                                  sideBarService.getAllBankAccountDetails(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                                      getVS1Data('TBankAccountReport').then(function (dataObjectold) {
                                          if (dataObjectold.length == 0) {}
                                          else {
                                              let dataOld = JSON.parse(dataObjectold[0].data);
                                              var thirdaryData = $.merge($.merge([], dataObjectnew.tbankaccountreport), dataOld.tbankaccountreport);
                                              let objCombineData = {
                                                  Params: dataOld.Params,
                                                  tbankaccountreport: thirdaryData
                                              }

                                              addVS1Data('TBankAccountReport', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                  templateObject.resetData(objCombineData);
                                                  $('.fullScreenSpin').css('display', 'none');
                                              }).catch(function (err) {
                                                  $('.fullScreenSpin').css('display', 'none');
                                              });

                                          }
                                      }).catch(function (err) {});

                                  }).catch(function (err) {
                                      $('.fullScreenSpin').css('display', 'none');
                                  });
                                }else{
                                sideBarService.getAllBankAccountDetails(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                                    getVS1Data('TBankAccountReport').then(function (dataObjectold) {
                                        if (dataObjectold.length == 0) {}
                                        else {
                                            let dataOld = JSON.parse(dataObjectold[0].data);
                                            var thirdaryData = $.merge($.merge([], dataObjectnew.tbankaccountreport), dataOld.tbankaccountreport);
                                            let objCombineData = {
                                                Params: dataOld.Params,
                                                tbankaccountreport: thirdaryData
                                            }

                                            addVS1Data('TBankAccountReport', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                templateObject.resetData(objCombineData);
                                                $('.fullScreenSpin').css('display', 'none');
                                            }).catch(function (err) {
                                                $('.fullScreenSpin').css('display', 'none');
                                            });

                                        }
                                    }).catch(function (err) {});

                                }).catch(function (err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });
                              }
                            });

                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        language: { search: "",searchPlaceholder: "Search List..." },
                        "fnInitComplete": function () {
                          this.fnPageChange('last');
                          if(data.Params.Search.replace(/\s/g, "") == ""){
                            $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblBankingOverview_filter");
                          }else{
                            $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblBankingOverview_filter");
                          }
                            $("<button class='btn btn-primary btnRefreshBankingOverview' type='button' id='btnRefreshBankingOverview' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblBankingOverview_filter");

                            $('.myvarFilterForm').appendTo(".colDateFilter");
                        },
                        "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                          let countTableData = data.Params.Count || 0; //get count from API data

                            return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                        }

                    }).on('page', function() {
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);

                    }).on('column-reorder', function() {

                    });
                    $('.fullScreenSpin').css('display', 'none');

                }, 0);

                var columns = $('#tblBankingOverview th');
                let sTible = "";
                let sWidth = "";
                let sIndex = "";
                let sVisible = "";
                let columVisible = false;
                let sClass = "";
                $.each(columns, function(i, v) {
                    if (v.hidden == false) {
                        columVisible = true;
                    }
                    if ((v.className.includes("hiddenColumn"))) {
                        columVisible = false;
                    }
                    sWidth = v.style.width.replace('px', "");

                    let datatablerecordObj = {
                        sTitle: v.innerText || '',
                        sWidth: sWidth || '',
                        sIndex: v.cellIndex || 0,
                        sVisible: columVisible || false,
                        sClass: v.className || ''
                    };
                    tableHeaderList.push(datatablerecordObj);
                });
                templateObject.tableheaderrecords.set(tableHeaderList);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                $('#tblBankingOverview tbody').on('click', 'tr', function() {
                    var listData = $(this).closest('tr').attr('id');
                    var transactiontype = $(event.target).closest("tr").find(".colType").text();
                    if ((listData) && (transactiontype)) {
                        if (transactiontype == "Un-Invoiced PO") {
                            FlowRouter.go('/purchaseordercard?id=' + listData);
                        } else if (transactiontype == "PO") {
                            FlowRouter.go('/purchaseordercard?id=' + listData);
                        } else if (transactiontype == "Invoice") {
                            FlowRouter.go('/invoicecard?id=' + listData);
                        } else if (transactiontype == "Credit") {
                            FlowRouter.go('/creditcard?id=' + listData);
                        } else if (transactiontype == "Supplier Payment") {
                            FlowRouter.go('/supplierpaymentcard?id=' + listData);
                        } else if (transactiontype == "Bill") {
                            FlowRouter.go('/billcard?id=' + listData);
                        } else if (transactiontype == "Customer Payment") {
                            FlowRouter.go('/paymentcard?id=' + listData);
                        } else if (transactiontype == "Journal Entry") {
                            FlowRouter.go('/journalentrycard?id=' + listData);
                        } else if (transactiontype == "UnInvoiced SO") {
                            FlowRouter.go('/salesordercard?id=' + listData);
                        } else if (transactiontype == "Cheque") {
                            FlowRouter.go('/chequecard?id=' + listData);
                        } else if (transactiontype == "Check") {
                            FlowRouter.go('/chequecard?id=' + listData);
                        } else if (transactiontype == "Deposit Entry") {
                            FlowRouter.go('/depositcard?id=' + listData);
                        } else {
                            FlowRouter.go('/chequelist');
                        }

                    }
                });

            }
        }).catch(function(err) {
            sideBarService.getAllBankAccountDetails(prevMonth11Date,toDate, true,initialReportLoad,0,viewdeleted).then(function(data) {
                addVS1Data('TBankAccountReport', JSON.stringify(data));
                let lineItems = [];
                let lineItemObj = {};
                let lineID = "";
                for (let i = 0; i < data.tbankaccountreport.length; i++) {
                    let amount = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].Amount) || 0.00;
                    let amountInc = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].Amountinc) || 0.00;
                    let creditEx = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].TotalCreditInc) || 0.00;
                    let openningBalance = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].OpeningBalanceInc) || 0.00;
                    let closingBalance = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].ClosingBalanceInc) || 0.00;
                    let accountType = data.tbankaccountreport[i].Type || '';
                    // Currency+''+data.tbankaccountreport[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                    // let balance = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].Balance)|| 0.00;
                    // let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].TotalPaid)|| 0.00;
                    // let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tbankaccountreport[i].TotalBalance)|| 0.00;
                    if (data.tbankaccountreport[i].Type == "Un-Invoiced PO") {
                        lineID = data.tbankaccountreport[i].PurchaseOrderID;
                    } else if (data.tbankaccountreport[i].Type == "PO") {
                        lineID = data.tbankaccountreport[i].PurchaseOrderID;
                    } else if (data.tbankaccountreport[i].Type == "Invoice") {
                        lineID = data.tbankaccountreport[i].SaleID;
                    } else if (data.tbankaccountreport[i].Type == "Credit") {
                        lineID = data.tbankaccountreport[i].PurchaseOrderID;
                    } else if (data.tbankaccountreport[i].Type == "Supplier Payment") {
                        lineID = data.tbankaccountreport[i].PaymentID;
                    } else if (data.tbankaccountreport[i].Type == "Bill") {
                        lineID = data.tbankaccountreport[i].PurchaseOrderID;
                    } else if (data.tbankaccountreport[i].Type == "Customer Payment") {
                        lineID = data.tbankaccountreport[i].PaymentID;
                    } else if (data.tbankaccountreport[i].Type == "Journal Entry") {
                        lineID = data.tbankaccountreport[i].SaleID;
                    } else if (data.tbankaccountreport[i].Type == "UnInvoiced SO") {
                        lineID = data.tbankaccountreport[i].SaleID;
                    } else if (data.tbankaccountreport[i].Type == "Cheque") {
                        if (Session.get('ERPLoggedCountry') == "Australia") {
                            accountType = "Cheque";
                        } else if (Session.get('ERPLoggedCountry') == "United States of America") {
                            accountType = "Check";
                        } else {
                            accountType = "Cheque";
                        }

                        lineID = data.tbankaccountreport[i].PurchaseOrderID;
                    } else if (data.tbankaccountreport[i].Type == "Check") {
                        lineID = data.tbankaccountreport[i].PurchaseOrderID;
                    }else {
                        lineID = data.tbankaccountreport[i].TransID;
                    }


                    var dataList = {
                        id: lineID || '',
                        sortdate: data.tbankaccountreport[i].Date != '' ? moment(data.tbankaccountreport[i].Date).format("YYYY/MM/DD") : data.tbankaccountreport[i].Date,
                        paymentdate: data.tbankaccountreport[i].Date != '' ? moment(data.tbankaccountreport[i].Date).format("DD/MM/YYYY") : data.tbankaccountreport[i].Date,
                        customername: data.tbankaccountreport[i].ClientName || '',
                        paymentamount: amount || 0.00,
                        amountinc: amountInc || 0.00,
                        creditex: creditEx || 0.00,
                        openingbalance: openningBalance || 0.00,
                        closingbalance: closingBalance || 0.00,
                        accountnumber: data.tbankaccountreport[i].AccountNumber || '',
                        accounttype: data.tbankaccountreport[i].AccountType || '',
                        // balance: balance || 0.00,
                        bankaccount: data.tbankaccountreport[i].AccountName || '',
                        department: data.tbankaccountreport[i].ClassName || '',
                        chqrefno: data.tbankaccountreport[i].ChqRefNo || '',
                        receiptno: data.tbankaccountreport[i].ReceiptNo || '',
                        jobname: data.tbankaccountreport[i].jobname || '',
                        paymentmethod: data.tbankaccountreport[i].PaymentMethod || '',
                        type: accountType || '',
                        notes: data.tbankaccountreport[i].Notes || ''
                    };
                    if (data.tbankaccountreport[i].Type.replace(/\s/g, '') != "") {
                        dataTableList.push(dataList);
                    }

                }


                //awaitingpaymentCount
                templateObject.datatablerecords.set(dataTableList);
                if (templateObject.datatablerecords.get()) {


                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display', 'none');
                setTimeout(function() {
                    $('#tblBankingOverview').DataTable({
                        // dom: 'lBfrtip',
                        "columnDefs": [{ "targets": 0, "type": "date" }],
                        "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                            extend: 'csvHtml5',
                            text: '',
                            download: 'open',
                            className: "btntabletocsv hiddenColumn",
                            filename: "Banking Overview - " + moment().format(),
                            orientation: 'portrait',
                            exportOptions: {
                                columns: ':visible'
                            }
                        }, {
                            extend: 'print',
                            download: 'open',
                            className: "btntabletopdf hiddenColumn",
                            text: '',
                            title: 'Payment Overview',
                            filename: "Banking Overview - " + moment().format(),
                            exportOptions: {
                                columns: ':visible'
                            }
                        },
                                  {
                                      extend: 'excelHtml5',
                                      title: '',
                                      download: 'open',
                                      className: "btntabletoexcel hiddenColumn",
                                      filename: "Banking Overview - " + moment().format(),
                                      orientation: 'portrait',
                                      exportOptions: {
                                          columns: ':visible'
                                      }
                                  }
                                 ],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: initialReportDatatableLoad,
                        "bLengthChange": false,
                        lengthMenu: [ [initialReportDatatableLoad, -1], [initialReportDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[ 0, "desc" ],[ 2, "desc" ]],
                        // "aaSorting": [[1,'desc']],
                        action: function() {
                            $('#tblBankingOverview').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                          let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                            $('.paginate_button.page-item').removeClass('disabled');
                            $('#tblBankingOverview_ellipsis').addClass('disabled');

                            if (oSettings._iDisplayLength == -1) {
                                if (oSettings.fnRecordsDisplay() > 150) {
                                    $('.paginate_button.page-item.previous').addClass('disabled');
                                    $('.paginate_button.page-item.next').addClass('disabled');
                                }
                            } else {}
                            if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                $('.paginate_button.page-item.next').addClass('disabled');
                            }
                            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                            .on('click', function () {
                                $('.fullScreenSpin').css('display', 'inline-block');
                                let dataLenght = oSettings._iDisplayLength;

                                var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                                var dateTo = new Date($("#dateTo").datepicker("getDate"));

                                let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                                let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                                if(data.Params.IgnoreDates == true){
                                  sideBarService.getAllBankAccountDetails(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                                      getVS1Data('TBankAccountReport').then(function (dataObjectold) {
                                          if (dataObjectold.length == 0) {}
                                          else {
                                              let dataOld = JSON.parse(dataObjectold[0].data);
                                              var thirdaryData = $.merge($.merge([], dataObjectnew.tbankaccountreport), dataOld.tbankaccountreport);
                                              let objCombineData = {
                                                  Params: dataOld.Params,
                                                  tbankaccountreport: thirdaryData
                                              }

                                              addVS1Data('TBankAccountReport', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                  templateObject.resetData(objCombineData);
                                                  $('.fullScreenSpin').css('display', 'none');
                                              }).catch(function (err) {
                                                  $('.fullScreenSpin').css('display', 'none');
                                              });

                                          }
                                      }).catch(function (err) {});

                                  }).catch(function (err) {
                                      $('.fullScreenSpin').css('display', 'none');
                                  });
                                }else{
                                sideBarService.getAllBankAccountDetails(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                                    getVS1Data('TBankAccountReport').then(function (dataObjectold) {
                                        if (dataObjectold.length == 0) {}
                                        else {
                                            let dataOld = JSON.parse(dataObjectold[0].data);
                                            var thirdaryData = $.merge($.merge([], dataObjectnew.tbankaccountreport), dataOld.tbankaccountreport);
                                            let objCombineData = {
                                                Params: dataOld.Params,
                                                tbankaccountreport: thirdaryData
                                            }

                                            addVS1Data('TBankAccountReport', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                templateObject.resetData(objCombineData);
                                                $('.fullScreenSpin').css('display', 'none');
                                            }).catch(function (err) {
                                                $('.fullScreenSpin').css('display', 'none');
                                            });

                                        }
                                    }).catch(function (err) {});

                                }).catch(function (err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });
                              }
                            });

                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        language: { search: "",searchPlaceholder: "Search List..." },
                        "fnInitComplete": function () {
                          this.fnPageChange('last');
                          if(data.Params.Search.replace(/\s/g, "") == ""){
                            $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblBankingOverview_filter");
                          }else{
                            $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblBankingOverview_filter");
                          }
                            $("<button class='btn btn-primary btnRefreshBankingOverview' type='button' id='btnRefreshBankingOverview' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblBankingOverview_filter");

                            $('.myvarFilterForm').appendTo(".colDateFilter");
                        },
                        "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                          let countTableData = data.Params.Count || 0; //get count from API data

                            return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                        }

                    }).on('page', function() {
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);

                    }).on('column-reorder', function() {

                    });
                    $('.fullScreenSpin').css('display', 'none');

                }, 0);

                var columns = $('#tblBankingOverview th');
                let sTible = "";
                let sWidth = "";
                let sIndex = "";
                let sVisible = "";
                let columVisible = false;
                let sClass = "";
                $.each(columns, function(i, v) {
                    if (v.hidden == false) {
                        columVisible = true;
                    }
                    if ((v.className.includes("hiddenColumn"))) {
                        columVisible = false;
                    }
                    sWidth = v.style.width.replace('px', "");

                    let datatablerecordObj = {
                        sTitle: v.innerText || '',
                        sWidth: sWidth || '',
                        sIndex: v.cellIndex || 0,
                        sVisible: columVisible || false,
                        sClass: v.className || ''
                    };
                    tableHeaderList.push(datatablerecordObj);
                });
                templateObject.tableheaderrecords.set(tableHeaderList);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                $('#tblBankingOverview tbody').on('click', 'tr', function() {
                    var listData = $(this).closest('tr').attr('id');
                    var transactiontype = $(event.target).closest("tr").find(".colType").text();
                    if ((listData) && (transactiontype)) {
                        if (transactiontype == "Un-Invoiced PO") {
                            FlowRouter.go('/purchaseordercard?id=' + listData);
                        } else if (transactiontype == "PO") {
                            FlowRouter.go('/purchaseordercard?id=' + listData);
                        } else if (transactiontype == "Invoice") {
                            FlowRouter.go('/invoicecard?id=' + listData);
                        } else if (transactiontype == "Credit") {
                            FlowRouter.go('/creditcard?id=' + listData);
                        } else if (transactiontype == "Supplier Payment") {
                            FlowRouter.go('/supplierpaymentcard?id=' + listData);
                        } else if (transactiontype == "Bill") {
                            FlowRouter.go('/billcard?id=' + listData);
                        } else if (transactiontype == "Customer Payment") {
                            FlowRouter.go('/paymentcard?id=' + listData);
                        } else if (transactiontype == "Journal Entry") {
                            FlowRouter.go('/journalentrycard?id=' + listData);
                        } else if (transactiontype == "UnInvoiced SO") {
                            FlowRouter.go('/salesordercard?id=' + listData);
                        } else if (transactiontype == "Cheque") {
                            FlowRouter.go('/chequecard?id=' + listData);
                        } else if (transactiontype == "Check") {
                            FlowRouter.go('/chequecard?id=' + listData);
                        } else if (transactiontype == "Deposit Entry") {
                            FlowRouter.go('/depositcard?id=' + listData);
                        }else {
                            FlowRouter.go('/chequelist');
                        }

                    }
                });

            }).catch(function(err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
                // Meteor._reload.reload();
            });
        });

    }
    templateObject.getAllBankAccountData('');

    templateObject.getAllFilterbankingData = function (fromDate,toDate, ignoreDate) {
      sideBarService.getAllBankAccountDetails(fromDate,toDate, ignoreDate,initialReportLoad,0).then(function(data) {

        addVS1Data('TBankAccountReport',JSON.stringify(data)).then(function (datareturn) {
            window.open('/bankingoverview?toDate=' + toDate + '&fromDate=' + fromDate + '&ignoredate='+ignoreDate,'_self');
        }).catch(function (err) {
          location.reload();
        });

            }).catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                templateObject.datatablerecords.set('');
                $('.fullScreenSpin').css('display','none');
                // Meteor._reload.reload();
            });
    }

    let urlParametersDateFrom = FlowRouter.current().queryParams.fromDate;
    let urlParametersDateTo = FlowRouter.current().queryParams.toDate;
    let urlParametersIgnoreDate = FlowRouter.current().queryParams.ignoredate;
    if(urlParametersDateFrom){
      if(urlParametersIgnoreDate == true){
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
      }else{

        $("#dateFrom").val(urlParametersDateFrom !=''? moment(urlParametersDateFrom).format("DD/MM/YYYY"): urlParametersDateFrom);
        $("#dateTo").val(urlParametersDateTo !=''? moment(urlParametersDateTo).format("DD/MM/YYYY"): urlParametersDateTo);
      }
    }
  tableResize();
});

Template.bankingoverview.events({
    'click .btnEft': function() {
      FlowRouter.go('/eft');
    },
    "keyup #tblBankingOverview_filter input": function (event) {
      if ($(event.target).val() != "") {
        $(".btnRefreshBankingOverview").addClass("btnSearchAlert");
      } else {
        $(".btnRefreshBankingOverview").removeClass("btnSearchAlert");
      }
      if (event.keyCode == 13) {
        $(".btnRefresh").trigger("click");
      }
    },
    "click .btnRefreshBankingOverview": function () {
        $(".btnRefresh").trigger("click");
    },
    'click .btnRefresh': function() {
      var currentBeginDate = new Date();
      var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
      let fromDateMonth = (currentBeginDate.getMonth() + 1);
      let fromDateDay = currentBeginDate.getDate();
      if((currentBeginDate.getMonth()+1) < 10){
          fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
      }else{
        fromDateMonth = (currentBeginDate.getMonth()+1);
      }

      if(currentBeginDate.getDate() < 10){
          fromDateDay = "0" + currentBeginDate.getDate();
      }
      var toDate = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);
      let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");
        $('.fullScreenSpin').css('display', 'inline-block');
        let templateObject = Template.instance();

        sideBarService.getAllBankAccountDetails(prevMonth11Date,toDate, true,initialReportLoad,0).then(function(data) {
            addVS1Data('TBankAccountReport', JSON.stringify(data)).then(function(datareturn) {
                window.open('/bankingoverview','_self');
            }).catch(function(err) {
                window.open('/bankingoverview','_self');
            });
        }).catch(function(err) {
            window.open('/bankingoverview','_self');
        });
        //templateObject.getAllBankAccountData();
    },
    'change #dateTo': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
          templateObject.getAllFilterbankingData(formatDateFrom,formatDateTo, false);
        }
        },500);
    },
    'change #dateFrom': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
            templateObject.getAllFilterbankingData(formatDateFrom,formatDateTo, false);
        }
        },500);
    },
    'click #today': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        }else{
          fromDateMonth = (currentBeginDate.getMonth()+1);
        }

        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDateERPFrom = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);
        var toDateERPTo = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);

        var toDateDisplayFrom = (fromDateDay)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();
        var toDateDisplayTo = (fromDateDay)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();

        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterbankingData(toDateERPFrom,toDateERPTo, false);
    },
    'click #lastweek': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        }else{
          fromDateMonth = (currentBeginDate.getMonth()+1);
        }

        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDateERPFrom = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay - 7);
        var toDateERPTo = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);

        var toDateDisplayFrom = (fromDateDay -7)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();
        var toDateDisplayTo = (fromDateDay)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();

        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterbankingData(toDateERPFrom,toDateERPTo, false);
    },
    'click #lastMonth': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();

        var prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        var prevMonthFirstDate = new Date(currentDate.getFullYear() - (currentDate.getMonth() > 0 ? 0 : 1), (currentDate.getMonth() - 1 + 12) % 12, 1);

        var formatDateComponent = function(dateComponent) {
          return (dateComponent < 10 ? '0' : '') + dateComponent;
        };

        var formatDate = function(date) {
          return  formatDateComponent(date.getDate()) + '/' + formatDateComponent(date.getMonth() + 1) + '/' + date.getFullYear();
        };

        var formatDateERP = function(date) {
          return  date.getFullYear() + '-' + formatDateComponent(date.getMonth() + 1) + '-' + formatDateComponent(date.getDate());
        };


        var fromDate = formatDate(prevMonthFirstDate);
        var toDate = formatDate(prevMonthLastDate);

        $("#dateFrom").val(fromDate);
        $("#dateTo").val(toDate);

        var getLoadDate = formatDateERP(prevMonthLastDate);
        let getDateFrom = formatDateERP(prevMonthFirstDate);
        templateObject.getAllFilterbankingData(getDateFrom,getLoadDate, false);
    },
    'click #lastQuarter': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        var begunDate = moment(currentDate).format("DD/MM/YYYY");
        function getQuarter(d) {
            d = d || new Date();
            var m = Math.floor(d.getMonth() / 3) + 2;
            return m > 4 ? m - 4 : m;
        }

        var quarterAdjustment = (moment().month() % 3) + 1;
        var lastQuarterEndDate = moment().subtract({
            months: quarterAdjustment
        }).endOf('month');
        var lastQuarterStartDate = lastQuarterEndDate.clone().subtract({
            months: 2
        }).startOf('month');

        var lastQuarterStartDateFormat = moment(lastQuarterStartDate).format("DD/MM/YYYY");
        var lastQuarterEndDateFormat = moment(lastQuarterEndDate).format("DD/MM/YYYY");


        $("#dateFrom").val(lastQuarterStartDateFormat);
        $("#dateTo").val(lastQuarterEndDateFormat);

        let fromDateMonth = getQuarter(currentDate);
        var quarterMonth = getQuarter(currentDate);
        let fromDateDay = currentDate.getDate();

        var getLoadDate = moment(lastQuarterEndDate).format("YYYY-MM-DD");
        let getDateFrom = moment(lastQuarterStartDateFormat).format("YYYY-MM-DD");
        templateObject.getAllFilterbankingData(getDateFrom,getLoadDate, false);
    },
    'click #last12Months': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
        let fromDateDay = currentDate.getDate();
        if ((currentDate.getMonth()+1) < 10) {
            fromDateMonth = "0" + (currentDate.getMonth()+1);
        }
        if (currentDate.getDate() < 10) {
            fromDateDay = "0" + currentDate.getDate();
        }

        var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + Math.floor(currentDate.getFullYear() - 1);
        $("#dateFrom").val(fromDate);
        $("#dateTo").val(begunDate);

        var currentDate2 = new Date();
        if ((currentDate2.getMonth()+1) < 10) {
            fromDateMonth2 = "0" + Math.floor(currentDate2.getMonth() + 1);
        }
        if (currentDate2.getDate() < 10) {
            fromDateDay2 = "0" + currentDate2.getDate();
        }
        var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
        let getDateFrom = Math.floor(currentDate2.getFullYear() - 1) + "-" + fromDateMonth2 + "-" + currentDate2.getDate();
        templateObject.getAllFilterbankingData(getDateFrom,getLoadDate, false);

    },
    'click #ignoreDate': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
        templateObject.getAllFilterbankingData('', '', true);
    },
    'click #newSalesOrder': function(event) {
        FlowRouter.go('/salesordercard');
    },
    'click .btnNewDepositEnrty': function(event) {
        FlowRouter.go('/depositcard');
    },
    'click .btnDepositList': function(event) {
        FlowRouter.go('/depositlist');
    },
    'click .btnCustomerlist': function(event) {
        FlowRouter.go('/customerpayment');
    },
    'click #newInvoice': function(event) {
        FlowRouter.go('/invoicecard');
    },
    'click .btnSupplierPaymentList': function(event) {
        FlowRouter.go('/supplierpayment');
    },
    'click #newQuote': function(event) {
        FlowRouter.go('/quotecard');
    },
    'click .QuoteList': function(event) {
        FlowRouter.go('/quoteslist');
    },
    'click #btnNewCheck': function(event) {
        FlowRouter.go('/chequecard');
    },
    'click .chkDatatable': function(event) {
        var columns = $('#tblBankingOverview th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();

        $.each(columns, function(i, v) {
            let className = v.classList;
            let replaceClass = className[1];

            if (v.innerText === columnDataValue) {
                if ($(event.target).is(':checked')) {
                    $("." + replaceClass + "").css('display', 'table-cell');
                    $("." + replaceClass + "").css('padding', '.75rem');
                    $("." + replaceClass + "").css('vertical-align', 'top');
                } else {
                    $("." + replaceClass + "").css('display', 'none');
                }
            }
        });
    },


  // custom field displaysettings
  "click .saveTable": async function(event) {
    let lineItems = [];
    $(".fullScreenSpin").css("display", "inline-block");

    $(".customDisplaySettings").each(function (index) {
      var $tblrow = $(this);
      var fieldID = $tblrow.attr("custid") || 0;
      var colTitle = $tblrow.find(".divcolumn").text() || "";
      var colWidth = $tblrow.find(".custom-range").val() || 0;
      var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || "";
      var colHidden = false;
      if ($tblrow.find(".custom-control-input").is(":checked")) {
        colHidden = true;
      } else {
        colHidden = false;
      }
      let lineItemObj = {
        index: parseInt(fieldID),
        label: colTitle,
        active: colHidden,
        width: parseInt(colWidth),
        class: colthClass,
        display: true
      };

      lineItems.push(lineItemObj);
    });

    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    reset_data = reset_data.filter(redata => redata.display == false);
    lineItems.push(...reset_data);
    lineItems.sort((a,b) => a.index - b.index);

    try {
      let erpGet = erpDb();
      let tableName = "tblBankingOverview";
      let employeeId = parseInt(Session.get('mySessionEmployeeLoggedID'))||0;

      let added = await sideBarService.saveNewCustomFields(erpGet, tableName, employeeId, lineItems);
      $(".fullScreenSpin").css("display", "none");
      if(added) {
        sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')),'').then(function (dataCustomize) {
            addVS1Data('VS1_Customize', JSON.stringify(dataCustomize));
        });
          swal({
            title: 'SUCCESS',
            text: "Display settings is updated!",
            type: 'success',
            showCancelButton: false,
            confirmButtonText: 'OK'
          }).then((result) => {
              if (result.value) {
                $('#myModal2').modal('hide');
              }
          });
      } else {
        swal("Something went wrong!", "", "error");
      }
    } catch (error) {
      $(".fullScreenSpin").css("display", "none");
      swal("Something went wrong!", "", "error");
    }
  },

  // custom field displaysettings
  "click .resetTable": async function (event) {
      let templateObject = Template.instance();
        let reset_data = templateObject.reset_data.get();
        reset_data = reset_data.filter(redata => redata.display);

        $(".customDisplaySettings").each(function (index) {
          let $tblrow = $(this);
          $tblrow.find(".divcolumn").text(reset_data[index].label);
          $tblrow
            .find(".custom-control-input")
            .prop("checked", reset_data[index].active);

          let title = $("#tblQuoteLine").find("th").eq(index);
          if(reset_data[index].class === 'AmountEx' || reset_data[index].class === 'UnitPriceEx') {
            $(title).html(reset_data[index].label + `<i class="fas fa-random fa-trans"></i>`);
          } else if( reset_data[index].class === 'AmountInc' || reset_data[index].class === 'UnitPriceInc') {
            $(title).html(reset_data[index].label + `<i class="fas fa-random"></i>`);
          } else {
            $(title).html(reset_data[index].label);
          }


          if (reset_data[index].active) {
            $('.col' + reset_data[index].class).addClass('showColumn');
            $('.col' + reset_data[index].class).removeClass('hiddenColumn');
          } else {
            $('.col' + reset_data[index].class).addClass('hiddenColumn');
            $('.col' + reset_data[index].class).removeClass('showColumn');
          }
          $(".rngRange" + reset_data[index].class).val(reset_data[index].width);
        });
    },
    'change .custom-range': function(event) {
      let range = $(event.target).val();
      let colClassName = $(event.target).attr("valueclass");
      $('.col' + colClassName).css('width', range);
    },
    'click .custom-control-input': function(event) {
      let colClassName = $(event.target).attr("id");
      if ($(event.target).is(':checked')) {
        $('.col' + colClassName).addClass('showColumn');
        $('.col' + colClassName).removeClass('hiddenColumn');
      } else {
        $('.col' + colClassName).addClass('hiddenColumn');
        $('.col' + colClassName).removeClass('showColumn');
      }
    },

    // 'blur .divcolumn': function(event) {
    //     let columData = $(event.target).text();

    //     let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');

    //     var datable = $('#tblBankingOverview').DataTable();
    //     var title = datable.column(columnDatanIndex).header();
    //     $(title).html(columData);

    // },
    // 'change .rngRange': function(event) {
    //     let range = $(event.target).val();
    //     // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

    //     // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
    //     let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
    //     var datable = $('#tblBankingOverview th');
    //     $.each(datable, function(i, v) {

    //         if (v.innerText === columnDataValue) {
    //             let className = v.className;
    //             let replaceClass = className.replace(/ /g, ".");
    //             $("." + replaceClass + "").css('width', range + 'px');

    //         }
    //     });

    // },
    // 'click .btnOpenSettings': function(event) {
    //     let templateObject = Template.instance();
    //     var columns = $('#tblBankingOverview th');

    //     const tableHeaderList = [];
    //     let sTible = "";
    //     let sWidth = "";
    //     let sIndex = "";
    //     let sVisible = "";
    //     let columVisible = false;
    //     let sClass = "";
    //     $.each(columns, function(i, v) {
    //         if (v.hidden === false) {
    //             columVisible = true;
    //         }
    //         if ((v.className.includes("hiddenColumn"))) {
    //             columVisible = false;
    //         }
    //         sWidth = v.style.width.replace('px', "");

    //         let datatablerecordObj = {
    //             sTitle: v.innerText || '',
    //             sWidth: sWidth || '',
    //             sIndex: v.cellIndex || 0,
    //             sVisible: columVisible || false,
    //             sClass: v.className || ''
    //         };
    //         tableHeaderList.push(datatablerecordObj);
    //     });
    //     templateObject.tableheaderrecords.set(tableHeaderList);
    // },
    'click .exportbtn': function() {

        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblBankingOverview_wrapper .dt-buttons .btntabletoexcel').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    'click .printConfirm': function(event) {
        playPrintAudio();
        setTimeout(function(){
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblBankingOverview_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display', 'none');
    }, delayTimeAfterSound);
    },
    'click .openaccountpayable': function() {
        FlowRouter.go('/chequelist');
    },
    'click .opentrans': async function(event) {
        let bankAccountName = $(event.target).closest('.openaccountreceivable').attr('id');
        // FlowRouter.go('/accounttransactions?id=' + id);
        await clearData('TAccountRunningBalanceReport');
        FlowRouter.go("/balancetransactionlist?accountName=" +bankAccountName +"&isTabItem=" +false);
    },
    'click .btnPrinStatment': function() {
        FlowRouter.go('/statementlist');
    },
    'click .btnStockAdjustment': function() {
        FlowRouter.go('/chequelist');
    },
    'click .btnReconcile': function() {
        FlowRouter.go('/bankrecon');
        // FlowRouter.go('/bankrecon');
        // window.open('/newbankrecon', '_self');
    },
    'click .btnBankRecon': function() {
        FlowRouter.go('/newbankrecon');
    },
    'click .btnReconList': function() {
        FlowRouter.go('/reconciliationlist');
    },
    'click #btnReconRuleList': function() {
        FlowRouter.go('/reconrulelist');
    },
    'click #btnNewReconRule': function(event) {
        FlowRouter.go('/newreconrule');
    },
    'click #btnBankRuleList': function() {
        FlowRouter.go('/bankrulelist');
    },
    'click #btnNewBankRule': function(event) {
        FlowRouter.go('/newbankrule');
    },
});
Template.bankingoverview.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function(a, b) {
            if (a.paymentdate === 'NA') {
                return 1;
            } else if (b.paymentdate === 'NA') {
                return -1;
            }
            return (a.paymentdate.toUpperCase() > b.paymentdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: Session.get('mycloudLogonID'), PrefName: 'tblBankingOverview' });
    },
    formname: () => {
        return chequeSpelling;
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    },
    bankaccountdatarecord: () => {
        return Template.instance().bankaccountdatarecord.get();
    },
    // custom field displaysettings
    displayfields: () => {
      return Template.instance().displayfields.get();
    },
});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});
