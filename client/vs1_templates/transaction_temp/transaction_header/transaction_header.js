Template.transaction_header.helpers({
  getUserLabel: () => {
    const cardType = Template.instance().data.cardType;
    switch(cardType){
      case "invoice":
        return "Customer";
      case "bill":
      case "po":
      case "credit": 
        return "Supplier";
      default:
        return "Customer"
    }
  },
  getDateInputLabel: () => {
    const cardType = Template.instance().data.cardType;
    if (cardType !== 'invoice') return "Sales Date";
    else return "Order Date";
  }
})