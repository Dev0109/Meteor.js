import OpeningBalanceFields from "./OpeningBalanceFields";
export default class OpeningBalance {
  constructor({type, fields}) {
    this.type = type;

    if(fields instanceof OpeningBalanceFields) {
      this.fields = fields;
    }else {
      this.fields = new OpeningBalanceFields(fields);
    }
    
  }

  /**
   *
   * @param {Array} array
   * @return {OpeningBalance[]}
   */
  static fromList(array) {
    let myList = [];
    array.forEach((element) => {
      myList.push(new OpeningBalance(element));
    });

    return myList;
  }

}