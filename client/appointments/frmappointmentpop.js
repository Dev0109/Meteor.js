import { ProductService } from "../product/product-service";
import { SMSService } from "../js/sms-settings-service";
import { ContactService } from "../contacts/contact-service";
import { AppointmentService } from './appointment-service';
import { ReactiveVar } from "meteor/reactive-var";
import { CoreService } from "../js/core-service";
import { AccountService } from "../accounts/account-service";
import { UtilityService } from "../utility-service";
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import "jquery-editable-select";
import { Random } from "meteor/random";
import { SideBarService } from "../js/sidebar-service";
import EmployeePayrollApi from "../js/Api/EmployeePayrollApi";
import "../lib/global/indexdbstorage.js";
import LoadingOverlay from "../LoadingOverlay";
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let smsService = new SMSService();
let productService = new ProductService();
let appointmentService = new AppointmentService();
let contactService = new ContactService();
let createAppointment =
    Session.get("CloudAppointmentCreateAppointment") || false;

Template.frmappointmentpop.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.employeerecords = new ReactiveVar([]);
    templateObject.appointmentInfo = new ReactiveVar([]);
    templateObject.productFees = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();
    templateObject.defaultSMSSettings = new ReactiveVar();
    templateObject.checkRefresh = new ReactiveVar();
    templateObject.checkRefresh.set(false);
    templateObject.empID = new ReactiveVar();
    templateObject.leaveemployeerecords = new ReactiveVar([]);
    templateObject.includeAllProducts = new ReactiveVar();
    templateObject.includeAllProducts.set(true);
    templateObject.isAccessLevels = new ReactiveVar();
    templateObject.extraProductFees = new ReactiveVar([]);
    templateObject.employeeOptions = new ReactiveVar([]);
    templateObject.globalSettings = new ReactiveVar([]);
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.allnoninvproducts = new ReactiveVar([]);
});

