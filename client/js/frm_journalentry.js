import {
    PurchaseBoardService
} from './purchase-service';
import {
    ReactiveVar
} from 'meteor/reactive-var';
import {
    CoreService
} from '../js/core-service';
import {
    DashBoardService
} from "../Dashboard/dashboard-service";
import {
    UtilityService
} from "../utility-service";
import {
    ProductService
} from "../product/product-service";
import {
    AccountService
} from "../accounts/account-service";
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import {
    Random
} from 'meteor/random';
import {
    jsPDF
} from 'jspdf';
import 'jQuery.print/jQuery.print.js';
import {
    autoTable
} from 'jspdf-autotable';
import 'jquery-editable-select';
import {
    SideBarService
} from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import { convertToForeignAmount } from '../payments/paymentcard/supplierPaymentcard';
import { getCurrentCurrencySymbol } from '../popUps/currnecypopup';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
var times = 0;
let defaultCurrencyCode = CountryAbbr;

var template_list = [
    "Journal Entry",
];
var noHasTotals = ["Customer Payment", "Customer Statement", "Supplier Payment", "Statement", "Delivery Docket", "Journal Entry", "Deposit"];

Template.journalentrycard.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.isForeignEnabled = new ReactiveVar(false);

    templateObject.records = new ReactiveVar();
    templateObject.CleintName = new ReactiveVar();
    templateObject.Department = new ReactiveVar();
    templateObject.Date = new ReactiveVar();
    templateObject.DueDate = new ReactiveVar();
    templateObject.BillNo = new ReactiveVar();
    templateObject.RefNo = new ReactiveVar();
    templateObject.Branding = new ReactiveVar();
    templateObject.Currency = new ReactiveVar();
    templateObject.Total = new ReactiveVar();
    templateObject.Subtotal = new ReactiveVar();
    templateObject.TotalTax = new ReactiveVar();
    templateObject.record = new ReactiveVar({});
    templateObject.taxrateobj = new ReactiveVar();
    templateObject.Accounts = new ReactiveVar([]);
    templateObject.BillId = new ReactiveVar();
    templateObject.selectedCurrency = new ReactiveVar([]);
    templateObject.inputSelectedCurrency = new ReactiveVar([]);
    templateObject.currencySymbol = new ReactiveVar([]);
    templateObject.deptrecords = new ReactiveVar();
    templateObject.termrecords = new ReactiveVar();
    templateObject.clientrecords = new ReactiveVar([]);
    templateObject.taxraterecords = new ReactiveVar([]);


    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();

    templateObject.address = new ReactiveVar();
    templateObject.abn = new ReactiveVar();
    templateObject.referenceNumber = new ReactiveVar();

    templateObject.statusrecords = new ReactiveVar([]);

    templateObject.totalCredit = new ReactiveVar();
    templateObject.totalCredit.set(Currency + '0.00');
    templateObject.totalDebit = new ReactiveVar();
    templateObject.totalDebit.set(Currency + '0.00');

    templateObject.totalCreditInc = new ReactiveVar();
    templateObject.totalCreditInc.set(Currency + '0.00');
    templateObject.totalDebitInc = new ReactiveVar();
    templateObject.totalDebitInc.set(Currency + '0.00');
    templateObject.currencyList = new ReactiveVar([]);
    templateObject.hasFollow = new ReactiveVar(false);
});
Template.journalentrycard.onRendered(() => {
    let templateObject = Template.instance();
    templateObject.hasFollowings = async function() {
        var currentDate = new Date();
        let purchaseService = new PurchaseBoardService();
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentInvoice = getso_id[getso_id.length - 1];
        if (getso_id[1]) {
            currentInvoice = parseInt(currentInvoice);
            var journalData = await purchaseService.getOneJournalEnrtyData(currentInvoice);
            var isRepeated = journalData.fields.RepeatedFrom;
            templateObject.hasFollow.set(isRepeated);
        }
    }
    templateObject.hasFollowings();
    $('#edtFrequencyDetail').css('display', 'none');
    // $('#onEventSettings').css('display', 'none');
    // $('#basedOnFrequency').prop('checked', false);
    // $('#basedOnPrint').prop('checked', false);
    // $('#basedOnSave').prop('checked', false);
    // $('#basedOnTransactionDate').prop('checked', false);
    // $('#basedOnDueDate').prop('checked', false);
    // $('#basedOnEvent').prop('checked', false);
    $("#date-input,#edtWeeklyStartDate,#edtWeeklyFinishDate,#dtDueDate,#customdateone,#edtMonthlyStartDate,#edtMonthlyFinishDate,#edtDailyStartDate,#edtDailyFinishDate,#edtOneTimeOnlyDate").datepicker({
      showOn: 'button',
      buttonText: 'Show Date',
      buttonImageOnly: true,
      buttonImage: '/img/imgCal2.png',
      constrainInput: false,
      dateFormat: 'd/mm/yy',
      showOtherMonths: true,
      selectOtherMonths: true,
      changeMonth: true,
      changeYear: true,
      yearRange: "-90:+10",
    });

    templateObject.getDayNumber = function (day) {
      day = day.toLowerCase();
      if (day == "") {
          return;
      }
      if (day == "monday") {
          return 1;
      }
      if (day == "tuesday") {
          return 2;
      }
      if (day == "wednesday") {
          return 3;
      }
      if (day == "thursday") {
          return 4;
      }
      if (day == "friday") {
          return 5;
      }
      if (day == "saturday") {
          return 6;
      }
      if (day == "sunday") {
          return 0;
      }
    }
    templateObject.getMonths = function (startDate, endDate) {
      let dateone = "";
      let datetwo = "";
      if (startDate != "") {
          dateone = moment(startDate).format('M');
      }
      if (endDate != "") {
          datetwo = parseInt(moment(endDate).format('M')) + 1;
      }
      if (dateone != "" && datetwo != "") {
          for (let x = dateone; x < datetwo; x++) {
              if (x == 1) {
                  $("#formCheck-january").prop('checked', true);
              }
              if (x == 2) {
                  $("#formCheck-february").prop('checked', true);
              }
              if (x == 3) {
                  $("#formCheck-march").prop('checked', true);
              }
              if (x == 4) {
                  $("#formCheck-april").prop('checked', true);
              }
              if (x == 5) {
                  $("#formCheck-may").prop('checked', true);
              }
              if (x == 6) {
                  $("#formCheck-june").prop('checked', true);
              }
              if (x == 7) {
                  $("#formCheck-july").prop('checked', true);
              }
              if (x == 8) {
                  $("#formCheck-august").prop('checked', true);
              }
              if (x == 9) {
                  $("#formCheck-september").prop('checked', true);
              }
              if (x == 10) {
                  $("#formCheck-october").prop('checked', true);
              }
              if (x == 11) {
                  $("#formCheck-november").prop('checked', true);
              }
              if (x == 12) {
                  $("#formCheck-december").prop('checked', true);
              }
          }
      }
      if (dateone == "") {
          $("#formCheck-january").prop('checked', true);
      }
    }

    let imageData = (localStorage.getItem("Image"));
    if (imageData) {
        $('.uploadedImage').attr('src', imageData);
    };

    const records = [];
    let purchaseService = new PurchaseBoardService();
    let clientsService = new PurchaseBoardService();
    let productsService = new PurchaseBoardService();

    const clientList = [];
    const productsList = [];
    const accountsList = [];
    const deptrecords = [];
    const termrecords = [];
    const statusList = [];
    const newJournalId = '';
    const taxCodesList = [];

    templateObject.getAllJournalIds = function() {
        purchaseService.getJournalIds().then(function(data) {
            let latestPOId;
            if (data.tjournalentry.length) {
                let lastElement = data.tjournalentry[data.tjournalentry.length - 1];
                latestPOId = (lastElement.Id);
            } else {
                latestPOId = 0;
            }
            newJournalId = (latestPOId + 1);
            $('#edtEnrtyNo').val(newJournalId);

        }).catch(function(err) {
            newJournalId = 0;
            $('#edtEnrtyNo').val(newJournalId);
        });
    };



    setTimeout(function() {
        $("#date-input,#dtSODate,#dtTransDate").datepicker({
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
        });
    }, 500);

    $('.fullScreenSpin').css('display', 'inline-block');
    templateObject.getAllClients = function() {
        clientsService.getSupplierVS1().then(function(data) {
            for (let i in data.tsuppliervs1) {

                let supplierrecordObj = {
                    supplierid: data.tsuppliervs1[i].Id || ' ',
                    suppliername: data.tsuppliervs1[i].ClientName || ' ',
                    supplieremail: data.tsuppliervs1[i].Email || ' ',
                    street: data.tsuppliervs1[i].Street || ' ',
                    street2: data.tsuppliervs1[i].Street2 || ' ',
                    street3: data.tsuppliervs1[i].Street3 || ' ',
                    suburb: data.tsuppliervs1[i].Suburb || ' ',
                    statecode: data.tsuppliervs1[i].State + ' ' + data.tsuppliervs1[i].Postcode || ' ',
                    country: data.tsuppliervs1[i].Country || ' '
                };

                clientList.push(supplierrecordObj);

                $('#edtSupplierName').editableSelect('add', data.tsuppliervs1[i].ClientName);
            }
            templateObject.clientrecords.set(clientList);


        });
    };

    templateObject.getDepartments = function() {
        getVS1Data('TDeptClass').then(function(dataObject) {
            if (dataObject.length == 0) {
                purchaseService.getDepartment().then(function(data) {
                    for (let i in data.tdeptclass) {

                        let deptrecordObj = {
                            department: data.tdeptclass[i].DeptClassName || ' ',
                        };

                        deptrecords.push(deptrecordObj);
                        templateObject.deptrecords.set(deptrecords);

                    }
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tdeptclass;
                for (let i in useData) {

                    let deptrecordObj = {
                        id: useData[i].Id || ' ',
                        department: useData[i].DeptClassName || ' ',
                    };
                    deptrecords.push(deptrecordObj);
                    templateObject.deptrecords.set(deptrecords);

                }

            }
        }).catch(function(err) {
            purchaseService.getDepartment().then(function(data) {
                for (let i in data.tdeptclass) {

                    let deptrecordObj = {
                        department: data.tdeptclass[i].DeptClassName || ' ',
                    };

                    deptrecords.push(deptrecordObj);
                    templateObject.deptrecords.set(deptrecords);

                }
            });
        });
    }


    setTimeout(function() {
        templateObject.getDepartments();
    }, 500);
    var url = FlowRouter.current().path;
    if (url.indexOf('?id=') > 0) {
        var getso_id = url.split('?id=');
        var currentBill = getso_id[getso_id.length - 1];
        if (getso_id[1]) {
            currentBill = parseInt(currentBill);
            templateObject.getJournalData = function() {
                getVS1Data('TJournalEntryLines').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        purchaseService.getOneJournalEnrtyData(currentBill).then(function(data) {
                            $('.fullScreenSpin').css('display', 'none');
                            let lineItems = [];
                            let lineItemObj = {};
                            let lineItemsTable = [];
                            let lineItemTableObj = {};
                            let currencySymbol = Currency;
                            let department = data.fields.Lines[0].fields.DeptName;
                            let totalCredit = 0;
                            let totalDebit = 0;
                            let totalCreditInc = 0;
                            let totalDebitInc = 0;
                            if(data.fields.Lines != null){
                            if (data.fields.Lines.length) {
                                for (let i = 0; i < data.fields.Lines.length; i++) {
                                    let creditAmountEx = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.CreditAmount) || 0.00;
                                    let debitAmountEx = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.DebitAmount) || 0.00;
                                    let creditAmountInc = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.CreditAmountInc) || 0.00;
                                    let debitAmountInc = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.DebitAmountInc) || 0.00;
                                    let totalTax = data.fields.Lines[i].fields.TaxAmount;
                                    let TaxRateGbp = data.fields.Lines[i].fields.LineTaxRate;

                                    if (!isNaN(data.fields.Lines[i].fields.CreditAmount)) {
                                        totalCredit += isNaN(data.fields.Lines[i].fields.CreditAmount) ? 0 : data.fields.Lines[i].fields.CreditAmount;
                                    };

                                    if (!isNaN(data.fields.Lines[i].fields.DebitAmount)) {
                                        totalDebit += isNaN(data.fields.Lines[i].fields.DebitAmount) ? 0 : data.fields.Lines[i].fields.DebitAmount;
                                    };

                                    if (!isNaN(data.fields.Lines[i].fields.CreditAmountInc)) {
                                        totalCreditInc += isNaN(data.fields.Lines[i].fields.CreditAmountInc) ? 0 : data.fields.Lines[i].fields.CreditAmountInc;
                                    };

                                    if (!isNaN(data.fields.Lines[i].fields.DebitAmountInc)) {
                                        totalDebitInc += isNaN(data.fields.Lines[i].fields.DebitAmountInc) ? 0 : data.fields.Lines[i].fields.DebitAmountInc;
                                    };
                                    lineItemObj = {
                                        lineID: Random.id(),
                                        id: data.fields.Lines[i].fields.ID || '',
                                        accountname: data.fields.Lines[i].fields.AccountName || '',
                                        accountno: data.fields.Lines[i].fields.AccountNumber || '',
                                        memo: data.fields.Lines[i].fields.Memo || '',
                                        creditex: creditAmountEx || 0,
                                        debitex: debitAmountEx || 0,
                                        creditinc: creditAmountInc || 0,
                                        debitinc: debitAmountInc || 0,
                                        TaxTotal: totalTax || 0,
                                        taxCode: data.fields.Lines[i].fields.TaxCode || '',

                                    };


                                    lineItems.push(lineItemObj);
                                }
                            }
                            }
                            let record = {
                                id: data.fields.ID,
                                lid: 'Edit Journal Entry' + ' ' + data.fields.ID,
                                accountname: '',
                                memo: data.fields.Memo,
                                department: department,
                                entryno: data.fields.TransactionNo,
                                transdate: data.fields.TransactionDate ? moment(data.fields.TransactionDate).format('DD/MM/YYYY') : "",
                                LineItems: lineItems,
                                isReconciled: data.fields.IsReconciled
                            };

                            setTimeout(function() {
                                $('#sltDepartment').val(department);
                            }, 200);
                            if (data.fields.IsReconciled) {
                                $(".btnDeleteJournal").prop("disabled", true);
                                $(".btnDelete").prop("disabled", true);
                                $("#form :input").prop("disabled", true);
                            }
                            $(".btnDeleteJournal").prop("disabled", false);
                            $(".btnDelete").prop("disabled", false);
                            $(".printConfirm").prop("disabled", false);
                            $(".btnBack").prop("disabled", false);
                            $(".close").prop("disabled", false);
                            templateObject.record.set(record);
                            templateObject.totalCredit.set(utilityService.modifynegativeCurrencyFormat(totalCredit));
                            templateObject.totalDebit.set(utilityService.modifynegativeCurrencyFormat(totalDebit));
                            templateObject.totalCreditInc.set(utilityService.modifynegativeCurrencyFormat(totalCreditInc));
                            templateObject.totalDebitInc.set(utilityService.modifynegativeCurrencyFormat(totalDebitInc));

                            if (templateObject.record.get()) {
                                Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblJournalEntryLine', function(error, result) {
                                    if (error) {

                                    } else {
                                        if (result) {
                                            for (let i = 0; i < result.customFields.length; i++) {
                                                let customcolumn = result.customFields;
                                                let columData = customcolumn[i].label;
                                                let columHeaderUpdate = customcolumn[i].thclass;
                                                let hiddenColumn = customcolumn[i].hidden;
                                                let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
                                                let columnWidth = customcolumn[i].width;


                                                $("" + columHeaderUpdate + "").html(columData);
                                                if (columnWidth != 0) {
                                                    $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
                                                }

                                                if (hiddenColumn == true) {

                                                    $("." + columnClass + "").addClass('hiddenColumn');
                                                    $("." + columnClass + "").removeClass('showColumn');
                                                    $(".chk" + columnClass + "").removeAttr('checked');
                                                } else if (hiddenColumn == false) {
                                                    $("." + columnClass + "").removeClass('hiddenColumn');
                                                    $("." + columnClass + "").addClass('showColumn');
                                                    $(".chk" + columnClass + "").attr('checked', 'checked');

                                                }

                                            }
                                        }

                                    }
                                });
                            }
                            setTimeout(function() {

                            }, 1000);
                        }).catch(function(err) {
                            swal({
                                title: 'Oooops...',
                                text: err,
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'Try Again'
                            }).then((result) => {
                                if (result.value) {if(err === checkResponseError){window.open('/', '_self');}}
                                else if (result.dismiss === 'cancel') {

                                }
                            });
                            $('.fullScreenSpin').css('display', 'none');

                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tjournalentry;
                        var added = false;
                        for (let d = 0; d < useData.length; d++) {
                            if (parseInt(useData[d].fields.ID) === currentBill) {
                                added = true;
                                $('.fullScreenSpin').css('display', 'none');
                                let lineItems = [];
                                let lineItemObj = {};
                                let lineItemsTable = [];
                                let lineItemTableObj = {};
                                let currencySymbol = Currency;
                                let department = useData[d].fields.Lines[0].fields.DeptName;
                                let totalCredit = 0;
                                let totalDebit = 0;


                                let totalCreditInc = 0;
                                let totalDebitInc = 0;



                                if (useData[d].fields.Lines.length) {
                                    for (let i = 0; i < useData[d].fields.Lines.length; i++) {
                                        let creditAmountEx = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.CreditAmount) || 0.00;
                                        let debitAmountEx = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.DebitAmount) || 0.00;

                                        let creditAmountInc = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.CreditAmountInc) || 0.00;
                                        let debitAmountInc = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.DebitAmountInc) || 0.00;

                                        let totalTax = useData[d].fields.Lines[i].fields.TaxAmount;
                                        let TaxRateGbp = useData[d].fields.Lines[i].fields.LineTaxRate;

                                        if (!isNaN(useData[d].fields.Lines[i].fields.CreditAmount)) {
                                            totalCredit += isNaN(useData[d].fields.Lines[i].fields.CreditAmount) ? 0 : useData[d].fields.Lines[i].fields.CreditAmount;
                                        };

                                        if (!isNaN(useData[d].fields.Lines[i].fields.DebitAmount)) {
                                            totalDebit += isNaN(useData[d].fields.Lines[i].fields.DebitAmount) ? 0 : useData[d].fields.Lines[i].fields.DebitAmount;
                                        };

                                        if (!isNaN(useData[d].fields.Lines[i].fields.CreditAmountInc)) {
                                            totalCreditInc += isNaN(useData[d].fields.Lines[i].fields.CreditAmountInc) ? 0 : useData[d].fields.Lines[i].fields.CreditAmountInc;
                                        };

                                        if (!isNaN(useData[d].fields.Lines[i].fields.DebitAmountInc)) {
                                            totalDebitInc += isNaN(useData[d].fields.Lines[i].fields.DebitAmountInc) ? 0 : useData[d].fields.Lines[i].fields.DebitAmountInc;
                                        };
                                        lineItemObj = {
                                            lineID: Random.id(),
                                            id: useData[d].fields.Lines[i].fields.ID || '',
                                            accountname: useData[d].fields.Lines[i].fields.AccountName || '',
                                            accountno: useData[d].fields.Lines[i].fields.AccountNumber || '',
                                            memo: useData[d].fields.Lines[i].fields.Memo || '',
                                            creditex: creditAmountEx || 0,
                                            debitex: debitAmountEx || 0,
                                            creditinc: creditAmountInc || 0,
                                            debitinc: debitAmountInc || 0,
                                            TaxTotal: totalTax || 0,
                                            taxRate: useData[d].fields.Lines[i].fields.TaxRate || 0,
                                            taxCode: useData[d].fields.Lines[i].fields.TaxCode || '',

                                        };


                                        lineItems.push(lineItemObj);
                                    }

                                }

                                let record = {
                                    id: useData[d].fields.ID,
                                    lid: 'Edit Journal Entry' + ' ' + useData[d].fields.ID,
                                    accountname: '',
                                    memo: useData[d].fields.Memo,
                                    department: department,
                                    entryno: useData[d].fields.TransactionNo,
                                    transdate: useData[d].fields.TransactionDate ? moment(useData[d].fields.TransactionDate).format('DD/MM/YYYY') : "",
                                    LineItems: lineItems,
                                    isReconciled: useData[d].fields.IsReconciled || false
                                };
                                setTimeout(function() {
                                    $('#sltDepartment').val(department);
                                }, 200);

                                if (useData[d].fields.IsReconciled) {
                                    $(".btnDeleteJournal").prop("disabled", true);
                                    $(".btnDelete").prop("disabled", true);
                                    $("#form :input").prop("disabled", true);
                                }
                                $(".btnDeleteJournal").prop("disabled", false);
                                $(".btnDelete").prop("disabled", false);
                                $(".printConfirm").prop("disabled", false);
                                $(".btnBack").prop("disabled", false);
                                $(".close").prop("disabled", false);
                                templateObject.record.set(record);
                                templateObject.totalCredit.set(utilityService.modifynegativeCurrencyFormat(totalCredit));
                                templateObject.totalDebit.set(utilityService.modifynegativeCurrencyFormat(totalDebit));
                                templateObject.totalCreditInc.set(utilityService.modifynegativeCurrencyFormat(totalCreditInc));
                                templateObject.totalDebitInc.set(utilityService.modifynegativeCurrencyFormat(totalDebitInc));
                                if (templateObject.record.get()) {
                                    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblJournalEntryLine', function(error, result) {
                                        if (error) {

                                        } else {
                                            if (result) {
                                                for (let i = 0; i < result.customFields.length; i++) {
                                                    let customcolumn = result.customFields;
                                                    let columData = customcolumn[i].label;
                                                    let columHeaderUpdate = customcolumn[i].thclass;
                                                    let hiddenColumn = customcolumn[i].hidden;
                                                    let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
                                                    let columnWidth = customcolumn[i].width;


                                                    $("" + columHeaderUpdate + "").html(columData);
                                                    if (columnWidth != 0) {
                                                        $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
                                                    }

                                                    if (hiddenColumn == true) {

                                                        $("." + columnClass + "").addClass('hiddenColumn');
                                                        $("." + columnClass + "").removeClass('showColumn');
                                                        $(".chk" + columnClass + "").removeAttr('checked');
                                                    } else if (hiddenColumn == false) {
                                                        $("." + columnClass + "").removeClass('hiddenColumn');
                                                        $("." + columnClass + "").addClass('showColumn');
                                                        $(".chk" + columnClass + "").attr('checked', 'checked');

                                                    }

                                                }
                                            }

                                        }
                                    });
                                }
                                setTimeout(function() {

                                }, 1000);
                            }
                        }

                        if (!added) {
                            purchaseService.getOneJournalEnrtyData(currentBill).then(function(data) {
                                $('.fullScreenSpin').css('display', 'none');
                                let lineItems = [];
                                let lineItemObj = {};
                                let lineItemsTable = [];
                                let lineItemTableObj = {};
                                let currencySymbol = Currency;
                                let department = data.fields.Lines[0].fields.DeptName;
                                let totalCredit = 0;
                                let totalDebit = 0;
                                if(data.fields.Lines != null){
                                if (data.fields.Lines.length) {
                                    for (let i = 0; i < data.fields.Lines.length; i++) {
                                        let creditAmountEx = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.CreditAmount) || 0.00;
                                        let debitAmountEx = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.DebitAmount) || 0.00;
                                        let totalTax = data.fields.Lines[i].fields.TaxAmount;
                                        let TaxRateGbp = data.fields.Lines[i].fields.LineTaxRate;

                                        if (!isNaN(data.fields.Lines[i].fields.CreditAmount)) {
                                            totalCredit += isNaN(data.fields.Lines[i].fields.CreditAmount) ? 0 : data.fields.Lines[i].fields.CreditAmount;
                                        };

                                        if (!isNaN(data.fields.Lines[i].fields.DebitAmount)) {
                                            totalDebit += isNaN(data.fields.Lines[i].fields.DebitAmount) ? 0 : data.fields.Lines[i].fields.DebitAmount;
                                        };
                                        lineItemObj = {
                                            lineID: Random.id(),
                                            id: data.fields.Lines[i].fields.ID || '',
                                            accountname: data.fields.Lines[i].fields.AccountName || '',
                                            accountno: data.fields.Lines[i].fields.AccountNumber || '',
                                            memo: data.fields.Lines[i].fields.Memo || '',
                                            creditex: creditAmountEx || 0,
                                            debitex: debitAmountEx || 0,
                                            TaxTotal: totalTax || 0,
                                            taxCode: data.fields.Lines[i].fields.TaxCode || '',

                                        };


                                        lineItems.push(lineItemObj);
                                    }
                                }
                                }

                                let record = {
                                    id: data.fields.ID,
                                    lid: 'Edit Journal Entry' + ' ' + data.fields.ID,
                                    accountname: '',
                                    memo: data.fields.Memo,
                                    department: department,
                                    entryno: data.fields.TransactionNo,
                                    transdate: data.fields.TransactionDate ? moment(data.fields.TransactionDate).format('DD/MM/YYYY') : "",
                                    LineItems: lineItems,
                                    isReconciled: data.fields.IsReconciled
                                };

                                if (data.fields.IsReconciled) {
                                    $(".btnDeleteJournal").prop("disabled", true);
                                    $(".btnDelete").prop("disabled", true);
                                    $("#form :input").prop("disabled", true);
                                }
                                templateObject.record.set(record);
                                templateObject.totalCredit.set(utilityService.modifynegativeCurrencyFormat(totalCredit));
                                templateObject.totalDebit.set(utilityService.modifynegativeCurrencyFormat(totalDebit));

                                if (templateObject.record.get()) {
                                    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblJournalEntryLine', function(error, result) {
                                        if (error) {

                                        } else {
                                            if (result) {
                                                for (let i = 0; i < result.customFields.length; i++) {
                                                    let customcolumn = result.customFields;
                                                    let columData = customcolumn[i].label;
                                                    let columHeaderUpdate = customcolumn[i].thclass;
                                                    let hiddenColumn = customcolumn[i].hidden;
                                                    let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
                                                    let columnWidth = customcolumn[i].width;


                                                    $("" + columHeaderUpdate + "").html(columData);
                                                    if (columnWidth != 0) {
                                                        $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
                                                    }

                                                    if (hiddenColumn == true) {

                                                        $("." + columnClass + "").addClass('hiddenColumn');
                                                        $("." + columnClass + "").removeClass('showColumn');
                                                        $(".chk" + columnClass + "").removeAttr('checked');
                                                    } else if (hiddenColumn == false) {
                                                        $("." + columnClass + "").removeClass('hiddenColumn');
                                                        $("." + columnClass + "").addClass('showColumn');
                                                        $(".chk" + columnClass + "").attr('checked', 'checked');

                                                    }

                                                }
                                            }

                                        }
                                    });
                                }
                            }).catch(function(err) {
                                swal({
                                    title: 'Oooops...',
                                    text: err,
                                    type: 'error',
                                    showCancelButton: false,
                                    confirmButtonText: 'Try Again'
                                }).then((result) => {
                                    if (result.value) {if(err === checkResponseError){window.open('/', '_self');}}
                                    else if (result.dismiss === 'cancel') {

                                    }
                                });
                                $('.fullScreenSpin').css('display', 'none');

                            });
                        }
                    }
                }).catch(function(err) {
                    purchaseService.getOneJournalEnrtyData(currentBill).then(function(data) {
                        $('.fullScreenSpin').css('display', 'none');
                        let lineItems = [];
                        let lineItemObj = {};
                        let lineItemsTable = [];
                        let lineItemTableObj = {};
                        let currencySymbol = Currency;
                        let department = data.fields.Lines[0].fields.DeptName;
                        let totalCredit = 0;
                        let totalDebit = 0;
                        if(data.fields.Lines != null){
                        if (data.fields.Lines.length) {
                            for (let i = 0; i < data.fields.Lines.length; i++) {
                                let creditAmountEx = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.CreditAmount) || 0.00;
                                let debitAmountEx = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.DebitAmount) || 0.00;
                                let totalTax = data.fields.Lines[i].fields.TaxAmount;
                                let TaxRateGbp = data.fields.Lines[i].fields.LineTaxRate;

                                if (!isNaN(data.fields.Lines[i].fields.CreditAmount)) {
                                    totalCredit += isNaN(data.fields.Lines[i].fields.CreditAmount) ? 0 : data.fields.Lines[i].fields.CreditAmount;
                                };

                                if (!isNaN(data.fields.Lines[i].fields.DebitAmount)) {
                                    totalDebit += isNaN(data.fields.Lines[i].fields.DebitAmount) ? 0 : data.fields.Lines[i].fields.DebitAmount;
                                };
                                lineItemObj = {
                                    lineID: Random.id(),
                                    id: data.fields.Lines[i].fields.ID || '',
                                    accountname: data.fields.Lines[i].fields.AccountName || '',
                                    accountno: data.fields.Lines[i].fields.AccountNumber || '',
                                    memo: data.fields.Lines[i].fields.Memo || '',
                                    creditex: creditAmountEx || 0,
                                    debitex: debitAmountEx || 0,
                                    TaxTotal: totalTax || 0,
                                    taxCode: data.fields.Lines[i].fields.TaxCode || '',

                                };


                                lineItems.push(lineItemObj);
                            }
                        }
                         }
                        let record = {
                            id: data.fields.ID,
                            lid: 'Edit Journal Entry' + ' ' + data.fields.ID,
                            accountname: '',
                            memo: data.fields.Memo,
                            department: department,
                            entryno: data.fields.TransactionNo,
                            transdate: data.fields.TransactionDate ? moment(data.fields.TransactionDate).format('DD/MM/YYYY') : "",
                            LineItems: lineItems,
                            isReconciled: data.fields.IsReconciled
                        };
                        setTimeout(function() {
                            $('#sltDepartment').val(department);
                        }, 200);
                        if (data.fields.IsReconciled) {
                            $(".btnDeleteJournal").prop("disabled", true);
                            $(".btnDelete").prop("disabled", true);
                            $("#form :input").prop("disabled", true);
                        }
                        $(".btnDeleteJournal").prop("disabled", false);
                        $(".btnDelete").prop("disabled", false);
                        $(".printConfirm").prop("disabled", false);
                        $(".btnBack").prop("disabled", false);

                        templateObject.record.set(record);
                        templateObject.totalCredit.set(utilityService.modifynegativeCurrencyFormat(totalCredit));
                        templateObject.totalDebit.set(utilityService.modifynegativeCurrencyFormat(totalDebit));

                        if (templateObject.record.get()) {
                            Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblJournalEntryLine', function(error, result) {
                                if (error) {

                                } else {
                                    if (result) {
                                        for (let i = 0; i < result.customFields.length; i++) {
                                            let customcolumn = result.customFields;
                                            let columData = customcolumn[i].label;
                                            let columHeaderUpdate = customcolumn[i].thclass;
                                            let hiddenColumn = customcolumn[i].hidden;
                                            let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
                                            let columnWidth = customcolumn[i].width;


                                            $("" + columHeaderUpdate + "").html(columData);
                                            if (columnWidth != 0) {
                                                $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
                                            }

                                            if (hiddenColumn == true) {

                                                $("." + columnClass + "").addClass('hiddenColumn');
                                                $("." + columnClass + "").removeClass('showColumn');
                                                $(".chk" + columnClass + "").removeAttr('checked');
                                            } else if (hiddenColumn == false) {
                                                $("." + columnClass + "").removeClass('hiddenColumn');
                                                $("." + columnClass + "").addClass('showColumn');
                                                $(".chk" + columnClass + "").attr('checked', 'checked');

                                            }

                                        }
                                    }

                                }
                            });
                        }
                        setTimeout(function() {

                        }, 1000);
                    }).catch(function(err) {
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {if(err === checkResponseError){window.open('/', '_self');}}
                            else if (result.dismiss === 'cancel') {

                            }
                        });
                        $('.fullScreenSpin').css('display', 'none');

                    });
                });

            };

            templateObject.getJournalData();
        }

    } else {
        $('.fullScreenSpin').css('display', 'none');

        setTimeout(function() {
            templateObject.getAllJournalIds();
        }, 500);
        let lineItems = [];
        let lineItemsTable = [];
        let lineItemObj = {};

        for (let i = 0; i < 2; i++) {
            lineItemObj = {
                lineID: Random.id(),
                item: '',
                accountname: '',
                accountno: '',
                memo: '',
                creditex: '',
                debitex: '',
                taxCode: ''
            };
            lineItems.push(lineItemObj);
        }
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");
        let record = {
            id: '',
            lid: 'New Journal Entry',
            accountname: '',
            memo: '',
            department: defaultDept,
            entryno: '',
            transdate: begunDate,
            LineItems: lineItems,
            isReconciled: false

        };
        setTimeout(function() {
            $('#sltDepartment').val(defaultDept);
        }, 200);
        templateObject.record.set(record);
        if (templateObject.record.get()) {
            Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblJournalEntryLine', function(error, result) {
                if (error) {

                } else {
                    if (result) {
                        for (let i = 0; i < result.customFields.length; i++) {
                            let customcolumn = result.customFields;
                            let columData = customcolumn[i].label;
                            let columHeaderUpdate = customcolumn[i].thclass;
                            let hiddenColumn = customcolumn[i].hidden;
                            let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
                            let columnWidth = customcolumn[i].width;

                            $("" + columHeaderUpdate + "").html(columData);
                            if (columnWidth != 0) {
                                $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
                            }
                            if (hiddenColumn == true) {
                                $("." + columnClass + "").addClass('hiddenColumn');
                                $("." + columnClass + "").removeClass('showColumn');
                                $(".chk" + columnClass + "").removeAttr('checked');
                            } else if (hiddenColumn == false) {
                                $("." + columnClass + "").removeClass('hiddenColumn');
                                $("." + columnClass + "").addClass('showColumn');
                                $(".chk" + columnClass + "").attr('checked', 'checked');
                            }

                        }
                    }

                }
            });
        }
    }

    if (FlowRouter.current().queryParams.id) {

    } else {
        setTimeout(function() {
            $('#tblJournalEntryLine .lineAccountName:first').trigger("click");
        }, 200);
    }

    let table;
    $(document).ready(function() {
        $('#addRow').on('click', function() {
            var rowData = $('#tblJournalEntryLine tbody>tr:last').clone(true);
            let tokenid = Random.id();
            $(".lineAccountName", rowData).val("");
            $(".lineMemo", rowData).text("");
            $(".lineCreditEx", rowData).val("");
            $(".lineDebitEx", rowData).val("");

            rowData.attr('id', tokenid);
            $("#tblJournalEntryLine tbody").append(rowData);
            setTimeout(function() {
                $('#' + tokenid + " .lineAccountName").trigger('click');
            }, 200);
        });

    });


    $(document).on("click", "#tblAccount tbody tr", function(e) {
      $(".colAccountName").removeClass('boldtablealertsborder');
        let selectLineID = $('#selectLineID').val();
        let taxcodeList = templateObject.taxraterecords.get();
        var table = $(this);
        let utilityService = new UtilityService();
        let $tblrows = $("#tblJournalEntryLine tbody tr");

        if (selectLineID) {
            let lineProductName = table.find(".productName").text();
            let lineProductDesc = table.find(".productDesc").text();
            let lineAccoutNo = table.find(".accountnumber").text();

            let lineUnitPrice = "0.00";
            let lineTaxRate = table.find(".taxrate").text();
            let subGrandTotal = 0;
            let taxGrandTotal = 0;
            $('#' + selectLineID + " .lineTaxRate").text(0);
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == lineTaxRate) {
                        $('#' + selectLineID + " .lineTaxRate").text(taxcodeList[i].coderate || 0);
                    }
                }
            }
            $('#' + selectLineID + " .lineAccountName").val(lineProductName);
            $('#' + selectLineID + " .lineMemo").text(lineProductDesc);
            $('#' + selectLineID + " .lineCreditEx").val(utilityService.modifynegativeCurrencyFormat(0));
            $('#' + selectLineID + " .lineCreditInc").val(utilityService.modifynegativeCurrencyFormat(0));
            $('#' + selectLineID + " .lineDebitEx").val(utilityService.modifynegativeCurrencyFormat(0));
            $('#' + selectLineID + " .lineDebitInc").val(utilityService.modifynegativeCurrencyFormat(0));
            $('#' + selectLineID + " .lineTaxCode").val(lineTaxRate);
            let lineAmount = 0;
            let subGrandCreditTotal = 0;
            let subGrandDebitTotal = 0;

            let subGrandCreditTotalInc = 0;
            let subGrandDebitTotalInc = 0;
            $tblrows.each(function(index) {
                var $tblrow = $(this);
                var taxcode = $tblrow.find(".lineTaxCode").val() || 0;
                var taxrateamount = 0;
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename == taxcode) {
                            taxrateamount = taxcodeList[i].coderate;
                        }
                    }
                }



                var credit = $tblrow.find(".lineCreditInc").val() || Currency + '0';
                var debit = $tblrow.find(".lineDebitInc").val() || Currency + '0';

                let taxRateAmountCalc = (parseFloat(taxrateamount) + 100) / 100;

                var subTotalCredit = (parseFloat(credit.replace(/[^0-9.-]+/g, "")) / (taxRateAmountCalc)) || Currency + '0';
                var subTotalDebit = (parseFloat(debit.replace(/[^0-9.-]+/g, "")) / (taxRateAmountCalc)) || Currency + '0';

                var taxTotalCredit = parseFloat(credit.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotalCredit) || 0;
                var taxTotalDebit = parseFloat(debit.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotalDebit) || 0;
                $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalCredit));

                if (!isNaN(subTotalCredit)) {
                    $tblrow.find('.lineCreditExChange').val(utilityService.modifynegativeCurrencyFormat(subTotalCredit.toFixed(2)));
                    let totalCreditInc = (parseFloat(subTotalCredit)) + (parseFloat(taxTotalCredit)) || 0;
                    $tblrow.find('.lineCreditIncChange').val(utilityService.modifynegativeCurrencyFormat(totalCreditInc.toFixed(2)));
                    subGrandCreditTotal += isNaN(subTotalCredit) ? 0 : subTotalCredit;
                    subGrandCreditTotalInc += isNaN(totalCreditInc) ? 0 : totalCreditInc;
                };
                if (!isNaN(subTotalDebit)) {
                    $tblrow.find('.lineDebitExChange').val(utilityService.modifynegativeCurrencyFormat(subTotalDebit.toFixed(2)));
                    let totalDebitInc = (parseFloat(subTotalDebit)) + (parseFloat(taxTotalDebit)) || 0;
                    $tblrow.find('.lineDebitIncChange').val(utilityService.modifynegativeCurrencyFormat(totalDebitInc.toFixed(2)));
                    subGrandDebitTotal += isNaN(subTotalDebit) ? 0 : subTotalDebit;
                    subGrandDebitTotalInc += isNaN(totalDebitInc) ? 0 : totalDebitInc;
                };

            });
            templateObject.totalCredit.set(utilityService.modifynegativeCurrencyFormat(subGrandCreditTotal));
            templateObject.totalDebit.set(utilityService.modifynegativeCurrencyFormat(subGrandDebitTotal));

            templateObject.totalCreditInc.set(utilityService.modifynegativeCurrencyFormat(subGrandCreditTotalInc));
            templateObject.totalDebitInc.set(utilityService.modifynegativeCurrencyFormat(subGrandDebitTotalInc));

            $('#accountListModal').modal('toggle');

        }
        $('#tblAccount_filter .form-control-sm').val('');
        setTimeout(function() {
            $('.btnRefreshAccount').trigger('click');
            $('.fullScreenSpin').css('display', 'none');
        }, 1000);
    });


    $(document).on("click", "#tblTaxRate tbody tr", function(e) {
        let selectLineID = $('#selectLineID').val();
        let taxcodeList = templateObject.taxraterecords.get();
        var table = $(this);
        let utilityService = new UtilityService();
        let $tblrows = $("#tblJournalEntryLine tbody tr");

        if (selectLineID) {
            let lineTaxCode = table.find(".taxName").text();
            let lineTaxRate = table.find(".taxRate").text();

            let subGrandTotal = 0;
            let taxGrandTotal = 0;

            $('#' + selectLineID + " .lineTaxRate").text(lineTaxRate || 0);
            $('#' + selectLineID + " .lineTaxCode").val(lineTaxCode);

            let lineAmount = 0;
            let subGrandCreditTotal = 0;
            let subGrandDebitTotal = 0;

            let subGrandCreditTotalInc = 0;
            let subGrandDebitTotalInc = 0;
            $tblrows.each(function(index) {
                var $tblrow = $(this);
                var taxcode = $tblrow.find(".lineTaxCode").val() || 0;
                var taxrateamount = 0;
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename == taxcode) {
                            taxrateamount = taxcodeList[i].coderate;
                        }
                    }
                }



                var credit = $tblrow.find(".lineCreditInc").val() || Currency + '0';
                var debit = $tblrow.find(".lineDebitInc").val() || Currency + '0';

                let taxRateAmountCalc = (parseFloat(taxrateamount) + 100) / 100;

                var subTotalCredit = (parseFloat(credit.replace(/[^0-9.-]+/g, "")) / (taxRateAmountCalc)) || Currency + '0';
                var subTotalDebit = (parseFloat(debit.replace(/[^0-9.-]+/g, "")) / (taxRateAmountCalc)) || Currency + '0';

                var taxTotalCredit = parseFloat(credit.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotalCredit) || 0;
                var taxTotalDebit = parseFloat(debit.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotalDebit) || 0;
                $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalCredit));

                if (!isNaN(subTotalCredit)) {
                    $tblrow.find('.lineCreditExChange').val(utilityService.modifynegativeCurrencyFormat(subTotalCredit.toFixed(2)));
                    let totalCreditInc = (parseFloat(subTotalCredit)) + (parseFloat(taxTotalCredit)) || 0;
                    $tblrow.find('.lineCreditIncChange').val(utilityService.modifynegativeCurrencyFormat(totalCreditInc.toFixed(2)));
                    subGrandCreditTotal += isNaN(subTotalCredit) ? 0 : subTotalCredit;
                    subGrandCreditTotalInc += isNaN(totalCreditInc) ? 0 : totalCreditInc;
                };
                if (!isNaN(subTotalDebit)) {
                    $tblrow.find('.lineDebitExChange').val(utilityService.modifynegativeCurrencyFormat(subTotalDebit.toFixed(2)));
                    let totalDebitInc = (parseFloat(subTotalDebit)) + (parseFloat(taxTotalDebit)) || 0;
                    $tblrow.find('.lineDebitIncChange').val(utilityService.modifynegativeCurrencyFormat(totalDebitInc.toFixed(2)));
                    subGrandDebitTotal += isNaN(subTotalDebit) ? 0 : subTotalDebit;
                    subGrandDebitTotalInc += isNaN(totalDebitInc) ? 0 : totalDebitInc;
                };

            });
            templateObject.totalCredit.set(utilityService.modifynegativeCurrencyFormat(subGrandCreditTotal));
            templateObject.totalDebit.set(utilityService.modifynegativeCurrencyFormat(subGrandDebitTotal));

            templateObject.totalCreditInc.set(utilityService.modifynegativeCurrencyFormat(subGrandCreditTotalInc));
            templateObject.totalDebitInc.set(utilityService.modifynegativeCurrencyFormat(subGrandDebitTotalInc));
            $('#taxRateListModal').modal('toggle');

        }
    });

    $(document).on("click", ".templateItem .btnPreviewTemplate", function(e) {
        title = $(this).parent().attr("data-id");
        number =  $(this).parent().attr("data-template-id");//e.getAttribute("data-template-id");
        templateObject.generateInvoiceData(title,number);
    });

    function showJournalEntry1(template_title, number, bprint)
    {
        var array_data = [];
        let lineItems = [];
        let taxItems = {};
        object_invoce = [];
        let item_invoices = '';

        let invoice_data =  templateObject.record.get();
        let stripe_id = '';
        let stripe_fee_method = '';
        var erpGet = erpDb();

        var customfield1 = '  ';
        var customfield2 = '  ';
        var customfield3 = '  ';

        var customfieldlabel1 = 'Custom Field 1';
        var customfieldlabel2 = 'Custom Field 2';
        var customfieldlabel3 = 'Custom Field 3';
        
        let department = $('#sltDepartment').val();
        let headMemo = $('#txaMemo').val();
        let dtSODate = $("#dtTransDate").val();
        let entryNo = $('#edtEnrtyNo').val();
    
        $('#tblJournalEntryLine > tbody > tr').each(function() {
            var lineID = this.id;
            let tdaccount = $('#' + lineID + " .lineAccountName").val();
            let tdaccountNo = $('#' + lineID + " .lineAccountNo").text();
            let tddmemo = $('#' + lineID + " .lineMemo").text();
            let tdcreditex = $('#' + lineID + " .lineCreditInc").val();
            let tddebitex = $('#' + lineID + " .lineDebitInc").val();
            let erpLineID = $('#' + lineID + " .lineAccountName").attr('lineid');
            let tdtaxCode = $('#' + lineID + " .lineTaxCode").val() || loggedTaxCodePurchaseInc;

            array_data.push([
                tdaccount,
                tddmemo,
                tdcreditex,
                tddebitex
            ]);
        });

        let subtotal_total = "$0.00";
        let subtotal_tax = "$0.00";
        let grandTotal = "$0.00";
        let total_paid = "$0.00";
        let balancedue = "$0.00";
        let customer = '';
        let name = '';
        let surname = '';
        let dept = '';
        let tax = '';
        let company = Session.get('vs1companyName');
        let vs1User = localStorage.getItem('mySession');
        let customerEmail = '';
        let id = $('.printID').attr("id") || "new";
        let currencyname = (CountryAbbr).toLowerCase();
        stringQuery = "?";
        for (let l = 0; l < lineItems.length; l++) {
            stringQuery = stringQuery + "product" + l + "=" + lineItems[l].description + "&price" + l + "=" + lineItems[l].unitPrice + "&qty" + l + "=" + lineItems[l].quantity + "&";
        }
        stringQuery = stringQuery + "tax=" + tax + "&total=" + grandTotal + "&customer=" + customer + "&name=" + name + "&surname=" + surname + "&quoteid=" + invoice_data.id + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + customerEmail + "&type=Invoice&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + dept + "&currency=" + currencyname;
        $(".linkText").attr("href", stripeGlobalURL + stringQuery);

        if(number == 1)
        {
              item_invoices = {

                o_url: Session.get('vs1companyURL'),
                o_name: Session.get('vs1companyName'),
                o_address: Session.get('vs1companyaddress1'),
                o_city: Session.get('vs1companyCity'),
                o_state: Session.get('companyState') + ' ' + Session.get('vs1companyPOBox'),
                o_reg: Template.new_invoice.__helpers.get('companyReg').call(),
                o_abn: Template.new_invoice.__helpers.get('companyabn').call(),
                o_phone:Template.new_invoice.__helpers.get('companyphone').call(),
                title: 'Journal Entry',
                value:invoice_data.id,
                date: dtSODate,
                invoicenumber:invoice_data.id,
                refnumber: "",
                pqnumber: "",
                duedate:"",
                paylink: "",
                supplier_type: "Supplier",
                supplier_name : customer,
                supplier_addr : '',
                fields: {
                    "Account Name" : ["30", "left"],
                    "Description" : ["40", "left"],
                    "Credit (Ex)" : ["15", "right"],
                    "Debit (Ex)" : ["15", "right"]
                },
                subtotal :subtotal_total,
                gst : subtotal_tax,
                total : grandTotal,
                paid_amount : total_paid,
                bal_due : balancedue,
                bsb :Template.new_invoice.__helpers.get("vs1companyBankBSB").call(),
                account : Template.new_invoice.__helpers
                .get("vs1companyBankAccountNo")
                .call(),
                swift : Template.new_invoice.__helpers
                .get("vs1companyBankSwiftCode")
                .call(),
                data: array_data,
                customfield1:'NA',
                customfield2:'NA',
                customfield3:'NA',
                customfieldlabel1:'NA',
                customfieldlabel2:'NA',
                customfieldlabel3:'NA',
                applied : "",
                showFX:"",
                comment:""
              };

        }
        else if(number == 2)
        {
            item_invoices = {
                o_url: Session.get('vs1companyURL'),
                o_name: Session.get('vs1companyName'),
                o_address: Session.get('vs1companyaddress1'),
                o_city: Session.get('vs1companyCity'),
                o_state: Session.get('companyState') + ' ' + Session.get('vs1companyPOBox'),
                o_reg: Template.new_invoice.__helpers.get('companyReg').call(),
                o_abn: Template.new_invoice.__helpers.get('companyabn').call(),
                o_phone:Template.new_invoice.__helpers.get('companyphone').call(),
                title: 'Journal Entry',
                value:invoice_data.id,
                date: dtSODate,
                invoicenumber:invoice_data.id,
                refnumber: "",
                pqnumber: "",
                duedate:"",
                paylink: "",
                supplier_type: "Supplier",
                supplier_name : customer,
                supplier_addr : '',
                fields: {
                    "Account Name" : ["30", "left"],
                    "Description" : ["40", "left"],
                    "Credit (Ex)" : ["15", "right"],
                    "Debit (Ex)" : ["15", "right"]
                },
                subtotal :subtotal_total,
                gst : subtotal_tax,
                total : grandTotal,
                paid_amount : total_paid,
                bal_due : balancedue,
                bsb :Template.new_invoice.__helpers.get("vs1companyBankBSB").call(),
                account : Template.new_invoice.__helpers
                .get("vs1companyBankAccountNo")
                .call(),
                swift : Template.new_invoice.__helpers
                .get("vs1companyBankSwiftCode")
                .call(),
                data: array_data,
                customfield1:customfield1,
                customfield2:customfield2,
                customfield3:customfield3,
                customfieldlabel1:customfieldlabel1,
                customfieldlabel2:customfieldlabel2,
                customfieldlabel3:customfieldlabel3,
                applied : "",
                showFX:"",
                comment:""
              };

        }
        else
        {
            item_invoices = {
                o_url: Session.get('vs1companyURL'),
                o_name: Session.get('vs1companyName'),
                o_address: Session.get('vs1companyaddress1'),
                o_city: Session.get('vs1companyCity'),
                o_state: Session.get('companyState') + ' ' + Session.get('vs1companyPOBox'),
                o_reg: Template.new_invoice.__helpers.get('companyReg').call(),
                o_abn: Template.new_invoice.__helpers.get('companyabn').call(),
                o_phone:Template.new_invoice.__helpers.get('companyphone').call(),
                title: 'Journal Entry',
                value:invoice_data.id,
                date: dtSODate,
                invoicenumber:invoice_data.id,
                refnumber: "",
                pqnumber: "",
                duedate:"",
                paylink: "",
                supplier_type: "Supplier",
                supplier_name : customer,
                supplier_addr : '',
                fields: {
                    "Account Name" : ["30", "left"],
                    "Description" : ["40", "left"],
                    "Credit (Ex)" : ["15", "right"],
                    "Debit (Ex)" : ["15", "right"]
                },
                subtotal :subtotal_total,
                gst : subtotal_tax,
                total : grandTotal,
                paid_amount : total_paid,
                bal_due : balancedue,
                bsb :Template.new_invoice.__helpers.get("vs1companyBankBSB").call(),
                account : Template.new_invoice.__helpers
                .get("vs1companyBankAccountNo")
                .call(),
                swift : Template.new_invoice.__helpers
                .get("vs1companyBankSwiftCode")
                .call(),
                data: array_data,
                customfield1:customfield1,
                customfield2:customfield2,
                customfield3:customfield3,
                customfieldlabel1:customfieldlabel1,
                customfieldlabel2:customfieldlabel2,
                customfieldlabel3:customfieldlabel3,
                applied : "",
                showFX:"",
                comment:""
              };

        }

        item_invoices.taxItems = taxItems;

        object_invoce.push(item_invoices);

        $("#templatePreviewModal .field_payment").show();
        $("#templatePreviewModal .field_amount").show();

        if (bprint == false) {
            $("#html-2-pdfwrapper_quotes").css("width", "90%");
            $("#html-2-pdfwrapper_quotes2").css("width", "90%");
            $("#html-2-pdfwrapper_quotes3").css("width", "90%");
        } else {
            $("#html-2-pdfwrapper_quotes").css("width", "210mm");
            $("#html-2-pdfwrapper_quotes2").css("width", "210mm");
            $("#html-2-pdfwrapper_quotes3").css("width", "210mm");
        }

        if (number == 1) {
            updateTemplate1(object_invoce, bprint);
          } else if (number == 2) {
            updateTemplate2(object_invoce, bprint);
          } else {
            updateTemplate3(object_invoce, bprint);
          }

        saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);
    }

    function loadTemplateBody1(object_invoce) {
        // table content
        var tbl_content = $("#templatePreviewModal .tbl_content");
        tbl_content.empty();
        const data = object_invoce[0]["data"];
        let idx = 0;
        for(item of data){
            idx = 0;
            var html = '';
            html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
            for(item_temp of item){
                if (idx > 1)
                    html = html + "<td style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                else
                    html = html + "<td style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                idx++;
            }

            html +="</tr>";
            tbl_content.append(html);
        }
        // total amount
        if (noHasTotals.includes(object_invoce[0]["title"])) {
            $("#templatePreviewModal .field_amount").hide();
            $("#templatePreviewModal .field_payment").css("borderRight", "0px solid black");
        } else {
            $("#templatePreviewModal .field_amount").show();
            $("#templatePreviewModal .field_payment").css("borderRight", "1px solid black");
        }

        $('#templatePreviewModal #subtotal_total').text("Sub total");
        $("#templatePreviewModal #subtotal_totalPrint").text(object_invoce[0]["subtotal"]);

        $('#templatePreviewModal #grandTotal').text("Grand total");
        $("#templatePreviewModal #totalTax_totalPrint").text(object_invoce[0]["gst"]);

        $("#templatePreviewModal #grandTotalPrint").text(object_invoce[0]["total"]);

        $("#templatePreviewModal #totalBalanceDuePrint").text(object_invoce[0]["bal_due"]);

        $("#templatePreviewModal #paid_amount").text(object_invoce[0]["paid_amount"]);
    }

    function loadTemplateBody2(object_invoce) {
        // table content
        var tbl_content = $("#templatePreviewModal .tbl_content");
        tbl_content.empty();
        const data = object_invoce[0]["data"];
        let idx = 0;
        for(item of data){
            idx = 0;
            var html = '';
            html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
            for(item_temp of item){
                if (idx > 1)
                    html = html + "<td style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                else
                    html = html + "<td style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                idx++;
            }

            html +="</tr>";
            tbl_content.append(html);
        }

        // total amount
        if (noHasTotals.includes(object_invoce[0]["title"])) {
            $(".subtotal2").hide();
        } else {
            $(".subtotal2").show();
        }

        $("#templatePreviewModal #subtotal_totalPrint2").text(
            object_invoce[0]["subtotal"]
        );
        $("#templatePreviewModal #grandTotalPrint2").text(
            object_invoce[0]["total"]
        );
        $("#templatePreviewModal #totalBalanceDuePrint2").text(
            object_invoce[0]["bal_due"]
        );
        $("#templatePreviewModal #paid_amount2").text(
            object_invoce[0]["paid_amount"]
        );
    }

    function loadTemplateBody3(object_invoce) {
        // table content
        var tbl_content = $("#templatePreviewModal .tbl_content");
        tbl_content.empty();
        const data = object_invoce[0]["data"];
        let idx = 0;
        for(item of data){
            idx = 0;
            var html = '';
            html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
            for(item_temp of item){
                if (idx > 1)
                    html = html + "<td style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                else
                    html = html + "<td style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                idx++;
            }

            html +="</tr>";
            tbl_content.append(html);
        }

        // total amount
        if (noHasTotals.includes(object_invoce[0]["title"])) {
            $(".subtotal3").hide();
        } else {
            $(".subtotal3").show();
        }
        
        $("#templatePreviewModal #subtotal_totalPrint3").text(
            object_invoce[0]["subtotal"]
        );
        $("#templatePreviewModal #totalTax_totalPrint3").text(
            object_invoce[0]["gst"]
        );
        $("#templatePreviewModal #totalBalanceDuePrint3").text(
            object_invoce[0]["bal_due"]
        );
    }

    function updateTemplate1(object_invoce, bprint) {
        initTemplateHeaderFooter1();
        $("#html-2-pdfwrapper_quotes").show();
        $("#html-2-pdfwrapper_quotes2").hide();
        $("#html-2-pdfwrapper_quotes3").hide();
        if (bprint == false)
            $("#templatePreviewModal").modal("toggle");
        loadTemplateHeaderFooter1(object_invoce);
        loadTemplateBody1(object_invoce);
    }

    function updateTemplate2(object_invoce, bprint) {
        initTemplateHeaderFooter2();
        $("#html-2-pdfwrapper_quotes").hide();
        $("#html-2-pdfwrapper_quotes2").show();
        $("#html-2-pdfwrapper_quotes3").hide();
        if (bprint == false)
            $("#templatePreviewModal").modal("toggle");
        loadTemplateHeaderFooter2(object_invoce);
        loadTemplateBody2(object_invoce);
    }

    function updateTemplate3(object_invoce, bprint) {
        initTemplateHeaderFooter3();
        $("#html-2-pdfwrapper_quotes").hide();
        $("#html-2-pdfwrapper_quotes2").hide();
        $("#html-2-pdfwrapper_quotes3").show();
        if (bprint == false)
            $("#templatePreviewModal").modal("toggle");
        loadTemplateHeaderFooter3(object_invoce);
        loadTemplateBody3(object_invoce);
    }

    templateObject.generateInvoiceData = function (template_title,number) {
        object_invoce = [];
        switch (template_title) {

        case "JournalEntry":
            showJournalEntry1(template_title, number, false);
            break;
        }
    };

    exportSalesToPdf1 = async function(template_title,number) {
        if(template_title == 'JournalEntry')
        {
            await showJournalEntry1(template_title, number, true);
        }

        let margins = {
            top: 0,
            bottom: 0,
            left: 0,
            width: 100
        };

        let invoice_data_info = templateObject.record.get();
        // document.getElementById('html-2-pdfwrapper_new').style.display="block";
        // var source = document.getElementById('html-2-pdfwrapper_new');
        var source;
        if (number == 1) {
            $("#html-2-pdfwrapper_quotes").show();
            $("#html-2-pdfwrapper_quotes2").hide();
            $("#html-2-pdfwrapper_quotes3").hide();
            source = document.getElementById("html-2-pdfwrapper_quotes");
        } else if (number == 2) {
            $("#html-2-pdfwrapper_quotes").hide();
            $("#html-2-pdfwrapper_quotes2").show();
            $("#html-2-pdfwrapper_quotes3").hide();
            source = document.getElementById("html-2-pdfwrapper_quotes2");
        } else {
            $("#html-2-pdfwrapper_quotes").hide();
            $("#html-2-pdfwrapper_quotes2").hide();
            $("#html-2-pdfwrapper_quotes3").show();
            source = document.getElementById("html-2-pdfwrapper_quotes3");
        }

        let file = "Journal Entry.pdf";
        if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
            if(template_title == 'JournalEntry')
            {
                file = 'Journal Entry-' + invoice_data_info.id + '.pdf';
            }
        }
        var opt = {
            margin: 0,
            filename: file,
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

        html2pdf().set(opt).from(source).save().then(function (dataObject) {
            if ($('.printID').attr('id') == undefined || $('.printID').attr('id') == "") {
                // $(".btnSave").trigger("click");
            } else {
                
            }
            $('#html-2-pdfwrapper').css('display', 'none');
            $("#html-2-pdfwrapper_quotes").hide();
            $("#html-2-pdfwrapper_quotes2").hide();
            $("#html-2-pdfwrapper_quotes3").hide();
            $('.fullScreenSpin').css("display", "none");
        });
        return true;

    };

    function saveTemplateFields(key, value){
        localStorage.setItem(key, value)
    }

    exportSalesToPdf = function() {
        let margins = {
            top: 0,
            bottom: 0,
            left: 0,
            width: 100
        };
        let file = "Journal.pdf";
        let id = $('#edtEnrtyNo').val();
        if (id != "") {
            file = "Journal-" + id + ".pdf"
        }
        var source = document.getElementById('html-2-pdfwrapper');
        var opt = {
            margin: 0,
            filename: file,
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
        html2pdf().set(opt).from(source).save().then(function(dataObject) {
            $('#html-2-pdfwrapper').css('display', 'none');
            $('.fullScreenSpin').css('display', 'none');
        });

        // pdf.addHTML(source, function () {
        //     pdf.save('journal.pdf');
        //     $('#html-2-pdfwrapper').css('display', 'none');
        // });
    };

});


