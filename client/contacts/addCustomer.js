import { ContactService } from "./contact-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { UtilityService } from "../utility-service";
import { CountryService } from '../js/country-service';
import { PaymentsService } from '../payments/payments-service';
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jQuery.print/jQuery.print.js';
import 'jquery-editable-select';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import { CRMService } from "../crm/crm-service";
import CachedHttp from "../lib/global/CachedHttp";
import erpObject from "../lib/global/erp-objects";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.customerscard.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar();
    templateObject.countryData = new ReactiveVar();
    templateObject.phoneCodeData = new ReactiveVar();
    templateObject.customerrecords = new ReactiveVar([]);
    templateObject.recentTrasactions = new ReactiveVar([]);
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.datatablerecordsjob = new ReactiveVar([]);
    templateObject.tableheaderrecordsjob = new ReactiveVar([]);
    templateObject.crmRecords = new ReactiveVar([]);
    templateObject.crmTableheaderRecords = new ReactiveVar([]);
    templateObject.preferredPaymentList = new ReactiveVar();
    templateObject.termsList = new ReactiveVar();
    templateObject.deliveryMethodList = new ReactiveVar();
    templateObject.clienttypeList = new ReactiveVar();
    templateObject.taxCodeList = new ReactiveVar();
    templateObject.taxraterecords = new ReactiveVar([]);
    templateObject.defaultsaletaxcode = new ReactiveVar();
    templateObject.defaultsaleterm = new ReactiveVar();
    templateObject.isJob = new ReactiveVar();
    templateObject.isJob.set(false);
    templateObject.isSameAddress = new ReactiveVar();
    templateObject.isSameAddress.set(false);
    templateObject.isJobSameAddress = new ReactiveVar();
    templateObject.isJobSameAddress.set(false);

    templateObject.transactionTableHeaderItems = new ReactiveVar([
        { classString: "th colSortDate hiddenColumn", itemLabel: "id", itemStyle: "" },
        { classString: "th colSaleDate", itemLabel: "Sale Date", itemStyle: "width:80px;" },
        { classString: "th colSalesNo", itemLabel: "Sales No.", itemStyle: "width:80px;" },
        { classString: "th colCustomer", itemLabel: "Customer", itemStyle: "width:200px;" },
        { classString: "th colAmountEx", itemLabel: "Amount (Ex)", itemStyle: "width:80px;" },
        { classString: "th colAmount", itemLabel: "Amount", itemStyle: "width:80px;" },
        { classString: "th colPaid", itemLabel: "Paid", itemStyle: "width:80px;" },
        { classString: "th colBalanceOutstanding", itemLabel: "Balance Outstanding", itemStyle: "width:80px;" },
        { classString: "th colType", itemLabel: "Type", itemStyle: "" },
        { classString: "th colSaleCustField1 hiddenColumn", itemLabel: "Custom Field 1", itemStyle: "" },
        { classString: "th colSaleCustField2 hiddenColumn", itemLabel: "Custom Field 2", itemStyle: "" },
        { classString: "th colEmployee hiddenColumn", itemLabel: "Employee", itemStyle: "" },
        { classString: "th colComments", itemLabel: "Comments", itemStyle: "" }
    ])
    templateObject.jobDetailTableHeaderItems = new ReactiveVar([
        { classString: "th colCompany", itemLabel: "Company", itemStyle: "width:200px;" },
        { classString: "th colPhone", itemLabel: "Phone", itemStyle: "width:95px;" },
        { classString: "th colARBalance", itemLabel: "AR Balance", itemStyle: "width:80px;" },
        { classString: "th colCreditBalance", itemLabel: "Credit Balance", itemStyle: "width:80px;" },
        { classString: "th colBalance", itemLabel: "Balance", itemStyle: "width:80px;" },
        { classString: "th colCreditLimit", itemLabel: "Credit Limit", itemStyle: "width:80px;" },
        { classString: "th colSalesOrderBalance", itemLabel: "Order Balance", itemStyle: "width:80px;" },
        { classString: "th colCountry", itemLabel: "Country", itemStyle: "width:100px;" },
        { classString: "th colEmail hiddenColumn", itemLabel: "Email", itemStyle: "" },
        { classString: "th colAccountNo hiddenColumn", itemLabel: "Account No", itemStyle: "" },
        { classString: "th colSaleCustField1 hiddenColumn", itemLabel: "Custom Field 1", itemStyle: "" },
        { classString: "th colSaleCustField2 hiddenColumn", itemLabel: "Custom Field 2", itemStyle: "" },
        { classString: "th colNotes", itemLabel: "Notes", itemStyle: "" },
    ])

    /* Attachments */
    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();
    templateObject.currentAttachLineID = new ReactiveVar();
    templateObject.uploadedFileJob = new ReactiveVar();
    templateObject.uploadedFilesJob = new ReactiveVar([]);
    templateObject.attachmentCountJob = new ReactiveVar();
    templateObject.uploadedFileJobNoPOP = new ReactiveVar();
    templateObject.uploadedFilesJobNoPOP = new ReactiveVar([]);
    templateObject.attachmentCountJobNoPOP = new ReactiveVar();
    templateObject.currentAttachLineIDJob = new ReactiveVar();
    templateObject.correspondences = new ReactiveVar([]);
});

