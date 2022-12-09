import { ReactiveVar } from "meteor/reactive-var";


Template.bankNameModal.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.eftOptionsList = new ReactiveVar([]);
});

Template.bankNameModal.onRendered(function () {
  let templateObject = Template.instance();

  let splashArrayBankNameList = [
    ['CBA', 'Commonwealth Bank'],
    ['NAB', 'National Australian Bank'],
    ['WBC', 'Westpac Bank'],
    ['MQG', 'Macquarie Bank'],
    ['ANZ', 'Australia and New Zealand Banking Group'],
    ['BEN', 'Bendigo Bank'],
    ['BOQ', 'Bank of Queensland'],
    ['VUK', 'Virgin Money'],
    ['BFL', 'BSP Financial Group'],
    ['JDO', 'Judo Bank']
  ];

  $('#tblBankName').dataTable({
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
      $("<button class='btn btn-primary btnAddNewBankName' data-dismiss='modal' data-toggle='modal' data-target='#addBankNameModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblBankName_filter");
      $("<button class='btn btn-primary btnRefreshBankName' type='button' id='btnRefreshBankName' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblBankName_filter");
    }
  });
});


Template.bankNameModal.events({

});

Template.bankNameModal.helpers({
});
