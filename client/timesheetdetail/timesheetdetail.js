import {ContactService} from "../contacts/contact-service";
import {ReactiveVar} from "meteor/reactive-var";
import {UtilityService} from "../utility-service";
import {SideBarService} from "../js/sidebar-service";
import "jquery-editable-select";

import LoadingOverlay from "../LoadingOverlay";

import CachedHttp from "../lib/global/CachedHttp";
import erpObject from "../lib/global/erp-objects";

import EmployeePayrollApi from "../js/Api/EmployeePayrollApi";
import moment from "moment";
import Datehandler from "../DateHandler";
import {getEarnings, getOvertimes, getRateTypes} from "../settings/payroll-settings/payrollrules";
import TableHandler from "../js/Table/TableHandler";
import PayrollSettingsOvertimes, {PayrollSettingOvertime} from "../js/Api/Model/PayrollSettingsOvertimes";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let contactService = new ContactService();

const redirectToPayRollOverview = () => {
  const id = FlowRouter.current().queryParams.tid;
  window.location.href = `/payrolloverview?tid=${id}&refresh=true`;
};

Template.timesheetdetail.onCreated(function () {
  this.timesheet = new ReactiveVar();
  this.timeSheetList = new ReactiveVar([]);
  this.employee = new ReactiveVar();
  this.earnings = new ReactiveVar([]);

  this.earningLines = new ReactiveVar([]);
  this.earningDays = new ReactiveVar([]);
  this.earningOptions = new ReactiveVar([]);

  this.weeklyTotal = new ReactiveVar(0.0);
  this.timeSheetDetails = new ReactiveVar();
  this.overtimes = new ReactiveVar([]);
  this.rateTypes = new ReactiveVar([]);
});

