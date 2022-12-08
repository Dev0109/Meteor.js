import {ContactService} from "../contacts/contact-service";
import {ReactiveVar} from "meteor/reactive-var";
import {CoreService} from "../js/core-service";
import {UtilityService} from "../utility-service";
import {ProductService} from "../product/product-service";
import XLSX from "xlsx";
import {SideBarService} from "../js/sidebar-service";
import "jquery-editable-select";
import draggableCharts from "../js/Charts/draggableCharts";
import resizableCharts from "../js/Charts/resizableCharts";
import Tvs1ChartDashboardPreference from "../js/Api/Model/Tvs1ChartDashboardPreference";
import ChartsApi from "../js/Api/ChartsApi";
import Tvs1chart from "../js/Api/Model/Tvs1Chart";
import ChartsEditor from "../js/Charts/ChartsEditor";
import Tvs1ChartDashboardPreferenceField from "../js/Api/Model/Tvs1ChartDashboardPreferenceField";
import ApiService from "../js/Api/Module/ApiService";
import LoadingOverlay from "../LoadingOverlay";
import PayRun from "../js/Api/Model/PayRun";
import CachedHttp from "../lib/global/CachedHttp";
import erpObject from "../lib/global/erp-objects";
import {EmployeeFields} from "../js/Api/Model/Employee";
import {map} from "jquery";
import GlobalFunctions from "../GlobalFunctions";
import moment from "moment";
import Datehandler from "../DateHandler";
import EmployeePayrollApi from "../js/Api/EmployeePayrollApi";
import LeaveRequest from "../js/Api/Model/LeaveRequest";
import LeaveRequestFields from "../js/Api/Model/LeaveRequestFields";
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
const contactService = new ContactService();

Template.payrollleave.onCreated(function () {
  this.leaveRequests = new ReactiveVar([]);
  this.leaveRequestFiltered = new ReactiveVar([]);
  this.employees = new ReactiveVar([]);

  this.leaveTypes = new ReactiveVar([]);
});

function MakeNegative() {}

