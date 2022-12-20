import moment from "moment";
import { BaseService } from "../js/base-service.js";

export class ReportService extends BaseService {
    getCardDataReport(dateAsOf) {
        let options = '';
        options = {
            SelDate: '"' + dateAsOf + '"',
        };

        return this.getList(this.ERPObjects.TCardDataReport, options);
    }

    getCashReceivedData(dateFrom, dateTo) {
        let options = {
            IgnoreDates: false,
            OrderBy: "PaymentID desc",
            Search: "Deleted != true",
            DateFrom: '"' + dateFrom + '"',
            DateTo: '"' + dateTo + '"',
        };
        return this.getList(this.ERPObjects.TCustomerPaymentList, options);
    }
    getCashSpentData(dateFrom, dateTo) {
        let options = {
            IgnoreDates: false,
            OrderBy: "PaymentID desc",
            Search: 'Deleted != true',
            DateFrom: '"' + dateFrom + '"',
            DateTo: '"' + dateTo + '"',
        };
        return this.getList(this.ERPObjects.TSupplierPaymentList, options);
    }

    getBalanceSheetReportOld(dateAsOf) {
        let options = {
            //select: "[Active]=true",
            //ListType:"Detail",
            DateFrom: '"' + dateAsOf + '"',
            DateTo: '"' + moment().format('YYYY-MM-DD') + '"',
        };
        return this.getList(this.ERPObjects.BalanceSheetReport, options);
    }

    getBalanceSheetReport(dateAsOf) {
        let options = {
            //select: "[Active]=true",
            //ListType:"Detail",
            DateTo: '"' + dateAsOf + '"',
        };
        return this.getList(this.ERPObjects.BalanceSheetReport, options);
    }

    getInvoicePaidReport(dateFrom, dateTo) {
        let options = {
            IgnoreDates: false,
            OrderBy: "PaymentID desc",
            Search: "Deleted != true",
            DateFrom: '"' + dateFrom + '"',
            DateTo: '"' + dateTo + '"',
        };
        return this.getList(this.ERPObjects.TCustomerPaymentList, options);
    }
    getInvoiceUnpaidReport(dateFrom, dateTo) {
        let options = {
            IgnoreDates: false,
            IncludeIsInvoice: true,
            IncludeIsQuote: false,
            IncludeIsRefund: true,
            IncludeISSalesOrder: false,
            IsDetailReport: false,
            Paid: false,
            Unpaid: true,
            Search: "Balance != 0",
            OrderBy: "SaleID desc",
            DateFrom: '"' + dateFrom + '"',
            DateTo: '"' + dateTo + '"',
        };
        return this.getList(this.ERPObjects.TSalesList, options);
    }
    getInvoiceBOReport(dateFrom, dateTo) {
        let options = {
            OrderBy: "SaleID desc",
            IgnoreDates: false,
            IncludeBo: true,
            IncludeShipped: false,
            IncludeLines: true,
            DateFrom: '"' + dateFrom + '"',
            DateTo: '"' + dateTo + '"',
        };
        return this.getList(this.ERPObjects.TInvoiceList, options);
    }

    getProfitLossReport() {
        let options = {
            select: "[Active]=true",
            ListType: "Detail",
            //DateTo:dateAsOf
        };
        return this.getList(this.ERPObjects.ProfitLossReport, options);
    }
    getBalanceSheet() {
        let options = {
            select: "[Active]=true",
            ListType: "Detail",
        };
        return this.getList(this.ERPObjects.BalanceSheetReport, options);
    }

    /*
     * get the contacts
     * */

    getContacts() {
        let options = {
            PropertyList: "ID,ClientID,ClientName,Company,CurrencySymbol,ContactAddress,ContactEmail,Active",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TContact, options);
    }
    getBalanceSheetData() {
        return this.getList(this.ERPObjects.BalanceSheetReport);
    }

    getBalanceSheetRedirectData() {
        let options = {
            ReportType: "Detail",
            IgnoreSummarised: true,
            LimitCount: 25,
        };
        // return this.getList(this.ERPObjects.TAccount,options);
        return this.getList(this.ERPObjects.TAccountRunningBalanceReport, options);
    }

