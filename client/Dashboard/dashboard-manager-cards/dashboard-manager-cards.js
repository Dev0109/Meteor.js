import _ from "lodash";
import { SideBarService } from '../../js/sidebar-service';

let sideBarService = new SideBarService();

Template.dashboardManagerCards.onRendered(() => {
    let templateObject = Template.instance();

    const days = (date_1, date_2) => {
        let difference = date_1.getTime() - date_2.getTime();
        let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
        return TotalDays;
    }

    templateObject.getDashboardData = async function() {
        const fromDate = new Date($("#dateFrom").datepicker("getDate"));
        const toDate = new Date($("#dateTo").datepicker("getDate"));
        getVS1Data('TProspectEx').then(function(dataObject) {
            if (dataObject.length) {
                let { tprospect = [] } = JSON.parse(dataObject[0].data);
                let leadsThisMonthCount = 0;

                tprospect.forEach(prospect => {
                    const creationDate = new Date(prospect.fields.CreationDate);
                    if (fromDate <= creationDate && toDate >= creationDate) {
                        leadsThisMonthCount += 1;
                    }
                });

                $('#new-leads-month').text(leadsThisMonthCount);
            } else {
                $('#new-leads-month').text("No Data in Range");
            }
        }).catch(function(err) {});

        // getVS1Data('TQuoteList').then(function(dataObject) {
        //     if (dataObject.length) {
        //         let { tquotelist = [] } = JSON.parse(dataObject[0].data);
        //         let dealsThisMonthCount = 0;
        //         let convertedQuotesCount = 0;
        //         let nonConvertedQuotesCount = 0;
        //         let convertedQuotesAmount = 0;
        //         const fromDate = new Date($("#dateFrom").datepicker("getDate"));
        //         const toDate = new Date($("#dateTo").datepicker("getDate"));
        //         tquotelist.forEach(tquote => {
        //             const saleDate = new Date(tquote.SaleDate);
        //             if (fromDate <= saleDate && toDate >= saleDate) {
        //                 dealsThisMonthCount += 1;
        //                 if (tquote.Converted) {
        //                     convertedQuotesCount += 1;
        //                     convertedQuotesAmount += tquote.Balance;
        //                 } else {
        //                     nonConvertedQuotesCount += 1;
        //                 }
        //             }
        //         });
        //         const winRate = convertedQuotesCount ? parseInt((convertedQuotesCount / (convertedQuotesCount + nonConvertedQuotesCount)) * 100) : 0;
        //         const avgSalesCycle = convertedQuotesAmount ? convertedQuotesAmount / days(toDate, fromDate) : convertedQuotesAmount;
        //         $('#sales-winrate').text(winRate.toFixed(2));
        //         $('#new-deals-month').text(dealsThisMonthCount);
        //         $('#avg-sales-cycle').text(avgSalesCycle.toFixed(2));
        //     }
        // }).catch(function(err) {});

        // getVS1Data('TInvoiceList').then(function(dataObject) {
        //     if (dataObject.length) {
        //         let { tinvoicelist } = JSON.parse(dataObject[0].data);
        //         let closedDealsThisMonth = 0;
        //         let closedDealsThisYear = 0;
        //         // const lastMonthUnix = moment().subtract(1, 'months').unix();
        //         const fromDate = new Date($("#dateFrom").datepicker("getDate"));
        //         const toDate = new Date($("#dateTo").datepicker("getDate"));
        //         alert(fromDate);
        //         const lastYearUnix = moment().subtract(12, 'months').unix();

        //         tinvoicelist.forEach(tinvoice => {
        //             const saleDate = new Date(tinvoice.SaleDate);
        //             if (fromDate <= saleDate && toDate >= saleDate) {
        //                 closedDealsThisMonth++;
        //                 closedDealsThisYear += tinvoice.Balance;
        //             }

        //             // if (moment(tinvoice.SaleDate).unix() > lastYearUnix) {
        //             //     closedDealsThisYear += tinvoice.Balance;
        //             // }
        //         });
        //         $('#closed-deals-month').text(closedDealsThisMonth);
        //         $('#closed-deals-year').text(`$${closedDealsThisYear.toFixed(2)}`);
        //     }
        // }).catch(function(err) {});


        sideBarService.getAllTQuoteListData(moment(fromDate).format("YYYY-MM-DD"), moment(toDate).format("YYYY-MM-DD"), true, 10000, 0).then(function(data) {
            if (data.tquotelist.length > 0) {
                let tquotelist = data.tquotelist;
                let dealsThisMonthCount = 0;
                let convertedQuotesCount = 0;
                let nonConvertedQuotesCount = 0;
                let convertedQuotesAmount = 0;
                tquotelist.forEach(tquote => {
                    const saleDate = new Date(tquote.SaleDate);
                    if (fromDate <= saleDate && toDate >= saleDate) {
                        dealsThisMonthCount += 1;
                        if (tquote.Converted) {
                            convertedQuotesCount += 1;
                            convertedQuotesAmount += tquote.Balance;
                        } else {
                            nonConvertedQuotesCount += 1;
                        }
                    }
                });
                const winRate = convertedQuotesCount ? parseInt((convertedQuotesCount / (convertedQuotesCount + nonConvertedQuotesCount)) * 100) : 0;
                const avgSalesCycle = convertedQuotesAmount ? convertedQuotesAmount / days(toDate, fromDate) : convertedQuotesAmount;

                $('#sales-winrate').text(winRate.toFixed(2));
                $('#new-deals-month').text(dealsThisMonthCount);
                $('#avg-sales-cycle').text(avgSalesCycle.toFixed(2));
            } else {
                $('#sales-winrate').text("No Data in Range");
                $('#new-deals-month').text("No Data in Range");
                $('#avg-sales-cycle').text("No Data in Range");
            }
        }).catch(function(err) {

        });

        sideBarService.getAllTInvoiceListData(moment(fromDate).format("YYYY-MM-DD"), moment(toDate).format("YYYY-MM-DD"), true, 10000, 0).then(function(dataInvoice) {
            if (dataInvoice.tinvoicelist.length > 0) {
                let tinvoicelist = dataInvoice.tinvoicelist;
                let closedDealsThisMonth = 0;
                let closedDealsThisYear = 0;

                tinvoicelist.forEach(tinvoice => {
                    const saleDate = new Date(tinvoice.SaleDate);
                    if (fromDate <= saleDate && toDate >= saleDate) {
                        closedDealsThisMonth++;
                        closedDealsThisYear += tinvoice.Balance;
                    }

                    // if (moment(tinvoice.SaleDate).unix() > lastYearUnix) {
                    //     closedDealsThisYear += tinvoice.Balance;
                    // }
                });

                $('#closed-deals-month').text(closedDealsThisMonth);
                $('#closed-deals-year').text(`$${closedDealsThisYear.toFixed(2)}`);
            } else {
                $('#closed-deals-month').text("No Data in Range");
                $('#closed-deals-year').text("No Data in Range");
            }
        }).catch(function(err) {});
    };
    setTimeout(function() {
        templateObject.getDashboardData();
    }, 100);
});

Template.dashboardManagerCards.events({
    "click #new-leads-month": (e) => {
        // FlowRouter.go('/leadlist?range=month');
        window.open("/leadlist?range=month", '_self');
    },
    "click #new-deals-month": (e) => {
        // FlowRouter.go('/quoteslist?range=month');
        window.open("/quoteslist?range=month", '_self');
    },
    "click #closed-deals-month": (e) => {
        // FlowRouter.go('/invoicelist?range=month');
        window.open("/invoicelist?range=month", '_self');
    },
    "click #closed-deals-year": (e) => {
        // FlowRouter.go('/invoicelist?range=year');
        window.open("/invoicelist?range=year", '_self');
    },
    "click #sales-winrate": (e) => {
        // FlowRouter.go('/quoteslist?filter=converted');
        window.open("/quoteslist?filter=converted", '_self');
    },
    "click #avg-sales-cycle": (e) => {
        // FlowRouter.go('/quoteslist');
        window.open("/quoteslist", '_self');
    },
});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});

Template.registerHelper('notEquals', function(a, b) {
    return a != b;
});

Template.registerHelper('containsequals', function(a, b) {
    return (a.indexOf(b) >= 0);
});