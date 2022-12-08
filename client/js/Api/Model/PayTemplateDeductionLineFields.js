export default class PayTemplateDeductionLineFields {
    constructor({
        ID,
        EmployeeID,
        DeductionType,
        CalculationType,
        ExpenseAccount,
        Percentage,
        Amount,
        Active
    }){
        this.ID = ID;
        this.EmployeeID = EmployeeID;
        this.DeductionType = DeductionType;
        this.CalculationType = CalculationType;
        this.ExpenseAccount = ExpenseAccount;
        this.Percentage = Percentage;
        this.Amount = Amount;
        this.Active = Active;
    }
}
  
  