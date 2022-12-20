import ProfitLossLayoutFields from "./ProfitLossLayoutFields";
export default class ProfitLossLayout {
  // constructor({type, fields}) {
  //   this.type = type;
  //   if(fields instanceof ProfitLossLayoutFields) {
  //     this.fields = fields;
  //   }else {
  //     this.fields = new ProfitLossLayoutFields(fields);
  //   }
  // }

  constructor(fields) {
    //this.type = type;
    if(fields instanceof ProfitLossLayoutFields) {
      this.fields = fields;
    }else {
      this.fields = new ProfitLossLayoutFields(fields);
    }
  }

  /**
   *
   * @param {Array} array
   * @return {ProfitLossLayout[]}
   */
  static fromList(array) {
    let myList = [];
    array.forEach((element) => {
      myList.push(new ProfitLossLayout(element));
    });

    return myList;
  }

}