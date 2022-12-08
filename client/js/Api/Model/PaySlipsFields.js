export default class PaySlipsFields {
    constructor({
        EmployeeID,
        ID,
        Period,
        // CreatedAt,
        PaymentDate,
        TotalPay,
        Active
    }){
        this.EmployeeID = EmployeeID;
        this.ID = ID;
        this.Period = Period;
        // this.CreatedAt = CreatedAt;
        this.PaymentDate = PaymentDate;
        this.TotalPay = TotalPay;
        this.Active = Active;
    }
}
  
  