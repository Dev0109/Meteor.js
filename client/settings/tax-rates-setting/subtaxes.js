import { ReactiveVar } from 'meteor/reactive-var';
import { SideBarService } from '../../js/sidebar-service';
import { TaxRateService } from "../settings-service";
import '../../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let taxRateService = new TaxRateService();

Template.subTaxesSettings.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
});

Template.subTaxesSettings.onRendered(function () {
  $('.fullScreenSpin').css('display', 'inline-block');
  let templateObject = Template.instance();
  const dataTableList = [];
  const tableHeaderList = [];

  templateObject.getSubTaxes = function () {
    getVS1Data('TSubTaxVS1').then(function (dataObject) {
      if (dataObject.length == 0) {
        taxRateService.getSubTaxCode().then(function (data) {
          for (let i = 0; i < data.tsubtaxcode.length; i++) {
            var dataList = {
              id: data.tsubtaxcode[i].Id || '',
              codename: data.tsubtaxcode[i].Code || '-',
              description: data.tsubtaxcode[i].Description || '-',
              category: data.tsubtaxcode[i].Category || '-'
            };

            dataTableList.push(dataList);
          }

          templateObject.datatablerecords.set(dataTableList);

          if (templateObject.datatablerecords.get()) {
            Meteor.call(
              "readPrefMethod",
              Session.get("mycloudLogonID"),
              "subTaxList",
              function (error, result) {
                if (error) {
                } else {
                  if (result) {
                    for (let i = 0; i < result.customFields.length; i++) {
                      let customcolumn = result.customFields;
                      let columData = customcolumn[i].label;
                      let columHeaderUpdate = customcolumn[i].thclass.replace(
                        / /g,
                        "."
                      );
                      let hiddenColumn = customcolumn[i].hidden;
                      let columnClass = columHeaderUpdate.split(".")[1];
                      let columnWidth = customcolumn[i].width;
                      let columnindex = customcolumn[i].index + 1;

                      if (hiddenColumn == true) {
                        $("." + columnClass + "").addClass("hiddenColumn");
                        $("." + columnClass + "").removeClass("showColumn");
                      } else if (hiddenColumn == false) {
                        $("." + columnClass + "").removeClass("hiddenColumn");
                        $("." + columnClass + "").addClass("showColumn");
                      }
                    }
                  }
                }
              }
            );

          }

          $(".fullScreenSpin").css("display", "none");

          setTimeout(function () {
            $("#subTaxList")
              .DataTable({
                columnDefs: [
                  { type: "date", targets: 0 },
                  { orderable: false, targets: -1 },
                ],
                sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [
                  {
                    extend: 'excelHtml5',
                    text: '',
                    download: 'open',
                    className: "btntabletocsv hiddenColumn",
                    filename: "subtaxlist_" + moment().format(),
                    orientation: 'portrait',
                    exportOptions: {
                      columns: ":visible",
                    },
                  },
                  {
                    extend: "print",
                    download: "open",
                    className: "btntabletopdf hiddenColumn",
                    text: "",
                    title: "Sub Tax List",
                    filename: "subtaxlist_" + moment().format(),
                    exportOptions: {
                      columns: ":visible",
                    },
                    // bStateSave: true,
                    // rowId: 0,
                    // pageLength: 25,
                    paging: false,
                    //                      "scrollY": "400px",
                    //                      "scrollCollapse": true,
                    info: true,
                    responsive: true,
                    "order": [[0, "asc"]],
                    action: function () {
                      $('#subTaxList').DataTable().ajax.reload();
                    },
                  },
                  {
                    extend: "print",
                    download: "open",
                    className: "btntabletopdf hiddenColumn",
                    text: "",
                    title: "Tax Rate List",
                    filename: "subtaxlist_" + moment().format(),
                    exportOptions: {
                      columns: ":visible",
                    },
                  },
                ],
                select: true,
                destroy: true,
                // colReorder: true,
                colReorder: {
                  fixedColumnsRight: 1,
                },
                language: { search: "",searchPlaceholder: "Search List..." },
                fnInitComplete: function () {
                  $(
                    "<button class='btn btn-primary btnSearchtaxratesettings btnSearchtaxRatesList' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button><button class='btn btn-primary btnViewAllCompleted' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i><span id='lblViewAllCompleted'>" +
                    btnFilterName +
                    "</span></button>"
                  ).insertAfter("#taxRatesList_filter");
                },
                // bStateSave: true,
                // rowId: 0,
                // pageLength: 25,
                paging: false,
                //                    "scrollY": "400px",
                //                    "scrollCollapse": true,
                info: true,
                responsive: true,
                order: [[0, "asc"]],
                action: function () {
                  $("#subTaxList").DataTable().ajax.reload();
                },
                fnDrawCallback: function (oSettings) {

                },
              })
              .on("page", function () {
                let draftRecord = templateObject.datatablerecords.get();
                templateObject.datatablerecords.set(draftRecord);
              })
              .on("column-reorder", function () { })
              .on("length.dt", function (e, settings, len) {

              });

            $(".fullScreenSpin").css("display", "none");
          }, 0);

          var columns = $("#subTaxList th");
          let sTible = "";
          let sWidth = "";
          let sIndex = "";
          let sVisible = "";
          let columVisible = false;
          let sClass = "";
          $.each(columns, function (i, v) {
            if (v.hidden == false) {
              columVisible = true;
            }
            if (v.className.includes("hiddenColumn")) {
              columVisible = false;
            }
            sWidth = v.style.width.replace("px", "");

            let datatablerecordObj = {
              sTitle: v.innerText || "",
              sWidth: sWidth || "",
              sIndex: v.cellIndex || "",
              sVisible: columVisible || false,
              sClass: v.className || "",
            };
            tableHeaderList.push(datatablerecordObj);
          });
          templateObject.tableheaderrecords.set(tableHeaderList);
          $('div.dataTables_filter input').addClass('form-control form-control-sm');

        }).catch(function (err) {
          $(".fullScreenSpin").css("display", "none");
        });
      } else {
        let data = JSON.parse(dataObject[0].data);
        let useData = data.tsubtaxcode;
        for (let i = 0; i < useData.length; i++) {
          var dataList = {
            id: useData[i].Id || '',
            codename: useData[i].Code || '-',
            description: useData[i].Description || '-',
            category: useData[i].Category || '-'
          };

          dataTableList.push(dataList);
        }

        templateObject.datatablerecords.set(dataTableList);

        if (templateObject.datatablerecords.get()) {

          Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'subTaxList', function (error, result) {
            if (error) {

            } else {
              if (result) {
                for (let i = 0; i < result.customFields.length; i++) {
                  let customcolumn = result.customFields;
                  let columData = customcolumn[i].label;
                  let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                  let hiddenColumn = customcolumn[i].hidden;
                  let columnClass = columHeaderUpdate.split('.')[1];
                  let columnWidth = customcolumn[i].width;
                  let columnindex = customcolumn[i].index + 1;

                  if (hiddenColumn == true) {
                    $("." + columnClass + "").addClass('hiddenColumn');
                    $("." + columnClass + "").removeClass('showColumn');
                  } else if (hiddenColumn == false) {
                    $("." + columnClass + "").removeClass('hiddenColumn');
                    $("." + columnClass + "").addClass('showColumn');
                  }

                }
              }
            }
          });

        }

        $('.fullScreenSpin').css('display', 'none');
        setTimeout(function () {
          $('#subTaxList').DataTable({
            columnDefs: [
              { type: 'date', targets: 0 },
              { "orderable": false, "targets": -1 }
            ],
            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
            buttons: [
              {
                extend: 'excelHtml5',
                text: '',
                download: 'open',
                className: "btntabletocsv hiddenColumn",
                filename: "subtaxlist_" + moment().format(),
                orientation: 'portrait',
                exportOptions: {
                  columns: ':visible'
                }
              }, {
                extend: 'print',
                download: 'open',
                className: "btntabletopdf hiddenColumn",
                text: '',
                title: 'Tax Rate List',
                filename: "subtaxlist_" + moment().format(),
                exportOptions: {
                  columns: ':visible'
                }
              }],
            select: true,
            destroy: true,
            // colReorder: true,
            colReorder: {
              fixedColumnsRight: 1
            },
            language: { search: "",searchPlaceholder: "Search List..." },
            fnInitComplete: function () {
              $(
                "<button class='btn btn-primary btnSearchtaxratesettings btnSearchtaxRatesList' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button><button class='btn btn-primary btnViewAllCompleted' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i><span id='lblViewAllCompleted'>" +
                btnFilterName +
                "</span></button>"
              ).insertAfter("#taxRatesList_filter");
            },
            // bStateSave: true,
            // rowId: 0,
            // pageLength: 25,
            paging: false,
            //          "scrollY": "400px",
            //          "scrollCollapse": true,
            info: true,
            responsive: true,
            "order": [[0, "asc"]],
            action: function () {
              $('#subTaxList').DataTable().ajax.reload();
            },
            "fnDrawCallback": function (oSettings) {

            },

          }).on('page', function () {
            let draftRecord = templateObject.datatablerecords.get();
            templateObject.datatablerecords.set(draftRecord);
          }).on('column-reorder', function () {

          }).on('length.dt', function (e, settings, len) {

          });

          // $('#subTaxList').DataTable().column( 0 ).visible( true );
          $('.fullScreenSpin').css('display', 'none');
        }, 0);

        var columns = $('#subTaxList th');
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function (i, v) {
          if (v.hidden == false) {
            columVisible = true;
          }
          if ((v.className.includes("hiddenColumn"))) {
            columVisible = false;
          }
          sWidth = v.style.width.replace('px', "");

          let datatablerecordObj = {
            sTitle: v.innerText || '',
            sWidth: sWidth || '',
            sIndex: v.cellIndex || '',
            sVisible: columVisible || false,
            sClass: v.className || ''
          };
          tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
        $('div.dataTables_filter input').addClass('form-control form-control-sm');

      }
    }).catch(function (err) {
      taxRateService.getSubTaxCode().then(function (data) {
        for (let i = 0; i < data.tsubtaxcode.length; i++) {
          var dataList = {
            id: data.tsubtaxcode[i].Id || '',
            codename: data.tsubtaxcode[i].Code || '-',
            description: data.tsubtaxcode[i].Description || '-',
            category: data.tsubtaxcode[i].Category || '-'
          };

          dataTableList.push(dataList);
        }

        templateObject.datatablerecords.set(dataTableList);

        if (templateObject.datatablerecords.get()) {

          Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'subTaxList', function (error, result) {
            if (error) {

            } else {
              if (result) {
                for (let i = 0; i < result.customFields.length; i++) {
                  let customcolumn = result.customFields;
                  let columData = customcolumn[i].label;
                  let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                  let hiddenColumn = customcolumn[i].hidden;
                  let columnClass = columHeaderUpdate.split('.')[1];
                  let columnWidth = customcolumn[i].width;
                  let columnindex = customcolumn[i].index + 1;

                  if (hiddenColumn == true) {

                    $("." + columnClass + "").addClass('hiddenColumn');
                    $("." + columnClass + "").removeClass('showColumn');
                  } else if (hiddenColumn == false) {
                    $("." + columnClass + "").removeClass('hiddenColumn');
                    $("." + columnClass + "").addClass('showColumn');
                  }

                }
              }

            }
          });
        }

        $('.fullScreenSpin').css('display', 'none');
        setTimeout(function () {
          $('#subTaxList').DataTable({
            columnDefs: [
              { type: 'date', targets: 0 },
              { "orderable": false, "targets": -1 }
            ],
            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
            buttons: [
              {
                extend: 'excelHtml5',
                text: '',
                download: 'open',
                className: "btntabletocsv hiddenColumn",
                filename: "subtaxlist_" + moment().format(),
                orientation: 'portrait',
                exportOptions: {
                  columns: ':visible'
                }
              }, {
                extend: 'print',
                download: 'open',
                className: "btntabletopdf hiddenColumn",
                text: '',
                title: 'Tax Rate List',
                filename: "subtaxlist_" + moment().format(),
                exportOptions: {
                  columns: ':visible'
                }
              }],
            select: true,
            destroy: true,
            // colReorder: true,
            colReorder: {
              fixedColumnsRight: 1
            },
            language: { search: "",searchPlaceholder: "Search List..." },
            fnInitComplete: function () {
              $(
                "<button class='btn btn-primary btnSearchtaxratesettings btnSearchtaxRatesList' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button><button class='btn btn-primary btnViewAllCompleted' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i><span id='lblViewAllCompleted'>" +
                btnFilterName +
                "</span></button>"
              ).insertAfter("#taxRatesList_filter");
            },
            // bStateSave: true,
            // rowId: 0,
            // pageLength: 25,
            paging: false,
            //                    "scrollY": "400px",
            //                    "scrollCollapse": true,
            info: true,
            responsive: true,
            "order": [[0, "asc"]],
            action: function () {
              $('#subTaxList').DataTable().ajax.reload();
            },
            "fnDrawCallback": function (oSettings) {

            },

          }).on('page', function () {
            let draftRecord = templateObject.datatablerecords.get();
            templateObject.datatablerecords.set(draftRecord);
          }).on('column-reorder', function () {

          }).on('length.dt', function (e, settings, len) {

          });

          // $('#subTaxList').DataTable().column( 0 ).visible( true );
          $('.fullScreenSpin').css('display', 'none');
        }, 0);

        var columns = $('#subTaxList th');
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function (i, v) {
          if (v.hidden == false) {
            columVisible = true;
          }
          if ((v.className.includes("hiddenColumn"))) {
            columVisible = false;
          }
          sWidth = v.style.width.replace('px', "");

          let datatablerecordObj = {
            sTitle: v.innerText || '',
            sWidth: sWidth || '',
            sIndex: v.cellIndex || '',
            sVisible: columVisible || false,
            sClass: v.className || ''
          };
          tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
        $('div.dataTables_filter input').addClass('form-control form-control-sm');

      }).catch(function (err) {
        $('.fullScreenSpin').css('display', 'none');
      });
    });
  }

  templateObject.getSubTaxes();

  $(document).on('click', '.table-remove', function () {
    event.stopPropagation();
    var targetID = $(event.target).closest('tr').attr('id'); // table row ID
    $('#selectDeleteLineID').val(targetID);
    $('#deleteLineModal').modal('toggle');
  });

  $('#subTaxList tbody').on('click', 'tr .colName, tr .colDescription, tr .colCategory', function () {
    var listData = $(this).closest('tr').attr('id');
    if (listData) {
      $('#add-tax-title').text('Edit Sub Tax');
      $('#edtTaxCode').prop('readonly', true);
      if (listData !== '') {
        listData = Number(listData);

        var taxid = listData || "";
        var taxname = $(event.target).closest("tr").find(".colName").text() || "";
        var taxDesc = $(event.target).closest("tr").find(".colDescription").text() || "";
        var taxCate = $(event.target).closest("tr").find(".colCategory").text() || "";

        $("#edtTaxID").val(taxid);
        $("#edtTaxCode").val(taxname);
        $("#edtTaxDesc").val(taxDesc);
        $(`[name='optTaxCategory'][value='${taxCate}']`).prop("checked", true);

        $("#addSubTaxModal").modal("toggle");
      }
    }

  });
});


