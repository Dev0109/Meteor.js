import { SalesBoardService } from '../js/sales-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { EmployeeProfileService } from "../js/profile-service";
import { AccountService } from "../accounts/account-service";
import { InvoiceService } from "../invoice/invoice-service";
import { UtilityService } from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import {Random} from 'meteor/random';
import '../lib/global/indexdbstorage.js';


Template.billPrintTemp.onCreated(()=>{
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.billrecords = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar(0);
    templateObject.uploadedFiles = new ReactiveVar([]);
})

Template.billPrintTemp.onRendered(()=>{
    let templateObject = Template.instance();
    let utilityService = new UtilityService();
    let sideBarService = new SideBarService();

    templateObject.getAllBillData = () =>{
        getVS1Data('TBillEx').then(function(dataObject) {
            if (dataObject.length != 0) {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tbillex;
                let billData = [];
                var added = false;
                for (let d = 0; d < useData.length; d++) {
                        $('.fullScreenSpin').css('display', 'none');
                        let lineItems = [];
                        let lineItemObj = {};
                        let lineItemsTable = [];
                        let lineItemTableObj = {};
                        let exchangeCode = useData[d].fields.ForeignExchangeCode;
                        let currencySymbol = Currency;
                        let total = currencySymbol + '' + useData[d].fields.TotalAmount.toFixed(2);
                        let totalInc = currencySymbol + '' + useData[d].fields.TotalAmountInc.toFixed(2);
                        let subTotal = currencySymbol + '' + useData[d].fields.TotalAmount.toFixed(2);
                        let totalTax = currencySymbol + '' + useData[d].fields.TotalTax.toFixed(2);
                        let totalBalance = currencySymbol + '' + useData[d].fields.TotalBalance.toFixed(2);
                        let totalPaidAmount = currencySymbol + '' + useData[d].fields.TotalPaid.toFixed(2);
                        if (useData[d].fields.Lines.length) {
                            for (let i = 0; i < useData[d].fields.Lines.length; i++) {
                                let AmountGbp = currencySymbol + '' + useData[d].fields.Lines[i].fields.TotalLineAmount.toFixed(2);
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
                                    unitPrice: currencySymbol + '' + useData[d].fields.Lines[i].fields.LineCost.toFixed(2) || 0,
                                    unitPriceInc: currencySymbol + '' + useData[d].fields.Lines[i].fields.LineCostInc.toFixed(2) || 0,
                                    lineCost: currencySymbol + '' + useData[d].fields.Lines[i].fields.LineCost.toFixed(2) || 0,
                                    taxRate: (useData[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                                    taxCode: useData[d].fields.Lines[i].fields.LineTaxCode || '',
                                    TotalAmt: AmountGbp || 0,
                                    customerJob: useData[d].fields.Lines[i].fields.CustomerJob || '',
                                    curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                                    TaxTotal: TaxTotalGbp || 0,
                                    TaxRate: TaxRateGbp || 0,

                                };

                                // lineItemsTable.push(dataListTable);
                                lineItems.push(lineItemObj);
                            }
                        } else {
                            let AmountGbp = useData[d].fields.Lines.fields.TotalLineAmountInc.toFixed(2);
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
                                unitPrice: useData[d].fields.Lines[i].fields.LineCost.toFixed(2) || 0,
                                unitPriceInc: useData[d].fields.Lines[i].fields.LineCostInc.toFixed(2) || 0,
                                lineCost: useData[d].fields.Lines[i].fields.LineCost.toFixed(2) || 0,
                                taxRate: (useData[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                                taxCode: useData[d].fields.Lines[i].fields.LineTaxCode || '',
                                TotalAmt: AmountGbp || 0,
                                customerJob: data.fields.Lines[i].fields.CustomerJob || '',
                                curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                                TaxTotal: TaxTotalGbp || 0,
                                TaxRate: TaxRateGbp || 0
                            };
                            lineItems.push(lineItemObj);
                        }

                        let isPartialPaid = false;
                        if(useData[d].fields.TotalPaid > 0){
                            isPartialPaid = true;
                        }

                        let billrecord = {
                            id: useData[d].fields.ID,
                            lid: 'Edit Bill' + ' ' + useData[d].fields.ID,
                            sosupplier: useData[d].fields.SupplierName,
                            billto: useData[d].fields.OrderTo,
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
                            isPartialPaid: isPartialPaid,
                            department: useData[d].fields.Lines[0].fields.LineClassName || defaultDept,
                            unformattedSaleDate: useData[d].fields.OrderDate?useData[d].fields.OrderDate:'',
                            unformattedDueDate: useData[d].fields.DueDate?useData[d].fields.DueDate:''
                        };

                        // templateObject.CleintName.set(useData[d].fields.SupplierName);
                        // templateObject.attachmentCount.set(0);
                        if (useData[d].fields.Attachments) {
                            if (useData[d].fields.Attachments.length) {
                                templateObject.attachmentCount.set(useData[d].fields.Attachments.length);
                                templateObject.uploadedFiles.set(useData[d].fields.Attachments);
                            }
                        }
                        setTimeout(function() {
                            if (useData[d].fields.IsPaid === true) {
                                    $('#edtSupplierName').attr('readonly', true);
                                    $('#btnViewPayment').removeAttr('disabled', 'disabled');
                                    $('#addRow').attr('disabled', 'disabled');
                                    $('#edtSupplierName').css('background-color', '#eaecf4');
                                    $('.btnSave').attr('disabled', 'disabled');
                                    $('#btnBack').removeAttr('disabled', 'disabled');
                                    $('.printConfirm').removeAttr('disabled', 'disabled');
                                    $('.tblBillLine tbody tr').each(function () {
                                        var $tblrow = $(this);
                                        $tblrow.find("td").attr('contenteditable', false);
                                        //$tblrow.find("td").removeClass("lineProductName");
                                        $tblrow.find("td").removeClass("lineTaxAmount");
                                        $tblrow.find("td").removeClass("lineTaxCode");

                                        $tblrow.find("td").attr('readonly', true);
                                        $tblrow.find("td").attr('disabled', 'disabled');
                                        $tblrow.find("td").css('background-color', '#eaecf4');
                                        $tblrow.find("td .table-remove").removeClass("btnRemove");
                                    });
                                }

                        }, 100);

                        // templateObject.selectedCurrency.set(billrecord.currency);
                        // templateObject.inputSelectedCurrency.set(billrecord.currency);
                        if (billrecord) {
                            billData.push(billrecord);
                            templateObject.billrecords.set(billData);
                            Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblBillLine', function(error, result) {
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
        })
    }

    templateObject.getAllBillData();
})

Template.billPrintTemp.helpers({
    billrecords: () =>{
        return  Template.instance().billrecords.get()
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
        return "Phone: "+ Session.get('vs1companyPhone');
    },
   companyabn: () => { //Update Company ABN
        let countryABNValue = "ABN: " + Session.get('vs1companyABN');
        if(LoggedCountry== "South Africa"){
            countryABNValue = "Vat No: " + Session.get('vs1companyABN');;
        }

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
})