Template.customerscard.onRendered(function () {

    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    const contactService = new ContactService();
    const countryService = new CountryService();
    const paymentService = new PaymentsService();
    const crmService = new CRMService();
    let countries = [];

    let preferredPayments = [];
    let terms = [];
    let deliveryMethods = [];
    let clientType = [];
    let taxCodes = [];

    const splashArrayTaxRateList = [];
    const taxCodesList = [];

    let currentId = FlowRouter.current().queryParams;
    let customerID = '';
    let totAmount = 0;
    let totAmountOverDue = 0;

    const dataTableList = [];
    const dataTableListJob = [];
    const tableHeaderList = [];

    const tableHeaderListJob = [];

    let salestaxcode = '';
    // let currenttablename = templateObject.data||"";
    setTimeout(function () {
        Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'defaulttax', function (error, result) {
            if (error) {
                salestaxcode = loggedTaxCodeSalesInc;
                templateObject.defaultsaletaxcode.set(salestaxcode);
            } else {
                if (result) {
                    salestaxcode = result.customFields[1].taxvalue || loggedTaxCodeSalesInc;
                    templateObject.defaultsaletaxcode.set(salestaxcode);
                }
            }
        });
    }, 500);

    templateObject.getOverviewARData = function (CustomerName, CustomerID) {
        // getVS1Data('TARReport1').then(function (dataObject) {
        //     if (dataObject.length == 0) {
        //         paymentService.getOverviewARDetailsCust(CustomerID).then(function (data) {
        //             setOverviewARDetails(data, CustomerName);
        //         });
        //     } else {
        //         let data = JSON.parse(dataObject[0].data);
        //         setOverviewARDetails(data, CustomerName);
        //     }
        // }).catch(function (err) {
        //     paymentService.getOverviewARDetailsCust(CustomerID).then(function (data) {
        //         setOverviewARDetails(data, CustomerName);
        //     });
        // });
    };
    function setOverviewARDetails(data, CustomerName) {
        let itemsAwaitingPaymentcount = [];
        let itemsOverduePaymentcount = [];
        let dataListAwaitingCust = {};

        let customerawaitingpaymentCount = '';
        for (let i = 0; i < data.tarreport.length; i++) {
            // dataListAwaitingCust = {
            // id: data.tinvoice[i].Id || '',
            // };
            if ((data.tarreport[i].AmountDue !== 0) && (CustomerName.replace(/\s/g, '') == data.tarreport[i].Printname.replace(/\s/g, ''))) {
                // itemsAwaitingPaymentcount.push(dataListAwaitingCust);
                totAmount += Number(data.tarreport[i].AmountDue);
                let date = new Date(data.tarreport[i].DueDate);
                let totOverdueLine = Number(data.tarreport[i].AmountDue) - Number(data.tarreport[i].Current) || 0;
                //if (date < new Date()) {
                // itemsOverduePaymentcount.push(dataListAwaitingCust);
                totAmountOverDue += totOverdueLine;
                //}
            }
        }
        $('.custAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
        $('.custOverdueAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountOverDue));
    }

    setTimeout(function () {

        $("#dtAsOf").datepicker({
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
    }, 100);

    function MakeNegative() {
        $('td').each(function () {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
    }

    templateObject.getReferenceLetters = () => {
        getVS1Data('TCorrespondence').then(data => {
            if (data.length == 0) {
                sideBarService.getCorrespondences().then(dataObject => {
                    addVS1Data('TCorrespondence', JSON.stringify(dataObject))
                    let tempArray = [];
                    if (dataObject.tcorrespondence.length > 0) {
                        let temp = dataObject.tcorrespondence.filter(item => {
                            return item.fields.EmployeeId == Session.get('mySessionEmployeeLoggedID')
                        })

                        for (let i = 0; i < temp.length; i++) {
                            for (let j = i + 1; j < temp.length; j++) {
                                if (temp[i].fields.Ref_Type == temp[j].fields.Ref_Type) {
                                    temp[j].fields.dup = true
                                }
                            }
                        }

                        temp.map(item => {
                            if (item.fields.EmployeeId == Session.get('mySessionEmployeeLoggedID') && item.fields.dup != true) {
                                tempArray.push(item.fields)
                            }
                        })
                    }
                    templateObject.correspondences.set(tempArray)
                })
            } else {
                let dataObj = JSON.parse(data[0].data);
                let tempArray = [];
                if (dataObj.tcorrespondence.length > 0) {
                    let temp = dataObj.tcorrespondence.filter(item => {
                        return item.fields.EmployeeId == Session.get('mySessionEmployeeLoggedID')
                    })

                    for (let i = 0; i < temp.length; i++) {
                        for (let j = i + 1; j < temp.length; j++) {
                            if (temp[i].fields.Ref_Type == temp[j].fields.Ref_Type) {
                                temp[j].fields.dup = true
                            }
                        }
                    }
                    temp.map(item => {
                        if (item.fields.EmployeeId == Session.get('mySessionEmployeeLoggedID') && item.fields.dup != true) {
                            tempArray.push(item.fields)
                        }
                    })
                }
                templateObject.correspondences.set(tempArray)
            }
        }).catch(function () {
            sideBarService.getCorrespondences().then(dataObject => {
                addVS1Data('TCorrespondence', JSON.stringify(dataObject));
                let tempArray = [];
                if (dataObject.tcorrespondence.length > 0) {
                    let temp = dataObject.tcorrespondence.filter(item => {
                        return item.fields.EmployeeId == Session.get('mySessionEmployeeLoggedID')
                    })

                    for (let i = 0; i < temp.length; i++) {
                        for (let j = i + 1; j < temp.length; j++) {
                            if (temp[i].fields.Ref_Type == temp[j].fields.Ref_Type) {
                                temp[j].fields.dup = true
                            }
                        }
                    }
                    temp.map(item => {
                        if (item.fields.EmployeeId == Session.get('mySessionEmployeeLoggedID') && item.fields.dup != true) {
                            tempArray.push(item.fields)
                        }
                    })
                }
                templateObject.correspondences.set(tempArray)
            })
        })
    }

    templateObject.getAllJobsIds = function () {
        contactService.getJobIds().then(function (data) {
            let latestJobId;
            if (data.tjobvs1.length) {
                latestJobId = data.tjobvs1[data.tjobvs1.length - 1].Id;
            } else {
                latestJobId = 0;
            }
            let newJobId = (latestJobId + 1);
            $('#addNewJobModal #edtJobNumber').val(newJobId);
        }).catch(function (err) {
            $('#addNewJobModal #edtJobNumber').val('1');
        });
    };

    templateObject.getAllProductRecentTransactions = function (customerName, customerID) {
        getVS1Data('TTransactionListReport1').then(function (dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getTTransactionListReport(customerID).then(function (data) {
                    setAllProductRecentTransactions(data, customerName);
                }).catch(function (err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display', 'none');
                    // Meteor._reload.reload();
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setAllProductRecentTransactions(data, customerName);
            }
        }).catch(function (err) {
            sideBarService.getTTransactionListReport(customerID).then(function (data) {
                setAllProductRecentTransactions(data, customerName);
            }).catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
                // Meteor._reload.reload();
            });
        });
    };
    function setAllProductRecentTransactions(data, customerName) {
        let lineItems = [];
        let lineItemObj = {};
        let transID = "";
        // addVS1Data('TTransactionListReport', JSON.stringify(data)).then(function (datareturn) {
        //
        // }).catch(function (err) {
        //
        // });
        for (let i = 0; i < data.ttransactionlistreport.length; i++) {
            let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.ttransactionlistreport[i].DEBITSEX) || 0.00;
            // let totalTax = utilityService.modifynegativeCurrencyFormat(data.ttransactionlistreport[i].TotalTax) || 0.00;
            // Currency+''+data.ttransactionlistreport[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
            let totalAmount = utilityService.modifynegativeCurrencyFormat(data.ttransactionlistreport[i].DEBITSINC) || 0.00;
            let totalPaid = utilityService.modifynegativeCurrencyFormat(data.ttransactionlistreport[i].CREDITSEX) || 0.00;
            let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.ttransactionlistreport[i].EXDiff) || 0.00;
            if (data.ttransactionlistreport[i].TYPE == "Bill") {
                transID = data.ttransactionlistreport[i].PURCHASEORDERID;
            } else if (data.ttransactionlistreport[i].TYPE == "Credit") {
                transID = data.ttransactionlistreport[i].PURCHASEORDERID;
            } else if (data.ttransactionlistreport[i].TYPE == "PO") {
                transID = data.ttransactionlistreport[i].PURCHASEORDERID;
            } else if (data.ttransactionlistreport[i].TYPE == "Supplier Payment") {
                transID = data.ttransactionlistreport[i].PAYMENTID;
            } else if (data.ttransactionlistreport[i].TYPE == "Cheque") {
                transID = data.ttransactionlistreport[i].PURCHASEORDERID;
            } else if (data.ttransactionlistreport[i].TYPE == "Journal Entry") {
                transID = data.ttransactionlistreport[i].SALEID;
            } else if (data.ttransactionlistreport[i].TYPE == "Customer Payment") {
                transID = data.ttransactionlistreport[i].PAYMENTID;
            } else if (data.ttransactionlistreport[i].TYPE == "Refund") {
                transID = data.ttransactionlistreport[i].SALEID;
            } else if (data.ttransactionlistreport[i].TYPE == "Invoice") {
                transID = data.ttransactionlistreport[i].SALEID;
            } else if (data.ttransactionlistreport[i].TYPE == "UnInvoiced SO") {
                transID = data.ttransactionlistreport[i].SALEID;
            } else if (data.ttransactionlistreport[i].TYPE == "Quote") {
                transID = data.ttransactionlistreport[i].SALEID;
            }
            const dataList = {
                id: transID || '',
                transid: data.ttransactionlistreport[i].transID || '',
                employee: data.ttransactionlistreport[i].EmployeeName || '',
                sortdate: data.ttransactionlistreport[i].DATE !== '' ? moment(data.ttransactionlistreport[i].DATE).format("YYYY/MM/DD") : data.ttransactionlistreport[i].DATE,
                saledate: data.ttransactionlistreport[i].DATE !== '' ? moment(data.ttransactionlistreport[i].DATE).format("DD/MM/YYYY") : data.ttransactionlistreport[i].DATE,
                customername: data.ttransactionlistreport[i].CLIENTNAME || '',
                totalamountex: totalAmountEx || 0.00,
                // totaltax: totalTax || 0.00,
                totalamount: totalAmount || 0.00,
                totalpaid: totalPaid || 0.00,
                totaloustanding: totalOutstanding || 0.00,
                type: data.ttransactionlistreport[i].TYPE || '',
                custfield1: '',
                custfield2: '',
                comments: data.ttransactionlistreport[i].Memo || '',
            };
            if (data.ttransactionlistreport[i].CLIENTNAME == customerName) {
                dataTableList.push(dataList);
            }
        }

        templateObject.datatablerecords.set(dataTableList);

        if (templateObject.datatablerecords.get()) {
            Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblTransactionlist', function (error, result) {
                if (error) {

                } else {
                    if (result) {
                        for (let i = 0; i < result.customFields.length; i++) {
                            let customcolumn = result.customFields;
                            let columData = customcolumn[i].label;
                            let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                            let hiddenColumn = customcolumn[i].hidden;
                            let columnClass = columHeaderUpdate.split('.')[1];
                            let columnWidth = customcolumn[i].width;
                            let columnindex = customcolumn[i].index + 1;

                            if (hiddenColumn == true) {
                                $("." + columnClass + "").addClass('hiddenColumn');
                                $("." + columnClass + "").removeClass('showColumn');
                            } else if (hiddenColumn == false) {
                                $("." + columnClass + "").removeClass('hiddenColumn');
                                $("." + columnClass + "").addClass('showColumn');
                            }
                        }
                    }
                }
            });
            setTimeout(function () {
                MakeNegative();
                $("#dtAsOf").datepicker({
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
            }, 100);
        }
        // $('.custAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
        // $('.custOverdueAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountOverDue));
        $('.fullScreenSpin').css('display', 'none');
        setTimeout(function () {
            //$.fn.dataTable.moment('DD/MM/YY');
            $('#tblTransactionlist').DataTable({
                // dom: 'lBfrtip',
                columnDefs: [
                    { type: 'date', targets: 0 }
                ],
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [
                    {
                        extend: 'excelHtml5',
                        text: '',
                        download: 'open',
                        className: "btntabletocsv hiddenColumn",
                        filename: "Sales Transaction List - " + moment().format(),
                        orientation: 'portrait',
                        exportOptions: {
                            columns: ':visible'
                        }
                    }, {
                        extend: 'print',
                        download: 'open',
                        className: "btntabletopdf hiddenColumn",
                        text: '',
                        title: 'Sales Transaction',
                        filename: "Sales Transaction List - " + moment().format(),
                        exportOptions: {
                            columns: ':visible',
                            stripHtml: false
                        }
                    }],
                select: true,
                destroy: true,
                colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [[initialDatatableLoad, -1], [initialDatatableLoad, "All"]],
                info: true,
                responsive: true,
                "order": [[0, "desc"], [2, "desc"]],
                action: function () {
                    $('#tblTransactionlist').DataTable().ajax.reload();
                },
                "fnDrawCallback": function (oSettings) {
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                },
                "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                    let countTableData = data.Params.Count || 0; //get count from API data

                    return 'Showing ' + iStart + " to " + iEnd + " of " + countTableData;
                }

            }).on('page', function () {
                setTimeout(function () {
                    MakeNegative();
                }, 100);
                let draftRecord = templateObject.datatablerecords.get();
                templateObject.datatablerecords.set(draftRecord);
            }).on('column-reorder', function () {

            });

            $('.fullScreenSpin').css('display', 'none');
        }, 0);

        const columns = $('#tblTransactionlist th');
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function (i, v) {
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

        $('.tblTransactionlist tbody').on('click', 'tr', function () {
            const listData = $(this).closest('tr').attr('id');
            const transactiontype = $(event.target).closest("tr").find(".colType").text();
            if ((listData) && (transactiontype)) {
                if (transactiontype == 'Bill') {
                    FlowRouter.go('/billcard?id=' + listData + '&trans=' + data.Params.ClientID);
                } else if (transactiontype == 'Credit') {
                    FlowRouter.go('/creditcard?id=' + listData + '&trans=' + data.Params.ClientID);
                } else if (transactiontype == 'PO') {
                    FlowRouter.go('/purchaseordercard?id=' + listData + '&trans=' + data.Params.ClientID);
                } else if (transactiontype == 'Supplier Payment') {
                    FlowRouter.go('/supplierpaymentcard?id=' + listData + '&trans=' + data.Params.ClientID);
                } else if (transactiontype == 'Customer Payment') {
                    FlowRouter.go('/paymentcard?id=' + listData + '&trans=' + data.Params.ClientID);
                } else if (transactiontype == 'Cheque') {
                    FlowRouter.go('/chequecard?id=' + listData + '&trans=' + data.Params.ClientID);
                } else if (transactiontype == 'Journal Entry') {
                    FlowRouter.go('/journalentrycard?id=' + listData + '&trans=' + data.Params.ClientID);
                } else if (transactiontype == 'Refund') {
                    FlowRouter.go('/invoicecard?id=' + listData + '&trans=' + data.Params.ClientID);
                } else if (transactiontype == 'Invoice') {
                    FlowRouter.go('/invoicecard?id=' + listData + '&trans=' + data.Params.ClientID);
                } else if (transactiontype == 'Sales Order' || transactiontype == 'SO') {
                    FlowRouter.go('/salesordercard?id=' + listData + '&trans=' + data.Params.ClientID);
                } else if (transactiontype == 'Quote') {
                    FlowRouter.go('/quotecard?id=' + listData + '&trans=' + data.Params.ClientID);
                } else if (transactiontype == 'UnInvoiced SO') {
                    FlowRouter.go('/salesordercard?id=' + listData + '&trans=' + data.Params.ClientID);
                }
            }
        });
    }

    templateObject.getAllCustomerJobs = function (customerName) {
        getVS1Data('TJobVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                contactService.getAllJobListByCustomer(customerName).then(function (data) {
                    setAllJobListByCustomer(data, customerName);
                }).catch(function (err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display', 'none');
                    // Meteor._reload.reload();
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                // let useData = data.tjobvs1;
                setAllJobListByCustomer(data, customerName);
            }
        }).catch(function (err) {
            contactService.getAllJobListByCustomer(customerName).then(function (data) {
                setAllJobListByCustomer(data, customerName);
            }).catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
                // Meteor._reload.reload();
            });
        });

    };
    function setAllJobListByCustomer(data, customerName) {
        let lineItemsJob = [];
        let lineItemObjJob = {};
        for (let i = 0; i < data.tjob.length; i++) {
            let arBalance = utilityService.modifynegativeCurrencyFormat(data.tjob[i].ARBalance) || 0.00;
            let creditBalance = utilityService.modifynegativeCurrencyFormat(data.tjob[i].CreditBalance) || 0.00;
            let balance = utilityService.modifynegativeCurrencyFormat(data.tjob[i].Balance) || 0.00;
            let creditLimit = utilityService.modifynegativeCurrencyFormat(data.tjob[i].CreditLimit) || 0.00;
            let salesOrderBalance = utilityService.modifynegativeCurrencyFormat(data.tjob[i].SalesOrderBalance) || 0.00;
            const dataListJob = {
                id: data.tjob[i].Id || '',
                company: data.tjob[i].ClientName || '',
                contactname: data.tjob[i].ContactName || '',
                phone: data.tjob[i].Phone || '',
                arbalance: arBalance || 0.00,
                creditbalance: creditBalance || 0.00,
                balance: balance || 0.00,
                creditlimit: creditLimit || 0.00,
                salesorderbalance: salesOrderBalance || 0.00,
                email: data.tjob[i].Email || '',
                accountno: data.tjob[i].AccountNo || '',
                clientno: data.tjob[i].ClientNo || '',
                jobtitle: data.tjob[i].JobTitle || '',
                notes: data.tjob[i].Notes || '',
                country: data.tjob[i].Country || LoggedCountry
            };
            if (customerName == data.tjob[i].ParentCustomerName) {
                dataTableListJob.push(dataListJob);
            }
        }
        templateObject.datatablerecordsjob.set(dataTableListJob);

        if (templateObject.datatablerecordsjob.get()) {
            Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblJoblist', function (error, result) {
                if (error) {

                } else {
                    if (result) {
                        for (let i = 0; i < result.customFields.length; i++) {
                            let customcolumn = result.customFields;
                            let columData = customcolumn[i].label;
                            let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                            let hiddenColumn = customcolumn[i].hidden;
                            let columnClass = columHeaderUpdate.split('.')[1];
                            let columnWidth = customcolumn[i].width;
                            let columnindex = customcolumn[i].index + 1;

                            if (hiddenColumn == true) {
                                $("." + columnClass + "").addClass('hiddenColumn');
                                $("." + columnClass + "").removeClass('showColumn');
                            } else if (hiddenColumn == false) {
                                $("." + columnClass + "").removeClass('hiddenColumn');
                                $("." + columnClass + "").addClass('showColumn');
                            }

                        }
                    }

                }
            });
            setTimeout(function () {
                MakeNegative();
                $("#dtAsOf").datepicker({
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
            }, 100);
        }

        $('.fullScreenSpin').css('display', 'none');
        setTimeout(function () {
            //$.fn.dataTable.moment('DD/MM/YY');
            $('#tblJoblist').DataTable({
                // dom: 'lBfrtip',
                columnDefs: [
                    { type: 'date', targets: 0 }
                ],
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [
                    {
                        extend: 'excelHtml5',
                        text: '',
                        download: 'open',
                        className: "btntabletocsv hiddenColumn",
                        filename: "Job Transaction List - " + moment().format(),
                        orientation: 'portrait',
                        exportOptions: {
                            columns: ':visible'
                        }
                    }, {
                        extend: 'print',
                        download: 'open',
                        className: "btntabletopdf hiddenColumn",
                        text: '',
                        title: 'Job Transaction',
                        filename: "Job Transaction List - " + moment().format(),
                        exportOptions: {
                            columns: ':visible',
                            stripHtml: false
                        }
                    }],
                select: true,
                destroy: true,
                colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [[initialDatatableLoad, -1], [initialDatatableLoad, "All"]],
                info: true,
                responsive: true,
                "order": [[0, "asc"]],
                action: function () {
                    $('#tblJoblist').DataTable().ajax.reload();
                },
                "fnDrawCallback": function (oSettings) {
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                },

            }).on('page', function () {
                setTimeout(function () {
                    MakeNegative();
                }, 100);

            }).on('column-reorder', function () {

            });

            $('.fullScreenSpin').css('display', 'none');
        }, 0);

        const columns = $('#tblJoblist th');
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function (i, v) {
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
            tableHeaderListJob.push(datatablerecordObj);
        });
        templateObject.tableheaderrecordsjob.set(tableHeaderListJob);
        $('div.dataTables_filter input').addClass('form-control form-control-sm');
        $('#tblJoblist tbody').on('click', 'tr', function () {
            const listData = $(this).closest('tr').attr('id');
            if (listData) {
                //window.open('/invoicecard?id=' + listData,'_self');
            }
        });
    }

    templateObject.getAllCrm = function (customerName) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let employeeID = Session.get("mySessionEmployeeLoggedID");
        var url = FlowRouter.current().path;
        if (url.includes("/employeescard")) {
            url = new URL(window.location.href);
            employeeID = url.searchParams.get("id");
        }
        let dataTableList = [];

        // async function getTask() {
        crmService.getAllTasksByContactName(customerName).then(async function (data) {
            if (data.tprojecttasks.length > 0) {
                for (let i = 0; i < data.tprojecttasks.length; i++) {
                    let taskLabel = data.tprojecttasks[i].fields.TaskLabel;
                    let taskLabelArray = [];
                    if (taskLabel !== null) {
                        if (taskLabel.length === undefined || taskLabel.length === 0) {
                            taskLabelArray.push(taskLabel.fields);
                        } else {
                            for (let j = 0; j < taskLabel.length; j++) {
                                taskLabelArray.push(taskLabel[j].fields);
                            }
                        }
                    }
                    let taskDescription = data.tprojecttasks[i].fields.TaskDescription || '';
                    taskDescription = taskDescription.length < 50 ? taskDescription : taskDescription.substring(0, 49) + "...";
                    const dataList = {
                        id: data.tprojecttasks[i].fields.ID || 0,
                        priority: data.tprojecttasks[i].fields.priority || 0,
                        date: data.tprojecttasks[i].fields.due_date !== '' ? moment(data.tprojecttasks[i].fields.due_date).format("DD/MM/YYYY") : '',
                        taskName: 'Task',
                        projectID: data.tprojecttasks[i].fields.ProjectID || '',
                        projectName: data.tprojecttasks[i].fields.ProjectName || '',
                        description: taskDescription,
                        labels: taskLabelArray,
                        category: 'task'
                    };
                    dataTableList.push(dataList);
                }
            }
            await getAppointments();
        }).catch(function (err) {
            getAppointments();
        })

        async function getAppointments() {
            crmService.getAllAppointments(customerName).then(async function (dataObj) {
                if (dataObj.tappointmentex.length > 0) {
                    dataObj.tappointmentex.map(data => {
                        let obj = {
                            id: data.fields.ID,
                            priority: 0,
                            date: data.fields.StartTime !== '' ? moment(data.fields.StartTime).format("DD/MM/YYYY") : '',
                            taskName: 'Appointment',
                            projectID: data.fields.ProjectID || '',
                            projectName: '',
                            description: '',
                            labels: '',
                            category: 'appointment'

                        }

                        dataTableList.push(obj);
                    })
                }
                await getEmails();
            }).catch(function (error) {
                getEmails();
            })
        }

        async function getEmails() {
            sideBarService.getCorrespondences().then(dataReturn => {
                let totalCorrespondences = dataReturn.tcorrespondence;
                totalCorrespondences = totalCorrespondences.filter(item => {
                    return item.fields.MessageTo == $('#edtCustomerEmail').val()
                })
                if (totalCorrespondences.length > 0 && $('#edtCustomerEmail').val() != '') {
                    totalCorrespondences.map(item => {
                        let labels = [];
                        labels.push(item.fields.Ref_Type)
                        let obj = {
                            id: item.fields.MessageId ? parseInt(item.fields.MessageId) : 999999,
                            priority: 0,
                            date: item.fields.Ref_Date !== '' ? moment(item.fields.Ref_Date).format('DD/MM/YYYY') : '',
                            taskName: 'Email',
                            projectID: '',
                            projectName: '',
                            description: '',
                            labels: '',
                            category: 'email'
                        }
                        dataTableList.push(obj)
                    })
                }
                try {
                    dataTableList.sort((a, b) => {
                        new Date(a.date) - new Date(b.date)
                    })
                    templateObject.crmRecords.set(dataTableList);
                } catch (error) {
                }
                setCrmProjectTasks()

            })
                .catch((err) => {
                    templateObject.crmRecords.set(dataTableList);
                    setCrmProjectTasks()
                    $('.fullScreenSpin').css('display', 'none');
                })
        }

        // await getTask();
        // await getAppointments();
        // await getEmails();

    };
    function setCrmProjectTasks(data, customerName) {
        let tableHeaderList = [];

        if (templateObject.crmRecords.get()) {
            setTimeout(function () {
                MakeNegative();
                $("#dtAsOf").datepicker({
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
            }, 100);
        }
        $('.fullScreenSpin').css('display', 'none');
        setTimeout(function () {
            //$.fn.dataTable.moment('DD/MM/YY');
            $('#tblCrmList').DataTable({
                // dom: 'lBfrtip',
                columnDefs: [
                    { type: 'date', targets: 0 }
                ],
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [
                    {
                        extend: 'excelHtml5',
                        text: '',
                        download: 'open',
                        className: "btntabletocsv hiddenColumn",
                        filename: "Customer CRM List - " + moment().format(),
                        orientation: 'portrait',
                        exportOptions: {
                            columns: ':visible'
                        }
                    }, {
                        extend: 'print',
                        download: 'open',
                        className: "btntabletopdf hiddenColumn",
                        text: '',
                        title: 'Customer CRM',
                        filename: "Customer CRM List - " + moment().format(),
                        exportOptions: {
                            columns: ':visible',
                            stripHtml: false
                        }
                    }],
                select: true,
                destroy: true,
                colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [[initialDatatableLoad, -1], [initialDatatableLoad, "All"]],
                info: true,
                responsive: true,
                "order": [[0, "desc"], [2, "desc"]],
                action: function () {
                    $('#tblCrmList').DataTable().ajax.reload();
                },
                "fnDrawCallback": function (oSettings) {
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                },

            }).on('page', function () {
                setTimeout(function () {
                    MakeNegative();
                }, 100);
                let draftRecord = templateObject.crmRecords.get();
                templateObject.crmRecords.set(draftRecord);
            }).on('column-reorder', function () {

            });

            $('.fullScreenSpin').css('display', 'none');
        }, 0);

        const columns = $('#tblCrmList th');
        let sWidth = "";
        let columVisible = false;
        $.each(columns, function (i, v) {
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
        templateObject.crmTableheaderRecords.set(tableHeaderList);
        $('div.dataTables_filter input').addClass('form-control form-control-sm');
    }

    //templateObject.getAllProductRecentTransactions();

    templateObject.getCountryData = function () {
        getVS1Data('TCountries').then(function (dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getCountry().then((data) => {
                    for (let i = 0; i < data.tcountries.length; i++) {
                        countries.push(data.tcountries[i].Country)
                    }
                    countries.sort((a, b) => a.localeCompare(b));
                    templateObject.countryData.set(countries);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcountries;
                for (let i = 0; i < useData.length; i++) {
                    countries.push(useData[i].Country)
                }
                countries.sort((a, b) => a.localeCompare(b));
                templateObject.countryData.set(countries);

            }
        }).catch(function (err) {
            sideBarService.getCountry().then((data) => {
                for (let i = 0; i < data.tcountries.length; i++) {
                    countries.push(data.tcountries[i].Country)
                }
                countries.sort((a, b) => a.localeCompare(b));
                templateObject.countryData.set(countries);
            });
        });
        let countriesPhone = [];
        let dataPhone = countryService.getCountryJeyhun();
        templateObject.phoneCodeData.set(dataPhone);
    };
    templateObject.getCountryData();

    templateObject.getPreferredPaymentList = function () {
        getVS1Data('TPaymentMethod').then(function (dataObject) {
            if (dataObject.length == 0) {
                contactService.getPaymentMethodDataVS1().then((data) => {
                    setPreferredPaymentList(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setPreferredPaymentList(data);
            }
        }).catch(function (err) {
            contactService.getPaymentMethodDataVS1().then((data) => {
                setPreferredPaymentList(data);
            });
        });
    };
    function setPreferredPaymentList(data) {
        for (let i = 0; i < data.tpaymentmethodvs1.length; i++) {
            preferredPayments.push(data.tpaymentmethodvs1[i].fields.PaymentMethodName)
        }
        preferredPayments = _.sortBy(preferredPayments);
        templateObject.preferredPaymentList.set(preferredPayments);
    }
    templateObject.getPreferredPaymentList();

    templateObject.getTermsList = function () {
        getVS1Data('TTermsVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                contactService.getTermDataVS1().then((data) => {
                    setTermsDataVS1(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setTermsDataVS1(data);
            }
        }).catch(function (err) {
            contactService.getTermDataVS1().then((data) => {
                setTermsDataVS1(data);
            });
        });
    };
    function setTermsDataVS1(data) {
        for (let i = 0; i < data.ttermsvs1.length; i++) {
            terms.push(data.ttermsvs1[i].TermsName);
            if (data.ttermsvs1[i].isSalesdefault == true) {
                templateObject.defaultsaleterm.set(data.ttermsvs1[i].TermsName);
                if (JSON.stringify(currentId) != '{}') {
                    if (currentId.id == "undefined") {
                        $('#sltTerms').val(data.ttermsvs1[i].TermsName);
                    }
                } else {
                    $('#sltTerms').val(data.ttermsvs1[i].TermsName);
                }
                Session.setPersistent('ERPTermsSales', data.ttermsvs1[i].TermsName || "COD");
            }
        }
        terms = _.sortBy(terms);
        templateObject.termsList.set(terms);
    }
    templateObject.getTermsList();

    templateObject.getDeliveryMethodList = function () {
        getVS1Data('TShippingMethod').then(function (dataObject) {
            if (dataObject.length == 0) {
                contactService.getShippingMethodData().then((data) => {
                    setShippingMethodData(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setShippingMethodData(data);
            }
        }).catch(function (err) {
            contactService.getShippingMethodData().then((data) => {
                setShippingMethodData(data);
            });
        });
    };
    function setShippingMethodData(data) {
        for (let i = 0; i < data.tshippingmethod.length; i++) {
            deliveryMethods.push(data.tshippingmethod[i].ShippingMethod)
        }
        deliveryMethods = _.sortBy(deliveryMethods);
        templateObject.deliveryMethodList.set(deliveryMethods);
    }
    templateObject.getDeliveryMethodList();

    templateObject.getClientTypeData = function () {
        getVS1Data('TClientType').then(function (dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getClientTypeData().then((data) => {
                    setClientTypeList(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setClientTypeList(data);
                //$('.customerTypeSelect option:first').prop('selected', false);
                $(".customerTypeSelect").attr('selectedIndex', 0);

            }
        }).catch(function (err) {
            sideBarService.getClientTypeData().then((data) => {
                setClientTypeList(data);
            });
        });

    };
    function setClientTypeList(data) {
        for (let i = 0; i < data.tclienttype.length; i++) {
            clientType.push(data.tclienttype[i].fields.TypeName)
        }
        clientType = _.sortBy(clientType);
        templateObject.clienttypeList.set(clientType);
    }
    // templateObject.getClientTypeData();

    templateObject.getTaxCodesList = function () {
        getVS1Data('TTaxcodeVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                contactService.getTaxCodesVS1().then(function (data) {
                    setTaxCodesList(data);
                })
            } else {
                let data = JSON.parse(dataObject[0].data);
                setTaxCodesList(data);
            }
        }).catch(function (err) {
            contactService.getTaxCodesVS1().then(function (data) {
                setTaxCodesList(data);
            })
        });
    };
    function setTaxCodesList(data) {
        for (let i = 0; i < data.ttaxcodevs1.length; i++) {
            let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
            const dataList = [
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
        templateObject.taxCodeList.set(taxCodesList);
        if (splashArrayTaxRateList) {
            $('#tblTaxRate').DataTable({
                data: splashArrayTaxRateList,
                sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                columnDefs: [{
                    orderable: false,
                    targets: 0
                }, {
                    className: "taxName",
                    "targets": [1]
                }, {
                    className: "taxDesc",
                    "targets": [2]
                }, {
                    className: "taxRate text-right",
                    "targets": [3]
                }
                ],
                select: true,
                destroy: true,
                colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [[initialDatatableLoad, -1], [initialDatatableLoad, "All"]],
                info: true,
                responsive: true,
                "fnDrawCallback": function (oSettings) {
                    // $('.dataTables_paginate').css('display', 'none');
                },
                "fnInitComplete": function () {
                    $("<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblTaxRate_filter");
                    $("<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblTaxRate_filter");
                }
            });
        }
    }
    templateObject.getTaxCodesList();

    //$('#sltCustomerType').append('<option value="' + lineItemObj.custometype + '">' + lineItemObj.custometype + '</option>');

    templateObject.getEmployeeData = async () => {
        // let data = await CachedHttp.get(erpObject.TCustomerEx, async () => {
        //     return await contactService.getOneCustomerDataEx(customerID);
        // }, {
        //     validate: (cachedResponse) => {
        //         return true;
        //     }
        // });
        //
        // data = data.response;
        //setOneCustomerDataEx(data);

        getVS1Data('TCustomerVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                contactService.getOneCustomerDataEx(customerID).then(function (data) {
                    setOneCustomerDataEx(data);
                    // add to custom field
                    // tempcode
                    // setTimeout(function () {
                    //   $('#edtSaleCustField1').val(data.fields.CUSTFLD1);
                    //   $('#edtSaleCustField2').val(data.fields.CUSTFLD2);
                    //   $('#edtSaleCustField3').val(data.fields.CUSTFLD3);
                    // }, 5500);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcustomervs1;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ID) == parseInt(customerID)) {

                        // add to custom field
                        // tempcode
                        // setTimeout(function () {
                        //   $('#edtSaleCustField1').val(useData[i].fields.CUSTFLD1);
                        //   $('#edtSaleCustField2').val(useData[i].fields.CUSTFLD2);
                        //   $('#edtSaleCustField3').val(useData[i].fields.CUSTFLD3);
                        // }, 5500);

                        added = true;
                        setOneCustomerDataEx(useData[i]);
                        setTimeout(function () {
                            const rowCount = $('.results tbody tr').length;
                            $('.counter').text(rowCount + ' items');
                        }, 500);
                    }
                }
                if (!added) {
                    contactService.getOneCustomerDataEx(customerID).then(function (data) {
                        setOneCustomerDataEx(data);
                        // tempcode
                        // add to custom field
                        // setTimeout(function () {
                        //   $('#edtSaleCustField1').val(data.fields.CUSTFLD1);
                        //   $('#edtSaleCustField2').val(data.fields.CUSTFLD2);
                        //   $('#edtSaleCustField3').val(data.fields.CUSTFLD3);
                        // }, 5500);
                    });
                }
            }
        }).catch(function (err) {
            contactService.getOneCustomerDataEx(customerID).then(function (data) {
                $('.fullScreenSpin').css('display', 'none');
                setOneCustomerDataEx(data);
            });
        });
    };
    templateObject.getEmployeeDataByName = function () {
        getVS1Data('TCustomerVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                contactService.getOneCustomerDataExByName(customerID).then(function (data) {
                    setOneCustomerDataEx(data.tcustomer[0]);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcustomervs1;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ClientName) == parseInt(customerID)) {
                        added = true;
                        setOneCustomerDataEx(useData[i]);
                        setTimeout(function () {
                            const rowCount = $('.results tbody tr').length;
                            $('.counter').text(rowCount + ' items');
                        }, 500);
                    }
                }
                if (!added) {
                    contactService.getOneCustomerDataExByName(customerID).then(function (data) {
                        setOneCustomerDataEx(data.tcustomer[0]);
                    });
                }
            }
        }).catch(function (err) {
            contactService.getOneCustomerDataExByName(customerID).then(function (data) {
                $('.fullScreenSpin').css('display', 'none');
                setOneCustomerDataEx(data.tcustomer[0]);
            });
        });
    };
    function setOneCustomerDataEx(data) {
        let lineItems = [];
        let lineItemObj = {
            id: data.fields.ID || '',
            lid: 'Edit Customer',
            isjob: data.fields.IsJob || '',
            issupplier: data.fields.IsSupplier || false,
            iscustomer: data.fields.IsCustomer || false,
            company: data.fields.ClientName || '',
            email: data.fields.Email || '',
            title: data.fields.Title || '',
            firstname: data.fields.FirstName || '',
            middlename: data.fields.CUSTFLD10 || '',
            lastname: data.fields.LastName || '',
            tfn: '' || '',
            phone: data.fields.Phone || '',
            mobile: data.fields.Mobile || '',
            fax: data.fields.Faxnumber || '',
            skype: data.fields.SkypeName || '',
            website: data.fields.URL || '',
            shippingaddress: data.fields.Street || '',
            scity: data.fields.Street2 || '',
            ssuburb: data.fields.Suburb || '',
            sstate: data.fields.State || '',
            spostalcode: data.fields.Postcode || '',
            scountry: data.fields.Country || LoggedCountry,
            billingaddress: data.fields.BillStreet || '',
            bcity: data.fields.BillStreet2 || '',
            bsuburb: data.fields.Billsuburb || '',
            bstate: data.fields.BillState || '',
            bpostalcode: data.fields.BillPostcode || '',
            bcountry: data.fields.Billcountry || '',
            notes: data.fields.Notes || '',
            preferedpayment: data.fields.PaymentMethodName || '',
            terms: data.fields.TermsName || Session.get('ERPTermsSales'),
            deliverymethod: data.fields.ShippingMethodName || '',
            clienttype: data.fields.ClientTypeName || '',
            openingbalance: data.fields.RewardPointsOpeningBalance || 0.00,
            openingbalancedate: data.fields.RewardPointsOpeningDate ? moment(data.fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
            taxcode: data.fields.TaxCodeName || templateObject.defaultsaletaxcode.get(),
            custfield1: data.fields.CUSTFLD1 || '',
            custfield2: data.fields.CUSTFLD2 || '',
            custfield3: data.fields.CUSTFLD3 || '',
            custfield4: data.fields.CUSTFLD4 || '',
            status: data.fields.Status || '',
            rep: data.fields.RepName || '',
            source: data.fields.SourceName || '',
            salesQuota: data.fields.CUSTFLD12 || '',
            jobcompany: data.fields.ClientName || '',
            jobCompanyParent: data.fields.ClientName || '',
            jobemail: data.fields.Email || '',
            jobtitle: data.fields.Title || '',
            jobfirstname: data.fields.FirstName || '',
            jobmiddlename: data.fields.CUSTFLD10 || '',
            joblastname: data.fields.LastName || '',
            jobtfn: '' || '',
            jobphone: data.fields.Phone || '',
            jobmobile: data.fields.Mobile || '',
            jobfax: data.fields.Faxnumber || '',
            jobskype: data.fields.SkypeName || '',
            jobwebsite: data.fields.CUSTFLD9 || '',
            jobshippingaddress: data.fields.Street || '',
            jobscity: data.fields.Street2 || '',
            jobsstate: data.fields.State || '',
            jobspostalcode: data.fields.Postcode || '',
            jobscountry: data.fields.Country || LoggedCountry,
            jobbillingaddress: data.fields.BillStreet || '',
            jobbcity: data.fields.BillStreet2 || '',
            jobbstate: data.fields.BillState || '',
            jobbpostalcode: data.fields.BillPostcode || '',
            jobbcountry: data.fields.Billcountry || '',
            jobnotes: data.fields.Notes || '',
            jobpreferedpayment: data.fields.PaymentMethodName || '',
            jobterms: data.fields.TermsName || '',
            jobdeliverymethod: data.fields.ShippingMethodName || '',
            jobopeningbalance: data.fields.RewardPointsOpeningBalance || 0.00,
            jobopeningbalancedate: data.fields.RewardPointsOpeningDate ? moment(data.fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
            jobtaxcode: data.fields.TaxCodeName || templateObject.defaultsaletaxcode.get(),
            jobcustFld1: '' || '',
            jobcustFld2: '' || '',
            job_Title: '',
            jobName: '',
            jobNumber: '',
            jobRegistration: '',
            discount: data.fields.Discount || 0,
            jobclienttype: data.fields.ClientTypeName || '',
            ForeignExchangeCode: data.fields.ForeignExchangeCode || CountryAbbr,

        };

        setTimeout(function() {
            $('#sltCurrency').val(data.fields.ForeignExchangeCode || CountryAbbr);
        }, 100);

        if ((data.fields.Street == data.fields.BillStreet) && (data.fields.Street2 == data.fields.BillStreet2)
            && (data.fields.State == data.fields.BillState) && (data.fields.Postcode == data.fields.Postcode)
            && (data.fields.Country == data.fields.Billcountry)) {
            templateObject.isSameAddress.set(true);
            templateObject.isJobSameAddress.set(true);
        }
        //let attachmentData =  contactService.getCustomerAttachmentList(data.fields.ID);
        templateObject.getOverviewARData(data.fields.ClientName, data.fields.ID);
        templateObject.records.set(lineItemObj);

        /* START attachment */
        templateObject.attachmentCount.set(0);
        if (data.fields.Attachments) {
            if (data.fields.Attachments.length) {
                templateObject.attachmentCount.set(data.fields.Attachments.length);
                templateObject.uploadedFiles.set(data.fields.Attachments);
            }
        }
        /* END  attachment */

        templateObject.isJob.set(data.fields.IsJob);
        templateObject.getAllProductRecentTransactions(data.fields.ClientName, data.fields.ID);
        templateObject.getAllCustomerJobs(data.fields.ClientName);
        templateObject.getAllCrm(data.fields.ClientName);
        //templateObject.uploadedFiles.set(attachmentData);
        // $('.fullScreenSpin').css('display','none');

        setTimeout(function () {
            $('#edtCustomerCompany').attr('readonly', true);
            $('#sltPreferredPayment').val(lineItemObj.preferedpayment);
            $('#sltTerms').val(lineItemObj.terms);
            $("#sltCurrency").val(lineItemObj.ForeignExchangeCode);
            $('#sltCustomerType').val(lineItemObj.clienttype);
            $('#sltTaxCode').val(lineItemObj.taxcode);
            $('#sltJobPreferredPayment').val(lineItemObj.jobpreferedpayment);
            $('#sltJobTerms').val(lineItemObj.jobterms);
            $('#sltJobCustomerType').val(lineItemObj.jobclienttype);
            $('#sltJobTaxCode').val(lineItemObj.jobtaxcode);
            const rowCount = $('.results tbody tr').length;
            $('.counter').text(rowCount + ' items');
            setTab();
        }, 1000);
    }
    async function setInitialForEmptyCurrentID() {
        let lineItemObj = {
            id: '',
            lid: 'Add Customer',
            company: '',
            email: '',
            title: '',
            firstname: '',
            middlename: '',
            lastname: '',
            tfn: '',
            phone: '',
            mobile: '',
            fax: '',
            skype: '',
            website: '',
            shippingaddress: '',
            scity: '',
            ssuburb: '',
            sstate: '',
            terms: loggedTermsSales || '',
            spostalcode: '',
            scountry: LoggedCountry || '',
            billingaddress: '',
            bcity: '',
            bsuburb: '',
            bstate: '',
            bpostalcode: '',
            bcountry: LoggedCountry || '',
            custfield1: '',
            custfield2: '',
            custfield3: '',
            custfield4: '',
            status: '',
            rep: '',
            source: '',
            salesQuota: 5000,
            jobbcountry: LoggedCountry || '',
            jobscountry: LoggedCountry || '',
            discount: 0
        };
        await templateObject.getTermsList();

        setTimeout(function () {
            $('#edtCustomerCompany').attr('readonly', false);
            $('#sltPreferredPayment').val(lineItemObj.preferedpayment);
            $('#sltTerms').val(lineItemObj.terms);
            $("#sltCurrency").val(lineItemObj.ForeignExchangeCode);
            $('#sltCustomerType').val(lineItemObj.clienttype);
            $('#sltTaxCode').val(lineItemObj.taxcode);
            $('#sltJobPreferredPayment').val(lineItemObj.jobpreferedpayment);
            $('#sltJobTerms').val(lineItemObj.terms);
            $('#sltJobCustomerType').val(lineItemObj.jobclienttype);
            $('#sltJobTaxCode').val(lineItemObj.jobtaxcode);
            $('.customerTypeSelect').append('<option value="newCust">Add Customer Type</option>');
        }, 3000);
        templateObject.isSameAddress.set(true);
        templateObject.records.set(lineItemObj);
        setTimeout(function () {
            setTab();
            // $('#tblJoblist').DataTable({"dom": '<"pull-left"f><"pull-right"l>tip'});
            // $('#tblTransactionlist').DataTable({"dom": '<"pull-left"f><"pull-right"l>tip'});
            // $('#tblCrmList').DataTable({"dom": '<"pull-left"f><"pull-right"l>tip'});
            $('.fullScreenSpin').css('display', 'none');
        }, 100);
        // setTimeout(function () {
        //     $('.termsSelect').val(templateObject.defaultsaleterm.get()||'');
        // }, 2000);
        $('.fullScreenSpin').css('display', 'none');
        // setTimeout(function () {
        //   var rowCount = $('.results tbody tr').length;
        //     $('.counter').text(rowCount + ' items');
        // }, 500);
    }
    function setTab() {
        if (currentId.transTab == 'active') {
            $('.customerTab').removeClass('active');
            $('.transactionTab').trigger('click');
        } else if (currentId.transTab == 'crm') {
            $('.customerTab').removeClass('active');
            $('.crmTab').trigger('click');
        } else if (currentId.transTab == 'job') {
            $('.customerTab').removeClass('active');
            $('.jobTab').trigger('click');
        } else {
            $('.customerTab').addClass('active');
            $('.customerTab').trigger('click');
        }
    }
    if (JSON.stringify(currentId) != '{}') {
        if (currentId.id == "undefined") {
            setInitialForEmptyCurrentID();
        } else {
            if (!isNaN(currentId.id)) {
                customerID = currentId.id;
                templateObject.getEmployeeData();
                templateObject.getReferenceLetters();
            } else if ((currentId.name)) {
                customerID = currentId.name.replace(/%20/g, " ");
                templateObject.getEmployeeDataByName();
            } else if (!isNaN(currentId.jobid)) {
                customerID = currentId.jobid;
                templateObject.getEmployeeData();
            } else {
                setInitialForEmptyCurrentID();
            }
        }
    } else {
        setInitialForEmptyCurrentID();
    }
    templateObject.getCustomersList = function () {
        getVS1Data('TCustomerVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                contactService.getAllCustomerSideDataVS1().then(function (data) {
                    templateObject.setAllCustomerSideDataVS1(data);
                }).catch(function (err) {
                    //Bert.alert('<strong>' + err + '</strong>!', 'danger');
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                templateObject.setAllCustomerSideDataVS1(data);
            }
        }).catch(function (err) {
            contactService.getAllCustomerSideDataVS1().then(function (data) {
                templateObject.setAllCustomerSideDataVS1(data);
            }).catch(function (err) {
                //Bert.alert('<strong>' + err + '</strong>!', 'danger');
            });
        });
    };
    templateObject.getCustomersList();
    templateObject.setAllCustomerSideDataVS1 = function (data) {
        let lineItems = [];
        let lineItemObj = {};
        for (let i = 0; i < data.tcustomervs1.length; i++) {
            let classname = '';
            if (!isNaN(currentId.id)) {
                if (data.tcustomervs1[i].fields.ID == parseInt(currentId.id)) {
                    classname = 'currentSelect';
                }
            }
            if (!isNaN(currentId.jobid)) {
                if (data.tcustomervs1[i].fields.ID == parseInt(currentId.jobid)) {
                    classname = 'currentSelect';
                }
            }
            const dataList = {
                id: data.tcustomervs1[i].fields.ID || '',
                company: data.tcustomervs1[i].fields.ClientName || '',
                isslectJob: data.tcustomervs1[i].fields.IsJob || false,
                classname: classname
            };
            lineItems.push(dataList);
        }
        templateObject.customerrecords.set(lineItems);
        if (templateObject.customerrecords.get()) {
            setTimeout(function () {
                $('.counter').text(lineItems.length + ' items');
            }, 100);
        }
    }

    $(document).ready(function () {
        setTimeout(function () {
            $('#sltTerms').editableSelect();
            $("#sltCurrency").editableSelect();
            $('#sltTerms').editableSelect().on('click.editable-select', function (e, li) {
                $('#selectLineID').val('sltTerms');
                let $each = $(this);
                let offset = $each.offset();
                const termsDataName = e.target.value || '';
                editableTerms(e, $each, offset, termsDataName);
            });
            function setTermsVS1(data, termsDataName) {
                for (let i in data.ttermsvs1) {
                    if (data.ttermsvs1.hasOwnProperty(i)) {
                        if (data.ttermsvs1[i].TermsName == termsDataName) {
                            $('#edtTermsID').val(data.ttermsvs1[i].Id);
                            $('#edtDays').val(data.ttermsvs1[i].Days);
                            $('#edtName').val(data.ttermsvs1[i].TermsName);
                            $('#edtDesc').val(data.ttermsvs1[i].Description);
                            if (data.ttermsvs1[i].IsEOM == true) {
                                $('#isEOM').prop('checked', true);
                            } else {
                                $('#isEOM').prop('checked', false);
                            }
                            if (data.ttermsvs1[i].IsEOMPlus == true) {
                                $('#isEOMPlus').prop('checked', true);
                            } else {
                                $('#isEOMPlus').prop('checked', false);
                            }
                            if (data.ttermsvs1[i].isSalesdefault == true) {
                                Session.setPersistent('ERPTermsSales', data.ttermsvs1[i].TermsName || "COD");
                                $('#chkCustomerDef').prop('checked', true);
                            } else {
                                $('#chkCustomerDef').prop('checked', false);
                            }
                            if (data.ttermsvs1[i].isPurchasedefault == true) {
                                Session.setPersistent('ERPTermsPurchase', data.ttermsvs1[i].TermsName || "COD");
                                $('#chkSupplierDef').prop('checked', true);
                            } else {
                                $('#chkSupplierDef').prop('checked', false);
                            }
                        }
                    }
                }
                setTimeout(function () {
                    $('.fullScreenSpin').css('display', 'none');
                    $('#newTermsModal').modal('toggle');
                }, 200);
            }
            function editableTerms(e, $each, offset, termsDataName) {
                $('#edtTermsID').val('');
                if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
                    $('#termsListModal').modal('toggle');
                } else {
                    if (termsDataName.replace(/\s/g, '') !== '') {
                        $('#termModalHeader').text('Edit Terms');
                        getVS1Data('TTermsVS1').then(function (dataObject) { //edit to test indexdb
                            if (dataObject.length == 0) {
                                $('.fullScreenSpin').css('display', 'inline-block');
                                sideBarService.getTermsVS1().then(function (data) {
                                    setTermsVS1(data, termsDataName);
                                });
                            } else {
                                let data = JSON.parse(dataObject[0].data);
                                setTermsVS1(data, termsDataName);
                            }
                        }).catch(function (err) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            sideBarService.getTermsVS1().then(function (data) {
                                setTermsVS1(data, termsDataName);
                            });
                        });
                    } else {
                        $('#termsListModal').modal();
                        setTimeout(function () {
                            $('#termsList_filter .form-control-sm').focus();
                            $('#termsList_filter .form-control-sm').val('');
                            $('#termsList_filter .form-control-sm').trigger("input");
                            const datatable = $('#termsList').DataTable();
                            datatable.draw();
                            $('#termsList_filter .form-control-sm').trigger("input");
                        }, 500);
                    }
                }
            }

            $('#sltJobTerms').editableSelect();
            $('#sltJobTerms').editableSelect().on('click.editable-select', function (e, li) {
                $('#selectLineID').val('sltJobTerms');
                const $each = $(this);
                const offset = $each.offset();
                const termsDataName = e.target.value || '';
                editableTerms(e, $each, offset, termsDataName);
            });

            $('#sltPreferredPayment').editableSelect();
            $('#sltPreferredPayment').editableSelect().on('click.editable-select', function (e, li) {
                $('#selectPaymentMethodLineID').val('sltPreferredPayment');
                const $each = $(this);
                const offset = $each.offset();
                const paymentDataName = e.target.value || '';
                editablePreferredPayment(e, $each, offset, paymentDataName);
            });
            function setPaymentMethodDataVS1(data, paymentDataName) {
                for (let i = 0; i < data.tpaymentmethodvs1.length; i++) {
                    if (data.tpaymentmethodvs1[i].fields.PaymentMethodName == paymentDataName) {
                        $('#edtPaymentMethodID').val(data.tpaymentmethodvs1[i].fields.ID);
                        $('#edtPaymentMethodName').val(data.tpaymentmethodvs1[i].fields.PaymentMethodName);
                        if (data.tpaymentmethodvs1[i].fields.IsCreditCard == true) {
                            $('#isformcreditcard').prop('checked', true);
                        } else {
                            $('#isformcreditcard').prop('checked', false);
                        }
                    }
                }
                setTimeout(function () {
                    $('.fullScreenSpin').css('display', 'none');
                    $('#newPaymentMethodModal').modal('toggle');
                }, 200);
            }
            function editablePreferredPayment(e, $each, offset, paymentDataName) {
                $('#edtPaymentMethodID').val('');
                if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
                    $('#paymentMethodModal').modal('toggle');
                } else {
                    if (paymentDataName.replace(/\s/g, '') !== '') {
                        $('#paymentMethodHeader').text('Edit Payment Method');

                        getVS1Data('TPaymentMethod').then(function (dataObject) {
                            if (dataObject.length == 0) {
                                $('.fullScreenSpin').css('display', 'inline-block');
                                sideBarService.getPaymentMethodDataVS1().then(function (data) {
                                    setPaymentMethodDataVS1(data, paymentDataName);
                                });
                            } else {
                                let data = JSON.parse(dataObject[0].data);
                                setPaymentMethodDataVS1(data, paymentDataName);
                            }
                        }).catch(function (err) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            sideBarService.getPaymentMethodDataVS1().then(function (data) {
                                setPaymentMethodDataVS1(data, paymentDataName);
                            });
                        });
                    } else {
                        $('#paymentMethodModal').modal();
                        setTimeout(function () {
                            $('#paymentmethodList_filter .form-control-sm').focus();
                            $('#paymentmethodList_filter .form-control-sm').val('');
                            $('#paymentmethodList_filter .form-control-sm').trigger("input");
                            var datatable = $('#paymentmethodList').DataTable();
                            datatable.draw();
                            $('#paymentmethodList_filter .form-control-sm').trigger("input");
                        }, 500);
                    }
                }
            }

            $('#sltJobPreferredPayment').editableSelect();
            $('#sltJobPreferredPayment').editableSelect().on('click.editable-select', function (e, li) {
                $('#selectPaymentMethodLineID').val('sltJobPreferredPayment');
                const $each = $(this);
                const offset = $each.offset();
                const paymentDataName = e.target.value || '';
                editablePreferredPayment(e, $each, offset, paymentDataName);
            });

            $('#sltCustomerType').editableSelect();
            $('#sltCustomerType').editableSelect().on('click.editable-select', function (e, li) {
                $('#selectLineID').val('sltCustomerType');
                const $each = $(this);
                const offset = $each.offset();
                const clientTypeDataName = e.target.value || '';
                editableCustomerType(e, $each, offset, clientTypeDataName);

            });
            function setClientType(data, clientTypeDataName) {
                for (let i in data.tclienttype) {
                    if (data.tclienttype.hasOwnProperty(i)) {
                        if (data.tclienttype[i].TypeName == clientTypeDataName) {
                            $('#edtClientTypeID').val(data.tclienttype[i].Id);
                            $('#edtClientTypeName').val(data.tclienttype[i].TypeName);
                            $('#txaDescription').val(data.tclienttype[i].TypeDescription);
                        }
                    }
                }
                setTimeout(function () {
                    $('.fullScreenSpin').css('display', 'none');
                    $('#myModalClientType').modal('toggle');
                }, 200);
            }
            function editableCustomerType(e, $each, offset, clientTypeDataName) {
                $('#edtClientTypeID').val('');
                $('#edtClientTypeName').val('');
                $('#txaDescription').val('');
                $('#add-clienttype-title').text('Add Customer Type');
                if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
                    $('#clienttypeListModal').modal('toggle');
                } else {
                    if (clientTypeDataName.replace(/\s/g, '') !== '') {
                        $('#add-clienttype-title').text('Edit Customer Type');
                        getVS1Data('TClientType').then(function (dataObject) { //edit to test indexdb
                            if (dataObject.length == 0) {
                                $('.fullScreenSpin').css('display', 'inline-block');
                                contactService.getClientType().then(function (data) {
                                    setClientType(data, clientTypeDataName);
                                });
                            } else {
                                let data = JSON.parse(dataObject[0].data);
                                setClientType(data, clientTypeDataName);
                            }
                        }).catch(function (err) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            contactService.getClientType().then(function (data) {
                                setClientType(data, clientTypeDataName);
                            });
                        });
                    } else {
                        $('#clienttypeListModal').modal();
                        setTimeout(function () {
                            $('#termsList_filter .form-control-sm').focus();
                            $('#termsList_filter .form-control-sm').val('');
                            $('#termsList_filter .form-control-sm').trigger("input");
                            var datatable = $('#termsList').DataTable();
                            datatable.draw();
                            $('#termsList_filter .form-control-sm').trigger("input");
                        }, 500);
                    }
                }
            }

            $('#sltJobCustomerType').editableSelect();
            $('#sltJobCustomerType').editableSelect().on('click.editable-select', function (e, li) {
                $('#selectLineID').val('sltJobCustomerType');
                const $each = $(this);
                const offset = $each.offset();
                const clientTypeDataName = e.target.value || '';
                editableCustomerType(e, $each, offset, clientTypeDataName);
            });

            $('#sltTaxCode').editableSelect();
            $('#sltTaxCode').editableSelect().on('click.editable-select', function (e, li) {
                $('#selectLineID').val('sltTaxCode');
                const $each = $(this);
                const offset = $each.offset();
                const taxRateDataName = e.target.value || '';
                editableTaxCode(e, $each, offset, taxRateDataName);

            });
            function setTaxRateData(data, taxRateDataName) {
                let lineItems = [];
                let lineItemObj = {};
                for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                    if (data.ttaxcodevs1[i].CodeName == taxRateDataName) {
                        $("#edtTaxNamePop").attr("readonly", true);
                        let taxRate = (
                            data.ttaxcodevs1[i].Rate * 100
                        ).toFixed(2);
                        const taxRateID = data.ttaxcodevs1[i].Id || "";
                        const taxRateName = data.ttaxcodevs1[i].CodeName || "";
                        const taxRateDesc = data.ttaxcodevs1[i].Description || "";
                        $("#edtTaxID").val(taxRateID);
                        $("#edtTaxNamePop").val(taxRateName);
                        $("#edtTaxRatePop").val(taxRate);
                        $("#edtTaxDescPop").val(taxRateDesc);
                        setTimeout(function () {
                            $("#newTaxRateModal").modal("toggle");
                        }, 100);
                    }
                }
            }
            function editableTaxCode(e, $each, offset, taxRateDataName) {
                $('#edtTaxID').val('');
                $('.taxcodepopheader').text('New Tax Rate');
                $('#edtTaxID').val('');
                $('#edtTaxNamePop').val('');
                $('#edtTaxRatePop').val('');
                $('#edtTaxDescPop').val('');
                $('#edtTaxNamePop').attr('readonly', false);
                if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
                    $('#taxRateListModal').modal('toggle');
                    // var targetID = $(event.target).closest('tr').attr('id');
                    // $('#selectLineID').val(targetID);
                    setTimeout(function () {
                        $('#tblTaxRate_filter .form-control-sm').focus();
                        $('#tblTaxRate_filter .form-control-sm').val('');
                        $('#tblTaxRate_filter .form-control-sm').trigger("input");

                        const datatable = $('#tblTaxRate').DataTable();
                        datatable.draw();
                        $('#tblTaxRate_filter .form-control-sm').trigger("input");
                    }, 500);
                } else {
                    if (taxRateDataName.replace(/\s/g, '') !== '') {
                        $('.taxcodepopheader').text('Edit Tax Rate');
                        getVS1Data('TTaxcodeVS1').then(function (dataObject) {
                            if (dataObject.length == 0) {
                                sideBarService.getTaxCodesVS1().then(function (data) {
                                    setTaxRateData(data, taxRateDataName);
                                }).catch(function (err) {
                                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                                    $('.fullScreenSpin').css('display', 'none');
                                    // Meteor._reload.reload();
                                });
                            } else {
                                let data = JSON.parse(dataObject[0].data);
                                setTaxRateData(data, taxRateDataName);
                            }
                        }).catch(function (err) {
                            sideBarService.getTaxCodesVS1().then(function (data) {
                                setTaxRateData(data, taxRateDataName);
                            }).catch(function (err) {
                                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                                $('.fullScreenSpin').css('display', 'none');
                                // Meteor._reload.reload();
                            });
                        });
                    } else {
                        $('#taxRateListModal').modal('toggle');
                        // var targetID = $(event.target).closest('tr').attr('id');
                        // $('#selectLineID').val(targetID);
                        setTimeout(function () {
                            $('#tblTaxRate_filter .form-control-sm').focus();
                            $('#tblTaxRate_filter .form-control-sm').val('');
                            $('#tblTaxRate_filter .form-control-sm').trigger("input");

                            const datatable = $('#tblTaxRate').DataTable();
                            datatable.draw();
                            $('#tblTaxRate_filter .form-control-sm').trigger("input");

                        }, 500);
                    }
                }
            }
            $('#sltJobTaxCode').editableSelect();
            $('#sltJobTaxCode').editableSelect().on('click.editable-select', function (e, li) {
                $('#selectLineID').val('sltJobTaxCode');
                const $each = $(this);
                const offset = $each.offset();
                const taxRateDataName = e.target.value || '';
                editableTaxCode(e, $each, offset, taxRateDataName);
            });
        }, 1200);
    });
    $(document).on("click", "#termsList tbody tr", function (e) {
        let selectedTermsDropdownID = $('#selectLineID').val() || 'sltTerms';
        $('#' + selectedTermsDropdownID + '').val($(this).find(".colTermName").text());
        $('#termsListModal').modal('toggle');
    });
    $(document).on("click", "#paymentmethodList tbody tr", function (e) {
        let selectedDropdownID = $('#selectPaymentMethodLineID').val() || 'sltPreferredPayment';
        $('#' + selectedDropdownID + '').val($(this).find(".colName").text());
        $('#paymentMethodModal').modal('toggle');
    });
    $(document).on("click", "#clienttypeList tbody tr", function (e) {
        let selectedClientTypeDropdownID = $('#selectLineID').val() || 'sltCustomerType';
        $('#' + selectedClientTypeDropdownID + '').val($(this).find(".colClientTypeName").text());
        $('#clienttypeListModal').modal('toggle');
    });
    $(document).on("click", "#tblTaxRate tbody tr", function (e) {
        let selectedTaxRateDropdownID = $('#selectLineID').val() || 'sltTaxCode';
        $('#' + selectedTaxRateDropdownID + '').val($(this).find(".taxName").text());
        $('#taxRateListModal').modal('toggle');
    });
    $(document).on("click", "#referenceLetterModal .btnSaveLetterTemp", function (e) {
        playSaveAudio();
        setTimeout(function () {
            if ($("input[name='refTemp']:checked").attr('value') == undefined || $("input[name='refTemp']:checked").attr('value') == null) {
                swal({
                    title: 'Oooops...',
                    text: "No email template has been set",
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Cancel'
                }).then((result) => {
                    if (result.value) {
                        $('#referenceLetterModal').modal('toggle');
                    }
                });
            } else {
                let email = $('#edtCustomerEmail').val();
                let dataLabel = $("input[name='refTemp']:checked").attr('value');
                let dataSubject = $("input[name='refTemp']:checked").attr('data-subject');
                let dataMemo = $("input[name='refTemp']:checked").attr('data-memo');
                if (email && email != null && email != '') {
                    document.location =
                        "mailto:" + email + "?subject=" + dataSubject + "&body=" + dataMemo;
                    sideBarService.getCorrespondences().then(dataObject => {
                        let temp = {
                            type: "TCorrespondence",
                            fields: {
                                Active: true,
                                EmployeeId: Session.get('mySessionEmployeeLoggedID'),
                                Ref_Type: dataLabel,
                                MessageAsString: dataMemo,
                                MessageFrom: Session.get('mySessionEmployee'),
                                MessageId: dataObject.tcorrespondence.length.toString(),
                                MessageTo: email,
                                ReferenceTxt: dataSubject,
                                Ref_Date: moment().format('YYYY-MM-DD'),
                                Status: ""
                            }
                        }
                        sideBarService.saveCorrespondence(temp).then(data => {
                            sideBarService.getCorrespondences().then(dataUpdate => {
                                addVS1Data('TCorrespondence', JSON.stringify(dataUpdate));
                            })
                            $('#referenceLetterModal').modal('toggle');
                        })
                    })
                } else {
                    swal({
                        title: 'Oooops...',
                        text: "No user email has been set",
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Cancel'
                    }).then((result) => {
                        if (result.value) {
                            $('#referenceLetterModal').modal('toggle');
                        }
                    });
                }
            }
        }, delayTimeAfterSound);
    });
    $(document).on('click', '#referenceLetterModal .btnAddLetter', function (e) {
        $('#addLetterTemplateModal').modal('toggle')
    });
    $(document).on('click', '#addLetterTemplateModal #save-correspondence', function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        // let correspondenceData = localStorage.getItem('correspondence');
        let correspondenceTemp = templateObject.correspondences.get()
        let tempLabel = $("#edtTemplateLbl").val();
        let tempSubject = $('#edtTemplateSubject').val();
        let tempContent = $("#edtTemplateContent").val();
        if (correspondenceTemp.length > 0) {
            let index = correspondenceTemp.findIndex(item => {
                return item.Ref_Type == tempLabel
            })
            if (index > 0) {
                swal({
                    title: 'Oooops...',
                    text: 'There is already a template labeled ' + tempLabel,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === 'cancel') { }
                });
                $('.fullScreenSpin').css('display', 'none');
            } else {

                sideBarService.getCorrespondences().then(dObject => {

                    let temp = {
                        Active: true,
                        EmployeeId: Session.get('mySessionEmployeeLoggedID'),
                        Ref_Type: tempLabel,
                        MessageAsString: tempContent,
                        MessageFrom: "",
                        MessageId: dObject.tcorrespondence.length.toString(),
                        MessageTo: "",
                        ReferenceTxt: tempSubject,
                        Ref_Date: moment().format('YYYY-MM-DD'),
                        Status: ""
                    }
                    let objDetails = {
                        type: 'TCorrespondence',
                        fields: temp
                    }

                    // let array = [];
                    // array.push(objDetails)

                    sideBarService.saveCorrespondence(objDetails).then(data => {
                        sideBarService.getCorrespondences().then(dataUpdate => {
                            addVS1Data('TCorrespondence', JSON.stringify(dataUpdate)).then(function () {
                                $('.fullScreenSpin').css('display', 'none');
                                swal({
                                    title: 'Success',
                                    text: 'Template has been saved successfully ',
                                    type: 'success',
                                    showCancelButton: false,
                                    confirmButtonText: 'Continue'
                                }).then((result) => {
                                    if (result.value) {
                                        $('#addLetterTemplateModal').modal('toggle')
                                        templateObject.getReferenceLetters();
                                    } else if (result.dismiss === 'cancel') { }
                                });
                            })
                        }).catch(function () {
                            $('.fullScreenSpin').css('display', 'none');
                            swal({
                                title: 'Oooops...',
                                text: 'Something went wrong',
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'Try Again'
                            }).then((result) => {
                                if (result.value) {
                                    $('#addLetterTemplateModal').modal('toggle')
                                } else if (result.dismiss === 'cancel') { }
                            });
                        })
                    }).catch(function () {
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Oooops...',
                            text: 'Something went wrong',
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                $('#addLetterTemplateModal').modal('toggle')
                            } else if (result.dismiss === 'cancel') { }
                        });
                    })

                })
            }
        } else {
            sideBarService.getCorrespondences().then(dObject => {
                let temp = {
                    Active: true,
                    EmployeeId: Session.get('mySessionEmployeeLoggedID'),
                    Ref_Type: tempLabel,
                    MessageAsString: tempContent,
                    MessageFrom: "",
                    MessageId: dObject.tcorrespondence.length.toString(),
                    MessageTo: "",
                    ReferenceTxt: tempSubject,
                    Ref_Date: moment().format('YYYY-MM-DD'),
                    Status: ""
                }
                let objDetails = {
                    type: 'TCorrespondence',
                    fields: temp
                }

                let array = [];
                array.push(objDetails)

                sideBarService.saveCorrespondence(objDetails).then(data => {
                    sideBarService.getCorrespondences().then(function (dataUpdate) {
                        addVS1Data('TCorrespondence', JSON.stringify(dataUpdate)).then(function () {
                            $('.fullScreenSpin').css('display', 'none');
                            swal({
                                title: 'Success',
                                text: 'Template has been saved successfully ',
                                type: 'success',
                                showCancelButton: false,
                                confirmButtonText: 'Continue'
                            }).then((result) => {
                                if (result.value) {
                                    $('#addLetterTemplateModal').modal('toggle')
                                    templateObject.getReferenceLetters();

                                } else if (result.dismiss === 'cancel') { }
                            });
                        }).catch(function (err) {
                            $('.fullScreenSpin').css('display', 'none');
                            swal({
                                title: 'Oooops...',
                                text: 'Something went wrong',
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'Try Again'
                            }).then((result) => {
                                if (result.value) {
                                    $('#addLetterTemplateModal').modal('toggle')
                                } else if (result.dismiss === 'cancel') { }
                            });
                        })
                    })
                }).catch(function () {
                    swal({
                        title: 'Oooops...',
                        text: 'Something went wrong',
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            $('#addLetterTemplateModal').modal('toggle')
                        } else if (result.dismiss === 'cancel') { }
                    });
                })
            })

        }
        // localStorage.setItem('correspondence', JSON.stringify(correspondenceTemp));
        // templateObject.correspondences.set(correspondenceTemp);
        // $('#addLetterTemplateModal').modal('toggle');
    });
    $(document).on('click', '#tblEmployeelist tbody tr', function (event) {
        let value = $(this).find('.colEmployeeName').text();
        $('#leadRep').val(value);
        $('#employeeListPOPModal').modal('hide');
        // $('#leadRep').val($('#leadRep').val().replace(/\s/g, ''));
    })
    $(document).on("click", "#tblStatusPopList tbody tr", function (e) {
        $('#leadStatus').val($(this).find(".colStatusName").text());
        $('#statusPopModal').modal('toggle');
        $('#tblStatusPopList_filter .form-control-sm').val('');
        setTimeout(function () {
            $('.btnRefreshStatus').trigger('click');
            $('.fullScreenSpin').css('display', 'none');
        }, 1000);
    });
    $(document).on('click', '#leadStatus', function (e, li) {
        const $earch = $(this);
        const offset = $earch.offset();
        $('#statusId').val('');
        const statusDataName = e.target.value || '';
        if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#statusPopModal').modal('toggle');
        } else {
            if (statusDataName.replace(/\s/g, '') != '') {
                $('#newStatusHeader').text('Edit Status');
                $('#newStatus').val(statusDataName);
                getVS1Data('TLeadStatusType').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        sideBarService.getAllLeadStatus().then(function (data) {
                            for (let i in data.tleadstatustype) {
                                if (data.tleadstatustype[i].TypeName === statusDataName) {
                                    $('#statusId').val(data.tleadstatustype[i].Id);
                                }
                            }
                            setTimeout(function () {
                                $('.fullScreenSpin').css('display', 'none');
                                $('#newStatusPopModal').modal('toggle');
                            }, 200);
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tleadstatustype;
                        for (let i in useData) {
                            if (useData[i].TypeName === statusDataName) {
                                $('#statusId').val(useData[i].Id);
                            }
                        }
                        setTimeout(function () {
                            $('.fullScreenSpin').css('display', 'none');
                            $('#newStatusPopModal').modal('toggle');
                        }, 200);
                    }
                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'inline-block');
                    sideBarService.getAllLeadStatus().then(function (data) {
                        for (let i in data.tleadstatustype) {
                            if (data.tleadstatustype.hasOwnProperty(i)) {
                                if (data.tleadstatustype[i].TypeName === statusDataName) {
                                    $('#statusId').val(data.tleadstatustype[i].Id);
                                }
                            }
                        }
                        setTimeout(function () {
                            $('.fullScreenSpin').css('display', 'none');
                            $('#newStatusPopModal').modal('toggle');
                        }, 200);
                    });
                });
                setTimeout(function () {
                    $('.fullScreenSpin').css('display', 'none');
                    $('#newStatusPopModal').modal('toggle');
                }, 200);

            } else {
                $('#statusPopModal').modal();
                setTimeout(function () {
                    $('#tblStatusPopList_filter .form-control-sm').focus();
                    $('#tblStatusPopList_filter .form-control-sm').val('');
                    $('#tblStatusPopList_filter .form-control-sm').trigger("input");
                    const datatable = $('#tblStatusPopList').DataTable();
                    datatable.draw();
                    $('#tblStatusPopList_filter .form-control-sm').trigger("input");
                }, 500);
            }
        }
    });
    $(document).on('click', '#leadRep', function (e, li) {
        $('#employeeListPOPModal').modal('show');
    })
});

