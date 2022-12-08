import { functionsIn } from 'lodash';
import {
    BaseService
} from '../js/base-service.js';

export class TaxRateService extends BaseService {
    getTaxRate() {
        return this.GET(this.erpGet.ERPTaxCode);
    }

    getOneTaxRate(id) {
        return this.getOneById(this.ERPObjects.ERPTaxCode, id);
    }

    getAccountType() {
        return this.GET(this.erpGet.ERPTAccountType);
    }

    getAccountList() {
        return this.GET(this.erpGet.ERPAccountList);
    }

    getScheduleSettings() {
        let options = {
                ListType: "Detail",
    //        PropertyList:"BeginFromOption,ContinueIndefinitely,EmployeeId,Employeename,EndDate,Every,FormID,Frequency,GlobalRef,HolidayAction,ID,ISEmpty,KeyStringFieldName,KeyValue,LastEmaileddate,MonthDays,MsTimeStamp,MsUpdateSiteCode",

            };
            return this.getList(this.ERPObjects.TReportSchedules,options);
        }
      saveScheduleSettings(data) {
      //     let options = {
      //             ListType: "Detail",
      // //        PropertyList:"BeginFromOption,ContinueIndefinitely,EmployeeId,Employeename,EndDate,Every,FormID,Frequency,GlobalRef,HolidayAction,ID,ISEmpty,KeyStringFieldName,KeyValue,LastEmaileddate,MonthDays,MsTimeStamp,MsUpdateSiteCode",
      //
      //         };
              return this.POST(this.ERPObjects.TReportSchedules,data);
          }
    getAssetTypes() {
        let options = {
            PropertyList: "AssetTypeName, AssetTypeCode, Notes",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TFixedAssetType, options);
    }

    getAccountOptions() {
        let options = {
            PropertyList: "AccountNumber, AccountName, AccountTypeName",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TAccount, options);
    }

    getAssetType(id) {
        return this.getOneById(this.ERPObjects.TFixedAssetType, id);
    }

    // getCurrencies() {
    //     let options = {
    //         PropertyList: "Code, CurrencyDesc, Currency, BuyRate, SellRate,Active, CurrencySymbol,ID,Country",
    //         select: "[Active]=true",
    //     };
    //     return this.getList(this.ERPObjects.TCurrency, options);
    // }

    getOneAccount(id) {
        return this.getOneById(this.ERPObjects.ERPAccount, id);
    }

    getAccountTypeDropDown() {
        let options = {
            PropertyList: "Description, AccountTypeName",
        };
        return this.getList(this.ERPObjects.ERPAccountType, options);
    }

    getTaxRateDropDown() {
        let options = {
            PropertyList: "CodeName",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TTaxCode, options);
    }

    saveTaxRate(data) {
        return this.POST(this.ERPObjects.TTaxCode, data);
    }

    getTaxRateVS1( regionName = "" ) {
        let options = {};
        if( regionName ){
            options = {
                // PropertyList:"ID,CodeName,Description,LocationCategoryDesc,Rate,RegionName,Active",
                RegionName: regionName,
                ListType: "Detail",
                select: "[Active]=true",
            };
        }else{
            options = {
                // PropertyList:"ID,CodeName,Description,LocationCategoryDesc,Rate,RegionName,Active",
                ListType: "Detail",
                select: "[Active]=true",
            };
        }

        let that = this;
        let promise = new Promise(function(resolve, reject) {
            that.getList(that.ERPObjects.TTaxcodeVS1, options).then(function (data) {
                let ttaxcodevs1 = data.ttaxcodevs1.map((v) => {
                    let fields = v.fields;
                    let lines = fields.Lines;
                    if (lines !== null) {
                        if (Array.isArray(lines)) {         // if lines is array
                            lines = lines.map((line) => {
                                let f = line.fields;
                                return {
                                    ...{Id: f.ID},
                                    ...f,
                                }
                            })
                        }
                        else if (typeof lines === 'object') {   // else if it is object
                            lines = [
                                {
                                    ...{Id: lines.fields.ID},
                                    ...lines.fields
                                }
                            ];
                        }
                    }
                    return {
                        ...{ Id: fields.ID },
                        ...fields,
                        ...{ Lines: lines }
                    }
                });
                resolve({ ttaxcodevs1 });
            }).catch(function (err) {
                reject(err);
            })
        });
        return promise;
    }

