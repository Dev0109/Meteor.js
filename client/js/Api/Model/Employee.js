import {isEmpty, times} from "lodash";
import {ContactService} from "../../../contacts/contact-service";
import CachedHttp from "../../../lib/global/CachedHttp";
import erpObject from "../../../lib/global/erp-objects";
import EmployeePayrollApi from "../EmployeePayrollApi";
import PayTemplateSuperannuationLine from "./PayTemplateSuperannuationLine";
import UserModel from "./User";

export default class Employee {
  constructor({type, fields}) {
    this.type = type;
    this.fields = fields;

    this.earnings = [];
    this.earningTotal = 0.0;
    this.earningsPayTemplates = [];

    this.taxTotal = 0.0;
    this.taxes = null;

    this.superAnnuations = [];
    this.superAnnuationTotal = 0.0;

    this.netPay = 0.0;
  }

  /**
     * This will convert from a list
     * @param {Array} list
     * @returns {Employee[]}
     */
  static fromList(list = []) {
    return list.map(employee => new Employee(employee));
    // let _list = [];
    // list.forEach(el => {
    //   _list.push(new Employee(el));
    // });
    // return _list;
  }

  static async loadFromId(id) {
    const employee = await new ContactService().getOneEmployeeDataEx(id);
    return new Employee(employee);
  }

  /**
     * This will load earnings of this employee
     * load from timesheets
     * @returns
     */
  async getEarnings({
    timesheets = null
  }, refresh = false) {
    if (!timesheets) {
      let data = await CachedHttp.get(erpObject.TTimeSheet, async () => {
        const contactService = new ContactService();
        return await contactService.getAllTimeSheetList();
      }, {
        forceOverride: refresh,
        validate: cachedResponse => {
          return true;
        }
      });
      data = data.response;
      timesheets = data.ttimesheet.map(t => t.fields);
    }

    
    
    timesheets.forEach((t, index) => {
      if (t.Status == "") {
        t.Status = "Draft";
      }
    });

    // We want only aproved ones
    timesheets = timesheets.filter(time => time.Status == "Approved");

    // let data = await CachedHttp.get(erpObject.TPayTemplateEarningLine, async () => {
    //   const employeePayrolApis = new EmployeePayrollApi();
    //   const employeePayrolEndpoint = employeePayrolApis.collection.findByName(employeePayrolApis.collectionNames.TPayTemplateEarningLine);
    //   employeePayrolEndpoint.url.searchParams.append("ListType", "'Detail'");

    //   const response = await employeePayrolEndpoint.fetch();
    //   if (response.ok == true) {
    //     return await response.json();
    //   }
    //   return null;
    // }, {
    //   useIndexDb: true,
    //   useLocalStorage: false,
    //   validate: cachedResponse => {
    //     return false;
    //   }
    // });

    // data = data.response.tpaytemplateearningline.map(earning => earning.fields);
    // if (this.fields.ID) {
    //   data = data.filter(item => parseInt(item.EmployeeID) == parseInt(this.fields.ID));
    //   this.earnings = data;
    //   this.calculateEarnings();
    // }

    // return data;
  }

