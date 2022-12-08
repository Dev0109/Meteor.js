import {SalesBoardService} from './sales-service';
import {PurchaseBoardService} from './purchase-service';
import {ReactiveVar} from 'meteor/reactive-var';
import {UtilityService} from "../utility-service";
import {ProductService} from "../product/product-service";
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import {Random} from 'meteor/random';
import {jsPDF} from 'jspdf';
import 'jQuery.print/jQuery.print.js';
import 'jquery-editable-select';
import {SideBarService} from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import {ContactService} from "../contacts/contact-service";
import { OrganisationService } from '../js/organisation-service';
import { TaxRateService } from "../settings/settings-service";
import LoadingOverlay from '../LoadingOverlay';
import { saveCurrencyHistory } from '../packages/currency/CurrencyWidget';
import { convertToForeignAmount } from '../payments/paymentcard/supplierPaymentcard';
import { getCurrentCurrencySymbol } from '../popUps/currnecypopup';
import FxGlobalFunctions from '../packages/currency/FxGlobalFunctions';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let times = 0;
let clickedInput = "";
let isDropDown = false;
var template_list = [
    "Refunds"
];
var noHasTotals = ["Customer Payment", "Customer Statement", "Supplier Payment", "Statement", "Delivery Docket", "Journal Entry", "Deposit"];
let defaultCurrencyCode = CountryAbbr;


Template.refundcard.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.isForeignEnabled = new ReactiveVar(false);


    templateObject.records = new ReactiveVar();
    templateObject.CleintName = new ReactiveVar();
    templateObject.Department = new ReactiveVar();
    templateObject.Date = new ReactiveVar();
    templateObject.DueDate = new ReactiveVar();
    templateObject.InvoiceNo = new ReactiveVar();
    templateObject.RefNo = new ReactiveVar();
    templateObject.Branding = new ReactiveVar();
    templateObject.Currency = new ReactiveVar();
    templateObject.Total = new ReactiveVar();
    templateObject.Subtotal = new ReactiveVar();
    templateObject.TotalTax = new ReactiveVar();
    templateObject.invoicerecord = new ReactiveVar({});
    templateObject.taxrateobj = new ReactiveVar();
    templateObject.Accounts = new ReactiveVar([]);
    templateObject.InvoiceId = new ReactiveVar();
    templateObject.selectedCurrency = new ReactiveVar([]);
    templateObject.inputSelectedCurrency = new ReactiveVar([]);
    templateObject.currencySymbol = new ReactiveVar([]);
    templateObject.deptrecords = new ReactiveVar();
    templateObject.termrecords = new ReactiveVar();
    templateObject.clientrecords = new ReactiveVar([]);
    templateObject.taxraterecords = new ReactiveVar([]);
    templateObject.taxcodes = new ReactiveVar([]);
    templateObject.accountID = new ReactiveVar();
    templateObject.stripe_fee_method = new ReactiveVar();
    /* Attachments */
    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();
    templateObject.address = new ReactiveVar();
    templateObject.abn = new ReactiveVar();
    templateObject.referenceNumber = new ReactiveVar();
    templateObject.statusrecords = new ReactiveVar([]);
    templateObject.productextrasellrecords = new ReactiveVar([]);
    templateObject.defaultsaleterm = new ReactiveVar();
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
    templateObject.subtaxcodes = new ReactiveVar([]);

    setTimeout(function() {
        const x = window.matchMedia("(max-width: 1024px)");
        function mediaQuery(x) {
            if (x.matches) {
                $("#colInvnoReference").removeClass("col-auto");
                $("#colInvnoReference").addClass("col-6");
                $("#colTermsVia").removeClass("col-auto");
                $("#colTermsVia").addClass("col-6");
                $("#colStatusDepartment").removeClass("col-auto");
                $("#colStatusDepartment").addClass("col-6");
                $("#colBillingAddress").removeClass("col-auto");
                $("#colBillingAddress").addClass("col-6");
                $("#colOrderDue").removeClass("col-auto");
                $("#colOrderDue").addClass("col-6");
                $("#fieldwidth").removeClass("billaddressfield");
                $("#fieldwidth").addClass("billaddressfield2");
            }
        }
        mediaQuery(x);
        x.addListener(mediaQuery)
    }, 10);
    setTimeout(function() {
        const x = window.matchMedia("(max-width: 420px)");
        function mediaQuery(x) {
            if (x.matches) {
                $("#colInvnoReference").removeClass("col-auto");
                $("#colInvnoReference").addClass("col-12");
                $("#colTermsVia").removeClass("col-auto");
                $("#colTermsVia").addClass("col-12");
                $("#colStatusDepartment").removeClass("col-auto");
                $("#colStatusDepartment").addClass("col-12");
                $("#colBillingAddress").removeClass("col-auto");
                $("#colBillingAddress").addClass("col-12");
                $("#colOrderDue").removeClass("col-auto");
                $("#colOrderDue").addClass("col-12");
                $("#colSupplierName").removeClass("col-auto");
                $("#colSupplierName").addClass("col-12");
                $("#colSupplierEmail").removeClass("col-auto");
                $("#colSupplierEmail").addClass("col-12");
                $("#fieldwidth").removeClass("billaddressfield");
                $("#fieldwidth").addClass("billaddressfield2");
            }
        }
        mediaQuery(x);
        x.addListener(mediaQuery)
    }, 10);
});

