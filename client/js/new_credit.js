import {SalesBoardService} from './sales-service';
import {PurchaseBoardService} from './purchase-service';
import {ReactiveVar} from 'meteor/reactive-var';
import {CoreService} from '../js/core-service';
import {DashBoardService} from "../Dashboard/dashboard-service";
import {UtilityService} from "../utility-service";
import {ProductService} from "../product/product-service";
import {AccountService} from "../accounts/account-service";
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import {SideBarService} from '../js/sidebar-service';
import {Random} from 'meteor/random';
import {jsPDF} from 'jspdf';
import 'jQuery.print/jQuery.print.js';
import {autoTable} from 'jspdf-autotable';
import 'jquery-editable-select';
import {ContactService} from "../contacts/contact-service";
import { TaxRateService } from "../settings/settings-service";
import { saveCurrencyHistory } from '../packages/currency/CurrencyWidget';
import { convertToForeignAmount } from '../payments/paymentcard/supplierPaymentcard';
import { getCurrentCurrencySymbol } from '../popUps/currnecypopup';
import FxGlobalFunctions from '../packages/currency/FxGlobalFunctions';

let utilityService = new UtilityService();
let sideBarService = new SideBarService();
var times = 0;
let purchaseDefaultTerms = "";
let defaultCurrencyCode = CountryAbbr;

var template_list = [
       "Credits",
];
var noHasTotals = ["Customer Payment", "Customer Statement", "Supplier Payment", "Statement", "Delivery Docket", "Journal Entry", "Deposit"];

Template.creditcard.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.isForeignEnabled = new ReactiveVar(false);

    templateObject.records = new ReactiveVar();
    templateObject.CleintName = new ReactiveVar();
    templateObject.Department = new ReactiveVar();
    templateObject.Date = new ReactiveVar();
    templateObject.DueDate = new ReactiveVar();
    templateObject.CreditNo = new ReactiveVar();
    templateObject.RefNo = new ReactiveVar();
    templateObject.Branding = new ReactiveVar();
    templateObject.Currency = new ReactiveVar();
    templateObject.Total = new ReactiveVar();
    templateObject.Subtotal = new ReactiveVar();
    templateObject.TotalTax = new ReactiveVar();
    templateObject.creditrecord = new ReactiveVar({});
    templateObject.taxrateobj = new ReactiveVar();
    templateObject.Accounts = new ReactiveVar([]);
    templateObject.CreditId = new ReactiveVar();
    templateObject.selectedCurrency = new ReactiveVar([]);
    templateObject.inputSelectedCurrency = new ReactiveVar([]);
    templateObject.currencySymbol = new ReactiveVar([]);
    templateObject.deptrecords = new ReactiveVar();
    templateObject.viarecords = new ReactiveVar();
    templateObject.termrecords = new ReactiveVar();
    templateObject.clientrecords = new ReactiveVar([]);
    templateObject.taxraterecords = new ReactiveVar([]);
    templateObject.taxcodes = new ReactiveVar([]);
    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();
    templateObject.address = new ReactiveVar();
    templateObject.abn = new ReactiveVar();
    templateObject.referenceNumber = new ReactiveVar();
    templateObject.statusrecords = new ReactiveVar([]);
    templateObject.accountID = new ReactiveVar();
    templateObject.stripe_fee_method = new ReactiveVar();
    templateObject.subtaxcodes = new ReactiveVar([]);

    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
});

