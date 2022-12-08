import UnPaidLeaveRequestFields from "./UnPaidLeaveRequestFields";
export default class UnPaidLeaveRequest {
  constructor({type, fields}) {
    this.type = type;

    if(fields instanceof UnPaidLeaveRequestFields) {
      this.fields = fields;
    }else {
      this.fields = new UnPaidLeaveRequestFields(fields);
    }
    
  }

  /**
   *
   * @param {Array} array
   * @return {UnPaidLeaveRequest[]}
   */
  static fromList(array) {
    let myList = [];
    array.forEach((element) => {
      myList.push(new UnPaidLeaveRequest(element));
    });

    return myList;
  }

}