Template.subTaxesSettings.events({
  'click #btnNewInvoice': function (event) {
    // FlowRouter.go('/invoicecard');
  },
  'click .chkDatatable': function (event) {
    var columns = $('#subTaxList th');
    let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();

    $.each(columns, function (i, v) {
      let className = v.classList;
      let replaceClass = className[1];

      if (v.innerText == columnDataValue) {
        if ($(event.target).is(':checked')) {
          $("." + replaceClass + "").css('display', 'table-cell');
          $("." + replaceClass + "").css('padding', '.75rem');
          $("." + replaceClass + "").css('vertical-align', 'top');
        } else {
          $("." + replaceClass + "").css('display', 'none');
        }
      }
    });
  },
  'click .resetTable': function (event) {
    var getcurrentCloudDetails = CloudUser.findOne({ _id: Session.get('mycloudLogonID'), clouddatabaseID: Session.get('mycloudLogonDBID') });
    if (getcurrentCloudDetails) {
      if (getcurrentCloudDetails._id.length > 0) {
        var clientID = getcurrentCloudDetails._id;
        var clientUsername = getcurrentCloudDetails.cloudUsername;
        var clientEmail = getcurrentCloudDetails.cloudEmail;
        var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'subTaxList' });
        if (checkPrefDetails) {
          CloudPreference.remove({ _id: checkPrefDetails._id }, function (err, idTag) {
            if (err) {

            } else {
              Meteor._reload.reload();
            }
          });

        }
      }
    }
  },
  'click .saveTable': function (event) {
    let lineItems = [];
    $('.columnSettings').each(function (index) {
      var $tblrow = $(this);
      var colTitle = $tblrow.find(".divcolumn").text() || '';
      var colWidth = $tblrow.find(".custom-range").val() || 0;
      var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
      var colHidden = false;
      if ($tblrow.find(".custom-control-input").is(':checked')) {
        colHidden = false;
      } else {
        colHidden = true;
      }
      let lineItemObj = {
        index: index,
        label: colTitle,
        hidden: colHidden,
        width: colWidth,
        thclass: colthClass
      }

      lineItems.push(lineItemObj);
    });

    var getcurrentCloudDetails = CloudUser.findOne({ _id: Session.get('mycloudLogonID'), clouddatabaseID: Session.get('mycloudLogonDBID') });
    if (getcurrentCloudDetails) {
      if (getcurrentCloudDetails._id.length > 0) {
        var clientID = getcurrentCloudDetails._id;
        var clientUsername = getcurrentCloudDetails.cloudUsername;
        var clientEmail = getcurrentCloudDetails.cloudEmail;
        var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'subTaxList' });
        if (checkPrefDetails) {
          CloudPreference.update({ _id: checkPrefDetails._id }, {
            $set: {
              userid: clientID, username: clientUsername, useremail: clientEmail,
              PrefGroup: 'salesform', PrefName: 'subTaxList', published: true,
              customFields: lineItems,
              updatedAt: new Date()
            }
          }, function (err, idTag) {
            if (err) {
              $('#myModal2').modal('toggle');
            } else {
              $('#myModal2').modal('toggle');
            }
          });

        } else {
          CloudPreference.insert({
            userid: clientID, username: clientUsername, useremail: clientEmail,
            PrefGroup: 'salesform', PrefName: 'subTaxList', published: true,
            customFields: lineItems,
            createdAt: new Date()
          }, function (err, idTag) {
            if (err) {
              $('#myModal2').modal('toggle');
            } else {
              $('#myModal2').modal('toggle');
            }
          });
        }
      }
    }

  },
  'blur .divcolumn': function (event) {
    let columData = $(event.target).text();

    let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
    var datable = $('#subTaxList').DataTable();
    var title = datable.column(columnDatanIndex).header();
    $(title).html(columData);

  },
  'change .rngRange': function (event) {
    let range = $(event.target).val();
    $(event.target).closest("div.divColWidth").find(".spWidth").html(range + 'px');

    let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
    let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
    var datable = $('#subTaxList th');
    $.each(datable, function (i, v) {

      if (v.innerText == columnDataValue) {
        let className = v.className;
        let replaceClass = className.replace(/ /g, ".");
        $("." + replaceClass + "").css('width', range + 'px');

      }
    });

  },
  'click .btnOpenSettings': function (event) {
    let templateObject = Template.instance();
    var columns = $('#subTaxList th');

    const tableHeaderList = [];
    let sWidth = "";
    let columVisible = false;
    $.each(columns, function (i, v) {
      if (v.hidden == false) {
        columVisible = true;
      }
      if ((v.className.includes("hiddenColumn"))) {
        columVisible = false;
      }
      sWidth = v.style.width.replace('px', "");

      let datatablerecordObj = {
        sTitle: v.innerText || '',
        sWidth: sWidth || '',
        sIndex: v.cellIndex || '',
        sVisible: columVisible || false,
        sClass: v.className || ''
      };
      tableHeaderList.push(datatablerecordObj);
    });
    templateObject.tableheaderrecords.set(tableHeaderList);
  },
  'click .btnRefresh': function () {
    $('.fullScreenSpin').css('display', 'inline-block');
    taxRateService.getSubTaxCode().then(function (dataReload) {
      addVS1Data('TSubTaxVS1', JSON.stringify(dataReload)).then(function (datareturn) {
        location.reload(true);
      }).catch(function (err) {
        location.reload(true);
      });
    }).catch(function (err) {
      location.reload(true);
    });
  },
  'click .btnSaveSubTax': function () {
    playSaveAudio();
    setTimeout(function(){
    $('.fullScreenSpin').css('display', 'inline-block');
    let taxtID = $('#edtTaxID').val();
    let taxCode = $('#edtTaxCode').val();
    let taxDesc = $('#edtTaxDesc').val();
    let taxCate = $('[name="optTaxCategory"]:checked').val();
    let objDetails = '';
    if (taxCode === '') {
      Bert.alert('<strong>WARNING:</strong> Tax cannot be blank!', 'warning');
      $('.fullScreenSpin').css('display', 'none');
      e.preventDefault();
    }

    if (taxtID == "") {
      taxRateService
        .checkSubTaxByName(taxCode)
        .then(function (data) {
          taxtID = data.ttaxcode[0].Id;
          objDetails = {
            type: "TSubTaxCode",
            fields: {
              ID: parseInt(taxtID),
              Active: true,
              // Code: taxCode,
              Description: taxDesc,
              Category: taxCate
            },
          };
          taxRateService
            .saveSubTax(objDetails)
            .then(function (objDetails) {
              taxRateService
                .getSubTaxCode()
                .then(function (dataReload) {
                  addVS1Data("TSubTaxVS1", JSON.stringify(dataReload))
                    .then(function (datareturn) {
                      Meteor._reload.reload();
                    })
                    .catch(function (err) {
                      Meteor._reload.reload();
                    });
                })
                .catch(function (err) {
                  Meteor._reload.reload();
                });
            })
            .catch(function (err) {
              swal({
                title: "Oooops...",
                text: err,
                type: "error",
                showCancelButton: false,
                confirmButtonText: "Try Again",
              }).then((result) => {
                if (result.value) {
                  Meteor._reload.reload();
                } else if (result.dismiss === "cancel") {
                }
              });
              $(".fullScreenSpin").css("display", "none");
            });
        })
        .catch(function (err) {
          objDetails = {
            type: "TSubTaxCode",
            fields: {
              Active: true,
              Code: taxCode,
              Description: taxDesc,
              Category: taxCate,
            },
          };

          taxRateService
            .saveSubTax(objDetails)
            .then(function (objDetails) {
              taxRateService
                .getSubTaxCode()
                .then(function (dataReload) {
                  addVS1Data("TSubTaxVS1", JSON.stringify(dataReload))
                    .then(function (datareturn) {
                      Meteor._reload.reload();
                    })
                    .catch(function (err) {
                      Meteor._reload.reload();
                    });
                })
                .catch(function (err) {
                  Meteor._reload.reload();
                });
            })
            .catch(function (err) {
              swal({
                title: "Oooops...",
                text: err,
                type: "error",
                showCancelButton: false,
                confirmButtonText: "Try Again",
              }).then((result) => {
                if (result.value) {
                  Meteor._reload.reload();
                } else if (result.dismiss === "cancel") {
                }
              });
              $(".fullScreenSpin").css("display", "none");
            });
        });
    } else {
      objDetails = {
        type: "TSubTaxCode",
        fields: {
          ID: parseInt(taxtID),
          Active: true,
          Code: taxCode,
          Description: taxDesc,
          Category: taxCate,
        },
      };
      taxRateService
        .saveSubTax(objDetails)
        .then(function (objDetails) {
          taxRateService
            .getSubTaxCode()
            .then(function (dataReload) {
              addVS1Data("TSubTaxVS1", JSON.stringify(dataReload))
                .then(function (datareturn) {
                  Meteor._reload.reload();
                })
                .catch(function (err) {
                  Meteor._reload.reload();
                });
            })
            .catch(function (err) {
              Meteor._reload.reload();
            });
        })
        .catch(function (err) {
          swal({
            title: "Oooops...",
            text: err,
            type: "error",
            showCancelButton: false,
            confirmButtonText: "Try Again",
          }).then((result) => {
            if (result.value) {
              Meteor._reload.reload();
            } else if (result.dismiss === "cancel") {
            }
          });
          $(".fullScreenSpin").css("display", "none");
        });
      $('.fullScreenSpin').css('display', 'none');
    }
  }, delayTimeAfterSound);
  },
  'click .btnAddSubTax': function () {
    $('#add-tax-title').text('Add New Sub Tax');
    $('#edtTaxID').val('');
    $('#edtTaxCode').val('');
    $('#edtTaxCode').prop('readonly', false);
    $('#edtTaxDesc').val('');
  },
  'click .btnDeleteSubTax': function () {
    playDeleteAudio();
    setTimeout(function(){
    // add actions
    let taxCodeId = $('#selectDeleteLineID').val();

    let objDetails = {
      type: "TSubTaxCode",
      fields: {
        Id: parseInt(taxCodeId),
        Active: false
      }
    };

    taxRateService
      .saveSubTax(objDetails)
      .then(function (objDetails) {
        taxRateService
          .getSubTaxCode()
          .then(function (dataReload) {
            addVS1Data("TSubTaxVS1", JSON.stringify(dataReload))
              .then(function (datareturn) {
                Meteor._reload.reload();
              })
              .catch(function (err) {
                Meteor._reload.reload();
              });
          })
          .catch(function (err) {
            Meteor._reload.reload();
          });
      })
      .catch(function (err) {
        swal({
          title: "Oooops...",
          text: err,
          type: "error",
          showCancelButton: false,
          confirmButtonText: "Try Again",
        }).then((result) => {
          if (result.value) {
            Meteor._reload.reload();
          } else if (result.dismiss === "cancel") {
          }
        });
        $(".fullScreenSpin").css("display", "none");
      });
    }, delayTimeAfterSound);
    },
  "click #subTaxList td.clickable": (e) => SubTaxesEditListener(e),
  "click .table-remove": (e) => {
    e.stopPropagation();
    const targetID = $(e.target).closest("tr").attr("id"); // table row ID
    $("#selectDeleteLineID").val(targetID);
    $("#deleteLineModal").modal("toggle");
  },
  'click .btnBack': function (event) {
    playCancelAudio();
    event.preventDefault();
    setTimeout(function(){
    history.back(1);
    }, delayTimeAfterSound);
  },
  'click .btnTaxRates': function (event) {
    event.preventDefault();
    FlowRouter.go('/taxratesettings');
  }
});