Template.creditcard.onRendered(() => {
    $('#choosetemplate').attr('checked', true);
    const dataListTable = [
        ' ' || '',
        ' ' || '',
        0 || 0,
        0.00 || 0.00,
        ' ' || '',
        0.00 || 0.00,
        '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
    ];
    $(window).on('load', function () {
        var win = $(this); //this = window
        if (win.width() <= 1024 && win.width() >= 450) {
            $("#colBalanceDue").addClass("order-12");
        }

        if (win.width() <= 926) {
            $("#totalSection").addClass("offset-md-6");
        }

    });

    $(document).on("click", ".templateItem .btnPreviewTemplate", function(e) {

        title = $(this).parent().attr("data-id");
        number =  $(this).parent().attr("data-template-id");//e.getAttribute("data-template-id");
        templateObject.generateInvoiceData(title,number);

     });

    let imageData = (localStorage.getItem("Image"));
    if (imageData) {
        $('.uploadedImage').attr('src', imageData);
    }
    const templateObject = Template.instance();
    const purchaseService = new PurchaseBoardService();
    const clientsService = new PurchaseBoardService();
    const contactService = new ContactService();

    const clientList = [];
    const deptrecords = [];
    const viarecords = [];
    const termrecords = [];
    const statusList = [];


    // set initial table rest_data
    function init_reset_data() {

      let reset_data = [
        { index: 0, label: "Account Name", class: "AccountName", width: "300", active: true, display: true },
        { index: 1, label: "Memo", class: "Memo", width: "", active: true, display: true },
        { index: 2, label: "Amount (Ex)", class: "AmountEx", width: "140", active: true, display: true },
        { index: 3, label: "Amount (Inc)", class: "AmountInc", width: "140", active: false, display: true },
        { index: 4, label: "Fixed Asset", class: "FixedAsset", width: "124", active: true, display: true },
        { index: 5, label: "Tax Rate", class: "TaxRate", width: "95", active: false, display: true },
        { index: 6, label: "Tax Code", class: "TaxCode", width: "95", active: true, display: true },
        { index: 7, label: "Tax Amt", class: "TaxAmount", width: "95", active: true, display: true },
        { index: 8, label: "Serial/Lot No", class: "SerialNo", width: "124", active: true, display: true },
        { index: 9, label: "Custom Field 1", class: "CustomField1", width: "124", active: false, display: true },
        { index: 10, label: "Custom Field 2", class: "CustomField2", width: "124", active: false, display: true },
      ];

      let isBatchSerialNoTracking = Session.get("CloudShowSerial") || false;
      if(isBatchSerialNoTracking) {
        reset_data[7].display = true;
      } else {
        reset_data[7].display = false;
      }

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
    templateObject.initCustomFieldDisplaySettings("", "tblCreditLine");


      templateObject.getTemplateInfoNew = function(){
        $('.fullScreenSpin').css('display', 'inline-block');
        getVS1Data('TTemplateSettings').then(function(dataObject) {
          if (dataObject.length == 0) {
              sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                  addVS1Data('TTemplateSettings', JSON.stringify(data));

                  for (let i = 0; i < data.ttemplatesettings.length; i++) {


                     if(data.ttemplatesettings[i].fields.SettingName == 'Credits')
                     {

                            if(data.ttemplatesettings[i].fields.Template == 1)
                            {
                                    $('input[name="Credits_1"]').val(data.ttemplatesettings[i].fields.Description);
                                    if(data.ttemplatesettings[i].fields.Active == true)
                                    {
                                      $('#Credits_1').attr('checked','checked');
                                    }

                            }
                            if(data.ttemplatesettings[i].fields.Template == 2)
                            {
                                  $('input[name="Credits_2"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Credits_2').attr('checked','checked');
                                  }
                            }

                            if(data.ttemplatesettings[i].fields.Template == 3)
                            {
                                  $('input[name="Credits_3"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Credits_3').attr('checked','checked');
                                  }
                            }

                     }



                 }


                  $('.fullScreenSpin').css('display', 'none');
              }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
              });
          }else{
                  let data = JSON.parse(dataObject[0].data);

                  for (let i = 0; i < data.ttemplatesettings.length; i++) {


                    if(data.ttemplatesettings[i].fields.SettingName == 'Credits')
                    {

                           if(data.ttemplatesettings[i].fields.Template == 1)
                           {
                                   $('input[name="Credits_1"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Credits_1').attr('checked','checked');
                                   }

                           }
                           if(data.ttemplatesettings[i].fields.Template == 2)
                           {
                                 $('input[name="Credits_2"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Credits_2').attr('checked','checked');
                                 }
                           }

                           if(data.ttemplatesettings[i].fields.Template == 3)
                           {
                                 $('input[name="Credits_3"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Credits_3').attr('checked','checked');
                                 }
                           }

                    }



                 }
                  $('.fullScreenSpin').css('display', 'none');
          }
        }).catch(function(err) {
        sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                  addVS1Data('TTemplateSettings', JSON.stringify(data));

                  for (let i = 0; i < data.ttemplatesettings.length; i++) {



                     if(data.ttemplatesettings[i].fields.SettingName == 'Credits')
                     {

                            if(data.ttemplatesettings[i].fields.Template == 1)
                            {
                                    $('input[name="Credits_1"]').val(data.ttemplatesettings[i].fields.Description);
                                    if(data.ttemplatesettings[i].fields.Active == true)
                                    {
                                      $('#Credits_1').attr('checked','checked');
                                    }

                            }
                            if(data.ttemplatesettings[i].fields.Template == 2)
                            {
                                  $('input[name="Credits_2"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Credits_2').attr('checked','checked');
                                  }
                            }

                            if(data.ttemplatesettings[i].fields.Template == 3)
                            {
                                  $('input[name="Credits_3"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Credits_3').attr('checked','checked');
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

    templateObject.getLastCreditData = async function() {
        let lastBankAccount = "Bank";
        let lastDepartment = defaultDept || "";
        purchaseService.getLastCreditID().then(function(data) {
          let latestCreditId;
            if (data.tcredit.length > 0) {
                lastCredit = data.tcredit[data.tcredit.length - 1]
                latestCreditId = (lastCredit.Id);
            } else {
              latestCreditId = 0;
            }
            newCreditId = (latestCreditId + 1);
            setTimeout(function() {
                $('#sltDept').val(lastDepartment);
                if (FlowRouter.current().queryParams.id) {

                }else{
                // $(".heading").html("New Credit " +newCreditId +'<a role="button" class="btn btn-success" data-toggle="modal" href="#supportModal" style="margin-left: 12px;">Help <i class="fa fa-question-circle-o" style="font-size: 20px;"></i></a>');
                };
            }, 50);
        }).catch(function(err) {
            $('#sltDept').val(lastDepartment);
        });
    };


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

    function showCreditData(template_title,number) {

        var array_data = [];
        let lineItems = [];
        let taxItems = {};
        object_invoce = [];
        let item_invoices = '';

        let invoice_data = templateObject.creditrecord.get();
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


        $('#tblCreditLine > tbody > tr').each(function () {

        var lineID = this.id;
        let accountName = $('#' + lineID + " .es-input").val();
        let colMemo = $('#' + lineID + " .colMemo").text();
        let colTaxAmount = $('#' + lineID + " .colTaxAmount").text();

        let colAmount = $('#' + lineID + " .colAmount").val();

        let targetRow = $('#' + lineID);
        let targetTaxCode = targetRow.find('.lineTaxCode').val();
        let price = targetRow.find('.colAmount').val() || '';
        const taxDetail = templateObject.taxcodes.get().find((v) => v.CodeName === targetTaxCode);

        if (taxDetail) {
            let priceTotal = Number(price.replace(/[^0-9.-]+/g, ""));
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
            accountName,
            colMemo,
            colTaxAmount,
            colAmount,

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
                title: 'Credit',
                value:invoice_data.id,
                date: dtSODate,
                invoicenumber:invoice_data.id,
                refnumber: "",
                pqnumber: "",
                duedate:"",
                paylink: "",
                supplier_type: "Supplier",
                supplier_name : customer,
                supplier_addr : txabillingAddress,
                fields: {"Account Name" : "30", "Memo" : "30", "Tax" : "20", "Amount" : "20"},
                subtotal :subtotal_total,
                gst : subtotal_tax,
                total : grandTotal,
                paid_amount : total_paid,
                bal_due : balancedue,
                bsb :'',
                account : '',
                swift : '',
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
                title: 'Credit',
                value:invoice_data.id,
                date: dtSODate,
                invoicenumber:invoice_data.id,
                refnumber: "",
                pqnumber: "",
                duedate:"",
                paylink: "",
                supplier_type: "Supplier",
                supplier_name : customer,
                supplier_addr : txabillingAddress,
                fields: {"Account Name" : "30", "Memo" : "30", "Tax" : "20", "Amount" : "20"},
                subtotal :subtotal_total,
                gst : subtotal_tax,
                total : grandTotal,
                paid_amount : total_paid,
                bal_due : balancedue,
                bsb :'',
                account : '',
                swift : '',
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
                title: 'Credit',
                value:invoice_data.id,
                date: dtSODate,
                invoicenumber:invoice_data.id,
                refnumber: "",
                pqnumber: "",
                duedate:"",
                paylink: "",
                supplier_type: "Supplier",
                supplier_name : customer,
                supplier_addr : txabillingAddress,
                fields: {"Account Name" : "30", "Memo" : "30", "Tax" : "20", "Amount" : "20"},
                subtotal :subtotal_total,
                gst : subtotal_tax,
                total : grandTotal,
                paid_amount : total_paid,
                bal_due : balancedue,
                bsb :'',
                account : '',
                swift : '',
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

    function showCreditData1(template_title, number, bprint) {

        var array_data = [];
        let lineItems = [];
        let taxItems = {};
        object_invoce = [];
        let item_invoices = '';

        let invoice_data = templateObject.creditrecord.get();
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


        $('#tblCreditLine > tbody > tr').each(function () {

        var lineID = this.id;
        let accountName = $('#' + lineID + " .es-input").val();
        let colMemo = $('#' + lineID + " .colMemo").text();
        let colTaxAmount = $('#' + lineID + " .colTaxAmount").first().text();

        let colAmount = $('#' + lineID + " .colAmount").first().val();

        let targetRow = $('#' + lineID);
        let targetTaxCode = targetRow.find('.lineTaxCode').val();
        let qty = targetRow.find(".lineQty").val() || 0
        let price = targetRow.find('.colUnitPriceExChange').val() || '';
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
            accountName,
            colMemo,
            colTaxAmount,
            colAmount,

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
                title: 'Credit',
                value:invoice_data.id,
                date: dtSODate,
                invoicenumber:invoice_data.id,
                refnumber: ref,
                pqnumber: po,
                duedate: duedate,
                paylink: "",
                supplier_type: "Supplier",
                supplier_name : customer,
                supplier_addr : txabillingAddress,
                fields: {
                    "Account Name" : ["30", "left"],
                    "Description" : ["40", "left"],
                    "Tax" : ["15", "right"],
                    "Amount" : ["15", "right"]
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
                title: 'Credit',
                value:invoice_data.id,
                date: dtSODate,
                invoicenumber:invoice_data.id,
                refnumber: ref,
                pqnumber: po,
                duedate: duedate,
                paylink: "",
                supplier_type: "Supplier",
                supplier_name : customer,
                supplier_addr : txabillingAddress,
                fields: {
                    "Account Name" : ["30", "left"],
                    "Description" : ["40", "left"],
                    "Tax" : ["15", "right"],
                    "Amount" : ["15", "right"]
                },
                subtotal :subtotal_total,
                gst : subtotal_tax,
                total : grandTotal,
                paid_amount : total_paid,
                bal_due : balancedue,
                bsb : Template.new_invoice.__helpers.get("vs1companyBankBSB").call(),
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
                title: 'Credit',
                value:invoice_data.id,
                date: dtSODate,
                invoicenumber:invoice_data.id,
                refnumber: ref,
                pqnumber: po,
                duedate: duedate,
                paylink: "",
                supplier_type: "Supplier",
                supplier_name : customer,
                supplier_addr : txabillingAddress,
                fields: {
                    "Account Name" : ["30", "left"],
                    "Description" : ["40", "left"],
                    "Tax" : ["15", "right"],
                    "Amount" : ["15", "right"]
                },
                subtotal :subtotal_total,
                gst : subtotal_tax,
                total : grandTotal,
                paid_amount : total_paid,
                bal_due : balancedue,
                bsb : Template.new_invoice.__helpers.get("vs1companyBankBSB").call(),
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


    templateObject.generateInvoiceData = function (template_title,number) {

         object_invoce = [];
         switch (template_title) {

          case "Credits":
            showCreditData1(template_title, number, false);
            break;
         }

      };

  //   jQuery(document).ready(function($) {

  //       if (window.history && window.history.pushState) {

  //   window.history.pushState('forward', null, FlowRouter.current().path);

  //   $(window).on('popstate', function() {
  //     swal({
  //              title: 'Save Or Cancel To Continue',
  //             text: "Do you want to Save or Cancel this transaction?",
  //             type: 'question',
  //             showCancelButton: true,
  //             confirmButtonText: 'Save'
  //         }).then((result) => {
  //             if (result.value) {
  //                 $(".btnSave").trigger("click");
  //             } else if (result.dismiss === 'cancel') {
  //                 let lastPageVisitUrl = window.location.pathname;
  //                 if (FlowRouter.current().oldRoute) {
  //                     lastPageVisitUrl = FlowRouter.current().oldRoute.path;
  //                 } else {
  //                     lastPageVisitUrl = window.location.pathname;
  //                 }
  //                //FlowRouter.go(lastPageVisitUrl);
  //                 window.open(lastPageVisitUrl, '_self');
  //             } else {}
  //         });
  //   });

  // }
  //   });

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
    $('.fullScreenSpin').css('display', 'inline-block');

    templateObject.getAllClients = function() {
        getVS1Data('TSupplierVS1').then(function(dataObject) {
            if (dataObject.length === 0) {
                clientsService.getSupplierVS1().then(function(data) {
                    setClientVS1(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setClientVS1(data);
            }
        }).catch(function(err) {
            clientsService.getSupplierVS1().then(function(data) {
                setClientVS1(data);
            });
        });
    };
    function setClientVS1(data){
        for (let i in data.tsuppliervs1) {
            if (data.tsuppliervs1.hasOwnProperty(i)) {
                let supplierrecordObj = {
                    supplierid: data.tsuppliervs1[i].Id || ' ',
                    suppliername: data.tsuppliervs1[i].ClientName || ' ',
                    supplieremail: data.tsuppliervs1[i].Email || ' ',
                    street: data.tsuppliervs1[i].Street || ' ',
                    street2: data.tsuppliervs1[i].Street2 || ' ',
                    street3: data.tsuppliervs1[i].Street3 || ' ',
                    suburb: data.tsuppliervs1[i].Suburb || ' ',
                    statecode: data.tsuppliervs1[i].State + ' ' + data.tsuppliervs1[i].Postcode || ' ',
                    country: data.tsuppliervs1[i].Country || ' ',
                    termsName: data.tsuppliervs1[i].TermsName || ''
                };
                clientList.push(supplierrecordObj);
            }
        }
        templateObject.clientrecords.set(clientList);
        for (let i = 0; i < clientList.length; i++) {
            //$('#edtSupplierName').editableSelect('add', clientList[i].customername);
        }
        if (FlowRouter.current().queryParams.id || FlowRouter.current().queryParams.supplierid) {

        } else {
            setTimeout(function() {
                $('#edtSupplierName').trigger("click");
            }, 200);
        }
    }
    templateObject.getAllClients();

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

    function getSupplierData(supplierID) {
        getVS1Data('TSupplierVS1').then(function (dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneSupplierDataEx(supplierID).then(function (data) {
                    setSupplierByID(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tsuppliervs1;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ID) === parseInt(supplierID)) {
                        added = true;
                        setSupplierByID(useData[i]);
                    }
                }
                if (!added) {
                    contactService.getOneSupplierDataEx(supplierID).then(function (data) {
                        setSupplierByID(data);
                    });
                }
            }
        }).catch(function (err) {
            contactService.getOneSupplierDataEx(supplierID).then(function (data) {
                $('.fullScreenSpin').css('display', 'none');
                setSupplierByID(data);
            });
        });
    }
    function setSupplierByID(data){
        $('#edtSupplierName').val(data.fields.ClientName);
        $('#edtSupplierName').attr("suppid", data.fields.ID);
        $('#edtSupplierEmail').val(data.fields.Email);
        $('#edtSupplierEmail').attr('customerid', data.fields.ID);
        $('#edtSupplierName').attr('suppid', data.fields.ID);

        let postalAddress = data.fields.Companyname + '\n' + data.fields.Street + '\n' + data.fields.Street2 + ' ' + data.fields.State + ' ' + data.fields.Postcode + '\n' + data.fields.Country;
        $('#txabillingAddress').val(postalAddress);
        $('#pdfSupplierAddress').html(postalAddress);
        $('.pdfSupplierAddress').text(postalAddress);
        $('#txaShipingInfo').val(postalAddress);
        $('#sltTerms').val(data.fields.TermsName || purchaseDefaultTerms);
        setSupplierInfo();
    }

    const url = FlowRouter.current().path;
    if (url.indexOf('?id=') > 0) {
        const getso_id = url.split('?id=');
        let currentCredit = getso_id[getso_id.length - 1];
        if (getso_id[1]) {
            currentCredit = parseInt(currentCredit);
            $('.printID').attr("id", currentCredit);
            templateObject.getCreditData = function() {

                getVS1Data('TCredit').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        purchaseService.getOneCreditData(currentCredit).then(function(data) {
                            $('.fullScreenSpin').css('display', 'none');
                            let lineItems = [];
                            let lineItemObj = {};
                            let lineItemsTable = [];
                            let lineItemTableObj = {};
                            let exchangeCode = data.fields.ForeignExchangeCode;
                            let currencySymbol = Currency;
                            let total = currencySymbol + '' + data.fields.TotalAmount.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let totalInc = currencySymbol + '' + data.fields.TotalAmountInc.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let subTotal = currencySymbol + '' + data.fields.TotalAmount.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let totalTax = currencySymbol + '' + data.fields.TotalTax.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let totalBalance = currencySymbol + '' + data.fields.TotalBalance.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let totalPaidAmount = currencySymbol + '' + data.fields.TotalPaid.toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            let department = '';
                            if (data.fields.Lines != null) {
                                department = data.fields.Lines[0].fields.LineClassName;
                                if (data.fields.Lines.length) {
                                    for (let i = 0; i < data.fields.Lines.length; i++) {
                                        let AmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2
                                        });
                                        let currencyAmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
                                        let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
                                        let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);
                                        lineItemObj = {
                                            lineID: Random.id(),
                                            id: data.fields.Lines[i].fields.ID || '',
                                            accountname: data.fields.Lines[i].fields.AccountName || '',
                                            memo: data.fields.Lines[i].fields.ProductDescription || '',
                                            item: data.fields.Lines[i].fields.ProductName || '',
                                            description: data.fields.Lines[i].fields.ProductDescription || '',
                                            quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
                                            unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineCost).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                            unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineCostInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
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

                                        };

                                        lineItemsTable.push(dataListTable);
                                        lineItems.push(lineItemObj);

                                    }
                                } else {
                                    let AmountGbp = data.fields.Lines.fields.TotalLineAmountInc.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    let currencyAmountGbp = currencySymbol + '' + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
                                    let TaxTotalGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxTotal;
                                    let TaxRateGbp = currencySymbol + '' + (data.fields.Lines.fields.LineTaxRate * 100).toFixed(2);
                                    lineItemObj = {
                                        lineID: Random.id(),
                                        id: data.fields.Lines.fields.ID || '',
                                        accountname: data.fields.Lines.fields.AccountName || '',
                                        memo: data.fields.Lines.fields.ProductDescription || '',
                                        description: data.fields.Lines.fields.ProductDescription || '',
                                        quantity: data.fields.Lines.fields.UOMOrderQty || 0,
                                        unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineCost).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                        unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineCostInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                        TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                        TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                        lineCost: data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
                                            minimumFractionDigits: 2
                                        }) || 0,
                                        taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                                        taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
                                        //TotalAmt: AmountGbp || 0,
                                        curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                                        TaxTotal: TaxTotalGbp || 0,
                                        TaxRate: TaxRateGbp || 0
                                    };
                                    lineItems.push(lineItemObj);

                                }
                            } else {
                                var dataListTable = [
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

                            }

                            let creditrecord = {
                                id: data.fields.ID,
                                lid: 'Edit Credit' + ' ' + data.fields.ID,
                                sosupplier: data.fields.SupplierName,
                                creditto: data.fields.OrderTo,
                                shipto: data.fields.ShipTo,
                                shipping: data.fields.Shipping,
                                docnumber: data.fields.DocNumber,
                                custPONumber: data.fields.CustPONumber,
                                saledate: data.fields.OrderDate ? moment(data.fields.OrderDate).format('DD/MM/YYYY') : "",
                                duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
                                employeename: data.fields.EmployeeName,
                                status: data.fields.OrderStatus,
                                invoicenumber: data.fields.SupplierInvoiceNumber,
                                comments: data.fields.Comments,
                                pickmemo: data.fields.SalesComments,
                                ponumber: data.fields.CustPONumber,
                                via: data.fields.Shipping,
                                connote: data.fields.ConNote,
                                reference: data.fields.CustPONumber,
                                currency: data.fields.ForeignExchangeCode,
                                branding: data.fields.MedType,
                                invoiceToDesc: data.fields.OrderTo,
                                shipToDesc: data.fields.ShipTo,
                                termsName: data.fields.TermsName,
                                Total: totalInc,
                                LineItems: lineItems,
                                TotalTax: totalTax,
                                SubTotal: subTotal,
                                balanceDue: totalBalance,
                                saleCustField1: data.fields.SaleLineRef,
                                saleCustField2: data.fields.SalesComments,
                                totalPaid: totalPaidAmount,
                                ispaid: data.fields.IsPaid,
                                department: department || defaultDept
                            };

                            let getDepartmentVal = department || defaultDept;

                            $('#edtSupplierName').val(data.fields.SupplierName);
                            templateObject.CleintName.set(data.fields.SupplierName);
                            $('#sltCurrency').val(data.fields.ForeignExchangeCode);
                            FxGlobalFunctions.handleChangedCurrency(data.fields.ForeignExchangeCode, defaultCurrencyCode);

                            $('#exchange_rate').val(data.fields.ForeignExchangeRate);
                            $('#sltTerms').val(data.fields.TermsName);
                            $('#sltDept').val(getDepartmentVal);
                            $('#sltStatus').val(data.fields.OrderStatus);
                            $('#shipvia').val(data.fields.Shipping);

                            templateObject.attachmentCount.set(0);
                            if (data.fields.Attachments) {
                                if (data.fields.Attachments.length) {
                                    templateObject.attachmentCount.set(data.fields.Attachments.length);
                                    templateObject.uploadedFiles.set(data.fields.Attachments);
                                }
                            }

                            setTimeout(function() {
                                if (clientList) {
                                    for (var i = 0; i < clientList.length; i++) {
                                        if (clientList[i].suppliername == data.fields.SupplierName) {
                                            $('#edtSupplierEmail').val(clientList[i].supplieremail);
                                            $('#edtSupplierEmail').attr('supplierid', clientList[i].supplierid);
                                        }
                                    }
                                }
                            }, 100);
                            templateObject.creditrecord.set(creditrecord);

                            templateObject.selectedCurrency.set(creditrecord.currency);
                            templateObject.inputSelectedCurrency.set(creditrecord.currency);
                            if (templateObject.creditrecord.get()) {


                                Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblCreditLine', function(error, result) {
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
                            $('.fullScreenSpin').css('display', 'none');

                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tcredit;
                        var added = false;
                        for (let d = 0; d < useData.length; d++) {
                            if (parseInt(useData[d].fields.ID) === currentCredit) {
                                added = true;
                                $('.fullScreenSpin').css('display', 'none');
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
                                let subTotal = currencySymbol + '' + useData[d].fields.TotalAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let totalTax = currencySymbol + '' + useData[d].fields.TotalTax.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let totalBalance = currencySymbol + '' + useData[d].fields.TotalBalance.toLocaleString(undefined, {
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
                                            accountname: useData[d].fields.Lines[i].fields.AccountName || '',
                                            memo: useData[d].fields.Lines[i].fields.ProductDescription || '',
                                            item: useData[d].fields.Lines[i].fields.ProductName || '',
                                            description: useData[d].fields.Lines[i].fields.ProductDescription || '',
                                            quantity: useData[d].fields.Lines[i].fields.UOMOrderQty || 0,
                                            unitPrice: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineCost).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                            unitPriceInc: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineCostInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                            TotalAmt: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                            TotalAmtInc: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                            lineCost: currencySymbol + '' + useData[d].fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
                                                minimumFractionDigits: 2
                                            }) || 0,
                                            taxRate: (useData[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                                            taxCode: useData[d].fields.Lines[i].fields.LineTaxCode || '',
                                            //TotalAmt: AmountGbp || 0,
                                            curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                                            TaxTotal: TaxTotalGbp || 0,
                                            TaxRate: TaxRateGbp || 0,

                                        };

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
                                        accountname: useData[d].fields.Lines.fields.AccountName || '',
                                        memo: useData[d].fields.Lines.fields.ProductDescription || '',
                                        description: useData[d].fields.Lines.fields.ProductDescription || '',
                                        quantity: useData[d].fields.Lines.fields.UOMOrderQty || 0,
                                        unitPrice: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineCost).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                        unitPriceInc: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineCostInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                        TotalAmt: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                        TotalAmtInc: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                        lineCost: useData[d].fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
                                            minimumFractionDigits: 2
                                        }) || 0,
                                        taxRate: (useData[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                                        taxCode: useData[d].fields.Lines[i].fields.LineTaxCode || '',
                                        //TotalAmt: AmountGbp || 0,
                                        curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                                        TaxTotal: TaxTotalGbp || 0,
                                        TaxRate: TaxRateGbp || 0
                                    };
                                    lineItems.push(lineItemObj);

                                }

                                let creditrecord = {
                                    id: useData[d].fields.ID,
                                    lid: 'Edit Credit' + ' ' + useData[d].fields.ID,
                                    sosupplier: useData[d].fields.SupplierName,
                                    creditto: useData[d].fields.OrderTo,
                                    shipto: useData[d].fields.ShipTo,
                                    shipping: useData[d].fields.Shipping,
                                    docnumber: useData[d].fields.DocNumber,
                                    custPONumber: useData[d].fields.CustPONumber,
                                    saledate: useData[d].fields.OrderDate ? moment(useData[d].fields.OrderDate).format('DD/MM/YYYY') : "",
                                    duedate: useData[d].fields.DueDate ? moment(useData[d].fields.DueDate).format('DD/MM/YYYY') : "",
                                    employeename: useData[d].fields.EmployeeName,
                                    status: useData[d].fields.OrderStatus,
                                    invoicenumber: useData[d].fields.SupplierInvoiceNumber,
                                    comments: useData[d].fields.Comments,
                                    pickmemo: useData[d].fields.SalesComments,
                                    ponumber: useData[d].fields.CustPONumber,
                                    via: useData[d].fields.Shipping,
                                    connote: useData[d].fields.ConNote,
                                    reference: useData[d].fields.CustPONumber,
                                    currency: useData[d].fields.ForeignExchangeCode,
                                    branding: useData[d].fields.MedType,
                                    invoiceToDesc: useData[d].fields.OrderTo,
                                    shipToDesc: useData[d].fields.ShipTo,
                                    termsName: useData[d].fields.TermsName,
                                    Total: totalInc,
                                    LineItems: lineItems,
                                    TotalTax: totalTax,
                                    SubTotal: subTotal,
                                    balanceDue: totalBalance,
                                    saleCustField1: useData[d].fields.SaleLineRef,
                                    saleCustField2: useData[d].fields.SalesComments,
                                    totalPaid: totalPaidAmount,
                                    ispaid: useData[d].fields.IsPaid,
                                    department: useData[d].fields.Lines[0].fields.LineClassName || defaultDept
                                };

                                let getDepartmentVal = useData[d].fields.Lines[0].fields.LineClassName || defaultDept;

                                $('#edtSupplierName').val(useData[d].fields.SupplierName);
                                templateObject.CleintName.set(useData[d].fields.SupplierName);
                                $('#sltCurrency').val(useData[d].fields.ForeignExchangeCode);
                                FxGlobalFunctions.handleChangedCurrency(useData[d].fields.ForeignExchangeCode, defaultCurrencyCode);

                                $('#exchange_rate').val(useData[d].fields.ForeignExchangeRate);
                                $('#sltTerms').val(useData[d].fields.TermsName);
                                $('#sltDept').val(getDepartmentVal);
                                $('#sltStatus').val(useData[d].fields.OrderStatus);
                                $('#shipvia').val(useData[d].fields.Shipping);

                                templateObject.attachmentCount.set(0);
                                if (useData[d].fields.Attachments) {
                                    if (useData[d].fields.Attachments.length) {
                                        templateObject.attachmentCount.set(useData[d].fields.Attachments.length);
                                        templateObject.uploadedFiles.set(useData[d].fields.Attachments);
                                    }
                                }

                                setTimeout(function() {
                                    if (clientList) {
                                        for (var i = 0; i < clientList.length; i++) {
                                            if (clientList[i].suppliername == useData[d].fields.SupplierName) {
                                                $('#edtSupplierEmail').val(clientList[i].supplieremail);
                                                $('#edtSupplierEmail').attr('supplierid', clientList[i].supplierid);
                                            }
                                        }
                                    }
                                }, 100);
                                templateObject.creditrecord.set(creditrecord);

                                templateObject.selectedCurrency.set(creditrecord.currency);
                                templateObject.inputSelectedCurrency.set(creditrecord.currency);
                                if (templateObject.creditrecord.get()) {





                                    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblCreditLine', function(error, result) {
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
                        }
                        if (!added) {
                            purchaseService.getOneCreditData(currentCredit).then(function(data) {
                                $('.fullScreenSpin').css('display', 'none');
                                let lineItems = [];
                                let lineItemObj = {};
                                let lineItemsTable = [];
                                let lineItemTableObj = {};
                                let exchangeCode = data.fields.ForeignExchangeCode;
                                let currencySymbol = Currency;
                                let total = currencySymbol + '' + data.fields.TotalAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let totalInc = currencySymbol + '' + data.fields.TotalAmountInc.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let subTotal = currencySymbol + '' + data.fields.TotalAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let totalTax = currencySymbol + '' + data.fields.TotalTax.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let totalBalance = currencySymbol + '' + data.fields.TotalBalance.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let totalPaidAmount = currencySymbol + '' + data.fields.TotalPaid.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let department = '';
                                if (data.fields.Lines != null) {
                                    department = data.fields.Lines[0].fields.LineClassName;
                                    if (data.fields.Lines.length) {
                                        for (let i = 0; i < data.fields.Lines.length; i++) {
                                            let AmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toLocaleString(undefined, {
                                                minimumFractionDigits: 2
                                            });
                                            let currencyAmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
                                            let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
                                            let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);
                                            lineItemObj = {
                                                lineID: Random.id(),
                                                id: data.fields.Lines[i].fields.ID || '',
                                                accountname: data.fields.Lines[i].fields.AccountName || '',
                                                memo: data.fields.Lines[i].fields.ProductDescription || '',
                                                item: data.fields.Lines[i].fields.ProductName || '',
                                                description: data.fields.Lines[i].fields.ProductDescription || '',
                                                quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
                                                unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineCost).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                                unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineCostInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
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

                                            };

                                            lineItemsTable.push(dataListTable);
                                            lineItems.push(lineItemObj);

                                        }
                                    } else {
                                        let AmountGbp = data.fields.Lines.fields.TotalLineAmountInc.toLocaleString(undefined, {
                                            minimumFractionDigits: 2
                                        });
                                        let currencyAmountGbp = currencySymbol + '' + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
                                        let TaxTotalGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxTotal;
                                        let TaxRateGbp = currencySymbol + '' + (data.fields.Lines.fields.LineTaxRate * 100).toFixed(2);
                                        lineItemObj = {
                                            lineID: Random.id(),
                                            id: data.fields.Lines.fields.ID || '',
                                            accountname: data.fields.Lines.fields.AccountName || '',
                                            memo: data.fields.Lines.fields.ProductDescription || '',
                                            description: data.fields.Lines.fields.ProductDescription || '',
                                            quantity: data.fields.Lines.fields.UOMOrderQty || 0,
                                            unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineCost).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                            unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineCostInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                            TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                            TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                            lineCost: data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
                                                minimumFractionDigits: 2
                                            }) || 0,
                                            taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                                            taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
                                            //TotalAmt: AmountGbp || 0,
                                            curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                                            TaxTotal: TaxTotalGbp || 0,
                                            TaxRate: TaxRateGbp || 0
                                        };
                                        lineItems.push(lineItemObj);

                                    }
                                } else {
                                    var dataListTable = [
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

                                }

                                let creditrecord = {
                                    id: data.fields.ID,
                                    lid: 'Edit Credit' + ' ' + data.fields.ID,
                                    sosupplier: data.fields.SupplierName,
                                    creditto: data.fields.OrderTo,
                                    shipto: data.fields.ShipTo,
                                    shipping: data.fields.Shipping,
                                    docnumber: data.fields.DocNumber,
                                    custPONumber: data.fields.CustPONumber,
                                    saledate: data.fields.OrderDate ? moment(data.fields.OrderDate).format('DD/MM/YYYY') : "",
                                    duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
                                    employeename: data.fields.EmployeeName,
                                    status: data.fields.OrderStatus,
                                    invoicenumber: data.fields.SupplierInvoiceNumber,
                                    comments: data.fields.Comments,
                                    pickmemo: data.fields.SalesComments,
                                    ponumber: data.fields.CustPONumber,
                                    via: data.fields.Shipping,
                                    connote: data.fields.ConNote,
                                    reference: data.fields.CustPONumber,
                                    currency: data.fields.ForeignExchangeCode,
                                    branding: data.fields.MedType,
                                    invoiceToDesc: data.fields.OrderTo,
                                    shipToDesc: data.fields.ShipTo,
                                    termsName: data.fields.TermsName,
                                    Total: totalInc,
                                    LineItems: lineItems,
                                    TotalTax: totalTax,
                                    SubTotal: subTotal,
                                    balanceDue: totalBalance,
                                    saleCustField1: data.fields.SaleLineRef,
                                    saleCustField2: data.fields.SalesComments,
                                    totalPaid: totalPaidAmount,
                                    ispaid: data.fields.IsPaid,
                                    department: department || defaultDept
                                };

                                let getDepartmentVal = department || defaultDept;

                                $('#edtSupplierName').val(data.fields.SupplierName);
                                templateObject.CleintName.set(data.fields.SupplierName);
                                $('#sltCurrency').val(data.fields.ForeignExchangeCode);
                                FxGlobalFunctions.handleChangedCurrency(data.fields.ForeignExchangeCode, defaultCurrencyCode);

                                $('#exchange_rate').val(data.fields.ForeignExchangeRate);
                                $('#sltTerms').val(data.fields.TermsName);
                                $('#sltDept').val(getDepartmentVal);
                                $('#sltStatus').val(data.fields.OrderStatus);
                                $('#shipvia').val(data.fields.Shipping);

                                templateObject.attachmentCount.set(0);
                                if (data.fields.Attachments) {
                                    if (data.fields.Attachments.length) {
                                        templateObject.attachmentCount.set(data.fields.Attachments.length);
                                        templateObject.uploadedFiles.set(data.fields.Attachments);
                                    }
                                }

                                setTimeout(function() {
                                    if (clientList) {
                                        for (var i = 0; i < clientList.length; i++) {
                                            if (clientList[i].suppliername == data.fields.SupplierName) {
                                                $('#edtSupplierEmail').val(clientList[i].supplieremail);
                                                $('#edtSupplierEmail').attr('supplierid', clientList[i].supplierid);
                                            }
                                        }
                                    }
                                }, 100);
                                templateObject.creditrecord.set(creditrecord);

                                templateObject.selectedCurrency.set(creditrecord.currency);
                                templateObject.inputSelectedCurrency.set(creditrecord.currency);
                                if (templateObject.creditrecord.get()) {





                                    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblCreditLine', function(error, result) {
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
                                $('.fullScreenSpin').css('display', 'none');

                            });
                        }
                    }
                }).catch(function(err) {
                    purchaseService.getOneCreditData(currentCredit).then(function(data) {
                        $('.fullScreenSpin').css('display', 'none');
                        let lineItems = [];
                        let lineItemObj = {};
                        let lineItemsTable = [];
                        let lineItemTableObj = {};
                        let exchangeCode = data.fields.ForeignExchangeCode;
                        let currencySymbol = Currency;
                        let total = currencySymbol + '' + data.fields.TotalAmount.toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let totalInc = currencySymbol + '' + data.fields.TotalAmountInc.toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let subTotal = currencySymbol + '' + data.fields.TotalAmount.toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let totalTax = currencySymbol + '' + data.fields.TotalTax.toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let totalBalance = currencySymbol + '' + data.fields.TotalBalance.toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let totalPaidAmount = currencySymbol + '' + data.fields.TotalPaid.toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let department = '';
                        if (data.fields.Lines != null) {
                            department = data.fields.Lines[0].fields.LineClassName;
                            if (data.fields.Lines.length) {
                                for (let i = 0; i < data.fields.Lines.length; i++) {
                                    let AmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    });
                                    let currencyAmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
                                    let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
                                    let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);
                                    lineItemObj = {
                                        lineID: Random.id(),
                                        id: data.fields.Lines[i].fields.ID || '',
                                        accountname: data.fields.Lines[i].fields.AccountName || '',
                                        memo: data.fields.Lines[i].fields.ProductDescription || '',
                                        item: data.fields.Lines[i].fields.ProductName || '',
                                        description: data.fields.Lines[i].fields.ProductDescription || '',
                                        quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
                                        unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineCost).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                        unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineCostInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
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

                                    };

                                    lineItemsTable.push(dataListTable);
                                    lineItems.push(lineItemObj);

                                }
                            } else {
                                let AmountGbp = data.fields.Lines.fields.TotalLineAmountInc.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let currencyAmountGbp = currencySymbol + '' + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
                                let TaxTotalGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxTotal;
                                let TaxRateGbp = currencySymbol + '' + (data.fields.Lines.fields.LineTaxRate * 100).toFixed(2);
                                lineItemObj = {
                                    lineID: Random.id(),
                                    id: data.fields.Lines.fields.ID || '',
                                    accountname: data.fields.Lines.fields.AccountName || '',
                                    memo: data.fields.Lines.fields.ProductDescription || '',
                                    description: data.fields.Lines.fields.ProductDescription || '',
                                    quantity: data.fields.Lines.fields.UOMOrderQty || 0,
                                    unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineCost).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                    unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineCostInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                    TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                    TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                    lineCost: data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    }) || 0,
                                    taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                                    taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
                                    //TotalAmt: AmountGbp || 0,
                                    curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                                    TaxTotal: TaxTotalGbp || 0,
                                    TaxRate: TaxRateGbp || 0
                                };
                                lineItems.push(lineItemObj);

                            }
                        } else {
                            var dataListTable = [
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

                        }

                        let creditrecord = {
                            id: data.fields.ID,
                            lid: 'Edit Credit' + ' ' + data.fields.ID,
                            sosupplier: data.fields.SupplierName,
                            creditto: data.fields.OrderTo,
                            shipto: data.fields.ShipTo,
                            shipping: data.fields.Shipping,
                            docnumber: data.fields.DocNumber,
                            custPONumber: data.fields.CustPONumber,
                            saledate: data.fields.OrderDate ? moment(data.fields.OrderDate).format('DD/MM/YYYY') : "",
                            duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
                            employeename: data.fields.EmployeeName,
                            status: data.fields.OrderStatus,
                            invoicenumber: data.fields.SupplierInvoiceNumber,
                            comments: data.fields.Comments,
                            pickmemo: data.fields.SalesComments,
                            ponumber: data.fields.CustPONumber,
                            via: data.fields.Shipping,
                            connote: data.fields.ConNote,
                            reference: data.fields.CustPONumber,
                            currency: data.fields.ForeignExchangeCode,
                            branding: data.fields.MedType,
                            invoiceToDesc: data.fields.OrderTo,
                            shipToDesc: data.fields.ShipTo,
                            termsName: data.fields.TermsName,
                            Total: totalInc,
                            LineItems: lineItems,
                            TotalTax: totalTax,
                            SubTotal: subTotal,
                            balanceDue: totalBalance,
                            saleCustField1: data.fields.SaleLineRef,
                            saleCustField2: data.fields.SalesComments,
                            totalPaid: totalPaidAmount,
                            ispaid: data.fields.IsPaid,
                            department: department || defaultDept
                        };

                        let getDepartmentVal = department || defaultDept;

                        $('#edtSupplierName').val(data.fields.SupplierName);
                        templateObject.CleintName.set(data.fields.SupplierName);
                        $('#sltCurrency').val(data.fields.ForeignExchangeCode);
                        FxGlobalFunctions.handleChangedCurrency(data.fields.ForeignExchangeCode, defaultCurrencyCode);

                        $('#exchange_rate').val(data.fields.ForeignExchangeRate);
                        $('#sltTerms').val(data.fields.TermsName);
                        $('#sltDept').val(getDepartmentVal);
                        $('#sltStatus').val(data.fields.OrderStatus);
                        $('#shipvia').val(data.fields.Shipping);

                        templateObject.attachmentCount.set(0);
                        if (data.fields.Attachments) {
                            if (data.fields.Attachments.length) {
                                templateObject.attachmentCount.set(data.fields.Attachments.length);
                                templateObject.uploadedFiles.set(data.fields.Attachments);
                            }
                        }

                        setTimeout(function() {
                            if (clientList) {
                                for (var i = 0; i < clientList.length; i++) {
                                    if (clientList[i].suppliername == data.fields.SupplierName) {
                                        $('#edtSupplierEmail').val(clientList[i].supplieremail);
                                        $('#edtSupplierEmail').attr('supplierid', clientList[i].supplierid);
                                    }
                                }
                            }
                        }, 100);
                        templateObject.creditrecord.set(creditrecord);

                        templateObject.selectedCurrency.set(creditrecord.currency);
                        templateObject.inputSelectedCurrency.set(creditrecord.currency);
                        if (templateObject.creditrecord.get()) {





                            Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblCreditLine', function(error, result) {
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
                        $('.fullScreenSpin').css('display', 'none');

                    });
                });

            };
            templateObject.getCreditData();
        }
    } else {
        $('.fullScreenSpin').css('display', 'none');
        let lineItems = [];
        let lineItemsTable = [];
        let lineItemObj = {};
        lineItemObj = {
            lineID: Random.id(),
            item: '',
            accountname: '',
            memo: '',
            description: '',
            quantity: '',
            unitPrice: 0,
            unitPriceInc:0,
            TotalAmt: 0,
            TotalAmtInc: 0,
            taxRate: 0,
            taxCode: '',
            curTotalAmt: 0,
            TaxTotal: 0,
            TaxRate: 0,

        };
        lineItemsTable.push(dataListTable);
        lineItems.push(lineItemObj);
        const currentDate = new Date();
        const begunDate = moment(currentDate).format("DD/MM/YYYY");
        let creditrecord = {
            id: '',
            lid: 'New Credit',
            accountname: '',
            memo: '',
            sosupplier: '',
            creditto: '',
            shipto: '',
            shipping: '',
            docnumber: '',
            custPONumber: '',
            saledate: begunDate,
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
            TotalTax: Currency + '' + 0.00,
            SubTotal: Currency + '' + 0.00,
            balanceDue: Currency + '' + 0.00,
            saleCustField1: '',
            saleCustField2: '',
            totalPaid: Currency + '' + 0.00,
            ispaid: false
        };
        if (FlowRouter.current().queryParams.supplierid) {
            getSupplierData(FlowRouter.current().queryParams.supplierid);
        } else {
            $('#edtSupplierName').val('');
        }
        setTimeout(function() {
            $('#sltDept').val(defaultDept);
            templateObject.getLastCreditData();
        }, 200);
        templateObject.creditrecord.set(creditrecord);
        if (templateObject.creditrecord.get()) {
            Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblCreditLine', function(error, result) {
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
        var tbl_content = $("#templatePreviewModal .tbl_content")
        tbl_content.empty()
        const data = object_invoce[0]["data"]
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
        var tbl_content = $("#templatePreviewModal .tbl_content")
        tbl_content.empty()
        const data = object_invoce[0]["data"]
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
        var tbl_content = $("#templatePreviewModal .tbl_content")
        tbl_content.empty()
        const data = object_invoce[0]["data"]
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
        var count = 0 ;
        for(const [key , value] of Object.entries(object_invoce[0]["fields"])){


            if(count == 0)
            {
                tbl_header.append("<th style='width: 200px;background:white;color: rgb(0 0 0);width:" + value + "%';>" + key + "</th>")
            }
            else if(count == 1)
            {
                tbl_header.append("<th style='width: 250px;background:white;color: rgb(0 0 0);width:" + value + "%';>" + key + "</th>")
            }
            else if(count == 2)
            {
                tbl_header.append("<th style='text-align: right; width: 77px;background:white;color: rgb(0 0 0);width:" + value + "%';>" + key + "</th>")
            }
            else
            {
                tbl_header.append("<th style='text-align: right; width: 100px;background:white;color: rgb(0 0 0);width:" + value + "%';>" + key + "</th>")
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
            var count = 0;
            var html = '';
             html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
             for(item_temp of item){


                   if(count == 0)
                    {
                        html = html + "<td >" + item_temp + "</td>";
                    }
                    else if(count == 1)
                    {
                        html = html + "<td >" + item_temp + "</td>";
                    }
                    else if(count == 2)
                    {
                        html = html + "<td style='text-align: right;'>" + item_temp + "</td>";
                    }
                    else
                    {
                        html = html + "<td style='text-align: right;'>" + item_temp + "</td>";
                    }
                    count++;
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

    templateObject.getShpVias = function() {
        getVS1Data('TShippingMethod').then(function(dataObject) {
            if (dataObject.length == 0) {
                purchaseService.getShpVia().then(function(data) {
                    for (let i in data.tshippingmethod) {

                        let viarecordObj = {
                            shippingmethod: data.tshippingmethod[i].ShippingMethod || ' ',
                        };

                        viarecords.push(viarecordObj);
                        templateObject.viarecords.set(viarecords);

                    }
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tshippingmethod;
                for (let i in useData) {

                    let viarecordObj = {
                        shippingmethod: useData[i].ShippingMethod || ' ',
                    };

                    viarecords.push(viarecordObj);
                    templateObject.viarecords.set(viarecords);

                }

            }
        }).catch(function(err) {
            purchaseService.getShpVia().then(function(data) {
                for (let i in data.tshippingmethod) {

                    let viarecordObj = {
                        shippingmethod: data.tshippingmethod[i].ShippingMethod || ' ',
                    };

                    viarecords.push(viarecordObj);
                    templateObject.viarecords.set(viarecords);

                }
            });
        });

    };
    templateObject.getShpVias();

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

    };
    templateObject.getDepartments();

    templateObject.getTerms = function() {
        getVS1Data('TTermsVS1').then(function(dataObject) {
            if (dataObject.length == 0) {
                purchaseService.getTermVS1().then(function(data) {
                    for (let i in data.ttermsvs1) {

                        let termrecordObj = {
                            termsname: data.ttermsvs1[i].TermsName || ' ',
                        };

                        if(data.ttermsvs1[i].isPurchasedefault == true){
                          Session.setPersistent('ERPTermsPurchase', data.ttermsvs1[i].TermsName||"COD");
                        purchaseDefaultTerms = data.ttermsvs1[i].TermsName || ' ';
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

                    if(useData[i].isPurchasedefault == true){
                        purchaseDefaultTerms = useData[i].TermsName || ' ';
                    }


                    termrecords.push(termrecordObj);
                    templateObject.termrecords.set(termrecords);

                }

            }
        }).catch(function(err) {
            purchaseService.getTermVS1().then(function(data) {
                for (let i in data.ttermsvs1) {

                    let termrecordObj = {
                        termsname: data.ttermsvs1[i].TermsName || ' ',
                    };

                    if(data.ttermsvs1[i].isPurchasedefault == true){
                      Session.setPersistent('ERPTermsPurchase', data.ttermsvs1[i].TermsName||"COD");
                        purchaseDefaultTerms = data.ttermsvs1[i].TermsName || ' ';
                    }


                    termrecords.push(termrecordObj);
                    templateObject.termrecords.set(termrecords);

                }
            });
        });

    };
    templateObject.getTerms();

    let table;
    $(document).ready(function() {
        $('#edtSupplierName').editableSelect();
        //$('#sltCurrency').editableSelect();
        $('#sltTerms').editableSelect();
        $('#sltDept').editableSelect();
        $('#sltStatus').editableSelect();
        $('#shipvia').editableSelect();
        $('#addRow').on('click', function() {
          var getTableFields = [ $('#tblCreditLine tbody tr .lineAccountName')];
          var checkEmptyFields;
          for(var i=0;i< getTableFields.length;i++){
            checkEmptyFields = getTableFields[i].filter(function(i,element) {
                return $.trim($(this).val()) === '';
            });
          };
          if (!checkEmptyFields.length) {
            var rowData = $('#tblCreditLine tbody>tr:last').clone(true);
            let tokenid = Random.id();
            $(".lineAccountName", rowData).val("");
            $(".lineMemo", rowData).text("");
            $(".lineQty", rowData).text("");
            $(".lineAmount", rowData).val("");
            $(".lineTaxRate", rowData).text("");
            $(".lineTaxCode", rowData).val("");
            $(".lineAmt", rowData).text("");
            rowData.attr('id', tokenid);
            $("#tblCreditLine tbody").append(rowData);

            if ($('#printID').attr('id') != "") {
                var rowData1 = $('.credit_print tbody>tr:last').clone(true);
                $("#lineAccountName", rowData1).text("");
                $("#lineMemo", rowData1).text("");
                $("#lineQty", rowData1).text("");
                $("#lineAmount", rowData1).text("");
                $("#lineTaxRate", rowData).text("");
                $("#lineTaxCode", rowData1).text("");
                $("#lineAmt", rowData1).text("");
                rowData1.attr('id', tokenid);
                $(".credit_print tbody").append(rowData1);
            }

            setTimeout(function() {
                $('#' + tokenid + " .lineAccountName").trigger('click');
            }, 200);
          }else{
            $("#tblCreditLine tbody tr").each(function (index) {
                var $tblrow = $(this);
                if ($tblrow.find(".lineAccountName").val() == '') {
                    $tblrow.find(".colAccountName").addClass('boldtablealertsborder');
                }
            });
          }
        });



    });

    $('#shipvia').editableSelect()
        .on('click.editable-select', function(e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            var shipvianame = e.target.value || '';
            $('#edtShipViaID').val('');
            $('#newShipViaMethodName').text('Add Ship Via');
            $('#edtShipVia').attr('readonly', false);
            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#shipViaModal').modal('toggle');
                setTimeout(function() {
                    $('#tblShipViaPopList_filter .form-control-sm').focus();
                    $('#tblShipViaPopList_filter .form-control-sm').val('');
                    $('#tblShipViaPopList_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblShipViaPopList').DataTable();
                    datatable.draw();
                    $('#tblShipViaPopList_filter .form-control-sm').trigger("input");
                }, 500);
            } else {
                if (shipvianame.replace(/\s/g, '') != '') {
                    $('#newShipViaMethodName').text('Edit Ship Via');
                    setTimeout(function() {
                        // $('#edtShipVia').attr('readonly', true);
                    }, 100);

                    getVS1Data('TShippingMethod').then(function(dataObject) {
                        if (dataObject.length == 0) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            sideBarService.getShippingMethodData().then(function(data) {
                                for (let i = 0; i < data.tshippingmethod.length; i++) {
                                    if (data.tshippingmethod[i].ShippingMethod === shipvianame) {
                                        $('#edtShipViaID').val(data.tshippingmethod[i].Id);
                                        $('#edtShipVia').val(data.tshippingmethod[i].ShippingMethod);
                                    }
                                }
                                setTimeout(function() {
                                    $('.fullScreenSpin').css('display', 'none');
                                    $('#newShipViaModal').modal('toggle');
                                }, 200);
                            }).catch(function(err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.tshippingmethod;
                            for (let i = 0; i < data.tshippingmethod.length; i++) {
                                if (useData[i].ShippingMethod === shipvianame) {
                                    $('#edtShipViaID').val(useData[i].Id);
                                    $('#edtShipVia').val(useData[i].ShippingMethod);
                                }
                            }
                            setTimeout(function() {
                                $('.fullScreenSpin').css('display', 'none');
                                $('#newShipViaModal').modal('toggle');
                            }, 200);
                        }
                    }).catch(function(err) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        sideBarService.getShippingMethodData().then(function(data) {
                            for (let i = 0; i < data.tshippingmethod.length; i++) {
                                if (data.tshippingmethod[i].ShippingMethod === shipvianame) {
                                    $('#edtShipViaID').val(data.tshippingmethod[i].Id);
                                    $('#edtShipVia').val(data.tshippingmethod[i].ShippingMethod);
                                }
                            }
                            setTimeout(function() {
                                $('.fullScreenSpin').css('display', 'none');
                                $('#edtShipVia').attr('readonly', false);
                                $('#newShipViaModal').modal('toggle');
                            }, 200);
                        }).catch(function(err) {
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    });
                } else {
                    $('#shipViaModal').modal();
                    setTimeout(function() {
                        $('#tblShipViaPopList_filter .form-control-sm').focus();
                        $('#tblShipViaPopList_filter .form-control-sm').val('');
                        $('#tblShipViaPopList_filter .form-control-sm').trigger("input");
                        var datatable = $('#tblShipViaPopList').DataTable();
                        datatable.draw();
                        $('#tblShipViaPopList_filter .form-control-sm').trigger("input");
                    }, 500);
                }
            }
        });

    $(document).on("click", "#tblShipViaPopList tbody tr", function(e) {
        $('#shipvia').val($(this).find(".colShipName ").text());
        $('#shipViaModal').modal('toggle');

        $('#tblShipViaPopList_filter .form-control-sm').val('');
        setTimeout(function () {
            $('.btnRefreshVia').trigger('click');
            $('.fullScreenSpin').css('display', 'none');
        }, 1000);
    });

    // $(document).on("click", "#tblCurrencyPopList tbody tr", function(e) {
    //     $('#sltCurrency').val($(this).find(".colCode").text());
    //     $('#currencyModal').modal('toggle');

    //     $('#tblCurrencyPopList_filter .form-control-sm').val('');
    //     setTimeout(function () {
    //         $('.btnRefreshCurrency').trigger('click');
    //         $('.fullScreenSpin').css('display', 'none');
    //     }, 1000);
    // });

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
            $('.fullScreenSpin').css('display', 'none');
        }, 1000);
    });
    $(document).on("click", "#tblAccount tbody tr", function(e) {
        $(".colAccountName").removeClass('boldtablealertsborder');
        let selectLineID = $('#selectLineID').val();
        let taxcodeList = templateObject.taxraterecords.get();
        var table = $(this);
        let utilityService = new UtilityService();
        let $tblrows = $("#tblCreditLine tbody tr");
        let $printrows = $(".credit_print tbody tr");

        if (selectLineID) {
            let lineProductName = table.find(".productName").text();
            let lineProductDesc = table.find(".productDesc").text();

            let lineUnitPrice = "0.00";
            let lineTaxRate = table.find(".taxrate").text();
            let lineAmount = 0;
            let subGrandTotal = 0;
            let taxGrandTotal = 0;
            let taxGrandTotalPrint = 0;

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
            $('#' + selectLineID + " .colAmount").val(lineUnitPrice);
            $('#' + selectLineID + " .lineTaxCode").val(lineTaxRate);

            if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
                $('#' + selectLineID + " #lineAccountName").text(lineProductName);
                $('#' + selectLineID + " #lineMemo").text(lineProductDesc);
                $('#' + selectLineID + " #colAmount").text(lineUnitPrice);
                $('#' + selectLineID + " #lineTaxCode").text(lineTaxRate);
            }



            $('#accountListModal').modal('toggle');
            $tblrows.each(function(index) {
                var $tblrow = $(this);
                var amount = $tblrow.find(".colAmount").val() || 0;
                var taxcode = $tblrow.find(".lineTaxCode").val() || 0;

                var taxrateamount = 0;
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename == taxcode) {
                            taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
                        }
                    }
                }


                var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
                if (!isNaN(subTotal)) {
                    $tblrow.find('.colAmount').val(utilityService.modifynegativeCurrencyFormat(subTotal));
                    subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                    document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal);
                }

                if (!isNaN(taxTotal)) {
                    taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                    document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal);
                }

                if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                    let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                    document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);

                }
            });

            if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
                $printrows.each(function(index) {
                    var $printrows = $(this);
                    var amount = $printrows.find("#lineAmount").text() || "0";
                    var taxcode = $printrows.find("#lineTaxCode").text() || 0;

                    var taxrateamount = 0;
                    if (taxcodeList) {
                        for (var i = 0; i < taxcodeList.length; i++) {
                            if (taxcodeList[i].codename == taxcode) {
                                taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
                            }
                        }
                    }


                    var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                    var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                    $printrows.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal))

                    if (!isNaN(subTotal)) {
                        $printrows.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                        subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                        document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
                    }

                    if (!isNaN(taxTotal)) {
                        taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                    }
                    if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                        let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                        document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                        //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                        document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

                    }
                });
            }
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
        let $tblrows = $("#tblCreditLine tbody tr");
        if (selectLineID) {
            let lineTaxCode = table.find(".taxName").text();
            let lineTaxRate = table.find(".taxRate").text();
            let lineAmount = 0;
            let subGrandTotal = 0;
            let taxGrandTotal = 0;
            let taxGrandTotalPrint = 0;


            $('#' + selectLineID + " .lineTaxRate").text(lineTaxRate || 0);
            $('#' + selectLineID + " .lineTaxCode").val(lineTaxCode);
            let $printrows = $(".credit_print tbody tr");
            if ($('.printID').val() == "") {
                $('#' + selectLineID + " #lineAmount").text($('#' + selectLineID + " .colAmountExChange").val());
                $('#' + selectLineID + " #lineTaxCode").text(lineTaxCode);

            }

            $('#taxRateListModal').modal('toggle');
            $tblrows.each(function(index) {
                var $tblrow = $(this);
                var amount = $tblrow.find(".colAmountExChange").val() || 0;
                var taxcode = $tblrow.find(".lineTaxCode").val() || '';

                var taxrateamount = 0;
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename == taxcode) {

                            taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;

                        }
                    }
                }


                var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                if ((taxrateamount == '') || (taxrateamount == ' ')) {
                    var taxTotal = 0;
                } else {
                    var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                }
                $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
                if (!isNaN(subTotal)) {
                    $tblrow.find('.colAmountExChange').val(utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2)));
                    let totalAmountInc = (parseFloat(subTotal)) + (parseFloat(taxTotal)) || 0;
                    $tblrow.find('.colAmountIncChange').val(utilityService.modifynegativeCurrencyFormat(totalAmountInc.toFixed(2)));
                    subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                    document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
                }

                if (!isNaN(taxTotal)) {
                    taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                    document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
                }

                if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                    let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                    document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                    document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                    document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));

                }
            });

            if ($(".printID").val() == "") {
                $printrows.each(function(index) {
                    var $printrow = $(this);
                    var amount = $printrow.find("#lineAmount").text() || "0";
                    var taxcode = $printrow.find("#lineTaxCode").text() || "E";

                    var taxrateamount = 0;
                    if (taxcodeList) {
                        for (var i = 0; i < taxcodeList.length; i++) {
                            if (taxcodeList[i].codename == taxcode) {
                                taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
                            }
                        }
                    }

                    var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                    var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                    $printrow.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
                    if (!isNaN(subTotal)) {
                        $printrow.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                        subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                        document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
                    }

                    if (!isNaN(taxTotal)) {
                        taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                    }
                    if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                        let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                        document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                        //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                        document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

                    }
                });
            }
        }
    });

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
                            $('.fullScreenSpin').css('display', 'inline-block');
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
                                    $('.fullScreenSpin').css('display', 'none');
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
                                $('.fullScreenSpin').css('display', 'none');
                                $('#newTermsModal').modal('toggle');
                            }, 200);
                        }
                    }).catch(function(err) {
                        $('.fullScreenSpin').css('display', 'inline-block');
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
                                $('.fullScreenSpin').css('display', 'none');
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
                            $('.fullScreenSpin').css('display', 'inline-block');
                            sideBarService.getAllLeadStatus().then(function(data) {
                                for (let i in data.tleadstatustype) {
                                    if (data.tleadstatustype[i].TypeName === statusDataName) {
                                        $('#statusId').val(data.tleadstatustype[i].Id);
                                    }
                                }
                                setTimeout(function() {
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
                            setTimeout(function() {
                                $('.fullScreenSpin').css('display', 'none');
                                $('#newStatusPopModal').modal('toggle');
                            }, 200);
                        }
                    }).catch(function(err) {
                        sideBarService.getAllLeadStatus().then(function(data) {
                            for (let i in data.tleadstatustype) {
                                if (data.tleadstatustype[i].TypeName === statusDataName) {
                                    $('#statusId').val(data.tleadstatustype[i].Id);

                                }
                            }
                        });
                    });
                    setTimeout(function() {
                        $('.fullScreenSpin').css('display', 'none');
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

    // $('#sltCurrency').editableSelect()
    //     .on('click.editable-select', function(e, li) {
    //         var $earch = $(this);
    //         var offset = $earch.offset();
    //         var currencyDataName = e.target.value || '';
    //         $('#edtCurrencyID').val('');
    //         if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
    //             $('#currencyModal').modal('toggle');
    //         } else {
    //             if (currencyDataName.replace(/\s/g, '') != '') {
    //                 $('#add-currency-title').text('Edit Currency');
    //                 $('#sedtCountry').prop('readonly', true);
    //                 getVS1Data('TCurrency').then(function(dataObject) {
    //                     if (dataObject.length == 0) {
    //                         $('.fullScreenSpin').css('display', 'inline-block');
    //                         sideBarService.getCurrencies().then(function(data) {
    //                             for (let i in data.tcurrency) {
    //                                 if (data.tcurrency[i].Code === currencyDataName) {
    //                                     $('#edtCurrencyID').val(data.tcurrency[i].Id);
    //                                     setTimeout(function() {
    //                                         $('#sedtCountry').val(data.tcurrency[i].Country);
    //                                     }, 200);
    //                                     //$('#sedtCountry').val(data.tcurrency[i].Country);
    //                                     $('#currencyCode').val(currencyDataName);
    //                                     $('#currencySymbol').val(data.tcurrency[i].CurrencySymbol);
    //                                     $('#edtCurrencyName').val(data.tcurrency[i].Currency);
    //                                     $('#edtCurrencyDesc').val(data.tcurrency[i].CurrencyDesc);
    //                                     $('#edtBuyRate').val(data.tcurrency[i].BuyRate);
    //                                     $('#edtSellRate').val(data.tcurrency[i].SellRate);
    //                                 }
    //                             }
    //                             setTimeout(function() {
    //                                 $('.fullScreenSpin').css('display', 'none');
    //                                 $('#newCurrencyModal').modal('toggle');
    //                                 $('#sedtCountry').attr('readonly', true);
    //                             }, 200);
    //                         });
    //                     } else {
    //                         let data = JSON.parse(dataObject[0].data);
    //                         let useData = data.tcurrency;
    //                         for (let i = 0; i < data.tcurrency.length; i++) {
    //                             if (data.tcurrency[i].Code === currencyDataName) {
    //                                 $('#edtCurrencyID').val(data.tcurrency[i].Id);
    //                                 $('#sedtCountry').val(data.tcurrency[i].Country);
    //                                 $('#currencyCode').val(currencyDataName);
    //                                 $('#currencySymbol').val(data.tcurrency[i].CurrencySymbol);
    //                                 $('#edtCurrencyName').val(data.tcurrency[i].Currency);
    //                                 $('#edtCurrencyDesc').val(data.tcurrency[i].CurrencyDesc);
    //                                 $('#edtBuyRate').val(data.tcurrency[i].BuyRate);
    //                                 $('#edtSellRate').val(data.tcurrency[i].SellRate);
    //                             }
    //                         }
    //                         setTimeout(function() {
    //                             $('.fullScreenSpin').css('display', 'none');
    //                             $('#newCurrencyModal').modal('toggle');
    //                         }, 200);
    //                     }

    //                 }).catch(function(err) {
    //                     $('.fullScreenSpin').css('display', 'inline-block');
    //                     sideBarService.getCurrencies().then(function(data) {
    //                         for (let i in data.tcurrency) {
    //                             if (data.tcurrency[i].Code === currencyDataName) {
    //                                 $('#edtCurrencyID').val(data.tcurrency[i].Id);
    //                                 setTimeout(function() {
    //                                     $('#sedtCountry').val(data.tcurrency[i].Country);
    //                                 }, 200);
    //                                 //$('#sedtCountry').val(data.tcurrency[i].Country);
    //                                 $('#currencyCode').val(currencyDataName);
    //                                 $('#currencySymbol').val(data.tcurrency[i].CurrencySymbol);
    //                                 $('#edtCurrencyName').val(data.tcurrency[i].Currency);
    //                                 $('#edtCurrencyDesc').val(data.tcurrency[i].CurrencyDesc);
    //                                 $('#edtBuyRate').val(data.tcurrency[i].BuyRate);
    //                                 $('#edtSellRate').val(data.tcurrency[i].SellRate);
    //                             }
    //                         }
    //                         setTimeout(function() {
    //                             $('.fullScreenSpin').css('display', 'none');
    //                             $('#newCurrencyModal').modal('toggle');
    //                             $('#sedtCountry').attr('readonly', true);
    //                         }, 200);
    //                     });
    //                 });

    //             } else {
    //                 $('#currencyModal').modal();
    //                 setTimeout(function() {
    //                     $('#tblCurrencyPopList_filter .form-control-sm').focus();
    //                     $('#tblCurrencyPopList_filter .form-control-sm').val('');
    //                     $('#tblCurrencyPopList_filter .form-control-sm').trigger("input");
    //                     var datatable = $('#tblCurrencyPopList').DataTable();
    //                     datatable.draw();
    //                     $('#tblCurrencyPopList_filter .form-control-sm').trigger("input");
    //                 }, 500);
    //             }
    //         }
    //     });

    $('#edtSupplierName').editableSelect().on('click.editable-select', function(e, li) {
        var $earch = $(this);
        var offset = $earch.offset();
        $('#edtSupplierPOPID').val('');
        var supplierDataName = e.target.value || '';
        var supplierDataID = $('#edtSupplierName').attr('suppid').replace(/\s/g, '') || '';
        if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#supplierListModal').modal();
            setTimeout(function() {
                $('#tblSupplierlist_filter .form-control-sm').focus();
                $('#tblSupplierlist_filter .form-control-sm').val('');
                $('#tblSupplierlist_filter .form-control-sm').trigger("input");
                var datatable = $('#tblSupplierlist').DataTable();
                datatable.draw();
                $('#tblSupplierlist_filter .form-control-sm').trigger("input");
            }, 500);
        } else {
            if (supplierDataName.replace(/\s/g, '') != '') {
                //FlowRouter.go('/supplierscard?name=' + e.target.value);
                getVS1Data('TSupplierVS1').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        sideBarService.getOneSupplierDataExByName(supplierDataName).then(function(data) {
                            $('.fullScreenSpin').css('display', 'none');
                            let lineItems = [];

                            $('#add-supplier-title').text('Edit Supplier');
                            let popSupplierID = data.tsupplier[0].fields.ID || '';
                            let popSupplierName = data.tsupplier[0].fields.ClientName || '';
                            let popSupplierEmail = data.tsupplier[0].fields.Email || '';
                            let popSupplierTitle = data.tsupplier[0].fields.Title || '';
                            let popSupplierFirstName = data.tsupplier[0].fields.FirstName || '';
                            let popSupplierMiddleName = data.tsupplier[0].fields.CUSTFLD10 || '';
                            let popSupplierLastName = data.tsupplier[0].fields.LastName || '';
                            let popSuppliertfn = '' || '';
                            let popSupplierPhone = data.tsupplier[0].fields.Phone || '';
                            let popSupplierMobile = data.tsupplier[0].fields.Mobile || '';
                            let popSupplierFaxnumber = data.tsupplier[0].fields.Faxnumber || '';
                            let popSupplierSkypeName = data.tsupplier[0].fields.SkypeName || '';
                            let popSupplierURL = data.tsupplier[0].fields.URL || '';
                            let popSupplierStreet = data.tsupplier[0].fields.Street || '';
                            let popSupplierStreet2 = data.tsupplier[0].fields.Street2 || '';
                            let popSupplierState = data.tsupplier[0].fields.State || '';
                            let popSupplierPostcode = data.tsupplier[0].fields.Postcode || '';
                            let popSupplierCountry = data.tsupplier[0].fields.Country || LoggedCountry;
                            let popSupplierbillingaddress = data.tsupplier[0].fields.BillStreet || '';
                            let popSupplierbcity = data.tsupplier[0].fields.BillStreet2 || '';
                            let popSupplierbstate = data.tsupplier[0].fields.BillState || '';
                            let popSupplierbpostalcode = data.tsupplier[0].fields.BillPostcode || '';
                            let popSupplierbcountry = data.tsupplier[0].fields.Billcountry || LoggedCountry;
                            let popSuppliercustfield1 = data.tsupplier[0].fields.CUSTFLD1 || '';
                            let popSuppliercustfield2 = data.tsupplier[0].fields.CUSTFLD2 || '';
                            let popSuppliercustfield3 = data.tsupplier[0].fields.CUSTFLD3 || '';
                            let popSuppliercustfield4 = data.tsupplier[0].fields.CUSTFLD4 || '';
                            let popSuppliernotes = data.tsupplier[0].fields.Notes || '';
                            let popSupplierpreferedpayment = data.tsupplier[0].fields.PaymentMethodName || '';
                            let popSupplierterms = data.tsupplier[0].fields.TermsName || '';
                            let popSupplierdeliverymethod = data.tsupplier[0].fields.ShippingMethodName || '';
                            let popSupplieraccountnumber = data.tsupplier[0].fields.ClientNo || '';
                            let popSupplierisContractor = data.tsupplier[0].fields.Contractor || false;
                            let popSupplierissupplier = data.tsupplier[0].fields.IsSupplier || false;
                            let popSupplieriscustomer = data.tsupplier[0].fields.IsCustomer || false;

                            $('#edtSupplierCompany').val(popSupplierName);
                            $('#edtSupplierPOPID').val(popSupplierID);
                            $('#edtSupplierCompanyEmail').val(popSupplierEmail);
                            $('#edtSupplierTitle').val(popSupplierTitle);
                            $('#edtSupplierFirstName').val(popSupplierFirstName);
                            $('#edtSupplierMiddleName').val(popSupplierMiddleName);
                            $('#edtSupplierLastName').val(popSupplierLastName);
                            $('#edtSupplierPhone').val(popSupplierPhone);
                            $('#edtSupplierMobile').val(popSupplierMobile);
                            $('#edtSupplierFax').val(popSupplierFaxnumber);
                            $('#edtSupplierSkypeID').val(popSupplierSkypeName);
                            $('#edtSupplierWebsite').val(popSupplierURL);
                            $('#edtSupplierShippingAddress').val(popSupplierStreet);
                            $('#edtSupplierShippingCity').val(popSupplierStreet2);
                            $('#edtSupplierShippingState').val(popSupplierState);
                            $('#edtSupplierShippingZIP').val(popSupplierPostcode);
                            $('#sedtCountry').val(popSupplierCountry);
                            $('#txaNotes').val(popSuppliernotes);
                            $('#sltPreferedPayment').val(popSupplierpreferedpayment);
                            $('#sltTerms').val(popSupplierterms);
                            $('#suppAccountNo').val(popSupplieraccountnumber);
                            $('#edtCustomeField1').val(popSuppliercustfield1);
                            $('#edtCustomeField2').val(popSuppliercustfield2);
                            $('#edtCustomeField3').val(popSuppliercustfield3);
                            $('#edtCustomeField4').val(popSuppliercustfield4);

                            if ((data.tsupplier[0].fields.Street == data.tsupplier[0].fields.BillStreet) && (data.tsupplier[0].fields.Street2 == data.tsupplier[0].fields.BillStreet2) &&
                                (data.tsupplier[0].fields.State == data.tsupplier[0].fields.BillState) && (data.tsupplier[0].fields.Postcode == data.tsupplier[0].fields.Postcode) &&
                                (data.tsupplier[0].fields.Country == data.tsupplier[0].fields.Billcountry)) {
                                //templateObject.isSameAddress.set(true);
                                $('#chkSameAsShipping').attr("checked", "checked");
                            }
                            if (data.tsupplier[0].fields.Contractor == true) {
                                // $('#isformcontractor')
                                $('#isformcontractor').attr("checked", "checked");
                            } else {
                                $('#isformcontractor').removeAttr("checked");
                            }

                            setTimeout(function() {
                                $('#addSupplierModal').modal('show');
                            }, 200);



                        }).catch(function(err) {

                            $('.fullScreenSpin').css('display', 'none');
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tsuppliervs1;
                        var added = false;
                        for (let i = 0; i < data.tsuppliervs1.length; i++) {
                            if ((data.tsuppliervs1[i].fields.ClientName) === supplierDataName) {
                                added = true;
                                $('.fullScreenSpin').css('display', 'none');
                                let lineItems = [];
                                $('#add-supplier-title').text('Edit Supplier');
                                let popSupplierID = data.tsuppliervs1[i].fields.ID || '';
                                let popSupplierName = data.tsuppliervs1[i].fields.ClientName || '';
                                let popSupplierEmail = data.tsuppliervs1[i].fields.Email || '';
                                let popSupplierTitle = data.tsuppliervs1[i].fields.Title || '';
                                let popSupplierFirstName = data.tsuppliervs1[i].fields.FirstName || '';
                                let popSupplierMiddleName = data.tsuppliervs1[i].fields.CUSTFLD10 || '';
                                let popSupplierLastName = data.tsuppliervs1[i].fields.LastName || '';
                                let popSuppliertfn = '' || '';
                                let popSupplierPhone = data.tsuppliervs1[i].fields.Phone || '';
                                let popSupplierMobile = data.tsuppliervs1[i].fields.Mobile || '';
                                let popSupplierFaxnumber = data.tsuppliervs1[i].fields.Faxnumber || '';
                                let popSupplierSkypeName = data.tsuppliervs1[i].fields.SkypeName || '';
                                let popSupplierURL = data.tsuppliervs1[i].fields.URL || '';
                                let popSupplierStreet = data.tsuppliervs1[i].fields.Street || '';
                                let popSupplierStreet2 = data.tsuppliervs1[i].fields.Street2 || '';
                                let popSupplierState = data.tsuppliervs1[i].fields.State || '';
                                let popSupplierPostcode = data.tsuppliervs1[i].fields.Postcode || '';
                                let popSupplierCountry = data.tsuppliervs1[i].fields.Country || LoggedCountry;
                                let popSupplierbillingaddress = data.tsuppliervs1[i].fields.BillStreet || '';
                                let popSupplierbcity = data.tsuppliervs1[i].fields.BillStreet2 || '';
                                let popSupplierbstate = data.tsuppliervs1[i].fields.BillState || '';
                                let popSupplierbpostalcode = data.tsuppliervs1[i].fields.BillPostcode || '';
                                let popSupplierbcountry = data.tsuppliervs1[i].fields.Billcountry || LoggedCountry;
                                let popSuppliercustfield1 = data.tsuppliervs1[i].fields.CUSTFLD1 || '';
                                let popSuppliercustfield2 = data.tsuppliervs1[i].fields.CUSTFLD2 || '';
                                let popSuppliercustfield3 = data.tsuppliervs1[i].fields.CUSTFLD3 || '';
                                let popSuppliercustfield4 = data.tsuppliervs1[i].fields.CUSTFLD4 || '';
                                let popSuppliernotes = data.tsuppliervs1[i].fields.Notes || '';
                                let popSupplierpreferedpayment = data.tsuppliervs1[i].fields.PaymentMethodName || '';
                                let popSupplierterms = data.tsuppliervs1[i].fields.TermsName || '';
                                let popSupplierdeliverymethod = data.tsuppliervs1[i].fields.ShippingMethodName || '';
                                let popSupplieraccountnumber = data.tsuppliervs1[i].fields.ClientNo || '';
                                let popSupplierisContractor = data.tsuppliervs1[i].fields.Contractor || false;
                                let popSupplierissupplier = data.tsuppliervs1[i].fields.IsSupplier || false;
                                let popSupplieriscustomer = data.tsuppliervs1[i].fields.IsCustomer || false;

                                $('#edtSupplierCompany').val(popSupplierName);
                                $('#edtSupplierPOPID').val(popSupplierID);
                                $('#edtSupplierCompanyEmail').val(popSupplierEmail);
                                $('#edtSupplierTitle').val(popSupplierTitle);
                                $('#edtSupplierFirstName').val(popSupplierFirstName);
                                $('#edtSupplierMiddleName').val(popSupplierMiddleName);
                                $('#edtSupplierLastName').val(popSupplierLastName);
                                $('#edtSupplierPhone').val(popSupplierPhone);
                                $('#edtSupplierMobile').val(popSupplierMobile);
                                $('#edtSupplierFax').val(popSupplierFaxnumber);
                                $('#edtSupplierSkypeID').val(popSupplierSkypeName);
                                $('#edtSupplierWebsite').val(popSupplierURL);
                                $('#edtSupplierShippingAddress').val(popSupplierStreet);
                                $('#edtSupplierShippingCity').val(popSupplierStreet2);
                                $('#edtSupplierShippingState').val(popSupplierState);
                                $('#edtSupplierShippingZIP').val(popSupplierPostcode);
                                $('#sedtCountry').val(popSupplierCountry);
                                $('#txaNotes').val(popSuppliernotes);
                                $('#sltPreferedPayment').val(popSupplierpreferedpayment);
                                $('#sltTerms').val(popSupplierterms);
                                $('#suppAccountNo').val(popSupplieraccountnumber);
                                $('#edtCustomeField1').val(popSuppliercustfield1);
                                $('#edtCustomeField2').val(popSuppliercustfield2);
                                $('#edtCustomeField3').val(popSuppliercustfield3);
                                $('#edtCustomeField4').val(popSuppliercustfield4);

                                if ((data.tsuppliervs1[i].fields.Street == data.tsuppliervs1[i].fields.BillStreet) && (data.tsuppliervs1[i].fields.Street2 == data.tsuppliervs1[i].fields.BillStreet2) &&
                                    (data.tsuppliervs1[i].fields.State == data.tsuppliervs1[i].fields.BillState) && (data.tsuppliervs1[i].fields.Postcode == data.tsuppliervs1[i].fields.Postcode) &&
                                    (data.tsuppliervs1[i].fields.Country == data.tsuppliervs1[i].fields.Billcountry)) {
                                    //templateObject.isSameAddress.set(true);
                                    $('#chkSameAsShipping').attr("checked", "checked");
                                }
                                if (data.tsuppliervs1[i].fields.Contractor == true) {
                                    // $('#isformcontractor')
                                    $('#isformcontractor').attr("checked", "checked");
                                } else {
                                    $('#isformcontractor').removeAttr("checked");
                                }

                                setTimeout(function() {
                                    $('#addSupplierModal').modal('show');
                                }, 200);
                            }
                        }

                        if (!added) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            sideBarService.getOneSupplierDataExByName(supplierDataName).then(function(data) {
                                $('.fullScreenSpin').css('display', 'none');
                                let lineItems = [];

                                $('#add-supplier-title').text('Edit Supplier');
                                let popSupplierID = data.tsupplier[0].fields.ID || '';
                                let popSupplierName = data.tsupplier[0].fields.ClientName || '';
                                let popSupplierEmail = data.tsupplier[0].fields.Email || '';
                                let popSupplierTitle = data.tsupplier[0].fields.Title || '';
                                let popSupplierFirstName = data.tsupplier[0].fields.FirstName || '';
                                let popSupplierMiddleName = data.tsupplier[0].fields.CUSTFLD10 || '';
                                let popSupplierLastName = data.tsupplier[0].fields.LastName || '';
                                let popSuppliertfn = '' || '';
                                let popSupplierPhone = data.tsupplier[0].fields.Phone || '';
                                let popSupplierMobile = data.tsupplier[0].fields.Mobile || '';
                                let popSupplierFaxnumber = data.tsupplier[0].fields.Faxnumber || '';
                                let popSupplierSkypeName = data.tsupplier[0].fields.SkypeName || '';
                                let popSupplierURL = data.tsupplier[0].fields.URL || '';
                                let popSupplierStreet = data.tsupplier[0].fields.Street || '';
                                let popSupplierStreet2 = data.tsupplier[0].fields.Street2 || '';
                                let popSupplierState = data.tsupplier[0].fields.State || '';
                                let popSupplierPostcode = data.tsupplier[0].fields.Postcode || '';
                                let popSupplierCountry = data.tsupplier[0].fields.Country || LoggedCountry;
                                let popSupplierbillingaddress = data.tsupplier[0].fields.BillStreet || '';
                                let popSupplierbcity = data.tsupplier[0].fields.BillStreet2 || '';
                                let popSupplierbstate = data.tsupplier[0].fields.BillState || '';
                                let popSupplierbpostalcode = data.tsupplier[0].fields.BillPostcode || '';
                                let popSupplierbcountry = data.tsupplier[0].fields.Billcountry || LoggedCountry;
                                let popSuppliercustfield1 = data.tsupplier[0].fields.CUSTFLD1 || '';
                                let popSuppliercustfield2 = data.tsupplier[0].fields.CUSTFLD2 || '';
                                let popSuppliercustfield3 = data.tsupplier[0].fields.CUSTFLD3 || '';
                                let popSuppliercustfield4 = data.tsupplier[0].fields.CUSTFLD4 || '';
                                let popSuppliernotes = data.tsupplier[0].fields.Notes || '';
                                let popSupplierpreferedpayment = data.tsupplier[0].fields.PaymentMethodName || '';
                                let popSupplierterms = data.tsupplier[0].fields.TermsName || '';
                                let popSupplierdeliverymethod = data.tsupplier[0].fields.ShippingMethodName || '';
                                let popSupplieraccountnumber = data.tsupplier[0].fields.ClientNo || '';
                                let popSupplierisContractor = data.tsupplier[0].fields.Contractor || false;
                                let popSupplierissupplier = data.tsupplier[0].fields.IsSupplier || false;
                                let popSupplieriscustomer = data.tsupplier[0].fields.IsCustomer || false;

                                $('#edtSupplierCompany').val(popSupplierName);
                                $('#edtSupplierPOPID').val(popSupplierID);
                                $('#edtSupplierCompanyEmail').val(popSupplierEmail);
                                $('#edtSupplierTitle').val(popSupplierTitle);
                                $('#edtSupplierFirstName').val(popSupplierFirstName);
                                $('#edtSupplierMiddleName').val(popSupplierMiddleName);
                                $('#edtSupplierLastName').val(popSupplierLastName);
                                $('#edtSupplierPhone').val(popSupplierPhone);
                                $('#edtSupplierMobile').val(popSupplierMobile);
                                $('#edtSupplierFax').val(popSupplierFaxnumber);
                                $('#edtSupplierSkypeID').val(popSupplierSkypeName);
                                $('#edtSupplierWebsite').val(popSupplierURL);
                                $('#edtSupplierShippingAddress').val(popSupplierStreet);
                                $('#edtSupplierShippingCity').val(popSupplierStreet2);
                                $('#edtSupplierShippingState').val(popSupplierState);
                                $('#edtSupplierShippingZIP').val(popSupplierPostcode);
                                $('#sedtCountry').val(popSupplierCountry);
                                $('#txaNotes').val(popSuppliernotes);
                                $('#sltPreferedPayment').val(popSupplierpreferedpayment);
                                $('#sltTerms').val(popSupplierterms);
                                $('#suppAccountNo').val(popSupplieraccountnumber);
                                $('#edtCustomeField1').val(popSuppliercustfield1);
                                $('#edtCustomeField2').val(popSuppliercustfield2);
                                $('#edtCustomeField3').val(popSuppliercustfield3);
                                $('#edtCustomeField4').val(popSuppliercustfield4);

                                if ((data.tsupplier[0].fields.Street == data.tsupplier[0].fields.BillStreet) && (data.tsupplier[0].fields.Street2 == data.tsupplier[0].fields.BillStreet2) &&
                                    (data.tsupplier[0].fields.State == data.tsupplier[0].fields.BillState) && (data.tsupplier[0].fields.Postcode == data.tsupplier[0].fields.Postcode) &&
                                    (data.tsupplier[0].fields.Country == data.tsupplier[0].fields.Billcountry)) {
                                    //templateObject.isSameAddress.set(true);
                                    $('#chkSameAsShipping').attr("checked", "checked");
                                }
                                if (data.tsupplier[0].fields.Contractor == true) {
                                    // $('#isformcontractor')
                                    $('#isformcontractor').attr("checked", "checked");
                                } else {
                                    $('#isformcontractor').removeAttr("checked");
                                }

                                setTimeout(function() {
                                    $('#addSupplierModal').modal('show');
                                }, 200);
                            }).catch(function(err) {

                                $('.fullScreenSpin').css('display', 'none');
                            });
                        }
                    }
                }).catch(function(err) {

                    sideBarService.getOneSupplierDataExByName(supplierDataName).then(function(data) {
                        $('.fullScreenSpin').css('display', 'none');
                        let lineItems = [];

                        $('#add-supplier-title').text('Edit Supplier');
                        let popSupplierID = data.tsupplier[0].fields.ID || '';
                        let popSupplierName = data.tsupplier[0].fields.ClientName || '';
                        let popSupplierEmail = data.tsupplier[0].fields.Email || '';
                        let popSupplierTitle = data.tsupplier[0].fields.Title || '';
                        let popSupplierFirstName = data.tsupplier[0].fields.FirstName || '';
                        let popSupplierMiddleName = data.tsupplier[0].fields.CUSTFLD10 || '';
                        let popSupplierLastName = data.tsupplier[0].fields.LastName || '';
                        let popSuppliertfn = '' || '';
                        let popSupplierPhone = data.tsupplier[0].fields.Phone || '';
                        let popSupplierMobile = data.tsupplier[0].fields.Mobile || '';
                        let popSupplierFaxnumber = data.tsupplier[0].fields.Faxnumber || '';
                        let popSupplierSkypeName = data.tsupplier[0].fields.SkypeName || '';
                        let popSupplierURL = data.tsupplier[0].fields.URL || '';
                        let popSupplierStreet = data.tsupplier[0].fields.Street || '';
                        let popSupplierStreet2 = data.tsupplier[0].fields.Street2 || '';
                        let popSupplierState = data.tsupplier[0].fields.State || '';
                        let popSupplierPostcode = data.tsupplier[0].fields.Postcode || '';
                        let popSupplierCountry = data.tsupplier[0].fields.Country || LoggedCountry;
                        let popSupplierbillingaddress = data.tsupplier[0].fields.BillStreet || '';
                        let popSupplierbcity = data.tsupplier[0].fields.BillStreet2 || '';
                        let popSupplierbstate = data.tsupplier[0].fields.BillState || '';
                        let popSupplierbpostalcode = data.tsupplier[0].fields.BillPostcode || '';
                        let popSupplierbcountry = data.tsupplier[0].fields.Billcountry || LoggedCountry;
                        let popSuppliercustfield1 = data.tsupplier[0].fields.CUSTFLD1 || '';
                        let popSuppliercustfield2 = data.tsupplier[0].fields.CUSTFLD2 || '';
                        let popSuppliercustfield3 = data.tsupplier[0].fields.CUSTFLD3 || '';
                        let popSuppliercustfield4 = data.tsupplier[0].fields.CUSTFLD4 || '';
                        let popSuppliernotes = data.tsupplier[0].fields.Notes || '';
                        let popSupplierpreferedpayment = data.tsupplier[0].fields.PaymentMethodName || '';
                        let popSupplierterms = data.tsupplier[0].fields.TermsName || '';
                        let popSupplierdeliverymethod = data.tsupplier[0].fields.ShippingMethodName || '';
                        let popSupplieraccountnumber = data.tsupplier[0].fields.ClientNo || '';
                        let popSupplierisContractor = data.tsupplier[0].fields.Contractor || false;
                        let popSupplierissupplier = data.tsupplier[0].fields.IsSupplier || false;
                        let popSupplieriscustomer = data.tsupplier[0].fields.IsCustomer || false;

                        $('#edtSupplierCompany').val(popSupplierName);
                        $('#edtSupplierPOPID').val(popSupplierID);
                        $('#edtSupplierCompanyEmail').val(popSupplierEmail);
                        $('#edtSupplierTitle').val(popSupplierTitle);
                        $('#edtSupplierFirstName').val(popSupplierFirstName);
                        $('#edtSupplierMiddleName').val(popSupplierMiddleName);
                        $('#edtSupplierLastName').val(popSupplierLastName);
                        $('#edtSupplierPhone').val(popSupplierPhone);
                        $('#edtSupplierMobile').val(popSupplierMobile);
                        $('#edtSupplierFax').val(popSupplierFaxnumber);
                        $('#edtSupplierSkypeID').val(popSupplierSkypeName);
                        $('#edtSupplierWebsite').val(popSupplierURL);
                        $('#edtSupplierShippingAddress').val(popSupplierStreet);
                        $('#edtSupplierShippingCity').val(popSupplierStreet2);
                        $('#edtSupplierShippingState').val(popSupplierState);
                        $('#edtSupplierShippingZIP').val(popSupplierPostcode);
                        $('#sedtCountry').val(popSupplierCountry);
                        $('#txaNotes').val(popSuppliernotes);
                        $('#sltPreferedPayment').val(popSupplierpreferedpayment);
                        $('#sltTerms').val(popSupplierterms);
                        $('#suppAccountNo').val(popSupplieraccountnumber);
                        $('#edtCustomeField1').val(popSuppliercustfield1);
                        $('#edtCustomeField2').val(popSuppliercustfield2);
                        $('#edtCustomeField3').val(popSuppliercustfield3);
                        $('#edtCustomeField4').val(popSuppliercustfield4);

                        if ((data.tsupplier[0].fields.Street == data.tsupplier[0].fields.BillStreet) && (data.tsupplier[0].fields.Street2 == data.tsupplier[0].fields.BillStreet2) &&
                            (data.tsupplier[0].fields.State == data.tsupplier[0].fields.BillState) && (data.tsupplier[0].fields.Postcode == data.tsupplier[0].fields.Postcode) &&
                            (data.tsupplier[0].fields.Country == data.tsupplier[0].fields.Billcountry)) {
                            //templateObject.isSameAddress.set(true);
                            $('#chkSameAsShipping').attr("checked", "checked");
                        }
                        if (data.tsupplier[0].fields.Contractor == true) {
                            // $('#isformcontractor')
                            $('#isformcontractor').attr("checked", "checked");
                        } else {
                            $('#isformcontractor').removeAttr("checked");
                        }

                        setTimeout(function() {
                            $('#addSupplierModal').modal('show');
                        }, 200);


                    }).catch(function(err) {

                        $('.fullScreenSpin').css('display', 'none');
                    });
                });
            } else {
                $('#supplierListModal').modal();
                setTimeout(function() {
                    $('#tblSupplierlist_filter .form-control-sm').focus();
                    $('#tblSupplierlist_filter .form-control-sm').val('');
                    $('#tblSupplierlist_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                    $('#tblSupplierlist_filter .form-control-sm').trigger("input");
                }, 500);
            }
        }
    });

    $(document).on("click", "#tblSupplierlist tbody tr", function(e) {
        const tableSupplier = $(this);
        $('#edtSupplierName').val(tableSupplier.find(".colCompany").text());
        $('#edtSupplierName').attr("suppid", tableSupplier.find(".colID").text());
        $('#edtSupplierEmail').val(tableSupplier.find(".colEmail").text());
        $('#edtSupplierEmail').attr('customerid', tableSupplier.find(".colID").text());
        $('#edtSupplierName').attr('suppid', tableSupplier.find(".colID").text());
        let postalAddress = tableSupplier.find(".colCompany").text() + '\n' + tableSupplier.find(".colStreetAddress").text() + '\n' + tableSupplier.find(".colCity").text() + ' ' + tableSupplier.find(".colState").text() + ' ' + tableSupplier.find(".colZipCode").text() + '\n' + tableSupplier.find(".colCountry").text();
        $('#txabillingAddress').val(postalAddress);
        $('#pdfSupplierAddress').html(postalAddress);
        $('.pdfSupplierAddress').text(postalAddress);
        $('#txaShipingInfo').val(postalAddress);
        $('#sltTerms').val(tableSupplier.find(".colSupplierTermName").text() || purchaseDefaultTerms);
        setSupplierInfo();

    });

    function setSupplierInfo(){
        if (!FlowRouter.current().queryParams.supplierid) {
            $('#supplierListModal').modal('toggle');
        }
        let utilityService = new UtilityService();
        let taxcodeList = templateObject.taxraterecords.get();
        let $tblrows = $("#tblCreditLine tbody tr");
        let lineAmount = 0;
        let subGrandTotal = 0;
        let taxGrandTotal = 0;
        let taxGrandTotalPrint = 0;
        $tblrows.each(function(index) {
            let taxTotal;
            const $tblrow = $(this);
            const amount = $tblrow.find(".colAmountExChange").val() || 0;
            const taxcode = $tblrow.find(".lineTaxCode").val() || '';
            if ($tblrow.find(".lineAccountName").val() === '') {
                $tblrow.find(".colAccountName").addClass('boldtablealertsborder');
            }
            let taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename === taxcode) {
                        taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                    }
                }
            }
            const subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
            if ((taxrateamount === '') || (taxrateamount === ' ')) {
                taxTotal = 0;
            } else {
                taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
            }
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
            if (!isNaN(subTotal)) {
                $tblrow.find('.colAmountExChange').val(utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2)));
                let totalAmountInc = (parseFloat(subTotal)) + (parseFloat(taxTotal)) || 0;
                $tblrow.find('.colAmountIncChange').val(utilityService.modifynegativeCurrencyFormat(totalAmountInc.toFixed(2)));
                subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
            }
            if (!isNaN(taxTotal)) {
                taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
            }
            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
            }
        });
        $('#tblSupplierlist_filter .form-control-sm').val('');
        setTimeout(function() {
            $('.btnRefreshSupplier').trigger('click');
            $('.fullScreenSpin').css('display', 'none');
        }, 1000);
    }

    exportSalesToPdf =  async function (template_title,number) {
                if(template_title == 'Credits')
                {
                    await showCreditData1(template_title, number, true);
                }
                let margins = {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: 100
                };

                let invoice_data_info = templateObject.creditrecord.get();
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

                let file = "Credit.pdf";
                if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
                    if(template_title == 'Credits')
                    {
                        file = 'Credit-' + invoice_data_info.id + '.pdf';
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
                    $("#html-2-pdfwrapper").css('display', 'none');
                    $("#html-2-pdfwrapper_new").css('display', 'none');
                    $("#html-2-pdfwrapper_quotes").hide();
                    $("#html-2-pdfwrapper_quotes2").hide();
                    $("#html-2-pdfwrapper_quotes3").hide();
                    $('.fullScreenSpin').css("display", "none");
                });
                return true;
    }

    exportSalesToPdf1 = function() {

        $('.fullScreenSpin').css('display', 'block');

        let margins = {
            top: 0,
            bottom: 0,
            left: 0,
            width: 100
        };

        let id = $('.printID').attr("id");
        document.getElementById('html-2-pdfwrapper').style.display="block";

        let subtotal = $('#subtotal_total').text();
        let net = $('#subtotal_nett').text();
        let subtotal_discount = $('#subtotal_discount').text();
        let grandTotal = $('#grandTotal').text();
        let totalPaidAmt = $('#totalPaidAmt').text();
        let totalBalanceDue = $('#totalBalanceDue').text();
        let total_new_tax = $('#subtotal_tax').text();

        let taxItems = {};
        $('#tblCreditLine > tbody > tr').each(function () {
            var lineID = this.id;
            let targetRow = $('#' + lineID);
            let targetTaxCode = targetRow.find('.lineTaxCode').val();
            let qty = targetRow.find(".lineQty").val() || 0
            let price = targetRow.find('.colUnitPriceExChange').val() || '';
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

        $("#html-2-pdfwrapper #subtotal_totalPrint").html(subtotal);
        $("#html-2-pdfwrapper #grandTotalPrint").html(grandTotal);
        $("#html-2-pdfwrapper #totalpaidamount").html(totalPaidAmt);
        $("#html-2-pdfwrapper #totalBalanceDuePrint").html(totalBalanceDue);
        $("#html-2-pdfwrapper #total_tax_new").html(total_new_tax);

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

        var source = document.getElementById('html-2-pdfwrapper');
        let file = "Credit.pdf";
        if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
            file = 'Credit-' + id + '.pdf';
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

        html2pdf().set(opt).from(source).save().then(function(dataObject) {
            $('#html-2-pdfwrapper').css('display', 'none');
            $('.fullScreenSpin').css('display', 'none');
          //  $('.fullScreenSpin').css('display', 'block');
        });
    };
});

