import { ReactiveVar } from "meteor/reactive-var";


Template.transactionDescriptionModal.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.eftOptionsList = new ReactiveVar([]);
});

Template.transactionDescriptionModal.onRendered(function () {
  let templateObject = Template.instance();

  let splashArrayTransactionDescriptionList = [['', 'Payroll'], ['', 'Supplier'], ['', 'Insurance'], ['', 'Accounting']]
  $('#tblTransactionDescription').dataTable({
    data: splashArrayTransactionDescriptionList,
    "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    // paging: true,
    // "aaSorting": [],
    // "orderMulti": true,
    columnDefs: [
      { className: "productName", "targets": [0] },
      { className: "transactionDescription", "targets": [1] },
    ],
    select: true,
    destroy: true,
    colReorder: true,
    pageLength: initialDatatableLoad,
    lengthMenu: [[initialDatatableLoad, -1], [initialDatatableLoad, "All"]],
    info: true,
    responsive: true,
    "fnInitComplete": function () {
      $("<button class='btn btn-primary btnAddNewTransactionDescription' data-dismiss='modal' data-toggle='modal' data-target='#addTransactionDescriptionModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblTransactionDescription_filter");
      $("<button class='btn btn-primary btnRefreshTransactionDescription' type='button' id='btnRefreshTransactionDescription' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblTransactionDescription_filter");
    }
  });

});

Template.transactionDescriptionModal.events({

});

Template.transactionDescriptionModal.helpers({
});