    checkTaxRateByName(codeName) {
        let options = {
            select: "[CodeName]='" + codeName + "'"
        };
        return this.getList(this.ERPObjects.TTaxCode, options);
    }

    getSubTaxDropDown() {
        let options = {
            PropertyList: "Code",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TSubTaxCode, options);
    }

    saveSubTax(data) {
        return this.POST(this.ERPObjects.TSubTaxCode, data);
    }

    getSubTaxCode() {
        let options = {
            PropertyList: "ID,Code,Description,Category,Active,GlobalRef,ISEmpty,RegionName",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TSubTaxCode, options);
    }

    checkSubTaxByName(codeName) {
        let options = {
            select: "[Code]='" + codeName + "'"
        };
        return this.getList(this.ERPObjects.TSubTaxCode, options);
    }

    checkTermByName(termName) {
        let options = {
            select: "[TermsName]='" + termName + "'"
        };
        return this.getList(this.ERPObjects.TTerms, options);
    }

    checkAllowanceByName(earningName) {
        let options = {
            ListType: "Detail",
            select: "[Description]='" + earningName + "'"
        };
        return this.getList(this.ERPObjects.TAllowance, options);
    }

    checkCalenderName(calendarname)
    {
        let options = {
            select: "[PayrollCalendarName]='" + calendarname + "'"
        };
        return this.getList(this.ERPObjects.TPayrollCalendars, options);
    }

    checkSuperannuationName(Superannuation)
    {
        let options = {
            select: "[Superfund]='" + Superannuation + "'"
        };
        return this.getList(this.ERPObjects.Tsuperannuation, options);
    }


    checkfundTypeByName(description)
    {
        let options = {
            select: "[description]='" + description + "'"
        };
        return this.getList(this.ERPObjects.TSuperType, options);
    }

    checkReimbursementByName(reimbursementName) {
        let options = {
            select: "[ReimbursementName]='" + reimbursementName + "'"
        };
        return this.getList(this.ERPObjects.TReimbursement, options);


    }

    checktpayorgainzation(orgainzation)
    {
        let options = {
            select: "[PayrollBankAccount]='" + orgainzation + "'"
        };
        return this.getList(this.ERPObjects.TPayrollOrganization, options);
    }

    savePayOrganization(data)
    {
        return this.POST(this.ERPObjects.TPayrollOrganization, data);

    }

    checkPaidLeaveByName(leavename) {
        let options = {
            select: "[LeavePaidName]='" + leavename + "'"
        };
        return this.getList(this.ERPObjects.TPaidLeave, options);


    }
    checkunPaidLeaveByName(leavename) {
        let options = {
            select: "[LeaveUnPaidName]='" + leavename + "'"
        };
        return this.getList(this.ERPObjects.TUnpaidLeave, options);
    }

    checkRateTypeByName(description)
    {
        let options = {
        select: "[Description]='" + description + "'"
       };
       return this.getList(this.ERPObjects.TPayRateType, options);

    }


    checkordinaryEarningByName(earningName) {
        let options = {
            select: "[OrdinaryTimeEarningsName]='" + earningName + "'"
        };
        return this.getList(this.ERPObjects.TOrdinaryTimeEarnings, options);


    }


    checkDeductionByName(deductionName) {
        let options = {
            select: "[Description]='" + deductionName + "'"
        };
        return this.getList(this.ERPObjects.TDeduction, options);
    }

    getOneAccountTypeByName(AccountTypeName) {
        let options = {
            PropertyList: "Description, AccountTypeName",
        };
        return this.getList(this.ERPObjects.ERPAccountType, options);
    }

    getExpenseAccountList() {
        return this.GET(this.erpGet.ERPExpenseAccountList);
    }

    getRevenueAccountList() {
        return this.GET(this.erpGet.ERPRevenueAccountList);
    }

    getEquityAccountList() {
        return this.GET(this.erpGet.ERPEquityAccountList);
    }

    getAssetAccountList() {
        return this.GET(this.erpGet.ERPAssetAccountList);
    }