Template.refundcard.onRendered(() => {


      $('#choosetemplate').attr('checked', true);


       $(window).on('load', function() {
            const win = $(this); //this = window
            if (win.width() <= 1024 && win.width() >= 450) {
                $("#colBalanceDue").addClass("order-12");
            }
            if (win.width() <= 926) {
                $("#totalSection").addClass("offset-md-6");
            }
        });
        let imageData = (localStorage.getItem("Image"));
        if (imageData) {
            $('.uploadedImage').attr('src', imageData);
        }

        const templateObject = Template.instance();
        const salesService = new SalesBoardService();
        const clientsService = new SalesBoardService();
        const accountService = new SalesBoardService();
        const contactService = new ContactService();

        $(document).on("click", ".templateItem .btnPreviewTemplate", function(e) {

            title = $(this).parent().attr("data-id");
            number =  $(this).parent().attr("data-template-id");//e.getAttribute("data-template-id");
            templateObject.generateInvoiceData(title,number);

        });

    const clientList = [];
    const deptrecords = [];
    const termrecords = [];
    const statusList = [];

    $("#date-input,#dtSODate,#dtDueDate").datepicker({
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



    // set initial table rest_data
    function init_reset_data() {

      let reset_data = [
        { index: 0, label: "Product Name", class: "ProductName", width: "300", active: true, display: true },
        { index: 1, label: "Description", class: "Description", width: "", active: true, display: true },
        { index: 2, label: "Qty", class: "Qty", width: "55", active: true, display: true },
        { index: 3, label: "Unit Price (Ex)", class: "UnitPriceEx", width: "152", active: true, display: true },
        { index: 4, label: "Unit Price (Inc)", class: "UnitPriceInc", width: "152", active: false, display: true },
        { index: 5, label: "Disc %", class: "Discount", width: "95", active: true, display: true },
        { index: 6, label: "Cost Price", class: "CostPrice", width: "110", active: false, display: true },
        { index: 7, label: "SalesLines CustField1", class: "SalesLinesCustField1", width: "110", active: false, display: true },
        { index: 8, label: "Tax Rate", class: "TaxRate", width: "95", active: false, display: true },
        { index: 9, label: "Tax Code", class: "TaxCode", width: "95", active: true, display: true },
        { index: 10, label: "Tax Amt", class: "TaxAmount", width: "95", active: true, display: true },
        { index: 11, label: "Serial/Lot No", class: "SerialNo", width: "124", active: true, display: true },
        { index: 12, label: "Amount (Ex)", class: "AmountEx", width: "140", active: true, display: true },
        { index: 13, label: "Amount (Inc)", class: "AmountInc", width: "140", active: false, display: true },
      ];

      let isBatchSerialNoTracking = Session.get("CloudShowSerial") || false;
      if(isBatchSerialNoTracking) {
        reset_data[11].display = true;
      } else {
        reset_data[11].display = false;
      }

      let templateObject = Template.instance();
      templateObject.reset_data.set(reset_data);
    }
    init_reset_data();
    // set initial table rest_data

        templateObject.getTemplateInfoNew = function(){
            LoadingOverlay.show();
            getVS1Data('TTemplateSettings').then(function(dataObject) {
              if (dataObject.length == 0) {
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                      addVS1Data('TTemplateSettings', JSON.stringify(data));

                      for (let i = 0; i < data.ttemplatesettings.length; i++) {


                            if(data.ttemplatesettings[i].fields.SettingName == 'Refunds')
                            {
                                if(data.ttemplatesettings[i].fields.Template == 1)
                                {
                                        $('input[name="Refunds_1"]').val(data.ttemplatesettings[i].fields.Description);
                                        if(data.ttemplatesettings[i].fields.Active == true)
                                        {
                                            $('#Refunds_1').attr('checked','checked');
                                        }

                                }
                                if(data.ttemplatesettings[i].fields.Template == 2)
                                {
                                        $('input[name="Refunds_2"]').val(data.ttemplatesettings[i].fields.Description);
                                        if(data.ttemplatesettings[i].fields.Active == true)
                                        {
                                        $('#Refunds_2').attr('checked','checked');
                                        }
                                }

                                if(data.ttemplatesettings[i].fields.Template == 3)
                                {
                                        $('input[name="Refunds_3"]').val(data.ttemplatesettings[i].fields.Description);
                                        if(data.ttemplatesettings[i].fields.Active == true)
                                        {
                                        $('#Refunds_3').attr('checked','checked');
                                        }
                                }


                            }


                     }


                      LoadingOverlay.hide();
                  }).catch(function (err) {
                    LoadingOverlay.hide();
                  });
              }else{
                      let data = JSON.parse(dataObject[0].data);

                      for (let i = 0; i < data.ttemplatesettings.length; i++) {


                        if(data.ttemplatesettings[i].fields.SettingName == 'Refunds')
                        {
                               if(data.ttemplatesettings[i].fields.Template == 1)
                               {
                                       $('input[name="Refunds_1"]').val(data.ttemplatesettings[i].fields.Description);
                                       if(data.ttemplatesettings[i].fields.Active == true)
                                       {
                                         $('#Refunds_1').attr('checked','checked');
                                       }

                               }
                               if(data.ttemplatesettings[i].fields.Template == 2)
                               {
                                     $('input[name="Refunds_2"]').val(data.ttemplatesettings[i].fields.Description);
                                     if(data.ttemplatesettings[i].fields.Active == true)
                                     {
                                       $('#Refunds_2').attr('checked','checked');
                                     }
                               }

                               if(data.ttemplatesettings[i].fields.Template == 3)
                               {
                                     $('input[name="Refunds_3"]').val(data.ttemplatesettings[i].fields.Description);
                                     if(data.ttemplatesettings[i].fields.Active == true)
                                     {
                                       $('#Refunds_3').attr('checked','checked');
                                     }
                               }


                        }



                     }
                      LoadingOverlay.hide();
              }
            }).catch(function(err) {
            sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                      addVS1Data('TTemplateSettings', JSON.stringify(data));

                      for (let i = 0; i < data.ttemplatesettings.length; i++) {



                         if(data.ttemplatesettings[i].fields.SettingName == 'Refunds')
                         {
                                if(data.ttemplatesettings[i].fields.Template == 1)
                                {
                                        $('input[name="Refunds_1"]').val(data.ttemplatesettings[i].fields.Description);
                                        if(data.ttemplatesettings[i].fields.Active == true)
                                        {
                                          $('#Refunds_1').attr('checked','checked');
                                        }

                                }
                                if(data.ttemplatesettings[i].fields.Template == 2)
                                {
                                      $('input[name="Refunds_2"]').val(data.ttemplatesettings[i].fields.Description);
                                      if(data.ttemplatesettings[i].fields.Active == true)
                                      {
                                        $('#Refunds_2').attr('checked','checked');
                                      }
                                }

                                if(data.ttemplatesettings[i].fields.Template == 3)
                                {
                                      $('input[name="Refunds_3"]').val(data.ttemplatesettings[i].fields.Description);
                                      if(data.ttemplatesettings[i].fields.Active == true)
                                      {
                                        $('#Refunds_3').attr('checked','checked');
                                      }
                                }


                         }






                      }
                      LoadingOverlay.hide();
            }).catch(function (err) {
              LoadingOverlay.hide();
            });
          });

          };

        templateObject.getTemplateInfoNew();






        templateObject.generateInvoiceData = function (template_title,number) {
            object_invoce = [];
            switch (template_title) {

            case "Refunds":
                showRefund1(template_title, number, false);
                break;
            }

        };


        function showRefund1(template_title, number, bprint) {

            var array_data = [];
            let lineItems = [];
            let taxItems = {};
            object_invoce = [];
            let item_invoices = '';

            let invoice_data = templateObject.invoicerecord.get();
            let stripe_id = templateObject.accountID.get() || '';
            let stripe_fee_method = templateObject.stripe_fee_method.get();
            var erpGet = erpDb();

            var customfield1 = $('#edtSaleCustField1').val() || '  ';
            var customfield2 = $('#edtSaleCustField2').val() || '  ';
            var customfield3 = $('#edtSaleCustField3').val() || '  ';

            var customfieldlabel1 = $('.lblCustomField1').first().text() || 'Custom Field 1';
            var customfieldlabel2 = $('.lblCustomField2').first().text() || 'Custom Field 2';
            var customfieldlabel3 = $('.lblCustomField3').first().text() || 'Custom Field 3';
            let balancedue = $('#totalBalanceDue').html() || 0;
            let tax = $('#subtotal_tax').html() || 0;
            let customer = $('#edtCustomerName').val();
            let name = $('#firstname').val();
            let surname = $('#lastname').val();
            let dept = $('#sltDept').val();
            let fx = $('#sltCurrency').val();
            var comment = $('#txaComment').val();
            var parking_instruction = $('#txapickmemo').val();
            var subtotal_tax = $('#subtotal_tax').html() || '$'+ 0;
            var total_paid = $('#totalPaidAmt').html() || '$'+ 0 ;
            var ref = $('#edtRef').val() || '-';
            var txabillingAddress = $('#txabillingAddress').val() || '';
            var dtSODate = $('#dtSODate').val();
            var subtotal_total = $('#subtotal_total').text() || '$'+ 0;
            var grandTotal = $('#grandTotal').text() || '$'+ 0;
            var duedate = $('#dtDueDate').val();
            var po = $('#ponumber').val() || '.';


             $('#tblInvoiceLine > tbody > tr').each(function () {

                var lineID = this.id;
                let tdproduct = $('#' + lineID + " .lineProductName").val();
                let tddescription = $('#' + lineID + " .lineProductDesc").text();
                let tdQty = $('#' + lineID + " .lineQty").val();
                let tdunitprice = $('#' + lineID + " .colUnitPriceExChange").val();
                let tdtaxrate = $('#' + lineID + " .lineTaxRate").text();
                let tdtaxCode = $('#' + lineID + " .lineTaxCode").val()||loggedTaxCodeSalesInc;
                let taxamount = $('#' + lineID + " .colTaxAmount").first().text();
                let tdlineamt = $('#' + lineID + " .colAmountInc").first().text();

                let targetRow = $('#' + lineID);
                let targetTaxCode = targetRow.find('.lineTaxCode').val();
                let qty = targetRow.find(".lineQty").val() || 0
                let price = targetRow.find('.colUnitPriceExChange').val() || 0;
                const taxDetail = templateObject.taxcodes.get().find((v) => v.CodeName === targetTaxCode);

                if (taxDetail) {
                    let priceTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, ""));
                    let taxTotal = priceTotal * parseFloat(taxDetail.Rate);
                    if (taxDetail.Lines) {
                        taxDetail.Lines.map((line) => {
                            let taxCode = line.SubTaxCode;
                            let amount = priceTotal * line.Percentage / 100;
                            if (taxItems[taxCode]) {
                                taxItems[taxCode] += amount;
                            }
                            else {
                                taxItems[taxCode] = amount;
                            }
                        });
                    }
                    else {
                        // taxItems[targetTaxCode] = taxTotal;
                    }
                }

                array_data.push([
                    tdproduct,
                    tddescription,
                    tdQty,
                    tdunitprice,
                    taxamount,
                    tdlineamt,
                ]);

                lineItemObj = {
                    description: tddescription || '',
                    quantity: tdQty || 0,
                    unitPrice: tdunitprice.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    }) || 0,
                    tax:tdtaxrate||0,
                    amount:tdlineamt || 0
                }
                 lineItems.push(lineItemObj);

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
                        title: 'Refund',
                        value:invoice_data.id,
                        date: dtSODate,
                        invoicenumber:invoice_data.id,
                        refnumber: ref,
                        pqnumber: po,
                        duedate: duedate,
                        paylink: "Pay Now",
                        supplier_type: "Customer",
                        supplier_name : customer,
                        supplier_addr : txabillingAddress,
                        fields: {
                            "Product Name": ["25", "left"],
                            "Description": ["30", "left"],
                            "Qty": ["10", "right"],
                            "Unit Price": ["10", "right"],
                            "Tax": ["10", "right"],
                            "Amount": ["15", "right"],
                        },
                        subtotal :subtotal_total,
                        gst : subtotal_tax,
                        total : grandTotal,
                        paid_amount : total_paid,
                        bal_due : balancedue,
                        bsb : Template.new_invoice.__helpers.get('vs1companyBankBSB').call(),
                        account : Template.new_invoice.__helpers.get('vs1companyBankAccountNo').call(),
                        swift : Template.new_invoice.__helpers.get('vs1companyBankSwiftCode').call(),
                        data: array_data,
                        customfield1:'NA',
                        customfield2:'NA',
                        customfield3:'NA',
                        customfieldlabel1:'NA',
                        customfieldlabel2:'NA',
                        customfieldlabel3:'NA',
                        applied : "",
                        showFX:"",
                        comment:comment,
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
                        title: 'Refund',
                        value:invoice_data.id,
                        date: dtSODate,
                        invoicenumber:invoice_data.id,
                        refnumber: ref,
                        pqnumber: po,
                        duedate: duedate,
                        paylink: "Pay Now",
                        supplier_type: "Customer",
                        supplier_name : customer,
                        supplier_addr : txabillingAddress,
                        fields: {
                            "Product Name": ["25", "left"],
                            "Description": ["30", "left"],
                            "Qty": ["10", "right"],
                            "Unit Price": ["10", "right"],
                            "Tax": ["10", "right"],
                            "Amount": ["15", "right"],
                        },
                        subtotal :subtotal_total,
                        gst : subtotal_tax,
                        total : grandTotal,
                        paid_amount : total_paid,
                        bal_due : balancedue,
                        bsb : Template.new_invoice.__helpers.get('vs1companyBankBSB').call(),
                        account : Template.new_invoice.__helpers.get('vs1companyBankAccountNo').call(),
                        swift : Template.new_invoice.__helpers.get('vs1companyBankSwiftCode').call(),
                        data: array_data,
                        customfield1:customfield1,
                        customfield2:customfield2,
                        customfield3:customfield3,
                        customfieldlabel1:customfieldlabel1,
                        customfieldlabel2:customfieldlabel2,
                        customfieldlabel3:customfieldlabel3,
                        applied : "",
                        showFX:"",
                        comment:comment,
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
                        title: 'Refund',
                        value:invoice_data.id,
                        date: dtSODate,
                        invoicenumber:invoice_data.id,
                        refnumber: ref,
                        pqnumber: po,
                        duedate: duedate,
                        paylink: "Pay Now",
                        supplier_type: "Customer",
                        supplier_name : customer,
                        supplier_addr : txabillingAddress,
                        fields: {
                            "Product Name": ["25", "left"],
                            "Description": ["30", "left"],
                            "Qty": ["10", "right"],
                            "Unit Price": ["10", "right"],
                            "Tax": ["10", "right"],
                            "Amount": ["15", "right"],
                        },
                        subtotal :subtotal_total,
                        gst : subtotal_tax,
                        total : grandTotal,
                        paid_amount : total_paid,
                        bal_due : balancedue,
                        bsb : Template.new_invoice.__helpers.get('vs1companyBankBSB').call(),
                        account : Template.new_invoice.__helpers.get('vs1companyBankAccountNo').call(),
                        swift : Template.new_invoice.__helpers.get('vs1companyBankSwiftCode').call(),
                        data: array_data,
                        customfield1:customfield1,
                        customfield2:customfield2,
                        customfield3:customfield3,
                        customfieldlabel1:customfieldlabel1,
                        customfieldlabel2:customfieldlabel2,
                        customfieldlabel3:customfieldlabel3,
                        applied : "",
                        showFX:fx,
                        comment:comment,
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

        function showRefund(template_title,number)
        {

            var array_data = [];
            let lineItems = [];
            let taxItems = {};
            object_invoce = [];
            let item_invoices = '';

            let invoice_data = templateObject.invoicerecord.get();
            let stripe_id = templateObject.accountID.get() || '';
            let stripe_fee_method = templateObject.stripe_fee_method.get();
            var erpGet = erpDb();

            var customfield1 = $('#edtSaleCustField1').val() || '  ';
            var customfield2 = $('#edtSaleCustField2').val() || '  ';
            var customfield3 = $('#edtSaleCustField3').val() || '  ';

            var customfieldlabel1 = $('.lblCustomField1').first().text() || 'Custom Field 1';
            var customfieldlabel2 = $('.lblCustomField2').first().text() || 'Custom Field 2';
            var customfieldlabel3 = $('.lblCustomField3').first().text() || 'Custom Field 3';
            let balancedue = $('#totalBalanceDue').html() || 0;
            let tax = $('#subtotal_tax').html() || 0;
            let customer = $('#edtCustomerName').val();
            let name = $('#firstname').val();
            let surname = $('#lastname').val();
            let dept = $('#sltDept').val();
            let fx = $('#sltCurrency').val();
            var comment = $('#txaComment').val();
            var parking_instruction = $('#txapickmemo').val();
            var subtotal_tax = $('#subtotal_tax').html() || '$'+ 0;
            var total_paid = $('#totalPaidAmt').html() || '$'+ 0 ;
            var ref = $('#edtRef').val() || '-';
            var txabillingAddress = $('#txabillingAddress').val() || '';
            var dtSODate = $('#dtSODate').val();
            var subtotal_total = $('#subtotal_total').text() || '$'+ 0;
            var grandTotal = $('#grandTotal').text() || '$'+ 0;
            var duedate = $('#dtDueDate').val();
            var po = $('#ponumber').val() || '.';


             $('#tblInvoiceLine > tbody > tr').each(function () {

                var lineID = this.id;
                let tdproduct = $('#' + lineID + " .lineProductName").val();
                let tddescription = $('#' + lineID + " .lineProductDesc").text();
                let tdQty = $('#' + lineID + " .lineQty").val();
                let tdunitprice = $('#' + lineID + " .colUnitPriceExChange").val();
                let tdtaxrate = $('#' + lineID + " .lineTaxRate").text();
                let tdtaxCode = $('#' + lineID + " .lineTaxCode").val()||loggedTaxCodeSalesInc;
                let taxamount = $('#' + lineID + " .colTaxAmount").text();
                let tdlineamt = $('#' + lineID + " .colAmountInc").text();

                let targetRow = $('#' + lineID);
                let targetTaxCode = targetRow.find('.lineTaxCode').val();
                let qty = targetRow.find(".lineQty").val() || 0
                let price = targetRow.find('.colUnitPriceExChange').val() || 0;
                const taxDetail = templateObject.taxcodes.get().find((v) => v.CodeName === targetTaxCode);

                if (taxDetail) {
                    let priceTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, ""));
                    let taxTotal = priceTotal * parseFloat(taxDetail.Rate);
                    if (taxDetail.Lines) {
                        taxDetail.Lines.map((line) => {
                            let taxCode = line.SubTaxCode;
                            let amount = priceTotal * line.Percentage / 100;
                            if (taxItems[taxCode]) {
                                taxItems[taxCode] += amount;
                            }
                            else {
                                taxItems[taxCode] = amount;
                            }
                        });
                    }
                    else {
                        // taxItems[targetTaxCode] = taxTotal;
                    }
                }

                array_data.push([
                    tdproduct,
                    tddescription,
                    tdQty,
                    tdunitprice,
                    taxamount,
                    tdlineamt,
                ]);

                lineItemObj = {
                    description: tddescription || '',
                    quantity: tdQty || 0,
                    unitPrice: tdunitprice.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    }) || 0,
                    tax:tdtaxrate||0,
                    amount:tdlineamt || 0
                }
                 lineItems.push(lineItemObj);

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
                        title: 'Invoice',
                        value:invoice_data.id,
                        date: dtSODate,
                        invoicenumber:invoice_data.id,
                        refnumber: ref,
                        pqnumber: po,
                        duedate: duedate,
                        paylink: "Pay Now",
                        supplier_type: "Customer",
                        supplier_name : customer,
                        supplier_addr : txabillingAddress,
                        fields: {"Product Name" : "30", "Description" : "30", "Qty" : "10", "Unit Price" : "10", "Tax" : "10", "Amount" : "10" },
                        subtotal :subtotal_total,
                        gst : subtotal_tax,
                        total : grandTotal,
                        paid_amount : total_paid,
                        bal_due : balancedue,
                        bsb : Template.new_invoice.__helpers.get('vs1companyBankBSB').call(),
                        account : Template.new_invoice.__helpers.get('vs1companyBankAccountNo').call(),
                        swift : Template.new_invoice.__helpers.get('vs1companyBankSwiftCode').call(),
                        data: array_data,
                        customfield1:'NA',
                        customfield2:'NA',
                        customfield3:'NA',
                        customfieldlabel1:'NA',
                        customfieldlabel2:'NA',
                        customfieldlabel3:'NA',
                        applied : "",
                        showFX:"",
                        comment:comment,
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
                        title: 'Invoice',
                        value:invoice_data.id,
                        date: dtSODate,
                        invoicenumber:invoice_data.id,
                        refnumber: ref,
                        pqnumber: po,
                        duedate: duedate,
                        paylink: "Pay Now",
                        supplier_type: "Customer",
                        supplier_name : customer,
                        supplier_addr : txabillingAddress,
                        fields: {"Product Name" : "30", "Description" : "30", "Qty" : "10", "Unit Price" : "10", "Tax" : "10", "Amount" : "10" },
                        subtotal :subtotal_total,
                        gst : subtotal_tax,
                        total : grandTotal,
                        paid_amount : total_paid,
                        bal_due : balancedue,
                        bsb : Template.new_invoice.__helpers.get('vs1companyBankBSB').call(),
                        account : Template.new_invoice.__helpers.get('vs1companyBankAccountNo').call(),
                        swift : Template.new_invoice.__helpers.get('vs1companyBankSwiftCode').call(),
                        data: array_data,
                        customfield1:customfield1,
                        customfield2:customfield2,
                        customfield3:customfield3,
                        customfieldlabel1:customfieldlabel1,
                        customfieldlabel2:customfieldlabel2,
                        customfieldlabel3:customfieldlabel3,
                        applied : "",
                        showFX:"",
                        comment:comment,
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
                        title: 'Invoice',
                        value:invoice_data.id,
                        date: dtSODate,
                        invoicenumber:invoice_data.id,
                        refnumber: ref,
                        pqnumber: po,
                        duedate: duedate,
                        paylink: "Pay Now",
                        supplier_type: "Customer",
                        supplier_name : customer,
                        supplier_addr : txabillingAddress,
                        fields: {"Product Name" : "30", "Description" : "30", "Qty" : "10", "Unit Price" : "10", "Tax" : "10", "Amount" : "10" },
                        subtotal :subtotal_total,
                        gst : subtotal_tax,
                        total : grandTotal,
                        paid_amount : total_paid,
                        bal_due : balancedue,
                        bsb : Template.new_invoice.__helpers.get('vs1companyBankBSB').call(),
                        account : Template.new_invoice.__helpers.get('vs1companyBankAccountNo').call(),
                        swift : Template.new_invoice.__helpers.get('vs1companyBankSwiftCode').call(),
                        data: array_data,
                        customfield1:customfield1,
                        customfield2:customfield2,
                        customfield3:customfield3,
                        customfieldlabel1:customfieldlabel1,
                        customfieldlabel2:customfieldlabel2,
                        customfieldlabel3:customfieldlabel3,
                        applied : "",
                        showFX:fx,
                        comment:comment,
                    };

                }

            item_invoices.taxItems = taxItems;

            object_invoce.push(item_invoices);

            $("#templatePreviewModal .field_payment").show();
            $("#templatePreviewModal .field_amount").show();
            updateTemplate(object_invoce);
            saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);

        }

        function loadTemplateBody1(object_invoce) {
            if (object_invoce[0]["taxItems"]) {

                let taxItems = object_invoce[0]["taxItems"];
                if(taxItems && Object.keys(taxItems).length>0) {
                    $("#templatePreviewModal #tax_list_print").html("");
                    Object.keys(taxItems).map((code) => {
                        let html = `
                            <div style="width: 100%; display: flex;">
                                <div style="padding-right: 16px; width: 50%;">
                                    <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
                                        ${code}</p>
                                </div>
                                <div style="padding-left: 16px; width: 50%;">
                                    <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
                                        $${taxItems[code].toFixed(3)}</p>
                                </div>
                            </div>
                        `;
                        $("#templatePreviewModal #tax_list_print").append(html);
                    });
                } else {
                    $("#templatePreviewModal #tax_list_print").remove();
                }
            }
            

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
                        html = html + "<td style='text-align: right;'>" + item_temp + "</td>";
                    else
                        html = html + "<td>" + item_temp + "</td>";
                    idx++;
                 }

                html +="</tr>";
                tbl_content.append(html);

             }

             if (noHasTotals.includes(object_invoce[0]["title"])) {
                $("#templatePreviewModal .field_amount").hide();
                $("#templatePreviewModal .field_payment").css("borderRight", "0px solid black");
            } else {
                $("#templatePreviewModal .field_amount").show();
                $("#templatePreviewModal .field_payment").css("borderRight", "1px solid black");
            }
            // total amount
            $('#templatePreviewModal #subtotal_total').text("Sub total");
            $("#templatePreviewModal #subtotal_totalPrint").text(object_invoce[0]["subtotal"]);
            $('#templatePreviewModal #grandTotal').text("Grand total");
            $("#templatePreviewModal #totalTax_totalPrint").text(object_invoce[0]["gst"]);
            $("#templatePreviewModal #grandTotalPrint").text(object_invoce[0]["total"]);
            $("#templatePreviewModal #totalBalanceDuePrint").text(object_invoce[0]["bal_due"]);
            $("#templatePreviewModal #paid_amount").text(object_invoce[0]["paid_amount"]);
        }

        function loadTemplateBody2(object_invoce) {
            if (object_invoce[0]["taxItems"]) {

                let taxItems = object_invoce[0]["taxItems"];
                if(taxItems && Object.keys(taxItems).length>0) {
                    $("#templatePreviewModal #tax_list_print").html("");
                    Object.keys(taxItems).map((code) => {
                        let html = `
                            <div style="width: 100%; display: flex;">
                                <div style="padding-right: 16px; width: 50%;">
                                    <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
                                        ${code}</p>
                                </div>
                                <div style="padding-left: 16px; width: 50%;">
                                    <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
                                        $${taxItems[code].toFixed(3)}</p>
                                </div>
                            </div>
                        `;
                        $("#templatePreviewModal #tax_list_print").append(html);
                    });
                } else {
                    $("#templatePreviewModal #tax_list_print").remove();
                }
            }
            

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
                        html = html + "<td style='text-align: right;'>" + item_temp + "</td>";
                    else
                        html = html + "<td>" + item_temp + "</td>";
                    idx++;
                 }

                html +="</tr>";
                tbl_content.append(html);

             }

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
            if (object_invoce[0]["taxItems"]) {

                let taxItems = object_invoce[0]["taxItems"];
                if(taxItems && Object.keys(taxItems).length>0) {
                    $("#templatePreviewModal #tax_list_print").html("");
                    Object.keys(taxItems).map((code) => {
                        let html = `
                            <div style="width: 100%; display: flex;">
                                <div style="padding-right: 16px; width: 50%;">
                                    <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
                                        ${code}</p>
                                </div>
                                <div style="padding-left: 16px; width: 50%;">
                                    <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
                                        $${taxItems[code].toFixed(3)}</p>
                                </div>
                            </div>
                        `;
                        $("#templatePreviewModal #tax_list_print").append(html);
                    });
                } else {
                    $("#templatePreviewModal #tax_list_print").remove();
                }
            }
            

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
                        html = html + "<td style='text-align: right;'>" + item_temp + "</td>";
                    else
                        html = html + "<td>" + item_temp + "</td>";
                    idx++;
                 }

                html +="</tr>";
                tbl_content.append(html);

             }

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

                if(object_invoce[0]["applied"] == ""){
                    $("#html-2-pdfwrapper_new .applied").hide()
                    $("#html-2-pdfwrapper_new .applied").text(object_invoce[0]["applied"]);
                }else{
                    $("#html-2-pdfwrapper_new .applied").show()
                    $("#html-2-pdfwrapper_new .applied").text("Applied : " +  object_invoce[0]["applied"]);
                }



                    if(object_invoce[0]["supplier_type"] == ""){
                        $("#html-2-pdfwrapper_new .customer").hide()
                    }else{
                        $("#html-2-pdfwrapper_new .customer").show()
                    }
                    $("#html-2-pdfwrapper_new .customer").empty();
                    $("#html-2-pdfwrapper_new .customer").append(object_invoce[0]["supplier_type"]);

                    if(object_invoce[0]["supplier_name"] == ""){
                        $("#html-2-pdfwrapper_new .pdfCustomerName").hide()
                    }else{
                        $("#html-2-pdfwrapper_new .pdfCustomerName").show()
                    }
                    $("#html-2-pdfwrapper_new .pdfCustomerName").empty();
                    $("#html-2-pdfwrapper_new .pdfCustomerName").append(object_invoce[0]["supplier_name"]);

                    if(object_invoce[0]["supplier_addr"] == ""){
                        $("#html-2-pdfwrapper_new .pdfCustomerAddress").hide()
                    }else{
                        $("#html-2-pdfwrapper_new .pdfCustomerAddress").show()
                    }
                    $("#html-2-pdfwrapper_new .pdfCustomerAddress").empty();
                    $("#html-2-pdfwrapper_new .pdfCustomerAddress").append(object_invoce[0]["supplier_addr"]);


                    $("#html-2-pdfwrapper_new .print-header").text(object_invoce[0]["title"]);

                    $("#templatePreviewModal .modal-title").text(
                        object_invoce[0]["title"] + " " +object_invoce[0]["value"]+ " template"
                    );

                    if(object_invoce[0]["value"]=="")
                    {
                        $('.print-header').text('');

                    }
                    else{
                       $('.print-header').text(object_invoce[0]["value"]);
                    }


                    if(object_invoce[0]["bsb"]=="")
                    {
                        $('#html-2-pdfwrapper_new .field_payment').hide();

                    }
                    else{

                        $('#html-2-pdfwrapper_new .field_payment').show();
                    }

                    $("#html-2-pdfwrapper_new .bsb").text( "BSB (Branch Number) : " + object_invoce[0]["bsb"]);
                    $("#html-2-pdfwrapper_new .account_number").text( "Account Number : " + object_invoce[0]["account"]);
                    $("#html-2-pdfwrapper_new .swift").text("Swift Code : " + object_invoce[0]["swift"]);


                    if(object_invoce[0]["date"] == ""){
                        $("#html-2-pdfwrapper_new .dateNumber").hide();
                    }else{
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

                    if(object_invoce[0]["pqnumber"] == ""){
                        $("#html-2-pdfwrapper_new .pdfPONumber").hide();
                    }else{
                        $("#html-2-pdfwrapper_new .pdfPONumber").show();
                    }

                    if(object_invoce[0]["customfield1"] == "NA")
                    {
                            $('#customfieldtablenew').css('display', 'none');
                            $('#customdatatablenew').css('display', 'none');
                            $('#html-2-pdfwrapper_new .customfield1').text('');
                            $('#html-2-pdfwrapper_new .customfield2').text('');
                            $('#html-2-pdfwrapper_new .customfield3').text('');


                            $('#html-2-pdfwrapper_new .customfield1data').text('');
                            $('#html-2-pdfwrapper_new .customfield2data').text('');
                            $('#html-2-pdfwrapper_new .customfield3data').text('');

                    }
                    else
                    {
                        $('#customfieldtablenew').css('display', 'block');
                        $('#customdatatablenew').css('display', 'block');

                        $('#html-2-pdfwrapper_new .customfield1').text(object_invoce[0]["customfieldlabel1"]);
                        $('#html-2-pdfwrapper_new .customfield2').text(object_invoce[0]["customfieldlabel2"]);
                        $('#html-2-pdfwrapper_new .customfield3').text(object_invoce[0]["customfieldlabel3"]);

                        if(object_invoce[0]["customfield1"] == '' || object_invoce[0]["customfield1"] == 0)
                        {
                            $('#html-2-pdfwrapper_new .customfield1data').text('');
                        }
                        else
                        {
                            $('#html-2-pdfwrapper_new .customfield1data').text(object_invoce[0]["customfield1"]);
                        }

                        if(object_invoce[0]["customfield2"] == '' || object_invoce[0]["customfield2"] == 0)
                        {
                            $('#html-2-pdfwrapper_new .customfield2data').text('');
                        }
                        else
                        {
                            $('#html-2-pdfwrapper_new .customfield2data').text( object_invoce[0]["customfield2"]);
                        }

                        if(object_invoce[0]["customfield3"] == '' || object_invoce[0]["customfield3"] == 0)
                        {
                            $('#html-2-pdfwrapper_new .customfield3data').text('');
                        }
                        else
                        {
                            $('#html-2-pdfwrapper_new .customfield3data').text(object_invoce[0]["customfield3"]);
                        }



                    }



            $("#html-2-pdfwrapper_new .po").text(object_invoce[0]["pqnumber"]);

            if(object_invoce[0]["invoicenumber"] == ""){
                $("#html-2-pdfwrapper_new .invoiceNumber").hide();
            }else{
                $("#html-2-pdfwrapper_new .invoiceNumber").show();
            }

            $("#html-2-pdfwrapper_new .io").text(object_invoce[0]["invoicenumber"]);

            if(object_invoce[0]["refnumber"] == ""){
                $("#html-2-pdfwrapper_new .refNumber").hide();
            }else{
                $("#html-2-pdfwrapper_new .refNumber").show();
            }
            $("#html-2-pdfwrapper_new .ro").text(object_invoce[0]["refnumber"]);

            if(object_invoce[0]["duedate"] == ""){
                $("#html-2-pdfwrapper_new .pdfTerms").hide();
            }else{
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

             if(object_invoce[0]["customfield1"] == "")
             {
                        $('#customfieldlable').css('display', 'none');
                        $('#customfieldlabledata').css('display', 'none');

             }
             else
             {
                        $('#customfieldlable').css('display', 'block');
                        $('#customfieldlabledata').css('display', 'block');
             }

            //   table header
            var tbl_header = $("#html-2-pdfwrapper_new .tbl_header")
            tbl_header.empty()

            var count = 0;
            for(const [key , value] of Object.entries(object_invoce[0]["fields"])){

                if(count == 0)
                {
                    tbl_header.append("<th style='width:200px;background:white;color:rgb(0,0,0);width:" + value + "%';>" + key + "</th>")
                }
                else if(count == 1)
                {
                    tbl_header.append("<th style='width:250px;background:white;color:rgb(0,0,0);width:" + value + "%';>" + key + "</th>")
                }
                else if(count == 2)
                {

                    tbl_header.append("<th style='text-align: right; width: 50px; background:white;color:rgb(0,0,0);width:" + value + "%';>" + key + "</th>")
                }
                else if(count == 3)
                {
                    tbl_header.append("<th style='text-align: right; width: 90px; background:white;color:rgb(0,0,0);width:" + value + "%';>" + key + "</th>")
                }
                else if(count == 4)
                {

                    tbl_header.append("<th style='text-align: right; width: 77px; background:white;color:rgb(0,0,0);width:" + value + "%';>" + key + "</th>")
                }
                else
                {

                    tbl_header.append("<th style='text-align: right; width: 100px; background:white;color:rgb(0,0,0);width:" + value + "%';>" + key + "</th>")
                }

                count++;
            }

            if (object_invoce[0]["taxItems"]) {
                let taxItems = object_invoce[0]["taxItems"];
                if(taxItems && Object.keys(taxItems).length>0) {
                    $("#html-2-pdfwrapper_new #tax_list_print").html("");
                    Object.keys(taxItems).map((code) => {
                        let html = `
                            <div style="width: 100%; display: flex;">
                                <div style="padding-right: 16px; width: 50%;">
                                    <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
                                        ${code}</p>
                                </div>
                                <div style="padding-left: 16px; width: 50%;">
                                    <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
                                        $${taxItems[code].toFixed(3)}</p>
                                </div>
                            </div>
                        `;
                        $("#html-2-pdfwrapper_new #tax_list_print").append(html);
                    });
                } else {
                    $("#html-2-pdfwrapper_new #tax_list_print").remove();
                }
            }
            
            }

            // table content
            var tbl_content = $("#html-2-pdfwrapper_new .tbl_content")
            tbl_content.empty()
            const data = object_invoce[0]["data"]

            for(item of data){

                 var html = '';
                 html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
                 var count = 0;
                 for(item_temp of item){

                    if(count > 1)
                    {

                            html = html + "<td style='text-align: right;'>" + item_temp + "</td>";


                    }
                    else
                    {
                        html = html + "<td>" + item_temp + "</td>";
                    }
                    count++

                 }

                html +="</tr>";
                tbl_content.append(html);

             }

            // total amount

            if(object_invoce[0]["subtotal"] == "")
            {
                $("#html-2-pdfwrapper_new .field_amount").hide();
            }
            else
            {
                $("#html-2-pdfwrapper_new .field_amount").show();

                if(object_invoce[0]["subtotal"] != ""){
                  $('#html-2-pdfwrapper_new #subtotal_total').text("Sub total");
                  $("#html-2-pdfwrapper_new #subtotal_totalPrint").text(object_invoce[0]["subtotal"]);
                }

                if(object_invoce[0]["gst"] != ""){
                    $('#html-2-pdfwrapper_new #grandTotal').text("Grand total");
                    $("#html-2-pdfwrapper_new #totalTax_totalPrint").text(object_invoce[0]["gst"]);
                }


                if(object_invoce[0]["total"] != ""){
                    $("#html-2-pdfwrapper_new #grandTotalPrint").text(object_invoce[0]["total"]);
                }

                if(object_invoce[0]["bal_due"] != ""){
                    $("#html-2-pdfwrapper_new #totalBalanceDuePrint").text(object_invoce[0]["bal_due"]);
                }

                if(object_invoce[0]["paid_amount"] != ""){
                    $("#html-2-pdfwrapper_new #paid_amount").text(object_invoce[0]["paid_amount"]);
                }

            }

        }
        function saveTemplateFields(key, value){
            localStorage.setItem(key, value)
        }



    $(document).ready(function() {
        $('#formCheck-one').click(function() {
            if ($(event.target).is(':checked')) {
                $('.checkbox1div').css('display', 'block');
            } else {
                $('.checkbox1div').css('display', 'none');
            }
        });
        $('#formCheck-two').click(function() {
            if ($(event.target).is(':checked')) {
                $('.checkbox2div').css('display', 'block');
            } else {
                $('.checkbox2div').css('display', 'none');
            }
        });

        $('.customField1Text').blur(function() {
            var inputValue1 = $('.customField1Text').text();
            $('.lblCustomField1').text(inputValue1);
        });

        $('.customField2Text').blur(function() {
            var inputValue2 = $('.customField2Text').text();
            $('.lblCustomField2').text(inputValue2);
        });
    });

    LoadingOverlay.show();
    templateObject.getAllClients = function () {
        getVS1Data('TCustomerVS1').then(function (dataObject) {
            if (dataObject.length === 0) {
            sideBarService.getAllCustomersDataVS1("All").then(function (data) {
                setClientVS1(data);
            });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setClientVS1(data);
            }
        }).catch(function (err) {
            sideBarService.getAllCustomersDataVS1("All").then(function (data) {
                setClientVS1(data);
            });
        });
    };
    function setClientVS1(data){
        for (let i in data.tcustomervs1) {
            if (data.tcustomervs1.hasOwnProperty(i)) {
              let customerrecordObj = {
                  customerid: data.tcustomervs1[i].fields.ID || ' ',
                  firstname: data.tcustomervs1[i].fields.FirstName || ' ',
                  lastname: data.tcustomervs1[i].fields.LastName || ' ',
                  customername: data.tcustomervs1[i].fields.ClientName || ' ',
                  customeremail: data.tcustomervs1[i].fields.Email || ' ',
                  street: data.tcustomervs1[i].fields.Street || ' ',
                  street2: data.tcustomervs1[i].fields.Street2 || ' ',
                  street3: data.tcustomervs1[i].fields.Street3 || ' ',
                  suburb: data.tcustomervs1[i].fields.Suburb || ' ',
                  statecode: data.tcustomervs1[i].fields.State + ' ' + data.tcustomervs1[i].fields.Postcode || ' ',
                  country: data.tcustomervs1[i].fields.Country || ' ',
                  termsName: data.tcustomervs1[i].fields.TermsName || '',
                  taxCode: data.tcustomervs1[i].fields.TaxCodeName || 'E',
                  clienttypename: data.tcustomervs1[i].fields.ClientTypeName || 'Default',
                  discount: data.tcustomervs1[i].fields.Discount || 0
              };
                clientList.push(customerrecordObj);
            }
        }
        templateObject.clientrecords.set(clientList);

        for (let i = 0; i < clientList.length; i++) {
            //$('#edtCustomerName').editableSelect('add', clientList[i].customername);
        }
        if (FlowRouter.current().queryParams.id || FlowRouter.current().queryParams.customerid) {

        } else {
            setTimeout(function() {
                $('#edtCustomerName').trigger("click");
            }, 200);
        }
    }
    templateObject.getAllClients();

    templateObject.getSalesCustomFieldsList= function () {
      return;
    };
    setTimeout(function(){
        templateObject.getSalesCustomFieldsList()
    },500);

    templateObject.getAllLeadStatuss = function() {
        getVS1Data('TLeadStatusType').then(function(dataObject) {
            if (dataObject.length == 0) {
                clientsService.getAllLeadStatus().then(function(data) {
                    for (let i in data.tleadstatustype) {
                        let leadrecordObj = {
                            orderstatus: data.tleadstatustype[i].TypeName || ' '

                        };

                        statusList.push(leadrecordObj);
                    }
                    templateObject.statusrecords.set(statusList);


                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tleadstatustype;
                for (let i in useData) {
                    let leadrecordObj = {
                        orderstatus: useData[i].TypeName || ' '

                    };

                    statusList.push(leadrecordObj);
                }
                templateObject.statusrecords.set(statusList);

            }
            setTimeout(function() {
                $('#sltStatus').append('<option value="newstatus">New Lead Status</option>');
            }, 1500)
        }).catch(function(err) {
            clientsService.getAllLeadStatus().then(function(data) {
                for (let i in data.tleadstatustype) {
                    let leadrecordObj = {
                        orderstatus: data.tleadstatustype[i].TypeName || ' '
                    };
                    statusList.push(leadrecordObj);
                }
                templateObject.statusrecords.set(statusList);
            });
        });
    };
    templateObject.getAllLeadStatuss();

    templateObject.getDepartments = function() {
        getVS1Data('TDeptClass').then(function(dataObject) {
            if (dataObject.length == 0) {
                salesService.getDepartment().then(function(data) {
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
        }).catch(function(err) {
            salesService.getDepartment().then(function(data) {
                for (let i in data.tdeptclass) {

                    let deptrecordObj = {
                        department: data.tdeptclass[i].DeptClassName || ' ',
                    };

                    deptrecords.push(deptrecordObj);
                    templateObject.deptrecords.set(deptrecords);

                }
            });
        });

    };
    templateObject.getDepartments();

    templateObject.getTerms = function () {
        getVS1Data('TTermsVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                salesService.getTermVS1().then(function (data) {
                    for (let i in data.ttermsvs1) {

                        let termrecordObj = {
                            termsname: data.ttermsvs1[i].TermsName || ' ',
                        };

                        if (data.ttermsvs1[i].isSalesdefault == true) {
                          Session.setPersistent('ERPTermsSales', data.ttermsvs1[i].TermsName||"COD");
                            templateObject.defaultsaleterm.set(data.ttermsvs1[i].TermsName);
                        }

                        termrecords.push(termrecordObj);
                        templateObject.termrecords.set(termrecords);

                    }
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.ttermsvs1;
                for (let i in useData) {

                    let termrecordObj = {
                        termsname: useData[i].TermsName || ' ',
                    };
                    if (useData[i].isSalesdefault == true) {
                        templateObject.defaultsaleterm.set(useData[i].TermsName);
                    }

                    termrecords.push(termrecordObj);
                    templateObject.termrecords.set(termrecords);

                }

            }
        }).catch(function (err) {

            salesService.getTermVS1().then(function (data) {
                for (let i in data.ttermsvs1) {

                    let termrecordObj = {
                        termsname: data.ttermsvs1[i].TermsName || ' ',
                    };
                    if (data.ttermsvs1[i].isSalesdefault == true) {
                      Session.setPersistent('ERPTermsSales', data.ttermsvs1[i].TermsName||"COD");
                        templateObject.defaultsaleterm.set(data.ttermsvs1[i].TermsName);
                    }
                    termrecords.push(termrecordObj);
                    templateObject.termrecords.set(termrecords);

                }
            });
        });

    };
    templateObject.getTerms();

    function getCustomerData(customerID) {
        getVS1Data('TCustomerVS1').then(function (dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneCustomerDataEx(customerID).then(function (data) {
                    setCustomerByID(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcustomervs1;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ID) === parseInt(customerID)) {
                        added = true;
                        setCustomerByID(useData[i]);
                    }
                }
                if (!added) {
                    contactService.getOneCustomerDataEx(customerID).then(function (data) {
                        setCustomerByID(data);
                    });
                }
            }
        }).catch(function (err) {
            contactService.getOneCustomerDataEx(customerID).then(function (data) {
                LoadingOverlay.hide();
                setCustomerByID(data);
            });
        });
    }
    function setCustomerByID(data){
        $('#edtCustomerName').val(data.fields.ClientName);
        $('#edtCustomerName').attr("custid", data.fields.ID);
        $('#edtCustomerEmail').val(data.fields.Email);
        $('#edtCustomerEmail').attr('customerid', data.fields.ID);
        $('#edtCustomerName').attr('custid', data.fields.ID);
        $('#edtCustomerEmail').attr('customerfirstname', data.fields.FirstName);
        $('#edtCustomerEmail').attr('customerlastname', data.fields.LastName);
        $('#customerType').text(data.fields.ClientTypeName || 'Default');
        $('#customerDiscount').text(data.fields.Discount + '%' || 0 + '%');
        $('#edtCustomerUseType').val(data.fields.ClientTypeName || 'Default');
        $('#edtCustomerUseDiscount').val(data.fields.Discount || 0);
        let postalAddress = data.fields.Companyname + '\n' + data.fields.Street + '\n' + data.fields.Street2 + ' ' + data.fields.State + ' ' + data.fields.Postcode + '\n' + data.fields.Country;
        $('#txabillingAddress').val(postalAddress);
        $('#pdfCustomerAddress').html(postalAddress);
        $('.pdfCustomerAddress').text(postalAddress);
        $('#txaShipingInfo').val(postalAddress);
        $('#sltTerms').val(data.fields.TermsName || templateObject.defaultsaleterm.get() ||'');
        let selectedTaxCodeName = data.fields.TaxCodeName || 'E';
        setCustomerInfo(selectedTaxCodeName);
    }


    templateObject.getOrganisationDetails = function() {
        let account_id = Session.get('vs1companyStripeID') || '';
        let stripe_fee = Session.get('vs1companyStripeFeeMethod') || 'apply';
        templateObject.accountID.set(account_id);
        templateObject.stripe_fee_method.set(stripe_fee);
    };

    const url = FlowRouter.current().path;
    if (url.indexOf('?id=') > 0) {
        const getso_id = url.split('?id=');
        let currentInvoice = getso_id[getso_id.length - 1];
        if (getso_id[1]) {
            currentInvoice = parseInt(currentInvoice);
            templateObject.getInvoiceData = function() {
              getVS1Data('TRefundSale').then(function (dataObject) {
                        if (dataObject.length == 0) {
                            let customerData = templateObject.clientrecords.get();
                      accountService.getRefundSales(currentInvoice).then(function(data) {
                    LoadingOverlay.hide();
                    let lineItems = [];
                    let lineItemObj = {};
                    let lineItemsTable = [];
                    let lineItemTableObj = {};
                    let exchangeCode = data.fields.ForeignExchangeCode;
                    let currencySymbol = Currency;
                    let total =  utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let totalInc =  utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmountInc).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let totalDiscount = utilityService.modifynegativeCurrencyFormat(data.fields.TotalDiscount).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let subTotal = utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let totalTax = utilityService.modifynegativeCurrencyFormat(data.fields.TotalTax).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let totalBalance = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let totalPaidAmount = utilityService.modifynegativeCurrencyFormat(data.fields.TotalPaid).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                  if(data.fields.Lines != null){
                    if (data.fields.Lines.length) {
                        for (let i = 0; i < data.fields.Lines.length; i++) {
                            let AmountGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let currencyAmountGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount);
                            let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
                            let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);
                            lineItemObj = {
                                lineID: Random.id(),
                                id: data.fields.Lines[i].fields.ID || '',
                                item: data.fields.Lines[i].fields.ProductName || '',
                                description: data.fields.Lines[i].fields.ProductDescription || '',
                                quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
                                unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                lineCost: currencySymbol + '' + data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                }) || 0,
                                taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                                taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
                                //TotalAmt: AmountGbp || 0,
                                curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                                TaxTotal: TaxTotalGbp || 0,
                                TaxRate: TaxRateGbp || 0,
                                DiscountPercent: data.fields.Lines[i].fields.DiscountPercent || 0
                            };
                            var dataListTable = [
                                data.fields.Lines[i].fields.ProductName || '',
                                data.fields.Lines[i].fields.ProductDescription || '',
                                "<div contenteditable='true' class='qty'>" + '' + data.fields.Lines[i].fields.UOMOrderQty + '' + "</div>" || "<div>" + '' + 0 + '' + "</div>",
                                "<div>" + '' + currencySymbol + '' + data.fields.Lines[i].fields.LinePrice.toFixed(2) + '' + "</div>" || currencySymbol + '' + 0.00,
                                data.fields.Lines[i].fields.LineTaxCode || '',
                                AmountGbp || currencySymbol + '' + 0.00,
                                '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
                            ];
                            lineItemsTable.push(dataListTable);
                            lineItems.push(lineItemObj);
                        }
                    } else {
                        let AmountGbp = data.fields.Lines.fields.TotalLineAmountInc.toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let currencyAmountGbp = currencySymbol + '' + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
                        let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines.fields.LineTaxTotal);
                        let TaxRateGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxRate;
                        lineItemObj = {
                            lineID: Random.id(),
                            id: data.fields.Lines.fields.ID || '',
                            description: data.fields.Lines.fields.ProductDescription || '',
                            quantity: data.fields.Lines.fields.UOMOrderQty || 0,
                            unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                            unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                            TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                            TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                            lineCost: data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            }) || 0,
                            taxRate: data.fields.Lines.fields.LineTaxRate || 0,
                            taxCode: data.fields.Lines.fields.LineTaxCode || '',
                            //TotalAmt: AmountGbp || 0,
                            curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                            TaxTotal: TaxTotalGbp || 0,
                            TaxRate: TaxRateGbp || 0
                        };
                        lineItems.push(lineItemObj);
                    }
                  }
                    let invoicerecord = {
                        id: data.fields.ID,
                        lid: 'Refund' + ' ' + data.fields.ID,
                        socustomer: data.fields.CustomerName,
                        salesOrderto: data.fields.InvoiceToDesc,
                        shipto: data.fields.ShipToDesc,
                        department: data.fields.SaleClassName,
                        docnumber: data.fields.DocNumber,
                        custPONumber: data.fields.CustPONumber,
                        saledate: data.fields.SaleDate ? moment(data.fields.SaleDate).format('DD/MM/YYYY') : "",
                        duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
                        employeename: data.fields.EmployeeName,
                        status: data.fields.SalesStatus,
                        category: data.fields.SalesCategory,
                        comments: data.fields.Comments,
                        pickmemo: data.fields.PickMemo,
                        ponumber: data.fields.CustPONumber,
                        via: data.fields.Shipping,
                        connote: data.fields.ConNote,
                        reference: data.fields.ReferenceNo,
                        currency: data.fields.ForeignExchangeCode,
                        branding: data.fields.MedType,
                        invoiceToDesc: data.fields.InvoiceToDesc,
                        shipToDesc: data.fields.ShipToDesc,
                        termsName: data.fields.TermsName,
                        Total: totalInc,
                        TotalDiscount: totalDiscount,
                        LineItems: lineItems,
                        TotalTax: totalTax,
                        SubTotal: subTotal,
                        balanceDue: totalBalance,
                        saleCustField1: data.fields.SaleCustField1,
                        saleCustField2: data.fields.SaleCustField2,
                        totalPaid: totalPaidAmount,
                        ispaid: data.fields.IsPaid
                    };

                    $('#edtCustomerName').val(data.fields.CustomerName);
                    $('#sltTerms').val(data.fields.TermsName);
                    $('#sltDept').val(data.fields.SaleClassName);
                    $('#sltStatus').val(data.fields.SalesStatus);
                    templateObject.CleintName.set(data.fields.CustomerName);
                    $('#sltCurrency').val(data.fields.ForeignExchangeCode);
                    $('#exchange_rate').val(data.fields.ForeignExchangeRate);
                    $('#sltPaymentMethod').val(data.fields.PayMethod);

                    // tempcode
                    // setTimeout(function () {
                    //   $('#edtSaleCustField1').val(data.fields.SaleCustField1);
                    //   $('#edtSaleCustField2').val(data.fields.SaleCustField2);
                    //   $('#edtSaleCustField3').val(data.fields.SaleCustField3);
                    // }, 2500);
                    /* START attachment */
                    templateObject.attachmentCount.set(0);
                    if (data.fields.Attachments) {
                        if (data.fields.Attachments.length) {
                            templateObject.attachmentCount.set(data.fields.Attachments.length);
                            templateObject.uploadedFiles.set(data.fields.Attachments);
                        }
                    }
                    /* END  attachment */
                    var checkISCustLoad = false;
                    setTimeout(function() {
                        if (clientList) {
                            for (var i = 0; i < clientList.length; i++) {
                                if (clientList[i].customername == data.fields.CustomerName) {
                                    checkISCustLoad = true;
                                    invoicerecord.firstname = clientList[i].firstname || '';
                                    invoicerecord.lastname = clientList[i].lastname || '';
                                    templateObject.invoicerecord.set(invoicerecord);
                                    $('#edtCustomerEmail').val(clientList[i].customeremail);
                                    $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                                    $('#edtCustomerName').attr('custid', clientList[i].customerid);
                                    $('#edtCustomerEmail').attr('customerfirstname', clientList[i].firstname);
                                    $('#edtCustomerEmail').attr('customerlastname', clientList[i].lastname);
                                    $('#customerType').text(clientList[i].clienttypename || 'Default');
                                    $('#customerDiscount').text(clientList[i].discount + '%' || 0 + '%');
                                    $('#edtCustomerUseType').val(clientList[i].clienttypename || 'Default');
                                    $('#edtCustomerUseDiscount').val(clientList[i].discount || 0);
                                }
                            }
                        };

                        if (data.fields.IsPaid === true) {
                            $('#edtCustomerName').attr('readonly', true);
                            $('.btn-primary').attr('disabled', 'disabled');

                            $('#btnCopyInvoice').attr('disabled', 'disabled');
                            $('#edtCustomerName').css('background-color', '#eaecf4');

                            $('#btnViewPayment').removeAttr('disabled', 'disabled');
                            $('.btnSave').attr('disabled', 'disabled');
                            $('#btnBack').removeAttr('disabled', 'disabled');
                            $('.printConfirm').removeAttr('disabled', 'disabled');
                            $('.tblInvoiceLine tbody tr').each(function() {
                                var $tblrow = $(this);
                                $tblrow.find("td").attr('contenteditable', false);
                                //$tblrow.find("td").removeClass("lineProductName");
                                $tblrow.find("td").removeClass("lineTaxRate");
                                $tblrow.find("td").removeClass("lineTaxCode");

                                $tblrow.find("td").attr('readonly', true);
                                $tblrow.find("td").attr('disabled', 'disabled');
                                $tblrow.find("td").css('background-color', '#eaecf4');
                                $tblrow.find("td .table-remove").removeClass("btnRemove");
                            });
                        }

                        if (!checkISCustLoad) {
                            sideBarService.getCustomersDataByName(useData[d].fields.CustomerName).then(function(dataClient) {
                                for (var c = 0; c < dataClient.tcustomervs1.length; c++) {
                                    var customerrecordObj = {
                                        customerid: dataClient.tcustomervs1[c].Id || ' ',
                                        firstname: dataClient.tcustomervs1[c].FirstName || ' ',
                                        lastname: dataClient.tcustomervs1[c].LastName || ' ',
                                        customername: dataClient.tcustomervs1[c].ClientName || ' ',
                                        customeremail: dataClient.tcustomervs1[c].Email || ' ',
                                        street: dataClient.tcustomervs1[c].Street || ' ',
                                        street2: dataClient.tcustomervs1[c].Street2 || ' ',
                                        street3: dataClient.tcustomervs1[c].Street3 || ' ',
                                        suburb: dataClient.tcustomervs1[c].Suburb || ' ',
                                        statecode: dataClient.tcustomervs1[c].State + ' ' + dataClient.tcustomervs1[c].Postcode || ' ',
                                        country: dataClient.tcustomervs1[c].Country || ' ',
                                        termsName: dataClient.tcustomervs1[c].TermsName || '',
                                        taxCode: dataClient.tcustomervs1[c].TaxCodeName || 'E',
                                        clienttypename: dataClient.tcustomervs1[c].ClientTypeName || 'Default'
                                    };
                                    clientList.push(customerrecordObj);

                                    invoicerecord.firstname = dataClient.tcustomervs1[c].FirstName || '';
                                    invoicerecord.lastname = dataClient.tcustomervs1[c].LastName || '';
                                    $('#edtCustomerEmail').val(dataClient.tcustomervs1[c].Email);
                                    $('#edtCustomerEmail').attr('customerid', clientList[c].customerid);
                                    $('#edtCustomerName').attr('custid', dataClient.tcustomervs1[c].Id);
                                    $('#edtCustomerEmail').attr('customerfirstname', dataClient.tcustomervs1[c].FirstName);
                                    $('#edtCustomerEmail').attr('customerlastname', dataClient.tcustomervs1[c].LastName);
                                    $('#customerType').text(dataClient.tcustomervs1[c].ClientTypeName || 'Default');
                                    $('#customerDiscount').text(dataClient.tcustomervs1[c].Discount + '%' || 0 + '%');
                                    $('#edtCustomerUseType').val(dataClient.tcustomervs1[c].ClientTypeName || 'Default');
                                    $('#edtCustomerUseDiscount').val(dataClient.tcustomervs1[c].Discount || 0);
                                }

                                templateObject.clientrecords.set(clientList.sort(function(a, b) {
                                    if (a.customername == 'NA') {
                                        return 1;
                                    } else if (b.customername == 'NA') {
                                        return -1;
                                    }
                                    return (a.customername.toUpperCase() > b.customername.toUpperCase()) ? 1 : -1;
                                }));
                            });
                        }
                    }, 100);


                    templateObject.invoicerecord.set(invoicerecord);

                    templateObject.selectedCurrency.set(invoicerecord.currency);
                    templateObject.inputSelectedCurrency.set(invoicerecord.currency);
                    if (templateObject.invoicerecord.get()) {
                        Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblInvoiceLine', function(error, result) {
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
                                        } else if (hiddenColumn == false) {
                                            $("." + columnClass + "").removeClass('hiddenColumn');
                                            $("." + columnClass + "").addClass('showColumn');
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
                    LoadingOverlay.hide();

                });
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.trefundsale;
                            let customerData = templateObject.clientrecords.get();

                            var added = false;
                            for (let d = 0; d < useData.length; d++) {
                                if (parseInt(useData[d].fields.ID) === currentInvoice) {
                                    added = true;
                                    LoadingOverlay.hide();
                                    let lineItems = [];
                                    let lineItemObj = {};
                                    let lineItemsTable = [];
                                    let lineItemTableObj = {};
                                    let exchangeCode = useData[d].fields.ForeignExchangeCode;
                                    let currencySymbol = Currency;
                                    let total = currencySymbol + '' + useData[d].fields.TotalAmount.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    let totalInc = currencySymbol + '' + useData[d].fields.TotalAmountInc.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    let totalDiscount = currencySymbol + '' + useData[d].fields.TotalDiscount.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });

                                    let subTotal = currencySymbol + '' + useData[d].fields.TotalAmount.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    let totalTax = currencySymbol + '' + useData[d].fields.TotalTax.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    let totalBalance = utilityService.modifynegativeCurrencyFormat(useData[d].fields.TotalBalance).toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });

                                    let totalPaidAmount = currencySymbol + '' + useData[d].fields.TotalPaid.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });

                                    if (useData[d].fields.Lines.length) {
                                        for (let i = 0; i < useData[d].fields.Lines.length; i++) {
                                            let AmountGbp = currencySymbol + '' + useData[d].fields.Lines[i].fields.TotalLineAmount.toLocaleString(undefined, {
                                                minimumFractionDigits: 2
                                            });
                                            let currencyAmountGbp = currencySymbol + '' + useData[d].fields.Lines[i].fields.TotalLineAmount.toFixed(2);
                                            let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineTaxTotal);
                                            let TaxRateGbp = (useData[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);
                                            lineItemObj = {
                                                lineID: Random.id(),
                                                id: useData[d].fields.Lines[i].fields.ID || '',
                                                item: useData[d].fields.Lines[i].fields.ProductName || '',
                                                description: useData[d].fields.Lines[i].fields.ProductDescription || '',
                                                quantity: useData[d].fields.Lines[i].fields.UOMOrderQty || 0,
                                                qtyordered: useData[d].fields.Lines[i].fields.UOMOrderQty || 0,
                                                qtyshipped: useData[d].fields.Lines[i].fields.UOMQtyShipped || 0,
                                                qtybo: useData[d].fields.Lines[i].fields.UOMQtyBackOrder || 0,
                                                unitPrice: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                                unitPriceInc: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                                TotalAmt: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                                TotalAmtInc: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                                lineCost: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineCost).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2
                                                }) || 0,
                                                taxRate: (useData[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                                                taxCode: useData[d].fields.Lines[i].fields.LineTaxCode || '',
                                                //TotalAmt: AmountGbp || 0,
                                                curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                                                TaxTotal: TaxTotalGbp || 0,
                                                TaxRate: TaxRateGbp || 0,
                                                DiscountPercent: useData[d].fields.Lines[i].fields.DiscountPercent || 0,
                                                pqaseriallotdata: useData[d].fields.Lines[i].fields.PQA || '',

                                            };
                                            var dataListTable = [
                                                useData[d].fields.Lines[i].fields.ProductName || '',
                                                useData[d].fields.Lines[i].fields.ProductDescription || '',
                                                "<div contenteditable='true' class='qty'>" + '' + useData[d].fields.Lines[i].fields.UOMOrderQty + '' + "</div>" || "<div>" + '' + 0 + '' + "</div>",
                                                "<div>" + '' + currencySymbol + '' + useData[d].fields.Lines[i].fields.LinePrice.toFixed(2) + '' + "</div>" || currencySymbol + '' + 0.00,
                                                useData[d].fields.Lines[i].fields.LineTaxCode || '',
                                                AmountGbp || currencySymbol + '' + 0.00,
                                                '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
                                            ];
                                            lineItemsTable.push(dataListTable);
                                            lineItems.push(lineItemObj);
                                        }
                                    } else {
                                        let AmountGbp = useData[d].fields.Lines.fields.TotalLineAmountInc.toLocaleString(undefined, {
                                            minimumFractionDigits: 2
                                        });
                                        let currencyAmountGbp = currencySymbol + '' + useData[d].fields.Lines.fields.TotalLineAmount.toFixed(2);
                                        let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines.fields.LineTaxTotal);
                                        let TaxRateGbp = currencySymbol + '' + useData[d].fields.Lines.fields.LineTaxRate;
                                        lineItemObj = {
                                            lineID: Random.id(),
                                            id: useData[d].fields.Lines.fields.ID || '',
                                            description: useData[d].fields.Lines.fields.ProductDescription || '',
                                            quantity: useData[d].fields.Lines.fields.UOMOrderQty || 0,
                                            unitPrice: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                            unitPriceInc: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                            TotalAmt: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                            TotalAmtInc: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                            lineCost: useData[d].fields.Lines.fields.LineCost.toLocaleString(undefined, {
                                                minimumFractionDigits: 2
                                            }) || 0,
                                            taxRate: useData[d].fields.Lines.fields.LineTaxRate || 0,
                                            taxCode: useData[d].fields.Lines.fields.LineTaxCode || '',
                                            //TotalAmt: AmountGbp || 0,
                                            curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                                            TaxTotal: TaxTotalGbp || 0,
                                            TaxRate: TaxRateGbp || 0,
                                            DiscountPercent: useData[d].fields.Lines.fields.DiscountPercent || 0,
                                            pqaseriallotdata: useData[d].fields.Lines.fields.PQA || '',
                                        };
                                        lineItems.push(lineItemObj);
                                    }

                                    let invoicerecord = {
                                        id: useData[d].fields.ID,
                                        lid: 'Refund' + ' ' + useData[d].fields.ID,
                                        socustomer: useData[d].fields.CustomerName,
                                        salesOrderto: useData[d].fields.InvoiceToDesc,
                                        shipto: useData[d].fields.ShipToDesc,
                                        department: useData[d].fields.SaleClassName,
                                        docnumber: useData[d].fields.DocNumber,
                                        custPONumber: useData[d].fields.CustPONumber,
                                        saledate: useData[d].fields.SaleDate ? moment(useData[d].fields.SaleDate).format('DD/MM/YYYY') : "",
                                        duedate: useData[d].fields.DueDate ? moment(useData[d].fields.DueDate).format('DD/MM/YYYY') : "",
                                        employeename: useData[d].fields.EmployeeName,
                                        status: useData[d].fields.SalesStatus,
                                        category: useData[d].fields.SalesCategory,
                                        comments: useData[d].fields.Comments,
                                        pickmemo: useData[d].fields.PickMemo,
                                        ponumber: useData[d].fields.CustPONumber,
                                        via: useData[d].fields.Shipping,
                                        connote: useData[d].fields.ConNote,
                                        reference: useData[d].fields.ReferenceNo,
                                        currency: useData[d].fields.ForeignExchangeCode,
                                        branding: useData[d].fields.MedType,
                                        invoiceToDesc: useData[d].fields.InvoiceToDesc,
                                        shipToDesc: useData[d].fields.ShipToDesc,
                                        termsName: useData[d].fields.TermsName,
                                        Total: totalInc,
                                        TotalDiscount: totalDiscount,
                                        LineItems: lineItems,
                                        TotalTax: totalTax,
                                        SubTotal: subTotal,
                                        balanceDue: totalBalance,
                                        saleCustField1: useData[d].fields.SaleCustField1,
                                        saleCustField2: useData[d].fields.SaleCustField2,
                                        totalPaid: totalPaidAmount,
                                        ispaid: useData[d].fields.IsPaid
                                    };

                                    $('#edtCustomerName').val(useData[d].fields.CustomerName);
                                    $('#sltTerms').val(useData[d].fields.TermsName);
                                    $('#sltDept').val(useData[d].fields.SaleClassName);
                                    $('#sltCurrency').val(useData[d].fields.ForeignExchangeCode);
                                    $('#sltStatus').val(useData[d].fields.SalesStatus);
                                    templateObject.CleintName.set(useData[d].fields.CustomerName);
                                    $('#sltCurrency').val(useData[d].fields.ForeignExchangeCode);
                                    $('#sltPaymentMethod').val(useData[d].fields.PayMethod);

                    // tempcode
                                    // setTimeout(function () {
                                    //   $('#edtSaleCustField1').val(useData[d].fields.SaleCustField1);
                                    //   $('#edtSaleCustField2').val(useData[d].fields.SaleCustField2);
                                    //   $('#edtSaleCustField3').val(useData[d].fields.SaleCustField3);
                                    // }, 2500);

                                    /* START attachment */
                                    templateObject.attachmentCount.set(0);
                                    if (useData[d].fields.Attachments) {
                                        if (useData[d].fields.Attachments.length) {
                                            templateObject.attachmentCount.set(useData[d].fields.Attachments.length);
                                            templateObject.uploadedFiles.set(useData[d].fields.Attachments);
                                        }
                                    }
                                    /* END  attachment */
                                    var checkISCustLoad = false;
                                    setTimeout(function () {
                                        if (clientList) {
                                            for (var i = 0; i < clientList.length; i++) {
                                                if (clientList[i].customername == useData[d].fields.CustomerName) {
                                                    checkISCustLoad = true;
                                                    invoicerecord.firstname = clientList[i].firstname || '';
                                                    invoicerecord.lastname = clientList[i].lastname || '';
                                                    templateObject.invoicerecord.set(invoicerecord);
                                                    $('#edtCustomerEmail').val(clientList[i].customeremail);
                                                    $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                                                    $('#edtCustomerName').attr('custid', clientList[i].customerid);
                                                    $('#edtCustomerEmail').attr('customerfirstname', clientList[i].firstname);
                                                    $('#edtCustomerEmail').attr('customerlastname', clientList[i].lastname);
                                                    $('#customerType').text(clientList[i].clienttypename || 'Default');
                                                    $('#customerDiscount').text(clientList[i].discount + '%' || 0 + '%');
                                                    $('#edtCustomerUseType').val(clientList[i].clienttypename || 'Default');
                                                    $('#edtCustomerUseDiscount').val(clientList[i].discount || 0);
                                                }
                                            }
                                        }

                                        if (useData[d].fields.IsPaid === true) {
                                            $('#edtCustomerName').attr('readonly', true);

                                            $('.btn-primary').attr('disabled', 'disabled');
                                            $('#edtCustomerName').css('background-color', '#eaecf4');

                                            $('#btnViewPayment').removeAttr('disabled', 'disabled');
                                            $('.btnSave').attr('disabled', 'disabled');
                                            $('#btnBack').removeAttr('disabled', 'disabled');
                                            $('.printConfirm').removeAttr('disabled', 'disabled');
                                            $('.tblInvoiceLine tbody tr').each(function () {
                                                var $tblrow = $(this);
                                                $tblrow.find("td").attr('contenteditable', false);
                                                //$tblrow.find("td").removeClass("lineProductName");
                                                $tblrow.find("td").removeClass("lineTaxRate");
                                                $tblrow.find("td").removeClass("lineTaxCode");

                                                $tblrow.find("td").attr('readonly', true);
                                                $tblrow.find("td").attr('disabled', 'disabled');
                                                $tblrow.find("td").css('background-color', '#eaecf4');
                                                $tblrow.find("td .table-remove").removeClass("btnRemove");
                                            });
                                        }

                                        if (!checkISCustLoad) {
                                            sideBarService.getCustomersDataByName(useData[d].fields.CustomerName).then(function (dataClient) {

                                                for (var c = 0; c < dataClient.tcustomervs1.length; c++) {

                                                    var customerrecordObj = {
                                                        customerid: dataClient.tcustomervs1[c].Id || ' ',
                                                        firstname: dataClient.tcustomervs1[c].FirstName || ' ',
                                                        lastname: dataClient.tcustomervs1[c].LastName || ' ',
                                                        customername: dataClient.tcustomervs1[c].ClientName || ' ',
                                                        customeremail: dataClient.tcustomervs1[c].Email || ' ',
                                                        street: dataClient.tcustomervs1[c].Street || ' ',
                                                        street2: dataClient.tcustomervs1[c].Street2 || ' ',
                                                        street3: dataClient.tcustomervs1[c].Street3 || ' ',
                                                        suburb: dataClient.tcustomervs1[c].Suburb || ' ',
                                                        statecode: dataClient.tcustomervs1[c].State + ' ' + dataClient.tcustomervs1[c].Postcode || ' ',
                                                        country: dataClient.tcustomervs1[c].Country || ' ',
                                                        termsName: dataClient.tcustomervs1[c].TermsName || '',
                                                        taxCode: dataClient.tcustomervs1[c].TaxCodeName || 'E',
                                                        clienttypename: dataClient.tcustomervs1[c].ClientTypeName || 'Default',
                                                        discount: dataClient.tcustomervs1[c].Discount || 0
                                                    };
                                                    clientList.push(customerrecordObj);

                                                    invoicerecord.firstname = dataClient.tcustomervs1[c].FirstName || '';
                                                    invoicerecord.lastname = dataClient.tcustomervs1[c].LastName || '';
                                                    $('#edtCustomerEmail').val(dataClient.tcustomervs1[c].Email);
                                                    $('#edtCustomerEmail').attr('customerid', clientList[c].customerid);
                                                    $('#edtCustomerName').attr('custid', dataClient.tcustomervs1[c].Id);
                                                    $('#edtCustomerEmail').attr('customerfirstname', dataClient.tcustomervs1[c].FirstName);
                                                    $('#edtCustomerEmail').attr('customerlastname', dataClient.tcustomervs1[c].LastName);
                                                    $('#customerType').text(dataClient.tcustomervs1[c].ClientTypeName || 'Default');
                                                    $('#customerDiscount').text(dataClient.tcustomervs1[c].Discount + '%' || 0 + '%');
                                                    $('#edtCustomerUseType').val(dataClient.tcustomervs1[c].ClientTypeName || 'Default');
                                                    $('#edtCustomerUseDiscount').val(dataClient.tcustomervs1[c].Discount || 0);
                                                }

                                                templateObject.clientrecords.set(clientList.sort(function (a, b) {
                                                        if (a.customername == 'NA') {
                                                            return 1;
                                                        } else if (b.customername == 'NA') {
                                                            return -1;
                                                        }
                                                        return (a.customername.toUpperCase() > b.customername.toUpperCase()) ? 1 : -1;
                                                    }));
                                            });
                                        }

                                    }, 100);

                                    templateObject.invoicerecord.set(invoicerecord);

                                    templateObject.selectedCurrency.set(invoicerecord.currency);
                                    templateObject.inputSelectedCurrency.set(invoicerecord.currency);
                                    if (templateObject.invoicerecord.get()) {

                                        Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblInvoiceLine', function (error, result) {
                                            if (error) {}
                                            else {
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
                                                        } else if (hiddenColumn == false) {
                                                            $("." + columnClass + "").removeClass('hiddenColumn');
                                                            $("." + columnClass + "").addClass('showColumn');

                                                        }

                                                    }
                                                }

                                            }
                                        });
                                    }
                                }
                            }
                            if (!added) {
                      accountService.getRefundSales(currentInvoice).then(function(data) {
                    LoadingOverlay.hide();
                    let lineItems = [];
                    let lineItemObj = {};
                    let lineItemsTable = [];
                    let lineItemTableObj = {};
                    let exchangeCode = data.fields.ForeignExchangeCode;
                    let currencySymbol = Currency;
                    let total =  utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let totalInc =  utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmountInc).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let totalDiscount = utilityService.modifynegativeCurrencyFormat(data.fields.TotalDiscount).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let subTotal = utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let totalTax = utilityService.modifynegativeCurrencyFormat(data.fields.TotalTax).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let totalBalance = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let totalPaidAmount = utilityService.modifynegativeCurrencyFormat(data.fields.TotalPaid).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                  if(data.fields.Lines != null){
                    if (data.fields.Lines.length) {
                        for (let i = 0; i < data.fields.Lines.length; i++) {
                            let AmountGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let currencyAmountGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount);
                            let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
                            let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);
                            lineItemObj = {
                                lineID: Random.id(),
                                id: data.fields.Lines[i].fields.ID || '',
                                item: data.fields.Lines[i].fields.ProductName || '',
                                description: data.fields.Lines[i].fields.ProductDescription || '',
                                quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
                                unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                lineCost: currencySymbol + '' + data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                }) || 0,
                                taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                                taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
                                //TotalAmt: AmountGbp || 0,
                                curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                                TaxTotal: TaxTotalGbp || 0,
                                TaxRate: TaxRateGbp || 0,
                                DiscountPercent: data.fields.Lines[i].fields.DiscountPercent || 0
                            };
                            var dataListTable = [
                                data.fields.Lines[i].fields.ProductName || '',
                                data.fields.Lines[i].fields.ProductDescription || '',
                                "<div contenteditable='true' class='qty'>" + '' + data.fields.Lines[i].fields.UOMOrderQty + '' + "</div>" || "<div>" + '' + 0 + '' + "</div>",
                                "<div>" + '' + currencySymbol + '' + data.fields.Lines[i].fields.LinePrice.toFixed(2) + '' + "</div>" || currencySymbol + '' + 0.00,
                                data.fields.Lines[i].fields.LineTaxCode || '',
                                AmountGbp || currencySymbol + '' + 0.00,
                                '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
                            ];
                            lineItemsTable.push(dataListTable);
                            lineItems.push(lineItemObj);
                        }
                    } else {
                        let AmountGbp = data.fields.Lines.fields.TotalLineAmountInc.toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let currencyAmountGbp = currencySymbol + '' + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
                        let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines.fields.LineTaxTotal);
                        let TaxRateGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxRate;
                        lineItemObj = {
                            lineID: Random.id(),
                            id: data.fields.Lines.fields.ID || '',
                            description: data.fields.Lines.fields.ProductDescription || '',
                            quantity: data.fields.Lines.fields.UOMOrderQty || 0,
                            unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                            lineCost: data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            }) || 0,
                            taxRate: data.fields.Lines.fields.LineTaxRate || 0,
                            taxCode: data.fields.Lines.fields.LineTaxCode || '',
                            //TotalAmt: AmountGbp || 0,
                            curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                            TaxTotal: TaxTotalGbp || 0,
                            TaxRate: TaxRateGbp || 0
                        };
                        lineItems.push(lineItemObj);
                    }
                  }
                    let invoicerecord = {
                        id: data.fields.ID,
                        lid: 'Refund' + ' ' + data.fields.ID,
                        socustomer: data.fields.CustomerName,
                        salesOrderto: data.fields.InvoiceToDesc,
                        shipto: data.fields.ShipToDesc,
                        department: data.fields.SaleClassName,
                        docnumber: data.fields.DocNumber,
                        custPONumber: data.fields.CustPONumber,
                        saledate: data.fields.SaleDate ? moment(data.fields.SaleDate).format('DD/MM/YYYY') : "",
                        duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
                        employeename: data.fields.EmployeeName,
                        status: data.fields.SalesStatus,
                        category: data.fields.SalesCategory,
                        comments: data.fields.Comments,
                        pickmemo: data.fields.PickMemo,
                        ponumber: data.fields.CustPONumber,
                        via: data.fields.Shipping,
                        connote: data.fields.ConNote,
                        reference: data.fields.ReferenceNo,
                        currency: data.fields.ForeignExchangeCode,
                        branding: data.fields.MedType,
                        invoiceToDesc: data.fields.InvoiceToDesc,
                        shipToDesc: data.fields.ShipToDesc,
                        termsName: data.fields.TermsName,
                        Total: totalInc,
                        TotalDiscount: totalDiscount,
                        LineItems: lineItems,
                        TotalTax: totalTax,
                        SubTotal: subTotal,
                        balanceDue: totalBalance,
                        saleCustField1: data.fields.SaleCustField1,
                        saleCustField2: data.fields.SaleCustField2,
                        totalPaid: totalPaidAmount,
                        ispaid: data.fields.IsPaid
                    };

                    $('#edtCustomerName').val(data.fields.CustomerName);
                    $('#sltTerms').val(data.fields.TermsName);
                    $('#sltDept').val(data.fields.SaleClassName);
                    $('#sltStatus').val(data.fields.SalesStatus);
                    templateObject.CleintName.set(data.fields.CustomerName);
                    $('#sltCurrency').val(data.fields.ForeignExchangeCode);
                    $('#exchange_rate').val(data.fields.ForeignExchangeRate);
                    $('#sltPaymentMethod').val(data.fields.PayMethod);

                    // tempcode
                    // setTimeout(function () {
                    //   $('#edtSaleCustField1').val(data.fields.SaleCustField1);
                    //   $('#edtSaleCustField2').val(data.fields.SaleCustField2);
                    //   $('#edtSaleCustField3').val(data.fields.SaleCustField3);
                    // }, 2500);

                    /* START attachment */
                    templateObject.attachmentCount.set(0);
                    if (data.fields.Attachments) {
                        if (data.fields.Attachments.length) {
                            templateObject.attachmentCount.set(data.fields.Attachments.length);
                            templateObject.uploadedFiles.set(data.fields.Attachments);
                        }
                    }
                    /* END  attachment */
                    var checkISCustLoad = false;
                    setTimeout(function() {
                        if (clientList) {
                            for (var i = 0; i < clientList.length; i++) {
                                if (clientList[i].customername == data.fields.CustomerName) {
                                    checkISCustLoad = true;
                                    invoicerecord.firstname = clientList[i].firstname || '';
                                    invoicerecord.lastname = clientList[i].lastname || '';
                                    templateObject.invoicerecord.set(invoicerecord);
                                    $('#edtCustomerEmail').val(clientList[i].customeremail);
                                    $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                                    $('#edtCustomerName').attr('custid', clientList[i].customerid);
                                    $('#edtCustomerEmail').attr('customerfirstname', clientList[i].firstname);
                                    $('#edtCustomerEmail').attr('customerlastname', clientList[i].lastname);
                                    $('#customerType').text(clientList[i].clienttypename || 'Default');
                                    $('#customerDiscount').text(clientList[i].discount + '%' || 0 + '%');
                                    $('#edtCustomerUseType').val(clientList[i].clienttypename || 'Default');
                                    $('#edtCustomerUseDiscount').val(clientList[i].discount || 0);
                                }
                            }
                        };

                        if (data.fields.IsPaid === true) {
                            $('#edtCustomerName').attr('readonly', true);
                            $('.btn-primary').attr('disabled', 'disabled');

                            $('#btnCopyInvoice').attr('disabled', 'disabled');
                            $('#edtCustomerName').css('background-color', '#eaecf4');

                            $('#btnViewPayment').removeAttr('disabled', 'disabled');
                            $('.btnSave').attr('disabled', 'disabled');
                            $('#btnBack').removeAttr('disabled', 'disabled');
                            $('.printConfirm').removeAttr('disabled', 'disabled');
                            $('.tblInvoiceLine tbody tr').each(function() {
                                var $tblrow = $(this);
                                $tblrow.find("td").attr('contenteditable', false);
                                //$tblrow.find("td").removeClass("lineProductName");
                                $tblrow.find("td").removeClass("lineTaxRate");
                                $tblrow.find("td").removeClass("lineTaxCode");

                                $tblrow.find("td").attr('readonly', true);
                                $tblrow.find("td").attr('disabled', 'disabled');
                                $tblrow.find("td").css('background-color', '#eaecf4');
                                $tblrow.find("td .table-remove").removeClass("btnRemove");
                            });
                        }

                        if (!checkISCustLoad) {
                            let d = 0;
                            sideBarService.getCustomersDataByName(useData[d].fields.CustomerName).then(function(dataClient) {
                                for (var c = 0; c < dataClient.tcustomervs1.length; c++) {
                                    var customerrecordObj = {
                                        customerid: dataClient.tcustomervs1[c].Id || ' ',
                                        firstname: dataClient.tcustomervs1[c].FirstName || ' ',
                                        lastname: dataClient.tcustomervs1[c].LastName || ' ',
                                        customername: dataClient.tcustomervs1[c].ClientName || ' ',
                                        customeremail: dataClient.tcustomervs1[c].Email || ' ',
                                        street: dataClient.tcustomervs1[c].Street || ' ',
                                        street2: dataClient.tcustomervs1[c].Street2 || ' ',
                                        street3: dataClient.tcustomervs1[c].Street3 || ' ',
                                        suburb: dataClient.tcustomervs1[c].Suburb || ' ',
                                        statecode: dataClient.tcustomervs1[c].State + ' ' + dataClient.tcustomervs1[c].Postcode || ' ',
                                        country: dataClient.tcustomervs1[c].Country || ' ',
                                        termsName: dataClient.tcustomervs1[c].TermsName || '',
                                        taxCode: dataClient.tcustomervs1[c].TaxCodeName || 'E',
                                        clienttypename: dataClient.tcustomervs1[c].ClientTypeName || 'Default'
                                    };
                                    clientList.push(customerrecordObj);

                                    invoicerecord.firstname = dataClient.tcustomervs1[c].FirstName || '';
                                    invoicerecord.lastname = dataClient.tcustomervs1[c].LastName || '';
                                    $('#edtCustomerEmail').val(dataClient.tcustomervs1[c].Email);
                                    $('#edtCustomerEmail').attr('customerid', clientList[c].customerid);
                                    $('#edtCustomerName').attr('custid', dataClient.tcustomervs1[c].Id);
                                    $('#edtCustomerEmail').attr('customerfirstname', dataClient.tcustomervs1[c].FirstName);
                                    $('#edtCustomerEmail').attr('customerlastname', dataClient.tcustomervs1[c].LastName);
                                    $('#customerType').text(dataClient.tcustomervs1[c].ClientTypeName || 'Default');
                                    $('#customerDiscount').text(dataClient.tcustomervs1[c].Discount + '%' || 0 + '%');
                                    $('#edtCustomerUseType').val(dataClient.tcustomervs1[c].ClientTypeName || 'Default');
                                    $('#edtCustomerUseDiscount').val(dataClient.tcustomervs1[c].Discount || 0);
                                }

                                templateObject.clientrecords.set(clientList.sort(function(a, b) {
                                    if (a.customername == 'NA') {
                                        return 1;
                                    } else if (b.customername == 'NA') {
                                        return -1;
                                    }
                                    return (a.customername.toUpperCase() > b.customername.toUpperCase()) ? 1 : -1;
                                }));
                            });
                        }
                    }, 100);


                    templateObject.invoicerecord.set(invoicerecord);

                    templateObject.selectedCurrency.set(invoicerecord.currency);
                    templateObject.inputSelectedCurrency.set(invoicerecord.currency);
                    if (templateObject.invoicerecord.get()) {





                        Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblInvoiceLine', function(error, result) {
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
                                        } else if (hiddenColumn == false) {
                                            $("." + columnClass + "").removeClass('hiddenColumn');
                                            $("." + columnClass + "").addClass('showColumn');
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
                    LoadingOverlay.hide();

                });
                            }

                        }
                    }).catch(function (err) {
                        let customerData = templateObject.clientrecords.get();
                      accountService.getRefundSales(currentInvoice).then(function(data) {
                    LoadingOverlay.hide();
                    let lineItems = [];
                    let lineItemObj = {};
                    let lineItemsTable = [];
                    let lineItemTableObj = {};
                    let exchangeCode = data.fields.ForeignExchangeCode;
                    let currencySymbol = Currency;
                    let total =  utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let totalInc =  utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmountInc).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let totalDiscount = utilityService.modifynegativeCurrencyFormat(data.fields.TotalDiscount).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let subTotal = utilityService.modifynegativeCurrencyFormat(data.fields.TotalAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let totalTax = utilityService.modifynegativeCurrencyFormat(data.fields.TotalTax).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let totalBalance = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let totalPaidAmount = utilityService.modifynegativeCurrencyFormat(data.fields.TotalPaid).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                  if(data.fields.Lines != null){
                    if (data.fields.Lines.length) {
                        for (let i = 0; i < data.fields.Lines.length; i++) {
                            let AmountGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let currencyAmountGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount);
                            let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
                            let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);
                            lineItemObj = {
                                lineID: Random.id(),
                                id: data.fields.Lines[i].fields.ID || '',
                                item: data.fields.Lines[i].fields.ProductName || '',
                                description: data.fields.Lines[i].fields.ProductDescription || '',
                                quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
                                unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                lineCost: currencySymbol + '' + data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                }) || 0,
                                taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                                taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
                                //TotalAmt: AmountGbp || 0,
                                curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                                TaxTotal: TaxTotalGbp || 0,
                                TaxRate: TaxRateGbp || 0,
                                DiscountPercent: data.fields.Lines[i].fields.DiscountPercent || 0
                            };
                            var dataListTable = [
                                data.fields.Lines[i].fields.ProductName || '',
                                data.fields.Lines[i].fields.ProductDescription || '',
                                "<div contenteditable='true' class='qty'>" + '' + data.fields.Lines[i].fields.UOMOrderQty + '' + "</div>" || "<div>" + '' + 0 + '' + "</div>",
                                "<div>" + '' + currencySymbol + '' + data.fields.Lines[i].fields.LinePrice.toFixed(2) + '' + "</div>" || currencySymbol + '' + 0.00,
                                data.fields.Lines[i].fields.LineTaxCode || '',
                                AmountGbp || currencySymbol + '' + 0.00,
                                '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
                            ];
                            lineItemsTable.push(dataListTable);
                            lineItems.push(lineItemObj);
                        }
                    } else {
                        let AmountGbp = data.fields.Lines.fields.TotalLineAmountInc.toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let currencyAmountGbp = currencySymbol + '' + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
                        let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines.fields.LineTaxTotal);
                        let TaxRateGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxRate;
                        lineItemObj = {
                            lineID: Random.id(),
                            id: data.fields.Lines.fields.ID || '',
                            description: data.fields.Lines.fields.ProductDescription || '',
                            quantity: data.fields.Lines.fields.UOMOrderQty || 0,
                            unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                            unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                            TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                            TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                            lineCost: data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            }) || 0,
                            taxRate: data.fields.Lines.fields.LineTaxRate || 0,
                            taxCode: data.fields.Lines.fields.LineTaxCode || '',
                            //TotalAmt: AmountGbp || 0,
                            curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                            TaxTotal: TaxTotalGbp || 0,
                            TaxRate: TaxRateGbp || 0
                        };
                        lineItems.push(lineItemObj);
                    }
                  }
                    let invoicerecord = {
                        id: data.fields.ID,
                        lid: 'Refund' + ' ' + data.fields.ID,
                        socustomer: data.fields.CustomerName,
                        salesOrderto: data.fields.InvoiceToDesc,
                        shipto: data.fields.ShipToDesc,
                        department: data.fields.SaleClassName,
                        docnumber: data.fields.DocNumber,
                        custPONumber: data.fields.CustPONumber,
                        saledate: data.fields.SaleDate ? moment(data.fields.SaleDate).format('DD/MM/YYYY') : "",
                        duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
                        employeename: data.fields.EmployeeName,
                        status: data.fields.SalesStatus,
                        category: data.fields.SalesCategory,
                        comments: data.fields.Comments,
                        pickmemo: data.fields.PickMemo,
                        ponumber: data.fields.CustPONumber,
                        via: data.fields.Shipping,
                        connote: data.fields.ConNote,
                        reference: data.fields.ReferenceNo,
                        currency: data.fields.ForeignExchangeCode,
                        branding: data.fields.MedType,
                        invoiceToDesc: data.fields.InvoiceToDesc,
                        shipToDesc: data.fields.ShipToDesc,
                        termsName: data.fields.TermsName,
                        Total: totalInc,
                        TotalDiscount: totalDiscount,
                        LineItems: lineItems,
                        TotalTax: totalTax,
                        SubTotal: subTotal,
                        balanceDue: totalBalance,
                        saleCustField1: data.fields.SaleCustField1,
                        saleCustField2: data.fields.SaleCustField2,
                        totalPaid: totalPaidAmount,
                        ispaid: data.fields.IsPaid
                    };

                    $('#edtCustomerName').val(data.fields.CustomerName);
                    $('#sltTerms').val(data.fields.TermsName);
                    $('#sltDept').val(data.fields.SaleClassName);
                    $('#sltStatus').val(data.fields.SalesStatus);
                    templateObject.CleintName.set(data.fields.CustomerName);
                    $('#sltCurrency').val(data.fields.ForeignExchangeCode);
                    $('#exchange_rate').val(data.fields.ForeignExchangeRate);
                    $('#sltPaymentMethod').val(data.fields.PayMethod);

                    // tempcode
                    // setTimeout(function () {
                    //   $('#edtSaleCustField1').val(data.fields.SaleCustField1);
                    //   $('#edtSaleCustField2').val(data.fields.SaleCustField2);
                    //   $('#edtSaleCustField3').val(data.fields.SaleCustField3);
                    // }, 2500);

                    /* START attachment */
                    templateObject.attachmentCount.set(0);
                    if (data.fields.Attachments) {
                        if (data.fields.Attachments.length) {
                            templateObject.attachmentCount.set(data.fields.Attachments.length);
                            templateObject.uploadedFiles.set(data.fields.Attachments);
                        }
                    }
                    /* END  attachment */
                    var checkISCustLoad = false;
                    setTimeout(function() {
                        if (clientList) {
                            for (var i = 0; i < clientList.length; i++) {
                                if (clientList[i].customername == data.fields.CustomerName) {
                                    checkISCustLoad = true;
                                    invoicerecord.firstname = clientList[i].firstname || '';
                                    invoicerecord.lastname = clientList[i].lastname || '';
                                    templateObject.invoicerecord.set(invoicerecord);
                                    $('#edtCustomerEmail').val(clientList[i].customeremail);
                                    $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                                    $('#edtCustomerName').attr('custid', clientList[i].customerid);
                                    $('#edtCustomerEmail').attr('customerfirstname', clientList[i].firstname);
                                    $('#edtCustomerEmail').attr('customerlastname', clientList[i].lastname);
                                    $('#customerType').text(clientList[i].clienttypename || 'Default');
                                    $('#customerDiscount').text(clientList[i].discount + '%' || 0 + '%');
                                    $('#edtCustomerUseType').val(clientList[i].clienttypename || 'Default');
                                    $('#edtCustomerUseDiscount').val(clientList[i].discount || 0);
                                }
                            }
                        };

                        if (data.fields.IsPaid === true) {
                            $('#edtCustomerName').attr('readonly', true);
                            $('.btn-primary').attr('disabled', 'disabled');

                            $('#btnCopyInvoice').attr('disabled', 'disabled');
                            $('#edtCustomerName').css('background-color', '#eaecf4');

                            $('#btnViewPayment').removeAttr('disabled', 'disabled');
                            $('.btnSave').attr('disabled', 'disabled');
                            $('#btnBack').removeAttr('disabled', 'disabled');
                            $('.printConfirm').removeAttr('disabled', 'disabled');
                            $('.tblInvoiceLine tbody tr').each(function() {
                                var $tblrow = $(this);
                                $tblrow.find("td").attr('contenteditable', false);
                                //$tblrow.find("td").removeClass("lineProductName");
                                $tblrow.find("td").removeClass("lineTaxRate");
                                $tblrow.find("td").removeClass("lineTaxCode");

                                $tblrow.find("td").attr('readonly', true);
                                $tblrow.find("td").attr('disabled', 'disabled');
                                $tblrow.find("td").css('background-color', '#eaecf4');
                                $tblrow.find("td .table-remove").removeClass("btnRemove");
                            });
                        }

                        if (!checkISCustLoad) {
                            sideBarService.getCustomersDataByName(useData[d].fields.CustomerName).then(function(dataClient) {
                                for (var c = 0; c < dataClient.tcustomervs1.length; c++) {
                                    var customerrecordObj = {
                                        customerid: dataClient.tcustomervs1[c].Id || ' ',
                                        firstname: dataClient.tcustomervs1[c].FirstName || ' ',
                                        lastname: dataClient.tcustomervs1[c].LastName || ' ',
                                        customername: dataClient.tcustomervs1[c].ClientName || ' ',
                                        customeremail: dataClient.tcustomervs1[c].Email || ' ',
                                        street: dataClient.tcustomervs1[c].Street || ' ',
                                        street2: dataClient.tcustomervs1[c].Street2 || ' ',
                                        street3: dataClient.tcustomervs1[c].Street3 || ' ',
                                        suburb: dataClient.tcustomervs1[c].Suburb || ' ',
                                        statecode: dataClient.tcustomervs1[c].State + ' ' + dataClient.tcustomervs1[c].Postcode || ' ',
                                        country: dataClient.tcustomervs1[c].Country || ' ',
                                        termsName: dataClient.tcustomervs1[c].TermsName || '',
                                        taxCode: dataClient.tcustomervs1[c].TaxCodeName || 'E',
                                        clienttypename: dataClient.tcustomervs1[c].ClientTypeName || 'Default'
                                    };
                                    clientList.push(customerrecordObj);

                                    invoicerecord.firstname = dataClient.tcustomervs1[c].FirstName || '';
                                    invoicerecord.lastname = dataClient.tcustomervs1[c].LastName || '';
                                    $('#edtCustomerEmail').val(dataClient.tcustomervs1[c].Email);
                                    $('#edtCustomerEmail').attr('customerid', clientList[c].customerid);
                                    $('#edtCustomerName').attr('custid', dataClient.tcustomervs1[c].Id);
                                    $('#edtCustomerEmail').attr('customerfirstname', dataClient.tcustomervs1[c].FirstName);
                                    $('#edtCustomerEmail').attr('customerlastname', dataClient.tcustomervs1[c].LastName);
                                    $('#customerType').text(dataClient.tcustomervs1[c].ClientTypeName || 'Default');
                                    $('#customerDiscount').text(dataClient.tcustomervs1[c].Discount + '%' || 0 + '%');
                                    $('#edtCustomerUseType').val(dataClient.tcustomervs1[c].ClientTypeName || 'Default');
                                    $('#edtCustomerUseDiscount').val(dataClient.tcustomervs1[c].Discount || 0);
                                }

                                templateObject.clientrecords.set(clientList.sort(function(a, b) {
                                    if (a.customername == 'NA') {
                                        return 1;
                                    } else if (b.customername == 'NA') {
                                        return -1;
                                    }
                                    return (a.customername.toUpperCase() > b.customername.toUpperCase()) ? 1 : -1;
                                }));
                            });
                        }
                    }, 100);


                    templateObject.invoicerecord.set(invoicerecord);

                    templateObject.selectedCurrency.set(invoicerecord.currency);
                    templateObject.inputSelectedCurrency.set(invoicerecord.currency);
                    if (templateObject.invoicerecord.get()) {
                        Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblInvoiceLine', function(error, result) {
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
                                        } else if (hiddenColumn == false) {
                                            $("." + columnClass + "").removeClass('hiddenColumn');
                                            $("." + columnClass + "").addClass('showColumn');



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
                    LoadingOverlay.hide();

                });
              });
            };
            templateObject.getInvoiceData();

            FxGlobalFunctions.handleChangedCurrency($('#sltCurrency').val(), defaultCurrencyCode);

        }
    } else {
        LoadingOverlay.hide();
        let lineItems = [];
        let lineItemsTable = [];
        let lineItemObj = {};
        lineItemObj = {
            lineID: Random.id(),
            item: '',
            description: '',
            quantity: '',
            unitPrice: 0,
            unitPriceInc:0,
            TotalAmt: 0,
            TotalAmtInc: 0,
            taxRate: '',
            taxCode: '',
            curTotalAmt: 0,
            TaxTotal: 0,
            TaxRate: 0,

        };
        const dataListTable = [
            ' ' || '',
            ' ' || '',
            0 || 0,
            0.00 || 0.00,
            ' ' || '',
            0.00 || 0.00,
            '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
        ];
        lineItemsTable.push(dataListTable);
        lineItems.push(lineItemObj);
        const currentDate = new Date();
        const begunDate = moment(currentDate).format("DD/MM/YYYY");
        let invoicerecord = {
            id: '',
            lid: 'Refund',
            socustomer: '',
            salesOrderto: '',
            shipto: '',
            department: defaultDept||'',
            docnumber: '',
            custPONumber: '',
            saledate: begunDate,
            duedate: '',
            employeename: '',
            status: '',
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
            termsName: templateObject.defaultsaleterm.get() || '',
            Total: Currency + '' + 0.00,
            TotalDiscount: Currency + '' + 0.00,
            LineItems: lineItems,
            TotalTax: Currency + '' + 0.00,
            SubTotal: Currency + '' + 0.00,
            balanceDue: Currency + '' + 0.00,
            saleCustField1: '',
            saleCustField2: '',
            totalPaid: Currency + '' + 0.00,
            ispaid: false
        };
        if (FlowRouter.current().queryParams.customerid) {
            getCustomerData(FlowRouter.current().queryParams.customerid);
        } else {
            $('#edtCustomerName').val('');
        }
        let getPaymentMethodVal = Session.get('paymentmethod') || 'Cash';
        setTimeout(function() {
            $('#sltDept').val(defaultDept);
            $('#sltPaymentMethod').val(getPaymentMethodVal);
            $('#sltTerms').val(invoicerecord.termsName|| templateObject.defaultsaleterm.get() ||'');
        }, 200);
        templateObject.invoicerecord.set(invoicerecord);
        if (templateObject.invoicerecord.get()) {
            Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblInvoiceLine', function(error, result) {
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
                            } else if (hiddenColumn == false) {
                                $("." + columnClass + "").removeClass('hiddenColumn');
                                $("." + columnClass + "").addClass('showColumn');
                            }

                        }
                    }

                }
            });
        }
    }


    let table;
    $(document).ready(function() {
        $('#edtCustomerName').editableSelect();
        $('#sltCurrency').editableSelect();
        $('#sltTerms').editableSelect();
        $('#sltDept').editableSelect();
        $('#sltStatus').editableSelect();
        $('#sltPaymentMethod').editableSelect();
        $('#addRow').on('click', function() {
          var getTableFields = [ $('#tblInvoiceLine tbody tr .lineProductName')];
          var checkEmptyFields;

          for(var i=0;i< getTableFields.length;i++){
          checkEmptyFields = getTableFields[i].filter(function(i,element) {
              return $.trim($(this).val()) === '';
          });
         };
          if (!checkEmptyFields.length) {
            var rowData = $('#tblInvoiceLine tbody>tr:last').clone(true);
            let tokenid = Random.id();
            $(".lineProductName", rowData).val("");
            $(".lineProductDesc", rowData).text("");
            $(".lineQty", rowData).val("");
            $(".lineUnitPrice", rowData).val("");
            $(".lineTaxRate", rowData).text("");
            $(".lineTaxCode", rowData).val("");
            $(".lineAmt", rowData).text("");
            $(".lineTaxAmount", rowData).text("");
            $(".lineDiscount", rowData).text("");
            $(".lineProductName", rowData).attr("prodid", '');
            rowData.attr('id', tokenid);
            $("#tblInvoiceLine tbody").append(rowData);

            setTimeout(function() {
                $('#' + tokenid + " .lineProductName").trigger('click');
            }, 200);
          }else{
            $("#tblInvoiceLine tbody tr").each(function (index) {
                var $tblrow = $(this);
                if ($tblrow.find(".lineProductName").val() == '') {
                    $tblrow.find(".colProductName").addClass('boldtablealertsborder');
                }

              });
          }
        });

    });

    /* On clik Inventory Line */
    $(document).on("click", "#tblInventory tbody tr", async function(e) {
        $(".colProductName").removeClass('boldtablealertsborder');
        let selectLineID = $('#selectLineID').val();
        let taxcodeList = await templateObject.taxraterecords.get();
        let customers = await templateObject.clientrecords.get();
        let productExtraSell = templateObject.productextrasellrecords.get();

        var table = $(this);
        let utilityService = new UtilityService();
        let $tblrows = $("#tblInvoiceLine tbody tr");
        let printrows = $(".invoice_print tbody tr");
        let taxcode1 = "";

        let selectedCust = $('#edtCustomerName').val();
        let getCustDetails = "";
        let lineTaxRate = "";
        let taxRate = ""

        if (selectedCust != "") {
            getCustDetails = customers.filter(customer => {
                return customer.customername == selectedCust
            });
            if (getCustDetails.length > 0) {
            taxRate = taxcodeList.filter(taxrate => {
                return taxrate.codename == getCustDetails[0].taxCode
            });
            lineTaxRate = taxRate[0].codename
            taxcode1 = getCustDetails[0].taxCode
          }else{
            lineTaxRate = table.find(".taxrate").text();
          }
        } else {
            lineTaxRate = table.find(".taxrate").text();
        }

        if (selectLineID) {
            let lineProductName = table.find(".productName").text();
            let lineProductDesc = table.find(".productDesc").text();
            let lineUnitPrice = table.find(".salePrice").text();
            let lineExtraSellPrice = JSON.parse(table.find(".colExtraSellPrice").text()) || null;
            let getCustomerClientTypeName = $('#edtCustomerUseType').val() || 'Default';
            let getCustomerDiscount = parseFloat($('#edtCustomerUseDiscount').val()) || 0;
            let getCustomerProductDiscount = 0;
            let discountAmount = getCustomerDiscount;
            if (lineExtraSellPrice != null) {
                for (let e = 0; e < lineExtraSellPrice.length; e++) {
                    if (lineExtraSellPrice[e].fields.ClientTypeName === getCustomerClientTypeName) {
                        getCustomerProductDiscount = parseFloat(lineExtraSellPrice[e].fields.QtyPercent1) || 0;
                        if (getCustomerProductDiscount > getCustomerDiscount) {
                            discountAmount = getCustomerProductDiscount;
                        }
                    }

                }
            } else {
                discountAmount = getCustomerDiscount;
            }

            $('#' + selectLineID + " .lineDiscount").text(discountAmount);

            let lineTaxCode = 0;
            let lineAmount = 0;
            let lineTaxAmount = 0;
            let subGrandTotal = 0;
            let taxGrandTotal = 0;

            let subDiscountTotal = 0; // New Discount
            let taxGrandTotalPrint = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == lineTaxRate) {

                        $('#' + selectLineID + " .lineTaxRate").text(taxcodeList[i].coderate);
                    }
                }
            }

            $('#' + selectLineID + " .lineProductName").val(lineProductName);
            $('#' + selectLineID + " .lineProductName").attr("prodid", table.find(".colProuctPOPID").text());
            $('#' + selectLineID + " .lineProductDesc").text(lineProductDesc);
            $('#' + selectLineID + " .lineOrdered").val(1);
            $('#' + selectLineID + " .lineQty").val(1);
            $('#' + selectLineID + " .lineUnitPrice").val(lineUnitPrice);

            if ($('.printID').attr('id') == undefined || $('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
                $('#' + selectLineID + " #lineProductName").text(lineProductName);
                $('#' + selectLineID + " #lineProductDesc").text(lineProductDesc);
                $('#' + selectLineID + " #lineOrdered").text(1);
                $('#' + selectLineID + " #lineQty").text(1);
                $('#' + selectLineID + " #lineUnitPrice").text(lineUnitPrice);
            }

            if (lineTaxRate == "NT") {
                lineTaxRate = "E";
                $('#' + selectLineID + " .lineTaxCode").val(lineTaxRate);
                if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
                    $('#' + selectLineID + " #lineTaxCode").text(lineTaxRate);
                }

            } else {
                $('#' + selectLineID + " .lineTaxCode").val(lineTaxRate);
                if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
                    $('#' + selectLineID + " #lineTaxCode").text(lineTaxRate);
                }
            }

            lineAmount = 1 * Number(lineUnitPrice.replace(/[^0-9.-]+/g, "")) || 0;
            $('#' + selectLineID + " .lineAmt").text(utilityService.modifynegativeCurrencyFormat(lineAmount));
            if ($('.printID').attr('id') == undefined || $('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
                $('#' + selectLineID + " #lineAmt").text(utilityService.modifynegativeCurrencyFormat(lineAmount));
            }
            $('#productListModal').modal('toggle');
            let subGrandTotalNet = 0;
            let taxGrandTotalNet = 0;
            $tblrows.each(function(index) {
                var $tblrow = $(this);
                var qty = $tblrow.find(".lineQty").val() || 0;
                var price = $tblrow.find(".colUnitPriceExChange").val() || 0;
                var taxRate = $tblrow.find(".lineTaxCode").val();

                var taxrateamount = 0;
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename == taxRate) {
                            taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                        }
                    }
                }

                var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
                var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").text()) || 0; // New Discount
                let lineTotalAmount = subTotal + taxTotal;

                let lineDiscountTotal = lineDiscountPerc / 100;

                var discountTotal = lineTotalAmount * lineDiscountTotal;
                var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
                var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
                var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
                var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
                if (!isNaN(discountTotal)) {
                    subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;

                    document.getElementById("subtotal_discount").innerHTML = utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
                }
                $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

                let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount)||0;
                let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, ""))||0;
                let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc||0;
                $tblrow.find('.colUnitPriceExChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
                $tblrow.find('.colUnitPriceIncChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

                if (!isNaN(subTotal)) {
                  $tblrow.find('.colAmountEx').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                  $tblrow.find('.colAmountInc').text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
                    subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
                    subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
                    document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
                }

                if (!isNaN(taxTotal)) {
                    taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
                    taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
                    document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
                }



                if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                    let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                    let GrandTotalNet = (parseFloat(subGrandTotalNet)) + (parseFloat(taxGrandTotalNet));
                    document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
                    document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);

                }
            });

            //if ($('.printID').attr('id') == undefined || $('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
            $printrows.each(function(index) {
                var $printrows = $(this);
                var qty = $printrows.find("#lineQty").text() || 0;
                var price = $printrows.find("#lineUnitPrice").text() || "0";
                var taxrateamount = 0;
                var taxRate = $printrows.find("#lineTaxCode").text();
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename == taxRate) {
                            taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                        }
                    }
                }

                var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
                var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                $printrows.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal))
                if (!isNaN(subTotal)) {
                    $printrows.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                    subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                    document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
                }

                if (!isNaN(taxTotal)) {
                    taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                    document.getElementById("totalTax_totalPrint").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalPrint);
                }
                if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                    let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                    document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                    //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

                }
            });
            //}

        }
    });
    /* On Click TaxCode List */
    $(document).on("click", "#tblTaxRate tbody tr", function(e) {
        let selectLineID = $('#selectLineID').val();
        let taxcodeList = templateObject.taxraterecords.get();
        var table = $(this);
        let utilityService = new UtilityService();
        let $tblrows = $("#tblInvoiceLine tbody tr");

        if (selectLineID) {
            let lineTaxCode = table.find(".taxName").text();
            let lineTaxRate = table.find(".taxRate").text();
            let lineAmount = 0;
            let subGrandTotal = 0;
            let taxGrandTotal = 0;
            let subDiscountTotal = 0; // New Discount
            let taxGrandTotalPrint = 0;

            $('#' + selectLineID + " .lineTaxRate").text(lineTaxRate || 0);
            $('#' + selectLineID + " .lineTaxCode").val(lineTaxCode);
            if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
                $('#' + selectLineID + " #lineTaxCode").text(lineTaxCode);
            }

            $('#taxRateListModal').modal('toggle');
            let subGrandTotalNet = 0;
            let taxGrandTotalNet = 0;
            $tblrows.each(function(index) {
                var $tblrow = $(this);
                var qty = $tblrow.find(".lineQty").val() || 0;
                var price = $tblrow.find(".colUnitPriceExChange").val() || 0;
                var taxRate = $tblrow.find(".lineTaxCode").val();

                var taxrateamount = 0;
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename == taxRate) {
                            taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                        }
                    }
                }

                var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
                var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").text()) || 0; // New Discount
                let lineTotalAmount = subTotal + taxTotal;

                let lineDiscountTotal = lineDiscountPerc / 100;

                var discountTotal = lineTotalAmount * lineDiscountTotal;
                var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
                var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
                var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
                var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
                if (!isNaN(discountTotal)) {
                    subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;

                    document.getElementById("subtotal_discount").innerHTML = utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
                }
                $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

                let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount)||0;
                let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, ""))||0;
                let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc||0;
                $tblrow.find('.colUnitPriceExChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
                $tblrow.find('.colUnitPriceIncChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

                if (!isNaN(subTotal)) {
                  $tblrow.find('.colAmountEx').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                  $tblrow.find('.colAmountInc').text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
                    subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
                    subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
                    document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
                }

                if (!isNaN(taxTotal)) {
                    taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
                    taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
                    document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
                }



                if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                    let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                    let GrandTotalNet = (parseFloat(subGrandTotalNet)) + (parseFloat(taxGrandTotalNet));
                    document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
                    document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);

                }
            });

            //if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
            $printrows.each(function(index) {
                var $printrows = $(this);
                var qty = $printrows.find("#lineQty").text() || 0;
                var price = $printrows.find("#lineUnitPrice").text() || "0";
                var taxrateamount = 0;
                var taxRate = $printrows.find("#lineTaxCode").text();
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename == taxRate) {
                            taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                        }
                    }
                }
                var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
                var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                $printrows.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal))
                if (!isNaN(subTotal)) {
                    $printrows.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                    subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                    document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
                }

                if (!isNaN(taxTotal)) {
                    taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                    document.getElementById("totalTax_totalPrint").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalPrint);
                }
                if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                    let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                    document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                    //document.getElementById("totalTax").innerHTML = $('#subtotal_tax').text();
                    //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

                }
            });
            //}

        }
    });
    $(document).on("click", "#tblCurrencyPopList tbody tr", function(e) {
        $('#sltCurrency').val($(this).find(".colCode").text());
        $('#currencyModal').modal('toggle');

        $('#tblCurrencyPopList_filter .form-control-sm').val('');
        setTimeout(function () {
            $('.btnRefreshCurrency').trigger('click');
            LoadingOverlay.hide();
        }, 1000);
    });
    $(document).on("click", "#departmentList tbody tr", function(e) {
        $('#sltDept').val($(this).find(".colDeptName").text());
        $('#departmentModal').modal('toggle');
    });
    $(document).on("click", "#termsList tbody tr", function(e) {
        $('#sltTerms').val($(this).find(".colTermName").text());
        $('#termsListModal').modal('toggle');
    });
    $(document).on("click", "#tblStatusPopList tbody tr", function(e) {
        $('#sltStatus').val($(this).find(".colStatusName").text());
        $('#statusPopModal').modal('toggle');

        $('#tblStatusPopList_filter .form-control-sm').val('');
        setTimeout(function () {
            $('.btnRefreshStatus').trigger('click');
            LoadingOverlay.hide();
        }, 1000);
    });
    $(document).on("click", "#custListType tbody tr", function(e) {;
       if(clickedInput == "one") {
           $('#edtSaleCustField1').val($(this).find(".colFieldName").text());
       } else if(clickedInput == "two") {
           $('#edtSaleCustField2').val($(this).find(".colFieldName").text());
       } else if(clickedInput == "three") {
           $('#edtSaleCustField3').val($(this).find(".colFieldName").text());
       }
      // $('#sltStatus').val($(this).find(".colStatusName").text());
       $('#customFieldList').modal('toggle');

       // $('#tblStatusPopList_filter .form-control-sm').val('');
       // setTimeout(function () {
       //     $('.btnRefreshStatus').trigger('click');
       //     LoadingOverlay.hide();
       // }, 1000);
   });
    /* On click Customer List */
    $(document).on("click", "#tblCustomerlist tbody tr", function(e) {
        const tableCustomer = $(this);
        $('#edtCustomerName').val(tableCustomer.find(".colCompany").text());
        $('#edtCustomerName').attr("custid", tableCustomer.find(".colID").text());
        // $('#customerType').text(tableCustomer.find(".colCustomerType").text()||'Default');
        // $('#customerDiscount').text(tableCustomer.find(".colCustomerDiscount").text()+'%'|| 0+'%');
        // $('#edtCustomerUseType').val(tableCustomer.find(".colCustomerType").text()||'Default');
        // $('#edtCustomerUseDiscount').val(tableCustomer.find(".colCustomerDiscount").text()||0);
        $('#edtCustomerEmail').val(tableCustomer.find(".colEmail").text());
        $('#edtCustomerEmail').attr('customerid', tableCustomer.find(".colID").text());
        $('#edtCustomerName').attr('custid', tableCustomer.find(".colID").text());
        $('#edtCustomerEmail').attr('customerfirstname', tableCustomer.find(".colCustomerFirstName").text());
        $('#edtCustomerEmail').attr('customerlastname', tableCustomer.find(".colCustomerLastName").text());
        $('#customerType').text(tableCustomer.find(".colCustomerType").text() || 'Default');
        $('#customerDiscount').text(tableCustomer.find(".colCustomerDiscount").text() + '%' || 0 + '%');
        $('#edtCustomerUseType').val(tableCustomer.find(".colCustomerType").text() || 'Default');
        $('#edtCustomerUseDiscount').val(tableCustomer.find(".colCustomerDiscount").text() || 0);
        let postalAddress = tableCustomer.find(".colCompany").text() + '\n' + tableCustomer.find(".colStreetAddress").text() + '\n' + tableCustomer.find(".colCity").text() + ' ' + tableCustomer.find(".colState").text() + ' ' + tableCustomer.find(".colZipCode").text() + '\n' + tableCustomer.find(".colCountry").text();
        $('#txabillingAddress').val(postalAddress);
        $('#pdfCustomerAddress').html(postalAddress);
        $('.pdfCustomerAddress').text(postalAddress);
        $('#txaShipingInfo').val(postalAddress);
        $('#sltTerms').val(tableCustomer.find(".colCustomerTermName").text() || templateObject.defaultsaleterm.get() ||'');
        let selectedTaxCodeName = tableCustomer.find(".colCustomerTaxCode").text() || 'E';
        setCustomerInfo(selectedTaxCodeName);
    });
    function setCustomerInfo(selectedTaxCodeName){
        if (!FlowRouter.current().queryParams.customerid) {
            $('#customerListModal').modal('toggle');
        }
        let taxcodeList = templateObject.taxraterecords.get();
        let customers = templateObject.clientrecords.get();
        let $tblrows = $("#tblInvoiceLine tbody tr");
        let $printrows = $(".invoice_print tbody tr");
        //if (li.text() != undefined) {
        let selectedCustomer = $('#edtCustomerName').val();
        if (clientList) {
            for (var i = 0; i < clientList.length; i++) {
                if (clientList[i].customername == selectedCustomer) {
                    $('#edtCustomerEmail').val(clientList[i].customeremail);
                    $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
                    $('#edtCustomerName').attr('custid', clientList[i].customerid);
                    $('#edtCustomerEmail').attr('customerfirstname', clientList[i].firstname);
                    $('#edtCustomerEmail').attr('customerlastname', clientList[i].lastname);
                    $('#customerType').text(clientList[i].clienttypename || 'Default');
                    $('#customerDiscount').text(clientList[i].discount + '%' || 0 + '%');
                    $('#edtCustomerUseType').val(clientList[i].clienttypename || 'Default');
                    $('#edtCustomerUseDiscount').val(clientList[i].discount || 0);
                    let postalAddress = clientList[i].customername + '\n' + clientList[i].street + '\n' + clientList[i].street2 + ' ' + clientList[i].statecode + '\n' + clientList[i].country;
                    $('#txabillingAddress').val(postalAddress);
                    $('#pdfCustomerAddress').html(postalAddress);
                    $('.pdfCustomerAddress').text(postalAddress);
                    $('#txaShipingInfo').val(postalAddress);
                    $('#sltTerms').val(clientList[i].termsName || templateObject.defaultsaleterm.get() ||'');
                }
            }
        }
        let getCustDetails = "";
        let taxRate = "";
        if (selectedCustomer != "") {
            getCustDetails = customers.filter(customer => {
                return customer.customername == selectedCustomer
            });
            if (getCustDetails.length > 0) {
                taxRate = taxcodeList.filter(taxrate => {
                    return taxrate.codename == selectedTaxCodeName
                });

                if (taxRate.length > 0) {
                    let rate = taxRate[0].coderate;
                    let code = selectedTaxCodeName || 'E';
                    if (code == "NT") {
                        code = "E";
                    }
                    let taxcodeList = templateObject.taxraterecords.get();

                    let lineAmount = 0;
                    let subGrandTotal = 0;
                    let taxGrandTotal = 0;
                    let subDiscountTotal = 0; // New Discount
                    let taxGrandTotalPrint = 0;
                    let subGrandTotalNet = 0;
                    let taxGrandTotalNet = 0;
                    $tblrows.each(function(index) {
                        var $tblrow = $(this);
                        var qty = $tblrow.find(".lineQty").val() || 0;
                        var price = $tblrow.find(".colUnitPriceExChange").val() || 0;
                        var taxRate = $tblrow.find(".lineTaxCode").val();
                        if ($tblrow.find(".lineProductName").val() == '') {
                            $tblrow.find(".colProductName").addClass('boldtablealertsborder');
                        }
                        var taxrateamount = 0;
                        if (taxcodeList) {
                            for (var i = 0; i < taxcodeList.length; i++) {
                                if (taxcodeList[i].codename == taxRate) {
                                    taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                                }
                            }
                        }

                        var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
                        var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                        var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").text()) || 0; // New Discount
                        let lineTotalAmount = subTotal + taxTotal;

                        let lineDiscountTotal = lineDiscountPerc / 100;

                        var discountTotal = lineTotalAmount * lineDiscountTotal;
                        var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
                        var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
                        var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
                        var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
                        if (!isNaN(discountTotal)) {
                            subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;

                            document.getElementById("subtotal_discount").innerHTML = utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
                        }
                        $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

                        let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount)||0;
                        let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, ""))||0;
                        let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc||0;
                        $tblrow.find('.colUnitPriceExChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
                        $tblrow.find('.colUnitPriceIncChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

                        if (!isNaN(subTotal)) {
                            $tblrow.find('.colAmountEx').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                            $tblrow.find('.colAmountInc').text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
                            subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
                            subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
                            document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
                        }

                        if (!isNaN(taxTotal)) {
                            taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
                            taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
                            document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
                        }



                        if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                            let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                            let GrandTotalNet = (parseFloat(subGrandTotalNet)) + (parseFloat(taxGrandTotalNet));
                            document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
                            document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                            document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                            document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);

                        }
                    });

                    //if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
                    $printrows.each(function(index) {
                        var $printrows = $(this);
                        var qty = $printrows.find("#lineQty").text() || 0;
                        var price = $printrows.find("#lineUnitPrice").text() || "0";
                        var taxcode = code;
                        $printrows.find("#lineTaxCode").text(code);
                        $printrows.find("#lineTaxRate").text(rate);
                        var taxrateamount = 0;

                        if (taxcodeList) {
                            for (var i = 0; i < taxcodeList.length; i++) {
                                if (taxcodeList[i].codename == taxcode) {
                                    taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                                }
                            }
                        }

                        var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
                        var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                        $printrows.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal))
                        if (!isNaN(subTotal)) {
                            $printrows.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                            subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                            document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
                        }

                        if (!isNaN(taxTotal)) {
                            taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                            document.getElementById("totalTax_totalPrint").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalPrint);
                        }
                        if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                            let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                            document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                            //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                            document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

                        }
                    });
                    //}

                }
            }
        }
        $('#tblCustomerlist_filter .form-control-sm').val('');
        setTimeout(function() {
            //$('#tblCustomerlist_filter .form-control-sm').focus();
            $('.btnRefreshCustomer').trigger('click');
            LoadingOverlay.hide();
        }, 1000);
        // }
    }

    $('#sltTerms').editableSelect()
        .on('click.editable-select', function(e, li) {

            var $earch = $(this);
            var offset = $earch.offset();
            var termsDataName = e.target.value || '';
            $('#edtTermsID').val('');
            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#termsListModal').modal('toggle');
            } else {
                if (termsDataName.replace(/\s/g, '') != '') {
                    $('#termModalHeader').text('Edit Terms');
                    getVS1Data('TTermsVS1').then(function(dataObject) { //edit to test indexdb
                        if (dataObject.length == 0) {
                            LoadingOverlay.show();
                            sideBarService.getTermsVS1().then(function(data) {
                                for (let i in data.ttermsvs1) {
                                    if (data.ttermsvs1[i].TermsName === termsDataName) {
                                        $('#edtTermsID').val(data.ttermsvs1[i].Id);
                                        $('#edtDays').val(data.ttermsvs1[i].Days);
                                        $('#edtName').val(data.ttermsvs1[i].TermsName);
                                        $('#edtDesc').val(data.ttermsvs1[i].Description);
                                        if (data.ttermsvs1[i].IsEOM === true) {
                                            $('#isEOM').prop('checked', true);
                                        } else {
                                            $('#isEOM').prop('checked', false);
                                        }
                                        if (data.ttermsvs1[i].IsEOMPlus === true) {
                                            $('#isEOMPlus').prop('checked', true);
                                        } else {
                                            $('#isEOMPlus').prop('checked', false);
                                        }
                                        if (data.ttermsvs1[i].isSalesdefault === true) {
                                            $('#chkCustomerDef').prop('checked', true);
                                        } else {
                                            $('#chkCustomerDef').prop('checked', false);
                                        }
                                        if (data.ttermsvs1[i].isPurchasedefault === true) {
                                            $('#chkSupplierDef').prop('checked', true);
                                        } else {
                                            $('#chkSupplierDef').prop('checked', false);
                                        }
                                    }
                                }
                                setTimeout(function() {
                                    LoadingOverlay.hide();
                                    $('#newTermsModal').modal('toggle');
                                }, 200);
                            });
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.ttermsvs1;
                            for (let i in useData) {
                                if (useData[i].TermsName === termsDataName) {
                                    $('#edtTermsID').val(useData[i].Id);
                                    $('#edtDays').val(useData[i].Days);
                                    $('#edtName').val(useData[i].TermsName);
                                    $('#edtDesc').val(useData[i].Description);
                                    if (useData[i].IsEOM === true) {
                                        $('#isEOM').prop('checked', true);
                                    } else {
                                        $('#isEOM').prop('checked', false);
                                    }
                                    if (useData[i].IsEOMPlus === true) {
                                        $('#isEOMPlus').prop('checked', true);
                                    } else {
                                        $('#isEOMPlus').prop('checked', false);
                                    }
                                    if (useData[i].isSalesdefault === true) {
                                        $('#chkCustomerDef').prop('checked', true);
                                    } else {
                                        $('#chkCustomerDef').prop('checked', false);
                                    }
                                    if (useData[i].isPurchasedefault === true) {
                                        $('#chkSupplierDef').prop('checked', true);
                                    } else {
                                        $('#chkSupplierDef').prop('checked', false);
                                    }
                                }
                            }
                            setTimeout(function() {
                                LoadingOverlay.hide();
                                $('#newTermsModal').modal('toggle');
                            }, 200);
                        }
                    }).catch(function(err) {
                        LoadingOverlay.show();
                        sideBarService.getTermsVS1().then(function(data) {
                            for (let i in data.ttermsvs1) {
                                if (data.ttermsvs1[i].TermsName === termsDataName) {
                                    $('#edtTermsID').val(data.ttermsvs1[i].Id);
                                    $('#edtDays').val(data.ttermsvs1[i].Days);
                                    $('#edtName').val(data.ttermsvs1[i].TermsName);
                                    $('#edtDesc').val(data.ttermsvs1[i].Description);
                                    if (data.ttermsvs1[i].IsEOM === true) {
                                        $('#isEOM').prop('checked', true);
                                    } else {
                                        $('#isEOM').prop('checked', false);
                                    }
                                    if (data.ttermsvs1[i].IsEOMPlus === true) {
                                        $('#isEOMPlus').prop('checked', true);
                                    } else {
                                        $('#isEOMPlus').prop('checked', false);
                                    }
                                    if (data.ttermsvs1[i].isSalesdefault === true) {
                                        $('#chkCustomerDef').prop('checked', true);
                                    } else {
                                        $('#chkCustomerDef').prop('checked', false);
                                    }
                                    if (data.ttermsvs1[i].isPurchasedefault === true) {
                                        $('#chkSupplierDef').prop('checked', true);
                                    } else {
                                        $('#chkSupplierDef').prop('checked', false);
                                    }
                                }
                            }
                            setTimeout(function() {
                                LoadingOverlay.hide();
                                $('#newTermsModal').modal('toggle');
                            }, 200);
                        });
                    });
                } else {
                    $('#termsListModal').modal();
                    setTimeout(function() {
                        $('#termsList_filter .form-control-sm').focus();
                        $('#termsList_filter .form-control-sm').val('');
                        $('#termsList_filter .form-control-sm').trigger("input");
                        var datatable = $('#termsList').DataTable();
                        datatable.draw();
                        $('#termsList_filter .form-control-sm').trigger("input");
                    }, 500);
                }
            }
        });

    $('#sltDept').editableSelect()
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
                            LoadingOverlay.show();
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
                                    LoadingOverlay.hide();
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
                                LoadingOverlay.hide();
                                $('#newDepartmentModal').modal('toggle');
                            }, 200);
                        }
                    }).catch(function(err) {
                        LoadingOverlay.show();
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
                                LoadingOverlay.hide();
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

    $('#sltStatus').editableSelect()
        .on('click.editable-select', function(e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            $('#statusId').val('');
            var statusDataName = e.target.value || '';
            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#statusPopModal').modal('toggle');
            } else {
                if (statusDataName.replace(/\s/g, '') != '') {
                    $('#newStatusHeader').text('Edit Status');
                    $('#newStatus').val(statusDataName);

                    getVS1Data('TLeadStatusType').then(function(dataObject) {
                        if (dataObject.length == 0) {
                            LoadingOverlay.show();
                            sideBarService.getAllLeadStatus().then(function(data) {
                                for (let i in data.tleadstatustype) {
                                    if (data.tleadstatustype[i].TypeName === statusDataName) {
                                        $('#statusId').val(data.tleadstatustype[i].Id);
                                    }
                                }
                                setTimeout(function() {
                                    LoadingOverlay.hide();
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
                            setTimeout(function() {
                                LoadingOverlay.hide();
                                $('#newStatusPopModal').modal('toggle');
                            }, 200);
                        }
                    }).catch(function(err) {
                        LoadingOverlay.show();
                        sideBarService.getAllLeadStatus().then(function(data) {
                            for (let i in data.tleadstatustype) {
                                if (data.tleadstatustype[i].TypeName === statusDataName) {
                                    $('#statusId').val(data.tleadstatustype[i].Id);

                                }
                            }
                            setTimeout(function() {
                                LoadingOverlay.hide();
                                $('#newStatusPopModal').modal('toggle');
                            }, 200);
                        });
                    });
                    setTimeout(function() {
                        LoadingOverlay.hide();
                        $('#newStatusPopModal').modal('toggle');
                    }, 200);

                } else {
                    $('#statusPopModal').modal();
                    setTimeout(function() {
                        $('#tblStatusPopList_filter .form-control-sm').focus();
                        $('#tblStatusPopList_filter .form-control-sm').val('');
                        $('#tblStatusPopList_filter .form-control-sm').trigger("input");
                        var datatable = $('#tblStatusPopList').DataTable();

                        datatable.draw();
                        $('#tblStatusPopList_filter .form-control-sm').trigger("input");

                    }, 500);
                }
            }
        });

    $('#sltCurrency').editableSelect()
        .on('click.editable-select', function(e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            var currencyDataName = e.target.value || '';
            $('#edtCurrencyID').val('');
            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#currencyModal').modal('toggle');
            } else {
                if (currencyDataName.replace(/\s/g, '') != '') {
                    $('#add-currency-title').text('Edit Currency');
                    $('#sedtCountry').prop('readonly', true);
                    getVS1Data('TCurrency').then(function(dataObject) {
                        if (dataObject.length == 0) {
                            LoadingOverlay.show();
                            sideBarService.getCurrencies().then(function(data) {
                                for (let i in data.tcurrency) {
                                    if (data.tcurrency[i].Code === currencyDataName) {
                                        $('#edtCurrencyID').val(data.tcurrency[i].Id);
                                        setTimeout(function() {
                                            $('#sedtCountry').val(data.tcurrency[i].Country);
                                        }, 200);
                                        //$('#sedtCountry').val(data.tcurrency[i].Country);
                                        $('#currencyCode').val(currencyDataName);
                                        $('#currencySymbol').val(data.tcurrency[i].CurrencySymbol);
                                        $('#edtCurrencyName').val(data.tcurrency[i].Currency);
                                        $('#edtCurrencyDesc').val(data.tcurrency[i].CurrencyDesc);
                                        $('#edtBuyRate').val(data.tcurrency[i].BuyRate);
                                        $('#edtSellRate').val(data.tcurrency[i].SellRate);
                                    }
                                }
                                setTimeout(function() {
                                    LoadingOverlay.hide();
                                    $('#newCurrencyModal').modal('toggle');
                                    $('#sedtCountry').attr('readonly', true);
                                }, 200);
                            });
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.tcurrency;
                            for (let i = 0; i < data.tcurrency.length; i++) {
                                if (data.tcurrency[i].Code === currencyDataName) {
                                    $('#edtCurrencyID').val(data.tcurrency[i].Id);
                                    $('#sedtCountry').val(data.tcurrency[i].Country);
                                    $('#currencyCode').val(currencyDataName);
                                    $('#currencySymbol').val(data.tcurrency[i].CurrencySymbol);
                                    $('#edtCurrencyName').val(data.tcurrency[i].Currency);
                                    $('#edtCurrencyDesc').val(data.tcurrency[i].CurrencyDesc);
                                    $('#edtBuyRate').val(data.tcurrency[i].BuyRate);
                                    $('#edtSellRate').val(data.tcurrency[i].SellRate);
                                }
                            }
                            setTimeout(function() {
                                LoadingOverlay.hide();
                                $('#newCurrencyModal').modal('toggle');
                            }, 200);
                        }

                    }).catch(function(err) {
                        LoadingOverlay.show();
                        sideBarService.getCurrencies().then(function(data) {
                            for (let i in data.tcurrency) {
                                if (data.tcurrency[i].Code === currencyDataName) {
                                    $('#edtCurrencyID').val(data.tcurrency[i].Id);
                                    setTimeout(function() {
                                        $('#sedtCountry').val(data.tcurrency[i].Country);
                                    }, 200);
                                    //$('#sedtCountry').val(data.tcurrency[i].Country);
                                    $('#currencyCode').val(currencyDataName);
                                    $('#currencySymbol').val(data.tcurrency[i].CurrencySymbol);
                                    $('#edtCurrencyName').val(data.tcurrency[i].Currency);
                                    $('#edtCurrencyDesc').val(data.tcurrency[i].CurrencyDesc);
                                    $('#edtBuyRate').val(data.tcurrency[i].BuyRate);
                                    $('#edtSellRate').val(data.tcurrency[i].SellRate);
                                }
                            }
                            setTimeout(function() {
                                LoadingOverlay.hide();
                                $('#newCurrencyModal').modal('toggle');
                                $('#sedtCountry').attr('readonly', true);
                            }, 200);
                        });
                    });

                } else {
                    $('#currencyModal').modal();
                    setTimeout(function() {
                        $('#tblCurrencyPopList_filter .form-control-sm').focus();
                        $('#tblCurrencyPopList_filter .form-control-sm').val('');
                        $('#tblCurrencyPopList_filter .form-control-sm').trigger("input");
                        var datatable = $('#tblCurrencyPopList').DataTable();
                        datatable.draw();
                        $('#tblCurrencyPopList_filter .form-control-sm').trigger("input");
                    }, 500);
                }
            }
        });

    $('#edtCustomerName').editableSelect()
        .on('click.editable-select', function(e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            $('#edtCustomerPOPID').val('');
            var customerDataName = e.target.value || '';
            var customerDataID = $('#edtCustomerName').attr('custid').replace(/\s/g, '') || '';
            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#customerListModal').modal();
                setTimeout(function() {
                    $('#tblCustomerlist_filter .form-control-sm').focus();
                    $('#tblCustomerlist_filter .form-control-sm').val('');
                    $('#tblCustomerlist_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblCustomerlist').DataTable();
                    //datatable.clear();
                    //datatable.rows.add(splashArrayCustomerList);
                    datatable.draw();
                    $('#tblCustomerlist_filter .form-control-sm').trigger("input");
                    //$('#tblCustomerlist').dataTable().fnFilter(' ').draw(false);
                }, 500);
            } else {
                if (customerDataName.replace(/\s/g, '') != '') {
                    //FlowRouter.go('/customerscard?name=' + e.target.value);
                    $('#edtCustomerPOPID').val('');
                    getVS1Data('TCustomerVS1').then(function(dataObject) {
                        if (dataObject.length == 0) {
                            LoadingOverlay.show();
                            sideBarService.getOneCustomerDataExByName(customerDataName).then(function(data) {
                                LoadingOverlay.hide();
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

                                setTimeout(function() {
                                    $('#addCustomerModal').modal('show');
                                }, 200);
                            }).catch(function(err) {
                                LoadingOverlay.hide();
                            });
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.tcustomervs1;

                            var added = false;
                            for (let i = 0; i < data.tcustomervs1.length; i++) {
                                if (data.tcustomervs1[i].fields.ClientName === customerDataName) {
                                    let lineItems = [];
                                    added = true;
                                    LoadingOverlay.hide();
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

                                    setTimeout(function() {
                                        $('#addCustomerModal').modal('show');
                                    }, 200);

                                }
                            }
                            if (!added) {
                                LoadingOverlay.show();
                                sideBarService.getOneCustomerDataExByName(customerDataName).then(function(data) {
                                    LoadingOverlay.hide();
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

                                    setTimeout(function() {
                                        $('#addCustomerModal').modal('show');
                                    }, 200);
                                }).catch(function(err) {
                                    LoadingOverlay.hide();
                                });
                            }
                        }
                    }).catch(function(err) {
                        sideBarService.getOneCustomerDataExByName(customerDataName).then(function(data) {
                            LoadingOverlay.hide();
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

                            setTimeout(function() {
                                $('#addCustomerModal').modal('show');
                            }, 200);
                        }).catch(function(err) {
                            LoadingOverlay.hide();
                        });
                    });
                } else {
                    $('#customerListModal').modal();
                    setTimeout(function() {
                        $('#tblCustomerlist_filter .form-control-sm').focus();
                        $('#tblCustomerlist_filter .form-control-sm').val('');
                        $('#tblCustomerlist_filter .form-control-sm').trigger("input");
                        var datatable = $('#tblCustomerlist').DataTable();
                        //datatable.clear();
                        //datatable.rows.add(splashArrayCustomerList);
                        datatable.draw();
                        $('#tblCustomerlist_filter .form-control-sm').trigger("input");
                        //$('#tblCustomerlist').dataTable().fnFilter(' ').draw(false);
                    }, 500);
                }
            }
        });

    $(document).on("click", "#paymentmethodList tbody tr", function(e) {
        $('#sltPaymentMethod').val($(this).find(".colName").text());
        $('#paymentMethodModal').modal('toggle');
    });

    $('#sltPaymentMethod').editableSelect()
       .on('click.editable-select', function(e, li) {
           var $earch = $(this);
           var offset = $earch.offset();
           var paymentDataName = e.target.value || '';
           $('#edtPaymentMethodID').val('');
           if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
               $('#paymentMethodModal').modal('toggle');
           } else {
               if (paymentDataName.replace(/\s/g, '') != '') {
                   $('#paymentMethodHeader').text('Edit Payment Method');

                   getVS1Data('TPaymentMethod').then(function(dataObject) {
                       if (dataObject.length == 0) {
                           LoadingOverlay.show();
                           sideBarService.getPaymentMethodDataVS1().then(function(data) {
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
                               setTimeout(function() {
                                   LoadingOverlay.hide();
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
                           setTimeout(function() {
                               LoadingOverlay.hide();
                               $('#newPaymentMethodModal').modal('toggle');
                           }, 200);
                       }
                   }).catch(function(err) {
                       LoadingOverlay.show();
                       sideBarService.getPaymentMethodDataVS1().then(function(data) {
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
                           setTimeout(function() {
                               LoadingOverlay.hide();
                               $('#newPaymentMethodModal').modal('toggle');
                           }, 200);
                       });
                   });
               } else {
                   $('#paymentMethodModal').modal();
                   setTimeout(function() {
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

    exportSalesToPdf1 = function() {


        let invoice_data = templateObject.invoicerecord.get();
        document.getElementById('html-2-pdfwrapper').style.display = 'block';

        let subtotal = $('#subtotal_total').text();
        let net = $('#subtotal_nett').text();
        let subtotal_discount = $('#subtotal_discount').text();
        let grandTotal = $('#grandTotal').text();
        let totalPaidAmt = $('#totalPaidAmt').text();
        let totalBalanceDue = $('#totalBalanceDue').text();


        let taxItems = {};
        $('#tblInvoiceLine > tbody > tr').each(function () {
            var lineID = this.id;
            let targetRow = $('#' + lineID);
            let targetTaxCode = targetRow.find('.lineTaxCode').val();
            let qty = targetRow.find(".lineQty").val() || 0
            let price = targetRow.find('.colUnitPriceExChange').val() || 0;
            const taxDetail = templateObject.taxcodes.get().find((v) => v.CodeName === targetTaxCode);

            if (taxDetail) {
                let priceTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, ""));
                let taxTotal = priceTotal * parseFloat(taxDetail.Rate);
                if (taxDetail.Lines) {
                    taxDetail.Lines.map((line) => {
                        let taxCode = line.SubTaxCode;
                        let amount = priceTotal * line.Percentage / 100;
                        if (taxItems[taxCode]) {
                            taxItems[taxCode] += amount;
                        }
                        else {
                            taxItems[taxCode] = amount;
                        }
                    });
                }
                else {
                    // taxItems[targetTaxCode] = taxTotal;
                }
            }
        });

        if(taxItems && Object.keys(taxItems).length>0) {
            $("#html-2-pdfwrapper #tax_list_print").html("");
            Object.keys(taxItems).map((code) => {
                let html = `
                    <div style="width: 100%; display: flex;">
                        <div style="padding-right: 16px; width: 50%;">
                            <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
                                ${code}</p>
                        </div>
                        <div style="padding-left: 16px; width: 50%;">
                            <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
                                $${taxItems[code].toFixed(3)}</p>
                        </div>
                    </div>
                `;
                $("#html-2-pdfwrapper #tax_list_print").append(html);
            });
        } else {
            $("#html-2-pdfwrapper #tax_list_print").remove();
        }

        $("#html-2-pdfwrapper #subtotal_totalPrint").html(subtotal);
        $("#html-2-pdfwrapper #grandTotalPrint").html(grandTotal);
        $("#html-2-pdfwrapper #totalpaidamount").html(totalPaidAmt);
        $("#html-2-pdfwrapper #totalBalanceDuePrint").html(totalBalanceDue);

        var source = document.getElementById('html-2-pdfwrapper');
        let id = invoice_data.id;
        var pdf = new jsPDF('p', 'pt', 'a4');
        let file = "refund "+id+".pdf";
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
                //$(".btnSave").trigger("click");
                $('#html-2-pdfwrapper').css('display', 'none');
                LoadingOverlay.hide();
            } else {
                document.getElementById('html-2-pdfwrapper').style.display="none";
                $('#html-2-pdfwrapper').css('display', 'none');
                LoadingOverlay.hide();
            }
        });


        return true;


    };

    exportSalesToPdf = async function (template_title,number)
    {
            if(template_title == 'Refunds')
            {
                await showRefund1(template_title, number, true);
            }

            let margins = {
                top: 0,
                bottom: 0,
                left: 0,
                width: 100
            };

            let invoice_data = templateObject.invoicerecord.get();
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

            let file = "Refunds.pdf";
            if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
                if(template_title == 'Refunds')
                {
                    file = 'Refund-' + invoice_data.id + '.pdf';
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
                let base64data = data.split(',')[1];
                let refundId  = FlowRouter.current().queryParams.id?FlowRouter.current().queryParams.id: ''
                pdfObject = {
                    filename: 'Refund-' + refundId + '.pdf',
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
                if(values.length > 0) {
                  values.forEach(value => {
                      let reportData = JSON.parse(value);
                      let temp = {... reportData};

                      temp.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                      reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                      temp.attachments = attachment;
                      if (temp.BasedOnType.includes("P")) {
                          if (temp.FormID == 1) {
                              let formIds = temp.FormIDs.split(',');
                              if (formIds.includes("74")) {
                                  temp.FormID = 74;
                                  Meteor.call('sendNormalEmail', temp);
                              }
                          } else {
                              if (temp.FormID == 74)
                                  Meteor.call('sendNormalEmail', temp);
                          }
                      }
                  });
                }

            });

            html2pdf().set(opt).from(source).save().then(function (dataObject) {
                if ($('.printID').attr('id') == undefined || $('.printID').attr('id') == "") {
                    //$(".btnSave").trigger("click");
                } else {
                    
                }
                $('#html-2-pdfwrapper_new').css('display', 'none');
                $('#html-2-pdfwrapper').css('display', 'none');
                $("#html-2-pdfwrapper_quotes").hide();
                $("#html-2-pdfwrapper_quotes2").hide();
                $("#html-2-pdfwrapper_quotes3").hide();
                $('.fullScreenSpin').css("display", "none");
            });

            return true;
    }
});

Template.refundcard.onRendered(function() {
    let tempObj = Template.instance();
    let utilityService = new UtilityService();
    let productService = new ProductService();
    let salesService = new SalesBoardService();
    const taxRateService = new TaxRateService();
    let tableProductList;
    var splashArrayProductList = new Array();
    var splashArrayTaxRateList = new Array();
    const taxCodesList = [];
    const lineExtaSellItems = [];
    let taxCodes = [];

    tempObj.getAllProducts = function() {
        getVS1Data('TProductVS1').then(function(dataObject) {
            if (dataObject.length == 0) {
                productService.getNewProductListVS1().then(function(data) {

                    let records = [];
                    let inventoryData = [];
                    for (let i = 0; i < data.tproductvs1.length; i++) {
                        var dataList = [


                            data.tproductvs1[i].ProductName || '-',
                            data.tproductvs1[i].SalesDescription || '',
                            utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductvs1[i].BuyQty1Cost * 100) / 100),
                            utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductvs1[i].SellQty1Price * 100) / 100),
                            data.tproductvs1[i].TotalQtyInStock,
                            data.tproductvs1[i].TaxCodeSales || ''
                        ];

                        splashArrayProductList.push(dataList);
                    }
                    localStorage.setItem('VS1SalesProductList', JSON.stringify(splashArrayProductList));

                    if (splashArrayProductList) {

                        $('#tblInventory').dataTable({
                            data: splashArrayProductList,

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
                                    className: "costPrice text-right",
                                    "targets": [2]
                                },
                                {
                                    className: "salePrice text-right",
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
                                $("<button class='btn btn-primary btnRefreshProduct' type='button' id='btnRefreshProduct' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblInventory_filter");
                            }

                        });

                        $('div.dataTables_filter input').addClass('form-control form-control-sm');






                    }
                })
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tproductvs1;

                let records = [];
                let inventoryData = [];
                for (let i = 0; i < useData.length; i++) {
                    var dataList = [


                        useData[i].fields.ProductName || '-',
                        useData[i].fields.SalesDescription || '',
                        utilityService.modifynegativeCurrencyFormat(Math.floor(useData[i].fields.BuyQty1Cost * 100) / 100),
                        utilityService.modifynegativeCurrencyFormat(Math.floor(useData[i].fields.SellQty1Price * 100) / 100),
                        useData[i].fields.TotalQtyInStock,
                        useData[i].fields.TaxCodeSales || ''
                    ];

                    if (useData[i].fields.ExtraSellPrice != null) {
                        for (let e = 0; e < useData[i].fields.ExtraSellPrice.length; e++) {
                            let lineExtaSellObj = {
                                clienttype: useData[i].fields.ExtraSellPrice[e].fields.ClientTypeName || '',
                                productname: useData[i].fields.ExtraSellPrice[e].fields.ProductName || useData[i].fields.ProductName,
                                price: utilityService.modifynegativeCurrencyFormat(useData[i].fields.ExtraSellPrice[e].fields.Price1) || 0
                            };
                            lineExtaSellItems.push(lineExtaSellObj);

                        }
                    }

                    splashArrayProductList.push(dataList);
                }
                localStorage.setItem('VS1SalesProductList', JSON.stringify(splashArrayProductList));
                tempObj.productextrasellrecords.set(lineExtaSellItems);
                if (splashArrayProductList) {

                    $('#tblInventory').dataTable({
                        data: splashArrayProductList,

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
                                className: "costPrice text-right",
                                "targets": [2]
                            },
                            {
                                className: "salePrice text-right",
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
                            $("<button class='btn btn-primary btnRefreshProduct' type='button' id='btnRefreshProduct' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblInventory_filter");
                        }

                    });

                    $('div.dataTables_filter input').addClass('form-control form-control-sm');






                }
            }
        }).catch(function(err) {
            productService.getNewProductListVS1().then(function(data) {

                let records = [];
                let inventoryData = [];
                for (let i = 0; i < data.tproductvs1.length; i++) {
                    var dataList = [


                        data.tproductvs1[i].ProductName || '-',
                        data.tproductvs1[i].SalesDescription || '',
                        utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductvs1[i].BuyQty1Cost * 100) / 100),
                        utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductvs1[i].SellQty1Price * 100) / 100),
                        data.tproductvs1[i].TotalQtyInStock,
                        data.tproductvs1[i].TaxCodeSales || ''
                    ];

                    splashArrayProductList.push(dataList);
                }
                localStorage.setItem('VS1SalesProductList', JSON.stringify(splashArrayProductList));

                if (splashArrayProductList) {

                    $('#tblInventory').dataTable({
                        data: splashArrayProductList,

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
                                className: "costPrice text-right",
                                "targets": [2]
                            },
                            {
                                className: "salePrice text-right",
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
                            $("<button class='btn btn-primary btnRefreshProduct' type='button' id='btnRefreshProduct' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblInventory_filter");
                        }

                    });

                    $('div.dataTables_filter input').addClass('form-control form-control-sm');






                }
            })
        });
    };

    //tempObj.getAllProducts();

    tempObj.getAllTaxCodes = function() {
        getVS1Data('TTaxcodeVS1').then(function(dataObject) {
            if (dataObject.length == 0) {
                salesService.getTaxCodesDetailVS1().then(function(data) {

                    let records = [];
                    let inventoryData = [];
                    taxCodes = data.ttaxcodevs1;
                    tempObj.taxcodes.set(taxCodes);
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
                taxCodes = data.ttaxcodevs1;
                tempObj.taxcodes.set(taxCodes);
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
            salesService.getTaxCodesDetailVS1().then(function(data) {

                let records = [];
                let inventoryData = [];
                taxCodes = data.ttaxcodevs1;
                tempObj.taxcodes.set(taxCodes);
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

    tempObj.getSubTaxCodes = function () {
        let subTaxTableList = [];

        getVS1Data("TSubTaxVS1")
          .then(function (dataObject) {
            if (dataObject.length == 0) {
              taxRateService.getSubTaxCode().then(function (data) {
                for (let i = 0; i < data.tsubtaxcode.length; i++) {
                  var dataList = {
                    id: data.tsubtaxcode[i].Id || "",
                    codename: data.tsubtaxcode[i].Code || "-",
                    description: data.tsubtaxcode[i].Description || "-",
                    category: data.tsubtaxcode[i].Category || "-",
                  };

                  subTaxTableList.push(dataList);
                }

                tempObj.subtaxcodes.set(subTaxTableList);
              });
            } else {
              let data = JSON.parse(dataObject[0].data);
              let useData = data.tsubtaxcode;
              for (let i = 0; i < useData.length; i++) {
                var dataList = {
                  id: useData[i].Id || "",
                  codename: useData[i].Code || "-",
                  description: useData[i].Description || "-",
                  category: useData[i].Category || "-",
                };

                subTaxTableList.push(dataList);
              }

              tempObj.subtaxcodes.set(subTaxTableList);
            }
          })
          .catch(function (err) {
            taxRateService.getSubTaxCode().then(function (data) {
              for (let i = 0; i < data.tsubtaxcode.length; i++) {
                var dataList = {
                  id: data.tsubtaxcode[i].Id || "",
                  codename: data.tsubtaxcode[i].Code || "-",
                  description: data.tsubtaxcode[i].Description || "-",
                  category: data.tsubtaxcode[i].Category || "-",
                };

                subTaxTableList.push(dataList);
              }

              tempObj.subtaxcodes.set(subTaxTableList);
            });
          });
    };

    tempObj.getSubTaxCodes();

    // custom field displaysettings
    tempObj.initCustomFieldDisplaySettings = function(data, listType) {
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
      tempObj.displayfields.set(custFields);
    }

    tempObj.initCustomFieldDisplaySettings("", "tblRefundLine");

    // tempObj.getAllCustomFieldDisplaySettings = function () {

    //   let listType = 'ltSaleslines';   // tempcode until InvoiceLines is added on backend
    //   try {
    //     getVS1Data("TltSaleslines").then(function (dataObject) {
    //       if (dataObject.length == 0) {
    //         sideBarService.getAllCustomFieldsWithQuery(listType).then(function (data) {
    //           initCustomFieldDisplaySettings(data, listType);
    //           addVS1Data("TltSaleslines", JSON.stringify(data));
    //         });
    //       } else {
    //         let data = JSON.parse(dataObject[0].data);
    //         if(data.tcustomfieldlist.length == 0){
    //           sideBarService.getAllCustomFieldsWithQuery(listType).then(function (data) {
    //             initCustomFieldDisplaySettings(data, listType);
    //             addVS1Data("TltSaleslines", JSON.stringify(data));
    //           });
    //         } else {
    //           initCustomFieldDisplaySettings(data, listType);
    //           sideBarService.getAllCustomFieldsWithQuery(listType).then(function (data) {
    //             addVS1Data("TltSaleslines", JSON.stringify(data));
    //           });
    //         }
    //       }
    //     })

    //   } catch (error) {
    //   }
    // }

    // tempObj.getAllCustomFieldDisplaySettings();

});
Template.refundcard.helpers({
    isCurrencyEnable: () => FxGlobalFunctions.isCurrencyEnabled(),
    // custom field displaysettings
    displayfields: () => {
      return Template.instance().displayfields.get();
    },

        getTemplateList: function () {
            return template_list;
        },

        getTemplateNumber: function () {
            let template_numbers = ["1", "2", "3"];
            return template_numbers;
        },

        bsbRegionName: () => {
            return bsbCodeName;
        },


        isBatchSerialNoTracking: () => {
            return Session.get('CloudShowSerial') || false;
        },
        invoicerecord: () => {
            return Template.instance().invoicerecord.get();
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

        vs1companyBankAccountName: () => {
            return localStorage.getItem('vs1companyBankAccountName') || '';
        },
        vs1companyBankAccountNo: () => {
            return localStorage.getItem('vs1companyBankAccountNo') || '';
        },

        vs1companyBankBSB: () => {
            return localStorage.getItem('vs1companyBankBSB') || '';
        },
        vs1companyBankSwiftCode: () => {
            return localStorage.getItem('vs1companyBankSwiftCode') || '';
        },
        vs1companyBankRoutingNo: () => {
            return localStorage.getItem('vs1companyBankRoutingNo') || '';
        },
        custfield1: () => {
            return localStorage.getItem('custfield1sales') || 'Custom Field 1';
        },
        custfield2: () => {
            return localStorage.getItem('custfield2sales') || 'Custom Field 2';
        },
        custfield3: () => {
            return localStorage.getItem('custfield3sales') || 'Custom Field 3';
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
        clientrecords: () => {
            return Template.instance().clientrecords.get().sort(function(a, b) {
                if (a.customername == 'NA') {
                    return 1;
                } else if (b.customername == 'NA') {
                    return -1;
                }
                return (a.customername.toUpperCase() > b.customername.toUpperCase()) ? 1 : -1;
            });
        },
        salesCloudPreferenceRec: () => {
            return CloudPreference.findOne({
                userid: Session.get('mycloudLogonID'),
                PrefName: 'refundcard'
            });
        },
        salesCloudGridPreferenceRec: () => {
            return CloudPreference.findOne({
                userid: Session.get('mycloudLogonID'),
                PrefName: 'tblInvoiceLine'
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

         let phone = "Phone: "+ Session.get('vs1companyPhone');
         return phone;

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
            if(["Amount (Ex)", "Amount (Inc)", "Tax Amt", "Unit Price (Ex)", "Unit Price (Inc)"].includes(displayfield.custfieldlabel))
            {
                if(Template.instance().isForeignEnabled.get() == true) {
                    return 2
                }
                return 1;
            }
            return 1;
        },

        subHeaderForeign: (displayfield) => {

            if(["Amount (Ex)", "Amount (Inc)", "Tax Amt", "Unit Price (Ex)", "Unit Price (Inc)"].includes(displayfield.custfieldlabel)) {
                return true;
            }
            return false;
        },
});

Template.refundcard.events({
  'click .btnRefreshCustomField': function (event) {
      LoadingOverlay.show();
      let templateObject = Template.instance();
      sideBarService.getAllCustomFields().then(function (data) {
        addVS1Data('TCustomFieldList', JSON.stringify(data)).then(function (datareturn) {
            Meteor._reload.reload();
        }).catch(function (err) {
            Meteor._reload.reload();
        });
            templateObject.getSalesCustomFieldsList();
          LoadingOverlay.hide();
      }).catch(function (err) {
          LoadingOverlay.hide();
      });
    },

    'click  #open_print_confirm':function(event)
    {
        playPrintAudio();
        setTimeout(function(){
        if($('#choosetemplate').is(':checked'))
        {
            $('#templateselection').modal('show');
        }
        else
        {

            LoadingOverlay.show();
            $('#html-2-pdfwrapper').css('display', 'block');
            if ($('.edtCustomerEmail').val() != "") {
                $('.pdfCustomerName').html($('#edtCustomerName').val());
                $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));
                $('#printcomment').html($('#txaComment').val().replace(/[\r\n]/g, "<br />"));
                var ponumber = $('#ponumber').val() || '.';
                $('.po').text(ponumber);
                var rowCount = $('.tblInvoiceLine tbody tr').length;
                exportSalesToPdf1();
            }

            $('#confirmprint').modal('hide');
        }
    }, delayTimeAfterSound);
    },

    'click #choosetemplate':function(event)
    {
        if($('#choosetemplate').is(':checked'))
        {
            $('#templateselection').modal('show');
        }
        else
        {
        $('#templateselection').modal('hide');
        }

    },
    'click #edtSaleCustField1': function(event) {
        clickedInput = "one";
        $('#clickedControl').val(clickedInput);
    },
    'click #edtSaleCustField2': function(event) {
        clickedInput = "two";
        $('#clickedControl').val(clickedInput);
    },
    'click #edtSaleCustField3': function(event) {
        clickedInput = "three";
        $('#clickedControl').val(clickedInput);
    },
    // 'click .btnAddNewCustField': function(event) {
    //   let templateObject = Template.instance();
    //     let isDropDown = true;
    //     let statusvalID = $("#selectCustFieldID").val()||'';
    //     $("#statusId1").val(statusvalID);
    //     $('#isdropDown').val(isDropDown);
    //     $('#newCustomFieldPop').modal('toggle');
    //     $('#customFieldList').modal('toggle');
    //     let custfieldarr = templateObject.custfields.get();
    //     if(custfieldarr[0].id == statusvalID){
    //       if(Array.isArray(custfieldarr[0].dropdown)) {
    //           // $('.btnAddNewTextBox').nextAll().remove();
    //           //$('.customText').val(custfieldarr[0].dropdown[0].fields.Text);
    //           for(let x = 0; x < custfieldarr[0].dropdown.length; x++) {
    //               $('.dropDownSection').append('<div class="row textBoxSection" id="textBoxSection" style="padding:5px; display:none;">'+
    //                                   '<div class="col-10">'+
    //                                       '<input type="text" style="" name="customText" class="form-control customText" token="'+custfieldarr[0].dropdown[x].fields.ID+'" value="'+ custfieldarr[0].dropdown[x].fields.Text+'" autocomplete="off">'+
    //                                   '</div>'+
    //                                   '<div class="col-2">'+
    //                                       '<button type="button" class="btn btn-danger btn-rounded btnRemoveDropOptions" autocomplete="off"><i class="fa fa-remove"></i></button>'+
    //                                   '</div>'+
    //                               '</div>');
    //           }

    //       } else if(Object.keys(custfieldarr[0].dropdown).length > 0) {
    //           // $('.btnAddNewTextBox').nextAll().remove();
    //            $('.dropDownSection').append('<div class="row textBoxSection" id="textBoxSection" style="padding:5px; display:none;">'+
    //                                   '<div class="col-10">'+
    //                                       '<input type="text" style="" name="customText" class="form-control customText" token="'+custfieldarr[0].dropdown.fields.ID+'" value="'+ custfieldarr[0].dropdown.fields.Text+'" autocomplete="off">'+
    //                                   '</div>'+
    //                                   '<div class="col-2">'+
    //                                       '<button type="button" class="btn btn-danger btn-rounded btnRemoveDropOptions" autocomplete="off"><i class="fa fa-remove"></i></button>'+
    //                                   '</div>'+
    //                               '</div>');

    //       }
    //     }

    // },
    'click #edtCustomerName': function(event) {
        $('#edtCustomerName').select();
        $('#edtCustomerName').editableSelect();
    },
    'click #sltCurrency': function(event) {
        $('#sltCurrency').select();
        $('#sltCurrency').editableSelect();
    },
    'click #sltTerms': function(event) {
        $('#sltTerms').select();
        $('#sltTerms').editableSelect();
    },
    'click #sltDept': function(event) {
        $('#sltDept').select();
        $('#sltDept').editableSelect();
    },
    'click #sltStatus': function(event) {
        $('#sltStatus').select();
        $('#sltStatus').editableSelect();
    },
    // 'change #sltStatus': function() {
    //     let status = $('#sltStatus').find(":selected").val();
    //     if (status == "newstatus") {
    //         $('#statusModal').modal();
    //     }
    // },
    // 'click .btnSaveStatus': function() {
    //     LoadingOverlay.show();
    //     let clientService = new SalesBoardService()
    //     let status = $('#status').val();
    //     let leadData = {
    //         type: 'TLeadStatusType',
    //         fields: {
    //             TypeName: status,
    //             KeyValue: status
    //         }
    //     }
    //
    //     if (status != "") {
    //         clientService.saveLeadStatus(leadData).then(function(objDetails) {
    //             sideBarService.getAllLeadStatus().then(function(dataUpdate) {
    //                 addVS1Data('TLeadStatusType', JSON.stringify(dataUpdate)).then(function(datareturn) {
    //                     LoadingOverlay.hide();
    //                     let id = $('.printID').attr("id");
    //                     window.open("/refundcard");
    //                 }).catch(function(err) {
    //
    //                 });
    //             }).catch(function(err) {
    //
    //                 window.open('/refundcard', '_self');
    //             });
    //         }).catch(function(err) {
    //             LoadingOverlay.hide();
    //
    //             swal({
    //                 title: 'Oooops...',
    //                 text: err,
    //                 type: 'error',
    //                 showCancelButton: false,
    //                 confirmButtonText: 'Try Again'
    //             }).then((result) => {
    //                 if (result.value) {
    //
    //                 } else if (result.dismiss === 'cancel') {
    //
    //                 }
    //             });
    //
    //             LoadingOverlay.hide();
    //         });
    //     } else {
    //         LoadingOverlay.hide();
    //         swal({
    //             title: 'Please Enter Status',
    //             text: "Status field cannot be empty",
    //             type: 'warning',
    //             showCancelButton: false,
    //             confirmButtonText: 'Try Again'
    //         }).then((result) => {
    //             if (result.value) {} else if (result.dismiss === 'cancel') {
    //
    //             }
    //         });
    //     }
    // },
    'blur .lineQty': function(event) {
        let templateObject = Template.instance();
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();
        let $tblrows = $("#tblInvoiceLine tbody tr");

        let lineAmount = 0;
        let subGrandTotal = 0;
        let taxGrandTotal = 0;
        let subDiscountTotal = 0; // New Discount
        let taxGrandTotalPrint = 0;

        let subGrandTotalNet = 0;
        let taxGrandTotalNet = 0;
        $tblrows.each(function(index) {
            var $tblrow = $(this);
            var qty = $tblrow.find(".lineQty").val() || 0;
            var price = $tblrow.find(".colUnitPriceExChange").val() || 0;
            var taxRate = $tblrow.find(".lineTaxCode").val();

            var taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxRate) {
                        taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                    }
                }
            }

            var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
            var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
            var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").text()) || 0; // New Discount
            let lineTotalAmount = subTotal + taxTotal;

            let lineDiscountTotal = lineDiscountPerc / 100;

            var discountTotal = lineTotalAmount * lineDiscountTotal;
            var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
            var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
            var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
            var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
            if (!isNaN(discountTotal)) {
                subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;

                document.getElementById("subtotal_discount").innerHTML = utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
            }
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

            let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount)||0;
            let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, ""))||0;
            let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc||0;
            $tblrow.find('.colUnitPriceExChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
            $tblrow.find('.colUnitPriceIncChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

            if (!isNaN(subTotal)) {
              $tblrow.find('.colAmountEx').text(utilityService.modifynegativeCurrencyFormat(subTotal));
              $tblrow.find('.colAmountInc').text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
                subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
                subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
                document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
            }

            if (!isNaN(taxTotal)) {
                taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
                taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
                document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
            }



            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                let GrandTotalNet = (parseFloat(subGrandTotalNet)) + (parseFloat(taxGrandTotalNet));
                document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
                document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);

            }
        });

    },
    'change .colUnitPriceExChange': function(event) {

        let utilityService = new UtilityService();
        if (!isNaN($(event.target).val())) {
            let inputUnitPrice = parseFloat($(event.target).val()) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2
            })));
        } else {
            let inputUnitPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) || 0;

            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2
            })));


        }
        let templateObject = Template.instance();
        let taxcodeList = templateObject.taxraterecords.get();

        let $tblrows = $("#tblInvoiceLine tbody tr");

        let lineAmount = 0;
        let subGrandTotal = 0;
        let taxGrandTotal = 0;
        let subDiscountTotal = 0; // New Discount
        let taxGrandTotalPrint = 0;

        let subGrandTotalNet = 0;
        let taxGrandTotalNet = 0;
        $tblrows.each(function(index) {
            var $tblrow = $(this);
            var qty = $tblrow.find(".lineQty").val() || 0;
            var price = $tblrow.find(".colUnitPriceExChange").val() || 0;
            var taxRate = $tblrow.find(".lineTaxCode").val();

            var taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxRate) {
                        taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                    }
                }
            }

            var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
            var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
            var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").text()) || 0; // New Discount
            let lineTotalAmount = subTotal + taxTotal;

            let lineDiscountTotal = lineDiscountPerc / 100;

            var discountTotal = lineTotalAmount * lineDiscountTotal;
            var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
            var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
            var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
            var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
            if (!isNaN(discountTotal)) {
                subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;

                document.getElementById("subtotal_discount").innerHTML = utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
            }
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

            let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount)||0;
            let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, ""))||0;
            let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc||0;
            $tblrow.find('.colUnitPriceExChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
            $tblrow.find('.colUnitPriceIncChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

            if (!isNaN(subTotal)) {
              $tblrow.find('.colAmountEx').text(utilityService.modifynegativeCurrencyFormat(subTotal));
              $tblrow.find('.colAmountInc').text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
                subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
                subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
                document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
            }

            if (!isNaN(taxTotal)) {
                taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
                taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
                document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
            }



            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                let GrandTotalNet = (parseFloat(subGrandTotalNet)) + (parseFloat(taxGrandTotalNet));
                document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
                document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);

            }
        });
    },
    'change .colUnitPriceIncChange': function (event) {

        let utilityService = new UtilityService();
        let inputUnitPrice = 0;
        if (!isNaN($(event.target).val())) {
            inputUnitPrice = parseFloat($(event.target).val()) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
        } else {
            inputUnitPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) || 0;

            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));

        }
        let templateObject = Template.instance();
        let taxcodeList = templateObject.taxraterecords.get();
        let $tblrows = $("#tblInvoiceLine tbody tr");
        let $printrows = $(".invoice_print tbody tr");
        var targetID = $(event.target).closest('tr').attr('id'); // table row ID
        let lineAmount = 0;
        let subGrandTotal = 0;
        let taxGrandTotal = 0;
        let subDiscountTotal = 0; // New Discount
        let taxGrandTotalPrint = 0;

        let subGrandTotalNet = 0;
        let taxGrandTotalNet = 0;
        $tblrows.each(function (index) {
            var $tblrow = $(this);
            var qty = $tblrow.find(".lineQty").val() || 0;
            var price = $tblrow.find(".colUnitPriceIncChange").val() || 0;
            var taxRate = $tblrow.find(".lineTaxCode").val();

            var taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxRate) {
                        taxrateamount = taxcodeList[i].coderate.replace('%', "");
                    }
                }
            }

            let taxRateAmountCalc = (parseFloat(taxrateamount) + 100)/100;

            var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) / (taxRateAmountCalc) || 0;
            var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotal) ||0;

            var subTotalExQty = (parseFloat(price.replace(/[^0-9.-]+/g, "")) / (taxRateAmountCalc)) || 0;
            var taxTotalExQty = parseFloat(price.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotalExQty) ||0;

            var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").text()) || 0; // New Discount
            let lineTotalAmount = subTotal + taxTotal;

            let lineDiscountTotal = lineDiscountPerc / 100;

            var discountTotal = lineTotalAmount * lineDiscountTotal;
            var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
            var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
            var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
            var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
            if (!isNaN(discountTotal)) {
                subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;

                document.getElementById("subtotal_discount").innerHTML = utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
            }
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

            let lineUnitPriceIncVal = Number(price.replace(/[^0-9.-]+/g, ""))||0;
            let lineUnitPriceExVal = lineUnitPriceIncVal - taxTotalExQty||0;
            $tblrow.find('.colUnitPriceExChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
            $tblrow.find('.colUnitPriceIncChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

            if (!isNaN(subTotal)) {
              $tblrow.find('.colAmountEx').text(utilityService.modifynegativeCurrencyFormat(subTotal));
              $tblrow.find('.colAmountInc').text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
                subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
                subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
                document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
            }

            if (!isNaN(taxTotal)) {
                taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
                taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
                document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
            }

            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                let GrandTotalNet = (parseFloat(subGrandTotalNet)) + (parseFloat(taxGrandTotalNet));
                document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
                document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);

            }
        });

        $('#' + targetID + " #lineUnitPrice").text($('#' + targetID + " .colUnitPriceExChange").val());

        //if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
        $printrows.each(function (index) {
            var $printrows = $(this);
            var qty = $printrows.find("#lineQty").text() || 0;
            var price = $printrows.find("#lineUnitPrice").text() || "0";
            var taxrateamount = 0;
            var taxRate = $printrows.find("#lineTaxCode").text();
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxRate) {
                        taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                    }
                }
            }

            var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
            var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
            $printrows.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal))
            if (!isNaN(subTotal)) {
                $printrows.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
            }

            if (!isNaN(taxTotal)) {
                taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                document.getElementById("totalTax_totalPrint").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalPrint);
            }
            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                // document.getElementById("totalTax").innerHTML = $('#subtotal_tax').text();
                //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

            }
        });
        //}
    },
    'click .th.colAmountEx': function(event) {
      $('.colAmountEx').addClass('hiddenColumn');
      $('.colAmountEx').removeClass('showColumn');

      $('.colAmountInc').addClass('showColumn');
      $('.colAmountInc').removeClass('hiddenColumn');

      $('.chkAmountEx').prop("checked", false);
      $('.chkAmountInc').prop("checked", true);
  },
  'click .th.colAmountInc': function(event) {
      $('.colAmountInc').addClass('hiddenColumn');
      $('.colAmountInc').removeClass('showColumn');

      $('.colAmountEx').addClass('showColumn');
      $('.colAmountEx').removeClass('hiddenColumn');

      $('.chkAmountEx').prop("checked", true);
      $('.chkAmountInc').prop("checked", false);
  },
  'click .th.colUnitPriceEx': function(event) {
      $('.colUnitPriceEx').addClass('hiddenColumn');
      $('.colUnitPriceEx').removeClass('showColumn');

      $('.colUnitPriceInc').addClass('showColumn');
      $('.colUnitPriceInc').removeClass('hiddenColumn');

      $('.chkUnitPriceEx').prop("checked", false);
      $('.chkUnitPriceInc').prop("checked", true);
  },
  'click .th.colUnitPriceInc': function(event) {
      $('.colUnitPriceInc').addClass('hiddenColumn');
      $('.colUnitPriceInc').removeClass('showColumn');

      $('.colUnitPriceEx').addClass('showColumn');
      $('.colUnitPriceEx').removeClass('hiddenColumn');

      $('.chkUnitPriceEx').prop("checked", true);
      $('.chkUnitPriceInc').prop("checked", false);

  },
    'click #btnCustomFileds': function(event) {
        var x = document.getElementById("divCustomFields");
        if (x.style.display === "none") {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }
    },
    'click .lineProductName, keydown .lineProductName': function(event) {
        var $earch = $(event.currentTarget);
        var offset = $earch.offset();

        let customername = $('#edtCustomerName').val();
        $("#selectProductID").val('');
        if (customername === '') {
            swal('Customer has not been selected!', '', 'warning');
            event.preventDefault();
        } else {
            var productDataName = $(event.target).val() || '';
            if (event.pageX > offset.left + $earch.width() - 10) { // X button 16px wide?
                $('#productListModal').modal('toggle');
                var targetID = $(event.target).closest('tr').attr('id');
                $('#selectLineID').val(targetID);
                setTimeout(function() {
                    $('#tblInventory_filter .form-control-sm').focus();
                    $('#tblInventory_filter .form-control-sm').val('');
                    $('#tblInventory_filter .form-control-sm').trigger("input");

                    var datatable = $('#tblInventory').DataTable();
                    datatable.draw();
                    $('#tblInventory_filter .form-control-sm').trigger("input");

                }, 500);
            } else {
                if (productDataName.replace(/\s/g, '') != '') {
                    //FlowRouter.go('/productview?prodname=' +  $(event.target).text());
                    let lineExtaSellItems = [];
                    let lineExtaSellObj = {};
                    LoadingOverlay.show();
                    getVS1Data('TProductVS1').then(function(dataObject) {
                        if (dataObject.length == 0) {
                            sideBarService.getOneProductdatavs1byname(productDataName).then(function(data) {
                                LoadingOverlay.hide();
                                let lineItems = [];
                                let lineItemObj = {};
                                let currencySymbol = Currency;
                                let totalquantity = 0;
                                let productname = data.tproduct[0].fields.ProductName || '';
                                let productcode = data.tproduct[0].fields.PRODUCTCODE || '';
                                let productprintName = data.tproduct[0].fields.ProductPrintName || '';
                                let assetaccount = data.tproduct[0].fields.AssetAccount || '';
                                let buyqty1cost = utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.BuyQty1Cost) || 0;
                                let cogsaccount = data.tproduct[0].fields.CogsAccount || '';
                                let taxcodepurchase = data.tproduct[0].fields.TaxCodePurchase || '';
                                let purchasedescription = data.tproduct[0].fields.PurchaseDescription || '';
                                let sellqty1price = utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.SellQty1Price) || 0;
                                let incomeaccount = data.tproduct[0].fields.IncomeAccount || '';
                                let taxcodesales = data.tproduct[0].fields.TaxCodeSales || '';
                                let salesdescription = data.tproduct[0].fields.SalesDescription || '';
                                let active = data.tproduct[0].fields.Active;
                                let lockextrasell = data.tproduct[0].fields.LockExtraSell || '';
                                let customfield1 = data.tproduct[0].fields.CUSTFLD1 || '';
                                let customfield2 = data.tproduct[0].fields.CUSTFLD2 || '';
                                let barcode = data.tproduct[0].fields.BARCODE || '';
                                $("#selectProductID").val(data.tproduct[0].fields.ID).trigger("change");
                                $('#add-product-title').text('Edit Product');
                                $('#edtproductname').val(productname);
                                $('#edtsellqty1price').val(sellqty1price);
                                $('#txasalesdescription').val(salesdescription);
                                $('#sltsalesacount').val(incomeaccount);
                                $('#slttaxcodesales').val(taxcodesales);
                                $('#edtbarcode').val(barcode);
                                $('#txapurchasedescription').val(purchasedescription);
                                $('#sltcogsaccount').val(cogsaccount);
                                $('#slttaxcodepurchase').val(taxcodepurchase);
                                $('#edtbuyqty1cost').val(buyqty1cost);

                                setTimeout(function() {
                                    $('#newProductModal').modal('show');
                                }, 500);
                            }).catch(function(err) {

                                LoadingOverlay.hide();
                            });
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.tproductvs1;
                            var added = false;

                            for (let i = 0; i < data.tproductvs1.length; i++) {
                                if (data.tproductvs1[i].fields.ProductName === productDataName) {
                                    added = true;
                                    LoadingOverlay.hide();
                                    let lineItems = [];
                                    let lineItemObj = {};
                                    let currencySymbol = Currency;
                                    let totalquantity = 0;

                                    let productname = data.tproductvs1[i].fields.ProductName || '';
                                    let productcode = data.tproductvs1[i].fields.PRODUCTCODE || '';
                                    let productprintName = data.tproductvs1[i].fields.ProductPrintName || '';
                                    let assetaccount = data.tproductvs1[i].fields.AssetAccount || '';
                                    let buyqty1cost = utilityService.modifynegativeCurrencyFormat(data.tproductvs1[i].fields.BuyQty1Cost) || 0;
                                    let cogsaccount = data.tproductvs1[i].fields.CogsAccount || '';
                                    let taxcodepurchase = data.tproductvs1[i].fields.TaxCodePurchase || '';
                                    let purchasedescription = data.tproductvs1[i].fields.PurchaseDescription || '';
                                    let sellqty1price = utilityService.modifynegativeCurrencyFormat(data.tproductvs1[i].fields.SellQty1Price) || 0;
                                    let incomeaccount = data.tproductvs1[i].fields.IncomeAccount || '';
                                    let taxcodesales = data.tproductvs1[i].fields.TaxCodeSales || '';
                                    let salesdescription = data.tproductvs1[i].fields.SalesDescription || '';
                                    let active = data.tproductvs1[i].fields.Active;
                                    let lockextrasell = data.tproductvs1[i].fields.LockExtraSell || '';
                                    let customfield1 = data.tproductvs1[i].fields.CUSTFLD1 || '';
                                    let customfield2 = data.tproductvs1[i].fields.CUSTFLD2 || '';
                                    let barcode = data.tproductvs1[i].fields.BARCODE || '';
                                    $("#selectProductID").val(data.tproductvs1[i].fields.ID).trigger("change");
                                    $('#add-product-title').text('Edit Product');
                                    $('#edtproductname').val(productname);
                                    $('#edtsellqty1price').val(sellqty1price);
                                    $('#txasalesdescription').val(salesdescription);
                                    $('#sltsalesacount').val(incomeaccount);
                                    $('#slttaxcodesales').val(taxcodesales);
                                    $('#edtbarcode').val(barcode);
                                    $('#txapurchasedescription').val(purchasedescription);
                                    $('#sltcogsaccount').val(cogsaccount);
                                    $('#slttaxcodepurchase').val(taxcodepurchase);
                                    $('#edtbuyqty1cost').val(buyqty1cost);

                                    setTimeout(function() {
                                        $('#newProductModal').modal('show');
                                    }, 500);
                                }
                            }
                            if (!added) {
                                sideBarService.getOneProductdatavs1byname(productDataName).then(function(data) {
                                    LoadingOverlay.hide();
                                    let lineItems = [];
                                    let lineItemObj = {};
                                    let currencySymbol = Currency;
                                    let totalquantity = 0;
                                    let productname = data.tproduct[0].fields.ProductName || '';
                                    let productcode = data.tproduct[0].fields.PRODUCTCODE || '';
                                    let productprintName = data.tproduct[0].fields.ProductPrintName || '';
                                    let assetaccount = data.tproduct[0].fields.AssetAccount || '';
                                    let buyqty1cost = utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.BuyQty1Cost) || 0;
                                    let cogsaccount = data.tproduct[0].fields.CogsAccount || '';
                                    let taxcodepurchase = data.tproduct[0].fields.TaxCodePurchase || '';
                                    let purchasedescription = data.tproduct[0].fields.PurchaseDescription || '';
                                    let sellqty1price = utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.SellQty1Price) || 0;
                                    let incomeaccount = data.tproduct[0].fields.IncomeAccount || '';
                                    let taxcodesales = data.tproduct[0].fields.TaxCodeSales || '';
                                    let salesdescription = data.tproduct[0].fields.SalesDescription || '';
                                    let active = data.tproduct[0].fields.Active;
                                    let lockextrasell = data.tproduct[0].fields.LockExtraSell || '';
                                    let customfield1 = data.tproduct[0].fields.CUSTFLD1 || '';
                                    let customfield2 = data.tproduct[0].fields.CUSTFLD2 || '';
                                    let barcode = data.tproduct[0].fields.BARCODE || '';
                                    $("#selectProductID").val(data.tproduct[0].fields.ID).trigger("change");
                                    $('#add-product-title').text('Edit Product');
                                    $('#edtproductname').val(productname);
                                    $('#edtsellqty1price').val(sellqty1price);
                                    $('#txasalesdescription').val(salesdescription);
                                    $('#sltsalesacount').val(incomeaccount);
                                    $('#slttaxcodesales').val(taxcodesales);
                                    $('#edtbarcode').val(barcode);
                                    $('#txapurchasedescription').val(purchasedescription);
                                    $('#sltcogsaccount').val(cogsaccount);
                                    $('#slttaxcodepurchase').val(taxcodepurchase);
                                    $('#edtbuyqty1cost').val(buyqty1cost);

                                    setTimeout(function() {
                                        $('#newProductModal').modal('show');
                                    }, 500);
                                }).catch(function(err) {

                                    LoadingOverlay.hide();
                                });
                            }
                        }
                    }).catch(function(err) {

                        sideBarService.getOneProductdatavs1byname(productDataName).then(function(data) {
                            LoadingOverlay.hide();
                            let lineItems = [];
                            let lineItemObj = {};
                            let currencySymbol = Currency;
                            let totalquantity = 0;
                            let productname = data.tproduct[0].fields.ProductName || '';
                            let productcode = data.tproduct[0].fields.PRODUCTCODE || '';
                            let productprintName = data.tproduct[0].fields.ProductPrintName || '';
                            let assetaccount = data.tproduct[0].fields.AssetAccount || '';
                            let buyqty1cost = utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.BuyQty1Cost) || 0;
                            let cogsaccount = data.tproduct[0].fields.CogsAccount || '';
                            let taxcodepurchase = data.tproduct[0].fields.TaxCodePurchase || '';
                            let purchasedescription = data.tproduct[0].fields.PurchaseDescription || '';
                            let sellqty1price = utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.SellQty1Price) || 0;
                            let incomeaccount = data.tproduct[0].fields.IncomeAccount || '';
                            let taxcodesales = data.tproduct[0].fields.TaxCodeSales || '';
                            let salesdescription = data.tproduct[0].fields.SalesDescription || '';
                            let active = data.tproduct[0].fields.Active;
                            let lockextrasell = data.tproduct[0].fields.LockExtraSell || '';
                            let customfield1 = data.tproduct[0].fields.CUSTFLD1 || '';
                            let customfield2 = data.tproduct[0].fields.CUSTFLD2 || '';
                            let barcode = data.tproduct[0].fields.BARCODE || '';
                            $("#selectProductID").val(data.tproduct[0].fields.ID).trigger("change");
                            $('#add-product-title').text('Edit Product');
                            $('#edtproductname').val(productname);
                            $('#edtsellqty1price').val(sellqty1price);
                            $('#txasalesdescription').val(salesdescription);
                            $('#sltsalesacount').val(incomeaccount);
                            $('#slttaxcodesales').val(taxcodesales);
                            $('#edtbarcode').val(barcode);
                            $('#txapurchasedescription').val(purchasedescription);
                            $('#sltcogsaccount').val(cogsaccount);
                            $('#slttaxcodepurchase').val(taxcodepurchase);
                            $('#edtbuyqty1cost').val(buyqty1cost);

                            setTimeout(function() {
                                $('#newProductModal').modal('show');
                            }, 500);
                        }).catch(function(err) {

                            LoadingOverlay.hide();
                        });

                    });
                } else {
                    $('#productListModal').modal('toggle');
                    var targetID = $(event.target).closest('tr').attr('id');
                    $('#selectLineID').val(targetID);
                    setTimeout(function() {
                        $('#tblInventory_filter .form-control-sm').focus();
                        $('#tblInventory_filter .form-control-sm').val('');
                        $('#tblInventory_filter .form-control-sm').trigger("input");

                        var datatable = $('#tblInventory').DataTable();
                        datatable.draw();
                        $('#tblInventory_filter .form-control-sm').trigger("input");

                    }, 500);
                }
            }
        }
    },
    'click #productListModal #refreshpagelist': function() {
        LoadingOverlay.show();
        localStorage.setItem('VS1SalesProductList', '');
        let templateObject = Template.instance();
        Meteor._reload.reload();
        templateObject.getAllProducts();

    },
    'click .lineTaxRate': function(event) {
        $('#tblInvoiceLine tbody tr .lineTaxRate').attr("data-toggle", "modal");
        $('#tblInvoiceLine tbody tr .lineTaxRate').attr("data-target", "#taxRateListModal");
        var targetID = $(event.target).closest('tr').attr('id');
        $('#selectLineID').val(targetID);
    },
    'click .lineTaxAmount': function (event) {
        let targetRow = $(event.target).closest('tr');
        let targetID = targetRow.attr('id');
        let targetTaxCode = targetRow.find('.lineTaxCode').val();
        let qty = targetRow.find(".lineQty").val() || 0
        let price = targetRow.find('.colUnitPriceExChange').val() || 0;
        const tmpObj = Template.instance();
        const taxDetail = tmpObj.taxcodes.get().find((v) => v.CodeName === targetTaxCode);
        const subTaxCodes = tmpObj.subtaxcodes.get();

        if (!taxDetail) {
            return;
        }

        let priceTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, ""));
        let taxTotal = priceTotal * parseFloat(taxDetail.Rate);

        let taxDetailTableData = [];
        taxDetailTableData.push([
            taxDetail.Description,
            taxDetail.Id,
            taxDetail.CodeName,
            `${taxDetail.Rate * 100}%`,
            "Selling Price",
            `$${priceTotal.toFixed(3)}`,
            `$${taxTotal.toFixed(3)}`,
            `$${(priceTotal + taxTotal).toFixed(3)}`,
        ]);
        if (taxDetail.Lines) {
            taxDetail.Lines.map((line) => {
                let lineDescription = "";
                if (line.Description) {
                    lineDescription = line.Description;
                } else {
                    lineDescription = subTaxCodes.find((v) => v.codename === line.SubTaxCode);
                    lineDescription = lineDescription.description;
                }

                taxDetailTableData.push([
                    "",
                    line.Id,
                    line.SubTaxCode,
                    `${line.Percentage}%`,
                    line.PercentageOn,
                    "",
                    `$${(priceTotal * line.Percentage / 100).toFixed(3)}`,
                    ""
                ]);
            });
        }

        if (taxDetailTableData) {

            if (! $.fn.DataTable.isDataTable('#tblTaxDetail')) {
                $('#tblTaxDetail').DataTable({
                    data: [],
                    order: [[0, 'desc']],
                    "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                    columnDefs: [{
                            orderable: true,
                            targets: [0]
                        }, {
                            className: "taxId",
                            "targets": [1]
                        }, {
                            className: "taxCode",
                            "targets": [2]
                        }, {
                            className: "taxRate text-right",
                            "targets": [3]
                        }, {
                            className: "taxRateOn",
                            "targets": [4]
                        }, {
                            className: "amountEx text-right",
                            "targets": [5]
                        }, {
                            className: "tax text-right",
                            "targets": [6]
                        }, {
                            className: "amountInc text-right",
                            "targets": [7]
                        }
                    ],
                    colReorder: true,
                    pageLength: initialDatatableLoad,
                    lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                    info: true,
                    responsive: true,
                    "fnDrawCallback": function (oSettings) {

                    },
                    language: { search: "",searchPlaceholder: "Search List..." },
                    "fnInitComplete": function () {
                        $("<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblTaxDetail_filter");
                        $("<button class='btn btn-primary btnRefreshTaxDetail' type='button' id='btnRefreshTaxDetail' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblTaxDetail_filter");
                    }
                });
            }

            let datatable = $('#tblTaxDetail').DataTable();
            datatable.clear();
            datatable.rows.add(taxDetailTableData);
            datatable.draw(false);
        }

        $('#tblInvoiceLine tbody tr .lineTaxAmount').attr("data-toggle", "modal");
        $('#tblInvoiceLine tbody tr .lineTaxAmount').attr("data-target", "#taxDetailModal");
    },
    'click .lineTaxCode, keydown .lineTaxCode': function (event) {
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
            setTimeout(function () {
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
                    if (dataObject.length == 0) {
                        purchaseService.getTaxCodesVS1().then(function (data) {
                            let lineItems = [];
                            let lineItemObj = {};
                            for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                                if ((data.ttaxcodevs1[i].CodeName) === taxRateDataName) {
                                    $('#edtTaxNamePop').attr('readonly', true);
                                    let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                                    var taxRateID = data.ttaxcodevs1[i].Id || '';
                                    var taxRateName = data.ttaxcodevs1[i].CodeName || '';
                                    var taxRateDesc = data.ttaxcodevs1[i].Description || '';
                                    $('#edtTaxID').val(taxRateID);
                                    $('#edtTaxNamePop').val(taxRateName);
                                    $('#edtTaxRatePop').val(taxRate);
                                    $('#edtTaxDescPop').val(taxRateDesc);
                                    setTimeout(function () {
                                        $('#newTaxRateModal').modal('toggle');
                                    }, 100);
                                }
                            }

                        }).catch(function (err) {
                            // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                            LoadingOverlay.hide();
                            // Meteor._reload.reload();
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.ttaxcodevs1;
                        let lineItems = [];
                        let lineItemObj = {};
                        $('.taxcodepopheader').text('Edit Tax Rate');
                        for (let i = 0; i < useData.length; i++) {

                            if ((useData[i].CodeName) === taxRateDataName) {
                                $('#edtTaxNamePop').attr('readonly', true);
                                let taxRate = (useData[i].Rate * 100).toFixed(2);
                                var taxRateID = useData[i].Id || '';
                                var taxRateName = useData[i].CodeName || '';
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
                        for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                            if ((data.ttaxcodevs1[i].CodeName) === taxRateDataName) {
                                $('#edtTaxNamePop').attr('readonly', true);
                                let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                                var taxRateID = data.ttaxcodevs1[i].Id || '';
                                var taxRateName = data.ttaxcodevs1[i].CodeName || '';
                                var taxRateDesc = data.ttaxcodevs1[i].Description || '';
                                $('#edtTaxID').val(taxRateID);
                                $('#edtTaxNamePop').val(taxRateName);
                                $('#edtTaxRatePop').val(taxRate);
                                $('#edtTaxDescPop').val(taxRateDesc);
                                setTimeout(function () {
                                    $('#newTaxRateModal').modal('toggle');
                                }, 100);

                            }
                        }

                    }).catch(function (err) {
                        // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                        LoadingOverlay.hide();
                        // Meteor._reload.reload();
                    });
                });

            } else {
                $('#taxRateListModal').modal('toggle');
                var targetID = $(event.target).closest('tr').attr('id');
                $('#selectLineID').val(targetID);
                setTimeout(function () {
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
    'click .printConfirm':async function (event) {
        playPrintAudio();
        setTimeout(async function(){
        var printTemplate = [];
        LoadingOverlay.show();

        var refunds = $('input[name="Refunds"]:checked').val();
        let emid = Session.get('mySessionEmployeeLoggedID');

         sideBarService.getTemplateNameandEmployeId("Refunds",emid,1).then(function (data) {
            templateid = data.ttemplatesettings;
            var id = templateid[0].fields.ID;
            objDetails =  {
            type:"TTemplateSettings",
            fields:{
                                ID:parseInt(id),
                                EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                                SettingName:"Refunds",
                                GlobalRef:"Refunds",
                                Description:$('input[name="Refunds_1"]').val(),
                                Template:"1",
                                Active:refunds == 1 ? true:false,
                    }
            }

            sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

              sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                addVS1Data('TTemplateSettings', JSON.stringify(data));

               });

            }).catch(function (err) {



            });

         }).catch(function (err) {

                    objDetails =  {
                    type:"TTemplateSettings",
                    fields:{
                                EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                                SettingName:"Refunds",
                                Description:$('input[name="Refunds_1"]').val(),
                                Template:"1",
                                Active:refunds == 1 ? true:false,
                            }
                    }

                    sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                      sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                        addVS1Data('TTemplateSettings', JSON.stringify(data));

                       });


                    }).catch(function (err) {



                    });

         });


          sideBarService.getTemplateNameandEmployeId("Refunds",emid,2).then(function (data) {
            templateid = data.ttemplatesettings;
            var id = templateid[0].fields.ID;
            objDetails =  {
            type:"TTemplateSettings",
            fields:{
                                ID:parseInt(id),
                                EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                                SettingName:"Refunds",
                                GlobalRef:"Refunds",
                                Description:$('input[name="Refunds_2"]').val(),
                                Template:"2",
                                Active:refunds == 2 ? true:false,
                    }
            }

            sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

              sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                addVS1Data('TTemplateSettings', JSON.stringify(data));

              });


            }).catch(function (err) {


            });

          }).catch(function (err) {

                    objDetails =  {
                    type:"TTemplateSettings",
                    fields:{
                                EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                                SettingName:"Refunds",
                                Description:$('input[name="Refunds_2"]').val(),
                                Template:"2",
                                Active:refunds == 2 ? true:false,
                            }
                    }

                    sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                      sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                        addVS1Data('TTemplateSettings', JSON.stringify(data));

                      });


                    }).catch(function (err) {



                    });

          });


          sideBarService.getTemplateNameandEmployeId("Refunds",emid,3).then(function (data) {
            templateid = data.ttemplatesettings;
            var id = templateid[0].fields.ID;
            objDetails =  {
            type:"TTemplateSettings",
            fields:{
                                ID:parseInt(id),
                                EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                                SettingName:"Refunds",
                                GlobalRef:"Refunds",
                                Description:$('input[name="Refunds_3"]').val(),
                                Template:"3",
                                Active:refunds == 3 ? true:false,
                    }
            }

            sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

              sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                addVS1Data('TTemplateSettings', JSON.stringify(data));

              });


            }).catch(function (err) {



            });

          }).catch(function (err) {

                    objDetails =  {
                    type:"TTemplateSettings",
                    fields:{
                                EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                                SettingName:"Refunds",
                                Description:$('input[name="Refunds_3"]').val(),
                                Template:"3",
                                Active:refunds == 3 ? true:false,
                            }
                    }

                    sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                      sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                        addVS1Data('TTemplateSettings', JSON.stringify(data));

                      });

                    }).catch(function (err) {



                    });

          });

          if($('#print_refund').is(':checked') || $('#print_refund_second').is(':checked') ) {
            printTemplate.push('Refunds');
        }

        if(printTemplate.length > 0) {
              for(var i = 0; i < printTemplate.length; i++)
              {
                if(printTemplate[i] == 'Refunds')
                {
                    var template_number = $('input[name="Refunds"]:checked').val();
                }
                let result = await exportSalesToPdf(printTemplate[i],template_number);
                if(result == true)
                {
                }
              }
        }
        
        // if ($('.edtCustomerEmail').val() != "") {
        //     $('.pdfCustomerName').html($('#edtCustomerName').val());
        //     $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));
        //     $('#printcomment').html($('#txaComment').val().replace(/[\r\n]/g, "<br />"));
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
        //         if (result.value) {}
        //         else if (result.dismiss === 'cancel') {}
        //     });
        // }
    }, delayTimeAfterSound);
    },
    // 'click .printConfirm': function(event) {
    //     $('#html-2-pdfwrapper').css('display', 'block');
    //     $('.pdfCustomerName').html($('#edtCustomerName').val());
    //     $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));
    //     exportSalesToPdf();
    // },


    'keydown .lineQty, keydown .lineUnitPrice': function(event) {
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
    'click .btnRemove': function(event) {
        let templateObject = Template.instance();
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();
        var clicktimes = 0;
        var targetID = $(event.target).closest('tr').attr('id');
        $('#selectDeleteLineID').val(targetID);

        times++;
        if (times == 1) {
            $('#deleteLineModal').modal('toggle');
        } else {
            if ($('#tblInvoiceLine tbody>tr').length > 1) {
                this.click;
                $(event.target).closest('tr').remove();
                event.preventDefault();
                let $tblrows = $("#tblInvoiceLine tbody tr");

                let lineAmount = 0;
                let subGrandTotal = 0;
                let taxGrandTotal = 0;
                let subDiscountTotal = 0; // New Discount
                let taxGrandTotalPrint = 0;

                let subGrandTotalNet = 0;
                let taxGrandTotalNet = 0;
                $tblrows.each(function(index) {
                    var $tblrow = $(this);
                    var qty = $tblrow.find(".lineQty").val() || 0;
                    var price = $tblrow.find(".colUnitPriceExChange").val() || 0;
                    var taxRate = $tblrow.find(".lineTaxCode").val();

                    var taxrateamount = 0;
                    if (taxcodeList) {
                        for (var i = 0; i < taxcodeList.length; i++) {
                            if (taxcodeList[i].codename == taxRate) {
                                taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                            }
                        }
                    }

                    var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
                    var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                    var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").text()) || 0; // New Discount
                    let lineTotalAmount = subTotal + taxTotal;

                    let lineDiscountTotal = lineDiscountPerc / 100;

                    var discountTotal = lineTotalAmount * lineDiscountTotal;
                    var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
                    var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
                    var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
                    var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
                    if (!isNaN(discountTotal)) {
                        subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;

                        document.getElementById("subtotal_discount").innerHTML = utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
                    }
                    $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

                    let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount)||0;
                    let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, ""))||0;
                    let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc||0;
                    $tblrow.find('.colUnitPriceExChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
                    $tblrow.find('.colUnitPriceIncChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

                    if (!isNaN(subTotal)) {
                      $tblrow.find('.colAmountEx').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                      $tblrow.find('.colAmountInc').text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
                        subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
                        subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
                        document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
                    }

                    if (!isNaN(taxTotal)) {
                        taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
                        taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
                        document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
                    }



                    if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                        let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                        let GrandTotalNet = (parseFloat(subGrandTotalNet)) + (parseFloat(taxGrandTotalNet));
                        document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
                        document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                        document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                        document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);

                    }
                });
                return false;

            } else {
                $('#deleteLineModal').modal('toggle');
            }
        }
    },
    'click .btnDeleteFollowingRefunds': async function(event) {
        playDeleteAudio();
        var currentDate = new Date();
        let templateObject = Template.instance();
        let salesService = new SalesBoardService();
        setTimeout(async function(){

        swal({
            title: 'Delete Refund',
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
                LoadingOverlay.show();
                if (getso_id[1]) {
                    currentInvoice = parseInt(currentInvoice);
                    var refundData = await salesService.getRefundSales(currentInvoice);
                    var saleDate = refundData.fields.SaleDate;
                    var fromDate = saleDate.substring(0, 10);
                    var toDate = currentDate.getFullYear() + '-' + ("0" + (currentDate.getMonth() + 1)).slice(-2) + '-' + ("0" + (currentDate.getDate())).slice(-2);
                    var followingRefunds = await sideBarService.getAllTRefundSaleListData(
                        fromDate,
                        toDate,
                        false,
                        initialReportLoad,
                        0
                    );
                    var refundList = followingRefunds.trefundsalelist;
                    for (var i=0; i < refundList.length; i++) {
                        var objDetails = {
                            type: "TRefundSale",
                            fields: {
                                ID: refundList[i].SaleID,
                                Deleted: true
                            }
                        };
                        var result = await salesService.saveRefundSale(objDetails);
                    }
                }
                window.open('/refundlist', '_self');
                LoadingOverlay.hide();
                $('#deleteLineModal').modal('toggle');
            }
        });
    }, delayTimeAfterSound);
    },
    'click .btnDeleteRefund': function(event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let salesService = new SalesBoardService();
        setTimeout(function(){
        LoadingOverlay.show();

        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentInvoice = getso_id[getso_id.length - 1];
        var objDetails = '';
        if (getso_id[1]) {
            currentInvoice = parseInt(currentInvoice);
            var objDetails = {
                type: "TRefundSale",
                fields: {
                    ID: currentInvoice,
                    Deleted: true
                }
            };

            salesService.saveRefundSale(objDetails).then(function(objDetails) {
                window.open('/refundlist', '_self');
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

            });
        } else {
            window.open('/refundlist', '_self');
        }
        $('#deleteLineModal').modal('toggle');
    }, delayTimeAfterSound);
    },
    'click .btnDeleteLine': function(event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        setTimeout(function(){
        let taxcodeList = templateObject.taxraterecords.get();
        let selectLineID = $('#selectDeleteLineID').val();
        if ($('#tblInvoiceLine tbody>tr').length > 1) {
            this.click;

            $('#' + selectLineID).closest('tr').remove();
            let $tblrows = $("#tblInvoiceLine tbody tr");

            let lineAmount = 0;
            let subGrandTotal = 0;
            let taxGrandTotal = 0;
            let subDiscountTotal = 0; // New Discount
            let taxGrandTotalPrint = 0;

            let subGrandTotalNet = 0;
            let taxGrandTotalNet = 0;
            $tblrows.each(function(index) {
                var $tblrow = $(this);
                var qty = $tblrow.find(".lineQty").val() || 0;
                var price = $tblrow.find(".colUnitPriceExChange").val() || 0;
                var taxRate = $tblrow.find(".lineTaxCode").val();

                var taxrateamount = 0;
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename == taxRate) {
                            taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                        }
                    }
                }

                var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
                var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").text()) || 0; // New Discount
                let lineTotalAmount = subTotal + taxTotal;

                let lineDiscountTotal = lineDiscountPerc / 100;

                var discountTotal = lineTotalAmount * lineDiscountTotal;
                var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
                var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
                var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
                var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
                if (!isNaN(discountTotal)) {
                    subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;

                    document.getElementById("subtotal_discount").innerHTML = utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
                }
                $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

                let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount)||0;
                let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, ""))||0;
                let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc||0;
                $tblrow.find('.colUnitPriceExChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
                $tblrow.find('.colUnitPriceIncChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

                if (!isNaN(subTotal)) {
                  $tblrow.find('.colAmountEx').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                  $tblrow.find('.colAmountInc').text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
                    subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
                    subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
                    document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
                }

                if (!isNaN(taxTotal)) {
                    taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
                    taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
                    document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
                }



                if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                    let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                    let GrandTotalNet = (parseFloat(subGrandTotalNet)) + (parseFloat(taxGrandTotalNet));
                    document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
                    document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);

                }
            });


        } else {
            this.click;

            $('#' + selectLineID + " .lineProductName").val('');
            $('#' + selectLineID + " .lineProductDesc").text('');
            $('#' + selectLineID + " .lineOrdered").val('');
            $('#' + selectLineID + " .lineQty").val('');
            $('#' + selectLineID + " .lineBo").val('');
            $('#' + selectLineID + " .lineUnitPrice").val('');
            $('#' + selectLineID + " .lineCostPrice").val('');
            $('#' + selectLineID + " .lineSalesLinesCustField1").text('');
            $('#' + selectLineID + " .lineTaxRate").text('');
            $('#' + selectLineID + " .lineTaxCode").val('');
            $('#' + selectLineID + " .lineAmt").text('');

            document.getElementById("subtotal_tax").innerHTML = Currency + '0.00';
            document.getElementById("subtotal_total").innerHTML = Currency + '0.00';
            document.getElementById("grandTotal").innerHTML = Currency + '0.00';
            document.getElementById("balanceDue").innerHTML = Currency + '0.00';
            document.getElementById("totalBalanceDue").innerHTML = Currency + '0.00';
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
    'click .btnSave':(event, templateObject) => {
        playSaveAudio();
        //let templateObject = Template.instance();
        let salesService = new SalesBoardService();
        let uploadedItems = templateObject.uploadedFiles.get();
        setTimeout(function(){
        saveCurrencyHistory();
        let customername = $('#edtCustomerName');
        let termname = $('#sltTerms').val() || '';
        let payMethod = $("#sltPaymentMethod").val() || 'Cash';
        Session.setPersistent('paymentmethod', payMethod);
        if (termname === '') {
            swal('Terms has not been selected!', '', 'warning');
            event.preventDefault();
            return false;
        }

        if (customername.val() === '') {
            swal('Customer has not been selected!', '', 'warning');
            e.preventDefault();
        } else {

            LoadingOverlay.show();
            var splashLineArray = new Array();
            let lineItemsForm = [];
            let lineItemObjForm = {};
            var saledateTime = new Date($("#dtSODate").datepicker("getDate"));

            var duedateTime = new Date($("#dtDueDate").datepicker("getDate"));

            let saleDate = saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate();
            let dueDate = duedateTime.getFullYear() + "-" + (duedateTime.getMonth() + 1) + "-" + duedateTime.getDate();
            $('#tblInvoiceLine > tbody > tr').each(function() {
                var lineID = this.id;
                let tdproduct = $('#' + lineID + " .lineProductName").val();
                let tddescription = $('#' + lineID + " .lineProductDesc").text();
                let tdQty = $('#' + lineID + " .lineQty").val();
                let tdunitprice = $('#' + lineID + " .colUnitPriceExChange").val();
                let tdtaxrate = $('#' + lineID + " .lineTaxRate").text();
                let tdtaxCode = $('#' + lineID + " .lineTaxCode").val()||loggedTaxCodeSalesInc;
                let tdlineamt = $('#' + lineID + " .lineAmt").text();

                let tdSerialNumber = $('#' + lineID + " .colSerialNo").attr('data-serialnumbers');
                let tdLotNumber = $('#' + lineID + " .colSerialNo").attr('data-lotnumbers');
                let tdLotExpiryDate = $('#' + lineID + " .colSerialNo").attr('data-expirydates');

                if (tdproduct != "") {

                    lineItemObjForm = {
                        type: "TRefundSaleLine",
                        fields: {
                            ProductName: tdproduct || '',
                            ProductDescription: tddescription || '',
                            UOMOrderQty:-parseFloat(tdQty) || 0,
                            UOMQtySold: -parseFloat(tdQty) || 0,
                            UOMQtyShipped: -parseFloat(tdQty) || 0,
                            LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                            Headershipdate: saleDate,
                            LineTaxCode: tdtaxCode || '',
                            DiscountPercent: parseFloat($('#' + lineID + " .lineDiscount").text()) || 0
                        }
                    };

                    // Feature/ser-lot number tracking: Save Serial Numbers
                    if (tdSerialNumber) {
                        const serialNumbers = tdSerialNumber.split(',');
                        let tpqaList = [];
                        for (let i = 0; i < serialNumbers.length; i++) {
                            const tpqaObject = {
                                type: "TPQASN",
                                fields: {
                                    Active: true,
                                    Qty: 1,
                                    SerialNumber: serialNumbers[i],
                                }
                            };
                            tpqaList.push(tpqaObject);
                        }
                        const pqaObject = {
                            type: "TPQA",
                            fields: {
                                Active: true,
                                PQASN: tpqaList,
                                Qty: serialNumbers.length,
                            }
                        }
                        lineItemObjForm.fields.PQA = pqaObject;
                    }

                    // Feature/ser-lot number tracking: Save Lot Number
                    if (tdLotNumber) {
                        const lotNumbers = tdLotNumber.split(',');
                        const expiryDates = tdLotExpiryDate.split(',');
                        let tpqaList = [];
                        for (let i = 0; i < lotNumbers.length; i++) {
                            const dates = expiryDates[i].split('/');
                            const tpqaObject = {
                                type: "PQABatch",
                                fields: {
                                    Active: true,
                                    BatchExpiryDate: new Date(parseInt(dates[2]), parseInt(dates[1]) - 1, parseInt(dates[0])).toISOString(),
                                    Qty: 1,
                                    BatchNo: lotNumbers[i],
                                }
                            };
                            tpqaList.push(tpqaObject);
                        }
                        const pqaObject = {
                            type: "TPQA",
                            fields: {
                                Active: true,
                                PQABatch: tpqaList,
                                Qty: lotNumbers.length,
                            }
                        }
                        lineItemObjForm.fields.PQA = pqaObject;
                    }

                    lineItemsForm.push(lineItemObjForm);
                    splashLineArray.push(lineItemObjForm);
                }
            });
            let getchkcustomField1 = true;
            let getchkcustomField2 = true;
            let getcustomField1 = $('.customField1Text').html();
            let getcustomField2 = $('.customField2Text').html();
            if ($('#formCheck-one').is(':checked')) {
                getchkcustomField1 = false;
            }
            if ($('#formCheck-two').is(':checked')) {
                getchkcustomField2 = false;
            }

            let customer = $('#edtCustomerName').val();
            let customerEmail = $('#edtCustomerEmail').val();
            let billingAddress = $('#txabillingAddress').val();


            let poNumber = $('#ponumber').val();
            let reference = $('#edtRef').val();

            let departement = $('#sltDept').val();
            let shippingAddress = $('#txaShipingInfo').val();
            let comments = $('#txaComment').val();
            let pickingInfrmation = $('#txapickmemo').val();

            let saleCustField1 = $('#edtSaleCustField1').val()||'';
            let saleCustField2 = $('#edtSaleCustField2').val()||'';
            let saleCustField3 = $('#edtSaleCustField3').val()||'';
            var url = FlowRouter.current().path;
            var getso_id = url.split('?id=');
            var currentInvoice = getso_id[getso_id.length - 1];

            var currencyCode = $("#sltCurrency").val() || CountryAbbr;
            let ForeignExchangeRate = $('#exchange_rate').val()||0;
            let foreignCurrencyFields = {}
            if( FxGlobalFunctions.isCurrencyEnabled() ){
                foreignCurrencyFields = {
                    ForeignExchangeCode: currencyCode,
                    ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                }
            }
            var objDetails = '';
            if (getso_id[1]) {
                currentInvoice = parseInt(currentInvoice);
                objDetails = {
                    type: "TRefundSale",
                    fields: {
                        ID: currentInvoice,
                        CustomerName: customer,
                        // ForeignExchangeCode: currencyCode,
                        // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                        ...foreignCurrencyFields,
                        Lines: splashLineArray,
                        InvoiceToDesc: billingAddress,
                        SaleDate: saleDate,

                        CustPONumber: poNumber,
                        // ReferenceNo: reference,
                        TermsName: termname,
                        PayMethod:payMethod||'Cash',
                        SaleClassName: departement,
                        ShipToDesc: shippingAddress,
                        Comments: comments,
                        SaleCustField1: saleCustField1,
                        SaleCustField2: saleCustField2,
                        SaleCustField3: saleCustField3,
                        PickMemo: pickingInfrmation,
                        // Attachments: uploadedItems,
                        SalesStatus: $('#sltStatus').val()
                    }
                };
            } else {
                objDetails = {
                    type: "TRefundSale",
                    fields: {
                        CustomerName: customer,
                        // ForeignExchangeCode: currencyCode,
                        // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                        ...foreignCurrencyFields,
                        Lines: splashLineArray,
                        InvoiceToDesc: billingAddress,
                        SaleDate: saleDate,

                        CustPONumber: poNumber,
                        // ReferenceNo: reference,
                        TermsName: termname,
                        PayMethod:payMethod||'Cash',
                        SaleClassName: departement,
                        ShipToDesc: shippingAddress,
                        Comments: comments,
                        SaleCustField1: saleCustField1,
                        SaleCustField2: saleCustField2,
                        SaleCustField3: saleCustField3,
                        PickMemo: pickingInfrmation,
                        // Attachments: uploadedItems,
                        SalesStatus: $('#sltStatus').val()
                    }
                };
            }
            salesService.saveRefundSale(objDetails).then(function(objDetails) {
                var customerID = $('#edtCustomerEmail').attr('customerid');

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
                    reader.onloadend = function() {
                        var base64data = reader.result;
                        base64data = base64data.split(',')[1];

                        pdfObject = {
                            filename: 'invoice-' + invoiceId + '.pdf',
                            content: base64data,
                            encoding: 'base64'
                        };
                        attachment.push(pdfObject);

                        let erpInvoiceId = objDetails.fields.ID;


                        let mailFromName = Session.get('vs1companyName');
                        let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                        let customerEmailName = $('#edtCustomerName').val();
                        let checkEmailData = $('#edtCustomerEmail').val();

                        let grandtotal = $('#grandTotal').html();
                        let amountDueEmail = $('#totalBalanceDue').html();
                        let emailDueDate = $("#dtDueDate").val();
                        let mailSubject = 'Refund ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
                        let mailBody = "Hi " + customerEmailName + ",\n\n Here's invoice " + erpInvoiceId + " for  " + grandtotal + "." +
                            "\n\nThe amount outstanding of " + amountDueEmail + " is due on " + emailDueDate + "." +
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
                            '                        Please find refund <span>' + erpInvoiceId + '</span> attached below.' +
                            '                    </td>' +
                            '                </tr>' +
                            '                <tr>' +
                            '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
                            '                        The amount outstanding of <span>' + amountDueEmail + '</span> is due on <span>' + emailDueDate + '</span>' +
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

                            // add to custom field
                            // sideBarService.getAllSalesOrderList("All").then(function (data) {
                            //   addVS1Data('TSalesOrderEx', JSON.stringify(data)).then(function (datareturn) {
                            //   }).catch(function (err) {
                            //   });
                            // });
                            // add to custom field
                        if (($('.chkEmailCopy').is(':checked')) && ($('.chkEmailRep').is(':checked'))) {
                            Meteor.call('sendEmail', {
                                from: "" + mailFromName + " <" + mailFrom + ">",
                                to: checkEmailData,
                                subject: mailSubject,
                                text: '',
                                html: htmlmailBody,
                                attachments: attachment
                            }, function(error, result) {
                                if (error && error.error === "error") {

                                    if(FlowRouter.current().queryParams.trans){
                                    	FlowRouter.go('/customerscard?id='+FlowRouter.current().queryParams.trans+'&transTab=active');
                                    }else{
                                    	FlowRouter.go('/refundlist?success=true');
                                    };
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
                            }, function(error, result) {
                                if (error && error.error === "error") {
                                    FlowRouter.go('/refundlist?success=true');
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
                                          if(FlowRouter.current().queryParams.trans){
                                            FlowRouter.go('/customerscard?id='+FlowRouter.current().queryParams.trans+'&transTab=active');
                                          }else{
                                            FlowRouter.go('/refundlist?success=true');
                                          };
                                        } else if (result.dismiss === 'cancel') {

                                        }
                                    });

                                    LoadingOverlay.hide();
                                }
                            });

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
                                reportData.attachments = attachment
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("74")) {
                                            reportData.FormID = 74;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 74)
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
                            }, function(error, result) {
                                if (error && error.error === "error") {
                                    FlowRouter.go('/refundlist?success=true');

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
                                          if(FlowRouter.current().queryParams.trans){
                                            FlowRouter.go('/customerscard?id='+FlowRouter.current().queryParams.trans+'&transTab=active');
                                          }else{
                                            FlowRouter.go('/refundlist?success=true');
                                          };
                                        } else if (result.dismiss === 'cancel') {

                                        }
                                    });

                                    LoadingOverlay.hide();
                                }
                            });

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
                                reportData.attachments = attachment
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("74")) {
                                            reportData.FormID = 74;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 74)
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
                            }, function(error, result) {
                                if (error && error.error === "error") {
                                    FlowRouter.go('/refundlist?success=true');
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
                                          if(FlowRouter.current().queryParams.trans){
                                            FlowRouter.go('/customerscard?id='+FlowRouter.current().queryParams.trans+'&transTab=active');
                                          }else{
                                            FlowRouter.go('/refundlist?success=true');
                                          };
                                        } else if (result.dismiss === 'cancel') {

                                        }
                                    });

                                    LoadingOverlay.hide();
                                }
                            });

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
                                reportData.attachments = attachment
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("74")) {
                                            reportData.FormID = 74;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 74)
                                            Meteor.call('sendNormalEmail', reportData);
                                    }
                                }
                            });

                        } else {

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
                                reportData.attachments = attachment
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("74")) {
                                            reportData.FormID = 74;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 74)
                                            Meteor.call('sendNormalEmail', reportData);
                                    }
                                }
                            });
                          if(FlowRouter.current().queryParams.trans){
                            FlowRouter.go('/customerscard?id='+FlowRouter.current().queryParams.trans+'&transTab=active');
                          }else{
                            FlowRouter.go('/refundlist?success=true');
                          };
                        };
                    };


                }
                addAttachment();

                function generatePdfForMail(invoiceId) {
                    return new Promise((resolve, reject) => {
                        let templateObject = Template.instance();

                        let completeTabRecord;
                        let doc = new jsPDF('p', 'pt', 'a4');
                        doc.setFontSize(18);
                        var source = document.getElementById('html-2-pdfwrapper');
                        doc.addHTML(source, function() {

                            resolve(doc.output('blob'));

                        });
                    });
                }

                if (customerID !== " ") {
                    let customerEmailData = {
                        type: "TCustomer",
                        fields: {
                            ID: customerID,
                            Email: customerEmail
                        }
                    }



                };
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
                            PrefName: 'refundcard'
                        });

                        if (checkPrefDetails) {
                            CloudPreference.update({
                                _id: checkPrefDetails._id
                            }, {
                                $set: {
                                    username: clientUsername,
                                    useremail: clientEmail,
                                    PrefGroup: 'salesform',
                                    PrefName: 'refundcard',
                                    published: true,
                                    customFields: [{
                                        index: '1',
                                        label: getcustomField1,
                                        hidden: getchkcustomField1
                                    }, {
                                        index: '2',
                                        label: getcustomField2,
                                        hidden: getchkcustomField2
                                    }],
                                    updatedAt: new Date()
                                }
                            }, function(err, idTag) {
                                if (err) {

                                } else {


                                }
                            });
                        } else {
                            CloudPreference.insert({
                                userid: clientID,
                                username: clientUsername,
                                useremail: clientEmail,
                                PrefGroup: 'salesform',
                                PrefName: 'refundcard',
                                published: true,
                                customFields: [{
                                    index: '1',
                                    label: getcustomField1,
                                    hidden: getchkcustomField1
                                }, {
                                    index: '2',
                                    label: getcustomField2,
                                    hidden: getchkcustomField2
                                }],
                                createdAt: new Date()
                            }, function(err, idTag) {
                                if (err) {

                                } else {


                                }
                            });
                        }
                    }
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

                LoadingOverlay.hide();
            });
        }
    }, delayTimeAfterSound);
    },

    'click .chkProductName': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colProductName').addClass('showColumn');
        $('.colProductName').removeClass('hiddenColumn');
      } else {
        $('.colProductName').addClass('hiddenColumn');
        $('.colProductName').removeClass('showColumn');
      }
    },
    'click .chkDescription': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colDescription').addClass('showColumn');
        $('.colDescription').removeClass('hiddenColumn');
      } else {
        $('.colDescription').addClass('hiddenColumn');
        $('.colDescription').removeClass('showColumn');
      }
    },
    'click .chkQty': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colQty').addClass('showColumn');
        $('.colQty').removeClass('hiddenColumn');
      } else {
        $('.colQty').addClass('hiddenColumn');
        $('.colQty').removeClass('showColumn');
      }
    },
    'click .chkCostPrice': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colCostPrice').addClass('showColumn');
        $('.colCostPrice').removeClass('hiddenColumn');
      } else {
        $('.colCostPrice').addClass('hiddenColumn');
        $('.colCostPrice').removeClass('showColumn');
      }
    },
    'click .chkSalesLinesCustField1': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colSalesLinesCustField1').addClass('showColumn');
        $('.colSalesLinesCustField1').removeClass('hiddenColumn');
      } else {
        $('.colSalesLinesCustField1').addClass('hiddenColumn');
        $('.colSalesLinesCustField1').removeClass('showColumn');
      }
    },
    'click .chkTaxRate': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colTaxRate').addClass('showColumn');
        $('.colTaxRate').removeClass('hiddenColumn');
      } else {
        $('.colTaxRate').addClass('hiddenColumn');
        $('.colTaxRate').removeClass('showColumn');
      }
    },
    // displaysettings
    'click .chkTaxCode': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colTaxCode').addClass('showColumn');
        $('.colTaxCode').removeClass('hiddenColumn');
      } else {
        $('.colTaxCode').addClass('hiddenColumn');
        $('.colTaxCode').removeClass('showColumn');
      }
    },
    'click .chkTaxAmount': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colTaxAmount').addClass('showColumn');
        $('.colTaxAmount').removeClass('hiddenColumn');
      } else {
        $('.colTaxAmount').addClass('hiddenColumn');
        $('.colTaxAmount').removeClass('showColumn');
      }
    },

    'click .chkAmountEx': function (event) {
      if ($(event.target).is(':checked')) {
          $('.chkAmountInc').prop("checked", false);

          $('.colAmountInc').addClass('hiddenColumn');
          $('.colAmountInc').removeClass('showColumn');

          $('.colAmountEx').addClass('showColumn');
          $('.colAmountEx').removeClass('hiddenColumn');
        } else {
          $('.chkAmountInc').prop("checked", true);

          $('.colAmountEx').addClass('hiddenColumn');
          $('.colAmountEx').removeClass('showColumn');

          $('.colAmountInc').addClass('showColumn');
          $('.colAmountInc').removeClass('hiddenColumn');
      }
    },
    'click .chkAmountInc': function(event) {
      if ($(event.target).is(':checked')) {
          $('.chkAmountEx').prop("checked", false);

          $('.colAmountEx').addClass('hiddenColumn');
          $('.colAmountEx').removeClass('showColumn');

          $('.colAmountInc').addClass('showColumn');
          $('.colAmountInc').removeClass('hiddenColumn');
      } else {
          $('.chkAmountEx').prop("checked", true);

          $('.colAmountInc').addClass('hiddenColumn');
          $('.colAmountInc').removeClass('showColumn');

          $('.colAmountEx').addClass('showColumn');
          $('.colAmountEx').removeClass('hiddenColumn');
      }
    },

    'click .chkUnitPriceEx': function (event) {
      if ($(event.target).is(':checked')) {
          $('.chkUnitPriceInc').prop("checked", false);

          $('.colUnitPriceInc').addClass('hiddenColumn');
          $('.colUnitPriceInc').removeClass('showColumn');

          $('.colUnitPriceEx').addClass('showColumn');
          $('.colUnitPriceEx').removeClass('hiddenColumn');

      } else {
          $('.chkUnitPriceInc').prop("checked", true);

          $('.colUnitPriceEx').addClass('hiddenColumn');
          $('.colUnitPriceEx').removeClass('showColumn');

          $('.colUnitPriceInc').addClass('showColumn');
          $('.colUnitPriceInc').removeClass('hiddenColumn');
      }
    },
    'click .chkUnitPriceInc': function(event) {
        if ($(event.target).is(':checked')) {
          $('.chkUnitPriceEx').prop("checked", false);

          $('.colUnitPriceEx').addClass('hiddenColumn');
          $('.colUnitPriceEx').removeClass('showColumn');

          $('.colUnitPriceInc').addClass('showColumn');
          $('.colUnitPriceInc').removeClass('hiddenColumn');
        } else {
          $('.chkUnitPriceEx').prop("checked", true);

          $('.colUnitPriceInc').addClass('hiddenColumn');
          $('.colUnitPriceInc').removeClass('showColumn');

          $('.colUnitPriceEx').addClass('showColumn');
          $('.colUnitPriceEx').removeClass('hiddenColumn');
        }
    },

    'click .chkDiscount': function(event) {
      if ($(event.target).is(':checked')) {
          // $('.colDiscount').css('display', 'table-cell');
          // $('.colDiscount').css('padding', '.75rem');
          // $('.colDiscount').css('vertical-align', 'top');
        $('.colDiscount').addClass('showColumn');
        $('.colDiscount').removeClass('hiddenColumn');
      } else {
          // $('.colDiscount').css('display', 'none');
          $('.colDiscount').addClass('hiddenColumn');
          $('.colDiscount').removeClass('showColumn');
      }
    },
    'click .chkSerialNo': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colSerialNo').addClass('showColumn');
        $('.colSerialNo').removeClass('hiddenColumn');
      } else {
        $('.colSerialNo').addClass('hiddenColumn');
        $('.colSerialNo').removeClass('showColumn');
      }
    },
    // display settings

    'change .rngRangeProductName': function(event) {
      let range = $(event.target).val();
      $(".spWidthProductName").html(range);
      $('.colProductName').css('width', range);
  },
  'change .rngRangeDescription': function(event) {
      let range = $(event.target).val();
      $(".spWidthDescription").html(range);
      $('.colDescription').css('width', range);
  },
  'change .rngRangeQty': function(event) {
      let range = $(event.target).val();
      $(".spWidthQty").html(range);
      $('.colQty').css('width', range);
  },
  'change .rngRangeUnitPriceInc': function(event) {
      let range = $(event.target).val();
      $(".spWidthUnitPrice").html(range);
      $('.colUnitPriceInc').css('width', range);
  },
  'change .rngRangeUnitPriceEx': function(event) {
      let range = $(event.target).val();
      $('.colUnitPriceEx').css('width', range);
  },
  'change .rngRangeTaxRate': function(event) {
      let range = $(event.target).val();
      $(".spWidthTaxRate").html(range);
      $('.colTaxRate').css('width', range);
  },
  'change .rngRangeAmountInc': function (event) {
      let range = $(event.target).val();
      //$(".spWidthAmount").html(range);
      $('.colAmountInc').css('width', range);
  },
  'change .rngRangeAmountEx': function (event) {
      let range = $(event.target).val();
      //$(".spWidthAmount").html(range);
      $('.colAmountEx').css('width', range);
  },
  'change .rngRangeTaxAmount': function (event) {
      let range = $(event.target).val();
      //$(".spWidthAmount").html(range);
      $('.colTaxAmount').css('width', range);
  },
  'change .rngRangeDiscount': function (event) {
      let range = $(event.target).val();
      $('.colDiscount').css('width', range);
  },
  'change .rngRangeSerialNo': function (event) {
      let range = $(event.target).val();
      $('.colSerialNo').css('width', range);
  },
  'change .rngRangeTaxCode': function (event) {
      let range = $(event.target).val();
      $('.colTaxCode').css('width', range);
  },
  'change .rngRangeCostPrice': function(event) {
      let range = $(event.target).val();
      $(".spWidthCostPrice").html(range);
      $('.colCostPrice').css('width', range);
  },
  'change .rngRangeSalesLinesCustField1': function(event) {
      let range = $(event.target).val();
      $(".spWidthSalesLinesCustField1").html(range);
      $('.colSalesLinesCustField1').css('width', range);
  },
    'blur .divcolumn': function(event) {
        let columData = $(event.target).html();
        let columHeaderUpdate = $(event.target).attr("valueupdate");
        $("th.col" + columHeaderUpdate + "").html(columData);

     },

    // custom field displaysettings
    'click .btnSaveGridSettings': async function(event) {
        playSaveAudio();
        let templateObject = Template.instance();
        setTimeout(async function(){
      let lineItems = [];
      $(".fullScreenSpin").css("display", "inline-block");

      $(".displaySettings").each(function (index) {
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


      let reset_data = templateObject.reset_data.get();
      reset_data = reset_data.filter(redata => redata.display == false);
      lineItems.push(...reset_data);
      lineItems.sort((a,b) => a.index - b.index);

      try {
        let erpGet = erpDb();
        let tableName = "tblRefundLine";
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
    }, delayTimeAfterSound);
    },

    // custom field displaysettings
    'click .btnResetGridSettings': function(event) {
      let templateObject = Template.instance();
      let reset_data = templateObject.reset_data.get();
      let isBatchSerialNoTracking = Session.get("CloudShowSerial") || false;
      if(isBatchSerialNoTracking) {
        reset_data[11].display = true;
      } else {
        reset_data[11].display = false;
      }
      reset_data = reset_data.filter(redata => redata.display);

      $(".displaySettings").each(function (index) {
        let $tblrow = $(this);
        $tblrow.find(".divcolumn").text(reset_data[index].label);
        $tblrow
          .find(".custom-control-input")
          .prop("checked", reset_data[index].active);

        let title = $("#tblInvoiceLine").find("th").eq(index);
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
        $(".rngRange" + reset_data[index].class).val('');
      });
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
                    PrefName: 'refundcard'
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
    'click #btnPayment': function() {
        let templateObject = Template.instance();
        let customername = $('#edtCustomerName');
        let salesService = new SalesBoardService();
        let termname = $('#sltTerms').val() || '';
        if (termname === '') {
            swal('Terms has not been selected!', '', 'warning');
            event.preventDefault();
            return false;
        }
        if (customername.val() === '') {
            swal('Customer has not been selected!', '', 'warning');
            e.preventDefault();
        } else {

            LoadingOverlay.show();
            var splashLineArray = new Array();
            let lineItemsForm = [];
            let lineItemObjForm = {};
            var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
            var duedateTime = new Date($("#dtDueDate").datepicker("getDate"));

            let saleDate = saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate();
            let dueDate = duedateTime.getFullYear() + "-" + (duedateTime.getMonth() + 1) + "-" + duedateTime.getDate();
            $('#tblInvoiceLine > tbody > tr').each(function() {
                var lineID = this.id;
                let tdproduct = $('#' + lineID + " .lineProductName").val();
                let tddescription = $('#' + lineID + " .lineProductDesc").text();
                let tdQty = $('#' + lineID + " .lineQty").val();
                let tdunitprice = $('#' + lineID + " .colUnitPriceExChange").val();
                let tdtaxrate = $('#' + lineID + " .lineTaxRate").text();
                let tdtaxCode = $('#' + lineID + " .lineTaxCode").val()||loggedTaxCodeSalesInc;
                let tdlineamt = $('#' + lineID + " .lineAmt").text();

                if (tdproduct != "") {

                    lineItemObjForm = {
                        type: "TRefundSaleLine",
                        fields: {
                            ProductName: tdproduct || '',
                            ProductDescription: tddescription || '',
                            UOMOrderQty:parseFloat(tdQty) || 0,
                            UOMQtySold: parseFloat(tdQty) || 0,
                            UOMQtyShipped: parseFloat(tdQty) || 0,
                            LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                            Headershipdate: saleDate,
                            LineTaxCode: tdtaxCode || '',
                            DiscountPercent: parseFloat($('#' + lineID + " .lineDiscount").text()) || 0
                        }
                    };
                    lineItemsForm.push(lineItemObjForm);
                    splashLineArray.push(lineItemObjForm);
                }
            });
            let getchkcustomField1 = true;
            let getchkcustomField2 = true;
            let getcustomField1 = $('.customField1Text').html();
            let getcustomField2 = $('.customField2Text').html();
            if ($('#formCheck-one').is(':checked')) {
                getchkcustomField1 = false;
            }
            if ($('#formCheck-two').is(':checked')) {
                getchkcustomField2 = false;
            }

            let customer = $('#edtCustomerName').val();
            let customerEmail = $('#edtCustomerEmail').val();
            let billingAddress = $('#txabillingAddress').val();



            let poNumber = $('#ponumber').val();
            let reference = $('#edtRef').val();

            let departement = $('#sltDept').val();
            let shippingAddress = $('#txaShipingInfo').val();
            let comments = $('#txaComment').val();
            let pickingInfrmation = $('#txapickmemo').val();

            let saleCustField1 = $('#edtSaleCustField1').val()||'';
            let saleCustField2 = $('#edtSaleCustField2').val()||'';
            let saleCustField3 = $('#edtSaleCustField3').val()||'';
            var url = FlowRouter.current().path;
            var getso_id = url.split('?id=');
            var currentInvoice = getso_id[getso_id.length - 1];
            let uploadedItems = templateObject.uploadedFiles.get();
            var currencyCode = $("#sltCurrency").val() || CountryAbbr;
            let ForeignExchangeRate = $('#exchange_rate').val()||0;
            let foreignCurrencyFields = {}
            if( FxGlobalFunctions.isCurrencyEnabled() ){
                foreignCurrencyFields = {
                    ForeignExchangeCode: currencyCode,
                    ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                }
            }
            var objDetails = '';
            if (getso_id[1]) {
                currentInvoice = parseInt(currentInvoice);
                objDetails = {
                    type: "TRefundSale",
                    fields: {
                        ID: currentInvoice,
                        CustomerName: customer,
                        // ForeignExchangeCode: currencyCode,
                        // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                        ...foreignCurrencyFields,
                        Lines: splashLineArray,
                        InvoiceToDesc: billingAddress,
                        SaleDate: saleDate,

                        CustPONumber: poNumber,
                        ReferenceNo: reference,
                        TermsName: termname,
                        SaleClassName: departement,
                        ShipToDesc: shippingAddress,
                        Comments: comments,
                        SaleCustField1: saleCustField1,
                        SaleCustField2: saleCustField2,
                        SaleCustField3: saleCustField3,
                        PickMemo: pickingInfrmation,
                        Attachments: uploadedItems,
                        SalesStatus: $('#sltStatus').val()
                    }
                };
            } else {
                objDetails = {
                    type: "TRefundSale",
                    fields: {
                        CustomerName: customer,
                        // ForeignExchangeCode: currencyCode,
                        // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                        ...foreignCurrencyFields,
                        Lines: splashLineArray,
                        InvoiceToDesc: billingAddress,
                        SaleDate: saleDate,

                        CustPONumber: poNumber,
                        ReferenceNo: reference,
                        TermsName: termname,
                        SaleClassName: departement,
                        ShipToDesc: shippingAddress,
                        Comments: comments,
                        SaleCustField1: saleCustField1,
                        SaleCustField2: saleCustField2,
                        SaleCustField3: saleCustField3,
                        PickMemo: pickingInfrmation,
                        Attachments: uploadedItems,
                        SalesStatus: $('#sltStatus').val()
                    }
                };
            }

            salesService.saveRefundSale(objDetails).then(function(objDetails) {
                var customerID = $('#edtCustomerEmail').attr('customerid');
                if (customerID !== " ") {
                    let customerEmailData = {
                        type: "TCustomer",
                        fields: {
                            ID: customerID,
                            Email: customerEmail
                        }
                    }
                    // salesService.saveCustomerEmail(customerEmailData).then(function(customerEmailData) {
                    //
                    // });
                };
                let linesave = objDetails.fields.ID;
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
                            PrefName: 'refundcard'
                        });

                        if (checkPrefDetails) {
                            CloudPreference.update({
                                _id: checkPrefDetails._id
                            }, {
                                $set: {
                                    username: clientUsername,
                                    useremail: clientEmail,
                                    PrefGroup: 'salesform',
                                    PrefName: 'refundcard',
                                    published: true,
                                    customFields: [{
                                        index: '1',
                                        label: getcustomField1,
                                        hidden: getchkcustomField1
                                    }, {
                                        index: '2',
                                        label: getcustomField2,
                                        hidden: getchkcustomField2
                                    }],
                                    updatedAt: new Date()
                                }
                            }, function(err, idTag) {
                                if (err) {
                                    window.open('/paymentcard?invid=' + linesave, '_self');
                                } else {
                                    window.open('/paymentcard?invid=' + linesave, '_self');

                                }
                            });
                        } else {
                            CloudPreference.insert({
                                userid: clientID,
                                username: clientUsername,
                                useremail: clientEmail,
                                PrefGroup: 'salesform',
                                PrefName: 'refundcard',
                                published: true,
                                customFields: [{
                                    index: '1',
                                    label: getcustomField1,
                                    hidden: getchkcustomField1
                                }, {
                                    index: '2',
                                    label: getcustomField2,
                                    hidden: getchkcustomField2
                                }],
                                createdAt: new Date()
                            }, function(err, idTag) {
                                if (err) {
                                    window.open('/paymentcard?invid=' + linesave, '_self');
                                } else {
                                    window.open('/paymentcard?invid=' + linesave, '_self');

                                }
                            });
                        }
                    }
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

                LoadingOverlay.hide();
            });
        }


     },
    'click #btnViewPayment': function() {
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentInvoice = getso_id[getso_id.length - 1];

        let customer = $('#edtCustomerName').val();
        window.open('/paymentcard?custname=' + customer + '&from=' + currentInvoice, '_self');
     },
    'click .btnBack': function(event) {
        playCancelAudio();
        event.preventDefault();
        setTimeout(function(){
        if(FlowRouter.current().queryParams.trans){
          FlowRouter.go('/customerscard?id='+FlowRouter.current().queryParams.trans+'&transTab=active');
        }else{
          history.back(1);
        };
        }, delayTimeAfterSound);
     },
    'click .chkEmailCopy': function(event) {
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

    'click .btnSnLotmodal': function(event) {
        LoadingOverlay.show();
        const templateObject = Template.instance();
        var target=event.target;
        let selectedProductName = $(target).closest('tr').find('.lineProductName').val();
        let selectedunit = $(target).closest('tr').find('.lineQty').val();
        localStorage.setItem('productItem', selectedunit);
        localStorage.setItem("selectedProductName", selectedProductName);
        let existProduct = false;
        let productService = new ProductService();
        const InvoiceData = templateObject.invoicerecord.get();
        InvoiceData.LineItems.forEach(element => {
            if (element.item == selectedProductName) {
                existProduct = true;
                productService.getProductStatus(selectedProductName).then(function(data) {
                    LoadingOverlay.hide();
                    if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == false) {
                        swal('', 'The product "' + selectedProductName + '" does not track Lot Number, Bin Location or Serial Number', 'info');
                        event.preventDefault();
                        return false;
                    } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
                        var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                        $('#lotNumberModal').attr('data-row', row + 1);
                        $('#lotNumberModal').modal('show');
                        if (element.pqaseriallotdata == "null") {
                        } else {
                            if (element.pqaseriallotdata.fields.PQABatch == "null") {
                            } else {
                                if (element.pqaseriallotdata.fields.PQABatch.length == 0) {
                                } else {
                                    let shtml = '';
                                    let i = 0;
                                    shtml += `<tr><td rowspan="2"></td><td colspan="3" class="text-center">Allocate Lot Numbers</td></tr>
                                    <tr><td class="text-start">#</td><td class="text-start">Lot Number</td><td class="text-start">Expiry Date</td></tr>
                                    `;
                                    for (let k = 0; k < element.pqaseriallotdata.fields.PQABatch.length; k++) {
                                        const dates = element.pqaseriallotdata.fields.PQABatch[k].fields.BatchExpiryDate.split(' ')[0].split('-') || '';
                                        if (element.pqaseriallotdata.fields.PQABatch[k].fields.BatchNo == "null") {
                                        } else {
                                            i++;
                                            shtml += `
                                            <tr>
                                                <td></td>
                                                <td>${Number(i)}</td><td contenteditable="true" class="lineLotnumbers">${element.pqaseriallotdata.fields.PQABatch[k].fields.BatchNo}</td>
                                                <td class="lotExpiryDate">
                                                    <div class="form-group m-0">
                                                        <div class="input-group date" style="cursor: pointer;">
                                                            <input type="text" class="form-control" style="height: 25px;" value="${dates[2]}/${dates[1]}/${dates[0]}">
                                                            <div class="input-group-addon">
                                                                <span class="glyphicon glyphicon-th" style="cursor: pointer;"></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            `;
                                        }
                                    }
                                    $('#tblLotlist tbody').html(shtml);
                                    $('.lotExpiryDate input').datepicker({
                                        showOn: 'focus',
                                        buttonImageOnly: false,
                                        dateFormat: 'dd/mm/yy',
                                        showOtherMonths: true,
                                        selectOtherMonths: true,
                                        changeMonth: true,
                                        changeYear: true,
                                        yearRange: "-90:+10",
                                    });
                                }
                            }
                        }
                    } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                        var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                        $('#serialNumberModal').attr('data-row', row + 1);
                        $('#serialNumberModal').modal('show');
                        if (element.pqaseriallotdata == "null") {
                        } else {
                            if (element.pqaseriallotdata.fields.PQASN == "null") {
                            } else {
                                if (element.pqaseriallotdata.fields.PQASN.length == 0) {
                                } else {
                                    let shtml = '';
                                    let i = 0;
                                    shtml += `
                                    <tr><td rowspan="2"></td><td colspan="2" class="text-center">Allocate Serial Numbers</td></tr>
                                    <tr><td class="text-start">#</td><td class="text-start">Serial number</td></tr>
                                    `;
                                    for (let k = 0; k < element.pqaseriallotdata.fields.PQASN.length; k++) {
                                        if (element.pqaseriallotdata.fields.PQASN[k].fields.SerialNumber == "null") {

                                        } else {
                                            i++;
                                            shtml += `
                                            <tr><td></td><td class="lineNo">${i}</td><td contenteditable="true" class="lineSerialnumbers">${Number(element.pqaseriallotdata.fields.PQASN[k].fields.SerialNumber)}</td></tr>
                                            `;
                                        }
                                    }
                                    $('#tblSeriallist tbody').html(shtml);
                                }
                            }
                        }
                    }
                });
            }
        });
        if (!existProduct) {
            if (selectedProductName == '') {
                LoadingOverlay.hide();
                swal('You have to select Product.', '', 'info');
                event.preventDefault();
                return false;
            } else {
                productService.getProductStatus(selectedProductName).then(function(data) {
                    LoadingOverlay.hide();
                    if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == false) {
                        swal('', 'The product "' + selectedProductName + '" does not track Lot Number, Bin Location or Serial Number', 'info');
                        event.preventDefault();
                        return false;
                    } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
                        var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                        $('#lotNumberModal').attr('data-row', row + 1);
                        $('#lotNumberModal').modal('show');
                    } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                        var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                        $('#serialNumberModal').attr('data-row', row + 1);
                        $('#serialNumberModal').modal('show');
                    }
                });
            }
       }
     },

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
                const mainValueElement = document.querySelector(`#tblInvoiceLine tbody td.${mainClass}:not(.convert-to-foreign):not(.hiddenColumn)`);
            // const footerValueElement = document.querySelector(`#tblJournalEntryLine tfoot td.${mainClass}:not(.convert-to-foreign):not(.hiddenColumn)`);

                let value = mainValueElement.childElementCount > 0 ?
                    $(mainValueElement).find('input').val() :
                    mainValueElement.innerText;

                $(element).attr("value", convertToForeignAmount(value, rate, false));
                value = convertToForeignAmount(value, rate, getCurrentCurrencySymbol());
                $(element).text(value);

            })
        }, 500);

    },

    "change input.colUnitPriceEx": (e, ui) => {
        const td = $(e.currentTarget).parent('tr');
        $('.colUnitPriceEx.convert-to-foreign');
    }

});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});