Template.creditcard.onRendered(function() {
    let tempObj = Template.instance();
    let utilityService = new UtilityService();
    let productService = new ProductService();
    let accountService = new AccountService();
    let purchaseService = new PurchaseBoardService();
    const taxRateService = new TaxRateService();
    let tableProductList;
    var splashArrayProductList = new Array();
    var splashArrayTaxRateList = new Array();
    const taxCodesList = [];
    let taxCodes = new Array();

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
                            responsive: true,
                            language: { search: "",searchPlaceholder: "Search List..." },
                            "fnInitComplete": function() {
                                $("<button class='btn btn-primary btnRefreshAccount' type='button' id='btnRefreshAccount' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblAccount_filter");
                            }

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
                        responsive: true,
                        language: { search: "",searchPlaceholder: "Search List..." },
                        "fnInitComplete": function() {
                            $("<button class='btn btn-primary btnRefreshAccount' type='button' id='btnRefreshAccount' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblAccount_filter");
                        }

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
                        responsive: true,
                        language: { search: "",searchPlaceholder: "Search List..." },
                        "fnInitComplete": function() {
                            $("<button class='btn btn-primary btnRefreshAccount' type='button' id='btnRefreshAccount' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblAccount_filter");
                        }
                    });
                    $('div.dataTables_filter input').addClass('form-control form-control-sm');
                }
            });
        });
    };
    //tempObj.getAllProducts();

    tempObj.getAllTaxCodes = function() {
        getVS1Data('TTaxcodeVS1').then(function(dataObject) {
            if (dataObject.length == 0) {
                purchaseService.getTaxCodesDetailVS1().then(function(data) {

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
                            columnDefs: [
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
                        columnDefs: [
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
            purchaseService.getTaxCodesDetailVS1().then(function(data) {

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
                        columnDefs: [
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
});

Template.creditcard.helpers({

    getTemplateList: function () {
        return template_list;
      },

      getTemplateNumber: function () {
        let template_numbers = ["1", "2", "3"];
        return template_numbers;
      },


    isBatchSerialNoTracking: () => {
        return Session.get('CloudShowSerial') || false;
    },
    creditrecord: () => {
        return Template.instance().creditrecord.get();
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
    viarecords: () => {
        return Template.instance().viarecords.get().sort(function(a, b) {
            if (a.shippingmethod == 'NA') {
                return 1;
            } else if (b.shippingmethod == 'NA') {
                return -1;
            }
            return (a.shippingmethod.toUpperCase() > b.shippingmethod.toUpperCase()) ? 1 : -1;
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
    clientrecords: () => {
        return Template.instance().clientrecords.get().sort(function(a, b) {
            if (a.suppliername == 'NA') {
                return 1;
            } else if (b.suppliername == 'NA') {
                return -1;
            }
            return (a.suppliername.toUpperCase() > b.suppliername.toUpperCase()) ? 1 : -1;
        });
    },
    purchaseCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get('mycloudLogonID'),
            PrefName: 'creditcard'
        });
    },
    purchaseCloudGridPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get('mycloudLogonID'),
            PrefName: 'tblCreditLine'
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
      if(LoggedCountry== "South Africa"){
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
    isCurrencyEnable: () => FxGlobalFunctions.isCurrencyEnabled(),
    // custom field displaysettings
    displayfields: () => {
      return Template.instance().displayfields.get();
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

Template.creditcard.events({
    'click  #open_print_confirm':function(event)
    {
        playPrintAudio();
        setTimeout(async function(){
        if($('#choosetemplate').is(':checked'))
        {
            $('#templateselection').modal('show');
        }
        else
        {
            $('.fullScreenSpin').css('display', 'inline-block');
            // $('#html-2-pdfwrapper').css('display', 'block');
            let result = await exportSalesToPdf(template_list[0], 1);
            // if ($('.edtCustomerEmail').val() != "") {
            //     $('.pdfCustomerName').html($('#edtCustomerName').val());
            //     $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));
            //     $('#printcomment').html($('#txaComment').val().replace(/[\r\n]/g, "<br />"));
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
            //         if (result.value) {}
            //         else if (result.dismiss === 'cancel') {}
            //     });
            // }
            // $('#confirmprint').modal('hide');            
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

    'click #edtSupplierName': function(event) {


    },
    'change #sltStatus': function() {
        let status = $('#sltStatus').find(":selected").val();
        if (status == "newstatus") {
            $('#statusModal').modal();
        }
    },
    'blur .lineMemo': function(event) {
        var targetID = $(event.target).closest('tr').attr('id');

        $('#' + targetID + " #lineMemo").text($('#' + targetID + " .lineMemo").text());
    },
    'blur .colAmountExChange': function(event) {
        let templateObject = Template.instance();
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();
        var targetID = $(event.target).closest('tr').attr('id');
        if (!isNaN($(event.target).val())) {
            let inputUnitPrice = parseFloat($(event.target).val()) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
        } else {
            let inputUnitPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) || 0;

            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));


        }
        let $tblrows = $("#tblCreditLine tbody tr");
        let $printrows = $(".credit_print tbody tr");

        if ($('.printID').val() == "") {
            $('#' + targetID + " #lineAmount").text($('#' + targetID + " .colAmountExChange").val());
            $('#' + targetID + " #lineTaxCode").text($('#' + targetID + " .lineTaxCode").val());

        }

        let lineAmount = 0;
        let subGrandTotal = 0;
        let taxGrandTotal = 0;
        let taxGrandTotalPrint = 0;

        $tblrows.each(function(index) {
            var $tblrow = $(this);
            var amount = $tblrow.find(".colAmountExChange").val() || "0";
            var taxcode = $tblrow.find(".lineTaxCode").val() || 0;
            var taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxcode) {
                        taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                    }
                }
            }


            var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
            var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
            if (!isNaN(subTotal)) {
                $tblrow.find('.colAmountExChange').val(utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2)));
                let totalAmountInc = (parseFloat(subTotal)) + (parseFloat(taxTotal)) || 0;
                $tblrow.find('.colAmountIncChange').val(utilityService.modifynegativeCurrencyFormat(totalAmountInc.toFixed(2)));
                subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
            }

            if (!isNaN(taxTotal)) {
                taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
            }


            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));

            }
        });

        if ($(".printID").val() == "") {
            $printrows.each(function(index) {
                var $printrow = $(this);
                var amount = $printrow.find("#lineAmount").text() || "0";
                var taxcode = $printrow.find("#lineTaxCode").text() || "E";

                var taxrateamount = 0;
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename == taxcode) {
                            taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
                        }
                    }
                }
                var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                $printrow.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
                if (!isNaN(subTotal)) {
                    $printrow.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                    subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                    document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
                }

                if (!isNaN(taxTotal)) {
                    taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                }
                if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                    let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                    document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                    //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

                }
            });
        }

        updateTotal(templateObject);
    },
    'blur .colAmountIncChange': function(event) {
        let templateObject = Template.instance();
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();
        var targetID = $(event.target).closest('tr').attr('id');
        if (!isNaN($(event.target).val())) {
            let inputUnitPrice = parseFloat($(event.target).val()) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
        } else {
            let inputUnitPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) || 0;

            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));


        }
        let $tblrows = $("#tblCreditLine tbody tr");
        let $printrows = $(".credit_print tbody tr");

        let lineAmount = 0;
        let subGrandTotal = 0;
        let taxGrandTotal = 0;
        let taxGrandTotalPrint = 0;

        $tblrows.each(function(index) {
            var $tblrow = $(this);
            var amount = $tblrow.find(".colAmountIncChange").val() || "0";
            var taxcode = $tblrow.find(".lineTaxCode").val() || 0;
            var taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxcode) {
                        taxrateamount = taxcodeList[i].coderate.replace('%', "");
                    }
                }
            }

            let taxRateAmountCalc = (parseFloat(taxrateamount) + 100) / 100;
            var subTotal = (parseFloat(amount.replace(/[^0-9.-]+/g, "")) / (taxRateAmountCalc)) || 0;
            var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotal) || 0;
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
            if (!isNaN(subTotal)) {
                $tblrow.find('.colAmountExChange').val(utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2)));
                let totalAmountInc = (parseFloat(subTotal)) + (parseFloat(taxTotal)) || 0;
                $tblrow.find('.colAmountIncChange').val(utilityService.modifynegativeCurrencyFormat(totalAmountInc.toFixed(2)));
                subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
            }

            if (!isNaN(taxTotal)) {
                taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
            }


            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));

            }
        });

        if ($(".printID").val() == "") {
            $printrows.each(function(index) {
                var $printrow = $(this);
                var amount = $printrow.find("#lineAmount").text() || "0";
                var taxcode = $printrow.find("#lineTaxCode").text() || "E";

                var taxrateamount = 0;
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename == taxcode) {
                            taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
                        }
                    }
                }
                var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                $printrow.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
                if (!isNaN(subTotal)) {
                    $printrow.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                    subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                    document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
                }

                if (!isNaN(taxTotal)) {
                    taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                }
                if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                    let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                    document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                    //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

                }
            });
        }



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
        let suppliername = $('#edtSupplierName').val();
        let accountService = new AccountService();
        const accountTypeList = [];
        if (suppliername === '') {
            swal('Supplier has not been selected!', '', 'warning');
            event.preventDefault();
        } else {
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
        }
    },
    'click #accountListModal #refreshpagelist': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        localStorage.setItem('VS1PurchaseAccountList', '');
        let templateObject = Template.instance();
        Meteor._reload.reload();
        templateObject.getAllProducts();

    },
    'click .lineTaxRate': function(event) {
        $('#tblCreditLine tbody tr .lineTaxRate').attr("data-toggle", "modal");
        $('#tblCreditLine tbody tr .lineTaxRate').attr("data-target", "#taxRateListModal");
        var targetID = $(event.target).closest('tr').attr('id');
        $('#selectLineID').val(targetID);
    },
    'click .lineTaxAmount': function (event) {
        let targetRow = $(event.target).closest('tr');
        let targetID = targetRow.attr('id');
        let targetTaxCode = targetRow.find('.lineTaxCode').val();
        let price = targetRow.find('.colAmountExChange').val() || '';
        const tmpObj = Template.instance();
        const taxDetail = tmpObj.taxcodes.get().find((v) => v.CodeName === targetTaxCode);
        const subTaxCodes = tmpObj.subtaxcodes.get();

        if (!taxDetail) {
            return;
        }

        let priceTotal = Number(price.replace(/[^0-9.-]+/g, ""));
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

        $('#tblCreditLine tbody tr .lineTaxAmount').attr("data-toggle", "modal");
        $('#tblCreditLine tbody tr .lineTaxAmount').attr("data-target", "#taxDetailModal");
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
                            $('.fullScreenSpin').css('display', 'none');
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
                        $('.fullScreenSpin').css('display', 'none');
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
    'click .printConfirm':  async function(event) {
        playPrintAudio();
        setTimeout(async function(){
        var printTemplate = [];
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#html-2-pdfwrapper').css('display', 'block');

        var credits = $('input[name="Credits"]:checked').val();
        let emid = Session.get('mySessionEmployeeLoggedID');

        sideBarService.getTemplateNameandEmployeId("Credits",emid,1).then(function (data) {
            templateid = data.ttemplatesettings;
            var id = templateid[0].fields.ID;

              objDetails =  {
              type:"TTemplateSettings",
              fields:{
                          ID:parseInt(id),
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Credits",
                          GlobalRef:"Credits",
                          Description:$('input[name="Credits_1"]').val(),
                          Template:"1",
                          Active:credits == 1 ? true:false,
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
                                  SettingName:"Credits",
                                  Description:$('input[name="Credits_1"]').val(),
                                  Template:"1",
                                  Active:credits == 1 ? true:false,
                              }
                      }

                      sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                        sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                          addVS1Data('TTemplateSettings', JSON.stringify(data));

                        });


                      }).catch(function (err) {


                      });

        });

        sideBarService.getTemplateNameandEmployeId("Credits",emid,2).then(function (data) {
            templateid = data.ttemplatesettings;
            var id = templateid[0].fields.ID;
            objDetails =  {
              type:"TTemplateSettings",
              fields:{
                          ID:parseInt(id),
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Credits",
                          GlobalRef:"Credits",
                          Description:$('input[name="Credits_2"]').val(),
                          Template:"2",
                          Active:credits == 2 ? true:false,
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
                                  SettingName:"Credits",
                                  Description:$('input[name="Credits_2"]').val(),
                                  Template:"2",
                                  Active:credits == 2 ? true:false,
                              }
                      }

                      sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                        sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                          addVS1Data('TTemplateSettings', JSON.stringify(data));

                        });

                      }).catch(function (err) {


                      });

        });

        sideBarService.getTemplateNameandEmployeId("Credits",emid,3).then(function (data) {
            templateid = data.ttemplatesettings;
            var id = templateid[0].fields.ID;

            objDetails =  {
              type:"TTemplateSettings",
              fields:{
                          ID:parseInt(id),
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Credits",
                          GlobalRef:"Credits",
                          Description:$('input[name="Credits_3"]').val(),
                          Template:"3",
                          Active:credits == 3 ? true:false,
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
                                  SettingName:"Credits",
                                  Description:$('input[name="Credits_3"]').val(),
                                  Template:"3",
                                  Active:credits == 3 ? true:false,
                              }
                      }

                      sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                      sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                          addVS1Data('TTemplateSettings', JSON.stringify(data));

                      });


                      }).catch(function (err) {



                      });

        });

        if($('#print_credit').is(':checked') || $('#print_credit_second').is(':checked') ) {
            printTemplate.push('Credits');
        }

        if(printTemplate.length > 0) {
              for(var i = 0; i < printTemplate.length; i++)
              {
                if(printTemplate[i] == 'Credits')
                {
                    var template_number = $('input[name="Credits"]:checked').val();
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


        function generatePdfForMail(creditID) {
            let file = "Credit-" + creditID + ".pdf"
            return new Promise((resolve, reject) => {
                let templateObject = Template.instance();
                let completeTabRecord;
                let doc = new jsPDF('p', 'pt', 'a4');
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
                }
                resolve(html2pdf().set(opt).from(source).toPdf().output('datauristring'));

            });
        }

        let attachment = [];
        let templateObject = Template.instance();

        let creditID = FlowRouter.current().queryParams.id? parseInt(FlowRouter.current().queryParams.id) : 0;
        let encodedPdf = await generatePdfForMail(creditID);
        let pdfObject = "";

        let base64data = encodedPdf.split(',')[1];
        pdfObject = {
            filename: 'Credit-' + creditID + '.pdf',
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
            let temp = {... reportData};

            temp.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
            reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
            temp.attachments = attachment;
            if (temp.BasedOnType.includes("P")) {
                if (temp.FormID == 1) {
                    let formIds = temp.FormIDs.split(',');
                    if (formIds.includes("21")) {
                        temp.FormID = 21;
                        Meteor.call('sendNormalEmail', temp);
                    }
                } else {
                    if (temp.FormID == 21)
                        Meteor.call('sendNormalEmail', temp);
                }
            }
        });
    }, delayTimeAfterSound);
    },
    'keydown .lineQty, keydown .lineUnitPrice, keydown .lineAmount': function(event) {
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
        let templateObject = Template.instance();
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();
        var currentDate = new Date();
        let purchaseService = new PurchaseBoardService();
        var clicktimes = 0;
        var targetID = $(event.target).closest('tr').attr('id');
        $('#selectDeleteLineID').val(targetID);
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentInvoice = getso_id[getso_id.length - 1];
        var creditList = [];
        if (getso_id[1]) {
            currentInvoice = parseInt(currentInvoice);
            var creditData = await purchaseService.getOneCreditData(currentInvoice);
            var orderDate = creditData.fields.OrderDate;
            var fromDate = orderDate.substring(0, 10);
            var toDate = currentDate.getFullYear() + '-' + ("0" + (currentDate.getMonth() + 1)).slice(-2) + '-' + ("0" + (currentDate.getDate())).slice(-2);
            var followingCredits = await sideBarService.getTCreditListData(
                fromDate,
                toDate,
                false,
                initialReportLoad,
                0
            );
            creditList = followingCredits.tcreditlist;
        }
        if(targetID != undefined) {
            times++;
            if (times == 1) {
                $('#deleteLineModal').modal('toggle');
            } else {
                if ($('#tblCreditLine tbody>tr').length > 1) {
                    this.click;
                    $(event.target).closest('tr').remove();
                    $(".credit_print #" + targetID).remove();
                    event.preventDefault();
                    let $tblrows = $("#tblCreditLine tbody tr");
                    let $printrows = $(".credit_print tbody tr");
                    let lineAmount = 0;
                    let subGrandTotal = 0;
                    let taxGrandTotal = 0;
                    let taxGrandTotalPrint = 0;

                    $tblrows.each(function(index) {
                        var $tblrow = $(this);
                        var amount = $tblrow.find(".colAmount").val() || 0;
                        var taxcode = $tblrow.find(".lineTaxCode").val() || 0;

                        var taxrateamount = 0;
                        if (taxcodeList) {
                            for (var i = 0; i < taxcodeList.length; i++) {
                                if (taxcodeList[i].codename == taxcode) {
                                    taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                                }
                            }
                        }


                        var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                        var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                        $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
                        if (!isNaN(subTotal)) {
                            subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                            document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal);
                        }

                        if (!isNaN(taxTotal)) {
                            taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                            document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal);
                        }

                        if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                            let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                            document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                            document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                            document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);

                        }
                    });

                    if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
                        $printrows.each(function(index) {
                            var $printrows = $(this);
                            var amount = $printrows.find("#lineAmount").text() || "0";
                            var taxcode = $printrows.find("#lineTaxCode").text() || 0;

                            var taxrateamount = 0;
                            if (taxcodeList) {
                                for (var i = 0; i < taxcodeList.length; i++) {
                                    if (taxcodeList[i].codename == taxcode) {
                                        taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
                                    }
                                }
                            }


                            var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                            var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                            $printrows.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal))

                            if (!isNaN(subTotal)) {
                                $printrows.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                                subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                                document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
                            }

                            if (!isNaN(taxTotal)) {
                                taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                            }
                            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                                document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                                //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                                document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

                            }
                        });
                    }
                    return false;

                } else {
                    $('#deleteLineModal').modal('toggle');
                }
            }
        } else {
            if(creditList.length > 1) $("#footerDeleteModal2").modal("toggle");
            else $("#footerDeleteModal1").modal("toggle");
        }
    },
    'click .btnDeleteFollowingCredits': async function(event) {
        playDeleteAudio();
        var currentDate = new Date();
        let purchaseService = new PurchaseBoardService();
        let templateObject = Template.instance();
        setTimeout(async function(){

        swal({
            title: 'Delete Credit',
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
                if (getso_id[1]) {
                    $('.fullScreenSpin').css('display', 'inline-block');
                    currentInvoice = parseInt(currentInvoice);
                    var creditData = await purchaseService.getOneCreditData(currentInvoice);
                    var orderDate = creditData.fields.OrderDate;
                    var fromDate = orderDate.substring(0, 10);
                    var toDate = currentDate.getFullYear() + '-' + ("0" + (currentDate.getMonth() + 1)).slice(-2) + '-' + ("0" + (currentDate.getDate())).slice(-2);
                    var followingCredits = await sideBarService.getTCreditListData(
                        fromDate,
                        toDate,
                        false,
                        initialReportLoad,
                        0
                    );
                    var creditList = followingCredits.tcreditlist;
                    for (var i=0; i < creditList.length; i++) {
                        var objDetails = {
                            type: "TCredit",
                            fields: {
                                ID: creditList[i].PurchaseOrderID,
                                Deleted: true,
                                OrderStatus: "Deleted"
                            }
                        };
                        var result = await purchaseService.saveCredit(objDetails);
                    }
                }
                if(FlowRouter.current().queryParams.trans){
                    FlowRouter.go('/customerscard?id='+FlowRouter.current().queryParams.trans+'&transTab=active');
                }else{
                    FlowRouter.go('/creditlist?success=true');
                };
                $('.modal-backdrop').css('display','none');
                $("#deleteLineModal").modal("toggle");
            }
        });
    }, delayTimeAfterSound);
    },
    'click .btnDeleteCredit': function(event) {
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
                type: "TCredit",
                fields: {
                    ID: currentInvoice,
                    Deleted: true,
                    OrderStatus: "Deleted"
                }
            };

            purchaseService.saveCredit(objDetails).then(function(objDetails) {

                if(FlowRouter.current().queryParams.trans){
                  FlowRouter.go('/customerscard?id='+FlowRouter.current().queryParams.trans+'&transTab=active');
                }else{
                  FlowRouter.go('/creditlist?success=true');
                };
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
          if(FlowRouter.current().queryParams.trans){
            FlowRouter.go('/customerscard?id='+FlowRouter.current().queryParams.trans+'&transTab=active');
          }else{
            FlowRouter.go('/creditlist?success=true');
          };
        }
        $('#deleteLineModal').modal('toggle');
        $('.modal-backdrop').css('display', 'none');
    }, delayTimeAfterSound);
    },
    'click .btnDeleteLine': function(event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        setTimeout(function(){

        let taxcodeList = templateObject.taxraterecords.get();
        let selectLineID = $('#selectDeleteLineID').val();
        if ($('#tblCreditLine tbody>tr').length > 1) {
            this.click;

            $('#' + selectLineID).closest('tr').remove();
            $('.credit_print #' + selectLineID).remove();

            let $tblrows = $("#tblCreditLine tbody tr");
            let $printrows = $(".credit_print tbody tr");
            let lineAmount = 0;
            let subGrandTotal = 0;
            let taxGrandTotal = 0;
            let taxGrandTotalPrint = 0;

            $tblrows.each(function(index) {
                var $tblrow = $(this);
                var qty = $tblrow.find(".lineQty").val() || 0;
                var price = $tblrow.find(".lineUnitPrice").val() || 0;
                var taxcode = $tblrow.find(".lineTaxCode").val() || 0;

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
                $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
                if (!isNaN(subTotal)) {
                    $tblrow.find('.lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                    subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                    document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal);
                }

                if (!isNaN(taxTotal)) {
                    taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                    document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal);
                }

                if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                    let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                    document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);

                }
            });

            if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
                $printrows.each(function(index) {
                    var $printrows = $(this);
                    var amount = $printrows.find("#lineAmount").text() || "0";
                    var taxcode = $printrows.find("#lineTaxCode").text() || 0;

                    var taxrateamount = 0;
                    if (taxcodeList) {
                        for (var i = 0; i < taxcodeList.length; i++) {
                            if (taxcodeList[i].codename == taxcode) {
                                taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
                            }
                        }
                    }


                    var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                    var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                    $printrows.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal))

                    if (!isNaN(subTotal)) {
                        $printrows.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                        subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                        document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
                    }

                    if (!isNaN(taxTotal)) {
                        taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                    }
                    if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                        let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                        document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                        //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                        document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

                    }
                });
            }




        } else {
            this.click;

            $('#' + selectLineID + " .lineAccountName").val('');
            $('#' + selectLineID + " .lineMemo").text('');
            $('#' + selectLineID + " .lineOrdered").val('');
            $('#' + selectLineID + " .lineQty").val('');
            $('#' + selectLineID + " .lineBo").val('');
            $('#' + selectLineID + " .lineCustomField1").text('');
            $('#' + selectLineID + " .lineCostPrice").text('');
            $('#' + selectLineID + " .lineCustomField2").text('');
            $('#' + selectLineID + " .lineTaxRate").text('');
            $('#' + selectLineID + " .lineTaxCode").val('');
            $('#' + selectLineID + " .lineAmount").val('');

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
    'click .btnSave': (event, templateObject) => {
        playSaveAudio();
        //let templateObject = Template.instance();
        let purchaseService = new PurchaseBoardService();
        let uploadedItems = templateObject.uploadedFiles.get();
        setTimeout(function(){
        saveCurrencyHistory();

        let suppliername = $('#edtSupplierName');
        let termname = $('#sltTerms').val() || '';
        if (termname === '') {
            swal('Terms has not been selected!', '', 'warning');
            event.preventDefault();
            return false;
        }
        if (suppliername.val() === '') {
            swal('Supplier has not been selected!', '', 'warning');
            e.preventDefault();
        } else {

            $('.fullScreenSpin').css('display', 'inline-block');
            var splashLineArray = new Array();
            let lineItemsForm = [];
            let lineItemObjForm = {};
            $('#tblCreditLine > tbody > tr').each(function() {
                var lineID = this.id;
                let tdaccount = $('#' + lineID + " .lineAccountName").val();
                let tddmemo = $('#' + lineID + " .lineMemo").text();
                let tdamount = $('#' + lineID + " .lineAmount").val();
                let tdtaxrate = $('#' + lineID + " .lineTaxRate").text();
                let tdtaxCode = $('#' + lineID + " .lineTaxCode").val()||loggedTaxCodePurchaseInc;

                if (tdaccount != "") {

                    lineItemObjForm = {
                        type: "TCreditLine",
                        fields: {
                            AccountName: tdaccount || '',
                            ProductDescription: tddmemo || '',


                            LineCost: Number(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
                            LineTaxCode: tdtaxCode || '',
                            LineClassName: $('#sltDept').val() || defaultDept
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

            let supplier = $('#edtSupplierName').val();
            let supplierEmail = $('#edtSupplierEmail').val();
            let billingAddress = $('#txabillingAddress').val();

            var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
            var duedateTime = new Date($("#dtDueDate").datepicker("getDate"));

            let saleDate = saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate();
            let dueDate = duedateTime.getFullYear() + "-" + (duedateTime.getMonth() + 1) + "-" + duedateTime.getDate();

            let poNumber = $('#ponumber').val();
            let reference = $('#edtRef').val();

            let departement = $('#shipvia').val();
            let shippingAddress = $('#txaShipingInfo').val();
            let comments = $('#txaComment').val();
            let pickingInfrmation = $('#txapickmemo').val();

            let saleCustField1 = $('#edtSaleCustField1').val();
            let saleCustField2 = $('#edtSaleCustField2').val();
            let orderStatus = $('#edtStatus').val();

            var url = FlowRouter.current().path;
            var getso_id = url.split('?id=');
            var currentCredit = getso_id[getso_id.length - 1];

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
                currentCredit = parseInt(currentCredit);
                objDetails = {
                    type: "TCredit",
                    fields: {
                        ID: currentCredit,
                        SupplierName: supplier,
                        // ForeignExchangeCode: currencyCode,
                        // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                        ...foreignCurrencyFields,
                        Lines: splashLineArray,
                        OrderTo: billingAddress,
                        Deleted: false,


                        OrderDate: saleDate,

                        SupplierInvoiceNumber: poNumber,
                        ConNote: reference,
                        TermsName: termname,
                        Shipping: departement,
                        ShipTo: shippingAddress,
                        Comments: comments,


                        SalesComments: pickingInfrmation,

                        OrderStatus: $('#sltStatus').val()
                    }
                };
            } else {
                objDetails = {
                    type: "TCredit",
                    fields: {
                        SupplierName: supplier,
                        // ForeignExchangeCode: currencyCode,
                        // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                        ...foreignCurrencyFields,
                        Lines: splashLineArray,
                        OrderTo: billingAddress,
                        OrderDate: saleDate,
                        Deleted: false,

                        SupplierInvoiceNumber: poNumber,
                        ConNote: reference,
                        TermsName: termname,
                        Shipping: departement,
                        ShipTo: shippingAddress,
                        Comments: comments,


                        SalesComments: pickingInfrmation,

                        OrderStatus: $('#sltStatus').val()
                    }
                };
            }

            if(splashLineArray.length > 0){

            }else{
              swal('Account name has not been selected!', '', 'warning');
              $('.fullScreenSpin').css('display', 'none');
              event.preventDefault();
              return false;
            };

            purchaseService.saveCredit(objDetails).then(function(objDetails) {
                var supplierID = $('#edtSupplierEmail').attr('supplierid');

                $('#html-2-pdfwrapper').css('display', 'block');
                $('.pdfCustomerName').html($('#edtSupplierEmail').val());
                $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));
                var ponumber = $('#ponumber').val() || '.';
                $('.po').text(ponumber);
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
                            filename: 'Credit ' + invoiceId + '.pdf',
                            content: base64data,
                            encoding: 'base64'
                        };
                        attachment.push(pdfObject);

                        let erpInvoiceId = objDetails.fields.ID;

                        let mailFromName = Session.get('vs1companyName');
                        let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                        let customerEmailName = $('#edtSupplierName').val();
                        let checkEmailData = $('#edtSupplierEmail').val();

                        let grandtotal = $('#grandTotal').html();
                        let amountDueEmail = $('#totalBalanceDue').html();
                        let emailDueDate = $("#dtDueDate").val();
                        let mailSubject = 'Credit ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
                        let mailBody = "Hi " + customerEmailName + ",\n\n Here's puchase order " + erpInvoiceId + " for  " + grandtotal + "." +
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
                            '                        Please find credit <span>' + erpInvoiceId + '</span> attached below.' +
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
                                    FlowRouter.go('/creditlist?success=true');
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
                                    FlowRouter.go('/creditlist?success=true');
                                } else {
                                    $('#html-2-pdfwrapper').css('display', 'none');
                                    swal({
                                        title: 'SUCCESS',
                                        text: "Email Sent To Supplier: " + checkEmailData + " and User: " + mailFrom + "",
                                        type: 'success',
                                        showCancelButton: false,
                                        confirmButtonText: 'OK'
                                    }).then((result) => {
                                        if (result.value) {
                                          if(FlowRouter.current().queryParams.trans){
                                            FlowRouter.go('/customerscard?id='+FlowRouter.current().queryParams.trans+'&transTab=active');
                                          }else{
                                            FlowRouter.go('/creditlist?success=true');
                                          };
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
                                reportData.attachments = attachment;
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("21")) {
                                            reportData.FormID = 21;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 21)
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
                                    FlowRouter.go('/creditlist?success=true');

                                } else {
                                    $('#html-2-pdfwrapper').css('display', 'none');
                                    swal({
                                        title: 'SUCCESS',
                                        text: "Email Sent To Supplier: " + checkEmailData + " ",
                                        type: 'success',
                                        showCancelButton: false,
                                        confirmButtonText: 'OK'
                                    }).then((result) => {
                                        if (result.value) {
                                          if(FlowRouter.current().queryParams.trans){
                                            FlowRouter.go('/customerscard?id='+FlowRouter.current().queryParams.trans+'&transTab=active');
                                          }else{
                                            FlowRouter.go('/creditlist?success=true');
                                          };
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
                                return storage.includes('BasedOnType_')
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
                                reportData.attachments = attachment;
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("21")) {
                                            reportData.FormID = 21;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 21)
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
                                    FlowRouter.go('/creditlist?success=true');
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
                                            FlowRouter.go('/creditlist?success=true');
                                          };
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
                                return storage.includes('BasedOnType_')
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
                                reportData.attachments = attachment;
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("21")) {
                                            reportData.FormID = 21;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 21)
                                            Meteor.call('sendNormalEmail', reportData);
                                    }
                                }
                            });

                        } else {
                            let values = [];
                            let basedOnTypeStorages = Object.keys(localStorage);
                            basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
                                let employeeId = storage.split('_')[2];
                                return storage.includes('BasedOnType_')
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
                                reportData.attachments = attachment;
                                if (reportData.BasedOnType.includes("S")) {
                                    if (reportData.FormID == 1) {
                                        let formIds = reportData.FormIDs.split(',');
                                        if (formIds.includes("21")) {
                                            reportData.FormID = 21;
                                            Meteor.call('sendNormalEmail', reportData);
                                        }
                                    } else {
                                        if (reportData.FormID == 21)
                                            Meteor.call('sendNormalEmail', reportData);
                                    }
                                }
                            });

                          if(FlowRouter.current().queryParams.trans){
                            FlowRouter.go('/customerscard?id='+FlowRouter.current().queryParams.trans+'&transTab=active');
                          }else{
                            FlowRouter.go('/creditlist?success=true');
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


                if (supplierID !== " ") {
                    let supplierEmailData = {
                        type: "TSupplier",
                        fields: {
                            ID: supplierID,
                            Email: supplierEmail
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
                            PrefName: 'creditcard'
                        });

                        if (checkPrefDetails) {
                            CloudPreference.update({
                                _id: checkPrefDetails._id
                            }, {
                                $set: {
                                    username: clientUsername,
                                    useremail: clientEmail,
                                    PrefGroup: 'purchaseform',
                                    PrefName: 'creditcard',
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
                                PrefGroup: 'purchaseform',
                                PrefName: 'creditcard',
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
                } else {

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
        }, delayTimeAfterSound);
    },
    'click .chkAccountName': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colAccountName').addClass('showColumn');
        $('.colAccountName').removeClass('hiddenColumn');
      } else {
        $('.colAccountName').addClass('hiddenColumn');
        $('.colAccountName').removeClass('showColumn');
      }
    },
    'click .chkMemo': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colMemo').addClass('showColumn');
        $('.colMemo').removeClass('hiddenColumn');
      } else {
        $('.colMemo').addClass('hiddenColumn');
        $('.colMemo').removeClass('showColumn');
      }
    },
    'click .chkCustomerJob': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colCustomerJob').addClass('showColumn');
        $('.colCustomerJob').removeClass('hiddenColumn');
      } else {
        $('.colCustomerJob').addClass('hiddenColumn');
        $('.colCustomerJob').removeClass('showColumn');
      }
    },
    'click .chkCustomField1': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colCustomField1').addClass('showColumn');
        $('.colCustomField1').removeClass('hiddenColumn');
      } else {
        $('.colCustomField1').addClass('hiddenColumn');
        $('.colCustomField1').removeClass('showColumn');
      }
    },
    'click .chkCustomField2': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colCustomField2').addClass('showColumn');
        $('.colCustomField2').removeClass('hiddenColumn');
      } else {
        $('.colCustomField2').addClass('hiddenColumn');
        $('.colCustomField2').removeClass('showColumn');
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
    'click .chkSerialNo': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colSerialNo').addClass('showColumn');
        $('.colSerialNo').removeClass('hiddenColumn');
      } else {
        $('.colSerialNo').addClass('hiddenColumn');
        $('.colSerialNo').removeClass('showColumn');
      }
    },

    "click .chkFixedAsset": function (event) {
      if ($(event.target).is(':checked')) {
        $('.colFixedAsset').addClass('showColumn');
        $('.colFixedAsset').removeClass('hiddenColumn');
      } else {
        $('.colFixedAsset').addClass('hiddenColumn');
        $('.colFixedAsset').removeClass('showColumn');
      }
    },

    // display settings
    'change .rngRangeFixedAsset': function(event) {
      let range = $(event.target).val();
      $('.colFixedAsset').css('width', range);
    },
    'change .rngRangeSerialNo': function (event) {
      let range = $(event.target).val();
      $('.colSerialNo').css('width', range);
    },
    'change .rngRangeAccountName': function(event) {

        let range = $(event.target).val();
        $(".spWidthAccountName").html(range);
        $('.colAccountName').css('width', range);

    },
    'change .rngRangeMemo': function(event) {

        let range = $(event.target).val();
        $(".spWidthMemo").html(range);
        $('.colMemo').css('width', range);

    },
    // 'change .rngRangeAmount': function(event) {

    //     let range = $(event.target).val();
    //     $(".spWidthAmount").html(range);
    //     $('.colAmount').css('width', range);

    // },
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
    'change .rngRangeTaxRate': function(event) {

        let range = $(event.target).val();
        $(".spWidthTaxRate").html(range);
        $('.colTaxRate').css('width', range);

    },
    'change .rngRangeTaxCode': function(event) {

        let range = $(event.target).val();
        $(".spWidthTaxCode").html(range);
        $('.colTaxCode').css('width', range);

    },
    'change .rngRangeCustomField1': function(event) {

        let range = $(event.target).val();
        $(".spWidthCustomField1").html(range);
        $('.colCustomField1').css('width', range);

    },
    'change .rngRangeCustomField2': function(event) {

        let range = $(event.target).val();
        $(".spWidthCustomField2").html(range);
        $('.colCustomField2').css('width', range);

    },
    'change .rngRangeCustomerJob': function(event) {

        let range = $(event.target).val();
        $(".spWidthCustomerJob").html(range);
        $('.colCustomerJob').css('width', range);

    },
    'blur .divcolumn': function(event) {
        let columData = $(event.target).html();
        let columHeaderUpdate = $(event.target).attr("valueupdate");
        // $("" + columHeaderUpdate + "").html(columData);
        $("th.col" + columHeaderUpdate + "").html(columData);

    },
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
        let tableName = "tblCreditLine";
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
    'click .btnResetGridSettings': function(event) {
      let templateObject = Template.instance();
      let reset_data = templateObject.reset_data.get();
      let isBatchSerialNoTracking = Session.get("CloudShowSerial") || false;
      if(isBatchSerialNoTracking) {
        reset_data[7].display = true;
      } else {
        reset_data[7].display = false;
      }
      reset_data = reset_data.filter(redata => redata.display);

      $(".displaySettings").each(function (index) {
        let $tblrow = $(this);
        $tblrow.find(".divcolumn").text(reset_data[index].label);
        $tblrow
          .find(".custom-control-input")
          .prop("checked", reset_data[index].active);

        let title = $("#tblCreditLine").find("th").eq(index);
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
        $(".col" + reset_data[index].class).css('width', reset_data[index].width);
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
                    PrefName: 'creditcard'
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
        let suppliername = $('#edtSupplierName');
        let purchaseService = new PurchaseBoardService();
        let termname = $('#sltTerms').val() || '';
        if (termname === '') {
            swal('Terms has not been selected!', '', 'warning');
            event.preventDefault();
            return false;
        }
        if (suppliername.val() === '') {
            swal('Supplier has not been selected!', '', 'warning');
            e.preventDefault();
        } else {

            $('.fullScreenSpin').css('display', 'inline-block');
            var splashLineArray = new Array();
            let lineItemsForm = [];
            let lineItemObjForm = {};
            $('#tblCreditLine > tbody > tr').each(function() {
                var lineID = this.id;
                let tdaccount = $('#' + lineID + " .lineAccountName").val();
                let tddmemo = $('#' + lineID + " .lineMemo").text();
                let tdamount = $('#' + lineID + " .lineAmount").val();
                let tdtaxrate = $('#' + lineID + " .lineTaxRate").text();
                let tdtaxCode = $('#' + lineID + " .lineTaxCode").val()||loggedTaxCodePurchaseInc;

                if (tdaccount != "") {

                    lineItemObjForm = {
                        type: "TCreditLine",
                        fields: {
                            AccountName: tdaccount || '',
                            ProductDescription: tddmemo || '',


                            LineCost: Number(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
                            LineTaxCode: tdtaxCode || '',
                            LineClassName: $('#sltDept').val() || defaultDept
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

            let supplier = $('#edtSupplierName').val();
            let supplierEmail = $('#edtSupplierEmail').val();
            let billingAddress = $('#txabillingAddress').val();


            var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
            var duedateTime = new Date($("#dtDueDate").datepicker("getDate"));

            let saleDate = saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate();
            let dueDate = duedateTime.getFullYear() + "-" + (duedateTime.getMonth() + 1) + "-" + duedateTime.getDate();

            let poNumber = $('#ponumber').val();
            let reference = $('#edtRef').val();

            let departement = $('#shipvia').val();
            let shippingAddress = $('#txaShipingInfo').val();
            let comments = $('#txaComment').val();
            let pickingInfrmation = $('#txapickmemo').val();

            let saleCustField1 = $('#edtSaleCustField1').val();
            let saleCustField2 = $('#edtSaleCustField2').val();
            var url = FlowRouter.current().path;
            var getso_id = url.split('?id=');
            var currentCredit = getso_id[getso_id.length - 1];
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
                currentCredit = parseInt(currentCredit);
                objDetails = {
                    type: "TCredit",
                    fields: {
                        ID: currentCredit,
                        SupplierName: supplier,
                        // ForeignExchangeCode: currencyCode,
                        // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                        ...foreignCurrencyFields,
                        Lines: splashLineArray,
                        OrderTo: billingAddress,
                        OrderDate: saleDate,
                        Deleted: false,

                        SupplierInvoiceNumber: poNumber,
                        ConNote: reference,
                        TermsName: termname,
                        Shipping: departement,
                        ShipTo: shippingAddress,
                        Comments: comments,


                        SalesComments: pickingInfrmation,

                        OrderStatus: $('#sltStatus').val()
                    }
                };
            } else {
                objDetails = {
                    type: "TCredit",
                    fields: {
                        SupplierName: supplier,
                        // ForeignExchangeCode: currencyCode,
                        // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                        ...foreignCurrencyFields,
                        Lines: splashLineArray,
                        OrderTo: billingAddress,
                        Deleted: false,


                        SupplierInvoiceNumber: poNumber,
                        ConNote: reference,
                        TermsName: termname,
                        Shipping: departement,
                        ShipTo: shippingAddress,
                        Comments: comments,


                        SalesComments: pickingInfrmation,

                        OrderStatus: $('#sltStatus').val()
                    }
                };
            }

            purchaseService.saveCredit(objDetails).then(function(objDetails) {

                var supplierID = $('#edtSupplierEmail').attr('supplierid');
                if (supplierID !== " ") {
                    let supplierEmailData = {
                        type: "TSupplier",
                        fields: {
                            ID: supplierID,
                            Email: supplierEmail
                        }
                    }
                    purchaseService.saveSupplierEmail(supplierEmailData).then(function(supplierEmailData) {

                    });
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
                            PrefName: 'creditcard'
                        });

                        if (checkPrefDetails) {
                            CloudPreference.update({
                                _id: checkPrefDetails._id
                            }, {
                                $set: {
                                    username: clientUsername,
                                    useremail: clientEmail,
                                    PrefGroup: 'purchaseform',
                                    PrefName: 'creditcard',
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
                                    window.open('/paymentcard?soid=' + linesave, '_self');
                                } else {
                                    window.open('/paymentcard?soid=' + linesave, '_self');

                                }
                            });
                        } else {
                            CloudPreference.insert({
                                userid: clientID,
                                username: clientUsername,
                                useremail: clientEmail,
                                PrefGroup: 'purchaseform',
                                PrefName: 'creditcard',
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
                                    window.open('/paymentcard?soid=' + linesave, '_self');
                                } else {
                                    window.open('/paymentcard?soid=' + linesave, '_self');

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

                $('.fullScreenSpin').css('display', 'none');
            });
        }

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
        $('#edtSupplierEmail').val($('#edtSupplierEmail').val().replace(/\s/g, ''));
        if ($(event.target).is(':checked')) {
            let checkEmailData = $('#edtSupplierEmail').val();
            if (checkEmailData.replace(/\s/g, '') === '') {
                swal('Supplier Email cannot be blank!', '', 'warning');
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
            FxGlobalFunctions.toggleVisbilityOfValuesToConvert(true);
        } else {
            $(".foreign-currency-js").css("display", "none");
            ui.isForeignEnabled.set(false);
            FxGlobalFunctions.toggleVisbilityOfValuesToConvert(false);
        }
    },

    'change .exchange-rate-js, change #tblCreditLine tbody input': (e, ui) => {
     FxGlobalFunctions.convertToForeignEveryFieldsInTableId("#tblCreditLine");



        // setTimeout(() => {
        //     const toConvert = document.querySelectorAll('.convert-to-foreign:not(.hiddenColumn)');
        //     const rate = $("#exchange_rate").val();

        //     toConvert.forEach((element) => {
        //         const mainClass = element.classList[0];
        //         const mainValueElement = document.querySelector(`#tblCreditLine tbody td.${mainClass}:not(.convert-to-foreign):not(.hiddenColumn)`);

        //         let value = mainValueElement.childElementCount > 0 ?
        //             $(mainValueElement).find('input').val() :
        //             mainValueElement.innerText;

        //         $(element).attr("value", convertToForeignAmount(value, rate, false));
        //         value = convertToForeignAmount(value, rate, getCurrentCurrencySymbol());
        //         $(element).text(value);

        //     })
        // }, 500);

    },


});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});

function updateTotal(ui) {


    // const isForeignEnabled = ui.isForeignEnabled.get();

    // if(isForeignEnabled) {
    //     setTimeout(() => {
    //          /**
    //          * Step 1: Update all lines with their foreign value if there is foreign enabled
    //          */
    //         const toConvert = document.querySelectorAll('.convert-to-foreign:not(.hiddenColumn)');
    //         const rate = $("#exchange_rate").val();

    //         // toConvert.forEach((element) => {
    //         //     const mainClass = element.classList[0];
    //         //     const mainValueElement = document.querySelector(`#tblCreditLine tbody td.${mainClass}:not(.convert-to-foreign):not(.hiddenColumn)`);

    //         //     let value = mainValueElement.childElementCount > 0 ?
    //         //         $(mainValueElement).find('input').val() :
    //         //         mainValueElement.innerText;

    //         //     $(element).attr("value", convertToForeignAmount(value, rate, false));
    //         //     value = convertToForeignAmount(value, rate, getCurrentCurrencySymbol());
    //         //     $(element).text(value);

    //         // });

    //         const calculateCollumn = (selector) => {
    //             let total = 0.0;
    //             $(selector).each((index, el) => {
    //                 total += parseFloat($(el).attr('value')) || 0;
    //             });

    //             return total;
    //         }

    //         function calculateTotal() {
    //             // const amountExs = $('.colAmountEx.convert-to-foreign');
    //             // let total = 0.0;

    //             // $(amountExs).each((index, el) => {
    //             //     total += parseFloat($(el).attr('value')) || 0;
    //             // });

    //             return calculateCollumn($('.colAmountEx.convert-to-foreign'));
    //         }

    //         const total = calculateTotal();
    //         $('#grandTotal').attr('value', total);
    //         $('#grandTotal').text(getCurrentCurrencySymbol() + " " +total);



    //         function calculateSubTotal() {
    //             // let amounts = $('.lineTaxAmount.convert-to-foreign');
    //             // let total = 0.0;

    //             // $(amountExs).each((index, el) => {
    //             //     total += parseFloat($(el).attr('value')) || 0;
    //             // });

    //             //return total;
    //             return calculateCollumn($('.lineTaxAmount.convert-to-foreign'));

    //         }

    //         const subTotal = calculateSubTotal();
    //         $('#subtotal_total').attr('value', subTotal);
    //         $('#subtotal_total').text(getCurrentCurrencySymbol() + " " + subTotal);



    //     }, 500);

    // }




}
