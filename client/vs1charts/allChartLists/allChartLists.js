import { ReactiveVar } from "meteor/reactive-var";
import "gauge-chart";

import DashboardApi from "../../js/Api/DashboardApi";
import Tvs1chart from "../../js/Api/Model/Tvs1Chart";
import resizableCharts from "../../js/Charts/resizableCharts";
import ChartsEditor from "../../js/Charts/ChartsEditor";
import ChartHandler from "../../js/Charts/ChartHandler";
import draggableCharts from "../../js/Charts/draggableCharts";
import Tvs1ChartDashboardPreference from "../../js/Api/Model/Tvs1ChartDashboardPreference";
import Tvs1ChartDashboardPreferenceField from "../../js/Api/Model/Tvs1ChartDashboardPreferenceField";
import ApiService from "../../js/Api/Module/ApiService";
import '../../lib/global/indexdbstorage.js';
import { SideBarService } from "../../js/sidebar-service";
let _ = require("lodash");

let sideBarService = new SideBarService();
/**
 * Current User ID
 */
const employeeId = Session.get("mySessionEmployeeLoggedID");
const _chartGroup = "";
const _tabGroup = 0;
const chartsEditor = new ChartsEditor(
    () => {
        $("#resetcharts").removeClass("hideelement").addClass("showelement"); // This will show the reset charts button

        $("#btnDone").addClass("showelement");
        $("#btnDone").removeClass("hideelement");
        $("#btnCancel").addClass("showelement");
        $("#btnCancel").removeClass("hideelement");
        $("#editcharts").addClass("hideelement");
        $("#editcharts").removeClass("showelement");
        $(".btnchartdropdown").addClass("hideelement");
        $(".btnchartdropdown").removeClass("showelement");

        // $("#resalecomparision").removeClass("hideelement");
        // $("#quotedinvoicedamount").removeClass("hideelement");
        // $("#expensechart").removeClass("hideelement");
        // $("#monthlyprofitlossstatus").removeClass("hideelement");
        // $("#resalecomparision").removeClass("hideelement");
        // $("#showearningchat").removeClass("hideelement");

        $(".sortable-chart-widget-js").removeClass("hideelement"); // display every charts
        $(".on-editor-change-mode").removeClass("hideelement");
        $(".on-editor-change-mode").addClass("showelement");
    },
    () => {
        $("#resetcharts").addClass("hideelement").removeClass("showelement"); // this will hide it back
        $("#btnDone").addClass("hideelement");
        $("#btnDone").removeClass("showelement");
        $("#btnCancel").addClass("hideelement");
        $("#btnCancel").removeClass("showelement");
        $("#editcharts").addClass("showelement");
        $("#editcharts").removeClass("hideelement");
        $(".btnchartdropdown").removeClass("hideelement");
        $(".btnchartdropdown").addClass("showelement");

        $(".on-editor-change-mode").removeClass("showelement");
        $(".on-editor-change-mode").addClass("hideelement");
    }
);

/**
 * This function will save the charts on the dashboard
 */