Template.payrollleave.onRendered(function () {
  this.loadLeaves = async (refresh = false) => {
    const employees = await this.employees.get();
    let data = await CachedHttp.get("TLeavRequest", async () => {
      const employeePayrolApis = new EmployeePayrollApi();
      // now we have to make the post request to save the data in database
      const employeePayrolEndpoint = employeePayrolApis.collection.findByName(employeePayrolApis.collectionNames.TLeavRequest);

      employeePayrolEndpoint.url.searchParams.append("ListType", "'Detail'");
      const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed

      if (employeePayrolEndpointResponse.ok == true) {
        const employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
        return employeePayrolEndpointJsonResponse;
      }
      return null;
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      forceOverride: refresh,
      validate: cachedResponse => {
        return true;
      }
    });

    const response = data.response;
    const leaves = response.tleavrequest.map(e => {
      return {
        ...e.fields,
        Employee: employees.find(employee => (
          employee.ID != undefined
          ? employee.ID
          : employee.Id) == e.fields.EmployeeID),
        isApproved: e.fields.Status == "Approved"
      };
    });

    this.leaveRequests.set(leaves);
  };

  this.loadLeavesHistory = async (refreshTable = false) => {
    const leaves = await this.leaveRequests.get();
    const currentDate = moment();

    let allPassedLeaves = leaves.filter(leave => moment(leave.StartDate).isBefore(currentDate));
    await this.leaveRequestFiltered.set(allPassedLeaves);
    if (refreshTable) {
      this.dataTableSetup(refreshTable);
    }
  };

  this.loadLeavesToReview = async (refreshTable = false) => {
    const leaves = this.leaveRequests.get();
    const currentDate = moment();

    let allFutureLeaves = leaves.filter(leave => moment(leave.StartDate).isAfter(currentDate));
    let toReview = allFutureLeaves.filter(leave => leave.Status != "Approved");
    await this.leaveRequestFiltered.set(toReview);
    if (refreshTable) {
      this.dataTableSetup(refreshTable);
    }
  };

  this.loadUpComingLeaves = async (refreshTable = false) => {
    const leaves = await this.leaveRequests.get();
    const currentDate = moment();

    let allFutureLeaves = leaves.filter(leave => moment(leave.StartDate).isAfter(currentDate));
    let upComingLeaves = allFutureLeaves; // allFutureLeaves.filter(leave => leave.Status == "Approved");
    await this.leaveRequestFiltered.set(upComingLeaves);

    if (refreshTable) {
      this.dataTableSetup(refreshTable);
    }
  };

  this.loadDefaultScreen = async (refresh = false) => {
    await this.loadLeavesToReview(refresh);
  };

  this.loadEmployees = async (refresh = false) => {
    await this.employees.set([]);
    let data = await CachedHttp.get(erpObject.TEmployee, async () => {
      return await contactService.getAllEmployees();
    }, {
      useIndexDb: true,
      fallBackToLocal: true,
      useLocalStorage: false,
      forceOverride: refresh,
      validate: cachedResponse => {
        return true;
      }
    });
    data = data.response;

    let employees = data.temployee[0].fields != undefined
      ? data.temployee.map(e => e.fields)
      : data.temployee;

    await this.employees.set(employees);
  };

  this.dataTableSetup = (destroy = false) => {
    if (destroy) {
      $("#tblPayleaveToReview").DataTable().destroy();
    }

    // $('#tblPayleaveToReview').DataTable();
    setTimeout(() => {
      $("#tblPayleaveToReview").DataTable({
        sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        buttons: [
          {
            extend: "csvHtml5",
            text: "",
            download: "open",
            className: "btntabletocsv hiddenColumn",
            filename: "joboverview_" + moment().format(),
            orientation: "portrait",
            exportOptions: {
              columns: ":visible"
            }
          }, {
            extend: "print",
            download: "open",
            className: "btntabletopdf hiddenColumn",
            text: "",
            title: "Customer List",
            filename: "Job List - " + moment().format(),
            exportOptions: {
              columns: ":visible",
              stripHtml: false
            }
          }, {
            extend: "excelHtml5",
            title: "",
            download: "open",
            className: "btntabletoexcel hiddenColumn",
            filename: "Job List - " + moment().format(),
            orientation: "portrait",
            exportOptions: {
              columns: ":visible"
            }
          }
        ],
        select: true,
        destroy: true,
        colReorder: true,
        // bStateSave: true,
        // rowId: 0,
        pageLength: initialDatatableLoad,
        lengthMenu: [
          [
            initialDatatableLoad, -1
          ],
          [
            initialDatatableLoad, "All"
          ]
        ],
        info: true,
        responsive: true,
        order: [
          [0, "asc"]
        ],
        action: function () {
          $("#tblJoblist").DataTable().ajax.reload();
        },
        fnDrawCallback: function (oSettings) {
          // setTimeout(function () {
          //   MakeNegative();
          // }, 100);
        },
        language: {
          search: "",
          searchPlaceholder: "Search List..."
        },
        fnInitComplete: function () {
          $("<button class='btn btn-primary btnRefreshJobs' type='button' id='btnRefreshJobs' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblJoblist_filter");
        }
      });
    }, 100);

    setTimeout(function () {
      $("#tblAssignLeaveTypes").DataTable({
        //data: splashArrayAssignLeaveList,
        sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        // columnDefs: [

        //     {
        //         className: "colALType colALTypeID hiddenColumn",
        //         "targets": [0]
        //     },
        //     {
        //         className: "colALType colALTypeLeave",
        //         "targets": [1]
        //     },
        //     {
        //         className: "colALType colALTypeLeaveCalMethod",
        //         "targets": [2]
        //     },
        //     {
        //         className: "colALType colALTypeHoursAccruedAnnually",
        //         "targets": [3]
        //     },
        //     {
        //         className: "colALType colALTypeHoursAccruedAnnuallyFullTimeEmp",
        //         "targets": [4]
        //     },
        //     {
        //         className: "colALType colALTypeHoursFullTimeEmpFortnightlyPay",
        //         "targets": [5]
        //     },
        //     {
        //         className: "colALType colALTypeHours",
        //         "targets": [6]
        //     },
        //     {
        //         className: "colALType colALTypeOpeningBalance",
        //         "targets": [7]
        //     },
        //     {
        //         className: "colALType colALTypeTerminationBalance",
        //         "targets": [8]
        //     }
        //     ,
        //     {
        //         className: "colALTypeActions",
        //         "targets": [9]
        //     }
        // ],
        select: true,
        destroy: true,
        colReorder: true,
        pageLength: initialDatatableLoad,
        lengthMenu: [
          [
            initialDatatableLoad, -1
          ],
          [
            initialDatatableLoad, "All"
          ]
        ],
        info: true,
        responsive: true,
        order: [
          [0, "asc"]
        ],
        action: function () {
          $("#tblAssignLeaveTypes").DataTable().ajax.reload();
        },
        fnDrawCallback: function (oSettings) {
          $(".paginate_button.page-item").removeClass("disabled");
          $("#tblAssignLeaveTypes_ellipsis").addClass("disabled");
          if (oSettings._iDisplayLength == -1) {
            if (oSettings.fnRecordsDisplay() > 150) {}
          } else {}
          if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
            $(".paginate_button.page-item.next").addClass("disabled");
          }

          $(".paginate_button.next:not(.disabled)", this.api().table().container()).on("click", function () {
            LoadingOverlay.show();

            var splashArrayAssignLeaveListDupp = new Array();
            let dataLenght = oSettings._iDisplayLength;
            let customerSearch = $("#tblAssignLeaveTypes_filter input").val();

            sideBarService.getAssignLeaveType(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (useData) {
              for (let i = 0; i < useData.length; i++) {
                let dataListAllowance = [
                  useData[i].fields.ID || "",
                  useData[i].fields.LeaveType || "",
                  useData[i].fields.LeaveCalcMethod || "",
                  useData[i].fields.HoursAccruedAnnually || "",
                  useData[i].fields.HoursAccruedAnnuallyFullTimeEmp || "",
                  useData[i].fields.HoursFullTimeEmpFortnightlyPay || "",
                  useData[i].fields.HoursLeave || "",
                  useData[i].fields.OpeningBalance || "",
                  useData[i].fields.OnTerminationUnusedBalance
                    ? "Paid Out"
                    : "Not Paid Out",
                  `<button type="button" style="margin-bottom: 24px;" class="btn btn-danger btn-rounded btn-sm btnDeleteAssignLeaveType" id="btnDeleteAssignLeaveType" data-id="` + useData[i].fields.ID + `"><i class="fa fa-remove"></i></button>`
                ];
                splashArrayAssignLeaveList.push(dataListAllowance);
              }

              let uniqueChars = [...new Set(splashArrayAssignLeaveList)];
              var datatable = $("#tblAssignLeaveTypes").DataTable();
              datatable.clear();
              datatable.rows.add(uniqueChars);
              datatable.draw(false);
              setTimeout(function () {
                $("#tblAssignLeaveTypes").dataTable().fnPageChange("last");
              }, 400);

              $(".fullScreenSpin").css("display", "none");
            }).catch(function (err) {
              $(".fullScreenSpin").css("display", "none");
            });
          });
          setTimeout(function () {
            MakeNegative();
          }, 100);
        },
        fnInitComplete: function () {
          $("<button class='btn btn-primary btnAssignLeaveType' data-dismiss='modal' data-toggle='modal' data-target='#assignLeaveTypeModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblAssignLeaveTypes_filter");
          $("<button class='btn btn-primary btnRefreshAssignLeave' type='button' id='btnRefreshAssignLeave' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblAssignLeaveTypes_filter");
        }
      }).on("page", function () {
        setTimeout(function () {
          MakeNegative();
        }, 100);
      }).on("column-reorder", function () {}).on("length.dt", function (e, settings, len) {
        //LoadingOverlay.show();

        let dataLenght = settings._iDisplayLength;
        splashArrayAssignLeaveList = [];
        if (dataLenght == -1) {
          $(".fullScreenSpin").css("display", "none");
        } else {
          if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
            $(".fullScreenSpin").css("display", "none");
          } else {
            sideBarService.getAssignLeaveType(dataLenght, 0).then(function (dataNonBo) {
              addVS1Data("TAssignLeaveType", JSON.stringify(dataNonBo)).then(function (datareturn) {
                // templateObject.resetData(dataNonBo);
                $(".fullScreenSpin").css("display", "none");
              }).catch(function (err) {
                $(".fullScreenSpin").css("display", "none");
              });
            }).catch(function (err) {
              $(".fullScreenSpin").css("display", "none");
            });
          }
        }
        setTimeout(function () {
          MakeNegative();
        }, 100);
      });
    }, 100);
  };

  this.pasteLeaveToModal = async leaveId => {
    if (!leaveId) 
      leaveId = $("#newLeaveRequestModal #btnSaveLeaveRequest").attr("leave-id");
    if (leaveId) {
      const selectedLeave = this.leaveRequests.get().find(leave => leave.ID == leaveId);
      $("#newLeaveRequestModal").find("#edtLeaveDescription").val(selectedLeave.Description);
      $("#newLeaveRequestModal").find("#edtLeaveTypeofRequest").val(selectedLeave.LeaveMethod);
      $("#newLeaveRequestModal").find("#edtLeaveStartDate").val(moment(selectedLeave.StartDate).format("DD/MM/YYYY"));
      $("#newLeaveRequestModal").find("#edtLeaveEndDate").val(moment(selectedLeave.EndDate).format("DD/MM/YYYY"));
      $("#newLeaveRequestModal").find("#edtLeavePayPeriod").val(selectedLeave.PayPeriod);
      $("#newLeaveRequestModal").find("#edtLeaveHours").val(selectedLeave.Hours);
      $("#newLeaveRequestModal").find("#edtLeavePayStatus").val(selectedLeave.Status);

      $("#newLeaveRequestModal").find("#btnSaveLeaveRequest").attr("edit-mode", true);
      $("#newLeaveRequestModal").find("#btnSaveLeaveRequest").attr("leave-id", leaveId);

      $("#newLeaveRequestModal").find(".modal-title.new-leave-title").addClass("hide");
      $("#newLeaveRequestModal").find(".modal-title.edit-leave-title").removeClass("hide");
    }
  };

  this.saveLeave = async (leaveId = null) => {
    if (!leaveId) 
      return;
    LoadingOverlay.show();

    const selectedLeave = this.leaveRequests.get().find(leave => leave.ID == leaveId);

    let ID = selectedLeave.ID;
    let TypeofRequest = $("#edtLeaveTypeofRequestID").val();
    let Leave = $("#edtLeaveTypeofRequest").val();
    let Description = $("#edtLeaveDescription").val();
    let StartDate = $("#edtLeaveStartDate").val();
    let EndDate = $("#edtLeaveEndDate").val();
    let PayPeriod = $("#edtLeavePayPeriod").val();
    let Hours = $("#edtLeaveHours").val();
    let Status = $("#edtLeavePayStatus").val();

    const employeePayrolApis = new EmployeePayrollApi();
    // now we have to make the post request to save the data in database
    const apiEndpoint = employeePayrolApis.collection.findByName(employeePayrolApis.collectionNames.TLeavRequest);

    if (isNaN(TypeofRequest)) {
      handleValidationError("Request type must be a number!", "edtLeaveTypeofRequestID");
      return false;
    } else if (Description == "") {
      handleValidationError("Please enter Leave Description!", "edtLeaveDescription");
      return false;
    } else if (PayPeriod == "") {
      handleValidationError("Please enter Pay Period!", "edtLeavePayPeriod");
      return false;
    } else if (Hours == "") {
      handleValidationError("Please enter Hours!", "edtLeaveHours");
      return false;
    } else if (isNaN(Hours)) {
      handleValidationError("Hours must be a Number!", "edtLeaveHours");
      return false;
    } else if (Status == "") {
      handleValidationError("HPlease select Status!", "edtLeavePayStatus");
      return false;
    } else {
      $(".fullScreenSpin").css("display", "block");

      let dbStartDate = moment(StartDate, "DD/MM/YYYY").format("YYYY-MM-DD HH:mm:ss");
      let dbEndDate = moment(EndDate, "DD/MM/YYYY").format("YYYY-MM-DD HH:mm:ss");
      // leaveRequests.push(
      let leaveRequestSettings = new LeaveRequest({
        type: "TLeavRequest",
        fields: new LeaveRequestFields({
          ID: parseInt(ID),
          EmployeeID: parseInt(selectedLeave.Employee.ID != undefined ? selectedLeave.Employee.ID : selectedLeave.Employee.Id),
          TypeOfRequest: parseInt(TypeofRequest),
          LeaveMethod: Leave,
          Description: Description,
          StartDate: dbStartDate,
          EndDate: dbEndDate,
          PayPeriod: PayPeriod,
          Hours: parseInt(Hours),
          Status: Status
        })
      });
      // );

      const ApiResponse = await apiEndpoint.fetch(null, {
        method: "POST",
        headers: ApiService.getPostHeaders(),
        body: JSON.stringify(leaveRequestSettings)
      });

      try {
        if (ApiResponse.ok == true) {
          const jsonResponse = await ApiResponse.json();
          $("#newLeaveRequestModal").modal("hide");
          $("#edtLeaveTypeofRequestID, #edtLeaveTypeofRequest, #edtLeaveDescription, #edtLeavePayPeriod, #edtLeaveHours, #edtLeavePayStatus").val("");
          LoadingOverlay.hide(0);
          const result = await swal({title: "Leave request added successfully", text: "", type: "success", showCancelButton: false, confirmButtonText: "OK"});

          if(result.value) {
            await this.initPage(true);

          }

        } else {
          LoadingOverlay.hide(0);
          swal({title: "Oooops...", text: ApiResponse.headers.get("errormessage"), type: "error", showCancelButton: false, confirmButtonText: "Try Again"}).then(result => {
            if (result.value) {}
          });
        }
      } catch (error) {
        LoadingOverlay.hide(0);
        swal({title: "Oooops...", text: error, type: "error", showCancelButton: false, confirmButtonText: "Try Again"}).then(result => {
          if (result.value) {}
        });
      }
    }
  };

  this.approveLeave = async leaveId => {
    if (!leaveId) 
      return;
    LoadingOverlay.show();

    const selectedLeave = this.leaveRequests.get().find(leave => leave.ID == leaveId);

    const finalLeave = new LeaveRequest({
      type: "TLeavRequest",
      fields: new LeaveRequestFields({
        ID: parseInt(selectedLeave.ID),
        EmployeeID:parseInt(selectedLeave.Employee.ID != undefined ? selectedLeave.Employee.ID : selectedLeave.Employee.Id),
        TypeOfRequest: parseInt(selectedLeave.TypeofRequest),
        LeaveMethod: selectedLeave.LeaveMethod,
        Description: selectedLeave.Description,
        StartDate: selectedLeave.StartDate,
        EndDate: selectedLeave.EndDate,
        PayPeriod: selectedLeave.PayPeriod,
        Hours: parseInt(selectedLeave.Hours),
        Status: "Approved"
      })
    });

    const payrollApi = new EmployeePayrollApi();
    const ApiEndpoint = payrollApi.collection.findByName(payrollApi.collectionNames.TLeavRequest);

    try {
      const response = await ApiEndpoint.fetch(null, {
        method: "POST",
        headers: ApiService.getPostHeaders(),
        body: JSON.stringify(finalLeave)
      });
      if (response.ok) {
        LoadingOverlay.hide(0);
        const result = await swal({
          title: "Approved successfully",
          // text: e,
          type: "success",
          showCancelButton: false,
          confirmButtonText: "OK"
        });

        if (result.value) {
          await this.initPage(true);
        } else if (result.dismiss === "cancel") {}
      } else {
        throw response.status;
      }
    } catch (e) {
      LoadingOverlay.hide(0);
      const result = await swal({
        title: "Couldn't approve",
        text: e,
        type: "error",
        showCancelButton: true,
        confirmButtonText: "Retry",
        cancelButtonText: "Abort"
      });

      if (result.value) {
        await this.approveLeave(leaveId);
      } else if (result.dismiss === "cancel") {}
    }

    LoadingOverlay.hide();
  };

  this.rejectLeave = async leaveId => {
    if (!leaveId) 
      return;
    LoadingOverlay.show();

    const selectedLeave = this.leaveRequests.get().find(leave => leave.ID == leaveId);

    const finalLeave = new LeaveRequest({
      type: "TLeavRequest",
      fields: new LeaveRequestFields({
        ID: parseInt(selectedLeave.ID),
        EmployeeID: parseInt(selectedLeave.Employee.ID != undefined ? selectedLeave.Employee.ID : selectedLeave.Employee.Id),
        TypeOfRequest: parseInt(selectedLeave.TypeofRequest),
        LeaveMethod: selectedLeave.LeaveMethod,
        Description: selectedLeave.Description,
        StartDate: selectedLeave.StartDate,
        EndDate: selectedLeave.EndDate,
        PayPeriod: selectedLeave.PayPeriod,
        Hours: parseInt(selectedLeave.Hours),
        Status: "Denied"
      })
    });

    const payrollApi = new EmployeePayrollApi();
    const ApiEndpoint = payrollApi.collection.findByName(payrollApi.collectionNames.TLeavRequest);

    try {
      const response = await ApiEndpoint.fetch(null, {
        method: "POST",
        headers: ApiService.getPostHeaders(),
        body: JSON.stringify(finalLeave)
      });
      if (response.ok) {
        LoadingOverlay.hide(0);
        const result = await swal({
          title: "Rejected successfully",
          // text: e,
          type: "success",
          showCancelButton: false,
          confirmButtonText: "OK"
        });

        if (result.value) {
          await this.initPage(true);
        } else if (result.dismiss === "cancel") {}
      } else {
        throw response.status;
      }
    } catch (e) {
      LoadingOverlay.hide(0);
      const result = await swal({
        title: "Couldn't reject",
        text: e,
        type: "error",
        showCancelButton: true,
        confirmButtonText: "Retry",
        cancelButtonText: "Abort"
      });

      if (result.value) {
        this.rejectLeave(leaveId);
      } else if (result.dismiss === "cancel") {}
    }

    LoadingOverlay.hide();
  };

  this.loadLeaveTypes = async (refresh = false) => {
    await this.leaveTypes.set([]);

    let cachedRequest = await CachedHttp.get(erpObject.TAssignLeaveType, async () => {
      const employeePayrolApis = new EmployeePayrollApi();
      // now we have to make the post request to save the data in database

      let employeePayrolEndpoint = employeePayrolApis.collection.findByName(employeePayrolApis.collectionNames.TAssignLeaveType);
      employeePayrolEndpoint.url.searchParams.append("ListType", "'Detail'");
      const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed
      if (employeePayrolEndpointResponse.ok == true) {
        const employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();

        return employeePayrolEndpointJsonResponse;
      }
      return null;
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      forceOverride: refresh,
      validate: cachedResponse => {
        return true;
      }
    });
    let response = cachedRequest.response;
    let leaveTypes = response.tassignleavetype.map(l => l.fields);

     await this.leaveTypes.set(leaveTypes);
  };

  this.initPage = async (refresh = false) => {
    LoadingOverlay.show();

    await this.loadEmployees(refresh);
    await this.loadLeaveTypes(refresh);
    await this.loadLeaves(refresh);
    await this.loadDefaultScreen(refresh);

    this.dataTableSetup(refresh);

    if(!refresh) Datehandler.defaultDatePicker();
    LoadingOverlay.hide();
  };

  this.initPage();
});

