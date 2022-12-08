import PaySlipsFields from "./PaySlipsFields";
export default class PaySlips {
  constructor({type, fields}) {
    this.type = type;

    if(fields instanceof PaySlipsFields) {
      this.fields = fields;
    }else {
      this.fields = new PaySlipsFields(fields);
    }
    
  }

  /**
   *
   * @param {Array} array
   * @return {PaySlips[]}
   */
  static fromList(array) {
    let myList = [];
    array.forEach((element) => {
      myList.push(new PaySlips(element));
    });

    return myList;
  }

}