async function saveCharts() {
    /**
     * Lets load all API colections
     */
    const dashboardApis = new DashboardApi(); // Load all dashboard APIS
    ChartHandler.buildPositions();
    const charts = $(".chart-visibility.editCharts");
    /**
     * @property {Tvs1ChartDashboardPreference[]}
     */
    let chartList = [];
    // now we have to make the post request to save the data in database
    const apiEndpoint = dashboardApis.collection.findByName(
        dashboardApis.collectionNames.Tvs1dashboardpreferences
    );

    let dashboardpreferences = await getVS1Data('Tvs1dashboardpreferences');
    dashboardpreferences = JSON.parse(dashboardpreferences[0].data);
    if (dashboardpreferences.length) {
        dashboardpreferences.forEach((chart) => {
            if (chart.fields != undefined && chart.fields.TabGroup != _tabGroup) {
                chartList.push(chart);
            }
        });
    }

    Array.prototype.forEach.call(charts, (chart) => {
        chartList.push(
            new Tvs1ChartDashboardPreference({
                type: "Tvs1dashboardpreferences",
                fields: new Tvs1ChartDashboardPreferenceField({
                    Active: $(chart).find(".on-editor-change-mode").attr("is-hidden") == true ||
                        $(chart).find(".on-editor-change-mode").attr("is-hidden") == "true" ?
                        false : true,
                    ChartID: parseInt($(chart).attr("chart-id")),
                    ID: parseInt($(chart).attr("pref-id")),
                    EmployeeID: employeeId,
                    ChartName: $(chart).attr("chart-name"),
                    Position: parseInt($(chart).attr("position")),
                    ChartGroup: $(chart).attr("chart-group"),
                    TabGroup: parseInt(_tabGroup),
                    ChartWidth: ChartHandler.calculateWidth(chart),
                    ChartHeight: ChartHandler.calculateHeight(chart),
                }),
            })
        );
    });
    // for (const _chart of chartList) {
    let chartJSON = {
        type: "Tvs1dashboardpreferences",
        objects: chartList
    };

    if (chartList.length > 0) {
        await addVS1Data('Tvs1dashboardpreferences', JSON.stringify(chartList));
    }

    const ApiResponse = await apiEndpoint.fetch(null, {
        method: "POST",
        headers: ApiService.getPostHeaders(),
        body: JSON.stringify(chartJSON),
    });
    if (ApiResponse.ok == true) {
        const jsonResponse = await ApiResponse.json();
    }
    // }
}

Template.allChartLists.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.chartList = new ReactiveVar([]);
});

