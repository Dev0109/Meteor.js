import { AppointmentService } from './appointment-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { EmployeeProfileService } from "../js/profile-service";
import { AccountService } from "../accounts/account-service";
import { ProductService } from "../product/product-service";
import { UtilityService } from "../utility-service";
import { SMSService } from '../js/sms-settings-service';
import { SalesBoardService } from '../js/sales-service';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let smsService = new SMSService();
let utilityService = new UtilityService();
let createAppointment = Session.get('CloudAppointmentCreateAppointment') || false;
Template.appointmentlist.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.productsrecord = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.clientrecords = new ReactiveVar([]);
    templateObject.selectedAppointment = new ReactiveVar([]);
    templateObject.selectedAppointmentID = new ReactiveVar();
    templateObject.smsSettings = new ReactiveVar();
    templateObject.isAccessLevels = new ReactiveVar();
    templateObject.extraProductFees = new ReactiveVar([]);
});

Template.appointmentlist.onRendered(async function () {
    localStorage.setItem("appt_historypage", "");

    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    let accountService = new AccountService();
    let appointmentService = new AppointmentService();
    let clientsService = new SalesBoardService();
    let productService = new ProductService();
    const supplierList = [];
    let billTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];
    const clientList = [];

    var splashArrayAppointmentList = new Array();
    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlert');
    }



    var today = moment().format('DD/MM/YYYY');
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    let fromDateMonth = (currentDate.getMonth() + 1);
    let fromDateDay = currentDate.getDate();
    if ((currentDate.getMonth() + 1) < 10) {
        fromDateMonth = "0" + (currentDate.getMonth() + 1);
    }

    if (currentDate.getDate() < 10) {
        fromDateDay = "0" + currentDate.getDate();
    }
    var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();

    $("#date-input,#dateTo,#dateFrom").datepicker({
        showOn: 'button',
        buttonText: 'Show Date',
        buttonImageOnly: true,
        buttonImage: '/img/imgCal2.png',
        dateFormat: 'dd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
        onChangeMonthYear: function (year, month, inst) {
            // Set date to picker
            $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
            // Hide (close) the picker
            // $(this).datepicker('hide');
            // // Change ttrigger the on change function
            // $(this).trigger('change');
        }
    });

    $("#dateFrom").val(fromDate);
    $("#dateTo").val(begunDate);

    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblappointmentlist', function (error, result) {
        if (error) {

        } else {
            if (result) {
                for (let i = 0; i < result.customFields.length; i++) {
                    let customcolumn = result.customFields;
                    let columData = customcolumn[i].label;
                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                    let hiddenColumn = customcolumn[i].hidden;
                    let columnClass = columHeaderUpdate.split('.')[1];
                    let columnWidth = customcolumn[i].width;

                    $("th." + columnClass + "").html(columData);
                    $("th." + columnClass + "").css('width', "" + columnWidth + "px");

                }
            }

        }
    });

    function MakeNegative() {
        $('td').each(function () {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
        $('td.colStatus').each(function () {
            if ($(this).text() == "Deleted") $(this).addClass('text-deleted');
        });
    };

    templateObject.resetData = function (dataVal) {
        setTimeout(function () {
            window.open('/appointmentlist?page=last', '_self');
        }, 500);

    }

    // Get SMS settings
    templateObject.getSMSSettings = function () {
        return new Promise((resolve, reject) => {
            const smsSettings = {
                twilioAccountId: "",
                twilioAccountToken: "",
                twilioTelephoneNumber: "",
            }

            getVS1Data('TERPPreference').then(function (dataObject) {
                if (dataObject.length == 0) {
                    smsService.getSMSSettings().then((result) => {
                        if (result.terppreference.length > 0) {
                            for (let i = 0; i < result.terppreference.length; i++) {
                                switch (result.terppreference[i].PrefName) {
                                    case "VS1SMSID":
                                        smsSettings.twilioAccountId = result.terppreference[i].Fieldvalue;
                                        break;
                                    case "VS1SMSToken":
                                        smsSettings.twilioAccountToken = result.terppreference[i].Fieldvalue;
                                        break;
                                    case "VS1SMSPhone":
                                        smsSettings.twilioTelephoneNumber = result.terppreference[i].Fieldvalue;
                                        break;
                                }
                            }
                        }
                        templateObject.smsSettings.set(smsSettings);
                        resolve(true);
                    });
                } else {
                    let result = JSON.parse(dataObject[0].data);
                    if (result.terppreference.length > 0) {
                        for (let i = 0; i < result.terppreference.length; i++) {
                            if (result.terppreference[i].PrefName == "VS1SMSID" || result.terppreference[i].PrefName == "VS1SMSToken" ||
                                result.terppreference[i].PrefName == "VS1SMSPhone" || result.terppreference[i].PrefName == "VS1SAVESMSMSG" ||
                                result.terppreference[i].PrefName == "VS1STARTSMSMSG" || result.terppreference[i].PrefName == "VS1STOPSMSMSG") {

                                switch (result.terppreference[i].PrefName) {
                                    case "VS1SMSID":
                                        smsSettings.twilioAccountId = result.terppreference[i].Fieldvalue;
                                        break;
                                    case "VS1SMSToken":
                                        smsSettings.twilioAccountToken = result.terppreference[i].Fieldvalue;
                                        break;
                                    case "VS1SMSPhone":
                                        smsSettings.twilioTelephoneNumber = result.terppreference[i].Fieldvalue;
                                        break;
                                }
                            }
                        }
                    }
                    templateObject.smsSettings.set(smsSettings);
                    resolve(true);
                }
            }).catch(function (err) {
                smsService.getSMSSettings().then((result) => {
                    if (result.terppreference.length > 0) {
                        for (let i = 0; i < result.terppreference.length; i++) {
                            switch (result.terppreference[i].PrefName) {
                                case "VS1SMSID":
                                    smsSettings.twilioAccountId = result.terppreference[i].Fieldvalue;
                                    break;
                                case "VS1SMSToken":
                                    smsSettings.twilioAccountToken = result.terppreference[i].Fieldvalue;
                                    break;
                                case "VS1SMSPhone":
                                    smsSettings.twilioTelephoneNumber = result.terppreference[i].Fieldvalue;
                                    break;
                            }
                        }
                    }
                    templateObject.smsSettings.set(smsSettings);
                    resolve(true);
                });
            });

        });
    }

    templateObject.getAllProductData = function () {
        productList = [];
        getVS1Data('TProductVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                productService.getNewProductListVS1().then(function (data) {
                    var dataList = {};
                    for (let i = 0; i < data.tproductvs1.length; i++) {
                        dataList = {
                            id: data.tproductvs1[i].Id || '',
                            productname: data.tproductvs1[i].ProductName || ''
                        }
                        productList.push(dataList);
                    }
                    templateObject.productsrecord.set(productList);

                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tproductvs1;
                var dataList = {};
                for (let i = 0; i < useData.length; i++) {
                    dataList = {
                        id: useData[i].fields.ID || '',
                        productname: useData[i].fields.ProductName || ''
                    }
                    if (useData[i].fields.ProductType != 'INV') {
                        productList.push(dataList);
                    }

                }
                templateObject.productsrecord.set(productList);

            }
        }).catch(function (err) {

            productService.getNewProductListVS1().then(function (data) {

                var dataList = {};
                for (let i = 0; i < data.tproductvs1.length; i++) {
                    dataList = {
                        id: data.tproductvs1[i].Id || '',
                        productname: data.tproductvs1[i].ProductName || ''
                    }
                    productList.push(dataList);

                }
                templateObject.productsrecord.set(productList);

            });
        });

    }
    //Function to reload and update Indexdb after convert
    templateObject.getAllAppointmentDataOnConvert = function () {
        let currentDate = new Date();
        let hours = currentDate.getHours(); //returns 0-23
        let minutes = currentDate.getMinutes(); //returns 0-59
        let seconds = currentDate.getSeconds(); //returns 0-59
        let month = (currentDate.getMonth() + 1);
        let days = currentDate.getDate();

        if ((currentDate.getMonth() + 1) < 10) {
            month = "0" + (currentDate.getMonth() + 1);
        }

        if (currentDate.getDate() < 10) {
            days = "0" + currentDate.getDate();
        }
        let currenctTodayDate = currentDate.getFullYear() + "-" + month + "-" + days + " " + hours + ":" + minutes + ":" + seconds;
        let templateObject = Template.instance();
        sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function (data) {
            addVS1Data('TAppointment', JSON.stringify(data)).then(function (datareturn) {

            }).catch(function (err) {

            });
        }).catch(function (err) {

        });
    }
    $(".formClassDate").datepicker({
        showOn: 'button',
        buttonText: 'Show Date',
        buttonImageOnly: true,
        buttonImage: '/img/imgCal2.png',
        dateFormat: 'dd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
        onChangeMonthYear: function (year, month, inst) {
            // Set date to picker
            $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
            // Hide (close) the picker
            $(this).datepicker('hide');
            // Change ttrigger the on change function
            $(this).trigger('change');
        }
    });
    templateObject.getAllClients = function () {
        getVS1Data('TCustomerVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                clientsService.getClientVS1().then(function (data) {
                    for (let i in data.tcustomervs1) {

                        let customerrecordObj = {
                            customerid: data.tcustomervs1[i].Id || ' ',
                            customername: data.tcustomervs1[i].ClientName || ' ',
                            customeremail: data.tcustomervs1[i].Email || ' ',
                            street: data.tcustomervs1[i].Street || ' ',
                            street2: data.tcustomervs1[i].Street2 || ' ',
                            street3: data.tcustomervs1[i].Street3 || ' ',
                            suburb: data.tcustomervs1[i].Suburb || ' ',
                            phone: data.tcustomervs1[i].Phone || ' ',
                            statecode: data.tcustomervs1[i].State + ' ' + data.tcustomervs1[i].Postcode || ' ',
                            country: data.tcustomervs1[i].Country || ' ',
                            termsName: data.tcustomervs1[i].TermsName || ''
                        };
                        //clientList.push(data.tcustomer[i].ClientName,customeremail: data.tcustomer[i].Email);
                        clientList.push(customerrecordObj);

                        //$('#edtCustomerName').editableSelect('add',data.tcustomervs1[i].ClientName);
                    }
                    templateObject.clientrecords.set(clientList);
                    templateObject.clientrecords.set(clientList.sort(function (a, b) {
                        if (a.customername == 'NA') {
                            return 1;
                        } else if (b.customername == 'NA') {
                            return -1;
                        }
                        return (a.customername.toUpperCase() > b.customername.toUpperCase()) ? 1 : -1;
                    }));

                    for (var i = 0; i < clientList.length; i++) {
                        $('#customer').editableSelect('add', clientList[i].customername);
                    }

                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcustomervs1;
                for (let i in useData) {

                    let customerrecordObj = {
                        customerid: useData[i].fields.ID || ' ',
                        customername: useData[i].fields.ClientName || ' ',
                        customeremail: useData[i].fields.Email || ' ',
                        street: useData[i].fields.Street || ' ',
                        street2: useData[i].fields.Street2 || ' ',
                        street3: useData[i].fields.Street3 || ' ',
                        suburb: useData[i].fields.Suburb || ' ',
                        phone: useData[i].fields.Phone || ' ',
                        statecode: useData[i].fields.State + ' ' + useData[i].fields.Postcode || ' ',
                        country: useData[i].fields.Country || ' ',
                        termsName: useData[i].fields.TermsName || ''
                    };
                    //clientList.push(data.tcustomer[i].ClientName,customeremail: data.tcustomer[i].Email);
                    clientList.push(customerrecordObj);

                    //$('#edtCustomerName').editableSelect('add',data.tcustomervs1[i].ClientName);
                }
                templateObject.clientrecords.set(clientList);
                templateObject.clientrecords.set(clientList.sort(function (a, b) {
                    if (a.customername == 'NA') {
                        return 1;
                    } else if (b.customername == 'NA') {
                        return -1;
                    }
                    return (a.customername.toUpperCase() > b.customername.toUpperCase()) ? 1 : -1;
                }));

                for (var i = 0; i < clientList.length; i++) {
                    $('#customer').editableSelect('add', clientList[i].customername);
                }

            }
        }).catch(function (err) {
            clientsService.getClientVS1().then(function (data) {
                for (let i in data.tcustomervs1) {

                    let customerrecordObj = {
                        customerid: data.tcustomervs1[i].Id || ' ',
                        customername: data.tcustomervs1[i].ClientName || ' ',
                        customeremail: data.tcustomervs1[i].Email || ' ',
                        street: data.tcustomervs1[i].Street || ' ',
                        street2: data.tcustomervs1[i].Street2 || ' ',
                        street3: data.tcustomervs1[i].Street3 || ' ',
                        suburb: data.tcustomervs1[i].Suburb || ' ',
                        phone: data.tcustomervs1[i].Phone || ' ',
                        statecode: data.tcustomervs1[i].State + ' ' + data.tcustomervs1[i].Postcode || ' ',
                        country: data.tcustomervs1[i].Country || ' ',
                        termsName: data.tcustomervs1[i].TermsName || ''
                    };
                    //clientList.push(data.tcustomer[i].ClientName,customeremail: data.tcustomer[i].Email);
                    clientList.push(customerrecordObj);

                    //$('#edtCustomerName').editableSelect('add',data.tcustomervs1[i].ClientName);
                }
                templateObject.clientrecords.set(clientList);
                templateObject.clientrecords.set(clientList.sort(function (a, b) {
                    if (a.customername == 'NA') {
                        return 1;
                    } else if (b.customername == 'NA') {
                        return -1;
                    }
                    return (a.customername.toUpperCase() > b.customername.toUpperCase()) ? 1 : -1;
                }));

                for (var i = 0; i < clientList.length; i++) {
                    $('#customer').editableSelect('add', clientList[i].customername);
                }

            });
        });

    };

    templateObject.getAllClients();
    templateObject.getAllAppointmentListData = async function () {
        ///if(!localStorage.getItem('VS1TReconcilationList')){
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if ((currentBeginDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
            fromDateMonth = (currentBeginDate.getMonth() + 1);
        }

        if (currentBeginDate.getDate() < 10) {
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        await templateObject.getSMSSettings();
        const recentSMSLogs = await templateObject.smsMessagingLogs() || '';
        const accessLevel = Session.get('CloudApptSMS');

        // getVS1Data('TAppointmentList').then(async function(dataObject) {
        //     if (dataObject.length == 0) {
        sideBarService.getTAppointmentListData(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function (data) {
            // localStorage.setItem('VS1TReconcilationList', JSON.stringify(data)||'');
            addVS1Data('TAppointmentList', JSON.stringify(data));
            let lineItems = [];
            let lineItemObj = {};
            let appointmentList = [];
            let color = "";
            let appStatus = "";
            if (data.Params.IgnoreDates == true) {
                $('#dateFrom').attr('readonly', true);
                $('#dateTo').attr('readonly', true);
                //FlowRouter.go('/appointmentlist?ignoredate=true');
            } else {
                $('#dateFrom').attr('readonly', false);
                $('#dateTo').attr('readonly', false);
                $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
            }

            $('.fullScreenSpin').css('display', 'none');

            sideBarService
                .getAllAppointmentList(initialDataLoad, 0)
                .then(function (data_) {
                    addVS1Data("TAppointment", JSON.stringify(data_));
                    for (let i = 0; i < data_.tappointmentex.length; i++) {
                        var appointment = {
                            id: data_.tappointmentex[i].fields.ID || "",
                            sortdate: data_.tappointmentex[i].fields.CreationDate ?
                                moment(data_.tappointmentex[i].fields.CreationDate).format(
                                    "YYYY/MM/DD"
                                ) : "",
                            appointmentdate: data_.tappointmentex[i].fields.CreationDate ?
                                moment(data_.tappointmentex[i].fields.CreationDate).format(
                                    "DD/MM/YYYY"
                                ) : "",
                            accountname: data_.tappointmentex[i].fields.ClientName || "",
                            statementno: data_.tappointmentex[i].fields.TrainerName || "",
                            employeename: data_.tappointmentex[i].fields.TrainerName || "",
                            department: data_.tappointmentex[i].fields.DeptClassName || "",
                            phone: data_.tappointmentex[i].fields.Phone || "",
                            mobile: data_.tappointmentex[i].fields.Mobile || "",
                            suburb: data_.tappointmentex[i].fields.Suburb || "",
                            street: data_.tappointmentex[i].fields.Street || "",
                            state: data_.tappointmentex[i].fields.State || "",
                            country: data_.tappointmentex[i].fields.Country || "",
                            zip: data_.tappointmentex[i].fields.Postcode || "",
                            timelog: data_.tappointmentex[i].fields.AppointmentsTimeLog || "",
                            startTime: data_.tappointmentex[i].fields.StartTime.split(" ")[1] || "",
                            totalHours: data_.tappointmentex[i].fields.TotalHours || 0,
                            endTime: data_.tappointmentex[i].fields.EndTime.split(" ")[1] || "",
                            startDate: data_.tappointmentex[i].fields.StartTime || "",
                            endDate: data_.tappointmentex[i].fields.EndTime || "",
                            fromDate: data_.tappointmentex[i].fields.Actual_EndTime ?
                                moment(
                                    data_.tappointmentex[i].fields.Actual_EndTime
                                ).format("DD/MM/YYYY") : "",
                            openbalance: data_.tappointmentex[i].fields.Actual_EndTime || "",
                            aStartTime: data_.tappointmentex[i].fields.Actual_StartTime.split(
                                " "
                            )[1] || "",
                            aEndTime: data_.tappointmentex[i].fields.Actual_EndTime.split(
                                " "
                            )[1] || "",
                            aStartDate: data_.tappointmentex[i].fields.Actual_StartTime.split(
                                " "
                            )[0] || "",
                            aEndDate: data_.tappointmentex[i].fields.Actual_EndTime.split(
                                " "
                            )[0] || "",
                            actualHours: "",
                            closebalance: "",
                            rate: data_.tappointmentex[i].fields.Rate || 1,
                            product: data_.tappointmentex[i].fields.ProductDesc || "",
                            extraProducts: data_.tappointmentex[i].fields.ExtraProducts || "",
                            finished: data_.tappointmentex[i].fields.Status || "",
                            //employee: data.tappointmentex[i].EndTime != '' ? moment(data.tappointmentex[i].EndTime).format("DD/MM/YYYY") : data.tappointmentex[i].EndTime,
                            notes: data_.tappointmentex[i].fields.Notes || "",
                            attachments: data_.tappointmentex[i].fields.Attachments || "",
                            isPaused: data_.tappointmentex[i].fields.Othertxt || "",
                            msRef: data_.tappointmentex[i].fields.MsRef || "",
                            custFld13: data_.tappointmentex[i].fields.CUSTFLD13 || "",
                            custFld11: data_.tappointmentex[i].fields.CUSTFLD11 || "",
                        };

                        appointmentList.push(appointment);
                    }

                    for (let i = 0; i < data.tappointmentlist.length; i++) {
                        appStatus = data.tappointmentlist[i].Status || '';
                        var apmt__ = appointmentList.filter((apmt) => {
                            return apmt.id == data.tappointmentlist[i].AppointID;
                        });

                        // let openBalance = utilityService.modifynegativeCurrencyFormat(data.tappointmentex[i].fields.OpenBalance)|| 0.00;
                        // let closeBalance = utilityService.modifynegativeCurrencyFormat(data.tappointmentex[i].fields.CloseBalance)|| 0.00;
                        if (data.tappointmentlist[i].Active == true) {
                            if (data.tappointmentlist[i].Status == "Converted" || data.tappointmentlist[i].Status == "Completed") {
                                color = "#1cc88a";
                            } else {
                                color = "#f6c23e";
                            }
                        } else {
                            appStatus = "Deleted";
                            color = "#e74a3b";
                        }
                        var dataList = {
                            id: data.tappointmentlist[i].AppointID || '',
                            sortdate: data.tappointmentlist[i].CreationDate != '' ? moment(data.tappointmentlist[i].CreationDate).format("YYYY/MM/DD") : data.tappointmentlist[i].CreationDate,
                            appointmentdate: data.tappointmentlist[i].STARTTIME != '' ? moment(data.tappointmentlist[i].STARTTIME).format("DD/MM/YYYY") : data.tappointmentlist[i].STARTTIME,
                            accountname: data.tappointmentlist[i].ClientName || '',
                            statementno: data.tappointmentlist[i].EnteredByEmployeeName || '',
                            employeename: data.tappointmentlist[i].EnteredByEmployeeName || '',
                            department: data.tappointmentlist[i].DeptClassName || '',
                            phone: data.tappointmentlist[i].Phone || '',
                            mobile: data.tappointmentlist[i].ClientMobile || '',
                            suburb: data.tappointmentlist[i].Suburb || '',
                            street: data.tappointmentlist[i].Street || '',
                            state: data.tappointmentlist[i].State || '',
                            country: data.tappointmentlist[i].Country || '',
                            zip: data.tappointmentlist[i].Postcode || '',
                            startTime: data.tappointmentlist[i].STARTTIME.split(' ')[1] || '',
                            timeStart: moment(data.tappointmentlist[i].STARTTIME).format('h:mm a'),
                            timeEnd: moment(data.tappointmentlist[i].ENDTIME).format('h:mm a'),
                            totalHours: data.tappointmentlist[i].TotalHours || 0,
                            endTime: data.tappointmentlist[i].ENDTIME.split(' ')[1] || '',
                            startDate: data.tappointmentlist[i].STARTTIME || '',
                            endDate: data.tappointmentlist[i].ENDTIME || '',
                            frmDate: moment(data.tappointmentlist[i].STARTTIME).format('dddd') + ', ' + moment(data.tappointmentlist[i].STARTTIME).format('DD'),
                            toDate: moment(data.tappointmentlist[i].ENDTIME).format('dddd') + ', ' + moment(data.tappointmentlist[i].ENDTIME).format('DD'),
                            fromDate: data.tappointmentlist[i].Actual_Endtime != '' ? moment(data.tappointmentlist[i].Actual_Endtime).format("DD/MM/YYYY") : data.tappointmentlist[i].Actual_Endtime,
                            openbalance: data.tappointmentlist[i].Actual_Endtime || '',
                            aStartTime: data.tappointmentlist[i].Actual_Starttime.split(' ')[1] || '',
                            aEndTime: data.tappointmentlist[i].Actual_Endtime.split(' ')[1] || '',
                            actualHours: '',
                            closebalance: '',
                            product: data.tappointmentlist[i].ProductDesc || '',
                            finished: appStatus || '',
                            notes: data.tappointmentlist[i].Notes || '',
                            color: color,
                            actual_starttime: data.tappointmentlist[i].Actual_Starttime || '',
                            actual_endtime: data.tappointmentlist[i].Actual_Endtime || '',
                            actual_start_time: data.tappointmentlist[i].Actual_Start_time || '',
                            actual_end_time: data.tappointmentlist[i].Actual_End_time || '',
                            booked_starttime: data.tappointmentlist[i].STARTTIME || '',
                            booked_endtime: data.tappointmentlist[i].ENDTIME || '',
                            custFld11: data.tappointmentlist[i].CUSTFLD11 || '',
                            custFld13: data.tappointmentlist[i].CUSTFLD13 || '',
                            extraProducts: data.tappointmentlist[i].ExtraProducts || "",
                            attachments: data.tappointmentlist[i].Attachments || "",
                        };

                        if (apmt__.length > 0) {
                            dataList.statementno = apmt__[0].employeename || "";
                        }

                        if (accessLevel) {
                            if (data.tappointmentlist[i].CUSTFLD13 === "Yes" && data.tappointmentlist[i].CUSTFLD11 === "" && data.tappointmentlist[i].Active == true) {
                                // Get SMS Confimation Info
                                const smsSettings = templateObject.smsSettings.get();
                                if (smsSettings.twilioAccountId !== "" && smsSettings.twilioAccountToken !== "" && smsSettings.twilioTelephoneNumber !== "") {
                                    const sentSMSs = recentSMSLogs.sms_messages.filter(message => message.from === "+" + smsSettings.twilioTelephoneNumber.replace('+', '') &&
                                        message.to === "+" + data.tappointmentlist[i].Mobile.replace('+', '')) || '';
                                    const receiveSMSs = recentSMSLogs.sms_messages.filter(message => message.to === "+" + smsSettings.twilioTelephoneNumber.replace('+', '') &&
                                        message.from === "+" + data.tappointmentlist[i].Mobile.replace('+', '')) || '';
                                    let currentSentSMSDate = null;
                                    let nextSentSMSDate = null;
                                    if (sentSMSs.length > 0) {
                                        for (let j = 0; j < sentSMSs.length; j++) {
                                            if (data.tappointmentlist[i].CUSTFLD12 === sentSMSs[j].sid) {
                                                currentSentSMSDate = sentSMSs[j].date_sent;
                                                nextSentSMSDate = j - 1 >= 0 ? sentSMSs[j - 1].date_sent : null;
                                                break;
                                            }
                                        }
                                        if (currentSentSMSDate) {
                                            for (let j = 0; j < receiveSMSs.length; j++) {
                                                const receiveSMSDate = moment(receiveSMSs[j].date_sent);
                                                if (receiveSMSDate >= moment(currentSentSMSDate) && (!nextSentSMSDate || (nextSentSMSDate && receiveSMSDate <= moment(nextSentSMSDate)))) {
                                                    const replyText = receiveSMSs[j].body ? receiveSMSs[j].body.toLowerCase() : "";
                                                    if (replyText.includes('yes')) {
                                                        appointmentService.saveAppointment({
                                                            type: "TAppointmentEx",
                                                            fields: {
                                                                Id: data.tappointmentlist[i].AppointID,
                                                                CUSTFLD11: "Yes"
                                                            }
                                                        }).then(function (data) {
                                                            sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function (dataUpdate) {
                                                                addVS1Data('TAppointment', JSON.stringify(dataUpdate));
                                                            });
                                                        }).catch(e => {

                                                        });
                                                        dataList.custFld11 = "Yes";
                                                        break;
                                                    } else if (replyText.includes('no')) {
                                                        appointmentService.saveAppointment({
                                                            type: "TAppointmentEx",
                                                            fields: {
                                                                Id: data.tappointmentlist[i].AppointID,
                                                                CUSTFLD11: "No"
                                                            }
                                                        }).then(function (data) {
                                                            sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function (dataUpdate) {
                                                                addVS1Data('TAppointment', JSON.stringify(dataUpdate));
                                                            });
                                                        }).catch(e => {

                                                        });
                                                        dataList.custFld11 = "No";
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        dataTableList.push(dataList);
                    }

                    let confirmedColumn = '<i class="fas fa-minus-circle text-info" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="No SMS Message Sent"></i>';
                    for (let p = 0; p < dataTableList.length; p++) {
                        if (dataTableList[p].custFld13 == "Yes") {
                            if (dataTableList[p].custFld11 == "Yes") {
                                confirmedColumn = '<i class="fa fa-check text-success" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message confirmed"></i>';
                            } else if (dataTableList[p].custFld11 == "No") {
                                confirmedColumn = '<i class="fa fa-close text-danger" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message declined"></i>';
                            } else {
                                confirmedColumn = '<i class="fa fa-question text-warning" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message no reply"></i>';
                            }
                        } else {
                            confirmedColumn = '<i class="fas fa-minus-circle text-info" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="No SMS Message Sent"></i>';
                        }
                        var dataListAppointmentList = [
                            '<div class="custom-control custom-checkbox pointer" style="width:15px;"><input class="custom-control-input chkBox notevent pointer" type="checkbox" id="f-' + dataTableList[p].id + '" name="' + dataTableList[p].id + '"> <label class="custom-control-label" for="f-' + dataTableList[p].id + '"></label></div>' || '',
                            dataTableList[p].sortdate || '',
                            dataTableList[p].id || '',
                            '<span style="display:none;">' + dataTableList[p].sortdate + '</span> ' + dataTableList[p].appointmentdate || '',
                            dataTableList[p].accountname || '',
                            dataTableList[p].statementno || '',
                            dataTableList[p].frmDate || '',
                            dataTableList[p].toDate || '',
                            dataTableList[p].timeStart || '',
                            dataTableList[p].timeEnd || '',
                            dataTableList[p].actual_start_time || '',
                            dataTableList[p].actual_end_time || '',
                            dataTableList[p].finished || '',
                            confirmedColumn,
                            dataTableList[p].notes || '',
                            dataTableList[p].product || '',
                        ];
                        splashArrayAppointmentList.push(dataListAppointmentList);
                    };

                    templateObject.datatablerecords.set(dataTableList);
                    if (templateObject.datatablerecords.get()) {

                        Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblappointmentlist', function (error, result) {
                            if (error) {

                            } else {
                                if (result) {
                                    for (let i = 0; i < result.customFields.length; i++) {
                                        let customcolumn = result.customFields;
                                        let columData = customcolumn[i].label;
                                        let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                        let hiddenColumn = customcolumn[i].hidden;
                                        let columnClass = columHeaderUpdate.split('.')[1];
                                        let columnWidth = customcolumn[i].width;
                                        let columnindex = customcolumn[i].index + 1;

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


                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    }

                    setTimeout(function () {
                        $('.fullScreenSpin').css('display', 'none');
                        //$.fn.dataTable.moment('DD/MM/YY');
                        $('#tblappointmentlist').DataTable({
                            data: splashArrayAppointmentList,
                            columnDefs: [{
                                "orderable": false,
                                targets: 0,
                                createdCell: function (td, cellData, rowData, row, col) {
                                    $(td).closest("tr").attr("id", rowData[2]);
                                }
                            }, {
                                className: "colSortDate hiddenColumn",
                                contenteditable: "false",
                                type: 'date',
                                targets: 1
                            }, {
                                className: "colID",
                                contenteditable: "false",
                                targets: 2
                            }, {
                                className: "colDate",
                                contenteditable: "false",
                                targets: 3
                            }, {
                                className: "colCompany",
                                contenteditable: "false",
                                targets: 4,
                                createdCell: function (td, cellData, rowData, row, col) {
                                    $(td).attr("id", 'colCompany' + rowData[2]);
                                }
                            }, {
                                className: "colReq",
                                targets: 5
                            }, {
                                className: "colFromDate",
                                targets: 6
                            }, {
                                className: "colToDate",
                                targets: 7
                            }, {
                                className: "colFromTime",
                                targets: 8
                            }, {
                                className: "colToTime",
                                targets: 9
                            }, {
                                className: "colFromActualTime",
                                targets: 10
                            }, {
                                className: "colToActualTime",
                                targets: 11
                            }, {
                                className: "colStatus",
                                targets: 12,
                                createdCell: function (td, cellData, rowData, row, col) {
                                    if (rowData[12] == "Converted" || rowData[12] == "Completed") {
                                        $(td).css('background-color', '#1cc88a');
                                        $(td).css('color', '#fff');
                                    } else if (rowData[12] == "Not Converted") {
                                        $(td).css('background-color', '#f6c23e');
                                        $(td).css('color', '#fff');
                                    } else if (rowData[12] == "Deleted") {
                                        $(td).css('background-color', '#e74a3b');
                                        $(td).css('color', '#fff');
                                    } else {
                                        $(td).css('background-color', '#f6c23e');
                                        $(td).css('color', '#fff');
                                    }
                                }
                            }, {
                                "orderable": false,
                                className: "colConfirm text-center",
                                targets: 13
                            }, {
                                className: "colNotes hiddenColumn",
                                targets: 14
                            }, {
                                "orderable": false,
                                className: "colProduct text-center",
                                targets: 15
                            }],
                            "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            buttons: [{
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "appointmentlist_" + moment().format(),
                                orientation: 'portrait',
                                exportOptions: {
                                    columns: ':visible'
                                }
                            }, {
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Appointment List',
                                filename: "appointmentlist_" + moment().format(),
                                exportOptions: {
                                    columns: ':visible'
                                }
                            }],
                            select: true,
                            destroy: true,
                            colReorder: true,
                            colReorder: {
                                fixedColumnsLeft: 1
                            },
                            // bStateSave: true,
                            // rowId: 0,
                            pageLength: initialDatatableLoad,
                            "bLengthChange": false,
                            info: true,
                            responsive: true,
                            "order": [
                                [1, "desc"],
                                [2, "desc"]
                            ],
                            action: function () {
                                //$('#tblappointmentlist').DataTable().ajax.reload();
                            },
                            "fnDrawCallback": function (oSettings) {
                                let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                                $('.paginate_button.page-item').removeClass('disabled');
                                $('#tblappointmentlist_ellipsis').addClass('disabled');

                                if (oSettings._iDisplayLength == -1) {
                                    if (oSettings.fnRecordsDisplay() > 150) {
                                        $('.paginate_button.page-item.previous').addClass('disabled');
                                        $('.paginate_button.page-item.next').addClass('disabled');
                                    }
                                } else {

                                }
                                if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                    $('.paginate_button.page-item.next').addClass('disabled');
                                }

                                $('.paginate_button.next:not(.disabled)', this.api().table().container())
                                    .on('click', function () {
                                        $('.fullScreenSpin').css('display', 'inline-block');
                                        let dataLenght = oSettings._iDisplayLength;
                                        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                                        var dateTo = new Date($("#dateTo").datepicker("getDate"));

                                        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                                        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();


                                        if (data.Params.IgnoreDates == true) {
                                            sideBarService.getTAppointmentListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                                                getVS1Data('TAppointmentList').then(function (dataObjectold) {
                                                    if (dataObjectold.length == 0) {

                                                    } else {
                                                        let dataOld = JSON.parse(dataObjectold[0].data);

                                                        var thirdaryData = $.merge($.merge([], dataObjectnew.tappointmentlist), dataOld.tappointmentlist);
                                                        let objCombineData = {
                                                            Params: dataOld.Params,
                                                            tappointmentlist: thirdaryData
                                                        }


                                                        addVS1Data('TAppointmentList', JSON.stringify(objCombineData)).then(function (datareturn) {

                                                        }).catch(function (err) {
                                                            $('.fullScreenSpin').css('display', 'none');
                                                        });

                                                    }
                                                }).catch(function (err) {

                                                });

                                            }).catch(function (err) {
                                                $('.fullScreenSpin').css('display', 'none');
                                            });
                                        } else {
                                            sideBarService.getTAppointmentListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                                                getVS1Data('TAppointmentList').then(function (dataObjectold) {
                                                    if (dataObjectold.length == 0) {

                                                    } else {
                                                        let dataOld = JSON.parse(dataObjectold[0].data);

                                                        var thirdaryData = $.merge($.merge([], dataObjectnew.tappointmentlist), dataOld.tappointmentlist);
                                                        let objCombineData = {
                                                            Params: dataOld.Params,
                                                            tappointmentlist: thirdaryData
                                                        }


                                                        addVS1Data('TAppointmentList', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                            //   templateObject.resetData(objCombineData);
                                                            // $('.fullScreenSpin').css('display','none');
                                                        }).catch(function (err) {
                                                            $('.fullScreenSpin').css('display', 'none');
                                                        });

                                                    }
                                                }).catch(function (err) {

                                                });

                                            }).catch(function (err) {
                                                $('.fullScreenSpin').css('display', 'none');
                                            });
                                        }
                                        sideBarService.getAllAppointmentList(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnewApp) {
                                            getVS1Data("TAppointment").then(function (dataObjectoldApp) {
                                                if (dataObjectoldApp.length == 0) { } else {
                                                    let dataOldApp = JSON.parse(dataObjectoldApp[0].data);

                                                    var thirdaryDataApp = $.merge($.merge([], dataObjectnewApp.tappointmentex), dataOldApp.tappointmentex);
                                                    let objCombineDataApp = {
                                                        tappointmentex: thirdaryDataApp,
                                                    };
                                                    addVS1Data("TAppointment", JSON.stringify(objCombineDataApp)).then(function (datareturnApp) {
                                                        templateObject.resetData(objCombineDataApp);
                                                        $('.fullScreenSpin').css('display', 'none');
                                                    }).catch(function (err) {
                                                        $('.fullScreenSpin').css('display', 'none');
                                                    });
                                                }
                                            }).catch(function (err) {
                                                $('.fullScreenSpin').css('display', 'none');
                                            });
                                        }).catch(function (err) {
                                            $(".fullScreenSpin").css("display", "none");
                                        });

                                    });

                                setTimeout(function () {
                                    MakeNegative();
                                }, 100);
                            },
                            language: { search: "", searchPlaceholder: "Search List..." },
                            "fnInitComplete": function () {
                                let urlParametersPage = FlowRouter.current().queryParams.page;
                                //if (urlParametersPage || FlowRouter.current().queryParams.ignoredate) {
                                this.fnPageChange('last');
                                //}
                                $("<button class='btn btn-primary btnRefreshAppointment' type='button' id='btnRefreshAppointment' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblappointmentlist_filter");
                                $('.myvarFilterForm').appendTo(".colDateFilter");
                                if (FlowRouter.current().queryParams.id) {
                                    document.getElementById("updateID").value = FlowRouter.current().queryParams.id;
                                    $("#event-modal").modal("toggle");
                                }
                            },
                            "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                                let countTableData = data.Params.Count || 0; //get count from API data

                                return 'Showing ' + iStart + " to " + iEnd + " of " + countTableData;
                            }
                        }).on('page', function () {
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                            let draftRecord = templateObject.datatablerecords.get();
                            templateObject.datatablerecords.set(draftRecord);
                        }).on('column-reorder', function () {

                        });
                        $('.fullScreenSpin').css('display', 'none');
                    }, 20);

                    var columns = $('#tblappointmentlist th');
                    let sTible = "";
                    let sWidth = "";
                    let sIndex = "";
                    let sVisible = "";
                    let columVisible = false;
                    let sClass = "";
                    $.each(columns, function (i, v) {
                        if (v.hidden == false) {
                            columVisible = true;
                        }
                        if ((v.className.includes("hiddenColumn"))) {
                            columVisible = false;
                        }
                        sWidth = v.style.width.replace('px', "");

                        let datatablerecordObj = {
                            sTitle: v.innerText || '',
                            sWidth: sWidth || '',
                            sIndex: v.cellIndex || 0,
                            sVisible: columVisible || false,
                            sClass: v.className || ''
                        };
                        tableHeaderList.push(datatablerecordObj);
                    });

                    templateObject.tableheaderrecords.set(tableHeaderList);
                    $('div.dataTables_filter input').addClass('form-control form-control-sm');
                })
                .catch(function (err) {
                    $(".fullScreenSpin").css("display", "none");
                });
        }).catch(function (err) {
            // Bert.alert('<strong>' + err + '</strong>!', 'danger');
            $('.fullScreenSpin').css('display', 'none');
            // Meteor._reload.reload();
        });
        // } else {
        //     let data = JSON.parse(dataObject[0].data);
        //     let useData = data.tappointmentlist;
        //     let lineItems = [];
        //     let lineItemObj = {};
        //     let color = "";
        //     let appStatus = "";
        //     if (data.Params.IgnoreDates == true) {
        //         $('#dateFrom').attr('readonly', true);
        //         $('#dateTo').attr('readonly', true);
        //         //FlowRouter.go('/appointmentlist?ignoredate=true');
        //     } else {
        //         $('#dateFrom').attr('readonly', false);
        //         $('#dateTo').attr('readonly', false);
        //         $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
        //         $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
        //     }

        //     for (let i = 0; i < data.tappointmentlist.length; i++) {
        //         appStatus = data.tappointmentlist[i].Status || '';
        //         // let openBalance = utilityService.modifynegativeCurrencyFormat(data.tappointmentex[i].fields.OpenBalance)|| 0.00;
        //         // let closeBalance = utilityService.modifynegativeCurrencyFormat(data.tappointmentex[i].fields.CloseBalance)|| 0.00;
        //         if (data.tappointmentlist[i].Active == true) {
        //             if (data.tappointmentlist[i].Status == "Converted" || data.tappointmentlist[i].Status == "Completed") {
        //                 color = "#1cc88a";
        //             } else {
        //                 color = "#f6c23e";
        //             }
        //         } else {
        //             appStatus = "Deleted";
        //             color = "#e74a3b";
        //         }
        //         var dataList = {
        //             id: data.tappointmentlist[i].AppointID || '',
        //             sortdate: data.tappointmentlist[i].CreationDate != '' ? moment(data.tappointmentlist[i].CreationDate).format("YYYY/MM/DD") : data.tappointmentlist[i].CreationDate,
        //             appointmentdate: data.tappointmentlist[i].STARTTIME != '' ? moment(data.tappointmentlist[i].STARTTIME).format("DD/MM/YYYY") : data.tappointmentlist[i].STARTTIME,
        //             accountname: data.tappointmentlist[i].ClientName || '',
        //             statementno: data.tappointmentlist[i].EnteredByEmployeeName || '',
        //             employeename: data.tappointmentlist[i].EnteredByEmployeeName || '',
        //             department: data.tappointmentlist[i].DeptClassName || '',
        //             phone: data.tappointmentlist[i].Phone || '',
        //             mobile: data.tappointmentlist[i].Mobile || '',
        //             suburb: data.tappointmentlist[i].Suburb || '',
        //             street: data.tappointmentlist[i].Street || '',
        //             state: data.tappointmentlist[i].State || '',
        //             country: data.tappointmentlist[i].Country || '',
        //             zip: data.tappointmentlist[i].Postcode || '',
        //             startTime: data.tappointmentlist[i].STARTTIME.split(' ')[1] || '',
        //             timeStart: moment(data.tappointmentlist[i].STARTTIME).format('h:mm a'),
        //             timeEnd: moment(data.tappointmentlist[i].ENDTIME).format('h:mm a'),
        //             totalHours: data.tappointmentlist[i].TotalHours || 0,
        //             endTime: data.tappointmentlist[i].ENDTIME.split(' ')[1] || '',
        //             startDate: data.tappointmentlist[i].STARTTIME || '',
        //             endDate: data.tappointmentlist[i].ENDTIME || '',
        //             frmDate: moment(data.tappointmentlist[i].STARTTIME).format('dddd') + ', ' + moment(data.tappointmentlist[i].STARTTIME).format('DD'),
        //             toDate: moment(data.tappointmentlist[i].ENDTIME).format('dddd') + ', ' + moment(data.tappointmentlist[i].ENDTIME).format('DD'),
        //             fromDate: data.tappointmentlist[i].Actual_Endtime != '' ? moment(data.tappointmentlist[i].Actual_Endtime).format("DD/MM/YYYY") : data.tappointmentlist[i].Actual_Endtime,
        //             openbalance: data.tappointmentlist[i].Actual_Endtime || '',
        //             aStartTime: data.tappointmentlist[i].Actual_Starttime.split(' ')[1] || '',
        //             aEndTime: data.tappointmentlist[i].Actual_Endtime.split(' ')[1] || '',
        //             actualHours: '',
        //             closebalance: '',
        //             product: data.tappointmentlist[i].ProductDesc || '',
        //             finished: appStatus || '',
        //             notes: data.tappointmentlist[i].Notes || '',
        //             color: color,
        //             actual_starttime: data.tappointmentlist[i].Actual_Starttime || '',
        //             actual_endtime: data.tappointmentlist[i].Actual_Endtime || '',
        //             actual_start_time: data.tappointmentlist[i].Actual_Start_time || '',
        //             actual_end_time: data.tappointmentlist[i].Actual_End_time || '',
        //             booked_starttime: data.tappointmentlist[i].STARTTIME || '',
        //             booked_endtime: data.tappointmentlist[i].ENDTIME || '',
        //             msRef: data.tappointmentlist[i].MSRef || '',
        //             custFld11: data.tappointmentlist[i].CUSTFLD11 || '',
        //             custFld13: data.tappointmentlist[i].CUSTFLD13 || ''
        //         };
        //         if (accessLevel) {
        //             if (data.tappointmentlist[i].CUSTFLD13 === "Yes" && data.tappointmentlist[i].CUSTFLD11 === "" && data.tappointmentlist[i].Active == true) {
        //                 // Get SMS Confimation Info
        //                 const smsSettings = templateObject.smsSettings.get();
        //                 if (smsSettings.twilioAccountId !== "" && smsSettings.twilioAccountToken !== "" && smsSettings.twilioTelephoneNumber !== "") {
        //                     const sentSMSs = recentSMSLogs.sms_messages.filter(message => message.from === "+" + smsSettings.twilioTelephoneNumber.replace('+', '') &&
        //                         message.to === "+" + data.tappointmentlist[i].Mobile.replace('+', '')) || '';
        //                     const receiveSMSs = recentSMSLogs.sms_messages.filter(message => message.to === "+" + smsSettings.twilioTelephoneNumber.replace('+', '') &&
        //                         message.from === "+" + data.tappointmentlist[i].Mobile.replace('+', '')) || '';
        //                     let currentSentSMSDate = null;
        //                     let nextSentSMSDate = null;
        //                     if (sentSMSs.length > 0) {
        //                         for (let j = 0; j < sentSMSs.length; j++) {
        //                             if (data.tappointmentlist[i].CUSTFLD12 === sentSMSs[j].sid) {
        //                                 currentSentSMSDate = sentSMSs[j].date_sent;
        //                                 nextSentSMSDate = j - 1 >= 0 ? sentSMSs[j - 1].date_sent : null;
        //                                 break;
        //                             }
        //                         }
        //                         if (currentSentSMSDate) {
        //                             for (let j = 0; j < receiveSMSs.length; j++) {
        //                                 const receiveSMSDate = moment(receiveSMSs[j].date_sent);
        //                                 if (receiveSMSDate >= moment(currentSentSMSDate) && (!nextSentSMSDate || (nextSentSMSDate && receiveSMSDate <= moment(nextSentSMSDate)))) {
        //                                     const replyText = receiveSMSs[j].body ? receiveSMSs[j].body.toLowerCase() : "";
        //                                     if (replyText.includes('yes')) {
        //                                         appointmentService.saveAppointment({
        //                                             type: "TAppointmentEx",
        //                                             fields: {
        //                                                 Id: data.tappointmentlist[i].AppointID,
        //                                                 CUSTFLD11: "Yes"
        //                                             }
        //                                         }).then(function(data) {
        //                                             sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function(dataUpdate) {
        //                                                 addVS1Data('TAppointment', JSON.stringify(dataUpdate));
        //                                             });
        //                                         }).catch(e => {

        //                                         });
        //                                         dataList.custFld11 = "Yes";
        //                                         break;
        //                                     } else if (replyText.includes('no')) {
        //                                         appointmentService.saveAppointment({
        //                                             type: "TAppointmentEx",
        //                                             fields: {
        //                                                 Id: data.tappointmentlist[i].AppointID,
        //                                                 CUSTFLD11: "No"
        //                                             }
        //                                         }).then(function(data) {
        //                                             sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function(dataUpdate) {
        //                                                 addVS1Data('TAppointment', JSON.stringify(dataUpdate));
        //                                             });
        //                                         }).catch(e => {

        //                                         });
        //                                         dataList.custFld11 = "No";
        //                                         break;
        //                                     }
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //         dataTableList.push(dataList);
        //     }
        //     let confirmedColumn = '<i class="fas fa-minus-circle text-info" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="No SMS Message Sent"></i>';
        //     for (let p = 0; p < dataTableList.length; p++) {
        //         if (dataTableList[p].custFld13 == "Yes") {
        //             if (dataTableList[p].custFld11 == "Yes") {
        //                 confirmedColumn = '<i class="fa fa-check text-success" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message confirmed"></i>';
        //             } else if (dataTableList[p].custFld11 == "No") {
        //                 confirmedColumn = '<i class="fa fa-close text-danger" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message declined"></i>';
        //             } else {
        //                 confirmedColumn = '<i class="fa fa-question text-warning" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message no reply"></i>';
        //             }
        //         } else {
        //             confirmedColumn = '<i class="fas fa-minus-circle text-info" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="No SMS Message Sent"></i>';
        //         }
        //         var dataListAppointmentList = [
        //             '<div class="custom-control custom-checkbox pointer" style="width:15px;"><input class="custom-control-input chkBox notevent pointer" type="checkbox" id="f-' + dataTableList[p].id + '" name="' + dataTableList[p].id + '"> <label class="custom-control-label" for="f-' + dataTableList[p].id + '"></label></div>' || '',
        //             dataTableList[p].sortdate || '',
        //             dataTableList[p].id || '',
        //             '<span style="display:none;">' + dataTableList[p].sortdate + '</span> ' + dataTableList[p].appointmentdate || '',
        //             dataTableList[p].accountname || '',
        //             dataTableList[p].statementno || '',
        //             dataTableList[p].frmDate || '',
        //             dataTableList[p].toDate || '',
        //             dataTableList[p].timeStart || '',
        //             dataTableList[p].timeEnd || '',
        //             dataTableList[p].actual_start_time || '',
        //             dataTableList[p].actual_end_time || '',
        //             dataTableList[p].finished || '',
        //             confirmedColumn,
        //             dataTableList[p].notes || '',
        //             dataTableList[p].product || '',
        //         ];
        //         splashArrayAppointmentList.push(dataListAppointmentList);
        //     };

        //     templateObject.datatablerecords.set(dataTableList);
        //     if (templateObject.datatablerecords.get()) {

        //         Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblappointmentlist', function(error, result) {
        //             if (error) {

        //             } else {
        //                 if (result) {
        //                     for (let i = 0; i < result.customFields.length; i++) {
        //                         let customcolumn = result.customFields;
        //                         let columData = customcolumn[i].label;
        //                         let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
        //                         let hiddenColumn = customcolumn[i].hidden;
        //                         let columnClass = columHeaderUpdate.split('.')[1];
        //                         let columnWidth = customcolumn[i].width;
        //                         let columnindex = customcolumn[i].index + 1;

        //                         if (hiddenColumn == true) {

        //                             $("." + columnClass + "").addClass('hiddenColumn');
        //                             $("." + columnClass + "").removeClass('showColumn');
        //                         } else if (hiddenColumn == false) {
        //                             $("." + columnClass + "").removeClass('hiddenColumn');
        //                             $("." + columnClass + "").addClass('showColumn');
        //                         }
        //                     }
        //                 }
        //             }
        //         });

        //         setTimeout(function() {
        //             MakeNegative();
        //         }, 100);
        //     }

        //     setTimeout(function() {
        //         $('.fullScreenSpin').css('display', 'none');
        //         //$.fn.dataTable.moment('DD/MM/YY');
        //         $('#tblappointmentlist').DataTable({
        //             data: splashArrayAppointmentList,
        //             columnDefs: [{
        //                 "orderable": false,
        //                 targets: 0,
        //                 createdCell: function(td, cellData, rowData, row, col) {
        //                     $(td).closest("tr").attr("id", rowData[2]);
        //                 }
        //             }, {
        //                 className: "colSortDate hiddenColumn",
        //                 contenteditable: "false",
        //                 type: 'date',
        //                 targets: 1
        //             }, {
        //                 className: "colID",
        //                 contenteditable: "false",
        //                 targets: 2
        //             }, {
        //                 className: "colDate",
        //                 contenteditable: "false",
        //                 targets: 3
        //             }, {
        //                 className: "colCompany",
        //                 contenteditable: "false",
        //                 targets: 4,
        //                 createdCell: function(td, cellData, rowData, row, col) {
        //                     $(td).attr("id", 'colCompany' + rowData[2]);
        //                 }
        //             }, {
        //                 className: "colReq",
        //                 targets: 5
        //             }, {
        //                 className: "colFromDate",
        //                 targets: 6
        //             }, {
        //                 className: "colToDate",
        //                 targets: 7
        //             }, {
        //                 className: "colFromTime",
        //                 targets: 8
        //             }, {
        //                 className: "colToTime",
        //                 targets: 9
        //             }, {
        //                 className: "colFromActualTime",
        //                 targets: 10
        //             }, {
        //                 className: "colToActualTime",
        //                 targets: 11
        //             }, {
        //                 className: "colStatus",
        //                 targets: 12,
        //                 createdCell: function(td, cellData, rowData, row, col) {
        //                     if (rowData[12] == "Converted" || rowData[12] == "Completed") {
        //                         $(td).css('background-color', '#1cc88a');
        //                         $(td).css('color', '#fff');
        //                     } else if (rowData[12] == "Not Converted") {
        //                         $(td).css('background-color', '#f6c23e');
        //                         $(td).css('color', '#fff');
        //                     } else if (rowData[12] == "Deleted") {
        //                         $(td).css('background-color', '#e74a3b');
        //                         $(td).css('color', '#fff');
        //                     } else {
        //                         $(td).css('background-color', '#f6c23e');
        //                         $(td).css('color', '#fff');
        //                     }
        //                 }
        //             }, {
        //                 "orderable": false,
        //                 className: "colConfirm text-center",
        //                 targets: 13
        //             }, {
        //                 className: "colNotes hiddenColumn",
        //                 targets: 14
        //             }, {
        //                 className: "colProduct text-center",
        //                 targets: 15
        //             }],
        //             "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        //             buttons: [{
        //                 extend: 'excelHtml5',
        //                 text: '',
        //                 download: 'open',
        //                 className: "btntabletocsv hiddenColumn",
        //                 filename: "appointmentlist_" + moment().format(),
        //                 orientation: 'portrait',
        //                 exportOptions: {
        //                     columns: ':visible'
        //                 }
        //             }, {
        //                 extend: 'print',
        //                 download: 'open',
        //                 className: "btntabletopdf hiddenColumn",
        //                 text: '',
        //                 title: 'Appointment List',
        //                 filename: "appointmentlist_" + moment().format(),
        //                 exportOptions: {
        //                     columns: ':visible'
        //                 }
        //             }],
        //             select: true,
        //             destroy: true,
        //             colReorder: true,
        //             colReorder: {
        //                 fixedColumnsLeft: 1
        //             },
        //             // bStateSave: true,
        //             // rowId: 0,
        //             pageLength: initialDatatableLoad,
        //             "bLengthChange": false,
        //             info: true,
        //             responsive: true,
        //             "order": [
        //                 [1, "desc"],
        //                 [2, "desc"]
        //             ],
        //             action: function() {
        //                 //$('#tblappointmentlist').DataTable().ajax.reload();
        //             },
        //             "fnDrawCallback": function(oSettings) {
        //                 let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

        //                 $('.paginate_button.page-item').removeClass('disabled');
        //                 $('#tblappointmentlist_ellipsis').addClass('disabled');

        //                 if (oSettings._iDisplayLength == -1) {
        //                     if (oSettings.fnRecordsDisplay() > 150) {
        //                         $('.paginate_button.page-item.previous').addClass('disabled');
        //                         $('.paginate_button.page-item.next').addClass('disabled');
        //                     }
        //                 } else {

        //                 }
        //                 if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
        //                     $('.paginate_button.page-item.next').addClass('disabled');
        //                 }

        //                 $('.paginate_button.next:not(.disabled)', this.api().table().container())
        //                     .on('click', function() {
        //                         $('.fullScreenSpin').css('display', 'inline-block');
        //                         let dataLenght = oSettings._iDisplayLength;
        //                         var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        //                         var dateTo = new Date($("#dateTo").datepicker("getDate"));

        //                         let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        //                         let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();


        //                         if (data.Params.IgnoreDates == true) {
        //                             sideBarService.getTAppointmentListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
        //                                 getVS1Data('TAppointmentList').then(function(dataObjectold) {
        //                                     if (dataObjectold.length == 0) {

        //                                     } else {
        //                                         let dataOld = JSON.parse(dataObjectold[0].data);

        //                                         var thirdaryData = $.merge($.merge([], dataObjectnew.tappointmentlist), dataOld.tappointmentlist);
        //                                         let objCombineData = {
        //                                             Params: dataOld.Params,
        //                                             tappointmentlist: thirdaryData
        //                                         }


        //                                         addVS1Data('TAppointmentList', JSON.stringify(objCombineData)).then(function(datareturn) {

        //                                         }).catch(function(err) {
        //                                             $('.fullScreenSpin').css('display', 'none');
        //                                         });

        //                                     }
        //                                 }).catch(function(err) {

        //                                 });

        //                             }).catch(function(err) {
        //                                 $('.fullScreenSpin').css('display', 'none');
        //                             });
        //                         } else {
        //                             sideBarService.getTAppointmentListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
        //                                 getVS1Data('TAppointmentList').then(function(dataObjectold) {
        //                                     if (dataObjectold.length == 0) {

        //                                     } else {
        //                                         let dataOld = JSON.parse(dataObjectold[0].data);

        //                                         var thirdaryData = $.merge($.merge([], dataObjectnew.tappointmentlist), dataOld.tappointmentlist);
        //                                         let objCombineData = {
        //                                             Params: dataOld.Params,
        //                                             tappointmentlist: thirdaryData
        //                                         }


        //                                         addVS1Data('TAppointmentList', JSON.stringify(objCombineData)).then(function(datareturn) {
        //                                             //   templateObject.resetData(objCombineData);
        //                                             // $('.fullScreenSpin').css('display','none');
        //                                         }).catch(function(err) {
        //                                             $('.fullScreenSpin').css('display', 'none');
        //                                         });

        //                                     }
        //                                 }).catch(function(err) {

        //                                 });

        //                             }).catch(function(err) {
        //                                 $('.fullScreenSpin').css('display', 'none');
        //                             });
        //                         }
        //                         sideBarService.getAllAppointmentList(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnewApp) {
        //                             getVS1Data("TAppointment").then(function(dataObjectoldApp) {
        //                                 if (dataObjectoldApp.length == 0) {} else {
        //                                     let dataOldApp = JSON.parse(dataObjectoldApp[0].data);

        //                                     var thirdaryDataApp = $.merge($.merge([], dataObjectnewApp.tappointmentex), dataOldApp.tappointmentex);
        //                                     let objCombineDataApp = {
        //                                         tappointmentex: thirdaryDataApp,
        //                                     };
        //                                     addVS1Data("TAppointment", JSON.stringify(objCombineDataApp)).then(function(datareturnApp) {
        //                                         templateObject.resetData(objCombineDataApp);
        //                                         $('.fullScreenSpin').css('display', 'none');
        //                                     }).catch(function(err) {
        //                                         $('.fullScreenSpin').css('display', 'none');
        //                                     });
        //                                 }
        //                             }).catch(function(err) {
        //                                 $('.fullScreenSpin').css('display', 'none');
        //                             });
        //                         }).catch(function(err) {
        //                             $(".fullScreenSpin").css("display", "none");
        //                         });

        //                     });

        //                 setTimeout(function() {
        //                     MakeNegative();
        //                 }, 100);
        //             },
        //             language: { search: "", searchPlaceholder: "Search List..." },
        //             "fnInitComplete": function() {
        //                 let urlParametersPage = FlowRouter.current().queryParams.page;
        //                 //if (urlParametersPage || FlowRouter.current().queryParams.ignoredate) {
        //                 this.fnPageChange('last');
        //                 //}
        //                 $("<button class='btn btn-primary btnRefreshAppointment' type='button' id='btnRefreshAppointment' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblappointmentlist_filter");
        //                 $('.myvarFilterForm').appendTo(".colDateFilter");
        //             },
        //             "fnInfoCallback": function(oSettings, iStart, iEnd, iMax, iTotal, sPre) {
        //                 let countTableData = data.Params.Count || 0; //get count from API data

        //                 return 'Showing ' + iStart + " to " + iEnd + " of " + countTableData;
        //             }
        //         }).on('page', function() {
        //             setTimeout(function() {
        //                 MakeNegative();
        //             }, 100);
        //             let draftRecord = templateObject.datatablerecords.get();
        //             templateObject.datatablerecords.set(draftRecord);
        //         }).on('column-reorder', function() {

        //         });
        //         $('.fullScreenSpin').css('display', 'none');
        //     }, 0);

        //     var columns = $('#tblappointmentlist th');
        //     let sTible = "";
        //     let sWidth = "";
        //     let sIndex = "";
        //     let sVisible = "";
        //     let columVisible = false;
        //     let sClass = "";
        //     $.each(columns, function(i, v) {
        //         if (v.hidden == false) {
        //             columVisible = true;
        //         }
        //         if ((v.className.includes("hiddenColumn"))) {
        //             columVisible = false;
        //         }
        //         sWidth = v.style.width.replace('px', "");

        //         let datatablerecordObj = {
        //             sTitle: v.innerText || '',
        //             sWidth: sWidth || '',
        //             sIndex: v.cellIndex || 0,
        //             sVisible: columVisible || false,
        //             sClass: v.className || ''
        //         };
        //         tableHeaderList.push(datatablerecordObj);
        //     });

        //     templateObject.tableheaderrecords.set(tableHeaderList);
        //     $('div.dataTables_filter input').addClass('form-control form-control-sm');
        // }
        // }).catch(function(err) {
        //     sideBarService.getTAppointmentListData(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function(data) {
        //         // localStorage.setItem('VS1TReconcilationList', JSON.stringify(data)||'');
        //         addVS1Data('TAppointmentList', JSON.stringify(data));
        //         let lineItems = [];
        //         let lineItemObj = {};
        //         let color = "";
        //         let appStatus = "";
        //         if (data.Params.IgnoreDates == true) {
        //             $('#dateFrom').attr('readonly', true);
        //             $('#dateTo').attr('readonly', true);
        //             //FlowRouter.go('/appointmentlist?ignoredate=true');
        //         } else {
        //             $('#dateFrom').attr('readonly', false);
        //             $('#dateTo').attr('readonly', false);
        //             $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
        //             $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
        //         }

        //         for (let i = 0; i < data.tappointmentlist.length; i++) {
        //             appStatus = data.tappointmentlist[i].Status || '';
        //             // let openBalance = utilityService.modifynegativeCurrencyFormat(data.tappointmentex[i].fields.OpenBalance)|| 0.00;
        //             // let closeBalance = utilityService.modifynegativeCurrencyFormat(data.tappointmentex[i].fields.CloseBalance)|| 0.00;
        //             if (data.tappointmentlist[i].Active == true) {
        //                 if (data.tappointmentlist[i].Status == "Converted" || data.tappointmentlist[i].Status == "Completed") {
        //                     color = "#1cc88a";
        //                 } else {
        //                     color = "#f6c23e";
        //                 }
        //             } else {
        //                 appStatus = "Deleted";
        //                 color = "#e74a3b";
        //             }
        //             var dataList = {
        //                 id: data.tappointmentlist[i].AppointID || '',
        //                 sortdate: data.tappointmentlist[i].CreationDate != '' ? moment(data.tappointmentlist[i].CreationDate).format("YYYY/MM/DD") : data.tappointmentlist[i].CreationDate,
        //                 appointmentdate: data.tappointmentlist[i].STARTTIME != '' ? moment(data.tappointmentlist[i].STARTTIME).format("DD/MM/YYYY") : data.tappointmentlist[i].STARTTIME,
        //                 accountname: data.tappointmentlist[i].ClientName || '',
        //                 statementno: data.tappointmentlist[i].EnteredByEmployeeName || '',
        //                 employeename: data.tappointmentlist[i].EnteredByEmployeeName || '',
        //                 department: data.tappointmentlist[i].DeptClassName || '',
        //                 phone: data.tappointmentlist[i].Phone || '',
        //                 mobile: data.tappointmentlist[i].ClientMobile || '',
        //                 suburb: data.tappointmentlist[i].Suburb || '',
        //                 street: data.tappointmentlist[i].Street || '',
        //                 state: data.tappointmentlist[i].State || '',
        //                 country: data.tappointmentlist[i].Country || '',
        //                 zip: data.tappointmentlist[i].Postcode || '',
        //                 startTime: data.tappointmentlist[i].STARTTIME.split(' ')[1] || '',
        //                 timeStart: moment(data.tappointmentlist[i].STARTTIME).format('h:mm a'),
        //                 timeEnd: moment(data.tappointmentlist[i].ENDTIME).format('h:mm a'),
        //                 totalHours: data.tappointmentlist[i].TotalHours || 0,
        //                 endTime: data.tappointmentlist[i].ENDTIME.split(' ')[1] || '',
        //                 startDate: data.tappointmentlist[i].STARTTIME || '',
        //                 endDate: data.tappointmentlist[i].ENDTIME || '',
        //                 frmDate: moment(data.tappointmentlist[i].STARTTIME).format('dddd') + ', ' + moment(data.tappointmentlist[i].STARTTIME).format('DD'),
        //                 toDate: moment(data.tappointmentlist[i].ENDTIME).format('dddd') + ', ' + moment(data.tappointmentlist[i].ENDTIME).format('DD'),
        //                 fromDate: data.tappointmentlist[i].Actual_Endtime != '' ? moment(data.tappointmentlist[i].Actual_Endtime).format("DD/MM/YYYY") : data.tappointmentlist[i].Actual_Endtime,
        //                 openbalance: data.tappointmentlist[i].Actual_Endtime || '',
        //                 aStartTime: data.tappointmentlist[i].Actual_Starttime.split(' ')[1] || '',
        //                 aEndTime: data.tappointmentlist[i].Actual_Endtime.split(' ')[1] || '',
        //                 actualHours: '',
        //                 closebalance: '',
        //                 product: data.tappointmentlist[i].ProductDesc || '',
        //                 finished: appStatus || '',
        //                 notes: data.tappointmentlist[i].Notes || '',
        //                 color: color,
        //                 actual_starttime: data.tappointmentlist[i].Actual_Starttime || '',
        //                 actual_endtime: data.tappointmentlist[i].Actual_Endtime || '',
        //                 actual_start_time: data.tappointmentlist[i].Actual_Start_time || '',
        //                 actual_end_time: data.tappointmentlist[i].Actual_End_time || '',
        //                 booked_starttime: data.tappointmentlist[i].STARTTIME || '',
        //                 booked_endtime: data.tappointmentlist[i].ENDTIME || '',
        //                 msRef: data.tappointmentlist[i].MSRef || ''
        //             };
        //             dataTableList.push(dataList);

        //         }

        //         let confirmedColumn = '<i class="fas fa-minus-circle text-info" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="No SMS Message Sent"></i>';
        //         for (let p = 0; p < dataTableList.length; p++) {
        //             if (dataTableList[p].custFld13 == "Yes") {
        //                 if (dataTableList[p].custFld11 == "Yes") {
        //                     confirmedColumn = '<i class="fa fa-check text-success" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message confirmed"></i>';
        //                 } else if (dataTableList[p].custFld11 == "No") {
        //                     confirmedColumn = '<i class="fa fa-close text-danger" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message declined"></i>';
        //                 } else {
        //                     confirmedColumn = '<i class="fa fa-question text-warning" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message no reply"></i>';
        //                 }
        //             } else {
        //                 confirmedColumn = '<i class="fas fa-minus-circle text-info" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="No SMS Message Sent"></i>';
        //             }
        //             var dataListAppointmentList = [
        //                 '<div class="custom-control custom-checkbox pointer" style="width:15px;"><input class="custom-control-input chkBox notevent pointer" type="checkbox" id="f-' + dataTableList[p].id + '" name="' + dataTableList[p].id + '"> <label class="custom-control-label" for="f-' + dataTableList[p].id + '"></label></div>' || '',
        //                 dataTableList[p].sortdate || '',
        //                 dataTableList[p].id || '',
        //                 '<span style="display:none;">' + dataTableList[p].sortdate + '</span> ' + dataTableList[p].appointmentdate || '',
        //                 dataTableList[p].accountname || '',
        //                 dataTableList[p].statementno || '',
        //                 dataTableList[p].frmDate || '',
        //                 dataTableList[p].toDate || '',
        //                 dataTableList[p].timeStart || '',
        //                 dataTableList[p].timeEnd || '',
        //                 dataTableList[p].actual_start_time || '',
        //                 dataTableList[p].actual_end_time || '',
        //                 dataTableList[p].finished || '',
        //                 confirmedColumn,
        //                 dataTableList[p].notes || '',
        //                 dataTableList[p].product || '',
        //             ];
        //             splashArrayAppointmentList.push(dataListAppointmentList);
        //         };

        //         templateObject.datatablerecords.set(dataTableList);
        //         if (templateObject.datatablerecords.get()) {

        //             Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblappointmentlist', function(error, result) {
        //                 if (error) {

        //                 } else {
        //                     if (result) {
        //                         for (let i = 0; i < result.customFields.length; i++) {
        //                             let customcolumn = result.customFields;
        //                             let columData = customcolumn[i].label;
        //                             let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
        //                             let hiddenColumn = customcolumn[i].hidden;
        //                             let columnClass = columHeaderUpdate.split('.')[1];
        //                             let columnWidth = customcolumn[i].width;
        //                             let columnindex = customcolumn[i].index + 1;

        //                             if (hiddenColumn == true) {

        //                                 $("." + columnClass + "").addClass('hiddenColumn');
        //                                 $("." + columnClass + "").removeClass('showColumn');
        //                             } else if (hiddenColumn == false) {
        //                                 $("." + columnClass + "").removeClass('hiddenColumn');
        //                                 $("." + columnClass + "").addClass('showColumn');
        //                             }

        //                         }
        //                     }

        //                 }
        //             });


        //             setTimeout(function() {
        //                 MakeNegative();
        //             }, 100);
        //         }

        //         setTimeout(function() {
        //             $('.fullScreenSpin').css('display', 'none');
        //             //$.fn.dataTable.moment('DD/MM/YY');
        //             $('#tblappointmentlist').DataTable({
        //                 data: splashArrayAppointmentList,
        //                 columnDefs: [{
        //                     "orderable": false,
        //                     targets: 0,
        //                     createdCell: function(td, cellData, rowData, row, col) {
        //                         $(td).closest("tr").attr("id", rowData[2]);
        //                     }
        //                 }, {
        //                     className: "colSortDate hiddenColumn",
        //                     contenteditable: "false",
        //                     type: 'date',
        //                     targets: 1
        //                 }, {
        //                     className: "colID",
        //                     contenteditable: "false",
        //                     targets: 2
        //                 }, {
        //                     className: "colDate",
        //                     contenteditable: "false",
        //                     targets: 3
        //                 }, {
        //                     className: "colCompany",
        //                     contenteditable: "false",
        //                     targets: 4,
        //                     createdCell: function(td, cellData, rowData, row, col) {
        //                         $(td).attr("id", 'colCompany' + rowData[2]);
        //                     }
        //                 }, {
        //                     className: "colReq",
        //                     targets: 5
        //                 }, {
        //                     className: "colFromDate",
        //                     targets: 6
        //                 }, {
        //                     className: "colToDate",
        //                     targets: 7
        //                 }, {
        //                     className: "colFromTime",
        //                     targets: 8
        //                 }, {
        //                     className: "colToTime",
        //                     targets: 9
        //                 }, {
        //                     className: "colFromActualTime",
        //                     targets: 10
        //                 }, {
        //                     className: "colToActualTime",
        //                     targets: 11
        //                 }, {
        //                     className: "colStatus",
        //                     targets: 12,
        //                     createdCell: function(td, cellData, rowData, row, col) {
        //                         if (rowData[12] == "Converted" || rowData[12] == "Completed") {
        //                             $(td).css('background-color', '#1cc88a');
        //                             $(td).css('color', '#fff');
        //                         } else if (rowData[12] == "Not Converted") {
        //                             $(td).css('background-color', '#f6c23e');
        //                             $(td).css('color', '#fff');
        //                         } else if (rowData[12] == "Deleted") {
        //                             $(td).css('background-color', '#e74a3b');
        //                             $(td).css('color', '#fff');
        //                         } else {
        //                             $(td).css('background-color', '#f6c23e');
        //                             $(td).css('color', '#fff');
        //                         }
        //                     }
        //                 }, {
        //                     "orderable": false,
        //                     className: "colConfirm text-center",
        //                     targets: 13
        //                 }, {
        //                     className: "colNotes hiddenColumn",
        //                     targets: 14
        //                 }, {
        //                     className: "colProduct",
        //                     targets: 15
        //                 }],
        //                 "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        //                 buttons: [{
        //                     extend: 'excelHtml5',
        //                     text: '',
        //                     download: 'open',
        //                     className: "btntabletocsv hiddenColumn",
        //                     filename: "appointmentlist_" + moment().format(),
        //                     orientation: 'portrait',
        //                     exportOptions: {
        //                         columns: ':visible'
        //                     }
        //                 }, {
        //                     extend: 'print',
        //                     download: 'open',
        //                     className: "btntabletopdf hiddenColumn",
        //                     text: '',
        //                     title: 'Appointment List',
        //                     filename: "appointmentlist_" + moment().format(),
        //                     exportOptions: {
        //                         columns: ':visible'
        //                     }
        //                 }],
        //                 select: true,
        //                 destroy: true,
        //                 colReorder: true,
        //                 colReorder: {
        //                     fixedColumnsLeft: 1
        //                 },
        //                 // bStateSave: true,
        //                 // rowId: 0,
        //                 pageLength: initialDatatableLoad,
        //                 "bLengthChange": false,
        //                 info: true,
        //                 responsive: true,
        //                 "order": [
        //                     [1, "desc"],
        //                     [2, "desc"]
        //                 ],
        //                 action: function() {
        //                     //$('#tblappointmentlist').DataTable().ajax.reload();
        //                 },
        //                 "fnDrawCallback": function(oSettings) {
        //                     let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

        //                     $('.paginate_button.page-item').removeClass('disabled');
        //                     $('#tblappointmentlist_ellipsis').addClass('disabled');

        //                     if (oSettings._iDisplayLength == -1) {
        //                         if (oSettings.fnRecordsDisplay() > 150) {
        //                             $('.paginate_button.page-item.previous').addClass('disabled');
        //                             $('.paginate_button.page-item.next').addClass('disabled');
        //                         }
        //                     } else {

        //                     }
        //                     if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
        //                         $('.paginate_button.page-item.next').addClass('disabled');
        //                     }

        //                     $('.paginate_button.next:not(.disabled)', this.api().table().container())
        //                         .on('click', function() {
        //                             $('.fullScreenSpin').css('display', 'inline-block');
        //                             let dataLenght = oSettings._iDisplayLength;
        //                             var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        //                             var dateTo = new Date($("#dateTo").datepicker("getDate"));

        //                             let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        //                             let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();


        //                             if (data.Params.IgnoreDates == true) {
        //                                 sideBarService.getTAppointmentListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
        //                                     getVS1Data('TAppointmentList').then(function(dataObjectold) {
        //                                         if (dataObjectold.length == 0) {

        //                                         } else {
        //                                             let dataOld = JSON.parse(dataObjectold[0].data);

        //                                             var thirdaryData = $.merge($.merge([], dataObjectnew.tappointmentlist), dataOld.tappointmentlist);
        //                                             let objCombineData = {
        //                                                 Params: dataOld.Params,
        //                                                 tappointmentlist: thirdaryData
        //                                             }


        //                                             addVS1Data('TAppointmentList', JSON.stringify(objCombineData)).then(function(datareturn) {

        //                                             }).catch(function(err) {
        //                                                 $('.fullScreenSpin').css('display', 'none');
        //                                             });

        //                                         }
        //                                     }).catch(function(err) {

        //                                     });

        //                                 }).catch(function(err) {
        //                                     $('.fullScreenSpin').css('display', 'none');
        //                                 });
        //                             } else {
        //                                 sideBarService.getTAppointmentListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
        //                                     getVS1Data('TAppointmentList').then(function(dataObjectold) {
        //                                         if (dataObjectold.length == 0) {

        //                                         } else {
        //                                             let dataOld = JSON.parse(dataObjectold[0].data);

        //                                             var thirdaryData = $.merge($.merge([], dataObjectnew.tappointmentlist), dataOld.tappointmentlist);
        //                                             let objCombineData = {
        //                                                 Params: dataOld.Params,
        //                                                 tappointmentlist: thirdaryData
        //                                             }


        //                                             addVS1Data('TAppointmentList', JSON.stringify(objCombineData)).then(function(datareturn) {
        //                                                 //   templateObject.resetData(objCombineData);
        //                                                 // $('.fullScreenSpin').css('display','none');
        //                                             }).catch(function(err) {
        //                                                 $('.fullScreenSpin').css('display', 'none');
        //                                             });

        //                                         }
        //                                     }).catch(function(err) {

        //                                     });

        //                                 }).catch(function(err) {
        //                                     $('.fullScreenSpin').css('display', 'none');
        //                                 });
        //                             }
        //                             sideBarService.getAllAppointmentList(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnewApp) {
        //                                 getVS1Data("TAppointment").then(function(dataObjectoldApp) {
        //                                     if (dataObjectoldApp.length == 0) {} else {
        //                                         let dataOldApp = JSON.parse(dataObjectoldApp[0].data);

        //                                         var thirdaryDataApp = $.merge($.merge([], dataObjectnewApp.tappointmentex), dataOldApp.tappointmentex);
        //                                         let objCombineDataApp = {
        //                                             tappointmentex: thirdaryDataApp,
        //                                         };
        //                                         addVS1Data("TAppointment", JSON.stringify(objCombineDataApp)).then(function(datareturnApp) {
        //                                             templateObject.resetData(objCombineDataApp);
        //                                             $('.fullScreenSpin').css('display', 'none');
        //                                         }).catch(function(err) {
        //                                             $('.fullScreenSpin').css('display', 'none');
        //                                         });
        //                                     }
        //                                 }).catch(function(err) {
        //                                     $('.fullScreenSpin').css('display', 'none');
        //                                 });
        //                             }).catch(function(err) {
        //                                 $(".fullScreenSpin").css("display", "none");
        //                             });

        //                         });

        //                     setTimeout(function() {
        //                         MakeNegative();
        //                     }, 100);
        //                 },
        //                 language: { search: "", searchPlaceholder: "Search List..." },
        //                 "fnInitComplete": function() {
        //                     let urlParametersPage = FlowRouter.current().queryParams.page;
        //                     //if (urlParametersPage || FlowRouter.current().queryParams.ignoredate) {
        //                     this.fnPageChange('last');
        //                     //}
        //                     $("<button class='btn btn-primary btnRefreshAppointment' type='button' id='btnRefreshAppointment' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblappointmentlist_filter");
        //                     $('.myvarFilterForm').appendTo(".colDateFilter");
        //                 },
        //                 "fnInfoCallback": function(oSettings, iStart, iEnd, iMax, iTotal, sPre) {
        //                     let countTableData = data.Params.Count || 0; //get count from API data

        //                     return 'Showing ' + iStart + " to " + iEnd + " of " + countTableData;
        //                 }
        //             }).on('page', function() {
        //                 setTimeout(function() {
        //                     MakeNegative();
        //                 }, 100);
        //                 let draftRecord = templateObject.datatablerecords.get();
        //                 templateObject.datatablerecords.set(draftRecord);
        //             }).on('column-reorder', function() {

        //             });
        //             $('.fullScreenSpin').css('display', 'none');
        //         }, 0);

        //         var columns = $('#tblappointmentlist th');
        //         let sTible = "";
        //         let sWidth = "";
        //         let sIndex = "";
        //         let sVisible = "";
        //         let columVisible = false;
        //         let sClass = "";
        //         $.each(columns, function(i, v) {
        //             if (v.hidden == false) {
        //                 columVisible = true;
        //             }
        //             if ((v.className.includes("hiddenColumn"))) {
        //                 columVisible = false;
        //             }
        //             sWidth = v.style.width.replace('px', "");

        //             let datatablerecordObj = {
        //                 sTitle: v.innerText || '',
        //                 sWidth: sWidth || '',
        //                 sIndex: v.cellIndex || 0,
        //                 sVisible: columVisible || false,
        //                 sClass: v.className || ''
        //             };
        //             tableHeaderList.push(datatablerecordObj);
        //         });

        //         templateObject.tableheaderrecords.set(tableHeaderList);
        //         $('div.dataTables_filter input').addClass('form-control form-control-sm');

        //     }).catch(function(err) {
        //         // Bert.alert('<strong>' + err + '</strong>!', 'danger');
        //         $('.fullScreenSpin').css('display', 'none');
        //         // Meteor._reload.reload();
        //     });
        // });

    }

    templateObject.getAllAppointmentListData();

    templateObject.getAllFilterAppointmentListData = function (fromDate, toDate, ignoreDate) {
        sideBarService.getTAppointmentListData(fromDate, toDate, ignoreDate, initialReportLoad, 0).then(function (data) {
            addVS1Data('TAppointmentList', JSON.stringify(data)).then(function (datareturn) {
                window.open('/appointmentlist?toDate=' + toDate + '&fromDate=' + fromDate + '&ignoredate=' + ignoreDate, '_self');
            }).catch(function (err) {
                location.reload();
            });
        }).catch(function (err) {
            $('.fullScreenSpin').css('display', 'none');
        });
    }

    let urlParametersDateFrom = FlowRouter.current().queryParams.fromDate;
    let urlParametersDateTo = FlowRouter.current().queryParams.toDate;
    let urlParametersIgnoreDate = FlowRouter.current().queryParams.ignoredate;
    if (urlParametersDateFrom) {
        if (urlParametersIgnoreDate == true) {
            $('#dateFrom').attr('readonly', true);
            $('#dateTo').attr('readonly', true);
        } else {

            $("#dateFrom").val(urlParametersDateFrom != '' ? moment(urlParametersDateFrom).format("DD/MM/YYYY") : urlParametersDateFrom);
            $("#dateTo").val(urlParametersDateTo != '' ? moment(urlParametersDateTo).format("DD/MM/YYYY") : urlParametersDateTo);
        }
    }
    
    $('#tblappointmentlist tbody').on('click', 'tr td:not(:first-child)', function () {
        var id = $(this).closest('tr').attr('id');
        var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
        if (checkDeleted == "Deleted") {
            swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
        } else {
            $("#frmAppointment")[0].reset();
            $("#btnHold").prop("disabled", false);
            $("#btnStartAppointment").prop("disabled", false);
            $("#btnStopAppointment").prop("disabled", false);
            $("#startTime").prop("disabled", false);
            $("#endTime").prop("disabled", false);
            $("#tActualStartTime").prop("disabled", false);
            $("#tActualEndTime").prop("disabled", false);
            $("#txtActualHoursSpent").prop("disabled", false);
            var hours = "0";
            var appointmentData = templateObject.datatablerecords.get();
            var result = appointmentData.filter((apmt) => {
                return apmt.id == id;
            });

            if (result.length > 0) {
                $("#frmAppointment")[0].reset();
                $("#btnHold").prop("disabled", false);
                $("#btnStartAppointment").prop("disabled", false);
                $("#btnStopAppointment").prop("disabled", false);
                $("#startTime").prop("disabled", false);
                $("#endTime").prop("disabled", false);
                $("#tActualStartTime").prop("disabled", false);
                $("#tActualEndTime").prop("disabled", false);
                $("#txtActualHoursSpent").prop("disabled", false);
                var hours = "0";
                // templateObject.getAllProductData();
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
                    $("#attachmentCount").html(result[0].attachments.length);
                }

                $("#event-modal").modal("toggle");
                if (result[0].extraProducts != "") {
                    let extraProducts = result[0].extraProducts.split(":");
                    let extraProductFees = [];
                    productService.getNewProductServiceListVS1()
                        .then(function (products) {
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
                        .catch(function (err) {
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
        }
    });

    // Get SMS Messaging Logs
    templateObject.smsMessagingLogs = async function () {
        return new Promise((resolve, reject) => {
            const smsSettings = templateObject.smsSettings.get();
            $.ajax({
                method: 'GET',
                url: 'https://api.twilio.com/2010-04-01/Accounts/' + smsSettings.twilioAccountId + `/SMS/Messages.json?PageSize=1000`,
                dataType: 'json',
                contentType: 'application/json', // !
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization",
                        "Basic " + btoa(smsSettings.twilioAccountId + ":" + smsSettings.twilioAccountToken) // !
                    );
                },
                success: function (data) {
                    resolve(data);
                },
                error: function (e) {
                    resolve('');
                    //reject(e.message);
                }
            })
        });
    }
    tableResize();

});

Template.appointmentlist.events({
    'click #btnAppointment': function (event) {
        if (createAppointment == false) {
            swal({
                title: 'Oops...',
                text: "You don't have access to create a new Appointment",
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.value) { } else if (result.dismiss === 'cancel') { }
            });
            return false;
        } else {
            // localStorage.setItem("appt_historypage", "appointmentlist");
            // FlowRouter.go('/appointments');
            $("#employeeListModal").modal("toggle");
        };

    },
    'change #hideConverted': function () {
        let templateObject = Template.instance();
        let useData = templateObject.datatablerecords.get();
        var splashArrayAppointmentListDupp = new Array();
        let dataTableList = [];
        var checkbox = document.querySelector("#hideConverted");

        if (checkbox.checked) {

            if (useData.length > 0) {

                let confirmedColumn = '<i class="fas fa-minus-circle text-info" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="No SMS Message Sent"></i>';
                for (let i = 0; i < useData.length; i++) {
                    if (useData[i].finished != "Converted" || useData[i].finished == "Completed") {

                        var dataList = {
                            id: useData[i].id || '',
                            sortdate: useData[i].sortdate,
                            appointmentdate: useData[i].appointmentdate,
                            accountname: useData[i].accountname || '',
                            statementno: useData[i].statementno || '',
                            employeename: useData[i].employeename || '',
                            department: useData[i].department || '',
                            phone: useData[i].phone || '',
                            mobile: useData[i].mobile || '',
                            suburb: useData[i].suburb || '',
                            street: useData[i].street || '',
                            state: useData[i].state || '',
                            country: useData[i].country || '',
                            zip: useData[i].zip || '',
                            startTime: useData[i].startTime || '',
                            timeStart: useData[i].timeStart,
                            timeEnd: useData[i].timeEnd,
                            totalHours: useData[i].totalHours || 0,
                            endTime: useData[i].endTime || '',
                            startDate: useData[i].startDate || '',
                            endDate: useData[i].endDate || '',
                            frmDate: useData[i].frmDate,
                            toDate: useData[i].toDate,
                            fromDate: useData[i].fromDate,
                            openbalance: useData[i].openbalance || '',
                            aStartTime: useData[i].aStartTime || '',
                            aEndTime: useData[i].aEndTime || '',
                            actualHours: '',
                            closebalance: '',
                            product: useData[i].product || '',
                            finished: useData[i].finished || '',
                            notes: useData[i].notes || '',
                            color: "#f6c23e",
                            msRef: useData[i].MSRef || ''
                        };
                        if (useData[i].custFld13 == "Yes") {
                            if (useData[i].custFld11 == "Yes") {
                                confirmedColumn = '<i class="fa fa-check text-success" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message confirmed"></i>';
                            } else if (useData[i].custFld11 == "No") {
                                confirmedColumn = '<i class="fa fa-close text-danger" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message declined"></i>';
                            } else {
                                confirmedColumn = '<i class="fa fa-question text-warning" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message no reply"></i>';
                            }
                        } else {
                            confirmedColumn = '<i class="fas fa-minus-circle text-info" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="No SMS Message Sent"></i>';
                        }
                        var dataListAppointmentList = [
                            '<div class="custom-control custom-checkbox pointer" style="width:15px;"><input class="custom-control-input chkBox notevent pointer" type="checkbox" id="f-' + useData[i].id + '" name="' + useData[i].id + '"> <label class="custom-control-label" for="f-' + useData[i].id + '"></label></div>' || '',
                            useData[i].sortdate || '',
                            useData[i].id || '',
                            '<span style="display:none;">' + useData[i].sortdate + '</span> ' + useData[i].appointmentdate || '',
                            useData[i].accountname || '',
                            useData[i].statementno || '',
                            useData[i].frmDate || '',
                            useData[i].toDate || '',
                            useData[i].timeStart || '',
                            useData[i].timeEnd || '',
                            useData[i].actual_start_time || '',
                            useData[i].actual_end_time || '',
                            useData[i].finished || '',
                            confirmedColumn,
                            useData[i].notes || '',
                            useData[i].product || '',
                        ];

                        splashArrayAppointmentListDupp.push(dataListAppointmentList);

                    }
                }

                var datatableApp = $('#tblappointmentlist').DataTable();
                datatableApp.clear();
                datatableApp.rows.add(splashArrayAppointmentListDupp);
                datatableApp.draw(false);
            }
        } else if (!checkbox.checked) {
            let confirmedColumn = '<i class="fas fa-minus-circle text-info" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="No SMS Message Sent"></i>';
            for (let i = 0; i < useData.length; i++) {
                //if (useData[i].finished != "Converted" || useData[i].finished == "Completed") {
                var dataList = {
                    id: useData[i].id || '',
                    sortdate: useData[i].sortdate,
                    appointmentdate: useData[i].appointmentdate,
                    accountname: useData[i].accountname || '',
                    statementno: useData[i].statementno || '',
                    employeename: useData[i].employeename || '',
                    department: useData[i].department || '',
                    phone: useData[i].phone || '',
                    mobile: useData[i].mobile || '',
                    suburb: useData[i].suburb || '',
                    street: useData[i].street || '',
                    state: useData[i].state || '',
                    country: useData[i].country || '',
                    zip: useData[i].zip || '',
                    startTime: useData[i].startTime || '',
                    timeStart: useData[i].timeStart,
                    timeEnd: useData[i].timeEnd,
                    totalHours: useData[i].totalHours || 0,
                    endTime: useData[i].endTime || '',
                    startDate: useData[i].startDate || '',
                    endDate: useData[i].endDate || '',
                    frmDate: useData[i].frmDate,
                    toDate: useData[i].toDate,
                    fromDate: useData[i].fromDate,
                    openbalance: useData[i].openbalance || '',
                    aStartTime: useData[i].aStartTime || '',
                    aEndTime: useData[i].aEndTime || '',
                    actualHours: '',
                    closebalance: '',
                    product: useData[i].product || '',
                    finished: useData[i].finished || '',
                    notes: useData[i].notes || '',
                    color: "#f6c23e",
                    msRef: useData[i].MSRef || ''
                };

                if (useData[i].custFld13 == "Yes") {
                    if (useData[i].custFld11 == "Yes") {
                        confirmedColumn = '<i class="fa fa-check text-success" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message confirmed"></i>';
                    } else if (useData[i].custFld11 == "No") {
                        confirmedColumn = '<i class="fa fa-close text-danger" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message declined"></i>';
                    } else {
                        confirmedColumn = '<i class="fa fa-question text-warning" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message no reply"></i>';
                    }
                } else {
                    confirmedColumn = '<i class="fas fa-minus-circle text-info" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="No SMS Message Sent"></i>';
                }
                var dataListAppointmentList = [
                    '<div class="custom-control custom-checkbox pointer" style="width:15px;"><input class="custom-control-input chkBox notevent pointer" type="checkbox" id="f-' + useData[i].id + '" name="' + useData[i].id + '"> <label class="custom-control-label" for="f-' + useData[i].id + '"></label></div>' || '',
                    useData[i].sortdate || '',
                    useData[i].id || '',
                    '<span style="display:none;">' + useData[i].sortdate + '</span> ' + useData[i].appointmentdate || '',
                    useData[i].accountname || '',
                    useData[i].statementno || '',
                    useData[i].frmDate || '',
                    useData[i].toDate || '',
                    useData[i].timeStart || '',
                    useData[i].timeEnd || '',
                    useData[i].actual_start_time || '',
                    useData[i].actual_end_time || '',
                    useData[i].finished || '',
                    confirmedColumn,
                    useData[i].notes || '',
                    useData[i].product || '',
                ];
                splashArrayAppointmentListDupp.push(dataListAppointmentList);

                //}
            }

            var datatableApp = $('#tblappointmentlist').DataTable();
            datatableApp.clear();
            datatableApp.rows.add(splashArrayAppointmentListDupp);
            datatableApp.draw(false);
        }
    },
    'click .btnRefresh': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        let isDoneAppointment = false;
        let isDoneInvoice = false;

        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if ((currentBeginDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
            fromDateMonth = (currentBeginDate.getMonth() + 1);
        }

        if (currentBeginDate.getDate() < 10) {
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        sideBarService.getTAppointmentListData(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function (dataApp) {

            addVS1Data('TAppointmentList', JSON.stringify(dataApp)).then(function (datareturn) {
                sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function (data) {
                    if (data.tappointmentex.length > 0) {
                        addVS1Data('TAppointment', JSON.stringify(data)).then(function (datareturn) {
                            isDoneAppointment = true;
                            window.open('/appointmentlist', '_self');
                        }).catch(function (err) {
                            isDoneAppointment = true;
                            window.open('/appointmentlist', '_self');
                        });
                    }
                }).catch(function (err) {
                    isDoneAppointment = true;
                    window.open('/appointmentlist', '_self');
                });

            }).catch(function (err) {
                sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function (data) {
                    if (data.tappointmentex.length > 0) {
                        addVS1Data('TAppointment', JSON.stringify(data)).then(function (datareturn) {
                            isDoneAppointment = true;
                            window.open('/appointmentlist', '_self');
                        }).catch(function (err) {
                            isDoneAppointment = true;
                            window.open('/appointmentlist', '_self');
                        });
                    }
                }).catch(function (err) {
                    isDoneAppointment = true;
                    window.open('/appointmentlist', '_self');
                });

            });
        }).catch(function (err) {
            window.open('/appointmentlist', '_self');
        });


        sideBarService.getAllInvoiceList(initialDataLoad, 0).then(function (data) {
            addVS1Data('TInvoiceEx', JSON.stringify(data)).then(function (datareturn) {
                isDoneInvoice = true;
                if ((isDoneAppointment == true) && (isDoneInvoice == true)) {

                }
            }).catch(function (err) {
                isDoneInvoice = true;
                if ((isDoneAppointment == true) && (isDoneInvoice == true)) {

                }
            });
        }).catch(function (err) {
            isDoneInvoice = true;
            if ((isDoneAppointment == true) && (isDoneInvoice == true)) {

            }
        });

        sideBarService.getAllAppointmentPredList().then(function (dataPred) {
            addVS1Data('TAppointmentPreferences', JSON.stringify(dataPred)).then(function (datareturnPred) {

            }).catch(function (err) {

            });
        }).catch(function (err) {

        });

        sideBarService.getGlobalSettings().then(function (dataPrefrences) {
            addVS1Data('TERPPreference', JSON.stringify(dataPrefrences)).then(function (datareturn) {

            }).catch(function (err) {

            });
        }).catch(function (err) {

        });
    },
    'change #dateTo': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function () {
            var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
            var dateTo = new Date($("#dateTo").datepicker("getDate"));

            let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
            let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

            //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
            var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
            //templateObject.dateAsAt.set(formatDate);
            if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

            } else {
                templateObject.getAllFilterAppointmentListData(formatDateFrom, formatDateTo, false);
            }
        }, 500);
    },
    'change #dateFrom': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function () {
            var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
            var dateTo = new Date($("#dateTo").datepicker("getDate"));

            let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
            let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

            //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
            var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
            //templateObject.dateAsAt.set(formatDate);
            if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

            } else {
                templateObject.getAllFilterAppointmentListData(formatDateFrom, formatDateTo, false);
            }
        }, 500);
    },
    'click #today': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if ((currentBeginDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
            fromDateMonth = (currentBeginDate.getMonth() + 1);
        }

        if (currentBeginDate.getDate() < 10) {
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDateERPFrom = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        var toDateERPTo = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);

        var toDateDisplayFrom = (fromDateDay) + "/" + (fromDateMonth) + "/" + currentBeginDate.getFullYear();
        var toDateDisplayTo = (fromDateDay) + "/" + (fromDateMonth) + "/" + currentBeginDate.getFullYear();

        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterAppointmentListData(toDateERPFrom, toDateERPTo, false);
    },
    'click #lastweek': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if ((currentBeginDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
            fromDateMonth = (currentBeginDate.getMonth() + 1);
        }

        if (currentBeginDate.getDate() < 10) {
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDateERPFrom = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay - 7);
        var toDateERPTo = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);

        var toDateDisplayFrom = (fromDateDay - 7) + "/" + (fromDateMonth) + "/" + currentBeginDate.getFullYear();
        var toDateDisplayTo = (fromDateDay) + "/" + (fromDateMonth) + "/" + currentBeginDate.getFullYear();

        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterAppointmentListData(toDateERPFrom, toDateERPTo, false);
    },
    'click #lastMonth': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();

        var prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        var prevMonthFirstDate = new Date(currentDate.getFullYear() - (currentDate.getMonth() > 0 ? 0 : 1), (currentDate.getMonth() - 1 + 12) % 12, 1);

        var formatDateComponent = function (dateComponent) {
            return (dateComponent < 10 ? '0' : '') + dateComponent;
        };

        var formatDate = function (date) {
            return formatDateComponent(date.getDate()) + '/' + formatDateComponent(date.getMonth() + 1) + '/' + date.getFullYear();
        };

        var formatDateERP = function (date) {
            return date.getFullYear() + '-' + formatDateComponent(date.getMonth() + 1) + '-' + formatDateComponent(date.getDate());
        };


        var fromDate = formatDate(prevMonthFirstDate);
        var toDate = formatDate(prevMonthLastDate);

        $("#dateFrom").val(fromDate);
        $("#dateTo").val(toDate);

        var getLoadDate = formatDateERP(prevMonthLastDate);
        let getDateFrom = formatDateERP(prevMonthFirstDate);
        templateObject.getAllFilterAppointmentListData(getDateFrom, getLoadDate, false);
    },
    'click #lastQuarter': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        function getQuarter(d) {
            d = d || new Date();
            var m = Math.floor(d.getMonth() / 3) + 2;
            return m > 4 ? m - 4 : m;
        }

        var quarterAdjustment = (moment().month() % 3) + 1;
        var lastQuarterEndDate = moment().subtract({
            months: quarterAdjustment
        }).endOf('month');
        var lastQuarterStartDate = lastQuarterEndDate.clone().subtract({
            months: 2
        }).startOf('month');

        var lastQuarterStartDateFormat = moment(lastQuarterStartDate).format("DD/MM/YYYY");
        var lastQuarterEndDateFormat = moment(lastQuarterEndDate).format("DD/MM/YYYY");


        $("#dateFrom").val(lastQuarterStartDateFormat);
        $("#dateTo").val(lastQuarterEndDateFormat);

        let fromDateMonth = getQuarter(currentDate);
        var quarterMonth = getQuarter(currentDate);
        let fromDateDay = currentDate.getDate();

        var getLoadDate = moment(lastQuarterEndDate).format("YYYY-MM-DD");
        let getDateFrom = moment(lastQuarterStartDateFormat).format("YYYY-MM-DD");
        templateObject.getAllFilterAppointmentListData(getDateFrom, getLoadDate, false);
    },
    'click #last12Months': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
        let fromDateDay = currentDate.getDate();
        if ((currentDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentDate.getMonth() + 1);
        }
        if (currentDate.getDate() < 10) {
            fromDateDay = "0" + currentDate.getDate();
        }

        var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + Math.floor(currentDate.getFullYear() - 1);
        $("#dateFrom").val(fromDate);
        $("#dateTo").val(begunDate);

        var currentDate2 = new Date();
        if ((currentDate2.getMonth() + 1) < 10) {
            fromDateMonth2 = "0" + Math.floor(currentDate2.getMonth() + 1);
        }
        if (currentDate2.getDate() < 10) {
            fromDateDay2 = "0" + currentDate2.getDate();
        }
        var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
        let getDateFrom = Math.floor(currentDate2.getFullYear() - 1) + "-" + fromDateMonth2 + "-" + currentDate2.getDate();
        templateObject.getAllFilterAppointmentListData(getDateFrom, getLoadDate, false);

    },
    'click #ignoreDate': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
        templateObject.getAllFilterAppointmentListData('', '', true);
    },
    'click .chkDatatable': function (event) {
        var columns = $('#tblappointmentlist th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();

        $.each(columns, function (i, v) {
            let className = v.classList;
            let replaceClass = className[1];

            if (v.innerText == columnDataValue) {
                if ($(event.target).is(':checked')) {
                    $("." + replaceClass + "").css('display', 'table-cell');
                    $("." + replaceClass + "").css('padding', '.75rem');
                    $("." + replaceClass + "").css('vertical-align', 'top');
                } else {
                    $("." + replaceClass + "").css('display', 'none');
                }
            }
        });
    },
    'keyup #tblappointmentlist_filter input': function (event) {
        if ($(event.target).val() != '') {
            $(".btnRefreshAppointment").addClass('btnSearchAlert');
        } else {
            $(".btnRefreshAppointment").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
            $(".btnRefreshAppointment").trigger("click");
        }
    },
    'click .btnRefreshAppointment': async function (event) {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        const customerList = [];
        const clientList = [];
        let salesOrderTable;
        var splashArray = new Array();
        var splashArrayAppointmentList = new Array();
        const dataTableList = [];
        const tableHeaderList = [];
        let dataSearchName = $('#tblappointmentlist_filter input').val();
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if ((currentBeginDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
            fromDateMonth = (currentBeginDate.getMonth() + 1);
        }

        if (currentBeginDate.getDate() < 10) {
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        await templateObject.getSMSSettings();
        const recentSMSLogs = await templateObject.smsMessagingLogs() || '';

        const accessLevel = Session.get('CloudApptSMS');
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getTAppointmentListDataByName(dataSearchName).then(function (data) {
                let lineItems = [];
                let lineItemObj = {};
                let color = "";
                let appStatus = "";
                if (data.tappointmentlist.length > 0) {
                    for (let i = 0; i < data.tappointmentlist.length; i++) {
                        appStatus = data.tappointmentlist[i].Status || '';
                        if (data.tappointmentlist[i].Active == true) {
                            if (data.tappointmentlist[i].Status == "Converted" || data.tappointmentlist[i].Status == "Completed") {
                                color = "#1cc88a";
                            } else {
                                color = "#f6c23e";
                            }
                        } else {
                            appStatus = "Deleted";
                            color = "#e74a3b";
                        }
                        var dataList = {
                            id: data.tappointmentlist[i].AppointID || '',
                            sortdate: data.tappointmentlist[i].CreationDate != '' ? moment(data.tappointmentlist[i].CreationDate).format("YYYY/MM/DD") : data.tappointmentlist[i].CreationDate,
                            appointmentdate: data.tappointmentlist[i].STARTTIME != '' ? moment(data.tappointmentlist[i].STARTTIME).format("DD/MM/YYYY") : data.tappointmentlist[i].STARTTIME,
                            accountname: data.tappointmentlist[i].ClientName || '',
                            statementno: data.tappointmentlist[i].EnteredByEmployeeName || '',
                            employeename: data.tappointmentlist[i].EnteredByEmployeeName || '',
                            department: data.tappointmentlist[i].DeptClassName || '',
                            phone: data.tappointmentlist[i].Phone || '',
                            mobile: data.tappointmentlist[i].Mobile || '',
                            suburb: data.tappointmentlist[i].Suburb || '',
                            street: data.tappointmentlist[i].Street || '',
                            state: data.tappointmentlist[i].State || '',
                            country: data.tappointmentlist[i].Country || '',
                            zip: data.tappointmentlist[i].Postcode || '',
                            startTime: data.tappointmentlist[i].STARTTIME.split(' ')[1] || '',
                            timeStart: moment(data.tappointmentlist[i].STARTTIME).format('h:mm a'),
                            timeEnd: moment(data.tappointmentlist[i].ENDTIME).format('h:mm a'),
                            totalHours: data.tappointmentlist[i].TotalHours || 0,
                            endTime: data.tappointmentlist[i].ENDTIME.split(' ')[1] || '',
                            startDate: data.tappointmentlist[i].STARTTIME || '',
                            endDate: data.tappointmentlist[i].ENDTIME || '',
                            frmDate: moment(data.tappointmentlist[i].STARTTIME).format('dddd') + ', ' + moment(data.tappointmentlist[i].STARTTIME).format('DD'),
                            toDate: moment(data.tappointmentlist[i].ENDTIME).format('dddd') + ', ' + moment(data.tappointmentlist[i].ENDTIME).format('DD'),
                            fromDate: data.tappointmentlist[i].Actual_Endtime != '' ? moment(data.tappointmentlist[i].Actual_Endtime).format("DD/MM/YYYY") : data.tappointmentlist[i].Actual_Endtime,
                            openbalance: data.tappointmentlist[i].Actual_Endtime || '',
                            aStartTime: data.tappointmentlist[i].Actual_Starttime.split(' ')[1] || '',
                            aEndTime: data.tappointmentlist[i].Actual_Endtime.split(' ')[1] || '',
                            actualHours: '',
                            closebalance: '',
                            product: data.tappointmentlist[i].ProductDesc || '',
                            finished: appStatus || '',
                            notes: data.tappointmentlist[i].Notes || '',
                            color: color,
                            actual_starttime: data.tappointmentlist[i].Actual_Starttime || '',
                            actual_endtime: data.tappointmentlist[i].Actual_Endtime || '',
                            booked_starttime: data.tappointmentlist[i].STARTTIME || '',
                            booked_endtime: data.tappointmentlist[i].ENDTIME || '',
                            msRef: data.tappointmentlist[i].MSRef || '',
                            custFld11: data.tappointmentlist[i].CUSTFLD11 || '',
                            custFld13: data.tappointmentlist[i].CUSTFLD13 || ''
                        };
                        if (accessLevel) {
                            if (data.tappointmentlist[i].CUSTFLD13 === "Yes" && data.tappointmentlist[i].CUSTFLD11 === "" && data.tappointmentlist[i].Active == true) {
                                // Get SMS Confimation Info
                                const smsSettings = templateObject.smsSettings.get();
                                if (smsSettings.twilioAccountId !== "" && smsSettings.twilioAccountToken !== "" && smsSettings.twilioTelephoneNumber !== "") {
                                    const sentSMSs = recentSMSLogs.sms_messages.filter(message => message.from === "+" + smsSettings.twilioTelephoneNumber.replace('+', '') &&
                                        message.to === "+" + data.tappointmentlist[i].Mobile.replace('+', '')) || '';
                                    const receiveSMSs = recentSMSLogs.sms_messages.filter(message => message.to === "+" + smsSettings.twilioTelephoneNumber.replace('+', '') &&
                                        message.from === "+" + data.tappointmentlist[i].Mobile.replace('+', '')) || '';
                                    let currentSentSMSDate = null;
                                    let nextSentSMSDate = null;
                                    if (sentSMSs.length > 0) {
                                        for (let j = 0; j < sentSMSs.length; j++) {
                                            if (data.tappointmentlist[i].CUSTFLD12 === sentSMSs[j].sid) {
                                                currentSentSMSDate = sentSMSs[j].date_sent;
                                                nextSentSMSDate = j - 1 >= 0 ? sentSMSs[j - 1].date_sent : null;
                                                break;
                                            }
                                        }
                                        if (currentSentSMSDate) {
                                            for (let j = 0; j < receiveSMSs.length; j++) {
                                                const receiveSMSDate = moment(receiveSMSs[j].date_sent);
                                                if (receiveSMSDate >= moment(currentSentSMSDate) && (!nextSentSMSDate || (nextSentSMSDate && receiveSMSDate <= moment(nextSentSMSDate)))) {
                                                    const replyText = receiveSMSs[j].body ? receiveSMSs[j].body.toLowerCase() : "";
                                                    if (replyText.includes('yes')) {
                                                        appointmentService.saveAppointment({
                                                            type: "TAppointmentEx",
                                                            fields: {
                                                                Id: data.tappointmentlist[i].AppointID,
                                                                CUSTFLD11: "Yes"
                                                            }
                                                        }).then(function (data) {
                                                            sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function (dataUpdate) {
                                                                addVS1Data('TAppointment', JSON.stringify(dataUpdate));
                                                            });
                                                        }).catch(e => {

                                                        });
                                                        dataList.custFld11 = "Yes";
                                                        break;
                                                    } else if (replyText.includes('no')) {
                                                        appointmentService.saveAppointment({
                                                            type: "TAppointmentEx",
                                                            fields: {
                                                                Id: data.tappointmentlist[i].AppointID,
                                                                CUSTFLD11: "No"
                                                            }
                                                        }).then(function (data) {
                                                            sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function (dataUpdate) {
                                                                addVS1Data('TAppointment', JSON.stringify(dataUpdate));
                                                            });
                                                        }).catch(e => {

                                                        });
                                                        dataList.custFld11 = "No";
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        dataTableList.push(dataList);
                    }
                    let confirmedColumn = '<i class="fas fa-minus-circle text-info" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="No SMS Message Sent"></i>';
                    for (let p = 0; p < dataTableList.length; p++) {
                        if (dataTableList[p].custFld13 == "Yes") {
                            if (dataTableList[p].custFld11 == "Yes") {
                                confirmedColumn = '<i class="fa fa-check text-success" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message confirmed"></i>';
                            } else if (dataTableList[p].custFld11 == "No") {
                                confirmedColumn = '<i class="fa fa-close text-danger" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message declined"></i>';
                            } else {
                                confirmedColumn = '<i class="fa fa-question text-warning" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message no reply"></i>';
                            }
                        } else {
                            confirmedColumn = '<i class="fas fa-minus-circle text-info" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="No SMS Message Sent"></i>';
                        }
                        var dataListAppointmentList = [
                            '<div class="custom-control custom-checkbox pointer" style="width:15px;"><input class="custom-control-input chkBox notevent pointer" type="checkbox" id="f-' + dataTableList[p].id + '" name="' + dataTableList[p].id + '"> <label class="custom-control-label" for="f-' + dataTableList[p].id + '"></label></div>' || '',
                            dataTableList[p].sortdate || '',
                            dataTableList[p].id || '',
                            '<span style="display:none;">' + dataTableList[p].sortdate + '</span> ' + dataTableList[p].appointmentdate || '',
                            dataTableList[p].accountname || '',
                            dataTableList[p].statementno || '',
                            dataTableList[p].frmDate || '',
                            dataTableList[p].toDate || '',
                            dataTableList[p].timeStart || '',
                            dataTableList[p].timeEnd || '',
                            dataTableList[p].finished || '',
                            confirmedColumn,
                            dataTableList[p].notes || '',
                            dataTableList[p].product || '',
                        ];
                        splashArrayAppointmentList.push(dataListAppointmentList);
                    };
                    var datatable = $('#tblappointmentlist').DataTable();
                    datatable.clear();
                    datatable.rows.add(splashArrayAppointmentList);
                    datatable.draw(false);

                    $('.fullScreenSpin').css('display', 'none');
                } else {

                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Question',
                        text: "Appointment does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/appointments');
                        } else if (result.dismiss === 'cancel') {

                        }
                    });

                }

            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            sideBarService.getTAppointmentListData(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function (data) {
                let lineItems = [];
                let lineItemObj = {};
                let color = "";
                let appStatus = "";
                for (let i = 0; i < data.tappointmentlist.length; i++) {
                    appStatus = data.tappointmentlist[i].Status || '';
                    // let openBalance = utilityService.modifynegativeCurrencyFormat(data.tappointmentex[i].fields.OpenBalance)|| 0.00;
                    // let closeBalance = utilityService.modifynegativeCurrencyFormat(data.tappointmentex[i].fields.CloseBalance)|| 0.00;
                    if (data.tappointmentlist[i].Active == true) {
                        if (data.tappointmentlist[i].Status == "Converted" || data.tappointmentlist[i].Status == "Completed") {
                            color = "#1cc88a";
                        } else {
                            color = "#f6c23e";
                        }
                    } else {
                        appStatus = "Deleted";
                        color = "#e74a3b";
                    }
                    var dataList = {
                        id: data.tappointmentlist[i].AppointID || '',
                        sortdate: data.tappointmentlist[i].CreationDate != '' ? moment(data.tappointmentlist[i].CreationDate).format("YYYY/MM/DD") : data.tappointmentlist[i].CreationDate,
                        appointmentdate: data.tappointmentlist[i].STARTTIME != '' ? moment(data.tappointmentlist[i].STARTTIME).format("DD/MM/YYYY") : data.tappointmentlist[i].STARTTIME,
                        accountname: data.tappointmentlist[i].ClientName || '',
                        statementno: data.tappointmentlist[i].EnteredByEmployeeName || '',
                        employeename: data.tappointmentlist[i].EnteredByEmployeeName || '',
                        department: data.tappointmentlist[i].DeptClassName || '',
                        phone: data.tappointmentlist[i].Phone || '',
                        mobile: data.tappointmentlist[i].Mobile || '',
                        suburb: data.tappointmentlist[i].Suburb || '',
                        street: data.tappointmentlist[i].Street || '',
                        state: data.tappointmentlist[i].State || '',
                        country: data.tappointmentlist[i].Country || '',
                        zip: data.tappointmentlist[i].Postcode || '',
                        startTime: data.tappointmentlist[i].STARTTIME.split(' ')[1] || '',
                        timeStart: moment(data.tappointmentlist[i].STARTTIME).format('h:mm a'),
                        timeEnd: moment(data.tappointmentlist[i].ENDTIME).format('h:mm a'),
                        totalHours: data.tappointmentlist[i].TotalHours || 0,
                        endTime: data.tappointmentlist[i].ENDTIME.split(' ')[1] || '',
                        startDate: data.tappointmentlist[i].STARTTIME || '',
                        endDate: data.tappointmentlist[i].ENDTIME || '',
                        frmDate: moment(data.tappointmentlist[i].STARTTIME).format('dddd') + ', ' + moment(data.tappointmentlist[i].STARTTIME).format('DD'),
                        toDate: moment(data.tappointmentlist[i].ENDTIME).format('dddd') + ', ' + moment(data.tappointmentlist[i].ENDTIME).format('DD'),
                        fromDate: data.tappointmentlist[i].Actual_Endtime != '' ? moment(data.tappointmentlist[i].Actual_Endtime).format("DD/MM/YYYY") : data.tappointmentlist[i].Actual_Endtime,
                        openbalance: data.tappointmentlist[i].Actual_Endtime || '',
                        aStartTime: data.tappointmentlist[i].Actual_Starttime.split(' ')[1] || '',
                        aEndTime: data.tappointmentlist[i].Actual_Endtime.split(' ')[1] || '',
                        actualHours: '',
                        closebalance: '',
                        product: data.tappointmentlist[i].ProductDesc || '',
                        finished: appStatus || '',
                        notes: data.tappointmentlist[i].Notes || '',
                        color: color,
                        actual_starttime: data.tappointmentlist[i].Actual_Starttime || '',
                        actual_endtime: data.tappointmentlist[i].Actual_Endtime || '',
                        booked_starttime: data.tappointmentlist[i].STARTTIME || '',
                        booked_endtime: data.tappointmentlist[i].ENDTIME || '',
                        msRef: data.tappointmentlist[i].MSRef || '',
                        custFld11: data.tappointmentlist[i].CUSTFLD11 || '',
                        custFld13: data.tappointmentlist[i].CUSTFLD13 || ''
                    };
                    if (accessLevel) {
                        if (data.tappointmentlist[i].CUSTFLD13 === "Yes" && data.tappointmentlist[i].CUSTFLD11 === "" && data.tappointmentlist[i].Active == true) {
                            // Get SMS Confimation Info
                            const smsSettings = templateObject.smsSettings.get();
                            if (smsSettings.twilioAccountId !== "" && smsSettings.twilioAccountToken !== "" && smsSettings.twilioTelephoneNumber !== "") {
                                const sentSMSs = recentSMSLogs.sms_messages.filter(message => message.from === "+" + smsSettings.twilioTelephoneNumber.replace('+', '') &&
                                    message.to === "+" + data.tappointmentlist[i].Mobile.replace('+', '')) || '';
                                const receiveSMSs = recentSMSLogs.sms_messages.filter(message => message.to === "+" + smsSettings.twilioTelephoneNumber.replace('+', '') &&
                                    message.from === "+" + data.tappointmentlist[i].Mobile.replace('+', '')) || '';
                                let currentSentSMSDate = null;
                                let nextSentSMSDate = null;
                                if (sentSMSs.length > 0) {
                                    for (let j = 0; j < sentSMSs.length; j++) {
                                        if (data.tappointmentlist[i].CUSTFLD12 === sentSMSs[j].sid) {
                                            currentSentSMSDate = sentSMSs[j].date_sent;
                                            nextSentSMSDate = j - 1 >= 0 ? sentSMSs[j - 1].date_sent : null;
                                            break;
                                        }
                                    }
                                    if (currentSentSMSDate) {
                                        for (let j = 0; j < receiveSMSs.length; j++) {
                                            const receiveSMSDate = moment(receiveSMSs[j].date_sent);
                                            if (receiveSMSDate >= moment(currentSentSMSDate) && (!nextSentSMSDate || (nextSentSMSDate && receiveSMSDate <= moment(nextSentSMSDate)))) {
                                                const replyText = receiveSMSs[j].body ? receiveSMSs[j].body.toLowerCase() : "";
                                                if (replyText.includes('yes')) {
                                                    appointmentService.saveAppointment({
                                                        type: "TAppointmentEx",
                                                        fields: {
                                                            Id: data.tappointmentlist[i].AppointID,
                                                            CUSTFLD11: "Yes"
                                                        }
                                                    }).then(function (data) {
                                                        sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function (dataUpdate) {
                                                            addVS1Data('TAppointment', JSON.stringify(dataUpdate));
                                                        });
                                                    }).catch(e => {

                                                    });
                                                    dataList.custFld11 = "Yes";
                                                    break;
                                                } else if (replyText.includes('no')) {
                                                    appointmentService.saveAppointment({
                                                        type: "TAppointmentEx",
                                                        fields: {
                                                            Id: data.tappointmentlist[i].AppointID,
                                                            CUSTFLD11: "No"
                                                        }
                                                    }).then(function (data) {
                                                        sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function (dataUpdate) {
                                                            addVS1Data('TAppointment', JSON.stringify(dataUpdate));
                                                        });
                                                    }).catch(e => {

                                                    });
                                                    dataList.custFld11 = "No";
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    dataTableList.push(dataList);
                }
                let confirmedColumn = '<i class="fas fa-minus-circle text-info" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="No SMS Message Sent"></i>';
                for (let p = 0; p < dataTableList.length; p++) {
                    if (dataTableList[p].custFld13 == "Yes") {
                        if (dataTableList[p].custFld11 == "Yes") {
                            confirmedColumn = '<i class="fa fa-check text-success" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message confirmed"></i>';
                        } else if (dataTableList[p].custFld11 == "No") {
                            confirmedColumn = '<i class="fa fa-close text-danger" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message declined"></i>';
                        } else {
                            confirmedColumn = '<i class="fa fa-question text-warning" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="SMS Message no reply"></i>';
                        }
                    } else {
                        confirmedColumn = '<i class="fas fa-minus-circle text-info" style="font-size: 35px;" data-toggle="tooltip" data-placement="top" title="No SMS Message Sent"></i>';
                    }
                    var dataListAppointmentList = [
                        '<div class="custom-control custom-checkbox pointer" style="width:15px;"><input class="custom-control-input chkBox notevent pointer" type="checkbox" id="f-' + dataTableList[p].id + '" name="' + dataTableList[p].id + '"> <label class="custom-control-label" for="f-' + dataTableList[p].id + '"></label></div>' || '',
                        dataTableList[p].sortdate || '',
                        dataTableList[p].id || '',
                        '<span style="display:none;">' + dataTableList[p].sortdate + '</span> ' + dataTableList[p].appointmentdate || '',
                        dataTableList[p].accountname || '',
                        dataTableList[p].statementno || '',
                        dataTableList[p].frmDate || '',
                        dataTableList[p].toDate || '',
                        dataTableList[p].timeStart || '',
                        dataTableList[p].timeEnd || '',
                        dataTableList[p].finished || '',
                        confirmedColumn,
                        dataTableList[p].notes || '',
                        dataTableList[p].product || '',
                    ];
                    splashArrayAppointmentList.push(dataListAppointmentList);
                };
                var datatable = $('#tblappointmentlist').DataTable();
                datatable.clear();
                datatable.rows.add(splashArrayAppointmentList);
                datatable.draw(false);

                $('.fullScreenSpin').css('display', 'none');


            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        }
    },
    'click .resetTable': function (event) {
        var getcurrentCloudDetails = CloudUser.findOne({ _id: Session.get('mycloudLogonID'), clouddatabaseID: Session.get('mycloudLogonDBID') });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblappointmentlist' });
                if (checkPrefDetails) {
                    CloudPreference.remove({ _id: checkPrefDetails._id }, function (err, idTag) {
                        if (err) {

                        } else {
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .saveTable': function (event) {
        let lineItems = [];
        $('.columnSettings').each(function (index) {
            var $tblrow = $(this);
            var colTitle = $tblrow.find(".divcolumn").text() || '';
            var colWidth = $tblrow.find(".custom-range").val() || 0;
            var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
            var colHidden = false;
            if ($tblrow.find(".custom-control-input").is(':checked')) {
                colHidden = false;
            } else {
                colHidden = true;
            }
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass
            }

            lineItems.push(lineItemObj);
        });

        var getcurrentCloudDetails = CloudUser.findOne({ _id: Session.get('mycloudLogonID'), clouddatabaseID: Session.get('mycloudLogonDBID') });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblappointmentlist' });
                if (checkPrefDetails) {
                    CloudPreference.update({ _id: checkPrefDetails._id }, {
                        $set: {
                            userid: clientID,
                            username: clientUsername,
                            useremail: clientEmail,
                            PrefGroup: 'salesform',
                            PrefName: 'tblappointmentlist',
                            published: true,
                            customFields: lineItems,
                            updatedAt: new Date()
                        }
                    }, function (err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');
                        }
                    });

                } else {
                    CloudPreference.insert({
                        userid: clientID,
                        username: clientUsername,
                        useremail: clientEmail,
                        PrefGroup: 'salesform',
                        PrefName: 'tblappointmentlist',
                        published: true,
                        customFields: lineItems,
                        createdAt: new Date()
                    }, function (err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');

                        }
                    });

                }
            }
        }
        $('#myModal2').modal('toggle');
    },
    'blur .divcolumn': function (event) {
        let columData = $(event.target).text();
        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
        var datable = $('#tblappointmentlist').DataTable();
        var title = datable.column(columnDatanIndex).header();
        $(title).html(columData);

    },
    'change .rngRange': function (event) {
        let range = $(event.target).val();
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblappointmentlist th');
        $.each(datable, function (i, v) {
            if (v.innerText == columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css('width', range + 'px');

            }
        });

    },
    'click .btnOpenSettings': function (event) {
        let templateObject = Template.instance();
        var columns = $('#tblappointmentlist th');
        const tableHeaderList = [];
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function (i, v) {
            if (v.hidden == false) {
                columVisible = true;
            }
            if ((v.className.includes("hiddenColumn"))) {
                columVisible = false;
            }
            sWidth = v.style.width.replace('px', "");

            let datatablerecordObj = {
                sTitle: v.innerText || '',
                sWidth: sWidth || '',
                sIndex: v.cellIndex || 0,
                sVisible: columVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });

        templateObject.tableheaderrecords.set(tableHeaderList);
    },
    'click #exportbtn': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblappointmentlist_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    'click .printConfirm': function (event) {
        playPrintAudio();
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblappointmentlist_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display', 'none');
    },
    'click #check-all': function (event) {
        if ($(event.target).is(':checked')) {
            $(".chkBox").prop("checked", true);
        } else {
            $(".chkBox").prop("checked", false);
        }
    },
    'click .chkBox': async function () {
        var listData = $(this).closest('tr').attr('id');
        let appointmentService = new AppointmentService();
        var selectedClient = $(this.target).closest("tr").find(".colAccountName").text();
        const templateObject = Template.instance();
        let selectAppointment = templateObject.datatablerecords.get() || '';
        const selectedAppointmentList = [];
        const selectedAppointmentCheck = [];


        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if ((currentBeginDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
            fromDateMonth = (currentBeginDate.getMonth() + 1);
        }

        if (currentBeginDate.getDate() < 10) {
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        let ids = [];
        let JsonIn = {};
        let JsonIn1 = {};
        let myStringJSON = '';
        let objectAppData = "";
        let updateAppointment = false;
        // $('.chkBox:checkbox:checked').each(async function() {
        //     var chkIdLine = $(this).closest('tr').attr('id');
        //     if (selectAppointment.length > 0) {
        //         let checkAppointStartEnd = selectAppointment.filter((item) =>
        //             parseInt(item.id) == parseInt(chkIdLine)
        //         );
        //         let actuatlStartTime0 = checkAppointStartEnd[0].actual_starttime;
        //         let actuatlStartTime = actuatlStartTime0 == "" ? '' : actuatlStartTime0.split(' ')[0];
        //         let actuatlStartTimeSplit = actuatlStartTime.split('-')[0] || '';
        //         let actuatlEndTime0 = checkAppointStartEnd[0].actual_endtime;
        //         let actuatlEndTime = actuatlEndTime0 == "" ? '' : actuatlEndTime0.split(' ')[0];
        //         let actuatlEndTimeSplit = actuatlEndTime.split('-')[0] || '';

        //         if ((actuatlStartTimeSplit == '1899' || actuatlStartTimeSplit == '')) {
        //             swal({
        //                 title: 'Actual Time is not filled in',
        //                 text: "Can we populate it with the Booked Time? (Your Appointment will be stopped and completed if you proceed)",
        //                 type: 'warning',
        //                 showCancelButton: true,
        //                 confirmButtonText: 'Proceed',
        //                 cancelButtonText: 'Cancel'
        //             }).then((result) => {
        //                 if (result.value) {
        //                     objectAppData = {
        //                         type: "TAppointmentEx",
        //                         fields: {
        //                             Id: parseInt(chkIdLine),
        //                             Actual_StartTime: checkAppointStartEnd[0].booked_starttime,
        //                             Actual_EndTime: checkAppointStartEnd[0].booked_endtime,
        //                         }
        //                     };

        //                     appointmentService.saveAppointment(objectAppData).then(async function(data) {
        //                         updateAppointment = true;
        //                         sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function(dataUpdate) {
        //                             addVS1Data('TAppointment', JSON.stringify(dataUpdate));
        //                         }).catch(function(err) {

        //                         });

        //                         sideBarService.getTAppointmentListData(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function(dataApp) {
        //                             addVS1Data('TAppointmentList', JSON.stringify(dataApp));
        //                         }).catch(function(err) {

        //                         });

        //                     }).catch(function(err) {

        //                     });
        //                     updateAppointment = true;
        //                 } else {
        //                     $('#f-' + chkIdLine).prop("checked", false);
        //                     updateAppointment = false;
        //                 }
        //             });
        //         } else if ((actuatlEndTimeSplit == '1899' || actuatlEndTimeSplit == '')) {
        //             swal({
        //                 title: 'Actual Time is not filled in',
        //                 text: "Can we populate it with the Booked Time? (Your Appointment will be stopped and completed if you proceed)",
        //                 type: 'warning',
        //                 showCancelButton: true,
        //                 confirmButtonText: 'Proceed',
        //                 cancelButtonText: 'Cancel'
        //             }).then((result) => {
        //                 if (result.value) {
        //                     objectAppData = {
        //                         type: "TAppointmentEx",
        //                         fields: {
        //                             Id: parseInt(chkIdLine),
        //                             // Actual_StartTime: checkAppointStartEnd[0].booked_starttime,
        //                             Actual_EndTime: checkAppointStartEnd[0].booked_endtime,
        //                         }
        //                     };
        //                     appointmentService.saveAppointment(objectAppData).then(async function(data) {
        //                         updateAppointment = true;
        //                         sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function(dataUpdate) {
        //                             addVS1Data('TAppointment', JSON.stringify(dataUpdate));
        //                         }).catch(function(err) {

        //                         });

        //                         sideBarService.getTAppointmentListData(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function(dataApp) {
        //                             addVS1Data('TAppointmentList', JSON.stringify(dataApp));
        //                         }).catch(function(err) {

        //                         });

        //                     }).catch(function(err) {

        //                     });
        //                     updateAppointment = true;
        //                 } else {
        //                     $('#f-' + chkIdLine).prop("checked", false);
        //                     updateAppointment = false;
        //                 }
        //             });
        //         } else {
        //             updateAppointment = false;
        //         }


        //     };
        //     //let checkDataSelect = await updateAppointment;
        //     //  if(checkDataSelect){
        //     let obj = {
        //         AppointID: parseInt(chkIdLine)
        //     };

        //     selectedAppointmentList.push(obj);

        //     templateObject.selectedAppointmentID.set(chkIdLine);
        //     //};
        //     // selectedAppointmentCheck.push(JsonIn1);
        //     // }
        // });
        JsonIn = {
            Name: "VS1_InvoiceAppt",
            Params: {
                AppointIDs: selectedAppointmentList
            }
        };

        templateObject.selectedAppointment.set(JsonIn);
    },
    'click #btnInvoice': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        const templateObject = Template.instance();
        let selectClient = templateObject.selectedAppointment.get();
        let selectAppointmentID = templateObject.selectedAppointmentID.get();
        if (selectClient.length === 0) {
            swal('Please select Appointment to generate invoice for!', '', 'info');
            $('.fullScreenSpin').css('display', 'none');
        } else {
            let appointmentService = new AppointmentService();
            var erpGet = erpDb();
            var oPost = new XMLHttpRequest();
            oPost.open("POST", URLRequest + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + 'erpapi/VS1_Cloud_Task/Method?Name="VS1_InvoiceAppt"', true);
            oPost.setRequestHeader("database", erpGet.ERPDatabase);
            oPost.setRequestHeader("username", erpGet.ERPUsername);
            oPost.setRequestHeader("password", erpGet.ERPPassword);
            oPost.setRequestHeader("Accept", "application/json");
            oPost.setRequestHeader("Accept", "application/html");
            oPost.setRequestHeader("Content-type", "application/json");
            // let objDataSave = '"JsonIn"' + ':' + JSON.stringify(selectClient);
            oPost.send(JSON.stringify(selectClient));

            oPost.onreadystatechange = function () {
                if (oPost.readyState == 4 && oPost.status == 200) {
                    $('.fullScreenSpin').css('display', 'none');
                    var myArrResponse = JSON.parse(oPost.responseText);
                    if (myArrResponse.ProcessLog.ResponseStatus.includes("OK")) {
                        localStorage.setItem("convertAppointmentID", selectAppointmentID);
                        let objectDataConverted = {
                            type: "TAppointmentEx",
                            fields: {
                                Id: parseInt(selectAppointmentID),
                                Status: "Converted"
                            }
                        };
                        appointmentService.saveAppointment(objectDataConverted).then(function (data) {
                            FlowRouter.go('/invoicelist?success=true&apptId=' + parseInt(selectAppointmentID));
                        }).catch(function (err) {
                            $('.fullScreenSpin').css('display', 'none');
                        });

                        templateObject.getAllAppointmentDataOnConvert();



                    } else {
                        swal({
                            title: 'Oooops...',
                            text: myArrResponse.ProcessLog.ResponseStatus,
                            type: 'warning',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {

                            } else if (result.dismiss === 'cancel') {

                            }
                        });
                    }

                } else if (oPost.readyState == 4 && oPost.status == 403) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: oPost.getResponseHeader('errormessage'),
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) { } else if (result.dismiss === 'cancel') {

                        }
                    });
                } else if (oPost.readyState == 4 && oPost.status == 406) {
                    $('.fullScreenSpin').css('display', 'none');
                    var ErrorResponse = oPost.getResponseHeader('errormessage');
                    var segError = ErrorResponse.split(':');

                    if ((segError[1]) == ' "Unable to lock object') {

                        swal({
                            title: 'Oooops...',
                            text: oPost.getResponseHeader('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) { } else if (result.dismiss === 'cancel') {

                            }
                        });
                    } else {
                        swal({
                            title: 'Oooops...',
                            text: oPost.getResponseHeader('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) { } else if (result.dismiss === 'cancel') {

                            }
                        });
                    }

                } else if (oPost.readyState == '') {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: oPost.getResponseHeader('errormessage'),
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) { } else if (result.dismiss === 'cancel') {

                        }
                    });
                }

            }
            // appointmentService.appointmentCreateInv(selectClient).then(function (data) {
            //   //FlowRouter.go('/appointmentlist');
            //   //window.open('/appointments', '_self');
            // }).catch(function (err) {
            //   $('.fullScreenSpin').css('display', 'none');
            // });
        }

    },
    'click #btnInvoiceDisabled': function () {
        swal({
            title: 'Oops...',
            text: "You don't have access to create Invoice",
            type: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK'
        }).then((result) => {
            if (result.value) { } else if (result.dismiss === 'cancel') { }
        });
    }

});

Template.appointmentlist.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.appointmentdate == 'NA') {
                return 1;
            } else if (b.appointmentdate == 'NA') {
                return -1;
            }
            return (a.appointmentdate.toUpperCase() > b.appointmentdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    clientrecords: () => {
        return Template.instance().clientrecords.get();
    },
    productsrecord: () => {
        return Template.instance().productsrecord.get().sort(function (a, b) {
            if (a.productname == 'NA') {
                return 1;
            } else if (b.productname == 'NA') {
                return -1;
            }
            return (a.productname.toUpperCase() > b.productname.toUpperCase()) ? 1 : -1;
        });
    },
    purchasesCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: Session.get('mycloudLogonID'), PrefName: 'tblappointmentlist' });
    },
    includeCreateInvoice: () => {
        let isSales = Session.get('CloudSalesModule') || false;
        let checkCreateInvoice = false;
        if (isSales) {
            checkCreateInvoice = true;
        }
        return checkCreateInvoice;
    },
    createnewappointment: () => {
        return Session.get('CloudAppointmentCreateAppointment') || false;
    },
    extraProductFees: () => {
        return Template.instance().extraProductFees.get();
    },
});