export default class LeaveRequestFields {
    constructor({
        ID,
        EmployeeID,
        TypeofRequest,
        Description,
        StartDate,
        EndDate,
        PayPeriod,
        Hours,
        Status,
        Leave,
        LeaveMethod,
        Active
    }){
        this.ID = ID,
        this.EmployeeID = EmployeeID;
        this.TypeofRequest = TypeofRequest;
        this.Description = Description;
        this.StartDate = StartDate;
        this.EndDate = EndDate;
        this.PayPeriod = PayPeriod;
        this.Hours = Hours;
        this.Status = Status;
        this.Leave = Leave;
        this.LeaveMethod = LeaveMethod;
        this.Active = Active;
    }
}
  
  