Template.journalentrycard.onRendered(function() {
    let tempObj = Template.instance();
    let utilityService = new UtilityService();
    let productService = new ProductService();
    let accountService = new AccountService();
    let purchaseService = new PurchaseBoardService();
    let tableProductList;
    var splashArrayProductList = new Array();
    var splashArrayTaxRateList = new Array();
    const taxCodesList = [];
    tempObj.getAllProducts = function() {
        getVS1Data('TAccountVS1').then(function(dataObject) {
            if (dataObject.length == 0) {
                accountService.getAccountListVS1().then(function(data) {

                    let records = [];
                    let inventoryData = [];
                    for (let i = 0; i < data.taccountvs1.length; i++) {
                        var dataList = [
                            data.taccountvs1[i].AccountName || '-',
                            data.taccountvs1[i].Description || '',
                            data.taccountvs1[i].AccountNumber || '',
                            data.taccountvs1[i].AccountTypeName || '',
                            utilityService.modifynegativeCurrencyFormat(Math.floor(data.taccountvs1[i].Balance * 100) / 100),
                            data.taccountvs1[i].TaxCode || ''
                        ];

                        splashArrayProductList.push(dataList);
                    }
                    localStorage.setItem('VS1PurchaseAccountList', JSON.stringify(splashArrayProductList));

                    if (splashArrayProductList) {

                        $('#tblAccount').dataTable({
                            data: splashArrayProductList.sort(),

                            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            paging: true,
                            "aaSorting": [],
                            "orderMulti": true,
                            columnDefs: [

                                {
                                    className: "productName",
                                    "targets": [0]
                                },
                                {
                                    className: "productDesc",
                                    "targets": [1]
                                },
                                {
                                    className: "accountnumber",
                                    "targets": [2]
                                },
                                {
                                    className: "salePrice",
                                    "targets": [3]
                                },
                                {
                                    className: "prdqty text-right",
                                    "targets": [4]
                                },
                                {
                                    className: "taxrate",
                                    "targets": [5]
                                }
                            ],
                            colReorder: true,



                            "order": [
                                [0, "asc"]
                            ],


                            pageLength: initialDatatableLoad,
                            lengthMenu: [
                                [initialDatatableLoad, -1],
                                [initialDatatableLoad, "All"]
                            ],
                            info: true,
                            responsive: true

                        });

                        $('div.dataTables_filter input').addClass('form-control form-control-sm');






                    }
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.taccountvs1;

                let records = [];
                let inventoryData = [];
                for (let i = 0; i < useData.length; i++) {
                    if (!isNaN(useData[i].fields.Balance)) {
                        accBalance = utilityService.modifynegativeCurrencyFormat(useData[i].fields.Balance) || 0.00;
                    } else {
                        accBalance = Currency + "0.00";
                    }
                    var dataList = [
                        useData[i].fields.AccountName || '-',
                        useData[i].fields.Description || '',
                        useData[i].fields.AccountNumber || '',
                        useData[i].fields.AccountTypeName || '',
                        accBalance,
                        useData[i].fields.TaxCode || ''
                    ];

                    splashArrayProductList.push(dataList);
                }
                localStorage.setItem('VS1PurchaseAccountList', JSON.stringify(splashArrayProductList));

                if (splashArrayProductList) {

                    $('#tblAccount').dataTable({
                        data: splashArrayProductList.sort(),

                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        paging: true,
                        "aaSorting": [],
                        "orderMulti": true,
                        columnDefs: [

                            {
                                className: "productName",
                                "targets": [0]
                            },
                            {
                                className: "productDesc",
                                "targets": [1]
                            },
                            {
                                className: "accountnumber",
                                "targets": [2]
                            },
                            {
                                className: "salePrice",
                                "targets": [3]
                            },
                            {
                                className: "prdqty text-right",
                                "targets": [4]
                            },
                            {
                                className: "taxrate",
                                "targets": [5]
                            }
                        ],
                        colReorder: true,



                        "order": [
                            [0, "asc"]
                        ],


                        pageLength: initialDatatableLoad,
                        lengthMenu: [
                            [initialDatatableLoad, -1],
                            [initialDatatableLoad, "All"]
                        ],
                        info: true,
                        responsive: true

                    });

                    $('div.dataTables_filter input').addClass('form-control form-control-sm');






                }
            }
        }).catch(function(err) {
            accountService.getAccountListVS1().then(function(data) {

                let records = [];
                let inventoryData = [];
                for (let i = 0; i < data.taccountvs1.length; i++) {
                    var dataList = [
                        data.taccountvs1[i].AccountName || '-',
                        data.taccountvs1[i].Description || '',
                        data.taccountvs1[i].AccountNumber || '',
                        data.taccountvs1[i].AccountTypeName || '',
                        utilityService.modifynegativeCurrencyFormat(Math.floor(data.taccountvs1[i].Balance * 100) / 100),
                        data.taccountvs1[i].TaxCode || ''
                    ];

                    splashArrayProductList.push(dataList);
                }
                localStorage.setItem('VS1PurchaseAccountList', JSON.stringify(splashArrayProductList));

                if (splashArrayProductList) {

                    $('#tblAccount').dataTable({
                        data: splashArrayProductList.sort(),

                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        paging: true,
                        "aaSorting": [],
                        "orderMulti": true,
                        columnDefs: [

                            {
                                className: "productName",
                                "targets": [0]
                            },
                            {
                                className: "productDesc",
                                "targets": [1]
                            },
                            {
                                className: "accountnumber",
                                "targets": [2]
                            },
                            {
                                className: "salePrice",
                                "targets": [3]
                            },
                            {
                                className: "prdqty text-right",
                                "targets": [4]
                            },
                            {
                                className: "taxrate",
                                "targets": [5]
                            }
                        ],
                        colReorder: true,



                        "order": [
                            [0, "asc"]
                        ],


                        pageLength: initialDatatableLoad,
                        lengthMenu: [
                            [initialDatatableLoad, -1],
                            [initialDatatableLoad, "All"]
                        ],
                        info: true,
                        responsive: true

                    });

                    $('div.dataTables_filter input').addClass('form-control form-control-sm');






                }
            });
        });

    };

    setTimeout(function() {
        //tempObj.getAllProducts();
    }, 500);

    tempObj.getAllTaxCodes = function() {
        getVS1Data('TTaxcodeVS1').then(function(dataObject) {
            if (dataObject.length == 0) {
                purchaseService.getTaxCodesVS1().then(function(data) {

                    let records = [];
                    let inventoryData = [];
                    for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                        let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                        var dataList = [
                            data.ttaxcodevs1[i].Id || '',
                            data.ttaxcodevs1[i].CodeName || '',
                            data.ttaxcodevs1[i].Description || '-',
                            taxRate || 0,
                        ];

                        let taxcoderecordObj = {
                            codename: data.ttaxcodevs1[i].CodeName || ' ',
                            coderate: taxRate || ' ',
                        };

                        taxCodesList.push(taxcoderecordObj);

                        splashArrayTaxRateList.push(dataList);
                    }
                    tempObj.taxraterecords.set(taxCodesList);

                    if (splashArrayTaxRateList) {

                        $('#tblTaxRate').DataTable({
                            data: splashArrayTaxRateList,
                            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            paging: true,
                            "aaSorting": [],
                            "orderMulti": true,
                            columnDefs: [{
                                    orderable: false,
                                    targets: 0
                                },
                                {
                                    className: "taxName",
                                    "targets": [1]
                                },
                                {
                                    className: "taxDesc",
                                    "targets": [2]
                                },
                                {
                                    className: "taxRate text-right",
                                    "targets": [3]
                                }
                            ],
                            select: true,
                            destroy: true,
                            colReorder: true,

                            bStateSave: true,

                            pageLength: initialDatatableLoad,
                            lengthMenu: [
                                [initialDatatableLoad, -1],
                                [initialDatatableLoad, "All"]
                            ],
                            info: true,
                            responsive: true,
                            language: { search: "",searchPlaceholder: "Search List..." },
                            "fnInitComplete": function() {
                              $("<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblTaxRate_filter");
                              $("<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblTaxRate_filter");
                            }

                        });

                    }
                })
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.ttaxcodevs1;
                let records = [];
                let inventoryData = [];
                for (let i = 0; i < useData.length; i++) {
                    let taxRate = (useData[i].Rate * 100).toFixed(2);
                    var dataList = [
                        useData[i].Id || '',
                        useData[i].CodeName || '',
                        useData[i].Description || '-',
                        taxRate || 0,
                    ];

                    let taxcoderecordObj = {
                        codename: useData[i].CodeName || ' ',
                        coderate: taxRate || ' ',
                    };

                    taxCodesList.push(taxcoderecordObj);

                    splashArrayTaxRateList.push(dataList);
                }
                tempObj.taxraterecords.set(taxCodesList);


                if (splashArrayTaxRateList) {

                    $('#tblTaxRate').DataTable({
                        data: splashArrayTaxRateList,
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        paging: true,
                        "aaSorting": [],
                        "orderMulti": true,
                        columnDefs: [{
                                orderable: false,
                                targets: 0
                            },
                            {
                                className: "taxName",
                                "targets": [1]
                            },
                            {
                                className: "taxDesc",
                                "targets": [2]
                            },
                            {
                                className: "taxRate text-right",
                                "targets": [3]
                            }
                        ],
                        select: true,
                        destroy: true,
                        colReorder: true,



                        bStateSave: true,


                        pageLength: initialDatatableLoad,
                        lengthMenu: [
                            [initialDatatableLoad, -1],
                            [initialDatatableLoad, "All"]
                        ],
                        info: true,
                        responsive: true,
                        language: { search: "",searchPlaceholder: "Search List..." },
                        "fnInitComplete": function() {
                          $("<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblTaxRate_filter");
                          $("<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblTaxRate_filter");
                        }

                    });






                }

            }
        }).catch(function(err) {
            purchaseService.getTaxCodesVS1().then(function(data) {

                let records = [];
                let inventoryData = [];
                for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                    let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                    var dataList = [
                        data.ttaxcodevs1[i].Id || '',
                        data.ttaxcodevs1[i].CodeName || '',
                        data.ttaxcodevs1[i].Description || '-',
                        taxRate || 0,
                    ];

                    let taxcoderecordObj = {
                        codename: data.ttaxcodevs1[i].CodeName || ' ',
                        coderate: taxRate || ' ',
                    };

                    taxCodesList.push(taxcoderecordObj);

                    splashArrayTaxRateList.push(dataList);
                }
                tempObj.taxraterecords.set(taxCodesList);


                if (splashArrayTaxRateList) {

                    $('#tblTaxRate').DataTable({
                        data: splashArrayTaxRateList,
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        paging: true,
                        "aaSorting": [],
                        "orderMulti": true,
                        columnDefs: [{
                                orderable: false,
                                targets: 0
                            },
                            {
                                className: "taxName",
                                "targets": [1]
                            },
                            {
                                className: "taxDesc",
                                "targets": [2]
                            },
                            {
                                className: "taxRate text-right",
                                "targets": [3]
                            }
                        ],
                        select: true,
                        destroy: true,
                        colReorder: true,



                        bStateSave: true,


                        pageLength: initialDatatableLoad,
                        lengthMenu: [
                            [initialDatatableLoad, -1],
                            [initialDatatableLoad, "All"]
                        ],
                        info: true,
                        responsive: true,
                        language: { search: "",searchPlaceholder: "Search List..." },
                        "fnInitComplete": function() {
                          $("<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblTaxRate_filter");
                          $("<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblTaxRate_filter");
                        }

                    });






                }
            })
        });
    };
    tempObj.getAllTaxCodes();

    $('#sltDepartment').editableSelect();

    $('#sltDepartment').editableSelect()
        .on('click.editable-select', function(e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            var deptDataName = e.target.value || '';
            $('#edtDepartmentID').val('');
            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#departmentModal').modal('toggle');
            } else {
                if (deptDataName.replace(/\s/g, '') != '') {
                    $('#newDeptHeader').text('Edit Department');

                    getVS1Data('TDeptClass').then(function(dataObject) {
                        if (dataObject.length == 0) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            sideBarService.getDepartment().then(function(data) {
                                for (let i = 0; i < data.tdeptclass.length; i++) {
                                    if (data.tdeptclass[i].DeptClassName === deptDataName) {
                                        $('#edtDepartmentID').val(data.tdeptclass[i].Id);
                                        $('#edtNewDeptName').val(data.tdeptclass[i].DeptClassName);
                                        $('#edtSiteCode').val(data.tdeptclass[i].SiteCode);
                                        $('#edtDeptDesc').val(data.tdeptclass[i].Description);
                                    }
                                }
                                setTimeout(function() {
                                    $('.fullScreenSpin').css('display', 'none');
                                    $('#newDepartmentModal').modal('toggle');
                                }, 200);
                            });
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.tdeptclass;
                            for (let i = 0; i < data.tdeptclass.length; i++) {
                                if (data.tdeptclass[i].DeptClassName === deptDataName) {
                                    $('#edtDepartmentID').val(data.tdeptclass[i].Id);
                                    $('#edtNewDeptName').val(data.tdeptclass[i].DeptClassName);
                                    $('#edtSiteCode').val(data.tdeptclass[i].SiteCode);
                                    $('#edtDeptDesc').val(data.tdeptclass[i].Description);
                                }
                            }
                            setTimeout(function() {
                                $('.fullScreenSpin').css('display', 'none');
                                $('#newDepartmentModal').modal('toggle');
                            }, 200);
                        }
                    }).catch(function(err) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        sideBarService.getDepartment().then(function(data) {
                            for (let i = 0; i < data.tdeptclass.length; i++) {
                                if (data.tdeptclass[i].DeptClassName === deptDataName) {
                                    $('#edtDepartmentID').val(data.tdeptclass[i].Id);
                                    $('#edtNewDeptName').val(data.tdeptclass[i].DeptClassName);
                                    $('#edtSiteCode').val(data.tdeptclass[i].SiteCode);
                                    $('#edtDeptDesc').val(data.tdeptclass[i].Description);
                                }
                            }
                            setTimeout(function() {
                                $('.fullScreenSpin').css('display', 'none');
                                $('#newDepartmentModal').modal('toggle');
                            }, 200);
                        });
                    });
                } else {
                    $('#departmentModal').modal();
                    setTimeout(function() {
                        $('#departmentList_filter .form-control-sm').focus();
                        $('#departmentList_filter .form-control-sm').val('');
                        $('#departmentList_filter .form-control-sm').trigger("input");
                        var datatable = $('#departmentList').DataTable();
                        datatable.draw();
                        $('#departmentList_filter .form-control-sm').trigger("input");
                    }, 500);
                }
            }
        });

    $(document).on("click", "#departmentList tbody tr", function(e) {
        $('#sltDepartment').val($(this).find(".colDeptName").text());
        $('#departmentModal').modal('toggle');
    });

});
Template.journalentrycard.helpers({
    getTemplateList: function () {
        return template_list;
    },
    getTemplateNumber: function () {
        let template_numbers = ["1", "2", "3"];
        return template_numbers;
    },
    record: () => {
        return Template.instance().record.get();
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
    termrecords: () => {
        return Template.instance().termrecords.get().sort(function(a, b) {
            if (a.termsname == 'NA') {
                return 1;
            } else if (b.termsname == 'NA') {
                return -1;
            }
            return (a.termsname.toUpperCase() > b.termsname.toUpperCase()) ? 1 : -1;
        });
    },
    purchaseCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get('mycloudLogonID'),
            PrefName: 'journalentrycard'
        });
    },
    purchaseCloudGridPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get('mycloudLogonID'),
            PrefName: 'tblJournalEntryLine'
        });
    },
    uploadedFiles: () => {
        return Template.instance().uploadedFiles.get();
    },
    attachmentCount: () => {
        return Template.instance().attachmentCount.get();
    },
    uploadedFile: () => {
        return Template.instance().uploadedFile.get();
    },
    statusrecords: () => {
        return Template.instance().statusrecords.get().sort(function(a, b) {
            if (a.orderstatus == 'NA') {
                return 1;
            } else if (b.orderstatus == 'NA') {
                return -1;
            }
            return (a.orderstatus.toUpperCase() > b.orderstatus.toUpperCase()) ? 1 : -1;
        });
    },
    totalCredit: () => {
        return Template.instance().totalCredit.get();
    },
    totalDebit: () => {
        return Template.instance().totalDebit.get();
    },
    totalCreditInc: () => {
        return Template.instance().totalCreditInc.get();
    },
    totalDebitInc: () => {
        return Template.instance().totalDebitInc.get();
    },
    companyaddress1: () => {
        return Session.get('vs1companyaddress1');
    },
    companyaddress2: () => {
        return Session.get('vs1companyaddress2');
    },
    city: () => {
        return Session.get('vs1companyCity');
    },
    state: () => {
        return Session.get('companyState');
    },
     poBox: () => {
        return Session.get('vs1companyPOBox');
    },
    companyphone: () => {
        return Session.get('vs1companyPhone');
    },
    companyabn: () => {
        return Session.get('vs1companyABN');
    },
    organizationname: () => {
        return Session.get('vs1companyName');
    },
    organizationurl: () => {
        return Session.get('vs1companyURL');
    },
    isMobileDevices: () => {
        var isMobile = false;

        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            isMobile = true;
        }

        return isMobile;
    },
    isCurrencyEnable: () => {
        return Session.get('CloudUseForeignLicence');
    },


    isForeignEnabled: () => {
        return Template.instance().isForeignEnabled.get();
    },
    getDefaultCurrency: () => {
        return defaultCurrencyCode;
    },
    convertToForeignAmount: (amount) => {
        return convertToForeignAmount(amount, $('#exchange_rate').val(), getCurrentCurrencySymbol());
    },

    displayFieldColspan: (displayfield) => {
        if(Template.instance().isForeignEnabled.get() == true) {
            return 2
        }
        return 1;


        if(["Amount (Ex)", "Amount (Inc)", "Tax Amt"].includes(displayfield.custfieldlabel))
        {
            if(Template.instance().isForeignEnabled.get() == true) {
                return 2
            }
            return 1;
        }
        return 1;
    },

    subHeaderForeign: (displayfield) => {

        if(["Amount (Ex)", "Amount (Inc)", "Tax Amt"].includes(displayfield.custfieldlabel)) {
            return true;
        }
        return false;
    },
});

