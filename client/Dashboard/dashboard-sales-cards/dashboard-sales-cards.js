import { ReactiveVar } from "meteor/reactive-var";
import { SideBarService } from '../../js/sidebar-service';

let sideBarService = new SideBarService();

let formatDateFrom;
let formatDateTo;

Template.dashboardSalesCards.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.fromDate = new ReactiveVar([]);
    templateObject.toDate = new ReactiveVar([]);
});

Template.dashboardSalesCards.onRendered(function() {
    let templateObject = Template.instance();
    templateObject.getDashboardData = function(dateFrom, dateTo, ignoreDate) {
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        getVS1Data('TProspectEx').then(function(dataObject) {
            if (dataObject.length) {
                let { tprospect = [] } = JSON.parse(dataObject[0].data);
                let myLeadsLast3Months = 0;
                let teamAvgLast3Months = 0;
                let myNewOpportunityLast3Months = 0;
                let teamNewOpportunityLast3Months = 0;
                let loggedEmpID = Session.get('mySessionEmployeeLoggedID');
                // const momentUnix = moment().subtract(3, 'months').unix();
                tprospect.forEach(prospect => {
                    const creationDate = new Date(prospect.fields.CreationDate);
                    if (fromDate <= creationDate && toDate >= creationDate && prospect.fields.Status === 'Unqualified') {
                        teamAvgLast3Months += 1;
                        if (loggedEmpID == prospect.fields.ID) {
                            myLeadsLast3Months += 1;
                        }
                    }
                    if (fromDate <= creationDate && toDate >= creationDate && prospect.fields.Status === 'Opportunity') {
                        teamNewOpportunityLast3Months += 1;
                        if (loggedEmpID == prospect.fields.ID) {
                            myNewOpportunityLast3Months += 1;
                        }
                    }
                });
                $('#new-leads-my-metric').text(myLeadsLast3Months);
                $('#new-leads-team-avg').text(teamAvgLast3Months);
                $('#new-opportunities-my-metric').text(myNewOpportunityLast3Months);
                $('#new-opportunities-team-avg').text(teamNewOpportunityLast3Months);
            }
        }).catch(function(err) {});

        sideBarService.getAllTInvoiceListData(moment(fromDate).format("YYYY-MM-DD"), moment(toDate).format("YYYY-MM-DD"), true, 10000, 0).then(function(dataInvoice) {
            let totalInvoiceValueLast3Months = 0;
            let totalQuoteValueLast3Months = 0;
            if (dataInvoice.tinvoicelist.length > 0) {
                let tinvoicelist = dataInvoice.tinvoicelist;
                let myWonOpportunities = 0;
                let teamWonOpportunities = 0;
                let employeeName = Session.get('mySessionEmployee');

                tinvoicelist.forEach(tinvoice => {
                    const saleDate = new Date(tinvoice.SaleDate);
                    if (fromDate <= saleDate && toDate >= saleDate) {
                        totalInvoiceValueLast3Months += tinvoice.Balance;
                        teamWonOpportunities += 1;
                        if (employeeName == tinvoice.EmployeeName) {
                            myWonOpportunities += 1;
                        }
                    }
                });
                $('#won-opportunities-my-metric').text(myWonOpportunities.toFixed(2));
                $('#won-opportunities-team-avg').text(teamWonOpportunities.toFixed(2));
            }
            sideBarService.getAllTQuoteListData(moment(fromDate).format("YYYY-MM-DD"), moment(toDate).format("YYYY-MM-DD"), true, 10000, 0).then(function(data) {
                if (data.tquotelist.length > 0) {
                    let tquotelist = data.tquotelist;
                    tquotelist.forEach(tquote => {
                        const saleDate = new Date(tquote.SaleDate);
                        if (fromDate <= saleDate && toDate >= saleDate) {
                            if (!tquote.Converted) {
                                totalQuoteValueLast3Months += tquote.Balance;
                            }
                        }
                    });
                }
                $('#gap-to-quota').text(`$ ${totalInvoiceValueLast3Months.toFixed(2)}`);
                if (totalInvoiceValueLast3Months > totalQuoteValueLast3Months) {
                    $('#gap-to-quota').removeClass('text-danger');
                    $('#gap-to-quota').addClass('text-success');
                    $('#gap-to-quota').parent().children("h5").html('In Front');
                } else {
                    $('#gap-to-quota').removeClass('text-success');
                    $('#gap-to-quota').addClass('text-danger');
                    $('#gap-to-quota').parent().children("h5").html('Behind');
                }
            }).catch(function(err) {});
        }).catch(function(err) {});

        sideBarService.getAllTQuoteListData(moment(fromDate).format("YYYY-MM-DD"), moment(toDate).format("YYYY-MM-DD"), true, 10000, 0).then(function(data) {
            if (data.tquotelist.length > 0) {
                let tquotelist = data.tquotelist;
                let [convertedQuotesCount, nonConvertedQuotesCount, convertedQuotesAmount] = [0, 0, 0, 0];
                let [myConvertedQuotesCount, myNonConvertedQuotesCount, myConvertedQuotesAmount] = [0, 0, 0, 0];
                let [myPipeLineAmount, teamPipeLineAmount] = [0, 0];
                let employeeName = Session.get('mySessionEmployee');
                tquotelist.forEach(tquote => {
                    const saleDate = new Date(tquote.SaleDate);
                    if (fromDate <= saleDate && toDate >= saleDate) {
                        if (tquote.Converted) {
                            convertedQuotesCount += 1;
                            convertedQuotesAmount += tquote.Balance;
                        } else {
                            nonConvertedQuotesCount += 1;
                            teamPipeLineAmount += tquote.Balance;
                        }

                        if (employeeName == tquote.EmployeeName) {
                            if (tquote.Converted) {
                                myConvertedQuotesCount += 1;
                                myConvertedQuotesAmount += tquote.Balance;
                            } else {
                                myNonConvertedQuotesCount += 1;
                                myPipeLineAmount += tquote.Balance;
                            }
                        }
                    }
                });
                const myWinRate = myConvertedQuotesCount;
                const teamWinRate = convertedQuotesCount;
                $('#win-rate-my-metric').text(`${myWinRate} %`);
                $('#win-rate-team-avg').text(`${teamWinRate} %`);

                const myAvgSalesCycle = myConvertedQuotesAmount ? myConvertedQuotesAmount / 30 : myConvertedQuotesAmount;
                const teamAvgSalesCycle = convertedQuotesAmount ? convertedQuotesAmount / 30 : convertedQuotesAmount;
                $('#avg-sales-cycle-my-metric').text(`${parseInt(myAvgSalesCycle)} day(s)`);
                $('#avg-sales-cycle-team-avg').text(`${parseInt(teamAvgSalesCycle)} day(s)`);

                $('#pipeline-amount-my-metric').text(`$ ${myPipeLineAmount.toFixed(2)}`);
                $('#pipeline-amount-team-avg').text(`$ ${teamPipeLineAmount.toFixed(2)}`);
            }
        }).catch(function(err) {});
        // getVS1Data('TInvoiceList').then(function(dataObject) {
        //     let totalInvoiceValueLast3Months = 0;
        //     let totalQuoteValueLast3Months = 0;
        //     if (dataObject.length) {
        //         let { tinvoicelist } = JSON.parse(dataObject[0].data);
        //         let myWonOpportunities = 0;
        //         let teamWonOpportunities = 0;
        //         let employeeName = Session.get('mySessionEmployee');
        //         // const momentUnix = moment().subtract(3, 'months').unix();
        //         const fromDate = new Date($("#dateFrom").datepicker("getDate"));
        //         const toDate = new Date($("#dateTo").datepicker("getDate"));
        //         tinvoicelist.forEach(tinvoice => {
        //             const saleDate = new Date(tinvoice.SaleDate);
        //             if (fromDate <= saleDate && toDate >= saleDate) {
        //                 totalInvoiceValueLast3Months += tinvoice.Balance;
        //                 teamWonOpportunities += 1;
        //                 if (employeeName == tinvoice.EmployeeName) {
        //                     myWonOpportunities += 1;
        //                 }
        //             }
        //         });
        //         $('#won-opportunities-my-metric').text(myWonOpportunities.toFixed(2));
        //         $('#won-opportunities-team-avg').text(teamWonOpportunities.toFixed(2));
        //     }
        //     getVS1Data('TQuoteList').then(function(dataObject) {
        //         if (dataObject.length) {
        //             let { tquotelist = [] } = JSON.parse(dataObject[0].data);
        //             const fromDate = new Date($("#dateFrom").datepicker("getDate"));
        //             const toDate = new Date($("#dateTo").datepicker("getDate"));
        //             tquotelist.forEach(tquote => {
        //                 const saleDate = new Date(tquote.SaleDate);
        //                 if (fromDate <= saleDate && toDate >= saleDate) {
        //                     if (!tquote.Converted) {
        //                         totalQuoteValueLast3Months += tquote.Balance;
        //                     }
        //                 }
        //             });
        //         }
        //         $('#gap-to-quota').text(`$ ${totalInvoiceValueLast3Months.toFixed(2)}`);
        //         if (totalInvoiceValueLast3Months > totalQuoteValueLast3Months) {
        //             $('#gap-to-quota').removeClass('text-danger');
        //             $('#gap-to-quota').addClass('text-success');
        //             $('#gap-to-quota').parent().children("h5").html('In Front');
        //         } else {
        //             $('#gap-to-quota').removeClass('text-success');
        //             $('#gap-to-quota').addClass('text-danger');
        //             $('#gap-to-quota').parent().children("h5").html('Behind');
        //         }
        //     }).catch(function(err) {});
        // }).catch(function(err) {});

        // getVS1Data('TQuoteList').then(function(dataObject) {
        //     if (dataObject.length) {
        //         let { tquotelist = [] } = JSON.parse(dataObject[0].data);
        //         const fromDate = new Date($("#dateFrom").datepicker("getDate"));
        //         const toDate = new Date($("#dateTo").datepicker("getDate"));
        //         let [convertedQuotesCount, nonConvertedQuotesCount, convertedQuotesAmount] = [0, 0, 0, 0];
        //         let [myConvertedQuotesCount, myNonConvertedQuotesCount, myConvertedQuotesAmount] = [0, 0, 0, 0];
        //         let [myPipeLineAmount, teamPipeLineAmount] = [0, 0];
        //         let employeeName = Session.get('mySessionEmployee');
        //         tquotelist.forEach(tquote => {
        //             const saleDate = new Date(tquote.SaleDate);
        //             if (fromDate <= saleDate && toDate >= saleDate) {
        //                 if (tquote.Converted) {
        //                     convertedQuotesCount += 1;
        //                     convertedQuotesAmount += tquote.Balance;
        //                 } else {
        //                     nonConvertedQuotesCount += 1;
        //                     teamPipeLineAmount += tquote.Balance;
        //                 }

        //                 if (employeeName == tquote.EmployeeName) {
        //                     if (tquote.Converted) {
        //                         myConvertedQuotesCount += 1;
        //                         myConvertedQuotesAmount += tquote.Balance;
        //                     } else {
        //                         myNonConvertedQuotesCount += 1;
        //                         myPipeLineAmount += tquote.Balance;
        //                     }
        //                 }
        //             }
        //         });
        //         const myWinRate = myConvertedQuotesCount;
        //         const teamWinRate = convertedQuotesCount;
        //         $('#win-rate-my-metric').text(`${myWinRate} %`);
        //         $('#win-rate-team-avg').text(`${teamWinRate} %`);

        //         const myAvgSalesCycle = myConvertedQuotesAmount ? myConvertedQuotesAmount / 30 : myConvertedQuotesAmount;
        //         const teamAvgSalesCycle = convertedQuotesAmount ? convertedQuotesAmount / 30 : convertedQuotesAmount;
        //         $('#avg-sales-cycle-my-metric').text(`${parseInt(myAvgSalesCycle)} day(s)`);
        //         $('#avg-sales-cycle-team-avg').text(`${parseInt(teamAvgSalesCycle)} day(s)`);

        //         $('#pipeline-amount-my-metric').text(`$ ${myPipeLineAmount.toFixed(2)}`);
        //         $('#pipeline-amount-team-avg').text(`$ ${teamPipeLineAmount.toFixed(2)}`);
        //     }
        // }).catch(function(err) {});
    }
    templateObject.setDateVal = function() {
        const dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        const dateTo = new Date($("#dateTo").datepicker("getDate"));
        templateObject.fromDate.set(dateFrom);
        templateObject.toDate.set(dateTo);
        if ($("#dateFrom").val() == "" && $("#dateTo").val() == "") {
            templateObject.getDashboardData(dateFrom, dateTo, true);
        } else {
            templateObject.getDashboardData(dateFrom, dateTo, false);
        }
    }

    setTimeout(function() {
        templateObject.setDateVal();
    }, 1500);
});

