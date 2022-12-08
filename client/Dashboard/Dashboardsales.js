import { ReactiveVar } from "meteor/reactive-var";

Template.dashboardsales.onCreated(function() {
    this.loggedDb = new ReactiveVar("");
    const templateObject = Template.instance();
    templateObject.includeDashboard = new ReactiveVar();
    templateObject.includeDashboard.set(false);
});

Template.dashboardsales.onRendered(function() {
    let templateObject = Template.instance();
    let isDashboard = Session.get("CloudDashboardModule");
    if (isDashboard) {
        templateObject.includeDashboard.set(true);
    }
    const currentDate = new Date();
    let fromDate = moment().subtract(2, 'month').format('DD/MM/YYYY');
    let toDate = moment(currentDate).format("DD/MM/YYYY");
    setTimeout(function() {
        $("#date-input,#dateTo,#dateFrom").datepicker({
            showOn: "button",
            buttonText: "Show Date",
            buttonImageOnly: true,
            buttonImage: "/img/imgCal2.png",
            dateFormat: "dd/mm/yy",
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true,
            yearRange: "-90:+10",
            onChangeMonthYear: function(year, month, inst) {
                // Set date to picker
                $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
                // Hide (close) the picker
                // $(this).datepicker('hide');
                // // Change ttrigger the on change function
                // $(this).trigger('change');
            }
        });
        let urlParametersDateFrom = FlowRouter.current().queryParams.fromDate;
        let urlParametersDateTo = FlowRouter.current().queryParams.toDate;
        let urlParametersIgnoreDate = FlowRouter.current().queryParams.ignoredate;
        if (urlParametersDateFrom) {
            if (urlParametersIgnoreDate == true) {
                $("#dateFrom").attr("readonly", true);
                $("#dateTo").attr("readonly", true);
            } else {
                let paramFromDate = urlParametersDateFrom != "" ? new Date(urlParametersDateFrom) : urlParametersDateFrom;
                paramFromDate = moment(paramFromDate).format("DD/MM/YYYY");
                $("#dateFrom").val(paramFromDate);
                let paramToDate = urlParametersDateTo != "" ? new Date(urlParametersDateTo) : urlParametersDateTo;
                paramToDate = moment(paramToDate).format("DD/MM/YYYY");
                $("#dateTo").val(paramToDate);
            }
        } else {
            $("#dateFrom").val(fromDate);
            $("#dateTo").val(toDate);
        }
        if (urlParametersIgnoreDate == "true") {
            $("#dateFrom").val(null);
            $("#dateTo").val(null);
        }
        $('[data-toggle="tooltip"]').tooltip({ html: true });
    }, 2000);
});

