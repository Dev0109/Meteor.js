import {
    PaymentsService
} from "../../payments/payments-service";
import {
    ReactiveVar
} from "meteor/reactive-var";
import {
    UtilityService
} from "../../utility-service";
import '../../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import {
    AccountService
} from "../../accounts/account-service";
import 'jquery-ui-dist/jquery-ui';
import {
    Random
} from 'meteor/random';
import 'jquery-editable-select';
import {
    SideBarService
} from '../../js/sidebar-service';
import '../../lib/global/indexdbstorage.js';
import {getCurrentCurrencySymbol} from "../../popUps/currnecypopup";
import {
    calculateApplied,
    calculateAppliedWithForeign,
    convertToForeignAmount,
    onExchangeRateChange,
    onForeignTableInputChange,
    _setTmpAppliedAmount
} from "./supplierPaymentcard";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import LoadingOverlay from "../../LoadingOverlay";
import {TaxRateService} from "../../settings/settings-service";
import {saveCurrencyHistory} from "../../packages/currency/CurrencyWidget";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
var times = 0;

var template_list = [
    "Customer Payments",
];
var noHasTotals = ["Customer Payment", "Customer Statement", "Supplier Payment", "Statement", "Delivery Docket", "Journal Entry", "Deposit"];

const defaultCurrencyCode = CountryAbbr;

Template.paymentcard.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.isForeignEnabled = new ReactiveVar(false);
    templateObject.customerPayments = new ReactiveVar([]);

    templateObject.records = new ReactiveVar();
    templateObject.record = new ReactiveVar({});
    templateObject.CleintName = new ReactiveVar();
    templateObject.Department = new ReactiveVar();
    templateObject.Date = new ReactiveVar();
    templateObject.DueDate = new ReactiveVar();
    templateObject.clientrecords = new ReactiveVar([]);
    templateObject.deptrecords = new ReactiveVar();
    templateObject.paymentmethodrecords = new ReactiveVar();
    templateObject.accountnamerecords = new ReactiveVar();
    templateObject.custpaymentid = new ReactiveVar();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.datatablerecords1 = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.selectedAwaitingPayment = new ReactiveVar([]);
    templateObject.accountID = new ReactiveVar();
    templateObject.stripe_fee_method = new ReactiveVar();
    templateObject.hasFollow = new ReactiveVar(false);
});