Template.allChartLists.onRendered(function() {
    const templateObject = Template.instance();
    _tabGroup = $("#connectedSortable").data("tabgroup");
    _chartGroup = $("#connectedSortable").data("chartgroup");

    templateObject.hideChartElements = () => {
        // on edit mode false
        // $(".on-editor-change-mode").removeClass("showelement");
        // $(".on-editor-change-mode").addClass("hideelement");
        const dimmedElements = document.getElementsByClassName("dimmedChart");
        while (dimmedElements.length > 0) {
            dimmedElements[0].classList.remove("dimmedChart");
        }
    };
    templateObject.showChartElements = function() {
        // on edit mode true
        // $(".on-editor-change-mode").addClass("showelement");
        // $(".on-editor-change-mode").removeClass("hideelement");
        $('.sortable-chart-widget-js').removeClass("col-md-12 col-md-8 col-md-6 col-md-4");
        $('.sortable-chart-widget-js').addClass("editCharts");
        $('.sortable-chart-widget-js').each(function() {
            let className = $(this).data('default-class');
            $(this).addClass(className);
            $(this).find('.portlet').addClass('minHeight100');
        });
        if ($('.fc-dayGridMonth-button').length > 0) {
            $('.fc-dayGridMonth-button').trigger('click');
        }
        $(".card").addClass("dimmedChart");
        $(".py-2").removeClass("dimmedChart");
    };
    templateObject.checkChartToDisplay = async() => {
        let defaultChartList = [];
        let chartList = [];
        const dashboardApis = new DashboardApi(); // Load all dashboard APIS
        let displayedCharts = 0;

        let dashboardpreferences = await getVS1Data('Tvs1dashboardpreferences');
        if (dashboardpreferences.length == 0) {} else {
            dashboardpreferences = JSON.parse(dashboardpreferences[0].data);
        };

        if (dashboardpreferences.length) {
            dashboardpreferences.forEach((chart) => {
                if (chart.fields != undefined && chart.fields.TabGroup == _tabGroup) {
                    chartList.push(chart);
                }
            });
        }

        if (chartList.length == 0) {
            chartList = await ChartHandler.getTvs1charts();
            if (chartList.length == 0) {
                // Fetching data from API
                const allChartsEndpoint = dashboardApis.collection.findByName(
                    dashboardApis.collectionNames.vs1charts
                );
                allChartsEndpoint.url.searchParams.append("ListType", "'Detail'");
                const allChartResponse = await allChartsEndpoint.fetch();
                if (allChartResponse.ok == true) {
                    const allChartsJsonResponse = await allChartResponse.json();
                    chartList = Tvs1chart.fromList(allChartsJsonResponse.tvs1charts);
                }
            }
            /*if (chartList.length > 0) {
                let my_tasksChart = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSMCharts",
                        ChartName: "My Tasks",
                        ID: 902,
                        _chartSlug: "dsmcharts__my_tasks"
                    }
                };
                chartList.push(my_tasksChart);
                let salesQuotaChart1 = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSMCharts",
                        ChartName: "Sales Quota 1",
                        ID: 903,
                        _chartSlug: "dsmcharts__sales_quota_1"
                    }
                };
                chartList.push(salesQuotaChart1);
                let salesQuotaChart2 = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSMCharts",
                        ChartName: "Sales Quota 2",
                        ID: 904,
                        _chartSlug: "dsmcharts__sales_quota_2"
                    }
                };
                chartList.push(salesQuotaChart2);
                let salesQuotaChart3 = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSMCharts",
                        ChartName: "Sales Quota 3",
                        ID: 905,
                        _chartSlug: "dsmcharts__sales_quota_3"
                    }
                };
                chartList.push(salesQuotaChart3);
                let salesQuotaChart4 = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSMCharts",
                        ChartName: "Sales Quota 4",
                        ID: 906,
                        _chartSlug: "dsmcharts__sales_quota_4"
                    }
                };
                chartList.push(salesQuotaChart4);
                let salesQuotaChart5 = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSMCharts",
                        ChartName: "Sales Quota 5",
                        ID: 907,
                        _chartSlug: "dsmcharts__sales_quota_5"
                    }
                };
                chartList.push(salesQuotaChart5);
                let salesQuotaChart6 = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSMCharts",
                        ChartName: "Sales Quota 6",
                        ID: 908,
                        _chartSlug: "dsmcharts__sales_quota_6"
                    }
                };
                chartList.push(salesQuotaChart6);
                let dsmTop_10_customers = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSMCharts",
                        ChartName: "Top 10 Customers",
                        ID: 909,
                        _chartSlug: "dsmcharts__top_10_customers"
                    }
                };
                chartList.push(dsmTop_10_customers);
                let dsmEmployee_sales_comparison = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSMCharts",
                        ChartName: "Employee Sales Comparison",
                        ID: 910,
                        _chartSlug: "dsmcharts__employee_sales_comparison"
                    }
                };
                chartList.push(dsmEmployee_sales_comparison);
                let dsmAppointmentListChart = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSMCharts",
                        ChartName: "Appointment List",
                        ID: 911,
                        _chartSlug: "dsmcharts__appointment_list"
                    }
                };
                chartList.push(dsmAppointmentListChart);
                let dsmOpportunitiesStatusChart = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSMCharts",
                        ChartName: "Opportunities Status",
                        ID: 912,
                        _chartSlug: "dsmcharts__opportunities_status"
                    }
                };
                chartList.push(dsmOpportunitiesStatusChart);
                let dsmLeadListChart = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSMCharts",
                        ChartName: "Lead List",
                        ID: 913,
                        _chartSlug: "dsmcharts__lead_list"
                    }
                };
                chartList.push(dsmLeadListChart);
                let my_tasksChart1 = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSCharts",
                        ChartName: "My Tasks",
                        ID: 914,
                        _chartSlug: "dscharts__my_tasks"
                    }
                };
                chartList.push(my_tasksChart1);
                let dsAppointmentListChart = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSCharts",
                        ChartName: "Appointment List",
                        ID: 915,
                        _chartSlug: "dscharts__appointment_list"
                    }
                };
                chartList.push(dsAppointmentListChart);
                let performanceQuotaChart = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSCharts",
                        ChartName: "Performance Quota",
                        ID: 916,
                        _chartSlug: "dscharts__performance_quota"
                    }
                };
                chartList.push(performanceQuotaChart);
                let opportunitiesSourceChart = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSCharts",
                        ChartName: "Opportunities Source",
                        ID: 917,
                        _chartSlug: "dscharts__opportunities_source"
                    }
                };
                chartList.push(opportunitiesSourceChart);
                let dsLeadListChart = {
                    fields: {
                        Active: true,
                        ChartGroup: "DSCharts",
                        ChartName: "Lead List",
                        ID: 1001,
                        _chartSlug: "dscharts__lead_list"
                    }
                };
                chartList.push(dsLeadListChart);
                let accountListChart = {
                    fields: {
                        Active: true,
                        ChartGroup: "Dashboard",
                        ChartName: "Account List",
                        ID: 1002,
                        _chartSlug: "dashboard__account_list"
                    }
                };
                chartList.push(accountListChart);

                let myTasksChart = {
                    fields: {
                        Active: true,
                        ChartGroup: "Dashboard",
                        ChartName: "My Tasks",
                        ID: 1005,
                        _chartSlug: "dashboard__mytaskschart"
                    }
                };
                chartList.push(myTasksChart);

                let myBankAccountschart = {
                    fields: {
                        Active: true,
                        ChartGroup: "Dashboard",
                        ChartName: "Bank Accountschart",
                        ID: 1006,
                        _chartSlug: "dashboard__bank_accountschart"
                    }
                };
                chartList.push(myBankAccountschart);
            } */
        }

        if (chartList.length > 0) {
            templateObject.chartList.set(chartList);
            // Hide all charts
            $('.sortable-chart-widget-js').addClass("hideelement");
            // the goal here is to get the right names so it can be used for preferences
            setTimeout(() => {
                chartList.forEach((chart) => {
                    chart.fields._chartSlug = chart.fields.ChartGroup.toLowerCase() + "__" + chart.fields.ChartName.toLowerCase().split(" ").join("_");
                    $(`[key='${chart.fields._chartSlug}']`).addClass("chart-visibility");
                    $(`[key='${chart.fields._chartSlug}']`).attr("pref-id", 0);
                    $(`[key='${chart.fields._chartSlug}']`).attr("chart-id",chart.fields.ID);
                    // Default charts
                    let defaultClass = $(`[key='${chart.fields._chartSlug}']`).attr('data-default-class');
                    let defaultPosition = $(`[key='${chart.fields._chartSlug}']`).attr('data-default-position');
                    let storeObj = null;
                    if (localStorage.getItem(chart.fields._chartSlug))
                        storeObj = JSON.parse(localStorage.getItem(chart.fields._chartSlug));
                    $(`[key='${chart.fields._chartSlug}']`).addClass(defaultClass);
                    $(`[key='${chart.fields._chartSlug}']`).attr('position', storeObj ? storeObj.position : defaultPosition);
                    $(`[key='${chart.fields._chartSlug}']`).attr('width', '100%');
                    $(`[key='${chart.fields._chartSlug}']`).css('height', storeObj && storeObj.height && storeObj.height != 0 ? storeObj.height + "px" : "auto");
                    $(`[key='${chart.fields._chartSlug}'] .ui-resizable`).css(
                        "width",
                        storeObj && storeObj.width && storeObj.width != 0 ? storeObj.width + "px" : "100%"
                    );
                    $(`[key='${chart.fields._chartSlug}'] .ui-resizable`).css(
                        "height",
                        storeObj && storeObj.height && storeObj.height != 0 ? storeObj.height + "px" : "auto"
                    );
                    if (chart.fields.ChartGroup == _chartGroup && chart.fields.Active == true) {
                        defaultChartList.push(chart.fields._chartSlug);
                        $(`[key='${chart.fields._chartSlug}'] .on-editor-change-mode`).html(
                            "<i class='far fa-eye'></i>"
                        );
                        $(`[key='${chart.fields._chartSlug}'] .on-editor-change-mode`).attr(
                            "is-hidden",
                            "false"
                        );
                        $(`[key='${chart.fields._chartSlug}']`).removeClass("hideelement");
                        if (chart.fields._chartSlug == 'accounts__profit_and_loss') {
                            $(`[key='dashboard__profit_and_loss']`).removeClass("hideelement");
                        }
                        if (chart.fields._chartSlug == 'sales__sales_overview') {
                            $(`[key='contacts__top_10_customers']`).removeClass("hideelement");
                            $(`[key='dashboard__employee_sales_comparison']`).removeClass("hideelement");
                        }
                        if (chart.fields._chartSlug == 'inventory__stock_on_hand_and_demand') {
                            $(`[key='contacts__top_10_supplies']`).removeClass("hideelement");
                        }
                        //Auto hide on Dashboard
                        if (_chartGroup == 'Dashboard' && (chart.fields._chartSlug == 'dashboard__monthly_earnings' || chart.fields._chartSlug == 'dashboard__quoted_amounts_/_invoiced_amounts')) {
                            $(`[key='${chart.fields._chartSlug}']`).addClass("hideelement");
                        }
                    } else {
                        $(`[key='${chart.fields._chartSlug}'] .on-editor-change-mode`).html(
                            "<i class='far fa-eye-slash'></i>"
                        );
                        $(`[key='${chart.fields._chartSlug}'] .on-editor-change-mode`).attr(
                            "is-hidden",
                            "true"
                        );
                    }
                    // $(`[key='${chart.fields._chartSlug}']`).attr(
                    //   "pref-id",
                    //   chart.fields.ID
                    // );
                    $(`[key='${chart.fields._chartSlug}']`).attr(
                        "chart-slug",
                        chart.fields._chartSlug
                    );
                    $(`[key='${chart.fields._chartSlug}']`).attr(
                        "chart-group",
                        chart.fields.ChartGroup
                    );
                    $(`[key='${chart.fields._chartSlug}']`).attr(
                        "chart-name",
                        chart.fields.ChartName
                    );
                    $(`[key='${chart.fields._chartSlug}']`).attr(
                        "chart-active",
                        chart.fields.Active
                    );
                    $(`[key='${chart.fields._chartSlug}']`).attr(
                        "chart-user-pref-is-hidden", !chart.fields.Active
                    );
                });
            }, 0);
        }

        // Now get user preferences
        // let tvs1ChartDashboardPreference = await ChartHandler.getLocalChartPreferences( _tabGroup );
        // if (tvs1ChartDashboardPreference.length > 0) {
        //     // if charts to be displayed are specified
        //     tvs1ChartDashboardPreference.forEach((tvs1chart, index) => {
        //         setTimeout(() => {
        //             if (!tvs1chart.fields.Chartname || tvs1chart.fields.Chartname == "") {
        //                 return;
        //             }
        //             // Now all of chart name is undefined. Why those are all undefined? so below code part is not useful.
        //             const itemName =
        //                 tvs1chart.fields.ChartGroup.toLowerCase() +
        //                 "__" +
        //                 tvs1chart.fields.Chartname.toLowerCase().split(" ").join("_"); // this is the new item name
        //             $(`[key='${itemName}'] .ui-resizable`).parents(".sortable-chart-widget-js").removeClass("col-md-8 col-md-6 col-md-4");
        //             $(`[key='${itemName}'] .ui-resizable`).parents(".sortable-chart-widget-js").addClass("resizeAfterChart");
        //             $(`[key='${itemName}']`).attr("pref-id", tvs1chart.fields.ID);
        //             $(`[key='${itemName}']`).attr("position", tvs1chart.fields.Position);
        //             $(`[key='${itemName}']`).attr("chart-id", tvs1chart.fields.ChartID);
        //             $(`[key='${itemName}']`).attr(
        //                 "chart-group",
        //                 tvs1chart.fields.chartGroup
        //             );
        //             $(`[key='${itemName}']`).addClass("chart-visibility");
        //             //$(`[key='${itemName}']`).attr('chart-id', tvs1chart.fields.Id);
        //             $(`[key='${itemName}'] .on-editor-change-mode`).attr(
        //                 "chart-slug",
        //                 itemName
        //             );
        //             if (tvs1chart.fields.Active == true) {
        //                 $(`[key='${itemName}'] .on-editor-change-mode`).html("<i class='far fa-eye'></i>");
        //                 $(`[key='${itemName}'] .on-editor-change-mode`).attr(
        //                     "is-hidden",
        //                     "false"
        //                 );
        //                 // If the item name exist
        //                 if( tvs1chart.fields.ChartWidth ){
        //                     $(`[key='${itemName}'] .ui-resizable`).parents('.sortable-chart-widget-js').css(
        //                         "width",
        //                         tvs1chart.fields.ChartWidth + '%'
        //                     );
        //                     $(`[key='${itemName}'] .ui-resizable`).css(
        //                         "width", "100%"
        //                     );
        //                 }
        //                 // This is the ChartHeight saved in the preferences
        //                 if( tvs1chart.fields.ChartHeight ){
        //                     $(`[key='${itemName}'] .ui-resizable`).css(
        //                         "height",
        //                         tvs1chart.fields.ChartHeight + 'vh'
        //                     );
        //                 }
        //                 $(`[key='${itemName}']`).removeClass("hideelement");
        //             } else {
        //                 let defaultClassName = $(`[key='${itemName}'] .ui-resizable`).parents(".sortable-chart-widget-js").data('default-class');
        //                 $(`[key='${itemName}'] .ui-resizable`).parents(".sortable-chart-widget-js").addClass(defaultClassName);
        //                 $(`[key='${itemName}']`).addClass("hideelement");
        //                 $(`[key='${itemName}'] .on-editor-change-mode`).html("<i class='far fa-eye-slash'></i>");
        //                 // $(`[key='${itemName}']`).attr("is-hidden", true);
        //                 $(`[key='${itemName}'] .on-editor-change-mode`).attr(
        //                     "is-hidden",
        //                     "true"
        //                 );
        //             }
        //         }, 500);
        //     });
        //     displayedCharts = document.querySelectorAll(
        //       ".sortable-chart-widget-js:not(.hideelement)"
        //     );
        //     if (displayedCharts.length == 0) {
        //         // show only the first one
        //         let item = defaultChartList.length ? defaultChartList[0] : "";
        //         if (item) {
        //             $(`[key='${item}'] .on-editor-change-mode`).html("<i class='far fa-eye'></i>");
        //             $(`[key='${item}'] .on-editor-change-mode`).attr("is-hidden", false);
        //             $(`[key='${item}'] .on-editor-change-mode`).attr("chart-slug", item);
        //             $(`[key='${item}']`).removeClass("hideelement");
        //             $(`[key='${item}']`).addClass("chart-visibility");
        //         }
        //     }
        // } else {
        // Set default chart list
        $('.card-visibility').each(function() {
            $(this).find('.cardShowBtn .far').removeClass('fa-eye');
            // let position = $(this).data('default-position');
            // $(this).attr('position', position);
            $(this).find('.cardShowBtn .far').addClass('fa-eye-slash');
            $(this).attr("card-active", 'false');
        })
        $(`[chart-group='${_chartGroup}']`).attr("card-active", 'true');
        $(`[chart-group='${_chartGroup}']`).removeClass('hideelement');
        $(`[chart-group='${_chartGroup}']`).find('.cardShowBtn .far').removeClass('fa-eye-slash');
        $(`[chart-group='${_chartGroup}']`).find('.cardShowBtn .far').addClass('fa-eye');
        $(`[chart-group='${_chartGroup}']`).find('.minHeight100').removeClass('minHeight100');
        //$(`[chart-group='${_chartGroup}']`).find('.card').removeClass('ui-widget');
        //$(`[chart-group='${_chartGroup}']`).find('.card').removeClass('ui-widget-content');
        // }
        // await ChartHandler.buildPositions();
        // Handle sorting
        setTimeout(() => {
            let $chartWrappper = $(".connectedChartSortable");
            $chartWrappper
                .find(".sortable-chart-widget-js")
                .sort(function(a, b) {
                    return +a.getAttribute("position") - +b.getAttribute("position");
                })
                .appendTo($chartWrappper);
        }, 0)
    };
    templateObject.deactivateDraggable = () => {
        draggableCharts.disable();
        resizableCharts.disable(); // this will disable charts resiable features
    };
    templateObject.activateDraggable = () => {
        draggableCharts.enable();
        resizableCharts.enable(); // this will enable charts resiable features
    };
    templateObject.checkChartToDisplay(); // we run this so we load the correct charts to diplay
    templateObject.activateDraggable(); // this will enable charts resiable features
});