Template.dashboardsales.events({
    "change #dateTo": function() {
        $("#dateFrom").attr("readonly", false);
        $("#dateTo").attr("readonly", false);
        const dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        const dateTo = new Date($("#dateTo").datepicker("getDate"));
        let formatDateFrom =
            dateFrom.getFullYear() +
            "-" +
            (dateFrom.getMonth() + 1) +
            "-" +
            dateFrom.getDate();
        let formatDateTo =
            dateTo.getFullYear() +
            "-" +
            (dateTo.getMonth() + 1) +
            "-" +
            dateTo.getDate();
        window.open("/dashboardsales?fromDate=" + formatDateFrom + "&toDate=" + formatDateTo, '_self');
    },
    "change #dateFrom": function() {
        $("#dateFrom").attr("readonly", false);
        $("#dateTo").attr("readonly", false);
        const dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        const dateTo = new Date($("#dateTo").datepicker("getDate"));
        let formatDateFrom =
            dateFrom.getFullYear() +
            "-" +
            (dateFrom.getMonth() + 1) +
            "-" +
            dateFrom.getDate();
        let formatDateTo =
            dateTo.getFullYear() +
            "-" +
            (dateTo.getMonth() + 1) +
            "-" +
            dateTo.getDate();
        window.open("/dashboardsales?fromDate=" + formatDateFrom + "&toDate=" + formatDateTo, '_self');
    },
    "click #today": function() {
        $("#dateFrom").attr("readonly", false);
        $("#dateTo").attr("readonly", false);
        const currentBeginDate = new Date();
        let fromDateMonth = currentBeginDate.getMonth() + 1;
        let fromDateDay = currentBeginDate.getDate();
        if (currentBeginDate.getMonth() + 1 < 10) {
            fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
            fromDateMonth = currentBeginDate.getMonth() + 1;
        }
        if (currentBeginDate.getDate() < 10) {
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        const toDateERPFrom = currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;
        const toDateERPTo = currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;
        window.open("/dashboardsales?fromDate=" + toDateERPFrom + "&toDate=" + toDateERPTo, '_self');
    },
    "click #lastweek": function() {
        $("#dateFrom").attr("readonly", false);
        $("#dateTo").attr("readonly", false);
        const currentBeginDate = new Date();
        let fromDateMonth = currentBeginDate.getMonth() + 1;
        let fromDateDay = currentBeginDate.getDate();
        if (currentBeginDate.getMonth() + 1 < 10) {
            fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
            fromDateMonth = currentBeginDate.getMonth() + 1;
        }
        if (currentBeginDate.getDate() < 10) {
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        const toDateERPFrom =
            currentBeginDate.getFullYear() +
            "-" +
            fromDateMonth +
            "-" +
            (fromDateDay - 7);
        const toDateERPTo = currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;
        window.open("/dashboardsales?fromDate=" + toDateERPFrom + "&toDate=" + toDateERPTo, '_self');
    },
    "click #lastMonth": function() {
        $("#dateFrom").attr("readonly", false);
        $("#dateTo").attr("readonly", false);
        const currentDate = new Date();
        const prevMonthLastDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            0
        );
        const prevMonthFirstDate = new Date(
            currentDate.getFullYear() - (currentDate.getMonth() > 0 ? 0 : 1),
            (currentDate.getMonth() - 1 + 12) % 12,
            1
        );
        const formatDateComponent = function(dateComponent) {
            return (dateComponent < 10 ? "0" : "") + dateComponent;
        };
        const formatDateERP = function(date) {
            return (
                date.getFullYear() +
                "-" +
                formatDateComponent(date.getMonth() + 1) +
                "-" +
                formatDateComponent(date.getDate())
            );
        };
        const getLoadDate = formatDateERP(prevMonthLastDate);
        const getDateFrom = formatDateERP(prevMonthFirstDate);
        window.open("/dashboardsales?fromDate=" + getDateFrom + "&toDate=" + getLoadDate, '_self');
    },
    "click #lastQuarter": function() {
        $("#dateFrom").attr("readonly", false);
        $("#dateTo").attr("readonly", false);
        const quarterAdjustment = (moment().month() % 3) + 1;
        const lastQuarterEndDate = moment()
            .subtract({
                months: quarterAdjustment,
            })
            .endOf("month");
        const lastQuarterStartDate = lastQuarterEndDate
            .clone()
            .subtract({
                months: 2,
            })
            .startOf("month");
        const getLoadDate = moment(lastQuarterEndDate).format("YYYY-MM-DD");
        const getDateFrom = moment(lastQuarterStartDate).format("YYYY-MM-DD");
        window.open("/dashboardsales?fromDate=" + getDateFrom + "&toDate=" + getLoadDate, '_self');
    },
    "click #last12Months": function() {
        $("#dateFrom").attr("readonly", false);
        $("#dateTo").attr("readonly", false);
        const currentDate = new Date();
        const toDate = moment(currentDate).format("YYYY-MM-DD");
        let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
        let fromDateDay = currentDate.getDate();
        if (currentDate.getMonth() + 1 < 10) {
            fromDateMonth = "0" + (currentDate.getMonth() + 1);
        }
        if (currentDate.getDate() < 10) {
            fromDateDay = "0" + currentDate.getDate();
        }
        const fromDate = Math.floor(currentDate.getFullYear() - 1) + "-" + fromDateMonth + "-" + fromDateDay;
        window.open("/dashboardsales?fromDate=" + fromDate + "&toDate=" + toDate, '_self');
    },
    "click #ignoreDate": function() {
        $("#dateFrom").attr("readonly", true);
        $("#dateTo").attr("readonly", true);
        window.open("/dashboardsales?ignoredate=" + true, '_self');
    },
});

Template.dashboardsales.helpers({
    includeDashboard: () => {
        return Template.instance().includeDashboard.get();
    },
    loggedDb: function() {
        return Template.instance().loggedDb.get();
    },
    loggedCompany: () => {
        return localStorage.getItem("mySession") || "";
    },
});