Template.paymentcard.onRendered(() => {
    _setTmpAppliedAmount();
    const templateObject = Template.instance();
    templateObject.hasFollowings = async function() {
        var currentDate = new Date();
        let paymentService = new PaymentsService();
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentInvoice = getso_id[getso_id.length - 1];
        if (getso_id[1]) {
            currentInvoice = parseInt(currentInvoice);
            var paymentData = await paymentService.getOneCustomerPayment(currentInvoice);
            var paymentDate = paymentData.fields.PaymentDate;
            var fromDate = paymentDate.substring(0, 10);
            var toDate = currentDate.getFullYear() + '-' + ("0" + (currentDate.getMonth() + 1)).slice(-2) + '-' + ("0" + (currentDate.getDate())).slice(-2);
            var followingPayments = await sideBarService.getAllTCustomerPaymentListData(
                fromDate,
                toDate,
                false,
                initialReportLoad,
                0
            );
            var paymentList = followingPayments.tcustomerpaymentlist;
            if (paymentList.length > 1) {
                templateObject.hasFollow.set(true);
            } else {
                templateObject.hasFollow.set(false);
            }
        }
    }
    templateObject.hasFollowings();
    let url = FlowRouter.current().path;
    $('#choosetemplate').attr('checked', true);
    const dataTableList = [];
    const tableHeaderList = [];
    LoadingOverlay.show();
    let imageData = (localStorage.getItem("Image"));
    if (imageData) {
        $('.uploadedImage').attr('src', imageData);
    }

    // /**
    //  * Lets load the default currency
    //  */
    // templateObject.loadDefaultCurrency = async (c) => FxGlobalFunctions.loadDefaultCurrencyForReport(c);

    // templateObject.loadDefaultCurrency(defaultCurrencyCode);


    $('#edtCustomerName').attr('readonly', true);
    $('#edtCustomerName').css('background-color', '#eaecf4');
    $("#date-input,#dtPaymentDate").datepicker({
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

    const record = [];
    let paymentService = new PaymentsService();
    let clientsService = new PaymentsService();
    const clientList = [];
    const deptrecords = [];
    const paymentmethodrecords = [];
    const accountnamerecords = [];

    $(document).on("click", ".templateItem .btnPreviewTemplate", function (e) {

        title = $(this).parent().attr("data-id");
        number = $(this).parent().attr("data-template-id");//e.getAttribute("data-template-id");
        templateObject.generateInvoiceData(title, number);

    });

    templateObject.generateInvoiceData = function (template_title, number) {

        object_invoce = [];
        switch (template_title) {

            case "Customer Payments":
                showCustomerPayment1(template_title, number, false);
                break;
        }

    };

    templateObject.addExpenseToTable = function (withForeignAmount = false) {

        let url = window.location.href;

        if (!url.includes("?")) {
            /**
             * Now we need to add right values depending on FX currency
             */
            let list = templateObject.customerPayments.get();
            $('#tblPaymentcard tbody tr').remove(); // first lets clean it

            setTimeout(() => {
                if (list.length > 0) {
                    // let currentApplied = $('.lead').text().replace(/[^0-9.-]+/g, "");
                    // currentApplied = parseFloat(currentApplied.match(/-?(?:\d+(?:\.\d*)?|\.\d+)/)[0])
                    // let total = currentApplied;

                    let currentApplied = $(".lead").text().replace(/[^0-9.-]+/g, "");
                    currentApplied = parseFloat(currentApplied.match(/-?(?:\d+(?:\.\d*)?|\.\d+)/)[0]);
                    let total = parseFloat(currentApplied);

                    for (let x = 0; x < list.length; x++) {
                        const rowData = '<tr class="dnd-moved dynamic-converter-js" id="' + list[x].awaitingId + '" name="' + list[x].awaitingId + '">\n' +
                            '	<td contenteditable="false" class="colTransDate">' + list[x].date + '</td>\n' +
                            '	<td contenteditable="false" class="colType" style="color:#00a3d3; cursor: pointer; white-space: nowrap;">Invoice</td>\n' +
                            '	<td contenteditable="false" class="colTransNo" style="color:#00a3d3">' + list[x].awaitingId + '</td>\n' +
                            '	<td contenteditable="false" class="lineOrginalamount" style="text-align: right!important;">' + list[x].originalAmount + '</td>\n' +
                            '	<td contenteditable="false" class="lineAmountdue" style="text-align: right!important;">' + list[x].outstandingAmount + '</td>\n' +
                            '	<td><input class="linePaymentamount highlightInput convert-from" type="text" value="' + list[x].paymentAmount + '"></td>\n' +
                            (withForeignAmount == true ? '	<td contenteditable="false" class="linePaymentamount foreign convert-to">' + convertToForeignAmount(list[x].paymentAmount, $('#exchange_rate').val(), getCurrentCurrencySymbol()) + '</td>\n' : "") +
                            '	<td contenteditable="false" class="lineOutstandingAmount convert-from" style="text-align: right!important;">' + list[x].outstandingAmount + '</td>\n' +
                            (withForeignAmount == true ? '	<td contenteditable="false" class="lineOutstandingAmount foreign convert-to" style="text-align: right!important;">' + convertToForeignAmount(list[x].outstandingAmount, $('#exchange_rate').val(), getCurrentCurrencySymbol()) + '</td>\n' : '') +
                            '	<td contenteditable="true" class="colComments">' + list[x].comments + '</td>\n' +
                            '	<td><span class="table-remove btnRemove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span></td>\n' +
                            '</tr>';

                        //$('#tblPaymentcard tbody>tr:last').clone(true);
                        // $(".colTransDate", rowData).text(selectedSupplierPayments[x].date);
                        // $(".colType", rowData).text("Invoice");
                        // $(".colTransNo", rowData).text(selectedSupplierPayments[x].awaitingId);
                        // $(".lineOrginalamount", rowData).text(selectedSupplierPayments[x].originalAmount);
                        // $(".lineAmountdue", rowData).text(selectedSupplierPayments[x].outstandingAmount);
                        // $(".linePaymentamount", rowData).val(selectedSupplierPayments[x].paymentAmount);
                        // $(".lineOutstandingAmount", rowData).text(selectedSupplierPayments[x].paymentAmount);
                        // $(".colComments", rowData).text(selectedSupplierPayments[x].comments);
                        // rowData.attr('id', selectedSupplierPayments[x].awaitingId);
                        // rowData.attr('name', selectedSupplierPayments[x].awaitingId);
                        let checkCompareID = list[x].awaitingId || '';
                        let isCheckedTrue = true;
                        $('.tblPaymentcard > tbody > tr').each(function () {
                            const lineID = this.id;
                            if (lineID == checkCompareID) {
                                isCheckedTrue = false;
                            }
                        });
                        if (isCheckedTrue) {
                            $("#tblPaymentcard tbody").append(rowData);
                            total = total + parseFloat(list[x].paymentAmount.replace(/[^0-9.-]+/g, "")) || 0;
                        }
                        //$('.appliedAmount').text(Currency + total.toFixed(2));
                    }

                    $('.appliedAmount').text(total.toFixed(2));
                    $('#edtPaymentAmount').val(total.toFixed(2));
                }
            }, 300);


            setTimeout(function () {
                $("td").each(function () {
                    if (
                        $(this)
                            .text()
                            .indexOf("-" + Currency) >= 0
                    )
                        $(this).addClass("text-danger");
                });
            }, 1000);
        }

    }


    templateObject.getTemplateInfoNew = function () {
        LoadingOverlay.show();
        getVS1Data('TTemplateSettings').then(function (dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));

                    for (let i = 0; i < data.ttemplatesettings.length; i++) {

                        if (data.ttemplatesettings[i].fields.SettingName == 'Customer Payments') {

                            if (data.ttemplatesettings[i].fields.Template == 1) {
                                $('input[name="Customer Payments_1"]').val(data.ttemplatesettings[i].fields.Description);
                                if (data.ttemplatesettings[i].fields.Active == true) {
                                    $('#Customer_Payments_1').attr('checked', 'checked');
                                }

                            }
                            if (data.ttemplatesettings[i].fields.Template == 2) {
                                $('input[name="Customer Payments_2"]').val(data.ttemplatesettings[i].fields.Description);
                                if (data.ttemplatesettings[i].fields.Active == true) {
                                    $('#Customer_Payments_2').attr('checked', 'checked');
                                }
                            }

                            if (data.ttemplatesettings[i].fields.Template == 3) {

                                $('input[name="Customer Payments_3"]').val(data.ttemplatesettings[i].fields.Description);
                                if (data.ttemplatesettings[i].fields.Active == true) {
                                    $('#Customer_Payments_3').attr('checked', 'checked');
                                }
                            }


                        }


                    }


                    $('.fullScreenSpin').css('display', 'none');
                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else {
                let data = JSON.parse(dataObject[0].data);

                for (let i = 0; i < data.ttemplatesettings.length; i++) {

                    if (data.ttemplatesettings[i].fields.SettingName == 'Customer Payments') {

                        if (data.ttemplatesettings[i].fields.Template == 1) {
                            $('input[name="Customer Payments_1"]').val(data.ttemplatesettings[i].fields.Description);
                            if (data.ttemplatesettings[i].fields.Active == true) {
                                $('#Customer_Payments_1').attr('checked', 'checked');
                            }

                        }
                        if (data.ttemplatesettings[i].fields.Template == 2) {
                            $('input[name="Customer Payments_2"]').val(data.ttemplatesettings[i].fields.Description);
                            if (data.ttemplatesettings[i].fields.Active == true) {
                                $('#Customer_Payments_2').attr('checked', 'checked');
                            }
                        }

                        if (data.ttemplatesettings[i].fields.Template == 3) {

                            $('input[name="Customer Payments_3"]').val(data.ttemplatesettings[i].fields.Description);
                            if (data.ttemplatesettings[i].fields.Active == true) {
                                $('#Customer_Payments_3').attr('checked', 'checked');
                            }
                        }


                    }


                }
                $('.fullScreenSpin').css('display', 'none');
            }
        }).catch(function (err) {
            sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                addVS1Data('TTemplateSettings', JSON.stringify(data));

                for (let i = 0; i < data.ttemplatesettings.length; i++) {


                    if (data.ttemplatesettings[i].fields.SettingName == 'Customer Payments') {

                        if (data.ttemplatesettings[i].fields.Template == 1) {
                            $('input[name="Customer Payments_1"]').val(data.ttemplatesettings[i].fields.Description);
                            if (data.ttemplatesettings[i].fields.Active == true) {
                                $('#Customer_Payments_1').attr('checked', 'checked');
                            }

                        }
                        if (data.ttemplatesettings[i].fields.Template == 2) {
                            $('input[name="Customer Payments_2"]').val(data.ttemplatesettings[i].fields.Description);
                            if (data.ttemplatesettings[i].fields.Active == true) {
                                $('#Customer_Payments_2').attr('checked', 'checked');
                            }
                        }

                        if (data.ttemplatesettings[i].fields.Template == 3) {

                            $('input[name="Customer Payments_3"]').val(data.ttemplatesettings[i].fields.Description);
                            if (data.ttemplatesettings[i].fields.Active == true) {
                                $('#Customer_Payments_3').attr('checked', 'checked');
                            }
                        }


                    }


                }
                $('.fullScreenSpin').css('display', 'none');
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        });

    };

    templateObject.getTemplateInfoNew();


    function showCustomerPayment1(template_title, number, bprint) {

        let invoice_data = templateObject.record.get();
        var array_data = [];
        object_invoce = [];
        let stripe_id = templateObject.accountID.get() || '';
        let stripe_fee_method = templateObject.stripe_fee_method.get();
        let lineItems = [];
        let total = $('#totalBalanceDue').html() || 0;
        let tax = $('#subtotal_tax').html() || 0;
        let customer = $('#edtCustomerName').val();
        let name = $('#firstname').val();
        let surname = $('#lastname').val();
        if (name == undefined)
            name = customer;
        if (surname == undefined)
            surname = "";
        let dept = $('#sltDepartment').val();
        if (dept == "Default" || dept == undefined)
            dept = "";
        var erpGet = erpDb();
        let fx = $('#sltCurrency').val();


        var txaNotes = $('#txaNotes').val();


        var customfield1 = $('#edtSaleCustField1').val() || '  ';
        var customfield2 = $('#edtSaleCustField2').val() || '  ';
        var customfield3 = $('#edtSaleCustField3').val() || '  ';

        var customfieldlabel1 = $('.lblCustomField1').first().text() || 'Custom Field 1';
        var customfieldlabel2 = $('.lblCustomField2').first().text() || 'Custom Field 2';
        var customfieldlabel3 = $('.lblCustomField3').first().text() || 'Custom Field 3';
        var ref_daa = $('#edtReference').val() || '-';
        var applied = $('.appliedAmount').text();

        if (ref_daa == " " || ref_daa == "") {
            ref_daa = "  ";
        }

        var dtPaymentDate = $('#dtPaymentDate').val() || '  ';


        $('#tblPaymentcard > tbody > tr').each(function () {
            var lineID = this.id;

            let date = $('#' + lineID + " .colTransDate").text();
            let type = $('#' + lineID + " .colType").text();
            let invoiceNo = $('#' + lineID + " .colTransNo").text();
            let lineOrginalamount = $('#' + lineID + " .lineOrginalamount").text();
            let lineAmountdue = $('#' + lineID + " .lineAmountdue").text();
            let paidAmount = $('#' + lineID + " .linePaymentamount").val();
            let lineOutstandingAmount = $('#' + lineID + " .lineOutstandingAmount").text();


            array_data.push([
                date,
                type,
                invoiceNo,
                lineOrginalamount,
                lineAmountdue,
                paidAmount,
                lineOutstandingAmount

            ]);


        });
        let company = Session.get('vs1companyName');
        let vs1User = localStorage.getItem('mySession');
        let customerEmail = $('#edtCustomerEmail').val();
        let id = $('.printID').attr("id") || "new";
        let currencyname = (CountryAbbr).toLowerCase();
        stringQuery = "?";
        var customerID = $('#edtCustomerEmail').attr('customerid');
        for (let l = 0; l < lineItems.length; l++) {
            stringQuery = stringQuery + "product" + l + "=" + lineItems[l].description + "&price" + l + "=" + lineItems[l].unitPrice + "&qty" + l + "=" + lineItems[l].quantity + "&";
        }
        stringQuery = stringQuery + "tax=" + tax + "&total=" + total + "&customer=" + customer + "&name=" + name + "&surname=" + surname + "&quoteid=" + invoice_data.id + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + customerEmail + "&type=Invoice&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + dept + "&currency=" + currencyname;
        $(".linkText").attr("href", stripeGlobalURL + stringQuery);

        let item_payments = '';


        if (number == 1) {
            item_payments = {
                o_url: Session.get('vs1companyURL'),
                o_name: Session.get('vs1companyName'),
                o_address: Session.get('vs1companyaddress1'),
                o_city: Session.get('vs1companyCity'),
                o_state: Session.get('companyState') + ' ' + Session.get('vs1companyPOBox'),
                o_reg: Template.paymentcard.__helpers.get('companyReg').call(),
                o_abn: Template.paymentcard.__helpers.get('companyabn').call(),
                o_phone: Template.paymentcard.__helpers.get('companyphone').call(),
                title: "Customer Payment",
                value: invoice_data.lid,
                date: dtPaymentDate,
                invoicenumber: "",
                refnumber: ref_daa,
                pqnumber: '',
                duedate: '',
                paylink: "",
                supplier_type: "Customer",
                supplier_name: customer,
                supplier_addr: customer + "\r\n" + name + " " + surname + "\r\n" + customerEmail + "\r\n" + dept,
                fields: {
                    "Date": ["15", "left"],
                    "Type": ["15", "left"],
                    "No": ["10", "left"],
                    "Amount": ["15", "right"],
                    "Due": ["15", "right"],
                    "Paid": ["15", "right"],
                    "Outstanding": ["15", "right"]
                },
                subtotal: "",
                gst: "",
                total: "",
                paid_amount: "",
                bal_due: "",
                bsb: '',
                account: '',
                swift: '',
                data: array_data,
                applied: applied,
                customfield1: 'NA',
                customfield2: 'NA',
                customfield3: 'NA',
                customfieldlabel1: 'NA',
                customfieldlabel2: 'NA',
                customfieldlabel3: 'NA',
                showFX: "",
                comment: "",

            };

        } else if (number == 2) {
            item_payments = {
                o_url: Session.get('vs1companyURL'),
                o_name: Session.get('vs1companyName'),
                o_address: Session.get('vs1companyaddress1'),
                o_city: Session.get('vs1companyCity'),
                o_state: Session.get('companyState') + ' ' + Session.get('vs1companyPOBox'),
                o_reg: Template.paymentcard.__helpers.get('companyReg').call(),
                o_abn: Template.paymentcard.__helpers.get('companyabn').call(),
                o_phone: Template.paymentcard.__helpers.get('companyphone').call(),
                title: "Customer Payment",
                value: invoice_data.lid,
                date: dtPaymentDate,
                invoicenumber: "",
                refnumber: ref_daa,
                pqnumber: '',
                duedate: '',
                paylink: "",
                supplier_type: "Customer",
                supplier_name: customer,
                supplier_addr: customer + "\r\n" + name + " " + surname + "\r\n" + customerEmail + "\r\n" + dept,
                fields: {
                    "Date": ["15", "left"],
                    "Type": ["15", "left"],
                    "No": ["10", "left"],
                    "Amount": ["15", "right"],
                    "Due": ["15", "right"],
                    "Paid": ["15", "right"],
                    "Outstanding": ["15", "right"]
                },
                subtotal: "",
                gst: "",
                total: "",
                paid_amount: "",
                bal_due: "",
                bsb: '',
                account: '',
                swift: '',
                data: array_data,
                applied: applied,
                customfield1: customfield1,
                customfield2: customfield2,
                customfield3: customfield3,
                customfieldlabel1: customfieldlabel1,
                customfieldlabel2: customfieldlabel2,
                customfieldlabel3: customfieldlabel3,
                showFX: "",
                comment: "",

            };

        } else {

            if (fx == '') {
                fx = '  ';
            }
            item_payments = {
                o_url: Session.get('vs1companyURL'),
                o_name: Session.get('vs1companyName'),
                o_address: Session.get('vs1companyaddress1'),
                o_city: Session.get('vs1companyCity'),
                o_state: Session.get('companyState') + ' ' + Session.get('vs1companyPOBox'),
                o_reg: Template.paymentcard.__helpers.get('companyReg').call(),
                o_abn: Template.paymentcard.__helpers.get('companyabn').call(),
                o_phone: Template.paymentcard.__helpers.get('companyphone').call(),
                title: "Customer Payment",
                value: invoice_data.lid,
                date: dtPaymentDate,
                invoicenumber: "",
                refnumber: ref_daa,
                pqnumber: '',
                duedate: '',
                paylink: "",
                supplier_type: "Customer",
                supplier_name: customer,
                supplier_addr: customer + "\r\n" + name + " " + surname + "\r\n" + customerEmail + "\r\n" + dept,
                fields: {
                    "Date": ["15", "left"],
                    "Type": ["15", "left"],
                    "No": ["10", "left"],
                    "Amount": ["15", "right"],
                    "Due": ["15", "right"],
                    "Paid": ["15", "right"],
                    "Outstanding": ["15", "right"]
                },
                subtotal: "",
                gst: "",
                total: "",
                paid_amount: "",
                bal_due: "",
                bsb: '',
                account: '',
                swift: '',
                data: array_data,
                applied: applied,
                customfield1: customfield1,
                customfield2: customfield2,
                customfield3: customfield3,
                customfieldlabel1: customfieldlabel1,
                customfieldlabel2: customfieldlabel2,
                customfieldlabel3: customfieldlabel3,
                showFX: fx,
                comment: "",

            };


        }


        object_invoce.push(item_payments);

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

        saveTemplateFields("fields" + template_title, object_invoce[0]["fields"])
    }

    function showCustomerPayment(template_title, number) {

        let invoice_data = templateObject.record.get();

        var array_data = [];
        object_invoce = [];
        let stripe_id = templateObject.accountID.get() || '';
        let stripe_fee_method = templateObject.stripe_fee_method.get();
        let lineItems = [];
        let total = $('#totalBalanceDue').html() || 0;
        let tax = $('#subtotal_tax').html() || 0;
        let customer = $('#edtCustomerName').val();
        let name = $('#firstname').val();
        let surname = $('#lastname').val();
        let dept = $('#sltDepartment').val();
        var erpGet = erpDb();
        let fx = $('#sltCurrency').val();

        var ref_daa = $('#edtReference').val();
        var txaNotes = $('#txaNotes').val();

        var customfield1 = $('#edtSaleCustField1').val() || '  ';
        var customfield2 = $('#edtSaleCustField2').val() || '  ';
        var customfield3 = $('#edtSaleCustField3').val() || '  ';

        var customfieldlabel1 = $('.lblCustomField1').first().text() || 'Custom Field 1';
        var customfieldlabel2 = $('.lblCustomField2').first().text() || 'Custom Field 2';
        var customfieldlabel3 = $('.lblCustomField3').first().text() || 'Custom Field 3';

        var applied = $('.appliedAmount').text();

        var dtPaymentDate = $('#dtPaymentDate').val() || '-';
        if (ref_daa == " " || ref_daa == "") {
            ref_daa = "  ";
        }


        $('#tblPaymentcard > tbody > tr').each(function () {
            var lineID = this.id;

            let date = $('#' + lineID + " .colTransDate").text();
            let type = $('#' + lineID + " .colType").text();
            let invoiceNo = $('#' + lineID + " .colTransNo").text();
            let lineOrginalamount = $('#' + lineID + " .lineOrginalamount").text();
            let lineAmountdue = $('#' + lineID + " .lineAmountdue").text();
            let paidAmount = $('#' + lineID + " .linePaymentamount").val();
            let lineOutstandingAmount = $('#' + lineID + " .lineOutstandingAmount").text();


            array_data.push([
                date,
                type,
                invoiceNo,
                lineOrginalamount,
                lineAmountdue,
                paidAmount,
                lineOutstandingAmount

            ]);


        });
        let company = Session.get('vs1companyName');
        let vs1User = localStorage.getItem('mySession');
        let customerEmail = $('#edtCustomerEmail').val();
        let id = $('.printID').attr("id") || "new";
        let currencyname = (CountryAbbr).toLowerCase();
        stringQuery = "?";
        var customerID = $('#edtCustomerEmail').attr('customerid');
        for (let l = 0; l < lineItems.length; l++) {
            stringQuery = stringQuery + "product" + l + "=" + lineItems[l].description + "&price" + l + "=" + lineItems[l].unitPrice + "&qty" + l + "=" + lineItems[l].quantity + "&";
        }
        stringQuery = stringQuery + "tax=" + tax + "&total=" + total + "&customer=" + customer + "&name=" + name + "&surname=" + surname + "&quoteid=" + invoice_data.id + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + customerEmail + "&type=Invoice&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + dept + "&currency=" + currencyname;
        $(".linkText").attr("href", stripeGlobalURL + stringQuery);

        let item_payments = '';


        if (number == 1) {
            item_payments = {
                o_url: Session.get('vs1companyURL'),
                o_name: Session.get('vs1companyName'),
                o_address: Session.get('vs1companyaddress1'),
                o_city: Session.get('vs1companyCity'),
                o_state: Session.get('companyState') + ' ' + Session.get('vs1companyPOBox'),
                o_reg: Template.paymentcard.__helpers.get('companyReg').call(),
                o_abn: Template.paymentcard.__helpers.get('companyabn').call(),
                o_phone: Template.paymentcard.__helpers.get('companyphone').call(),
                title: "Customer Payment",
                value: invoice_data.lid,
                date: dtPaymentDate,
                invoicenumber: "",
                refnumber: ref_daa,
                pqnumber: '',
                duedate: '',
                paylink: "",
                supplier_type: "Customer",
                supplier_name: customer,
                supplier_addr: "",
                fields: {
                    "Date": "20",
                    "Type": "20",
                    "No.": "10",
                    "Amount": "10",
                    "Due": "10",
                    "Paid": "10",
                    "Outstanding": "20"
                },
                subtotal: "",
                gst: "",
                total: "",
                paid_amount: "",
                bal_due: "",
                bsb: '',
                account: '',
                swift: '',
                data: array_data,
                applied: applied,
                customfield1: 'NA',
                customfield2: 'NA',
                customfield3: 'NA',
                customfieldlabel1: 'NA',
                customfieldlabel2: 'NA',
                customfieldlabel3: 'NA',
                showFX: "",
                comment: "",

            };

        } else if (number == 2) {
            item_payments = {
                o_url: Session.get('vs1companyURL'),
                o_name: Session.get('vs1companyName'),
                o_address: Session.get('vs1companyaddress1'),
                o_city: Session.get('vs1companyCity'),
                o_state: Session.get('companyState') + ' ' + Session.get('vs1companyPOBox'),
                o_reg: Template.paymentcard.__helpers.get('companyReg').call(),
                o_abn: Template.paymentcard.__helpers.get('companyabn').call(),
                o_phone: Template.paymentcard.__helpers.get('companyphone').call(),
                title: "Customer Payment",
                value: invoice_data.lid,
                date: dtPaymentDate,
                invoicenumber: "",
                refnumber: ref_daa,
                pqnumber: '',
                duedate: '',
                paylink: "",
                supplier_type: "Customer",
                supplier_name: customer,
                supplier_addr: "",
                fields: {
                    "Date": "20",
                    "Type": "20",
                    "No.": "10",
                    "Amount": "10",
                    "Due": "10",
                    "Paid": "10",
                    "Outstanding": "20"
                },
                subtotal: "",
                gst: "",
                total: "",
                paid_amount: "",
                bal_due: "",
                bsb: '',
                account: '',
                swift: '',
                data: array_data,
                applied: applied,
                customfield1: customfield1,
                customfield2: customfield2,
                customfield3: customfield3,
                customfieldlabel1: customfieldlabel1,
                customfieldlabel2: customfieldlabel2,
                customfieldlabel3: customfieldlabel3,
                showFX: "",
                comment: "",

            };

        } else {

            if (fx == '') {
                fx = '  ';
            }
            item_payments = {
                o_url: Session.get('vs1companyURL'),
                o_name: Session.get('vs1companyName'),
                o_address: Session.get('vs1companyaddress1'),
                o_city: Session.get('vs1companyCity'),
                o_state: Session.get('companyState') + ' ' + Session.get('vs1companyPOBox'),
                o_reg: Template.paymentcard.__helpers.get('companyReg').call(),
                o_abn: Template.paymentcard.__helpers.get('companyabn').call(),
                o_phone: Template.paymentcard.__helpers.get('companyphone').call(),
                title: "Customer Payment",
                value: invoice_data.lid,
                date: dtPaymentDate,
                invoicenumber: "",
                refnumber: ref_daa,
                pqnumber: '',
                duedate: '',
                paylink: "",
                supplier_type: "Customer",
                supplier_name: customer,
                supplier_addr: "",
                fields: {
                    "Date": "20",
                    "Type": "20",
                    "No.": "10",
                    "Amount": "10",
                    "Due": "10",
                    "Paid": "10",
                    "Outstanding": "20"
                },
                subtotal: "",
                gst: "",
                total: "",
                paid_amount: "",
                bal_due: "",
                bsb: '',
                account: '',
                swift: '',
                data: array_data,
                applied: applied,
                customfield1: customfield1,
                customfield2: customfield2,
                customfield3: customfield3,
                customfieldlabel1: customfieldlabel1,
                customfieldlabel2: customfieldlabel2,
                customfieldlabel3: customfieldlabel3,
                showFX: fx,
                comment: "",

            };


        }


        object_invoce.push(item_payments);

        $("#templatePreviewModal .field_payment").show();
        $("#templatePreviewModal .field_amount").show();

        updateTemplate(object_invoce);

        saveTemplateFields("fields" + template_title, object_invoce[0]["fields"])
    }

    function loadTemplateBody1(object_invoce) {
        // table content
        var tbl_content = $("#templatePreviewModal .tbl_content");
        tbl_content.empty();
        const data = object_invoce[0]["data"];
        var length = data.length;
        var i = 0;
        for (item of data) {
            var html = '';
            if (i == length - 1) {
                html += "<tr style=''>";
            } else {
                html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
            }

            var count = 0;
            for (item_temp of item) {
                if (count == 1) {
                    html = html + "<td style='color:#00a3d3; padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else if (count > 2) {
                    html = html + "<td style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else {
                    html = html + "<td style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                }
                count++;
            }
            html += "</tr>";
            tbl_content.append(html);
            i++;

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
        $("#templatePreviewModal #grandTotalPrint").text(object_invoce[0]["total"]);
        $("#templatePreviewModal #totalBalanceDuePrint").text(object_invoce[0]["bal_due"]);
        $("#templatePreviewModal #paid_amount").text(object_invoce[0]["paid_amount"]);

    }

    function loadTemplateBody2(object_invoce) {
        // table content
        var tbl_content = $("#templatePreviewModal .tbl_content");
        tbl_content.empty();
        const data = object_invoce[0]["data"];
        var length = data.length;
        var i = 0;
        for (item of data) {
            var html = '';
            if (i == length - 1) {
                html += "<tr style=''>";
            } else {
                html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
            }

            var count = 0;
            for (item_temp of item) {
                if (count == 1) {
                    html = html + "<td style='color:#00a3d3; padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else if (count > 2) {
                    html = html + "<td style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else {
                    html = html + "<td style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                }
                count++;
            }
            html += "</tr>";
            tbl_content.append(html);
            i++;

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
        var length = data.length;
        var i = 0;
        for (item of data) {
            var html = '';
            if (i == length - 1) {
                html += "<tr style=''>";
            } else {
                html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
            }

            var count = 0;
            for (item_temp of item) {
                if (count == 1) {
                    html = html + "<td style='color:#00a3d3; padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else if (count > 2) {
                    html = html + "<td style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else {
                    html = html + "<td style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                }
                count++;
            }
            html += "</tr>";
            tbl_content.append(html);
            i++;

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

    function updateTemplate(object_invoce) {


        if (object_invoce.length > 0) {

            $('#html-2-pdfwrapper_new #printcomment').text(object_invoce[0]["comment"]);
            $("#html-2-pdfwrapper_new .o_url").text(object_invoce[0]["o_url"]);
            $("#html-2-pdfwrapper_new .o_name").text(object_invoce[0]["o_name"]);
            $("#html-2-pdfwrapper_new .o_address1").text(
                object_invoce[0]["o_address"]
            );
            $("#html-2-pdfwrapper_new .o_city").text(object_invoce[0]["o_city"]);
            $("#html-2-pdfwrapper_new .o_state").text(object_invoce[0]["o_state"]);
            $("#html-2-pdfwrapper_new .o_reg").text(object_invoce[0]["o_reg"]);
            $("#html-2-pdfwrapper_new .o_abn").text(object_invoce[0]["o_abn"]);
            $("#html-2-pdfwrapper_new .o_phone").text(object_invoce[0]["o_phone"]);

            if (object_invoce[0]["applied"] == "") {
                $("#html-2-pdfwrapper_new .applied").hide()
                $("#html-2-pdfwrapper_new .applied").text(object_invoce[0]["applied"]);
            } else {
                $("#html-2-pdfwrapper_new .applied").show()
                $("#html-2-pdfwrapper_new .applied").text("Applied : " + object_invoce[0]["applied"]);
            }


            if (object_invoce[0]["supplier_type"] == "") {
                $("#html-2-pdfwrapper_new .customer").hide()
            } else {
                $("#html-2-pdfwrapper_new .customer").show()
            }
            $("#html-2-pdfwrapper_new .customer").empty();
            $("#html-2-pdfwrapper_new .customer").append(object_invoce[0]["supplier_type"]);

            if (object_invoce[0]["supplier_name"] == "") {
                $("#html-2-pdfwrapper_new .pdfCustomerName").hide()
            } else {
                $("#html-2-pdfwrapper_new .pdfCustomerName").show()
            }
            $("#html-2-pdfwrapper_new .pdfCustomerName").empty();
            $("#html-2-pdfwrapper_new .pdfCustomerName").append(object_invoce[0]["supplier_name"]);

            if (object_invoce[0]["supplier_addr"] == "") {
                $("#html-2-pdfwrapper_new .pdfCustomerAddress").hide()
            } else {
                $("#html-2-pdfwrapper_new .pdfCustomerAddress").show()
            }
            $("#html-2-pdfwrapper_new .pdfCustomerAddress").empty();
            $("#html-2-pdfwrapper_new .pdfCustomerAddress").append(object_invoce[0]["supplier_addr"]);


            $("#html-2-pdfwrapper_new .print-header").text(object_invoce[0]["title"]);

            $("#templatePreviewModal .modal-title").text(
                object_invoce[0]["title"] + " " + object_invoce[0]["value"] + " template"
            );

            if (object_invoce[0]["value"] == "") {
                $('.print-header-value').text(object_invoce[0]["title"]);
            } else {
                $('.print-header-value').text(object_invoce[0]["title"]);
            }

            // if (object_invoce[0]["bsb"] == "") {
            //     $('#html-2-pdfwrapper_new .field_payment').hide();
            // } else {
            //     $('#html-2-pdfwrapper_new .field_payment').show();
            // }

            $("#html-2-pdfwrapper_new .bsb").text("BSB (Branch Number) : " + object_invoce[0]["bsb"]);
            $("#html-2-pdfwrapper_new .account_number").text("Account Number : " + object_invoce[0]["account"]);
            $("#html-2-pdfwrapper_new .swift").text("Swift Code : " + object_invoce[0]["swift"]);


            if (object_invoce[0]["date"] == "") {
                $("#html-2-pdfwrapper_new .dateNumber").hide();
            } else {
                $("#html-2-pdfwrapper_new .dateNumber").show();
            }

            if (object_invoce[0]["showFX"] == "") {
                $("#html-2-pdfwrapper_new .showFx").hide();
                $("#html-2-pdfwrapper_new .showFxValue").hide();
            } else {
                $("#html-2-pdfwrapper_new .showFx").show();
                $("#html-2-pdfwrapper_new .showFxValue").show();
                $("#html-2-pdfwrapper_new .showFxValue").text(object_invoce[0]["showFX"]);
            }

            $("#html-2-pdfwrapper_new .date").text(object_invoce[0]["date"]);

            if (object_invoce[0]["pqnumber"] == "") {
                $("#html-2-pdfwrapper_new .pdfPONumber").hide();
            } else {
                $("#html-2-pdfwrapper_new .pdfPONumber").show();
            }

            if (object_invoce[0]["customfield1"] == "NA") {
                $('#customfieldtablenew').css('display', 'none');
                $('#customdatatablenew').css('display', 'none');
                $('#html-2-pdfwrapper_new .customfield1').text('');
                $('#html-2-pdfwrapper_new .customfield2').text('');
                $('#html-2-pdfwrapper_new .customfield3').text('');


                $('#html-2-pdfwrapper_new .customfield1data').text('');
                $('#html-2-pdfwrapper_new .customfield2data').text('');
                $('#html-2-pdfwrapper_new .customfield3data').text('');

            } else {
                $('#customfieldtablenew').css('display', 'block');
                $('#customdatatablenew').css('display', 'block');

                $('#html-2-pdfwrapper_new .customfield1').text(object_invoce[0]["customfieldlabel1"]);
                $('#html-2-pdfwrapper_new .customfield2').text(object_invoce[0]["customfieldlabel2"]);
                $('#html-2-pdfwrapper_new .customfield3').text(object_invoce[0]["customfieldlabel3"]);

                if (object_invoce[0]["customfield1"] == '' || object_invoce[0]["customfield1"] == 0) {
                    $('#html-2-pdfwrapper_new .customfield1data').text('');
                } else {
                    $('#html-2-pdfwrapper_new .customfield1data').text(object_invoce[0]["customfield1"]);
                }

                if (object_invoce[0]["customfield2"] == '' || object_invoce[0]["customfield2"] == 0) {
                    $('#html-2-pdfwrapper_new .customfield2data').text('');
                } else {
                    $('#html-2-pdfwrapper_new .customfield2data').text(object_invoce[0]["customfield2"]);
                }

                if (object_invoce[0]["customfield3"] == '' || object_invoce[0]["customfield3"] == 0) {
                    $('#html-2-pdfwrapper_new .customfield3data').text('');
                } else {
                    $('#html-2-pdfwrapper_new .customfield3data').text(object_invoce[0]["customfield3"]);
                }


            }


            $("#html-2-pdfwrapper_new .po").text(object_invoce[0]["pqnumber"]);

            if (object_invoce[0]["invoicenumber"] == "") {
                $("#html-2-pdfwrapper_new .invoiceNumber").hide();
            } else {
                $("#html-2-pdfwrapper_new .invoiceNumber").show();
            }

            $("#html-2-pdfwrapper_new .io").text(object_invoce[0]["invoicenumber"]);

            if (object_invoce[0]["refnumber"] == "") {
                $("#html-2-pdfwrapper_new .refNumber").hide();
            } else {
                $("#html-2-pdfwrapper_new .refNumber").show();
            }
            $("#html-2-pdfwrapper_new .ro").text(object_invoce[0]["refnumber"]);

            if (object_invoce[0]["duedate"] == "") {
                $("#html-2-pdfwrapper_new .pdfTerms").hide();
            } else {
                $("#html-2-pdfwrapper_new .pdfTerms").show();
            }
            $("#html-2-pdfwrapper_new .due").text(object_invoce[0]["duedate"]);

            if (object_invoce[0]["paylink"] == "") {
                $("#html-2-pdfwrapper_new .link").hide();
                $("#html-2-pdfwrapper_new .linkText").hide();
            } else {
                $("#html-2-pdfwrapper_new .link").show();
                $("#html-2-pdfwrapper_new .linkText").show();
            }

            if (object_invoce[0]["customfield1"] == "") {
                $('#customfieldlable').css('display', 'none');
                $('#customfieldlabledata').css('display', 'none');

            } else {
                $('#customfieldlable').css('display', 'block');
                $('#customfieldlabledata').css('display', 'block');
            }

            //   table header
            var tbl_header = $("#html-2-pdfwrapper_new .tbl_header")
            tbl_header.empty()
            var count = 0;
            for (const [key, value] of Object.entries(object_invoce[0]["fields"])) {

                if (count > 2) {
                    tbl_header.append("<th class='text-nowrap text-right' style='text-algin:right;background:white;color:rgb(0,0,0);width:" + value + "%'; >" + key + "</th>")
                } else {
                    tbl_header.append("<th  class='text-nowrap' style='background:white;color:rgb(0,0,0);width:" + value + "%'; >" + key + "</th>")
                }
                count++;

            }
        }

        // table content
        var tbl_content = $("#html-2-pdfwrapper_new .tbl_content")
        tbl_content.empty()
        const data = object_invoce[0]["data"]
        var length = data.length;
        var i = 0;
        for (item of data) {

            var html = '';
            if (i == length - 1) {
                html += "<tr style=''>";
            } else {
                html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
            }

            var count = 0;
            for (item_temp of item) {

                if (count < 3) {
                    if (count == 1) {
                        html = html + "<td class='text-nowrap' style='color:#00a3d3;'>" + item_temp + "</td>";
                    } else {
                        html = html + "<td class='text-nowrap' >" + item_temp + "</td>";

                    }

                } else {
                    html = html + "<td class='text-right text-nowrap' >" + item_temp + "</td>";
                }


                count++;
            }
            html += "</tr>";
            tbl_content.append(html);
            i++;

        }

        // total amount

        if (object_invoce[0]["subtotal"] == "") {
            $("#html-2-pdfwrapper_new .field_amount").hide();
        } else {
            $("#html-2-pdfwrapper_new .field_amount").show();

            if (object_invoce[0]["subtotal"] != "") {
                $('#html-2-pdfwrapper_new #subtotal_total').text("Sub total");
                $("#html-2-pdfwrapper_new #subtotal_totalPrint").text(object_invoce[0]["subtotal"]);
            }

            if (object_invoce[0]["gst"] != "") {
                $('#html-2-pdfwrapper_new #grandTotal').text("Grand total");
                $("#html-2-pdfwrapper_new #totalTax_totalPrint").text(object_invoce[0]["gst"]);
            }


            if (object_invoce[0]["total"] != "") {
                $("#html-2-pdfwrapper_new #grandTotalPrint").text(object_invoce[0]["total"]);
            }

            if (object_invoce[0]["bal_due"] != "") {
                $("#html-2-pdfwrapper_new #totalBalanceDuePrint").text(object_invoce[0]["bal_due"]);
            }

            if (object_invoce[0]["paid_amount"] != "") {
                $("#html-2-pdfwrapper_new #paid_amount").text(object_invoce[0]["paid_amount"]);
            }

        }

    }


    function saveTemplateFields(key, value) {
        localStorage.setItem(key, value)
    }


    templateObject.getLastPaymentData = async function () {
        let lastBankAccount = "Bank";
        let lastDepartment = Session.get('department') || defaultDept || "";
        paymentService.getAllCustomerPaymentData1().then(function (data) {
            let latestPaymentId;
            if (data.tcustomerpayment.length > 0) {
                lastCheque = data.tcustomerpayment[data.tcustomerpayment.length - 1]
                lastBankAccount = lastCheque.AccountName;
                lastDepartment = lastCheque.DeptClassName;
                latestPaymentId = (lastCheque.Id);
            } else {
                latestPaymentId = 0;
            }
            newPaymentId = (latestPaymentId + 1);
            setTimeout(function () {
                $('#edtEnrtyNo').val(newPaymentId);
                $('#edtSelectBankAccountName').val(lastBankAccount);
                $('#sltDepartment').val(lastDepartment);
                if (FlowRouter.current().queryParams.id) {

                } else {
                    $(".heading").html("New Customer Payment " + '' + '<a role="button" class="btn btn-success" data-toggle="modal" href="#supportModal" style="margin-left: 12px;">Help <i class="fa fa-question-circle-o" style="font-size: 20px;"></i></a>');
                }
                ;
            }, 50);
        }).catch(function (err) {
            if (Session.get('bankaccount')) {
                $('#edtSelectBankAccountName').val(Session.get('bankaccount'));
            } else {
                $('#edtSelectBankAccountName').val(lastBankAccount);
            }
            ;
            $('#sltDepartment').val(lastDepartment);
        });
    };

    templateObject.getAllClients = function () {
        getVS1Data('TCustomerVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                clientsService.getClientVS1().then(function (data) {
                    for (let i in data.tcustomervs1) {

                        let customerrecordObj = {
                            customerid: data.tcustomervs1[i].Id || ' ',
                            customername: data.tcustomervs1[i].ClientName || ' ',
                            customeremail: data.tcustomervs1[i].Email || ' ',
                            street: data.tcustomervs1[i].Street || ' ',
                            street2: data.tcustomervs1[i].Street2 || ' ',
                            street3: data.tcustomervs1[i].Street3 || ' ',
                            suburb: data.tcustomervs1[i].Suburb || ' ',
                            statecode: data.tcustomervs1[i].State + ' ' + data.tcustomervs1[i].Postcode || ' ',
                            country: data.tcustomervs1[i].Country || ' '
                        };
                        //clientList.push(data.tcustomer[i].ClientName,customeremail: data.tcustomer[i].Email);
                        clientList.push(customerrecordObj);

                        //$('#edtCustomerName').editableSelect('add',data.tcustomer[i].ClientName);
                    }
                    //templateObject.clientrecords.set(clientList);
                    templateObject.clientrecords.set(clientList.sort(function (a, b) {
                        if (a.customername == 'NA') {
                            return 1;
                        } else if (b.customername == 'NA') {
                            return -1;
                        }
                        return (a.customername.toUpperCase() > b.customername.toUpperCase()) ? 1 : -1;
                    }));

                    for (var i = 0; i < clientList.length; i++) {
                        //$('#edtCustomerName').editableSelect('add', clientList[i].customername);
                    }
                    if (jQuery.isEmptyObject(FlowRouter.current().queryParams) == true) {
                        setTimeout(function () {
                            $('#edtCustomerName').trigger("click");
                        }, 400);
                    } else {

                    }
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcustomervs1;

                for (let i in useData) {

                    let customerrecordObj = {
                        customerid: useData[i].fields.ID || ' ',
                        customername: useData[i].fields.ClientName || ' ',
                        customeremail: useData[i].fields.Email || ' ',
                        street: useData[i].fields.Street || ' ',
                        street2: useData[i].fields.Street2 || ' ',
                        street3: useData[i].fields.Street3 || ' ',
                        suburb: useData[i].fields.Suburb || ' ',
                        statecode: useData[i].fields.State + ' ' + useData[i].fields.Postcode || ' ',
                        country: useData[i].fields.Country || ' '
                    };
                    //clientList.push(data.tcustomer[i].ClientName,customeremail: data.tcustomer[i].Email);
                    clientList.push(customerrecordObj);

                    //$('#edtCustomerName').editableSelect('add',data.tcustomer[i].ClientName);
                }
                //templateObject.clientrecords.set(clientList);
                templateObject.clientrecords.set(clientList.sort(function (a, b) {
                    if (a.customername == 'NA') {
                        return 1;
                    } else if (b.customername == 'NA') {
                        return -1;
                    }
                    return (a.customername.toUpperCase() > b.customername.toUpperCase()) ? 1 : -1;
                }));

                for (var i = 0; i < clientList.length; i++) {
                    //$('#edtCustomerName').editableSelect('add', clientList[i].customername);
                }

                if (jQuery.isEmptyObject(FlowRouter.current().queryParams) == true) {
                    setTimeout(function () {
                        $('#edtCustomerName').trigger("click");
                    }, 400);
                } else {

                }
            }
        }).catch(function (err) {
            clientsService.getClientVS1().then(function (data) {
                for (let i in data.tcustomervs1) {

                    let customerrecordObj = {
                        customerid: data.tcustomervs1[i].Id || ' ',
                        customername: data.tcustomervs1[i].ClientName || ' ',
                        customeremail: data.tcustomervs1[i].Email || ' ',
                        street: data.tcustomervs1[i].Street || ' ',
                        street2: data.tcustomervs1[i].Street2 || ' ',
                        street3: data.tcustomervs1[i].Street3 || ' ',
                        suburb: data.tcustomervs1[i].Suburb || ' ',
                        statecode: data.tcustomervs1[i].State + ' ' + data.tcustomervs1[i].Postcode || ' ',
                        country: data.tcustomervs1[i].Country || ' '
                    };
                    //clientList.push(data.tcustomer[i].ClientName,customeremail: data.tcustomer[i].Email);
                    clientList.push(customerrecordObj);

                    //$('#edtCustomerName').editableSelect('add',data.tcustomer[i].ClientName);
                }
                //templateObject.clientrecords.set(clientList);
                templateObject.clientrecords.set(clientList.sort(function (a, b) {
                    if (a.customername == 'NA') {
                        return 1;
                    } else if (b.customername == 'NA') {
                        return -1;
                    }
                    return (a.customername.toUpperCase() > b.customername.toUpperCase()) ? 1 : -1;
                }));

                for (var i = 0; i < clientList.length; i++) {
                    //  $('#edtCustomerName').editableSelect('add', clientList[i].customername);
                }

                if (jQuery.isEmptyObject(FlowRouter.current().queryParams) == true) {
                    setTimeout(function () {
                        $('#edtCustomerName').trigger("click");
                    }, 400);
                } else {

                }
            });
        });

    };
    templateObject.getDepartments = function () {
        getVS1Data('TDeptClass').then(function (dataObject) {
            if (dataObject.length == 0) {
                paymentService.getDepartment().then(function (data) {
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
                        department: useData[i].DeptClassName || ' ',
                    };

                    deptrecords.push(deptrecordObj);
                    templateObject.deptrecords.set(deptrecords);

                }
            }
        }).catch(function (err) {
            paymentService.getDepartment().then(function (data) {
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

    templateObject.getPaymentMethods = function () {
        getVS1Data('TPaymentMethod').then(function (dataObject) {
            if (dataObject.length == 0) {
                paymentService.getPaymentMethodVS1().then(function (data) {
                    for (let i in data.tpaymentmethodvs1) {

                        let paymentmethodrecordObj = {
                            paymentmethod: data.tpaymentmethodvs1[i].fields.PaymentMethodName || ' ',
                        };

                        if (FlowRouter.current().queryParams.id) {

                        } else {
                            if (data.tpaymentmethodvs1[i].IsCreditCard == true) {
                                setTimeout(function () {
                                    $('#sltPaymentMethod').val(data.tpaymentmethodvs1[i].fields.PaymentMethodName);
                                }, 200);
                            }
                        }

                        paymentmethodrecords.push(paymentmethodrecordObj);


                    }
                    templateObject.paymentmethodrecords.set(paymentmethodrecords);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tpaymentmethodvs1;
                for (let i in useData) {

                    let paymentmethodrecordObj = {
                        paymentmethod: useData[i].fields.PaymentMethodName || ' ',
                    };
                    if (FlowRouter.current().queryParams.id) {

                    } else {
                        if (useData[i].fields.IsCreditCard == true) {
                            setTimeout(function () {
                                $('#sltPaymentMethod').val(useData[i].fields.PaymentMethodName);
                            }, 200);
                        }
                    }

                    paymentmethodrecords.push(paymentmethodrecordObj);


                }
                templateObject.paymentmethodrecords.set(paymentmethodrecords);
            }

        }).catch(function (err) {
            paymentService.getPaymentMethodVS1().then(function (data) {
                for (let i in data.tpaymentmethodvs1) {

                    let paymentmethodrecordObj = {
                        paymentmethod: data.tpaymentmethodvs1[i].fields.PaymentMethodName || ' ',
                    };
                    if (FlowRouter.current().queryParams.id) {

                    } else {
                        if (data.tpaymentmethodvs1[i].IsCreditCard == true) {
                            setTimeout(function () {
                                $('#sltPaymentMethod').val(data.tpaymentmethodvs1[i].fields.PaymentMethodName);
                            }, 200);

                        }
                    }

                    paymentmethodrecords.push(paymentmethodrecordObj);


                }
                templateObject.paymentmethodrecords.set(paymentmethodrecords);
            });
        });

    }

    function MakeNegative() {
        $('td').each(function () {
            if ($(this).text().indexOf('-' + Currency) >= 0)
                $(this).addClass('text-danger')
        });
    };
    // $('#tblcustomerAwaitingPayment').DataTable();
    let customerName = $('#edtCustomerName').val() || '';
    templateObject.getAllCustomerPaymentData = function (customerName) {
        var splashArrayAwaitingCustList = new Array();

        sideBarService.getAllAwaitingCustomerPaymentByCustomerName(customerName).then(function (data) {
            let lineItems = [];
            let lineItemObj = {};
            let totalPaidCal = 0;

            for (let i = 0; i < data.tsaleslist.length; i++) {
                let amount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;
                let applied = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Payment) || 0.00;
                // Currency+''+data.tsaleslist[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                let balance = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].BalanceBalance) || 0.00;
                let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                let totalOrginialAmount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;


                if (data.tsaleslist[i].Balance != 0) {

                    var dataListOLD = {
                        id: data.tsaleslist[i].SaleId || '',
                        sortdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("YYYY/MM/DD") : data.tsaleslist[i].SaleDate,
                        paymentdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY") : data.tsaleslist[i].SaleDate,
                        customername: data.tsaleslist[i].CustomerName || '',
                        paymentamount: amount || 0.00,
                        applied: applied || 0.00,
                        balance: balance || 0.00,
                        originalamount: totalOrginialAmount || 0.00,
                        outsandingamount: totalOutstanding || 0.00,
                        // bankaccount: data.tinvoiceex[i].GLAccountName || '',
                        department: data.tsaleslist[i].ClassName || '',
                        refno: data.tsaleslist[i].BORef || '',
                        paymentmethod: data.tsaleslist[i].PaymentMethodName || '',
                        notes: data.tsaleslist[i].Comments || ''
                    };


                    var dataList = [
                        '<div class="custom-control custom-checkbox chkBox pointer"><input class="custom-control-input chkBox chkPaymentCard pointer" type="checkbox" id="formCheck-' + data.tsaleslist[i].SaleId + '" value="' + totalOutstanding + '"><label class="custom-control-label chkBox pointer" for="formCheck-' + data.tsaleslist[i].SaleId + '"></label></div>',
                        data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("YYYY/MM/DD") : data.tsaleslist[i].SaleDate,
                        data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY") : data.tsaleslist[i].SaleDate,
                        data.tsaleslist[i].BORef || '',
                        data.tsaleslist[i].SaleId || '',
                        amount || 0.00,
                        applied || 0.00,
                        // totalOrginialAmount || 0.00,
                        totalOutstanding || 0.00,
                        data.tsaleslist[i].CustomerName || '',
                        'Invoice',
                        data.tsaleslist[i].Comments || ''
                    ];

                    //&& (data.tpurchaseorder[i].Invoiced == true)
                    //if ((data.tsaleslist[i].Deleted == false)) {
                    if (data.tsaleslist[i].CustomerName == customerName) {
                        dataTableList.push(dataListOLD);
                        splashArrayAwaitingCustList.push(dataList);
                    }
                    //}

                }
            }
            templateObject.datatablerecords.set(dataTableList);
            templateObject.datatablerecords1.set(dataTableList);

            $('.fullScreenSpin').css('display', 'none');
            setTimeout(function () {
                //$.fn.dataTable.moment('DD/MM/YY');
                $('#tblcustomerAwaitingPayment').DataTable({
                    data: splashArrayAwaitingCustList,
                    columnDefs: [{
                        className: "chkBox",
                        "orderable": false,
                        "targets": [0]
                    }, {
                        className: "colSortDate hiddenColumn",
                        "targets": [1]
                    }, {
                        className: "colPaymentDate",
                        "targets": [2]
                    }, {
                        className: "colReceiptNo",
                        "targets": [3]
                    }, {
                        className: "colSaleNumber",
                        "targets": [4]
                    }, {
                        className: "colPaymentAmount text-right",
                        "targets": [5]
                    }, {
                        className: "colApplied text-right",
                        "targets": [6]
                    }, {
                        className: "colBalance text-right",
                        "targets": [7]
                    }, {
                        className: "colCustomerName",
                        "targets": [8], // this will invoke the below function on all cells
                        'createdCell': function (td, cellData, rowData, row, col) {
                            // this will give each cell an ID
                            $(td).closest('tr').attr('id', rowData[4]);
                            $(td).attr('id', 'colCustomerName' + rowData[4]);
                        }
                    }, {
                        className: "colTypePayment hiddenColumn",
                        "targets": [9], // this will invoke the below function on all cells
                        'createdCell': function (td, cellData, rowData, row, col) {
                            // this will give each cell an ID
                            $(td).attr('id', 'coltype' + rowData[4]);
                        }
                    }, {
                        className: "colNotes",
                        "targets": [10]
                    }],
                    "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                    buttons: [{
                        extend: 'excelHtml5',
                        text: '',
                        download: 'open',
                        className: "btntabletocsv hiddenColumn",
                        filename: "Outstanding Invoices - " + moment().format(),
                        orientation: 'portrait',
                        exportOptions: {
                            columns: ':visible:not(.chkBox)',
                            format: {
                                body: function (data, row, column) {
                                    if (data.includes("</span>")) {
                                        var res = data.split("</span>");
                                        data = res[1];
                                    }

                                    return column === 1 ? data.replace(/<.*?>/ig, "") : data;

                                }
                            }
                        }
                    }, {
                        extend: 'print',
                        download: 'open',
                        className: "btntabletopdf hiddenColumn",
                        text: '',
                        title: 'Customer Payment',
                        filename: "Outstanding Invoices - " + moment().format(),
                        exportOptions: {
                            columns: ':visible:not(.chkBox)',
                            stripHtml: false
                        }
                    }],
                    select: true,
                    destroy: true,
                    colReorder: true,
                    colReorder: {
                        fixedColumnsLeft: 1
                    },
                    paging: false,
                    "scrollY": "400px",
                    "scrollCollapse": true,
                    info: true,
                    responsive: true,
                    "order": [
                        [1, "desc"]
                    ],
                    language: {search: "", searchPlaceholder: "Search List..."},
                    // "aaSorting": [[1,'desc']],
                    action: function () {
                        $('#tblcustomerAwaitingPayment').DataTable().ajax.reload();
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
                    let draftRecord = templateObject.datatablerecords.get();
                    templateObject.datatablerecords.set(draftRecord);
                }).on('column-reorder', function () {
                }).on('length.dt', function (e, settings, len) {
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                });
                $('.fullScreenSpin').css('display', 'none');
            }, 0);

            $('div.dataTables_filter input').addClass('form-control form-control-sm');


        }).catch(function (err) {
            // Bert.alert('<strong>' + err + '</strong>!', 'danger');
            $('.fullScreenSpin').css('display', 'none');
            // Meteor._reload.reload();
        });
    }

    templateObject.getAccountNames = function () {
        getVS1Data('TAccountVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                paymentService.getAccountNameVS1().then(function (data) {
                    for (let i in data.taccountvs1) {

                        let accountnamerecordObj = {
                            accountname: data.taccountvs1[i].AccountName || ' '
                        };
                        // $('#edtBankAccountName').editableSelect('add',data.taccount[i].AccountName);
                        if (data.taccountvs1[i].AccountTypeName == "BANK" || data.taccountvs1[i].AccountTypeName.toUpperCase() == "CCARD" || data.taccountvs1[i].AccountTypeName.toUpperCase() == "OCLIAB") {
                            accountnamerecords.push(accountnamerecordObj);
                        }

                        templateObject.accountnamerecords.set(accountnamerecords);
                        if (templateObject.accountnamerecords.get()) {
                            setTimeout(function () {
                                var usedNames = {};
                                $("select[name='edtBankAccountName'] > option").each(function () {
                                    if (usedNames[this.text]) {
                                        $(this).remove();
                                    } else {
                                        usedNames[this.text] = this.value;
                                    }
                                });
                            }, 1000);
                        }

                    }
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.taccountvs1;
                for (let i in useData) {

                    let accountnamerecordObj = {
                        accountname: useData[i].fields.AccountName || ' '
                    };
                    // $('#edtBankAccountName').editableSelect('add',data.taccount[i].AccountName);
                    if (useData[i].fields.AccountTypeName.replace(/\s/g, '') == "BANK" || useData[i].fields.AccountTypeName.toUpperCase() == "CCARD" || useData[i].fields.AccountTypeName.toUpperCase() == "OCLIAB") {
                        accountnamerecords.push(accountnamerecordObj);
                    }
                    //accountnamerecords.push(accountnamerecordObj);
                    templateObject.accountnamerecords.set(accountnamerecords);
                    if (templateObject.accountnamerecords.get()) {
                        setTimeout(function () {
                            var usedNames = {};
                            $("select[name='edtBankAccountName'] > option").each(function () {
                                if (usedNames[this.text]) {
                                    $(this).remove();
                                } else {
                                    usedNames[this.text] = this.value;
                                }
                            });
                        }, 1000);
                    }

                }

            }
        }).catch(function (err) {
            paymentService.getAccountNameVS1().then(function (data) {
                for (let i in data.taccountvs1) {

                    let accountnamerecordObj = {
                        accountname: data.taccountvs1[i].AccountName || ' '
                    };
                    // $('#edtBankAccountName').editableSelect('add',data.taccount[i].AccountName);
                    if (data.taccountvs1[i].AccountTypeName == "BANK" || data.taccountvs1[i].AccountTypeName.toUpperCase() == "CCARD" || data.taccountvs1[i].AccountTypeName.toUpperCase() == "OCLIAB") {
                        accountnamerecords.push(accountnamerecordObj);
                    }
                    templateObject.accountnamerecords.set(accountnamerecords);
                    if (templateObject.accountnamerecords.get()) {
                        setTimeout(function () {
                            var usedNames = {};
                            $("select[name='edtBankAccountName'] > option").each(function () {
                                if (usedNames[this.text]) {
                                    $(this).remove();
                                } else {
                                    usedNames[this.text] = this.value;
                                }
                            });
                        }, 1000);
                    }

                }
            });
        });

    }

    templateObject.getAllClients();
    templateObject.getDepartments();
    templateObject.getPaymentMethods();
    templateObject.getAccountNames();
    setTimeout(function () {
        if (customerName != '') {
            templateObject.getAllCustomerPaymentData(customerName);
        }
    }, 500)

    $(document).on("click", "#departmentList tbody tr", function (e) {
        $('#sltDepartment').val($(this).find(".colDeptName").text());
        $('#departmentModal').modal('toggle');
    });

    $(document).on("click", "#paymentmethodList tbody tr", function (e) {
        $('#sltPaymentMethod').val($(this).find(".colName").text());
        $('#paymentMethodModal').modal('toggle');
    });

    $(document).on("click", "#tblCustomerlist tbody tr", function (e) {
        let customers = templateObject.clientrecords.get();
        var tableCustomer = $(this);
        let $tblrows = $("#tblPaymentcard tbody tr");
        $('#edtCustomerName').val(tableCustomer.find(".colCompany").text());
        // $('#edtCustomerName').attr("custid", tableCustomer.find(".colID").text());
        $('#customerListModal').modal('toggle');

        $('#edtCustomerEmail').val(tableCustomer.find(".colEmail").text());
        $('#edtCustomerEmail').attr('customerid', tableCustomer.find(".colID").text());


        let postalAddress = tableCustomer.find(".colCompany").text() + '\n' + tableCustomer.find(".colStreetAddress").text() + '\n' + tableCustomer.find(".colCity").text() + ' ' + tableCustomer.find(".colState").text() + ' ' + tableCustomer.find(".colZipCode").text() + '\n' + tableCustomer.find(".colCountry").text();
        $('#txabillingAddress').val(postalAddress);

        let selectedCustomer = $('#edtCustomerName').val();
        let isEmptyData = false;

        if (jQuery.isEmptyObject(FlowRouter.current().queryParams) == true) {
            if ($tblrows.length > 0) {
                $tblrows.each(function (index) {
                    var $tblrow = $(this);
                    if ($tblrow.find(".colTransNo").val() == '') {
                        isEmptyData = true;
                    } else {
                        isEmptyData = false;
                    }
                });
            } else {
                isEmptyData = true;
            }
            setTimeout(function () {

                if (isEmptyData) {
                    $('#addRow').trigger('click');
                }
            }, 500);

        }
        // if (clientList) {
        //     $('#edtCustomerEmail').val(clientList[i].customeremail);
        //     $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
        //     let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + '\n' + clientList[i].street3 + '\n' + clientList[i].suburb + '\n' + clientList[i].statecode + '\n' + clientList[i].country;
        //     $('#txabillingAddress').val(postalAddress);
        // }


        $('#tblCustomerlist_filter .form-control-sm').val('');
        setTimeout(function () {
            $('.btnRefreshCustomer').trigger('click');
            $('.fullScreenSpin').css('display', 'none');
        }, 1000);
    });

    $(document).on("click", "#tblAccount tbody tr", function (e) {
        //$(".colProductName").removeClass('boldtablealertsborder');
        let selectLineID = $('#selectLineID').val();
        var table = $(this);
        let utilityService = new UtilityService();
        let $tblrows = $("#tblStockAdjustmentLine tbody tr");

        let accountname = table.find(".productName").text();
        $('#accountListModal').modal('toggle');
        $('#edtSelectBankAccountName').val(accountname);
        if ($tblrows.find(".lineProductName").val() == '') {
            //$tblrows.find(".colProductName").addClass('boldtablealertsborder');
        }

        $('#tblAccount_filter .form-control-sm').val('');
        setTimeout(function () {
            $('.btnRefreshAccount').trigger('click');
            $('.fullScreenSpin').css('display', 'none');
        }, 1000);
    });

    $('#sltPaymentMethod').editableSelect();
    $('#sltPaymentMethod').editableSelect()
        .on('click.editable-select', function (e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            var paymentDataName = e.target.value || '';
            $('#edtPaymentMethodID').val('');
            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#paymentMethodModal').modal('toggle');
            } else {
                if (paymentDataName.replace(/\s/g, '') != '') {
                    $('#paymentMethodHeader').text('Edit Payment Method');

                    getVS1Data('TPaymentMethod').then(function (dataObject) {
                        if (dataObject.length == 0) {
                            LoadingOverlay.show();
                            sideBarService.getPaymentMethodDataVS1().then(function (data) {
                                for (let i = 0; i < data.tpaymentmethodvs1.length; i++) {
                                    if (data.tpaymentmethodvs1[i].fields.PaymentMethodName === paymentDataName) {
                                        $('#edtPaymentMethodID').val(data.tpaymentmethodvs1[i].fields.ID);
                                        $('#edtPaymentMethodName').val(data.tpaymentmethodvs1[i].fields.PaymentMethodName);
                                        if (data.tpaymentmethodvs1[i].fields.IsCreditCard === true) {
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
                            });
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.tpaymentmethodvs1;

                            for (let i = 0; i < data.tpaymentmethodvs1.length; i++) {
                                if (data.tpaymentmethodvs1[i].fields.PaymentMethodName === paymentDataName) {
                                    $('#edtPaymentMethodID').val(data.tpaymentmethodvs1[i].fields.ID);
                                    $('#edtPaymentMethodName').val(data.tpaymentmethodvs1[i].fields.PaymentMethodName);
                                    if (data.tpaymentmethodvs1[i].fields.IsCreditCard === true) {
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
                    }).catch(function (err) {
                        LoadingOverlay.show();
                        sideBarService.getPaymentMethodDataVS1().then(function (data) {
                            for (let i = 0; i < data.tpaymentmethodvs1.length; i++) {
                                if (data.tpaymentmethodvs1[i].fields.PaymentMethodName === paymentDataName) {
                                    $('#edtPaymentMethodID').val(data.tpaymentmethodvs1[i].fields.ID);
                                    $('#edtPaymentMethodName').val(data.tpaymentmethodvs1[i].fields.PaymentMethodName);
                                    if (data.tpaymentmethodvs1[i].fields.IsCreditCard === true) {
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
        });

    $('#sltDepartment').editableSelect();
    $('#sltDepartment').editableSelect()
        .on('click.editable-select', function (e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            var deptDataName = e.target.value || '';
            $('#edtDepartmentID').val('');
            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#departmentModal').modal('toggle');
            } else {
                if (deptDataName.replace(/\s/g, '') != '') {
                    $('#newDeptHeader').text('Edit Department');

                    getVS1Data('TDeptClass').then(function (dataObject) {
                        if (dataObject.length == 0) {
                            LoadingOverlay.show();
                            sideBarService.getDepartment().then(function (data) {
                                for (let i = 0; i < data.tdeptclass.length; i++) {
                                    if (data.tdeptclass[i].DeptClassName === deptDataName) {
                                        $('#edtDepartmentID').val(data.tdeptclass[i].Id);
                                        $('#edtNewDeptName').val(data.tdeptclass[i].DeptClassName);
                                        $('#edtSiteCode').val(data.tdeptclass[i].SiteCode);
                                        $('#edtDeptDesc').val(data.tdeptclass[i].Description);
                                    }
                                }
                                setTimeout(function () {
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
                            setTimeout(function () {
                                $('.fullScreenSpin').css('display', 'none');
                                $('#newDepartmentModal').modal('toggle');
                            }, 200);
                        }
                    }).catch(function (err) {
                        LoadingOverlay.show();
                        sideBarService.getDepartment().then(function (data) {
                            for (let i = 0; i < data.tdeptclass.length; i++) {
                                if (data.tdeptclass[i].DeptClassName === deptDataName) {
                                    $('#edtDepartmentID').val(data.tdeptclass[i].Id);
                                    $('#edtNewDeptName').val(data.tdeptclass[i].DeptClassName);
                                    $('#edtSiteCode').val(data.tdeptclass[i].SiteCode);
                                    $('#edtDeptDesc').val(data.tdeptclass[i].Description);
                                }
                            }
                            setTimeout(function () {
                                $('.fullScreenSpin').css('display', 'none');
                                $('#newDepartmentModal').modal('toggle');
                            }, 200);
                        });
                    });
                } else {
                    $('#departmentModal').modal();
                    setTimeout(function () {
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

    $('#edtSelectBankAccountName').editableSelect();

    $('#edtSelectBankAccountName').editableSelect()
        .on('click.editable-select', function (e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            let accountService = new AccountService();
            const accountTypeList = [];
            var accountDataName = e.target.value || '';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#selectLineID').val('');
                $('#accountListModal').modal();
                setTimeout(function () {
                    $('#tblAccount_filter .form-control-sm').focus();
                    $('#tblAccount_filter .form-control-sm').val('');
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblAccountlist').DataTable();
                    datatable.draw();
                    $('#tblAccountlist_filter .form-control-sm').trigger("input");
                }, 500);
            } else {
                if (accountDataName.replace(/\s/g, '') != '') {
                    getVS1Data('TAccountVS1').then(function (dataObject) {
                        if (dataObject.length == 0) {
                            accountService.getOneAccountByName(accountDataName).then(function (data) {
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

                                setTimeout(function () {
                                    $('#addNewAccount').modal('show');
                                }, 500);

                            }).catch(function (err) {
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

                                    setTimeout(function () {
                                        $('#addNewAccount').modal('show');
                                    }, 500);

                                }
                            }
                            if (!added) {
                                accountService.getOneAccountByName(accountDataName).then(function (data) {
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

                                    setTimeout(function () {
                                        $('#addNewAccount').modal('show');
                                    }, 500);

                                }).catch(function (err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });
                            }

                        }
                    }).catch(function (err) {
                        accountService.getOneAccountByName(accountDataName).then(function (data) {
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

                            setTimeout(function () {
                                $('#addNewAccount').modal('show');
                            }, 500);

                        }).catch(function (err) {
                            $('.fullScreenSpin').css('display', 'none');
                        });

                    });
                    $('#addAccountModal').modal('toggle');
                } else {
                    $('#selectLineID').val('');
                    $('#accountListModal').modal();
                    setTimeout(function () {
                        $('#tblAccount_filter .form-control-sm').focus();
                        $('#tblAccount_filter .form-control-sm').val('');
                        $('#tblAccount_filter .form-control-sm').trigger("input");
                        var datatable = $('#tblSupplierlist').DataTable();
                        datatable.draw();
                        $('#tblAccount_filter .form-control-sm').trigger("input");
                    }, 500);
                }
            }

        });

    $('#edtCustomerName').editableSelect()
        .on('click.editable-select', function (e, li) {
            let selectedCustomer = li.text();
            if (clientList) {
                for (var i = 0; i < clientList.length; i++) {
                    if (clientList[i].customername == selectedCustomer) {
                        $('#edtCustomerEmail').val(clientList[i].customeremail);
                        $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                        let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + '\n' + clientList[i].street3 + '\n' + clientList[i].suburb + '\n' + clientList[i].statecode + '\n' + clientList[i].country;
                        $('#txabillingAddress').val(postalAddress);
                    }
                }
            }
        });

    $('#edtCustomerName').editableSelect()
        .on('click.editable-select', function (e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            var customerDataName = e.target.value || '';
            $('#edtCustomerPOPID').val('');
            // var customerDataID = $('#edtCustom3erName').attr('custid').replace(/\s/g, '') ||'';
            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#customerListModal').modal();
                setTimeout(function () {
                    $('#tblCustomerlist_filter .form-control-sm').focus();
                    $('#tblCustomerlist_filter .form-control-sm').val('');
                    $('#tblCustomerlist_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblCustomerlist').DataTable();
                    datatable.draw();
                    $('#tblCustomerlist_filter .form-control-sm').trigger("input");
                }, 500);
            } else {
                if (customerDataName.replace(/\s/g, '') != '') {
                    //FlowRouter.go('/customerscard?name=' + e.target.value);
                    $('#edtCustomerPOPID').val('');
                    getVS1Data('TCustomerVS1').then(function (dataObject) {
                        if (dataObject.length == 0) {
                            LoadingOverlay.show();
                            sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
                                $('.fullScreenSpin').css('display', 'none');
                                let lineItems = [];
                                $('#add-customer-title').text('Edit Customer');
                                let popCustomerID = data.tcustomer[0].fields.ID || '';
                                let popCustomerName = data.tcustomer[0].fields.ClientName || '';
                                let popCustomerEmail = data.tcustomer[0].fields.Email || '';
                                let popCustomerTitle = data.tcustomer[0].fields.Title || '';
                                let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
                                let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
                                let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
                                let popCustomertfn = '' || '';
                                let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
                                let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
                                let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
                                let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
                                let popCustomerURL = data.tcustomer[0].fields.URL || '';
                                let popCustomerStreet = data.tcustomer[0].fields.Street || '';
                                let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
                                let popCustomerState = data.tcustomer[0].fields.State || '';
                                let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
                                let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
                                let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
                                let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
                                let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
                                let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
                                let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
                                let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
                                let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
                                let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
                                let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
                                let popCustomernotes = data.tcustomer[0].fields.Notes || '';
                                let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
                                let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
                                let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
                                let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
                                let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
                                let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
                                let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
                                let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
                                let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
                                let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
                                $('#edtCustomerCompany').val(popCustomerName);
                                $('#edtCustomerPOPID').val(popCustomerID);
                                $('#edtCustomerPOPEmail').val(popCustomerEmail);
                                $('#edtTitle').val(popCustomerTitle);
                                $('#edtFirstName').val(popCustomerFirstName);
                                $('#edtMiddleName').val(popCustomerMiddleName);
                                $('#edtLastName').val(popCustomerLastName);
                                $('#edtCustomerPhone').val(popCustomerPhone);
                                $('#edtCustomerMobile').val(popCustomerMobile);
                                $('#edtCustomerFax').val(popCustomerFaxnumber);
                                $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                                $('#edtCustomerWebsite').val(popCustomerURL);
                                $('#edtCustomerShippingAddress').val(popCustomerStreet);
                                $('#edtCustomerShippingCity').val(popCustomerStreet2);
                                $('#edtCustomerShippingState').val(popCustomerState);
                                $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                                $('#sedtCountry').val(popCustomerCountry);
                                $('#txaNotes').val(popCustomernotes);
                                $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                                $('#sltTermsPOP').val(popCustomerterms);
                                $('#sltCustomerType').val(popCustomerType);
                                $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                                $('#edtCustomeField1').val(popCustomercustfield1);
                                $('#edtCustomeField2').val(popCustomercustfield2);
                                $('#edtCustomeField3').val(popCustomercustfield3);
                                $('#edtCustomeField4').val(popCustomercustfield4);

                                $('#sltTaxCode').val(popCustomerTaxCode);

                                if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
                                    (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
                                    (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
                                    $('#chkSameAsShipping2').attr("checked", "checked");
                                }

                                if (data.tcustomer[0].fields.IsSupplier == true) {
                                    // $('#isformcontractor')
                                    $('#chkSameAsSupplier').attr("checked", "checked");
                                } else {
                                    $('#chkSameAsSupplier').removeAttr("checked");
                                }

                                setTimeout(function () {
                                    $('#addCustomerModal').modal('show');
                                }, 200);
                            }).catch(function (err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.tcustomervs1;

                            var added = false;
                            for (let i = 0; i < data.tcustomervs1.length; i++) {
                                if (data.tcustomervs1[i].fields.ClientName === customerDataName) {
                                    let lineItems = [];
                                    added = true;
                                    $('.fullScreenSpin').css('display', 'none');
                                    $('#add-customer-title').text('Edit Customer');
                                    let popCustomerID = data.tcustomervs1[i].fields.ID || '';
                                    let popCustomerName = data.tcustomervs1[i].fields.ClientName || '';
                                    let popCustomerEmail = data.tcustomervs1[i].fields.Email || '';
                                    let popCustomerTitle = data.tcustomervs1[i].fields.Title || '';
                                    let popCustomerFirstName = data.tcustomervs1[i].fields.FirstName || '';
                                    let popCustomerMiddleName = data.tcustomervs1[i].fields.CUSTFLD10 || '';
                                    let popCustomerLastName = data.tcustomervs1[i].fields.LastName || '';
                                    let popCustomertfn = '' || '';
                                    let popCustomerPhone = data.tcustomervs1[i].fields.Phone || '';
                                    let popCustomerMobile = data.tcustomervs1[i].fields.Mobile || '';
                                    let popCustomerFaxnumber = data.tcustomervs1[i].fields.Faxnumber || '';
                                    let popCustomerSkypeName = data.tcustomervs1[i].fields.SkypeName || '';
                                    let popCustomerURL = data.tcustomervs1[i].fields.URL || '';
                                    let popCustomerStreet = data.tcustomervs1[i].fields.Street || '';
                                    let popCustomerStreet2 = data.tcustomervs1[i].fields.Street2 || '';
                                    let popCustomerState = data.tcustomervs1[i].fields.State || '';
                                    let popCustomerPostcode = data.tcustomervs1[i].fields.Postcode || '';
                                    let popCustomerCountry = data.tcustomervs1[i].fields.Country || LoggedCountry;
                                    let popCustomerbillingaddress = data.tcustomervs1[i].fields.BillStreet || '';
                                    let popCustomerbcity = data.tcustomervs1[i].fields.BillStreet2 || '';
                                    let popCustomerbstate = data.tcustomervs1[i].fields.BillState || '';
                                    let popCustomerbpostalcode = data.tcustomervs1[i].fields.BillPostcode || '';
                                    let popCustomerbcountry = data.tcustomervs1[i].fields.Billcountry || LoggedCountry;
                                    let popCustomercustfield1 = data.tcustomervs1[i].fields.CUSTFLD1 || '';
                                    let popCustomercustfield2 = data.tcustomervs1[i].fields.CUSTFLD2 || '';
                                    let popCustomercustfield3 = data.tcustomervs1[i].fields.CUSTFLD3 || '';
                                    let popCustomercustfield4 = data.tcustomervs1[i].fields.CUSTFLD4 || '';
                                    let popCustomernotes = data.tcustomervs1[i].fields.Notes || '';
                                    let popCustomerpreferedpayment = data.tcustomervs1[i].fields.PaymentMethodName || '';
                                    let popCustomerterms = data.tcustomervs1[i].fields.TermsName || '';
                                    let popCustomerdeliverymethod = data.tcustomervs1[i].fields.ShippingMethodName || '';
                                    let popCustomeraccountnumber = data.tcustomervs1[i].fields.ClientNo || '';
                                    let popCustomerisContractor = data.tcustomervs1[i].fields.Contractor || false;
                                    let popCustomerissupplier = data.tcustomervs1[i].fields.IsSupplier || false;
                                    let popCustomeriscustomer = data.tcustomervs1[i].fields.IsCustomer || false;
                                    let popCustomerTaxCode = data.tcustomervs1[i].fields.TaxCodeName || '';
                                    let popCustomerDiscount = data.tcustomervs1[i].fields.Discount || 0;
                                    let popCustomerType = data.tcustomervs1[i].fields.ClientTypeName || '';
                                    $('#edtCustomerCompany').val(popCustomerName);
                                    $('#edtCustomerPOPID').val(popCustomerID);
                                    $('#edtCustomerPOPEmail').val(popCustomerEmail);
                                    $('#edtTitle').val(popCustomerTitle);
                                    $('#edtFirstName').val(popCustomerFirstName);
                                    $('#edtMiddleName').val(popCustomerMiddleName);
                                    $('#edtLastName').val(popCustomerLastName);
                                    $('#edtCustomerPhone').val(popCustomerPhone);
                                    $('#edtCustomerMobile').val(popCustomerMobile);
                                    $('#edtCustomerFax').val(popCustomerFaxnumber);
                                    $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                                    $('#edtCustomerWebsite').val(popCustomerURL);
                                    $('#edtCustomerShippingAddress').val(popCustomerStreet);
                                    $('#edtCustomerShippingCity').val(popCustomerStreet2);
                                    $('#edtCustomerShippingState').val(popCustomerState);
                                    $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                                    $('#sedtCountry').val(popCustomerCountry);
                                    $('#txaNotes').val(popCustomernotes);
                                    $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                                    $('#sltTermsPOP').val(popCustomerterms);
                                    $('#sltCustomerType').val(popCustomerType);
                                    $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                                    $('#edtCustomeField1').val(popCustomercustfield1);
                                    $('#edtCustomeField2').val(popCustomercustfield2);
                                    $('#edtCustomeField3').val(popCustomercustfield3);
                                    $('#edtCustomeField4').val(popCustomercustfield4);

                                    $('#sltTaxCode').val(popCustomerTaxCode);

                                    if ((data.tcustomervs1[i].fields.Street == data.tcustomervs1[i].fields.BillStreet) && (data.tcustomervs1[i].fields.Street2 == data.tcustomervs1[i].fields.BillStreet2) &&
                                        (data.tcustomervs1[i].fields.State == data.tcustomervs1[i].fields.BillState) && (data.tcustomervs1[i].fields.Postcode == data.tcustomervs1[i].fields.BillPostcode) &&
                                        (data.tcustomervs1[i].fields.Country == data.tcustomervs1[i].fields.Billcountry)) {
                                        $('#chkSameAsShipping2').attr("checked", "checked");
                                    }

                                    if (data.tcustomervs1[i].fields.IsSupplier == true) {
                                        // $('#isformcontractor')
                                        $('#chkSameAsSupplier').attr("checked", "checked");
                                    } else {
                                        $('#chkSameAsSupplier').removeAttr("checked");
                                    }

                                    setTimeout(function () {
                                        $('#addCustomerModal').modal('show');
                                    }, 200);

                                }
                            }
                            if (!added) {
                                LoadingOverlay.show();
                                sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
                                    $('.fullScreenSpin').css('display', 'none');
                                    let lineItems = [];
                                    $('#add-customer-title').text('Edit Customer');
                                    let popCustomerID = data.tcustomer[0].fields.ID || '';
                                    let popCustomerName = data.tcustomer[0].fields.ClientName || '';
                                    let popCustomerEmail = data.tcustomer[0].fields.Email || '';
                                    let popCustomerTitle = data.tcustomer[0].fields.Title || '';
                                    let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
                                    let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
                                    let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
                                    let popCustomertfn = '' || '';
                                    let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
                                    let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
                                    let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
                                    let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
                                    let popCustomerURL = data.tcustomer[0].fields.URL || '';
                                    let popCustomerStreet = data.tcustomer[0].fields.Street || '';
                                    let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
                                    let popCustomerState = data.tcustomer[0].fields.State || '';
                                    let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
                                    let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
                                    let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
                                    let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
                                    let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
                                    let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
                                    let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
                                    let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
                                    let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
                                    let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
                                    let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
                                    let popCustomernotes = data.tcustomer[0].fields.Notes || '';
                                    let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
                                    let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
                                    let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
                                    let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
                                    let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
                                    let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
                                    let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
                                    let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
                                    let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
                                    let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
                                    $('#edtCustomerCompany').val(popCustomerName);
                                    $('#edtCustomerPOPID').val(popCustomerID);
                                    $('#edtCustomerPOPEmail').val(popCustomerEmail);
                                    $('#edtTitle').val(popCustomerTitle);
                                    $('#edtFirstName').val(popCustomerFirstName);
                                    $('#edtMiddleName').val(popCustomerMiddleName);
                                    $('#edtLastName').val(popCustomerLastName);
                                    $('#edtCustomerPhone').val(popCustomerPhone);
                                    $('#edtCustomerMobile').val(popCustomerMobile);
                                    $('#edtCustomerFax').val(popCustomerFaxnumber);
                                    $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                                    $('#edtCustomerWebsite').val(popCustomerURL);
                                    $('#edtCustomerShippingAddress').val(popCustomerStreet);
                                    $('#edtCustomerShippingCity').val(popCustomerStreet2);
                                    $('#edtCustomerShippingState').val(popCustomerState);
                                    $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                                    $('#sedtCountry').val(popCustomerCountry);
                                    $('#txaNotes').val(popCustomernotes);
                                    $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                                    $('#sltTermsPOP').val(popCustomerterms);
                                    $('#sltCustomerType').val(popCustomerType);
                                    $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                                    $('#edtCustomeField1').val(popCustomercustfield1);
                                    $('#edtCustomeField2').val(popCustomercustfield2);
                                    $('#edtCustomeField3').val(popCustomercustfield3);
                                    $('#edtCustomeField4').val(popCustomercustfield4);

                                    $('#sltTaxCode').val(popCustomerTaxCode);

                                    if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
                                        (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
                                        (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
                                        $('#chkSameAsShipping2').attr("checked", "checked");
                                    }

                                    if (data.tcustomer[0].fields.IsSupplier == true) {
                                        // $('#isformcontractor')
                                        $('#chkSameAsSupplier').attr("checked", "checked");
                                    } else {
                                        $('#chkSameAsSupplier').removeAttr("checked");
                                    }

                                    setTimeout(function () {
                                        $('#addCustomerModal').modal('show');
                                    }, 200);
                                }).catch(function (err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });
                            }
                        }
                    }).catch(function (err) {
                        sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
                            $('.fullScreenSpin').css('display', 'none');
                            let lineItems = [];
                            $('#add-customer-title').text('Edit Customer');
                            let popCustomerID = data.tcustomer[0].fields.ID || '';
                            let popCustomerName = data.tcustomer[0].fields.ClientName || '';
                            let popCustomerEmail = data.tcustomer[0].fields.Email || '';
                            let popCustomerTitle = data.tcustomer[0].fields.Title || '';
                            let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
                            let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
                            let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
                            let popCustomertfn = '' || '';
                            let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
                            let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
                            let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
                            let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
                            let popCustomerURL = data.tcustomer[0].fields.URL || '';
                            let popCustomerStreet = data.tcustomer[0].fields.Street || '';
                            let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
                            let popCustomerState = data.tcustomer[0].fields.State || '';
                            let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
                            let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
                            let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
                            let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
                            let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
                            let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
                            let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
                            let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
                            let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
                            let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
                            let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
                            let popCustomernotes = data.tcustomer[0].fields.Notes || '';
                            let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
                            let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
                            let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
                            let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
                            let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
                            let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
                            let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
                            let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
                            let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
                            let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
                            $('#edtCustomerCompany').val(popCustomerName);
                            $('#edtCustomerPOPID').val(popCustomerID);
                            $('#edtCustomerPOPEmail').val(popCustomerEmail);
                            $('#edtTitle').val(popCustomerTitle);
                            $('#edtFirstName').val(popCustomerFirstName);
                            $('#edtMiddleName').val(popCustomerMiddleName);
                            $('#edtLastName').val(popCustomerLastName);
                            $('#edtCustomerPhone').val(popCustomerPhone);
                            $('#edtCustomerMobile').val(popCustomerMobile);
                            $('#edtCustomerFax').val(popCustomerFaxnumber);
                            $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                            $('#edtCustomerWebsite').val(popCustomerURL);
                            $('#edtCustomerShippingAddress').val(popCustomerStreet);
                            $('#edtCustomerShippingCity').val(popCustomerStreet2);
                            $('#edtCustomerShippingState').val(popCustomerState);
                            $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                            $('#sedtCountry').val(popCustomerCountry);
                            $('#txaNotes').val(popCustomernotes);
                            $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                            $('#sltTermsPOP').val(popCustomerterms);
                            $('#sltCustomerType').val(popCustomerType);
                            $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                            $('#edtCustomeField1').val(popCustomercustfield1);
                            $('#edtCustomeField2').val(popCustomercustfield2);
                            $('#edtCustomeField3').val(popCustomercustfield3);
                            $('#edtCustomeField4').val(popCustomercustfield4);

                            $('#sltTaxCode').val(popCustomerTaxCode);

                            if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
                                (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
                                (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
                                $('#chkSameAsShipping2').attr("checked", "checked");
                            }

                            if (data.tcustomer[0].fields.IsSupplier == true) {
                                // $('#isformcontractor')
                                $('#chkSameAsSupplier').attr("checked", "checked");
                            } else {
                                $('#chkSameAsSupplier').removeAttr("checked");
                            }

                            setTimeout(function () {
                                $('#addCustomerModal').modal('show');
                            }, 200);
                        }).catch(function (err) {
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    });
                } else {
                    $('#customerListModal').modal();
                    setTimeout(function () {
                        $('#tblCustomerlist_filter .form-control-sm').focus();
                        $('#tblCustomerlist_filter .form-control-sm').val('');
                        $('#tblCustomerlist_filter .form-control-sm').trigger("input");
                        var datatable = $('#tblCustomerlist').DataTable();
                        datatable.draw();
                        $('#tblCustomerlist_filter .form-control-sm').trigger("input");
                    }, 500);
                }
            }


        });

    if (url.indexOf('?id=') > 0) {
        $("#addRow").attr("disabled", true);
        var getsale_id = url.split('?id=');
        var currentSalesID = getsale_id[getsale_id.length - 1];
        if (getsale_id[1]) {
            currentSalesID = parseInt(currentSalesID);
            let deteled = false;
            getVS1Data('TCustomerPayment').then(function (dataObject) {
                if (dataObject.length == 0) {
                    paymentService.getOneCustomerPayment(currentSalesID).then(function (data) {
                        let lineItems = [];
                        let lineItemObj = {};
                        deteled = data.fields.Deleted;

                        let total = utilityService.modifynegativeCurrencyFormat(data.fields.Amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let appliedAmt = utilityService.modifynegativeCurrencyFormat(data.fields.Applied).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        if (data.fields.Lines != null) {
                            if (data.fields.Lines.length) {
                                for (let i = 0; i < data.fields.Lines.length; i++) {
                                    let amountDue = Currency + '' + data.fields.Lines[i].fields.AmountDue.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    let paymentAmt = Currency + '' + data.fields.Lines[i].fields.Payment.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    let outstandingAmt = Currency + '' + data.fields.Lines[i].fields.AmountOutstanding.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    let originalAmt = Currency + '' + data.fields.Lines[i].fields.OriginalAmount.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });

                                    lineItemObj = {
                                        //lid:data.fields.Lines[i].fields.ID || '',
                                        id: data.fields.Lines[i].fields.ID || '',
                                        invoiceid: data.fields.Lines[i].fields.TransNo || '',
                                        transid: data.fields.Lines[i].fields.TransNo || '',
                                        invoicedate: data.fields.Lines[i].fields.Date != '' ? moment(data.fields.Lines[i].fields.Date).format("DD/MM/YYYY") : data.fields.Lines[i].fields.Date,
                                        refno: data.fields.Lines[i].fields.RefNo || '',
                                        transtype: data.fields.Lines[i].fields.TrnType || '',
                                        amountdue: amountDue || 0,
                                        paymentamount: paymentAmt || 0,
                                        ouststandingamount: outstandingAmt,
                                        orginalamount: originalAmt,
                                        comments: ''
                                    };
                                    lineItems.push(lineItemObj);
                                }
                            } else {
                                let amountDue = Currency + '' + data.fields.Lines.fields.AmountDue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let paymentAmt = Currency + '' + data.fields.Lines.fields.Payment.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let outstandingAmt = Currency + '' + data.fields.Lines.fields.AmountOutstanding.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let originalAmt = Currency + '' + data.fields.Lines.fields.OriginalAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                lineItemObj = {
                                    id: data.fields.Lines.fields.ID || '',
                                    invoiceid: data.fields.Lines.fields.InvoiceId || '',
                                    transid: data.fields.Lines.fields.InvoiceNo || '',
                                    invoicedate: data.fields.Lines.fields.Date != '' ? moment(data.fields.Lines.fields.Date).format("DD/MM/YYYY") : data.fields.Lines.fields.Date,
                                    refno: data.fields.Lines.fields.RefNo || '',
                                    transtype: data.fields.Lines.fields.TrnType || '',
                                    amountdue: amountDue || 0,
                                    paymentamount: paymentAmt || 0,
                                    ouststandingamount: outstandingAmt,
                                    orginalamount: originalAmt
                                };
                                lineItems.push(lineItemObj);
                            }
                        } else {
                            //deteled = true;
                        }
                        let record = {
                            lid: data.fields.ID || '',
                            customerName: data.fields.CompanyName || '',
                            paymentDate: data.fields.PaymentDate ? moment(data.fields.PaymentDate).format('DD/MM/YYYY') : "",
                            reference: data.fields.ReferenceNo || ' ',
                            bankAccount: data.fields.AccountName || '',
                            paymentAmount: appliedAmt || 0,
                            notes: data.fields.Notes,
                            deleted: data.fields.Deleted || false,
                            LineItems: lineItems,
                            checkpayment: data.fields.PaymentMethodName,
                            department: data.fields.DeptClassName,
                            applied: appliedAmt.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            })

                        };
                        templateObject.record.set(record);
                        _setTmpAppliedAmount(record.applied);
                        $('#edtCustomerName').val(data.fields.CompanyName);
                        $('#edtSelectBankAccountName').val(data.fields.AccountName);
                        $('#sltPaymentMethod').val(data.fields.PaymentMethodName);
                        $('#sltCurrency').val(data.fields.ForeignExchangeCode);
                        $('#exchange_rate').val(data.fields.ForeignExchangeRate);
                        FxGlobalFunctions.handleChangedCurrency($('#sltCurrency').val(), defaultCurrencyCode);

                        $('#edtCustomerName').attr('readonly', true);
                        $('#edtCustomerName').css('background-color', '#eaecf4');

                        // $('#edtCustomerEmail').attr('readonly', true);

                        $('#edtPaymentAmount').attr('readonly', true);

                        $('#edtSelectBankAccountName').attr('disabled', 'disabled');
                        $('#edtSelectBankAccountName').attr('readonly', true);

                        //$('.ui-datepicker-trigger').css('pointer-events', 'none');
                        //$('#dtPaymentDate').attr('readonly', true);

                        $('#sltPaymentMethod').attr('disabled', 'disabled');
                        $('#sltPaymentMethod').attr('readonly', true);

                        $('#sltDepartment').attr('disabled', 'disabled');
                        $('#sltDepartment').attr('readonly', true);
                        setTimeout(function () {
                            $('.tblPaymentcard > tbody > tr > td').attr('contenteditable', 'false');
                        }, 1000);

                        // $('#edtBankAccountName').val(data.fields.AccountName);
                        $('#edtBankAccountName').append('<option value="' + data.fields.AccountName + '" selected="selected">' + data.fields.AccountName + '</option>');
                        setTimeout(function () {
                            var usedNames = {};
                            $("select[name='edtBankAccountName'] > option").each(function () {
                                if (usedNames[this.text]) {
                                    $(this).remove();
                                } else {
                                    usedNames[this.text] = this.value;
                                }
                            });
                        }, 1000);
                        $('#sltDepartment').append('<option value="' + data.fields.DeptClassName + '" selected="selected">' + data.fields.DeptClassName + '</option>');
                        if (clientList) {
                            for (var i = 0; i < clientList.length; i++) {
                                if (clientList[i].customername == data.fields.CompanyName) {
                                    $('#edtCustomerEmail').val(clientList[i].customeremail);
                                    $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                                    let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + '\n' + clientList[i].street3 + '\n' + clientList[i].suburb + '\n' + clientList[i].statecode + '\n' + clientList[i].country;
                                    $('#txabillingAddress').val(postalAddress);
                                }
                            }
                        }
                        $('.fullScreenSpin').css('display', 'none');

                    });
                } else {

                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.tcustomerpayment;
                    var added = false;
                    for (let d = 0; d < useData.length; d++) {

                        if (parseInt(useData[d].fields.ID) === currentSalesID) {
                            $('.fullScreenSpin').css('display', 'none');
                            deteled = useData[d].fields.Deleted;

                            added = true;
                            let lineItems = [];
                            let lineItemObj = {};

                            let total = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Amount).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let appliedAmt = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Applied).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });

                            if (useData[d].fields.Lines.length) {

                                for (let i = 0; i < useData[d].fields.Lines.length; i++) {
                                    let amountDue = Currency + '' + useData[d].fields.Lines[i].fields.AmountDue.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    let paymentAmt = Currency + '' + useData[d].fields.Lines[i].fields.Payment.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    let outstandingAmt = Currency + '' + useData[d].fields.Lines[i].fields.AmountOutstanding.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    let originalAmt = Currency + '' + useData[d].fields.Lines[i].fields.OriginalAmount.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });

                                    lineItemObj = {
                                        //lid:useData[d].fields.Lines[i].fields.ID || '',
                                        id: useData[d].fields.Lines[i].fields.ID || '',
                                        invoiceid: useData[d].fields.Lines[i].fields.TransNo || '',
                                        transid: useData[d].fields.Lines[i].fields.TransNo || '',
                                        invoicedate: useData[d].fields.Lines[i].fields.Date != '' ? moment(useData[d].fields.Lines[i].fields.Date).format("DD/MM/YYYY") : useData[d].fields.Lines[i].fields.Date,
                                        refno: useData[d].fields.Lines[i].fields.RefNo || '',
                                        transtype: useData[d].fields.Lines[i].fields.TrnType || '',
                                        amountdue: amountDue || 0,
                                        paymentamount: paymentAmt || 0,
                                        ouststandingamount: outstandingAmt,
                                        orginalamount: originalAmt
                                    };
                                    lineItems.push(lineItemObj);
                                }
                            } else {
                                let amountDue = Currency + '' + useData[d].fields.Lines.fields.AmountDue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let paymentAmt = Currency + '' + useData[d].fields.Lines.fields.Payment.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let outstandingAmt = Currency + '' + useData[d].fields.Lines.fields.AmountOutstanding.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let originalAmt = Currency + '' + useData[d].fields.Lines.fields.OriginalAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                lineItemObj = {
                                    id: useData[d].fields.Lines.fields.ID || '',
                                    invoiceid: useData[d].fields.Lines.fields.InvoiceId || '',
                                    transid: useData[d].fields.Lines.fields.InvoiceNo || '',
                                    invoicedate: useData[d].fields.Lines.fields.Date != '' ? moment(useData[d].fields.Lines.fields.Date).format("DD/MM/YYYY") : useData[d].fields.Lines.fields.Date,
                                    refno: useData[d].fields.Lines.fields.RefNo || '',
                                    transtype: useData[d].fields.Lines.fields.TrnType || '',
                                    amountdue: amountDue || 0,
                                    paymentamount: paymentAmt || 0,
                                    ouststandingamount: outstandingAmt,
                                    orginalamount: originalAmt
                                };
                                lineItems.push(lineItemObj);
                            }

                            let record = {
                                lid: useData[d].fields.ID || '',
                                customerName: useData[d].fields.CompanyName || '',
                                paymentDate: useData[d].fields.PaymentDate ? moment(useData[d].fields.PaymentDate).format('DD/MM/YYYY') : "",
                                reference: useData[d].fields.ReferenceNo || ' ',
                                bankAccount: useData[d].fields.AccountName || '',
                                paymentAmount: appliedAmt || 0,
                                notes: useData[d].fields.Notes,
                                deleted: useData[d].fields.Deleted || false,
                                LineItems: lineItems,
                                checkpayment: useData[d].fields.PaymentMethodName,
                                department: useData[d].fields.DeptClassName,
                                applied: appliedAmt.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                })

                            };
                            templateObject.record.set(record);
                            $('#edtCustomerName').val(useData[d].fields.CompanyName);
                            $('#sltDepartment').val(useData[d].fields.DeptClassName);
                            $('#edtSelectBankAccountName').val(useData[d].fields.AccountName);
                            $('#sltPaymentMethod').val(useData[d].fields.PaymentMethodName);
                            $('#sltCurrency').val(useData[d].fields.ForeignExchangeCode)
                            $('#exchange_rate').val(useData[d].fields.ForeignExchangeRate)
                            FxGlobalFunctions.handleChangedCurrency($('#sltCurrency').val(), defaultCurrencyCode);

                            $('#edtCustomerName').attr('readonly', true);
                            $('#edtCustomerName').css('background-color', '#eaecf4');

                            // $('#edtCustomerEmail').attr('readonly', true);

                            $('#edtPaymentAmount').attr('readonly', true);

                            $('#edtSelectBankAccountName').attr('disabled', 'disabled');
                            $('#edtSelectBankAccountName').attr('readonly', true);

                            //$('.ui-datepicker-trigger').css('pointer-events', 'none');
                            //$('#dtPaymentDate').attr('readonly', true);

                            $('#sltPaymentMethod').attr('disabled', 'disabled');
                            $('#sltPaymentMethod').attr('readonly', true);

                            $('#sltDepartment').attr('disabled', 'disabled');
                            $('#sltDepartment').attr('readonly', true);

                            setTimeout(function () {
                                $('.tblPaymentcard > tbody > tr > td').attr('contenteditable', 'false');
                            }, 1000);

                            // $('#edtBankAccountName').val(useData[d].fields.AccountName);
                            $('#edtBankAccountName').append('<option value="' + useData[d].fields.AccountName + '" selected="selected">' + useData[d].fields.AccountName + '</option>');
                            setTimeout(function () {
                                var usedNames = {};
                                $("select[name='edtBankAccountName'] > option").each(function () {
                                    if (usedNames[this.text]) {
                                        $(this).remove();
                                    } else {
                                        usedNames[this.text] = this.value;
                                    }
                                });
                            }, 1000);
                            $('#sltDepartment').append('<option value="' + useData[d].fields.DeptClassName + '" selected="selected">' + useData[d].fields.DeptClassName + '</option>');
                            if (clientList) {
                                for (var i = 0; i < clientList.length; i++) {
                                    if (clientList[i].customername == useData[d].fields.CompanyName) {
                                        $('#edtCustomerEmail').val(clientList[i].customeremail);
                                        $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                                        let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + '\n' + clientList[i].street3 + '\n' + clientList[i].suburb + '\n' + clientList[i].statecode + '\n' + clientList[i].country;
                                        $('#txabillingAddress').val(postalAddress);
                                    }
                                }
                            }
                        }
                    }

                    if (!added) {
                        paymentService.getOneCustomerPayment(currentSalesID).then(function (data) {
                            let lineItems = [];
                            let lineItemObj = {};

                            let total = utilityService.modifynegativeCurrencyFormat(data.fields.Amount).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let appliedAmt = utilityService.modifynegativeCurrencyFormat(data.fields.Applied).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            if (data.fields.Lines != null) {
                                if (data.fields.Lines.length) {
                                    for (let i = 0; i < data.fields.Lines.length; i++) {
                                        let amountDue = Currency + '' + data.fields.Lines[i].fields.AmountDue.toLocaleString(undefined, {
                                            minimumFractionDigits: 2
                                        });
                                        let paymentAmt = Currency + '' + data.fields.Lines[i].fields.Payment.toLocaleString(undefined, {
                                            minimumFractionDigits: 2
                                        });
                                        let outstandingAmt = Currency + '' + data.fields.Lines[i].fields.AmountOutstanding.toLocaleString(undefined, {
                                            minimumFractionDigits: 2
                                        });
                                        let originalAmt = Currency + '' + data.fields.Lines[i].fields.OriginalAmount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2
                                        });

                                        lineItemObj = {
                                            //lid:data.fields.Lines[i].fields.ID || '',
                                            id: data.fields.Lines[i].fields.ID || '',
                                            invoiceid: data.fields.Lines[i].fields.TransNo || '',
                                            transid: data.fields.Lines[i].fields.TransNo || '',
                                            invoicedate: data.fields.Lines[i].fields.Date != '' ? moment(data.fields.Lines[i].fields.Date).format("DD/MM/YYYY") : data.fields.Lines[i].fields.Date,
                                            refno: data.fields.Lines[i].fields.RefNo || '',
                                            transtype: data.fields.Lines[i].fields.TrnType || '',
                                            amountdue: amountDue || 0,
                                            paymentamount: paymentAmt || 0,
                                            ouststandingamount: outstandingAmt,
                                            orginalamount: originalAmt
                                        };
                                        lineItems.push(lineItemObj);
                                    }
                                } else {
                                    let amountDue = Currency + '' + data.fields.Lines.fields.AmountDue.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    let paymentAmt = Currency + '' + data.fields.Lines.fields.Payment.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    let outstandingAmt = Currency + '' + data.fields.Lines.fields.AmountOutstanding.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    let originalAmt = Currency + '' + data.fields.Lines.fields.OriginalAmount.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    lineItemObj = {
                                        id: data.fields.Lines.fields.ID || '',
                                        invoiceid: data.fields.Lines.fields.InvoiceId || '',
                                        transid: data.fields.Lines.fields.InvoiceNo || '',
                                        invoicedate: data.fields.Lines.fields.Date != '' ? moment(data.fields.Lines.fields.Date).format("DD/MM/YYYY") : data.fields.Lines.fields.Date,
                                        refno: data.fields.Lines.fields.RefNo || '',
                                        transtype: data.fields.Lines.fields.TrnType || '',
                                        amountdue: amountDue || 0,
                                        paymentamount: paymentAmt || 0,
                                        ouststandingamount: outstandingAmt,
                                        orginalamount: originalAmt
                                    };
                                    lineItems.push(lineItemObj);
                                }
                            } else {
                                //deteled = true;
                            }
                            deteled = data.fields.Deleted;

                            let record = {
                                lid: data.fields.ID || '',
                                customerName: data.fields.CompanyName || '',
                                paymentDate: data.fields.PaymentDate ? moment(data.fields.PaymentDate).format('DD/MM/YYYY') : "",
                                reference: data.fields.ReferenceNo || ' ',
                                bankAccount: data.fields.AccountName || '',
                                paymentAmount: appliedAmt || 0,
                                notes: data.fields.Notes,
                                deleted: data.fields.Deleted || false,
                                LineItems: lineItems,
                                checkpayment: data.fields.PaymentMethodName,
                                department: data.fields.DeptClassName,
                                applied: appliedAmt.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                })

                            };
                            templateObject.record.set(record);
                            $('#edtCustomerName').val(data.fields.CompanyName);
                            $('#edtSelectBankAccountName').val(data.fields.AccountName);
                            $('#sltPaymentMethod').val(data.fields.PaymentMethodName);


                            $('#edtCustomerName').attr('readonly', true);
                            $('#edtCustomerName').css('background-color', '#eaecf4');

                            // $('#edtCustomerEmail').attr('readonly', true);

                            $('#edtPaymentAmount').attr('readonly', true);

                            $('#edtSelectBankAccountName').attr('disabled', 'disabled');
                            $('#edtSelectBankAccountName').attr('readonly', true);

                            //$('.ui-datepicker-trigger').css('pointer-events', 'none');
                            //$('#dtPaymentDate').attr('readonly', true);

                            $('#sltPaymentMethod').attr('disabled', 'disabled');
                            $('#sltPaymentMethod').attr('readonly', true);

                            $('#sltDepartment').attr('disabled', 'disabled');
                            $('#sltDepartment').attr('readonly', true);

                            setTimeout(function () {
                                $('.tblPaymentcard > tbody > tr > td').attr('contenteditable', 'false');
                            }, 1000);

                            // $('#edtBankAccountName').val(data.fields.AccountName);
                            $('#edtBankAccountName').append('<option value="' + data.fields.AccountName + '" selected="selected">' + data.fields.AccountName + '</option>');
                            setTimeout(function () {
                                var usedNames = {};
                                $("select[name='edtBankAccountName'] > option").each(function () {
                                    if (usedNames[this.text]) {
                                        $(this).remove();
                                    } else {
                                        usedNames[this.text] = this.value;
                                    }
                                });
                            }, 1000);
                            $('#sltDepartment').append('<option value="' + data.fields.DeptClassName + '" selected="selected">' + data.fields.DeptClassName + '</option>');
                            if (clientList) {
                                for (var i = 0; i < clientList.length; i++) {
                                    if (clientList[i].customername == data.fields.CompanyName) {
                                        $('#edtCustomerEmail').val(clientList[i].customeremail);
                                        $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                                        let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + '\n' + clientList[i].street3 + '\n' + clientList[i].suburb + '\n' + clientList[i].statecode + '\n' + clientList[i].country;
                                        $('#txabillingAddress').val(postalAddress);
                                    }
                                }
                            }
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    }
                }
            }).catch(function (err) {
                paymentService.getOneCustomerPayment(currentSalesID).then(function (data) {
                    let lineItems = [];
                    let lineItemObj = {};

                    let total = utilityService.modifynegativeCurrencyFormat(data.fields.Amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let appliedAmt = utilityService.modifynegativeCurrencyFormat(data.fields.Applied).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    deteled = data.fields.Deleted;

                    if (data.fields.Lines != null) {
                        if (data.fields.Lines.length) {
                            for (let i = 0; i < data.fields.Lines.length; i++) {
                                let amountDue = Currency + '' + data.fields.Lines[i].fields.AmountDue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let paymentAmt = Currency + '' + data.fields.Lines[i].fields.Payment.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let outstandingAmt = Currency + '' + data.fields.Lines[i].fields.AmountOutstanding.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let originalAmt = Currency + '' + data.fields.Lines[i].fields.OriginalAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });

                                lineItemObj = {
                                    //lid:data.fields.Lines[i].fields.ID || '',
                                    id: data.fields.Lines[i].fields.ID || '',
                                    invoiceid: data.fields.Lines[i].fields.TransNo || '',
                                    transid: data.fields.Lines[i].fields.TransNo || '',
                                    invoicedate: data.fields.Lines[i].fields.Date != '' ? moment(data.fields.Lines[i].fields.Date).format("DD/MM/YYYY") : data.fields.Lines[i].fields.Date,
                                    refno: data.fields.Lines[i].fields.RefNo || '',
                                    transtype: data.fields.Lines[i].fields.TrnType || '',
                                    amountdue: amountDue || 0,
                                    paymentamount: paymentAmt || 0,
                                    ouststandingamount: outstandingAmt,
                                    orginalamount: originalAmt
                                };
                                lineItems.push(lineItemObj);
                            }
                        } else {
                            let amountDue = Currency + '' + data.fields.Lines.fields.AmountDue.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let paymentAmt = Currency + '' + data.fields.Lines.fields.Payment.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let outstandingAmt = Currency + '' + data.fields.Lines.fields.AmountOutstanding.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let originalAmt = Currency + '' + data.fields.Lines.fields.OriginalAmount.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            lineItemObj = {
                                id: data.fields.Lines.fields.ID || '',
                                invoiceid: data.fields.Lines.fields.InvoiceId || '',
                                transid: data.fields.Lines.fields.InvoiceNo || '',
                                invoicedate: data.fields.Lines.fields.Date != '' ? moment(data.fields.Lines.fields.Date).format("DD/MM/YYYY") : data.fields.Lines.fields.Date,
                                refno: data.fields.Lines.fields.RefNo || '',
                                transtype: data.fields.Lines.fields.TrnType || '',
                                amountdue: amountDue || 0,
                                paymentamount: paymentAmt || 0,
                                ouststandingamount: outstandingAmt,
                                orginalamount: originalAmt
                            };
                            lineItems.push(lineItemObj);
                        }
                    } else {
                        //deteled = true;
                    }
                    let record = {
                        lid: data.fields.ID || '',
                        customerName: data.fields.CompanyName || '',
                        paymentDate: data.fields.PaymentDate ? moment(data.fields.PaymentDate).format('DD/MM/YYYY') : "",
                        reference: data.fields.ReferenceNo || ' ',
                        bankAccount: data.fields.AccountName || '',
                        paymentAmount: appliedAmt || 0,
                        notes: data.fields.Notes,
                        deleted: ata.fields.Deleted || false,
                        LineItems: lineItems,
                        checkpayment: data.fields.PaymentMethodName,
                        department: data.fields.DeptClassName,
                        applied: appliedAmt.toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        })

                    };

                    templateObject.record.set(record);
                    $('#edtCustomerName').val(data.fields.CompanyName);
                    $('#edtSelectBankAccountName').val(data.fields.AccountName);
                    $('#sltPaymentMethod').val(data.fields.PaymentMethodName);


                    $('#edtCustomerName').attr('readonly', true);
                    $('#edtCustomerName').css('background-color', '#eaecf4');
                    // $('#edtCustomerEmail').attr('readonly', true);

                    $('#edtPaymentAmount').attr('readonly', true);

                    $('#edtSelectBankAccountName').attr('disabled', 'disabled');
                    $('#edtSelectBankAccountName').attr('readonly', true);

                    //$('.ui-datepicker-trigger').css('pointer-events', 'none');
                    //$('#dtPaymentDate').attr('readonly', true);

                    $('#sltPaymentMethod').attr('disabled', 'disabled');
                    $('#sltPaymentMethod').attr('readonly', true);

                    $('#sltDepartment').attr('disabled', 'disabled');
                    $('#sltDepartment').attr('readonly', true);

                    setTimeout(function () {
                        $('.tblPaymentcard > tbody > tr > td').attr('contenteditable', 'false');
                    }, 1000);

                    // $('#edtBankAccountName').val(data.fields.AccountName);
                    $('#edtBankAccountName').append('<option value="' + data.fields.AccountName + '" selected="selected">' + data.fields.AccountName + '</option>');
                    setTimeout(function () {
                        var usedNames = {};
                        $("select[name='edtBankAccountName'] > option").each(function () {
                            if (usedNames[this.text]) {
                                $(this).remove();
                            } else {
                                usedNames[this.text] = this.value;
                            }
                        });
                    }, 1000);
                    $('#sltDepartment').append('<option value="' + data.fields.DeptClassName + '" selected="selected">' + data.fields.DeptClassName + '</option>');
                    if (clientList) {
                        for (var i = 0; i < clientList.length; i++) {
                            if (clientList[i].customername == data.fields.CompanyName) {
                                $('#edtCustomerEmail').val(clientList[i].customeremail);
                                $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                                let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + '\n' + clientList[i].street3 + '\n' + clientList[i].suburb + '\n' + clientList[i].statecode + '\n' + clientList[i].country;
                                $('#txabillingAddress').val(postalAddress);
                            }
                        }
                    }
                    $('.fullScreenSpin').css('display', 'none');
                });
            });

            FxGlobalFunctions.handleChangedCurrency($('#sltCurrency').val(), defaultCurrencyCode);

        }

        $('#tblPaymentcard tbody').on('click', 'tr .colType, tr .colTransNo', function () {
            var listData = $(this).closest('tr').attr('id');
            if (listData) {
                window.open('/invoicecard?id=' + listData, '_self');
            }
        });

    } else if (url.indexOf('?soid=') > 0) {

        var getsale_id = url.split('?soid=');
        var currentSalesID = getsale_id[getsale_id.length - 1];
        if (getsale_id[1]) {
            currentSalesID = parseInt(currentSalesID);
            paymentService.getOneSalesOrderPayment(currentSalesID).then(function (data) {
                let lineItems = [];
                let lineItemObj = {};

                let total = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                let appliedAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                var currentDate = new Date();
                var begunDate = moment(currentDate).format("DD/MM/YYYY");
                let amountDue = Currency + '' + data.fields.TotalBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                let paymentAmt = Currency + '' + data.fields.TotalBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                let outstandingAmt = Currency + '' + data.fields.TotalBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                let originalAmt = Currency + '' + data.fields.TotalBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                lineItemObj = {
                    id: data.fields.ID || '',
                    invoiceid: data.fields.ID || '',
                    transid: data.fields.ID || '',
                    invoicedate: data.fields.SaleDate != '' ? moment(data.fields.SaleDate).format("DD/MM/YYYY") : data.fields.SaleDate,
                    refno: data.fields.ReferenceNo || '',
                    amountdue: amountDue || 0,
                    paymentamount: paymentAmt || 0,
                    ouststandingamount: outstandingAmt,
                    orginalamount: originalAmt,
                    comments: data.fields.Comments || ''
                };
                lineItems.push(lineItemObj);
                let record = {
                    lid: '',
                    customerName: data.fields.CustomerName || '',
                    paymentDate: begunDate,
                    reference: data.fields.ReferenceNo || ' ',
                    bankAccount: data.fields.GLAccountName || '',
                    paymentAmount: appliedAmt || 0,
                    notes: data.fields.Comments,
                    LineItems: lineItems,
                    checkpayment: data.fields.PayMethod,
                    department: data.fields.DeptClassName,
                    applied: appliedAmt.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    })

                };
                templateObject.record.set(record);
                _setTmpAppliedAmount(record.applied);
                $('#edtCustomerName').val(data.fields.CustomerName);
                $('#sltPaymentMethod').val(data.fields.PayMethod);
                $('#sltDepartment').val(data.fields.DeptClassName);
                $('#edtSelectBankAccountName').val(data.fields.GLAccountName);
                if (clientList) {
                    for (var i = 0; i < clientList.length; i++) {
                        if (clientList[i].customername == data.fields.CustomerName) {
                            $('#edtCustomerEmail').val(clientList[i].customeremail);
                            $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                            let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + '\n' + clientList[i].street3 + '\n' + clientList[i].suburb + '\n' + clientList[i].statecode + '\n' + clientList[i].country;
                            $('#txabillingAddress').val(postalAddress);
                        }
                    }
                }

                $('.fullScreenSpin').css('display', 'none');
            });
        }

        $('#tblPaymentcard tbody').on('click', 'tr .colType, tr .colTransNo', function () {
            var listData = $(this).closest('tr').attr('id');
            if (listData) {
                window.open('/salesordercard?id=' + listData, '_self');
            }
        });
    } else if (url.indexOf('?quoteid=') > 0) {

        var getsale_id = url.split('?quoteid=');
        var currentSalesID = getsale_id[getsale_id.length - 1];
        if (getsale_id[1]) {
            currentSalesID = parseInt(currentSalesID);
            paymentService.getOneQuotePayment(currentSalesID).then(function (data) {
                let lineItems = [];
                let lineItemObj = {};

                let total = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                let appliedAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                var currentDate = new Date();
                var begunDate = moment(currentDate).format("DD/MM/YYYY");
                let amountDue = Currency + '' + data.fields.TotalBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                let paymentAmt = Currency + '' + data.fields.TotalBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                let outstandingAmt = Currency + '' + data.fields.TotalBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                let originalAmt = Currency + '' + data.fields.TotalBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                lineItemObj = {
                    id: data.fields.ID || '',
                    invoiceid: data.fields.ID || '',
                    transid: data.fields.ID || '',
                    invoicedate: data.fields.SaleDate != '' ? moment(data.fields.SaleDate).format("DD/MM/YYYY") : data.fields.SaleDate,
                    refno: data.fields.ReferenceNo || '',
                    amountdue: amountDue || 0,
                    paymentamount: paymentAmt || 0,
                    ouststandingamount: outstandingAmt,
                    orginalamount: originalAmt,
                    comments: data.fields.Comments || ''
                };
                lineItems.push(lineItemObj);
                let record = {
                    lid: '',
                    customerName: data.fields.CustomerName || '',
                    paymentDate: begunDate,
                    reference: data.fields.ReferenceNo || ' ',
                    bankAccount: data.fields.GLAccountName || '',
                    paymentAmount: appliedAmt || 0,
                    notes: data.fields.Comments,
                    LineItems: lineItems,
                    checkpayment: data.fields.PayMethod,
                    department: data.fields.DeptClassName,
                    applied: appliedAmt.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    })

                };
                templateObject.record.set(record);
                _setTmpAppliedAmount(record.applied);
                $('#edtCustomerName').val(data.fields.CustomerName);
                $('#sltPaymentMethod').val(data.fields.PayMethod);
                $('#sltDepartment').val(data.fields.DeptClassName);
                $('#edtSelectBankAccountName').val(data.fields.GLAccountName);
                if (clientList) {
                    for (var i = 0; i < clientList.length; i++) {
                        if (clientList[i].customername == data.fields.CustomerName) {
                            $('#edtCustomerEmail').val(clientList[i].customeremail);
                            $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                            let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + '\n' + clientList[i].street3 + '\n' + clientList[i].suburb + '\n' + clientList[i].statecode + '\n' + clientList[i].country;
                            $('#txabillingAddress').val(postalAddress);
                        }
                    }
                }
                $('.fullScreenSpin').css('display', 'none');
            });
        }

        $('#tblPaymentcard tbody').on('click', 'tr .colType, tr .colTransNo', function () {
            var listData = $(this).closest('tr').attr('id');
            if (listData) {
                window.open('/quotecard?id=' + listData, '_self');
            }
        });
    } else if (url.indexOf('?invid=') > 0) {

        var getsale_id = url.split('?invid=');
        var currentSalesID = getsale_id[getsale_id.length - 1];
        if (getsale_id[1]) {
            currentSalesID = parseInt(currentSalesID);
            getVS1Data('TInvoiceEx').then(async function (dataObject) {
                if (dataObject.length == 0) {
                    paymentService.getOneInvoicePayment(currentSalesID).then(async function (data) {
                        let lineItems = [];
                        let lineItemObj = {};

                        let total = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let appliedAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        var currentDate = new Date();
                        var begunDate = moment(currentDate).format("DD/MM/YYYY");
                        let amountDue = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        // Currency+''+data.fields.TotalBalance.toLocaleString(undefined, {minimumFractionDigits: 2});
                        let paymentAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let outstandingAmt = utilityService.modifynegativeCurrencyFormat(0).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let originalAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmountInc).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        // Currency+''+data.fields.TotalAmountInc.toLocaleString(undefined, {minimumFractionDigits: 2});
                        lineItemObj = {
                            id: data.fields.ID || '',
                            invoiceid: data.fields.ID || '',
                            transid: data.fields.ID || '',
                            invoicedate: data.fields.SaleDate != '' ? moment(data.fields.SaleDate).format("DD/MM/YYYY") : data.fields.SaleDate,
                            refno: data.fields.ReferenceNo || '',
                            transtype: "Invoice" || '',
                            amountdue: amountDue || 0,
                            paymentamount: paymentAmt || 0,
                            ouststandingamount: outstandingAmt,
                            orginalamount: originalAmt,
                            comments: data.fields.Comments || ''
                        };
                        lineItems.push(lineItemObj);
                        let record = {
                            lid: '',
                            customerName: data.fields.CustomerName || '',
                            paymentDate: begunDate,
                            reference: data.fields.ReferenceNo || ' ',
                            bankAccount: Session.get('bankaccount') || data.fields.GLAccountName || '',
                            paymentAmount: appliedAmt || 0,
                            notes: data.fields.Comments,
                            LineItems: lineItems,
                            checkpayment: Session.get('paymentmethod') || data.fields.PayMethod,
                            department: Session.get('department') || data.fields.DeptClassName,
                            applied: appliedAmt.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            })

                        };

                        _setTmpAppliedAmount(record.applied);
                        let getPaymentMethodVal = Session.get('paymentmethod') || data.fields.PayMethod || 'Cash';
                        $('#sltPaymentMethod').val(getPaymentMethodVal);

                        let getDepartmentVal = Session.get('department') || data.fields.DeptClassName || defaultDept;
                        templateObject.record.set(record);
                        $('#edtCustomerName').val(data.fields.CustomerName);
                        $('#sltDepartment').val(getDepartmentVal);
                        let bankAccountData = Session.get('bankaccount') || 'Bank';
                        $('#edtSelectBankAccountName').val(bankAccountData);
                        await templateObject.getLastPaymentData();
                        if (clientList) {
                            for (var i = 0; i < clientList.length; i++) {
                                if (clientList[i].customername == data.fields.CustomerName) {
                                    $('#edtCustomerEmail').val(clientList[i].customeremail);
                                    $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                                    let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + '\n' + clientList[i].street3 + '\n' + clientList[i].suburb + '\n' + clientList[i].statecode + '\n' + clientList[i].country;
                                    $('#txabillingAddress').val(postalAddress);
                                }
                            }
                        }
                        $('.fullScreenSpin').css('display', 'none');
                    });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.tinvoiceex;

                    var added = false;
                    for (let d = 0; d < useData.length; d++) {
                        if (parseInt(useData[d].fields.ID) === currentSalesID) {
                            added = true;
                            $('.fullScreenSpin').css('display', 'none');
                            let lineItems = [];
                            let lineItemObj = {};

                            let total = utilityService.modifynegativeCurrencyFormat(useData[d].fields.TotalBalance).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let appliedAmt = utilityService.modifynegativeCurrencyFormat(useData[d].fields.TotalBalance).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            var currentDate = new Date();
                            var begunDate = moment(currentDate).format("DD/MM/YYYY");
                            let amountDue = utilityService.modifynegativeCurrencyFormat(useData[d].fields.TotalBalance).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            // Currency+''+useData[d].fields.TotalBalance.toLocaleString(undefined, {minimumFractionDigits: 2});
                            let paymentAmt = utilityService.modifynegativeCurrencyFormat(useData[d].fields.TotalBalance).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let outstandingAmt = utilityService.modifynegativeCurrencyFormat(0).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let originalAmt = utilityService.modifynegativeCurrencyFormat(useData[d].fields.TotalAmountInc).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            // Currency+''+useData[d].fields.TotalAmountInc.toLocaleString(undefined, {minimumFractionDigits: 2});
                            lineItemObj = {
                                id: useData[d].fields.ID || '',
                                invoiceid: useData[d].fields.ID || '',
                                transid: useData[d].fields.ID || '',
                                invoicedate: useData[d].fields.SaleDate != '' ? moment(useData[d].fields.SaleDate).format("DD/MM/YYYY") : useData[d].fields.SaleDate,
                                refno: useData[d].fields.ReferenceNo || '',
                                transtype: "Invoice" || '',
                                amountdue: amountDue || 0,
                                paymentamount: paymentAmt || 0,
                                ouststandingamount: outstandingAmt,
                                orginalamount: originalAmt,
                                comments: useData[d].fields.Comments || ''
                            };
                            lineItems.push(lineItemObj);
                            let record = {
                                lid: '',
                                customerName: useData[d].fields.CustomerName || '',
                                paymentDate: begunDate,
                                reference: useData[d].fields.ReferenceNo || ' ',
                                bankAccount: Session.get('bankaccount') || useData[d].fields.GLAccountName || '',
                                paymentAmount: appliedAmt || 0,
                                notes: useData[d].fields.Comments,
                                LineItems: lineItems,
                                checkpayment: Session.get('paymentmethod') || useData[d].fields.PayMethod,
                                department: Session.get('department') || useData[d].fields.DeptClassName,
                                applied: appliedAmt.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                })

                            };


                            templateObject.record.set(record);
                            _setTmpAppliedAmount(record.applied);
                            let getDepartmentVal = Session.get('department') || useData[d].fields.DeptClassName || defaultDept;

                            $('#edtCustomerName').val(useData[d].fields.CustomerName);
                            let getPaymentMethodVal = Session.get('paymentmethod') || useData[d].fields.PayMethod;
                            $('#sltPaymentMethod').val(getPaymentMethodVal);
                            $('#sltDepartment').val(getDepartmentVal);
                            let bankAccountData = Session.get('bankaccount') || 'Bank';
                            $('#edtSelectBankAccountName').val(bankAccountData);
                            await templateObject.getLastPaymentData();
                            if (clientList) {
                                for (var i = 0; i < clientList.length; i++) {
                                    if (clientList[i].customername == useData[d].fields.CustomerName) {
                                        $('#edtCustomerEmail').val(clientList[i].customeremail);
                                        $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                                        let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + '\n' + clientList[i].street3 + '\n' + clientList[i].suburb + '\n' + clientList[i].statecode + '\n' + clientList[i].country;
                                        $('#txabillingAddress').val(postalAddress);
                                    }
                                }
                            }
                            $('.fullScreenSpin').css('display', 'none');
                        }
                    }

                    if (!added) {
                        paymentService.getOneInvoicePayment(currentSalesID).then(async function (data) {
                            let lineItems = [];
                            let lineItemObj = {};

                            let total = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let appliedAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            var currentDate = new Date();
                            var begunDate = moment(currentDate).format("DD/MM/YYYY");
                            let amountDue = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            // Currency+''+data.fields.TotalBalance.toLocaleString(undefined, {minimumFractionDigits: 2});
                            let paymentAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let outstandingAmt = utilityService.modifynegativeCurrencyFormat(0).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let originalAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmountInc).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            // Currency+''+data.fields.TotalAmountInc.toLocaleString(undefined, {minimumFractionDigits: 2});
                            lineItemObj = {
                                id: data.fields.ID || '',
                                invoiceid: data.fields.ID || '',
                                transid: data.fields.ID || '',
                                invoicedate: data.fields.SaleDate != '' ? moment(data.fields.SaleDate).format("DD/MM/YYYY") : data.fields.SaleDate,
                                refno: data.fields.ReferenceNo || '',
                                transtype: "Invoice" || '',
                                amountdue: amountDue || 0,
                                paymentamount: paymentAmt || 0,
                                ouststandingamount: outstandingAmt,
                                orginalamount: originalAmt,
                                comments: data.fields.Comments || ''
                            };
                            lineItems.push(lineItemObj);
                            let record = {
                                lid: '',
                                customerName: data.fields.CustomerName || '',
                                paymentDate: begunDate,
                                reference: data.fields.ReferenceNo || ' ',
                                bankAccount: Session.get('bankaccount') || data.fields.GLAccountName || '',
                                paymentAmount: appliedAmt || 0,
                                notes: data.fields.Comments,
                                LineItems: lineItems,
                                checkpayment: Session.get('paymentmethod') || data.fields.PayMethod,
                                department: Session.get('department') || data.fields.DeptClassName,
                                applied: appliedAmt.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                })

                            };
                            _setTmpAppliedAmount(record.applied);

                            let getPaymentMethodVal = Session.get('paymentmethod') || data.fields.PayMethod || 'Cash';
                            $('#sltPaymentMethod').val(getPaymentMethodVal);

                            let getDepartmentVal = Session.get('department') || data.fields.DeptClassName || defaultDept;
                            templateObject.record.set(record);
                            $('#edtCustomerName').val(data.fields.CustomerName);
                            $('#sltDepartment').val(getDepartmentVal);
                            let bankAccountData = Session.get('bankaccount') || 'Bank';
                            $('#edtSelectBankAccountName').val(bankAccountData);
                            await templateObject.getLastPaymentData();
                            if (clientList) {
                                for (var i = 0; i < clientList.length; i++) {
                                    if (clientList[i].customername == data.fields.CustomerName) {
                                        $('#edtCustomerEmail').val(clientList[i].customeremail);
                                        $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                                        let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + '\n' + clientList[i].street3 + '\n' + clientList[i].suburb + '\n' + clientList[i].statecode + '\n' + clientList[i].country;
                                        $('#txabillingAddress').val(postalAddress);
                                    }
                                }
                            }
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    }
                }
            }).catch(function (err) {
                paymentService.getOneInvoicePayment(currentSalesID).then(async function (data) {
                    let lineItems = [];
                    let lineItemObj = {};

                    let total = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let appliedAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    var currentDate = new Date();
                    var begunDate = moment(currentDate).format("DD/MM/YYYY");
                    let amountDue = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    // Currency+''+data.fields.TotalBalance.toLocaleString(undefined, {minimumFractionDigits: 2});
                    let paymentAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let outstandingAmt = utilityService.modifynegativeCurrencyFormat(0).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let originalAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmountInc).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    // Currency+''+data.fields.TotalAmountInc.toLocaleString(undefined, {minimumFractionDigits: 2});
                    lineItemObj = {
                        id: data.fields.ID || '',
                        invoiceid: data.fields.ID || '',
                        transid: data.fields.ID || '',
                        invoicedate: data.fields.SaleDate != '' ? moment(data.fields.SaleDate).format("DD/MM/YYYY") : data.fields.SaleDate,
                        refno: data.fields.ReferenceNo || '',
                        transtype: "Invoice" || '',
                        amountdue: amountDue || 0,
                        paymentamount: paymentAmt || 0,
                        ouststandingamount: outstandingAmt,
                        orginalamount: originalAmt,
                        comments: data.fields.Comments || ''
                    };
                    lineItems.push(lineItemObj);
                    let record = {
                        lid: '',
                        customerName: data.fields.CustomerName || '',
                        paymentDate: begunDate,
                        reference: data.fields.ReferenceNo || ' ',
                        bankAccount: Session.get('bankaccount') || data.fields.GLAccountName || '',
                        paymentAmount: appliedAmt || 0,
                        notes: data.fields.Comments,
                        LineItems: lineItems,
                        checkpayment: Session.get('paymentmethod') || data.fields.PayMethod,
                        department: Session.get('department') || data.fields.DeptClassName,
                        applied: appliedAmt.toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        })

                    };
                    templateObject.record.set(record);
                    _setTmpAppliedAmount(record.applied);
                    let getDepartmentVal = Session.get('department') || data.fields.DeptClassName || defaultDept;
                    await templateObject.getLastPaymentData();
                    $('#edtCustomerName').val(data.fields.CustomerName);
                    let getPaymentMethodVal = Session.get('paymentmethod') || data.fields.PayMethod || 'Cash';
                    $('#sltPaymentMethod').val(getPaymentMethodVal);
                    $('#sltDepartment').val(getDepartmentVal);
                    let bankAccountData = Session.get('bankaccount') || 'Bank';
                    $('#edtSelectBankAccountName').val(bankAccountData);
                    if (clientList) {
                        for (var i = 0; i < clientList.length; i++) {
                            if (clientList[i].customername == data.fields.CustomerName) {
                                $('#edtCustomerEmail').val(clientList[i].customeremail);
                                $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                                let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + '\n' + clientList[i].street3 + '\n' + clientList[i].suburb + '\n' + clientList[i].statecode + '\n' + clientList[i].country;
                                $('#txabillingAddress').val(postalAddress);
                            }
                        }
                    }
                    $('.fullScreenSpin').css('display', 'none');
                });
            });

        }

        $('#tblPaymentcard tbody').on('click', 'tr .colType, tr .colTransNo', function () {
            var listData = $(this).closest('tr').attr('id');
            if (listData) {
                window.open('/invoicecard?id=' + listData, '_self');
            }
        });
    } else if ((url.indexOf('?custname=') > 0) && (url.indexOf('from=') > 0)) {
        var getsale_custname = url.split('?custname=');
        var currentSalesURL = getsale_custname[getsale_custname.length - 1].split("&");

        var getsale_salesid = url.split('from=');
        var currentSalesID = getsale_salesid[getsale_salesid.length - 1].split('#')[0];

        if (getsale_custname[1]) {
            let currentSalesName = currentSalesURL[0].replace(/%20/g, " ");
            // let currentSalesID = currentSalesURL[1].split('from=');
            paymentService.getCustomerPaymentByName(currentSalesName).then(function (data) {
                let lineItems = [];
                let lineItemObj = {};
                let companyName = '';
                let referenceNo = '';
                let paymentMethodName = '';
                let accountName = '';
                let notes = '';
                let paymentdate = '';
                let checkpayment = '';
                let department = '';
                let appliedAmt = 0;

                for (let i = 0; i < data.tcustomerpayment.length; i++) {
                    if (data.tcustomerpayment[i].fields.Lines && data.tcustomerpayment[i].fields.Lines.length) {
                        for (let j = 0; j < data.tcustomerpayment[i].fields.Lines.length; j++) {
                            if (data.tcustomerpayment[i].fields.Lines[j].fields.TransNo == currentSalesID) {
                                companyName = data.tcustomerpayment[i].fields.CompanyName;
                                referenceNo = data.tcustomerpayment[i].fields.ReferenceNo;
                                paymentMethodName = data.tcustomerpayment[i].fields.PaymentMethodName;
                                accountName = data.tcustomerpayment[i].fields.AccountName;
                                notes = data.tcustomerpayment[i].fields.Notes;
                                paymentdate = data.tcustomerpayment[i].fields.PaymentDate;
                                checkpayment = data.tcustomerpayment[i].fields.PaymentMethodName;
                                department = data.tcustomerpayment[i].fields.DeptClassName;
                                appliedAmt = utilityService.modifynegativeCurrencyFormat(data.tcustomerpayment[i].fields.Applied).toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                templateObject.custpaymentid.set(data.tcustomerpayment[i].fields.ID);

                                let amountDue = Currency + '' + data.tcustomerpayment[i].fields.Lines[j].fields.AmountDue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let paymentAmt = Currency + '' + data.tcustomerpayment[i].fields.Lines[j].fields.Payment.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let outstandingAmt = Currency + '' + data.tcustomerpayment[i].fields.Lines[j].fields.AmountOutstanding.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let originalAmt = Currency + '' + data.tcustomerpayment[i].fields.Lines[j].fields.OriginalAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });

                                lineItemObj = {
                                    id: data.tcustomerpayment[i].fields.Lines[j].fields.ID || '',
                                    invoiceid: data.tcustomerpayment[i].fields.Lines[j].fields.ID || '',
                                    transid: data.tcustomerpayment[i].fields.Lines[j].fields.ID || '',
                                    invoicedate: data.tcustomerpayment[i].fields.Lines[j].fields.Date != '' ? moment(data.tcustomerpayment[i].fields.Lines[j].fields.Date).format("DD/MM/YYYY") : data.tcustomerpayment[i].fields.Lines[j].fields.Date,
                                    refno: data.tcustomerpayment[i].fields.Lines[j].fields.RefNo || '',
                                    transtype: "Invoice" || '',
                                    amountdue: amountDue || 0,
                                    paymentamount: paymentAmt || 0,
                                    ouststandingamount: outstandingAmt,
                                    orginalamount: originalAmt,
                                    comments: notes || ''
                                };
                                lineItems.push(lineItemObj);
                            } else {
                            }

                        }
                    }
                }

                let record = {
                    lid: '',
                    customerName: companyName || '',
                    paymentDate: paymentdate ? moment(paymentdate).format('DD/MM/YYYY') : "",
                    reference: referenceNo || ' ',
                    bankAccount: Session.get('bankaccount') || accountName || '',
                    paymentAmount: appliedAmt.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    }) || 0,
                    notes: notes || '',
                    LineItems: lineItems,
                    checkpayment: Session.get('paymentmethod') || checkpayment || '',
                    department: Session.get('department') || department || '',
                    applied: appliedAmt.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    }) || 0

                };
                _setTmpAppliedAmount(record.applied);

                let getPaymentMethodVal = Session.get('paymentmethod') || checkpayment || 'Cash';
                $('#sltPaymentMethod').val(getPaymentMethodVal);
                $('#edtCustomerName').val(companyName);
                let bankAccountData = Session.get('bankaccount') || accountName || 'Bank';
                $('#edtSelectBankAccountName').val(bankAccountData);

                templateObject.record.set(record);
                if (clientList) {
                    for (var i = 0; i < clientList.length; i++) {
                        if (clientList[i].customername == companyName) {
                            $('#edtCustomerEmail').val(clientList[i].customeremail);
                            $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                            let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + '\n' + clientList[i].street3 + '\n' + clientList[i].suburb + '\n' + clientList[i].statecode + '\n' + clientList[i].country;
                            $('#txabillingAddress').val(postalAddress);
                        }
                    }
                }
                /*
                let total = utilityService.modifynegativeCurrencyFormat(data.fields.Amount).toLocaleString(undefined, {minimumFractionDigits: 2});
                let appliedAmt = utilityService.modifynegativeCurrencyFormat(data.fields.Applied).toLocaleString(undefined, {minimumFractionDigits: 2});

                if (data.fields.Lines.length) {
                for (let i = 0; i < data.fields.Lines.length; i++) {
                let amountDue = Currency+''+data.fields.Lines[i].fields.AmountDue.toLocaleString(undefined, {minimumFractionDigits: 2});
                let paymentAmt = Currency+''+data.fields.Lines[i].fields.Payment.toLocaleString(undefined, {minimumFractionDigits: 2});
                let outstandingAmt = Currency+''+data.fields.Lines[i].fields.AmountOutstanding.toLocaleString(undefined, {minimumFractionDigits: 2});
                let originalAmt = Currency+''+data.fields.Lines[i].fields.OriginalAmount.toLocaleString(undefined, {minimumFractionDigits: 2});

                lineItemObj = {
                id: data.fields.Lines[i].fields.ID || '',
                invoiceid: data.fields.Lines[i].fields.ID || '',
                transid: data.fields.Lines[i].fields.ID || '',
                invoicedate: data.fields.Lines[i].fields.Date !=''? moment(data.fields.Lines[i].fields.Date).format("DD/MM/YYYY"): data.fields.Lines[i].fields.Date,
                refno: data.fields.Lines[i].fields.RefNo || '',
                amountdue: amountDue || 0,
                paymentamount: paymentAmt || 0,
                ouststandingamount:outstandingAmt,
                orginalamount:originalAmt
                };
                lineItems.push(lineItemObj);
                }
                }else {
                let amountDue = Currency+''+data.fields.Lines.fields.AmountDue.toLocaleString(undefined, {minimumFractionDigits: 2});
                let paymentAmt =  Currency+''+data.fields.Lines.fields.Payment.toLocaleString(undefined, {minimumFractionDigits: 2});
                let outstandingAmt = Currency+''+data.fields.Lines.fields.AmountOutstanding.toLocaleString(undefined, {minimumFractionDigits: 2});
                let originalAmt = Currency+''+data.fields.Lines.fields.OriginalAmount.toLocaleString(undefined, {minimumFractionDigits: 2});
                lineItemObj = {
                id: data.fields.Lines.fields.ID || '',
                invoiceid: data.fields.Lines.fields.InvoiceId || '',
                transid: data.fields.Lines.fields.InvoiceNo || '',
                invoicedate: data.fields.Lines.fields.Date !=''? moment(data.fields.Lines.fields.Date).format("DD/MM/YYYY"): data.fields.Lines.fields.Date,
                refno: data.fields.Lines.fields.RefNo || '',
                amountdue: amountDue || 0,
                paymentamount: paymentAmt || 0,
                ouststandingamount:outstandingAmt,
                orginalamount:originalAmt
                };
                lineItems.push(lineItemObj);
                }

                $('#edtCustomerName').val(data.fields.CompanyName);
                $('#edtBankAccountName').val(data.fields.AccountName);
                if(clientList){
                for (var i = 0; i < clientList.length; i++) {
                if(clientList[i].customername == data.fields.CustomerName){
                $('#edtCustomerEmail').val(clientList[i].customeremail);
                $('#edtCustomerEmail').attr('customerid',clientList[i].customerid);
                }
                }
                }
                 */

                $('.fullScreenSpin').css('display', 'none');
            });
        }
    } else if (url.indexOf('?customername=') > 0) {

        var getsale_id = url.split('?customername=');
        var currentSalesName = getsale_id[getsale_id.length - 1];
        if (getsale_id[1]) {
            currentSalesName = currentSalesName;
            paymentService.getCustomerSalesPayment(currentSalesName).then(function (data) {
                let lineItems = [];
                let lineItemObj = {};

                let total = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                let appliedAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                var currentDate = new Date();
                var begunDate = moment(currentDate).format("DD/MM/YYYY");
                let amountDue = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                // Currency+''+data.fields.TotalBalance.toLocaleString(undefined, {minimumFractionDigits: 2});
                let paymentAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                let outstandingAmt = utilityService.modifynegativeCurrencyFormat(0).toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                let originalAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmountInc).toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                // Currency+''+data.fields.TotalAmountInc.toLocaleString(undefined, {minimumFractionDigits: 2});
                lineItemObj = {
                    id: data.fields.ID || '',
                    invoiceid: data.fields.ID || '',
                    transid: data.fields.ID || '',
                    invoicedate: data.fields.SaleDate != '' ? moment(data.fields.SaleDate).format("DD/MM/YYYY") : data.fields.SaleDate,
                    refno: data.fields.ReferenceNo || '',
                    transtype: "Invoice" || '',
                    amountdue: amountDue || 0,
                    paymentamount: paymentAmt || 0,
                    ouststandingamount: outstandingAmt,
                    orginalamount: originalAmt,
                    comments: data.fields.Comments || ''
                };
                lineItems.push(lineItemObj);
                let record = {
                    lid: '',
                    customerName: data.fields.CustomerName || '',
                    paymentDate: begunDate,
                    reference: data.fields.ReferenceNo || ' ',
                    bankAccount: Session.get('bankaccount') || data.fields.GLAccountName || '',
                    paymentAmount: appliedAmt || 0,
                    notes: data.fields.Comments,
                    LineItems: lineItems,
                    checkpayment: Session.get('paymentmethod') || data.fields.PayMethod,
                    department: Session.get('department') || data.fields.DeptClassName,
                    applied: appliedAmt.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    })

                };
                templateObject.record.set(record);
                _setTmpAppliedAmount(record.applied);

                let getDepartmentVal = Session.get('department') || data.fields.DeptClassName || defaultDept;

                $('#edtCustomerName').val(data.fields.CustomerName);

                let getPaymentMethodVal = Session.get('paymentmethod') || data.fields.PayMethod || 'Cash';
                $('#sltPaymentMethod').val(getPaymentMethodVal);

                $('#sltDepartment').val(getDepartmentVal);
                let bankAccountData = Session.get('bankaccount') || 'Bank';
                $('#edtSelectBankAccountName').val(bankAccountData);
                if (clientList) {
                    for (var i = 0; i < clientList.length; i++) {
                        if (clientList[i].customername == data.fields.CustomerName) {
                            $('#edtCustomerEmail').val(clientList[i].customeremail);
                            $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                            let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + '\n' + clientList[i].street3 + '\n' + clientList[i].suburb + '\n' + clientList[i].statecode + '\n' + clientList[i].country;
                            $('#txabillingAddress').val(postalAddress);
                        }
                    }
                }
                $('.fullScreenSpin').css('display', 'none');
            });
        }

        $('#tblPaymentcard tbody').on('click', 'tr .colType, tr .colTransNo', function () {
            var listData = $(this).closest('tr').attr('id');
            if (listData) {
                window.open('/invoicecard?id=' + listData, '_self');
            }
        });
    } else if (url.indexOf('?selectcust=') > 0) {

        var getsale_id = url.split('?selectcust=');
        var currentSalesID = getsale_id[getsale_id.length - 1];
        if (getsale_id[1]) {
            let lineItems = [];
            let lineItemObj = {};
            let amountData = 0;
            var arr = currentSalesID.split(',');
            for (let i = 0; i < arr.length; i++) {

                currentSalesID = parseInt(arr[i]);

                paymentService.getOneInvoicePayment(currentSalesID).then(function (data) {

                    let total = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let appliedAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    var currentDate = new Date();
                    var begunDate = moment(currentDate).format("DD/MM/YYYY");
                    let amountDue = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    // Currency+''+data.fields.TotalBalance.toLocaleString(undefined, {minimumFractionDigits: 2});
                    let paymentAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    amountData = amountData + data.fields.TotalBalance;
                    let outstandingAmt = utilityService.modifynegativeCurrencyFormat(0).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let originalAmt = utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmountInc).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    // Currency+''+data.fields.TotalAmountInc.toLocaleString(undefined, {minimumFractionDigits: 2});
                    lineItemObj = {
                        id: data.fields.ID || '',
                        invoiceid: data.fields.ID || '',
                        transid: data.fields.ID || '',
                        invoicedate: data.fields.SaleDate != '' ? moment(data.fields.SaleDate).format("DD/MM/YYYY") : data.fields.SaleDate,
                        refno: data.fields.ReferenceNo || '',
                        transtype: "Invoice" || '',
                        amountdue: amountDue || 0,
                        paymentamount: paymentAmt || 0,
                        ouststandingamount: outstandingAmt,
                        orginalamount: originalAmt,
                        comments: data.fields.Comments || ''
                    };
                    lineItems.push(lineItemObj);
                    let record = {
                        lid: '',
                        customerName: data.fields.CustomerName || '',
                        paymentDate: begunDate,
                        reference: data.fields.ReferenceNo || ' ',
                        bankAccount: Session.get('bankaccount') || data.fields.GLAccountName || '',
                        paymentAmount: utilityService.modifynegativeCurrencyFormat(amountData) || 0,
                        notes: data.fields.Comments,
                        LineItems: lineItems,
                        checkpayment: Session.get('paymentmethod') || data.fields.PayMethod,
                        department: Session.get('department') || data.fields.DeptClassName,
                        applied: utilityService.modifynegativeCurrencyFormat(amountData) || 0

                    };
                    templateObject.record.set(record);
                    _setTmpAppliedAmount(record.applied);
                    let getDepartmentVal = Session.get('department') || data.fields.DeptClassName || defaultDept;

                    let getPaymentMethodVal = Session.get('paymentmethod') || data.fields.PayMethod || 'Cash';
                    $('#sltPaymentMethod').val(getPaymentMethodVal);

                    $('#edtCustomerName').val(data.fields.CustomerName);
                    $('#sltDepartment').val(getDepartmentVal);
                    let bankAccountData = Session.get('bankaccount') || 'Bank';
                    $('#edtSelectBankAccountName').val(bankAccountData);
                    if (clientList) {
                        for (var i = 0; i < clientList.length; i++) {
                            if (clientList[i].customername == data.fields.CustomerName) {
                                $('#edtCustomerEmail').val(clientList[i].customeremail);
                                $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                                let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + '\n' + clientList[i].street3 + '\n' + clientList[i].suburb + '\n' + clientList[i].statecode + '\n' + clientList[i].country;
                                $('#txabillingAddress').val(postalAddress);
                            }
                        }
                    }
                    $('.fullScreenSpin').css('display', 'none');
                });

            }

        }

        $('#tblPaymentcard tbody').on('click', 'tr .colType, tr .colTransNo', function () {
            var listData = $(this).closest('tr').attr('id');
            if (listData) {
                window.open('/invoicecard?id=' + listData, '_self');
            }
        });
    } else {
        $('.fullScreenSpin').css('display', 'none');
        let lineItems = [];
        let lineItemsTable = [];
        let lineItemObj = {};
        lineItemObj = {
            id: Random.id(),
            lineID: Random.id(),
            item: '',
            accountname: '',
            memo: '',
            description: '',
            quantity: '',
            unitPrice: 0,
            unitPriceInc: 0,
            taxRate: 0,
            taxCode: '',
            TotalAmt: 0,
            curTotalAmt: 0,
            TaxTotal: 0,
            TaxRate: 0,

        };

        var dataListTable = [
            ' ' || '',
            ' ' || '',
            0 || 0,
            0.00 || 0.00,
            ' ' || '',
            0.00 || 0.00,
            '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
        ];
        // lineItemsTable.push(dataListTable);
        // lineItems.push(lineItemObj);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        let paymentrecord = {
            id: '',
            lid: '',
            bankAccount: Session.get('bankaccount') || 'Bank',
            checkpayment: Session.get('paymentmethod') || '',
            department: Session.get('department') || '',
            accountname: '',
            memo: '',
            sosupplier: '',
            billto: '',
            shipto: '',
            shipping: '',
            docnumber: '',
            custPONumber: '',
            paymentDate: begunDate,
            duedate: '',
            employeename: '',
            status: '',
            invoicenumber: '',
            category: '',
            comments: '',
            pickmemo: '',
            ponumber: '',
            via: '',
            connote: '',
            reference: '',
            currency: '',
            branding: '',
            invoiceToDesc: '',
            shipToDesc: '',
            termsName: '',
            Total: Currency + '' + 0.00,
            LineItems: lineItems,
            isReconciled: false,
            TotalTax: Currency + '' + 0.00,
            SubTotal: Currency + '' + 0.00,
            applied: Currency + '' + 0.00,
            balanceDue: Currency + '' + 0.00,
            saleCustField1: '',
            saleCustField2: '',
            totalPaid: Currency + '' + 0.00,
            ispaid: false
        };

        $('#edtCustomerName').val('');
        $('#edtCustomerName').attr('readonly', false);
        $('#edtCustomerName').css('background-color', 'rgb(255, 255, 255)');

        $('#edtSelectBankAccountName').removeAttr('disabled');
        $('#edtSelectBankAccountName').attr('readonly', false);
        $('#edtSelectBankAccountName').attr('readonly', false);
        setTimeout(async function () {
            await templateObject.getLastPaymentData();
            if (localStorage.getItem('check_acc')) {
                $('#sltBankAccountName').val(localStorage.getItem('check_acc'));
            } else {
                // $('#sltBankAccountName').val('Bank');
            }

            // setTimeout(function () {
            //     $('#edtCustomerName').trigger("click");
            // }, 500);
        }, 500);

        $("#form :input").prop("disabled", false);
        templateObject.record.set(paymentrecord);
        _setTmpAppliedAmount(paymentrecord.applied);
        let getDepartmentVal = Session.get('department') || defaultDept;

        let getPaymentMethodVal = Session.get('paymentmethod') || '';
        $('#sltPaymentMethod').val(getPaymentMethodVal);
        $('#sltDepartment').val(getDepartmentVal);
        let bankAccountData = Session.get('bankaccount') || 'Bank';
        $('#edtSelectBankAccountName').val(bankAccountData);


    }

    exportSalesToPdf1 = function () {
        let margins = {
            top: 0,
            bottom: 0,
            left: 0,
            width: 100
        };
        let invoice_data_info = templateObject.record.get()
        let id = invoice_data_info.id || 'new';
        document.getElementById('html-2-pdfwrapper').style.display = "block";
        var source = document.getElementById('html-2-pdfwrapper');
        let file = "Customer Payment-" + id + ".pdf";
        if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
            file = 'Customer Payment-' + id + '.pdf';
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
            $('#html-2-pdfwrapper').css('display', 'none');
            $('.fullScreenSpin').css('display', 'none');

        });
        // pdf.addHTML(source, function () {
        //     pdf.save('Customer Payment-'+id+'.pdf');
        //     $('#html-2-pdfwrapper').css('display','none');
        // });
    };

    exportSalesToPdf = async function (template_title, number) {
            if (template_title == 'Customer Payments') {
                await showCustomerPayment1(template_title, number, true);

            }

            let margins = {
                top: 0,
                bottom: 0,
                left: 0,
                width: 100
            };

            let invoice_data_info = templateObject.record.get();
            // document.getElementById('html-2-pdfwrapper_new').style.display = "block";
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

            let file = "Customer_Payment.pdf";
            if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
                if (template_title == 'Customer Payments') {
                    file = 'Customer Payment-' + invoice_data_info.lid + '.pdf';
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


            html2pdf().set(opt).from(source).toPdf().output('datauristring').then(data => {

                let attachment = [];

                let paymentId = FlowRouter.current().queryParams.id ? FlowRouter.current().queryParams.id : '';
                let pdfObject = "";

                let base64data = data.split(',')[1];
                pdfObject = {
                    filename: 'Customer Payment-' + paymentId + '.pdf',
                    content: base64data,
                    encoding: 'base64'
                };
                attachment.push(pdfObject);

                let values = [];
                let basedOnTypeStorages = Object.keys(localStorage);
                basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
                    let employeeId = storage.split('_')[2];
                    // return storage.includes('BasedOnType_') && employeeId == Session.get('mySessionEmployeeLoggedID')
                    return storage.includes('BasedOnType_');
                });
                let j = basedOnTypeStorages.length;
                if (j > 0) {
                    while (j--) {
                        values.push(localStorage.getItem(basedOnTypeStorages[j]));
                    }
                }

                values.forEach(value => {
                    let reportData = JSON.parse(value);
                    let temp = {...reportData};

                    temp.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                    reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                    temp.attachments = attachment;
                    if (temp.BasedOnType.includes("P")) {
                        if (temp.FormID == 1) {
                            let formIds = temp.FormIDs.split(',');
                            if (formIds.includes("61")) {
                                temp.FormID = 61;
                                Meteor.call('sendNormalEmail', temp);
                            }
                        } else {
                            if (temp.FormID == 61)
                                Meteor.call('sendNormalEmail', temp);
                        }
                    }
                });

            });

            html2pdf().set(opt).from(source).save().then(function (dataObject) {
                if ($('.printID').attr('id') == undefined || $('.printID').attr('id') == "") {
                    //$(".btnSave").trigger("click");
                } else {
                }
                document.getElementById('html-2-pdfwrapper_new').style.display = "none";
                $('#html-2-pdfwrapper').css('display', 'none');
                $("#html-2-pdfwrapper_quotes").hide();
                $("#html-2-pdfwrapper_quotes2").hide();
                $("#html-2-pdfwrapper_quotes3").hide();
                $('.fullScreenSpin').css('display', 'none');
            });

            return true;
    };

    $(document).ready(function () {
        $('#edtSelectBankAccountName').editableSelect();
        $('#addRow').on('click', function () {
            let custname = $('#edtCustomerName').val() || '';
            if (custname === '') {
                swal('Customer has not been selected!', '', 'warning');
                e.preventDefault();
            } else {
                $(".chkBox").prop("checked", false);
                let paymentList = [''];
                $('.tblPaymentcard tbody tr').each(function () {
                    paymentList.push(this.id);

                });

                setTimeout(function () {
                    LoadingOverlay.show();
                    templateObject.getAllCustomerPaymentData(custname);
                }, 500);

                let geturl = location.href;
                let id = 0;
                if (geturl.indexOf('?invid') > 0 || geturl.indexOf('?selectcust')) {
                    geturl = new URL(geturl);
                    id = geturl.searchParams.get("invid") || geturl.searchParams.get("selectcust");
                }
                let $tblrows = $("#tblPaymentcard tbody tr");
                LoadingOverlay.show();
                let paymentData = templateObject.datatablerecords1.get();
                let paymentDataList = [];
                if (jQuery.isEmptyObject(FlowRouter.current().queryParams) == true) {
                    for (let x = 0; x < paymentData.length; x++) {
                        let found = paymentList.some(emp => emp == paymentData[x].id);
                        if (custname == paymentData[x].customername && found == false) {
                            paymentDataList.push(paymentData[x]);
                        }
                    }
                } else {
                    for (let x = 0; x < paymentData.length; x++) {
                        let found = paymentList.some(emp => emp == paymentData[x].id);
                        if (custname == paymentData[x].customername && id.includes(paymentData[x].id) == false && found == false) {
                            paymentDataList.push(paymentData[x]);
                        }
                    }
                }

                $('.dataTables_info').hide();
                templateObject.datatablerecords.set(paymentDataList);
                $('#customerPaymentListModal').modal();
            }
            $('.fullScreenSpin').css('display', 'none');
        })

    });


});