    getLiabilityAccountList() {
        return this.GET(this.erpGet.ERPLiabilityAccountList);
    }
    getArchiveAccountList() {
        return this.GET(this.erpGet.ERPArchiveAccountList);
    }
    getChartOfAccounts() {
        let options = {
            select: "[Active]=true",
            ListType: "Detail"
        };
        return this.getList(this.ERPObjects.TAccount, options);
    }
    saveAccount(data) {
        return this.POST(this.ERPObjects.TAccount, data);
    }
    saveClientTypeData(data) {
        return this.POST(this.ERPObjects.TClientType, data);
    }

    saveAccount(data) {
        return this.POST(this.ERPObjects.TAccount, data);
    }

    saveDepartment(data) {
        return this.POST(this.ERPObjects.TDeptClass, data);
    }

    saveAccountantCategory(data) {
        return this.POST(this.ERPObjects.TReportsAccountantsCategory, data);
    }

    saveRateType(data){
        return this.POST(this.ERPObjects.TPayRateType, data);
    }

    savePaidLeave(data){

        return this.POST(this.ERPObjects.TPaidLeave, data);
    }

    saveUnPaidLeave(data){

        return this.POST(this.ERPObjects.TUnpaidLeave, data);
    }

    saveSuperType(data)
    {
        return this.POST(this.ERPObjects.TSuperType, data);

    }

    checkDepartmentByName(deptName) {
        let options = {
            select: "[DeptClassName]='" + deptName + "'"
        };
        return this.getList(this.ERPObjects.TDeptClass, options);
    }

    checkAccountantByName(docName) {
        let options = {
            select: "[DocName]='" + docName + "'"
        };
        return this.getList(this.ERPObjects.TReportsAccountantsCategory, options);
    }

    checkCurrency(Country) {
        let options = {
            PropertyList: "Code,CurrencyDesc,Currency,BuyRate,SellRate,Active,CurrencySymbol,ID",
            select: "[Country]=" + Country
        };
        return this.getList(this.ERPObjects.TCurrency, options);
    }
    saveCurrency(data) {
        return this.POST(this.ERPObjects.TCurrency, data);
    }

    saveCurrencies(data) {
        return this.POST(this.ERPObjects.TCurrency, data);
    }

    getDepartment() {
        let options = {
            PropertyList: "ID,GlobalRef,KeyValue,DeptClassGroup,DeptClassName,Description,SiteCode,Active",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TDeptClass, options);
    }

    getAccountantCategory() {
        let options = {
            PropertyList: "ID,FirstName,LastName,CompanyName,Address,DocName,TownCity,PostalZip,StateRegion,Country,Active",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TReportsAccountantsCategory, options);
    }

    getClientType() {
        let options = {
            PropertyList: "ID,TypeDescription,TypeName,Active",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TClientType, options);
    }

    getOneDepartment(id) {
        return this.getOneById(this.ERPObjects.TDeptClass, id);
    }

    getCurrencies() {
        let options = {
            PropertyList: "ID, Code, CurrencyDesc, Currency, BuyRate, SellRate,Active, CurrencySymbol,Country,RateLastModified",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TCurrency, options);
    }

    getCurrencyHistory() {
        let options = {
            PropertyList: "ID, Code, CurrencyDesc, Currency, BuyRate, SellRate,Active, CurrencySymbol,Country,RateLastModified",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TCurrencyRateHistory, options);
    }

    getCurrenciesVS1() {
        let options = {
            PropertyList: "ID, Code, CurrencyDesc, Currency, BuyRate, SellRate,Active, CurrencySymbol,Country,RateLastModified",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TCurrencyVS1, options);
    }

    getOneCurrency(id) {
        return this.getOneById(this.ERPObjects.TCurrency, id);
    }

    getOneCurrencyByCountry(country) {
        let options = {
            PropertyList: "ID, Code, CurrencyDesc, Currency, BuyRate, SellRate,Active, CurrencySymbol,Country,RateLastModified",
            // select: "[Country]='"+country+"'",
        };
        return this.getList(this.ERPObjects.TCurrency, options);
    }

    getPaymentMethod() {
        let options = {
            PropertyList: "ID,IsCreditCard,PaymentMethodName,Active",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TPaymentMethod, options);
    }

    getPaymentMethodVS1() {
        let options = {
            ListType: "Detail",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TPaymentMethodVS1, options);
    }

    getOnePaymentMethod(id) {
        return this.getOneById(this.ERPObjects.TPaymentMethod, id);
    }

    savePaymentMethod(data) {
        return this.POST(this.ERPObjects.TPaymentMethod, data);
    }

