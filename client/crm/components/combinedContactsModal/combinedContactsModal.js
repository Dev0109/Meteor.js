import { ReactiveVar } from "meteor/reactive-var";


Template.combinedContactsModal.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.eftOptionsList = new ReactiveVar([]);
});

Template.combinedContactsModal.onRendered(function () {
  let templateObject = Template.instance();

  let splashArrayBankNameList = [['Armidale Building Society Limited', ''], ['Adelaide Bank Limited', ''], ['Test', '']]
  $('#tblCombinedContacts').dataTable({
    data: splashArrayBankNameList,
    "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B", 
    columnDefs: [
      { className: "bankName", "targets": [0] },
      { className: "bankDescription", "targets": [1] },
    ],
    select: true,
    destroy: true,
    colReorder: true,
    pageLength: initialDatatableLoad,
    lengthMenu: [[initialDatatableLoad, -1], [initialDatatableLoad, "All"]],
    info: true,
    responsive: true,
    "fnInitComplete": function () { 
      $("<button class='btn btn-primary btnRefreshCombinedContacts' type='button' id='btnRefreshCombinedContacts' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblCombinedContacts_filter");
    }
  });

});

Template.combinedContactsModal.events({

});

Template.combinedContactsModal.helpers({
});