Template.customerscard.events({
    'keyup .txtSearchCustomers': function (event) {
        if ($(event.target).val() != '') {
            $(".btnRefreshCustomers").addClass('btnSearchAlert');
        } else {
            $(".btnRefreshCustomers").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
            $(".btnRefreshCustomers").trigger("click");
        }
    },
    'click .btnRefreshCustomers': async function (event) {
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayInvoiceList = new Array();
        const lineExtaSellItems = [];
        const self = this;
        let lineItems = [];
        let lineItemObj = {};
        let currentId = FlowRouter.current().queryParams;
        $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('.txtSearchCustomers').val() || '';
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getNewCustomerByNameOrID(dataSearchName).then(async function (data) {
                $(".btnRefreshCustomers").removeClass('btnSearchAlert');
                let lineItems = [];
                let lineItemObj = {};
                if (data.tcustomervs1.length > 0) {
                    $("#tblCustomerSideList > tbody").empty();
                    for (let i = 0; i < data.tcustomervs1.length; i++) {
                        let classname = '';
                        if (!isNaN(currentId.id)) {
                            if (data.tcustomervs1[i].fields.ID == parseInt(currentId.id)) {
                                classname = 'currentSelect';
                            }
                        }
                        if (!isNaN(currentId.jobid)) {
                            if (data.tcustomervs1[i].fields.ID == parseInt(currentId.jobid)) {
                                classname = 'currentSelect';
                            }
                        }
                        const dataList = {
                            id: data.tcustomervs1[i].fields.ID || '',
                            company: data.tcustomervs1[i].fields.ClientName || '',
                            isslectJob: data.tcustomervs1[i].fields.IsJob || false,
                            classname: classname
                        };
                        $(".tblCustomerSideList > tbody").append(
                            ' <tr class="' + dataList.isslectJob + '" id="' + dataList.id + '" style="cursor: pointer;">' +
                            '<td data-toggle="tooltip" data-bs-tooltip="" data-placement="bottom" title="' + dataList.company + '" id="' + dataList.id + '" class="' + dataList.isslectJob + ' ' + dataList.classname + '" >' + dataList.company + '</td>' +
                            '</tr>');
                        lineItems.push(dataList);
                    }

                    setTimeout(function () {
                        $('.counter').text(lineItems.length + ' items');
                    }, 100);
                    $('.fullScreenSpin').css('display', 'none');
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                }
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            Meteor._reload.reload();
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .tblJoblist tbody tr': function (event) {
        var listData = $(event.target).closest('tr').attr('id');
        if (listData) {
            window.open('/customerscard?jobid=' + listData, '_self');
        }
    },
    'click .tblCrmList tbody tr': function (event) {
        const taskID = $(event.target).parent().attr('id');
        const taskCategory = $(event.target).parent().attr('category');
        if (taskID !== undefined) {
            if (taskCategory == 'task') {
                FlowRouter.go('/crmoverview?taskid=' + taskID);
            } else if (taskCategory == 'appointment') {
                FlowRouter.go('/appointments?id=' + taskID);

            }
        }
    },
    'click .openBalance': function (event) {
        let currentId = FlowRouter.current().queryParams.id || FlowRouter.current().queryParams.jobid || '';
        let customerName = $('#edtCustomerCompany').val() || $('#edtJobCustomerCompany').val() || '';
        if (customerName !== "") {
            if (customerName.indexOf('^') > 0) {
                customerName = customerName.split('^')[0]
            }
            window.open('/agedreceivables?contact=' + customerName + '&contactid=' + currentId, '_self');
        } else {
            window.open('/agedreceivables', '_self');
        }
    },
    'click #leadStatus': function (event) {
        $('#leadStatus').select();
        $('#leadStatus').editableSelect();
    },
    'click #leadRep': function (event) {
        $('#leadRep').select();
        $('#leadRep').editableSelect();
    },
    'click .btnReceiveCustomerPayment': async function (event) {
        let currentId = FlowRouter.current().queryParams.id || FlowRouter.current().queryParams.jobid || '';
        let customerName = $('#edtCustomerCompany').val() || $('#edtJobCustomerCompany').val() || '';
        if (customerName !== "") {
            if (customerName.indexOf('^') > 0) {
                customerName = customerName.split('^')[0]
            }
            await clearData('TAwaitingCustomerPayment');
            FlowRouter.go('/customerawaitingpayments?contact=' + customerName + '&contactid=' + currentId);
        }
    },
    'click .openBalancesummary': function (event) {
        let currentId = FlowRouter.current().queryParams.id || FlowRouter.current().queryParams.jobid || '';
        let customerName = $('#edtCustomerCompany').val() || $('#edtJobCustomerCompany').val() || '';
        if (customerName !== "") {
            if (customerName.indexOf('^') > 0) {
                customerName = customerName.split('^')[0]
            }
            window.open('/agedreceivablessummary?contact=' + customerName + '&contactid=' + currentId, '_self');
        } else {
            window.open('/agedreceivablessummary', '_self');
        }
    },
    'click #customerShipping-1': function (event) {
        if ($(event.target).is(':checked')) {
            $('.customerShipping-2').css('display', 'none');
        } else {
            $('.customerShipping-2').css('display', 'block');
        }
    },
    'click .btnBack': function (event) {
        playCancelAudio();
        // event.preventDefault();
        setTimeout(function () {
            history.back(1);
        }, delayTimeAfterSound);
        //  FlowRouter.go('/customerlist');
    },
    'click .btnSaveDept': function () {
        playSaveAudio();
        let contactService = new ContactService();
        setTimeout(function () {
            $('.fullScreenSpin').css('display', 'inline-block');


            //let headerDept = $('#sltDepartment').val();
            let custType = $('#edtClientTypeName').val();
            let typeDesc = $('#txaDescription').val() || '';
            if (custType == '') {
                swal('Client Type name cannot be blank!', '', 'warning');
                $('.fullScreenSpin').css('display', 'none');
                e.preventDefault();
            } else {
                let objDetails = {
                    type: "TClientType",
                    fields: {
                        TypeName: custType,
                        TypeDescription: typeDesc,
                    }
                };
                contactService.saveClientTypeData(objDetails).then(function (objDetails) {
                    sideBarService.getClientTypeData().then(function (dataReload) {
                        addVS1Data('TClientType', JSON.stringify(dataReload)).then(function (datareturn) {
                            Meteor._reload.reload();
                        }).catch(function (err) {
                            Meteor._reload.reload();
                        });
                    }).catch(function (err) {
                        Meteor._reload.reload();
                    });
                    // Meteor._reload.reload();
                }).catch(function (err) {

                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            // Meteor._reload.reload();
                        } else if (result.dismiss == 'cancel') {

                        }
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });
            }

            // if(deptID == ""){

            //     taxRateService.checkDepartmentByName(deptName).then(function (data) {
            //         deptID = data.tdeptclass[0].Id;
            //         objDetails = {
            //             type: "TDeptClass",
            //             fields: {
            //                 ID: deptID||0,
            //                 Active: true,
            //                 //DeptClassGroup: headerDept,
            //                 //DeptClassName: deptName,
            //                 Description: deptDesc,
            //                 SiteCode: siteCode,
            //                 StSClass: objStSDetails
            //             }
            //         };

            //         taxRateService.saveDepartment(objDetails).then(function (objDetails) {
            //             Meteor._reload.reload();
            //         }).catch(function (err) {
            //             swal({
            //                 title: 'Oooops...',
            //                 text: err,
            //                 type: 'error',
            //                 showCancelButton: false,
            //                 confirmButtonText: 'Try Again'
            //             }).then((result) => {
            //                 if (result.value) {
            //                     // Meteor._reload.reload();
            //                 } else if (result.dismiss == 'cancel') {

            //                 }
            //             });
            //             $('.fullScreenSpin').css('display','none');
            //         });

            //     }).catch(function (err) {
            //         objDetails = {
            //             type: "TDeptClass",
            //             fields: {
            //                 Active: true,
            //                 DeptClassName: deptName,
            //                 Description: deptDesc,
            //                 SiteCode: siteCode,
            //                 StSClass: objStSDetails
            //             }
            //         };

            //         taxRateService.saveDepartment(objDetails).then(function (objDetails) {
            //             Meteor._reload.reload();
            //         }).catch(function (err) {
            //             swal({
            //                 title: 'Oooops...',
            //                 text: err,
            //                 type: 'error',
            //                 showCancelButton: false,
            //                 confirmButtonText: 'Try Again'
            //             }).then((result) => {
            //                 if (result.value) {
            //                     // Meteor._reload.reload();
            //                 } else if (result.dismiss == 'cancel') {

            //                 }
            //             });
            //             $('.fullScreenSpin').css('display','none');
            //         });
            //     });

            // }else{
            //     objDetails = {
            //         type: "TDeptClass",
            //         fields: {
            //             ID: deptID,
            //             Active: true,
            //             //  DeptClassGroup: headerDept,
            //             DeptClassName: deptName,
            //             Description: deptDesc,
            //             SiteCode: siteCode,
            //             StSClass: objStSDetails
            //         }
            //     };

            //     taxRateService.saveDepartment(objDetails).then(function (objDetails) {
            //         Meteor._reload.reload();
            //     }).catch(function (err) {
            //         swal({
            //             title: 'Oooops...',
            //             text: err,
            //             type: 'error',
            //             showCancelButton: false,
            //             confirmButtonText: 'Try Again'
            //         }).then((result) => {
            //             if (result.value) {
            //                 // Meteor._reload.reload();
            //             } else if (result.dismiss == 'cancel') {

            //             }
            //         });
            //         $('.fullScreenSpin').css('display','none');
            //     });
            // }
        }, delayTimeAfterSound);
    },
    'click #chkSameAsShipping': function (event) {
        /*if($(event.target).is(':checked')){
      let streetAddress = $('#edtCustomerShippingAddress').val();
      let city = $('#edtCustomerShippingCity').val();
      let state =  $('#edtCustomerShippingState').val();
      let zipcode =  $('#edtCustomerShippingZIP').val();
      let country =  $('#sedtCountry').val();

       $('#edtCustomerBillingAddress').val(streetAddress);
       $('#edtCustomerBillingCity').val(city);
       $('#edtCustomerBillingState').val(state);
       $('#edtCustomerBillingZIP').val(zipcode);
       $('#bedtCountry').val(country);
    }else{
      $('#edtCustomerBillingAddress').val('');
      $('#edtCustomerBillingCity').val('');
      $('#edtCustomerBillingState').val('');
      $('#edtCustomerBillingZIP').val('');
      $('#bedtCountry').val('');
    }
    */
    },
    'click .btnSave': async function (e) {
        playSaveAudio();
        let templateObject = Template.instance();
        let contactService = new ContactService();
        let uploadedItems = templateObject.uploadedFiles.get();
        setTimeout(async function () {

            $('.fullScreenSpin').css('display', 'inline-block');
            let company = $('#edtCustomerCompany').val() || '';
            let email = $('#edtCustomerEmail').val() || '';
            let title = $('#edtTitle').val() || '';
            let firstname = $('#edtFirstName').val() || '';
            let middlename = $('#edtMiddleName').val() || '';
            let lastname = $('#edtLastName').val() || '';
            // let suffix = $('#edtSuffix').val();
            let country = $('#sedtCountry').val() || '';
            let phone = $('#edtCustomerPhone').val() || '';
            let mobile = $('#edtCustomerMobile').val() || '';
            if (mobile != '') {
                mobile = contactService.changeDialFormat(mobile, country);
            }
            if (phone != '') {
                phone = contactService.changeDialFormat(phone, country);
            }
            let fax = $('#edtCustomerFax').val() || '';
            let accountno = $('#edtClientNo').val() || '';
            let skype = $('#edtCustomerSkypeID').val() || '';
            let website = $('#edtCustomerWebsite').val() || '';
            let streetAddress = $('#edtCustomerShippingAddress').val() || '';
            let city = $('#edtCustomerShippingCity').val() || '';
            let suburb = $('#edtCustomerShippingSuburb').val() || '';
            let state = $('#edtCustomerShippingState').val() || '';
            let postalcode = $('#edtCustomerShippingZIP').val() || '';

            let bstreetAddress = '';
            let bcity = '';
            let bstate = '';
            let bzipcode = '';
            let bcountry = '';
            let isSupplier = !!$('#chkSameAsSupplier').is(':checked');
            if ($('#chkSameAsShipping2').is(':checked')) {
                bstreetAddress = streetAddress;
                bcity = city;
                bstate = state;
                bzipcode = postalcode;
                bcountry = country;
            } else {
                bstreetAddress = $('#edtCustomerBillingAddress').val() || '';
                bcity = $('#edtCustomerBillingCity').val() || '';
                bstate = $('#edtCustomerBillingState').val() || '';
                bzipcode = $('#edtCustomerBillingZIP').val() || '';
                bcountry = $('#bedtCountry').val() || '';
            }
            let permanentDiscount = $('#edtCustomerCardDiscount').val() || 0;
            let sltPaymentMethodName = $('#sltPreferredPayment').val() || '';
            let sltTermsName = $('#sltTerms').val() || '';
            let sltShippingMethodName = '';
            let rewardPointsOpeningBalance = $('#custOpeningBalance').val() || '';
            // let sltRewardPointsOpeningDate =  $('#dtAsOf').val();
            const sltRewardPointsOpeningDate = new Date($("#dtAsOf").datepicker("getDate"));
            let openingDate = sltRewardPointsOpeningDate.getFullYear() + "-" + (sltRewardPointsOpeningDate.getMonth() + 1) + "-" + sltRewardPointsOpeningDate.getDate();
            let sltTaxCodeName = "";
            let isChecked = $(".chkTaxExempt").is(":checked");
            if (isChecked) {
                sltTaxCodeName = "NT";
            } else {
                sltTaxCodeName = $('#sltTaxCode').val() || '';
            }
            let notes = $('#txaNotes').val() || '';
            // add to custom field
            let custField1 = $('#edtCustomField1').val() || '';
            let custField2 = $('#edtCustomField2').val() || '';
            let custField3 = $('#edtCustomField3').val() || '';
            let custField4 = $('#edtCustomField4').val() || '';
            let customerType = $('#sltCustomerType').val() || '';

            let sourceName = $('#leadSource').val() || '';
            let repName = $('#leadRep').val() || '';
            let status = $('#leadStatus').val() || '';
            //let salesQuota = $('#edtSalesQuota').val()||'';

            if (company == '') {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: "Please provide the compamy name !",
                    text: '',
                    type: 'warning',
                }).then((result) => {
                    if (result.value) {
                        $('#edtCustomerCompany').focus();
                    } else if (result.dismiss == 'cancel') {

                    }
                });


                e.preventDefault();
                return false;
            }
            if (firstname == '') {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: "Please provide the first name !",
                    text: '',
                    type: 'warning',
                }).then((result) => {
                    if (result.value) {
                        $('#edtFirstName').focus();
                    } else if (result.dismiss == 'cancel') {

                    }
                });

                e.preventDefault();
                return false;
            }
            if (lastname == '') {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: "Please provide the last name !",
                    text: '',
                    type: 'warning',
                }).then((result) => {
                    if (result.value) {
                        $('#edtLastName').focus();
                    } else if (result.dismiss == 'cancel') {

                    }
                });
                e.preventDefault();
                return false;
            }
            if (sltTermsName == '') {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: "Terms has not been selected!",
                    text: '',
                    type: 'warning',
                }).then((result) => {
                    if (result.value) {
                        $('.bilingTab').trigger('click');
                        $('#sltTerms').focus();
                    } else if (result.dismiss == 'cancel') {

                    }
                });
                e.preventDefault();
                return false;
            }
            if (sltTaxCodeName == '') {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: "Tax Code has not been selected!",
                    text: '',
                    type: 'warning',
                }).then((result) => {
                    if (result.value) {
                        $('.taxTab').trigger('click');
                        $('#sltTaxCode').focus();
                    } else if (result.dismiss == 'cancel') {

                    }
                });
                e.preventDefault();
                return false;
            }

            const url = FlowRouter.current().path;
            const getemp_id = url.split('?id=');
            let currentEmployee = getemp_id[getemp_id.length - 1];
            let objDetails = '';
            let TCustomerID = 0;
            if (getemp_id[1]) {
                TCustomerID = parseInt(currentEmployee);
            } else {
                let checkCustData = await contactService.getCheckCustomersData(company) || '';
                if (checkCustData !== '') {
                    if (checkCustData.tcustomer.length) {
                        TCustomerID = checkCustData.tcustomer[0].Id;
                    }
                }
            }
            objDetails = {
                type: "TCustomerEx",
                fields: {
                    ID: TCustomerID,
                    Title: title,
                    ClientName: company,
                    FirstName: firstname,
                    MiddleName: middlename,
                    CUSTFLD10: middlename,
                    LastName: lastname,
                    PublishOnVS1: true,
                    Email: email,
                    Phone: phone,
                    Mobile: mobile,
                    SkypeName: skype,
                    Faxnumber: fax,
                    // Sex: gender,
                    ClientTypeName: customerType,
                    // Position: position,
                    Street: streetAddress,
                    Street2: city,
                    Suburb: suburb,
                    State: state,
                    PostCode: postalcode,
                    Country: country,
                    BillStreet: bstreetAddress,
                    BillStreet2: bcity,
                    BillState: bstate,
                    BillPostCode: bzipcode,
                    Billcountry: bcountry,
                    IsSupplier: isSupplier,
                    Notes: notes,
                    // CustFld1: custfield1,
                    // CustFld2: custfield2,
                    URL: website,
                    PaymentMethodName: sltPaymentMethodName,
                    TermsName: sltTermsName,
                    ShippingMethodName: sltShippingMethodName,
                    // RewardPointsOpeningBalance:parseInt(rewardPointsOpeningBalance),
                    // RewardPointsOpeningDate:openingDate,
                    TaxCodeName: sltTaxCodeName,
                    Attachments: uploadedItems,
                    CUSTFLD1: custField1,
                    CUSTFLD2: custField2,
                    CUSTFLD3: custField3,
                    // CUSTFLD4: custField4,
                    Discount: parseFloat(permanentDiscount) || 0,
                    Status: status,
                    SourceName: sourceName,
                    RepName: repName,
                    //CUSTFLD12: salesQuota,
                    ForeignExchangeCode: $("#sltCurrency").val(),
                }
            };
            contactService.saveCustomerEx(objDetails).then(function (objDetails) {
                let customerSaveID = objDetails.fields.ID;
                if (customerSaveID) {
                    sideBarService.getAllCustomersDataVS1(initialBaseDataLoad, 0).then(function (dataReload) {
                        addVS1Data('TCustomerVS1', JSON.stringify(dataReload)).then(function (datareturn) {
                            window.open('/customerlist', '_self');
                        }).catch(function (err) {
                            window.open('/customerlist', '_self');
                        });
                    }).catch(function (err) {
                        window.open('/customerlist', '_self');
                    });
                }
            }).catch(function (err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        // Meteor._reload.reload();
                    } else if (result.dismiss == 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        }, delayTimeAfterSound);
    },
    'click .btnSaveJob': function (event) {
        playSaveAudio();
        let templateObject = Template.instance();
        let contactService = new ContactService();
        setTimeout(function () {

            $('.fullScreenSpin').css('display', 'inline-block');

            let companyJob = $('#edtJobCustomerCompany').val() || '';
            let companyParent = $('#edtParentJobCustomerCompany').val() || '';

            let addressValid = false;
            let emailJob = $('#edtJobCustomerEmail').val() || '';
            let titleJob = $('#edtJobTitle').val() || '';
            let firstnameJob = $('#edtJobFirstName').val() || '';
            let middlenameJob = $('#edtJobMiddleName').val() || '';
            let lastnameJob = $('#edtJobLastName').val() || '';
            // let suffixJob = $('#edtSuffix').val();
            let phoneJob = $('#edtJobCustomerPhone').val() || '';
            let mobileJob = $('#edtJobCustomerMobile').val() || '';
            let faxJob = $('#edtJobCustomerFax').val() || '';
            // let accountnoJob = $('#edtClientNo').val();
            let skypeJob = $('#edtJobCustomerSkypeID').val() || '';
            let websiteJob = $('#edtJobCustomerWebsite').val() || '';

            let jobTitle = $('#edtJob_Title').val() || '';
            let jobName = $('#edtJobName').val() || '';
            let jobNumber = $('#edtJobNumber').val() || '';
            let jobReg = $('#edtJobReg').val() || '';
            let bstreetAddressJob = '';
            let bcityJob = '';
            let bstateJob = '';
            let bzipcodeJob = '';
            let bcountryJob = '';

            let streetAddressJob = '';
            let cityJob = '';
            let stateJob = '';
            let postalcodeJob = '';
            let countryJob = '';

            if ($('#chkJobSameAsShipping2').is(':checked')) {
                streetAddressJob = $('.tab-Job4 #edtJobCustomerShippingAddress').val();
                cityJob = $('.tab-Job4 #edtJobCustomerShippingCity').val();
                stateJob = $('.tab-Job4 #edtJobCustomerShippingState').val();
                postalcodeJob = $('.tab-Job4 #edtJobCustomerShippingZIP').val();
                countryJob = $('.tab-Job4 #sedtJobCountry').val();
                bstreetAddressJob = streetAddressJob;
                bcityJob = cityJob;
                bstateJob = stateJob;
                bzipcodeJob = postalcodeJob;
                bcountryJob = countryJob;
                addressValid = true;
            } else if ($('#chkJobSameAsShipping2NoPOP').is(':checked')) {
                streetAddressJob = $('#edtJobCustomerShippingAddress').val();
                cityJob = $('#edtJobCustomerShippingCity').val();
                stateJob = $('#edtJobCustomerShippingState').val();
                postalcodeJob = $('#edtJobCustomerShippingZIP').val();
                countryJob = $('#sedtJobCountry').val();
                bstreetAddressJob = streetAddressJob;
                bcityJob = cityJob;
                bstateJob = stateJob;
                bzipcodeJob = postalcodeJob;
                bcountryJob = countryJob;
            } else {
                bstreetAddressJob = $('#edtCustomerBillingAddress').val();
                bcityJob = $('#edtJobCustomerBillingCity').val();
                bstateJob = $('#edtJobCustomerBillingState').val();
                bzipcodeJob = $('#edtJobCustomerBillingZIP').val();
                bcountryJob = $('#sJobedtCountry').val();
            }

            let sltPaymentMethodNameJob = $('#sltJobPreferredPayment').val() || 'Cash';
            let sltTermsNameJob = $('#sltJobTerms').val() || '';
            let sltShippingMethodNameJob = '';//$('#sltJobDeliveryMethod').val();
            let rewardPointsOpeningBalanceJob = $('#custJobOpeningBalance').val() || '';
            const sltRewardPointsOpeningDateJob = new Date($("#dtJobAsOf").datepicker("getDate")) || '';
            let openingDateJob = sltRewardPointsOpeningDateJob.getFullYear() + "-" + (sltRewardPointsOpeningDateJob.getMonth() + 1) + "-" + sltRewardPointsOpeningDateJob.getDate() || '';

            // let sltTaxCodeNameJob =  $('#sltJobTaxCode').val();
            let uploadedItemsJob = templateObject.uploadedFilesJob.get();
            let uploadedItemsJobNoPOP = templateObject.uploadedFilesJobNoPOP.get();
            let sltTaxCodeNameJob = "";
            let isChecked = $(".chkJobTaxExempt").is(":checked");
            if (isChecked) {
                sltTaxCodeNameJob = "NT";
            } else {
                sltTaxCodeNameJob = $('#sltJobTaxCode').val() || '';
            }

            let notesJob = $('#txaJobNotes').val() || '';
            let customerTypeJob = $('#sltJobCustomerType').val() || '';
            const url = FlowRouter.current().path;
            const getemp_id = url.split('?jobid=');
            const currentEmployeeJob = getemp_id[getemp_id.length - 1];
            let currentId = FlowRouter.current().queryParams;
            let objDetails = '';
            if (getemp_id[1]) {
                objDetails = {
                    type: "TJobEx",
                    fields: {
                        ID: parseInt(currentId.jobid),
                        Title: $('.jobTabEdit #edtJobTitle').val() || '',
                        //clientName:companyJob,
                        // ParentClientName: $('.jobTabEdit #edtParentJobCustomerCompany').val() || '',
                        // ParentCustomerName: $('.jobTabEdit #edtParentJobCustomerCompany').val() || '',
                        FirstName: $('.jobTabEdit #edtJobFirstName').val() || '',
                        MiddleName: $('.jobTabEdit #edtJobMiddleName').val() || '',
                        LastName: $('.jobTabEdit #edtJobLastName').val() || '',
                        Email: $('.jobTabEdit #edtJobCustomerEmail').val() || '',
                        Phone: $('.jobTabEdit #edtJobCustomerPhone').val() || '',
                        Mobile: $('.jobTabEdit #edtJobCustomerMobile').val() || '',
                        SkypeName: $('.jobTabEdit #edtJobCustomerSkypeID').val() || '',
                        Street: streetAddressJob,
                        Street2: cityJob,
                        State: stateJob,
                        PostCode: postalcodeJob,
                        Country: $('.tab-Job4 #sedtJobCountry').val() || '',
                        BillStreet: bstreetAddressJob,
                        BillStreet2: bcityJob,
                        BillState: bstateJob,
                        BillPostCode: bzipcodeJob,
                        Billcountry: bcountryJob,
                        Notes: $('.tab-Job5 #txaJobNotes').val() || '',
                        CUSTFLD9: $('.jobTabEdit #edtJobCustomerWebsite').val() || '',
                        PaymentMethodName: sltPaymentMethodNameJob || '',
                        TermsName: sltTermsNameJob || '',
                        ClientTypeName: customerTypeJob || '',
                        ShippingMethodName: sltShippingMethodNameJob || '',
                        // RewardPointsOpeningBalance:parseInt(rewardPointsOpeningBalanceJob),
                        // RewardPointsOpeningDate:openingDateJob,
                        TaxCodeName: sltTaxCodeNameJob || '',
                        // JobName:$('.jobTabEdit #edtJobName').val() || '',
                        Faxnumber: $('.jobTabEdit #edtJobCustomerFax').val() || '',
                        JobNumber: parseInt($('.jobTabEdit #edtJobNumber').val()) || 0,
                        // JobRegistration:$('.jobTabEdit #edtJobReg').val() || '',
                        // JobTitle:$('.jobTabEdit #edtJob_Title').val() || '',
                        Attachments: uploadedItemsJobNoPOP || ''

                    }
                };
            } else {
                objDetails = {
                    type: "TJobEx",
                    fields: {
                        Title: titleJob,
                        //clientName:companyJob,
                        ParentClientName: companyParent,
                        ParentCustomerName: companyParent,
                        FirstName: firstnameJob,
                        MiddleName: middlenameJob,
                        LastName: lastnameJob,
                        Email: emailJob,
                        Phone: phoneJob,
                        Mobile: mobileJob,
                        SkypeName: skypeJob,
                        Street: streetAddressJob,
                        Street2: cityJob,
                        State: stateJob,
                        PostCode: postalcodeJob,
                        Country: countryJob,
                        BillStreet: bstreetAddressJob,
                        BillStreet2: bcityJob,
                        BillState: bstateJob,
                        BillPostCode: bzipcodeJob,
                        Billcountry: bcountryJob,
                        Notes: notesJob,
                        CUSTFLD9: websiteJob,
                        PaymentMethodName: sltPaymentMethodNameJob,
                        TermsName: sltTermsNameJob,
                        ClientTypeName: customerTypeJob,
                        ShippingMethodName: sltShippingMethodNameJob,
                        // RewardPointsOpeningBalance:parseInt(rewardPointsOpeningBalanceJob),
                        // RewardPointsOpeningDate:openingDateJob,
                        TaxCodeName: sltTaxCodeNameJob,
                        Faxnumber: faxJob,
                        JobName: jobName,
                        JobNumber: parseFloat(jobNumber) || 0,
                        // JobRegistration:jobReg,
                        // JobTitle:jobTitle,
                        Attachments: uploadedItemsJob

                    }
                };
            }

            contactService.saveJobEx(objDetails).then(function (objDetails) {
                $('.modal-backdrop').css('display', 'none');
                sideBarService.getAllJobssDataVS1(initialBaseDataLoad, 0).then(function (dataReload) {
                    addVS1Data('TJobVS1', JSON.stringify(dataReload)).then(function (datareturn) {
                        FlowRouter.go('/joblist?success=true');
                    }).catch(function (err) {
                        FlowRouter.go('/joblist?success=true');
                    });
                }).catch(function (err) {
                    FlowRouter.go('/joblist?success=true');
                });
                sideBarService.getAllCustomersDataVS1(initialBaseDataLoad, 0).then(function (dataReload) {
                    addVS1Data('TCustomerVS1', JSON.stringify(dataReload)).then(function (datareturn) {

                    }).catch(function (err) {

                    });
                }).catch(function (err) {

                });
                // let customerSaveID = FlowRouter.current().queryParams;
                //   if(!isNaN(customerSaveID.id)){
                //         window.open('/customerscard?id=' + customerSaveID,'_self');
                //    }else if(!isNaN(customerSaveID.jobid)){
                //      window.open('/customerscard?jobid=' + customerSaveID,'_self');
                //    }else{
                //
                //    }
            }).catch(function (err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        //Meteor._reload.reload();
                    } else if (result.dismiss == 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        }, delayTimeAfterSound);
    },
    'keyup .search': function (event) {
        const searchTerm = $(".search").val();
        const listItem = $('.results tbody').children('tr');
        const searchSplit = searchTerm.replace(/ /g, "'):containsi('");
        $.extend($.expr[':'], {
            'containsi': function (elem, i, match, array) {
                return (elem.textContent || elem.innerText || '').toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
            }
        });
        $(".results tbody tr").not(":containsi('" + searchSplit + "')").each(function (e) {
            $(this).attr('visible', 'false');
        });
        $(".results tbody tr:containsi('" + searchSplit + "')").each(function (e) {
            $(this).attr('visible', 'true');
        });
        const jobCount = $('.results tbody tr[visible="true"]').length;
        $('.counter').text(jobCount + ' items');
        if (jobCount == '0') { $('.no-result').show(); }
        else {
            $('.no-result').hide();
        }
        if (searchTerm == "") {
            $(".results tbody tr").each(function (e) {
                $(this).attr('visible', 'true');
                $('.no-result').hide();
            });

            //setTimeout(function () {
            var rowCount = $('.results tbody tr').length;
            $('.counter').text(rowCount + ' items');
            //}, 500);
        }

    },
    'click .tblCustomerSideList tbody tr': function (event) {
        const custLineID = $(event.target).attr('id');
        const custLineClass = $(event.target).attr('class');
        if (custLineID) {
            if (custLineClass == 'true') {
                window.open('/customerscard?jobid=' + custLineID, '_self');
            } else {
                window.open('/customerscard?id=' + custLineID, '_self');
            }
        }
    },
    'click .chkDatatable': function (event) {
        const columns = $('#tblTransactionlist th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();
        $.each(columns, function (i, v) {
            let className = v.classList;
            let replaceClass = className[1];
            if (v.innerText == columnDataValue) {
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
    'click .resetTable': function (event) {
        let checkPrefDetails = getCheckPrefDetails();
        if (checkPrefDetails) {
            CloudPreference.remove({ _id: checkPrefDetails._id }, function (err, idTag) {
                if (err) {

                } else {
                    Meteor._reload.reload();
                }
            });
        }
    },
    'click .saveTable': function (event) {
        let lineItems = [];
        //let datatable =$('#tblTransactionlist').DataTable();
        $('.columnSettings').each(function (index) {
            const $tblrow = $(this);
            const colTitle = $tblrow.find(".divcolumn").text() || '';
            const colWidth = $tblrow.find(".custom-range").val() || 0;
            const colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
            const colHidden = !$tblrow.find(".custom-control-input").is(':checked');
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass
            };
            lineItems.push(lineItemObj);
        });
        //datatable.state.save();

        const getcurrentCloudDetails = CloudUser.findOne({
            _id: Session.get('mycloudLogonID'),
            clouddatabaseID: Session.get('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblTransactionlist' });
                if (checkPrefDetails) {
                    CloudPreference.update({ _id: checkPrefDetails._id }, {
                        $set: {
                            userid: clientID, username: clientUsername, useremail: clientEmail,
                            PrefGroup: 'salesform', PrefName: 'tblTransactionlist', published: true,
                            customFields: lineItems,
                            updatedAt: new Date()
                        }
                    }, function (err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');
                        }
                    });

                } else {
                    CloudPreference.insert({
                        userid: clientID, username: clientUsername, useremail: clientEmail,
                        PrefGroup: 'salesform', PrefName: 'tblTransactionlist', published: true,
                        customFields: lineItems,
                        createdAt: new Date()
                    }, function (err, idTag) {
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
        //Meteor._reload.reload();
    },
    'blur .divcolumn': function (event) {
        let columData = $(event.target).text();
        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
        const datable = $('#tblTransactionlist').DataTable();
        const title = datable.column(columnDatanIndex).header();
        $(title).html(columData);
    },
    'change .rngRange': function (event) {
        let range = $(event.target).val();
        // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');
        // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        const datable = $('#tblTransactionlist th');
        $.each(datable, function (i, v) {
            if (v.innerText == columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css('width', range + 'px');
            }
        });
    },
    'click .btnOpenSettingsTransaction': function (event) {
        let templateObject = Template.instance();
        const columns = $('#tblTransactionlist th');
        const tableHeaderList = [];
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function (i, v) {
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
    },
    'click .btnOpenSettingsCrm': function (event) {
        let templateObject = Template.instance();
        const columns = $('#tblCrmList th');
        const tableHeaderList = [];
        let sWidth = "";
        let columVisible = false;
        $.each(columns, function (i, v) {
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
    },
    'click #exportbtnTransaction': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblTransactionlist_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');
    },
    'click #exportbtnCrm': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblCrmList_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');
    },
    'click #exportbtnJob': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblJoblist_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');
    },
    'click .printConfirmTransaction': function (event) {
        playPrintAudio();
        setTimeout(function () {
            $('.fullScreenSpin').css('display', 'inline-block');
            jQuery('#tblTransactionlist_wrapper .dt-buttons .btntabletopdf').click();
            $('.fullScreenSpin').css('display', 'none');
        }, delayTimeAfterSound);
    },
    'click .printConfirmCrm': function (event) {
        playPrintAudio();
        setTimeout(function () {
            $('.fullScreenSpin').css('display', 'inline-block');
            jQuery('#tblCrmList_wrapper .dt-buttons .btntabletopdf').click();
            $('.fullScreenSpin').css('display', 'none');
        }, delayTimeAfterSound);
    },
    'click .printConfirmJob': function (event) {
        playPrintAudio();
        setTimeout(function () {
            $('.fullScreenSpin').css('display', 'inline-block');
            jQuery('#tblJoblist_wrapper .dt-buttons .btntabletopdf').click();
            $('.fullScreenSpin').css('display', 'none');
        }, delayTimeAfterSound);
    },
    'click .btnRefresh': function () {
        Meteor._reload.reload();
    },
    'click .btnRefreshTransaction': function () {
        let currentId = FlowRouter.current().queryParams;
        $('.fullScreenSpin').css('display', 'inline-block');
        sideBarService.getTTransactionListReport().then(function (data) {
            addVS1Data('TTransactionListReport', JSON.stringify(data)).then(function (datareturn) {
                if (!isNaN(currentId.jobid)) {
                    window.open('/customerscard?jobid=' + currentId.jobid + '&transTab=active', '_self');
                }
                if (!isNaN(currentId.id)) {
                    window.open('/customerscard?id=' + currentId.id + '&transTab=active', '_self');
                }
            }).catch(function (err) {
                if (!isNaN(currentId.jobid)) {
                    window.open('/customerscard?jobid=' + currentId.jobid + '&transTab=active', '_self');
                }
                if (!isNaN(currentId.id)) {
                    window.open('/customerscard?id=' + currentId.id + '&transTab=active', '_self');
                }
            });
        }).catch(function (err) {
            if (!isNaN(currentId.jobid)) {
                window.open('/customerscard?jobid=' + currentId.jobid + '&transTab=active', '_self');
            }
            if (!isNaN(currentId.id)) {
                window.open('/customerscard?id=' + currentId.id + '&transTab=active', '_self');
            }
        });
    },
    'click .btnRefreshJobDetails': function () {
        let currentId = FlowRouter.current().queryParams;
        $('.fullScreenSpin').css('display', 'inline-block');
        sideBarService.getAllJobssDataVS1(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TJobVS1', JSON.stringify(data)).then(function (datareturn) {
                if (!isNaN(currentId.jobid)) {
                    window.open('/customerscard?jobid=' + currentId.jobid + '&transTab=job', '_self');
                }

                if (!isNaN(currentId.id)) {
                    window.open('/customerscard?id=' + currentId.id + '&transTab=job', '_self');
                }

            }).catch(function (err) {
                if (!isNaN(currentId.jobid)) {
                    window.open('/customerscard?jobid=' + currentId.jobid + '&transTab=job', '_self');
                }

                if (!isNaN(currentId.id)) {
                    window.open('/customerscard?id=' + currentId.id + '&transTab=job', '_self');
                }
            });
        }).catch(function (err) {
            if (!isNaN(currentId.jobid)) {
                window.open('/customerscard?jobid=' + currentId.jobid + '&transTab=job', '_self');
            }

            if (!isNaN(currentId.id)) {
                window.open('/customerscard?id=' + currentId.id + '&transTab=job', '_self');
            }
        });
    },
    'click .btnRefreshCrm': function () {
        let currentId = FlowRouter.current().queryParams;
        $('.fullScreenSpin').css('display', 'inline-block');
        sideBarService.getTProjectTasks().then(function (data) {
            addVS1Data('TProjectTasks', JSON.stringify(data)).then(function (datareturn) {
                if (!isNaN(currentId.jobid)) {
                    window.open('/customerscard?jobid=' + currentId.jobid + '&transTab=crm', '_self');
                }
                if (!isNaN(currentId.id)) {
                    window.open('/customerscard?id=' + currentId.id + '&transTab=crm', '_self');
                }
            }).catch(function (err) {
                if (!isNaN(currentId.jobid)) {
                    window.open('/customerscard?jobid=' + currentId.jobid + '&transTab=crm', '_self');
                }
                if (!isNaN(currentId.id)) {
                    window.open('/customerscard?id=' + currentId.id + '&transTab=crm', '_self');
                }
            });
        }).catch(function (err) {
            if (!isNaN(currentId.jobid)) {
                window.open('/customerscard?jobid=' + currentId.jobid + '&transTab=crm', '_self');
            }
            if (!isNaN(currentId.id)) {
                window.open('/customerscard?id=' + currentId.id + '&transTab=crm', '_self');
            }
        });
    },
    'click #formCheck-2': function () {
        if ($(event.target).is(':checked')) {
            $('#autoUpdate').css('display', 'none');
        } else {
            $('#autoUpdate').css('display', 'block');
        }
    },
    'click #formCheckJob-2': function (event) {
        if ($(event.target).is(':checked')) {
            $('#autoUpdateJob').css('display', 'none');
        } else {
            $('#autoUpdateJob').css('display', 'block');
        }
    },
    'click #activeChk': function (event) {
        if ($(event.target).is(':checked')) {
            $('#customerInfo').css('color', '#00A3D3');
        } else {
            $('#customerInfo').css('color', '#b7b9cc !important');
        }
    },
    'click #btnNewProject': function (event) {
        const x2 = document.getElementById("newProject");
        if (x2.style.display == "none") {
            x2.style.display = "block";
        } else {
            x2.style.display = "none";
        }
    },
    'keydown #custOpeningBalance, keydown #edtJobNumber, keydown #edtCustomerCardDiscount': function (event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
            // Allow: Ctrl+A, Command+A
            (event.keyCode == 65 && (event.ctrlKey == true || event.metaKey == true)) ||
            // Allow: home, end, left, right, down, up
            (event.keyCode >= 35 && event.keyCode <= 40)) {
            // let it happen, don't do anything
            return;
        }
        if (event.shiftKey == true) {
            event.preventDefault();
        }
        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
            (event.keyCode >= 96 && event.keyCode <= 105) ||
            event.keyCode == 8 || event.keyCode == 9 ||
            event.keyCode == 37 || event.keyCode == 39 ||
            event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 189) {
        } else {
            event.preventDefault();
        }
    },
    'click .new_attachment_btn': function (event) {
        $('#attachment-upload').trigger('click');
    },
    'click #formCheck-one': function (event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox1div').css('display', 'block');
        } else {
            $('.checkbox1div').css('display', 'none');
        }
    },
    'click #formCheck-two': function (event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox2div').css('display', 'block');
        } else {
            $('.checkbox2div').css('display', 'none');
        }
    },
    'click #formCheck-three': function (event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox3div').css('display', 'block');
        } else {
            $('.checkbox3div').css('display', 'none');
        }
    },
    'click #formCheck-four': function (event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox4div').css('display', 'block');
        } else {
            $('.checkbox4div').css('display', 'none');
        }
    },
    // 'blur .customField1Text': function (event) {
    //     const inputValue1 = $('.customField1Text').text();
    //     $('.lblCustomField1').text(inputValue1);
    // },
    // 'blur .customField2Text': function (event) {
    //     const inputValue2 = $('.customField2Text').text();
    //     $('.lblCustomField2').text(inputValue2);
    // },
    // 'blur .customField3Text': function (event) {
    //     const inputValue3 = $('.customField3Text').text();
    //     $('.lblCustomField3').text(inputValue3);
    // },
    // 'blur .customField4Text': function (event) {
    //     const inputValue4 = $('.customField4Text').text();
    //     $('.lblCustomField4').text(inputValue4);
    // },
    // add to custom field
    "click #edtSaleCustField1": function (e) {
        $("#clickedControl").val("one");
    },
    // add to custom field
    "click #edtSaleCustField2": function (e) {
        $("#clickedControl").val("two");
    },
    // add to custom field
    "click #edtSaleCustField3": function (e) {
        $("#clickedControl").val("three");
    },
    "click #edtSaleCustField4": function (e) {
        $("#clickedControl").val("four");
    },
    'click .btnOpenSettings': function (event) {
    },
    'click .btnSaveSettings': function (event) {
        playSaveAudio();
        let templateObject = Template.instance();
        setTimeout(function () {
            $('.lblCustomField1').html('');
            $('.lblCustomField2').html('');
            $('.lblCustomField3').html('');
            $('.lblCustomField4').html('');
            let getchkcustomField1 = true;
            let getchkcustomField2 = true;
            let getchkcustomField3 = true;
            let getchkcustomField4 = true;
            let getcustomField1 = $('.customField1Text').html();
            let getcustomField2 = $('.customField2Text').html();
            let getcustomField3 = $('.customField3Text').html();
            let getcustomField4 = $('.customField4Text').html();
            if ($('#formCheck-one').is(':checked')) {
                getchkcustomField1 = false;
            }
            if ($('#formCheck-two').is(':checked')) {
                getchkcustomField2 = false;
            }
            if ($('#formCheck-three').is(':checked')) {
                getchkcustomField3 = false;
            }
            if ($('#formCheck-four').is(':checked')) {
                getchkcustomField4 = false;
            }
            $('#customfieldModal').modal('toggle');
        }, delayTimeAfterSound);
    },
    'click .btnResetSettings': function (event) {
        let checkPrefDetails = getCheckPrefDetails();
        if (checkPrefDetails) {
            CloudPreference.remove({ _id: checkPrefDetails._id }, function (err, idTag) {
                if (err) {

                } else {
                    let customerSaveID = FlowRouter.current().queryParams;
                    if (!isNaN(customerSaveID.id)) {
                        window.open('/customerscard?id=' + customerSaveID, '_self');
                    } else if (!isNaN(customerSaveID.jobid)) {
                        window.open('/customerscard?jobid=' + customerSaveID, '_self');
                    } else {
                        window.open('/customerscard', '_self');
                    }
                    //Meteor._reload.reload();
                }
            });
        }
    },
    // 'click .new_attachment_btn': function (event) {
    //     $('#attachment-upload').trigger('click');
    //
    // },
    'change #attachment-upload': function (e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFiles.get();
        let myFiles = $('#attachment-upload')[0].files;
        let uploadData = utilityService.attachmentUploadTabs(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCount.set(uploadData.totalAttachments);
    },
    'click .img_new_attachment_btn': function (event) {
        $('#img-attachment-upload').trigger('click');
    },
    'change #img-attachment-upload': function (e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFiles.get();
        let myFiles = $('#img-attachment-upload')[0].files;
        let uploadData = utilityService.attachmentUpload(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCount.set(uploadData.totalAttachments);
    },
    'click .remove-attachment': function (event, ui) {
        let tempObj = Template.instance();
        let attachmentID = parseInt(event.target.id.split('remove-attachment-')[1]);
        if (tempObj.$("#confirm-action-" + attachmentID).length) {
            tempObj.$("#confirm-action-" + attachmentID).remove();
        } else {
            let actionElement = '<div class="confirm-action" id="confirm-action-' + attachmentID + '"><a class="confirm-delete-attachment btn btn-default" id="delete-attachment-' + attachmentID + '">'
                + 'Delete</a><button class="save-to-library btn btn-default">Remove & save to File Library</button></div>';
            tempObj.$('#attachment-name-' + attachmentID).append(actionElement);
        }
        tempObj.$("#new-attachment2-tooltip").show();
    },
    'click .file-name': function (event) {
        let attachmentID = parseInt(event.currentTarget.parentNode.id.split('attachment-name-')[1]);
        let templateObj = Template.instance();
        let uploadedFiles = templateObj.uploadedFiles.get();
        $('#myModalAttachment').modal('hide');
        let previewFile = getPreviewFile(uploadedFiles, attachmentID);
        templateObj.uploadedFile.set(previewFile);
        $('#files_view').modal('show');
    },
    'click .confirm-delete-attachment': function (event, ui) {
        let tempObj = Template.instance();
        tempObj.$("#new-attachment2-tooltip").show();
        let attachmentID = parseInt(event.target.id.split('delete-attachment-')[1]);
        let uploadedArray = tempObj.uploadedFiles.get();
        let attachmentCount = tempObj.attachmentCount.get();
        $('#attachment-upload').val('');
        uploadedArray.splice(attachmentID, 1);
        tempObj.uploadedFiles.set(uploadedArray);
        attachmentCount--;
        if (attachmentCount == 0) {
            let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
            $('#file-display').html(elementToAdd);
        }
        tempObj.attachmentCount.set(attachmentCount);
        if (uploadedArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentTabs(uploadedArray);
        } else {
            $(".attchment-tooltip").show();
        }
    },
    'click .attachmentTab': function () {
        let templateInstance = Template.instance();
        let uploadedFileArray = templateInstance.uploadedFiles.get();
        if (uploadedFileArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentTabs(uploadedFileArray);
        } else {
            $(".attchment-tooltip").show();
        }
    },
    'click .new_attachment_btnJobPOP': function (event) {
        $('#attachment-uploadJobPOP').trigger('click');
    },
    'change #attachment-uploadJobPOP': function (e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFilesJob.get();
        let myFiles = $('#attachment-uploadJobPOP')[0].files;
        let uploadData = utilityService.attachmentUploadJob(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFilesJob.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCountJob.set(uploadData.totalAttachments);
    },
    'click .remove-attachmentJobPOP': function (event, ui) {
        let tempObj = Template.instance();
        let attachmentID = parseInt(event.target.id.split('remove-attachmentJobPOP-')[1]);
        if (tempObj.$("#confirm-actionJobPOP-" + attachmentID).length) {
            tempObj.$("#confirm-actionJobPOP-" + attachmentID).remove();
        } else {
            let actionElement = '<div class="confirm-actionJobPOP" id="confirm-actionJobPOP-' + attachmentID + '"><a class="confirm-delete-attachmentJobPOP btn btn-default" id="delete-attachmentJobPOP-' + attachmentID + '">'
                + 'Delete</a><button class="save-to-libraryJobPOP btn btn-default">Remove & save to File Library</button></div>';
            tempObj.$('#attachment-nameJobPOP-' + attachmentID).append(actionElement);
        }
        tempObj.$("#new-attachment2-tooltipJobPOP").show();

    },
    'click .file-nameJobPOP': function (event) {
        let attachmentID = parseInt(event.currentTarget.parentNode.id.split('attachment-nameJobPOP-')[1]);
        let templateObj = Template.instance();
        let uploadedFiles = templateObj.uploadedFilesJob.get();
        $('#myModalAttachmentJobPOP').modal('hide');
        let previewFile = getPreviewFile(uploadedFiles, attachmentID);
        templateObj.uploadedFileJob.set(previewFile);
        $('#files_viewJobPOP').modal('show');
    },
    'click .confirm-delete-attachmentJobPOP': function (event, ui) {
        let tempObj = Template.instance();
        tempObj.$("#new-attachment2-tooltipJobPOP").show();
        let attachmentID = parseInt(event.target.id.split('delete-attachmentJobPOP-')[1]);
        let uploadedArray = tempObj.uploadedFilesJob.get();
        let attachmentCount = tempObj.attachmentCountJob.get();
        $('#attachment-uploadJobPOP').val('');
        uploadedArray.splice(attachmentID, 1);
        tempObj.uploadedFilesJob.set(uploadedArray);
        attachmentCount--;
        if (attachmentCount == 0) {
            let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
            $('#file-displayJobPOP').html(elementToAdd);
        }
        tempObj.attachmentCountJob.set(attachmentCount);
        if (uploadedArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentJob(uploadedArray);
        } else {
            $(".attchment-tooltipJobPOP").show();
        }
    },
    'click .attachmentTabJobPOP': function () {
        let templateInstance = Template.instance();
        let uploadedFileArray = templateInstance.uploadedFilesJob.get();
        if (uploadedFileArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentJob(uploadedFileArray);
        } else {
            $(".attchment-tooltipJobPOP").show();
        }
    },
    'click .new_attachment_btnJobNoPOP': function (event) {
        $('#attachment-uploadJobNoPOP').trigger('click');
    },
    'change #attachment-uploadJobNoPOP': function (e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArrayJob = templateObj.uploadedFilesJobNoPOP.get();
        let myFiles = $('#attachment-uploadJobNoPOP')[0].files;
        let uploadData = utilityService.attachmentUploadJobNoPOP(uploadedFilesArrayJob, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFilesJobNoPOP.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCountJobNoPOP.set(uploadData.totalAttachments);
    },
    'click .remove-attachmentJobNoPOP': function (event, ui) {
        let tempObj = Template.instance();
        let attachmentID = parseInt(event.target.id.split('remove-attachmentJobNoPOP-')[1]);
        if (tempObj.$("#confirm-actionJobNoPOP-" + attachmentID).length) {
            tempObj.$("#confirm-actionJobNoPOP-" + attachmentID).remove();
        } else {
            let actionElement = '<div class="confirm-actionJobNoPOP" id="confirm-actionJobNoPOP-' + attachmentID + '"><a class="confirm-delete-attachmentJobNoPOP btn btn-default" id="delete-attachmentJobNoPOP-' + attachmentID + '">'
                + 'Delete</a><button class="save-to-libraryJobNoPOP btn btn-default">Remove & save to File Library</button></div>';
            tempObj.$('#attachment-nameJobNoPOP-' + attachmentID).append(actionElement);
        }
        tempObj.$("#new-attachment2-tooltipJobNoPOP").show();
    },
    'click .file-nameJobNoPOP': function (event) {
        let attachmentID = parseInt(event.currentTarget.parentNode.id.split('attachment-nameJobNoPOP-')[1]);
        let templateObj = Template.instance();
        let uploadedFiles = templateObj.uploadedFilesJobNoPOP.get();
        //$('#myModalAttachmentJobNoPOP').modal('hide');
        let previewFile = getPreviewFile(uploadedFiles, attachmentID);
        templateObj.uploadedFileJobNoPOP.set(previewFile);
        $('#files_viewJobNoPOP').modal('show');
    },
    'click .confirm-delete-attachmentJobNoPOP': function (event, ui) {
        let tempObj = Template.instance();
        tempObj.$("#new-attachment2-tooltipJobNoPOP").show();
        let attachmentID = parseInt(event.target.id.split('delete-attachmentJobNoPOP-')[1]);
        let uploadedArray = tempObj.uploadedFilesJobNoPOP.get();
        let attachmentCount = tempObj.attachmentCountJobNoPOP.get();
        $('#attachment-uploadJobNoPOP').val('');
        uploadedArray.splice(attachmentID, 1);
        tempObj.uploadedFilesJobNoPOP.set(uploadedArray);
        attachmentCount--;
        if (attachmentCount == 0) {
            let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
            $('#file-displayJobNoPOP').html(elementToAdd);
        }
        tempObj.attachmentCountJobNoPOP.set(attachmentCount);
        if (uploadedArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentJobNoPOP(uploadedArray);
        } else {
            $(".attchment-tooltipJobNoPOP").show();
        }
    },
    'click .attachmentTabJobNoPOP': function () {
        let templateInstance = Template.instance();
        let uploadedFileArray = templateInstance.uploadedFilesJobNoPOP.get();
        if (uploadedFileArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentJobNoPOP(uploadedFileArray);
        } else {
            $(".attchment-tooltipJobNoPOP").show();
        }
    },
    'change .customerTypeSelect': function (event) {
        const custName = $('.customerTypeSelect').children("option:selected").val();
        if (custName == "newCust") {
            $('#myModalClientType').modal();
            $(this).prop("selected", false);
        }
    },
    'click #btnNewJob': function (event) {
        let templateObject = Template.instance();
        templateObject.getAllJobsIds();
    },
    'click .btnNewCustomer': function (event) {
        window.open('/customerscard', '_self');
    },
    'click .btnView': function (e) {
        const btnView = document.getElementById("btnView");
        const btnHide = document.getElementById("btnHide");
        const displayList = document.getElementById("displayList");
        const displayInfo = document.getElementById("displayInfo");
        if (displayList.style.display == "none") {
            displayList.style.display = "flex";
            $("#displayInfo").removeClass("col-12");
            $("#displayInfo").addClass("col-9");
            btnView.style.display = "none";
            btnHide.style.display = "flex";
        } else {
            displayList.style.display = "none";
            $("#displayInfo").removeClass("col-9");
            $("#displayInfo").addClass("col-12");
            btnView.style.display = "flex";
            btnHide.style.display = "none";
        }
    },
    'click .btnDeleteCustomer': function (event) {
        playDeleteAudio();
        let contactService = new ContactService();
        setTimeout(function () {
            $('.fullScreenSpin').css('display', 'inline-block');

            let currentId = FlowRouter.current().queryParams;
            let objDetails = '';
            if (!isNaN(currentId.id)) {
                let currentCustomer = parseInt(currentId.id);
                objDetails = {
                    type: "TCustomerEx",
                    fields: {
                        ID: currentCustomer,
                        Active: false
                    }
                };
                contactService.saveCustomerEx(objDetails).then(function (objDetails) {
                    FlowRouter.go('/customerlist?success=true');
                }).catch(function (err) {
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                        } else if (result.dismiss == 'cancel') {

                        }
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else {
                FlowRouter.go('/customerlist?success=true');
            }
            $('#deleteCustomerModal').modal('toggle');
        }, delayTimeAfterSound);
    },
    'click .btnCustomerTask': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let customerID = parseInt(currentId.id);
            FlowRouter.go('/crmoverview?customerid=' + customerID);
        } else {
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .btnCustomerEmail': function (event) {
        playEmailAudio();
        setTimeout(function () {
            $('.fullScreenSpin').css('display', 'inline-block');
            let currentId = FlowRouter.current().queryParams;
            if (!isNaN(currentId.id)) {
                let customerID = parseInt(currentId.id);
                $('#referenceLetterModal').modal('toggle');
                $('.fullScreenSpin').css('display', 'none');
            } else {
                $('.fullScreenSpin').css('display', 'none');
            }
        }, delayTimeAfterSound);
    },
    'click .btnCustomerAppointment': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let customerID = parseInt(currentId.id);
            FlowRouter.go('/appointments?customerid=' + customerID);
        } else {
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .btnCustomerQuote': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let customerID = parseInt(currentId.id);
            FlowRouter.go('/quotecard?customerid=' + customerID);
        } else {
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .btnCustomerSalesOrder': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let customerID = parseInt(currentId.id);
            FlowRouter.go('/salesordercard?customerid=' + customerID);
        } else {
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .btnCustomerInvoice': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let customerID = parseInt(currentId.id);
            FlowRouter.go('/invoicecard?customerid=' + customerID);
        } else {
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .btnCustomerRefund': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let customerID = parseInt(currentId.id);
            FlowRouter.go('/refundcard?customerid=' + customerID);
        } else {
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .btnJobTask': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.jobid)) {
            let customerID = parseInt(currentId.jobid);
            FlowRouter.go('/crmoverview?customerid=' + customerID);
        } else {
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .btnJobEmail': function (event) {
        playEmailAudio();
        setTimeout(function () {
            $('.fullScreenSpin').css('display', 'inline-block');
            let currentId = FlowRouter.current().queryParams;
            if (!isNaN(currentId.jobid)) {
                let customerID = parseInt(currentId.jobid);
                FlowRouter.go('/crmoverview?customerid=' + customerID);
            } else {
                $('.fullScreenSpin').css('display', 'none');
            }
        }, delayTimeAfterSound);
    },
    'click .btnJobAppointment': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.jobid)) {
            let customerID = parseInt(currentId.jobid);
            FlowRouter.go('/appointments?customerid=' + customerID);
        } else {
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .btnJobQuote': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.jobid)) {
            let customerID = parseInt(currentId.jobid);
            FlowRouter.go('/quotecard?customerid=' + customerID);
        } else {
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .btnJobSalesOrder': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.jobid)) {
            let customerID = parseInt(currentId.jobid);
            FlowRouter.go('/salesordercard?customerid=' + customerID);
        } else {
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .btnJobInvoice': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.jobid)) {
            let customerID = parseInt(currentId.jobid);
            FlowRouter.go('/invoicecard?customerid=' + customerID);
        } else {
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .btnJobRefund': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.jobid)) {
            let customerID = parseInt(currentId.jobid);
            FlowRouter.go('/refundcard?customerid=' + customerID);
        } else {
            $('.fullScreenSpin').css('display', 'none');
        }
    },
});