    getTerms() {
        let options = {
            PropertyList: "ID,Days,IsEOM,IsEOMPlus,TermsName,Description,IsDays,Active",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TTerms, options);
    }
    getTermsVS1() {
        let options = {
            PropertyList: "ID,Days,IsEOM,IsEOMPlus,TermsName,Description,IsDays,Active,isPurchasedefault,isSalesdefault",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TTermsVS1, options);
    }

    getOneTerms(id) {
        return this.getOneById(this.ERPObjects.TTerms, id);
    }

    saveTerms(data) {
        return this.POST(this.ERPObjects.TTerms, data);
    }

    //Units of Measure
    getUOM() {
        let options = {
            PropertyList: "ID,UOMName,Description,ProductName,Multipler,SalesDefault,PurchaseDefault,Weight,NoOfBoxes,Height,Width,Length,Volume,Active",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TUnitOfMeasure, options);
    }
    getUOMVS1() {
        let options = {
            PropertyList: "ID,UOMName,Description,ProductName,Multipler,SalesDefault,PurchaseDefault,Weight,NoOfBoxes,Height,Width,Length,Volume,Active",
            select: "[Active]=true",
        };
        return this.getList(this.ERPObjects.TUOMVS1, options);
    }

    getOneUOM(id) {
        return this.getOneById(this.ERPObjects.TUnitOfMeasure, id);
    }

    saveUOM(data) {
        return this.POST(this.ERPObjects.TUnitOfMeasure, data);
    }

    saveAllowance(data) {
        return this.POST(this.ERPObjects.TAllowance, data);
    }

    saveCalender(data) {
        return this.POST(this.ERPObjects.TPayrollCalendars, data);
    }
    saveSuperannuation(data) {
        return this.POST(this.ERPObjects.Tsuperannuation, data);
    }

    saveReimbursement(data)
    {
        return this.POST(this.ERPObjects.TReimbursement, data);
    }

    saveordinaryEarningByName(data)
    {
        return this.POST(this.ERPObjects.TOrdinaryTimeEarnings, data);
    }

    saveHoliday(data){
        return this.POST(this.ERPObjects.TPayrollHolidays, data);
    }
    saveExemptReportableOvertime(data)
    {
        return this.POST(this.ERPObjects.TOverTimeEarnings, data);
    }
    saveSuperannuationBonusesCommissions(data)
    {
        return this.POST(this.ERPObjects.TEarningsBonusesCommissions, data);
    }
    saveExemptReportableLumpSumE(data)
    {
        return this.POST(this.ERPObjects.TLumpSumE, data);
    }
    saveExemptReportableTermnination(data)
    {
        return this.POST(this.ERPObjects.TTerminationSimple, data);
    }
    saveDirectorFee(data)
    {
        return this.POST(this.ERPObjects.TDirectorsFees, data);
    }
    saveLumpSumW(data)
    {
        return this.POST(this.ERPObjects.TLumpSumW, data);
    }
    saveDeduction(data) {
        return this.POST(this.ERPObjects.TDeduction, data);
    }


    checkordinaryEarningByName(earningname)
    {
        let options = {
            select: "[PayItemsEarningsOrdinaryTimeEarningsName]='" + earningname + "'"
        };
        return this.getList(this.ERPObjects.TOrdinaryTimeEarnings, options);
    }

    checkExemptReportableOvertime(earningname)
    {
        let options = {
            select: "[OverTimeEarningsName]='" + earningname + "'"
        };
        return this.getList(this.ERPObjects.TOverTimeEarnings, options);
    }
    checkSuperannuationBonusesCommissions(earningname)
    {
        let options = {
            select: "[EarningBonusesCommisionsName]='" + earningname + "'"
        };
        return this.getList(this.ERPObjects.TEarningsBonusesCommissions , options);
    }
    checkExemptReportableLumpSumE(earningname)
    {
        let options = {
            select: "[LumpSumEName]='" + earningname + "'"
        };
        return this.getList(this.ERPObjects.TLumpSumE, options);
    }
    checkExemptReportableTermnination(earningname)
    {
        let options = {
            select: "[EmployeeTerminationPaymentsName]='" + earningname + "'"
        };
        return this.getList(this.ERPObjects.TTerminationSimple, options);
    }
    checkDirectorFee(earningname)
    {
        let options = {
            select: "[DirectorsFeesName]='" + earningname + "'"
        };
        return this.getList(this.ERPObjects.TDirectorsFees, options);
    }