Template.timesheetdetail.onRendered(function () {
  const id = FlowRouter.current().queryParams.tid;

  this.loadTimeSheet = async (refresh = false) => {
    let data = await CachedHttp.get(erpObject.TTimeSheet, async () => {
      return await contactService.getAllTimeSheetList();
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      fallBackToLocal: true,
      forceOverride: refresh,
      validate: cachedResponse => {
        return true;
      }
    });
    data = data.response;

    let timesheets = data.ttimesheet.map(t => t.fields);
    timesheets.forEach((t, index) => {
      if (t.Status == "") {
        t.Status = "Draft";
      }
    });
    await this.timeSheetList.set(timesheets);

    let timesheet = timesheets.find(o => o.ID == id);

    if (timesheet) {
      this.timesheet.set(timesheet);
      this.weeklyTotal.set(timesheet.Hours);
    } else {
      LoadingOverlay.hide(0);
      const result = await swal({
        title: `Timesheet ${id} is not found`,
        //text: "Please log out to activate your changes.",
        type: "error",
        showCancelButton: false,
        confirmButtonText: "OK"
      });

      if (result.value) {
        redirectToPayRollOverview();
      } else if (result.dismiss === "cancel") {}
    }
  };

  this.loadEmployee = async (refresh = false) => {
    let timesheet = await this.timesheet.get();

    let data = await CachedHttp.get(erpObject.TEmployee, async () => {
      return await contactService.getAllEmployees();
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      fallBackToLocal: true,
      forceOverride: refresh,
      validate: cachedResponse => {
        return true;
      }
    });

    data = data.response;

    let employees = data.temployee.map(
      e => e.fields != undefined
      ? e.fields
      : e);

    try {
      const selectedEmployee = employees.find(e => e.EmployeeName == timesheet.EmployeeName);
      await this.employee.set(selectedEmployee);
    } catch (e) {
      LoadingOverlay.hide(0);
      const result = await swal({
        title: `Couldn't load the employee's details`,
        //text: "Please log out to activate your changes.",
        type: "error",
        showCancelButton: false,
        confirmButtonText: "Retry"
      });

      if (result.value) {
        this.loadEmployee(true);
      } else if (result.dismiss === "cancel") {}
    }
  };

  /**
     *
     * @param {moment.Moment} momentDate
     */
  this.loadHours = async momentDate => {
    const employee = await this.employee.get();
    let timesheets = await this.timeSheetList.get();
    timesheets = timesheets.filter(ts => ts.EmployeeName == employee.EmployeeName);
    let timesheet = timesheets.find(ts => moment(ts.TimeSheetDate).isSame(momentDate));

    const hours = timesheet != undefined
      ? timesheet.Hours
      : 0.0;
    return hours;
  };

  // this.loadClockOnOff = async (refresh = false) => {
  //   const selectedEmployee = await this.employee.get();
  // }

  /**
     * Here we load earnings of this employee
     *
     * @param {integer} employeeID
     * @returns
     */
  this.getEmployeePayRollPayTemplates = async (employeeID = null) => {
    let data = await CachedHttp.get(erpObject.TPayTemplateEarningLine, async () => {
      const employeePayrolApis = new EmployeePayrollApi();
      const employeePayrolEndpoint = employeePayrolApis.collection.findByName(employeePayrolApis.collectionNames.TPayTemplateEarningLine);
      employeePayrolEndpoint.url.searchParams.append("ListType", "'Detail'");

      const response = await employeePayrolEndpoint.fetch();
      if (response.ok == true) {
        return await response.json();
      }
      return null;
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      validate: cachedResponse => {
        return false;
      }
    });

    data = data.response.tpaytemplateearningline.map(earning => earning.fields);
    if (employeeID) {
      data = data.filter(item => parseInt(item.EmployeeID) == parseInt(employeeID));
    }

    data = _.groupBy(data, "EarningRate");

   
    this.earnings.set(data);
    return data;
  };

  /**
     * This function wil generate a list of days until the last day of the selected week
     */
  this.calculateThisWeek = async () => {
    const timesheet = await this.timesheet.get();

    const endDate = moment(timesheet.TimeSheetDate);
    const aWeekAgo = moment(timesheet.TimeSheetDate).subtract("1", "week");

    let date = moment(timesheet.TimeSheetDate).subtract("1", "week");
    let days = [];
    let i = 0;
    while (date.isBefore(endDate) == true) {
      date = aWeekAgo.add("1", "day");
      days.push({
        index: i,
        dayIndex: date.day(),
        dateObject: date.toDate(),
        date: date.format("ddd DD MMM"),
        defaultValue: await this.loadHours(date.toDate())
      });
      i++;
    }

    this.earningDays.set(days);
  };

  //  this.loadTimeSheetEntry = async () => {
  //   let data = await CachedHttp.get(erpObject.TTimeSheetEntry, async () => {
  //     return await (new ReportService()).getTimeSheetEntry();
  //   }, {
  //     useIndexDb: true,
  //     useLocalStorage: false,
  //     fallBackToLocal: true,
  //     validate: (cachedResponse) => {
  //       return true;  Shouldn't return hard codedly, but only if the data is ok
  //     }
  //   });

  //   data = data.response;

  //  }

  this.duplicateFirstLine = (isNew = false) => {
    let template = document.querySelector("#tblTimeSheetInner tbody tr.template");
    let clonedTr = template.cloneNode(true);
    clonedTr.removeAttribute("class");
    if (isNew) {
      clonedTr.querySelectorAll("input.hours").forEach(input => {
        input.value = 0;
      });
    }

    $("#tblTimeSheetInner tbody").find("tr:last").prev().after(clonedTr);
  };

  this.loadEarningSelector = async () => {
    let earnings = await getEarnings();
    earnings = earnings.map(earning => earning.fields);

    await this.earningOptions.set(earnings);

    setTimeout(() => {
      $("#tblEarnigRatesList").DataTable({
        ...TableHandler.getDefaultTableConfiguration("tblEarnigRatesList")
      });
    }, 300);
  };

  this.calculateWeeklyHours = async () => {
    const inputs = $("input.hours");
    let total = 0;

    $(inputs).each((index, input) => {
      total += parseFloat($(input).val());
    });
    return await this.weeklyTotal.set(total);
  };

  this.loadOvertimes = async (refresh = false) => {
    let overtimes = await getOvertimes(refresh);
    const rateTypes = await this.rateTypes.get();

    overtimes = overtimes.map(o => {
      if (o.searchByRuleName == false) {
        o.rateType = rateTypes.find(r => r.ID == o.rateTypeId);
      }
      return o;
    });
    await this.overtimes.set(overtimes);
  };

  this.loadRateTypes = async (refresh = false) => {
    const rates = await getRateTypes(refresh);
    await this.rateTypes.set(rates);
  };

  const buildSumOfDailyHours = (lines = []) => {
    let filteredByDay = [];
    let dailyTotals = [];

    lines.forEach(line => line.dailyHours.forEach((dailyHour, index) => {
      if (!filteredByDay[index]) {
        filteredByDay[index] = [];
      }
      filteredByDay[index].push(dailyHour);
    }));

    filteredByDay.forEach(dailyHours => {
      let total = {
        hours: 0,
        dailyHours: dailyHours
      };
      dailyHours.forEach(dailyHour => {
        total.date = dailyHour.date;
        total.hours += dailyHour.hours;
      });
      dailyTotals.push(total);
    });

    return dailyTotals;
  };

  this.buildNewObject = () => {
    // Here we will build the object to save
    const trs = $("#tblTimeSheetInner tbody").find("tr:not(.template)");

    const matchDateIndex = index => {
      let earningsDays = this.earningDays.get();
      return earningsDays.find(earningDay => earningDay.dayIndex == index);
    };

    const matchedDay = dayName => {
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thuesday",
        "Friday",
        "Saturday",
        "Sunday"
      ];

      return days.indexOf(dayName);
    };

    const buildHourObject = (input, earningsRateName) => {
      const date = matchDateIndex($(input).attr("date-index")).dateObject;
      const hours = parseFloat($(input).val());

      const overtimes = this.overtimes.get();
      const matchedOvertime = overtimes.find(o => {
        if (o.day) {
          const dayIndex = matchedDay(o.day);
          if (dayIndex == null) {
            return false;
          }
          return dayIndex == moment(date).day();
        }

        return false;
        // return o.rateType.Description == earningsRateName;
      });

      const obj = {
        date: date,
        hours: hours,
        ...(
          matchedOvertime != undefined
          ? {
            rateTypeId: matchedOvertime.rateTypeId
          }
          : {})
      };

      return obj;
    };

    const buildEarningsLines = trs => {
      let lines = [];
      $(trs).each((index, tr) => {
        lines.push(buildEarningLineObject(tr));
      });
      return lines;
    };

    const buildEarningLineObject = tr => {
      const hoursInput = $(tr).find("input.hours");
      const earningsRateName = $(tr).find("input.select-rate-js").val(); // EarningName in the input field, we should use ID

      let dailyHours = [];

      $(hoursInput).each((index, input) => {
        dailyHours.push(buildHourObject(input, earningsRateName));
      });

      return {earningRateName: earningsRateName, dailyHours: dailyHours};
    };

    return buildEarningsLines(trs);
  };

  this.generateHourlyRates = totals => {
    const overtimeRules = this.overtimes.get();

    // This will check if it is weeke end or not
    const isWeekend = total => {
      // Saturday is 5, Sunday is 6

      return [6, 0].includes(moment(total.date).day());
    };

    // WARNING: Dont touch this function unless you know what you do
    // This has been minutiously written
    const findRightOvertimeRule = total => {
      // if is weekend, get the mataching day rule
      if (isWeekend(total)) {
        return overtimeRules.filter(o => o.day == moment(total.date).format("dddd").toLowerCase());
      }
      // else going to filter by Hourly Rate types
      let inWeekRules = overtimeRules.filter(o => o.rateType.Description == "Hourly Rate");
      // once filtered, sort them by hours
      inWeekRules = inWeekRules.sort((a, b) => b.hours - a.hours);

      // here we get only the applyable rules to total.hours
      let rulesToApply = inWeekRules.filter(rule => total.hours > rule.hours);
      return rulesToApply;
    };

    const calculateEarningAmount = (earnings = [], startAmount = 0.0) => {
      earnings.forEach(earning => {
        startAmount += earning.amount;
      });
      return startAmount;
    };

    /**
         *
         * @param {*} total
         * @param {PayrollSettingsOvertimes[]} rulesToApply
         */
    const applyRules = (total, rulesToApply) => {
      // once sorted
      // while hoursCredit is > 0, apply the correct overtime rule until it finishes
      let hoursCredit = total.hours;
      let earnings = [];

      // Aproach one, using a foreach by rules
      rulesToApply.forEach(overtimeRule => {
        //if(hoursCredit > overtimeRule.hours) {
        const hoursRemaining = hoursCredit - overtimeRule.hours; // 20 - 9.5 = 10.5 of extra hours
        hoursCredit = overtimeRule.hours;

        earnings.push({
          overtime: overtimeRule, calculatedHours: hoursRemaining, // for 20 minus 9.5 i get 10.5 hours,
          amount: hoursRemaining * overtimeRule.hourlyMultiplier
        });
        //}
      });
      return earnings;
    };

    totals.forEach(total => {
      const rules = findRightOvertimeRule(total);
      const earnings = applyRules(total, rules);
      total.earnings = earnings;
      total.totalEarningAmount = calculateEarningAmount(earnings);
    });
    return totals;
  };

  this.approveTimeSheet = async () => {
    try {
      LoadingOverlay.show();
      const timesheet = await this.timesheet.get();
      const hours = await this.calculateWeeklyHours();
      const earningLines = this.buildNewObject();
      const totals = this.generateHourlyRates(buildSumOfDailyHours(earningLines));

      let objectDataConverted = {
        type: erpObject.TTimeSheet,
        fields: {
          Id: timesheet.ID,
          Status: "Approved",
          Approved: true,
          Hours: hours
        }
      };
      await contactService.saveTimeSheetUpdate(objectDataConverted);

      // We save the table data
      const objToSave = {
        timeSheetId: id,
        earningLines: earningLines,
        totals: totals
      };

      await this._saveTimeSheetDetails(objToSave);

      LoadingOverlay.hide(0);
      const result = await swal({
        title: `Timesheet ${id} has been approved`,
        //text: "Please log out to activate your changes.",
        type: "success",
        showCancelButton: false,
        confirmButtonText: "OK"
      });

      if (result.value) {
        //window.location.reload();
        redirectToPayRollOverview();
      } else if (result.dismiss === "cancel") {}
    } catch (e) {
      LoadingOverlay.hide(0);
      const result = await swal({
        title: `Timesheet ${id} couldn't be saved`,
        //text: "Please log out to activate your changes.",
        type: "error",
        showCancelButton: true,
        confirmButtonText: "Retry"
      });

      if (result.value) {
        //window.location.reload();
        await this.approveTimeSheet();
      } else if (result.dismiss === "cancel") {}
    }
  };

  this.cancelTimeSheet = async () => {
    LoadingOverlay.show();
    const timesheet = await this.timesheet.get();
    const hours = await this.calculateWeeklyHours();
    const earningLines = this.buildNewObject();
    const totals = this.generateHourlyRates(buildSumOfDailyHours(earningLines));

    let objectDataConverted = {
      type: erpObject.TTimeSheet,
      fields: {
        Id: timesheet.ID,
        Status: "Canceled",
        Approved: false,
        Hours: hours
      }
    };
    await contactService.saveTimeSheetUpdate(objectDataConverted);

    // We save the table data
    const objToSave = {
      timeSheetId: id,
      earningLines: earningLines,
      totals: totals
    };

    await this._saveTimeSheetDetails(objToSave);

    LoadingOverlay.hide(0);
    const result = await swal({
      title: `Timesheet ${id} has been canceled`,
      //text: "Please log out to activate your changes.",
      type: "success",
      showCancelButton: false,
      confirmButtonText: "OK"
    });

    if (result.value) {
      // window.location.reload();
      redirectToPayRollOverview();
    } else if (result.dismiss === "cancel") {}
  };

  this.draftTimeSheet = async () => {
    try {
      LoadingOverlay.show();
      const timesheet = await this.timesheet.get();
      const hours = await this.calculateWeeklyHours();
      const earningLines = this.buildNewObject();
      const totals = this.generateHourlyRates(buildSumOfDailyHours(earningLines));

      let objectDataConverted = {
        type: erpObject.TTimeSheet,
        fields: {
          Id: timesheet.ID,
          Status: "Draft",
          Approved: false,
          Hours: hours
        }
      };
      await contactService.saveTimeSheetUpdate(objectDataConverted);

      // We save the table data
      const objToSave = {
        timeSheetId: id,
        earningLines: earningLines,
        totals: totals
        // dailyEarnings: generateHourlyRates(total)
      };

      await this._saveTimeSheetDetails(objToSave);

      LoadingOverlay.hide(0);
      const result = await swal({
        title: `Timesheet ${id} has been drafted`,
        //text: "Please log out to activate your changes.",
        type: "success",
        showCancelButton: false,
        confirmButtonText: "OK"
      });

      if (result.value) {
        redirectToPayRollOverview();
      } else if (result.dismiss === "cancel") {}
    } catch (e) {}
  };

  this.deleteTimeSheet = async () => {
    LoadingOverlay.show();
    const timesheet = await this.timesheet.get();
    const hours = await this.calculateWeeklyHours();
    const earningLines = this.buildNewObject();
    const totals = this.generateHourlyRates(buildSumOfDailyHours(earningLines));

    let objectDataConverted = {
      type: erpObject.TTimeSheet,
      fields: {
        Id: timesheet.ID,
        Status: "Deleted",
        Approved: false,
        Active: false,
        Hours: hours
      }
    };
    await contactService.saveTimeSheetUpdate(objectDataConverted);

    // We save the table data
    const objToSave = {
      timeSheetId: id,
      earningLines: earningLines,
      totals: totals
    };

    await this._saveTimeSheetDetails(objToSave);

    LoadingOverlay.hide(0);
    const result = await swal({
      title: `Timesheet ${id} has been deleted`,
      //text: "Please log out to activate your changes.",
      type: "success",
      showCancelButton: false,
      confirmButtonText: "OK"
    });

    if (result.value) {
      redirectToPayRollOverview();
    } else if (result.dismiss === "cancel") {}
  };

  // this._buildApiObject = async () => {
  //   let obj = this.buildNewObject();
  //   return {timeSheetId: id};
  // };

  this.loadTimeSheetDetails = async () => {
    let timeSheetDetails = await this._getTimeSheetDetails(id);
    await this.timeSheetDetails.set(timeSheetDetails);
    return timeSheetDetails;
  };

  // This will contain the logs to save this timesheet
  this._saveTimeSheetDetails = async (object = {}) => {
    let res = await this._getTimeSheetDetails(object.timeSheetId);
    if (res) {
      return await this._updateTimeSheetDetails(object);
    }

    try {
      LoadingOverlay.show();
      let tableDetails = await this._getTimeSheetDetails(); // load from db
      tableDetails.push(object);
      tableDetails = JSON.stringify(tableDetails);
      await addVS1Data(erpObject.TTimeSheetDetails, tableDetails);
      LoadingOverlay.hide(0);
    } catch (e) {
      LoadingOverlay.hide(0);
      const result = await swal({title: `Timesheet details couldn't be saved`, text: e, type: "error", showCancelButton: true, confirmButtonText: "Retry"});

      if (result.value) {
        this._saveTimeSheetDetails(object);
      } else if (result.dismiss === "cancel") {}
    }
  };

  this._updateTimeSheetDetails = async (obj = {}) => {
    let details = await this._getTimeSheetDetails();
    details.forEach((detail, index) => {
      if (obj.timeSheetId == detail.timeSheetId) {
        details[index] = obj;
      }
    });
    await this._updateAllTimeSheetDetails(details);
  };

  this._updateAllTimeSheetDetails = async (details = []) => {
    try {
      await addVS1Data(erpObject.TTimeSheetDetails, JSON.stringify(details));
    } catch (e) {
      const result = await swal({title: `Timesheet details couldn't be saved`, text: e, type: "error", showCancelButton: true, confirmButtonText: "Retry"});

      if (result.value) {
        this._saveTimeSheetDetails(object);
      } else if (result.dismiss === "cancel") {}
    }
  };

  /**
     * This will return one or multiple
     * @param {integer|null} timesheetId
     * @returns {object|Array}
     */
  this._getTimeSheetDetails = async (timesheetId = null, list = false) => {
    let response = await getVS1Data(erpObject.TTimeSheetDetails);

    if (response.length > 0) {
      let timesheetsDetails = JSON.parse(response[0].data);

      if (timesheetId) {
        return list == true
          ? timesheetsDetails.filter(time => time.timeSheetId == timesheetId)
          : timesheetsDetails.find(time => time.timeSheetId == timesheetId);
      }
      return timesheetsDetails;
    }
    return undefined;
  };

  this._deleteTimSheetDetails = async timesheetId => {
    try {
      let response = await getVS1Data(erpObject.TTimeSheetDetails);
      if (response.length > 0) {
        let jsonData = JSON.parse(response[0].data);
      } else {
        throw "Couldn't be deleted";
      }
    } catch (e) {}
  };

  this.calculateTotalHours = () => {
    const earningsDays = this.earningDays.get();
    const hourInputs = $("#tblTimeSheetInner tbody tr:not(.template)").find("input.hours");
    let dailyHours = [];

    $(hourInputs).each((index, hourInput) => {
      dailyHours.push({
        dayIndex: parseInt($(hourInput).attr("date-index")),
        hours: parseFloat($(hourInput).val()),
        day: earningsDays.find(e => e.dayIndex == parseInt($(hourInput).attr("date-index")))
      });
    });
    let _dailyHours = [];

    dailyHours.forEach(current => {
      if (!_dailyHours[current.dayIndex]) {
        _dailyHours[current.dayIndex] = [];
      }
      _dailyHours[current.dayIndex].push(current);
    });

    _dailyHours.forEach((dailyHours, index) => {
      const sum = (dailyHours = []) => {
        let totalHours = 0;
        dailyHours.forEach(dailyHour => {
          totalHours += dailyHour.hours;
        });
        return totalHours;
      };

      $(`#tblTimeSheetInner tfoot tr.total .daily-total[date-index=${index}]`).text(sum(dailyHours));
    });

    return _dailyHours;
  };

  this.initPage = async (refresh = false) => {
    LoadingOverlay.show();

    await this.loadTimeSheet(true); // first load this
    await this.loadEmployee(refresh); // second load this

    await this.loadRateTypes(refresh);
    await this.loadOvertimes(refresh);

    const employee = await this.employee.get();
    await this.getEmployeePayRollPayTemplates(employee.ID);

    await this.calculateThisWeek();

    await this.loadEarningSelector();

    await this.calculateWeeklyHours();

    //await this._getTimeSheetDetails();
    // Lets load the timesheet data
    let timesheetDetails = await this.loadTimeSheetDetails();

   

    if (timesheetDetails == undefined) {
      setTimeout(() => {
        this.duplicateFirstLine();
      }, 300);
    }

    setTimeout(() => {
      this.calculateTotalHours();
    }, 300);

    Datehandler.defaultDatePicker();
    LoadingOverlay.hide();
  };
  this.initPage();
});