Template.frmappointmentpop.onRendered(function() {
    const templateObject = Template.instance();

    $('#edtFrequencyDetail').css('display', 'none');
    $("#date-input,#edtWeeklyStartDate,#edtWeeklyFinishDate,#dtDueDate,#customdateone,#edtMonthlyStartDate,#edtMonthlyFinishDate,#edtDailyStartDate,#edtDailyFinishDate,#edtOneTimeOnlyDate").datepicker({
        showOn: 'button',
        buttonText: 'Show Date',
        buttonImageOnly: true,
        buttonImage: '/img/imgCal2.png',
        constrainInput: false,
        dateFormat: 'd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
    });

    templateObject.getDayNumber = function(day) {
        day = day.toLowerCase();
        if (day == "") {
            return;
        }
        if (day == "monday") {
            return 1;
        }
        if (day == "tuesday") {
            return 2;
        }
        if (day == "wednesday") {
            return 3;
        }
        if (day == "thursday") {
            return 4;
        }
        if (day == "friday") {
            return 5;
        }
        if (day == "saturday") {
            return 6;
        }
        if (day == "sunday") {
            return 0;
        }
    }
    templateObject.getMonths = function(startDate, endDate) {
        let dateone = "";
        let datetwo = "";
        if (startDate != "") {
            dateone = moment(startDate).format('M');
        }
        if (endDate != "") {
            datetwo = parseInt(moment(endDate).format('M')) + 1;
        }
        if (dateone != "" && datetwo != "") {
            for (let x = dateone; x < datetwo; x++) {
                if (x == 1) {
                    $("#formCheck-january").prop('checked', true);
                }
                if (x == 2) {
                    $("#formCheck-february").prop('checked', true);
                }
                if (x == 3) {
                    $("#formCheck-march").prop('checked', true);
                }
                if (x == 4) {
                    $("#formCheck-april").prop('checked', true);
                }
                if (x == 5) {
                    $("#formCheck-may").prop('checked', true);
                }
                if (x == 6) {
                    $("#formCheck-june").prop('checked', true);
                }
                if (x == 7) {
                    $("#formCheck-july").prop('checked', true);
                }
                if (x == 8) {
                    $("#formCheck-august").prop('checked', true);
                }
                if (x == 9) {
                    $("#formCheck-september").prop('checked', true);
                }
                if (x == 10) {
                    $("#formCheck-october").prop('checked', true);
                }
                if (x == 11) {
                    $("#formCheck-november").prop('checked', true);
                }
                if (x == 12) {
                    $("#formCheck-december").prop('checked', true);
                }
            }
        }
        if (dateone == "") {
            $("#formCheck-january").prop('checked', true);
        }
    }

    templateObject.hasFollowings = async function() {
        var currentDate = new Date();
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentAppt = $("#appID").val();

        currentAppt = parseInt(currentAppt);
        // var apptData = await appointmentService.getOneAppointmentdataEx(currentAppt);
        let apptIds = await appointmentService.getAllAppointmentListCount2();
        let apptIdList = apptIds.tappointmentex;
        let cnt = 0;
        for (let i = 0; i < apptIdList.length; i++) {
            if (apptIdList[i].Id > currentAppt) { // apptData.fields.ID
                cnt++;
            }
        }
        if (cnt > 1) {
            $("#btn_follow2").css("display", "inline-block");
        } else {
            $("#btn_follow2").css("display", "none");
        }
    }

    let seeOwnAppointments = Session.get('CloudAppointmentSeeOwnAppointmentsOnly__');
    let globalSet = {};
    $('#event-modal').on('shown.bs.modal', async function(e) {
        let updateID = $("#updateID").val() || 0;
        // $("#frmAppointment")[0].reset();
        $("#btnHold").prop("disabled", false);
        $("#btnStartAppointment").prop("disabled", false);
        $("#btnStopAppointment").prop("disabled", false);
        $("#startTime").prop("disabled", false);
        $("#endTime").prop("disabled", false);
        $("#tActualStartTime").prop("disabled", false);
        $("#tActualEndTime").prop("disabled", false);
        $("#txtActualHoursSpent").prop("disabled", false);
        if (updateID) {
            $('.fullScreenSpin').css('display', 'inline-block');
            var hours = "0";
            let datalist = [];
            shareFunction.initTable(updateID);
            var getAppointmentInfo = await appointmentService.getOneAppointmentdataEx(updateID);
            var appointment = {
                id: getAppointmentInfo.fields.ID || "",
                sortdate: getAppointmentInfo.fields.CreationDate ?
                    moment(getAppointmentInfo.fields.CreationDate).format(
                        "YYYY/MM/DD"
                    ) : "",
                appointmentdate: getAppointmentInfo.fields.CreationDate ?
                    moment(getAppointmentInfo.fields.CreationDate).format(
                        "DD/MM/YYYY"
                    ) : "",
                accountname: getAppointmentInfo.fields.ClientName || "",
                statementno: getAppointmentInfo.fields.TrainerName || "",
                employeename: getAppointmentInfo.fields.TrainerName || "",
                department: getAppointmentInfo.fields.DeptClassName || "",
                phone: getAppointmentInfo.fields.Phone || "",
                mobile: getAppointmentInfo.fields.Mobile || "",
                suburb: getAppointmentInfo.fields.Suburb || "",
                street: getAppointmentInfo.fields.Street || "",
                state: getAppointmentInfo.fields.State || "",
                country: getAppointmentInfo.fields.Country || "",
                zip: getAppointmentInfo.fields.Postcode || "",
                timelog: getAppointmentInfo.fields.AppointmentsTimeLog || "",
                startTime: getAppointmentInfo.fields.StartTime.split(" ")[1] || "",
                totalHours: getAppointmentInfo.fields.TotalHours || 0,
                endTime: getAppointmentInfo.fields.EndTime.split(" ")[1] || "",
                startDate: getAppointmentInfo.fields.StartTime || "",
                endDate: getAppointmentInfo.fields.EndTime || "",
                fromDate: getAppointmentInfo.fields.Actual_EndTime ?
                    moment(
                        getAppointmentInfo.fields.Actual_EndTime
                    ).format("DD/MM/YYYY") : "",
                openbalance: getAppointmentInfo.fields.Actual_EndTime || "",
                aStartTime: getAppointmentInfo.fields.Actual_StartTime.split(
                    " "
                )[1] || "",
                aEndTime: getAppointmentInfo.fields.Actual_EndTime.split(
                    " "
                )[1] || "",
                aStartDate: getAppointmentInfo.fields.Actual_StartTime.split(
                    " "
                )[0] || "",
                aEndDate: getAppointmentInfo.fields.Actual_EndTime.split(
                    " "
                )[0] || "",
                actualHours: "",
                closebalance: "",
                rate: getAppointmentInfo.fields.Rate || 1,
                product: getAppointmentInfo.fields.ProductDesc || "",
                extraProducts: getAppointmentInfo.fields.ExtraProducts || "",
                finished: getAppointmentInfo.fields.Status || "",
                //employee: data.tappointmentex[i].EndTime != '' ? moment(data.tappointmentex[i].EndTime).format("DD/MM/YYYY") : data.tappointmentex[i].EndTime,
                notes: getAppointmentInfo.fields.Notes || "",
                attachments: getAppointmentInfo.fields.Attachments || "",
                isPaused: getAppointmentInfo.fields.Othertxt || "",
                msRef: getAppointmentInfo.fields.MsRef || "",
                custFld13: getAppointmentInfo.fields.CUSTFLD13 || "",
                custFld11: getAppointmentInfo.fields.CUSTFLD11 || "",
            };
            var getEmployeeInfo = await contactService.getOneEmployeeDataByName(appointment.employeename);
            templateObject.empID.set(getEmployeeInfo.temployee[0].fields.ID);

            datalist.push(appointment);
            templateObject.productFees.set(appointment.extraProducts);
            templateObject.uploadedFiles.set(appointment.attachments);
            templateObject.attachmentCount.set(appointment.attachments.length);
            templateObject.appointmentInfo.set(datalist);
            var result = datalist;
            if (result.length > 0) {
                if (result[0].isPaused == "Paused") {
                    $(".paused").show();
                    $("#btnHold").prop("disabled", true);
                } else {
                    $(".paused").hide();
                    $("#btnHold").prop("disabled", false);
                }

                if (result[0].aEndTime != "" && templateObject.isAccessLevels.get() == false) {
                    $("#btnHold").prop("disabled", true);
                    $("#btnStartAppointment").prop("disabled", true);
                    $("#btnStopAppointment").prop("disabled", true);
                    $("#startTime").prop("disabled", true);
                    $("#endTime").prop("disabled", true);
                    $("#tActualStartTime").prop("disabled", true);
                    $("#tActualEndTime").prop("disabled", true);
                    $("#txtActualHoursSpent").prop("disabled", true);
                }
                if (result[0].aStartTime != "" && result[0].aEndTime != "") {
                    var startTime = moment(
                        result[0].startDate.split(" ")[0] + " " + result[0].aStartTime
                    );
                    var endTime = moment(
                        result[0].endDate.split(" ")[0] + " " + result[0].aEndTime
                    );
                    var duration = moment.duration(
                        moment(endTime).diff(moment(startTime))
                    );
                    hours = duration.asHours();
                }

                document.getElementById("updateID").value = result[0].id || 0;
                document.getElementById("appID").value = result[0].id;
                document.getElementById("customer").value = result[0].accountname;
                document.getElementById("phone").value = result[0].phone;
                document.getElementById("mobile").value =
                    result[0].mobile.replace("+", "") ||
                    result[0].phone.replace("+", "") ||
                    "";
                document.getElementById("state").value = result[0].state;
                document.getElementById("address").value = result[0].street;
                if (Session.get("CloudAppointmentNotes") == true) {
                    document.getElementById("txtNotes").value = result[0].notes;
                    document.getElementById("txtNotes-1").value = result[0].notes;
                }
                document.getElementById("suburb").value = result[0].suburb;
                document.getElementById("zip").value = result[0].zip;
                document.getElementById("country").value = result[0].country;

                document.getElementById("product-list").value =
                    result[0].product || "";
                document.getElementById("product-list-1").value =
                    result[0].product || "";
                document.getElementById("employee_name").value =
                    result[0].employeename;
                document.getElementById("dtSODate").value = moment(
                    result[0].startDate.split(" ")[0]
                ).format("DD/MM/YYYY");
                document.getElementById("dtSODate2").value = moment(
                    result[0].endDate.split(" ")[0]
                ).format("DD/MM/YYYY");
                document.getElementById("startTime").value = result[0].startTime;
                document.getElementById("endTime").value = result[0].endTime;
                document.getElementById("txtBookedHoursSpent").value =
                    result[0].totalHours;
                document.getElementById("tActualStartTime").value =
                    result[0].aStartTime;
                document.getElementById("tActualEndTime").value =
                    result[0].aEndTime;
                document.getElementById("txtActualHoursSpent").value =
                    parseFloat(hours).toFixed(2) || "";

                if (!$("#smsConfirmedFlag i.fa-check-circle").hasClass("d-none"))
                    $("#smsConfirmedFlag i.fa-check-circle").addClass("d-none");
                if (!$("#smsConfirmedFlag i.fa-close").hasClass("d-none"))
                    $("#smsConfirmedFlag i.fa-close").addClass("d-none");
                if (!$("#smsConfirmedFlag i.fa-question").hasClass("d-none"))
                    $("#smsConfirmedFlag i.fa-question").addClass("d-none");
                if (!$("#smsConfirmedFlag i.fa-minus-circle").hasClass("d-none"))
                    $("#smsConfirmedFlag i.fa-minus-circle").addClass("d-none");
                if (result[0].custFld13 === "Yes") {
                    if (result[0].custFld11 === "Yes") {
                        $("#smsConfirmedFlag i.fa-check-circle").removeClass(
                            "d-none"
                        );
                    } else {
                        if (result[0].custFld11 === "No") {
                            $("#smsConfirmedFlag i.fa-close").removeClass("d-none");
                        } else {
                            $("#smsConfirmedFlag i.fa-question").removeClass("d-none");
                        }
                    }
                } else {
                    $("#smsConfirmedFlag i.fa-minus-circle").removeClass("d-none");
                }

                $("#attachmentCount").html("");
                if (result[0].attachments) {
                    templateObject.attachmentCount.set(result[0].attachments.length);
                }

                if (result[0].extraProducts != "") {
                    let extraProducts = result[0].extraProducts.split(":");
                    let extraProductFees = [];
                    productService.getNewProductServiceListVS1()
                        .then(function(products) {
                            extraProducts.forEach((item) => {
                                $("#productCheck-" + item).prop("checked", true);
                                products.tproductvs1.forEach((product) => {
                                    if (product.Id == item) {
                                        extraProductFees.push(product);
                                    }
                                    $("#productCheck-" + item).prop("checked", true);
                                });
                            });
                            templateObject.extraProductFees.set(extraProductFees);
                            $(".addExtraProduct").removeClass("btn-primary").addClass("btn-success");
                        })
                        .catch(function(err) {
                            console.error(err);
                        });
                }

                setTimeout(() => {
                    if (localStorage.getItem("smsCustomerAppt") == "false") {
                        $("#chkSMSCustomer").prop("checked", false);
                    }
                    if (localStorage.getItem("smsUserAppt") == "false") {
                        $("#chkSMSUser").prop("checked", false);
                    }
                    if (localStorage.getItem("emailCustomerAppt") == "false") {
                        $("#customerEmail").prop("checked", false);
                    }
                    if (localStorage.getItem("emailUserAppt") == "false") {
                        $("#userEmail").prop("checked", false);
                    }
                }, 100);
            }
            $('.fullScreenSpin').css('display', 'none');
        }
    });

    getVS1Data("TERPPreference")
        .then(function(dataObject) {
            if (dataObject.length == 0) {
                appointmentService
                    .getGlobalSettings()
                    .then(function(data) {
                        // templateObject.getAllAppointmentListData();
                        let appEndTimeDataToLoad = "19:00";
                        globalSet.defaultProduct = "";
                        globalSet.id = "";
                        for (let g = 0; g < data.terppreference.length; g++) {
                            if (
                                data.terppreference[g].PrefName == "ShowSundayinApptCalendar"
                            ) {
                                if (data.terppreference[g].Fieldvalue == "F") {
                                    globalSet.showSun = false;
                                } else if (data.terppreference[g].Fieldvalue == "T") {
                                    globalSet.showSun = true;
                                } else {
                                    globalSet.showSun = false;
                                }
                            } else if (
                                data.terppreference[g].PrefName == "ShowSaturdayinApptCalendar"
                            ) {
                                if (data.terppreference[g].Fieldvalue == "F") {
                                    globalSet.showSat = false;
                                } else if (data.terppreference[g].Fieldvalue == "T") {
                                    globalSet.showSat = true;
                                } else {
                                    globalSet.showSat = false;
                                }
                            } else if (data.terppreference[g].PrefName == "ApptStartTime") {
                                globalSet.apptStartTime =
                                    data.terppreference[g].Fieldvalue.split(" ")[0] || "08:00";
                            } else if (data.terppreference[g].PrefName == "ApptEndtime") {
                                if (
                                    data.terppreference[g].Fieldvalue.split(" ")[0] == "05:30"
                                ) {
                                    globalSet.apptEndTime = "17:00";
                                    let timeSplit = globalSet.apptEndTime.split(":");
                                    let appEndTimeDataHours = parseInt(timeSplit[0]) + 2;
                                    let appEndTimeDataToLoad =
                                        appEndTimeDataHours + ":" + timeSplit[1];
                                    globalSet.apptEndTimeCal = appEndTimeDataToLoad || "19:30";
                                } else {
                                    globalSet.apptEndTime =
                                        data.terppreference[g].Fieldvalue.split(" ")[0];
                                    let timeSplit = globalSet.apptEndTime.split(":");
                                    let appEndTimeDataHours = parseInt(timeSplit[0]) + 2;
                                    let appEndTimeDataToLoad =
                                        appEndTimeDataHours + ":" + timeSplit[1];
                                    globalSet.apptEndTimeCal = appEndTimeDataToLoad || "17:00";
                                    globalSet.apptEndTime =
                                        data.terppreference[g].Fieldvalue || "17:00";
                                }
                            } else if (
                                data.terppreference[g].PrefName == "DefaultApptDuration"
                            ) {
                                if (data.terppreference[g].Fieldvalue == "120") {
                                    globalSet.DefaultApptDuration = 2;
                                } else {
                                    globalSet.DefaultApptDuration =
                                        data.terppreference[g].Fieldvalue || 2;
                                }
                            } else if (
                                data.terppreference[g].PrefName == "DefaultServiceProductID"
                            ) {
                                globalSet.productID = data.terppreference[g].Fieldvalue;
                            } else if (
                                data.terppreference[g].PrefName == "ShowApptDurationin"
                            ) {
                                if (data.terppreference[g].Fieldvalue == "60") {
                                    globalSet.showApptDurationin = 1;
                                } else {
                                    globalSet.showApptDurationin =
                                        data.terppreference[g].Fieldvalue || 1;
                                }
                            } else if (
                                data.terppreference[g].PrefName ==
                                "MinimumChargeAppointmentTime"
                            ) {
                                globalSet.chargeTime = data.terppreference[g].Fieldvalue;
                            } else if (
                                data.terppreference[g].PrefName == "RoundApptDurationTo"
                            ) {
                                globalSet.RoundApptDurationTo =
                                    data.terppreference[g].Fieldvalue;
                            } else if (
                                data.terppreference[g].PrefName == "RoundApptDurationTo"
                            ) {
                                globalSet.RoundApptDurationTo =
                                    data.terppreference[g].Fieldvalue;
                            }
                        }

                        $("#showSaturday").prop("checked", globalSet.showSat);
                        $("#showSunday").prop("checked", globalSet.showSun);
                        if (globalSet.showSat === false) {
                            hideSat = "hidesaturday";
                        }

                        if (globalSet.showSun === false) {
                            hideSun = "hidesunday";
                        }

                        if (globalSet.chargeTime) {
                            $("#chargeTime").prepend(
                                "<option>" + globalSet.chargeTime + " Hour</option>"
                            );
                        }

                        if (globalSet.showApptDurationin) {
                            $("#showTimeIn").prepend(
                                "<option selected>" +
                                globalSet.showApptDurationin +
                                " Hour</option>"
                            );
                        }

                        if (globalSet.DefaultApptDuration) {
                            $("#defaultTime").prepend(
                                "<option selected>" +
                                globalSet.DefaultApptDuration +
                                " Hour</option>"
                            );
                        }

                        if (globalSet.apptStartTime) {
                            $("#hoursFrom").val(globalSet.apptStartTime);
                        }

                        if (globalSet.apptEndTime) {
                            $("#hoursTo").val(globalSet.apptEndTime);
                        }
                        templateObject.globalSettings.set(globalSet);

                        if (globalSet.productID != "") {
                            appointmentService.getGlobalSettingsExtra().then(function(data) {
                                for (let p = 0; p < data.terppreferenceextra.length; p++) {
                                    if (
                                        data.terppreferenceextra[p].Prefname ==
                                        "DefaultServiceProduct"
                                    ) {
                                        globalSet.defaultProduct =
                                            data.terppreferenceextra[p].fieldValue;
                                    }

                                    $("#productlist").prepend(
                                        "<option value=" +
                                        globalSet.id +
                                        ">" +
                                        globalSet.defaultProduct +
                                        "</option>"
                                    );
                                    // $("#productlist")[0].options[0].selected = true;
                                }
                                templateObject.globalSettings.set(globalSet);
                            });
                        } else {
                            globalSet.defaultProduct = "";
                            globalSet.id = "";
                        }
                    })
                    .catch(function(err) {});
            } else {
                let data = JSON.parse(dataObject[0].data);
                // templateObject.getAllAppointmentListData();
                let appEndTimeDataToLoad = "19:00";
                globalSet.defaultProduct = "";
                globalSet.id = "";
                for (let g = 0; g < data.terppreference.length; g++) {
                    if (data.terppreference[g].PrefName == "ShowSundayinApptCalendar") {
                        if (data.terppreference[g].Fieldvalue == "F") {
                            globalSet.showSun = false;
                        } else if (data.terppreference[g].Fieldvalue == "T") {
                            globalSet.showSun = true;
                        } else {
                            globalSet.showSun = false;
                        }
                    } else if (
                        data.terppreference[g].PrefName == "ShowSaturdayinApptCalendar"
                    ) {
                        if (data.terppreference[g].Fieldvalue == "F") {
                            globalSet.showSat = false;
                        } else if (data.terppreference[g].Fieldvalue == "T") {
                            globalSet.showSat = true;
                        } else {
                            globalSet.showSat = false;
                        }
                    } else if (data.terppreference[g].PrefName == "ApptStartTime") {
                        globalSet.apptStartTime =
                            data.terppreference[g].Fieldvalue.split(" ")[0] || "08:00";
                    } else if (data.terppreference[g].PrefName == "ApptEndtime") {
                        if (data.terppreference[g].Fieldvalue.split(" ")[0] == "05:30") {
                            globalSet.apptEndTime = "17:00";
                            let timeSplit = globalSet.apptEndTime.split(":");
                            let appEndTimeDataHours = parseInt(timeSplit[0]) + 2;
                            let appEndTimeDataToLoad =
                                appEndTimeDataHours + ":" + timeSplit[1];
                            globalSet.apptEndTimeCal = appEndTimeDataToLoad || "19:30";
                        } else {
                            globalSet.apptEndTime =
                                data.terppreference[g].Fieldvalue.split(" ")[0];
                            let timeSplit = globalSet.apptEndTime.split(":");
                            let appEndTimeDataHours = parseInt(timeSplit[0]) + 2;
                            let appEndTimeDataToLoad =
                                appEndTimeDataHours + ":" + timeSplit[1];
                            globalSet.apptEndTimeCal = appEndTimeDataToLoad || "17:00";
                            globalSet.apptEndTime =
                                data.terppreference[g].Fieldvalue || "17:00";
                        }
                    } else if (data.terppreference[g].PrefName == "DefaultApptDuration") {
                        if (data.terppreference[g].Fieldvalue == "120") {
                            globalSet.DefaultApptDuration = 2;
                        } else {
                            globalSet.DefaultApptDuration =
                                data.terppreference[g].Fieldvalue || 2;
                        }
                    } else if (
                        data.terppreference[g].PrefName == "DefaultServiceProductID"
                    ) {
                        globalSet.productID = data.terppreference[g].Fieldvalue;
                    } else if (data.terppreference[g].PrefName == "ShowApptDurationin") {
                        if (data.terppreference[g].Fieldvalue == "60") {
                            globalSet.showApptDurationin = 1;
                        } else {
                            globalSet.showApptDurationin =
                                data.terppreference[g].Fieldvalue || 1;
                        }
                    } else if (
                        data.terppreference[g].PrefName == "MinimumChargeAppointmentTime"
                    ) {
                        globalSet.chargeTime = data.terppreference[g].Fieldvalue;
                    } else if (data.terppreference[g].PrefName == "RoundApptDurationTo") {
                        globalSet.RoundApptDurationTo = data.terppreference[g].Fieldvalue;
                    } else if (data.terppreference[g].PrefName == "RoundApptDurationTo") {
                        globalSet.RoundApptDurationTo = data.terppreference[g].Fieldvalue;
                    }
                }

                $("#showSaturday").prop("checked", globalSet.showSat);
                $("#showSunday").prop("checked", globalSet.showSun);
                if (globalSet.showSat === false) {
                    hideSat = "hidesaturday";
                }
                if (globalSet.showSun === false) {
                    hideSun = "hidesunday";
                }
                if (globalSet.chargeTime) {
                    $("#chargeTime").prepend(
                        "<option>" + globalSet.chargeTime + " Hour</option>"
                    );
                }
                if (globalSet.showApptDurationin) {
                    $("#showTimeIn").prepend(
                        "<option selected>" +
                        globalSet.showApptDurationin +
                        " Hour</option>"
                    );
                }
                if (globalSet.DefaultApptDuration) {
                    $("#defaultTime").prepend(
                        "<option selected>" +
                        globalSet.DefaultApptDuration +
                        " Hour</option>"
                    );
                }
                if (globalSet.apptStartTime) {
                    $("#hoursFrom").val(globalSet.apptStartTime);
                }
                if (globalSet.apptEndTime) {
                    $("#hoursTo").val(globalSet.apptEndTime);
                }
                templateObject.globalSettings.set(globalSet);

                if (globalSet.productID != "") {
                    getVS1Data("TERPPreferenceExtra")
                        .then(function(dataObjectExtra) {
                            if (dataObjectExtra.length == 0) {
                                appointmentService
                                    .getGlobalSettingsExtra()
                                    .then(function(data) {
                                        for (let p = 0; p < data.terppreferenceextra.length; p++) {
                                            if (
                                                data.terppreferenceextra[p].Prefname ==
                                                "DefaultServiceProduct"
                                            ) {
                                                globalSet.defaultProduct =
                                                    data.terppreferenceextra[p].fieldValue;
                                            }

                                            $("#productlist").prepend(
                                                "<option value=" +
                                                globalSet.id +
                                                ">" +
                                                globalSet.defaultProduct +
                                                "</option>"
                                            );
                                            // $("#productlist")[0].options[0].selected = true;
                                        }
                                        templateObject.globalSettings.set(globalSet);
                                    });
                            } else {
                                let dataExtra = JSON.parse(dataObjectExtra[0].data);
                                for (let p = 0; p < dataExtra.terppreferenceextra.length; p++) {
                                    if (
                                        dataExtra.terppreferenceextra[p].Prefname ==
                                        "DefaultServiceProduct"
                                    ) {
                                        globalSet.defaultProduct =
                                            dataExtra.terppreferenceextra[p].fieldValue;
                                    }

                                    $("#productlist").prepend(
                                        "<option value=" +
                                        globalSet.id +
                                        ">" +
                                        globalSet.defaultProduct +
                                        "</option>"
                                    );
                                    // $("#productlist")[0].options[0].selected = true;
                                }
                                templateObject.globalSettings.set(globalSet);
                            }
                        })
                        .catch(function(err) {
                            appointmentService.getGlobalSettingsExtra().then(function(data) {
                                for (let p = 0; p < data.terppreferenceextra.length; p++) {
                                    if (
                                        data.terppreferenceextra[p].Prefname ==
                                        "DefaultServiceProduct"
                                    ) {
                                        globalSet.defaultProduct =
                                            data.terppreferenceextra[p].fieldValue;
                                    }

                                    $("#productlist").prepend(
                                        "<option value=" +
                                        globalSet.id +
                                        ">" +
                                        globalSet.defaultProduct +
                                        "</option>"
                                    );
                                    // $("#productlist")[0].options[0].selected = true;
                                }
                                templateObject.globalSettings.set(globalSet);
                            });
                        });
                } else {
                    globalSet.defaultProduct = "";
                    globalSet.id = "";
                }
            }
        })
        .catch(function(err) {
            appointmentService
                .getGlobalSettings()
                .then(function(data) {
                    // templateObject.getAllAppointmentListData();
                    let appEndTimeDataToLoad = "19:00";
                    globalSet.defaultProduct = "";
                    globalSet.id = "";
                    for (let g = 0; g < data.terppreference.length; g++) {
                        if (data.terppreference[g].PrefName == "ShowSundayinApptCalendar") {
                            if (data.terppreference[g].Fieldvalue == "F") {
                                globalSet.showSun = false;
                            } else if (data.terppreference[g].Fieldvalue == "T") {
                                globalSet.showSun = true;
                            } else {
                                globalSet.showSun = false;
                            }
                        } else if (
                            data.terppreference[g].PrefName == "ShowSaturdayinApptCalendar"
                        ) {
                            if (data.terppreference[g].Fieldvalue == "F") {
                                globalSet.showSat = false;
                            } else if (data.terppreference[g].Fieldvalue == "T") {
                                globalSet.showSat = true;
                            } else {
                                globalSet.showSat = false;
                            }
                        } else if (data.terppreference[g].PrefName == "ApptStartTime") {
                            globalSet.apptStartTime =
                                data.terppreference[g].Fieldvalue.split(" ")[0] || "08:00";
                        } else if (data.terppreference[g].PrefName == "ApptEndtime") {
                            if (data.terppreference[g].Fieldvalue.split(" ")[0] == "05:30") {
                                globalSet.apptEndTime = "17:00";
                                let timeSplit = globalSet.apptEndTime.split(":");
                                let appEndTimeDataHours = parseInt(timeSplit[0]) + 2;
                                let appEndTimeDataToLoad =
                                    appEndTimeDataHours + ":" + timeSplit[1];
                                globalSet.apptEndTimeCal = appEndTimeDataToLoad || "19:30";
                            } else {
                                globalSet.apptEndTime =
                                    data.terppreference[g].Fieldvalue.split(" ")[0];
                                let timeSplit = globalSet.apptEndTime.split(":");
                                let appEndTimeDataHours = parseInt(timeSplit[0]) + 2;
                                let appEndTimeDataToLoad =
                                    appEndTimeDataHours + ":" + timeSplit[1];
                                globalSet.apptEndTimeCal = appEndTimeDataToLoad || "17:00";
                                globalSet.apptEndTime =
                                    data.terppreference[g].Fieldvalue || "17:00";
                            }
                        } else if (
                            data.terppreference[g].PrefName == "DefaultApptDuration"
                        ) {
                            if (data.terppreference[g].Fieldvalue == "120") {
                                globalSet.DefaultApptDuration = 2;
                            } else {
                                globalSet.DefaultApptDuration =
                                    data.terppreference[g].Fieldvalue || 2;
                            }
                        } else if (
                            data.terppreference[g].PrefName == "DefaultServiceProductID"
                        ) {
                            globalSet.productID = data.terppreference[g].Fieldvalue;
                        } else if (
                            data.terppreference[g].PrefName == "ShowApptDurationin"
                        ) {
                            if (data.terppreference[g].Fieldvalue == "60") {
                                globalSet.showApptDurationin = 1;
                            } else {
                                globalSet.showApptDurationin =
                                    data.terppreference[g].Fieldvalue || 1;
                            }
                        } else if (
                            data.terppreference[g].PrefName == "MinimumChargeAppointmentTime"
                        ) {
                            globalSet.chargeTime = data.terppreference[g].Fieldvalue;
                        } else if (
                            data.terppreference[g].PrefName == "RoundApptDurationTo"
                        ) {
                            globalSet.RoundApptDurationTo = data.terppreference[g].Fieldvalue;
                        } else if (
                            data.terppreference[g].PrefName == "RoundApptDurationTo"
                        ) {
                            globalSet.RoundApptDurationTo = data.terppreference[g].Fieldvalue;
                        }
                    }

                    $("#showSaturday").prop("checked", globalSet.showSat);
                    $("#showSunday").prop("checked", globalSet.showSun);
                    if (globalSet.showSat === false) {
                        hideSat = "hidesaturday";
                    }

                    if (globalSet.showSun === false) {
                        hideSun = "hidesunday";
                    }

                    if (globalSet.chargeTime) {
                        $("#chargeTime").prepend(
                            "<option>" + globalSet.chargeTime + " Hour</option>"
                        );
                    }

                    if (globalSet.showApptDurationin) {
                        $("#showTimeIn").prepend(
                            "<option selected>" +
                            globalSet.showApptDurationin +
                            " Hour</option>"
                        );
                    }

                    if (globalSet.DefaultApptDuration) {
                        $("#defaultTime").prepend(
                            "<option selected>" +
                            globalSet.DefaultApptDuration +
                            " Hour</option>"
                        );
                    }

                    if (globalSet.apptStartTime) {
                        $("#hoursFrom").val(globalSet.apptStartTime);
                    }

                    if (globalSet.apptEndTime) {
                        $("#hoursTo").val(globalSet.apptEndTime);
                    }
                    templateObject.globalSettings.set(globalSet);

                    if (globalSet.productID != "") {
                        appointmentService.getGlobalSettingsExtra().then(function(data) {
                            for (let p = 0; p < data.terppreferenceextra.length; p++) {
                                if (
                                    data.terppreferenceextra[p].Prefname ==
                                    "DefaultServiceProduct"
                                ) {
                                    globalSet.defaultProduct =
                                        data.terppreferenceextra[p].fieldValue;
                                }

                                $("#productlist").prepend(
                                    "<option value=" +
                                    globalSet.id +
                                    ">" +
                                    globalSet.defaultProduct +
                                    "</option>"
                                );
                                // $("#productlist")[0].options[0].selected = true;
                            }
                            templateObject.globalSettings.set(globalSet);
                        });
                    } else {
                        globalSet.defaultProduct = "";
                        globalSet.id = "";
                    }
                })
                .catch(function(err) {});
        });

    templateObject.saveLeaveRequestLocalDB = async function() {
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TLeavRequest
        );

        employeePayrolEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );
        const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed

        if (employeePayrolEndpointResponse.ok == true) {
            const employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
            if (employeePayrolEndpointJsonResponse.tleavrequest.length) {
                await addVS1Data('TLeavRequest', JSON.stringify(employeePayrolEndpointJsonResponse))
            }
            return employeePayrolEndpointJsonResponse
        }
        return '';
    };

    templateObject.getEmployeesList = async function() {
        let leaveArr = [];
        let data = []
        let dataObject = await getVS1Data('TLeavRequest')
        if (dataObject.length == 0) {
            data = await templateObject.saveLeaveRequestLocalDB();
        } else {
            data = JSON.parse(dataObject[0].data);
        }
        if (data.tleavrequest.length > 0) {
            data.tleavrequest.forEach((item) => {
                const fields = item.fields;
                leaveArr.push(fields);
            });
        }
        templateObject.leaveemployeerecords.set(leaveArr);

        getVS1Data("TEmployee")
            .then(async function(dataObject) {
                if (dataObject.length == 0) {
                    contactService
                        .getAllEmployeeSideData()
                        .then(function(data) {
                            let lineItems = [];
                            let lineItemObj = {};
                            let totalUser = 0;
                            let totAmount = 0;
                            let totAmountOverDue = 0;

                            for (let i = 0; i < data.temployee.length; i++) {
                                let randomColor = Math.floor(Math.random() * 16777215).toString(
                                    16
                                );

                                if (randomColor.length < 6) {
                                    randomColor = randomColor + "6";
                                }
                                let selectedColor = "#" + randomColor;
                                if (
                                    Session.get("mySessionEmployee") ==
                                    data.temployee[i].fields.EmployeeName
                                ) {
                                    if (data.temployee[i].fields.CustFld8 == "false") {
                                        templateObject.includeAllProducts.set(false);
                                    }
                                }

                                if (seeOwnAppointments == true) {
                                    if (
                                        data.temployee[i].fields.EmployeeName ==
                                        Session.get("mySessionEmployee")
                                    ) {
                                        var dataList = {
                                            id: data.temployee[i].fields.ID || "",
                                            employeeName: data.temployee[i].fields.EmployeeName || "",
                                            color: data.temployee[i].fields.CustFld6 || selectedColor,
                                            priority: data.temployee[i].fields.CustFld5 || "0",
                                            override: data.temployee[i].fields.CustFld14 || "false",
                                            custFld7: data.temployee[i].fields.CustFld7 || "",
                                            custFld8: data.temployee[i].fields.CustFld8 || "",
                                        };
                                        lineItems.push(dataList);
                                        allEmployees.push(dataList);
                                    }
                                } else {
                                    var dataList = {
                                        id: data.temployee[i].fields.ID || "",
                                        employeeName: data.temployee[i].fields.EmployeeName || "",
                                        color: data.temployee[i].fields.CustFld6 || selectedColor,
                                        priority: data.temployee[i].fields.CustFld5 || "0",
                                        override: data.temployee[i].fields.CustFld14 || "false",
                                        custFld7: data.temployee[i].fields.CustFld7 || "",
                                        custFld8: data.temployee[i].fields.CustFld8 || "",
                                    };
                                    lineItems.push(dataList);
                                    allEmployees.push(dataList);
                                }
                            }
                            lineItems.sort(function(a, b) {
                                if (a.employeeName == "NA") {
                                    return 1;
                                } else if (b.employeeName == "NA") {
                                    return -1;
                                }
                                return a.employeeName.toUpperCase() >
                                    b.employeeName.toUpperCase() ?
                                    1 :
                                    -1;
                            });
                            templateObject.employeerecords.set(lineItems);

                            if (templateObject.employeerecords.get()) {
                                setTimeout(function() {
                                    $(".counter").text(lineItems.length + " items");
                                }, 100);
                            }
                        })
                        .catch(function(err) {});
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.temployee;
                    let lineItems = [];
                    let lineItemObj = {};
                    let totalUser = 0;

                    let totAmount = 0;
                    let totAmountOverDue = 0;
                    for (let i = 0; i < useData.length; i++) {
                        let randomColor = Math.floor(Math.random() * 16777215).toString(16);

                        if (randomColor.length < 6) {
                            randomColor = randomColor + "6";
                        }
                        let selectedColor = "#" + randomColor;
                        if (useData[i].fields.CustFld6 == "") {
                            objDetails = {
                                type: "TEmployeeEx",
                                fields: {
                                    ID: useData[i].fields.ID,
                                    CustFld6: selectedColor,
                                    Email: useData[i].fields.Email ||
                                        useData[i].fields.FirstName.toLowerCase() + "@gmail.com",
                                    Sex: useData[i].fields.Sex || "M",
                                    DateStarted: useData[i].fields.DateStarted ||
                                        moment().format("YYYY-MM-DD"),
                                    DOB: useData[i].fields.DOB ||
                                        moment("2018-07-01").format("YYYY-MM-DD"),
                                },
                            };

                            contactService
                                .saveEmployeeEx(objDetails)
                                .then(function(data) {});
                        }

                        if (
                            Session.get("mySessionEmployee") == useData[i].fields.EmployeeName
                        ) {
                            if (useData[i].fields.CustFld8 == "false") {
                                templateObject.includeAllProducts.set(false);
                            }
                        }

                        if (seeOwnAppointments == true) {
                            if (
                                useData[i].fields.EmployeeName ==
                                Session.get("mySessionEmployee")
                            ) {
                                var dataList = {
                                    id: useData[i].fields.ID || "",
                                    employeeName: useData[i].fields.EmployeeName || "",
                                    color: useData[i].fields.CustFld6 || selectedColor,
                                    priority: useData[i].fields.CustFld5 || "0",
                                    override: useData[i].fields.CustFld14 || "false",
                                    custFld7: useData[i].fields.CustFld7 || "",
                                    custFld8: useData[i].fields.CustFld8 || "",
                                };
                                lineItems.push(dataList);
                            }
                        } else {
                            var dataList = {
                                id: useData[i].fields.ID || "",
                                employeeName: useData[i].fields.EmployeeName || "",
                                color: useData[i].fields.CustFld6 || selectedColor,
                                priority: useData[i].fields.CustFld5 || "0",
                                override: useData[i].fields.CustFld14 || "false",
                                custFld7: useData[i].fields.CustFld7 || "",
                                custFld8: useData[i].fields.CustFld8 || "",
                            };
                            lineItems.push(dataList);
                        }
                    }
                    lineItems.sort(function(a, b) {
                        if (a.employeeName == "NA") {
                            return 1;
                        } else if (b.employeeName == "NA") {
                            return -1;
                        }
                        return a.employeeName.toUpperCase() > b.employeeName.toUpperCase() ?
                            1 :
                            -1;
                    });
                    templateObject.employeerecords.set(lineItems);

                    if (templateObject.employeerecords.get()) {
                        setTimeout(function() {
                            $(".counter").text(lineItems.length + " items");
                        }, 100);
                    }
                }
            })
            .catch(function(err) {
                contactService
                    .getAllEmployeeSideData()
                    .then(function(data) {
                        let lineItems = [];
                        let lineItemObj = {};
                        let totalUser = 0;

                        let totAmount = 0;
                        let totAmountOverDue = 0;
                        for (let i = 0; i < data.temployee.length; i++) {
                            let randomColor = Math.floor(Math.random() * 16777215).toString(
                                16
                            );

                            if (randomColor.length < 6) {
                                randomColor = randomColor + "6";
                            }
                            let selectedColor = "#" + randomColor;
                            if (
                                Session.get("mySessionEmployee") ==
                                data.temployee[i].fields.EmployeeName
                            ) {
                                if (useData[i].fields.CustFld8 == "false") {
                                    templateObject.includeAllProducts.set(false);
                                }
                            }
                            if (seeOwnAppointments == true) {
                                if (
                                    data.temployee[i].fields.EmployeeName ==
                                    Session.get("mySessionEmployee")
                                ) {
                                    var dataList = {
                                        id: data.temployee[i].fields.ID || "",
                                        employeeName: data.temployee[i].fields.EmployeeName || "",
                                        color: data.temployee[i].fields.CustFld6 || selectedColor,
                                        priority: data.temployee[i].fields.CustFld5 || "0",
                                        override: data.temployee[i].fields.CustFld14 || "false",
                                        custFld7: data.temployee[i].fields.CustFld7 || "",
                                        custFld8: data.temployee[i].fields.CustFld8 || "",
                                    };
                                    lineItems.push(dataList);
                                }
                            } else {
                                var dataList = {
                                    id: data.temployee[i].fields.ID || "",
                                    employeeName: data.temployee[i].fields.EmployeeName || "",
                                    color: data.temployee[i].fields.CustFld6 || selectedColor,
                                    priority: data.temployee[i].fields.CustFld5 || "0",
                                    override: data.temployee[i].fields.CustFld14 || "false",
                                    custFld7: data.temployee[i].fields.CustFld7 || "",
                                    custFld8: data.temployee[i].fields.CustFld8 || "",
                                };
                                lineItems.push(dataList);
                            }
                        }
                        lineItems.sort(function(a, b) {
                            if (a.employeeName == "NA") {
                                return 1;
                            } else if (b.employeeName == "NA") {
                                return -1;
                            }
                            return a.employeeName.toUpperCase() > b.employeeName.toUpperCase() ?
                                1 :
                                -1;
                        });
                        templateObject.employeerecords.set(lineItems);

                        if (templateObject.employeerecords.get()) {
                            setTimeout(function() {
                                $(".counter").text(lineItems.length + " items");
                            }, 100);
                        }
                    })
                    .catch(function(err) {});
            });
    };
    templateObject.getEmployeesList();

    templateObject.getAllProductData = function() {
        var productList = [];
        var splashArrayProductServiceList = new Array();
        //  $('#product-list').editableSelect('clear');
        getVS1Data("TProductWeb")
            .then(function(dataObject) {
                if (dataObject.length == 0) {
                    sideBarService
                        .getProductServiceListVS1(initialBaseDataLoad, 0)
                        .then(function(data) {
                            addVS1Data("TProductWeb", JSON.stringify(data));
                            var dataList = {};
                            for (let i = 0; i < data.tproductvs1.length; i++) {
                                dataList = {
                                    id: data.tproductvs1[i].fields.ID || "",
                                    productname: data.tproductvs1[i].fields.ProductName || "",
                                };

                                var prodservicedataList = [
                                    '<div class="custom-control custom-checkbox chkBox chkBoxService pointer" style="width:15px;"><input class="custom-control-input chkBox chkServiceCard pointer" type="checkbox" id="formCheck-' +
                                    data.tproductvs1[i].fields.ID +
                                    '"><label class="custom-control-label chkBox pointer" for="formCheck-' +
                                    data.tproductvs1[i].fields.ID +
                                    '"></label></div>',
                                    data.tproductvs1[i].fields.ProductName || "-",
                                    data.tproductvs1[i].fields.SalesDescription || "",
                                    data.tproductvs1[i].fields.BARCODE || "",
                                    utilityService.modifynegativeCurrencyFormat(
                                        Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) /
                                        100
                                    ),
                                    utilityService.modifynegativeCurrencyFormat(
                                        Math.floor(data.tproductvs1[i].fields.SellQty1Price * 100) /
                                        100
                                    ),
                                    data.tproductvs1[i].fields.TotalQtyInStock,
                                    data.tproductvs1[i].fields.TaxCodeSales || "",
                                    data.tproductvs1[i].fields.ID || "",
                                    JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice) ||
                                    null,

                                    utilityService.modifynegativeCurrencyFormat(
                                        Math.floor(
                                            data.tproductvs1[i].fields.SellQty1PriceInc * 100
                                        ) / 100
                                    ),
                                ];

                                splashArrayProductServiceList.push(prodservicedataList);

                                //if (data.tproductvs1[i].ProductType != 'INV') {
                                // $('#product-list').editableSelect('add', data.tproductvs1[i].ProductName);
                                // $('#product-list').editableSelect('add', function(){
                                //   $(this).text(data.tproductvs1[i].ProductName);
                                //   $(this).attr('id', data.tproductvs1[i].SellQty1Price);
                                // });
                                productList.push(dataList);
                                //  }
                            }

                            if (splashArrayProductServiceList) {
                                templateObject.allnoninvproducts.set(
                                    splashArrayProductServiceList
                                );
                                $("#tblInventoryPayrollService")
                                    .dataTable({
                                        data: splashArrayProductServiceList,

                                        sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",

                                        columnDefs: [{
                                                className: "chkBox pointer hiddenColumn",
                                                orderable: false,
                                                targets: [0],
                                            },
                                            {
                                                className: "productName",
                                                targets: [1],
                                            },
                                            {
                                                className: "productDesc",
                                                targets: [2],
                                            },
                                            {
                                                className: "colBarcode",
                                                targets: [3],
                                            },
                                            {
                                                className: "costPrice text-right",
                                                targets: [4],
                                            },
                                            {
                                                className: "salePrice text-right",
                                                targets: [5],
                                            },
                                            {
                                                className: "prdqty text-right",
                                                targets: [6],
                                            },
                                            {
                                                className: "taxrate",
                                                targets: [7],
                                            },
                                            {
                                                className: "colProuctPOPID hiddenColumn",
                                                targets: [8],
                                            },
                                            {
                                                className: "colExtraSellPrice hiddenColumn",
                                                targets: [9],
                                            },
                                            {
                                                className: "salePriceInc hiddenColumn",
                                                targets: [10],
                                            },
                                        ],
                                        select: true,
                                        destroy: true,
                                        colReorder: true,
                                        pageLength: initialDatatableLoad,
                                        lengthMenu: [
                                            [initialDatatableLoad, -1],
                                            [initialDatatableLoad, "All"],
                                        ],
                                        info: true,
                                        responsive: true,
                                        order: [
                                            [1, "asc"]
                                        ],
                                        fnDrawCallback: function(oSettings) {
                                            $(".paginate_button.page-item").removeClass("disabled");
                                            $("#tblInventoryPayrollService_ellipsis").addClass(
                                                "disabled"
                                            );
                                        },
                                        fnInitComplete: function() {
                                            $(
                                                "<a class='btn btn-primary scanProdServiceBarcodePOP' href='' id='scanProdServiceBarcodePOP' role='button' style='margin-left: 8px; height:32px;padding: 4px 10px;'><i class='fas fa-camera'></i></a>"
                                            ).insertAfter("#tblInventoryPayrollService_filter");
                                            $(
                                                "<button class='btn btn-primary' data-dismiss='modal' data-toggle='modal' data-target='#newProductModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
                                            ).insertAfter("#tblInventoryPayrollService_filter");
                                            $(
                                                "<button class='btn btn-primary btnRefreshProduct' type='button' id='btnRefreshProduct' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                                            ).insertAfter("#tblInventoryPayrollService_filter");
                                        },
                                    })
                                    .on("length.dt", function(e, settings, len) {
                                        $(".fullScreenSpin").css("display", "inline-block");
                                        let dataLenght = settings._iDisplayLength;
                                        // splashArrayProductList = [];
                                        if (dataLenght == -1) {
                                            $(".fullScreenSpin").css("display", "none");
                                        } else {
                                            if (
                                                settings.fnRecordsDisplay() >= settings._iDisplayLength
                                            ) {
                                                $(".fullScreenSpin").css("display", "none");
                                            } else {
                                                $(".fullScreenSpin").css("display", "none");
                                            }
                                        }
                                    });

                                $("div.dataTables_filter input").addClass(
                                    "form-control form-control-sm"
                                );
                            }

                            // templateObject.datatablerecords.set(productList);
                        });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.tproductvs1;
                    var dataList = {};
                    for (let i = 0; i < useData.length; i++) {
                        dataList = {
                            id: useData[i].fields.ID || "",
                            productname: useData[i].fields.ProductName || "",
                        };

                        var prodservicedataList = [
                            '<div class="custom-control custom-checkbox chkBox chkBoxService pointer" style="width:15px;"><input class="custom-control-input chkBox chkServiceCard pointer" type="checkbox" id="formCheck-' +
                            data.tproductvs1[i].fields.ID +
                            '"><label class="custom-control-label chkBox pointer" for="formCheck-' +
                            data.tproductvs1[i].fields.ID +
                            '"></label></div>',
                            data.tproductvs1[i].fields.ProductName || "-",
                            data.tproductvs1[i].fields.SalesDescription || "",
                            data.tproductvs1[i].fields.BARCODE || "",
                            utilityService.modifynegativeCurrencyFormat(
                                Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) / 100
                            ),
                            utilityService.modifynegativeCurrencyFormat(
                                Math.floor(data.tproductvs1[i].fields.SellQty1Price * 100) / 100
                            ),
                            data.tproductvs1[i].fields.TotalQtyInStock,
                            data.tproductvs1[i].fields.TaxCodeSales || "",
                            data.tproductvs1[i].fields.ID || "",
                            JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice) || null,

                            utilityService.modifynegativeCurrencyFormat(
                                Math.floor(data.tproductvs1[i].fields.SellQty1PriceInc * 100) /
                                100
                            ),
                        ];

                        splashArrayProductServiceList.push(prodservicedataList);
                        // $('#product-list').editableSelect('add', useData[i].fields.ProductName);
                        // $('#product-list').editableSelect('add', function(){
                        //   $(this).val(useData[i].fields.ID);
                        //   $(this).text(useData[i].fields.ProductName);
                        //   $(this).attr('id', useData[i].fields.SellQty1Price);
                        // });
                        //if (useData[i].fields.ProductType != 'INV') {
                        productList.push(dataList);
                        //}
                    }

                    if (splashArrayProductServiceList) {
                        templateObject.allnoninvproducts.set(splashArrayProductServiceList);
                        $("#tblInventoryPayrollService")
                            .dataTable({
                                data: splashArrayProductServiceList,

                                sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",

                                columnDefs: [{
                                        className: "chkBox pointer hiddenColumn",
                                        orderable: false,
                                        targets: [0],
                                    },
                                    {
                                        className: "productName",
                                        targets: [1],
                                    },
                                    {
                                        className: "productDesc",
                                        targets: [2],
                                    },
                                    {
                                        className: "colBarcode",
                                        targets: [3],
                                    },
                                    {
                                        className: "costPrice text-right",
                                        targets: [4],
                                    },
                                    {
                                        className: "salePrice text-right",
                                        targets: [5],
                                    },
                                    {
                                        className: "prdqty text-right",
                                        targets: [6],
                                    },
                                    {
                                        className: "taxrate",
                                        targets: [7],
                                    },
                                    {
                                        className: "colProuctPOPID hiddenColumn",
                                        targets: [8],
                                    },
                                    {
                                        className: "colExtraSellPrice hiddenColumn",
                                        targets: [9],
                                    },
                                    {
                                        className: "salePriceInc hiddenColumn",
                                        targets: [10],
                                    },
                                ],
                                select: true,
                                destroy: true,
                                colReorder: true,
                                pageLength: initialDatatableLoad,
                                lengthMenu: [
                                    [initialDatatableLoad, -1],
                                    [initialDatatableLoad, "All"],
                                ],
                                info: true,
                                responsive: true,
                                order: [
                                    [1, "asc"]
                                ],
                                fnDrawCallback: function(oSettings) {
                                    $(".paginate_button.page-item").removeClass("disabled");
                                    $("#tblInventoryPayrollService_ellipsis").addClass(
                                        "disabled"
                                    );
                                },
                                fnInitComplete: function() {
                                    $(
                                        "<a class='btn btn-primary scanProdServiceBarcodePOP' href='' id='scanProdServiceBarcodePOP' role='button' style='margin-left: 8px; height:32px;padding: 4px 10px;'><i class='fas fa-camera'></i></a>"
                                    ).insertAfter("#tblInventoryPayrollService_filter");
                                    $(
                                        "<button class='btn btn-primary' data-dismiss='modal' data-toggle='modal' data-target='#newProductModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
                                    ).insertAfter("#tblInventoryPayrollService_filter");
                                    $(
                                        "<button class='btn btn-primary btnRefreshProduct' type='button' id='btnRefreshProduct' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                                    ).insertAfter("#tblInventoryPayrollService_filter");
                                },
                            })
                            .on("length.dt", function(e, settings, len) {
                                $(".fullScreenSpin").css("display", "inline-block");
                                let dataLenght = settings._iDisplayLength;
                                // splashArrayProductList = [];
                                if (dataLenght == -1) {
                                    $(".fullScreenSpin").css("display", "none");
                                } else {
                                    if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                                        $(".fullScreenSpin").css("display", "none");
                                    } else {
                                        $(".fullScreenSpin").css("display", "none");
                                    }
                                }
                            });

                        $("div.dataTables_filter input").addClass(
                            "form-control form-control-sm"
                        );
                    }
                    // templateObject.datatablerecords.set(productList);
                }
            })
            .catch(function(err) {
                sideBarService
                    .getProductServiceListVS1(initialBaseDataLoad, 0)
                    .then(function(data) {
                        addVS1Data("TProductWeb", JSON.stringify(data));
                        var dataList = {};
                        for (let i = 0; i < data.tproductvs1.length; i++) {
                            dataList = {
                                id: data.tproductvs1[i].fields.ID || "",
                                productname: data.tproductvs1[i].fields.ProductName || "",
                            };

                            var prodservicedataList = [
                                '<div class="custom-control custom-checkbox chkBox chkBoxService pointer" style="width:15px;"><input class="custom-control-input chkBox chkServiceCard pointer" type="checkbox" id="formCheck-' +
                                data.tproductvs1[i].fields.ID +
                                '"><label class="custom-control-label chkBox pointer" for="formCheck-' +
                                data.tproductvs1[i].fields.ID +
                                '"></label></div>',
                                data.tproductvs1[i].fields.ProductName || "-",
                                data.tproductvs1[i].fields.SalesDescription || "",
                                data.tproductvs1[i].fields.BARCODE || "",
                                utilityService.modifynegativeCurrencyFormat(
                                    Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) / 100
                                ),
                                utilityService.modifynegativeCurrencyFormat(
                                    Math.floor(data.tproductvs1[i].fields.SellQty1Price * 100) /
                                    100
                                ),
                                data.tproductvs1[i].fields.TotalQtyInStock,
                                data.tproductvs1[i].fields.TaxCodeSales || "",
                                data.tproductvs1[i].fields.ID || "",
                                JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice) ||
                                null,

                                utilityService.modifynegativeCurrencyFormat(
                                    Math.floor(
                                        data.tproductvs1[i].fields.SellQty1PriceInc * 100
                                    ) / 100
                                ),
                            ];

                            splashArrayProductServiceList.push(prodservicedataList);

                            //if (data.tproductvs1[i].ProductType != 'INV') {
                            // $('#product-list').editableSelect('add', data.tproductvs1[i].ProductName);
                            // $('#product-list').editableSelect('add', function(){
                            //   $(this).text(data.tproductvs1[i].ProductName);
                            //   $(this).attr('id', data.tproductvs1[i].SellQty1Price);
                            // });
                            productList.push(dataList);
                            //  }
                        }

                        if (splashArrayProductServiceList) {
                            templateObject.allnoninvproducts.set(
                                splashArrayProductServiceList
                            );
                            $("#tblInventoryPayrollService")
                                .dataTable({
                                    data: splashArrayProductServiceList,

                                    sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",

                                    columnDefs: [{
                                            className: "chkBox pointer hiddenColumn",
                                            orderable: false,
                                            targets: [0],
                                        },
                                        {
                                            className: "productName",
                                            targets: [1],
                                        },
                                        {
                                            className: "productDesc",
                                            targets: [2],
                                        },
                                        {
                                            className: "colBarcode",
                                            targets: [3],
                                        },
                                        {
                                            className: "costPrice text-right",
                                            targets: [4],
                                        },
                                        {
                                            className: "salePrice text-right",
                                            targets: [5],
                                        },
                                        {
                                            className: "prdqty text-right",
                                            targets: [6],
                                        },
                                        {
                                            className: "taxrate",
                                            targets: [7],
                                        },
                                        {
                                            className: "colProuctPOPID hiddenColumn",
                                            targets: [8],
                                        },
                                        {
                                            className: "colExtraSellPrice hiddenColumn",
                                            targets: [9],
                                        },
                                        {
                                            className: "salePriceInc hiddenColumn",
                                            targets: [10],
                                        },
                                    ],
                                    select: true,
                                    destroy: true,
                                    colReorder: true,
                                    pageLength: initialDatatableLoad,
                                    lengthMenu: [
                                        [initialDatatableLoad, -1],
                                        [initialDatatableLoad, "All"],
                                    ],
                                    info: true,
                                    responsive: true,
                                    order: [
                                        [1, "asc"]
                                    ],
                                    fnDrawCallback: function(oSettings) {
                                        $(".paginate_button.page-item").removeClass("disabled");
                                        $("#tblInventoryPayrollService_ellipsis").addClass(
                                            "disabled"
                                        );
                                    },
                                    fnInitComplete: function() {
                                        $(
                                            "<a class='btn btn-primary scanProdServiceBarcodePOP' href='' id='scanProdServiceBarcodePOP' role='button' style='margin-left: 8px; height:32px;padding: 4px 10px;'><i class='fas fa-camera'></i></a>"
                                        ).insertAfter("#tblInventoryPayrollService_filter");
                                        $(
                                            "<button class='btn btn-primary' data-dismiss='modal' data-toggle='modal' data-target='#newProductModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
                                        ).insertAfter("#tblInventoryPayrollService_filter");
                                        $(
                                            "<button class='btn btn-primary btnRefreshProduct' type='button' id='btnRefreshProduct' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                                        ).insertAfter("#tblInventoryPayrollService_filter");
                                    },
                                })
                                .on("length.dt", function(e, settings, len) {
                                    $(".fullScreenSpin").css("display", "inline-block");
                                    let dataLenght = settings._iDisplayLength;
                                    // splashArrayProductList = [];
                                    if (dataLenght == -1) {
                                        $(".fullScreenSpin").css("display", "none");
                                    } else {
                                        if (
                                            settings.fnRecordsDisplay() >= settings._iDisplayLength
                                        ) {
                                            $(".fullScreenSpin").css("display", "none");
                                        } else {
                                            $(".fullScreenSpin").css("display", "none");
                                        }
                                    }
                                });

                            $("div.dataTables_filter input").addClass(
                                "form-control form-control-sm"
                            );
                        }

                        // templateObject.datatablerecords.set(productList);
                    });
            });
    };
    templateObject.getAllProductData();

    templateObject.getAllSelectedProducts = function(employeeID) {
        let productlist = [];
        templateObject.datatablerecords.set([]);
        var splashArrayProductServiceList = new Array();
        var splashArrayProductServiceListGet = [];
        //$('#product-list').editableSelect('clear');
        sideBarService
            .getSelectedProducts(employeeID)
            .then(function(data) {
                var dataList = {};

                let getallinvproducts = templateObject.allnoninvproducts.get();
                if (data.trepservices.length > 0) {
                    for (let i = 0; i < data.trepservices.length; i++) {
                        dataList = {
                            id: data.trepservices[i].Id || "",
                            productname: data.trepservices[i].ServiceDesc || "",
                            productcost: data.trepservices[i].Rate || 0.0,
                        };
                        let checkServiceArray =
                            getallinvproducts.filter(function(prodData) {
                                if (prodData[1] === data.trepservices[i].ServiceDesc) {
                                    var prodservicedataList = [
                                        prodData[0],
                                        prodData[1] || "-",
                                        prodData[2] || "",
                                        prodData[3] || "",
                                        prodData[4],
                                        prodData[5],
                                        prodData[6],
                                        prodData[7] || "",
                                        prodData[8] || "",
                                        prodData[9] || null,
                                        prodData[10],
                                    ];
                                    splashArrayProductServiceListGet.push(prodservicedataList);
                                    //splashArrayProductServiceListGet.push(prodservicedataList);
                                    return prodservicedataList || "";
                                }
                            }) || "";

                        productlist.push(dataList);
                    }
                    if (splashArrayProductServiceListGet) {
                        let uniqueChars = [...new Set(splashArrayProductServiceListGet)];
                        var datatable = $("#tblInventoryPayrollService").DataTable();
                        datatable.clear();
                        datatable.rows.add(uniqueChars);
                        datatable.draw(false);
                    }

                    templateObject.datatablerecords.set(productlist);
                } else {
                    templateObject.getAllProductData();
                }
            })
            .catch(function(err) {
                templateObject.getAllProductData();
            });
    };

    getVS1Data("TAppointmentPreferences")
        .then(function(dataObject) {
            let employeeSettings = [];
            if (dataObject.length == 0) {
                appointmentService
                    .getCalendarsettings()
                    .then(function(data) {
                        if (data.tappointmentpreferences.length > 0) {
                            templateObject.employeeOptions.set(data.tappointmentpreferences);
                        }
                    })
                    .catch(function(err) {});
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tappointmentpreferences;
                templateObject.employeeOptions.set(useData);
            }
        })
        .catch(function(err) {
            appointmentService
                .getCalendarsettings()
                .then(function(data) {
                    templateObject.employeeOptions.set(data.tappointmentpreferences);
                })
                .catch(function(err) {});
        });

    templateObject.diff_hours = function(dt2, dt1) {
        var diff = (dt2.getTime() - dt1.getTime()) / 1000;
        diff /= 60 * 60;
        return Math.abs(diff);
    };

    templateObject.dateFormat = function(date) {
        var dateParts = date.split("/");
        var dateObject =
            dateParts[2] +
            "/" +
            ("0" + (dateParts[1] - 1)).toString().slice(-2) +
            "/" +
            dateParts[0];
        return dateObject;
    };

    templateObject.timeToDecimal = function(time) {
        var hoursMinutes = time.split(/[.:]/);
        var hours = parseInt(hoursMinutes[0], 10);
        var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
        return hours + minutes / 60;
    };

    templateObject.timeFormat = function(hours) {
        var decimalTime = parseFloat(hours).toFixed(2);
        decimalTime = decimalTime * 60 * 60;
        var hours = Math.floor(decimalTime / (60 * 60));
        decimalTime = decimalTime - hours * 60 * 60;
        var minutes = Math.abs(decimalTime / 60);
        decimalTime = decimalTime - minutes * 60;
        hours = ("0" + hours).slice(-2);
        minutes = ("0" + Math.round(minutes)).slice(-2);
        let time = hours + ":" + minutes;
        return time;
    };

    templateObject.getLeaveRequests = async function() {
        let result = false;
        const dataObject = await getVS1Data("TLeavRequest");
        if (dataObject.length != 0) {
            const data = JSON.parse(dataObject[0].data);
            if (data.tleavrequest.length > 0) {
                data.tleavrequest.forEach((item) => {
                    const fields = item.fields;
                    const parsedDate = utilityService.getStartDateWithSpecificFormat(
                        fields.StartDate
                    );
                    const appointmentDate = document.getElementById("dtSODate").value;

                    if (parsedDate === appointmentDate) {
                        result = true;
                    }
                });
            }
        }
        return result;
    };

    templateObject.checkSMSSettings = function() {
        const accessLevel = Session.get("CloudApptSMS");
        if (!accessLevel) {
            $("#chkSMSCustomer").prop("checked", false);
            $("#chkSMSUser").prop("checked", false);
            $(".chkSMSCustomer-container").addClass("d-none");
            $(".chkSMSCustomer-container").removeClass("d-xl-flex");
            $(".chkSMSUser-container").addClass("d-none");
            $(".chkSMSUser-container").removeClass("d-xl-flex");
        } else {
            const smsSettings = templateObject.defaultSMSSettings.get();
            const chkSMSCustomer = $("#chkSMSCustomer").prop("checked");
            const chkSMSUser = $("#chkSMSUser").prop("checked");
            if (
                (!smsSettings ||
                    smsSettings.twilioAccountId === "" ||
                    smsSettings.twilioAccountToken === "" ||
                    smsSettings.twilioTelephoneNumber === "") &&
                (chkSMSCustomer || chkSMSUser)
            ) {
                swal({
                    title: "No SMS Settings",
                    text: "Do you wish to setup SMS Confirmation?",
                    type: "question",
                    showCancelButton: true,
                    confirmButtonText: "Continue",
                    cancelButtonText: "Go to SMS Settings",
                }).then((result) => {
                    if (result.value) {
                        $("#chkSMSCustomer").prop("checked", false);
                        $("#chkSMSUser").prop("checked", false);
                    } else if (result.dismiss === "cancel") {
                        window.open("/smssettings", "_self");
                    } else {
                        window.open("/smssettings", "_self");
                    }
                });
            }
        }
    };

    $(document).ready(function() {
        $("#customer").editableSelect();
        $("#product-list").editableSelect();
        $("#product-list-1").editableSelect();
    });

    $("#customer")
        .editableSelect()
        .on("click.editable-select", function(e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            $("#edtCustomerPOPID").val("");
            //$('#edtCustomerCompany').attr('readonly', false);
            var customerDataName = e.target.value || "";
            if (e.pageX > offset.left + $earch.width() - 8) {
                // X button 16px wide?
                if (FlowRouter.current().queryParams.leadid) {
                    openAppointModalDirectly(
                        FlowRouter.current().queryParams.leadid,
                        templateObject
                    );
                } else if (FlowRouter.current().queryParams.customerid) {
                    openAppointModalDirectly(
                        FlowRouter.current().queryParams.customerid,
                        templateObject
                    );
                } else if (FlowRouter.current().queryParams.supplierid) {
                    openAppointModalDirectly(
                        FlowRouter.current().queryParams.supplierid,
                        templateObject
                    );
                } else {
                    $("#customerListModal").modal("toggle");
                }
                setTimeout(function() {
                    $("#tblCustomerlist_filter .form-control-sm").focus();
                    $("#tblCustomerlist_filter .form-control-sm").val("");
                    $("#tblCustomerlist_filter .form-control-sm").trigger("input");
                    var datatable = $("#tblCustomerlist").DataTable();
                    //datatable.clear();
                    //datatable.rows.add(splashArrayCustomerList);
                    datatable.draw();
                    $("#tblCustomerlist_filter .form-control-sm").trigger("input");
                    //$('#tblCustomerlist').dataTable().fnFilter(' ').draw(false);
                }, 500);
            } else {
                if (customerDataName.replace(/\s/g, "") != "") {
                    //FlowRouter.go('/customerscard?name=' + e.target.value);
                    $("#edtCustomerPOPID").val("");
                    getVS1Data("TCustomerVS1")
                        .then(function(dataObject) {
                            if (dataObject.length == 0) {
                                $(".fullScreenSpin").css("display", "inline-block");
                                sideBarService
                                    .getOneCustomerDataExByName(customerDataName)
                                    .then(function(data) {
                                        $(".fullScreenSpin").css("display", "none");
                                        let lineItems = [];
                                        $("#add-customer-title").text("Edit Customer");
                                        let popCustomerID = data.tcustomer[0].fields.ID || "";
                                        let popCustomerName =
                                            data.tcustomer[0].fields.ClientName || "";
                                        let popCustomerEmail = data.tcustomer[0].fields.Email || "";
                                        let popCustomerTitle = data.tcustomer[0].fields.Title || "";
                                        let popCustomerFirstName =
                                            data.tcustomer[0].fields.FirstName || "";
                                        let popCustomerMiddleName =
                                            data.tcustomer[0].fields.CUSTFLD10 || "";
                                        let popCustomerLastName =
                                            data.tcustomer[0].fields.LastName || "";
                                        let popCustomertfn = "" || "";
                                        let popCustomerPhone = data.tcustomer[0].fields.Phone || "";
                                        let popCustomerMobile =
                                            data.tcustomer[0].fields.Mobile || "";
                                        let popCustomerFaxnumber =
                                            data.tcustomer[0].fields.Faxnumber || "";
                                        let popCustomerSkypeName =
                                            data.tcustomer[0].fields.SkypeName || "";
                                        let popCustomerURL = data.tcustomer[0].fields.URL || "";
                                        let popCustomerStreet =
                                            data.tcustomer[0].fields.Street || "";
                                        let popCustomerStreet2 =
                                            data.tcustomer[0].fields.Street2 || "";
                                        let popCustomerState = data.tcustomer[0].fields.State || "";
                                        let popCustomerPostcode =
                                            data.tcustomer[0].fields.Postcode || "";
                                        let popCustomerCountry =
                                            data.tcustomer[0].fields.Country || LoggedCountry;
                                        let popCustomerbillingaddress =
                                            data.tcustomer[0].fields.BillStreet || "";
                                        let popCustomerbcity =
                                            data.tcustomer[0].fields.BillStreet2 || "";
                                        let popCustomerbstate =
                                            data.tcustomer[0].fields.BillState || "";
                                        let popCustomerbpostalcode =
                                            data.tcustomer[0].fields.BillPostcode || "";
                                        let popCustomerbcountry =
                                            data.tcustomer[0].fields.Billcountry || LoggedCountry;
                                        let popCustomercustfield1 =
                                            data.tcustomer[0].fields.CUSTFLD1 || "";
                                        let popCustomercustfield2 =
                                            data.tcustomer[0].fields.CUSTFLD2 || "";
                                        let popCustomercustfield3 =
                                            data.tcustomer[0].fields.CUSTFLD3 || "";
                                        let popCustomercustfield4 =
                                            data.tcustomer[0].fields.CUSTFLD4 || "";
                                        let popCustomernotes = data.tcustomer[0].fields.Notes || "";
                                        let popCustomerpreferedpayment =
                                            data.tcustomer[0].fields.PaymentMethodName || "";
                                        let popCustomerterms =
                                            data.tcustomer[0].fields.TermsName || "";
                                        let popCustomerdeliverymethod =
                                            data.tcustomer[0].fields.ShippingMethodName || "";
                                        let popCustomeraccountnumber =
                                            data.tcustomer[0].fields.ClientNo || "";
                                        let popCustomerisContractor =
                                            data.tcustomer[0].fields.Contractor || false;
                                        let popCustomerissupplier =
                                            data.tcustomer[0].fields.IsSupplier || false;
                                        let popCustomeriscustomer =
                                            data.tcustomer[0].fields.IsCustomer || false;
                                        let popCustomerTaxCode =
                                            data.tcustomer[0].fields.TaxCodeName || "";
                                        let popCustomerDiscount =
                                            data.tcustomer[0].fields.Discount || 0;
                                        let popCustomerType =
                                            data.tcustomer[0].fields.ClientTypeName || "";
                                        //$('#edtCustomerCompany').attr('readonly', true);
                                        $("#edtCustomerCompany").val(popCustomerName);
                                        $("#edtCustomerPOPID").val(popCustomerID);
                                        $("#edtCustomerPOPEmail").val(popCustomerEmail);
                                        $("#edtTitle").val(popCustomerTitle);
                                        $("#edtFirstName").val(popCustomerFirstName);
                                        $("#edtMiddleName").val(popCustomerMiddleName);
                                        $("#edtLastName").val(popCustomerLastName);
                                        $("#edtCustomerPhone").val(popCustomerPhone);
                                        $("#edtCustomerMobile").val(popCustomerMobile);
                                        $("#edtCustomerFax").val(popCustomerFaxnumber);
                                        $("#edtCustomerSkypeID").val(popCustomerSkypeName);
                                        $("#edtCustomerWebsite").val(popCustomerURL);
                                        $("#edtCustomerShippingAddress").val(popCustomerStreet);
                                        $("#edtCustomerShippingCity").val(popCustomerStreet2);
                                        $("#edtCustomerShippingState").val(popCustomerState);
                                        $("#edtCustomerShippingZIP").val(popCustomerPostcode);
                                        $("#sedtCountry").val(popCustomerCountry);
                                        $("#txaNotes").val(popCustomernotes);
                                        $("#sltPreferedPayment").val(popCustomerpreferedpayment);
                                        $("#sltTermsPOP").val(popCustomerterms);
                                        $("#sltCustomerType").val(popCustomerType);
                                        $("#edtCustomerCardDiscount").val(popCustomerDiscount);
                                        $("#edtCustomeField1").val(popCustomercustfield1);
                                        $("#edtCustomeField2").val(popCustomercustfield2);
                                        $("#edtCustomeField3").val(popCustomercustfield3);
                                        $("#edtCustomeField4").val(popCustomercustfield4);

                                        $("#sltTaxCode").val(popCustomerTaxCode);

                                        if (
                                            data.tcustomer[0].fields.Street ==
                                            data.tcustomer[0].fields.BillStreet &&
                                            data.tcustomer[0].fields.Street2 ==
                                            data.tcustomer[0].fields.BillStreet2 &&
                                            data.tcustomer[0].fields.State ==
                                            data.tcustomer[0].fields.BillState &&
                                            data.tcustomer[0].fields.Postcode ==
                                            data.tcustomer[0].fields.BillPostcode &&
                                            data.tcustomer[0].fields.Country ==
                                            data.tcustomer[0].fields.Billcountry
                                        ) {
                                            $("#chkSameAsShipping2").attr("checked", "checked");
                                        }

                                        if (data.tcustomer[0].fields.IsSupplier == true) {
                                            // $('#isformcontractor')
                                            $("#chkSameAsSupplier").attr("checked", "checked");
                                        } else {
                                            $("#chkSameAsSupplier").removeAttr("checked");
                                        }

                                        setTimeout(function() {
                                            $("#addCustomerModal").modal("show");
                                        }, 200);
                                    })
                                    .catch(function(err) {
                                        $(".fullScreenSpin").css("display", "none");
                                    });
                            } else {
                                let data = JSON.parse(dataObject[0].data);
                                let useData = data.tcustomervs1;

                                var added = false;
                                for (let i = 0; i < data.tcustomervs1.length; i++) {
                                    if (
                                        data.tcustomervs1[i].fields.ClientName === customerDataName
                                    ) {
                                        let lineItems = [];
                                        added = true;
                                        $(".fullScreenSpin").css("display", "none");
                                        $("#add-customer-title").text("Edit Customer");
                                        let popCustomerID = data.tcustomervs1[i].fields.ID || "";
                                        let popCustomerName =
                                            data.tcustomervs1[i].fields.ClientName || "";
                                        let popCustomerEmail =
                                            data.tcustomervs1[i].fields.Email || "";
                                        let popCustomerTitle =
                                            data.tcustomervs1[i].fields.Title || "";
                                        let popCustomerFirstName =
                                            data.tcustomervs1[i].fields.FirstName || "";
                                        let popCustomerMiddleName =
                                            data.tcustomervs1[i].fields.CUSTFLD10 || "";
                                        let popCustomerLastName =
                                            data.tcustomervs1[i].fields.LastName || "";
                                        let popCustomertfn = "" || "";
                                        let popCustomerPhone =
                                            data.tcustomervs1[i].fields.Phone || "";
                                        let popCustomerMobile =
                                            data.tcustomervs1[i].fields.Mobile || "";
                                        let popCustomerFaxnumber =
                                            data.tcustomervs1[i].fields.Faxnumber || "";
                                        let popCustomerSkypeName =
                                            data.tcustomervs1[i].fields.SkypeName || "";
                                        let popCustomerURL = data.tcustomervs1[i].fields.URL || "";
                                        let popCustomerStreet =
                                            data.tcustomervs1[i].fields.Street || "";
                                        let popCustomerStreet2 =
                                            data.tcustomervs1[i].fields.Street2 || "";
                                        let popCustomerState =
                                            data.tcustomervs1[i].fields.State || "";
                                        let popCustomerPostcode =
                                            data.tcustomervs1[i].fields.Postcode || "";
                                        let popCustomerCountry =
                                            data.tcustomervs1[i].fields.Country || LoggedCountry;
                                        let popCustomerbillingaddress =
                                            data.tcustomervs1[i].fields.BillStreet || "";
                                        let popCustomerbcity =
                                            data.tcustomervs1[i].fields.BillStreet2 || "";
                                        let popCustomerbstate =
                                            data.tcustomervs1[i].fields.BillState || "";
                                        let popCustomerbpostalcode =
                                            data.tcustomervs1[i].fields.BillPostcode || "";
                                        let popCustomerbcountry =
                                            data.tcustomervs1[i].fields.Billcountry || LoggedCountry;
                                        let popCustomercustfield1 =
                                            data.tcustomervs1[i].fields.CUSTFLD1 || "";
                                        let popCustomercustfield2 =
                                            data.tcustomervs1[i].fields.CUSTFLD2 || "";
                                        let popCustomercustfield3 =
                                            data.tcustomervs1[i].fields.CUSTFLD3 || "";
                                        let popCustomercustfield4 =
                                            data.tcustomervs1[i].fields.CUSTFLD4 || "";
                                        let popCustomernotes =
                                            data.tcustomervs1[i].fields.Notes || "";
                                        let popCustomerpreferedpayment =
                                            data.tcustomervs1[i].fields.PaymentMethodName || "";
                                        let popCustomerterms =
                                            data.tcustomervs1[i].fields.TermsName || "";
                                        let popCustomerdeliverymethod =
                                            data.tcustomervs1[i].fields.ShippingMethodName || "";
                                        let popCustomeraccountnumber =
                                            data.tcustomervs1[i].fields.ClientNo || "";
                                        let popCustomerisContractor =
                                            data.tcustomervs1[i].fields.Contractor || false;
                                        let popCustomerissupplier =
                                            data.tcustomervs1[i].fields.IsSupplier || false;
                                        let popCustomeriscustomer =
                                            data.tcustomervs1[i].fields.IsCustomer || false;
                                        let popCustomerTaxCode =
                                            data.tcustomervs1[i].fields.TaxCodeName || "";
                                        let popCustomerDiscount =
                                            data.tcustomervs1[i].fields.Discount || 0;
                                        let popCustomerType =
                                            data.tcustomervs1[i].fields.ClientTypeName || "";
                                        //$('#edtCustomerCompany').attr('readonly', true);
                                        $("#edtCustomerCompany").val(popCustomerName);
                                        $("#edtCustomerPOPID").val(popCustomerID);
                                        $("#edtCustomerPOPEmail").val(popCustomerEmail);
                                        $("#edtTitle").val(popCustomerTitle);
                                        $("#edtFirstName").val(popCustomerFirstName);
                                        $("#edtMiddleName").val(popCustomerMiddleName);
                                        $("#edtLastName").val(popCustomerLastName);
                                        $("#edtCustomerPhone").val(popCustomerPhone);
                                        $("#edtCustomerMobile").val(popCustomerMobile);
                                        $("#edtCustomerFax").val(popCustomerFaxnumber);
                                        $("#edtCustomerSkypeID").val(popCustomerSkypeName);
                                        $("#edtCustomerWebsite").val(popCustomerURL);
                                        $("#edtCustomerShippingAddress").val(popCustomerStreet);
                                        $("#edtCustomerShippingCity").val(popCustomerStreet2);
                                        $("#edtCustomerShippingState").val(popCustomerState);
                                        $("#edtCustomerShippingZIP").val(popCustomerPostcode);
                                        $("#sedtCountry").val(popCustomerCountry);
                                        $("#txaNotes").val(popCustomernotes);
                                        $("#sltPreferedPayment").val(popCustomerpreferedpayment);
                                        $("#sltTermsPOP").val(popCustomerterms);
                                        $("#sltCustomerType").val(popCustomerType);
                                        $("#edtCustomerCardDiscount").val(popCustomerDiscount);
                                        $("#edtCustomeField1").val(popCustomercustfield1);
                                        $("#edtCustomeField2").val(popCustomercustfield2);
                                        $("#edtCustomeField3").val(popCustomercustfield3);
                                        $("#edtCustomeField4").val(popCustomercustfield4);

                                        $("#sltTaxCode").val(popCustomerTaxCode);

                                        if (
                                            data.tcustomervs1[i].fields.Street ==
                                            data.tcustomervs1[i].fields.BillStreet &&
                                            data.tcustomervs1[i].fields.Street2 ==
                                            data.tcustomervs1[i].fields.BillStreet2 &&
                                            data.tcustomervs1[i].fields.State ==
                                            data.tcustomervs1[i].fields.BillState &&
                                            data.tcustomervs1[i].fields.Postcode ==
                                            data.tcustomervs1[i].fields.BillPostcode &&
                                            data.tcustomervs1[i].fields.Country ==
                                            data.tcustomervs1[i].fields.Billcountry
                                        ) {
                                            $("#chkSameAsShipping2").attr("checked", "checked");
                                        }

                                        if (data.tcustomervs1[i].fields.IsSupplier == true) {
                                            // $('#isformcontractor')
                                            $("#chkSameAsSupplier").attr("checked", "checked");
                                        } else {
                                            $("#chkSameAsSupplier").removeAttr("checked");
                                        }

                                        setTimeout(function() {
                                            $("#addCustomerModal").modal("show");
                                        }, 200);
                                    }
                                }
                                if (!added) {
                                    $(".fullScreenSpin").css("display", "inline-block");
                                    sideBarService
                                        .getOneCustomerDataExByName(customerDataName)
                                        .then(function(data) {
                                            $(".fullScreenSpin").css("display", "none");
                                            let lineItems = [];
                                            $("#add-customer-title").text("Edit Customer");
                                            let popCustomerID = data.tcustomer[0].fields.ID || "";
                                            let popCustomerName =
                                                data.tcustomer[0].fields.ClientName || "";
                                            let popCustomerEmail =
                                                data.tcustomer[0].fields.Email || "";
                                            let popCustomerTitle =
                                                data.tcustomer[0].fields.Title || "";
                                            let popCustomerFirstName =
                                                data.tcustomer[0].fields.FirstName || "";
                                            let popCustomerMiddleName =
                                                data.tcustomer[0].fields.CUSTFLD10 || "";
                                            let popCustomerLastName =
                                                data.tcustomer[0].fields.LastName || "";
                                            let popCustomertfn = "" || "";
                                            let popCustomerPhone =
                                                data.tcustomer[0].fields.Phone || "";
                                            let popCustomerMobile =
                                                data.tcustomer[0].fields.Mobile || "";
                                            let popCustomerFaxnumber =
                                                data.tcustomer[0].fields.Faxnumber || "";
                                            let popCustomerSkypeName =
                                                data.tcustomer[0].fields.SkypeName || "";
                                            let popCustomerURL = data.tcustomer[0].fields.URL || "";
                                            let popCustomerStreet =
                                                data.tcustomer[0].fields.Street || "";
                                            let popCustomerStreet2 =
                                                data.tcustomer[0].fields.Street2 || "";
                                            let popCustomerState =
                                                data.tcustomer[0].fields.State || "";
                                            let popCustomerPostcode =
                                                data.tcustomer[0].fields.Postcode || "";
                                            let popCustomerCountry =
                                                data.tcustomer[0].fields.Country || LoggedCountry;
                                            let popCustomerbillingaddress =
                                                data.tcustomer[0].fields.BillStreet || "";
                                            let popCustomerbcity =
                                                data.tcustomer[0].fields.BillStreet2 || "";
                                            let popCustomerbstate =
                                                data.tcustomer[0].fields.BillState || "";
                                            let popCustomerbpostalcode =
                                                data.tcustomer[0].fields.BillPostcode || "";
                                            let popCustomerbcountry =
                                                data.tcustomer[0].fields.Billcountry || LoggedCountry;
                                            let popCustomercustfield1 =
                                                data.tcustomer[0].fields.CUSTFLD1 || "";
                                            let popCustomercustfield2 =
                                                data.tcustomer[0].fields.CUSTFLD2 || "";
                                            let popCustomercustfield3 =
                                                data.tcustomer[0].fields.CUSTFLD3 || "";
                                            let popCustomercustfield4 =
                                                data.tcustomer[0].fields.CUSTFLD4 || "";
                                            let popCustomernotes =
                                                data.tcustomer[0].fields.Notes || "";
                                            let popCustomerpreferedpayment =
                                                data.tcustomer[0].fields.PaymentMethodName || "";
                                            let popCustomerterms =
                                                data.tcustomer[0].fields.TermsName || "";
                                            let popCustomerdeliverymethod =
                                                data.tcustomer[0].fields.ShippingMethodName || "";
                                            let popCustomeraccountnumber =
                                                data.tcustomer[0].fields.ClientNo || "";
                                            let popCustomerisContractor =
                                                data.tcustomer[0].fields.Contractor || false;
                                            let popCustomerissupplier =
                                                data.tcustomer[0].fields.IsSupplier || false;
                                            let popCustomeriscustomer =
                                                data.tcustomer[0].fields.IsCustomer || false;
                                            let popCustomerTaxCode =
                                                data.tcustomer[0].fields.TaxCodeName || "";
                                            let popCustomerDiscount =
                                                data.tcustomer[0].fields.Discount || 0;
                                            let popCustomerType =
                                                data.tcustomer[0].fields.ClientTypeName || "";
                                            //$('#edtCustomerCompany').attr('readonly', true);
                                            $("#edtCustomerCompany").val(popCustomerName);
                                            $("#edtCustomerPOPID").val(popCustomerID);
                                            $("#edtCustomerPOPEmail").val(popCustomerEmail);
                                            $("#edtTitle").val(popCustomerTitle);
                                            $("#edtFirstName").val(popCustomerFirstName);
                                            $("#edtMiddleName").val(popCustomerMiddleName);
                                            $("#edtLastName").val(popCustomerLastName);
                                            $("#edtCustomerPhone").val(popCustomerPhone);
                                            $("#edtCustomerMobile").val(popCustomerMobile);
                                            $("#edtCustomerFax").val(popCustomerFaxnumber);
                                            $("#edtCustomerSkypeID").val(popCustomerSkypeName);
                                            $("#edtCustomerWebsite").val(popCustomerURL);
                                            $("#edtCustomerShippingAddress").val(popCustomerStreet);
                                            $("#edtCustomerShippingCity").val(popCustomerStreet2);
                                            $("#edtCustomerShippingState").val(popCustomerState);
                                            $("#edtCustomerShippingZIP").val(popCustomerPostcode);
                                            $("#sedtCountry").val(popCustomerCountry);
                                            $("#txaNotes").val(popCustomernotes);
                                            $("#sltPreferedPayment").val(popCustomerpreferedpayment);
                                            $("#sltTermsPOP").val(popCustomerterms);
                                            $("#sltCustomerType").val(popCustomerType);
                                            $("#edtCustomerCardDiscount").val(popCustomerDiscount);
                                            $("#edtCustomeField1").val(popCustomercustfield1);
                                            $("#edtCustomeField2").val(popCustomercustfield2);
                                            $("#edtCustomeField3").val(popCustomercustfield3);
                                            $("#edtCustomeField4").val(popCustomercustfield4);

                                            $("#sltTaxCode").val(popCustomerTaxCode);

                                            if (
                                                data.tcustomer[0].fields.Street ==
                                                data.tcustomer[0].fields.BillStreet &&
                                                data.tcustomer[0].fields.Street2 ==
                                                data.tcustomer[0].fields.BillStreet2 &&
                                                data.tcustomer[0].fields.State ==
                                                data.tcustomer[0].fields.BillState &&
                                                data.tcustomer[0].fields.Postcode ==
                                                data.tcustomer[0].fields.BillPostcode &&
                                                data.tcustomer[0].fields.Country ==
                                                data.tcustomer[0].fields.Billcountry
                                            ) {
                                                $("#chkSameAsShipping2").attr("checked", "checked");
                                            }

                                            if (data.tcustomer[0].fields.IsSupplier == true) {
                                                // $('#isformcontractor')
                                                $("#chkSameAsSupplier").attr("checked", "checked");
                                            } else {
                                                $("#chkSameAsSupplier").removeAttr("checked");
                                            }

                                            setTimeout(function() {
                                                $("#addCustomerModal").modal("show");
                                            }, 200);
                                        })
                                        .catch(function(err) {
                                            $(".fullScreenSpin").css("display", "none");
                                        });
                                }
                            }
                        })
                        .catch(function(err) {
                            sideBarService
                                .getOneCustomerDataExByName(customerDataName)
                                .then(function(data) {
                                    $(".fullScreenSpin").css("display", "none");
                                    let lineItems = [];
                                    $("#add-customer-title").text("Edit Customer");
                                    let popCustomerID = data.tcustomer[0].fields.ID || "";
                                    let popCustomerName =
                                        data.tcustomer[0].fields.ClientName || "";
                                    let popCustomerEmail = data.tcustomer[0].fields.Email || "";
                                    let popCustomerTitle = data.tcustomer[0].fields.Title || "";
                                    let popCustomerFirstName =
                                        data.tcustomer[0].fields.FirstName || "";
                                    let popCustomerMiddleName =
                                        data.tcustomer[0].fields.CUSTFLD10 || "";
                                    let popCustomerLastName =
                                        data.tcustomer[0].fields.LastName || "";
                                    let popCustomertfn = "" || "";
                                    let popCustomerPhone = data.tcustomer[0].fields.Phone || "";
                                    let popCustomerMobile = data.tcustomer[0].fields.Mobile || "";
                                    let popCustomerFaxnumber =
                                        data.tcustomer[0].fields.Faxnumber || "";
                                    let popCustomerSkypeName =
                                        data.tcustomer[0].fields.SkypeName || "";
                                    let popCustomerURL = data.tcustomer[0].fields.URL || "";
                                    let popCustomerStreet = data.tcustomer[0].fields.Street || "";
                                    let popCustomerStreet2 =
                                        data.tcustomer[0].fields.Street2 || "";
                                    let popCustomerState = data.tcustomer[0].fields.State || "";
                                    let popCustomerPostcode =
                                        data.tcustomer[0].fields.Postcode || "";
                                    let popCustomerCountry =
                                        data.tcustomer[0].fields.Country || LoggedCountry;
                                    let popCustomerbillingaddress =
                                        data.tcustomer[0].fields.BillStreet || "";
                                    let popCustomerbcity =
                                        data.tcustomer[0].fields.BillStreet2 || "";
                                    let popCustomerbstate =
                                        data.tcustomer[0].fields.BillState || "";
                                    let popCustomerbpostalcode =
                                        data.tcustomer[0].fields.BillPostcode || "";
                                    let popCustomerbcountry =
                                        data.tcustomer[0].fields.Billcountry || LoggedCountry;
                                    let popCustomercustfield1 =
                                        data.tcustomer[0].fields.CUSTFLD1 || "";
                                    let popCustomercustfield2 =
                                        data.tcustomer[0].fields.CUSTFLD2 || "";
                                    let popCustomercustfield3 =
                                        data.tcustomer[0].fields.CUSTFLD3 || "";
                                    let popCustomercustfield4 =
                                        data.tcustomer[0].fields.CUSTFLD4 || "";
                                    let popCustomernotes = data.tcustomer[0].fields.Notes || "";
                                    let popCustomerpreferedpayment =
                                        data.tcustomer[0].fields.PaymentMethodName || "";
                                    let popCustomerterms =
                                        data.tcustomer[0].fields.TermsName || "";
                                    let popCustomerdeliverymethod =
                                        data.tcustomer[0].fields.ShippingMethodName || "";
                                    let popCustomeraccountnumber =
                                        data.tcustomer[0].fields.ClientNo || "";
                                    let popCustomerisContractor =
                                        data.tcustomer[0].fields.Contractor || false;
                                    let popCustomerissupplier =
                                        data.tcustomer[0].fields.IsSupplier || false;
                                    let popCustomeriscustomer =
                                        data.tcustomer[0].fields.IsCustomer || false;
                                    let popCustomerTaxCode =
                                        data.tcustomer[0].fields.TaxCodeName || "";
                                    let popCustomerDiscount =
                                        data.tcustomer[0].fields.Discount || 0;
                                    let popCustomerType =
                                        data.tcustomer[0].fields.ClientTypeName || "";
                                    //$('#edtCustomerCompany').attr('readonly', true);
                                    $("#edtCustomerCompany").val(popCustomerName);
                                    $("#edtCustomerPOPID").val(popCustomerID);
                                    $("#edtCustomerPOPEmail").val(popCustomerEmail);
                                    $("#edtTitle").val(popCustomerTitle);
                                    $("#edtFirstName").val(popCustomerFirstName);
                                    $("#edtMiddleName").val(popCustomerMiddleName);
                                    $("#edtLastName").val(popCustomerLastName);
                                    $("#edtCustomerPhone").val(popCustomerPhone);
                                    $("#edtCustomerMobile").val(popCustomerMobile);
                                    $("#edtCustomerFax").val(popCustomerFaxnumber);
                                    $("#edtCustomerSkypeID").val(popCustomerSkypeName);
                                    $("#edtCustomerWebsite").val(popCustomerURL);
                                    $("#edtCustomerShippingAddress").val(popCustomerStreet);
                                    $("#edtCustomerShippingCity").val(popCustomerStreet2);
                                    $("#edtCustomerShippingState").val(popCustomerState);
                                    $("#edtCustomerShippingZIP").val(popCustomerPostcode);
                                    $("#sedtCountry").val(popCustomerCountry);
                                    $("#txaNotes").val(popCustomernotes);
                                    $("#sltPreferedPayment").val(popCustomerpreferedpayment);
                                    $("#sltTermsPOP").val(popCustomerterms);
                                    $("#sltCustomerType").val(popCustomerType);
                                    $("#edtCustomerCardDiscount").val(popCustomerDiscount);
                                    $("#edtCustomeField1").val(popCustomercustfield1);
                                    $("#edtCustomeField2").val(popCustomercustfield2);
                                    $("#edtCustomeField3").val(popCustomercustfield3);
                                    $("#edtCustomeField4").val(popCustomercustfield4);

                                    $("#sltTaxCode").val(popCustomerTaxCode);

                                    if (
                                        data.tcustomer[0].fields.Street ==
                                        data.tcustomer[0].fields.BillStreet &&
                                        data.tcustomer[0].fields.Street2 ==
                                        data.tcustomer[0].fields.BillStreet2 &&
                                        data.tcustomer[0].fields.State ==
                                        data.tcustomer[0].fields.BillState &&
                                        data.tcustomer[0].fields.Postcode ==
                                        data.tcustomer[0].fields.BillPostcode &&
                                        data.tcustomer[0].fields.Country ==
                                        data.tcustomer[0].fields.Billcountry
                                    ) {
                                        $("#chkSameAsShipping2").attr("checked", "checked");
                                    }

                                    if (data.tcustomer[0].fields.IsSupplier == true) {
                                        // $('#isformcontractor')
                                        $("#chkSameAsSupplier").attr("checked", "checked");
                                    } else {
                                        $("#chkSameAsSupplier").removeAttr("checked");
                                    }

                                    setTimeout(function() {
                                        $("#addCustomerModal").modal("show");
                                    }, 200);
                                })
                                .catch(function(err) {
                                    $(".fullScreenSpin").css("display", "none");
                                });
                        });
                } else {
                    if (FlowRouter.current().queryParams.leadid) {
                        openAppointModalDirectly(
                            FlowRouter.current().queryParams.leadid,
                            templateObject
                        );
                    } else if (FlowRouter.current().queryParams.customerid) {
                        openAppointModalDirectly(
                            FlowRouter.current().queryParams.customerid,
                            templateObject
                        );
                    } else if (FlowRouter.current().queryParams.supplierid) {
                        openAppointModalDirectly(
                            FlowRouter.current().queryParams.supplierid,
                            templateObject
                        );
                    } else {
                        $("#customerListModal").modal();
                    }
                    setTimeout(function() {
                        $("#tblCustomerlist_filter .form-control-sm").focus();
                        $("#tblCustomerlist_filter .form-control-sm").val("");
                        $("#tblCustomerlist_filter .form-control-sm").trigger("input");
                        var datatable = $("#tblCustomerlist").DataTable();
                        //datatable.clear();
                        //datatable.rows.add(splashArrayCustomerList);
                        datatable.draw();
                        $("#tblCustomerlist_filter .form-control-sm").trigger("input");
                        //$('#tblCustomerlist').dataTable().fnFilter(' ').draw(false);
                    }, 500);
                }
            }
        });

    $("#product-list, #product-list-1")
        .editableSelect()
        .on("click.editable-select", function(e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            var productDataName = e.target.value || "";
            //var productDataID = el.context.value || '';
            // if(el){
            //   var productCostData = el.context.id || 0;
            //   $('#edtProductCost').val(productCostData);
            // }
            if (event.pageX > offset.left + $earch.width() - 10) {
                // X button 16px wide?
                $("#productListModal").modal("toggle");
                setTimeout(function() {
                    $("#tblInventoryPayrollService_filter .form-control-sm").focus();
                    $("#tblInventoryPayrollService_filter .form-control-sm").val("");
                    $("#tblInventoryPayrollService_filter .form-control-sm").trigger(
                        "input"
                    );

                    var datatable = $("#tblInventoryPayrollService").DataTable();
                    datatable.draw();
                    $("#tblInventoryPayrollService_filter .form-control-sm").trigger(
                        "input"
                    );
                }, 500);
            } else {
                // var productDataID = $(event.target).attr('prodid').replace(/\s/g, '') || '';
                if (productDataName.replace(/\s/g, "") != "") {
                    //FlowRouter.go('/productview?prodname=' + $(event.target).text());
                    let lineExtaSellItems = [];
                    let lineExtaSellObj = {};
                    $(".fullScreenSpin").css("display", "inline-block");
                    getVS1Data("TProductWeb")
                        .then(function(dataObject) {
                            if (dataObject.length == 0) {
                                sideBarService
                                    .getOneProductdatavs1byname(productDataName)
                                    .then(function(data) {
                                        $(".fullScreenSpin").css("display", "none");
                                        let lineItems = [];
                                        let lineItemObj = {};
                                        let currencySymbol = Currency;
                                        let totalquantity = 0;
                                        let productname = data.tproduct[0].fields.ProductName || "";
                                        let productcode = data.tproduct[0].fields.PRODUCTCODE || "";
                                        let productprintName =
                                            data.tproduct[0].fields.ProductPrintName || "";
                                        let assetaccount =
                                            data.tproduct[0].fields.AssetAccount || "";
                                        let buyqty1cost =
                                            utilityService.modifynegativeCurrencyFormat(
                                                data.tproduct[0].fields.BuyQty1Cost
                                            ) || 0;
                                        let cogsaccount = data.tproduct[0].fields.CogsAccount || "";
                                        let taxcodepurchase =
                                            data.tproduct[0].fields.TaxCodePurchase || "";
                                        let purchasedescription =
                                            data.tproduct[0].fields.PurchaseDescription || "";
                                        let sellqty1price =
                                            utilityService.modifynegativeCurrencyFormat(
                                                data.tproduct[0].fields.SellQty1Price
                                            ) || 0;
                                        let incomeaccount =
                                            data.tproduct[0].fields.IncomeAccount || "";
                                        let taxcodesales =
                                            data.tproduct[0].fields.TaxCodeSales || "";
                                        let salesdescription =
                                            data.tproduct[0].fields.SalesDescription || "";
                                        let active = data.tproduct[0].fields.Active;
                                        let lockextrasell =
                                            data.tproduct[0].fields.LockExtraSell || "";
                                        let customfield1 = data.tproduct[0].fields.CUSTFLD1 || "";
                                        let customfield2 = data.tproduct[0].fields.CUSTFLD2 || "";
                                        let barcode = data.tproduct[0].fields.BARCODE || "";
                                        $("#selectProductID")
                                            .val(data.tproduct[0].fields.ID)
                                            .trigger("change");
                                        $("#add-product-title").text("Edit Product");
                                        $("#edtproductname").val(productname);
                                        $("#edtsellqty1price").val(sellqty1price);
                                        $("#txasalesdescription").val(salesdescription);
                                        $("#sltsalesacount").val(incomeaccount);
                                        $("#slttaxcodesales").val(taxcodesales);
                                        $("#edtbarcode").val(barcode);
                                        $("#txapurchasedescription").val(purchasedescription);
                                        $("#sltcogsaccount").val(cogsaccount);
                                        $("#slttaxcodepurchase").val(taxcodepurchase);
                                        $("#edtbuyqty1cost").val(buyqty1cost);

                                        setTimeout(function() {
                                            $("#newProductModal").modal("show");
                                        }, 500);
                                    })
                                    .catch(function(err) {
                                        $(".fullScreenSpin").css("display", "none");
                                    });
                            } else {
                                let data = JSON.parse(dataObject[0].data);
                                let useData = data.tproductvs1;
                                var added = false;

                                for (let i = 0; i < data.tproductvs1.length; i++) {
                                    if (
                                        data.tproductvs1[i].fields.ProductName === productDataName
                                    ) {
                                        added = true;
                                        $(".fullScreenSpin").css("display", "none");
                                        let lineItems = [];
                                        let lineItemObj = {};
                                        let currencySymbol = Currency;
                                        let totalquantity = 0;

                                        let productname =
                                            data.tproductvs1[i].fields.ProductName || "";
                                        let productcode =
                                            data.tproductvs1[i].fields.PRODUCTCODE || "";
                                        let productprintName =
                                            data.tproductvs1[i].fields.ProductPrintName || "";
                                        let assetaccount =
                                            data.tproductvs1[i].fields.AssetAccount || "";
                                        let buyqty1cost =
                                            utilityService.modifynegativeCurrencyFormat(
                                                data.tproductvs1[i].fields.BuyQty1Cost
                                            ) || 0;
                                        let cogsaccount =
                                            data.tproductvs1[i].fields.CogsAccount || "";
                                        let taxcodepurchase =
                                            data.tproductvs1[i].fields.TaxCodePurchase || "";
                                        let purchasedescription =
                                            data.tproductvs1[i].fields.PurchaseDescription || "";
                                        let sellqty1price =
                                            utilityService.modifynegativeCurrencyFormat(
                                                data.tproductvs1[i].fields.SellQty1Price
                                            ) || 0;
                                        let incomeaccount =
                                            data.tproductvs1[i].fields.IncomeAccount || "";
                                        let taxcodesales =
                                            data.tproductvs1[i].fields.TaxCodeSales || "";
                                        let salesdescription =
                                            data.tproductvs1[i].fields.SalesDescription || "";
                                        let active = data.tproductvs1[i].fields.Active;
                                        let lockextrasell =
                                            data.tproductvs1[i].fields.LockExtraSell || "";
                                        let customfield1 =
                                            data.tproductvs1[i].fields.CUSTFLD1 || "";
                                        let customfield2 =
                                            data.tproductvs1[i].fields.CUSTFLD2 || "";
                                        let barcode = data.tproductvs1[i].fields.BARCODE || "";
                                        $("#selectProductID")
                                            .val(data.tproductvs1[i].fields.ID)
                                            .trigger("change");
                                        $("#add-product-title").text("Edit Product");
                                        $("#edtproductname").val(productname);
                                        $("#edtsellqty1price").val(sellqty1price);
                                        $("#txasalesdescription").val(salesdescription);
                                        $("#sltsalesacount").val(incomeaccount);
                                        $("#slttaxcodesales").val(taxcodesales);
                                        $("#edtbarcode").val(barcode);
                                        $("#txapurchasedescription").val(purchasedescription);
                                        $("#sltcogsaccount").val(cogsaccount);
                                        $("#slttaxcodepurchase").val(taxcodepurchase);
                                        $("#edtbuyqty1cost").val(buyqty1cost);

                                        setTimeout(function() {
                                            $("#newProductModal").modal("show");
                                        }, 500);
                                    }
                                }
                                if (!added) {
                                    sideBarService
                                        .getOneProductdatavs1byname(productDataName)
                                        .then(function(data) {
                                            $(".fullScreenSpin").css("display", "none");
                                            let lineItems = [];
                                            let lineItemObj = {};
                                            let currencySymbol = Currency;
                                            let totalquantity = 0;
                                            let productname =
                                                data.tproduct[0].fields.ProductName || "";
                                            let productcode =
                                                data.tproduct[0].fields.PRODUCTCODE || "";
                                            let productprintName =
                                                data.tproduct[0].fields.ProductPrintName || "";
                                            let assetaccount =
                                                data.tproduct[0].fields.AssetAccount || "";
                                            let buyqty1cost =
                                                utilityService.modifynegativeCurrencyFormat(
                                                    data.tproduct[0].fields.BuyQty1Cost
                                                ) || 0;
                                            let cogsaccount =
                                                data.tproduct[0].fields.CogsAccount || "";
                                            let taxcodepurchase =
                                                data.tproduct[0].fields.TaxCodePurchase || "";
                                            let purchasedescription =
                                                data.tproduct[0].fields.PurchaseDescription || "";
                                            let sellqty1price =
                                                utilityService.modifynegativeCurrencyFormat(
                                                    data.tproduct[0].fields.SellQty1Price
                                                ) || 0;
                                            let incomeaccount =
                                                data.tproduct[0].fields.IncomeAccount || "";
                                            let taxcodesales =
                                                data.tproduct[0].fields.TaxCodeSales || "";
                                            let salesdescription =
                                                data.tproduct[0].fields.SalesDescription || "";
                                            let active = data.tproduct[0].fields.Active;
                                            let lockextrasell =
                                                data.tproduct[0].fields.LockExtraSell || "";
                                            let customfield1 = data.tproduct[0].fields.CUSTFLD1 || "";
                                            let customfield2 = data.tproduct[0].fields.CUSTFLD2 || "";
                                            let barcode = data.tproduct[0].fields.BARCODE || "";
                                            $("#selectProductID")
                                                .val(data.tproduct[0].fields.ID)
                                                .trigger("change");
                                            $("#add-product-title").text("Edit Product");
                                            $("#edtproductname").val(productname);
                                            $("#edtsellqty1price").val(sellqty1price);
                                            $("#txasalesdescription").val(salesdescription);
                                            $("#sltsalesacount").val(incomeaccount);
                                            $("#slttaxcodesales").val(taxcodesales);
                                            $("#edtbarcode").val(barcode);
                                            $("#txapurchasedescription").val(purchasedescription);
                                            $("#sltcogsaccount").val(cogsaccount);
                                            $("#slttaxcodepurchase").val(taxcodepurchase);
                                            $("#edtbuyqty1cost").val(buyqty1cost);

                                            setTimeout(function() {
                                                $("#newProductModal").modal("show");
                                            }, 500);
                                        })
                                        .catch(function(err) {
                                            $(".fullScreenSpin").css("display", "none");
                                        });
                                }
                            }
                        })
                        .catch(function(err) {
                            sideBarService
                                .getOneProductdatavs1byname(productDataName)
                                .then(function(data) {
                                    $(".fullScreenSpin").css("display", "none");
                                    let lineItems = [];
                                    let lineItemObj = {};
                                    let currencySymbol = Currency;
                                    let totalquantity = 0;
                                    let productname = data.tproduct[0].fields.ProductName || "";
                                    let productcode = data.tproduct[0].fields.PRODUCTCODE || "";
                                    let productprintName =
                                        data.tproduct[0].fields.ProductPrintName || "";
                                    let assetaccount = data.tproduct[0].fields.AssetAccount || "";
                                    let buyqty1cost =
                                        utilityService.modifynegativeCurrencyFormat(
                                            data.tproduct[0].fields.BuyQty1Cost
                                        ) || 0;
                                    let cogsaccount = data.tproduct[0].fields.CogsAccount || "";
                                    let taxcodepurchase =
                                        data.tproduct[0].fields.TaxCodePurchase || "";
                                    let purchasedescription =
                                        data.tproduct[0].fields.PurchaseDescription || "";
                                    let sellqty1price =
                                        utilityService.modifynegativeCurrencyFormat(
                                            data.tproduct[0].fields.SellQty1Price
                                        ) || 0;
                                    let incomeaccount =
                                        data.tproduct[0].fields.IncomeAccount || "";
                                    let taxcodesales = data.tproduct[0].fields.TaxCodeSales || "";
                                    let salesdescription =
                                        data.tproduct[0].fields.SalesDescription || "";
                                    let active = data.tproduct[0].fields.Active;
                                    let lockextrasell =
                                        data.tproduct[0].fields.LockExtraSell || "";
                                    let customfield1 = data.tproduct[0].fields.CUSTFLD1 || "";
                                    let customfield2 = data.tproduct[0].fields.CUSTFLD2 || "";
                                    let barcode = data.tproduct[0].fields.BARCODE || "";
                                    $("#selectProductID")
                                        .val(data.tproduct[0].fields.ID)
                                        .trigger("change");
                                    $("#add-product-title").text("Edit Product");
                                    $("#edtproductname").val(productname);
                                    $("#edtsellqty1price").val(sellqty1price);
                                    $("#txasalesdescription").val(salesdescription);
                                    $("#sltsalesacount").val(incomeaccount);
                                    $("#slttaxcodesales").val(taxcodesales);
                                    $("#edtbarcode").val(barcode);
                                    $("#txapurchasedescription").val(purchasedescription);
                                    $("#sltcogsaccount").val(cogsaccount);
                                    $("#slttaxcodepurchase").val(taxcodepurchase);
                                    $("#edtbuyqty1cost").val(buyqty1cost);

                                    setTimeout(function() {
                                        $("#newProductModal").modal("show");
                                    }, 500);
                                })
                                .catch(function(err) {
                                    $(".fullScreenSpin").css("display", "none");
                                });
                        });

                    setTimeout(function() {
                        var begin_day_value = $("#event_begin_day").attr("value");
                        $("#dtDateTo")
                            .datepicker({
                                showOn: "button",
                                buttonText: "Show Date",
                                buttonImageOnly: true,
                                buttonImage: "/img/imgCal2.png",
                                constrainInput: false,
                                dateFormat: "d/mm/yy",
                                showOtherMonths: true,
                                selectOtherMonths: true,
                                changeMonth: true,
                                changeYear: true,
                                yearRange: "-90:+10",
                            })
                            .keyup(function(e) {
                                if (e.keyCode == 8 || e.keyCode == 46) {
                                    $("#dtDateTo,#dtDateFrom").val("");
                                }
                            });

                        $("#dtDateFrom")
                            .datepicker({
                                showOn: "button",
                                buttonText: "Show Date",
                                altField: "#dtDateFrom",
                                buttonImageOnly: true,
                                buttonImage: "/img/imgCal2.png",
                                constrainInput: false,
                                dateFormat: "d/mm/yy",
                                showOtherMonths: true,
                                selectOtherMonths: true,
                                changeMonth: true,
                                changeYear: true,
                                yearRange: "-90:+10",
                            })
                            .keyup(function(e) {
                                if (e.keyCode == 8 || e.keyCode == 46) {
                                    $("#dtDateTo,#dtDateFrom").val("");
                                }
                            });

                        $(".ui-datepicker .ui-state-hihglight").removeClass(
                            "ui-state-highlight"
                        );
                    }, 1000);
                    //}

                    templateObject.getProductClassQtyData = function() {
                        productService
                            .getOneProductClassQtyData(currentProductID)
                            .then(function(data) {
                                $(".fullScreenSpin").css("display", "none");
                                let qtylineItems = [];
                                let qtylineItemObj = {};
                                let currencySymbol = Currency;
                                let totaldeptquantity = 0;

                                for (let j in data.tproductclassquantity) {
                                    qtylineItemObj = {
                                        department: data.tproductclassquantity[j].DepartmentName || "",
                                        quantity: data.tproductclassquantity[j].InStockQty || 0,
                                    };
                                    totaldeptquantity += data.tproductclassquantity[j].InStockQty;
                                    qtylineItems.push(qtylineItemObj);
                                }
                                // $('#edttotalqtyinstock').val(totaldeptquantity);
                                templateObject.productqtyrecords.set(qtylineItems);
                                templateObject.totaldeptquantity.set(totaldeptquantity);
                            })
                            .catch(function(err) {
                                $(".fullScreenSpin").css("display", "none");
                            });
                    };

                    //templateObject.getProductClassQtyData();
                    //templateObject.getProductData();
                } else {
                    $("#productListModal").modal("toggle");

                    setTimeout(function() {
                        $("#tblInventoryPayrollService_filter .form-control-sm").focus();
                        $("#tblInventoryPayrollService_filter .form-control-sm").val("");
                        $("#tblInventoryPayrollService_filter .form-control-sm").trigger(
                            "input"
                        );

                        var datatable = $("#tblInventoryPayrollService").DataTable();
                        datatable.draw();
                        $("#tblInventoryPayrollService_filter .form-control-sm").trigger(
                            "input"
                        );
                    }, 500);
                }
            }
        });

    $(document).on("click", "#employeeListModal #tblEmployeelist tbody tr", function(e) {

        // for taskDetailModal

        // end

        let employeeName = $(this).find(".colEmployeeName").text() || '';
        let employeeID = $(this).find(".colID").text() || '';
        templateObject.empID.set(employeeID);
        let draggedEmployeeID = templateObject.empID.get();
        let calendarData = templateObject.employeeOptions.get();
        let calendarSet = templateObject.globalSettings.get();
        let employees = templateObject.employeerecords.get();
        let overridesettings = employees.filter((employeeData) => {
            return employeeData.id == parseInt(draggedEmployeeID);
        });

        let empData = calendarData.filter((calendarOpt) => {
            return calendarOpt.EmployeeID == parseInt(draggedEmployeeID);
        });

        document.getElementById("frmAppointment").reset();
        $(".paused").hide();
        // $("#btnHold").prop("disabled", false);
        // $("#btnStartAppointment").prop("disabled", false);
        // $("#btnStopAppointment").prop("disabled", false);
        // $("#startTime").prop("disabled", false);
        // $("#endTime").prop("disabled", false);
        // $("#tActualStartTime").prop("disabled", false);
        // $("#tActualEndTime").prop("disabled", false);
        // $("#txtActualHoursSpent").prop("disabled", false);

        $("#appID").val("");
        $("#updateID").val("");
        if (Session.get("CloudAppointmentStartStopAccessLevel") == true) {
            //$("#btnHold").prop("disabled", true);
        }
        if (overridesettings[0].override == "false") {
            document.getElementById("product-list").value =
                calendarSet.defaultProduct || "";
            document.getElementById("product-list-1").value =
                calendarSet.defaultProduct || "";
        } else if (overridesettings[0].override == "true") {
            if (empData.length > 0) {
                document.getElementById("product-list").value =
                    empData[empData.length - 1].DefaultServiceProduct || "";
                document.getElementById("product-list-1").value =
                    empData[empData.length - 1].DefaultServiceProduct || "";
            } else {
                document.getElementById("product-list").value =
                    calendarSet.defaultProduct || "";
                document.getElementById("product-list-1").value =
                    calendarSet.defaultProduct || "";
            }
        } else {
            if (templateObject.empDuration.get() != "") {
                var endTime = moment(startTime, "HH:mm")
                    .add(parseInt(templateObject.empDuration.get()), "hours")
                    .format("HH:mm");
                document.getElementById("endTime").value = endTime;
                let hoursFormattedStartTime =
                    templateObject.timeFormat(templateObject.empDuration.get()) || "";
                document.getElementById("txtBookedHoursSpent").value =
                    hoursFormattedStartTime;
            } else {
                var appointmentHours = moment(
                    event.dateStr.substr(event.dateStr.length - 5),
                    "HH:mm"
                ).format("HH:mm");
                var endTime = moment(startTime, "HH:mm")
                    .add(appointmentHours.substr(0, 2), "hours")
                    .format("HH:mm");
                document.getElementById("endTime").value = endTime;
                var hoursSpent = moment(appointmentHours, "hours").format("HH");
                let hoursFormattedStartTime =
                    templateObject.timeFormat(hoursSpent.replace(/^0+/, "")) || "";
                document.getElementById("txtBookedHoursSpent").value =
                    hoursFormattedStartTime;
            }

            if (empData.length > 0) {
                document.getElementById("product-list").value =
                    empData[empData.length - 1].DefaultServiceProduct || "";
                document.getElementById("product-list-1").value =
                    empData[empData.length - 1].DefaultServiceProduct || "";
                // $('#product-list').prepend('<option value=' + empData[0].Id + ' selected>' + empData[empData.length - 1].DefaultServiceProduct + '</option>');
                // $("#product-list")[0].options[0].selected = true;
            } else {
                document.getElementById("product-list").value =
                    calendarSet.defaultProduct || "";
                document.getElementById("product-list-1").value =
                    calendarSet.defaultProduct || "";
                // $('#product-list').prepend('<option value=' + calendarSet.id + ' selected>' + calendarSet.defaultProduct + '</option>');
                // $("#product-list")[0].options[0].selected = true;
            }
        }

        $('#employee_name').val(employeeName);
        $('#employeeListModal').modal('toggle');
        $("#event-modal").modal();
        setTimeout(() => {
            if (localStorage.getItem("smsCustomerAppt") == "false") {
                $("#chkSMSCustomer").prop("checked", false);
            }
            if (localStorage.getItem("smsUserAppt") == "false") {
                $("#chkSMSUser").prop("checked", false);
            }
            if (localStorage.getItem("emailCustomerAppt") == "false") {
                $("#customerEmail").prop("checked", false);
            }
            if (localStorage.getItem("emailUserAppt") == "false") {
                $("#userEmail").prop("checked", false);
            }
        }, 100);
    });

    $(document).on("click", ".addExtraProduct", function(e) {
        $("#productListModal1").modal("toggle");
        setTimeout(function() {
            $("#tblInventoryCheckbox_filter .form-control-sm").focus();
            $("#tblInventoryCheckbox_filter .form-control-sm").val("");
            $("#tblInventoryCheckbox_filter .form-control-sm").trigger("input");

            var datatable = $("#tblInventoryCheckbox").DataTable();
            datatable.draw();
            $("#tblInventoryCheckbox_filter .form-control-sm").trigger("input");
        }, 500);
    });

    /* On clik Inventory Line */
    $(document).on("click", "#tblInventoryPayrollService tbody tr", function(e) {
        var tableProductService = $(this);

        let lineProductName = tableProductService.find(".productName").text() || "";
        let lineProductDesc = tableProductService.find(".productDesc").text() || "";
        let lineProdCost = tableProductService.find(".costPrice").text() || 0;
        $(".product-list").val(lineProductName);
        $("#tblInventoryPayrollService_filter .form-control-sm").val("");
        $("#productListModal").modal("toggle");

        setTimeout(function() {
            //$('#tblCustomerlist_filter .form-control-sm').focus();
            $(".btnRefreshProduct").trigger("click");
            $(".fullScreenSpin").css("display", "none");
        }, 1000);
    });

    $(document).on("click", "#tblInventory tbody tr", async function(e) {
        $(".colProductName").removeClass("boldtablealertsborder");
        let selectLineID = $("#selectLineID").val();
        var table = $(this);
        let $tblrows = $("#tblExtraProducts tbody tr");

        if (selectLineID) {
            let lineProductId = table.find(".colProuctPOPID").text();
            let lineProductName = table.find(".productName").text();
            let lineProductDesc = table.find(".productDesc").text();
            let lineUnitPrice = table.find(".salePrice").text();

            $("#" + selectLineID + " .lineProductName").val(lineProductName);
            // $('#' + selectLineID + " .lineProductName").attr("prodid", table.find(".colProuctPOPID").text());
            $("#" + selectLineID + " .lineProductDesc").text(lineProductDesc);
            // $("#" + selectLineID + " .lineOrdered").val(1);
            // $("#" + selectLineID + " .lineQty").val(1);
            $("#" + selectLineID + " .lineSalesPrice").text(lineUnitPrice);
            $("#" + selectLineID).attr("id", lineProductId);

            $("#productCheck-" + selectLineID).prop("checked", false);
            $("#productCheck-" + lineProductId).prop("checked", true);
            $(".addExtraProduct").removeClass("btn-primary").addClass("btn-success");

            $("#productListModal2").modal("toggle");
        }

        $("#tblInventory_filter .form-control-sm").val("");
        setTimeout(function() {
            //$('#tblCustomerlist_filter .form-control-sm').focus();
            $("#btnselProductFees").trigger("click");
            $(".fullScreenSpin").css("display", "none");
        }, 100);
    });

    $(document).on("click", ".appointmentCustomer #tblCustomerlist tbody tr", function(e) {
        //$("#updateID").val("");
        let checkIncludeAllProducts = templateObject.includeAllProducts.get();
        let getAllEmployeeData = templateObject.employeerecords.get() || "";
        let getEmployeeID = templateObject.empID.get() || "";
        document.getElementById("customer").value = $(this)
            .find(".colCompany")
            .text();
        document.getElementById("phone").value = $(this).find(".colPhone").text();
        document.getElementById("mobile").value = $(this)
            .find(".colMobile")
            .text()
            .replace("+", "");
        document.getElementById("state").value = $(this).find(".colState").text();
        document.getElementById("country").value = $(this)
            .find(".colCountry")
            .text();
        document.getElementById("address").value = $(this)
            .find(".colStreetAddress")
            .text()
            .replace(/(?:\r\n|\r|\n)/g, ", ");
        if (Session.get("CloudAppointmentNotes") == true) {
            document.getElementById("txtNotes").value = $(this)
                .find(".colNotes")
                .text();
            document.getElementById("txtNotes-1").value = $(this)
                .find(".colNotes")
                .text();
        }
        document.getElementById("suburb").value = $(this).find(".colCity").text();
        document.getElementById("zip").value = $(this).find(".colZipCode").text();
        if ($("#updateID").val() == "") {
            appointmentService.getAllAppointmentListCount().then(function(data) {
                if (data.tappointmentex.length > 0) {
                    let max = 1;
                    for (let i = 0; i < data.tappointmentex.length; i++) {
                        if (data.tappointmentex[i].Id > max) {
                            max = data.tappointmentex[i].Id;
                        }
                    }
                    document.getElementById("appID").value = max + 1;
                } else {
                    document.getElementById("appID").value = 1;
                }
            });
            if (getEmployeeID != "") {
                var filterEmpData = getAllEmployeeData.filter((empdData) => {
                    return empdData.id == getEmployeeID;
                });
                if (filterEmpData) {
                    if (filterEmpData[0].custFld8 == "false") {
                        templateObject.getAllSelectedProducts(getEmployeeID);
                    } else {
                        templateObject.getAllProductData();
                    }
                } else {
                    templateObject.getAllProductData();
                }
            }
        }
        $("#customerListModal").modal("hide");
        $("#event-modal").modal();
        setTimeout(() => {
            if (localStorage.getItem("smsCustomerAppt") == "false") {
                $("#chkSMSCustomer").prop("checked", false);
            }
            if (localStorage.getItem("smsUserAppt") == "false") {
                $("#chkSMSUser").prop("checked", false);
            }
            if (localStorage.getItem("emailCustomerAppt") == "false") {
                $("#customerEmail").prop("checked", false);
            }
            if (localStorage.getItem("emailUserAppt") == "false") {
                $("#userEmail").prop("checked", false);
            }
        }, 100);
    });

    getHours = function(start, end) {
        var hour = 0;
        hour = parseInt(start.split(":")[0]) - parseInt(end.split(":")[0]);
        var min = parseInt(start.split(":")[1]) + parseInt(end.split(":")[1]);
        var checkmin = parseInt(start.split(":")[1]) - parseInt(end.split(":")[1]);
        if (parseInt(start.split(":")[1]) > parseInt(end.split(":")[1])) {
            checkmin = parseInt(start.split(":")[1]) - parseInt(end.split(":")[1]);
        } else if (parseInt(end.split(":")[1]) > parseInt(start.split(":")[1])) {
            checkmin = parseInt(end.split(":")[1]) - parseInt(start.split(":")[1]);
        }

        if (checkmin == 0) {
            hour += 1;
        } else if (checkmin > 0) {
            hour += 1;
        } else if (min == 60) {
            hour += 1;
        }
        return hour;
    };

    //TODO: Get SMS settings here
    const smsSettings = {
        twilioAccountId: "",
        twilioAccountToken: "",
        twilioTelephoneNumber: "",
        twilioMessagingServiceSid: "MGc1d8e049d83e164a6f206fbe73ce0e2f",
        headerAppointmentSMSMessage: "Sent from [Company Name]",
        startAppointmentSMSMessage: "Hi [Customer Name], This is [Employee Name] from [Company Name] just letting you know that we are on site and doing the following service [Product/Service].",
        saveAppointmentSMSMessage: "Hi [Customer Name], This is [Employee Name] from [Company Name] confirming that we are booked in to be at [Full Address] at [Booked Time] to do the following service [Product/Service]. Please reply with Yes to confirm this booking or No if you wish to cancel it.",
        stopAppointmentSMSMessage: "Hi [Customer Name], This is [Employee Name] from [Company Name] just letting you know that we have finished doing the following service [Product/Service].",
    };
    smsService
        .getSMSSettings()
        .then((result) => {
            if (result.terppreference.length > 0) {
                for (let i = 0; i < result.terppreference.length; i++) {
                    switch (result.terppreference[i].PrefName) {
                        case "VS1SMSID":
                            smsSettings.twilioAccountId = result.terppreference[i].Fieldvalue;
                            break;
                        case "VS1SMSToken":
                            smsSettings.twilioAccountToken =
                                result.terppreference[i].Fieldvalue;
                            break;
                        case "VS1SMSPhone":
                            smsSettings.twilioTelephoneNumber =
                                result.terppreference[i].Fieldvalue;
                            break;
                        case "VS1HEADERSMSMSG":
                            smsSettings.headerAppointmentSMSMessage =
                                result.terppreference[i].Fieldvalue;
                            break;
                        case "VS1SAVESMSMSG":
                            smsSettings.saveAppointmentSMSMessage =
                                result.terppreference[i].Fieldvalue;
                            break;
                        case "VS1STARTSMSMSG":
                            smsSettings.startAppointmentSMSMessage =
                                result.terppreference[i].Fieldvalue;
                            break;
                        case "VS1STOPSMSMSG":
                            smsSettings.stopAppointmentSMSMessage =
                                result.terppreference[i].Fieldvalue;
                    }
                }
                templateObject.defaultSMSSettings.set(smsSettings);
            }
        })
        .catch((error) => {});

    templateObject.sendSMSMessage = async function(type, phoneNumber) {
        return new Promise(async(resolve, reject) => {
            const smsSettings = templateObject.defaultSMSSettings.get();
            const companyName = Session.get("vs1companyName");
            const message =
                smsSettings.headerAppointmentSMSMessage.replace(
                    "[Company Name]",
                    companyName
                ) +
                " - " +
                $(`#${type}AppointmentSMSMessage`).val();
            const sendSMSResult = await new Promise((res, rej) => {
                Meteor.call(
                    "sendSMS",
                    smsSettings.twilioAccountId,
                    smsSettings.twilioAccountToken,
                    smsSettings.twilioTelephoneNumber,
                    phoneNumber,
                    message,
                    function(error, result) {
                        if (error) rej(error);
                        res(result);
                    }
                );
            });
            resolve(sendSMSResult);
        });
    };

    templateObject.deleteAppt = function() {
        if ($("#updateID").val() != "") {
            $(".fullScreenSpin").css("display", "block");
            let id = $("#updateID").val();
            let data = {
                Name: "VS1_DeleteAllAppts",
                Params: {
                    AppointID: parseInt(id),
                },
            };
            var myString = '"JsonIn"' + ":" + JSON.stringify(data);
            var oPost = new XMLHttpRequest();
            oPost.open(
                "POST",
                URLRequest +
                erpGet.ERPIPAddress +
                ":" +
                erpGet.ERPPort +
                "/" +
                'erpapi/VS1_Cloud_Task/Method?Name="VS1_DeleteAllAppts"',
                true
            );
            oPost.setRequestHeader("database", erpGet.ERPDatabase);
            oPost.setRequestHeader("username", erpGet.ERPUsername);
            oPost.setRequestHeader("password", erpGet.ERPPassword);
            oPost.setRequestHeader("Accept", "application/json");
            oPost.setRequestHeader("Accept", "application/html");
            oPost.setRequestHeader("Content-type", "application/json");
            // let objDataSave = '"JsonIn"' + ':' + JSON.stringify(selectClient);
            oPost.send(myString);

            oPost.onreadystatechange = function() {
                if (oPost.readyState == 4 && oPost.status == 200) {
                    var myArrResponse = JSON.parse(oPost.responseText);
                    if (myArrResponse.ProcessLog.ResponseStatus.includes("OK")) {
                        sideBarService
                            .getAllAppointmentList(initialDataLoad, 0)
                            .then(function(data) {
                                addVS1Data("TAppointment", JSON.stringify(data))
                                    .then(function(datareturn) {
                                        Meteor._reload.reload();
                                    })
                                    .catch(function(err) {
                                        Meteor._reload.reload();
                                    });
                            })
                            .catch(function(err) {
                                Meteor._reload.reload();
                            });
                    } else {
                        $(".modal-backdrop").css("display", "none");
                        $(".fullScreenSpin").css("display", "none");
                        swal({
                            title: "Oops...",
                            text: myArrResponse.ProcessLog.ResponseStatus,
                            type: "warning",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        }).then((result) => {
                            if (result.value) {} else if (result.dismiss === "cancel") {}
                        });
                    }
                } else if (oPost.readyState == 4 && oPost.status == 403) {
                    $(".fullScreenSpin").css("display", "none");
                    swal({
                        title: "Oops...",
                        text: oPost.getResponseHeader("errormessage"),
                        type: "error",
                        showCancelButton: false,
                        confirmButtonText: "Try Again",
                    }).then((result) => {
                        if (result.value) {} else if (result.dismiss === "cancel") {}
                    });
                } else if (oPost.readyState == 4 && oPost.status == 406) {
                    $(".fullScreenSpin").css("display", "none");
                    var ErrorResponse = oPost.getResponseHeader("errormessage");
                    var segError = ErrorResponse.split(":");

                    if (segError[1] == ' "Unable to lock object') {
                        swal({
                            title: "Oops...",
                            text: oPost.getResponseHeader("errormessage"),
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        }).then((result) => {
                            if (result.value) {} else if (result.dismiss === "cancel") {}
                        });
                    } else {
                        $(".fullScreenSpin").css("display", "none");
                        swal({
                            title: "Oops...",
                            text: oPost.getResponseHeader("errormessage"),
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        }).then((result) => {
                            if (result.value) {} else if (result.dismiss === "cancel") {}
                        });
                    }
                } else if (oPost.readyState == "") {
                    $(".fullScreenSpin").css("display", "none");
                    swal({
                        title: "Oops...",
                        text: oPost.getResponseHeader("errormessage"),
                        type: "error",
                        showCancelButton: false,
                        confirmButtonText: "Try Again",
                    }).then((result) => {
                        if (result.value) {} else if (result.dismiss === "cancel") {}
                    });
                }
            };
        } else {
            swal({
                title: "Oops...",
                text: "Appointment Does Not Exist",
                type: "warning",
                showCancelButton: false,
                confirmButtonText: "Try Again",
            }).then((result) => {
                if (result.value) {} else if (result.dismiss === "cancel") {}
            });
        }
    }
});