    checkHolidaybyName(holidayname)
    {

        let options = {
            select: "[PayrollHolidaysName]='" + holidayname + "'",
            ListType: "Detail"
        };
        return this.getList(this.ERPObjects.TPayrollHolidays, options);
    }
    checkLumpSumW(earningname)
    {
        let options = {
            select: "[LumpSumWName]='" + earningname + "'"
        };
        return this.getList(this.ERPObjects.TLumpSumW, options);
    }

    checkPaymentMethodByName(paymentName) {
        let options = {
            select: "[PaymentMethodName]='" + paymentName + "'"
        };
        return this.getList(this.ERPObjects.TPaymentMethod, options);
    }

    getEmployees() {
        let options = {
            PropertyList: "ID,EmployeeName",
            Select: "[Active]=true"
        };
        return this.getList(this.ERPObjects.TEmployee, options);
    }

    getBins() {
        let options = {
            PropertyList: "ID,BinLocation,BinNumber",
            Select: "[Active]=true"
        };
        return this.getList(this.ERPObjects.TProductBin, options);
    }

    saveRoom(data) {
        return this.POST(this.ERPObjects.TProductBin, data);
    }

    pullBackupData(data) {
        return this.POSTJsonIn('VS1_Cloud_Task/Method?Name="VS1_BackupList"', data);
    }

    saveBackupData(data) {
        return this.POSTJsonIn('VS1_Cloud_Task/Method?Name="VS1_DatabaseBackup"', data);
    }

    restoreBackupData(data) {
        return this.POSTJsonIn('VS1_Cloud_Task/Method?Name="VS1_DatabaseRestore"', data);
    }

    getAllBackUpList() {
        let options = {
            // PropertyList: "ID,EmployeeName",
            // Select: "[Active]=true"
        };
        return this.getList('VS1_Cloud_Task/Method?Name="VS1_BackupList"');
    }

    getUserDetails() {
        let options = {
            ListType: "Detail",
            select: "[Active]=true",
        };
            return this.getList(this.ERPObjects.TEmployee,options);
        }


        getOneGroupTypeByName(dataSearchName){
            let options = {
              ListType:"Detail",
              select: '[Groupdesc]="'+dataSearchName+'"'
            };
            return this.getList(this.ERPObjects.TPayrollHolidayGroup, options);
         }

         checkGroupByName(dataSearchName)
         {
            let options = {
              ListType:"Detail",
              select: '[Groupdesc]="'+dataSearchName+'"'
            };
           return this.getList(this.ERPObjects.TPayrollHolidayGroup, options);

         }

         saveGroupType(data)
        {

          return this.POST(this.ERPObjects.TPayrollHolidayGroup,data);

        }

    savePreferenceSettings(data){
        return this.POST(this.ERPObjects.TERPPreference, data);
    }

    getPreferenceSettings( customSelect = [] ){
        let options = {};
        if( customSelect.length > 0 ){
            let select = customSelect.map(function(item){
                return `[PrefName]='${item}'`
            })
            options = {
                PropertyList: "PrefName,Fieldvalue",
                select: select.join(' or ')
            }
        }else{
            options = {
                PropertyList: "PrefName,Fieldvalue"
            }
        }
        return this.getList(this.ERPObjects.TERPPreference, options);
    }

    // getEmailHistory(limitcount, limitfrom, deleteFilter) {
    //     let options= {
    //         ListType: "Detail"
    //     }
    //     if (limitcount == "All") {
    //         options = {
    //           ListType: "Detail",
    //           Search: "Active = true",
    //         };
    //       } else {
    //         options = {
    //           ListType: "Detail",
    //           Search: "Active = true",
    //           LimitCount: parseInt(limitcount),
    //           LimitFrom: parseInt(limitfrom),
    //         };
    //       }
    //     return this.getList(this.ERPObjects.TEmailHistory, options)
    // }

    getEmailHistoryByTransName(name) {
        let options={
            ListType: "Detail",
            Select: "[Subject]='"+name+"'",
            search: "Active = true",
        }
        return this.getList(this.ERPObjects.TEmailHistory, options)
    }

    saveEmailHistory (data) {
        return this.POST(this.ERPObjects.TEmailHistory, data)
    }

}