// Listen to event to update reactive variable
Template.dashboardSalesCards.events({
    "click #new-leads-my-metric": (e) => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/leadlist", '_self');
    },
    "click #new-leads-team-avg": (e) => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/leadlist", '_self');
    },
    "click #new-opportunities-my-metric": (e) => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/leadlist", '_self');
    },
    "click #new-opportunities-team-avg": (e) => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/leadlist", '_self');
    },
    "click #won-opportunities-my-metric": (e) => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/invoicelist?fromDate=" + fromDate + "&toDate=" + toDate, '_self');
    },
    "click #won-opportunities-team-avg": (e) => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/invoicelist?fromDate=" + fromDate + "&toDate=" + toDate, '_self');
    },
    "click #gap-to-quota": (e) => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/quoteslist?fromDate=" + fromDate + "&toDate=" + toDate, '_self');
    },
    "click #avg-sales-cycle-my-metric": (e) => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/quoteslist?fromDate=" + fromDate + "&toDate=" + toDate, '_self');
    },
    "click #avg-sales-cycle-team-avg": (e) => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/quoteslist?fromDate=" + fromDate + "&toDate=" + toDate, '_self');
    },
    "click #pipeline-amount-my-metric": (e) => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/quoteslist?fromDate=" + fromDate + "&toDate=" + toDate, '_self');
    },
    "click #pipeline-amount-team-avg": (e) => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/quoteslist?fromDate=" + fromDate + "&toDate=" + toDate, '_self');
    },
});

