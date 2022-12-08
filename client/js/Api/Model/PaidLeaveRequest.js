import PaidLeaveRequestFields from "./PaidLeaveRequestFields";
export default class PaidLeaveRequest {
  constructor({type, fields}) {
    this.type = type;

    if(fields instanceof PaidLeaveRequestFields) {
      this.fields = fields;
    }else {
      this.fields = new PaidLeaveRequestFields(fields);
    }
    
  }

  /**
   *
   * @param {Array} array
   * @return {PaidLeaveRequest[]}
   */
  static fromList(array) {
    let myList = [];
    array.forEach((element) => {
      myList.push(new PaidLeaveRequest(element));
    });

    return myList;
  }

}