Template.paymentcard.helpers({
    isCurrencyEnable: () => FxGlobalFunctions.isCurrencyEnabled(),

    getTemplateList: function () {
        return template_list;
    },

    getTemplateNumber: function () {
        let template_numbers = ["1", "2", "3"];
        return template_numbers;
    },

    record: () => {
        let record = Template.instance().record.get();
        return record;
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
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.paymentdate == 'NA') {
                return 1;
            } else if (b.paymentdate == 'NA') {
                return -1;
            }
            return (a.paymentdate.toUpperCase() > b.paymentdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    paymentmethodrecords: () => {
        return Template.instance().paymentmethodrecords.get().sort(function (a, b) {
            if (a.paymentmethod == 'NA') {
                return 1;
            } else if (b.paymentmethod == 'NA') {
                return -1;
            }
            return (a.paymentmethod.toUpperCase() > b.paymentmethod.toUpperCase()) ? 1 : -1;
        });
    },
    accountnamerecords: () => {
        return Template.instance().accountnamerecords.get().sort(function (a, b) {
            if (a.accountname == 'NA') {
                return 1;
            } else if (b.accountname == 'NA') {
                return -1;
            }
            return (a.accountname.toUpperCase() > b.accountname.toUpperCase()) ? 1 : -1;
        });
    },
    vs1companyBankAccountNo: () => {
        return localStorage.getItem('vs1companyBankAccountNo') || '';
    },
    currentDate: () => {
        var today = moment().format('DD/MM/YYYY');
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");
        return begunDate;
    },
    salesCloudGridPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get('mycloudLogonID'),
            PrefName: 'tblPaymentcard'
        });
    },
    companyphone: () => {
        return "Phone: " + Session.get('vs1companyPhone');
    },
    companyabn: () => { //Update Company ABN
        let countryABNValue = Session.get("vs1companyABN");
        // if (LoggedCountry == "South Africa") {
        //     countryABNValue = "Vat No: " + Session.get("vs1companyABN");
        // }
        return countryABNValue;
    },
    companyReg: () => { //Add Company Reg
        let countryRegValue = '';
        if (LoggedCountry == "South Africa") {
            countryRegValue = "Reg No: " + Session.get('vs1companyReg');
        }

        return countryRegValue;
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

    organizationname: () => {
        return Session.get('vs1companyName');
    },
    organizationurl: () => {
        return Session.get('vs1companyURL');
    },


    getDefaultCurrency: () => {
        return defaultCurrencyCode;
    },
    isForeignEnabled: () => {
        return Template.instance().isForeignEnabled.get();
    },
    convertToForeignAmount: (amount) => {
        return convertToForeignAmount(amount, $('#exchange_rate').val(), getCurrentCurrencySymbol());
    },
});