Template.timesheetdetail.events({
  "click .btnAddNewLine": function (e, ui) {
    // $("#tblTimeSheetInner tbody").find("tr:last").prev().after(`<tr>
    //     <td>
    //      <select class="form-control">
    //          <option>Select</option>
    //          <option value="Ordinary Time Earnings">Ordinary Time Earnings</option>
    //          <option value="Overtime Earnings">Overtime Earnings</option>
    //      </select>
    //     </td>
    //     <td>0.00</td>
    //     <td>0.00</td>
    //     <td>0.00</td>
    //     <td>0.00</td>
    //     <td>0.00</td>
    //     <td>0.00</td>
    //     <td>0.00</td>
    //     <td>0.00</td>
    //     <td><button type="button" class="btn btn-danger btn-rounded btn-sm btnDeletePayslip" data-id="1" autocomplete="off"><i class="fa fa-remove"></i></button></td>
    //  </tr>
    //     `);

    ui.duplicateFirstLine(true);
    ui.calculateTotalHours();
  },
  "click .btnDeleteRow": function (e) {
    playDeleteAudio();
    setTimeout(function(){
    $(e.target).parents("tr").remove();
  }, delayTimeAfterSound);
  },

  "click #tblTimeSheetInner tbody .select-rate-js": (e, ui) => {
    $(e.currentTarget).addClass("selector-target"); // This is used to know where to paste data later
    $("#select-rate-modal").modal("toggle");
  },

  "click #tblEarnigRatesList tbody tr": (e, ui) => {
    const selectedEarning = $(e.currentTarget).find("td:first").text();
    $("#select-rate-modal").modal("toggle");
    $(".selector-target").val(selectedEarning);
    $(".selector-target").removeClass("selector-target");
  },

  "click .approve-timesheet": (e, ui) => {
    ui.approveTimeSheet();
  },
  "click .delete-timesheet": (e, ui) => {
    ui.deleteTimeSheet();
  },
  "click .save-draft": (e, ui) => {
    ui.draftTimeSheet();
  },
  "click .cancel-timesheet": (e, ui) => {
    ui.cancelTimeSheet();
  },

  "change input.hours": (e, ui) => {
    ui.calculateWeeklyHours();
  },
  "change #tblTimeSheetInner tbody tr:not(.template) input.hours": (e, ui) => {
    ui.calculateTotalHours();
  }
});

Template.timesheetdetail.helpers({
  formatDate: date => {
    return moment(date).format("D MMM YYYY");
  },
  timesheet: () => {
    return Template.instance().timesheet.get();
  },
  employee: () => {
    return Template.instance().employee.get();
  },
  earningDays: () => {
    return Template.instance().earningDays.get();
  },
  earningOptions: () => {
    return Template.instance().earningOptions.get();
  },
  weeklyTotal: () => {
    return Template.instance().weeklyTotal.get();
  },
  timeSheetDetails: () => {
    return Template.instance().timeSheetDetails.get();
  },
  indexMatchedHours: (_day, days = []) => {
    let dayFound = days.find(day => moment(day.date).isSame(moment(_day.dateObject)));
    if (dayFound == undefined) {
      return 0;
    }
    return dayFound.hours;
  }
});