Template.customerscard.helpers({
    record: () => {
        let parentRecord = Template.parentData(0).record;
        if (parentRecord) {
            return parentRecord;
        } else {
            let temp = Template.instance().records.get();
            let phoneCodes = Template.instance().phoneCodeData.get();
            if (temp && temp.mobile && temp.country) {
                let thisCountry = phoneCodes.find(item => {
                    return item.name == temp.country
                })
                temp.mobile = temp.mobile.replace(thisCountry.dial_code, '0')
            }
            return temp;
        }
    },
    phoneCodeList: () => {
        return Template.instance().phoneCodeData.get();
    },
    countryList: () => {
        return Template.instance().countryData.get();
    },
    correspondences: () => {
        return Template.instance().correspondences.get();
    },
    customerrecords: () => {
        return Template.instance().customerrecords.get().sort(function (a, b) {
            if (a.company == 'NA') {
                return 1;
            }
            else if (b.company == 'NA') {
                return -1;
            }
            return (a.company.toUpperCase() > b.company.toUpperCase()) ? 1 : -1;
        });
    },
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.saledate == 'NA') {
                return 1;
            }
            else if (b.saledate == 'NA') {
                return -1;
            }
            return (a.saledate.toUpperCase() > b.saledate.toUpperCase()) ? 1 : -1;
        });
    },

    transactionTableHeaderItems: () => {
        return Template.instance().transactionTableHeaderItems.get();
    },
    jobDetailTableHeaderItems: () => {
        return Template.instance().jobDetailTableHeaderItems.get();
    },

    datatablerecordsjob: () => {
        return Template.instance().datatablerecordsjob.get().sort(function (a, b) {
            if (a.company == 'NA') {
                return 1;
            }
            else if (b.company == 'NA') {
                return -1;
            }
            return (a.company.toUpperCase() > b.company.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    tableheaderrecordsjob: () => {
        return Template.instance().tableheaderrecordsjob.get();
    },
    crmRecords: () => {
        return Template.instance().crmRecords.get().sort(function (a, b) {
            if (a.id == 'NA') {
                return 1;
            }
            else if (b.id == 'NA') {
                return -1;
            }
            return (a.id > b.id) ? 1 : -1;
        });
    },
    crmTableheaderRecords: () => {
        return Template.instance().crmTableheaderRecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: Session.get('mycloudLogonID'), PrefName: 'tblSalesOverview' });
    },
    currentdate: () => {
        const currentDate = new Date();
        return moment(currentDate).format("DD/MM/YYYY");
    },
    isJob: () => {
        let parentIsJob = Template.parentData(0).isJob;
        if(parentIsJob){
            return parentIsJob
        }else{
            return Template.instance().isJob.get();
        }
    },
    preferredPaymentList: () => {
        return Template.instance().preferredPaymentList.get();
    },
    termsList: () => {
        return Template.instance().termsList.get();
    },
    deliveryMethodList: () => {
        return Template.instance().deliveryMethodList.get();
    },
    clienttypeList: () => {
        return Template.instance().clienttypeList.get().sort(function (a, b) {
            if (a == 'NA') {
                return 1;
            }
            else if (b == 'NA') {
                return -1;
            }
            return (a.toUpperCase() > b.toUpperCase()) ? 1 : -1;
        });
    },
    taxCodeList: () => {
        return Template.instance().taxCodeList.get();
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
    uploadedFilesJob: () => {
        return Template.instance().uploadedFilesJob.get();
    },
    attachmentCountJob: () => {
        return Template.instance().attachmentCountJob.get();
    },
    uploadedFileJob: () => {
        return Template.instance().uploadedFileJob.get();
    },
    uploadedFilesJobNoPOP: () => {
        return Template.instance().uploadedFilesJobNoPOP.get();
    },
    attachmentCountJobNoPOP: () => {
        return Template.instance().attachmentCountJobNoPOP.get();
    },
    uploadedFileJobNoPOP: () => {
        return Template.instance().uploadedFileJobNoPOP.get();
    },
    currentAttachLineID: () => {
        return Template.instance().currentAttachLineID.get();
    },
    contactCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: Session.get('mycloudLogonID'), PrefName: 'customerscard' });
    },
    isSameAddress: () => {
        return Template.instance().isSameAddress.get();
    },
    isJobSameAddress: () => {
        return Template.instance().isJobSameAddress.get();
    },
    isMobileDevices: () => {
        let isMobile = false; //initiate as false
        // device detection
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            isMobile = true;
        }
        return isMobile;
    },
    setLeadStatus: (status) => status || 'Unqualified',
    formatPrice(amount) {
        let utilityService = new UtilityService();
        if (isNaN(amount) || !amount) {
            amount = (amount === undefined || amount === null || amount.length === 0) ? 0 : amount;
            amount = (amount) ? Number(amount.replace(/[^0-9.-]+/g, "")) : 0;
        }
        return utilityService.modifynegativeCurrencyFormat(amount) || 0.00;
    },
});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});
Template.registerHelper('notEquals', function (a, b) {
    return a != b;
});

