import { SalesBoardService } from '../js/sales-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { EmployeeProfileService } from "../js/profile-service";
import { AccountService } from "../accounts/account-service";
import { InvoiceService } from "../invoice/invoice-service";
import { UtilityService } from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import { Random } from 'meteor/random';
import '../lib/global/indexdbstorage.js';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.chequePrintTemp.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.chequerecords = new ReactiveVar([]);
})

Template.chequePrintTemp.onRendered(() => {
    const templateObject = Template.instance();
    templateObject.getChequeData = function () {
        let recordsTemp = [];
        getVS1Data("TCheque")
            .then(function (dataObject) {
                if (dataObject.length > 0) {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.tchequeex;
                    var added = false;
                    for (let d = 0; d < useData.length; d++) {
                            let lineItems = [];
                            let lineItemObj = {};
                            let lineItemsTable = [];
                            let lineItemTableObj = {};
                            let exchangeCode = useData[d].fields.ForeignExchangeCode;
                            let currencySymbol = Currency;
                            let total = utilityService
                                .modifynegativeCurrencyFormat(useData[d].fields.TotalAmount)
                                .toLocaleString(undefined, { minimumFractionDigits: 2 });
                            let totalInc = utilityService
                                .modifynegativeCurrencyFormat(
                                    useData[d].fields.TotalAmountInc
                                )
                                .toLocaleString(undefined, { minimumFractionDigits: 2 });
                            let subTotal = utilityService
                                .modifynegativeCurrencyFormat(useData[d].fields.TotalAmount)
                                .toLocaleString(undefined, { minimumFractionDigits: 2 });
                            let totalTax = utilityService
                                .modifynegativeCurrencyFormat(useData[d].fields.TotalTax)
                                .toLocaleString(undefined, { minimumFractionDigits: 2 });
                            let totalBalance = utilityService
                                .modifynegativeCurrencyFormat(
                                    useData[d].fields.TotalBalance
                                )
                                .toLocaleString(undefined, { minimumFractionDigits: 2 });
                            let totalPaidAmount = utilityService
                                .modifynegativeCurrencyFormat(useData[d].fields.TotalPaid)
                                .toLocaleString(undefined, { minimumFractionDigits: 2 });
                            if (useData[d].fields.Lines) {
                                if (useData[d].fields.Lines.length) {
                                    for (let i = 0; i < useData[d].fields.Lines.length; i++) {
                                        let AmountGbp = utilityService
                                            .modifynegativeCurrencyFormat(
                                                useData[d].fields.Lines[i].fields.TotalLineAmount
                                            )
                                            .toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            });
                                        let currencyAmountGbp =
                                            currencySymbol +
                                            "" +
                                            useData[d].fields.Lines[
                                                i
                                            ].fields.TotalLineAmount.toFixed(2);
                                        let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineTaxTotal);
                                        let TaxRateGbp = (
                                            useData[d].fields.Lines[i].fields.LineTaxRate * 100
                                        ).toFixed(2);
                                        lineItemObj = {
                                            lineID: Random.id(),
                                            id: useData[d].fields.Lines[i].fields.ID || "",
                                            accountname:
                                                useData[d].fields.Lines[i].fields.AccountName || "",
                                            memo:
                                                useData[d].fields.Lines[i].fields.ProductDescription || "",
                                            item:
                                                useData[d].fields.Lines[i].fields.ProductName || "",
                                            description:
                                                useData[d].fields.Lines[i].fields.ProductDescription || "",
                                            quantity:
                                                useData[d].fields.Lines[i].fields.UOMOrderQty || 0,
                                            unitPrice: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineCost).toLocaleString(undefined, { minimumFractionDigits: 2, }) || 0,
                                            unitPriceInc: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineCostInc).toLocaleString(undefined, { minimumFractionDigits: 2, }) || 0,
                                            lineCost: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineCost).toLocaleString(undefined, { minimumFractionDigits: 2, }) || 0,
                                            taxRate: (useData[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                                            taxCode: useData[d].fields.Lines[i].fields.LineTaxCode || "",
                                            TotalAmt: AmountGbp || 0,
                                            curTotalAmt: currencyAmountGbp || currencySymbol + "0",
                                            TaxTotal: TaxTotalGbp || 0,
                                            TaxRate: TaxRateGbp || 0,
                                        };

                                        // lineItemsTable.push(dataListTable);
                                        lineItems.push(lineItemObj);
                                    }
                                } else {

                                    let AmountGbp = useData[d].fields.Lines.fields.TotalLineAmountInc.toLocaleString(undefined, { minimumFractionDigits: 2 });
                                    let currencyAmountGbp = currencySymbol + "" + useData[d].fields.Lines.fields.TotalLineAmount.toFixed(2);
                                    let TaxTotalGbp = currencySymbol + "" + useData[d].fields.Lines.fields.LineTaxTotal;
                                    let TaxRateGbp = currencySymbol + "" + useData[d].fields.Lines.fields.LineTaxRate;
                                    lineItemObj = {
                                        lineID: Random.id(),
                                        id: useData[d].fields.Lines.fields.ID || "",
                                        accountname:
                                            useData[d].fields.Lines.fields.AccountName || "",
                                        memo:
                                            useData[d].fields.Lines.fields.ProductDescription || "",
                                        description:
                                            useData[d].fields.Lines.fields.ProductDescription || "",
                                        quantity:
                                            useData[d].fields.Lines.fields.UOMOrderQty || 0,
                                        unitPrice:
                                            useData[d].fields.Lines[i].fields.LineCost.toLocaleString(undefined, {minimumFractionDigits: 2,}) || 0,
                                        unitPriceInc:
                                            useData[d].fields.Lines[i].fields.LineCostInc.toFixed(2) || 0,
                                        lineCost:
                                            useData[d].fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            }) || 0,
                                        taxRate:
                                            (useData[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                                        taxCode:
                                            useData[d].fields.Lines[i].fields.LineTaxCode || "",
                                        TotalAmt: AmountGbp || 0,
                                        curTotalAmt: currencyAmountGbp || currencySymbol + "0",
                                        TaxTotal: TaxTotalGbp || 0,
                                        TaxRate: TaxRateGbp || 0,
                                    };
                                    lineItems.push(lineItemObj);
                                }
                            } else {
                                lineItemObj = {
                                    lineID: Random.id(),
                                    item: "",
                                    accountname: "",
                                    memo: "",
                                    description: "",
                                    quantity: "",
                                    unitPrice: 0,
                                    unitPriceInc: 0,
                                    taxRate: 0,
                                    taxCode: "",
                                    TotalAmt: 0,
                                    curTotalAmt: 0,
                                    TaxTotal: 0,
                                    TaxRate: 0,
                                };

                                lineItems.push(lineItemObj);
                            }

                            let chequerecord = {
                                id: useData[d].fields.ID,
                                lid: "Edit " + chequeSpelling + " " + useData[d].fields.ID,
                                bankaccount: useData[d].fields.GLAccountName,
                                sosupplier: useData[d].fields.SupplierName,
                                billto: useData[d].fields.OrderTo,
                                shipto: useData[d].fields.ShipTo,
                                shipping: useData[d].fields.Shipping,
                                docnumber: useData[d].fields.DocNumber,
                                custPONumber: useData[d].fields.CustPONumber,
                                saledate: useData[d].fields.OrderDate
                                    ? moment(useData[d].fields.OrderDate).format("DD/MM/YYYY")
                                    : "",
                                duedate: useData[d].fields.DueDate
                                    ? moment(useData[d].fields.DueDate).format("DD/MM/YYYY")
                                    : "",
                                employeename: useData[d].fields.EmployeeName,
                                status: useData[d].fields.OrderStatus,
                                invoicenumber: useData[d].fields.SupplierInvoiceNumber,
                                comments: useData[d].fields.Comments,
                                pickmemo: useData[d].fields.SalesComments,
                                ponumber: useData[d].fields.CustPONumber,
                                via: useData[d].fields.Shipping,
                                connote: useData[d].fields.ConNote,
                                reference: useData[d].fields.RefNo,
                                currency: useData[d].fields.ForeignExchangeCode,
                                branding: useData[d].fields.MedType,
                                invoiceToDesc: useData[d].fields.OrderTo,
                                shipToDesc: useData[d].fields.ShipTo,
                                termsName: useData[d].fields.TermsName,
                                Total: totalInc,
                                LineItems: lineItems,
                                isReconciled: useData[d].fields.Isreconciled,
                                TotalTax: totalTax,
                                SubTotal: subTotal,
                                balanceDue: totalBalance,
                                saleCustField1: useData[d].fields.SaleLineRef,
                                saleCustField2: useData[d].fields.SalesComments,
                                totalPaid: totalPaidAmount,
                                ispaid: useData[d].fields.IsPaid,
                                unformattedSaleDate: useData[d].fields.OrderDate?useData[d].fields.OrderDate:'',
                                unformattedDueDate: useData[d].fields.DueDate?useData[d].fields.DueDate:''
                            };

                            recordsTemp.push(chequerecord)
                            templateObject.chequerecords.set(recordsTemp);

                            if (chequerecord) {
                                Meteor.call(
                                    "readPrefMethod",
                                    Session.get("mycloudLogonID"),
                                    "tblChequeLine",
                                    function (error, result) {
                                        if (error) {
                                        } else {
                                            if (result) {
                                                for (
                                                    let i = 0;
                                                    i < result.customFields.length;
                                                    i++
                                                ) {
                                                    let customcolumn = result.customFields;
                                                    let columData = customcolumn[i].label;
                                                    let columHeaderUpdate = customcolumn[i].thclass;
                                                    let hiddenColumn = customcolumn[i].hidden;
                                                    let columnClass = columHeaderUpdate.substring(
                                                        columHeaderUpdate.indexOf(".") + 1
                                                    );
                                                    let columnWidth = customcolumn[i].width;

                                                    $("" + columHeaderUpdate + "").html(columData);
                                                    if (columnWidth != 0) {
                                                        $("" + columHeaderUpdate + "").css(
                                                            "width",
                                                            columnWidth
                                                        );
                                                    }

                                                    if (hiddenColumn == true) {
                                                        $("." + columnClass + "").addClass(
                                                            "hiddenColumn"
                                                        );
                                                        $("." + columnClass + "").removeClass(
                                                            "showColumn"
                                                        );
                                                    } else if (hiddenColumn == false) {
                                                        $("." + columnClass + "").removeClass(
                                                            "hiddenColumn"
                                                        );
                                                        $("." + columnClass + "").addClass(
                                                            "showColumn"
                                                        );
                                                    }
                                                }
                                            }
                                        }
                                    }
                                );
                            }
                    }
                }
            })
    };

    templateObject.getChequeData();
})

Template.chequePrintTemp.helpers({
    chequerecords: () => {
        return Template.instance().chequerecords.get();
    },
    companyaddress1: () => {
        return Session.get("vs1companyaddress1");
    },
    companyaddress2: () => {
        return Session.get("vs1companyaddress2");
    },
    city: () => {
        return Session.get("vs1companyCity");
    },
    state: () => {
        return Session.get("companyState");
    },
    poBox: () => {
        return Session.get("vs1companyPOBox");
    },
    companyphone: () => {
        return Session.get("vs1companyPhone");
    },
    companyabn: () => {
        //Update Company ABN
        let countryABNValue = "ABN: " + Session.get("vs1companyABN");
        if (LoggedCountry == "South Africa") {
            countryABNValue = "Vat No: " + Session.get("vs1companyABN");
        }

        return countryABNValue;
    },
    companyReg: () => {
        //Add Company Reg
        let countryRegValue = "";
        if (LoggedCountry == "South Africa") {
            countryRegValue = "Reg No: " + Session.get("vs1companyReg");
        }

        return countryRegValue;
    },
    organizationname: () => {
        return Session.get("vs1companyName");
    },
    organizationurl: () => {
        return Session.get("vs1companyURL");
    },

})