Template.transaction_header.helpers({
  getUserLabel: () => {
    const cardType = Template.instance().data.cardType;
    switch(cardType){
      case "Invoice":
      case "Sales Order":
        return "Customer";
      case "Bill":
      case "PO":
      case "credit": 
        return "Supplier";
      default:
        return "Customer"
    }
  },
  getDateInputLabel: () => {
    const cardType = Template.instance().data.cardType;
    if (cardType === 'Invoice'|| cardType === 'Sales Order' || cardType === 'PO' ) return "Sales Date";
    else return "Order Date";
  }
})