    getBalanceSheetRedirectRangeData(datefrom, dateto, limitcount, limitfrom) {
        let options = {
            ReportType: "Detail",
            IgnoreSummarised: true,
            IgnoreDates: false,
            DateTo: '"' + dateto + '"',
            DateFrom: '"' + datefrom + '"',
            LimitCount: parseInt(limitcount),
            LimitFrom: parseInt(limitfrom),
        };
        // return this.getList(this.ERPObjects.TAccount,options);
        return this.getList(this.ERPObjects.TAccountRunningBalanceReport, options);
    }

    getBalanceSheetRedirectClientData(accountName, limitcount, limitfrom, urlParametersDateFrom, urlParametersDateTo) {
        let options = '';
        if (urlParametersDateFrom != '' && urlParametersDateTo != '') {
            options = {
                ReportType: "Detail",
                IgnoreSummarised: true,
                AccountName: '"' + accountName + '"',
                OrderBy: "Date desc",
                DateFrom: '"' + urlParametersDateFrom + '"',
                DateTo: '"' + urlParametersDateTo + '"',
                LimitCount: parseInt(limitcount),
                LimitFrom: parseInt(limitfrom),
            };
        } else {
            options = {
                ReportType: "Detail",
                IgnoreSummarised: true,
                IgnoreDates: true,
                AccountName: '"' + accountName + '"',
                OrderBy: "clientname desc",
                LimitCount: parseInt(limitcount),
                LimitFrom: parseInt(limitfrom),
            };
        }
        // return this.getList(this.ERPObjects.TAccount,options);
        return this.getList(this.ERPObjects.TAccountRunningBalanceReport, options);
    }

    getGSTReconciliationData(dateFrom, dateTo) {
        let options = {
            ReportType: "Detail",
            DateTo: '"' + moment(dateTo).format("YYYY-MM-DD") + '"',
            DateFrom: '"' + moment(dateFrom).format("YYYY-MM-DD") + '"',
        };
        return this.getList(this.ERPObjects.TTaxSummaryReport, options);
    }
    getOneIncomeTransactionData(id) {
        return this.getOneById(this.ERPObjects.TCustomerPayment, id);
    }

    getOneExpenseTransactionData(id) {
        return this.getOneById(this.ERPObjects.TSupplierPayment, id);
    }

    ProfitLossData() {
        return this.getOneById(this.ERPObjects.ProfitLossReport);
    }

    getAccountSummaryRedirectData() {
        let options = {
            ListType: "Detail",
        };
        return this.getList(this.ERPObjects.TAccount, options);
    }