  /**
     * This will get all PayRoll pay template of the employee
     * @module PayRoll
     */
  async getEarningPayTemplates(refresh = false) {
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
      forceOverride: refresh,
      validate: cachedResponse => {
        return true;
      }
    });

    let response = data.response;

    let earningLines = response.tpaytemplateearningline.map(earning => earning.fields);
    if (this.fields.ID) {
      this.earningsPayTemplates = earningLines.filter(item => parseInt(item.EmployeeID) == parseInt(this.fields.ID));
    }

    return this.earningsPayTemplates;
  }

  incrementEarnings(amount = 0.0) {
    this.earningTotal += amount;
  }
  calculateEarnings() {
    this.earnings.forEach(earning => this.incrementEarnings(earning.Amount));
  }

  async getSuperAnnuations() {
    // let data = await CachedHttp.get(erpObject.TSuperannuation, async () => {
    //   return await new SideBarService().getSuperannuationByName(dataSearchName)
    // })

    let data = [];
    let dataObject = await getVS1Data("TPayTemplateSuperannuationLine");
    data = JSON.parse(dataObject[0].data);
    let useData = PayTemplateSuperannuationLine.fromList(data.tpaytemplatesuperannuationline);

    useData = useData.map(item => item.fields);

    useData = useData.filter(item => {
      if (parseInt(item.EmployeeID) == parseInt(this.fields.ID)) {
        return item;
      }
    });

    this.superAnnuations = useData;
    this.calculateSuperAnnuation();
  }

  calculateSuperAnnuation() {
    this.superAnnuations.forEach(s => {
      this.incrementSuperAnnuation(s.Amount);
    });
  }

  incrementSuperAnnuation(amount = 0.0) {
    this.superAnnuationTotal += amount;
  }

  async getTaxe(employeeObjs = []) {
    if (employeeObjs.length > 0) {
      employeeObjs = employeeObjs.map(e => e.fields);
      const employeeObj = employeeObjs.find(s => s.Employeeid == this.fields.ID) || null;
      this.taxes = employeeObj;
      return employeeObj;
    }
    /**
         * Load EmployeePayrollApi API
         */
    const employeePayrollApi = new EmployeePayrollApi();

    const apiEndpoint = employeePayrollApi.collection.findByName(employeePayrollApi.collectionNames.TEmployeepaysettings);
    apiEndpoint.url.searchParams.append("ListType", "'Detail'");
    const ApiResponse = await apiEndpoint.fetch();

    if (ApiResponse.ok) {
      const data = await ApiResponse.json();

      const employeeObjs = data.temployeepaysettings.map(e => e.fields);
      const employeeObj = employeeObjs.find(s => s.Employeeid == this.fields.ID) || null;
      this.taxes = employeeObj;
      return employeeObj;
    }

    return null;
  }

  /**
     * TODO: We should calculate with tax
     */
  calculateNetPay() {
    const earnings = this.earningTotal;
    const tax = 0.0; // we should calculate this
    const superAnnuation = this.superAnnuationTotal;
    const _netPay = earnings - tax;

    this.netPay = _netPay;
  }
}

/**
 * @type {{User: UserModel}}
 */