Template.paymentcard.events({
    // 'click #sltDept': function(event) {
    //     $('#departmentModal').modal('toggle');
    // },
    'click .btnSave': (e, templateObject) => {
        playSaveAudio();
        let paymentService = new PaymentsService();
        setTimeout(function(){
        LoadingOverlay.show();

        /**
         * We need to save it
         */
        saveCurrencyHistory();
        let customer = $("#edtCustomerName").val();
        let paymentAmt = $("#edtPaymentAmount").val();

        var paymentDateTime = new Date($("#dtPaymentDate").datepicker("getDate"));
        let paymentDate = paymentDateTime.getFullYear() + "-" + (paymentDateTime.getMonth() + 1) + "-" + paymentDateTime.getDate();

        let bankAccount = $("#edtSelectBankAccountName").val();
        let reference = $("#edtReference").val();
        let payMethod = $("#sltPaymentMethod").val();
        let notes = $("#txaNotes").val();
        let customerEmail = $("#edtCustomerEmail").val();
        if (payMethod == '') {
            payMethod = "Cash";
        }
        let department = $("#sltDepartment").val();
        let empName = localStorage.getItem('mySession');
        let paymentData = [];
        if (department === "") {
          $(".fullScreenSpin").css("display", "none");
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
          LoadingOverlay.hide();
          event.preventDefault();
          return false;
        };

        /**
         * Currency module data
         * TODO: Adding this into the saved object
         */
        const currency = $('#sltCurrency').val();
        let foreignCurrency = $("#sltCurrency").val();
        let foreignAmount = $("#foreignAmount").val(); // this is the foreign amount by the currency, foreign Amount
        let variation = $("#edtVariation").val(); // this is the variation field
        let appliedAmount = $("#edtApplied").val(); // this is the variation field
        // if (isNaN(appliedAmount) || !appliedAmount) {
        //     appliedAmount = Number(appliedAmount.replace(/[^0-9.-]+/g, ""));
        // }
        let exchangeRate = $('#exchange_rate').val();
        // if (isNaN(exchangeRate) || !exchangeRate) {
        //     exchangeRate = Number(exchangeRate.replace(/[^0-9.-]+/g, ""));
        // }
        let foreignAppliedAmount = templateObject.isForeignEnabled.get() == true ? utilityService.removeCurrency(
            $("#finalAppliedAmount").text(), $('#sltCurrency').attr('currency-symbol')
            || getCurrentCurrencySymbol()) : null; // this is the foreign final amount

        let ForeignCurrencyAmount = $('#edtForeignAmount').val();
        // if (isNaN(ForeignCurrencyAmount) || !ForeignCurrencyAmount) {
        //     ForeignCurrencyAmount = Number(ForeignCurrencyAmount.replace(/[^0-9.-]+/g, ""));
        // }
        let ForeignExchangeCode = $('#sltCurrency').val();
        let ForeignExchangeRate = $('#exchange_rate').val()||0;
        let ForeignVariationAmount = $('#edtVariation').val();
        let Amount = $('#edtPaymentAmount').val();
        if (isNaN(Amount) || !Amount) {
            Amount = Number(Amount.replace(/[^0-9.-]+/g, ""));
        }
        if (isNaN(ForeignVariationAmount) || !ForeignVariationAmount) {
            //ForeignVariationAmount = Number(ForeignVariationAmount.replace(/[^0-9.-]+/g, ""));
        }
        let ForeignApplied = $('#edtApplied').val();
        if (isNaN(ForeignApplied) || !ForeignApplied) {
            //ForeignApplied = Number(ForeignApplied.replace(/[^0-9.-]+/g, ""));
        }

        var foreignCurrencyFields = {};
        if( FxGlobalFunctions.isCurrencyEnabled() ){
            foreignCurrencyFields = {
                ForeignExchangeCode: ForeignExchangeCode || defaultCurrencyCode,
                ForeignExchangeRate: parseFloat(ForeignExchangeRate),
            }
        }


        Session.setPersistent('paymentmethod', payMethod);
        Session.setPersistent('bankaccount', bankAccount);
        Session.setPersistent('department', department);
        var url = FlowRouter.current().path;
        if (url.indexOf('?soid=') > 0) {
            var getsale_id = url.split('?soid=');
            var currentSalesID = getsale_id[getsale_id.length - 1];
            if (getsale_id[1]) {
                currentSalesID = parseInt(currentSalesID);
                $('.tblPaymentcard > tbody > tr').each(function () {
                    var lineID = this.id;
                    let linetype = $('#' + lineID + " .colType").text() || $(this).closest('tr').find('.colType').text();
                    let lineAmountDue = $('#' + lineID + " .lineAmountdue").text() || $(this).closest('tr').find('.lineAmountdue').text();
                    let linePaymentAmt = $('#' + lineID + " .linePaymentamount").val() || $(this).closest('tr').find('.linePaymentamount').val();
                    let Line = {
                        type: 'TGuiCustPaymentLines',
                        fields: {
                            TransType: linetype,
                            // AmountDue: parseFloat(lineAmountDue.replace(/[^0-9.-]+/g,"")) || 0,
                            //EnteredBy:empName || ' ',
                            // InvoiceId:currentSalesID,
                            //RefNo:reference,
                            Paid: true,
                            Payment: parseFloat(linePaymentAmt.replace(/[^0-9.-]+/g, "")) || 0,
                            TransID: lineID
                        }
                    };
                    paymentData.push(Line);
                });

                let objDetails = {
                    type: "TCustPayments",
                    fields: {
                        // Amount:parseFloat(paymentAmt.replace(/[^0-9.-]+/g,"")) || 0,
                        // Applied:parseFloat(paymentAmt.replace(/[^0-9.-]+/g,"")) || 0,
                        AccountName: bankAccount,
                        ClientPrintName: customer,
                        CompanyName: customer,
                        EmployeeName: empName || ' ',
                        GUILines: paymentData,
                        Notes: notes,
                        PaymentDate: paymentDate,
                        PayMethodName: payMethod,
                        Payment: true,
                        ReferenceNo: reference,
                        Notes: notes,
                        exchangeRate: exchangeRate,
                        currency: currency,
                        ...foreignCurrencyFields
                        // ForeignCurrencyAmount: ForeignCurrencyAmount,
                        // ForeignExchangeCode: ForeignExchangeCode || defaultCurrencyCode,
                        // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                        // ForeignApplied: parseFloat(ForeignApplied)
                        //ForeignAppliedAmount: foreignAppliedAmount != null ? foreignAppliedAmount : foreignAmount, // foriegn applied amount
                    }
                };

                paymentService.saveDepositData(objDetails).then(function (data) {
                    var customerID = $('#edtCustomerEmail').attr('customerid');
                    // Send Email
                    $('#html-2-pdfwrapper').css('display', 'block');
                    $('.pdfCustomerName').html($('#edtCustomerName').val());
                    $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));

                    async function addAttachment() {
                        let attachment = [];
                        let templateObject = Template.instance();

                        let invoiceId = objDetails.fields.ID;
                        let encodedPdf = await generatePdfForMail(invoiceId);
                        let pdfObject = "";
                        var reader = new FileReader();
                        reader.readAsDataURL(encodedPdf);
                        reader.onloadend = function () {
                            var base64data = reader.result;
                            base64data = base64data.split(',')[1];

                            pdfObject = {
                                filename: 'Customer Payment ' + invoiceId + '.pdf',
                                content: base64data,
                                encoding: 'base64'
                            };
                            attachment.push(pdfObject);
                            // let mailBody = "VS1 Cloud Test";
                            let erpInvoiceId = objDetails.fields.ID;

                            let mailFromName = Session.get('vs1companyName');
                            let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                            let customerEmailName = $('#edtCustomerName').val();
                            let checkEmailData = $('#edtCustomerEmail').val();
                            // let mailCC = templateObject.mailCopyToUsr.get();
                            let grandtotal = $('#grandTotal').html();
                            let amountDueEmail = $('#totalBalanceDue').html();
                            let emailDueDate = $("#dtDueDate").val();
                            let mailSubject = 'Payment ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
                            let mailBody = "Hi " + customerEmailName + ",\n\n Here's Payment " + erpInvoiceId + " for  " + grandtotal + "." +
                                // "\n\nThe amount outstanding of "+amountDueEmail+" is due on "+emailDueDate+"." +
                                "\n\nIf you have any questions, please let us know : " + mailFrom + ".\n\nThanks,\n" + mailFromName;

                            var htmlmailBody = '<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">' +
                                '    <tr>' +
                                '        <td align="center" bgcolor="#54c7e2" style="padding: 40px 0 30px 0;">' +
                                '            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" alt="VS1 Cloud" width="250px" style="display: block;" />' +
                                '        </td>' +
                                '    </tr>' +
                                '    <tr>' +
                                '        <td style="padding: 40px 30px 40px 30px;">' +
                                '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                '                <tr>' +
                                '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 20px 0;">' +
                                '                        Hello there <span>' + customerEmailName + '</span>,' +
                                '                    </td>' +
                                '                </tr>' +
                                '                <tr>' +
                                '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
                                '                        Please find payment <span>' + erpInvoiceId + '</span> attached below.' +
                                '                    </td>' +
                                '                </tr>' +
                                '                <tr>' +
                                '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 30px 0;">' +
                                '                        Kind regards,' +
                                '                        <br>' +
                                '                        ' + mailFromName + '' +
                                '                    </td>' +
                                '                </tr>' +
                                '            </table>' +
                                '        </td>' +
                                '    </tr>' +
                                '    <tr>' +
                                '        <td bgcolor="#00a3d3" style="padding: 30px 30px 30px 30px;">' +
                                '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                '                <tr>' +
                                '                    <td width="50%" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">' +
                                '                        If you have any question, please do not hesitate to contact us.' +
                                '                    </td>' +
                                '                    <td align="right">' +
                                '                        <a style="border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; background-color: #4CAF50;" href="mailto:' + mailFrom + '">Contact Us</a>' +
                                '                    </td>' +
                                '                </tr>' +
                                '            </table>' +
                                '        </td>' +
                                '    </tr>' +
                                '</table>';

                            if (($('.chkEmailCopy').is(':checked')) && ($('.chkEmailRep').is(':checked'))) {
                                Meteor.call('sendEmail', {
                                    from: "" + mailFromName + " <" + mailFrom + ">",
                                    to: checkEmailData,
                                    subject: mailSubject,
                                    text: '',
                                    html: htmlmailBody,
                                    attachments: attachment
                                }, function (error, result) {
                                    if (error && error.error === "error") {
                                        //window.open('/salesorderslist','_self');

                                    } else {
                                    }
                                });

                                Meteor.call('sendEmail', {
                                    from: "" + mailFromName + " <" + mailFrom + ">",
                                    to: mailFrom,
                                    subject: mailSubject,
                                    text: '',
                                    html: htmlmailBody,
                                    attachments: attachment
                                }, function (error, result) {
                                    if (error && error.error === "error") {
                                        window.open('/salesorderslist?success=true', '_self');
                                    } else {
                                        $('#html-2-pdfwrapper').css('display', 'none');
                                        swal({
                                            title: 'SUCCESS',
                                            text: "Email Sent To Customer: " + checkEmailData + " and User: " + mailFrom + "",
                                            type: 'success',
                                            showCancelButton: false,
                                            confirmButtonText: 'OK'
                                        }).then((result) => {
                                            if (result.value) {
                                                // window.open('/salesorderslist','_self');
                                            } else if (result.dismiss === 'cancel') {
                                            }
                                        });

                                        $('.fullScreenSpin').css('display', 'none');
                                    }
                                });

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
                                values.forEach(value => {
                                    let reportData = JSON.parse(value);
                                    reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                    reportData.attachments = attachment;
                                    if (reportData.BasedOnType.includes("S")) {
                                        if (reportData.FormID == 1) {
                                            let formIds = reportData.FormIDs.split(',');
                                            if (formIds.includes("61")) {
                                                reportData.FormID = 61;
                                                Meteor.call('sendNormalEmail', reportData);
                                            }
                                        } else {
                                            if (reportData.FormID == 61)
                                                Meteor.call('sendNormalEmail', reportData);
                                        }
                                    }
                                });

                            } else if (($('.chkEmailCopy').is(':checked'))) {
                                Meteor.call('sendEmail', {
                                    from: "" + mailFromName + " <" + mailFrom + ">",
                                    to: checkEmailData,
                                    subject: mailSubject,
                                    text: '',
                                    html: htmlmailBody,
                                    attachments: attachment
                                }, function (error, result) {
                                    if (error && error.error === "error") {
                                        //window.open('/salesorderslist','_self');

                                    } else {
                                        $('#html-2-pdfwrapper').css('display', 'none');
                                        swal({
                                            title: 'SUCCESS',
                                            text: "Email Sent To Customer: " + checkEmailData + " ",
                                            type: 'success',
                                            showCancelButton: false,
                                            confirmButtonText: 'OK'
                                        }).then((result) => {
                                            if (result.value) {
                                                //window.open('/salesorderslist','_self');
                                            } else if (result.dismiss === 'cancel') {
                                            }
                                        });

                                        $('.fullScreenSpin').css('display', 'none');
                                    }
                                });

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
                                values.forEach(value => {
                                    let reportData = JSON.parse(value);
                                    reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                    reportData.attachments = attachment;
                                    if (reportData.BasedOnType.includes("S")) {
                                        if (reportData.FormID == 1) {
                                            let formIds = reportData.FormIDs.split(',');
                                            if (formIds.includes("61")) {
                                                reportData.FormID = 61;
                                                Meteor.call('sendNormalEmail', reportData);
                                            }
                                        } else {
                                            if (reportData.FormID == 61)
                                                Meteor.call('sendNormalEmail', reportData);
                                        }
                                    }
                                });

                            } else if (($('.chkEmailRep').is(':checked'))) {
                                Meteor.call('sendEmail', {
                                    from: "" + mailFromName + " <" + mailFrom + ">",
                                    to: mailFrom,
                                    subject: mailSubject,
                                    text: '',
                                    html: htmlmailBody,
                                    attachments: attachment
                                }, function (error, result) {
                                    if (error && error.error === "error") {
                                        //window.open('/salesorderslist','_self');
                                    } else {
                                        $('#html-2-pdfwrapper').css('display', 'none');
                                        swal({
                                            title: 'SUCCESS',
                                            text: "Email Sent To User: " + mailFrom + " ",
                                            type: 'success',
                                            showCancelButton: false,
                                            confirmButtonText: 'OK'
                                        }).then((result) => {
                                            if (result.value) {
                                                //window.open('/salesorderslist','_self');
                                            } else if (result.dismiss === 'cancel') {
                                            }
                                        });

                                        $('.fullScreenSpin').css('display', 'none');
                                    }
                                });

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
                                values.forEach(value => {
                                    let reportData = JSON.parse(value);
                                    reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                    reportData.attachments = attachment;
                                    if (reportData.BasedOnType.includes("S")) {
                                        if (reportData.FormID == 1) {
                                            let formIds = reportData.FormIDs.split(',');
                                            if (formIds.includes("61")) {
                                                reportData.FormID = 61;
                                                Meteor.call('sendNormalEmail', reportData);
                                            }
                                        } else {
                                            if (reportData.FormID == 61)
                                                Meteor.call('sendNormalEmail', reportData);
                                        }
                                    }
                                });

                            } else {
                                //window.open('/salesorderslist','_self');

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
                                values.forEach(value => {
                                    let reportData = JSON.parse(value);
                                    reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                    reportData.attachments = attachment;
                                    if (reportData.BasedOnType.includes("S")) {
                                        if (reportData.FormID == 1) {
                                            let formIds = reportData.FormIDs.split(',');
                                            if (formIds.includes("61")) {
                                                reportData.FormID = 61;
                                                Meteor.call('sendNormalEmail', reportData);
                                            }
                                        } else {
                                            if (reportData.FormID == 61)
                                                Meteor.call('sendNormalEmail', reportData);
                                        }
                                    }
                                });
                            }
                            ;
                        };

                    }

                    addAttachment();

                    function generatePdfForMail(invoiceId) {
                        return new Promise((resolve, reject) => {
                            let templateObject = Template.instance();
                            // let data = templateObject.singleInvoiceData.get();
                            let completeTabRecord;
                            let doc = new jsPDF('p', 'pt', 'a4');
                            doc.setFontSize(18);
                            var source = document.getElementById('html-2-pdfwrapper');
                            doc.addHTML(source, function () {
                                //pdf.save('Invoice.pdf');
                                resolve(doc.output('blob'));
                                // $('#html-2-pdfwrapper').css('display','none');
                            });
                        });
                    }

                    // End Send Email
                    if (customerID !== " ") {
                        let customerEmailData = {
                            type: "TCustomer",
                            fields: {
                                ID: customerID,
                                Email: customerEmail
                            }
                        }
                        // paymentService.saveCustomerEmail(customerEmailData).then(function (customerEmailData) {
                        //
                        // });
                    }
                    ;
                    $('.fullScreenSpin').css('display', 'none');
                    // window.open('/salesorderslist','_self');
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
                        } else if (result.dismiss === 'cancel') {
                        }
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });

            }
        } else if (url.indexOf('?invid=') > 0) {
            var getsale_id = url.split('?invid=');
            var currentSalesID = getsale_id[getsale_id.length - 1];
            if (getsale_id[1]) {
                currentSalesID = parseInt(currentSalesID);
                $('.tblPaymentcard > tbody > tr').each(function () {
                    var lineID = this.id;
                    let linetype = $('#' + lineID + " .colType").text() || $(this).closest('tr').find('.colType').text();
                    let lineAmountDue = $('#' + lineID + " .lineAmountdue").text() || $(this).closest('tr').find('.lineAmountdue').text();
                    let linePaymentAmt = $('#' + lineID + " .linePaymentamount").val() || $(this).closest('tr').find('.linePaymentamount').val();
                    let Line = {
                        type: 'TGuiCustPaymentLines',
                        fields: {
                            TransType: linetype,
                            TransID: lineID,
                            // AmountDue: parseFloat(lineAmountDue.replace(/[^0-9.-]+/g,"")) || 0,
                            //EnteredBy:empName || ' ',
                            // InvoiceId:currentSalesID,
                            //RefNo:reference,
                            Paid: true,
                            Payment: parseFloat(linePaymentAmt.replace(/[^0-9.-]+/g, "")) || 0,

                        }
                    };
                    paymentData.push(Line);
                });
                if (paymentAmt.replace(/[^0-9.-]+/g, "") < 0) {
                    let objDetails = {
                        type: "TCustPayments",
                        fields: {
                            Amount: parseFloat(paymentAmt.replace(/[^0-9.-]+/g, "")) || 0,
                            Applied: parseFloat(paymentAmt.replace(/[^0-9.-]+/g, "")) || 0,
                            AccountName: bankAccount,
                            ClientPrintName: customer,
                            CompanyName: customer,
                            DeptClassName: department,
                            // EmployeeName: empName || ' ',
                            GUILines: paymentData,
                            Notes: notes,
                            Payment: true,
                            PaymentDate: paymentDate,
                            PayMethodName: payMethod,

                            ReferenceNo: reference,
                            ...foreignCurrencyFields
                            // ForeignCurrencyAmount: ForeignCurrencyAmount,
                            // ForeignExchangeCode: ForeignExchangeCode || defaultCurrencyCode,
                            // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                            // ForeignApplied: parseFloat(ForeignApplied)
                            //ForeignAppliedAmount: foreignAppliedAmount != null ? foreignAppliedAmount : foreignAmount, // foriegn applied amount
                        }
                    };

                    paymentService.saveDepositData(objDetails).then(function (data) {
                        var customerID = $('#edtCustomerEmail').attr('customerid');
                        // Send Email
                        $('#html-2-pdfwrapper').css('display', 'block');
                        $('.pdfCustomerName').html($('#edtCustomerName').val());
                        $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));

                        async function addAttachment() {
                            let attachment = [];
                            let templateObject = Template.instance();

                            let invoiceId = objDetails.fields.ID;
                            let encodedPdf = await generatePdfForMail(invoiceId);
                            let pdfObject = "";
                            var reader = new FileReader();
                            reader.readAsDataURL(encodedPdf);
                            reader.onloadend = function () {
                                var base64data = reader.result;
                                base64data = base64data.split(',')[1];

                                pdfObject = {
                                    filename: 'Customer Payment-' + invoiceId + '.pdf',
                                    content: base64data,
                                    encoding: 'base64'
                                };
                                attachment.push(pdfObject);
                                // let mailBody = "VS1 Cloud Test";
                                let erpInvoiceId = objDetails.fields.ID;

                                let mailFromName = Session.get('vs1companyName');
                                let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                                let customerEmailName = $('#edtCustomerName').val();
                                let checkEmailData = $('#edtCustomerEmail').val();
                                // let mailCC = templateObject.mailCopyToUsr.get();
                                let grandtotal = $('#grandTotal').html();
                                let amountDueEmail = $('#totalBalanceDue').html();
                                let emailDueDate = $("#dtDueDate").val();
                                let mailSubject = 'Payment ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
                                let mailBody = "Hi " + customerEmailName + ",\n\n Here's payment " + erpInvoiceId + " for  " + grandtotal + "." +
                                    // "\n\nThe amount outstanding of "+amountDueEmail+" is due on "+emailDueDate+"." +
                                    "\n\nIf you have any questions, please let us know : " + mailFrom + ".\n\nThanks,\n" + mailFromName;

                                var htmlmailBody = '<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">' +
                                    '    <tr>' +
                                    '        <td align="center" bgcolor="#54c7e2" style="padding: 40px 0 30px 0;">' +
                                    '            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" alt="VS1 Cloud" width="250px" style="display: block;" />' +
                                    '        </td>' +
                                    '    </tr>' +
                                    '    <tr>' +
                                    '        <td style="padding: 40px 30px 40px 30px;">' +
                                    '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                    '                <tr>' +
                                    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 20px 0;">' +
                                    '                        Hello there <span>' + customerEmailName + '</span>,' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '                <tr>' +
                                    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
                                    '                        Please find payment <span>' + erpInvoiceId + '</span> attached below.' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '                <tr>' +
                                    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 30px 0;">' +
                                    '                        Kind regards,' +
                                    '                        <br>' +
                                    '                        ' + mailFromName + '' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '            </table>' +
                                    '        </td>' +
                                    '    </tr>' +
                                    '    <tr>' +
                                    '        <td bgcolor="#00a3d3" style="padding: 30px 30px 30px 30px;">' +
                                    '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                    '                <tr>' +
                                    '                    <td width="50%" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">' +
                                    '                        If you have any question, please do not hesitate to contact us.' +
                                    '                    </td>' +
                                    '                    <td align="right">' +
                                    '                        <a style="border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; background-color: #4CAF50;" href="mailto:' + mailFrom + '">Contact Us</a>' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '            </table>' +
                                    '        </td>' +
                                    '    </tr>' +
                                    '</table>';

                                if (($('.chkEmailCopy').is(':checked')) && ($('.chkEmailRep').is(':checked'))) {
                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: checkEmailData,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {

                                        } else {
                                        }
                                    });

                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: mailFrom,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {

                                        } else {
                                            $('#html-2-pdfwrapper').css('display', 'none');
                                            swal({
                                                title: 'SUCCESS',
                                                text: "Email Sent To Customer: " + checkEmailData + " and User: " + mailFrom + "",
                                                type: 'success',
                                                showCancelButton: false,
                                                confirmButtonText: 'OK'
                                            }).then((result) => {
                                                if (result.value) {

                                                    if (FlowRouter.current().queryParams.trans) {
                                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                                    } else {
                                                        FlowRouter.go('/invoicelist?success=true');
                                                    }
                                                    ;
                                                } else if (result.dismiss === 'cancel') {
                                                }
                                            });

                                            $('.fullScreenSpin').css('display', 'none');
                                        }
                                    });

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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });

                                } else if (($('.chkEmailCopy').is(':checked'))) {
                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: checkEmailData,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {
                                            FlowRouter.go('/invoicelist?success=true');

                                        } else {
                                            $('#html-2-pdfwrapper').css('display', 'none');
                                            swal({
                                                title: 'SUCCESS',
                                                text: "Email Sent To Customer: " + checkEmailData + " ",
                                                type: 'success',
                                                showCancelButton: false,
                                                confirmButtonText: 'OK'
                                            }).then((result) => {
                                                if (result.value) {
                                                    if (FlowRouter.current().queryParams.trans) {
                                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                                    } else {
                                                        FlowRouter.go('/invoicelist?success=true');
                                                    }
                                                    ;
                                                } else if (result.dismiss === 'cancel') {
                                                }
                                            });

                                            $('.fullScreenSpin').css('display', 'none');
                                        }
                                    });

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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });

                                } else if (($('.chkEmailRep').is(':checked'))) {
                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: mailFrom,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {
                                            FlowRouter.go('/invoicelist?success=true');
                                        } else {
                                            $('#html-2-pdfwrapper').css('display', 'none');
                                            swal({
                                                title: 'SUCCESS',
                                                text: "Email Sent To User: " + mailFrom + " ",
                                                type: 'success',
                                                showCancelButton: false,
                                                confirmButtonText: 'OK'
                                            }).then((result) => {
                                                if (result.value) {
                                                    if (FlowRouter.current().queryParams.trans) {
                                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                                    } else {
                                                        FlowRouter.go('/invoicelist?success=true');
                                                    }
                                                    ;
                                                } else if (result.dismiss === 'cancel') {
                                                }
                                            });

                                            $('.fullScreenSpin').css('display', 'none');
                                        }
                                    });

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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });

                                } else {

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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });
                                    if (FlowRouter.current().queryParams.trans) {
                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                    } else {
                                        FlowRouter.go('/invoicelist?success=true');
                                    }
                                    ;
                                }
                                ;
                            };

                        }

                        addAttachment();

                        function generatePdfForMail(invoiceId) {
                            return new Promise((resolve, reject) => {
                                let templateObject = Template.instance();
                                // let data = templateObject.singleInvoiceData.get();
                                let completeTabRecord;
                                let doc = new jsPDF('p', 'pt', 'a4');
                                doc.setFontSize(18);
                                var source = document.getElementById('html-2-pdfwrapper');
                                doc.addHTML(source, function () {
                                    //pdf.save('Invoice.pdf');
                                    resolve(doc.output('blob'));
                                    // $('#html-2-pdfwrapper').css('display','none');
                                });
                            });
                        }

                        // End Send Email
                        if (customerID !== " ") {
                            let customerEmailData = {
                                type: "TCustomer",
                                fields: {
                                    ID: customerID,
                                    Email: customerEmail
                                }
                            }
                            // paymentService.saveCustomerEmail(customerEmailData).then(function (customerEmailData) {
                            //
                            // });
                        }
                        ;
                        $('.fullScreenSpin').css('display', 'none');
                        //FlowRouter.go('/paymentoverview?success=true');


                    }).catch(function (err) {
                        // FlowRouter.go('/paymentoverview?success=true');
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                //Meteor._reload.reload();
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    });
                } else {
                    let objDetails = {
                        type: "TCustPayments",
                        fields: {
                            // Amount:parseFloat(paymentAmt.replace(/[^0-9.-]+/g,"")) || 0,
                            // Applied:parseFloat(paymentAmt.replace(/[^0-9.-]+/g,"")) || 0,
                            AccountName: bankAccount,
                            ClientPrintName: customer,
                            CompanyName: customer,
                            DeptClassName: department,
                            // EmployeeName: empName || ' ',
                            GUILines: paymentData,
                            Notes: notes,
                            Payment: true,
                            PaymentDate: paymentDate,
                            PayMethodName: payMethod,

                            ReferenceNo: reference,
                            ...foreignCurrencyFields
                            // ForeignCurrencyAmount: ForeignCurrencyAmount,
                            // ForeignExchangeCode: ForeignExchangeCode || defaultCurrencyCode,
                            // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                            // ForeignApplied: parseFloat(ForeignApplied)
                            //ForeignAppliedAmount: foreignAppliedAmount != null ? foreignAppliedAmount : foreignAmount, // foriegn applied amount

                        }
                    };

                    paymentService.saveDepositData(objDetails).then(function (data) {
                        var customerID = $('#edtCustomerEmail').attr('customerid');
                        // Send Email
                        $('#html-2-pdfwrapper').css('display', 'block');
                        $('.pdfCustomerName').html($('#edtCustomerName').val());
                        $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));

                        async function addAttachment() {
                            let attachment = [];
                            let templateObject = Template.instance();

                            let invoiceId = objDetails.fields.ID;
                            let encodedPdf = await generatePdfForMail(invoiceId);
                            let pdfObject = "";
                            var reader = new FileReader();
                            reader.readAsDataURL(encodedPdf);
                            reader.onloadend = function () {
                                var base64data = reader.result;
                                base64data = base64data.split(',')[1];

                                pdfObject = {
                                    filename: 'Customer Payment ' + invoiceId + '.pdf',
                                    content: base64data,
                                    encoding: 'base64'
                                };
                                attachment.push(pdfObject);
                                // let mailBody = "VS1 Cloud Test";
                                let erpInvoiceId = objDetails.fields.ID;

                                let mailFromName = Session.get('vs1companyName');
                                let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                                let customerEmailName = $('#edtCustomerName').val();
                                let checkEmailData = $('#edtCustomerEmail').val();
                                // let mailCC = templateObject.mailCopyToUsr.get();
                                let grandtotal = $('#grandTotal').html();
                                let amountDueEmail = $('#totalBalanceDue').html();
                                let emailDueDate = $("#dtDueDate").val();
                                let mailSubject = 'Payment ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
                                let mailBody = "Hi " + customerEmailName + ",\n\n Here's payment " + erpInvoiceId + " for  " + grandtotal + "." +
                                    // "\n\nThe amount outstanding of "+amountDueEmail+" is due on "+emailDueDate+"." +
                                    "\n\nIf you have any questions, please let us know : " + mailFrom + ".\n\nThanks,\n" + mailFromName;

                                var htmlmailBody = '<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">' +
                                    '    <tr>' +
                                    '        <td align="center" bgcolor="#54c7e2" style="padding: 40px 0 30px 0;">' +
                                    '            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" alt="VS1 Cloud" width="250px" style="display: block;" />' +
                                    '        </td>' +
                                    '    </tr>' +
                                    '    <tr>' +
                                    '        <td style="padding: 40px 30px 40px 30px;">' +
                                    '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                    '                <tr>' +
                                    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 20px 0;">' +
                                    '                        Hello there <span>' + customerEmailName + '</span>,' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '                <tr>' +
                                    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
                                    '                        Please find payment <span>' + erpInvoiceId + '</span> attached below.' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '                <tr>' +
                                    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 30px 0;">' +
                                    '                        Kind regards,' +
                                    '                        <br>' +
                                    '                        ' + mailFromName + '' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '            </table>' +
                                    '        </td>' +
                                    '    </tr>' +
                                    '    <tr>' +
                                    '        <td bgcolor="#00a3d3" style="padding: 30px 30px 30px 30px;">' +
                                    '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                    '                <tr>' +
                                    '                    <td width="50%" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">' +
                                    '                        If you have any question, please do not hesitate to contact us.' +
                                    '                    </td>' +
                                    '                    <td align="right">' +
                                    '                        <a style="border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; background-color: #4CAF50;" href="mailto:' + mailFrom + '">Contact Us</a>' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '            </table>' +
                                    '        </td>' +
                                    '    </tr>' +
                                    '</table>';

                                if (($('.chkEmailCopy').is(':checked')) && ($('.chkEmailRep').is(':checked'))) {
                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: checkEmailData,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {
                                            FlowRouter.go('/invoicelist?success=true');

                                        } else {
                                        }
                                    });

                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: mailFrom,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {
                                            if (FlowRouter.current().queryParams.trans) {
                                                FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                            } else {
                                                FlowRouter.go('/invoicelist?success=true');
                                            }
                                            ;
                                        } else {
                                            $('#html-2-pdfwrapper').css('display', 'none');
                                            swal({
                                                title: 'SUCCESS',
                                                text: "Email Sent To Customer: " + checkEmailData + " and User: " + mailFrom + "",
                                                type: 'success',
                                                showCancelButton: false,
                                                confirmButtonText: 'OK'
                                            }).then((result) => {
                                                if (result.value) {
                                                    if (FlowRouter.current().queryParams.trans) {
                                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                                    } else {
                                                        FlowRouter.go('/invoicelist?success=true');
                                                    }
                                                    ;
                                                } else if (result.dismiss === 'cancel') {
                                                }
                                            });

                                            $('.fullScreenSpin').css('display', 'none');
                                        }
                                    });

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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });

                                } else if (($('.chkEmailCopy').is(':checked'))) {
                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: checkEmailData,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {
                                            FlowRouter.go('/invoicelist?success=true');

                                        } else {
                                            $('#html-2-pdfwrapper').css('display', 'none');
                                            swal({
                                                title: 'SUCCESS',
                                                text: "Email Sent To Customer: " + checkEmailData + " ",
                                                type: 'success',
                                                showCancelButton: false,
                                                confirmButtonText: 'OK'
                                            }).then((result) => {
                                                if (result.value) {
                                                    if (FlowRouter.current().queryParams.trans) {
                                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                                    } else {
                                                        FlowRouter.go('/invoicelist?success=true');
                                                    }
                                                    ;
                                                } else if (result.dismiss === 'cancel') {
                                                }
                                            });

                                            $('.fullScreenSpin').css('display', 'none');
                                        }
                                    });

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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });

                                } else if (($('.chkEmailRep').is(':checked'))) {
                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: mailFrom,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {
                                            FlowRouter.go('/invoicelist?success=true');
                                        } else {
                                            $('#html-2-pdfwrapper').css('display', 'none');
                                            swal({
                                                title: 'SUCCESS',
                                                text: "Email Sent To User: " + mailFrom + " ",
                                                type: 'success',
                                                showCancelButton: false,
                                                confirmButtonText: 'OK'
                                            }).then((result) => {
                                                if (result.value) {
                                                    if (FlowRouter.current().queryParams.trans) {
                                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                                    } else {
                                                        FlowRouter.go('/invoicelist?success=true');
                                                    }
                                                    ;
                                                } else if (result.dismiss === 'cancel') {
                                                }
                                            });

                                            $('.fullScreenSpin').css('display', 'none');
                                        }
                                    });

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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });

                                } else {

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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });
                                    if (FlowRouter.current().queryParams.trans) {
                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                    } else {
                                        FlowRouter.go('/invoicelist?success=true');
                                    }
                                    ;
                                }
                                ;
                            };

                        }

                        addAttachment();

                        function generatePdfForMail(invoiceId) {
                            return new Promise((resolve, reject) => {
                                let templateObject = Template.instance();
                                // let data = templateObject.singleInvoiceData.get();
                                let completeTabRecord;
                                let doc = new jsPDF('p', 'pt', 'a4');
                                doc.setFontSize(18);
                                var source = document.getElementById('html-2-pdfwrapper');
                                doc.addHTML(source, function () {
                                    //pdf.save('Invoice.pdf');
                                    resolve(doc.output('blob'));
                                    // $('#html-2-pdfwrapper').css('display','none');
                                });
                            });
                        }

                        // End Send Email
                        if (customerID !== " ") {
                            let customerEmailData = {
                                type: "TCustomer",
                                fields: {
                                    ID: customerID,
                                    Email: customerEmail
                                }
                            }
                            // paymentService.saveCustomerEmail(customerEmailData).then(function (customerEmailData) {
                            //
                            // });
                        }
                        ;
                        $('.fullScreenSpin').css('display', 'none');
                        // FlowRouter.go('/paymentoverview?success=true');
                    }).catch(function (err) {
                        // FlowRouter.go('/paymentoverview?success=true');
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                //Meteor._reload.reload();
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    });
                }

            }
        } else if (url.indexOf('?quoteid=') > 0) {
            var getsale_id = url.split('?quoteid=');
            var currentSalesID = getsale_id[getsale_id.length - 1];
            if (getsale_id[1]) {
                currentSalesID = parseInt(currentSalesID);
                $('.tblPaymentcard > tbody > tr').each(function () {
                    var lineID = this.id;
                    let linetype = $('#' + lineID + " .colType").text() || $(this).closest('tr').find('.colType').text();
                    let lineAmountDue = $('#' + lineID + " .lineAmountdue").text() || $(this).closest('tr').find('.lineAmountdue').text();
                    let linePaymentAmt = $('#' + lineID + " .linePaymentamount").val() || $(this).closest('tr').find('.linePaymentamount').val();
                    let Line = {
                        type: 'TGuiCustPaymentLines',
                        fields: {
                            TransType: linetype,
                            // AmountDue: parseFloat(lineAmountDue.replace(/[^0-9.-]+/g,"")) || 0,
                            //EnteredBy:empName || ' ',
                            // InvoiceId:currentSalesID,
                            //RefNo:reference,
                            Paid: true,
                            Payment: parseFloat(linePaymentAmt.replace(/[^0-9.-]+/g, "")) || 0,
                            TransID: lineID
                        }
                    };
                    paymentData.push(Line);
                });

                let objDetails = {
                    type: "TCustPayments",
                    fields: {
                        // Amount:parseFloat(paymentAmt.replace(/[^0-9.-]+/g,"")) || 0,
                        // Applied:parseFloat(paymentAmt.replace(/[^0-9.-]+/g,"")) || 0,
                        AccountName: bankAccount,
                        ClientPrintName: customer,
                        CompanyName: customer,
                        EmployeeName: empName || ' ',
                        GUILines: paymentData,
                        Notes: notes,
                        PaymentDate: paymentDate,
                        PayMethodName: payMethod,
                        Payment: true,
                        ReferenceNo: reference,
                        Notes: notes,
                        ...foreignCurrencyFields
                        // ForeignCurrencyAmount: ForeignCurrencyAmount,
                        // ForeignExchangeCode: ForeignExchangeCode || defaultCurrencyCode,
                        // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                        // ForeignApplied: parseFloat(ForeignApplied)
                        //ForeignAppliedAmount: foreignAppliedAmount != null ? foreignAppliedAmount : foreignAmount, // foriegn applied amount
                    }
                };

                paymentService.saveDepositData(objDetails).then(function (data) {
                    var customerID = $('#edtCustomerEmail').attr('customerid');
                    // Send Email
                    $('#html-2-pdfwrapper').css('display', 'block');
                    $('.pdfCustomerName').html($('#edtCustomerName').val());
                    $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));

                    async function addAttachment() {
                        let attachment = [];
                        let templateObject = Template.instance();

                        let invoiceId = objDetails.fields.ID;
                        let encodedPdf = await generatePdfForMail(invoiceId);
                        let pdfObject = "";
                        var reader = new FileReader();
                        reader.readAsDataURL(encodedPdf);
                        reader.onloadend = function () {
                            var base64data = reader.result;
                            base64data = base64data.split(',')[1];

                            pdfObject = {
                                filename: 'customerpayment-' + invoiceId + '.pdf',
                                content: base64data,
                                encoding: 'base64'
                            };
                            attachment.push(pdfObject);
                            // let mailBody = "VS1 Cloud Test";
                            let erpInvoiceId = objDetails.fields.ID;

                            let mailFromName = Session.get('vs1companyName');
                            let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                            let customerEmailName = $('#edtCustomerName').val();
                            let checkEmailData = $('#edtCustomerEmail').val();
                            // let mailCC = templateObject.mailCopyToUsr.get();
                            let grandtotal = $('#grandTotal').html();
                            let amountDueEmail = $('#totalBalanceDue').html();
                            let emailDueDate = $("#dtDueDate").val();
                            let mailSubject = 'Payment ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
                            let mailBody = "Hi " + customerEmailName + ",\n\n Here's payment " + erpInvoiceId + " for  " + grandtotal + "." +
                                // "\n\nThe amount outstanding of "+amountDueEmail+" is due on "+emailDueDate+"." +
                                "\n\nIf you have any questions, please let us know : " + mailFrom + ".\n\nThanks,\n" + mailFromName;

                            var htmlmailBody = '<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">' +
                                '    <tr>' +
                                '        <td align="center" bgcolor="#54c7e2" style="padding: 40px 0 30px 0;">' +
                                '            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" alt="VS1 Cloud" width="250px" style="display: block;" />' +
                                '        </td>' +
                                '    </tr>' +
                                '    <tr>' +
                                '        <td style="padding: 40px 30px 40px 30px;">' +
                                '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                '                <tr>' +
                                '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 20px 0;">' +
                                '                        Hello there <span>' + customerEmailName + '</span>,' +
                                '                    </td>' +
                                '                </tr>' +
                                '                <tr>' +
                                '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
                                '                        Please find payment <span>' + erpInvoiceId + '</span> attached below.' +
                                '                    </td>' +
                                '                </tr>' +
                                '                <tr>' +
                                '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 30px 0;">' +
                                '                        Kind regards,' +
                                '                        <br>' +
                                '                        ' + mailFromName + '' +
                                '                    </td>' +
                                '                </tr>' +
                                '            </table>' +
                                '        </td>' +
                                '    </tr>' +
                                '    <tr>' +
                                '        <td bgcolor="#00a3d3" style="padding: 30px 30px 30px 30px;">' +
                                '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                '                <tr>' +
                                '                    <td width="50%" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">' +
                                '                        If you have any question, please do not hesitate to contact us.' +
                                '                    </td>' +
                                '                    <td align="right">' +
                                '                        <a style="border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; background-color: #4CAF50;" href="mailto:' + mailFrom + '">Contact Us</a>' +
                                '                    </td>' +
                                '                </tr>' +
                                '            </table>' +
                                '        </td>' +
                                '    </tr>' +
                                '</table>';

                            if (($('.chkEmailCopy').is(':checked')) && ($('.chkEmailRep').is(':checked'))) {
                                Meteor.call('sendEmail', {
                                    from: "" + mailFromName + " <" + mailFrom + ">",
                                    to: checkEmailData,
                                    subject: mailSubject,
                                    text: '',
                                    html: htmlmailBody,
                                    attachments: attachment
                                }, function (error, result) {
                                    if (error && error.error === "error") {
                                        window.open('/invoicelist?success=true', '_self');

                                    } else {
                                    }
                                });

                                Meteor.call('sendEmail', {
                                    from: "" + mailFromName + " <" + mailFrom + ">",
                                    to: mailFrom,
                                    subject: mailSubject,
                                    text: '',
                                    html: htmlmailBody,
                                    attachments: attachment
                                }, function (error, result) {
                                    if (error && error.error === "error") {
                                        window.open('/invoicelist?success=true', '_self');
                                    } else {
                                        $('#html-2-pdfwrapper').css('display', 'none');
                                        swal({
                                            title: 'SUCCESS',
                                            text: "Email Sent To Customer: " + checkEmailData + " and User: " + mailFrom + "",
                                            type: 'success',
                                            showCancelButton: false,
                                            confirmButtonText: 'OK'
                                        }).then((result) => {
                                            if (result.value) {
                                                window.open('/invoicelist?success=true', '_self');
                                            } else if (result.dismiss === 'cancel') {
                                            }
                                        });

                                        $('.fullScreenSpin').css('display', 'none');
                                    }
                                });

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
                                values.forEach(value => {
                                    let reportData = JSON.parse(value);
                                    reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                    reportData.attachments = attachment;
                                    if (reportData.BasedOnType.includes("S")) {
                                        if (reportData.FormID == 1) {
                                            let formIds = reportData.FormIDs.split(',');
                                            if (formIds.includes("61")) {
                                                reportData.FormID = 61;
                                                Meteor.call('sendNormalEmail', reportData);
                                            }
                                        } else {
                                            if (reportData.FormID == 61)
                                                Meteor.call('sendNormalEmail', reportData);
                                        }
                                    }
                                });

                            } else if (($('.chkEmailCopy').is(':checked'))) {
                                Meteor.call('sendEmail', {
                                    from: "" + mailFromName + " <" + mailFrom + ">",
                                    to: checkEmailData,
                                    subject: mailSubject,
                                    text: '',
                                    html: htmlmailBody,
                                    attachments: attachment
                                }, function (error, result) {
                                    if (error && error.error === "error") {
                                        window.open('/invoicelist?success=true', '_self');

                                    } else {
                                        $('#html-2-pdfwrapper').css('display', 'none');
                                        swal({
                                            title: 'SUCCESS',
                                            text: "Email Sent To Customer: " + checkEmailData + " ",
                                            type: 'success',
                                            showCancelButton: false,
                                            confirmButtonText: 'OK'
                                        }).then((result) => {
                                            if (result.value) {
                                                window.open('/invoicelist?success=true', '_self');
                                            } else if (result.dismiss === 'cancel') {
                                            }
                                        });

                                        $('.fullScreenSpin').css('display', 'none');
                                    }
                                });

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
                                values.forEach(value => {
                                    let reportData = JSON.parse(value);
                                    reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                    reportData.attachments = attachment;
                                    if (reportData.BasedOnType.includes("S")) {
                                        if (reportData.FormID == 1) {
                                            let formIds = reportData.FormIDs.split(',');
                                            if (formIds.includes("61")) {
                                                reportData.FormID = 61;
                                                Meteor.call('sendNormalEmail', reportData);
                                            }
                                        } else {
                                            if (reportData.FormID == 61)
                                                Meteor.call('sendNormalEmail', reportData);
                                        }
                                    }
                                });

                            } else if (($('.chkEmailRep').is(':checked'))) {
                                Meteor.call('sendEmail', {
                                    from: "" + mailFromName + " <" + mailFrom + ">",
                                    to: mailFrom,
                                    subject: mailSubject,
                                    text: '',
                                    html: htmlmailBody,
                                    attachments: attachment
                                }, function (error, result) {
                                    if (error && error.error === "error") {
                                        window.open('/invoicelist?success=true', '_self');
                                    } else {
                                        $('#html-2-pdfwrapper').css('display', 'none');
                                        swal({
                                            title: 'SUCCESS',
                                            text: "Email Sent To User: " + mailFrom + " ",
                                            type: 'success',
                                            showCancelButton: false,
                                            confirmButtonText: 'OK'
                                        }).then((result) => {
                                            if (result.value) {
                                                window.open('/invoicelist?success=true', '_self');
                                            } else if (result.dismiss === 'cancel') {
                                            }
                                        });

                                        $('.fullScreenSpin').css('display', 'none');
                                    }
                                });

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
                                values.forEach(value => {
                                    let reportData = JSON.parse(value);
                                    reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                    reportData.attachments = attachment;
                                    if (reportData.BasedOnType.includes("S")) {
                                        if (reportData.FormID == 1) {
                                            let formIds = reportData.FormIDs.split(',');
                                            if (formIds.includes("61")) {
                                                reportData.FormID = 61;
                                                Meteor.call('sendNormalEmail', reportData);
                                            }
                                        } else {
                                            if (reportData.FormID == 61)
                                                Meteor.call('sendNormalEmail', reportData);
                                        }
                                    }
                                });

                            } else {
                                window.open('/invoicelist?success=true', '_self');
                            }
                            ;
                        };

                    }

                    addAttachment();

                    function generatePdfForMail(invoiceId) {
                        return new Promise((resolve, reject) => {
                            let templateObject = Template.instance();
                            // let data = templateObject.singleInvoiceData.get();
                            let completeTabRecord;
                            let doc = new jsPDF('p', 'pt', 'a4');
                            doc.setFontSize(18);
                            var source = document.getElementById('html-2-pdfwrapper');
                            doc.addHTML(source, function () {
                                //pdf.save('Invoice.pdf');
                                resolve(doc.output('blob'));
                                // $('#html-2-pdfwrapper').css('display','none');
                            });
                        });
                    }

                    // End Send Email
                    if (customerID !== " ") {
                        let customerEmailData = {
                            type: "TCustomer",
                            fields: {
                                ID: customerID,
                                Email: customerEmail
                            }
                        }
                        // paymentService.saveCustomerEmail(customerEmailData).then(function (customerEmailData) {
                        //
                        // });
                    }
                    ;
                    $('.fullScreenSpin').css('display', 'none');
                    // window.open('/invoicelist','_self');
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
                        } else if (result.dismiss === 'cancel') {
                        }
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });

            }

        } else if ((url.indexOf('?custname=') > 0) && (url.indexOf('from=') > 0)) {
            let paymentID = templateObject.custpaymentid.get();
            $('.tblPaymentcard > tbody > tr').each(function () {
                var lineID = this.id;
                let linetype = $('#' + lineID + " .colType").text() || $(this).closest('tr').find('.colType').text();
                let lineAmountDue = $('#' + lineID + " .lineAmountdue").text() || $(this).closest('tr').find('.lineAmountdue').text();
                let linePaymentAmt = $('#' + lineID + " .linePaymentamount").val() || $(this).closest('tr').find('.linePaymentamount').val();
                let Line = {
                    type: 'TGuiCustPaymentLines',
                    fields: {
                        TransType: linetype,
                        TransID: lineID,
                        // AmountDue: parseFloat(lineAmountDue.replace(/[^0-9.-]+/g,"")) || 0,
                        //EnteredBy:empName || ' ',
                        // InvoiceId:currentSalesID,
                        //RefNo:reference,
                        Paid: true,
                        Payment: parseFloat(linePaymentAmt.replace(/[^0-9.-]+/g, "")) || 0,
                    }
                };
                paymentData.push(Line);
            });

            let objDetails = {
                type: "TCustPayments",
                fields: {
                    // Amount:parseFloat(paymentAmt.replace(/[^0-9.-]+/g,"")) || 0,
                    // Applied:parseFloat(paymentAmt.replace(/[^0-9.-]+/g,"")) || 0,
                    AccountName: bankAccount,
                    ClientPrintName: customer,
                    CompanyName: customer,
                    DeptClassName: department,
                    // EmployeeName: empName || ' ',
                    GUILines: paymentData,
                    Notes: notes,
                    Payment: true,
                    PaymentDate: paymentDate,
                    PayMethodName: payMethod,

                    ReferenceNo: reference,
                    ...foreignCurrencyFields
                    // ForeignCurrencyAmount: ForeignCurrencyAmount,
                    // ForeignExchangeCode: ForeignExchangeCode || defaultCurrencyCode,
                    // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                    // ForeignApplied: parseFloat(ForeignApplied)
                }
            };

            paymentService.saveDepositData(objDetails).then(function (data) {
                var customerID = $('#edtCustomerEmail').attr('customerid');
                // Send Email
                $('#html-2-pdfwrapper').css('display', 'block');
                $('.pdfCustomerName').html($('#edtCustomerName').val());
                $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));

                async function addAttachment() {
                    let attachment = [];
                    let templateObject = Template.instance();

                    let invoiceId = objDetails.fields.ID;
                    let encodedPdf = await generatePdfForMail(invoiceId);
                    let pdfObject = "";
                    var reader = new FileReader();
                    reader.readAsDataURL(encodedPdf);
                    reader.onloadend = function () {
                        var base64data = reader.result;
                        base64data = base64data.split(',')[1];

                        pdfObject = {
                            filename: 'customerpayment-' + invoiceId + '.pdf',
                            content: base64data,
                            encoding: 'base64'
                        };
                        attachment.push(pdfObject);
                        // let mailBody = "VS1 Cloud Test";
                        let erpInvoiceId = objDetails.fields.ID;

                        let mailFromName = Session.get('vs1companyName');
                        let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                        let customerEmailName = $('#edtCustomerName').val();
                        let checkEmailData = $('#edtCustomerEmail').val();
                        // let mailCC = templateObject.mailCopyToUsr.get();
                        let grandtotal = $('#grandTotal').html();
                        let amountDueEmail = $('#totalBalanceDue').html();
                        let emailDueDate = $("#dtDueDate").val();
                        let mailSubject = 'Payment ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
                        let mailBody = "Hi " + customerEmailName + ",\n\n Here's payment " + erpInvoiceId + " for  " + grandtotal + "." +
                            // "\n\nThe amount outstanding of "+amountDueEmail+" is due on "+emailDueDate+"." +
                            "\n\nIf you have any questions, please let us know : " + mailFrom + ".\n\nThanks,\n" + mailFromName;

                        var htmlmailBody = '<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">' +
                            '    <tr>' +
                            '        <td align="center" bgcolor="#54c7e2" style="padding: 40px 0 30px 0;">' +
                            '            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" alt="VS1 Cloud" width="250px" style="display: block;" />' +
                            '        </td>' +
                            '    </tr>' +
                            '    <tr>' +
                            '        <td style="padding: 40px 30px 40px 30px;">' +
                            '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                            '                <tr>' +
                            '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 20px 0;">' +
                            '                        Hello there <span>' + customerEmailName + '</span>,' +
                            '                    </td>' +
                            '                </tr>' +
                            '                <tr>' +
                            '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
                            '                        Please find payment <span>' + erpInvoiceId + '</span> attached below.' +
                            '                    </td>' +
                            '                </tr>' +
                            '                <tr>' +
                            '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 30px 0;">' +
                            '                        Kind regards,' +
                            '                        <br>' +
                            '                        ' + mailFromName + '' +
                            '                    </td>' +
                            '                </tr>' +
                            '            </table>' +
                            '        </td>' +
                            '    </tr>' +
                            '    <tr>' +
                            '        <td bgcolor="#00a3d3" style="padding: 30px 30px 30px 30px;">' +
                            '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                            '                <tr>' +
                            '                    <td width="50%" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">' +
                            '                        If you have any question, please do not hesitate to contact us.' +
                            '                    </td>' +
                            '                    <td align="right">' +
                            '                        <a style="border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; background-color: #4CAF50;" href="mailto:' + mailFrom + '">Contact Us</a>' +
                            '                    </td>' +
                            '                </tr>' +
                            '            </table>' +
                            '        </td>' +
                            '    </tr>' +
                            '</table>';

                        if (($('.chkEmailCopy').is(':checked')) && ($('.chkEmailRep').is(':checked'))) {
                            Meteor.call('sendEmail', {
                                from: "" + mailFromName + " <" + mailFrom + ">",
                                to: checkEmailData,
                                subject: mailSubject,
                                text: '',
                                html: htmlmailBody,
                                attachments: attachment
                            }, function (error, result) {
                                if (error && error.error === "error") {

                                    if (FlowRouter.current().queryParams.trans) {
                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                    } else {
                                        FlowRouter.go('/paymentoverview?success=true');
                                    }
                                    ;
                                } else {
                                }
                            });

                            Meteor.call('sendEmail', {
                                from: "" + mailFromName + " <" + mailFrom + ">",
                                to: mailFrom,
                                subject: mailSubject,
                                text: '',
                                html: htmlmailBody,
                                attachments: attachment
                            }, function (error, result) {
                                if (error && error.error === "error") {
                                    if (FlowRouter.current().queryParams.trans) {
                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                    } else {
                                        FlowRouter.go('/paymentoverview?success=true');
                                    }
                                    ;
                                } else {
                                    $('#html-2-pdfwrapper').css('display', 'none');
                                    swal({
                                        title: 'SUCCESS',
                                        text: "Email Sent To Customer: " + checkEmailData + " and User: " + mailFrom + "",
                                        type: 'success',
                                        showCancelButton: false,
                                        confirmButtonText: 'OK'
                                    }).then((result) => {
                                        if (result.value) {
                                            if (FlowRouter.current().queryParams.trans) {
                                                FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                            } else {
                                                FlowRouter.go('/paymentoverview?success=true');
                                            }
                                            ;
                                        } else if (result.dismiss === 'cancel') {
                                        }
                                    });

                                    $('.fullScreenSpin').css('display', 'none');
                                }
                            });

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
                            values.forEach(value => {
                                let reportData = JSON.parse(value);
                                reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                reportData.attachments = attachment;
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("61")) {
                                            reportData.FormID = 61;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 61)
                                            Meteor.call('sendNormalEmail', reportData);
                                    }
                                }
                            });

                        } else if (($('.chkEmailCopy').is(':checked'))) {
                            Meteor.call('sendEmail', {
                                from: "" + mailFromName + " <" + mailFrom + ">",
                                to: checkEmailData,
                                subject: mailSubject,
                                text: '',
                                html: htmlmailBody,
                                attachments: attachment
                            }, function (error, result) {
                                if (error && error.error === "error") {
                                    FlowRouter.go('/paymentoverview?success=true');

                                } else {
                                    $('#html-2-pdfwrapper').css('display', 'none');
                                    swal({
                                        title: 'SUCCESS',
                                        text: "Email Sent To Customer: " + checkEmailData + " ",
                                        type: 'success',
                                        showCancelButton: false,
                                        confirmButtonText: 'OK'
                                    }).then((result) => {
                                        if (result.value) {
                                            if (FlowRouter.current().queryParams.trans) {
                                                FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                            } else {
                                                FlowRouter.go('/paymentoverview?success=true');
                                            }
                                            ;
                                        } else if (result.dismiss === 'cancel') {
                                        }
                                    });

                                    $('.fullScreenSpin').css('display', 'none');
                                }
                            });

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
                            values.forEach(value => {
                                let reportData = JSON.parse(value);
                                reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                reportData.attachments = attachment;
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("61")) {
                                            reportData.FormID = 61;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 61)
                                            Meteor.call('sendNormalEmail', reportData);
                                    }
                                }
                            });

                        } else if (($('.chkEmailRep').is(':checked'))) {
                            Meteor.call('sendEmail', {
                                from: "" + mailFromName + " <" + mailFrom + ">",
                                to: mailFrom,
                                subject: mailSubject,
                                text: '',
                                html: htmlmailBody,
                                attachments: attachment
                            }, function (error, result) {
                                if (error && error.error === "error") {
                                    FlowRouter.go('/paymentoverview?success=true');
                                } else {
                                    $('#html-2-pdfwrapper').css('display', 'none');
                                    swal({
                                        title: 'SUCCESS',
                                        text: "Email Sent To User: " + mailFrom + " ",
                                        type: 'success',
                                        showCancelButton: false,
                                        confirmButtonText: 'OK'
                                    }).then((result) => {
                                        if (result.value) {
                                            if (FlowRouter.current().queryParams.trans) {
                                                FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                            } else {
                                                FlowRouter.go('/paymentoverview?success=true');
                                            }
                                            ;
                                        } else if (result.dismiss === 'cancel') {
                                        }
                                    });

                                    $('.fullScreenSpin').css('display', 'none');
                                }
                            });

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
                            values.forEach(value => {
                                let reportData = JSON.parse(value);
                                reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                reportData.attachments = attachment;
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("61")) {
                                            reportData.FormID = 61;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 61)
                                            Meteor.call('sendNormalEmail', reportData);
                                    }
                                }
                            });

                        } else {


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
                            values.forEach(value => {
                                let reportData = JSON.parse(value);
                                reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                reportData.attachments = attachment;
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("61")) {
                                            reportData.FormID = 61;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 61)
                                            Meteor.call('sendNormalEmail', reportData);
                                    }
                                }
                            });
                            if (FlowRouter.current().queryParams.trans) {
                                FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                            } else {
                                FlowRouter.go('/paymentoverview?success=true');
                            }
                            ;
                        }
                        ;
                    };

                }

                addAttachment();

                function generatePdfForMail(invoiceId) {
                    return new Promise((resolve, reject) => {
                        let templateObject = Template.instance();
                        // let data = templateObject.singleInvoiceData.get();
                        let completeTabRecord;
                        let doc = new jsPDF('p', 'pt', 'a4');
                        doc.setFontSize(18);
                        var source = document.getElementById('html-2-pdfwrapper');
                        doc.addHTML(source, function () {
                            //pdf.save('Invoice.pdf');
                            resolve(doc.output('blob'));
                            // $('#html-2-pdfwrapper').css('display','none');
                        });
                    });
                }

                // End Send Email
                if (customerID !== " ") {
                    let customerEmailData = {
                        type: "TCustomer",
                        fields: {
                            ID: customerID,
                            Email: customerEmail
                        }
                    }
                    // paymentService.saveCustomerEmail(customerEmailData).then(function (customerEmailData) {
                    //
                    // });
                }
                ;
                $('.fullScreenSpin').css('display', 'none');
                // FlowRouter.go('/paymentoverview?success=true');
            }).catch(function (err) {
                //FlowRouter.go('/paymentoverview?success=true');
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        //Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {
                    }
                });
                //Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
            });
        } else if ((url.indexOf('?id=') > 0)) {
            var getsale_id = url.split('?id=');
            var currentSalesID = getsale_id[getsale_id.length - 1];
            let paymentID = parseInt(currentSalesID);

            // Send Email
            $('#html-2-pdfwrapper').css('display', 'block');
            $('.pdfCustomerName').html($('#edtCustomerName').val());
            $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));

            async function addAttachment() {
                let attachment = [];
                let templateObject = Template.instance();

                let invoiceId = paymentID;
                let encodedPdf = await generatePdfForMail(invoiceId);
                let pdfObject = "";
                var reader = new FileReader();
                reader.readAsDataURL(encodedPdf);
                reader.onloadend = function () {
                    var base64data = reader.result;
                    base64data = base64data.split(',')[1];

                    pdfObject = {
                        filename: 'customerpayment-' + invoiceId + '.pdf',
                        content: base64data,
                        encoding: 'base64'
                    };
                    attachment.push(pdfObject);
                    // let mailBody = "VS1 Cloud Test";
                    let erpInvoiceId = paymentID;

                    let mailFromName = Session.get('vs1companyName');
                    let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                    let customerEmailName = $('#edtCustomerName').val();
                    let checkEmailData = $('#edtCustomerEmail').val();
                    // let mailCC = templateObject.mailCopyToUsr.get();
                    let grandtotal = $('#grandTotal').html();
                    let amountDueEmail = $('#totalBalanceDue').html();
                    let emailDueDate = $("#dtDueDate").val();
                    let mailSubject = 'Payment ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
                    let mailBody = "Hi " + customerEmailName + ",\n\n Here's invoice " + erpInvoiceId + " for  " + grandtotal + "." +
                        // "\n\nThe amount outstanding of "+amountDueEmail+" is due on "+emailDueDate+"." +
                        "\n\nIf you have any questions, please let us know : " + mailFrom + ".\n\nThanks,\n" + mailFromName;

                    var htmlmailBody = '<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">' +
                        '    <tr>' +
                        '        <td align="center" bgcolor="#54c7e2" style="padding: 40px 0 30px 0;">' +
                        '            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" alt="VS1 Cloud" width="250px" style="display: block;" />' +
                        '        </td>' +
                        '    </tr>' +
                        '    <tr>' +
                        '        <td style="padding: 40px 30px 40px 30px;">' +
                        '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                        '                <tr>' +
                        '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 20px 0;">' +
                        '                        Hello there <span>' + customerEmailName + '</span>,' +
                        '                    </td>' +
                        '                </tr>' +
                        '                <tr>' +
                        '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
                        '                        Please find payment <span>' + erpInvoiceId + '</span> attached below.' +
                        '                    </td>' +
                        '                </tr>' +
                        '                <tr>' +
                        '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 30px 0;">' +
                        '                        Kind regards,' +
                        '                        <br>' +
                        '                        ' + mailFromName + '' +
                        '                    </td>' +
                        '                </tr>' +
                        '            </table>' +
                        '        </td>' +
                        '    </tr>' +
                        '    <tr>' +
                        '        <td bgcolor="#00a3d3" style="padding: 30px 30px 30px 30px;">' +
                        '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                        '                <tr>' +
                        '                    <td width="50%" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">' +
                        '                        If you have any question, please do not hesitate to contact us.' +
                        '                    </td>' +
                        '                    <td align="right">' +
                        '                        <a style="border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; background-color: #4CAF50;" href="mailto:' + mailFrom + '">Contact Us</a>' +
                        '                    </td>' +
                        '                </tr>' +
                        '            </table>' +
                        '        </td>' +
                        '    </tr>' +
                        '</table>';

                    if (($('.chkEmailCopy').is(':checked')) && ($('.chkEmailRep').is(':checked'))) {
                        Meteor.call('sendEmail', {
                            from: "" + mailFromName + " <" + mailFrom + ">",
                            to: checkEmailData,
                            subject: mailSubject,
                            text: '',
                            html: htmlmailBody,
                            attachments: attachment
                        }, function (error, result) {
                            if (error && error.error === "error") {


                            } else {
                            }
                        });

                        Meteor.call('sendEmail', {
                            from: "" + mailFromName + " <" + mailFrom + ">",
                            to: mailFrom,
                            subject: mailSubject,
                            text: '',
                            html: htmlmailBody,
                            attachments: attachment
                        }, function (error, result) {
                            if (error && error.error === "error") {
                                FlowRouter.go('/paymentoverview?success=true');
                            } else {
                                $('#html-2-pdfwrapper').css('display', 'none');
                                swal({
                                    title: 'SUCCESS',
                                    text: "Email Sent To Customer: " + checkEmailData + " and User: " + mailFrom + "",
                                    type: 'success',
                                    showCancelButton: false,
                                    confirmButtonText: 'OK'
                                }).then((result) => {
                                    if (result.value) {
                                        if (FlowRouter.current().queryParams.trans) {
                                            FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                        } else {
                                            FlowRouter.go('/paymentoverview?success=true');
                                        }
                                        ;
                                    } else if (result.dismiss === 'cancel') {
                                    }
                                });

                                $('.fullScreenSpin').css('display', 'none');
                            }
                        });

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
                        values.forEach(value => {
                            let reportData = JSON.parse(value);
                            reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                            reportData.attachments = attachment;
                            if (reportData.BasedOnType.includes("S")) {
                                if (reportData.FormID == 1) {
                                    let formIds = reportData.FormIDs.split(',');
                                    if (formIds.includes("61")) {
                                        reportData.FormID = 61;
                                        Meteor.call('sendNormalEmail', reportData);
                                    }
                                } else {
                                    if (reportData.FormID == 61)
                                        Meteor.call('sendNormalEmail', reportData);
                                }
                            }
                        });

                    } else if (($('.chkEmailCopy').is(':checked'))) {
                        Meteor.call('sendEmail', {
                            from: "" + mailFromName + " <" + mailFrom + ">",
                            to: checkEmailData,
                            subject: mailSubject,
                            text: '',
                            html: htmlmailBody,
                            attachments: attachment
                        }, function (error, result) {
                            if (error && error.error === "error") {
                                FlowRouter.go('/paymentoverview?success=true');

                            } else {
                                $('#html-2-pdfwrapper').css('display', 'none');
                                swal({
                                    title: 'SUCCESS',
                                    text: "Email Sent To Customer: " + checkEmailData + " ",
                                    type: 'success',
                                    showCancelButton: false,
                                    confirmButtonText: 'OK'
                                }).then((result) => {
                                    if (result.value) {
                                        if (FlowRouter.current().queryParams.trans) {
                                            FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                        } else {
                                            FlowRouter.go('/paymentoverview?success=true');
                                        }
                                        ;
                                    } else if (result.dismiss === 'cancel') {
                                    }
                                });

                                $('.fullScreenSpin').css('display', 'none');
                            }
                        });

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
                        values.forEach(value => {
                            let reportData = JSON.parse(value);
                            reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                            reportData.attachments = attachment;
                            if (reportData.BasedOnType.includes("S")) {
                                if (reportData.FormID == 1) {
                                    let formIds = reportData.FormIDs.split(',');
                                    if (formIds.includes("61")) {
                                        reportData.FormID = 61;
                                        Meteor.call('sendNormalEmail', reportData);
                                    }
                                } else {
                                    if (reportData.FormID == 61)
                                        Meteor.call('sendNormalEmail', reportData);
                                }
                            }
                        });

                    } else if (($('.chkEmailRep').is(':checked'))) {
                        Meteor.call('sendEmail', {
                            from: "" + mailFromName + " <" + mailFrom + ">",
                            to: mailFrom,
                            subject: mailSubject,
                            text: '',
                            html: htmlmailBody,
                            attachments: attachment
                        }, function (error, result) {
                            if (error && error.error === "error") {
                                FlowRouter.go('/paymentoverview?success=true');
                            } else {
                                $('#html-2-pdfwrapper').css('display', 'none');
                                swal({
                                    title: 'SUCCESS',
                                    text: "Email Sent To User: " + mailFrom + " ",
                                    type: 'success',
                                    showCancelButton: false,
                                    confirmButtonText: 'OK'
                                }).then((result) => {
                                    if (result.value) {
                                        if (FlowRouter.current().queryParams.trans) {
                                            FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                        } else {
                                            FlowRouter.go('/paymentoverview?success=true');
                                        }
                                        ;
                                    } else if (result.dismiss === 'cancel') {
                                    }
                                });

                                $('.fullScreenSpin').css('display', 'none');
                            }
                        });

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
                        values.forEach(value => {
                            let reportData = JSON.parse(value);
                            reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                            reportData.attachments = attachment;
                            if (reportData.BasedOnType.includes("S")) {
                                if (reportData.FormID == 1) {
                                    let formIds = reportData.FormIDs.split(',');
                                    if (formIds.includes("61")) {
                                        reportData.FormID = 61;
                                        Meteor.call('sendNormalEmail', reportData);
                                    }
                                } else {
                                    if (reportData.FormID == 61)
                                        Meteor.call('sendNormalEmail', reportData);
                                }
                            }
                        });

                    } else {

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
                        values.forEach(value => {
                            let reportData = JSON.parse(value);
                            reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                            reportData.attachments = attachment;
                            if (reportData.BasedOnType.includes("S")) {
                                if (reportData.FormID == 1) {
                                    let formIds = reportData.FormIDs.split(',');
                                    if (formIds.includes("61")) {
                                        reportData.FormID = 61;
                                        Meteor.call('sendNormalEmail', reportData);
                                    }
                                } else {
                                    if (reportData.FormID == 61)
                                        Meteor.call('sendNormalEmail', reportData);
                                }
                            }
                        });
                        if (FlowRouter.current().queryParams.trans) {
                            FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                        } else {
                            FlowRouter.go('/paymentoverview?success=true');
                        }
                        ;
                    }
                    ;
                };

            }

            addAttachment();

            function generatePdfForMail(invoiceId) {
                return new Promise((resolve, reject) => {
                    let templateObject = Template.instance();
                    // let data = templateObject.singleInvoiceData.get();
                    let completeTabRecord;
                    let doc = new jsPDF('p', 'pt', 'a4');
                    doc.setFontSize(18);
                    var source = document.getElementById('html-2-pdfwrapper');
                    doc.addHTML(source, function () {
                        //pdf.save('Invoice.pdf');
                        resolve(doc.output('blob'));
                        // $('#html-2-pdfwrapper').css('display','none');
                    });
                });
            }

            // End Send Email
            // currentSalesID = parseInt(currentSalesID);
            $('.tblPaymentcard > tbody > tr').each(function () {
                var lineID = this.id;
                let linetype = $('#' + lineID + " .colType").text();
                let lineAmountDue = $('#' + lineID + " .lineAmountdue").text();
                let linePaymentAmt = $('#' + lineID + " .linePaymentamount").val();
                let Line = {
                    type: 'TGuiCustPaymentLines',
                    fields: {
                        TransType: linetype,
                        TransID: lineID,
                        // AmountDue: parseFloat(lineAmountDue.replace(/[^0-9.-]+/g,"")) || 0,
                        //EnteredBy:empName || ' ',
                        // InvoiceId:currentSalesID,
                        //RefNo:reference,
                        Paid: true,
                        Payment: parseFloat(linePaymentAmt.replace(/[^0-9.-]+/g, "")) || 0,
                    }
                };
                paymentData.push(Line);
            });

            let objDetails = {
                type: "TCustPayments",
                fields: {
                    ID: paymentID,
                    // AccountName:bankAccount,
                    // ClientPrintName:customer,
                    // CompanyName:customer,
                    // DeptClassName: department,
                    PaymentDate: paymentDate,
                    Notes: notes,
                    // Payment:true,
                    // PayMethodName: payMethod,
                    Amount: Amount,
                    ReferenceNo: reference,
                    ...foreignCurrencyFields
                    // ForeignCurrencyAmount: ForeignCurrencyAmount,
                    // ForeignExchangeCode: ForeignExchangeCode || defaultCurrencyCode,
                    // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                    // ForeignApplied: parseFloat(ForeignApplied)
                }
            };
            paymentService.saveDepositData(objDetails).then(function (data) {
                var customerID = $('#edtCustomerEmail').attr('customerid');

                if (customerID !== " ") {
                    let customerEmailData = {
                        type: "TCustomer",
                        fields: {
                            ID: customerID,
                            Email: customerEmail
                        }
                    }
                    // paymentService.saveCustomerEmail(customerEmailData).then(function (customerEmailData) {
                    //
                    // });
                }
                ;
                $('.fullScreenSpin').css('display', 'none');

            }).catch(function (err) {
                // FlowRouter.go('/paymentoverview?success=true');
                // swal({
                // title: 'Oooops...',
                // text: err,
                // type: 'error',
                // showCancelButton: false,
                // confirmButtonText: 'Try Again'
                // }).then((result) => {
                // if (result.value) {
                //  //Meteor._reload.reload();
                // } else if (result.dismiss === 'cancel') {
                //
                // }
                // });
                // $('.fullScreenSpin').css('display','none');
            });
        } else if (url.indexOf('?selectcust=') > 0) {
            var getsale_id = url.split('?selectcust=');
            let allData = [];
            let checkData = [];
            var currentSalesID = getsale_id[getsale_id.length - 1];
            checkData = Session.get('customerpayments') || [];
            if (checkData.length > 0) {
                let getPayments = JSON.parse(Session.get('customerpayments') || []);
                if (getPayments.length > 0) {
                    allData = getPayments;
                } else {
                    allData = [];
                }
            } else {
                allData = [];
            }
            if (getsale_id[1]) {
                // currentSalesID = parseInt(currentSalesID);
                $('.tblPaymentcard > tbody > tr').each(function () {
                    var lineID = this.id;
                    let linetype = $('#' + lineID + " .colType").text() || $(this).closest('tr').find('.colType').text();
                    let lineAmountDue = $('#' + lineID + " .lineAmountdue").text() || $(this).closest('tr').find('.lineAmountdue').text();
                    let linePaymentAmt = $('#' + lineID + " .linePaymentamount").val() || $(this).closest('tr').find('.linePaymentamount').val();
                    let Line = {
                        type: 'TGuiCustPaymentLines',
                        fields: {
                            TransType: linetype,
                            TransID: lineID,
                            // AmountDue: parseFloat(lineAmountDue.replace(/[^0-9.-]+/g,"")) || 0,
                            //EnteredBy:empName || ' ',
                            // InvoiceId:currentSalesID,
                            //RefNo:reference,
                            Paid: true,
                            Payment: parseFloat(linePaymentAmt.replace(/[^0-9.-]+/g, "")) || 0,

                        }
                    };
                    paymentData.push(Line);
                });
                if (paymentAmt.replace(/[^0-9.-]+/g, "") < 0) {
                    let objDetails = {
                        type: "TCustPayments",
                        fields: {
                            Amount: parseFloat(paymentAmt.replace(/[^0-9.-]+/g, "")) || 0,
                            Applied: parseFloat(paymentAmt.replace(/[^0-9.-]+/g, "")) || 0,
                            AccountName: bankAccount,
                            ClientPrintName: customer,
                            CompanyName: customer,
                            DeptClassName: department,
                            // EmployeeName: empName || ' ',
                            GUILines: paymentData,
                            Notes: notes,
                            Payment: true,
                            PaymentDate: paymentDate,
                            PayMethodName: payMethod,

                            ReferenceNo: reference,
                            ...foreignCurrencyFields
                            // ForeignCurrencyAmount: ForeignCurrencyAmount,
                            // ForeignExchangeCode: ForeignExchangeCode || defaultCurrencyCode,
                            // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                            // ForeignApplied: parseFloat(ForeignApplied)
                            //ForeignAppliedAmount: foreignAppliedAmount != null ? foreignAppliedAmount : foreignAmount, // foriegn applied amount

                        }
                    };

                    paymentService.saveDepositData(objDetails).then(function (data) {
                        var customerID = $('#edtCustomerEmail').attr('customerid');
                        if (allData.length > 0) {
                            newURL = '/paymentcard?selectcust=' + allData[0].selectCust;
                            allData.shift();
                            Session.setPersistent('customerpayments', JSON.stringify(allData));
                        } else {
                            newURL = '/paymentoverview?success=true';
                            Session.setPersistent('customerpayments', []);
                        }

                        // Send Email
                        $('#html-2-pdfwrapper').css('display', 'block');
                        $('.pdfCustomerName').html($('#edtCustomerName').val());
                        $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));

                        async function addAttachment() {
                            let attachment = [];
                            let templateObject = Template.instance();

                            let invoiceId = objDetails.fields.ID;
                            let encodedPdf = await generatePdfForMail(invoiceId);
                            let pdfObject = "";
                            var reader = new FileReader();
                            reader.readAsDataURL(encodedPdf);
                            reader.onloadend = function () {
                                var base64data = reader.result;
                                base64data = base64data.split(',')[1];

                                pdfObject = {
                                    filename: 'customerpayment-' + invoiceId + '.pdf',
                                    content: base64data,
                                    encoding: 'base64'
                                };
                                attachment.push(pdfObject);
                                // let mailBody = "VS1 Cloud Test";
                                let erpInvoiceId = objDetails.fields.ID;

                                let mailFromName = Session.get('vs1companyName');
                                let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                                let customerEmailName = $('#edtCustomerName').val();
                                let checkEmailData = $('#edtCustomerEmail').val();
                                // let mailCC = templateObject.mailCopyToUsr.get();
                                let grandtotal = $('#grandTotal').html();
                                let amountDueEmail = $('#totalBalanceDue').html();
                                let emailDueDate = $("#dtDueDate").val();
                                let mailSubject = 'Payment ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
                                let mailBody = "Hi " + customerEmailName + ",\n\n Here's payment " + erpInvoiceId + " for  " + grandtotal + "." +
                                    // "\n\nThe amount outstanding of "+amountDueEmail+" is due on "+emailDueDate+"." +
                                    "\n\nIf you have any questions, please let us know : " + mailFrom + ".\n\nThanks,\n" + mailFromName;

                                var htmlmailBody = '<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">' +
                                    '    <tr>' +
                                    '        <td align="center" bgcolor="#54c7e2" style="padding: 40px 0 30px 0;">' +
                                    '            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" alt="VS1 Cloud" width="250px" style="display: block;" />' +
                                    '        </td>' +
                                    '    </tr>' +
                                    '    <tr>' +
                                    '        <td style="padding: 40px 30px 40px 30px;">' +
                                    '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                    '                <tr>' +
                                    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 20px 0;">' +
                                    '                        Hello there <span>' + customerEmailName + '</span>,' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '                <tr>' +
                                    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
                                    '                        Please find payment <span>' + erpInvoiceId + '</span> attached below.' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '                <tr>' +
                                    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 30px 0;">' +
                                    '                        Kind regards,' +
                                    '                        <br>' +
                                    '                        ' + mailFromName + '' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '            </table>' +
                                    '        </td>' +
                                    '    </tr>' +
                                    '    <tr>' +
                                    '        <td bgcolor="#00a3d3" style="padding: 30px 30px 30px 30px;">' +
                                    '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                    '                <tr>' +
                                    '                    <td width="50%" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">' +
                                    '                        If you have any question, please do not hesitate to contact us.' +
                                    '                    </td>' +
                                    '                    <td align="right">' +
                                    '                        <a style="border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; background-color: #4CAF50;" href="mailto:' + mailFrom + '">Contact Us</a>' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '            </table>' +
                                    '        </td>' +
                                    '    </tr>' +
                                    '</table>';

                                if (($('.chkEmailCopy').is(':checked')) && ($('.chkEmailRep').is(':checked'))) {
                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: checkEmailData,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {
                                            window.open(url, '_self');

                                        } else {
                                            window.open(url, '_self');
                                        }
                                    });

                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: mailFrom,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {
                                            FlowRouter.go('/paymentoverview?success=true');
                                        } else {
                                            $('#html-2-pdfwrapper').css('display', 'none');
                                            swal({
                                                title: 'SUCCESS',
                                                text: "Email Sent To Customer: " + checkEmailData + " and User: " + mailFrom + "",
                                                type: 'success',
                                                showCancelButton: false,
                                                confirmButtonText: 'OK'
                                            }).then((result) => {
                                                if (result.value) {
                                                    window.open(url, '_self');
                                                } else if (result.dismiss === 'cancel') {
                                                    window.open(url, '_self');
                                                }
                                            });

                                            $('.fullScreenSpin').css('display', 'none');
                                        }
                                    });

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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });

                                } else if (($('.chkEmailCopy').is(':checked'))) {
                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: checkEmailData,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {
                                            FlowRouter.go('/paymentoverview?success=true');

                                        } else {
                                            $('#html-2-pdfwrapper').css('display', 'none');
                                            swal({
                                                title: 'SUCCESS',
                                                text: "Email Sent To Customer: " + checkEmailData + " ",
                                                type: 'success',
                                                showCancelButton: false,
                                                confirmButtonText: 'OK'
                                            }).then((result) => {
                                                if (result.value) {
                                                    window.open(url, '_self');
                                                } else if (result.dismiss === 'cancel') {
                                                    window.open(url, '_self');
                                                }
                                            });

                                            $('.fullScreenSpin').css('display', 'none');
                                        }
                                    });

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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });

                                } else if (($('.chkEmailRep').is(':checked'))) {
                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: mailFrom,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {
                                            window.open(url, '_self');
                                        } else {
                                            $('#html-2-pdfwrapper').css('display', 'none');
                                            swal({
                                                title: 'SUCCESS',
                                                text: "Email Sent To User: " + mailFrom + " ",
                                                type: 'success',
                                                showCancelButton: false,
                                                confirmButtonText: 'OK'
                                            }).then((result) => {
                                                if (result.value) {
                                                    window.open(url, '_self');
                                                } else if (result.dismiss === 'cancel') {
                                                    window.open(url, '_self');
                                                }
                                            });

                                            $('.fullScreenSpin').css('display', 'none');
                                        }
                                    });
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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });

                                } else {
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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });
                                    window.open(url, '_self');
                                }
                                ;
                            };

                        }

                        addAttachment();

                        function generatePdfForMail(invoiceId) {
                            return new Promise((resolve, reject) => {
                                let templateObject = Template.instance();
                                // let data = templateObject.singleInvoiceData.get();
                                let completeTabRecord;
                                let doc = new jsPDF('p', 'pt', 'a4');
                                doc.setFontSize(18);
                                var source = document.getElementById('html-2-pdfwrapper');
                                doc.addHTML(source, function () {
                                    //pdf.save('Invoice.pdf');
                                    resolve(doc.output('blob'));
                                    // $('#html-2-pdfwrapper').css('display','none');
                                });
                            });
                        }

                        // End Send Email
                        if (customerID !== " ") {
                            let customerEmailData = {
                                type: "TCustomer",
                                fields: {
                                    ID: customerID,
                                    Email: customerEmail
                                }
                            }
                            // paymentService.saveCustomerEmail(customerEmailData).then(function (customerEmailData) {
                            //
                            // });
                        }
                        ;
                        $('.fullScreenSpin').css('display', 'none');
                        // FlowRouter.go('/paymentoverview?success=true');
                    }).catch(function (err) {
                        // FlowRouter.go('/paymentoverview?success=true');
                        if (allData.length > 0) {
                            newURL = '/paymentcard?selectcust=' + allData[0].selectCust;
                            allData.shift();
                            Session.setPersistent('customerpayments', JSON.stringify(allData));
                        } else {
                            newURL = '/paymentoverview?success=true';
                            Session.setPersistent('customerpayments', []);
                        }
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                if (FlowRouter.current().queryParams.trans) {
                                    FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                } else {
                                    window.open(newURL, '_self');
                                }
                                ;
                            } else if (result.dismiss === 'cancel') {
                                window.open(newURL, '_self');
                            }
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    });
                } else {
                    let objDetails = {
                        type: "TCustPayments",
                        fields: {
                            // Amount:parseFloat(paymentAmt.replace(/[^0-9.-]+/g,"")) || 0,
                            // Applied:parseFloat(paymentAmt.replace(/[^0-9.-]+/g,"")) || 0,
                            AccountName: bankAccount,
                            ClientPrintName: customer,
                            CompanyName: customer,
                            DeptClassName: department,
                            // EmployeeName: empName || ' ',
                            GUILines: paymentData,
                            Notes: notes,
                            Payment: true,
                            PaymentDate: paymentDate,
                            PayMethodName: payMethod,

                            ReferenceNo: reference,
                            ...foreignCurrencyFields
                            // ForeignCurrencyAmount: ForeignCurrencyAmount,
                            // ForeignExchangeCode: ForeignExchangeCode || defaultCurrencyCode,
                            // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                            // ForeignApplied: parseFloat(ForeignApplied)
                            //ForeignAppliedAmount: foreignAppliedAmount != null ? foreignAppliedAmount : foreignAmount, // foriegn applied amount

                        }
                    };

                    paymentService.saveDepositData(objDetails).then(function (data) {
                        if (allData.length > 0) {
                            newURL = '/paymentcard?selectcust=' + allData[0].selectCust;
                            allData.shift();
                            Session.setPersistent('customerpayments', JSON.stringify(allData));
                        } else {
                            newURL = '/paymentoverview?success=true';
                            Session.setPersistent('customerpayments', []);
                        }
                        var customerID = $('#edtCustomerEmail').attr('customerid');
                        // Send Email
                        $('#html-2-pdfwrapper').css('display', 'block');
                        $('.pdfCustomerName').html($('#edtCustomerName').val());
                        $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));

                        async function addAttachment() {
                            let attachment = [];
                            let templateObject = Template.instance();

                            let invoiceId = objDetails.fields.ID;
                            let encodedPdf = await generatePdfForMail(invoiceId);
                            let pdfObject = "";
                            var reader = new FileReader();
                            reader.readAsDataURL(encodedPdf);
                            reader.onloadend = function () {
                                var base64data = reader.result;
                                base64data = base64data.split(',')[1];

                                pdfObject = {
                                    filename: 'customerpayment-' + invoiceId + '.pdf',
                                    content: base64data,
                                    encoding: 'base64'
                                };
                                attachment.push(pdfObject);
                                // let mailBody = "VS1 Cloud Test";
                                let erpInvoiceId = objDetails.fields.ID;

                                let mailFromName = Session.get('vs1companyName');
                                let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                                let customerEmailName = $('#edtCustomerName').val();
                                let checkEmailData = $('#edtCustomerEmail').val();
                                // let mailCC = templateObject.mailCopyToUsr.get();
                                let grandtotal = $('#grandTotal').html();
                                let amountDueEmail = $('#totalBalanceDue').html();
                                let emailDueDate = $("#dtDueDate").val();
                                let mailSubject = 'Payment ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
                                let mailBody = "Hi " + customerEmailName + ",\n\n Here's payment " + erpInvoiceId + " for  " + grandtotal + "." +
                                    // "\n\nThe amount outstanding of "+amountDueEmail+" is due on "+emailDueDate+"." +
                                    "\n\nIf you have any questions, please let us know : " + mailFrom + ".\n\nThanks,\n" + mailFromName;

                                var htmlmailBody = '<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">' +
                                    '    <tr>' +
                                    '        <td align="center" bgcolor="#54c7e2" style="padding: 40px 0 30px 0;">' +
                                    '            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" alt="VS1 Cloud" width="250px" style="display: block;" />' +
                                    '        </td>' +
                                    '    </tr>' +
                                    '    <tr>' +
                                    '        <td style="padding: 40px 30px 40px 30px;">' +
                                    '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                    '                <tr>' +
                                    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 20px 0;">' +
                                    '                        Hello there <span>' + customerEmailName + '</span>,' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '                <tr>' +
                                    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
                                    '                        Please find payment <span>' + erpInvoiceId + '</span> attached below.' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '                <tr>' +
                                    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 30px 0;">' +
                                    '                        Kind regards,' +
                                    '                        <br>' +
                                    '                        ' + mailFromName + '' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '            </table>' +
                                    '        </td>' +
                                    '    </tr>' +
                                    '    <tr>' +
                                    '        <td bgcolor="#00a3d3" style="padding: 30px 30px 30px 30px;">' +
                                    '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                    '                <tr>' +
                                    '                    <td width="50%" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">' +
                                    '                        If you have any question, please do not hesitate to contact us.' +
                                    '                    </td>' +
                                    '                    <td align="right">' +
                                    '                        <a style="border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; background-color: #4CAF50;" href="mailto:' + mailFrom + '">Contact Us</a>' +
                                    '                    </td>' +
                                    '                </tr>' +
                                    '            </table>' +
                                    '        </td>' +
                                    '    </tr>' +
                                    '</table>';

                                if (($('.chkEmailCopy').is(':checked')) && ($('.chkEmailRep').is(':checked'))) {
                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: checkEmailData,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {


                                        } else {

                                        }
                                    });

                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: mailFrom,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {
                                            window.open(newURL, '_self');
                                        } else {
                                            $('#html-2-pdfwrapper').css('display', 'none');
                                            swal({
                                                title: 'SUCCESS',
                                                text: "Email Sent To Customer: " + checkEmailData + " and User: " + mailFrom + "",
                                                type: 'success',
                                                showCancelButton: false,
                                                confirmButtonText: 'OK'
                                            }).then((result) => {
                                                if (result.value) {
                                                    if (FlowRouter.current().queryParams.trans) {
                                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                                    } else {
                                                        window.open(newURL, '_self');
                                                    }
                                                    ;
                                                } else if (result.dismiss === 'cancel') {
                                                    if (FlowRouter.current().queryParams.trans) {
                                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                                    } else {
                                                        window.open(newURL, '_self');
                                                    }
                                                    ;
                                                }
                                            });

                                            $('.fullScreenSpin').css('display', 'none');
                                        }
                                    });

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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });

                                } else if (($('.chkEmailCopy').is(':checked'))) {
                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: checkEmailData,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {
                                            window.open(url, '_self');

                                        } else {
                                            $('#html-2-pdfwrapper').css('display', 'none');
                                            swal({
                                                title: 'SUCCESS',
                                                text: "Email Sent To Customer: " + checkEmailData + " ",
                                                type: 'success',
                                                showCancelButton: false,
                                                confirmButtonText: 'OK'
                                            }).then((result) => {
                                                if (result.value) {
                                                    if (FlowRouter.current().queryParams.trans) {
                                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                                    } else {
                                                        window.open(newURL, '_self');
                                                    }
                                                    ;
                                                } else if (result.dismiss === 'cancel') {
                                                    if (FlowRouter.current().queryParams.trans) {
                                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                                    } else {
                                                        window.open(newURL, '_self');
                                                    }
                                                    ;
                                                }
                                            });

                                            $('.fullScreenSpin').css('display', 'none');
                                        }
                                    });

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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });

                                } else if (($('.chkEmailRep').is(':checked'))) {
                                    Meteor.call('sendEmail', {
                                        from: "" + mailFromName + " <" + mailFrom + ">",
                                        to: mailFrom,
                                        subject: mailSubject,
                                        text: '',
                                        html: htmlmailBody,
                                        attachments: attachment
                                    }, function (error, result) {
                                        if (error && error.error === "error") {
                                            FlowRouter.go('/paymentoverview?success=true');
                                        } else {
                                            $('#html-2-pdfwrapper').css('display', 'none');
                                            swal({
                                                title: 'SUCCESS',
                                                text: "Email Sent To User: " + mailFrom + " ",
                                                type: 'success',
                                                showCancelButton: false,
                                                confirmButtonText: 'OK'
                                            }).then((result) => {
                                                if (result.value) {
                                                    if (FlowRouter.current().queryParams.trans) {
                                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                                    } else {
                                                        window.open(newURL, '_self');
                                                    }
                                                    ;
                                                } else if (result.dismiss === 'cancel') {
                                                    if (FlowRouter.current().queryParams.trans) {
                                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                                    } else {
                                                        window.open(newURL, '_self');
                                                    }
                                                    ;
                                                }
                                            });

                                            $('.fullScreenSpin').css('display', 'none');
                                        }
                                    });

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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });

                                } else {

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
                                    values.forEach(value => {
                                        let reportData = JSON.parse(value);
                                        reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                        reportData.attachments = attachment;
                                        if (reportData.BasedOnType.includes("S")) {
                                            if (reportData.FormID == 1) {
                                                let formIds = reportData.FormIDs.split(',');
                                                if (formIds.includes("61")) {
                                                    reportData.FormID = 61;
                                                    Meteor.call('sendNormalEmail', reportData);
                                                }
                                            } else {
                                                if (reportData.FormID == 61)
                                                    Meteor.call('sendNormalEmail', reportData);
                                            }
                                        }
                                    });
                                    if (FlowRouter.current().queryParams.trans) {
                                        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                    } else {
                                        window.open(newURL, '_self');
                                    }
                                    ;
                                }
                                ;
                            };

                        }

                        addAttachment();

                        function generatePdfForMail(invoiceId) {
                            return new Promise((resolve, reject) => {
                                let templateObject = Template.instance();
                                // let data = templateObject.singleInvoiceData.get();
                                let completeTabRecord;
                                let doc = new jsPDF('p', 'pt', 'a4');
                                doc.setFontSize(18);
                                var source = document.getElementById('html-2-pdfwrapper');
                                doc.addHTML(source, function () {
                                    //pdf.save('Invoice.pdf');
                                    resolve(doc.output('blob'));
                                    // $('#html-2-pdfwrapper').css('display','none');
                                });
                            });
                        }

                        // End Send Email
                        if (customerID !== " ") {
                            let customerEmailData = {
                                type: "TCustomer",
                                fields: {
                                    ID: customerID,
                                    Email: customerEmail
                                }
                            }
                            // paymentService.saveCustomerEmail(customerEmailData).then(function (customerEmailData) {
                            //
                            // });
                        }
                        ;
                        $('.fullScreenSpin').css('display', 'none');
                        // FlowRouter.go('/paymentoverview?success=true');
                    }).catch(function (err) {
                        // FlowRouter.go('/paymentoverview?success=true');
                        if (allData.length > 0) {
                            newURL = '/paymentcard?selectcust=' + allData[0].selectCust;
                            allData.shift();
                            Session.setPersistent('customerpayments', JSON.stringify(allData));
                        } else {
                            newURL = '/paymentoverview?success=true';
                            Session.setPersistent('customerpayments', []);
                        }
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                if (FlowRouter.current().queryParams.trans) {
                                    FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                                } else {
                                    window.open(newURL, '_self');
                                }
                                ;
                            } else if (result.dismiss === 'cancel') {
                                window.open(newURL, '_self');
                            }
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    });
                }

            }
        } else {

            $('.tblPaymentcard > tbody > tr').each(function () {
                if ($(this).closest('tr').find('.colType').text() != '') {
                    var lineID = this.id;
                    let linetype = $('#' + lineID + " .colType").text() || $(this).closest('tr').find('.colType').text() || '';
                    let lineAmountDue = $('#' + lineID + " .lineAmountdue").text() || $(this).closest('tr').find('.lineAmountdue').text();
                    let linePaymentAmt = $('#' + lineID + " .linePaymentamount").val() || $(this).closest('tr').find('.linePaymentamount').val();
                    let Line = {
                        type: 'TGuiCustPaymentLines',
                        fields: {
                            TransType: linetype,
                            TransID: lineID,
                            Paid: true,
                            Payment: parseFloat(linePaymentAmt.replace(/[^0-9.-]+/g, "")) || 0,
                        }
                    };
                    paymentData.push(Line);
                }
            });

            let objDetails = {
                type: "TCustPayments",
                fields: {
                    AccountName: bankAccount,
                    ClientPrintName: customer,
                    CompanyName: customer,
                    DeptClassName: department,
                    // EmployeeName: empName || ' ',
                    GUILines: paymentData,
                    Notes: notes,
                    Payment: true,
                    PaymentDate: paymentDate,
                    PayMethodName: payMethod,
                    ReferenceNo: reference,
                    ...foreignCurrencyFields
                    // ForeignCurrencyAmount: ForeignCurrencyAmount,
                    // ForeignExchangeCode: ForeignExchangeCode || defaultCurrencyCode,
                    // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                    // ForeignApplied: parseFloat(ForeignApplied)
                    //ForeignAppliedAmount: foreignAppliedAmount != null ? foreignAppliedAmount : foreignAmount, // foriegn applied amount
                }
            };

            paymentService.saveDepositData(objDetails).then(function (data) {
                var customerID = $('#edtCustomerEmail').attr('customerid');
                // Send Email
                $('#html-2-pdfwrapper').css('display', 'block');
                $('.pdfCustomerName').html($('#edtCustomerName').val());
                $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));

                async function addAttachment() {
                    let attachment = [];
                    let templateObject = Template.instance();

                    let invoiceId = objDetails.fields.ID;
                    let encodedPdf = await generatePdfForMail(invoiceId);
                    let pdfObject = "";
                    var reader = new FileReader();
                    reader.readAsDataURL(encodedPdf);
                    reader.onloadend = function () {
                        var base64data = reader.result;
                        base64data = base64data.split(',')[1];

                        pdfObject = {
                            filename: 'Customer Payment ' + invoiceId + '.pdf',
                            content: base64data,
                            encoding: 'base64'
                        };
                        attachment.push(pdfObject);
                        // let mailBody = "VS1 Cloud Test";
                        let erpInvoiceId = objDetails.fields.ID;

                        let mailFromName = Session.get('vs1companyName');
                        let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                        let customerEmailName = $('#edtCustomerName').val();
                        let checkEmailData = $('#edtCustomerEmail').val();
                        // let mailCC = templateObject.mailCopyToUsr.get();
                        let grandtotal = $('#grandTotal').html();
                        let amountDueEmail = $('#totalBalanceDue').html();
                        let emailDueDate = $("#dtDueDate").val();
                        let mailSubject = 'Payment ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
                        let mailBody = "Hi " + customerEmailName + ",\n\n Here's payment " + erpInvoiceId + " for  " + grandtotal + "." +
                            // "\n\nThe amount outstanding of "+amountDueEmail+" is due on "+emailDueDate+"." +
                            "\n\nIf you have any questions, please let us know : " + mailFrom + ".\n\nThanks,\n" + mailFromName;

                        var htmlmailBody = '<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">' +
                            '    <tr>' +
                            '        <td align="center" bgcolor="#54c7e2" style="padding: 40px 0 30px 0;">' +
                            '            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" alt="VS1 Cloud" width="250px" style="display: block;" />' +
                            '        </td>' +
                            '    </tr>' +
                            '    <tr>' +
                            '        <td style="padding: 40px 30px 40px 30px;">' +
                            '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                            '                <tr>' +
                            '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 20px 0;">' +
                            '                        Hello there <span>' + customerEmailName + '</span>,' +
                            '                    </td>' +
                            '                </tr>' +
                            '                <tr>' +
                            '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
                            '                        Please find payment <span>' + erpInvoiceId + '</span> attached below.' +
                            '                    </td>' +
                            '                </tr>' +
                            '                <tr>' +
                            '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 30px 0;">' +
                            '                        Kind regards,' +
                            '                        <br>' +
                            '                        ' + mailFromName + '' +
                            '                    </td>' +
                            '                </tr>' +
                            '            </table>' +
                            '        </td>' +
                            '    </tr>' +
                            '    <tr>' +
                            '        <td bgcolor="#00a3d3" style="padding: 30px 30px 30px 30px;">' +
                            '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                            '                <tr>' +
                            '                    <td width="50%" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">' +
                            '                        If you have any question, please do not hesitate to contact us.' +
                            '                    </td>' +
                            '                    <td align="right">' +
                            '                        <a style="border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; background-color: #4CAF50;" href="mailto:' + mailFrom + '">Contact Us</a>' +
                            '                    </td>' +
                            '                </tr>' +
                            '            </table>' +
                            '        </td>' +
                            '    </tr>' +
                            '</table>';

                        if (($('.chkEmailCopy').is(':checked')) && ($('.chkEmailRep').is(':checked'))) {
                            Meteor.call('sendEmail', {
                                from: "" + mailFromName + " <" + mailFrom + ">",
                                to: checkEmailData,
                                subject: mailSubject,
                                text: '',
                                html: htmlmailBody,
                                attachments: attachment
                            }, function (error, result) {
                                if (error && error.error === "error") {
                                    FlowRouter.go('/paymentoverview?success=true');

                                } else {
                                }
                            });

                            Meteor.call('sendEmail', {
                                from: "" + mailFromName + " <" + mailFrom + ">",
                                to: mailFrom,
                                subject: mailSubject,
                                text: '',
                                html: htmlmailBody,
                                attachments: attachment
                            }, function (error, result) {
                                if (error && error.error === "error") {
                                    FlowRouter.go('/paymentoverview?success=true');
                                } else {
                                    $('#html-2-pdfwrapper').css('display', 'none');
                                    swal({
                                        title: 'SUCCESS',
                                        text: "Email Sent To Customer: " + checkEmailData + " and User: " + mailFrom + "",
                                        type: 'success',
                                        showCancelButton: false,
                                        confirmButtonText: 'OK'
                                    }).then((result) => {
                                        if (result.value) {
                                            FlowRouter.go('/paymentoverview?success=true');
                                        } else if (result.dismiss === 'cancel') {
                                        }
                                    });

                                    $('.fullScreenSpin').css('display', 'none');
                                }
                            });

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
                            values.forEach(value => {
                                let reportData = JSON.parse(value);
                                reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                reportData.attachments = attachment;
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("61")) {
                                            reportData.FormID = 61;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 61)
                                            Meteor.call('sendNormalEmail', reportData);
                                    }
                                }
                            });

                        } else if (($('.chkEmailCopy').is(':checked'))) {
                            Meteor.call('sendEmail', {
                                from: "" + mailFromName + " <" + mailFrom + ">",
                                to: checkEmailData,
                                subject: mailSubject,
                                text: '',
                                html: htmlmailBody,
                                attachments: attachment
                            }, function (error, result) {
                                if (error && error.error === "error") {
                                    FlowRouter.go('/paymentoverview?success=true');

                                } else {
                                    $('#html-2-pdfwrapper').css('display', 'none');
                                    swal({
                                        title: 'SUCCESS',
                                        text: "Email Sent To Customer: " + checkEmailData + " ",
                                        type: 'success',
                                        showCancelButton: false,
                                        confirmButtonText: 'OK'
                                    }).then((result) => {
                                        if (result.value) {
                                            FlowRouter.go('/paymentoverview?success=true');
                                        } else if (result.dismiss === 'cancel') {
                                        }
                                    });

                                    $('.fullScreenSpin').css('display', 'none');
                                }
                            });

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
                            values.forEach(value => {
                                let reportData = JSON.parse(value);
                                reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                reportData.attachments = attachment;
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("61")) {
                                            reportData.FormID = 61;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 61)
                                            Meteor.call('sendNormalEmail', reportData);
                                    }
                                }
                            });

                        } else if (($('.chkEmailRep').is(':checked'))) {
                            Meteor.call('sendEmail', {
                                from: "" + mailFromName + " <" + mailFrom + ">",
                                to: mailFrom,
                                subject: mailSubject,
                                text: '',
                                html: htmlmailBody,
                                attachments: attachment
                            }, function (error, result) {
                                if (error && error.error === "error") {
                                    FlowRouter.go('/paymentoverview?success=true');
                                } else {
                                    $('#html-2-pdfwrapper').css('display', 'none');
                                    swal({
                                        title: 'SUCCESS',
                                        text: "Email Sent To User: " + mailFrom + " ",
                                        type: 'success',
                                        showCancelButton: false,
                                        confirmButtonText: 'OK'
                                    }).then((result) => {
                                        if (result.value) {
                                            FlowRouter.go('/paymentoverview?success=true');
                                        } else if (result.dismiss === 'cancel') {
                                        }
                                    });

                                    $('.fullScreenSpin').css('display', 'none');
                                }
                            });

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
                            values.forEach(value => {
                                let reportData = JSON.parse(value);
                                reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                reportData.attachments = attachment;
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("61")) {
                                            reportData.FormID = 61;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 61)
                                            Meteor.call('sendNormalEmail', reportData);
                                    }
                                }
                            });

                        } else {
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
                            values.forEach(value => {
                                let reportData = JSON.parse(value);
                                reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                                reportData.attachments = attachment;
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("61")) {
                                            reportData.FormID = 61;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 61)
                                            Meteor.call('sendNormalEmail', reportData);
                                    }
                                }
                            });
                            FlowRouter.go('/paymentoverview?success=true');
                        }
                        ;
                    };

                }

                addAttachment();

                function generatePdfForMail(invoiceId) {
                    return new Promise((resolve, reject) => {
                        let templateObject = Template.instance();
                        // let data = templateObject.singleInvoiceData.get();
                        let completeTabRecord;
                        let doc = new jsPDF('p', 'pt', 'a4');
                        doc.setFontSize(18);
                        var source = document.getElementById('html-2-pdfwrapper');
                        doc.addHTML(source, function () {
                            //pdf.save('Invoice.pdf');
                            resolve(doc.output('blob'));
                            // $('#html-2-pdfwrapper').css('display','none');
                        });
                    });
                }

                // End Send Email
                if (customerID !== " ") {
                    let customerEmailData = {
                        type: "TCustomer",
                        fields: {
                            ID: customerID,
                            Email: customerEmail
                        }
                    }
                    // paymentService.saveCustomerEmail(customerEmailData).then(function (customerEmailData) {
                    //
                    // });
                }
                ;
                $('.fullScreenSpin').css('display', 'none');
                // window.open('/salesorderslist','_self');
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
                    } else if (result.dismiss === 'cancel') {
                    }
                });
                $('.fullScreenSpin').css('display', 'none');
            });


        }

        // if(depositData[0].PayMethod !== ''){
        //     PayMethod = depositData[0].PayMethod;
        // }
        // else {
        //     PayMethod = 'Cash';
        // }
    }, delayTimeAfterSound);
    },
    'click #tblPaymentcard tr .colTransNoDONT': function (event) {
        let custname = $('#edtCustomerName').val() || '';
        if (custname === '') {
            swal('Customer has not been selected!', '', 'warning');
            e.preventDefault();
        } else {
            if ($('#addRow').prop('disabled') == false) {
                let templateObject = Template.instance();
                $(".chkBox").prop("checked", false);
                let paymentList = [''];
                $('.tblPaymentcard tbody tr').each(function () {
                    paymentList.push(this.id);

                })

                let geturl = location.href;
                let id = 0;
                if (geturl.indexOf('?invid') > 0 || geturl.indexOf('?selectcust')) {
                    geturl = new URL(geturl);
                    id = geturl.searchParams.get("invid") || geturl.searchParams.get("selectcust");
                }
                let $tblrows = $("#tblPaymentcard tbody tr");
                LoadingOverlay.show();
                let paymentData = templateObject.datatablerecords1.get();

                let paymentDataList = [];
                if (jQuery.isEmptyObject(FlowRouter.current().queryParams) == true) {
                    for (let x = 0; x < paymentData.length; x++) {
                        let found = paymentList.some(emp => emp == paymentData[x].id);
                        if (custname == paymentData[x].customername && found == false) {
                            paymentDataList.push(paymentData[x]);
                        }
                    }

                } else {
                    for (let x = 0; x < paymentData.length; x++) {
                        let found = paymentList.some(emp => emp == paymentData[x].id);
                        if (custname == paymentData[x].customername && id.includes(paymentData[x].id) == false && found == false) {
                            paymentDataList.push(paymentData[x]);
                        }
                    }
                }
                $('.dataTables_info').hide();
                templateObject.datatablerecords.set(paymentDataList);
                $('#customerPaymentListModal').modal();
                $('.fullScreenSpin').css('display', 'none');
            }
        }
    },
    'click .chkPaymentCard': function () {
        var listData = $(this).closest('tr').attr('id');
        var selectedClient = $(event.target).closest("tr").find(".colCustomerName").text();
        const templateObject = Template.instance();
        const selectedAwaitingPayment = [];
        const selectedAwaitingPayment2 = [];
        const selectedAwaitingPayment3 = [];
        $('.chkPaymentCard:checkbox:checked').each(function () {
            //$('.parentClass:not(span)').method
            var chkIdLine = $(this).closest('tr').attr('id');
            var date = $(this).closest("tr").find('.colPaymentDate').text();
            var receiptNo = $(this).closest("tr").find('.colReceiptNo').text();
            var orderNo = $(this).closest("tr").find('.colPONumber').text();
            var paymentAmount = $(this).closest("tr").find('.colPaymentAmount').text();
            var originalAmount = $(this).closest("tr").find('.colApplied').text();
            var outstandingAmount = $(this).closest("tr").find('.colBalance').text();
            var supplierName = $(this).closest("tr").find('.colSupplierName').text();
            var comments = $(this).closest("tr").find('.colNotes').text();
            var type = $(this).closest("tr").find('.colTypePayment').text();
            let paymentTransObj = {
                awaitingId: chkIdLine,
                date: date,
                receiptNo: receiptNo,
                orderNo: orderNo,
                paymentAmount: outstandingAmount,
                originalAmount: originalAmount,
                outstandingAmount: outstandingAmount,
                supplierName: supplierName,
                comments: comments,
                type: type
            };

            if (selectedAwaitingPayment.length > 0) {
                var checkClient = selectedAwaitingPayment.filter(slctdAwtngPyment => {
                    return slctdAwtngPyment.supplierName == $('#colSupplierName' + chkIdLine).text();
                });

                if (checkClient.length > 0) {
                    selectedAwaitingPayment.push(paymentTransObj);
                } else {
                    swal('', 'You have selected multiple Suppliers,  a separate payment will be created for each', 'info');
                    $(this).prop("checked", false);
                }
            } else {
                selectedAwaitingPayment.push(paymentTransObj);
            }
        });
        templateObject.selectedAwaitingPayment.set(selectedAwaitingPayment);
    },
    'click .chkBoxAll': function () {
        var listData = $(this).closest('tr').attr('id');
        var selectedClient = $(event.target).closest("tr").find(".colCustomerName").text();
        const templateObject = Template.instance();
        const selectedAwaitingPayment = [];
        const selectedAwaitingPayment2 = [];
        const selectedAwaitingPayment3 = [];
        if ($(event.target).is(':checked')) {
            $(".chkBox").prop("checked", true);
            $('.chkPaymentCard:checkbox:checked').each(function () {
                //$('.parentClass:not(span)').method
                var chkIdLine = $(this).closest('tr').attr('id');
                var date = $(this).closest("tr").find('.colPaymentDate').text();
                var receiptNo = $(this).closest("tr").find('.colReceiptNo').text();
                var orderNo = $(this).closest("tr").find('.colPONumber').text();
                var paymentAmount = $(this).closest("tr").find('.colPaymentAmount').text();
                var originalAmount = $(this).closest("tr").find('.colApplied').text();
                var outstandingAmount = $(this).closest("tr").find('.colBalance').text();
                var supplierName = $(this).closest("tr").find('.colSupplierName').text();
                var comments = $(this).closest("tr").find('.colNotes').text();
                var type = $(this).closest("tr").find('.colTypePayment').text();
                let paymentTransObj = {
                    awaitingId: chkIdLine,
                    date: date,
                    receiptNo: receiptNo,
                    orderNo: orderNo,
                    paymentAmount: outstandingAmount,
                    originalAmount: originalAmount,
                    outstandingAmount: outstandingAmount,
                    supplierName: supplierName,
                    comments: comments,
                    type: type
                };

                if (selectedAwaitingPayment.length > 0) {
                    var checkClient = selectedAwaitingPayment.filter(slctdAwtngPyment => {
                        return slctdAwtngPyment.supplierName == $('#colSupplierName' + chkIdLine).text();
                    });

                    if (checkClient.length > 0) {
                        selectedAwaitingPayment.push(paymentTransObj);
                    } else {
                        swal('', 'You have selected multiple Suppliers,  a separate payment will be created for each', 'info');
                        $(this).prop("checked", false);
                    }
                } else {
                    selectedAwaitingPayment.push(paymentTransObj);
                }
            });
            templateObject.selectedAwaitingPayment.set(selectedAwaitingPayment);
        } else {
            $(".chkBox").prop("checked", false);
            $('.chkPaymentCard:checkbox:checked').each(function () {
                //$('.parentClass:not(span)').method
                var chkIdLine = $(this).closest('tr').attr('id');
                var date = $(this).closest("tr").find('.colPaymentDate').text();
                var receiptNo = $(this).closest("tr").find('.colReceiptNo').text();
                var orderNo = $(this).closest("tr").find('.colPONumber').text();
                var paymentAmount = $(this).closest("tr").find('.colPaymentAmount').text();
                var originalAmount = $(this).closest("tr").find('.colApplied').text();
                var outstandingAmount = $(this).closest("tr").find('.colBalance').text();
                var supplierName = $(this).closest("tr").find('.colSupplierName').text();
                var comments = $(this).closest("tr").find('.colNotes').text();
                var type = $(this).closest("tr").find('.colTypePayment').text();
                let paymentTransObj = {
                    awaitingId: chkIdLine,
                    date: date,
                    receiptNo: receiptNo,
                    orderNo: orderNo,
                    paymentAmount: outstandingAmount,
                    originalAmount: originalAmount,
                    outstandingAmount: outstandingAmount,
                    supplierName: supplierName,
                    comments: comments,
                    type: type
                };

                if (selectedAwaitingPayment.length > 0) {
                    var checkClient = selectedAwaitingPayment.filter(slctdAwtngPyment => {
                        return slctdAwtngPyment.supplierName == $('#colSupplierName' + chkIdLine).text();
                    });

                    if (checkClient.length > 0) {
                        selectedAwaitingPayment.push(paymentTransObj);
                    } else {
                        swal('', 'You have selected multiple Suppliers,  a separate payment will be created for each', 'info');
                        $(this).prop("checked", false);
                    }
                } else {
                    selectedAwaitingPayment.push(paymentTransObj);
                }
            });
            templateObject.selectedAwaitingPayment.set(selectedAwaitingPayment);
        }
    },
    'click .btnSelectCustomers': function (event) {
        const templateObject = Template.instance();
        let selectedSupplierPayments = templateObject.selectedAwaitingPayment.get();
        // if (selectedSupplierPayments.length > 0) {
        //     let currentApplied = $('.lead').text().replace(/[^0-9.-]+/g, "");
        //     currentApplied = parseFloat(currentApplied.match(/-?(?:\d+(?:\.\d*)?|\.\d+)/)[0])
        //     let total = currentApplied;
        //     for (let x = 0; x < selectedSupplierPayments.length; x++) {
        //         var rowData = '<tr class="dnd-moved" id="' + selectedSupplierPayments[x].awaitingId + '" name="' + selectedSupplierPayments[x].awaitingId + '">\n' +
        //             '	<td contenteditable="false" class="colTransDate">' + selectedSupplierPayments[x].date + '</td>\n' +
        //             '	<td contenteditable="false" class="colType" style="color:#00a3d3; cursor: pointer; white-space: nowrap;">Invoice</td>\n' +
        //             '	<td contenteditable="false" class="colTransNo" style="color:#00a3d3">' + selectedSupplierPayments[x].awaitingId + '</td>\n' +
        //             '	<td contenteditable="false" class="lineOrginalamount" style="text-align: right!important;">' + selectedSupplierPayments[x].originalAmount + '</td>\n' +
        //             '	<td contenteditable="false" class="lineAmountdue" style="text-align: right!important;">' + selectedSupplierPayments[x].outstandingAmount + '</td>\n' +
        //             '	<td><input class="linePaymentamount highlightInput" type="text" value="' + selectedSupplierPayments[x].paymentAmount + '"></td>\n' +
        //             '	<td contenteditable="false" class="lineOutstandingAmount" style="text-align: right!important;">' + Currency+'0.00' + '</td>\n' +
        //             '	<td contenteditable="true" class="colComments">' + selectedSupplierPayments[x].comments + '</td>\n' +
        //             '	<td><span class="table-remove btnRemove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span></td>\n' +
        //             '</tr>';

        //         //$('#tblPaymentcard tbody>tr:last').clone(true);
        //         // $(".colTransDate", rowData).text(selectedSupplierPayments[x].date);
        //         // $(".colType", rowData).text("Invoice");
        //         // $(".colTransNo", rowData).text(selectedSupplierPayments[x].awaitingId);
        //         // $(".lineOrginalamount", rowData).text(selectedSupplierPayments[x].originalAmount);
        //         // $(".lineAmountdue", rowData).text(selectedSupplierPayments[x].outstandingAmount);
        //         // $(".linePaymentamount", rowData).val(selectedSupplierPayments[x].paymentAmount);
        //         // $(".lineOutstandingAmount", rowData).text(selectedSupplierPayments[x].paymentAmount);
        //         // $(".colComments", rowData).text(selectedSupplierPayments[x].comments);
        //         // rowData.attr('id', selectedSupplierPayments[x].awaitingId);
        //         // rowData.attr('name', selectedSupplierPayments[x].awaitingId);
        //         let checkCompareID = selectedSupplierPayments[x].awaitingId || '';
        //         let isCheckedTrue = true;
        //         $('.tblPaymentcard > tbody > tr').each(function() {
        //             var lineID = this.id;
        //             if (lineID == checkCompareID) {
        //                 isCheckedTrue = false;
        //             }
        //         });
        //         if (isCheckedTrue) {
        //             $("#tblPaymentcard tbody").append(rowData);
        //             total = total + parseFloat(selectedSupplierPayments[x].paymentAmount.replace(/[^0-9.-]+/g, "")) || 0;
        //         }
        //         //$('.appliedAmount').text(Currency + total.toFixed(2));
        //     }
        //     $('.appliedAmount').text(utilityService.modifynegativeCurrencyFormat(total.toFixed(2)));
        //     $('#edtPaymentAmount').val(utilityService.modifynegativeCurrencyFormat(total));
        // }

        let customerPayments = templateObject.customerPayments.get();
        customerPayments.push(...selectedSupplierPayments);
        templateObject.customerPayments.set(customerPayments);

        templateObject.addExpenseToTable(templateObject.isForeignEnabled.get());

        templateObject.selectedAwaitingPayment.set([]);
        $('#customerPaymentListModal').modal('hide');

    },
    'keydown #edtPaymentAmount,keydown #lineOrginalamount,keydown #lineAmountdue,keydown .linePaymentamount, keydown #lineOutstandingAmount': function (event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
            // Allow: Ctrl+A, Command+A
            (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
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
            event.keyCode == 46 || event.keyCode == 190) {
        } else {
            event.preventDefault();
        }
    },
    'blur #edtPaymentAmount': function (event) {
        let paymentAmt = $(event.target).val();
        let formatedpaymentAmt = Number(paymentAmt.replace(/[^0-9.-]+/g, "")) || 0;
        $('#edtPaymentAmount').val(utilityService.modifynegativeCurrencyFormat(formatedpaymentAmt));
    },
    'blur .linePaymentamount': function (event) {
        let paymentAmt = $(event.target).val() || 0;

        let oustandingAmt = $(event.target).closest('tr').find('.lineAmountdue').text() || 0;
        let formatedoustandingAmt = Number(oustandingAmt.replace(/[^0-9.-]+/g, "")) || 0;

        let formatedpaymentAmt = Number(paymentAmt.replace(/[^0-9.-]+/g, "")) || 0;

        if (formatedpaymentAmt > 0) {
            if (formatedpaymentAmt > formatedoustandingAmt) {
                $(event.target).closest('tr').find('.lineOutstandingAmount').text(Currency + 0);
            } else {
                let getUpdateOustanding = formatedoustandingAmt - formatedpaymentAmt;
                $(event.target).closest('tr').find('.lineOutstandingAmount').text(utilityService.modifynegativeCurrencyFormat(getUpdateOustanding));
            }
        }

        $(event.target).val(utilityService.modifynegativeCurrencyFormat(formatedpaymentAmt));
        let $tblrows = $("#tblPaymentcard tbody tr");
        let appliedGrandTotal = 0;
        $tblrows.each(function (index) {
            var $tblrow = $(this);
            var pricePayAmount = Number($tblrow.find(".linePaymentamount").val().replace(/[^0-9.-]+/g, "")) || 0;
            if (!isNaN(pricePayAmount)) {

                appliedGrandTotal += pricePayAmount;
                //document.getElementById("subtotal_total").innerHTML = Currency+''+subGrandTotal.toLocaleString(undefined, {minimumFractionDigits: 2});
            }
        });
        $('#edtPaymentAmount').val(utilityService.modifynegativeCurrencyFormat(appliedGrandTotal));
        $('.appliedAmount').text(utilityService.modifynegativeCurrencyFormat(appliedGrandTotal));
    },
    'click .btnBack': function (event) {
        playCancelAudio();
        event.preventDefault();
        setTimeout(function(){
        if (FlowRouter.current().queryParams.trans) {
            FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
        } else {
            history.back(1);
        }
        }, delayTimeAfterSound);
    },
    'click .printConfirm': async function (event) {
    playPrintAudio();
    setTimeout(async function(){
        var printTemplate = [];
        LoadingOverlay.show();
        var customer_payment = $('input[name="Customer Payments"]:checked').val();
        let emid = Session.get('mySessionEmployeeLoggedID');

        sideBarService.getTemplateNameandEmployeId("Customer Payments", emid, 1).then(function (data) {
            let templateid = data.ttemplatesettings;
            var id = templateid[0].fields.ID;
            let objDetails = {
                type: "TTemplateSettings",
                fields: {
                    ID: parseInt(id),
                    EmployeeID: Session.get('mySessionEmployeeLoggedID'),
                    SettingName: "Customer Payments",
                    GlobalRef: "Customer Payments",
                    Description: $('input[name="Customer Payments_1"]').val(),
                    Template: "1",
                    Active: customer_payment == 1 ? true : false,
                }
            }

            sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));

                });
            }).catch(function (err) {
            });

        }).catch(function (err) {

            let objDetails = {
                type: "TTemplateSettings",
                fields: {
                    EmployeeID: Session.get('mySessionEmployeeLoggedID'),
                    SettingName: "Customer Payments",
                    Description: $('input[name="Customer Payments_1"]').val(),
                    Template: "1",
                    Active: customer_payment == 1 ? true : false,
                }
            }

            sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));

                });


            }).catch(function (err) {


            });

        });

        sideBarService.getTemplateNameandEmployeId("Customer Payments", emid, 2).then(function (data) {
            let templateid = data.ttemplatesettings;
            var id = templateid[0].fields.ID;
            let objDetails = {
                type: "TTemplateSettings",
                fields: {
                    ID: parseInt(id),
                    EmployeeID: Session.get('mySessionEmployeeLoggedID'),
                    SettingName: "Customer Payments",
                    GlobalRef: "Customer Payments",
                    Description: $('input[name="Customer Payments_2"]').val(),
                    Template: "2",
                    Active: customer_payment == 2 ? true : false,
                }
            }

            sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));

                });

            }).catch(function (err) {

            });

        }).catch(function (err) {

            let objDetails = {
                type: "TTemplateSettings",
                fields: {
                    EmployeeID: Session.get('mySessionEmployeeLoggedID'),
                    SettingName: "Customer Payments",
                    Description: $('input[name="Customer Payments_2"]').val(),
                    Template: "2",
                    Active: customer_payment == 2 ? true : false,
                }
            }

            sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));

                });

            }).catch(function (err) {


            });

        });

        sideBarService.getTemplateNameandEmployeId("Customer Payments", emid, 3).then(function (data) {
            let templateid = data.ttemplatesettings;
            var id = templateid[0].fields.ID;
            let objDetails = {
                type: "TTemplateSettings",
                fields: {
                    ID: parseInt(id),
                    EmployeeID: Session.get('mySessionEmployeeLoggedID'),
                    SettingName: "Customer Payments",
                    GlobalRef: "Customer Payments",
                    Description: $('input[name="Customer Payments_3"]').val(),
                    Template: "3",
                    Active: customer_payment == 3 ? true : false,
                }
            }

            sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));

                });


            }).catch(function (err) {

            });

        }).catch(function (err) {

            let objDetails = {
                type: "TTemplateSettings",
                fields: {
                    EmployeeID: Session.get('mySessionEmployeeLoggedID'),
                    SettingName: "Customer Payments",
                    Description: $('input[name="Customer Payments_3"]').val(),
                    Template: "3",
                    Active: customer_payment == 3 ? true : false,
                }
            }

            sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));

                });

            }).catch(function (err) {

            });

        });

        if ($('#print_custom_payment').is(':checked') || $('#print_custom_payment_second').is(':checked')) {
            printTemplate.push('Customer Payments');
        }

        if (printTemplate.length > 0) {
            for (var i = 0; i < printTemplate.length; i++) {
                if (printTemplate[i] == 'Customer Payments') {
                    var template_number = $('input[name="Customer Payments"]:checked').val();
                }

                let result = await exportSalesToPdf(printTemplate[i], template_number);
                if (result == true) {
                }

            }
        }

        // $('#html-2-pdfwrapper').css('display', 'block');
        // if ($('.edtCustomerEmail').val() != "") {
        //     $('.pdfCustomerName').html($('#edtCustomerName').val());
        //     $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));

        //     var ponumber = $('#ponumber').val() || '.';
        //     $('.po').text(ponumber);
        //     var rowCount = $('.tblInvoiceLine tbody tr').length;
        // } else {
        //     swal({
        //         title: 'Customer Email Required',
        //         text: 'Please enter customer email',
        //         type: 'error',
        //         showCancelButton: false,
        //         confirmButtonText: 'OK'
        //     }).then((result) => {
        //         if (result.value) {
        //         } else if (result.dismiss === 'cancel') {
        //         }
        //     });
        // }
    }, delayTimeAfterSound);
    },

    'click  #open_print_confirm': function (event) {
        playPrintAudio();
        setTimeout(async function(){
        if ($('#choosetemplate').is(':checked')) {
            $('#templateselection').modal('show');
        } else {
            LoadingOverlay.show();            
            // $('#html-2-pdfwrapper').css('display', 'block');
            let result = await exportSalesToPdf(template_list[0], 1);            
            // if ($('.edtCustomerEmail').val() != "") {
            //     $('.pdfCustomerName').html($('#edtCustomerName').val());
            //     $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));
            //     var ponumber = $('#ponumber').val() || '.';
            //     $('.po').text(ponumber);
            //     var rowCount = $('.tblInvoiceLine tbody tr').length;
            //     exportSalesToPdf1();
            // } else {
            //     swal({
            //         title: 'Customer Email Required',
            //         text: 'Please enter customer email',
            //         type: 'error',
            //         showCancelButton: false,
            //         confirmButtonText: 'OK'
            //     }).then((result) => {
            //         if (result.value) {
            //         } else if (result.dismiss === 'cancel') {
            //         }
            //     });
            // }
            // $('#confirmprint').modal('hide');
        }
    }, delayTimeAfterSound);
    },

    'click #choosetemplate': function (event) {
        if ($('#choosetemplate').is(':checked')) {
            $('#templateselection').modal('show');
        } else {
            $('#templateselection').modal('hide');
        }

    },

    'click .btnRemove': async function (event) {
        $('.btnDeleteLine').show();
        let utilityService = new UtilityService();
        var targetID = $(event.target).closest('tr').attr('id') || 0; // table row ID
        $('#selectDeleteLineID').val(targetID);
        
        if(targetID != undefined){
            times++;
            if (times == 1) {
                if (targetID == 0) {
                    $(event.target).closest('tr').remove();
                } else {
                    $('#deleteLineModal').modal('toggle');
                }

            } else {
                if ($('#tblPaymentcard tbody>tr').length > 1) {
                    this.click;
                    let total = 0;
                    $(event.target).closest('tr').remove();
                    event.preventDefault();
                    let $tblrows = $("#tblPaymentcard tbody tr");
                    $tblrows.each(function (index) {
                        var $tblrow = $(this);
                        total += parseFloat($tblrow.find(".linePaymentamount ").val().replace(/[^0-9.-]+/g, "")) || 0;
                    });
                    $('.appliedAmount').text(utilityService.modifynegativeCurrencyFormat(total.toFixed(2)));
                    return false;

                } else {
                    if (targetID == 0) {
                        $(event.target).closest('tr').remove();
                    } else {
                        $('#deleteLineModal').modal('toggle');
                    }
                }

            }
        } else {
            if(templateObject.hasFollow.get()) $("#footerDeleteModal2").modal("toggle");
            else $("#footerDeleteModal1").modal("toggle");
        }
    },
    'click .btnDeleteFollowingPayments': async function (event) {
        playDeleteAudio();
        var currentDate = new Date();
        let paymentService = new PaymentsService();
        let templateObject = Template.instance();
        setTimeout(async function(){

        swal({
            title: 'Delete Payment',
            text: "Do you wish to delete this transaction and all others associated with it moving forward?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then(async (result) => {
            if (result.value) {
                var url = FlowRouter.current().path;
                var getso_id = url.split('?id=');
                var currentInvoice = getso_id[getso_id.length - 1];
                var objDetails = '';
                $('.fullScreenSpin').css('display','inline-block');
                if (getso_id[1]) {
                    currentInvoice = parseInt(currentInvoice);
                    var paymentData = await paymentService.getOneCustomerPayment(currentInvoice);
                    var paymentDate = paymentData.fields.PaymentDate;
                    var fromDate = paymentDate.substring(0, 10);
                    var toDate = currentDate.getFullYear() + '-' + ("0" + (currentDate.getMonth() + 1)).slice(-2) + '-' + ("0" + (currentDate.getDate())).slice(-2);
                    var followingPayments = await sideBarService.getAllTCustomerPaymentListData(
                        fromDate,
                        toDate,
                        false,
                        initialReportLoad,
                        0
                    );
                    var paymentList = followingPayments.tcustomerpaymentlist;
                    for (var i=0; i < paymentList.length; i++) {
                        var objDetails = {
                            type: "TCustPayments",
                            fields: {
                                ID: paymentList[i].PaymentID,
                                Deleted: true
                            }
                        };
                        var result = await paymentService.deleteDepositData(objDetails);
                    }
                }
                $('.modal-backdrop').css('display', 'none');
                FlowRouter.go('/paymentoverview?success=true');
            }
        });
    }, delayTimeAfterSound);
    },
    'click .btnDeletePayment': async function (event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let paymentService = new PaymentsService();
        setTimeout(function(){
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentInvoice = getso_id[getso_id.length - 1];
        var objDetails = '';
        swal({
            title: 'Delete Payment',
            text: "Are you sure you want to Delete this Payment?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.value) {
                LoadingOverlay.show();
                if (getso_id[1]) {
                    currentInvoice = parseInt(currentInvoice);
                    var objDetails = {
                        type: "TCustPayments",
                        fields: {
                            ID: currentInvoice,
                            Deleted: true
                        }
                    };

                    paymentService.deleteDepositData(objDetails).then(function (objDetails) {
                        $('.modal-backdrop').css('display', 'none');
                        FlowRouter.go('/paymentoverview?success=true');
                    }).catch(function (err) {
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                Meteor._reload.reload();
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    });
                } else {
                    $('.modal-backdrop').css('display', 'none');
                    FlowRouter.go('/paymentoverview?success=true');
                }
            } else {
            }
        });
        // $('#deleteLineModal').modal('toggle');
    }, delayTimeAfterSound);
    },
    'click .btnRecoverPayment': function (event) {
        LoadingOverlay.show();
        let templateObject = Template.instance();
        let paymentService = new PaymentsService();
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentInvoice = getso_id[getso_id.length - 1];
        var objDetails = '';
        if (getso_id[1]) {
            currentInvoice = parseInt(currentInvoice);
            var objDetails = {
                type: "TCustPayments",
                fields: {
                    ID: currentInvoice,
                    Deleted: false
                }
            };
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Recover Payment',
                text: 'Are you sure that you want to recover this payment?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Recover',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.value) {
                    paymentService.deleteDepositData(objDetails).then(function (objDetails) {
                        $('.modal-backdrop').css('display', 'none');
                        FlowRouter.go('/paymentoverview?success=true');
                    }).catch(function (err) {
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                Meteor._reload.reload();
                            } else if (result.dismiss === 'cancel') {
                            }
                        });

                    });
                } else if (result.dismiss === 'cancel') {
                    history.back(1);
                }
            });


        } else {
            FlowRouter.go('/paymentoverview?success=true');
        }
    },
    'click .btnConfirmPayment': function (event) {
        $('.btnDeleteLine').hide();
        $('#deleteLineModal').modal('toggle');
    },
    'click .btnDeleteLine': function (event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        setTimeout(function(){
        let selectLineID = $('#selectDeleteLineID').val() || 0;
        if ($('#tblPaymentcard tbody>tr').length > 1) {
            this.click;
            let total = 0;
            $('#tblPaymentcard #' + selectLineID).closest('tr').remove();
            let $tblrows = $("#tblPaymentcard tbody tr");
            $tblrows.each(function (index) {
                var $tblrow = $(this);
                total += parseFloat($tblrow.find(".linePaymentamount ").val().replace(/[^0-9.-]+/g, "")) || 0;
            });
            $('.appliedAmount').text(utilityService.modifynegativeCurrencyFormat(total.toFixed(2)));

        } else {
            this.click;
            $('#' + selectLineID + " .colTransDate").text('');
            $('#' + selectLineID + " .colType").text('');
            $('#' + selectLineID + " .colTransNo").text('');
            $('#' + selectLineID + " .lineOrginalamount").text('');
            $('#' + selectLineID + " .lineAmountdue").text('');
            $('#' + selectLineID + " .lineOutstandingAmount").text('');
            $('#' + selectLineID + " .colComments").text('');

            $('.appliedAmount').val(Currency + '0.00');
        }

        $('#deleteLineModal').modal('toggle');
    }, delayTimeAfterSound);
    },
    'click .chkcolTransDate': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colTransDate').css('display', 'table-cell');
            $('.colTransDate').css('padding', '.75rem');
            $('.colTransDate').css('vertical-align', 'top');
        } else {
            $('.colTransDate').css('display', 'none');
        }
    },
    'click .chkcolType': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colType').css('display', 'table-cell');
            $('.colType').css('padding', '.75rem');
            $('.colType').css('vertical-align', 'top');
        } else {
            $('.colType').css('display', 'none');
        }
    },
    'click .chkcolTransNo': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colTransNo').css('display', 'table-cell');
            $('.colTransNo').css('padding', '.75rem');
            $('.colTransNo').css('vertical-align', 'top');
        } else {
            $('.colTransNo').css('display', 'none');
        }
    },
    'click .chklineOrginalamount': function (event) {
        if ($(event.target).is(':checked')) {
            $('.lineOrginalamount').css('display', 'table-cell');
            $('.lineOrginalamount').css('padding', '.75rem');
            $('.lineOrginalamount').css('vertical-align', 'top');
        } else {
            $('.lineOrginalamount').css('display', 'none');
        }
    },
    'click .chklineAmountdue': function (event) {
        if ($(event.target).is(':checked')) {
            $('.lineAmountdue').css('display', 'table-cell');
            $('.lineAmountdue').css('padding', '.75rem');
            $('.lineAmountdue').css('vertical-align', 'top');
        } else {
            $('.lineAmountdue').css('display', 'none');
        }
    },
    'click .chklinePaymentamount': function (event) {
        if ($(event.target).is(':checked')) {
            $('.linePaymentamount').css('display', 'table-cell');
            $('.linePaymentamount').css('padding', '.75rem');
            $('.linePaymentamount').css('vertical-align', 'top');
        } else {
            $('.linePaymentamount').css('display', 'none');
        }
    },
    'click .chklineOutstandingAmount': function (event) {
        if ($(event.target).is(':checked')) {
            $('.lineOutstandingAmount').css('display', 'table-cell');
            $('.lineOutstandingAmount').css('padding', '.75rem');
            $('.lineOutstandingAmount').css('vertical-align', 'top');
        } else {
            $('.lineOutstandingAmount').css('display', 'none');
        }
    },
    'click .chkcolComments': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colComments').css('display', 'table-cell');
            $('.colComments').css('padding', '.75rem');
            $('.colComments').css('vertical-align', 'top');
        } else {
            $('.colComments').css('display', 'none');
        }
    },
    'change .rngRangeTransDate': function (event) {
        let range = $(event.target).val();
        $(".spWidthTransDate").html(range + '%');
        $('.colTransDate').css('width', range + '%');
    },
    'change .rngRangeType': function (event) {
        let range = $(event.target).val();
        $(".spWidthType").html(range + '%');
        $('.colType').css('width', range + '%');
    },
    'change .rngRangeTransNo': function (event) {
        let range = $(event.target).val();
        $(".spWidthTransNo").html(range + '%');
        $('.colTransNo').css('width', range + '%');
    },
    'change .rngRangelineOrginalamount': function (event) {
        let range = $(event.target).val();
        $(".spWidthlineOrginalamount").html(range + '%');
        $('.lineOrginalamount').css('width', range + '%');
    },
    'change .rngRangeAmountdue': function (event) {
        let range = $(event.target).val();
        $(".spWidthAmountdue").html(range + '%');
        $('.lineAmountdue').css('width', range + '%');
    },
    'change .rngRangePaymentAmount': function (event) {
        let range = $(event.target).val();
        $(".spWidthPaymentAmount").html(range + '%');
        $('.linePaymentamount').css('width', range + '%');
    },
    'change .rngRangeOutstandingAmount': function (event) {
        let range = $(event.target).val();
        $(".spWidthOutstandingAmount").html(range + '%');
        $('.lineOutstandingAmount').css('width', range + '%');
    },
    'change .rngRangeComments': function (event) {
        let range = $(event.target).val();
        $(".spWidthComments").html(range + '%');
        $('.colComments').css('width', range + '%');
    },
    'click .btnResetGridSettings': function (event) {
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
                    PrefName: 'tblPaymentcard'
                });
                if (checkPrefDetails) {
                    CloudPreference.remove({
                        _id: checkPrefDetails._id
                    }, function (err, idTag) {
                        if (err) {
                        } else {
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .btnSaveGridSettings': function (event) {
        playSaveAudio();
        setTimeout(function(){
        let lineItems = [];
        //let lineItemObj = {};
        $('.columnSettings').each(function (index) {
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
            // var price = $tblrow.find(".lineUnitPrice").text()||0;
            // var taxcode = $tblrow.find(".lineTaxRate").text()||0;

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
                    PrefName: 'tblPaymentcard'
                });
                if (checkPrefDetails) {
                    CloudPreference.update({
                        _id: checkPrefDetails._id
                    }, {
                        $set: {
                            userid: clientID,
                            username: clientUsername,
                            useremail: clientEmail,
                            PrefGroup: 'salesform',
                            PrefName: 'tblPaymentcard',
                            published: true,
                            customFields: lineItems,
                            updatedAt: new Date()
                        }
                    }, function (err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                            //window.open('/invoiceslist','_self');
                        } else {
                            $('#myModal2').modal('toggle');
                            //window.open('/invoiceslist','_self');

                        }
                    });

                } else {
                    CloudPreference.insert({
                        userid: clientID,
                        username: clientUsername,
                        useremail: clientEmail,
                        PrefGroup: 'salesform',
                        PrefName: 'tblPaymentcard',
                        published: true,
                        customFields: lineItems,
                        createdAt: new Date()
                    }, function (err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                            //window.open('/invoiceslist','_self');
                        } else {
                            $('#myModal2').modal('toggle');
                            //window.open('/invoiceslist','_self');

                        }
                    });

                }
            }
        }
        $('#myModal2').modal('toggle');
    }, delayTimeAfterSound);
    },
    'blur .divcolumn': function (event) {
        let columData = $(event.target).html();
        let columHeaderUpdate = $(event.target).attr("valueupdate");
        $("" + columHeaderUpdate + "").html(columData);

    },
    'click .chkEmailCopy': function (event) {
        $('#edtCustomerEmail').val($('#edtCustomerEmail').val().replace(/\s/g, ''));
        if ($(event.target).is(':checked')) {
            let checkEmailData = $('#edtCustomerEmail').val();

            if (checkEmailData.replace(/\s/g, '') === '') {
                swal('Customer Email cannot be blank!', '', 'warning');
                event.preventDefault();
            } else {

                function isEmailValid(mailTo) {
                    return /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(mailTo);
                };
                if (!isEmailValid(checkEmailData)) {
                    swal('The email field must be a valid email address !', '', 'warning');

                    event.preventDefault();
                    return false;
                } else {
                }
            }
        } else {
        }
    },
    "change #sltCurrency": (e, ui) => {
        // if ($("#sltCurrency").val() && $("#sltCurrency").val() != defaultCurrencyCode) {
        //   $(".foreign-currency-js").css("display", "block");
        // } else {
        //   $(".foreign-currency-js").css("display", "none");
        // }

        const templateObject = Template.instance();
        if ($("#sltCurrency").val() && $("#sltCurrency").val() != defaultCurrencyCode) {
            $(".foreign-currency-js").css("display", "block");

            ui.isForeignEnabled.set(true);
            // ui.updateRecordsWithForeign(false);
            //  ui.addExpenseToTable(true);
            templateObject.addExpenseToTable(true);
        } else {
            $(".foreign-currency-js").css("display", "none");
            ui.isForeignEnabled.set(false);
            //ui.updateRecordsWithForeign(true);
            // ui.addExpenseToTable(false);
            templateObject.addExpenseToTable(false);

        }

    },
    "keyup #exchange_rate": (e) => {
        onExchangeRateChange(e);
    },
    "change #exchange_rate": (e) => {
        onExchangeRateChange(e);
    },
    "change #edtForeignAmount": (e) => {
        setTimeout(() => {
            calculateApplied();
        }, 300);
    },
    "keyup #edtForeignAmount": (e) => {
        setTimeout(() => {
            calculateApplied();
        }, 300);
    },
    "change #edtVariation": (e) => {
        setTimeout(() => {
            calculateApplied();
        }, 300);
    },
    "keyup #edtVariation": (e) => {
        setTimeout(() => {
            calculateApplied();
        }, 300);
    },
    "change #edtApplied": (e) => {
        const currency = getCurrentCurrencySymbol();
        $('.appliedAmount').text(currency + $(e.currentTarget).val());
    },
    "keyup #edtApplied": (e) => {
        const currency = getCurrentCurrencySymbol();
        $('.appliedAmount').text(currency + $(e.currentTarget).val());
    },
    "change .exchange-rate-js": (e, ui) => {

        if (ui.isForeignEnabled.get() == true) {

            const targetCurrency = $('#sltCurrency').attr('currency-symbol') || getCurrentCurrencySymbol();
            const trs = $('.dynamic-converter-js');

            $(trs).each((index, tr) => {

                // convert to forign payment amount
                const valueToConvert = $(tr).find("input.linePaymentamount.convert-from").val();
                const convertedValue = convertToForeignAmount(valueToConvert, $('#exchange_rate').val(), getCurrentCurrencySymbol());

                $(tr).find('.linePaymentamount.convert-to').text(convertedValue);


                // Convert oustanding to foriegn oustanding
                const oustandingValueToConvert = $(tr).find('.lineOutstandingAmount.convert-from').text();
                const oustandingConvertedValue = convertToForeignAmount(oustandingValueToConvert, $('#exchange_rate').val(), getCurrentCurrencySymbol());
                $(tr).find('.lineOutstandingAmount.convert-to').text(oustandingConvertedValue);


            });

            // setTimeout(() => {

            //     const targetCurrency = $('#sltCurrency').attr('currency-symbol') || getCurrentCurrencySymbol();
            //     // convert to forign payment amount
            //     const valueToConvert = $(e.currentTarget).val();
            //     const convertedValue = convertToForeignAmount(valueToConvert, $('#exchange_rate').val(), getCurrentCurrencySymbol());

            //     $(e.currentTarget).parents(".dynamic-converter-js").find('.linePaymentamount.convert-to').text(convertedValue);

            //     // Convert oustanding to foriegn oustanding
            //     const oustandingValueToConvert = $(e.currentTarget).parents(".dynamic-converter-js").find('.lineOutstandingAmount.convert-from').text();
            //     const oustandingConvertedValue = convertToForeignAmount(oustandingValueToConvert, $('#exchange_rate').val(), getCurrentCurrencySymbol());
            //     $(e.currentTarget).parents(".dynamic-converter-js").find('.lineOutstandingAmount.convert-to').text(oustandingConvertedValue);

            //     const appliedValue = calculateAppliedWithForeign("#tblPaymentcard .linePaymentamount.convert-to.foreign");
            //     $('#edtApplied').val(targetCurrency +  appliedValue)
            //     $('.appliedAmount').text(targetCurrency + appliedValue);
            //     $('#edtForeignAmount').val(targetCurrency + appliedValue);
            //   }, 500);

        }

    },
    "change .dynamic-converter-js input.linePaymentamount.convert-from": (e, ui) => {

        if (ui.isForeignEnabled.get() == true) {
            setTimeout(() => {

                const targetCurrency = $('#sltCurrency').attr('currency-symbol') || getCurrentCurrencySymbol();
                // convert to forign payment amount
                const valueToConvert = $(e.currentTarget).val();
                const convertedValue = convertToForeignAmount(valueToConvert, $('#exchange_rate').val(), getCurrentCurrencySymbol());

                $(e.currentTarget).parents(".dynamic-converter-js").find('.linePaymentamount.convert-to').text(convertedValue);

                // Convert oustanding to foriegn oustanding
                const oustandingValueToConvert = $(e.currentTarget).parents(".dynamic-converter-js").find('.lineOutstandingAmount.convert-from').text();
                const oustandingConvertedValue = convertToForeignAmount(oustandingValueToConvert, $('#exchange_rate').val(), getCurrentCurrencySymbol());
                $(e.currentTarget).parents(".dynamic-converter-js").find('.lineOutstandingAmount.convert-to').text(oustandingConvertedValue);

                const appliedValue = calculateAppliedWithForeign("#tblPaymentcard .linePaymentamount.convert-to.foreign");
                $('#edtApplied').val(targetCurrency + appliedValue)
                $('.appliedAmount').text(targetCurrency + appliedValue);
                $('#edtForeignAmount').val(targetCurrency + appliedValue);
            }, 500);

        }


    },
    //   "change #tblPaymentcard input.linePaymentamount.convert-to.foreign": (e, ui) => {

    //     setTimeout(() => {
    //         const calculatedAppliedAmount = onForeignTableInputChange("#tblPaymentcard input.linePaymentamount.convert-to.foreign");
    //         const currency = $('#sltCurrency').attr("currency-symbol");

    //         $(e.currentTarget).val(currency + $(e.currentTarget).val().replace(/[^0-9.-]+/g, ""));

    //         $('#edtApplied').val(currency + calculatedAppliedAmount);
    //         $('.appliedAmount').text(currency + calculatedAppliedAmount);
    //     }, 500)
    // }
});
