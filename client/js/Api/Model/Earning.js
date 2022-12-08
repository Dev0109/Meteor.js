import EarningFields from "./EarningFields";
export default class Earning {
  constructor({type, fields}) {
    this.type = type;

    if(fields instanceof EarningFields) {
      this.fields = fields;
    }else {
      this.fields = new EarningFields(fields);
    }
    
  }

  /**
   *
   * @param {Array} array
   * @return {Earning[]}
   */
  static fromList(array) {
    let myList = [];
    array.forEach((element) => {
      myList.push(new Earning(element));
    });

    return myList;
  }

}