Template.frmappointmentpop.helpers({
    addNotes: () => {
        return Session.get("CloudAppointmentNotes") || false;
    },
    addAttachment: () => {
        return Session.get("CloudAppointmentAddAttachment") || false;
    },
    accessStartStopOnly: () => {
        return Session.get("CloudAppointmentStartStopAccessLevel") || false;
    },
    attachmentCount: () => {
        return Template.instance().attachmentCount.get();
    },
    extraProductFees: () => {
        return Template.instance().extraProductFees.get();
    },
});

Template.frmappointmentpop.events({
    'click input[name="frequencyRadio"]': function(event) {
        if (event.target.id == "frequencyMonthly") {
            document.getElementById("monthlySettings").style.display = "block";
            document.getElementById("weeklySettings").style.display = "none";
            document.getElementById("dailySettings").style.display = "none";
            document.getElementById("oneTimeOnlySettings").style.display = "none";
        } else if (event.target.id == "frequencyWeekly") {
            document.getElementById("weeklySettings").style.display = "block";
            document.getElementById("monthlySettings").style.display = "none";
            document.getElementById("dailySettings").style.display = "none";
            document.getElementById("oneTimeOnlySettings").style.display = "none";
        } else if (event.target.id == "frequencyDaily") {
            document.getElementById("dailySettings").style.display = "block";
            document.getElementById("monthlySettings").style.display = "none";
            document.getElementById("weeklySettings").style.display = "none";
            document.getElementById("oneTimeOnlySettings").style.display = "none";
        } else if (event.target.id == "frequencyOnetimeonly") {
            document.getElementById("oneTimeOnlySettings").style.display = "block";
            document.getElementById("monthlySettings").style.display = "none";
            document.getElementById("weeklySettings").style.display = "none";
            document.getElementById("dailySettings").style.display = "none";
        } else {
            $("#copyFrequencyModal").modal('toggle');
        }
    },
    'click input[name="settingsMonthlyRadio"]': function(event) {
        if (event.target.id == "settingsMonthlyEvery") {
            $('.settingsMonthlyEveryOccurence').attr('disabled', false);
            $('.settingsMonthlyDayOfWeek').attr('disabled', false);
            $('.settingsMonthlySpecDay').attr('disabled', true);
        } else if (event.target.id == "settingsMonthlyDay") {
            $('.settingsMonthlySpecDay').attr('disabled', false);
            $('.settingsMonthlyEveryOccurence').attr('disabled', true);
            $('.settingsMonthlyDayOfWeek').attr('disabled', true);
        } else {
            $("#frequencyModal").modal('toggle');
        }
    },
    'click input[name="dailyRadio"]': function(event) {
        if (event.target.id == "dailyEveryDay") {
            $('.dailyEveryXDays').attr('disabled', true);
        } else if (event.target.id == "dailyWeekdays") {
            $('.dailyEveryXDays').attr('disabled', true);
        } else if (event.target.id == "dailyEvery") {
            $('.dailyEveryXDays').attr('disabled', false);
        } else {
            $("#frequencyModal").modal('toggle');
        }
    },
    "click #btnCopyOptions": async function(event) {
        playCopyAudio();
        let templateObject = Template.instance();
        let appointmentService = new AppointmentService();
        let i = 0;
        setTimeout(async function() {
            $("#basedOnFrequency").prop('checked', true);
            $('#edtFrequencyDetail').css('display', 'flex');
            $(".ofMonthList input[type=checkbox]").each(function() {
                $(this).prop('checked', false);
            });
            $(".selectDays input[type=checkbox]").each(function() {
                $(this).prop('checked', false);
            });
            // var url = FlowRouter.current().path;
            // var getso_id = url.split("?id=");
            // var currentAppt = getso_id[getso_id.length - 1];
            // if (getso_id[1]) {
            //     currentAppt = parseInt(currentAppt);
            //     var apptData = await appointmentService.getOneAppointmentdataEx(currentAppt);
            //     var selectedType = apptData.fields.TypeOfBasedOn;
            //     var frequencyVal = apptData.fields.FrequenctyValues;
            //     var startDate = apptData.fields.CopyStartDate;
            //     var finishDate = apptData.fields.CopyFinishDate;
            //     var subStartDate = startDate.substring(0, 10);
            //     var subFinishDate = finishDate.substring(0, 10);
            //     var convertedStartDate = subStartDate ? subStartDate.split('-')[2] + '/' + subStartDate.split('-')[1] + '/' + subStartDate.split('-')[0] : '';
            //     var convertedFinishDate = subFinishDate ? subFinishDate.split('-')[2] + '/' + subFinishDate.split('-')[1] + '/' + subFinishDate.split('-')[0] : '';

            //     var arrFrequencyVal = frequencyVal.split("@");
            //     var radioFrequency = arrFrequencyVal[0];
            //     $("#" + radioFrequency).prop('checked', true);
            //     if (radioFrequency == "frequencyMonthly") {
            //         document.getElementById("monthlySettings").style.display = "block";
            //         document.getElementById("weeklySettings").style.display = "none";
            //         document.getElementById("dailySettings").style.display = "none";
            //         document.getElementById("oneTimeOnlySettings").style.display = "none";
            //         var monthDate = arrFrequencyVal[1];
            //         $("#sltDay").val('day' + monthDate);
            //         var ofMonths = arrFrequencyVal[2];
            //         var arrOfMonths = ofMonths.split(",");
            //         for (i = 0; i < arrOfMonths.length; i++) {
            //             $("#formCheck-" + arrOfMonths[i]).prop('checked', true);
            //         }
            //         $('#edtMonthlyStartDate').val(convertedStartDate);
            //         $('#edtMonthlyFinishDate').val(convertedFinishDate);
            //     } else if (radioFrequency == "frequencyWeekly") {
            //         document.getElementById("weeklySettings").style.display = "block";
            //         document.getElementById("monthlySettings").style.display = "none";
            //         document.getElementById("dailySettings").style.display = "none";
            //         document.getElementById("oneTimeOnlySettings").style.display = "none";
            //         var everyWeeks = arrFrequencyVal[1];
            //         $("#weeklyEveryXWeeks").val(everyWeeks);
            //         var selectDays = arrFrequencyVal[2];
            //         var arrSelectDays = selectDays.split(",");
            //         for (i = 0; i < arrSelectDays.length; i++) {
            //             if (parseInt(arrSelectDays[i]) == 0)
            //                 $("#formCheck-sunday").prop('checked', true);
            //             if (parseInt(arrSelectDays[i]) == 1)
            //                 $("#formCheck-monday").prop('checked', true);
            //             if (parseInt(arrSelectDays[i]) == 2)
            //                 $("#formCheck-tuesday").prop('checked', true);
            //             if (parseInt(arrSelectDays[i]) == 3)
            //                 $("#formCheck-wednesday").prop('checked', true);
            //             if (parseInt(arrSelectDays[i]) == 4)
            //                 $("#formCheck-thursday").prop('checked', true);
            //             if (parseInt(arrSelectDays[i]) == 5)
            //                 $("#formCheck-friday").prop('checked', true);
            //             if (parseInt(arrSelectDays[i]) == 6)
            //                 $("#formCheck-saturday").prop('checked', true);
            //         }
            //         $('#edtWeeklyStartDate').val(convertedStartDate);
            //         $('#edtWeeklyFinishDate').val(convertedFinishDate);
            //     } else if (radioFrequency == "frequencyDaily") {
            //         document.getElementById("dailySettings").style.display = "block";
            //         document.getElementById("monthlySettings").style.display = "none";
            //         document.getElementById("weeklySettings").style.display = "none";
            //         document.getElementById("oneTimeOnlySettings").style.display = "none";
            //         var dailyRadioOption = arrFrequencyVal[1];
            //         $("#" + dailyRadioOption).prop('checked', true);
            //         var everyDays = arrFrequencyVal[2];
            //         $("#dailyEveryXDays").val(everyDays);
            //         $('#edtDailyStartDate').val(convertedStartDate);
            //         $('#edtDailyFinishDate').val(convertedFinishDate);
            //     } else if (radioFrequency == "frequencyOnetimeonly") {
            //         document.getElementById("oneTimeOnlySettings").style.display = "block";
            //         document.getElementById("monthlySettings").style.display = "none";
            //         document.getElementById("weeklySettings").style.display = "none";
            //         document.getElementById("dailySettings").style.display = "none";
            //         $('#edtOneTimeOnlyDate').val(convertedStartDate);
            //         $('#edtOneTimeOnlyTimeError').css('display', 'none');
            //         $('#edtOneTimeOnlyDateError').css('display', 'none');
            //     }
            // }
            $("#copyFrequencyModal").modal("toggle");
        }, delayTimeAfterSound);
    },
    'click .btnSaveFrequency': async function() {
        playSaveAudio();
        let templateObject = Template.instance();
        let appointmentService = new AppointmentService();
        // let selectedType = '';
        let selectedType = "basedOnFrequency";
        let frequencyVal = '';
        let startDate = '';
        let finishDate = '';
        let convertedStartDate = '';
        let convertedFinishDate = '';
        let sDate = '';
        let fDate = '';
        let monthDate = '';
        let ofMonths = '';
        let isFirst = true;
        let everyWeeks = '';
        let selectDays = '';
        let dailyRadioOption = '';
        let everyDays = '';

        // const basedOnTypes = $('#basedOnSettings input.basedOnSettings');
        let basedOnTypeTexts = '';
        // let basedOnTypeAttr = '';
        let basedOnTypeAttr = 'F,';

        var erpGet = erpDb();
        let sDate2 = '';
        let fDate2 = '';

        setTimeout(async function() {
            // basedOnTypes.each(function () {
            //   if ($(this).prop('checked')) {
            //     selectedType = $(this).attr('id');
            //     if (selectedType === "basedOnFrequency") { basedOnTypeAttr += 'F,'}
            //     if (selectedType === "basedOnPrint") { basedOnTypeTexts += 'On Print, '; basedOnTypeAttr += 'P,'; }
            //     if (selectedType === "basedOnSave") { basedOnTypeTexts += 'On Save, '; basedOnTypeAttr += 'S,'; }
            //     if (selectedType === "basedOnTransactionDate") { basedOnTypeTexts += 'On Transaction Date, '; basedOnTypeAttr += 'T,'; }
            //     if (selectedType === "basedOnDueDate") { basedOnTypeTexts += 'On Due Date, '; basedOnTypeAttr += 'D,'; }
            //     if (selectedType === "basedOnOutstanding") { basedOnTypeTexts += 'If Outstanding, '; basedOnTypeAttr += 'O,'; }
            //     if (selectedType === "basedOnEvent") {
            //       if ($('#settingsOnEvents').prop('checked')) { basedOnTypeTexts += 'On Event(On Logon), '; basedOnTypeAttr += 'EN,'; }
            //       if ($('#settingsOnLogout').prop('checked')) { basedOnTypeTexts += 'On Event(On Logout), '; basedOnTypeAttr += 'EU,'; }
            //     }
            //   }
            // });
            // if (basedOnTypeTexts != '') basedOnTypeTexts = basedOnTypeTexts.slice(0, -2);
            // if (basedOnTypeAttr != '') basedOnTypeAttr = basedOnTypeAttr.slice(0, -1);

            let formId = parseInt($("#formid").val());
            let radioFrequency = $('input[type=radio][name=frequencyRadio]:checked').attr('id');
            frequencyVal = radioFrequency + '@';
            const values = basedOnTypeAttr.split(',');
            if (values.includes('F')) {
                if (radioFrequency == "frequencyMonthly") {
                    isFirst = true;
                    monthDate = $("#sltDay").val().replace('day', '');
                    $(".ofMonthList input[type=checkbox]:checked").each(function() {
                        ofMonths += isFirst ? $(this).val() : ',' + $(this).val();
                        isFirst = false;
                    });
                    startDate = $('#edtMonthlyStartDate').val();
                    finishDate = $('#edtMonthlyFinishDate').val();
                    frequencyVal += monthDate + '@' + ofMonths;
                } else if (radioFrequency == "frequencyWeekly") {
                    isFirst = true;
                    everyWeeks = $("#weeklyEveryXWeeks").val();
                    let sDay = -1;
                    $(".selectDays input[type=checkbox]:checked").each(function() {
                        sDay = templateObject.getDayNumber($(this).val());
                        selectDays += isFirst ? sDay : ',' + sDay;
                        isFirst = false;
                    });
                    startDate = $('#edtWeeklyStartDate').val();
                    finishDate = $('#edtWeeklyFinishDate').val();
                    frequencyVal += everyWeeks + '@' + selectDays;
                } else if (radioFrequency == "frequencyDaily") {
                    dailyRadioOption = $('#dailySettings input[type=radio]:checked').attr('id');
                    everyDays = $("#dailyEveryXDays").val();
                    startDate = $('#edtDailyStartDate').val();
                    finishDate = $('#edtDailyFinishDate').val();
                    frequencyVal += dailyRadioOption + '@' + everyDays;
                } else if (radioFrequency == "frequencyOnetimeonly") {
                    startDate = $('#edtOneTimeOnlyDate').val();
                    finishDate = $('#edtOneTimeOnlyDate').val();
                    $('#edtOneTimeOnlyTimeError').css('display', 'none');
                    $('#edtOneTimeOnlyDateError').css('display', 'none');
                    frequencyVal = radioFrequency;
                }
            }
            $('#copyFrequencyModal').modal('toggle');
            convertedStartDate = startDate ? startDate.split('/')[2] + '-' + startDate.split('/')[1] + '-' + startDate.split('/')[0] : '';
            convertedFinishDate = finishDate ? finishDate.split('/')[2] + '-' + finishDate.split('/')[1] + '-' + finishDate.split('/')[0] : '';
            sDate = convertedStartDate ? moment(convertedStartDate + ' ' + copyStartTime).format("YYYY-MM-DD HH:mm") : moment().format("YYYY-MM-DD HH:mm");
            fDate = convertedFinishDate ? moment(convertedFinishDate + ' ' + copyStartTime).format("YYYY-MM-DD HH:mm") : moment().format("YYYY-MM-DD HH:mm");
            sDate2 = convertedStartDate ? moment(convertedStartDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
            fDate2 = convertedFinishDate ? moment(convertedFinishDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
            $(".fullScreenSpin").css("display", "inline-block");

            var currentAppt = $("#appID").val();
            currentAppt = parseInt(currentAppt);
            // objDetails = {
            //     type: "TAppointmentEx",
            //     fields: {
            //         ID: currentAppt,
            //         TypeOfBasedOn: selectedType,
            //         FrequenctyValues: frequencyVal,
            //         CopyStartDate: sDate2,
            //         CopyFinishDate: fDate2,
            //     }
            // };
            // var result = await appointmentService.saveAppointment(objDetails);
            let period = ""; // 0
            let days = [];
            let i = 0;
            let frequency2 = 0;
            let weekdayObj = {
                saturday: 0,
                sunday: 0,
                monday: 0,
                tuesday: 0,
                wednesday: 0,
                thursday: 0,
                friday: 0,
            };
            let repeatMonths = [];
            let repeatDates = [];
            if (radioFrequency == "frequencyDaily" || radioFrequency == "frequencyOnetimeonly") {
                period = "Daily"; // 0
                if (radioFrequency == "frequencyDaily") {
                    frequency2 = parseInt(everyDays);
                    if (dailyRadioOption == "dailyEveryDay") {
                        for (i = 0; i < 7; i++) {
                            days.push(i);
                        }
                    }
                    if (dailyRadioOption == "dailyWeekdays") {
                        for (i = 1; i < 6; i++) {
                            days.push(i);
                        }
                    }
                    if (dailyRadioOption == "dailyEvery") {

                    }
                } else {
                    repeatDates.push({
                        "Dates": sDate2
                    })
                    frequency2 = 1;
                }
            }
            if (radioFrequency == "frequencyWeekly") {
                period = "Weekly"; // 1
                frequency2 = parseInt(everyWeeks);
                let arrSelectDays = selectDays.split(",");
                for (i = 0; i < arrSelectDays.length; i++) {
                    days.push(arrSelectDays[i]);
                    if (parseInt(arrSelectDays[i]) == 0)
                        weekdayObj.sunday = 1;
                    if (parseInt(arrSelectDays[i]) == 1)
                        weekdayObj.monday = 1;
                    if (parseInt(arrSelectDays[i]) == 2)
                        weekdayObj.tuesday = 1;
                    if (parseInt(arrSelectDays[i]) == 3)
                        weekdayObj.wednesday = 1;
                    if (parseInt(arrSelectDays[i]) == 4)
                        weekdayObj.thursday = 1;
                    if (parseInt(arrSelectDays[i]) == 5)
                        weekdayObj.friday = 1;
                    if (parseInt(arrSelectDays[i]) == 6)
                        weekdayObj.saturday = 1;
                }
            }
            if (radioFrequency == "frequencyMonthly") {
                period = "Monthly"; // 0
                repeatMonths = convertStrMonthToNum(ofMonths);
                repeatDates = getRepeatDates(sDate2, fDate2, repeatMonths, monthDate);
                frequency2 = parseInt(monthDate);
            }
            if (days.length > 0) {
                for (let x = 0; x < days.length; x++) {
                    let dayObj = {
                        Name: "VS1_RepeatAppointment",
                        Params: {
                            CloudUserName: erpGet.ERPUsername,
                            CloudPassword: erpGet.ERPPassword,
                            AppointID: currentAppt,
                            Repeat_Frequency: frequency2,
                            Repeat_Period: period,
                            Repeat_BaseDate: sDate2,
                            Repeat_finalDateDate: fDate2,
                            Repeat_Saturday: weekdayObj.saturday,
                            Repeat_Sunday: weekdayObj.sunday,
                            Repeat_Monday: weekdayObj.monday,
                            Repeat_Tuesday: weekdayObj.tuesday,
                            Repeat_Wednesday: weekdayObj.wednesday,
                            Repeat_Thursday: weekdayObj.thursday,
                            Repeat_Friday: weekdayObj.friday,
                            Repeat_Holiday: 0,
                            Repeat_Weekday: parseInt(days[x].toString()),
                            Repeat_MonthOffset: 0,
                        },
                    };
                    var myString = '"JsonIn"' + ":" + JSON.stringify(dayObj);
                    var oPost = new XMLHttpRequest();
                    oPost.open(
                        "POST",
                        URLRequest +
                        erpGet.ERPIPAddress +
                        ":" +
                        erpGet.ERPPort +
                        "/" +
                        'erpapi/VS1_Cloud_Task/Method?Name="VS1_RepeatAppointment"',
                        true
                    );
                    oPost.setRequestHeader("database", erpGet.ERPDatabase);
                    oPost.setRequestHeader("username", erpGet.ERPUsername);
                    oPost.setRequestHeader("password", erpGet.ERPPassword);
                    oPost.setRequestHeader("Accept", "application/json");
                    oPost.setRequestHeader("Accept", "application/html");
                    oPost.setRequestHeader("Content-type", "application/json");
                    oPost.send(myString);

                    oPost.onreadystatechange = function() {
                        if (oPost.readyState == 4 && oPost.status == 200) {
                            var myArrResponse = JSON.parse(oPost.responseText);
                            if (myArrResponse.ProcessLog.ResponseStatus.includes("OK")) {
                                if (x == days.length - 1) {
                                    sideBarService
                                        .getAllAppointmentList(initialDataLoad, 0)
                                        .then(function(data) {
                                            addVS1Data("TAppointment", JSON.stringify(data))
                                                .then(function(datareturn) {
                                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                                    } else {
                                                        window.open("/appointments", "_self");
                                                    }
                                                })
                                                .catch(function(err) {
                                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                                    } else {
                                                        window.open("/appointments", "_self");
                                                    }
                                                });
                                        })
                                        .catch(function(err) {
                                            if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                window.open(localStorage.getItem("appt_historypage"), "_self");
                                            } else {
                                                window.open("/appointments", "_self");
                                            }
                                        });
                                }
                            } else {
                                $(".modal-backdrop").css("display", "none");
                                $(".fullScreenSpin").css("display", "none");
                                swal({
                                    title: "Oops...",
                                    text: myArrResponse.ProcessLog.ResponseStatus,
                                    type: "warning",
                                    showCancelButton: false,
                                    confirmButtonText: "Try Again",
                                }).then((result) => {
                                    if (result.value) {} else if (result.dismiss === "cancel") {}
                                });
                            }
                        } else if (oPost.readyState == 4 && oPost.status == 403) {
                            $(".fullScreenSpin").css("display", "none");
                            swal({
                                title: "Oops...",
                                text: oPost.getResponseHeader("errormessage"),
                                type: "error",
                                showCancelButton: false,
                                confirmButtonText: "Try Again",
                            }).then((result) => {
                                if (result.value) {} else if (result.dismiss === "cancel") {}
                            });
                        } else if (oPost.readyState == 4 && oPost.status == 406) {
                            $(".fullScreenSpin").css("display", "none");
                            var ErrorResponse = oPost.getResponseHeader("errormessage");
                            var segError = ErrorResponse.split(":");

                            if (segError[1] == ' "Unable to lock object') {
                                swal({
                                    title: "Oops...",
                                    text: oPost.getResponseHeader("errormessage"),
                                    type: "error",
                                    showCancelButton: false,
                                    confirmButtonText: "Try Again",
                                }).then((result) => {
                                    if (result.value) {} else if (result.dismiss === "cancel") {}
                                });
                            } else {
                                $(".fullScreenSpin").css("display", "none");
                                swal({
                                    title: "Oops...",
                                    text: oPost.getResponseHeader("errormessage"),
                                    type: "error",
                                    showCancelButton: false,
                                    confirmButtonText: "Try Again",
                                }).then((result) => {
                                    if (result.value) {} else if (result.dismiss === "cancel") {}
                                });
                            }
                        } else if (oPost.readyState == "") {
                            $(".fullScreenSpin").css("display", "none");
                            swal({
                                title: "Oops...",
                                text: oPost.getResponseHeader("errormessage"),
                                type: "error",
                                showCancelButton: false,
                                confirmButtonText: "Try Again",
                            }).then((result) => {
                                if (result.value) {} else if (result.dismiss === "cancel") {}
                            });
                        }
                    };
                }
            } else {
                let dayObj = {};
                if (radioFrequency == "frequencyOnetimeonly" || radioFrequency == "frequencyMonthly") {
                    dayObj = {
                        Name: "VS1_RepeatAppointment",
                        Params: {
                            CloudUserName: erpGet.ERPUsername,
                            CloudPassword: erpGet.ERPPassword,
                            AppointID: currentAppt,
                            Repeat_Dates: repeatDates,
                            Repeat_Frequency: frequency2,
                            Repeat_Period: period,
                            Repeat_BaseDate: sDate2,
                            Repeat_finalDateDate: fDate2,
                            Repeat_Saturday: weekdayObj.saturday,
                            Repeat_Sunday: weekdayObj.sunday,
                            Repeat_Monday: weekdayObj.monday,
                            Repeat_Tuesday: weekdayObj.tuesday,
                            Repeat_Wednesday: weekdayObj.wednesday,
                            Repeat_Thursday: weekdayObj.thursday,
                            Repeat_Friday: weekdayObj.friday,
                            Repeat_Holiday: 0,
                            Repeat_Weekday: 0,
                            Repeat_MonthOffset: 0,
                        },
                    };
                } else {
                    dayObj = {
                        Name: "VS1_RepeatAppointment",
                        Params: {
                            CloudUserName: erpGet.ERPUsername,
                            CloudPassword: erpGet.ERPPassword,
                            AppointID: currentAppt,
                            Repeat_Frequency: frequency2,
                            Repeat_Period: period,
                            Repeat_BaseDate: sDate2,
                            Repeat_finalDateDate: fDate2,
                            Repeat_Saturday: weekdayObj.saturday,
                            Repeat_Sunday: weekdayObj.sunday,
                            Repeat_Monday: weekdayObj.monday,
                            Repeat_Tuesday: weekdayObj.tuesday,
                            Repeat_Wednesday: weekdayObj.wednesday,
                            Repeat_Thursday: weekdayObj.thursday,
                            Repeat_Friday: weekdayObj.friday,
                            Repeat_Holiday: 0,
                            Repeat_Weekday: 0,
                            Repeat_MonthOffset: 0,
                        },
                    };
                }
                var myString = '"JsonIn"' + ":" + JSON.stringify(dayObj);
                var oPost = new XMLHttpRequest();
                oPost.open(
                    "POST",
                    URLRequest +
                    erpGet.ERPIPAddress +
                    ":" +
                    erpGet.ERPPort +
                    "/" +
                    'erpapi/VS1_Cloud_Task/Method?Name="VS1_RepeatAppointment"',
                    true
                );
                oPost.setRequestHeader("database", erpGet.ERPDatabase);
                oPost.setRequestHeader("username", erpGet.ERPUsername);
                oPost.setRequestHeader("password", erpGet.ERPPassword);
                oPost.setRequestHeader("Accept", "application/json");
                oPost.setRequestHeader("Accept", "application/html");
                oPost.setRequestHeader("Content-type", "application/json");
                // let objDataSave = '"JsonIn"' + ':' + JSON.stringify(selectClient);
                oPost.send(myString);

                oPost.onreadystatechange = function() {
                    if (oPost.readyState == 4 && oPost.status == 200) {
                        var myArrResponse = JSON.parse(oPost.responseText);
                        if (myArrResponse.ProcessLog.ResponseStatus.includes("OK")) {
                            sideBarService
                                .getAllAppointmentList(initialDataLoad, 0)
                                .then(function(data) {
                                    addVS1Data("TAppointment", JSON.stringify(data))
                                        .then(function(datareturn) {
                                            window.open("/appointments", "_self");
                                            if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                window.open(localStorage.getItem("appt_historypage"), "_self");
                                            } else {
                                                window.open("/appointments", "_self");
                                            }
                                        })
                                        .catch(function(err) {
                                            if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                window.open(localStorage.getItem("appt_historypage"), "_self");
                                            } else {
                                                window.open("/appointments", "_self");
                                            }
                                        });
                                })
                                .catch(function(err) {
                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                    } else {
                                        window.open("/appointments", "_self");
                                    }
                                });
                        } else {
                            $(".modal-backdrop").css("display", "none");
                            $(".fullScreenSpin").css("display", "none");
                            swal({
                                title: "Oops...",
                                text: myArrResponse.ProcessLog.ResponseStatus,
                                type: "warning",
                                showCancelButton: false,
                                confirmButtonText: "Try Again",
                            }).then((result) => {
                                if (result.value) {} else if (result.dismiss === "cancel") {}
                            });
                        }
                    } else if (oPost.readyState == 4 && oPost.status == 403) {
                        $(".fullScreenSpin").css("display", "none");
                        swal({
                            title: "Oops...",
                            text: oPost.getResponseHeader("errormessage"),
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        }).then((result) => {
                            if (result.value) {} else if (result.dismiss === "cancel") {}
                        });
                    } else if (oPost.readyState == 4 && oPost.status == 406) {
                        $(".fullScreenSpin").css("display", "none");
                        var ErrorResponse = oPost.getResponseHeader("errormessage");
                        var segError = ErrorResponse.split(":");

                        if (segError[1] == ' "Unable to lock object') {
                            swal({
                                title: "Oops...",
                                text: oPost.getResponseHeader("errormessage"),
                                type: "error",
                                showCancelButton: false,
                                confirmButtonText: "Try Again",
                            }).then((result) => {
                                if (result.value) {} else if (result.dismiss === "cancel") {}
                            });
                        } else {
                            $(".fullScreenSpin").css("display", "none");
                            swal({
                                title: "Oops...",
                                text: oPost.getResponseHeader("errormessage"),
                                type: "error",
                                showCancelButton: false,
                                confirmButtonText: "Try Again",
                            }).then((result) => {
                                if (result.value) {} else if (result.dismiss === "cancel") {}
                            });
                        }
                    } else if (oPost.readyState == "") {
                        $(".fullScreenSpin").css("display", "none");
                        swal({
                            title: "Oops...",
                            text: oPost.getResponseHeader("errormessage"),
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        }).then((result) => {
                            if (result.value) {} else if (result.dismiss === "cancel") {}
                        });
                    }
                };
            }
            FlowRouter.go("/appointmentlist");
            $('.modal-backdrop').css('display', 'none');
        }, delayTimeAfterSound);
    },
    "click #btnStartAppointmentConfirm": async function() {
        let toUpdateID = "";
        const templateObject = Template.instance();
        let notes = $("#txtNotes").val() || " ";
        let id = $("#updateID").val();
        var result = templateObject.appointmentInfo.get();
        let desc = "Job Continued";
        if (result.length > 0) {
            if (Array.isArray(result[0].timelog) && result[0].timelog != "") {
                toUpdateID = result[0].timelog[result[0].timelog.length - 1].fields.ID;
            } else {
                if (result[0].timelog != "") {
                    toUpdateID = result[0].timelog.fields.ID;
                } else {
                    desc = "Job Started";
                }
            }
            date = new Date();
            if (
                $("#tActualStartTime").val() != "" &&
                result[0].isPaused == "Paused"
            ) {
                $(".fullScreenSpin").css("display", "inline-block");
                $(".paused").hide();
                $("#btnHold").prop("disabled", false);
                let startTime =
                    date.getFullYear() +
                    "-" +
                    ("0" + (date.getMonth() + 1)).slice(-2) +
                    "-" +
                    ("0" + date.getDate()).slice(-2) +
                    " " +
                    ("0" + date.getHours()).slice(-2) +
                    ":" +
                    ("0" + date.getMinutes()).slice(-2);
                let endTime = "";

                let timeLog = [];
                let obj = {
                    StartDatetime: startTime,
                    EndDatetime: endTime,
                    Description: desc,
                };
                if (obj.StartDatetime != "" && obj.EndDatetime != "") {
                    timeLog.push(obj);
                } else {
                    timeLog = "";
                }

                let objectData = "";
                objectData = {
                    type: "TAppointmentsTimeLog",
                    fields: {
                        AppointID: parseInt(result[0].id),
                        StartDatetime: obj.StartDatetime,
                        EndDatetime: obj.EndDatetime,
                        Description: obj.Description,
                    },
                };

                appointmentService
                    .saveTimeLog(objectData)
                    .then(function(data) {
                        let endTime1 =
                            date.getFullYear() +
                            "-" +
                            ("0" + (date.getMonth() + 1)).slice(-2) +
                            "-" +
                            ("0" + date.getDate()).slice(-2) +
                            " " +
                            ("0" + date.getHours()).slice(-2) +
                            ":" +
                            ("0" + date.getMinutes()).slice(-2);
                        objectData1 = {
                            type: "TAppointmentEx",
                            fields: {
                                Id: parseInt(result[0].id),
                                Othertxt: "",
                                Notes: notes,
                            },
                        };
                        if (toUpdateID != "") {
                            objectData = {
                                type: "TAppointmentsTimeLog",
                                fields: {
                                    ID: toUpdateID,
                                    EndDatetime: endTime1,
                                },
                            };
                            if (result[0].timelog != "") {
                                appointmentService
                                    .saveTimeLog(objectData)
                                    .then(function(data) {
                                        appointmentService
                                            .saveAppointment(objectData1)
                                            .then(function(data1) {
                                                result[0].isPaused = "";

                                                templateObject.appointmentInfo.set(result);
                                                sideBarService
                                                    .getAllAppointmentList(initialDataLoad, 0)
                                                    .then(function(data) {
                                                        addVS1Data("TAppointment", JSON.stringify(data))
                                                            .then(async(datareturn) => {
                                                                $(".fullScreenSpin").css("display", "none");

                                                                //TODO: Start Appointment SMS sent here
                                                                const customerPhone = $("#mobile").val();
                                                                const smsCustomer =
                                                                    $("#chkSMSCustomer").is(":checked");
                                                                const smsUser = $("#chkSMSUser").is(":checked");
                                                                const smsSettings =
                                                                    templateObject.defaultSMSSettings.get();
                                                                let sendSMSRes = true;
                                                                if (
                                                                    (smsCustomer || smsUser) &&
                                                                    customerPhone != "0" &&
                                                                    smsSettings.twilioAccountId
                                                                ) {
                                                                    sendSMSRes =
                                                                        await templateObject.sendSMSMessage(
                                                                            "start",
                                                                            "+" + customerPhone.replace("+", "")
                                                                        );
                                                                    if (!sendSMSRes.success) {
                                                                        swal({
                                                                            title: "Oops...",
                                                                            text: sendSMSRes.message,
                                                                            type: "error",
                                                                            showCancelButton: false,
                                                                            confirmButtonText: "Try again",
                                                                        }).then((result) => {
                                                                            if (result.value) {
                                                                                $(
                                                                                    "#btnCloseStartAppointmentModal"
                                                                                ).trigger("click");
                                                                            }
                                                                        });
                                                                    } else {
                                                                        swal({
                                                                            title: "SMS was sent successfully",
                                                                            text: "SMS was sent successfully",
                                                                            type: "success",
                                                                            showCancelButton: false,
                                                                            confirmButtonText: "Ok",
                                                                        });
                                                                        localStorage.setItem(
                                                                            "smsId",
                                                                            sendSMSRes.sid
                                                                        );
                                                                        $("#tActualStartTime").val(
                                                                            moment().startOf("hour").format("HH") +
                                                                            ":" +
                                                                            moment().startOf("minute").format("mm")
                                                                        );
                                                                        $("#btnCloseStartAppointmentModal").trigger(
                                                                            "click"
                                                                        );
                                                                        //$('#frmAppointment').trigger('submit');
                                                                        templateObject.checkRefresh.set(true);
                                                                    }
                                                                } else {
                                                                    //$("#tActualStartTime").val(moment().startOf('hour').format('HH') + ":" + moment().startOf('minute').format('mm'));
                                                                    $("#btnCloseStartAppointmentModal").trigger(
                                                                        "click"
                                                                    );
                                                                    //$('#frmAppointment').trigger('submit');
                                                                    swal({
                                                                        title: "Job Started",
                                                                        text: "Job Has Been Started",
                                                                        type: "success",
                                                                        showCancelButton: false,
                                                                        confirmButtonText: "Ok",
                                                                    }).then((result) => {
                                                                        if (result.value) {} else {
                                                                            // window.open('/appointments', '_self');
                                                                        }
                                                                    });
                                                                    templateObject.checkRefresh.set(true);
                                                                }
                                                            })
                                                            .catch(function(err) {
                                                                swal({
                                                                    title: "Oops...",
                                                                    text: err,
                                                                    type: "error",
                                                                    showCancelButton: false,
                                                                    confirmButtonText: "Try Again",
                                                                }).then((result) => {
                                                                    if (result.value) {
                                                                        if (err === checkResponseError) {
                                                                            window.open("/", "_self");
                                                                        }
                                                                    } else if (result.dismiss === "cancel") {}
                                                                });
                                                                $(".fullScreenSpin").css("display", "none");
                                                            });
                                                    })
                                                    .catch(function(err) {
                                                        swal({
                                                            title: "Oops...",
                                                            text: err,
                                                            type: "error",
                                                            showCancelButton: false,
                                                            confirmButtonText: "Try Again",
                                                        }).then((result) => {
                                                            if (result.value) {
                                                                if (err === checkResponseError) {
                                                                    window.open("/", "_self");
                                                                }
                                                            } else if (result.dismiss === "cancel") {}
                                                        });
                                                        $(".fullScreenSpin").css("display", "none");
                                                        Meteor._reload.reload();
                                                    });
                                            })
                                            .catch(function(err) {
                                                swal({
                                                    title: "Oops...",
                                                    text: err,
                                                    type: "error",
                                                    showCancelButton: false,
                                                    confirmButtonText: "Try Again",
                                                }).then((result) => {
                                                    if (result.value) {
                                                        if (err === checkResponseError) {
                                                            window.open("/", "_self");
                                                        }
                                                    } else if (result.dismiss === "cancel") {}
                                                });
                                                $(".fullScreenSpin").css("display", "none");
                                            });
                                    });
                            } else {
                                appointmentService
                                    .saveAppointment(objectData1)
                                    .then(function(data1) {
                                        sideBarService
                                            .getAllAppointmentList(initialDataLoad, 0)
                                            .then(function(data) {
                                                addVS1Data("TAppointment", JSON.stringify(data))
                                                    .then(async function(datareturn) {
                                                        $(".fullScreenSpin").css("display", "none");

                                                        //TODO: Start Appointment SMS sent here
                                                        const customerPhone = $("#mobile").val();
                                                        const smsCustomer =
                                                            $("#chkSMSCustomer").is(":checked");
                                                        const smsUser = $("#chkSMSUser").is(":checked");
                                                        const smsSettings =
                                                            templateObject.defaultSMSSettings.get();
                                                        let sendSMSRes = true;
                                                        if (
                                                            (smsCustomer || smsUser) &&
                                                            customerPhone != "0" &&
                                                            smsSettings.twilioAccountId
                                                        ) {
                                                            sendSMSRes = await templateObject.sendSMSMessage(
                                                                "start",
                                                                "+" + customerPhone.replace("+", "")
                                                            );
                                                            if (!sendSMSRes.success) {
                                                                swal({
                                                                    title: "Oops...",
                                                                    text: sendSMSRes.message,
                                                                    type: "error",
                                                                    showCancelButton: false,
                                                                    confirmButtonText: "Try again",
                                                                }).then((result) => {
                                                                    if (result.value) {
                                                                        $("#startAppointmentModal").modal("hide");
                                                                    }
                                                                });
                                                            } else {
                                                                localStorage.setItem("smsId", sendSMSRes.sid);
                                                                swal({
                                                                    title: "SMS was sent successfully",
                                                                    text: "SMS was sent successfully",
                                                                    type: "success",
                                                                    showCancelButton: false,
                                                                    confirmButtonText: "Ok",
                                                                });
                                                                $("#tActualStartTime").val(
                                                                    moment().startOf("hour").format("HH") +
                                                                    ":" +
                                                                    moment().startOf("minute").format("mm")
                                                                );
                                                                $("#btnCloseStartAppointmentModal").trigger(
                                                                    "click"
                                                                );
                                                                //$('#frmAppointment').trigger('submit');
                                                                templateObject.checkRefresh.set(true);
                                                            }
                                                        } else {
                                                            $("#tActualStartTime").val(
                                                                moment().startOf("hour").format("HH") +
                                                                ":" +
                                                                moment().startOf("minute").format("mm")
                                                            );
                                                            $("#btnCloseStartAppointmentModal").trigger(
                                                                "click"
                                                            );
                                                            //$('#frmAppointment').trigger('submit');
                                                            templateObject.checkRefresh.set(true);
                                                        }
                                                    })
                                                    .catch(function(err) {
                                                        swal({
                                                            title: "Oops...",
                                                            text: err,
                                                            type: "error",
                                                            showCancelButton: false,
                                                            confirmButtonText: "Try Again",
                                                        }).then((result) => {
                                                            if (result.value) {
                                                                if (err === checkResponseError) {
                                                                    window.open("/", "_self");
                                                                }
                                                            } else if (result.dismiss === "cancel") {}
                                                        });
                                                        $(".fullScreenSpin").css("display", "none");
                                                    });
                                            })
                                            .catch(function(err) {
                                                swal({
                                                    title: "Oops...",
                                                    text: err,
                                                    type: "error",
                                                    showCancelButton: false,
                                                    confirmButtonText: "Try Again",
                                                }).then((result) => {
                                                    if (result.value) {
                                                        if (err === checkResponseError) {
                                                            window.open("/", "_self");
                                                        }
                                                    } else if (result.dismiss === "cancel") {}
                                                });
                                                $(".fullScreenSpin").css("display", "none");
                                                Meteor._reload.reload();
                                            });
                                    })
                                    .catch(function(err) {
                                        swal({
                                            title: "Oops...",
                                            text: err,
                                            type: "error",
                                            showCancelButton: false,
                                            confirmButtonText: "Try Again",
                                        }).then((result) => {
                                            if (result.value) {
                                                if (err === checkResponseError) {
                                                    window.open("/", "_self");
                                                }
                                            } else if (result.dismiss === "cancel") {}
                                        });
                                        $(".fullScreenSpin").css("display", "none");
                                    });
                            }
                        }
                    })
                    .catch(function(err) {
                        swal({
                            title: "Oops...",
                            text: err,
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        }).then((result) => {
                            if (result.value) {
                                if (err === checkResponseError) {
                                    window.open("/", "_self");
                                }
                            } else if (result.dismiss === "cancel") {}
                        });
                        $(".fullScreenSpin").css("display", "none");
                    });
            } else if (result[0].aStartTime == "") {
                $(".fullScreenSpin").css("display", "inline-block");
                document.getElementById("tActualStartTime").value =
                    moment().startOf("hour").format("HH") +
                    ":" +
                    moment().startOf("minute").format("mm");
                $(".paused").hide();
                $("#btnHold").prop("disabled", false);
                let startTime =
                    date.getFullYear() +
                    "-" +
                    ("0" + (date.getMonth() + 1)).slice(-2) +
                    "-" +
                    ("0" + date.getDate()).slice(-2) +
                    " " +
                    ("0" + date.getHours()).slice(-2) +
                    ":" +
                    ("0" + date.getMinutes()).slice(-2);
                let endTime = "";

                let timeLog = [];
                let obj = {
                    StartDatetime: startTime,
                    EndDatetime: endTime,
                    Description: desc,
                };
                if (obj.StartDatetime != "" && obj.EndDatetime != "") {
                    timeLog.push(obj);
                } else {
                    timeLog = "";
                }

                let objectData = "";
                objectData = {
                    type: "TAppointmentsTimeLog",
                    fields: {
                        AppointID: parseInt(result[0].id),
                        StartDatetime: obj.StartDatetime,
                        EndDatetime: obj.EndDatetime,
                        Description: obj.Description,
                    },
                };

                appointmentService
                    .saveTimeLog(objectData)
                    .then(function(data) {
                        let getReponseID = data.fields.ID || "";
                        templateObject.toupdatelogid.set(getReponseID);
                        let endTime1 =
                            date.getFullYear() +
                            "-" +
                            ("0" + (date.getMonth() + 1)).slice(-2) +
                            "-" +
                            ("0" + date.getDate()).slice(-2) +
                            " " +
                            ("0" + date.getHours()).slice(-2) +
                            ":" +
                            ("0" + date.getMinutes()).slice(-2);
                        objectData1 = {
                            type: "TAppointmentEx",
                            fields: {
                                Id: parseInt(result[0].id),
                                Actual_StartTime: startTime,
                                Othertxt: "",
                            },
                        };

                        appointmentService
                            .saveAppointment(objectData1)
                            .then(function(data1) {
                                result[0].aStartTime = startTime;
                                templateObject.appointmentInfo.set(result);

                                sideBarService
                                    .getAllAppointmentList(initialDataLoad, 0)
                                    .then(function(data) {
                                        addVS1Data("TAppointment", JSON.stringify(data))
                                            .then(async function(datareturn) {
                                                $(".fullScreenSpin").css("display", "none");

                                                //TODO: Start Appointment SMS sent here
                                                const customerPhone = $("#mobile").val();
                                                const smsCustomer = $("#chkSMSCustomer").is(":checked");
                                                const smsUser = $("#chkSMSUser").is(":checked");
                                                const smsSettings =
                                                    templateObject.defaultSMSSettings.get();
                                                let sendSMSRes = true;
                                                if (
                                                    (smsCustomer || smsUser) &&
                                                    customerPhone != "0" &&
                                                    smsSettings.twilioAccountId
                                                ) {
                                                    sendSMSRes = await templateObject.sendSMSMessage(
                                                        "start",
                                                        "+" + customerPhone.replace("+", "")
                                                    );
                                                    if (!sendSMSRes.success) {
                                                        swal({
                                                            title: "Oops...",
                                                            text: sendSMSRes.message,
                                                            type: "error",
                                                            showCancelButton: false,
                                                            confirmButtonText: "Try again",
                                                        }).then((result) => {
                                                            if (result.value) {
                                                                $("#startAppointmentModal").modal("hide");
                                                            }
                                                        });
                                                    } else {
                                                        localStorage.setItem("smsId", sendSMSRes.sid);
                                                        swal({
                                                            title: "SMS was sent successfully",
                                                            text: "SMS was sent successfully",
                                                            type: "success",
                                                            showCancelButton: false,
                                                            confirmButtonText: "Ok",
                                                        });
                                                        $("#tActualStartTime").val(
                                                            moment().startOf("hour").format("HH") +
                                                            ":" +
                                                            moment().startOf("minute").format("mm")
                                                        );
                                                        $("#btnCloseStartAppointmentModal").trigger(
                                                            "click"
                                                        );
                                                        //$('#frmAppointment').submit();
                                                        templateObject.checkRefresh.set(true);
                                                    }
                                                } else {
                                                    //$("#tActualStartTime").val(moment().startOf('hour').format('HH') + ":" + moment().startOf('minute').format('mm'));
                                                    $("#btnCloseStartAppointmentModal").trigger("click");
                                                    //$('#frmAppointment').submit();
                                                    swal({
                                                        title: "Job Started",
                                                        text: "Job Has Been Started",
                                                        type: "success",
                                                        showCancelButton: false,
                                                        confirmButtonText: "Ok",
                                                    }).then((result) => {
                                                        if (result.value) {} else {
                                                            // window.open('/appointments', '_self');
                                                        }
                                                    });
                                                    templateObject.checkRefresh.set(true);
                                                }
                                            })
                                            .catch(function(err) {
                                                swal({
                                                    title: "Oops...",
                                                    text: err,
                                                    type: "error",
                                                    showCancelButton: false,
                                                    confirmButtonText: "Try Again",
                                                }).then((result) => {
                                                    if (result.value) {
                                                        if (err === checkResponseError) {
                                                            window.open("/", "_self");
                                                        }
                                                    } else if (result.dismiss === "cancel") {}
                                                });
                                                $(".fullScreenSpin").css("display", "none");
                                            });
                                    })
                                    .catch(function(err) {
                                        swal({
                                            title: "Oops...",
                                            text: err,
                                            type: "error",
                                            showCancelButton: false,
                                            confirmButtonText: "Try Again",
                                        }).then((result) => {
                                            if (result.value) {
                                                if (err === checkResponseError) {
                                                    window.open("/", "_self");
                                                }
                                            } else if (result.dismiss === "cancel") {}
                                        });
                                        $(".fullScreenSpin").css("display", "none");
                                        Meteor._reload.reload();
                                    });
                            })
                            .catch(function(err) {
                                swal({
                                    title: "Oops...",
                                    text: err,
                                    type: "error",
                                    showCancelButton: false,
                                    confirmButtonText: "Try Again",
                                }).then((result) => {
                                    if (result.value) {
                                        if (err === checkResponseError) {
                                            window.open("/", "_self");
                                        }
                                    } else if (result.dismiss === "cancel") {}
                                });
                                $(".fullScreenSpin").css("display", "none");
                            });
                    })
                    .catch(function(err) {
                        swal({
                            title: "Oops...",
                            text: err,
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        }).then((result) => {
                            if (result.value) {
                                if (err === checkResponseError) {
                                    window.open("/", "_self");
                                }
                            } else if (result.dismiss === "cancel") {}
                        });
                        $(".fullScreenSpin").css("display", "none");
                    });
            } else {
                //TODO: Start Appointment SMS sent here
                const customerPhone = $("#mobile").val();
                const smsCustomer = $("#chkSMSCustomer").is(":checked");
                const smsUser = $("#chkSMSUser").is(":checked");
                const smsSettings = templateObject.defaultSMSSettings.get();
                let sendSMSRes = true;
                if (
                    (smsCustomer || smsUser) &&
                    customerPhone != "0" &&
                    smsSettings.twilioAccountId
                ) {
                    sendSMSRes = await templateObject.sendSMSMessage(
                        "start",
                        "+" + customerPhone.replace("+", "")
                    );
                    if (!sendSMSRes.success) {
                        swal({
                            title: "Oops...",
                            text: sendSMSRes.message,
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try again",
                        }).then((result) => {
                            if (result.value) {
                                $("#startAppointmentModal").modal("hide");
                            }
                        });
                    } else {
                        localStorage.setItem("smsId", sendSMSRes.sid);
                        swal({
                            title: "SMS was sent successfully",
                            text: "SMS was sent successfully",
                            type: "success",
                            showCancelButton: false,
                            confirmButtonText: "Ok",
                        });
                        $("#tActualStartTime").val(
                            moment().startOf("hour").format("HH") +
                            ":" +
                            moment().startOf("minute").format("mm")
                        );
                        $("#btnCloseStartAppointmentModal").trigger("click");
                        //$('#frmAppointment').trigger('submit');
                    }
                } else {
                    //$("#tActualStartTime").val(moment().startOf('hour').format('HH') + ":" + moment().startOf('minute').format('mm'));
                    $("#btnCloseStartAppointmentModal").trigger("click");
                    //$('#frmAppointment').trigger('submit');
                }
            }
        } else {
            const customerPhone = $("#mobile").val();
            const smsCustomer = $("#chkSMSCustomer").is(":checked");
            const smsUser = $("#chkSMSUser").is(":checked");
            const smsSettings = templateObject.defaultSMSSettings.get();
            let sendSMSRes = true;
            if (
                (smsCustomer || smsUser) &&
                customerPhone != "0" &&
                smsSettings.twilioAccountId
            ) {
                sendSMSRes = await templateObject.sendSMSMessage(
                    "start",
                    "+" + customerPhone.replace("+", "")
                );
                if (!sendSMSRes.success) {
                    swal({
                        title: "Oops...",
                        text: sendSMSRes.message,
                        type: "error",
                        showCancelButton: false,
                        confirmButtonText: "Try again",
                    }).then((result) => {
                        if (result.value) {
                            $("#startAppointmentModal").modal("hide");
                        } else {
                            Meteor._reload.reload();
                        }
                    });
                } else {
                    localStorage.setItem("smsId", sendSMSRes.sid);
                    swal({
                        title: "SMS was sent successfully",
                        text: "SMS was sent successfully",
                        type: "success",
                        showCancelButton: false,
                        confirmButtonText: "Ok",
                    });
                    $("#tActualStartTime").val(
                        moment().startOf("hour").format("HH") +
                        ":" +
                        moment().startOf("minute").format("mm")
                    );
                    $("#btnCloseStartAppointmentModal").trigger("click");
                    $("#frmAppointment").trigger("submit");
                }
            } else {
                $("#tActualStartTime").val(
                    moment().startOf("hour").format("HH") +
                    ":" +
                    moment().startOf("minute").format("mm")
                );
                $("#btnCloseStartAppointmentModal").trigger("click");
                $("#frmAppointment").trigger("submit");
            }
        }
    },
    "click #btnStartAppointment": function() {
        const templateObject = Template.instance();

        let empID = templateObject.empID.get();
        let leaveemployeerecords = templateObject.leaveemployeerecords.get();
        var startdateGet = new Date($("#dtSODate").datepicker("getDate"));
        var leaveFlag = false;
        leaveemployeerecords.forEach((item) => {
            if (item.EmployeeID == empID && startdateGet >= new Date(item.StartDate) && startdateGet <= new Date(item.EndDate)) {
                swal(
                    "Employee is unavailable due to being on Leave",
                    "",
                    "warning"
                );
                leaveFlag = true;
            }
        });

        if (!leaveFlag) {
            templateObject.checkSMSSettings();
            const smsCustomer = $("#chkSMSCustomer").is(":checked");
            const smsUser = $("#chkSMSUser").is(":checked");
            const customerPhone = $("#mobile").val();
            if (customerPhone === "" || customerPhone === "0") {
                if (smsCustomer || smsUser) {
                    swal({
                        title: "Invalid Phone Number",
                        text: "SMS messages won't be sent.",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Continue",
                        cancelButtonText: "Cancel",
                    }).then((result) => {
                        if (result.value) {
                            $("#chkSMSCustomer").prop("checked", false);
                            $("#chkSMSUser").prop("checked", false);
                            $("#btnStartAppointmentConfirm").trigger("click");
                        }
                    });
                } else {
                    $("#btnStartAppointmentConfirm").trigger("click");
                }
            } else {
                const smsSettings = templateObject.defaultSMSSettings.get();
                if (smsCustomer || smsUser) {
                    if (!smsSettings || !smsSettings.twilioAccountId) {
                        swal({
                            title: "No SMS Settings",
                            text: "Do you wish to setup SMS Confirmation?",
                            type: "question",
                            showCancelButton: true,
                            confirmButtonText: "Continue",
                            cancelButtonText: "Go to SMS Settings",
                        }).then((result) => {
                            if (result.value) {
                                $("#chkSMSCustomer").prop("checked", false);
                                $("#chkSMSUser").prop("checked", false);
                                $("#btnStartAppointmentConfirm").trigger("click");
                            } else if (result.dismiss === "cancel") {
                                window.open("/smssettings", "_self");
                            } else {
                                window.open("/smssettings", "_self");
                            }
                        });
                    } else {
                        $("#startAppointmentModal").modal("show");
                        const accountName = $("#customer").val();
                        const employeeName = $("#employee_name").val();
                        const companyName = Session.get("vs1companyName");
                        const productService = $("#product-list").val();
                        const startAppointmentSMS = templateObject.defaultSMSSettings
                            .get()
                            .startAppointmentSMSMessage.replace("[Customer Name]", accountName)
                            .replace("[Employee Name]", employeeName)
                            .replace("[Company Name]", companyName)
                            .replace("[Product/Service]", productService);
                        $("#startAppointmentSMSMessage").val(startAppointmentSMS);
                    }
                } else {
                    //$("#tActualStartTime").val(moment().startOf('hour').format('HH') + ":" + moment().startOf('minute').format('mm'));
                    $("#btnStartAppointmentConfirm").trigger("click");
                }
            }
        }
    },
    "click .btnStartIgnoreSMS": function() {
        $("#chkSMSCustomer").prop("checked", false);
        $("#chkSMSUser").prop("checked", false);
        $("#btnStartAppointmentConfirm").trigger("click");
    },
    "click #btnStopAppointment": function() {
        const templateObject = Template.instance();
        templateObject.checkSMSSettings();
        const smsCustomer = $("#chkSMSCustomer").is(":checked");
        const smsUser = $("#chkSMSUser").is(":checked");
        const customerPhone = $("#mobile").val();
        if (customerPhone === "" || customerPhone === "0") {
            if (smsCustomer || smsUser) {
                swal({
                    title: "Invalid Phone Number",
                    text: "SMS messages won't be sent.",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Continue",
                    cancelButtonText: "Cancel",
                }).then((result) => {
                    if (result.value) {
                        $("#chkSMSCustomer").prop("checked", false);
                        $("#chkSMSUser").prop("checked", false);
                        $("#btnEndActualTime").trigger("click");
                    }
                });
            } else $("#btnEndActualTime").trigger("click");
        } else {
            const smsSettings = templateObject.defaultSMSSettings.get();
            if (smsCustomer || smsUser) {
                if (!smsSettings || !smsSettings.twilioAccountId) {
                    swal({
                        title: "No SMS Settings",
                        text: "Do you wish to setup SMS Confirmation?",
                        type: "question",
                        showCancelButton: true,
                        confirmButtonText: "Continue",
                        cancelButtonText: "Go to SMS Settings",
                    }).then((result) => {
                        if (result.value) {
                            $("#chkSMSCustomer").prop("checked", false);
                            $("#chkSMSUser").prop("checked", false);
                            $("#btnEndActualTime").trigger("click");
                        } else if (result.dismiss === "cancel") {
                            window.open("/smssettings", "_self");
                        } else {
                            window.open("/smssettings", "_self");
                        }
                    });
                } else {
                    $("#stopAppointmentModal").modal("show");
                    const accountName = $("#customer").val();
                    const employeeName = $("#employee_name").val();
                    const companyName = Session.get("vs1companyName");
                    const productService = $("#product-list").val();
                    const stopAppointmentSMS = templateObject.defaultSMSSettings
                        .get()
                        .stopAppointmentSMSMessage.replace("[Customer Name]", accountName)
                        .replace("[Employee Name]", employeeName)
                        .replace("[Company Name]", companyName)
                        .replace("[Product/Service]", productService);
                    $("#stopAppointmentSMSMessage").val(stopAppointmentSMS);
                }
            } else {
                $("#btnEndActualTime").trigger("click");
            }
        }
    },
    "click .btnStopIgnoreSMS": function() {
        $("#chkSMSCustomer").prop("checked", false);
        $("#chkSMSUser").prop("checked", false);
        $("#btnEndActualTime").trigger("click");
    },

    "click #btnSaveAppointment": async function() {
        playSaveAudio();
        const templateObject = Template.instance();
        setTimeout(async function() {
            const isLeaveBooked = await templateObject.getLeaveRequests();
            if (isLeaveBooked === true) {
                swal("Appointments can't be booked against this Employee", "", "error");
                return;
            }

            let empID = templateObject.empID.get();
            let leaveemployeerecords = templateObject.leaveemployeerecords.get();
            var startdateGet = new Date($("#dtSODate").datepicker("getDate"));
            var leaveFlag = false;
            leaveemployeerecords.forEach((item) => {
                if (item.EmployeeID == empID && startdateGet >= new Date(item.StartDate) && startdateGet <= new Date(item.EndDate)) {
                    swal(
                        "Employee is unavailable due to being on Leave",
                        "",
                        "warning"
                    );
                    leaveFlag = true;
                }
            });

            if (!leaveFlag) {
                templateObject.checkSMSSettings();
                const smsCustomer = $("#chkSMSCustomer").is(":checked");
                const smsUser = $("#chkSMSUser").is(":checked");
                const emailCustomer = $("#customerEmail").is(":checked");
                const emailUser = $("#userEmail").is(":checked");
                localStorage.setItem("smsCustomerAppt", smsCustomer);
                localStorage.setItem("smsUserAppt", smsUser);
                localStorage.setItem("emailCustomerAppt", emailCustomer);
                localStorage.setItem("emailUserAppt", emailUser);
                const customerPhone = $("#mobile").val();
                if (customerPhone === "" || customerPhone === "0") {
                    if (smsCustomer || smsUser) {
                        swal({
                            title: "Invalid Phone Number",
                            text: "SMS messages won't be sent.",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Continue",
                            cancelButtonText: "Cancel",
                        }).then((result) => {
                            if (result.value) {
                                $("#chkSMSCustomer").prop("checked", false);
                                $("#chkSMSUser").prop("checked", false);
                                $("#btnSaveAppointmentSubmit").trigger("click");
                            }
                        });
                    } else if ($("#tActualEndTime").val() == "" && (emailCustomer || emailUser)) {
                        $("#saveAppointmentModal").modal("show");
                        const accountName = $("#customer").val();
                        const employeeName = $("#employee_name").val();
                        const companyName = Session.get("vs1companyName");
                        const fullAddress =
                            $("#address").val() +
                            ", " +
                            $("#suburb").val() +
                            ", " +
                            $("#state").val() +
                            ", " +
                            $("#country").val();
                        const bookedTime = $("#startTime").val() ? $("#startTime").val() : "";
                        const productService = $("#product-list").val();
                        const saveAppointmentSMS = templateObject.defaultSMSSettings
                            .get()
                            .saveAppointmentSMSMessage.replace("[Customer Name]", accountName)
                            .replace("[Employee Name]", employeeName)
                            .replace("[Company Name]", companyName)
                            .replace("[Product/Service]", productService)
                            .replace("[Full Address]", fullAddress)
                            .replace("[Booked Time]", bookedTime);
                        $("#saveAppointmentSMSMessage").val(saveAppointmentSMS);
                    } else {
                        $("#btnSaveAppointmentSubmit").trigger("click");
                    }
                } else {
                    // const templateObject = Template.instance();
                    const smsSettings = templateObject.defaultSMSSettings.get();
                    if ($("#tActualEndTime").val() == "" && (smsCustomer || smsUser)) {
                        if (!smsSettings || !smsSettings.twilioAccountId) {
                            swal({
                                title: "No SMS Settings",
                                // text: "SMS messages won't be sent to Customer or User.",
                                text: "Do you wish to setup SMS Confirmation?",
                                type: "question",
                                // type: 'warning',
                                showCancelButton: true,
                                confirmButtonText: "Continue",
                                cancelButtonText: "Go to SMS Settings",
                            }).then((result) => {
                                if (result.value) {
                                    $("#chkSMSCustomer").prop("checked", false);
                                    $("#chkSMSUser").prop("checked", false);
                                    $("#btnStartAppointmentConfirm").trigger("click");
                                } else if (result.dismiss === "cancel") {
                                    window.open("/smssettings", "_self");
                                } else {
                                    window.open("/smssettings", "_self");
                                }
                            });
                        } else {
                            $("#saveAppointmentModal").modal("show");
                            const accountName = $("#customer").val();
                            const employeeName = $("#employee_name").val();
                            const companyName = Session.get("vs1companyName");
                            const fullAddress =
                                $("#address").val() +
                                ", " +
                                $("#suburb").val() +
                                ", " +
                                $("#state").val() +
                                ", " +
                                $("#country").val();
                            const bookedTime = $("#startTime").val() ? $("#startTime").val() : "";
                            const productService = $("#product-list").val();
                            const saveAppointmentSMS = templateObject.defaultSMSSettings
                                .get()
                                .saveAppointmentSMSMessage.replace("[Customer Name]", accountName)
                                .replace("[Employee Name]", employeeName)
                                .replace("[Company Name]", companyName)
                                .replace("[Product/Service]", productService)
                                .replace("[Full Address]", fullAddress)
                                .replace("[Booked Time]", bookedTime);
                            $("#saveAppointmentSMSMessage").val(saveAppointmentSMS);
                        }
                    } else if ($("#tActualEndTime").val() == "" && (emailCustomer || emailUser)) {
                        $("#saveAppointmentModal").modal("show");
                        const accountName = $("#customer").val();
                        const employeeName = $("#employee_name").val();
                        const companyName = Session.get("vs1companyName");
                        const fullAddress =
                            $("#address").val() +
                            ", " +
                            $("#suburb").val() +
                            ", " +
                            $("#state").val() +
                            ", " +
                            $("#country").val();
                        const bookedTime = $("#startTime").val() ? $("#startTime").val() : "";
                        const productService = $("#product-list").val();
                        const saveAppointmentSMS = templateObject.defaultSMSSettings
                            .get()
                            .saveAppointmentSMSMessage.replace("[Customer Name]", accountName)
                            .replace("[Employee Name]", employeeName)
                            .replace("[Company Name]", companyName)
                            .replace("[Product/Service]", productService)
                            .replace("[Full Address]", fullAddress)
                            .replace("[Booked Time]", bookedTime);
                        $("#saveAppointmentSMSMessage").val(saveAppointmentSMS);
                    } else {
                        $("#btnSaveAppointmentSubmit").trigger("click");
                    }
                }
            }
        }, delayTimeAfterSound);
    },
    "click .btnSaveIgnoreSMS": async function() {
        playSaveAudio();
        setTimeout(async function() {
            $("#chkSMSCustomer").prop("checked", false);
            $("#chkSMSUser").prop("checked", false);
            let emailCustomer = $("#customerEmail").is(":checked");
            let emailUser = $("#userEmail").is(":checked");
            if (emailCustomer || emailUser) {
                await sendAppointmentEmail();
                $("#frmAppointment").trigger("submit");
            } else {
                $("#frmAppointment").trigger("submit");
            }
        }, delayTimeAfterSound);
    },
    "click #btnCloseStopAppointmentModal": function() {
        $("#stopAppointmentModal").modal("hide");
    },
    "click #btnCloseStartAppointmentModal": function() {
        $("#startAppointmentModal").modal("hide");
    },
    "click #btnCloseSaveAppointmentModal": function() {
        $("#saveAppointmentModal").modal("hide");
    },
    "click #btnSaveAppointmentSubmit": async function(e) {
        e.preventDefault();
        const templateObject = Template.instance();
        const smsCustomer = $("#chkSMSCustomer").is(":checked");
        const smsUser = $("#chkSMSUser").is(":checked");
        const customerPhone = $("#mobile").val();
        var emailCustomer = $("#customerEmail").is(":checked");
        var emailUser = $("#userEmail").is(":checked");
        const smsSettings = templateObject.defaultSMSSettings.get();
        let sendSMSRes = true;

        if (
            (smsCustomer || smsUser) &&
            customerPhone != "0" &&
            smsSettings.twilioAccountId
        ) {
            sendSMSRes = await templateObject.sendSMSMessage(
                "save",
                "+" + customerPhone.replace("+", "")
            );
            if (!sendSMSRes.success) {
                swal({
                    title: "Oops...",
                    text: sendSMSRes.message,
                    type: "error",
                    showCancelButton: false,
                    confirmButtonText: "Try again",
                }).then((result) => {
                    if (result.value) {
                        $("#saveAppointmentModal").modal("hide");
                    } else {
                        // window.open('/appointments', '_self');
                    }
                });
            } else {
                localStorage.setItem("smsId", sendSMSRes.sid);
                $("#saveAppointmentModal").modal("hide");
                swal({
                    title: "SMS was sent successfully",
                    text: "SMS was sent successfully",
                    type: "success",
                    showCancelButton: false,
                    confirmButtonText: "Ok",
                }).then((result) => {
                    if (result.value) {
                        $("#event-modal").modal("hide");
                    } else {
                        // window.open('/appointments', '_self');
                    }
                });
                if (emailCustomer || emailUser) {
                    await sendAppointmentEmail();
                    $("#frmAppointment").trigger("submit");
                } else {
                    $("#frmAppointment").trigger("submit");
                }
            }
        } else {
            if (emailCustomer || emailUser) {
                await sendAppointmentEmail();
                $("#frmAppointment").trigger("submit");
            } else {
                $("#frmAppointment").trigger("submit");
            }
        }
    },
    "change #chkSMSCustomer": function() {
        if ($("#chkSMSCustomer").is(":checked")) {
            const templateObject = Template.instance();
            templateObject.checkSMSSettings();
        }
    },
    "change #chkSMSUser": function() {
        if ($("#chkSMSUser").is(":checked")) {
            const templateObject = Template.instance();
            templateObject.checkSMSSettings();
        }
    },
    "click #btnEndActualTime": function() {
        const templateObject = Template.instance();
        let id = $("#updateID").val();
        var result = templateObject.appointmentInfo.get();

        let paused = result[0].isPaused || "";
        if (paused == "Paused") {
            swal({
                title: "Can't Stop Job",
                text: 'This Job is Currently Paused, click "OK" to go back and click "Start" to Continue the Job',
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Ok",
            });
        } else {
            if (document.getElementById("tActualStartTime").value == "") {} else {
                document.getElementById("tActualEndTime").value =
                    moment().startOf("hour").format("HH") +
                    ":" +
                    moment().startOf("minute").format("mm");
                const selectedProduct = document.getElementById("product-list").value;
                const notes = document.getElementById("txtNotes").value;

                // $("#customerListModal").modal("show");
                $("#stopAppointment").modal("show");
            }
        }
    },
    "click #btnCloseStopAppointment": function() {
        document.getElementById("tActualEndTime").value = "";
        document.getElementById("txtActualHoursSpent").value = "0";
    },
    "click #btnEndAppointment": async function() {
        const templateObject = Template.instance();
        let id = $("#updateID").val();
        var result = templateObject.appointmentInfo.get();

        document.getElementById("tActualEndTime").value =
            moment().startOf("hour").format("HH") +
            ":" +
            moment().startOf("minute").format("mm");

        let date1 = document.getElementById("dtSODate").value;
        let date2 = document.getElementById("dtSODate2").value;
        date1 = templateObject.dateFormat(date1);
        date2 = templateObject.dateFormat(date2);
        var endTime = new Date(
            date2 +
            " " +
            document.getElementById("tActualEndTime").value +
            ":00"
        );
        var startTime = new Date(
            date1 +
            " " +
            document.getElementById("tActualStartTime").value +
            ":00"
        );
        document.getElementById("txtActualHoursSpent").value = parseFloat(
            templateObject.diff_hours(endTime, startTime)
        ).toFixed(2);
        document.getElementById("txtNotes").value = document.getElementById("txtNotes-1").value;

        //TODO: Stop Appointment SMS sent here
        const customerPhone = $("#mobile").val();
        const smsCustomer = $("#chkSMSCustomer").is(":checked");
        const smsUser = $("#chkSMSUser").is(":checked");
        const smsSettings = templateObject.defaultSMSSettings.get();
        let sendSMSRes = true;
        if (
            (smsCustomer || smsUser) &&
            customerPhone != "0" &&
            smsSettings.twilioAccountId
        ) {
            sendSMSRes = await templateObject.sendSMSMessage(
                "stop",
                "+" + customerPhone.replace("+", "")
            );
            if (!sendSMSRes.success) {
                swal({
                    title: "Oops...",
                    text: sendSMSRes.message,
                    type: "error",
                    showCancelButton: false,
                    confirmButtonText: "Try again",
                }).then((result) => {
                    if (result.value) {
                        $("#startAppointmentModal").modal("hide");
                    }
                });
            } else {
                localStorage.setItem("smsId", sendSMSRes.sid);
                swal({
                    title: "SMS was sent successfully",
                    text: "SMS was sent successfully",
                    type: "success",
                    showCancelButton: false,
                    confirmButtonText: "Ok",
                });
                $("#btnCloseStopAppointmentModal").trigger("click");
                $("#frmAppointment").trigger("submit");
            }
        } else {
            $("#btnCloseStopAppointmentModal").trigger("click");
            $("#frmAppointment").trigger("submit");
        }
    },
    "click #btnHold": function(event) {
        if ($("#updateID").val() == "") {
            swal({
                title: "Oops...",
                text: "This Appointment hasn't been started. Please Save and then Start your Appointment before continuing.",
                type: "warning",
                showCancelButton: false,
                confirmButtonText: "Ok",
            });
        } else {
            $("#frmOnHoldModal").modal();
        }
    },
    "click #btnHold span": function(event) {
        if (Session.get("CloudAppointmentStartStopAccessLevel") == true) {
            swal({
                title: "Oops...",
                text: 'You do not have access to put appointments "On Hold"',
                type: "error",
                showCancelButton: false,
                confirmButtonText: "OK",
            }).then((results) => {
                if (results.value) {} else if (results.dismiss === "cancel") {}
            });
        }
    },
    "click #btnDeleteDisbale span": function(event) {
        swal({
            title: "Oops...",
            text: "You don't have access to delete appointment",
            type: "error",
            showCancelButton: false,
            confirmButtonText: "OK",
        }).then((results) => {
            if (results.value) {} else if (results.dismiss === "cancel") {}
        });
    },
    "click #btnOptionsDisable span": function(event) {
        swal({
            title: "Oops...",
            text: "You don't have access to appointment options",
            type: "error",
            showCancelButton: false,
            confirmButtonText: "OK",
        }).then((results) => {
            if (results.value) {} else if (results.dismiss === "cancel") {}
        });
    },
    "click #btnCreateInvoiceDisable span": function(event) {
        swal({
            title: "Oops...",
            text: "You don't have access to create invoice",
            type: "error",
            showCancelButton: false,
            confirmButtonText: "OK",
        }).then((results) => {
            if (results.value) {} else if (results.dismiss === "cancel") {}
        });
    },
    "click #btnCopyOptionsDisable span": function(event) {
        swal({
            title: "Oops...",
            text: "You don't have access to copy appointment",
            type: "error",
            showCancelButton: false,
            confirmButtonText: "OK",
        }).then((results) => {
            if (results.value) {} else if (results.dismiss === "cancel") {}
        });
    },
    "click #btnDelete": async function(event) {
        let templateObject = Template.instance();
        await templateObject.hasFollowings();
        $("#deleteLineModal").modal("toggle");
    },
    "click .btnDeleteAppointment": function(event) {
        playDeleteAudio();
        setTimeout(function() {
            let id = $("#appID").val();
            swal({
                title: "Delete Appointment",
                text: "Are you sure you want to delete Appointment?",
                type: "question",
                showCancelButton: true,
                confirmButtonText: "Yes",
            }).then((result) => {
                if (result.value) {
                    $(".fullScreenSpin").css("display", "inline-block");
                    if (id == "0" || id == null) {
                        swal({
                            title: "Can't delete appointment, it does not exist",
                            text: "Can't delete appointment, it does not exist",
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        });
                    } else {
                        let objectData = {
                            type: "TAppointmentEx",
                            fields: {
                                Id: parseInt(id),
                                Active: false,
                            },
                        };

                        appointmentService
                            .saveAppointment(objectData)
                            .then(function(data) {
                                $("#event-modal").modal("hide");
                                sideBarService
                                    .getAllAppointmentList(initialDataLoad, 0)
                                    .then(function(dataList) {
                                        addVS1Data("TAppointment", JSON.stringify(dataList))
                                            .then(function(datareturn) {
                                                setTimeout(function() {
                                                    Meteor._reload.reload();
                                                }, 500);
                                            })
                                            .catch(function(err) {
                                                Meteor._reload.reload();
                                            });
                                    })
                                    .catch(function(err) {
                                        Meteor._reload.reload();
                                    });
                            })
                            .catch(function(err) {
                                $(".fullScreenSpin").css("display", "none");
                            });
                    }
                } else if (result.dismiss === "cancel") {} else {}
            });
        }, delayTimeAfterSound);
    },
    "click .btnDeleteFollowingAppointments": async function(event) {
        playDeleteAudio();
        var erpGet = erpDb();
        setTimeout(async function() {
            swal({
                title: "Delete Appointment",
                text: "Are you sure you want to delete this Appointment and the following Appointments?",
                type: "question",
                showCancelButton: true,
                confirmButtonText: "Yes",
            }).then(async(result) => {
                if (result.value) {
                    $(".fullScreenSpin").css("display", "inline-block");
                    var currentAppt = $("#appID").val();
                    currentAppt = parseInt(currentAppt);
                    let apptIds = await appointmentService.getAllAppointmentListCount2();
                    let apptIdList = apptIds.tappointmentex;
                    let cnt = 0;
                    for (let i = 0; i < apptIdList.length; i++) {
                        if (apptIdList[i].Id >= currentAppt) {
                            let objectData = {
                                type: "TAppointmentEx",
                                fields: {
                                    Id: apptIdList[i].Id,
                                    Active: false,
                                },
                            };
                            let ret1 = await appointmentService.saveAppointment(objectData);
                        }
                    }
                    $(".fullScreenSpin").css("display", "none");
                    Meteor._reload.reload();
                    $('.modal-backdrop').css('display', 'none');
                }
            });
        }, delayTimeAfterSound);
    },
    "click #btnCreateInvoice": function(event) {
        $(".fullScreenSpin").css("display", "inline-block");
        const templateObject = Template.instance();
        let id = $("#appID").val();
        if (id == "") {
            swal(
                "Please Save Appointment Before Creating an Invoice For it",
                "",
                "warning"
            );
            $(".fullScreenSpin").css("display", "none");
        } else {
            let obj = {
                AppointID: parseInt(id),
            };
            let JsonIn = {
                Name: "VS1_InvoiceAppt",
                Params: {
                    AppointIDs: [obj],
                },
            };
            var erpGet = erpDb();
            var oPost = new XMLHttpRequest();
            oPost.open(
                "POST",
                URLRequest +
                erpGet.ERPIPAddress +
                ":" +
                erpGet.ERPPort +
                "/" +
                'erpapi/VS1_Cloud_Task/Method?Name="VS1_InvoiceAppt"',
                true
            );
            oPost.setRequestHeader("database", erpGet.ERPDatabase);
            oPost.setRequestHeader("username", erpGet.ERPUsername);
            oPost.setRequestHeader("password", erpGet.ERPPassword);
            oPost.setRequestHeader("Accept", "application/json");
            oPost.setRequestHeader("Accept", "application/html");
            oPost.setRequestHeader("Content-type", "application/json");
            // let objDataSave = '"JsonIn"' + ':' + JSON.stringify(selectClient);
            oPost.send(JSON.stringify(JsonIn));

            oPost.onreadystatechange = function() {
                if (oPost.readyState == 4 && oPost.status == 200) {
                    $(".fullScreenSpin").css("display", "none");
                    var myArrResponse = JSON.parse(oPost.responseText);
                    if (myArrResponse.ProcessLog.ResponseStatus.includes("OK")) {
                        let objectDataConverted = {
                            type: "TAppointmentEx",
                            fields: {
                                Id: parseInt(id),
                                Status: "Converted",
                            },
                        };
                        appointmentService
                            .saveAppointment(objectDataConverted)
                            .then(function(res) {
                                sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function(data) {
                                    addVS1Data('TAppointment', JSON.stringify(data)).then(function(datareturn) {
                                        $(".modal-backdrop").css("display", "none");
                                        FlowRouter.go(
                                            "/invoicelist?success=true&apptId=" + parseInt(id)
                                        );
                                    }).catch(function(err) {
                                        $(".fullScreenSpin").css("display", "none");
                                    });
                                }).catch(function(err) {
                                    $(".fullScreenSpin").css("display", "none");
                                });
                            })
                            .catch(function(err) {
                                $(".fullScreenSpin").css("display", "none");
                            });

                        // templateObject.getAllAppointmentDataOnConvert();
                    } else {
                        $(".modal-backdrop").css("display", "none");
                        $(".fullScreenSpin").css("display", "none");
                        swal({
                            title: "Oops...",
                            text: myArrResponse.ProcessLog.ResponseStatus,
                            type: "warning",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        }).then((result) => {
                            if (result.value) {} else if (result.dismiss === "cancel") {}
                        });
                    }
                } else if (oPost.readyState == 4 && oPost.status == 403) {
                    $(".fullScreenSpin").css("display", "none");
                    swal({
                        title: "Oops...",
                        text: oPost.getResponseHeader("errormessage"),
                        type: "error",
                        showCancelButton: false,
                        confirmButtonText: "Try Again",
                    }).then((result) => {
                        if (result.value) {} else if (result.dismiss === "cancel") {}
                    });
                } else if (oPost.readyState == 4 && oPost.status == 406) {
                    $(".fullScreenSpin").css("display", "none");
                    var ErrorResponse = oPost.getResponseHeader("errormessage");
                    var segError = ErrorResponse.split(":");

                    if (segError[1] == ' "Unable to lock object') {
                        swal({
                            title: "Oops...",
                            text: oPost.getResponseHeader("errormessage"),
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        }).then((result) => {
                            if (result.value) {} else if (result.dismiss === "cancel") {}
                        });
                    } else {
                        $(".fullScreenSpin").css("display", "none");
                        swal({
                            title: "Oops...",
                            text: oPost.getResponseHeader("errormessage"),
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        }).then((result) => {
                            if (result.value) {} else if (result.dismiss === "cancel") {}
                        });
                    }
                } else if (oPost.readyState == "") {
                    $(".fullScreenSpin").css("display", "none");
                    swal({
                        title: "Oops...",
                        text: oPost.getResponseHeader("errormessage"),
                        type: "error",
                        showCancelButton: false,
                        confirmButtonText: "Try Again",
                    }).then((result) => {
                        if (result.value) {} else if (result.dismiss === "cancel") {}
                    });
                }
            };
        }
    },
    "submit #frmAppointment": async function(event) {
        $(".fullScreenSpin").css("display", "inline-block");
        event.preventDefault();

        $("#btnselProductFees").trigger("click");

        var frmAppointment = $("#frmAppointment")[0];
        templateObject = Template.instance();
        let contactService = new ContactService();
        let updateID = $("#updateID").val() || 0;
        let paused = "";
        let result = templateObject.appointmentInfo.get();

        var formData = new FormData(frmAppointment);
        let aStartDate = "";
        let aEndDate = "";
        let savedStartDate =
            $("#aStartDate").val() || moment().format("YYYY-MM-DD");
        let clientname = formData.get("customer") || "";
        // const itl = templateObject.itl.get();
        let clientmobile = $("#mobile").val() ? $("#mobile").val() : "0";
        // let clientmobile = formData.get('mobile') || '0';
        let contact = formData.get("phone") || "0";
        let startTime = $("#startTime").val() + ":00" || "";
        let endTime = $("#endTime").val() + ":00" || "";
        let aStartTime = $("#tActualStartTime").val() || "";
        let aEndTime = $("#tActualEndTime").val() || "";
        let state = formData.get("state") || "";
        let country = formData.get("country") || "";
        let street = formData.get("address") || "";
        let zip = formData.get("zip") || "";
        let suburb = formData.get("suburb") || "";
        var startdateGet = new Date($("#dtSODate").datepicker("getDate"));
        var endDateGet = new Date($("#dtSODate2").datepicker("getDate"));
        let startDate =
            startdateGet.getFullYear() +
            "-" +
            ("0" + (startdateGet.getMonth() + 1)).slice(-2) +
            "-" +
            ("0" + startdateGet.getDate()).slice(-2);
        let endDate =
            endDateGet.getFullYear() +
            "-" +
            ("0" + (endDateGet.getMonth() + 1)).slice(-2) +
            "-" +
            ("0" + endDateGet.getDate()).slice(-2);
        let employeeName = formData.get("employee_name").trim() || "";
        let id = formData.get("updateID") || "0";
        let logid = formData.get("logID") || "0";
        let notes = formData.get("txtNotes") || " ";
        let selectedProduct = $("#product-list").val() || "";
        let selectedExtraProduct = templateObject.productFees.get() || "";
        let hourlyRate = "";
        let status = "Not Converted";
        let uploadedItems = templateObject.uploadedFiles.get();
        $(".fullScreenSpin").css("display", "inline-block");
        if (aStartTime != "") {
            aStartDate = savedStartDate + " " + aStartTime;
        } else {
            aStartDate = "";
        }

        if (aEndTime != "") {
            aEndDate = moment().format("YYYY-MM-DD") + " " + aEndTime;
        } else {
            aEndDate = "";
        }
        // if (aStartTime != "" && aEndDate == "") {
        //     aEndDate = aStartDate;
        // }
        let obj = {};
        let date = new Date();
        if (updateID) {
            hourlyRate = result[0].rate;

            if (result[0].aStartTime == "" && $("#tActualStartTime").val() != "") {
                obj = {
                    type: "TAppointmentsTimeLog",
                    fields: {
                        appointID: updateID,
                        StartDatetime: aStartDate,
                        EndDatetime: "",
                        Description: "Job Started",
                    },
                };
            } else if (
                result[0].aStartTime != "" &&
                result[0].aEndTime == "" &&
                $("#tActualEndTime").val() != ""
            ) {
                let startTime1 =
                    date.getFullYear() +
                    "-" +
                    ("0" + (date.getMonth() + 1)).slice(-2) +
                    "-" +
                    ("0" + date.getDate()).slice(-2) +
                    " " +
                    ("0" + date.getHours()).slice(-2) +
                    ":" +
                    ("0" + date.getMinutes()).slice(-2);
                obj = {
                    type: "TAppointmentsTimeLog",
                    fields: {
                        appointID: updateID,
                        StartDatetime: aStartDate,
                        EndDatetime: aEndDate,
                        Description: "Job Completed",
                    },
                };
            } else if (result[0].aEndTime != "") {
                aEndDate = moment().format("YYYY-MM-DD") + " " + aEndTime;
            }
        } else {
            if (
                $("#tActualStartTime").val() != "" &&
                $("#tActualEndTime").val() != ""
            ) {
                obj = {
                    type: "TAppointmentsTimeLog",
                    fields: {
                        appointID: "",
                        StartDatetime: aStartDate,
                        EndDatetime: aEndDate,
                        Description: "Job Completed",
                    },
                };
            } else if ($("#tActualStartTime").val() != "") {
                obj = {
                    type: "TAppointmentsTimeLog",
                    fields: {
                        appointID: "",
                        StartDatetime: aStartDate,
                        EndDatetime: "",
                        Description: "Job Started",
                    },
                };
            }
        }

        let objectData = "";

        const messageSid = localStorage.getItem("smsId") || "";
        if (createAppointment == false) {
            if (id == "0") {
                $(".modal-backdrop").css("display", "none");
                $(".fullScreenSpin").css("display", "none");
                swal({
                    title: "Oops...",
                    text: "You don't have access to create a new Appointment",
                    type: "error",
                    showCancelButton: false,
                    confirmButtonText: "OK",
                }).then((result) => {
                    if (result.value) {} else if (result.dismiss === "cancel") {}
                });
                return false;
            } else {
                objectData = {
                    type: "TAppointmentEx",
                    fields: {
                        Id: parseInt(id),
                        ClientName: clientname,
                        Mobile: clientmobile,
                        Phone: contact,
                        StartTime: startDate + " " + startTime,
                        EndTime: endDate + " " + endTime,
                        FeedbackNotes: notes,
                        Street: street,
                        Suburb: suburb,
                        State: state,
                        Postcode: zip,
                        Country: country,
                        Actual_StartTime: aStartDate,
                        Actual_EndTime: aEndDate,
                        // TrainerName: employeeName,
                        Notes: notes,
                        ProductDesc: selectedProduct,
                        ExtraProducts: selectedExtraProduct,
                        Attachments: uploadedItems,
                        Status: status,
                        CUSTFLD12: messageSid || "",
                        CUSTFLD13: !!messageSid ? "Yes" : "No",

                        //   CustomerEmail: customerEmail,
                        //   UserEmail: userEmail
                    },
                };

                appointmentService
                    .saveAppointment(objectData)
                    .then(function(data) {
                        let id = data.fields.ID;
                        let toUpdateID = "";
                        let updateData = "";
                        if (Object.keys(obj).length > 0) {
                            obj.fields.appointID = id;
                            appointmentService
                                .saveTimeLog(obj)
                                .then(function(data1) {
                                    if (obj.fields.Description == "Job Completed") {
                                        let endTime1 =
                                            date.getFullYear() +
                                            "-" +
                                            ("0" + (date.getMonth() + 1)).slice(-2) +
                                            "-" +
                                            ("0" + date.getDate()).slice(-2) +
                                            " " +
                                            ("0" + date.getHours()).slice(-2) +
                                            ":" +
                                            ("0" + date.getMinutes()).slice(-2);
                                        if (result.length > 0) {
                                            if (
                                                Array.isArray(result[0].timelog) &&
                                                result[0].timelog != ""
                                            ) {
                                                toUpdateID =
                                                    result[0].timelog[result[0].timelog.length - 1].fields
                                                    .ID;
                                            } else if (result[0].timelog != "") {
                                                toUpdateID = result[0].timelog.fields.ID;
                                            }
                                        }

                                        if (toUpdateID != "") {
                                            updateData = {
                                                type: "TAppointmentsTimeLog",
                                                fields: {
                                                    ID: toUpdateID,
                                                    EndDatetime: endTime1,
                                                },
                                            };
                                        }

                                        if (Object.keys(updateData).length > 0) {
                                            appointmentService
                                                .saveTimeLog(updateData)
                                                .then(function(data) {
                                                    sideBarService
                                                        .getAllAppointmentList(initialDataLoad, 0)
                                                        .then(function(data) {
                                                            addVS1Data("TAppointment", JSON.stringify(data))
                                                                .then(function(datareturn) {
                                                                    let data = "";
                                                                    data = {
                                                                        type: "TTimeSheetEntry",
                                                                        fields: {
                                                                            // "EntryDate":"2020-10-12 12:39:14",
                                                                            TimeSheet: [{
                                                                                type: "TTimeSheet",
                                                                                fields: {
                                                                                    EmployeeName: employeeName || "",
                                                                                    // HourlyRate:50,
                                                                                    LabourCost: parseFloat(hourlyRate) || 1,
                                                                                    HourlyRate: parseFloat(hourlyRate) || 1,
                                                                                    ServiceName: selectedProduct || "",
                                                                                    Job: clientname || "",
                                                                                    InvoiceNotes: "completed",
                                                                                    Allowedit: true,
                                                                                    // ChargeRate: 100,
                                                                                    Hours: parseFloat(
                                                                                        $("#txtActualHoursSpent").val()
                                                                                    ) || 1,
                                                                                    // OverheadRate: 90,
                                                                                    Job: clientname || "",
                                                                                    StartTime: aStartDate,
                                                                                    EndTime: aEndDate,
                                                                                    // ServiceName: "Test"|| '',

                                                                                    TimeSheetClassName: "Default" || "",
                                                                                    Notes: notes || "",
                                                                                    // EntryDate: accountdesc|| ''
                                                                                },
                                                                            }, ],
                                                                            TypeName: "Payroll",
                                                                            WhoEntered: Session.get("mySessionEmployee") || "",
                                                                        },
                                                                    };
                                                                    contactService
                                                                        .saveTimeSheet(data)
                                                                        .then(function(dataObj) {
                                                                            sideBarService
                                                                                .getAllTimeSheetList()
                                                                                .then(function(data) {
                                                                                    addVS1Data(
                                                                                        "TTimeSheet",
                                                                                        JSON.stringify(data)
                                                                                    );
                                                                                    setTimeout(function() {
                                                                                        Meteor._reload.reload();
                                                                                    }, 50);
                                                                                });
                                                                        })
                                                                        .catch(function(err) {
                                                                            Meteor._reload.reload();
                                                                        });
                                                                })
                                                                .catch(function(err) {
                                                                    Meteor._reload.reload();
                                                                });
                                                        })
                                                        .catch(function(err) {
                                                            Meteor._reload.reload();
                                                        });
                                                })
                                                .catch(function(err) {
                                                    Meteor._reload.reload();
                                                });
                                        } else {
                                            sideBarService
                                                .getAllAppointmentList(initialDataLoad, 0)
                                                .then(function(data) {
                                                    addVS1Data("TAppointment", JSON.stringify(data))
                                                        .then(function(datareturn) {
                                                            let data = "";
                                                            data = {
                                                                type: "TTimeSheetEntry",
                                                                fields: {
                                                                    // "EntryDate":"2020-10-12 12:39:14",
                                                                    TimeSheet: [{
                                                                        type: "TTimeSheet",
                                                                        fields: {
                                                                            EmployeeName: employeeName || "",
                                                                            // HourlyRate:50,
                                                                            LabourCost: parseFloat(hourlyRate) || 1,
                                                                            HourlyRate: parseFloat(hourlyRate) || 1,
                                                                            ServiceName: selectedProduct || "",
                                                                            Job: clientname || "",
                                                                            Allowedit: true,
                                                                            InvoiceNotes: "completed",
                                                                            // ChargeRate: 100,
                                                                            Hours: parseFloat(
                                                                                $("#txtActualHoursSpent").val()
                                                                            ) || 1,
                                                                            // OverheadRate: 90,
                                                                            Job: clientname || "",
                                                                            StartTime: aStartDate,
                                                                            EndTime: aEndDate,
                                                                            // ServiceName: "Test"|| '',
                                                                            TimeSheetClassName: "Default" || "",
                                                                            Notes: notes || "",
                                                                            // EntryDate: accountdesc|| ''
                                                                        },
                                                                    }, ],
                                                                    TypeName: "Payroll",
                                                                    WhoEntered: Session.get("mySessionEmployee") || "",
                                                                },
                                                            };
                                                            contactService
                                                                .saveTimeSheet(data)
                                                                .then(function(dataObj) {
                                                                    sideBarService
                                                                        .getAllTimeSheetList()
                                                                        .then(function(data) {
                                                                            addVS1Data(
                                                                                "TTimeSheet",
                                                                                JSON.stringify(data)
                                                                            );
                                                                            setTimeout(function() {
                                                                                Meteor._reload.reload();
                                                                            }, 50);
                                                                        });
                                                                })
                                                                .catch(function(err) {
                                                                    Meteor._reload.reload();
                                                                });
                                                        })
                                                        .catch(function(err) {
                                                            Meteor._reload.reload();
                                                        });
                                                })
                                                .catch(function(err) {
                                                    Meteor._reload.reload();
                                                });
                                        }
                                    } else {
                                        sideBarService
                                            .getAllAppointmentList(initialDataLoad, 0)
                                            .then(function(data) {
                                                addVS1Data("TAppointment", JSON.stringify(data))
                                                    .then(function(datareturn) {
                                                        setTimeout(function() {
                                                            Meteor._reload.reload();
                                                        }, 50);
                                                    })
                                                    .catch(function(err) {
                                                        Meteor._reload.reload();
                                                    });
                                            })
                                            .catch(function(err) {
                                                Meteor._reload.reload();
                                            });
                                    }
                                })
                                .catch(function(err) {
                                    Meteor._reload.reload();
                                });
                        } else {
                            //return false;
                            sideBarService
                                .getAllAppointmentList(initialDataLoad, 0)
                                .then(function(data) {
                                    addVS1Data("TAppointment", JSON.stringify(data))
                                        .then(function(datareturn) {
                                            setTimeout(function() {
                                                Meteor._reload.reload();
                                            }, 50);
                                        })
                                        .catch(function(err) {
                                            Meteor._reload.reload();
                                        });
                                })
                                .catch(function(err) {
                                    Meteor._reload.reload();
                                });
                        }
                    })
                    .catch(function(err) {
                        $(".fullScreenSpin").css("display", "none");
                        swal({
                            title: "Oops...",
                            text: err,
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        });
                    });
            }
        } else {
            if (id == "0") {
                objectData = {
                    type: "TAppointmentEx",
                    fields: {
                        ClientName: clientname,
                        Mobile: clientmobile,
                        Phone: contact,
                        StartTime: startDate + " " + startTime,
                        EndTime: endDate + " " + endTime,
                        Street: street,
                        Suburb: suburb,
                        State: state,
                        Postcode: zip,
                        Country: country,
                        Actual_StartTime: aStartDate,
                        Actual_EndTime: aEndDate,
                        TrainerName: employeeName,
                        Notes: notes,
                        ProductDesc: selectedProduct,
                        ExtraProducts: selectedExtraProduct,
                        Attachments: uploadedItems,
                        Status: status,
                        CUSTFLD12: messageSid || "",
                        CUSTFLD13: !!messageSid ? "Yes" : "No",
                    },
                };
            } else {
                objectData = {
                    type: "TAppointmentEx",
                    fields: {
                        Id: parseInt(id),
                        ClientName: clientname,
                        Mobile: clientmobile,
                        Phone: contact,
                        StartTime: startDate + " " + startTime,
                        EndTime: endDate + " " + endTime,
                        FeedbackNotes: notes,
                        Street: street,
                        Suburb: suburb,
                        State: state,
                        Postcode: zip,
                        Country: country,
                        Actual_StartTime: aStartDate,
                        Actual_EndTime: aEndDate,
                        TrainerName: employeeName,
                        Notes: notes,
                        ProductDesc: selectedProduct,
                        ExtraProducts: selectedExtraProduct,
                        Attachments: uploadedItems,
                        Status: status,
                        CUSTFLD12: messageSid || "",
                        CUSTFLD13: !!messageSid ? "Yes" : "No",
                    },
                };
            }

            let url = new URL(window.location.href);

            if (logid != "" && logid > 0) {
                obj = {
                    type: "TAppointmentsTimeLog",
                    fields: {
                        appointID: updateID,
                        ID: logid,
                        StartDatetime: aStartDate,
                        EndDatetime: aEndDate
                    },
                };

                if (
                    $("#tActualStartTime").val() != "" &&
                    $("#tActualEndTime").val() != ""
                ) {
                    obj.fields.Description = "Job Completed";
                } else {
                    obj.fields.Description = "Job Started";
                }

                appointmentService
                    .saveTimeLog(obj)
                    .then(function(data) {
                        sideBarService
                            .getAllAppointmentList(initialDataLoad, 0)
                            .then(function(data) {
                                addVS1Data("TAppointment", JSON.stringify(data))
                                    .then(function(datareturn) {
                                        if (obj.fields.Description == "Job Completed") {
                                            let data = "";
                                            data = {
                                                type: "TTimeSheetEntry",
                                                fields: {
                                                    // "EntryDate":"2020-10-12 12:39:14",
                                                    TimeSheet: [{
                                                        type: "TTimeSheet",
                                                        fields: {
                                                            EmployeeName: employeeName || "",
                                                            // HourlyRate:50,
                                                            LabourCost: parseFloat(hourlyRate) || 1,
                                                            HourlyRate: parseFloat(hourlyRate) || 1,
                                                            ServiceName: selectedProduct || "",
                                                            Job: clientname || "",
                                                            InvoiceNotes: "completed",
                                                            Allowedit: true,
                                                            // ChargeRate: 100,
                                                            Hours: parseFloat(
                                                                $("#txtActualHoursSpent").val()
                                                            ) || 1,
                                                            // OverheadRate: 90,
                                                            Job: clientname || "",
                                                            StartTime: aStartDate,
                                                            EndTime: aEndDate,
                                                            // ServiceName: "Test"|| '',

                                                            TimeSheetClassName: "Default" || "",
                                                            Notes: notes || "",
                                                            // EntryDate: accountdesc|| ''
                                                        },
                                                    }, ],
                                                    TypeName: "Payroll",
                                                    WhoEntered: Session.get("mySessionEmployee") || "",
                                                },
                                            };
                                            contactService
                                                .saveTimeSheet(data)
                                                .then(function(dataObj) {
                                                    sideBarService
                                                        .getAllTimeSheetList()
                                                        .then(function(data) {
                                                            addVS1Data(
                                                                "TTimeSheet",
                                                                JSON.stringify(data)
                                                            );
                                                            setTimeout(function() {
                                                                Meteor._reload.reload();
                                                            }, 50);
                                                        });
                                                })
                                                .catch(function(err) {
                                                    Meteor._reload.reload();
                                                });
                                        } else {
                                            Meteor._reload.reload();
                                        }
                                    })
                                    .catch(function(err) {
                                        Meteor._reload.reload();
                                    });
                            })
                            .catch(function(err) {
                                Meteor._reload.reload();
                            });
                    })
                    .catch(function(err) {
                        Meteor._reload.reload();
                    });
            } else {
                appointmentService
                    .saveAppointment(objectData)
                    .then(function(data) {
                        let id = data.fields.ID;
                        let toUpdateID = "";
                        let updateData = "";
                        if (Object.keys(obj).length > 0) {
                            obj.fields.appointID = id;
                            appointmentService
                                .saveTimeLog(obj)
                                .then(function(data1) {
                                    if (obj.fields.Description == "Job Completed") {
                                        let endTime1 =
                                            date.getFullYear() +
                                            "-" +
                                            ("0" + (date.getMonth() + 1)).slice(-2) +
                                            "-" +
                                            ("0" + date.getDate()).slice(-2) +
                                            " " +
                                            ("0" + date.getHours()).slice(-2) +
                                            ":" +
                                            ("0" + date.getMinutes()).slice(-2);
                                        if (result.length > 0) {
                                            if (
                                                Array.isArray(result[0].timelog) &&
                                                result[0].timelog != ""
                                            ) {
                                                toUpdateID =
                                                    result[0].timelog[result[0].timelog.length - 1].fields
                                                    .ID;
                                            } else if (result[0].timelog != "") {
                                                toUpdateID = result[0].timelog.fields.ID;
                                            }
                                        }

                                        if (toUpdateID != "") {
                                            updateData = {
                                                type: "TAppointmentsTimeLog",
                                                fields: {
                                                    ID: toUpdateID,
                                                    EndDatetime: endTime1,
                                                },
                                            };
                                        }

                                        if (Object.keys(updateData).length > 0) {
                                            appointmentService
                                                .saveTimeLog(updateData)
                                                .then(function(data) {
                                                    sideBarService
                                                        .getAllAppointmentList(initialDataLoad, 0)
                                                        .then(function(data) {
                                                            addVS1Data("TAppointment", JSON.stringify(data))
                                                                .then(function(datareturn) {
                                                                    let data = "";
                                                                    data = {
                                                                        type: "TTimeSheetEntry",
                                                                        fields: {
                                                                            // "EntryDate":"2020-10-12 12:39:14",
                                                                            TimeSheet: [{
                                                                                type: "TTimeSheet",
                                                                                fields: {
                                                                                    EmployeeName: employeeName || "",
                                                                                    // HourlyRate:50,
                                                                                    LabourCost: parseFloat(hourlyRate) || 1,
                                                                                    HourlyRate: parseFloat(hourlyRate) || 1,
                                                                                    ServiceName: selectedProduct || "",
                                                                                    Job: clientname || "",
                                                                                    InvoiceNotes: "completed",
                                                                                    Allowedit: true,
                                                                                    // ChargeRate: 100,
                                                                                    Hours: parseFloat(
                                                                                        $("#txtActualHoursSpent").val()
                                                                                    ) || 1,
                                                                                    // OverheadRate: 90,
                                                                                    Job: clientname || "",
                                                                                    StartTime: aStartDate,
                                                                                    EndTime: aEndDate,
                                                                                    // ServiceName: "Test"|| '',

                                                                                    TimeSheetClassName: "Default" || "",
                                                                                    Notes: notes || "",
                                                                                    // EntryDate: accountdesc|| ''
                                                                                },
                                                                            }, ],
                                                                            TypeName: "Payroll",
                                                                            WhoEntered: Session.get("mySessionEmployee") || "",
                                                                        },
                                                                    };
                                                                    contactService
                                                                        .saveTimeSheet(data)
                                                                        .then(function(dataObj) {
                                                                            sideBarService
                                                                                .getAllTimeSheetList()
                                                                                .then(function(data) {
                                                                                    addVS1Data(
                                                                                        "TTimeSheet",
                                                                                        JSON.stringify(data)
                                                                                    );
                                                                                    setTimeout(function() {
                                                                                        Meteor._reload.reload();
                                                                                    }, 50);
                                                                                });
                                                                        })
                                                                        .catch(function(err) {
                                                                            Meteor._reload.reload();
                                                                        });
                                                                })
                                                                .catch(function(err) {
                                                                    Meteor._reload.reload();
                                                                });
                                                        })
                                                        .catch(function(err) {
                                                            Meteor._reload.reload();
                                                        });
                                                })
                                                .catch(function(err) {
                                                    Meteor._reload.reload();
                                                });
                                        } else {
                                            sideBarService
                                                .getAllAppointmentList(initialDataLoad, 0)
                                                .then(function(data) {
                                                    addVS1Data("TAppointment", JSON.stringify(data))
                                                        .then(function(datareturn) {
                                                            let data = "";
                                                            data = {
                                                                type: "TTimeSheetEntry",
                                                                fields: {
                                                                    // "EntryDate":"2020-10-12 12:39:14",
                                                                    TimeSheet: [{
                                                                        type: "TTimeSheet",
                                                                        fields: {
                                                                            EmployeeName: employeeName || "",
                                                                            // HourlyRate:50,
                                                                            LabourCost: parseFloat(hourlyRate) || 1,
                                                                            HourlyRate: parseFloat(hourlyRate) || 1,
                                                                            ServiceName: selectedProduct || "",
                                                                            Job: clientname || "",
                                                                            Allowedit: true,
                                                                            InvoiceNotes: "completed",
                                                                            // ChargeRate: 100,
                                                                            Hours: parseFloat(
                                                                                $("#txtActualHoursSpent").val()
                                                                            ) || 1,
                                                                            // OverheadRate: 90,
                                                                            Job: clientname || "",
                                                                            StartTime: aStartDate,
                                                                            EndTime: aEndDate,
                                                                            // ServiceName: "Test"|| '',
                                                                            TimeSheetClassName: "Default" || "",
                                                                            Notes: notes || "",
                                                                            // EntryDate: accountdesc|| ''
                                                                        },
                                                                    }, ],
                                                                    TypeName: "Payroll",
                                                                    WhoEntered: Session.get("mySessionEmployee") || "",
                                                                },
                                                            };
                                                            contactService
                                                                .saveTimeSheet(data)
                                                                .then(function(dataObj) {
                                                                    sideBarService
                                                                        .getAllTimeSheetList()
                                                                        .then(function(data) {
                                                                            addVS1Data(
                                                                                "TTimeSheet",
                                                                                JSON.stringify(data)
                                                                            );
                                                                            setTimeout(function() {
                                                                                Meteor._reload.reload();
                                                                            }, 50);
                                                                        });
                                                                })
                                                                .catch(function(err) {
                                                                    Meteor._reload.reload();
                                                                });
                                                        })
                                                        .catch(function(err) {
                                                            Meteor._reload.reload();
                                                        });
                                                })
                                                .catch(function(err) {
                                                    Meteor._reload.reload();
                                                });
                                        }
                                    } else {
                                        sideBarService
                                            .getAllAppointmentList(initialDataLoad, 0)
                                            .then(function(data) {
                                                addVS1Data("TAppointment", JSON.stringify(data))
                                                    .then(function(datareturn) {
                                                        setTimeout(function() {
                                                            Meteor._reload.reload();
                                                        }, 50);
                                                    })
                                                    .catch(function(err) {
                                                        Meteor._reload.reload();
                                                    });
                                            })
                                            .catch(function(err) {
                                                Meteor._reload.reload();
                                            });
                                    }
                                })
                                .catch(function(err) {
                                    Meteor._reload.reload();
                                });
                        } else {
                            //return false;
                            sideBarService
                                .getAllAppointmentList(initialDataLoad, 0)
                                .then(function(data) {
                                    // addVS1Data('TAppointmentList', JSON.stringify(data));
                                    addVS1Data("TAppointment", JSON.stringify(data))
                                        .then(function(datareturn) {
                                            setTimeout(function() {
                                                Meteor._reload.reload();
                                            }, 50);
                                        })
                                        .catch(function(err) {
                                            Meteor._reload.reload();
                                        });
                                })
                                .catch(function(err) {
                                    Meteor._reload.reload();
                                });
                        }
                    })
                    .catch(function(err) {
                        $(".fullScreenSpin").css("display", "none");
                        swal({
                            title: "Oops...",
                            text: err,
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        });
                    });
            }
        }
    },
    'click #btnselProductFees': async function(event) {
        templateObject = Template.instance();

        const productFees = "";
        const productCards = $(".chkServiceCard");
        Array.prototype.forEach.call(productCards, (product) => {
            if ($(product).prop('checked') == true) {
                let productFeesID = $(product).attr('id').split("-")[1];
                if (productFees == "") {
                    productFees = productFeesID;
                } else {
                    productFees += ":" + productFeesID;
                }
            }
        });

        if (productFees != "") {
            $(".addExtraProduct").removeClass("btn-primary").addClass("btn-success");
        } else {
            $(".addExtraProduct").removeClass("btn-success").addClass("btn-primary");
        }

        templateObject.productFees.set(productFees);
    },
    "click .btnRemove": function(event) {
        var targetID = $(event.target).closest("tr").attr("id");
        // if ($("#tblExtraProducts tbody>tr").length > 1) {
        $(event.target).closest("tr").remove();
        $("#productCheck-" + targetID).prop("checked", false);
        event.preventDefault();
        // }
        setTimeout(function() {
            $("#btnselProductFees").trigger("click");
        }, 100);
    },
    "click #addRow": (e, ui) => {
        let tokenid = Random.id();
        // $(".lineProductName", rowData).val("");
        var rowData = `<tr class="dnd-moved" id="${tokenid}">
          <td class="thProductName">
              <input class="es-input highlightSelect lineProductName" type="search">
          </td>
          <td class="lineProductDesc colDescription"></td>
          <td class="thCostPrice hiddenColumn" style="text-align: left!important;"></td>
          <td class="thSalesPrice lineSalesPrice" style="text-align: left!important;"></td>
          <td class="thQty hiddenColumn">Quantity</td>
          <td class="thTax hiddenColumn" style="text-align: left!important;">Tax Rate</td>
          <td>
              <span class="table-remove btnRemove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 "><i
              class="fa fa-remove"></i></button></span>
          </td>
          <td class="thExtraSellPrice hiddenColumn">Prouct ID</td>
      </tr>`;

        // rowData.attr("id", tokenid);
        $("#tblExtraProducts tbody").append(rowData);
        setTimeout(function() {
            $("#" + tokenid + " .lineProductName").trigger("click");
        }, 200);
    },
    "click .lineProductName, keydown .lineProductName": function(event) {
        var $earch = $(event.currentTarget);
        var offset = $earch.offset();
        // $("#selectProductID").val("");
        var productDataName = $(event.target).val() || "";
        if (event.pageX > offset.left + $earch.width() - 10) {
            // X button 16px wide?
            $("#productListModal2").modal("toggle");
            var targetID = $(event.target).closest("tr").attr("id");
            $("#selectLineID").val(targetID);
            setTimeout(function() {
                $("#tblInventory_filter .form-control-sm").focus();
                $("#tblInventory_filter .form-control-sm").val("");
                $("#tblInventory_filter .form-control-sm").trigger("input");

                var datatable = $("#tblInventory").DataTable();
                datatable.draw();
                $("#tblInventory_filter .form-control-sm").trigger("input");
            }, 500);
        } else {
            if (productDataName.replace(/\s/g, "") != "") {
                var itemId = $(event.target).attr("itemid");
                window.open("/productview?id=" + itemId, "_self");
            } else {
                $("#productListModal2").modal("toggle");
                var targetID = $(event.target).closest("tr").attr("id");
                $("#selectLineID").val(targetID);
            }
        }
    },
    "click #btn_Attachment": function() {
        let templateInstance = Template.instance();
        let uploadedFileArray = templateInstance.uploadedFiles.get();
        if (uploadedFileArray.length > 0) {
            utilityService.showUploadedAttachment(uploadedFileArray);
        } else {
            let elementToAdd =
                '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
            $("#file-display").html(elementToAdd);
            $(".attchment-tooltip").show();
        }
    },
    "click .new_attachment_btn": function(event) {
        $("#attachment-upload").trigger("click");
    },
    "change #attachment-upload": function(e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFiles.get() || [];
        let myFiles = $("#attachment-upload")[0].files;
        let uploadData = utilityService.attachmentUpload(
            uploadedFilesArray,
            myFiles,
            saveToTAttachment,
            lineIDForAttachment
        );
        templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCount.set(uploadData.totalAttachments);
    },
    "click .remove-attachment": function(event, ui) {
        let tempObj = Template.instance();
        let attachmentID = parseInt(event.target.id.split("remove-attachment-")[1]);
        if (tempObj.$("#confirm-action-" + attachmentID).length) {
            tempObj.$("#confirm-action-" + attachmentID).remove();
        } else {
            let actionElement =
                '<div class="confirm-action" id="confirm-action-' +
                attachmentID +
                '"><a class="confirm-delete-attachment btn btn-default" id="delete-attachment-' +
                attachmentID +
                '">' +
                'Delete</a><button class="save-to-library btn btn-default">Remove & save to File Library</button></div>';
            tempObj.$("#attachment-name-" + attachmentID).append(actionElement);
        }
        tempObj.$("#new-attachment2-tooltip").show();
    },
    "click .confirm-delete-attachment": function(event, ui) {
        let tempObj = Template.instance();
        tempObj.$("#new-attachment2-tooltip").show();
        let attachmentID = parseInt(event.target.id.split("delete-attachment-")[1]);
        let uploadedArray = tempObj.uploadedFiles.get();
        let attachmentCount = tempObj.attachmentCount.get();
        $("#attachment-upload").val("");
        uploadedArray.splice(attachmentID, 1);
        tempObj.uploadedFiles.set(uploadedArray);
        attachmentCount--;
        if (attachmentCount === 0) {
            let elementToAdd =
                '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
            $("#file-display").html(elementToAdd);
        }
        tempObj.attachmentCount.set(attachmentCount);
        if (uploadedArray.length > 0) {
            utilityService.showUploadedAttachment(uploadedArray);
        } else {
            $(".attchment-tooltip").show();
        }
    },
    "click .btnAddAttachmentSave": function(event) {
        let templateObject = Template.instance();
        let uploadedItems = templateObject.uploadedFiles.get();
        let id = document.getElementById("updateID").value || "0";
        $(".fullScreenSpin").css("display", "inline-block");
        if (id == "0" || id == null) {
            // $('#event-modal').modal('hide');
            $(".fullScreenSpin").css("display", "none");
            $("#myModalAttachment").modal("hide");
        } else {
            let objectData = {
                type: "TAppointmentEx",
                fields: {
                    Id: parseInt(id),
                    Attachments: uploadedItems,
                },
            };

            appointmentService
                .saveAppointment(objectData)
                .then(function(data) {
                    $("#myModalAttachment").modal("hide");
                    $(".fullScreenSpin").css("display", "none");
                    sideBarService
                        .getAllAppointmentList(initialDataLoad, 0)
                        .then(function(dataList) {
                            addVS1Data("TAppointment", JSON.stringify(dataList))
                                .then(function(datareturn) {
                                    // setTimeout(function () {
                                    $(".fullScreenSpin").css("display", "none");
                                    // }, 500);
                                })
                                .catch(function(err) {
                                    $(".fullScreenSpin").css("display", "none");
                                });
                        })
                        .catch(function(err) {
                            $(".fullScreenSpin").css("display", "none");
                        });
                })
                .catch(function(err) {
                    $(".fullScreenSpin").css("display", "none");
                });
        }

        //});
    },
    "click .closeModal": function(event) {
        $("#myModalAttachment").modal("hide");
    },
    "change #startTime": function() {
        const templateObject = Template.instance();
        let date1 = document.getElementById("dtSODate").value;
        let date2 = document.getElementById("dtSODate2").value;
        date1 = templateObject.dateFormat(date1);
        date2 = templateObject.dateFormat(date2);
        var endTime = new Date(
            date2 + " " + document.getElementById("endTime").value + ":00"
        );
        var startTime = new Date(
            date1 + " " + document.getElementById("startTime").value + ":00"
        );
        if (date2 != "" && endTime > startTime) {
            let hours = parseFloat(
                templateObject.diff_hours(endTime, startTime)
            ).toFixed(2);
            document.getElementById("txtBookedHoursSpent").value =
                templateObject.timeFormat(hours) || "";
        } else {}
    },
    "change #endTime": function() {
        const templateObject = Template.instance();
        let date1 = document.getElementById("dtSODate").value;
        let date2 = document.getElementById("dtSODate2").value;
        date1 = templateObject.dateFormat(date1);
        date2 = templateObject.dateFormat(date2);
        var endTime = new Date(
            date2 + " " + document.getElementById("endTime").value + ":00"
        );
        var startTime = new Date(
            date1 + " " + document.getElementById("startTime").value + ":00"
        );
        if (endTime > startTime) {
            let hours = parseFloat(
                templateObject.diff_hours(endTime, startTime)
            ).toFixed(2);
            document.getElementById("txtBookedHoursSpent").value =
                templateObject.timeFormat(hours) || "";
        } else {}
    },
    "change #tActualStartTime": function() {
        const templateObject = Template.instance();
        let date1 = document.getElementById("dtSODate").value;
        let date2 = document.getElementById("dtSODate2").value;
        date1 = templateObject.dateFormat(date1);
        date2 = templateObject.dateFormat(date2);
        var endTime = new Date(
            date2 + " " + document.getElementById("tActualEndTime").value + ":00"
        );
        var startTime = new Date(
            date1 + " " + document.getElementById("tActualStartTime").value + ":00"
        );
        if (date2 != "" && endTime >= startTime) {
            let hours = parseFloat(
                templateObject.diff_hours(endTime, startTime)
            ).toFixed(2);
            document.getElementById("txtActualHoursSpent").value =
                templateObject.timeFormat(hours) || "";
        } else {}
    },
    "change #tActualEndTime": function() {
        const templateObject = Template.instance();
        let date1 = document.getElementById("dtSODate").value;
        let date2 = document.getElementById("dtSODate2").value;
        date1 = templateObject.dateFormat(date1);
        date2 = templateObject.dateFormat(date2);
        var endTime = new Date(
            date2 + " " + document.getElementById("tActualEndTime").value + ":00"
        );
        var startTime = new Date(
            date1 + " " + document.getElementById("tActualStartTime").value + ":00"
        );
        if (endTime >= startTime) {
            let hours = parseFloat(templateObject.diff_hours(endTime, startTime));
            document.getElementById("txtActualHoursSpent").value =
                templateObject.timeFormat(hours) || "";
        } else {}
    },
});

