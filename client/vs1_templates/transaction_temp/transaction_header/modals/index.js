let template_list = ["Invoices", "Invoice Back Orders", "Delivery Docket"];

Template.template_selection_modal.helpers({
  getTemplateList: function() {
    return template_list;
  },

  getTemplateNumber: function() {
    let template_numbers = ["1", "2", "3"];
    return template_numbers;
  },
})