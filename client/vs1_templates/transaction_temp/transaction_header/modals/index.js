let template_list = ["Invoices", "Invoice Back Orders", "Delivery Docket", "Credits", "Bills"];

Template.template_selection_modal.helpers({
  getTemplateList: function() {
    const templateTitle = Template.instance().data.templateTitle;
    if(templateTitle === 'Invoice') {
      return ["Invoices", "Invoice Back Orders", "Delivery Docket"];
    } else if (templateTitle === "Bill") {
      return ['Bills'];
    } else if (templateTitle === "Credit") {
      return ["Credits"];
    } else if (templateTitle === "PO") {
      return ["Purchase Orders"];
    } else if (templateTitle === "Sales Order") {
      return ["Sales Order", "Delivery Docket"]
    } else {
      return [];
    }
  },

  getTemplateNumber: function() {
   return ['1', '2', '3']
  },
})