Template.registerHelper("equals", function(a, b) {
    return a === b;
});

openAppointModalDirectly = (leadid, templateObject, auto = false) => {
    let contactService = new ContactService();
    $("#frmAppointment")[0].reset();
    // templateObject.getAllProductData();
    $(".paused").hide();
    if (FlowRouter.current().queryParams.leadid) {
        contactService.getOneLeadDataEx(leadid).then(function(data) {
            // return;
            //$("#updateID").val("");
            let checkIncludeAllProducts = templateObject.includeAllProducts.get();
            let getAllEmployeeData = templateObject.employeerecords.get() || "";
            let getEmployeeID = templateObject.empID.get() || "";
            document.getElementById("employee_name").value =
                Session.get("mySessionEmployee");
            document.getElementById("customer").value = data.fields.ClientName;
            document.getElementById("phone").value = data.fields.Phone;
            document.getElementById("mobile").value = data.fields.Mobile;
            document.getElementById("state").value = data.fields.State;
            document.getElementById("country").value = data.fields.Country;
            document.getElementById("address").value = data.fields.Street.replace(
                /(?:\r\n|\r|\n)/g,
                ", "
            );
            if (Session.get("CloudAppointmentNotes") == true) {
                document.getElementById("txtNotes").value = data.fields.Notes;
                document.getElementById("txtNotes-1").value = data.fields.Notes;
            }
            document.getElementById("suburb").value = data.fields.Suburb;
            document.getElementById("zip").value = data.fields.Postcode;
            if (auto == true) {
                let dateStart = getRegalTime();
                let dateEnd = new Date(dateStart.getTime() + 2 * 3600 * 1000);
                let startTime =
                    ("0" + dateStart.getHours()).toString().slice(-2) +
                    ":" +
                    ("0" + dateStart.getMinutes()).toString().slice(-2);
                let endTime =
                    ("0" + dateEnd.getHours()).toString().slice(-2) +
                    ":" +
                    ("0" + dateStart.getMinutes()).toString().slice(-2);
                document.getElementById("startTime").value = startTime;
                document.getElementById("endTime").value = endTime;
            }
            if ($("#updateID").val() == "") {
                appointmentService
                    .getAllAppointmentListCount()
                    .then(function(dataObj) {
                        if (dataObj.tappointmentex.length > 0) {
                            let max = 1;
                            for (let i = 0; i < dataObj.tappointmentex.length; i++) {
                                if (dataObj.tappointmentex[i].Id > max) {
                                    max = dataObj.tappointmentex[i].Id;
                                }
                            }
                            document.getElementById("appID").value = max + 1;
                        } else {
                            document.getElementById("appID").value = 1;
                        }
                    });
                if (getEmployeeID != "") {
                    var filterEmpData = getAllEmployeeData.filter((empdData) => {
                        return empdData.id == getEmployeeID;
                    });
                    if (filterEmpData) {
                        if (filterEmpData[0].custFld8 == "false") {
                            templateObject.getAllSelectedProducts(getEmployeeID);
                        } else {
                            templateObject.getAllProductData();
                        }
                    } else {
                        templateObject.getAllProductData();
                    }
                }
            }
            $("#customerListModal").modal("hide");
            $("#event-modal").modal();
            setTimeout(() => {
                if (localStorage.getItem("smsCustomerAppt") == "false") {
                    $("#chkSMSCustomer").prop("checked", false);
                }
                if (localStorage.getItem("smsUserAppt") == "false") {
                    $("#chkSMSUser").prop("checked", false);
                }
                if (localStorage.getItem("emailCustomerAppt") == "false") {
                    $("#customerEmail").prop("checked", false);
                }
                if (localStorage.getItem("emailUserAppt") == "false") {
                    $("#userEmail").prop("checked", false);
                }
            }, 100);
        });
    } else if (FlowRouter.current().queryParams.customerid) {
        contactService.getOneCustomerDataEx(leadid).then((data) => {
            let checkIncludeAllProducts = templateObject.includeAllProducts.get();
            let getAllEmployeeData = templateObject.employeerecords.get() || "";
            let getEmployeeID = templateObject.empID.get() || "";
            document.getElementById("employee_name").value =
                Session.get("mySessionEmployee");
            document.getElementById("customer").value = data.fields.ClientName;
            document.getElementById("phone").value = data.fields.Phone;
            document.getElementById("mobile").value = data.fields.Mobile;
            document.getElementById("state").value = data.fields.State;
            document.getElementById("country").value = data.fields.Country;
            document.getElementById("address").value = data.fields.Street.replace(
                /(?:\r\n|\r|\n)/g,
                ", "
            );
            if (Session.get("CloudAppointmentNotes") == true) {
                document.getElementById("txtNotes").value = data.fields.Notes;
                document.getElementById("txtNotes-1").value = data.fields.Notes;
            }
            document.getElementById("suburb").value = data.fields.Suburb;
            document.getElementById("zip").value = data.fields.Postcode;
            if (auto == true) {
                let dateStart = getRegalTime();
                let dateEnd = new Date(dateStart.getTime() + 2 * 3600 * 1000);
                let startTime =
                    ("0" + dateStart.getHours()).toString().slice(-2) +
                    ":" +
                    ("0" + dateStart.getMinutes()).toString().slice(-2);
                let endTime =
                    ("0" + dateEnd.getHours()).toString().slice(-2) +
                    ":" +
                    ("0" + dateStart.getMinutes()).toString().slice(-2);
                document.getElementById("startTime").value = startTime;
                document.getElementById("endTime").value = endTime;
            }
            if ($("#updateID").val() == "") {
                appointmentService
                    .getAllAppointmentListCount()
                    .then(function(dataObj) {
                        if (dataObj.tappointmentex.length > 0) {
                            let max = 1;
                            for (let i = 0; i < dataObj.tappointmentex.length; i++) {
                                if (dataObj.tappointmentex[i].Id > max) {
                                    max = dataObj.tappointmentex[i].Id;
                                }
                            }
                            document.getElementById("appID").value = max + 1;
                        } else {
                            document.getElementById("appID").value = 1;
                        }
                    });
                if (getEmployeeID != "") {
                    var filterEmpData = getAllEmployeeData.filter((empdData) => {
                        return empdData.id == getEmployeeID;
                    });
                    if (filterEmpData) {
                        if (filterEmpData[0].custFld8 == "false") {
                            templateObject.getAllSelectedProducts(getEmployeeID);
                        } else {
                            templateObject.getAllProductData();
                        }
                    } else {
                        templateObject.getAllProductData();
                    }
                }
            }
            $("#customerListModal").modal("hide");
            $("#event-modal").modal();
            setTimeout(() => {
                if (localStorage.getItem("smsCustomerAppt") == "false") {
                    $("#chkSMSCustomer").prop("checked", false);
                }
                if (localStorage.getItem("smsUserAppt") == "false") {
                    $("#chkSMSUser").prop("checked", false);
                }
                if (localStorage.getItem("emailCustomerAppt") == "false") {
                    $("#customerEmail").prop("checked", false);
                }
                if (localStorage.getItem("emailUserAppt") == "false") {
                    $("#userEmail").prop("checked", false);
                }
            }, 100);
        });
    } else if (FlowRouter.current().queryParams.supplierid) {
        contactService.getOneSupplierDataEx(leadid).then((data) => {
            let checkIncludeAllProducts = templateObject.includeAllProducts.get();
            let getAllEmployeeData = templateObject.employeerecords.get() || "";
            let getEmployeeID = templateObject.empID.get() || "";
            document.getElementById("employee_name").value =
                Session.get("mySessionEmployee");
            document.getElementById("customer").value = data.fields.ClientName;
            document.getElementById("phone").value = data.fields.Phone;
            document.getElementById("mobile").value = data.fields.Mobile;
            document.getElementById("state").value = data.fields.State;
            document.getElementById("country").value = data.fields.Country;
            document.getElementById("address").value = data.fields.Street.replace(
                /(?:\r\n|\r|\n)/g,
                ", "
            );
            if (Session.get("CloudAppointmentNotes") == true) {
                document.getElementById("txtNotes").value = data.fields.Notes;
                document.getElementById("txtNotes-1").value = data.fields.Notes;
            }
            document.getElementById("suburb").value = data.fields.Suburb;
            document.getElementById("zip").value = data.fields.Postcode;
            if (auto == true) {
                let dateStart = getRegalTime();
                let dateEnd = new Date(dateStart.getTime() + 2 * 3600 * 1000);
                let startTime =
                    ("0" + dateStart.getHours()).toString().slice(-2) +
                    ":" +
                    ("0" + dateStart.getMinutes()).toString().slice(-2);
                let endTime =
                    ("0" + dateEnd.getHours()).toString().slice(-2) +
                    ":" +
                    ("0" + dateStart.getMinutes()).toString().slice(-2);
                document.getElementById("startTime").value = startTime;
                document.getElementById("endTime").value = endTime;
            }
            if ($("#updateID").val() == "") {
                appointmentService
                    .getAllAppointmentListCount()
                    .then(function(dataObj) {
                        if (dataObj.tappointmentex.length > 0) {
                            let max = 1;
                            for (let i = 0; i < dataObj.tappointmentex.length; i++) {
                                if (dataObj.tappointmentex[i].Id > max) {
                                    max = dataObj.tappointmentex[i].Id;
                                }
                            }
                            document.getElementById("appID").value = max + 1;
                        } else {
                            document.getElementById("appID").value = 1;
                        }
                    });
                if (getEmployeeID != "") {
                    var filterEmpData = getAllEmployeeData.filter((empdData) => {
                        return empdData.id == getEmployeeID;
                    });
                    if (filterEmpData) {
                        if (filterEmpData[0].custFld8 == "false") {
                            templateObject.getAllSelectedProducts(getEmployeeID);
                        } else {
                            templateObject.getAllProductData();
                        }
                    } else {
                        templateObject.getAllProductData();
                    }
                }
            }
            $("#customerListModal").modal("hide");
            $("#event-modal").modal();
            setTimeout(() => {
                if (localStorage.getItem("smsCustomerAppt") == "false") {
                    $("#chkSMSCustomer").prop("checked", false);
                }
                if (localStorage.getItem("smsUserAppt") == "false") {
                    $("#chkSMSUser").prop("checked", false);
                }
                if (localStorage.getItem("emailCustomerAppt") == "false") {
                    $("#customerEmail").prop("checked", false);
                }
                if (localStorage.getItem("emailUserAppt") == "false") {
                    $("#userEmail").prop("checked", false);
                }
            }, 100);
        });
    }
};