Template.allChartLists.events({
    "click .on-editor-change-mode": (e) => {
        // this will toggle the visibility of the widget
        if ($(e.currentTarget).attr("is-hidden") == "true") {
            $(e.currentTarget).attr("is-hidden", "false");
            $(e.currentTarget).html("<i class='far fa-eye'></i>");
        } else {
            $(e.currentTarget).attr("is-hidden", "true");
            $(e.currentTarget).html("<i class='far fa-eye-slash'></i>");
        }
        // const templateObject = Template.instance();
    },
    "mouseover .card-header": (e) => {
        $(e.currentTarget).parent(".card").addClass("hovered");
    },
    "mouseleave .card-header": (e) => {
        $(e.currentTarget).parent(".card").removeClass("hovered");
    },
    "click .btnBatchUpdate": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        batchUpdateCall();
    },
    "click .editchartsbtn": () => {
        $(".editcharts").trigger("click");
        chartsEditor.enable();
        const templateObject = Template.instance();
        templateObject.showChartElements();
    },
    "click .resetchartbtn": async(event) => {
        event.preventDefault();
        $(".fullScreenSpin").css("display", "block");
        chartsEditor.disable();
        const templateObject = Template.instance();
        $("#btnDone").addClass("hideelement");
        $("#btnDone").removeClass("showelement");
        $("#btnCancel").addClass("hideelement");
        $("#btnCancel").removeClass("showelement");
        $("#editcharts").addClass("showelement");
        $("#editcharts").removeClass("hideelement");
        $(".btnchartdropdown").removeClass("hideelement");
        $(".btnchartdropdown").addClass("showelement");
        const dashboardApis = new DashboardApi(); // Load all dashboard APIS
        let _tabGroup = $("#connectedSortable").data("tabgroup");
        let employeeId = Session.get("mySessionEmployeeLoggedID");
        templateObject.hideChartElements();
        const apiEndpoint = dashboardApis.collection.findByName(
            dashboardApis.collectionNames.Tvs1dashboardpreferences
        );
        let resetCharts = {
            type: "Tvs1dashboardpreferences",
            delete: true,
            fields: {
                EmployeeID: parseInt(employeeId),
                TabGroup: _tabGroup,
            }
        }
        try {
            const ApiResponse = await apiEndpoint.fetch(null, {
                method: "POST",
                headers: ApiService.getPostHeaders(),
                body: JSON.stringify(resetCharts),
            });
            if (ApiResponse.ok == true) {
                const jsonResponse = await ApiResponse.json();
                await ChartHandler.saveChartsInLocalDB();
                await templateObject.checkChartToDisplay();
                $(".fullScreenSpin").css("display", "none");
            }
        } catch (error) {
            $(".fullScreenSpin").css("display", "none");
        }
        // templateObject.deactivateDraggable();
    },
    "click #btnCancel": async() => {
        playCancelAudio();
        setTimeout(async function() {
            $(".fullScreenSpin").css("display", "block");
            chartsEditor.disable();
            const templateObject = Template.instance();
            await templateObject.hideChartElements();
            await templateObject.checkChartToDisplay();
            $('.sortable-chart-widget-js').removeClass("editCharts");
            $(".fullScreenSpin").css("display", "none");
            //templateObject.deactivateDraggable();
        }, delayTimeAfterSound);
    },
    "click #btnDone": async() => {
        playSaveAudio();
        let templateObject = Template.instance();
        setTimeout(async function() {
            $(".fullScreenSpin").css("display", "inline-block");
            await saveCharts();
            await chartsEditor.disable();
            await templateObject.hideChartElements();
            templateObject.checkChartToDisplay();

            $(".fullScreenSpin").css("display", "none");
            Meteor._reload.reload();
        }, delayTimeAfterSound);
    },
});

Template.allChartLists.helpers({
    isaccountoverview: () => {
        const currentLoc = FlowRouter.current().route.path;
        let isAccountOverviewPage = false;
        if (currentLoc == "/accountsoverview") {
            isAccountOverviewPage = true;
        }
        return isAccountOverviewPage;
    }
});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});
