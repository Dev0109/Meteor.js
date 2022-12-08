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


Template.purchaseOrderPrintTemp.onCreated(()=>{
    const templateObject = Template.instance();
    templateObject.purchaseorderrecords = new ReactiveVar([]);
})

Template.purchaseOrderPrintTemp.onRendered(()=>{
    const templateObject = Template.instance();
    const utilityService = new UtilityService();
    let purchaseOrderData = [];
    templateObject.getPurchaseOrderData = function() {
        getVS1Data('TPurchaseOrderEx').then(function(dataObject) {
            if (dataObject.length > 0) {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tpurchaseorderex;
                var added = false;
                for (let d = 0; d < useData.length; d++) {
                        let lineItems = [];
                        let lineItemObj = {};
                        let lineItemsTable = [];
                        let lineItemTableObj = {};
                        let exchangeCode = useData[d].fields.ForeignExchangeCode;
                        let currencySymbol = Currency;
                        let total = utilityService.modifynegativeCurrencyFormat(useData[d].fields.TotalAmount) || 0;
                        let totalInc = utilityService.modifynegativeCurrencyFormat(useData[d].fields.TotalAmountInc);
                        let subTotal = utilityService.modifynegativeCurrencyFormat(useData[d].fields.TotalAmount);
                        let totalTax = utilityService.modifynegativeCurrencyFormat(useData[d].fields.TotalTax);
                        let totalBalance = utilityService.modifynegativeCurrencyFormat(useData[d].fields.TotalBalance);
                        let totalPaidAmount = utilityService.modifynegativeCurrencyFormat(useData[d].fields.TotalPaid);
                        if (useData[d].fields.Lines.length) {
                            for (let i = 0; i < useData[d].fields.Lines.length; i++) {
                                let AmountGbp = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.TotalLineAmount);
                                let currencyAmountGbp = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.TotalLineAmount);
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
                                    customerJob: useData[d].fields.Lines[i].fields.CustomerJob || '',
                                    curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                                    TaxTotal: TaxTotalGbp || 0,
                                    TaxRate: TaxRateGbp || 0,
                                    pqaseriallotdata: useData[d].fields.Lines[i].fields.PQA || '',
                                };

                                // lineItemsTable.push(dataListTable);
                                lineItems.push(lineItemObj);
                            }
                        } else {
                            let AmountGbp = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines.fields.TotalLineAmountInc);
                            let currencyAmountGbp = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines.fields.TotalLineAmount);
                            let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines.fields.LineTaxTotal);
                            let TaxRateGbp = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines.fields.LineTaxRate);
                            lineItemObj = {
                                lineID: Random.id(),
                                id: useData[d].fields.Lines.fields.ID || '',
                                description: useData[d].fields.Lines.fields.ProductDescription || '',
                                quantity: useData[d].fields.Lines.fields.UOMOrderQty || 0,
                                unitPrice: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineCost).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                unitPriceInc: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineCostInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                TotalAmt: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                TotalAmtInc: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                lineCost: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineCost) || 0,
                                taxRate: (useData[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                                taxCode: useData[d].fields.Lines[i].fields.LineTaxCode || '',
                                //TotalAmt: AmountGbp || 0,
                                customerJob: useData[d].fields.Lines[i].fields.CustomerJob || '',
                                curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                                TaxTotal: TaxTotalGbp || 0,
                                TaxRate: TaxRateGbp || 0
                            };
                            lineItems.push(lineItemObj);
                        }

                        let lidData = 'Edit Purchase Order' + ' ' + useData[d].fields.ID||'';
                        if(useData[d].fields.IsBackOrder){
                           lidData = 'Edit Purchase Order' + ' (BO) ' + useData[d].fields.ID||'';
                        }

                        let isPartialPaid = false;
                        if(useData[d].fields.TotalPaid > 0){
                            isPartialPaid = true;
                        }

                        let purchaseorderrecord = {
                            id: useData[d].fields.ID,
                            lid: lidData,
                            sosupplier: useData[d].fields.SupplierName,
                            purchaseOrderto: useData[d].fields.OrderTo,
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
                            reference: useData[d].fields.SaleLineRef,
                            currency: useData[d].fields.ForeignExchangeCode,
                            branding: useData[d].fields.MedType,
                            invoiceToDesc: useData[d].fields.OrderTo,
                            shipToDesc: useData[d].fields.ShipTo,
                            termsName: useData[d].fields.TermsName,
                            Total: totalInc,
                            LineItems: lineItems,
                            TotalTax: totalTax,
                            SubTotal: subTotal,
                            balanceDue: totalBalance || 0,
                            saleCustField1: useData[d].fields.SaleLineRef,
                            saleCustField2: useData[d].fields.SalesComments,
                            totalPaid: totalPaidAmount,
                            ispaid: useData[d].fields.IsPaid,
                            isPartialPaid: isPartialPaid,
                            department: useData[d].fields.Lines[0].fields.LineClassName || defaultDept,
                            unformattedSaleDate: useData[d].fields.OrderDate?useData[d].fields.OrderDate: '',
                            unformattedDueDate: useData[d].fields.DueDate?useData[d].fields.DueDate:''
                        };
                        purchaseOrderData.push(purchaseorderrecord);
                        templateObject.purchaseorderrecords.set(purchaseOrderData);
                        if (purchaseorderrecord) {
                            Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblPurchaseOrderLine', function(error, result) {
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
    };

    templateObject.getPurchaseOrderData();
})

Template.purchaseOrderPrintTemp.helpers({
    purchaseorderrecords: ()=>{
        return Template.instance().purchaseorderrecords.get();
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
        return "Phone: "+Session.get('vs1companyPhone');
    },
    companyabn: () => { //Update Company ABN
        let countryABNValue = "ABN: " + Session.get('vs1companyABN');
        if (LoggedCountry == "South Africa") {
            countryABNValue = "Vat No: " + Session.get('vs1companyABN');;
        }

        return countryABNValue;
    },
    companyReg: () => { //Add Company Reg
        let countryRegValue = '';
        if (LoggedCountry == "South Africa") {
            countryRegValue = "Reg No: " + Session.get('vs1companyReg');
        }

        return countryRegValue;
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
    organizationname: () => {
        return Session.get('vs1companyName');
    },
    organizationurl: () => {
        return Session.get('vs1companyURL');
    },
})