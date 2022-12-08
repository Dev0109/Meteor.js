import {BaseService} from "../js/base-service";
export class EmployeePayrollService extends BaseService {

  getAllEmployeePaySettings(limitcount, limitfrom) {
    let options = '';
    if(limitcount == 'All'){
       options = {
          ListType: "Detail"
          //select: '[Active]=true'
        };
    }else{
      options = {
        ListType: "Detail",
        //select: '[Active]=true',
        LimitCount: parseInt(limitcount),
        LimitFrom: parseInt(limitfrom),
     };
    };
    return this.getList(this.ERPObjects.TEmployeepaysettings, options);
  }

  saveTEmployeepaysettings(data) {
    return this.POST(this.ERPObjects.TEmployeepaysettings, data);
  }

  getAllTLeaveTypes(limitcount, limitfrom) {
    let options = '';
    if(limitcount == 'All'){
       options = {
          ListType: "Detail"
          //select: '[Active]=true'
        };
    }else{
      options = {
        ListType: "Detail",
        //select: '[Active]=true',
        LimitCount: parseInt(limitcount),
        LimitFrom: parseInt(limitfrom),
     };
    };
    return this.getList(this.ERPObjects.TLeavetypes, options);
  }

  getAllTBankAccounts(limitcount, limitfrom) {
    let options = '';
    if(limitcount == 'All'){
       options = {
          ListType: "Detail"
          //select: '[Active]=true'
        };
    }else{
      options = {
        ListType: "Detail",
        //select: '[Active]=true',
        LimitCount: parseInt(limitcount),
        LimitFrom: parseInt(limitfrom),
     };
    };
    return this.getList(this.ERPObjects.TBankAccounts, options);
  }
  saveTBankAccounts(data) {
    return this.POST(this.ERPObjects.TBankAccounts, data);
  }

  saveTLeavRequest( data ){
    return this.POST(this.ERPObjects.TLeavRequest, data);
  }

  getAssignLeaveTypeByName(dataSearchName) {
    let options = "";
    options = {
        ListType: "Detail",
        select: '[LeaveType] f7like "' + dataSearchName + '"',
    };
    // return this.getList(this.ERPObjects.TAssignLeaveType, options);
    return this.getList('TAssignLeaveType', options);
  }

  getLeaveRequestByName(dataSearchName) {
    let options = "";
    options = {
        ListType: "Detail",
        select: '[TypeofRequest] f7like "' + dataSearchName + '"',
    };
    // return this.getList(this.ERPObjects.TLeavRequest, options);
    return this.getList('TLeavRequest', options);
  }

  getEarningByName(dataSearchName) {
    let options = "";
    options = {
        ListType: "Detail",
        select: '[EarningsName] f7like "' + dataSearchName + '"',
    };
    // return this.getList(this.ERPObjects.TEarnings, options);
    return this.getList('TEarnings', options);
  }

  getDeductionByName(dataSearchName) {
    let options = "";
    options = {
        ListType: "Detail",
        select: '[Description] f7like "' + dataSearchName + '"',
    };
    // return this.getList(this.ERPObjects.TDeduction, options);
    return this.getList('TDeduction', options);
  }

  getSuperAnnuationByName(dataSearchName) {
    let options = "";
    options = {
        ListType: "Detail",
        select: '[Superfund] f7like "' + dataSearchName + '"',
    };
    // return this.getList(this.ERPObjects.TSuperannuation, options);
    return this.getList('TSuperannuation', options);
  }

  getReimbursementByName(dataSearchName) {
    let options = "";
    options = {
        ListType: "Detail",
        select: '[ReimbursementName] f7like "' + dataSearchName + '"',
    };
    // return this.getList(this.ERPObjects.TReimbursement, options);
    return this.getList('TReimbursement', options);
  }


}