export class EmployeeFields {
  constructor({
    ABN,
    Active,
    AlHours,
    Allowances,
    AltContact,
    AltPhone,
    AnnuitySuperPension,
    Area,
    AreaRange,
    Award,
    BasisOfPayment,
    CallPriority,
    Canvasser,
    CdeProject,
    CdepWageTotal,
    CgtExempt,
    Classification,
    ClientID,
    Commission,
    CommissionFlatRate,
    CommissionInvoiceExPrice,
    CommissionLastPaid,
    CommissionOn,
    CommissionOnValue,
    Company,
    ConcessionalComponent,
    Country,
    CreationDate,
    CustFld1,
    DateFinished,
    DateSigned,
    DateStarted,
    DaysPost30061983,
    DaysPre01071983,
    Deductions,
    DefaultClassID,
    DefaultClassName,
    DefaultContactMethod,
    DefaultInvoiceTemplateID,
    DOB,
    Email,
    EmailsFromEmployeeAddress,
    EmployeeHasCommission,
    EmployeeName,
    EmployeeNo,
    ExtraTax,
    ExtraTaxOptions,
    FamilyTaxBenefit,
    FaxNumber,
    FirstName,
    FringeBenefits,
    GlobalRef,
    GoogleEmail,
    GooglePassword,
    Gross,
    Hecsindicator,
    HecsTaxScale,
    ID,
    IncomeType,
    Initials,
    IsCommissionOnPaidInvoice,
    ISEmpty,
    IsOnTheRoster,
    IsTerminated,
    KeyStringFieldName,
    KeyValue,
    LastName,
    LastPaid,
    LastPayPeriod,
    LastUpdated,
    LeaveLoading,
    LoadHoursFromRoster,
    LoadLeaveFromRoster,
    MealBreakHours,
    MealBreakThreshold,
    MiddleName,
    Mobile,
    MsTimeStamp,
    MsUpdateSiteCode,
    Net,
    NextOfKin,
    NextOfKinPhone,
    NextOfKinRelationship,
    NonQualifyingComponent,
    Notes,
    onPMRoster,
    OptionNo,
    OverHeadBaseRate,
    OverheadRate,
    PayNotes,
    Payperiod,
    PaySuperonLeaveLoading,
    PayVia,
    Pensioner,
    Phone,
    PhotoIDVaildFromDate,
    PhotoIDVaildToDate,
    Position,
    PostCode,
    ProductHasCommission,
    Recno,
    Rep,
    RepCode,
    ReportsTo,
    Resident,
    SalesTarget,
    SendPayslipViaEmail,
    Sex,
    SickHours,
    SignaturePresent,
    SkypeName,
    State,
    Street,
    Street2,
    Street3,
    StudentLoanIndicator,
    StudentLoanTaxScale,
    Suburb,
    Sundries,
    Super,
    SynchWithGoogle,
    Tax,
    TaxFreeThreshold,
    TaxScaleID,
    TFN,
    TFNExemption,
    TfnApplicationMade,
    Title,
    TrackSales,
    UndeductedContribution,
    Under18,
    UseAward,
    UseClassificationAdvance,
    UseoFtFnForSuper,
    User,
    Wages,
    WorkersCompInsurer,
    WorkersCompRate,
    WorkPhone,
    ZoneDependentSpecial,
    EmploymentBasis,
    ResidencyStatus,
    StudyTrainingSupportLoan,
    EligibleToReceiveLeaveLoading,
    OtherTaxOffsetClaimed,
    UpwardvariationRequested,
    SeniorandPensionersTaxOffsetClaimed,
    HasApprovedWithholdingVariation
  }) {
    this.ABN = ABN;
    this.Active = Active;
    this.AlHours = AlHours;
    this.Allowances = Allowances;
    this.AltContact = AltContact;
    this.AltPhone = AltPhone;
    this.AnnuitySuperPension = AnnuitySuperPension;
    this.Area = Area;
    this.AreaRange = AreaRange;
    this.Award = Award;
    this.BasisOfPayment = BasisOfPayment;
    this.CallPriority = CallPriority;
    this.Canvasser = Canvasser;
    this.CdeProject = CdeProject;
    this.CdepWageTotal = CdepWageTotal;
    this.CgtExempt = CgtExempt;
    this.Classification = Classification;
    this.ClientID = ClientID;
    this.Commission = Commission;
    this.CommissionFlatRate = Commission;
    this.CommissionInvoiceExPrice = Commission;
    this.CommissionLastPaid = CommissionLastPaid;
    this.CommissionOn = CommissionOn;
    this.CommissionOnValue = CommissionOnValue;
    this.Company = Company;
    this.ConcessionalComponent = ConcessionalComponent;
    this.Country = Country;
    this.CreationDate = CreationDate;
    this.CustFld1 = CustFld1;
    this.DateFinished = DateFinished;
    this.DateSigned = DateSigned;
    this.DateStarted = DateStarted;
    this.DaysPost30061983 = DaysPost30061983;
    this.DaysPre01071983 = DaysPre01071983;
    this.Deductions = Deductions;
    this.DefaultClassID = DefaultClassID;
    this.DefaultClassName = DefaultClassName;
    this.DefaultContactMethod = DefaultContactMethod;
    this.DefaultInvoiceTemplateID = DefaultInvoiceTemplateID;
    this.DOB = DOB;
    this.Email = Email;
    this.EmailsFromEmployeeAddress = EmailsFromEmployeeAddress;
    this.EmployeeHasCommission = EmployeeHasCommission;
    this.EmployeeName = EmployeeName;
    this.EmployeeNo = EmployeeNo;
    this.ExtraTax = ExtraTax;
    this.ExtraTaxOptions = ExtraTaxOptions;
    this.FamilyTaxBenefit = FamilyTaxBenefit;
    this.FaxNumber = FaxNumber;
    this.FirstName = FirstName;
    this.FringeBenefits = FringeBenefits;
    this.GlobalRef = GlobalRef;
    this.GoogleEmail = GoogleEmail;
    this.GooglePassword = GooglePassword;
    this.Gross = Gross;
    this.Hecsindicator = Hecsindicator;
    this.HecsTaxScale = HecsTaxScale;
    this.ID = ID;
    this.IncomeType = IncomeType;
    this.Initials = Initials;
    this.IsCommissionOnPaidInvoice = IsCommissionOnPaidInvoice;
    this.ISEmpty = isEmpty;
    this.IsOnTheRoster = IsOnTheRoster;
    this.IsTerminated = IsTerminated;
    this.KeyStringFieldName = KeyStringFieldName;
    this.KeyValue = KeyValue;
    this.LastName = LastName;
    this.LastPaid = LastPaid;
    this.LastPayPeriod = LastPayPeriod;
    this.LastUpdated = LastUpdated;
    this.LeaveLoading = LeaveLoading;
    this.LoadHoursFromRoster = LoadHoursFromRoster;
    this.LoadLeaveFromRoster = LoadLeaveFromRoster;
    this.MealBreakHours = MealBreakHours;
    this.MealBreakThreshold = MealBreakThreshold;
    this.MiddleName = MiddleName;
    this.Mobile = Mobile;
    this.MsTimeStamp = MsTimeStamp;
    this.MsUpdateSiteCode = MsUpdateSiteCode;
    this.Net = Net;
    this.NextOfKin = NextOfKin;
    this.NextOfKinPhone = NextOfKinPhone;
    this.NextOfKinRelationship = NextOfKinRelationship;
    this.NonQualifyingComponent = NonQualifyingComponent;
    this.Notes = Notes;
    this.onPMRoster = onPMRoster;
    this.OptionNo = OptionNo;
    this.OverHeadBaseRate = OverHeadBaseRate;
    this.OverheadRate = OverheadRate;
    this.PayNotes = PayNotes;
    this.Payperiod = Payperiod;
    this.PaySuperonLeaveLoading = PaySuperonLeaveLoading;
    this.PayVia = PayVia;
    this.Pensioner = Pensioner;
    this.Phone = Phone;
    this.PhotoIDVaildFromDate = PhotoIDVaildFromDate;
    this.PhotoIDVaildToDate = PhotoIDVaildToDate;
    this.Position = Position;
    this.PostCode = PostCode;
    this.ProductHasCommission = ProductHasCommission;
    this.Recno = Recno;
    this.Rep = Rep;
    this.RepCode = RepCode;
    this.ReportsTo = ReportsTo;
    this.Resident = Resident;
    this.SalesTarget = SalesTarget;
    this.SendPayslipViaEmail = SendPayslipViaEmail;
    this.Sex = Sex;
    this.SickHours = SickHours;
    this.SignaturePresent = SignaturePresent;
    this.SkypeName = SkypeName;
    this.State = State;
    this.Street = Street;
    this.Street2 = Street2;
    this.Street3 = Street3;
    this.StudentLoanIndicator = StudentLoanIndicator;
    this.StudentLoanTaxScale = StudentLoanTaxScale;
    this.Suburb = Suburb;
    this.Sundries = Sundries;
    this.Super = Super;
    this.SynchWithGoogle = SynchWithGoogle;
    this.Tax = Tax;
    this.TaxFreeThreshold = TaxFreeThreshold;
    this.TaxScaleID = TaxScaleID;
    this.TFN = TFN;
    this.TFNExemption = TFNExemption;
    this.TfnApplicationMade = TfnApplicationMade;
    this.Title = Title;
    this.TrackSales = TrackSales;
    this.UndeductedContribution = UndeductedContribution;
    this.Under18 = Under18;
    this.UseAward = UseAward;
    this.UseClassificationAdvance = UseClassificationAdvance;
    this.UseoFtFnForSuper = UseoFtFnForSuper;

    if (User instanceof UserModel) {
      this.User = User;
    } else {
      this.User = new UserModel(User);
    }

    this.Wages = Wages;
    this.WorkersCompInsurer = WorkersCompInsurer;
    this.WorkersCompRate = WorkersCompRate;
    this.WorkPhone = WorkPhone;
    this.ZoneDependentSpecial = ZoneDependentSpecial;
    this.EmploymentBasis = EmploymentBasis;
    this.ResidencyStatus = ResidencyStatus;
    this.StudyTrainingSupportLoan = StudyTrainingSupportLoan;
    this.EligibleToReceiveLeaveLoading = EligibleToReceiveLeaveLoading;
    this.OtherTaxOffsetClaimed = OtherTaxOffsetClaimed;
    this.UpwardvariationRequested = UpwardvariationRequested;
    this.SeniorandPensionersTaxOffsetClaimed = SeniorandPensionersTaxOffsetClaimed;
    this.HasApprovedWithholdingVariation = HasApprovedWithholdingVariation;
  }
}