Template.subTaxesSettings.helpers({
  datatablerecords: () => {
    return Template.instance().datatablerecords.get().sort(function (a, b) {
      if (a.codename == 'NA') {
        return 1;
      }
      else if (b.codename == 'NA') {
        return -1;
      }
      return (a.codename.toUpperCase() > b.codename.toUpperCase()) ? 1 : -1;
    });
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
});

Template.registerHelper('equals', function (a, b) {
  return a === b;
});

export const SubTaxesEditListener = (e) => {
  if (!e) return;

  const tr = $(e.currentTarget).parent();
  var listData = tr.attr("id");

  if (listData) {
    $("#add-tax-title").text("Edit Sub Tax");
    $("#edtTaxCode").prop("readonly", true);
    if (listData !== "") {
      listData = Number(listData);

      var taxid = listData || "";
      var taxname = tr.find(".colName").text() || "";
      var taxDesc = tr.find(".colDescription").text() || "";
      var taxCate = tr.find(".colCategory").text() || "";

      $("#edtTaxID").val(taxid);
      $("#edtTaxCode").val(taxname);
      $("#edtTaxDesc").val(taxDesc);
      $(`[name='optTaxCategory'][value='${taxCate}']`).prop("checked", true);

      $("#addSubTaxModal").modal("toggle");
    }
  }
};
