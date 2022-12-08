import PayNotesFields from "./PayNotesFields";
export default class PayNotes {
  constructor({type, fields}) {
    this.type = type;

    if(fields instanceof PayNotesFields) {
      this.fields = fields;
    }else {
      this.fields = new PayNotesFields(fields);
    }
    
  }

  /**
   *
   * @param {Array} array
   * @return {PayNotes[]}
   */
  static fromList(array) {
    let myList = [];
    array.forEach((element) => {
      myList.push(new PayNotes(element));
    });

    return myList;
  }

}