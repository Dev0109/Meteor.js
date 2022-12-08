export default class ObjectManager {
  constructor() {}

  static init(className, underscored = true) {
    if (!localStorage.getItem(`object-manager-id-${className}`)) {
      localStorage.setItem(`object-manager-id-${className}`, 1); // always will start from 1
      return underscored ? '_1' : 1;
    } else {
      return underscored ? `_${this.increment(className)}` : this.increment(className);
    }
  }

  static increment(className) {
    let number = parseInt(localStorage.getItem(`object-manager-id-${className}`));
    number = number + 1;
    localStorage.setItem(`object-manager-id-${className}`, number);
    return number;
  }

//   static create(_class, obj) {
//     const id = this.init(_class); // the virtual id generated manually
//     return new _class(obj);
//   }

  static loadFromRemote(objectName) {
    
  }
}