Template.journalentrycard.events({
    // 'click input.basedOnSettings': function (event) {
    //     if (event.target.id == "basedOnEvent") {
    //         const value = $(event.target).prop('checked');
    //         if (value) {
    //             $('#onEventSettings').css('display', 'block');
    //             $('#settingsOnEvents').prop('checked', true);
    //         } else {
    //             $('#onEventSettings').css('display', 'none');
    //             $('#settingsOnEvents').prop('checked', false);
    //             $('#settingsOnLogout').prop('checked', false);
    //         }
    //     } else if (event.target.id == 'basedOnFrequency') {
    //         const value = $(event.target).prop('checked');
    //         if(value) {
    //             $('#edtFrequencyDetail').css('display', 'flex');
    //             $('#basedOnSettingsTitle').css('border-top-width', '1px');
    //         }else {
    //             $('#edtFrequencyDetail').css('display', 'none');
    //             $('#basedOnSettingsTitle').css('border-top-width', '0px');
    //         }
    //     }
    //   },
      'click input[name="frequencyRadio"]': function (event) {
        if (event.target.id == "frequencyMonthly") {
            document.getElementById("monthlySettings").style.display = "block";
            document.getElementById("weeklySettings").style.display = "none";
            document.getElementById("dailySettings").style.display = "none";
            document.getElementById("oneTimeOnlySettings").style.display = "none";
        } else if (event.target.id == "frequencyWeekly") {
            document.getElementById("weeklySettings").style.display = "block";
            document.getElementById("monthlySettings").style.display = "none";
            document.getElementById("dailySettings").style.display = "none";
            document.getElementById("oneTimeOnlySettings").style.display = "none";
        } else if (event.target.id == "frequencyDaily") {
            document.getElementById("dailySettings").style.display = "block";
            document.getElementById("monthlySettings").style.display = "none";
            document.getElementById("weeklySettings").style.display = "none";
            document.getElementById("oneTimeOnlySettings").style.display = "none";
        } else if (event.target.id == "frequencyOnetimeonly") {
            document.getElementById("oneTimeOnlySettings").style.display = "block";
            document.getElementById("monthlySettings").style.display = "none";
            document.getElementById("weeklySettings").style.display = "none";
            document.getElementById("dailySettings").style.display = "none";
        } else {
            $("#copyFrequencyModal").modal('toggle');
        }
      },
      'click input[name="settingsMonthlyRadio"]': function (event) {
        if (event.target.id == "settingsMonthlyEvery") {
            $('.settingsMonthlyEveryOccurence').attr('disabled', false);
            $('.settingsMonthlyDayOfWeek').attr('disabled', false);
            $('.settingsMonthlySpecDay').attr('disabled', true);
        } else if (event.target.id == "settingsMonthlyDay") {
            $('.settingsMonthlySpecDay').attr('disabled', false);
            $('.settingsMonthlyEveryOccurence').attr('disabled', true);
            $('.settingsMonthlyDayOfWeek').attr('disabled', true);
        } else {
            $("#frequencyModal").modal('toggle');
        }
      },
      'click input[name="dailyRadio"]': function (event) {
          if (event.target.id == "dailyEveryDay") {
              $('.dailyEveryXDays').attr('disabled', true);
          } else if (event.target.id == "dailyWeekdays") {
              $('.dailyEveryXDays').attr('disabled', true);
          } else if (event.target.id == "dailyEvery") {
              $('.dailyEveryXDays').attr('disabled', false);
          } else {
              $("#frequencyModal").modal('toggle');
          }
      },
    'click #copyJournal': async function(event) {
        playCopyAudio();
        let templateObject = Template.instance();
        let purchaseService = new PurchaseBoardService();
        let i = 0;
        setTimeout(async function(){
            $("#basedOnFrequency").prop('checked', true);
            $('#edtFrequencyDetail').css('display', 'flex');
            $(".ofMonthList input[type=checkbox]").each(function() {
                $(this).prop('checked', false);
            });
            $(".selectDays input[type=checkbox]").each(function (){
                $(this).prop('checked', false);
            });
            // var url = FlowRouter.current().path;
            // var getso_id = url.split("?id=");
            // var currentInvoice = getso_id[getso_id.length - 1];
            // if (getso_id[1]) {
            //     currentInvoice = parseInt(currentInvoice);
            //     var journalData = await purchaseService.getOneJournalEnrtyData(currentInvoice);
            //     var selectedType = journalData.fields.TypeOfBasedOn;
            //     var frequencyVal = journalData.fields.FrequenctyValues;
            //     var startDate = journalData.fields.CopyStartDate;
            //     var finishDate = journalData.fields.CopyFinishDate;
            //     var subStartDate = startDate.substring(0, 10);
            //     var subFinishDate = finishDate.substring(0, 10);
            //     var convertedStartDate = subStartDate ? subStartDate.split('-')[2] + '/' + subStartDate.split('-')[1] + '/' + subStartDate.split('-')[0] : '';
            //     var convertedFinishDate = subFinishDate ? subFinishDate.split('-')[2] + '/' + subFinishDate.split('-')[1] + '/' + subFinishDate.split('-')[0] : '';
            //     if (selectedType == "basedOnEvent") {
            //     $("#basedOnEvent").prop('checked', true);
            //     $('#onEventSettings').css('display', 'block');
            //     $('#settingsOnEvents').prop('checked', true);
            //     } else {
            //     $("#basedOnEvent").prop('checked', false);
            //     $('#onEventSettings').css('display', 'none');
            //     $('#settingsOnEvents').prop('checked', false);
            //     $('#settingsOnLogout').prop('checked', false);
            //     }
            //     if (selectedType == 'basedOnFrequency') {
            //     $("#basedOnFrequency").prop('checked', true);
            //     $('#edtFrequencyDetail').css('display', 'flex');
            //     $('#basedOnSettingsTitle').css('border-top-width', '1px');
            //     } else {
            //     $("#basedOnFrequency").prop('checked', false);
            //     $('#edtFrequencyDetail').css('display', 'none');
            //     $('#basedOnSettingsTitle').css('border-top-width', '0px');
            //     }
            //     var arrFrequencyVal = frequencyVal.split("@");
            //     var radioFrequency = arrFrequencyVal[0];
            //     $("#" + radioFrequency).prop('checked', true);
            //     if (radioFrequency == "frequencyMonthly") {
            //     document.getElementById("monthlySettings").style.display = "block";
            //     document.getElementById("weeklySettings").style.display = "none";
            //     document.getElementById("dailySettings").style.display = "none";
            //     document.getElementById("oneTimeOnlySettings").style.display = "none";
            //     var monthDate = arrFrequencyVal[1];
            //     $("#sltDay").val('day' + monthDate);
            //     var arrOfMonths = [];
            //     if (ofMonths != "" && ofMonths != undefined && ofMonths != null)
            //         arrOfMonths = ofMonths.split(",");
            //     var arrOfMonths = ofMonths.split(",");
            //     for (i=0; i<arrOfMonths.length; i++) {
            //         $("#formCheck-" + arrOfMonths[i]).prop('checked', true);
            //     }
            //     $('#edtMonthlyStartDate').val(convertedStartDate);
            //     $('#edtMonthlyFinishDate').val(convertedFinishDate);
            //     } else if (radioFrequency == "frequencyWeekly") {
            //     document.getElementById("weeklySettings").style.display = "block";
            //     document.getElementById("monthlySettings").style.display = "none";
            //     document.getElementById("dailySettings").style.display = "none";
            //     document.getElementById("oneTimeOnlySettings").style.display = "none";
            //     var everyWeeks = arrFrequencyVal[1];
            //     $("#weeklyEveryXWeeks").val(everyWeeks);
            //     var selectDays = arrFrequencyVal[2];
            //     var arrSelectDays = selectDays.split(",");
            //     for (i=0; i<arrSelectDays.length; i++) {
            //         if (parseInt(arrSelectDays[i]) == 0)
            //         $("#formCheck-sunday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 1)
            //         $("#formCheck-monday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 2)
            //         $("#formCheck-tuesday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 3)
            //         $("#formCheck-wednesday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 4)
            //         $("#formCheck-thursday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 5)
            //         $("#formCheck-friday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 6)
            //         $("#formCheck-saturday").prop('checked', true);
            //     }
            //     $('#edtWeeklyStartDate').val(convertedStartDate);
            //     $('#edtWeeklyFinishDate').val(convertedFinishDate);
            //     } else if (radioFrequency == "frequencyDaily") {
            //     document.getElementById("dailySettings").style.display = "block";
            //     document.getElementById("monthlySettings").style.display = "none";
            //     document.getElementById("weeklySettings").style.display = "none";
            //     document.getElementById("oneTimeOnlySettings").style.display = "none";
            //     var dailyRadioOption = arrFrequencyVal[1];
            //     $("#" + dailyRadioOption).prop('checked', true);
            //     var everyDays = arrFrequencyVal[2];
            //     $("#dailyEveryXDays").val(everyDays);
            //     $('#edtDailyStartDate').val(convertedStartDate);
            //     $('#edtDailyFinishDate').val(convertedFinishDate);
            //     } else if (radioFrequency == "frequencyOnetimeonly") {
            //     document.getElementById("oneTimeOnlySettings").style.display = "block";
            //     document.getElementById("monthlySettings").style.display = "none";
            //     document.getElementById("weeklySettings").style.display = "none";
            //     document.getElementById("dailySettings").style.display = "none";
            //     $('#edtOneTimeOnlyDate').val(convertedStartDate);
            //     $('#edtOneTimeOnlyTimeError').css('display', 'none');
            //     $('#edtOneTimeOnlyDateError').css('display', 'none');
            //     }
            // }
            $("#copyFrequencyModal").modal("toggle");
        }, delayTimeAfterSound);
    },
    'click .btnSaveFrequency': async function () {
        playSaveAudio();
        let templateObject = Template.instance();
        let purchaseService = new PurchaseBoardService();
        // let selectedType = '';
        let selectedType = "basedOnFrequency";
        let frequencyVal = '';
        let startDate = '';
        let finishDate = '';
        let convertedStartDate = '';
        let convertedFinishDate = '';
        let sDate = '';
        let fDate = '';
        let monthDate = '';
        let ofMonths = '';
        let isFirst = true;
        let everyWeeks = '';
        let selectDays = '';
        let dailyRadioOption = '';
        let everyDays = '';

        // const basedOnTypes = $('#basedOnSettings input.basedOnSettings');
        let basedOnTypeTexts = '';
        // let basedOnTypeAttr = '';
        let basedOnTypeAttr = 'F,';
        var erpGet = erpDb();
        let sDate2 = '';
        let fDate2 = '';        
        setTimeout(async function(){
        //   basedOnTypes.each(function () {
        //     if ($(this).prop('checked')) {
        //       selectedType = $(this).attr('id');
        //       if (selectedType === "basedOnFrequency") { basedOnTypeAttr += 'F,'}
        //       if (selectedType === "basedOnPrint") { basedOnTypeTexts += 'On Print, '; basedOnTypeAttr += 'P,'; }
        //       if (selectedType === "basedOnSave") { basedOnTypeTexts += 'On Save, '; basedOnTypeAttr += 'S,'; }
        //       if (selectedType === "basedOnTransactionDate") { basedOnTypeTexts += 'On Transaction Date, '; basedOnTypeAttr += 'T,'; }
        //       if (selectedType === "basedOnDueDate") { basedOnTypeTexts += 'On Due Date, '; basedOnTypeAttr += 'D,'; }
        //       if (selectedType === "basedOnOutstanding") { basedOnTypeTexts += 'If Outstanding, '; basedOnTypeAttr += 'O,'; }
        //       if (selectedType === "basedOnEvent") {
        //         if ($('#settingsOnEvents').prop('checked')) { basedOnTypeTexts += 'On Event(On Logon), '; basedOnTypeAttr += 'EN,'; }
        //         if ($('#settingsOnLogout').prop('checked')) { basedOnTypeTexts += 'On Event(On Logout), '; basedOnTypeAttr += 'EU,'; }
        //       }
        //     }
        //   });
        //   if (basedOnTypeTexts != '') basedOnTypeTexts = basedOnTypeTexts.slice(0, -2);
        //   if (basedOnTypeAttr != '') basedOnTypeAttr = basedOnTypeAttr.slice(0, -1);

          let formId = parseInt($("#formid").val());
          let radioFrequency = $('input[type=radio][name=frequencyRadio]:checked').attr('id');
          frequencyVal = radioFrequency + '@';
          const values = basedOnTypeAttr.split(',');
          if(values.includes('F')) {
            if (radioFrequency == "frequencyMonthly") {
              isFirst = true;
              monthDate = $("#sltDay").val().replace('day', '');
              $(".ofMonthList input[type=checkbox]:checked").each(function () {
                ofMonths += isFirst ? $(this).val() : ',' + $(this).val();
                isFirst = false;
              });
              startDate = $('#edtMonthlyStartDate').val();
              finishDate = $('#edtMonthlyFinishDate').val();
              frequencyVal += monthDate + '@' + ofMonths;
            } else if (radioFrequency == "frequencyWeekly") {
              isFirst = true;
              everyWeeks = $("#weeklyEveryXWeeks").val();
              let sDay = -1;
              $(".selectDays input[type=checkbox]:checked").each(function (){
                sDay = templateObject.getDayNumber($(this).val());
                selectDays += isFirst ? sDay : ',' + sDay;
                isFirst = false;
              });
              startDate = $('#edtWeeklyStartDate').val();
              finishDate = $('#edtWeeklyFinishDate').val();
              frequencyVal += everyWeeks + '@' + selectDays;
            } else if (radioFrequency == "frequencyDaily") {
              dailyRadioOption = $('#dailySettings input[type=radio]:checked').attr('id');
              everyDays = $("#dailyEveryXDays").val();
              startDate = $('#edtDailyStartDate').val();
              finishDate = $('#edtDailyFinishDate').val();
              frequencyVal += dailyRadioOption + '@' + everyDays;
            } else if (radioFrequency == "frequencyOnetimeonly") {
              startDate = $('#edtOneTimeOnlyDate').val();
              finishDate = $('#edtOneTimeOnlyDate').val();
              $('#edtOneTimeOnlyTimeError').css('display', 'none');
              $('#edtOneTimeOnlyDateError').css('display', 'none');
              frequencyVal = radioFrequency;
            }
          }
          $('#copyFrequencyModal').modal('toggle');
          convertedStartDate = startDate ? startDate.split('/')[2] + '-' + startDate.split('/')[1] + '-' + startDate.split('/')[0] : '';
          convertedFinishDate = finishDate ? finishDate.split('/')[2] + '-' + finishDate.split('/')[1] + '-' + finishDate.split('/')[0] : '';
          sDate = convertedStartDate ? moment(convertedStartDate + ' ' + copyStartTime).format("YYYY-MM-DD HH:mm") : moment().format("YYYY-MM-DD HH:mm");
          fDate = convertedFinishDate ? moment(convertedFinishDate + ' ' + copyStartTime).format("YYYY-MM-DD HH:mm") : moment().format("YYYY-MM-DD HH:mm");
          sDate2 = convertedStartDate ? moment(convertedStartDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
          fDate2 = convertedFinishDate ? moment(convertedFinishDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");    
          $(".fullScreenSpin").css("display", "inline-block");
          var url = FlowRouter.current().path;
          if (
            url.indexOf("?id=") > 0
          ) {
            var getso_id = url.split("?id=");
            var currentInvoice = getso_id[getso_id.length - 1];
            if (getso_id[1]) {
              currentInvoice = parseInt(currentInvoice);
            //   objDetails = {
            //     type: "TJournalEntry",
            //     fields: {
            //       ID: currentInvoice,
            //       TypeOfBasedOn: selectedType,
            //       FrequenctyValues: frequencyVal,
            //       CopyStartDate: sDate2,
            //       CopyFinishDate: fDate2,
            //     }
            //   };
            //   var result = await purchaseService.saveJournalEnrtry(objDetails);
              let period = ""; // 0
              let days = [];
              let i = 0;
              let frequency2 = 0;
              let weekdayObj = {
                  saturday: 0,
                  sunday: 0,
                  monday: 0,
                  tuesday: 0,
                  wednesday: 0,
                  thursday: 0,
                  friday: 0,
              };
              let repeatMonths = [];
              let repeatDates = [];
              if (radioFrequency == "frequencyDaily" || radioFrequency == "frequencyOnetimeonly") {
                  period = "Daily"; // 0
                  if (radioFrequency == "frequencyDaily") {
                      frequency2 = parseInt(everyDays);
                      if (dailyRadioOption == "dailyEveryDay") {
                          for (i = 0; i < 7; i++) {
                              days.push(i);
                          }
                      }
                      if (dailyRadioOption == "dailyWeekdays") {
                          for (i = 1; i < 6; i++) {
                              days.push(i);
                          }
                      }
                      if (dailyRadioOption == "dailyEvery") {
              
                      }
                  } else {
                      repeatDates.push({
                          "Dates": sDate2
                      })
                      frequency2 = 1;
                  }
              }
              if (radioFrequency == "frequencyWeekly") {
                  period = "Weekly"; // 1
                  frequency2 = parseInt(everyWeeks);
                  let arrSelectDays = selectDays.split(",");
                  for (i = 0; i < arrSelectDays.length; i++) {
                      days.push(arrSelectDays[i]);
                      if (parseInt(arrSelectDays[i]) == 0)
                          weekdayObj.sunday = 1;
                      if (parseInt(arrSelectDays[i]) == 1)
                          weekdayObj.monday = 1;
                      if (parseInt(arrSelectDays[i]) == 2)
                          weekdayObj.tuesday = 1;
                      if (parseInt(arrSelectDays[i]) == 3)
                          weekdayObj.wednesday = 1;
                      if (parseInt(arrSelectDays[i]) == 4)
                          weekdayObj.thursday = 1;
                      if (parseInt(arrSelectDays[i]) == 5)
                          weekdayObj.friday = 1;
                      if (parseInt(arrSelectDays[i]) == 6)
                          weekdayObj.saturday = 1;
                  }
              }
              if (radioFrequency == "frequencyMonthly") {
                  period = "Monthly"; // 0
                  repeatMonths = convertStrMonthToNum(ofMonths);
                  repeatDates = getRepeatDates(sDate2, fDate2, repeatMonths, monthDate);
                  frequency2 = parseInt(monthDate);
              }
              if (days.length > 0) {
                  for (let x = 0; x < days.length; x++) {
                    let dayObj = {
                        Name: "VS1_RepeatTrans",
                        Params: {
                            CloudUserName: erpGet.ERPUsername,
                            CloudPassword: erpGet.ERPPassword,
                            TransID: currentInvoice,
                            TransType: "JournalEntry",
                            Repeat_Frequency: frequency2,
                            Repeat_Period: period,
                            Repeat_BaseDate: sDate2,
                            Repeat_finalDateDate: fDate2,
                            Repeat_Saturday: weekdayObj.saturday,
                            Repeat_Sunday: weekdayObj.sunday,
                            Repeat_Monday: weekdayObj.monday,
                            Repeat_Tuesday: weekdayObj.tuesday,
                            Repeat_Wednesday: weekdayObj.wednesday,
                            Repeat_Thursday: weekdayObj.thursday,
                            Repeat_Friday: weekdayObj.friday,
                            Repeat_Holiday: 0,
                            Repeat_Weekday: parseInt(days[x].toString()),
                            Repeat_MonthOffset: 0,
                        },
                    };
                      var myString = '"JsonIn"' + ":" + JSON.stringify(dayObj);
                      var oPost = new XMLHttpRequest();
                      oPost.open(
                          "POST",
                          URLRequest +
                          erpGet.ERPIPAddress +
                          ":" +
                          erpGet.ERPPort +
                          "/" +
                          'erpapi/VS1_Cloud_Task/Method?Name="VS1_RepeatTrans"',
                          true
                      );
                      oPost.setRequestHeader("database", erpGet.ERPDatabase);
                      oPost.setRequestHeader("username", erpGet.ERPUsername);
                      oPost.setRequestHeader("password", erpGet.ERPPassword);
                      oPost.setRequestHeader("Accept", "application/json");
                      oPost.setRequestHeader("Accept", "application/html");
                      oPost.setRequestHeader("Content-type", "application/json");
                      oPost.send(myString);
              
                      oPost.onreadystatechange = function() {
                          if (oPost.readyState == 4 && oPost.status == 200) {
                              var myArrResponse = JSON.parse(oPost.responseText);
                              var success = myArrResponse.ProcessLog.ResponseStatus.includes("OK");
                          } else if (oPost.readyState == 4 && oPost.status == 403) {
                              
                          } else if (oPost.readyState == 4 && oPost.status == 406) {
                              
                          } else if (oPost.readyState == "") {
                              
                          }
                          $(".fullScreenSpin").css("display", "none");
                      };
                  }
              } else {
                  let dayObj = {};
                  if (radioFrequency == "frequencyOnetimeonly" || radioFrequency == "frequencyMonthly") {
                    dayObj = {
                        Name: "VS1_RepeatTrans",
                        Params: {
                            CloudUserName: erpGet.ERPUsername,
                            CloudPassword: erpGet.ERPPassword,
                            TransID: currentInvoice,
                            TransType: "JournalEntry",
                            Repeat_Dates: repeatDates,
                            Repeat_Frequency: frequency2,
                            Repeat_Period: period,
                            Repeat_BaseDate: sDate2,
                            Repeat_finalDateDate: fDate2,
                            Repeat_Saturday: weekdayObj.saturday,
                            Repeat_Sunday: weekdayObj.sunday,
                            Repeat_Monday: weekdayObj.monday,
                            Repeat_Tuesday: weekdayObj.tuesday,
                            Repeat_Wednesday: weekdayObj.wednesday,
                            Repeat_Thursday: weekdayObj.thursday,
                            Repeat_Friday: weekdayObj.friday,
                            Repeat_Holiday: 0,
                            Repeat_Weekday: 0,
                            Repeat_MonthOffset: 0,
                        },
                    };
                  } else {
                    dayObj = {
                        Name: "VS1_RepeatTrans",
                        Params: {
                            CloudUserName: erpGet.ERPUsername,
                            CloudPassword: erpGet.ERPPassword,
                            TransID: currentInvoice,
                            TransType: "JournalEntry",
                            Repeat_Frequency: frequency2,
                            Repeat_Period: period,
                            Repeat_BaseDate: sDate2,
                            Repeat_finalDateDate: fDate2,
                            Repeat_Saturday: weekdayObj.saturday,
                            Repeat_Sunday: weekdayObj.sunday,
                            Repeat_Monday: weekdayObj.monday,
                            Repeat_Tuesday: weekdayObj.tuesday,
                            Repeat_Wednesday: weekdayObj.wednesday,
                            Repeat_Thursday: weekdayObj.thursday,
                            Repeat_Friday: weekdayObj.friday,
                            Repeat_Holiday: 0,
                            Repeat_Weekday: 0,
                            Repeat_MonthOffset: 0,
                        },
                    };
                  }
                  var myString = '"JsonIn"' + ":" + JSON.stringify(dayObj);
                  var oPost = new XMLHttpRequest();
                  oPost.open(
                      "POST",
                      URLRequest +
                      erpGet.ERPIPAddress +
                      ":" +
                      erpGet.ERPPort +
                      "/" +
                      'erpapi/VS1_Cloud_Task/Method?Name="VS1_RepeatTrans"',
                      true
                  );
                  oPost.setRequestHeader("database", erpGet.ERPDatabase);
                  oPost.setRequestHeader("username", erpGet.ERPUsername);
                  oPost.setRequestHeader("password", erpGet.ERPPassword);
                  oPost.setRequestHeader("Accept", "application/json");
                  oPost.setRequestHeader("Accept", "application/html");
                  oPost.setRequestHeader("Content-type", "application/json");
                  // let objDataSave = '"JsonIn"' + ':' + JSON.stringify(selectClient);
                  oPost.send(myString);
              
                  oPost.onreadystatechange = function() {
                    if (oPost.readyState == 4 && oPost.status == 200) {
                        var myArrResponse = JSON.parse(oPost.responseText);
                        var success = myArrResponse.ProcessLog.ResponseStatus.includes("OK");
                    } else if (oPost.readyState == 4 && oPost.status == 403) {
                        
                    } else if (oPost.readyState == 4 && oPost.status == 406) {
                        
                    } else if (oPost.readyState == "") {
                        
                    }
                    $(".fullScreenSpin").css("display", "none");
                };
              }              
            }
          } else {
            // window.open("/invoicecard", "_self");
          }
          FlowRouter.go('/journalentrylist?success=true');
          $('.modal-backdrop').css('display','none');
        }, delayTimeAfterSound);
      },
    "click #tblCurrencyPopList tbody tr": (e) => {
        const rateType = $(".currency-js").attr("type"); // String "buy" | "sell"

        const currencyCode = $(e.currentTarget).find(".colCode").text();
        const currencyRate =
          rateType == "buy"
            ? $(e.currentTarget).find(".colBuyRate").text()
            : $(e.currentTarget).find(".colSellRate").text();

        $("#sltCurrency").val(currencyCode);
        $("#sltCurrency").trigger("change");
        $("#exchange_rate").val(currencyRate);
        $("#exchange_rate").trigger("change");
        $("#currencyModal").modal("toggle");

        $("#tblCurrencyPopList_filter .form-control-sm").val("");

        setTimeout(function () {
          $(".btnRefreshCurrency").trigger("click");
          $(".fullScreenSpin").css("display", "none");
        }, 1000);
      },
    'click #sltCurrency': function(event) {
        $('#currencyModal').modal('toggle');
    },
    'click #edtSupplierName': function(event) {
        $('#edtSupplierName').select();
        $('#edtSupplierName').editableSelect();
    },
    'click .th.colCreditExCheck': function(event) {
        $('.colCreditExCheck').addClass('hiddenColumn');
        $('.colCreditExCheck').removeClass('showColumn');

        $('.colCreditIncCheck').addClass('showColumn');
        $('.colCreditIncCheck').removeClass('hiddenColumn');
    },
    'click .th.colCreditIncCheck': function(event) {
        $('.colCreditIncCheck').addClass('hiddenColumn');
        $('.colCreditIncCheck').removeClass('showColumn');

        $('.colCreditExCheck').addClass('showColumn');
        $('.colCreditExCheck').removeClass('hiddenColumn');
    },
    'click .th.colDebitExCheck': function(event) {
        $('.colDebitExCheck').addClass('hiddenColumn');
        $('.colDebitExCheck').removeClass('showColumn');

        $('.colDebitIncCheck').addClass('showColumn');
        $('.colDebitIncCheck').removeClass('hiddenColumn');
    },
    'click .th.colDebitIncCheck': function(event) {
        $('.colDebitIncCheck').addClass('hiddenColumn');
        $('.colDebitIncCheck').removeClass('showColumn');

        $('.colDebitExCheck').addClass('showColumn');
        $('.colDebitExCheck').removeClass('hiddenColumn');
    },
    'blur .lineCreditExChange': function(event) {

        if (!isNaN($(event.target).val())) {
            let inputCreditEx = parseFloat($(event.target).val());
            $(event.target).val(Currency + '' + inputCreditEx.toLocaleString(undefined, {minimumFractionDigits: 2}));
        } else {
            let inputCreditEx = Number($(event.target).val().replace(/[^0-9.-]+/g, ""));

            $(event.target).val(Currency + '' + inputCreditEx.toLocaleString(undefined, {minimumFractionDigits: 2}) || Currency + '0');
        }
        let templateObject = Template.instance();
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();

        let inputCredit = parseFloat($(event.target).val()) || 0;
        if (!isNaN($(event.target).val())) {
            $(event.target).val(Currency + '' + inputCredit.toLocaleString(undefined, {minimumFractionDigits: 2}) || Currency + '0');
        } else {
            let inputCredit = Number($(event.target).val().replace(/[^0-9.-]+/g, ""));

            $(event.target).val(Currency + '' + inputCredit.toLocaleString(undefined, {minimumFractionDigits: 2}) || Currency + '0');
        }

        let $tblrows = $("#tblJournalEntryLine tbody tr");


        var targetID = $(event.target).closest('tr').attr('id');
        if ($(event.target).val().replace(/[^0-9.-]+/g, "") != 0) {
            $('#' + targetID + " .lineDebitEx").val(Currency + '0.00');
            $('#' + targetID + " .lineDebitInc").val(Currency + '0.00');
        }
        let nextRowID = $(event.target).closest('tr').next('tr').attr("id");
        let inputCreditData = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) ||0;
        $('#' + nextRowID + " .lineDebitExChange").val(utilityService.modifynegativeCurrencyFormat(inputCreditData)).trigger('change');
        let lineAmount = 0;
        let subGrandCreditTotal = 0;
        let subGrandDebitTotal = 0;

        let subGrandCreditTotalInc = 0;
        let subGrandDebitTotalInc = 0;
        $tblrows.each(function(index) {
            var $tblrow = $(this);
            var taxcode = $tblrow.find(".lineTaxCode").val() || 0;
            var taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxcode) {
                        taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                    }
                }
            }



            var credit = $tblrow.find(".lineCreditEx").val() || Currency + '0';
            var debit = $tblrow.find(".lineDebitEx").val() || Currency + '0';
            var subTotalCredit = Number(credit.replace(/[^0-9.-]+/g, "")) || 0;
            var subTotalDebit = Number(debit.replace(/[^0-9.-]+/g, "")) || 0;

            var taxTotalCredit = parseFloat(credit.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
            var taxTotalDebit = parseFloat(debit.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalCredit));
            if (!isNaN(subTotalCredit)) {
                let totalCreditInc = (parseFloat(subTotalCredit)) + (parseFloat(taxTotalCredit)) || 0;
                $tblrow.find('.lineCreditIncChange').val(utilityService.modifynegativeCurrencyFormat(totalCreditInc.toFixed(2)));
                subGrandCreditTotal += isNaN(subTotalCredit) ? 0 : subTotalCredit;
                subGrandCreditTotalInc += isNaN(totalCreditInc) ? 0 : totalCreditInc;
            };
            if (!isNaN(subTotalDebit)) {
                let totalDebitInc = (parseFloat(subTotalDebit)) + (parseFloat(taxTotalDebit)) || 0;
                $tblrow.find('.lineDebitIncChange').val(utilityService.modifynegativeCurrencyFormat(totalDebitInc.toFixed(2)));
                subGrandDebitTotal += isNaN(subTotalDebit) ? 0 : subTotalDebit;
                subGrandDebitTotalInc += isNaN(totalDebitInc) ? 0 : totalDebitInc;
            };

        });
        templateObject.totalCredit.set(utilityService.modifynegativeCurrencyFormat(subGrandCreditTotal));
        templateObject.totalDebit.set(utilityService.modifynegativeCurrencyFormat(subGrandDebitTotal));

        templateObject.totalCreditInc.set(utilityService.modifynegativeCurrencyFormat(subGrandCreditTotalInc));
        templateObject.totalDebitInc.set(utilityService.modifynegativeCurrencyFormat(subGrandDebitTotalInc));

    },
    'blur .lineDebitExChange': function(event) {

        if (!isNaN($(event.target).val())) {
            let inputDebitEx = parseFloat($(event.target).val());
            $(event.target).val(Currency + '' + inputDebitEx.toLocaleString(undefined, {minimumFractionDigits: 2}));
        } else {
            let inputDebitEx = Number($(event.target).val().replace(/[^0-9.-]+/g, ""));

            $(event.target).val(Currency + '' + inputDebitEx.toLocaleString(undefined, {minimumFractionDigits: 2}) || Currency + '0');
        }
        let templateObject = Template.instance();
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();

        let inputCredit = parseFloat($('.lineDebitEx').val()) || 0;
        if (!isNaN($('.lineDebitEx').val())) {
            $(event.target).val(Currency + '' + inputCredit.toLocaleString(undefined, {minimumFractionDigits: 2}) || Currency + '0');
        } else {
            let inputCredit = Number($(event.target).val().replace(/[^0-9.-]+/g, ""));

            $(event.target).val(Currency + '' + inputCredit.toLocaleString(undefined, {minimumFractionDigits: 2}) || Currency + '0');
        }

        let $tblrows = $("#tblJournalEntryLine tbody tr");
        var targetID = $(event.target).closest('tr').attr('id');
        if ($(event.target).val().replace(/[^0-9.-]+/g, "") != 0) {
            $('#' + targetID + " .lineCreditEx").val(Currency + '0.00');
            $('#' + targetID + " .lineCreditInc").val(Currency + '0.00');
        }


        let nextRowID = $(event.target).closest('tr').next('tr').attr("id");
        let inputDebitData = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) ||0;
        $('#' + nextRowID + " .lineCreditExChange").val(utilityService.modifynegativeCurrencyFormat(inputDebitData)).trigger('change');

        let lineAmount = 0;
        let subGrandCreditTotal = 0;
        let subGrandDebitTotal = 0;
        let subGrandCreditTotalInc = 0;
        let subGrandDebitTotalInc = 0;
        $tblrows.each(function(index) {
            var $tblrow = $(this);
            var taxcode = $tblrow.find(".lineTaxCode").val() || 0;
            var taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxcode) {
                        taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                    }
                }
            }
            var credit = $tblrow.find(".lineCreditEx").val() || Currency + '0';
            var debit = $tblrow.find(".lineDebitEx").val() || Currency + '0';
            var subTotalCredit = Number(credit.replace(/[^0-9.-]+/g, "")) || 0;
            var subTotalDebit = Number(debit.replace(/[^0-9.-]+/g, "")) || 0;

            var taxTotalCredit = parseFloat(credit.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
            var taxTotalDebit = parseFloat(debit.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalDebit));

            if (!isNaN(subTotalCredit)) {
                let totalCreditInc = (parseFloat(subTotalCredit)) + (parseFloat(taxTotalCredit)) || 0;
                $tblrow.find('.lineCreditIncChange').val(utilityService.modifynegativeCurrencyFormat(totalCreditInc.toFixed(2)));
                subGrandCreditTotal += isNaN(subTotalCredit) ? 0 : subTotalCredit;
                subGrandCreditTotalInc += isNaN(totalCreditInc) ? 0 : totalCreditInc;
            }
            if (!isNaN(subTotalDebit)) {
                let totalDebitInc = (parseFloat(subTotalDebit)) + (parseFloat(taxTotalDebit)) || 0;
                $tblrow.find('.lineDebitIncChange').val(utilityService.modifynegativeCurrencyFormat(totalDebitInc.toFixed(2)));
                subGrandDebitTotal += isNaN(subTotalDebit) ? 0 : subTotalDebit;
                subGrandDebitTotalInc += isNaN(totalDebitInc) ? 0 : totalDebitInc;
            }

        });
        templateObject.totalCredit.set(utilityService.modifynegativeCurrencyFormat(subGrandCreditTotal));
        templateObject.totalDebit.set(utilityService.modifynegativeCurrencyFormat(subGrandDebitTotal));

        templateObject.totalCreditInc.set(utilityService.modifynegativeCurrencyFormat(subGrandCreditTotalInc));
        templateObject.totalDebitInc.set(utilityService.modifynegativeCurrencyFormat(subGrandDebitTotalInc));

    },
    'blur .lineCreditIncChange': function(event) {

        if (!isNaN($(event.target).val())) {
            let inputCreditEx = parseFloat($(event.target).val());
            $(event.target).val(Currency + '' + inputCreditEx.toLocaleString(undefined, {
                minimumFractionDigits: 2
            }));
        } else {
            let inputCreditEx = Number($(event.target).val().replace(/[^0-9.-]+/g, ""));

            $(event.target).val(Currency + '' + inputCreditEx.toLocaleString(undefined, {
                minimumFractionDigits: 2
            }) || Currency + '0');
        }
        let templateObject = Template.instance();
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();

        let inputCredit = parseFloat($(event.target).val()) || 0;
        if (!isNaN($(event.target).val())) {
            $(event.target).val(Currency + '' + inputCredit.toLocaleString(undefined, {
                minimumFractionDigits: 2
            }) || Currency + '0');
        } else {
            let inputCredit = Number($(event.target).val().replace(/[^0-9.-]+/g, ""));

            $(event.target).val(Currency + '' + inputCredit.toLocaleString(undefined, {
                minimumFractionDigits: 2
            }) || Currency + '0');
        }

        let $tblrows = $("#tblJournalEntryLine tbody tr");
        var targetID = $(event.target).closest('tr').attr('id');
        if ($(event.target).val().replace(/[^0-9.-]+/g, "") != 0) {
            $('#' + targetID + " .lineDebitEx").val(Currency + '0.00');
            $('#' + targetID + " .lineDebitInc").val(Currency + '0.00');
        }

        let nextRowID = $(event.target).closest('tr').next('tr').attr("id");
        let inputCreditData = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) ||0;
        $('#' + nextRowID + " .lineDebitIncChange").val(utilityService.modifynegativeCurrencyFormat(inputCreditData)).trigger('change');

        let lineAmount = 0;
        let subGrandCreditTotal = 0;
        let subGrandDebitTotal = 0;

        let subGrandCreditTotalInc = 0;
        let subGrandDebitTotalInc = 0;
        $tblrows.each(function(index) {
            var $tblrow = $(this);
            var taxcode = $tblrow.find(".lineTaxCode").val() || 0;
            var taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxcode) {
                        taxrateamount = taxcodeList[i].coderate;
                    }
                }
            }



            var credit = $tblrow.find(".lineCreditInc").val() || Currency + '0';
            var debit = $tblrow.find(".lineDebitInc").val() || Currency + '0';
            let taxRateAmountCalc = (parseFloat(taxrateamount) + 100) / 100;
            var subTotalCredit = (Number(credit.replace(/[^0-9.-]+/g, "")) / (taxRateAmountCalc)) || Currency + '0';
            var subTotalDebit = (Number(debit.replace(/[^0-9.-]+/g, "")) / (taxRateAmountCalc)) || Currency + '0';
            var taxTotalCredit = parseFloat(credit.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotalCredit) || 0;
            var taxTotalDebit = parseFloat(debit.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotalDebit) || 0;
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalCredit));
            if (!isNaN(subTotalCredit)) {
                $tblrow.find('.lineCreditExChange').val(utilityService.modifynegativeCurrencyFormat(subTotalCredit.toFixed(2)));
                let totalCreditInc = (parseFloat(subTotalCredit)) + (parseFloat(taxTotalCredit)) || 0;
                $tblrow.find('.lineCreditIncChange').val(utilityService.modifynegativeCurrencyFormat(totalCreditInc.toFixed(2)));
                subGrandCreditTotal += isNaN(subTotalCredit) ? 0 : subTotalCredit;
                subGrandCreditTotalInc += isNaN(totalCreditInc) ? 0 : totalCreditInc;
            };
            if (!isNaN(subTotalDebit)) {
                $tblrow.find('.lineDebitExChange').val(utilityService.modifynegativeCurrencyFormat(subTotalDebit.toFixed(2)));
                let totalDebitInc = (parseFloat(subTotalDebit)) + (parseFloat(taxTotalDebit)) || 0;
                $tblrow.find('.lineDebitIncChange').val(utilityService.modifynegativeCurrencyFormat(totalDebitInc.toFixed(2)));
                subGrandDebitTotal += isNaN(subTotalDebit) ? 0 : subTotalDebit;
                subGrandDebitTotalInc += isNaN(totalDebitInc) ? 0 : totalDebitInc;
            };

        });
        templateObject.totalCredit.set(utilityService.modifynegativeCurrencyFormat(subGrandCreditTotal));
        templateObject.totalDebit.set(utilityService.modifynegativeCurrencyFormat(subGrandDebitTotal));

        templateObject.totalCreditInc.set(utilityService.modifynegativeCurrencyFormat(subGrandCreditTotalInc));
        templateObject.totalDebitInc.set(utilityService.modifynegativeCurrencyFormat(subGrandDebitTotalInc));

    },
    'blur .lineDebitIncChange': function(event) {

        if (!isNaN($(event.target).val())) {
            let inputDebitEx = parseFloat($(event.target).val());
            $(event.target).val(Currency + '' + inputDebitEx.toLocaleString(undefined, {minimumFractionDigits: 2}));
        } else {
            let inputDebitEx = Number($(event.target).val().replace(/[^0-9.-]+/g, ""));

            $(event.target).val(Currency + '' + inputDebitEx.toLocaleString(undefined, {minimumFractionDigits: 2}) || Currency + '0');
        }
        let templateObject = Template.instance();
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();

        let inputCredit = parseFloat($(event.target).val()) || 0;
        if (!isNaN($(event.target).val())) {
            $(event.target).val(Currency + '' + inputCredit.toLocaleString(undefined, {minimumFractionDigits: 2}) || Currency + '0');
        } else {
            let inputCredit = Number($(event.target).val().replace(/[^0-9.-]+/g, ""));

            $(event.target).val(Currency + '' + inputCredit.toLocaleString(undefined, {minimumFractionDigits: 2}) || Currency + '0');
        }

        let $tblrows = $("#tblJournalEntryLine tbody tr");
        var targetID = $(event.target).closest('tr').attr('id');
        if ($(event.target).val().replace(/[^0-9.-]+/g, "") != 0) {
            $('#' + targetID + " .lineCreditEx").val(Currency + '0.00');
            $('#' + targetID + " .lineCreditInc").val(Currency + '0.00');
        }

        let nextRowID = $(event.target).closest('tr').next('tr').attr("id");
        let inputDebitData = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) ||0;
        $('#' + nextRowID + " .lineCreditExChange").val(utilityService.modifynegativeCurrencyFormat(inputDebitData)).trigger('change');


        let lineAmount = 0;
        let subGrandCreditTotal = 0;
        let subGrandDebitTotal = 0;
        let subGrandCreditTotalInc = 0;
        let subGrandDebitTotalInc = 0;
        $tblrows.each(function(index) {
            var $tblrow = $(this);
            var taxcode = $tblrow.find(".lineTaxCode").val() || 0;
            var taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxcode) {
                        taxrateamount = taxcodeList[i].coderate;
                    }
                }
            }
            var credit = $tblrow.find(".lineCreditInc").val() || Currency + '0';
            var debit = $tblrow.find(".lineDebitInc").val() || Currency + '0';

            let taxRateAmountCalc = (parseFloat(taxrateamount) + 100) / 100;

            var subTotalCredit = (Number(credit.replace(/[^0-9.-]+/g, "")) / (taxRateAmountCalc)) || Currency + '0';
            var subTotalDebit = (Number(debit.replace(/[^0-9.-]+/g, "")) / (taxRateAmountCalc)) || Currency + '0';

            var taxTotalCredit = parseFloat(credit.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotalCredit) || 0;
            var taxTotalDebit = parseFloat(debit.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotalDebit) || 0;
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalDebit));

            if (!isNaN(subTotalCredit)) {
                $tblrow.find('.lineCreditExChange').val(utilityService.modifynegativeCurrencyFormat(subTotalCredit.toFixed(2)));
                let totalCreditInc = (parseFloat(subTotalCredit)) + (parseFloat(taxTotalCredit)) || 0;
                $tblrow.find('.lineCreditIncChange').val(utilityService.modifynegativeCurrencyFormat(totalCreditInc.toFixed(2)));
                subGrandCreditTotal += isNaN(subTotalCredit) ? 0 : subTotalCredit;
                subGrandCreditTotalInc += isNaN(totalCreditInc) ? 0 : totalCreditInc;
            }
            if (!isNaN(subTotalDebit)) {
                $tblrow.find('.lineDebitExChange').val(utilityService.modifynegativeCurrencyFormat(subTotalDebit.toFixed(2)));
                let totalDebitInc = (parseFloat(subTotalDebit)) + (parseFloat(taxTotalDebit)) || 0;
                $tblrow.find('.lineDebitIncChange').val(utilityService.modifynegativeCurrencyFormat(totalDebitInc.toFixed(2)));
                subGrandDebitTotal += isNaN(subTotalDebit) ? 0 : subTotalDebit;
                subGrandDebitTotalInc += isNaN(totalDebitInc) ? 0 : totalDebitInc;
            }

        });
        templateObject.totalCredit.set(utilityService.modifynegativeCurrencyFormat(subGrandCreditTotal));
        templateObject.totalDebit.set(utilityService.modifynegativeCurrencyFormat(subGrandDebitTotal));

        templateObject.totalCreditInc.set(utilityService.modifynegativeCurrencyFormat(subGrandCreditTotalInc));
        templateObject.totalDebitInc.set(utilityService.modifynegativeCurrencyFormat(subGrandDebitTotalInc));

    },
    'click #btnCustomFileds': function(event) {
        var x = document.getElementById("divCustomFields");
        if (x.style.display === "none") {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }
    },
    'click .lineAccountName, keydown .lineAccountName': function(event) {
      var $earch = $(event.currentTarget);
      var offset = $earch.offset();
        $('#edtAccountID').val('');
        $('#add-account-title').text('Add New Account');
        // let suppliername = $('#edtSupplierName').val();
        let accountService = new AccountService();
        const accountTypeList = [];

            var accountDataName = $(event.target).val() || '';
            if (event.pageX > offset.left + $earch.width() - 10) { // X button 16px wide?
              $('#accountListModal').modal('toggle');
              var targetID = $(event.target).closest('tr').attr('id');
              $('#selectLineID').val(targetID);
              setTimeout(function() {
                  $('#tblAccount_filter .form-control-sm').focus();
                  $('#tblAccount_filter .form-control-sm').val('');
                  $('#tblAccount_filter .form-control-sm').trigger("input");

                  var datatable = $('#tblInventory').DataTable();
                  datatable.draw();
                  $('#tblAccount_filter .form-control-sm').trigger("input");

              }, 500);
         } else {
            if (accountDataName.replace(/\s/g, '') != '') {
                getVS1Data('TAccountVS1').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        accountService.getOneAccountByName(accountDataName).then(function(data) {
                          let lineItems = [];
                          let lineItemObj = {};
                          let fullAccountTypeName = '';
                          let accBalance = '';
                          $('#add-account-title').text('Edit Account Details');
                          $('#edtAccountName').attr('readonly', true);
                          $('#sltAccountType').attr('readonly', true);
                          $('#sltAccountType').attr('disabled', 'disabled');
                            if (accountTypeList) {
                                for (var h = 0; h < accountTypeList.length; h++) {

                                    if (data.taccountvs1[0].fields.AccountTypeName === accountTypeList[h].accounttypename) {

                                        fullAccountTypeName = accountTypeList[h].description || '';

                                    }
                                }

                            }

                            var accountid = data.taccountvs1[0].fields.ID || '';
                            var accounttype = fullAccountTypeName || data.taccountvs1[0].fields.AccountTypeName;
                            var accountname = data.taccountvs1[0].fields.AccountName || '';
                            var accountno = data.taccountvs1[0].fields.AccountNumber || '';
                            var taxcode = data.taccountvs1[0].fields.TaxCode || '';
                            var accountdesc = data.taccountvs1[0].fields.Description || '';
                            var bankaccountname = data.taccountvs1[0].fields.BankAccountName || '';
                            var bankbsb = data.taccountvs1[0].fields.BSB || '';
                            var bankacountno = data.taccountvs1[0].fields.BankAccountNumber || '';

                            var swiftCode = data.taccountvs1[0].fields.Extra || '';
                            var routingNo = data.taccountvs1[0].fields.BankCode || '';

                            var showTrans = data.taccountvs1[0].fields.IsHeader || false;

                            var cardnumber = data.taccountvs1[0].fields.CarNumber || '';
                            var cardcvc = data.taccountvs1[0].fields.CVC || '';
                            var cardexpiry = data.taccountvs1[0].fields.ExpiryDate || '';

                            if ((accounttype === "BANK")) {
                                $('.isBankAccount').removeClass('isNotBankAccount');
                                $('.isCreditAccount').addClass('isNotCreditAccount');
                            } else if ((accounttype === "CCARD")) {
                                $('.isCreditAccount').removeClass('isNotCreditAccount');
                                $('.isBankAccount').addClass('isNotBankAccount');
                            } else {
                                $('.isBankAccount').addClass('isNotBankAccount');
                                $('.isCreditAccount').addClass('isNotCreditAccount');
                            }

                            $('#edtAccountID').val(accountid);
                            $('#sltAccountType').val(accounttype);
                            $('#sltAccountType').append('<option value="' + accounttype + '" selected="selected">' + accounttype + '</option>');
                            $('#edtAccountName').val(accountname);
                            $('#edtAccountNo').val(accountno);
                            $('#sltTaxCode').val(taxcode);
                            $('#txaAccountDescription').val(accountdesc);
                            $('#edtBankAccountName').val(bankaccountname);
                            $('#edtBSB').val(bankbsb);
                            $('#edtBankAccountNo').val(bankacountno);
                            $('#swiftCode').val(swiftCode);
                            $('#routingNo').val(routingNo);
                            $('#edtBankName').val(localStorage.getItem('vs1companyBankName') || '');

                            $('#edtCardNumber').val(cardnumber);
                            $('#edtExpiryDate').val(cardexpiry ? moment(cardexpiry).format('DD/MM/YYYY') : "");
                            $('#edtCvc').val(cardcvc);

                            if (showTrans == 'true') {
                                $('.showOnTransactions').prop('checked', true);
                            } else {
                                $('.showOnTransactions').prop('checked', false);
                            }

                            setTimeout(function() {
                                $('#addNewAccount').modal('show');
                            }, 500);

                        }).catch(function(err) {
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.taccountvs1;
                        var added = false;
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullAccountTypeName = '';
                        let accBalance = '';
                        $('#add-account-title').text('Edit Account Details');
                        $('#edtAccountName').attr('readonly', true);
                        $('#sltAccountType').attr('readonly', true);
                        $('#sltAccountType').attr('disabled', 'disabled');
                        for (let a = 0; a < data.taccountvs1.length; a++) {

                            if ((data.taccountvs1[a].fields.AccountName) === accountDataName) {
                                added = true;
                                if (accountTypeList) {
                                    for (var h = 0; h < accountTypeList.length; h++) {

                                        if (data.taccountvs1[a].fields.AccountTypeName === accountTypeList[h].accounttypename) {

                                            fullAccountTypeName = accountTypeList[h].description || '';

                                        }
                                    }

                                }



                                var accountid = data.taccountvs1[a].fields.ID || '';
                                var accounttype = fullAccountTypeName || data.taccountvs1[a].fields.AccountTypeName;
                                var accountname = data.taccountvs1[a].fields.AccountName || '';
                                var accountno = data.taccountvs1[a].fields.AccountNumber || '';
                                var taxcode = data.taccountvs1[a].fields.TaxCode || '';
                                var accountdesc = data.taccountvs1[a].fields.Description || '';
                                var bankaccountname = data.taccountvs1[a].fields.BankAccountName || '';
                                var bankbsb = data.taccountvs1[a].fields.BSB || '';
                                var bankacountno = data.taccountvs1[a].fields.BankAccountNumber || '';

                                var swiftCode = data.taccountvs1[a].fields.Extra || '';
                                var routingNo = data.taccountvs1[a].BankCode || '';

                                var showTrans = data.taccountvs1[a].fields.IsHeader || false;

                                var cardnumber = data.taccountvs1[a].fields.CarNumber || '';
                                var cardcvc = data.taccountvs1[a].fields.CVC || '';
                                var cardexpiry = data.taccountvs1[a].fields.ExpiryDate || '';

                                if ((accounttype === "BANK")) {
                                    $('.isBankAccount').removeClass('isNotBankAccount');
                                    $('.isCreditAccount').addClass('isNotCreditAccount');
                                } else if ((accounttype === "CCARD")) {
                                    $('.isCreditAccount').removeClass('isNotCreditAccount');
                                    $('.isBankAccount').addClass('isNotBankAccount');
                                } else {
                                    $('.isBankAccount').addClass('isNotBankAccount');
                                    $('.isCreditAccount').addClass('isNotCreditAccount');
                                }

                                $('#edtAccountID').val(accountid);
                                $('#sltAccountType').val(accounttype);
                                $('#sltAccountType').append('<option value="' + accounttype + '" selected="selected">' + accounttype + '</option>');
                                $('#edtAccountName').val(accountname);
                                $('#edtAccountNo').val(accountno);
                                $('#sltTaxCode').val(taxcode);
                                $('#txaAccountDescription').val(accountdesc);
                                $('#edtBankAccountName').val(bankaccountname);
                                $('#edtBSB').val(bankbsb);
                                $('#edtBankAccountNo').val(bankacountno);
                                $('#swiftCode').val(swiftCode);
                                $('#routingNo').val(routingNo);
                                $('#edtBankName').val(localStorage.getItem('vs1companyBankName') || '');

                                $('#edtCardNumber').val(cardnumber);
                                $('#edtExpiryDate').val(cardexpiry ? moment(cardexpiry).format('DD/MM/YYYY') : "");
                                $('#edtCvc').val(cardcvc);

                                if (showTrans == 'true') {
                                    $('.showOnTransactions').prop('checked', true);
                                } else {
                                    $('.showOnTransactions').prop('checked', false);
                                }

                                setTimeout(function() {
                                    $('#addNewAccount').modal('show');
                                }, 500);

                            }
                        }
                        if (!added) {
                            accountService.getOneAccountByName(accountDataName).then(function(data) {
                              let lineItems = [];
                              let lineItemObj = {};
                              let fullAccountTypeName = '';
                              let accBalance = '';
                              $('#add-account-title').text('Edit Account Details');
                              $('#edtAccountName').attr('readonly', true);
                              $('#sltAccountType').attr('readonly', true);
                              $('#sltAccountType').attr('disabled', 'disabled');
                                if (accountTypeList) {
                                    for (var h = 0; h < accountTypeList.length; h++) {

                                        if (data.taccountvs1[0].fields.AccountTypeName === accountTypeList[h].accounttypename) {

                                            fullAccountTypeName = accountTypeList[h].description || '';

                                        }
                                    }

                                }

                                var accountid = data.taccountvs1[0].fields.ID || '';
                                var accounttype = fullAccountTypeName || data.taccountvs1[0].fields.AccountTypeName;
                                var accountname = data.taccountvs1[0].fields.AccountName || '';
                                var accountno = data.taccountvs1[0].fields.AccountNumber || '';
                                var taxcode = data.taccountvs1[0].fields.TaxCode || '';
                                var accountdesc = data.taccountvs1[0].fields.Description || '';
                                var bankaccountname = data.taccountvs1[0].fields.BankAccountName || '';
                                var bankbsb = data.taccountvs1[0].fields.BSB || '';
                                var bankacountno = data.taccountvs1[0].fields.BankAccountNumber || '';

                                var swiftCode = data.taccountvs1[0].fields.Extra || '';
                                var routingNo = data.taccountvs1[0].fields.BankCode || '';

                                var showTrans = data.taccountvs1[0].fields.IsHeader || false;

                                var cardnumber = data.taccountvs1[0].fields.CarNumber || '';
                                var cardcvc = data.taccountvs1[0].fields.CVC || '';
                                var cardexpiry = data.taccountvs1[0].fields.ExpiryDate || '';

                                if ((accounttype === "BANK")) {
                                    $('.isBankAccount').removeClass('isNotBankAccount');
                                    $('.isCreditAccount').addClass('isNotCreditAccount');
                                } else if ((accounttype === "CCARD")) {
                                    $('.isCreditAccount').removeClass('isNotCreditAccount');
                                    $('.isBankAccount').addClass('isNotBankAccount');
                                } else {
                                    $('.isBankAccount').addClass('isNotBankAccount');
                                    $('.isCreditAccount').addClass('isNotCreditAccount');
                                }

                                $('#edtAccountID').val(accountid);
                                $('#sltAccountType').val(accounttype);
                                $('#sltAccountType').append('<option value="' + accounttype + '" selected="selected">' + accounttype + '</option>');
                                $('#edtAccountName').val(accountname);
                                $('#edtAccountNo').val(accountno);
                                $('#sltTaxCode').val(taxcode);
                                $('#txaAccountDescription').val(accountdesc);
                                $('#edtBankAccountName').val(bankaccountname);
                                $('#edtBSB').val(bankbsb);
                                $('#edtBankAccountNo').val(bankacountno);
                                $('#swiftCode').val(swiftCode);
                                $('#routingNo').val(routingNo);
                                $('#edtBankName').val(localStorage.getItem('vs1companyBankName') || '');

                                $('#edtCardNumber').val(cardnumber);
                                $('#edtExpiryDate').val(cardexpiry ? moment(cardexpiry).format('DD/MM/YYYY') : "");
                                $('#edtCvc').val(cardcvc);

                                if (showTrans == 'true') {
                                    $('.showOnTransactions').prop('checked', true);
                                } else {
                                    $('.showOnTransactions').prop('checked', false);
                                }

                                setTimeout(function() {
                                    $('#addNewAccount').modal('show');
                                }, 500);

                            }).catch(function(err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        }

                    }
                }).catch(function(err) {
                    accountService.getOneAccountByName(accountDataName).then(function(data) {
                      let lineItems = [];
                      let lineItemObj = {};
                      let fullAccountTypeName = '';
                      let accBalance = '';
                      $('#add-account-title').text('Edit Account Details');
                      $('#edtAccountName').attr('readonly', true);
                      $('#sltAccountType').attr('readonly', true);
                      $('#sltAccountType').attr('disabled', 'disabled');
                        if (accountTypeList) {
                            for (var h = 0; h < accountTypeList.length; h++) {

                                if (data.taccountvs1[0].fields.AccountTypeName === accountTypeList[h].accounttypename) {

                                    fullAccountTypeName = accountTypeList[h].description || '';

                                }
                            }

                        }

                        var accountid = data.taccountvs1[0].fields.ID || '';
                        var accounttype = fullAccountTypeName || data.taccountvs1[0].fields.AccountTypeName;
                        var accountname = data.taccountvs1[0].fields.AccountName || '';
                        var accountno = data.taccountvs1[0].fields.AccountNumber || '';
                        var taxcode = data.taccountvs1[0].fields.TaxCode || '';
                        var accountdesc = data.taccountvs1[0].fields.Description || '';
                        var bankaccountname = data.taccountvs1[0].fields.BankAccountName || '';
                        var bankbsb = data.taccountvs1[0].fields.BSB || '';
                        var bankacountno = data.taccountvs1[0].fields.BankAccountNumber || '';

                        var swiftCode = data.taccountvs1[0].fields.Extra || '';
                        var routingNo = data.taccountvs1[0].fields.BankCode || '';

                        var showTrans = data.taccountvs1[0].fields.IsHeader || false;

                        var cardnumber = data.taccountvs1[0].fields.CarNumber || '';
                        var cardcvc = data.taccountvs1[0].fields.CVC || '';
                        var cardexpiry = data.taccountvs1[0].fields.ExpiryDate || '';

                        if ((accounttype === "BANK")) {
                            $('.isBankAccount').removeClass('isNotBankAccount');
                            $('.isCreditAccount').addClass('isNotCreditAccount');
                        } else if ((accounttype === "CCARD")) {
                            $('.isCreditAccount').removeClass('isNotCreditAccount');
                            $('.isBankAccount').addClass('isNotBankAccount');
                        } else {
                            $('.isBankAccount').addClass('isNotBankAccount');
                            $('.isCreditAccount').addClass('isNotCreditAccount');
                        }

                        $('#edtAccountID').val(accountid);
                        $('#sltAccountType').val(accounttype);
                        $('#sltAccountType').append('<option value="' + accounttype + '" selected="selected">' + accounttype + '</option>');
                        $('#edtAccountName').val(accountname);
                        $('#edtAccountNo').val(accountno);
                        $('#sltTaxCode').val(taxcode);
                        $('#txaAccountDescription').val(accountdesc);
                        $('#edtBankAccountName').val(bankaccountname);
                        $('#edtBSB').val(bankbsb);
                        $('#edtBankAccountNo').val(bankacountno);
                        $('#swiftCode').val(swiftCode);
                        $('#routingNo').val(routingNo);
                        $('#edtBankName').val(localStorage.getItem('vs1companyBankName') || '');

                        $('#edtCardNumber').val(cardnumber);
                        $('#edtExpiryDate').val(cardexpiry ? moment(cardexpiry).format('DD/MM/YYYY') : "");
                        $('#edtCvc').val(cardcvc);

                        if (showTrans == 'true') {
                            $('.showOnTransactions').prop('checked', true);
                        } else {
                            $('.showOnTransactions').prop('checked', false);
                        }

                        setTimeout(function() {
                            $('#addNewAccount').modal('show');
                        }, 500);

                    }).catch(function(err) {
                        $('.fullScreenSpin').css('display', 'none');
                    });

                });
                $('#addAccountModal').modal('toggle');
            } else {
                $('#accountListModal').modal('toggle');
                var targetID = $(event.target).closest('tr').attr('id');
                $('#selectLineID').val(targetID);
                setTimeout(function() {
                    $('#tblAccount_filter .form-control-sm').focus();
                    $('#tblAccount_filter .form-control-sm').val('');
                    $('#tblAccount_filter .form-control-sm').trigger("input");

                    var datatable = $('#tblInventory').DataTable();
                    datatable.draw();
                    $('#tblAccount_filter .form-control-sm').trigger("input");

                }, 500);
            }

          }


    },
    'click #accountListModal #refreshpagelist': function() {

        Meteor._reload.reload();


    },
    'click .lineTaxRate': function(event) {
        $('#tblJournalEntryLine tbody tr .lineTaxRate').attr("data-toggle", "modal");
        $('#tblJournalEntryLine tbody tr .lineTaxRate').attr("data-target", "#taxRateListModal");
        var targetID = $(event.target).closest('tr').attr('id');
        $('#selectLineID').val(targetID);
    },
    'click .lineTaxCode, keydown .lineTaxCode': function(event) {
       var $earch = $(event.currentTarget);
       var offset = $earch.offset();
       $('#edtTaxID').val('');
       $('.taxcodepopheader').text('New Tax Rate');
       $('#edtTaxID').val('');
       $('#edtTaxNamePop').val('');
       $('#edtTaxRatePop').val('');
       $('#edtTaxDescPop').val('');
       $('#edtTaxNamePop').attr('readonly', false);
       let purchaseService = new PurchaseBoardService();
       var taxRateDataName = $(event.target).val() || '';
       if (event.pageX > offset.left + $earch.width() - 10) { // X button 16px wide?
           $('#taxRateListModal').modal('toggle');
           var targetID = $(event.target).closest('tr').attr('id');
           $('#selectLineID').val(targetID);
           setTimeout(function() {
               $('#tblTaxRate_filter .form-control-sm').focus();
               $('#tblTaxRate_filter .form-control-sm').val('');
               $('#tblTaxRate_filter .form-control-sm').trigger("input");

               var datatable = $('#tblTaxRate').DataTable();
               datatable.draw();
               $('#tblTaxRate_filter .form-control-sm').trigger("input");

           }, 500);
       } else {
           if (taxRateDataName.replace(/\s/g, '') != '') {

               getVS1Data('TTaxcodeVS1').then(function (dataObject) {
                 if(dataObject.length == 0){
                   purchaseService.getTaxCodesVS1().then(function (data) {
                     let lineItems = [];
                     let lineItemObj = {};
                     for(let i=0; i<data.ttaxcodevs1.length; i++){
                       if ((data.ttaxcodevs1[i].CodeName) === taxRateDataName) {
                         $('#edtTaxNamePop').attr('readonly', true);
                       let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                       var taxRateID = data.ttaxcodevs1[i].Id || '';
                        var taxRateName = data.ttaxcodevs1[i].CodeName ||'';
                        var taxRateDesc = data.ttaxcodevs1[i].Description || '';
                        $('#edtTaxID').val(taxRateID);
                        $('#edtTaxNamePop').val(taxRateName);
                        $('#edtTaxRatePop').val(taxRate);
                        $('#edtTaxDescPop').val(taxRateDesc);
                        setTimeout(function() {
                        $('#newTaxRateModal').modal('toggle');
                        }, 100);
                      }
                     }

                   }).catch(function (err) {
                       // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                       $('.fullScreenSpin').css('display','none');
                       // Meteor._reload.reload();
                   });
                 }else{
                   let data = JSON.parse(dataObject[0].data);
                   let useData = data.ttaxcodevs1;
                   let lineItems = [];
                   let lineItemObj = {};
                   $('.taxcodepopheader').text('Edit Tax Rate');
                   for(let i=0; i<useData.length; i++){

                     if ((useData[i].CodeName) === taxRateDataName) {
                       $('#edtTaxNamePop').attr('readonly', true);
                     let taxRate = (useData[i].Rate * 100).toFixed(2);
                     var taxRateID = useData[i].Id || '';
                      var taxRateName = useData[i].CodeName ||'';
                      var taxRateDesc = useData[i].Description || '';
                      $('#edtTaxID').val(taxRateID);
                      $('#edtTaxNamePop').val(taxRateName);
                      $('#edtTaxRatePop').val(taxRate);
                      $('#edtTaxDescPop').val(taxRateDesc);
                      //setTimeout(function() {
                      $('#newTaxRateModal').modal('toggle');
                      //}, 500);
                    }
                   }
                 }
               }).catch(function (err) {
                 purchaseService.getTaxCodesVS1().then(function (data) {
                   let lineItems = [];
                   let lineItemObj = {};
                   for(let i=0; i<data.ttaxcodevs1.length; i++){
                     if ((data.ttaxcodevs1[i].CodeName) === taxRateDataName) {
                       $('#edtTaxNamePop').attr('readonly', true);
                     let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                     var taxRateID = data.ttaxcodevs1[i].Id || '';
                      var taxRateName = data.ttaxcodevs1[i].CodeName ||'';
                      var taxRateDesc = data.ttaxcodevs1[i].Description || '';
                      $('#edtTaxID').val(taxRateID);
                      $('#edtTaxNamePop').val(taxRateName);
                      $('#edtTaxRatePop').val(taxRate);
                      $('#edtTaxDescPop').val(taxRateDesc);
                      setTimeout(function() {
                      $('#newTaxRateModal').modal('toggle');
                      }, 100);

                    }
                   }

                 }).catch(function (err) {
                     // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                     $('.fullScreenSpin').css('display','none');
                     // Meteor._reload.reload();
                 });
               });

           } else {
               $('#taxRateListModal').modal('toggle');
               var targetID = $(event.target).closest('tr').attr('id');
               $('#selectLineID').val(targetID);
               setTimeout(function() {
                   $('#tblTaxRate_filter .form-control-sm').focus();
                   $('#tblTaxRate_filter .form-control-sm').val('');
                   $('#tblTaxRate_filter .form-control-sm').trigger("input");

                   var datatable = $('#tblTaxRate').DataTable();
                   datatable.draw();
                   $('#tblTaxRate_filter .form-control-sm').trigger("input");

               }, 500);
           }

       }

    },
    'click #open_print_confirm' : function(event) {
        playPrintAudio();
        setTimeout(function(){
            $('#templateselection').modal('toggle');
        }, delayTimeAfterSound);
    },
    'click .printConfirm': async function(event) {
        playPrintAudio();
        setTimeout(async function(){
            var printTemplate = [];
            $('.fullScreenSpin').css('display', 'inline-block');
            $('#html-2-pdfwrapper').css('display', 'block');
            if($('#print_journal_entry').is(':checked')) {
                printTemplate.push('JournalEntry');
            }

            if(printTemplate.length > 0) {
                for(var i = 0; i < printTemplate.length; i++)
                {
                    if(printTemplate[i] == 'JournalEntry')
                    {
                        var template_number = $('input[name="journal_entry"]:checked').val();
                    }
                    let result = await exportSalesToPdf1(printTemplate[i],template_number);
                    if(result == true)
                    {

                    }
                }
            }
        }, delayTimeAfterSound);
    },
    'keydown .lineCreditEx, keydown .lineDebitEx, keydown .lineAmount': function(event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||

            (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||

            (event.keyCode >= 35 && event.keyCode <= 40)) {

            return;
        }

        if (event.shiftKey == true) {
            event.preventDefault();
        }

        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
            (event.keyCode >= 96 && event.keyCode <= 105) ||
            event.keyCode == 8 || event.keyCode == 9 ||
            event.keyCode == 37 || event.keyCode == 39 ||
            event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 189 || event.keyCode == 109) {} else {
            event.preventDefault();
        }
    },
    'click .btnRemove': async function(event) {
        var templateObject = Template.instance();
        var targetID = $(event.target).closest('tr').attr('id');
        $('#selectDeleteLineID').val(targetID);
       
        if(targetID != undefined){
            times++;
            if (times == 1) {
                $('#deleteLineModal').modal('toggle');
            } else {
                if ($('#tblJournalEntryLine tbody>tr').length > 1) {
                    this.click;
                    $(event.target).closest('tr').remove();
                    event.preventDefault();
                    let $tblrows = $("#tblJournalEntryLine tbody tr");

                    let lineAmount = 0;
                    let subGrandTotal = 0;
                    let taxGrandTotal = 0;


                    return false;

                } else {
                    $('#deleteLineModal').modal('toggle');
                }
            }
        } else {
            if(templateObject.hasFollow.get()) $("#footerDeleteModal2").modal("toggle");
            else $("#footerDeleteModal1").modal("toggle");
        }
    },
    'click .btnDeleteFollowingJournals': async function(event) {
        playDeleteAudio();
        var currentDate = new Date();
        let purchaseService = new PurchaseBoardService();
        let templateObject = Template.instance();
        setTimeout(async function(){

        swal({
            title: 'Delete Journal Entry',
            text: "Do you wish to delete this transaction and all others associated with it moving forward?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then(async (result) => {
            if (result.value) {
                $('.fullScreenSpin').css('display', 'inline-block');
                var url = FlowRouter.current().path;
                var getso_id = url.split('?id=');
                var currentInvoice = getso_id[getso_id.length - 1];
                var objDetails = '';
                if (getso_id[1]) {
                    currentInvoice = parseInt(currentInvoice);
                    var journalData = await purchaseService.getOneJournalEnrtyData(currentInvoice);
                    var transactionDate = journalData.fields.TransactionDate;
                    var fromDate = transactionDate.substring(0, 10);
                    var toDate = currentDate.getFullYear() + '-' + ("0" + (currentDate.getMonth() + 1)).slice(-2) + '-' + ("0" + (currentDate.getDate())).slice(-2);
                    var followingJournals = await sideBarService.getTJournalEntryListData(
                        fromDate,
                        toDate,
                        false,
                        initialReportLoad,
                        0
                    );
                    var journalList = followingJournals.tjournalentrylist;
                    for (var i=0; i < journalList.length; i++) {
                        var objDetails = {
                            type: "TJournalEntry",
                            fields: {
                                ID: journalList[i].GJID,
                                Deleted: true
                            }
                        };
                        var result = await purchaseService.saveJournalEnrtry(objDetails);
                    }
                }
                FlowRouter.go('/journalentrylist?success=true');
                $('.modal-backdrop').css('display', 'none');
                $('#deleteLineModal').modal('toggle');
            }
        });
    }, delayTimeAfterSound);
    },
    'click .btnDeleteJournal': function(event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let purchaseService = new PurchaseBoardService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display', 'inline-block');

        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentInvoice = getso_id[getso_id.length - 1];
        var objDetails = '';
        if (getso_id[1]) {
            currentInvoice = parseInt(currentInvoice);
            var objDetails = {
                type: "TJournalEntry",
                fields: {
                    ID: currentInvoice,
                    Deleted: true
                }
            };

            purchaseService.saveJournalEnrtry(objDetails).then(function(objDetails) {
                FlowRouter.go('/journalentrylist?success=true');
                $('.modal-backdrop').css('display', 'none');
            }).catch(function(err) {
                if (err === 'Error: "Unable to lock object: "') {
                    swal({
                        title: 'This Journal Entry has already been reconciled.',
                        text: 'Please delete the Bank Reconciliation in order to edit/delete this Journal Entry',
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/journalentrylist');
                        } else if (result.dismiss === 'cancel') {

                        }
                    });
                } else {
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {if(err === checkResponseError){window.open('/', '_self');}}
                        else if (result.dismiss === 'cancel') {

                        }
                    });
                }

                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            window.open('/billlist', '_self');
        }
        $('#deleteLineModal').modal('toggle');
        $('.modal-backdrop').css('display', 'none');
    }, delayTimeAfterSound);
    },
    'click .btnDelete': async function(event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let purchaseService = new PurchaseBoardService();
        setTimeout(function(){

        swal({
            title: 'Delete Journal Entry',
            text: "Are you sure you want to Delete this Journal Entry?",
            type: 'info',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.value) {
                $('.fullScreenSpin').css('display', 'inline-block');
                var url = FlowRouter.current().path;
                var getso_id = url.split('?id=');
                var currentInvoice = getso_id[getso_id.length - 1];
                var objDetails = '';
                if (getso_id[1]) {
                    currentInvoice = parseInt(currentInvoice);
                    var objDetails = {
                        type: "TJournalEntry",
                        fields: {
                            ID: currentInvoice,
                            Deleted: true
                        }
                    };

                    purchaseService.saveJournalEnrtry(objDetails).then(function(objDetails) {
                        FlowRouter.go('/journalentrylist?success=true');
                        $('.modal-backdrop').css('display', 'none');
                    }).catch(function(err) {
                        if (err === 'Error: "Unable to lock object: "') {
                            swal({
                                title: 'This Journal Entry has already been reconciled.',
                                text: 'Please delete the Bank Reconciliation in order to edit/delete this Journal Entry',
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'Try Again'
                            }).then((result) => {
                                if (result.value) {
                                    FlowRouter.go('/journalentrylist');
                                } else if (result.dismiss === 'cancel') {

                                }
                            });
                        } else {
                            swal({
                                title: 'Oooops...',
                                text: err,
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'Try Again'
                            }).then((result) => {
                                if (result.value) {if(err === checkResponseError){window.open('/', '_self');}}
                                else if (result.dismiss === 'cancel') {

                                }
                            });
                        }
                        $('.fullScreenSpin').css('display', 'none');
                    });
                } else {
                    FlowRouter.go('/journalentrylist?success=true');
                    $('.modal-backdrop').css('display', 'none');
                }
            } else {}

        });
    }, delayTimeAfterSound);
    },
    'click .btnDeleteLine': function(event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        setTimeout(function(){

        let taxcodeList = templateObject.taxraterecords.get();
        let selectLineID = $('#selectDeleteLineID').val();
        if ($('#tblJournalEntryLine tbody>tr').length > 1) {
            this.click;

            $('#' + selectLineID).closest('tr').remove();

            let $tblrows = $("#tblJournalEntryLine tbody tr");

            let subGrandTotal = 0;
            let taxGrandTotal = 0;

            let lineAmount = 0;
            let subGrandCreditTotal = 0;
            let subGrandDebitTotal = 0;
            $tblrows.each(function(index) {
                var $tblrow = $(this);
                var credit = $tblrow.find(".lineCreditEx").val() || Currency + '0';
                var debit = $tblrow.find(".lineDebitEx").val() || Currency + '0';
                var subTotalCredit = Number(credit.replace(/[^0-9.-]+/g, "")) || 0;
                var subTotalDebit = Number(debit.replace(/[^0-9.-]+/g, "")) || 0;
                if (!isNaN(subTotalCredit)) {
                    subGrandCreditTotal += isNaN(subTotalCredit) ? 0 : subTotalCredit;
                };
                if (!isNaN(subTotalDebit)) {
                    subGrandDebitTotal += isNaN(subTotalDebit) ? 0 : subTotalDebit;
                };

            });
            templateObject.totalCredit.set(utilityService.modifynegativeCurrencyFormat(subGrandCreditTotal));
            templateObject.totalDebit.set(utilityService.modifynegativeCurrencyFormat(subGrandDebitTotal));


        } else {
            this.click;

            $('#' + selectLineID + " .lineAccountName").val('');
            $('#' + selectLineID + " .lineAccountName").val('');

            $('#' + selectLineID + " .lineMemo").text('');
            $('#' + selectLineID + " .lineCreditEx").val('');
            $('#' + selectLineID + " .lineDebitEx").val('');



            templateObject.totalCredit.set(utilityService.modifynegativeCurrencyFormat('0.00'));
            templateObject.totalDebit.set(utilityService.modifynegativeCurrencyFormat('0.00'));

        }

        $('#deleteLineModal').modal('toggle');
    }, delayTimeAfterSound);
    },
    'click .btnSaveSettings': function(event) {
        playSaveAudio();
        setTimeout(function(){
            $('#myModal4').modal('toggle');
        }, delayTimeAfterSound);
    },
    'click .btnSave': function(event) {
        playSaveAudio();
        let templateObject = Template.instance();
        let purchaseService = new PurchaseBoardService();
        let uploadedItems = templateObject.uploadedFiles.get();
        setTimeout(function(){

        let department = $('#sltDepartment').val();
        let headMemo = $('#txaMemo').val();

        if (department === '') {
          swal({
              title: "Department has not been selected!",
              text: '',
              type: 'warning',
          }).then((result) => {
              if (result.value) {
                  $('#sltDepartment').focus();
              } else if (result.dismiss == 'cancel') {

              }
          });
            e.preventDefault();
        } else {

            $('.fullScreenSpin').css('display', 'inline-block');
            var splashLineArray = new Array();
            let lineItemsForm = [];
            let lineItemObjForm = {};
            let tdtaxCode = "";



            var transdateTime = new Date($("#dtTransDate").datepicker("getDate"));
            let transDate = transdateTime.getFullYear() + "-" + (transdateTime.getMonth() + 1) + "-" + transdateTime.getDate();
            let entryNo = $('#edtEnrtyNo').val();

            var url = FlowRouter.current().path;
            var getso_id = url.split('?id=');
            var currentBill = getso_id[getso_id.length - 1];

            var objDetails = '';
            if (getso_id[1]) {
                $('#tblJournalEntryLine > tbody > tr').each(function() {
                    var lineID = this.id;
                    let tdaccount = $('#' + lineID + " .lineAccountName").val();
                    let tdaccountNo = $('#' + lineID + " .lineAccountNo").text();
                    let tddmemo = $('#' + lineID + " .lineMemo").text();
                    let tdcreditex = $('#' + lineID + " .lineCreditInc").val();
                    let tddebitex = $('#' + lineID + " .lineDebitInc").val();
                    let erpLineID = $('#' + lineID + " .lineAccountName").attr('lineid');

                    tdtaxCode = $('#' + lineID + " .lineTaxCode").val() || loggedTaxCodePurchaseInc;


                    if (tdaccount != "") {

                        lineItemObjForm = {
                            type: "TJournalEntryLines",
                            fields: {
                                ID: parseInt(erpLineID) || 0,
                                AccountName: tdaccount || '',

                                Memo: tddmemo || headMemo,
                                TaxCode: tdtaxCode || '',
                                CreditAmountInc: parseFloat(tdcreditex.replace(/[^0-9.-]+/g, "")) || 0,

                                DebitAmountInc: parseFloat(tddebitex.replace(/[^0-9.-]+/g, "")) || 0,

                                DeptName: department || defaultDept,

                                EmployeeName: Session.get('mySessionEmployee')
                            }
                        };
                        lineItemsForm.push(lineItemObjForm);
                        splashLineArray.push(lineItemObjForm);
                    }
                });
                currentBill = parseInt(currentBill);
                objDetails = {
                    type: "TJournalEntry",
                    fields: {
                        ID: currentBill,
                        TransactionNo: entryNo,
                        Lines: splashLineArray,
                        TransactionDate: transDate,
                        Memo: headMemo
                    }
                };
            } else {
                $('#tblJournalEntryLine > tbody > tr').each(function() {
                    var lineID = this.id;
                    let tdaccount = $('#' + lineID + " .lineAccountName").val();
                    let tdaccountNo = $('#' + lineID + " .lineAccountNo").text();
                    let tddmemo = $('#' + lineID + " .lineMemo").text();
                    let tdcreditex = $('#' + lineID + " .lineCreditInc").val();
                    let tddebitex = $('#' + lineID + " .lineDebitInc").val();
                    let erpLineID = $('#' + lineID + " .lineAccountName").attr('lineid');

                    tdtaxCode = $('#' + lineID + " .lineTaxCode").val() || loggedTaxCodePurchaseInc;


                    if (tdaccount != "") {

                        lineItemObjForm = {
                            type: "TJournalEntryLines",
                            fields: {
                                ID: parseInt(erpLineID) || 0,
                                AccountName: tdaccount || '',

                                Memo: tddmemo || headMemo,
                                TaxCode: tdtaxCode || '',
                                CreditAmountInc: parseFloat(tdcreditex.replace(/[^0-9.-]+/g, "")) || 0,

                                DebitAmountInc: parseFloat(tddebitex.replace(/[^0-9.-]+/g, "")) || 0,

                                DeptName: department || defaultDept,

                                ClientName: '',
                                EmployeeName: Session.get('mySessionEmployee')
                            }
                        };
                        lineItemsForm.push(lineItemObjForm);
                        splashLineArray.push(lineItemObjForm);
                    }
                });
                objDetails = {
                    type: "TJournalEntry",
                    fields: {

                        TransactionNo: entryNo,
                        Lines: splashLineArray,
                        TransactionDate: transDate,
                        Memo: headMemo

                    }
                };
            }
            if(splashLineArray.length > 0){

            }else{
                swal('Account name has not been selected!', '', 'warning');
                $('.fullScreenSpin').css('display', 'none');
                event.preventDefault();
                return false;
            }
            purchaseService.saveJournalEnrtry(objDetails).then(function(objDetails) {
                FlowRouter.go('/journalentrylist?success=true');
                $('.modal-backdrop').css('display', 'none');


            }).catch(function(err) {
                if (err === 'Error: "Unable to lock object: "') {
                    swal({
                        title: 'This Journal Entry has already been reconciled.',
                        text: 'Please delete the Bank Reconciliation in order to edit/delete this Journal Entry',
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/journalentrylist');

                        } else if (result.dismiss === 'cancel') {

                        }
                    });
                } else {
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {if(err === checkResponseError){window.open('/', '_self');}}
                        else if (result.dismiss === 'cancel') {

                        }
                    });
                }

                $('.fullScreenSpin').css('display', 'none');
            });
        }
        }, delayTimeAfterSound);
    },
    'click .chkcolAccountName': function(event) {
        if ($(event.target).is(':checked')) {
            $('.colAccountName').css('display', 'table-cell');
            $('.colAccountName').css('padding', '.75rem');
            $('.colAccountName').css('vertical-align', 'top');
        } else {
            $('.colAccountName').css('display', 'none');
        }
    },
    'click .chkcolAccountNo': function(event) {
        if ($(event.target).is(':checked')) {
            $('.colAccountNo').css('display', 'table-cell');
            $('.colAccountNo').css('padding', '.75rem');
            $('.colAccountNo').css('vertical-align', 'top');
        } else {
            $('.colAccountNo').css('display', 'none');
        }
    },
    'click .chkcolMemo': function(event) {
        if ($(event.target).is(':checked')) {
            $('.colMemo').css('display', 'table-cell');
            $('.colMemo').css('padding', '.75rem');
            $('.colMemo').css('vertical-align', 'top');
        } else {
            $('.colMemo').css('display', 'none');
        }
    },
    'click .chkcolCreditEx': function(event) {
        if ($(event.target).is(':checked')) {
            $('.colCreditEx').css('display', 'table-cell');
            $('.colCreditEx').css('padding', '.75rem');
            $('.colCreditEx').css('vertical-align', 'top');
        } else {
            $('.colCreditEx').css('display', 'none');
        }
    },
    'click .chkcolDebitEx': function(event) {
        if ($(event.target).is(':checked')) {
            $('.colDebitEx').css('display', 'table-cell');
            $('.colDebitEx').css('padding', '.75rem');
            $('.colDebitEx').css('vertical-align', 'top');
        } else {
            $('.colDebitEx').css('display', 'none');
        }
    },
    'change .rngRangeAccountName': function(event) {

        let range = $(event.target).val();
        $(".spWidthAccountName").html(range + '%');
        $('.colAccountName').css('width', range + '%');

    },
    'change .rngRangeAccountNo': function(event) {

        let range = $(event.target).val();
        $(".spWidthAccountNo").html(range + '%');
        $('.colAccountNo').css('width', range + '%');

    },
    'change .rngRangeMemo': function(event) {

        let range = $(event.target).val();
        $(".spWidthMemo").html(range + '%');
        $('.colMemo').css('width', range + '%');

    },
    'change .rngRangeCreditEx': function(event) {

        let range = $(event.target).val();
        $(".spWidthCreditEx").html(range + '%');
        $('.colCreditEx').css('width', range + '%');

    },
    'change .rngRangeDebitEx': function(event) {

        let range = $(event.target).val();
        $(".spWidthDebitEx").html(range + '%');
        $('.colDebitEx').css('width', range + '%');

    },
    'blur .divcolumn': function(event) {
        let columData = $(event.target).html();
        let columHeaderUpdate = $(event.target).attr("valueupdate");
        $("" + columHeaderUpdate + "").html(columData);

    },
    'click .btnSaveGridSettings': function(event) {
        playSaveAudio();
        setTimeout(function(){
        let lineItems = [];

        $('.columnSettings').each(function(index) {
            var $tblrow = $(this);
            var colTitle = $tblrow.find(".divcolumn").text() || '';
            var colWidth = $tblrow.find(".custom-range").val() || 0;
            var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
            var colHidden = false;
            if ($tblrow.find(".custom-control-input").is(':checked')) {
                colHidden = false;
            } else {
                colHidden = true;
            }
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass
            }

            lineItems.push(lineItemObj);



        });


        var getcurrentCloudDetails = CloudUser.findOne({
            _id: Session.get('mycloudLogonID'),
            clouddatabaseID: Session.get('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({
                    userid: clientID,
                    PrefName: 'tblJournalEntryLine'
                });
                if (checkPrefDetails) {
                    CloudPreference.update({
                        _id: checkPrefDetails._id
                    }, {
                        $set: {
                            userid: clientID,
                            username: clientUsername,
                            useremail: clientEmail,
                            PrefGroup: 'purchaseform',
                            PrefName: 'tblJournalEntryLine',
                            published: true,
                            customFields: lineItems,
                            updatedAt: new Date()
                        }
                    }, function(err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');

                        } else {
                            $('#myModal2').modal('toggle');


                        }
                    });

                } else {
                    CloudPreference.insert({
                        userid: clientID,
                        username: clientUsername,
                        useremail: clientEmail,
                        PrefGroup: 'purchaseform',
                        PrefName: 'tblJournalEntryLine',
                        published: true,
                        customFields: lineItems,
                        createdAt: new Date()
                    }, function(err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');

                        } else {
                            $('#myModal2').modal('toggle');


                        }
                    });

                }
            }
        }
        $('#myModal2').modal('toggle');
        }, delayTimeAfterSound);
    },
    'click .btnResetGridSettings': function(event) {
        var getcurrentCloudDetails = CloudUser.findOne({
            _id: Session.get('mycloudLogonID'),
            clouddatabaseID: Session.get('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({
                    userid: clientID,
                    PrefName: 'tblJournalEntryLine'
                });
                if (checkPrefDetails) {
                    CloudPreference.remove({
                        _id: checkPrefDetails._id
                    }, function(err, idTag) {
                        if (err) {

                        } else {
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .btnResetSettings': function(event) {
        var getcurrentCloudDetails = CloudUser.findOne({
            _id: Session.get('mycloudLogonID'),
            clouddatabaseID: Session.get('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({
                    userid: clientID,
                    PrefName: 'journalentrycard'
                });
                if (checkPrefDetails) {
                    CloudPreference.remove({
                        _id: checkPrefDetails._id
                    }, function(err, idTag) {
                        if (err) {

                        } else {
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .new_attachment_btn': function(event) {
        $('#attachment-upload').trigger('click');

    },
    'change #attachment-upload': function(e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFiles.get();

        let myFiles = $('#attachment-upload')[0].files;
        let uploadData = utilityService.attachmentUpload(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCount.set(uploadData.totalAttachments);
    },
    'click .img_new_attachment_btn': function(event) {
        $('#img-attachment-upload').trigger('click');

    },
    'change #img-attachment-upload': function(e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFiles.get();

        let myFiles = $('#img-attachment-upload')[0].files;
        let uploadData = utilityService.attachmentUpload(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCount.set(uploadData.totalAttachments);
    },
    'click .remove-attachment': function(event, ui) {
        let tempObj = Template.instance();
        let attachmentID = parseInt(event.target.id.split('remove-attachment-')[1]);
        if (tempObj.$("#confirm-action-" + attachmentID).length) {
            tempObj.$("#confirm-action-" + attachmentID).remove();
        } else {
            let actionElement = '<div class="confirm-action" id="confirm-action-' + attachmentID + '"><a class="confirm-delete-attachment btn btn-default" id="delete-attachment-' + attachmentID + '">' +
                'Delete</a><button class="save-to-library btn btn-default">Remove & save to File Library</button></div>';
            tempObj.$('#attachment-name-' + attachmentID).append(actionElement);
        }
        tempObj.$("#new-attachment2-tooltip").show();

    },
    'click .file-name': function(event) {
        let attachmentID = parseInt(event.currentTarget.parentNode.id.split('attachment-name-')[1]);
        let templateObj = Template.instance();
        let uploadedFiles = templateObj.uploadedFiles.get();
        $('#myModalAttachment').modal('hide');
        let previewFile = {};
        let input = uploadedFiles[attachmentID].fields.Description;
        previewFile.link = 'data:' + input + ';base64,' + uploadedFiles[attachmentID].fields.Attachment;
        previewFile.name = uploadedFiles[attachmentID].fields.AttachmentName;
        let type = uploadedFiles[attachmentID].fields.Description;
        if (type === 'application/pdf') {
            previewFile.class = 'pdf-class';
        } else if (type === 'application/msword' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            previewFile.class = 'docx-class';
        } else if (type === 'application/vnd.ms-excel' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            previewFile.class = 'excel-class';
        } else if (type === 'application/vnd.ms-powerpoint' || type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            previewFile.class = 'ppt-class';
        } else if (type === 'application/vnd.oasis.opendocument.formula' || type === 'text/csv' || type === 'text/plain' || type === 'text/rtf') {
            previewFile.class = 'txt-class';
        } else if (type === 'application/zip' || type === 'application/rar' || type === 'application/x-zip-compressed' || type === 'application/x-zip,application/x-7z-compressed') {
            previewFile.class = 'zip-class';
        } else {
            previewFile.class = 'default-class';
        }

        if (type.split('/')[0] === 'image') {
            previewFile.image = true
        } else {
            previewFile.image = false
        }
        templateObj.uploadedFile.set(previewFile);

        $('#files_view').modal('show');

        return;
    },
    'click .confirm-delete-attachment': function(event, ui) {
        let tempObj = Template.instance();
        tempObj.$("#new-attachment2-tooltip").show();
        let attachmentID = parseInt(event.target.id.split('delete-attachment-')[1]);
        let uploadedArray = tempObj.uploadedFiles.get();
        let attachmentCount = tempObj.attachmentCount.get();
        $('#attachment-upload').val('');
        uploadedArray.splice(attachmentID, 1);
        tempObj.uploadedFiles.set(uploadedArray);
        attachmentCount--;
        if (attachmentCount === 0) {
            let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
            $('#file-display').html(elementToAdd);
        }
        tempObj.attachmentCount.set(attachmentCount);
        if (uploadedArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachment(uploadedArray);
        } else {
            $(".attchment-tooltip").show();
        }
    },
    'click .save-to-library': function(event, ui) {
      $('.confirm-delete-attachment').trigger('click');
    },
    'click #btn_Attachment': function() {
        let templateInstance = Template.instance();
        let uploadedFileArray = templateInstance.uploadedFiles.get();
        if (uploadedFileArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachment(uploadedFileArray);
        } else {
            $(".attchment-tooltip").show();
        }
    },
    'click .btnBack': function(event) {
        playCancelAudio();
        event.preventDefault();
        setTimeout(function(){
            history.back(1);
        }, delayTimeAfterSound);
    },

    'change #sltCurrency': (e, ui) => {
        if ($("#sltCurrency").val() && $("#sltCurrency").val() != defaultCurrencyCode) {
            $(".foreign-currency-js").css("display", "block");
            ui.isForeignEnabled.set(true);
        } else {
            $(".foreign-currency-js").css("display", "none");
            ui.isForeignEnabled.set(false);
        }
    },

    'change .exchange-rate-js': (e, ui) => {


        setTimeout(() => {
            const toConvert = document.querySelectorAll('.convert-to-foreign:not(.hiddenColumn)');
            const rate = $("#exchange_rate").val();


            toConvert.forEach((element) => {
                const mainClass = element.classList[0];
                const mainValueElement = document.querySelector(`#tblJournalEntryLine td.${mainClass}:not(.convert-to-foreign):not(.hiddenColumn)`);
               // const footerValueElement = document.querySelector(`#tblJournalEntryLine tfoot td.${mainClass}:not(.convert-to-foreign):not(.hiddenColumn)`);

                let value = mainValueElement.childElementCount > 0 ?
                    $(mainValueElement).find('input').val() :
                    mainValueElement.innerText;

                $(element).attr("value", convertToForeignAmount(value, rate, false));
                value = convertToForeignAmount(value, rate, getCurrentCurrencySymbol());
                $(element).text(value);

            })
        }, 500);

    }

});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});