getRegalTime = (date = new Date()) => {
    var coeff = 1000 * 60 * 60;
    return new Date(Math.round(date.getTime() / coeff) * coeff);
};

async function sendAppointmentEmail() {
    let customerEmailCheck = $(".customerEmail").is(":checked") ? true : false;
    let userEmailCheck = $(".userEmail").is(":checked") ? true : false;
    var emailText = $("#saveAppointmentSMSMessage").val();
    // Send email to the customer

    if (customerEmailCheck == true) {
        let customerDataName = $("#customer").val();
        let customerEmail = "";
        let dataObject = await getVS1Data("TCustomerVS1");
        if (dataObject.length > 0) {
            let data = JSON.parse(dataObject[0].data);
            for (let i = 0; i < data.tcustomervs1.length; i++) {
                if (data.tcustomervs1[i].fields.Companyname === customerDataName) {
                    customerEmail = data.tcustomervs1[i].fields.Email;
                    break;
                }
            }
        }
        if (customerEmail) {
            let mailSubject = "Appointment Email";
            let mailFromName = Session.get("vs1companyName");
            let mailFrom =
                localStorage.getItem("VS1OrgEmail") ||
                localStorage.getItem("VS1AdminUserName");
            Meteor.call(
                "sendEmail", {
                    from: "" + mailFromName + " <" + mailFrom + ">",
                    to: customerEmail,
                    subject: mailSubject,
                    text: emailText,
                    html: "",
                },
                function(error, result) {
                    if (error && error.error === "error") {
                        // window.open('/statementlist', '_self');
                    } else {
                        swal({
                            title: "SUCCESS",
                            text: "Email Sent To Customer ",
                            type: "success",
                            showCancelButton: false,
                            confirmButtonText: "OK",
                        });
                    }
                }
            );
        }
    }
    // Send email to the user
    if (userEmailCheck == true) {
        let employeeID = Session.get("mySessionEmployeeLoggedID");
        let employeeEmail = "";
        let dataObject = await getVS1Data("TEmployee");
        if (dataObject.length > 0) {
            dataObject.filter(function(arr) {
                let data = JSON.parse(arr.data)["temployee"];
                for (let i = 0; i < data.length; i++) {
                    if (employeeID == data[i].fields.ID) {
                        employeeEmail += data[i].fields.Email;
                        break;
                    }
                }
            });
        }
        if (employeeEmail) {
            let mailSubject = "Appointment Email";
            let mailFromName = Session.get("vs1companyName");
            let mailFrom =
                localStorage.getItem("VS1OrgEmail") ||
                localStorage.getItem("VS1AdminUserName");
            Meteor.call(
                "sendEmail", {
                    from: "" + mailFromName + " <" + mailFrom + ">",
                    to: employeeEmail,
                    subject: mailSubject,
                    text: emailText,
                    html: "",
                },
                function(error, result) {
                    if (error && error.error === "error") {
                        // window.open('/statementlist', '_self');
                    } else {
                        swal({
                            title: "SUCCESS",
                            text: "Email Sent To User ",
                            type: "success",
                            showCancelButton: false,
                            confirmButtonText: "OK",
                        });
                    }
                }
            );
        }
    }
}