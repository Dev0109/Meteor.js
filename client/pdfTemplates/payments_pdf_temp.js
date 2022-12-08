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

Template.paymentsPrintTemp.onCreated(()=>{
    const templateObject = Template.instance();
    templateObject.paymentsrecords = new ReactiveVar([]);
})

Template.paymentsPrintTemp.onRendered(()=>{
    const templateObject = Template.instance();
    const utilityService = new UtilityService();
    templateObject.getPaymentsRecords = () =>{
            let paymentsRecords = [];
                getVS1Data('TCustomerPayment').then(function(dataObject) {
                    if (dataObject.length > 0)  {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tcustomerpayment;
                        for (let d = 0; d < useData.length; d++) {
                                let lineItems = [];
                                let lineItemObj = {};
                                let total = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Amount).toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                let appliedAmt = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Applied).toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                if (useData[d].fields.Lines && useData[d].fields.Lines !=null && useData[d].fields.Lines.length) {
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
                                }
                                //  else {
                                //     let amountDue = Currency + '' + useData[d].fields.Lines.fields.AmountDue.toLocaleString(undefined, {
                                //         minimumFractionDigits: 2
                                //     });
                                //     let paymentAmt = Currency + '' + useData[d].fields.Lines.fields.Payment.toLocaleString(undefined, {
                                //         minimumFractionDigits: 2
                                //     });
                                //     let outstandingAmt = Currency + '' + useData[d].fields.Lines.fields.AmountOutstanding.toLocaleString(undefined, {
                                //         minimumFractionDigits: 2
                                //     });
                                //     let originalAmt = Currency + '' + useData[d].fields.Lines.fields.OriginalAmount.toLocaleString(undefined, {
                                //         minimumFractionDigits: 2
                                //     });
                                //     lineItemObj = {
                                //         id: useData[d].fields.Lines.fields.ID || '',
                                //         invoiceid: useData[d].fields.Lines.fields.InvoiceId || '',
                                //         transid: useData[d].fields.Lines.fields.InvoiceNo || '',
                                //         invoicedate: useData[d].fields.Lines.fields.Date != '' ? moment(useData[d].fields.Lines.fields.Date).format("DD/MM/YYYY") : useData[d].fields.Lines.fields.Date,
                                //         refno: useData[d].fields.Lines.fields.RefNo || '',
                                //         transtype: useData[d].fields.Lines.fields.TrnType || '',
                                //         amountdue: amountDue || 0,
                                //         paymentamount: paymentAmt || 0,
                                //         ouststandingamount: outstandingAmt,
                                //         orginalamount: originalAmt
                                //     };
                                //     lineItems.push(lineItemObj);
                                // }

                                let record = {
                                    lid: useData[d].fields.ID || '',
                                    customerName: useData[d].fields.CompanyName || '',
                                    paymentDate: useData[d].fields.PaymentDate ? moment(useData[d].fields.PaymentDate).format('DD/MM/YYYY') : "",
                                    reference: useData[d].fields.ReferenceNo || ' ',
                                    bankAccount: useData[d].fields.AccountName || '',
                                    paymentAmount: appliedAmt || 0,
                                    notes: useData[d].fields.Notes,
                                    deleted: useData[d].fields.Deleted,
                                    LineItems: lineItems,
                                    checkpayment: useData[d].fields.PaymentMethodName,
                                    department: useData[d].fields.DeptClassName,
                                    applied: appliedAmt.toLocaleString(undefined, {
                                        minimumFractionDigits: 2
                                    })

                                };

                                paymentsRecords.push(record);
                                templateObject.paymentsrecords.set(paymentsRecords);

                                //setTimeout(function () {
                                Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblPaymentcard', function(error, result) {
                                    if (error) {
                                        //Bert.alert('<strong>Error:</strong> user-not-found, no user found please try again!', 'danger');
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
                                //}, 500);
                        }

                    }
                })



    }

    templateObject.getPaymentsRecords();
})

Template.paymentsPrintTemp.helpers({
    paymentsrecords:()=>{
        return Template.instance().paymentsrecords.get()
    },
    companyphone: () => {
        return "Phone: "+Session.get('vs1companyPhone');
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

    companyabn: () => {
        return Session.get('vs1companyABN');
    },
    organizationname: () => {
        return Session.get('vs1companyName');
    },
    organizationurl: () => {
        return Session.get('vs1companyURL');
    }
})