    getProfitandLoss(dateFrom, dateTo, ignoreDate, departments) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else if (departments != "") {
            options = {
                AllDepartments: false,
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                SelectedDepartments: '"' + departments + '"',
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"'
            };
        }
        return this.getList(this.ERPObjects.ProfitLossReport, options);
    }

    getProfitandLossCompare(dateFrom, dateTo, ignoreDate, periodType) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                PeriodType: '"' + periodType + '"',
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                PeriodType: '"' + periodType + '"',
            };
        }

        return this.getList(
            this.ERPObjects.TProfitAndLossPeriodCompareReport,
            options
        );
    }

    getPayHistory(dateFrom, dateTo, ignoreDate = false, periodType = "") {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: ignoreDate,
                PeriodType: '"' + periodType + '"',
                ListType: "'Detail'",
            };
        } else if (periodType) {
            options = {
                IgnoreDates: ignoreDate,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                PeriodType: '"' + periodType + '"',
                ListType: "'Detail'",
            };
        } else {
            options = {
                IgnoreDates: ignoreDate,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                ListType: "'Detail'",
            };
        }

        return this.getList(
            this.ERPObjects.TPayHistory,
            options
        );
    }

    getTimeSheetEntry(dateFrom, dateTo, ignoreDate, periodType) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                PeriodType: '"' + periodType + '"',
                ListType: "'Detail'",
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                PeriodType: '"' + periodType + '"',
                ListType: "'Detail'",
            };
        }

        return this.getList(
            this.ERPObjects.TTimeSheetEntry,
            options
        );
    }

    getDepartment() {
        let options = {
            PropertyList: "DeptClassName",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TDeptClass, options);
    }

    getProfitLossLayout() {
        let options = {
            LayoutID: 3
        };
        return this.getList('TProfitAndLossReport', options);
    }

    getAgedPayableDetailsData(dateFrom, dateTo, ignoreDate) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TAPReport, options);
    }

    getAgedPayableDetailsSummaryData(dateFrom, dateTo, ignoreDate, contactID) {
        let options = "";
        if (contactID != '') {
            options = {
                IgnoreDates: true,
                ReportType: "Summary",
                ClientID: contactID
            };
        } else {

            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    ReportType: "Summary",
                };
            } else {
                options = {
                    IgnoreDates: false,
                    ReportType: "Summary",
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                };
            }
        }
        return this.getList(this.ERPObjects.TAPReport, options);
    }

    getAgedReceivableDetailsData(dateFrom, dateTo, ignoreDate, contactID) {
        let options = "";
        if (contactID != '') {
            options = {
                IgnoreDates: true,
                ClientID: contactID
            };
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                };
            }
        }
        return this.getList(this.ERPObjects.TARReport, options);
    }


    getTAPReport(dateFrom, dateTo, ignoreDate, contactID) {
        let options = "";
        if (contactID != '') {
            options = {
                IgnoreDates: true,
                ClientID: contactID
            };
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true
                };
            } else {
                options = {
                    IgnoreDates: false,
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                };
            }
        }
        return this.getList(this.ERPObjects.TAPReport, options);
    }

    getAgedReceivableDetailsSummaryData(dateFrom, dateTo, ignoreDate, contactID) {
        let options = "";
        if (contactID != '') {
            options = {
                IgnoreDates: true,
                ReportType: "Summary",
                ClientID: contactID,
                IncludeRefunds: false
            };
        } else {
            if (ignoreDate == true) {
                options = {
                    IgnoreDates: true,
                    ReportType: "Summary",
                    IncludeRefunds: false
                };
            } else {
                options = {
                    IgnoreDates: false,
                    ReportType: "Summary",
                    DateFrom: '"' + dateFrom + '"',
                    DateTo: '"' + dateTo + '"',
                    IncludeRefunds: false
                };
            }
        }
        return this.getList(this.ERPObjects.TARReport, options);
    }

    getGeneralLedgerDetailsData(dateFrom, dateTo, ignoreDate) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TGeneralLedgerReport, options);
    }

    getTrialBalanceDetailsData(dateFrom, dateTo, ignoreDate) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TTrialBalanceReport, options);
    }

    getPurchasesDetailsData(dateFrom, dateTo, ignoreDate) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                IncludePOs: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                IncludePOs: true,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }

        return this.getList(this.ERPObjects.TbillReport, options);
    }

    getPurchaseSummaryDetailsData(dateFrom, dateTo, ignoreDate) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                IncludePOs: true,
                ReportType: "Summary",
            };
        } else {
            options = {
                IgnoreDates: false,
                IncludePOs: true,
                ReportType: "Summary",
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }

        return this.getList(this.ERPObjects.TbillReport, options);
    }

    getSalesDetailsData(dateFrom, dateTo, ignoreDate) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }

        return this.getList(this.ERPObjects.TSalesList, options);
    }

    getSalesDetailsSummaryData(dateFrom, dateTo, ignoreDate) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                ListType: "Summary",
            };
        } else {
            options = {
                IgnoreDates: false,
                ListType: "Summary",
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }

        return this.getList(this.ERPObjects.TSalesList, options);
    }

    getProductSalesDetailsData(dateFrom, dateTo, ignoreDate) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }

        return this.getList(this.ERPObjects.TProductSalesDetailsReport, options);
    }

    getTaxSummaryData(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                ReportType: "Summary",
            };
        } else {
            options = {
                IgnoreDates: ignoreDate,
                ReportType: "Summary",
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TTaxSummaryReport, options);
    }

    getAllProductSalesDetails(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: ignoreDate,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TProductSalesDetailsReport, options);
    }

    getContractorPaymentSummaryData(dateFrom, dateTo, ignoreDate) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }

        return this.getList(this.ERPObjects.TContractorPaymentSummary, options);
    }

    /**
     * This function will return CustomerDetails
     *
     * @param {*} dateFrom
     * @param {*} dateTo
     * @param {*} ignoreDate
     * @returns
     */
    getCustomerDetails(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TCustomerPayment, options);
    }

    getleaveAccruals(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                ListType: "'Detail'"
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                ListType: "'Detail'"
            };
        }
        return this.getList(this.ERPObjects.TleaveAccruals, options);
        // return this.getList(this.ERPObjects.TLeaveAccrualList, options);
    }

    getStockQuantityLocationReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TStockQuantityLocation, options);
    }

    getStockValueReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TStockValue, options);
    }

    getLeaveTakenReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TLeaveTaken, options);
    }

    getSupplierProductReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TSupplierProduct, options);
    }

    getStockMovementReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                ListType: "'Detail'"
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                ListType: "'Detail'"
            };
        }
        return this.getList(this.ERPObjects.TProductMovementList, options);
    }

    getSerialNumberReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                ListType: "'Detail'"
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                ListType: "'Detail'"
            };
        }
        return this.getList(this.ERPObjects.TSerialNumberListCurrentReport, options);
    }

    getBinLocationReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                ListType: "'Detail'"
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                ListType: "'Detail'"
            };
        }
        return this.getList(this.ERPObjects.TProductBin, options);
    }

    getTransactionJournalReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                FilterIndex: 2
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                FilterIndex: 2
            };
        }
        return this.getList(this.ERPObjects.TTransactionListReport, options);
    }

    getJobSalesSummaryReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                ListType: "'Detail'"
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
                ListType: "'Detail'"
            };
        }
        return this.getList(this.ERPObjects.TJobSalesSummary, options);
    }

    getJobProfitabilityReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
            };
        } else {
            options = {
                IgnoreDates: false,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TJobProfitability, options);
    }

    getCustomerDetailReport(dateFrom, dateTo, ignoreDate = false) {
        let options = "";
        if (ignoreDate == true) {
            options = {
                IgnoreDates: true,
                SummaryDetailIdx: 2,
            };
        } else {
            options = {
                IgnoreDates: false,
                SummaryDetailIdx: 2,
                DateFrom: '"' + dateFrom + '"',
                DateTo: '"' + dateTo + '"',
            };
        }
        return this.getList(this.ERPObjects.TCustomerSummaryReport, options);
    }

    getTaxCodesDetailVS1() {
        let options = {
            ListType: "Detail",
            select: "[Active]=true",
        };
        let that = this;
        let promise = new Promise(function(resolve, reject) {
            that.getList(that.ERPObjects.TTaxcodeVS1, options).then(function(data) {
                let ttaxcodevs1 = data.ttaxcodevs1.map((v) => {
                    let fields = v.fields;
                    let lines = fields.Lines;
                    if (lines !== null) {
                        if (Array.isArray(lines)) { // if lines is array
                            lines = lines.map((line) => {
                                let f = line.fields;
                                return {
                                    ... { Id: f.ID },
                                    ...f,
                                }
                            })
                        } else if (typeof lines === 'object') { // else if it is object
                            lines = [{
                                ... { Id: lines.fields.ID },
                                ...lines.fields
                            }];
                        }
                    }
                    return {
                        ... { Id: fields.ID },
                        ...fields,
                        ... { Lines: lines }
                    }
                });
                resolve({ ttaxcodevs1 });
            }).catch(function(err) {
                reject(err);
            })
        });
        return promise;
    }

    saveBASReturn(data) {
        return this.POST(this.ERPObjects.TBASReturn, data);
    }

    getAllBASReturn(data) {
        let options = {
            select: "[Active]=true",
            OrderBy: "ID desc",
            ListType: "Detail",
        };
        return this.getList(this.ERPObjects.TBASReturn, options);
    }

    getOneBASReturn(id) {
        let options = {
            select: "[Active]=true and [ID]=" + id,
            ListType: "Detail",
        };
        return this.getList(this.ERPObjects.TBASReturn, options);
    }

    saveVATReturn(data) {
        return this.POST(this.ERPObjects.TVATReturn, data);
    }

    getAllVATReturn(data) {
        let options = {
            select: "[Active]=true",
            OrderBy: "ID desc",
            ListType: "Detail",
        };
        return this.getList(this.ERPObjects.TVATReturn, options);
    }

    getOneVATReturn(id) {
        let options = {
            select: "[Active]=true and [ID]=" + id,
            ListType: "Detail",
        };
        return this.getList(this.ERPObjects.TVATReturn, options);
    }

}