Template.dashboardSalesCards.helpers({
    newLeadsTooltip: function() {
        let templateObject = Template.instance();
        const fromDate = templateObject.fromDate.get();
        const toDate = templateObject.toDate.get();
        let monthCount = (
            toDate.getMonth() -
            fromDate.getMonth() +
            12 * (toDate.getFullYear() - fromDate.getFullYear())
        );
        return "This is Lead count for last " + monthCount + " months where status is ”Unqualified”";
    },
    newOpportunitiesTooltip: function() {
        let templateObject = Template.instance();
        const fromDate = templateObject.fromDate.get();
        const toDate = templateObject.toDate.get();
        let monthCount = (
            toDate.getMonth() -
            fromDate.getMonth() +
            12 * (toDate.getFullYear() - fromDate.getFullYear())
        );
        return "This is the Lead count for last " + monthCount + " months where status is “Opportunity”";
    },
    wonOpportunitiesTooltip: function() {
        let templateObject = Template.instance();
        const fromDate = templateObject.fromDate.get();
        const toDate = templateObject.toDate.get();
        let monthCount = (
            toDate.getMonth() -
            fromDate.getMonth() +
            12 * (toDate.getFullYear() - fromDate.getFullYear())
        );
        return "This is the Lead/Customer count for last " + monthCount + " months where an Invoice has been made";
    },
    gapToQuotaTooltip: function() {
        let templateObject = Template.instance();
        const fromDate = templateObject.fromDate.get();
        const toDate = templateObject.toDate.get();
        let monthCount = (
            toDate.getMonth() -
            fromDate.getMonth() +
            12 * (toDate.getFullYear() - fromDate.getFullYear())
        );
        return "This is the value of Invoices for last " + monthCount + " months";
    },
    winRateTooltip: function() {
        let templateObject = Template.instance();
        const fromDate = templateObject.fromDate.get();
        const toDate = templateObject.toDate.get();
        let monthCount = (
            toDate.getMonth() -
            fromDate.getMonth() +
            12 * (toDate.getFullYear() - fromDate.getFullYear())
        );
        return "This is the Quote count for last " + monthCount + " months where it is converted to an invoice";
    },
    averageSalesCycleTooltip: function() {
        let templateObject = Template.instance();
        const fromDate = templateObject.fromDate.get();
        const toDate = templateObject.toDate.get();
        let monthCount = (
            toDate.getMonth() -
            fromDate.getMonth() +
            12 * (toDate.getFullYear() - fromDate.getFullYear())
        );
        return "This is the average time taken where Lead/Customer status is converted from “Unqualified” to “Invoiced”";
    },
    pipelineAmountTooltip: function() {
        let templateObject = Template.instance();
        const fromDate = templateObject.fromDate.get();
        const toDate = templateObject.toDate.get();
        let monthCount = (
            toDate.getMonth() -
            fromDate.getMonth() +
            12 * (toDate.getFullYear() - fromDate.getFullYear())
        );
        return "This is the quotes from Lead/Customer for last " + monthCount + " months where the quote has not been converted to an invoice.";
    },
});