Template.payrollleave.events({
  "click #upcomingBtn": (e, ui) => {
    ui.loadUpComingLeaves(true);
  },
  "click #historyBtn": (e, ui) => {
    ui.loadLeavesHistory(true);
  },
  "click #toReviewBtn": (e, ui) => {
    ui.loadLeavesToReview(true);
  },
  "click #tblPayleaveToReview tbody tr": (e, ui) => {
    if ($(e.target).closest("td").hasClass("clickable")) {
      ui.pasteLeaveToModal($(e.currentTarget).attr("leave-id"));
      $("#newLeaveRequestModal").modal("show");
      // $('#newLeaveRequestModal').find('.modal-title.new-leave-title').addClass('hide');
      // $('#newLeaveRequestModal').find('.modal-title.edit-leave-title').removeClass('hide');
    }
  },
  "click .editLeave": (e, ui) => {
    const id = $(e.currentTarget).attr("leave-id");
    ui.pasteLeaveToModal(id);
  },
  // in the modal
  "click #newLeaveRequestModal #btnSaveLeaveRequest": (e, ui) => {
    const id = $(e.currentTarget).attr("leave-id");
    ui.saveLeave(id);
    // the revert the modal into new leave modal
    // will cancel Edit mode
    $("#newLeaveRequestModal").find(".modal-title.new-leave-title").removeClass("hide");
    $("#newLeaveRequestModal").find(".modal-title.edit-leave-title").addClass("hide");
    $("#newLeaveRequestModal").find("#btnSaveLeaveRequest").removeAttr("leave-id");
  },
  "click #newLeaveRequestModal .close-modal": (e, ui) => {
    // the revert the modal into new leave modal
    // will cancel Edit mode
    $("#newLeaveRequestModal").find(".modal-title.new-leave-title").removeClass("hide");
    $("#newLeaveRequestModal").find(".modal-title.edit-leave-title").addClass("hide");
    $("#newLeaveRequestModal").find("#btnSaveLeaveRequest").removeAttr("leave-id");
  },
  "click .rejectLeave": (e, ui) => {
    const id = $(e.currentTarget).attr("leave-id");
    ui.rejectLeave(id);
  },
  "click .approveLeave": (e, ui) => {
    const id = $(e.currentTarget).attr("leave-id");
    ui.approveLeave(id);
  },
  "click #tblAssignLeaveTypes tbody tr": (e, ui) => {
    const id = $(e.currentTarget).attr("leavetype-id");
    const name = $(e.currentTarget).find(".leave-type-name").text();
    $(".paste-leave-type").val(name);
    $(".paste-leave-type").attr("leave-type-id", id);
    $(".paste-leave-type").removeClass("paste-leave-type");
    $("#assignLeaveTypeSettingsModal").modal("hide");
  },
  "click #edtLeaveTypeofRequest": (e, ui) => {
    $(e.currentTarget).addClass("paste-leave-type");
  },
  "click .btnRefresh": (e, ui) => {
    ui.initPage(true);
  }
});

Template.payrollleave.helpers({
  leaveRequests: () => {
    return Template.instance().leaveRequests.get();
  },
  leaveRequestFiltered: () => {
    return Template.instance().leaveRequestFiltered.get();
  },
  formatDate: date => moment(date).format("Do MMM YYYY"),
  leaveTypes: () => Template.instance().leaveTypes.get()
});
