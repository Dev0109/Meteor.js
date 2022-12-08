import { SalesBoardService } from '../js/sales-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { EmployeeProfileService } from "../js/profile-service";
import { AccountService } from "../accounts/account-service";
import { InvoiceService } from "../invoice/invoice-service";
import { UtilityService } from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';

Template.invoicePrintTemp.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.invoicerecords = new ReactiveVar([]);
})

Template.invoicePrintTemp.onRendered(function () {
    let templateObject = Template.instance();
    let utilityService = new UtilityService();
    let sideBarService = new SideBarService();
    templateObject.getAllInvoiceData = function () {
            getVS1Data('TInvoiceEx').then(function (dataObject) {
                let invoicesTemp = [];
                if (dataObject.length != 0) {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.tinvoiceex;
                    for (let d = 0; d < useData.length; d++) {
                        let lineItems = [];
                        let lineItemObj = {};
                        let lineItemsTable = [];
                        let currencySymbol = Currency;
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

                        if (useData[d].fields.Lines&& useData[d].fields.Lines !=null &&useData[d].fields.Lines.length) {
                            for (let i = 0; i < useData[d].fields.Lines.length; i++) {
                                let AmountGbp = currencySymbol + '' + useData[d].fields.Lines[i].fields.TotalLineAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineTaxTotal);
                                lineItemObj = {
                                    item: useData[d].fields.Lines[i].fields.ProductName || '',
                                    description: useData[d].fields.Lines[i].fields.ProductDescription || '',
                                    quantity: useData[d].fields.Lines[i].fields.UOMOrderQty || 0,
                                    unitPrice: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                    TotalAmt: utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
                                    taxCode: useData[d].fields.Lines[i].fields.LineTaxCode || '',
                                    TaxTotal: TaxTotalGbp || 0,
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
                        }

                        let isPartialPaid = false;
                        if (useData[d].fields.TotalPaid > 0) {
                            isPartialPaid = true;
                        }
                        
                        let invoicerecord = {
                            id: useData[d].fields.ID,
                            custPONumber: useData[d].fields.CustPONumber,
                            saledate: useData[d].fields.SaleDate ? moment(useData[d].fields.SaleDate).format('DD/MM/YYYY') : "",
                            duedate: useData[d].fields.DueDate ? moment(useData[d].fields.DueDate).format('DD/MM/YYYY') : "",
                            comments: useData[d].fields.Comments,
                            termsName: useData[d].fields.TermsName,
                            Total: totalInc,
                            TotalDiscount: totalDiscount,
                            LineItems: lineItems,
                            TotalTax: totalTax,
                            SubTotal: subTotal,
                            balanceDue: totalBalance,
                            totalPaid: totalPaidAmount,
                        };
                        if (invoicerecord) {
                            invoicesTemp.push(invoicerecord);
                            templateObject.invoicerecords.set(invoicesTemp);
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
            });

    }

    templateObject.getAllInvoiceData();

})

Template.invoicePrintTemp.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.saledate == 'NA') {
                return 1;
            }
            else if (b.saledate == 'NA') {
                return -1;
            }
            return (a.saledate.toUpperCase() > b.saledate.toUpperCase()) ? 1 : -1;
            // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
        });
    },

    invoicerecords: ()=>{
        return Template.instance().invoicerecords.get();
    }
})