function getPreviewFile(uploadedFiles, attachmentID) {
    let previewFile = {};
    let input = uploadedFiles[attachmentID].fields.Description;
    previewFile.link = 'data:' + input + ';base64,' + uploadedFiles[attachmentID].fields.Attachment;
    previewFile.name = uploadedFiles[attachmentID].fields.AttachmentName;
    let type = uploadedFiles[attachmentID].fields.Description;
    if (type == 'application/pdf') {
        previewFile.class = 'pdf-class';
    } else if (type == 'application/msword' || type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        previewFile.class = 'docx-class';
    }
    else if (type == 'application/vnd.ms-excel' || type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        previewFile.class = 'excel-class';
    }
    else if (type == 'application/vnd.ms-powerpoint' || type == 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        previewFile.class = 'ppt-class';
    }
    else if (type == 'application/vnd.oasis.opendocument.formula' || type == 'text/csv' || type == 'text/plain' || type == 'text/rtf') {
        previewFile.class = 'txt-class';
    }
    else if (type == 'application/zip' || type == 'application/rar' || type == 'application/x-zip-compressed' || type == 'application/x-zip,application/x-7z-compressed') {
        previewFile.class = 'zip-class';
    }
    else {
        previewFile.class = 'default-class';
    }
    previewFile.image = type.split('/')[0] == 'image';
    return previewFile;
}
function getCheckPrefDetails() {
    const getcurrentCloudDetails = CloudUser.findOne({
        _id: Session.get('mycloudLogonID'),
        clouddatabaseID: Session.get('mycloudLogonDBID')
    });
    let checkPrefDetails = null;
    if (getcurrentCloudDetails) {
        if (getcurrentCloudDetails._id.length > 0) {
            const clientID = getcurrentCloudDetails._id;
            const clientUsername = getcurrentCloudDetails.cloudUsername;
            const clientEmail = getcurrentCloudDetails.cloudEmail;
            checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'customerscard' });
        }
    }
    return checkPrefDetails;
}
function removeAttachment(suffix, event) {
    let tempObj = Template.instance();
    let attachmentID = parseInt(event.target.id.split('remove-attachment' + suffix + '-')[1]);
    if (tempObj.$("#confirm-action" + suffix + "-" + attachmentID).length) {
        tempObj.$("#confirm-action" + suffix + "-" + attachmentID).remove();
    } else {
        let actionElement = '<div class="confirm-action' + suffix + '" id="confirm-action' + suffix + '-' + attachmentID + '"><a class="confirm-delete-attachment' + suffix + ' btn btn-default" id="delete-attachment' + suffix + '-' + attachmentID + '">'
            + 'Delete</a><button class="save-to-library' + suffix + ' btn btn-default">Remove & save to File Library</button></div>';
        tempObj.$('#attachment-name' + suffix + '-' + attachmentID).append(actionElement);
    }
    tempObj.$("#new-attachment2-tooltip" + suffix).show();
}
