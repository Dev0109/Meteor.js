import ApiService from "./Module/ApiService";
import ApiCollection from "./Module/ApiCollection";
import ApiCollectionHelper from "./Module/ApiCollectionHelper";
import ApiEndpoint from "./Module/ApiEndPoint";

/**
 * @param {ApiCollection} collection
 */
export default class EmployeePayrollApi {
  constructor() {
    this.name = "employeePayroll";

    this.collectionNames = {
        TEmployeepaysettings: "TEmployeepaysettings",
        TEarnings: "TEarnings",
        TDeduction: "TDeduction",
        TSuperannuation: "TSuperannuation",
        TReimbursement: "TReimbursement",
        TLeave: "TLeave",
        TPaySlips: "TPaySlips",
        TPayNotes: "TPayNotes",
        TAssignLeaveType: "TAssignLeaveType",
        TPayTemplateEarningLine: "TPayTemplateEarningLine",
        TPayTemplateDeductionLine: "TPayTemplateDeductionLine",
        TPayTemplateSuperannuationLine: "TPayTemplateSuperannuationLine",
        TPayTemplateReiumbursementLine: "TPayTemplateReiumbursementLine",
        TPaidLeave: "TPaidLeave",
        TUnpaidLeave: "TUnpaidLeave",
        TOpeningBalances: "TOpeningBalances",
        TLeavRequest: "TLeavRequest"
    };

    this.collection = new ApiCollection([
        new ApiEndpoint({
            name: this.collectionNames.TEmployeepaysettings,
            url: ApiService.getBaseUrl({ endpoint: "TEmployeepaysettings" }),
            headers: ApiService.getHeaders()
        }),
        new ApiEndpoint({
          name: this.collectionNames.TEarnings,
          url: ApiService.getBaseUrl({ endpoint: "TEarnings" }),
          headers: ApiService.getHeaders()
        }),
        new ApiEndpoint({
          name: this.collectionNames.TDeduction,
          url: ApiService.getBaseUrl({ endpoint: "TDeduction" }),
          headers: ApiService.getHeaders()
        }),
        new ApiEndpoint({
          name: this.collectionNames.TSuperannuation,
          url: ApiService.getBaseUrl({ endpoint: "TSuperannuation" }),
          headers: ApiService.getHeaders()
        }),
        new ApiEndpoint({
          name: this.collectionNames.TReimbursement,
          url: ApiService.getBaseUrl({ endpoint: "TReimbursement" }),
          headers: ApiService.getHeaders()
        }),        
        new ApiEndpoint({
          name: this.collectionNames.TLeave,
          url: ApiService.getBaseUrl({ endpoint: "TLeave" }),
          headers: ApiService.getHeaders()
        }),
        new ApiEndpoint({
          name: this.collectionNames.TPaySlips,
          url: ApiService.getBaseUrl({ endpoint: "TPaySlips" }),
          headers: ApiService.getHeaders()
        }),
        new ApiEndpoint({
          name: this.collectionNames.TPayNotes,
          url: ApiService.getBaseUrl({ endpoint: "TPayNotes" }),
          headers: ApiService.getHeaders()
        }),
        new ApiEndpoint({
          name: this.collectionNames.TAssignLeaveType,
          url: ApiService.getBaseUrl({ endpoint: "TAssignLeaveType" }),
          headers: ApiService.getHeaders()
        }),
        new ApiEndpoint({
          name: this.collectionNames.TPayTemplateEarningLine,
          url: ApiService.getBaseUrl({ endpoint: "TPayTemplateEarningLine" }),
          headers: ApiService.getHeaders()
        }),
        new ApiEndpoint({
          name: this.collectionNames.TPayTemplateDeductionLine,
          url: ApiService.getBaseUrl({ endpoint: "TPayTemplateDeductionLine" }),
          headers: ApiService.getHeaders()
        }),
        new ApiEndpoint({
          name: this.collectionNames.TPayTemplateSuperannuationLine,
          url: ApiService.getBaseUrl({ endpoint: "TPayTemplateSuperannuationLine" }),
          headers: ApiService.getHeaders()
        }),
        new ApiEndpoint({
          name: this.collectionNames.TPayTemplateReiumbursementLine,
          url: ApiService.getBaseUrl({ endpoint: "TPayTemplateReiumbursementLine" }),
          headers: ApiService.getHeaders()
        }),
        new ApiEndpoint({
          name: this.collectionNames.TAssignLeaveType,
          url: ApiService.getBaseUrl({ endpoint: "TAssignLeaveType" }),
          headers: ApiService.getHeaders()
        }),
        new ApiEndpoint({
          name: this.collectionNames.TPaidLeave,
          url: ApiService.getBaseUrl({ endpoint: "TPaidLeave" }),
          headers: ApiService.getHeaders()
        }),       
        new ApiEndpoint({
          name: this.collectionNames.TUnpaidLeave,
          url: ApiService.getBaseUrl({ endpoint: "TUnpaidLeave" }),
          headers: ApiService.getHeaders()
        }), 
        new ApiEndpoint({
          name: this.collectionNames.TOpeningBalances,
          url: ApiService.getBaseUrl({ endpoint: "TOpeningBalances" }),
          headers: ApiService.getHeaders()
        }),
        new ApiEndpoint({
          name: this.collectionNames.TLeavRequest,
          url: ApiService.getBaseUrl({ endpoint: "TLeavRequest" }),
          headers: ApiService.getHeaders()
        })
    ]);
  }
}