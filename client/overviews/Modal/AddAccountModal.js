import { ReactiveVar } from "meteor/reactive-var";
import { AccountService } from "../../accounts/account-service";
import { OrganisationService } from "../../js/organisation-service";
import { SideBarService } from "../../js/sidebar-service";
import LoadingOverlay from "../../LoadingOverlay";
import { TaxRateService } from "../../settings/settings-service";
import { UtilityService } from "../../utility-service";
import { bankNameList } from "../../lib/global/bank-names";

let utilityService = new UtilityService();
let sideBarService = new SideBarService();
let accountService = new AccountService();
let taxRateService = new TaxRateService();
let organisationService = new OrganisationService();

function generate() {
  let id = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  return id;
}

function MakeNegative() {}

Template.addAccountModal.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.accountList = new ReactiveVar([]);
  templateObject.accountTypes = new ReactiveVar([]);
  templateObject.expenseCategories = new ReactiveVar([]);
  templateObject.taxRates = new ReactiveVar([]);
  templateObject.bankNames = new ReactiveVar([]);
});

Template.addAccountModal.onRendered(function () {
  const generatedId = $(".generated-id").attr("id", generate());
  const currentElement = this;
  LoadingOverlay.show();
  let templateObject = Template.instance();
  const dataTableListTax = [];
  const tableHeaderListTax = [];
  let categories = [];
  templateObject.bankNames.set(bankNameList);
  templateObject.loadAccountTypes = () => {
    let accountTypeList = [];
    getVS1Data("TAccountType")
      .then(function (dataObject) {
        if (dataObject.length === 0) {
          accountService.getAccountTypeCheck().then(function (data) {
            for (let i = 0; i < data.taccounttype.length; i++) {
              let accounttyperecordObj = {
                accounttypename: data.taccounttype[i].AccountTypeName || " ",
                description: data.taccounttype[i].OriginalDescription || " ",
              };
              accountTypeList.push(accounttyperecordObj);
            }
            templateObject.accountTypes.set(accountTypeList);
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.taccounttype;

          for (let i = 0; i < useData.length; i++) {
            let accounttyperecordObj = {
              accounttypename: useData[i].AccountTypeName || " ",
              description: useData[i].OriginalDescription || " ",
            };
            accountTypeList.push(accounttyperecordObj);
          }
          templateObject.accountTypes.set(accountTypeList);
        }
      })
      .catch(function (err) {
        accountService.getAccountTypeCheck().then(function (data) {
          for (let i = 0; i < data.taccounttype.length; i++) {
            let accounttyperecordObj = {
              accounttypename: data.taccounttype[i].AccountTypeName || " ",
              description: data.taccounttype[i].OriginalDescription || " ",
            };
            accountTypeList.push(accounttyperecordObj);
          }
          templateObject.accountTypes.set(accountTypeList);
        });
      });
  };
  templateObject.loadAccountTypes();

  $("#sltBankCodes").editableSelect();
  $("#sltBankCodes")
    .editableSelect()
    .on("click.editable-select", function (e, li) {
      var $earch = $(this);
      var offset = $earch.offset();
      var bankName = e.target.value || "";

      if (e.pageX > offset.left + $earch.width() - 8) {
        $("#eftBankCodesModal").modal('toggle');
        $(".fullScreenSpin").css("display", "none");

      } else {
        if (bankName.replace(/\s/g, "") != "") {
          $("#eftBankCodesModal").modal("toggle");
        } else {
          $("#eftBankCodesModal").modal('toggle');
        }
      }
    });

    $(document).on("click", "#tblBankCode tbody tr", function (e) {
      var table = $(this);
      let BankName = table.find(".bankCode").text();
      $('#eftBankCodesModal').modal('toggle');
      $('#eftBankCodesModal').val(BankName);
    });

  $("#edtBankName").editableSelect();
  $("#edtBankName")
    .editableSelect()
    .on("click.editable-select", function (e, li) {
      var $earch = $(this);
      var offset = $earch.offset();
      var bankName = e.target.value || "";

      if (e.pageX > offset.left + $earch.width() - 8) {
        $("#bankNameModal").modal();
        $(".fullScreenSpin").css("display", "none");

      } else {
        if (bankName.replace(/\s/g, "") != "") {
          $("#bankNameModal").modal("toggle");
        } else {
          $("#bankNameModal").modal();
        }
      }
    });

    $(document).on("click", "#tblBankName tbody tr", function (e) {
      var table = $(this);
      let BankName = table.find(".bankName").text();
      $('#bankNameModal').modal('toggle');
      $('#edtBankName').val(BankName);
    });

    this.$("#sltTaxCode").editableSelect();
      this.$("#sltTaxCode")
        .editableSelect()
        .on("click.editable-select", function (e, li) {
          var $earch = $(this);
          var taxSelected = "sales";
          var offset = $earch.offset();
          var taxRateDataName = e.target.value || "";
          if (e.pageX > offset.left + $earch.width() - 8) {
            // X button 16px wide?
            // $("#taxRateListModal").modal("toggle");
            $("#taxRateModal").modal("toggle");
          } else {
            if (taxRateDataName.replace(/\s/g, "") !== "") {
              $(".taxcodepopheader").text("Edit Tax Rate");

              getVS1Data("TTaxcodeVS1")
                .then(function (dataObject) {
                  if (dataObject.length === 0) {
                    purchaseService
                      .getTaxCodesVS1()
                      .then(function (data) {
                        let lineItems = [];
                        let lineItemObj = {};
                        for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                          if (
                            data.ttaxcodevs1[i].CodeName === taxRateDataName
                          ) {
                            $("#edtTaxNamePop").attr("readonly", true);
                            let taxRate = (
                              data.ttaxcodevs1[i].Rate * 100
                            ).toFixed(2);
                            var taxRateID = data.ttaxcodevs1[i].Id || "";
                            var taxRateName =
                              data.ttaxcodevs1[i].CodeName || "";
                            var taxRateDesc =
                              data.ttaxcodevs1[i].Description || "";
                            $("#edtTaxID").val(taxRateID);
                            $("#edtTaxNamePop").val(taxRateName);
                            $("#edtTaxRatePop").val(taxRate);
                            $("#edtTaxDescPop").val(taxRateDesc);
                            setTimeout(function () {
                              // $("#newTaxRateModal").modal("toggle");
                              $("#taxRateModal").modal("toggle");
                            }, 100);
                          }
                        }
                      })
                      .catch(function (err) {
                        // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                        $(".fullScreenSpin").css("display", "none");
                        // Meteor._reload.reload();
                      });
                  } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.ttaxcodevs1;
                    let lineItems = [];
                    let lineItemObj = {};
                    $(".taxcodepopheader").text("Edit Tax Rate");
                    for (let i = 0; i < useData.length; i++) {
                      if (useData[i].CodeName === taxRateDataName) {
                        $("#edtTaxNamePop").attr("readonly", true);
                        let taxRate = (useData[i].Rate * 100).toFixed(2);
                        var taxRateID = useData[i].Id || "";
                        var taxRateName = useData[i].CodeName || "";
                        var taxRateDesc = useData[i].Description || "";
                        $("#edtTaxID").val(taxRateID);
                        $("#edtTaxNamePop").val(taxRateName);
                        $("#edtTaxRatePop").val(taxRate);
                        $("#edtTaxDescPop").val(taxRateDesc);
                        // setTimeout(function() {
                        // $("#newTaxRateModal").modal("toggle");
                        $("#taxRateModal").modal("toggle");
                        // }, 500);
                      }
                    }
                  }
                })
                .catch(function (err) {
                  purchaseService
                    .getTaxCodesVS1()
                    .then(function (data) {
                      let lineItems = [];
                      let lineItemObj = {};
                      for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                        if (data.ttaxcodevs1[i].CodeName === taxRateDataName) {
                          $("#edtTaxNamePop").attr("readonly", true);
                          let taxRate = (
                            data.ttaxcodevs1[i].Rate * 100
                          ).toFixed(2);
                          var taxRateID = data.ttaxcodevs1[i].Id || "";
                          var taxRateName = data.ttaxcodevs1[i].CodeName || "";
                          var taxRateDesc =
                            data.ttaxcodevs1[i].Description || "";
                          $("#edtTaxID").val(taxRateID);
                          $("#edtTaxNamePop").val(taxRateName);
                          $("#edtTaxRatePop").val(taxRate);
                          $("#edtTaxDescPop").val(taxRateDesc);
                          setTimeout(function () {
                            // $("#newTaxRateModal").modal("toggle");
                            $("#taxRateModal").modal("toggle");
                          }, 100);
                        }
                      }
                    })
                    .catch(function (err) {
                      // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                      $(".fullScreenSpin").css("display", "none");
                      // Meteor._reload.reload();
                    });
                });
            } else {
              // $("#taxRateListModal").modal("toggle");
              $("#taxRateModal").modal("toggle");
            }
          }
        });

        $(document).on("click", "#tblTaxRate tbody tr", (e) => {
          var table = $(e.currentTarget);
          let lineTaxCode = table.find(".taxName").text();
          currentElement.$(".sltTaxCode").val(lineTaxCode);
          $("#taxRateListModal").modal("toggle");
        });

  templateObject.getTaxRates = function () {
    getVS1Data("TTaxcodeVS1")
      .then(function (dataObject) {
        if (dataObject.length == 0) {
          taxRateService
            .getTaxRateVS1()
            .then(function (data) {
              let lineItems = [];
              let lineItemObj = {};
              for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2) + "%";
                var dataList = {
                  id: data.ttaxcodevs1[i].Id || "",
                  codename: data.ttaxcodevs1[i].CodeName || "-",
                  description: data.ttaxcodevs1[i].Description || "-",
                  region: data.ttaxcodevs1[i].RegionName || "-",
                  rate: taxRate || "-",
                };

                dataTableListTax.push(dataList);
                //}
              }

              templateObject.taxRates.set(dataTableListTax);

              if (templateObject.taxRates.get()) {
                Meteor.call(
                  "readPrefMethod",
                  Session.get("mycloudLogonID"),
                  "taxRatesList",
                  function (error, result) {
                    if (error) {
                    } else {
                      if (result) {
                        for (let i = 0; i < result.customFields.length; i++) {
                          let customcolumn = result.customFields;
                          let columData = customcolumn[i].label;
                          let columHeaderUpdate = customcolumn[
                            i
                          ].thclass.replace(/ /g, ".");
                          let hiddenColumn = customcolumn[i].hidden;
                          let columnClass = columHeaderUpdate.split(".")[1];
                          let columnWidth = customcolumn[i].width;
                          let columnindex = customcolumn[i].index + 1;

                          if (hiddenColumn == true) {
                            $("." + columnClass + "").addClass("hiddenColumn");
                            $("." + columnClass + "").removeClass("showColumn");
                          } else if (hiddenColumn == false) {
                            $("." + columnClass + "").removeClass(
                              "hiddenColumn"
                            );
                            $("." + columnClass + "").addClass("showColumn");
                          }
                        }
                      }
                    }
                  }
                );

                setTimeout(function () {
                  MakeNegative();
                }, 100);
              }

              $(".fullScreenSpin").css("display", "none");
              setTimeout(function () {
                $("#taxRatesList")
                  .DataTable({
                    columnDefs: [
                      {
                        type: "date",
                        targets: 0,
                      },
                      {
                        orderable: false,
                        targets: -1,
                      },
                    ],
                    sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                    buttons: [
                      {
                        extend: "excelHtml5",
                        text: "",
                        download: "open",
                        className: "btntabletocsv hiddenColumn",
                        filename: "taxratelist_" + moment().format(),
                        orientation: "portrait",
                        exportOptions: {
                          columns: ":visible",
                        },
                      },
                      {
                        extend: "print",
                        download: "open",
                        className: "btntabletopdf hiddenColumn",
                        text: "",
                        title: "Tax Rate List",
                        filename: "taxratelist_" + moment().format(),
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
                    // bStateSave: true,
                    // rowId: 0,
                    // pageLength: 25,
                    paging: false,
                    //                      "scrollY": "400px",
                    //                      "scrollCollapse": true,
                    info: true,
                    responsive: true,
                    order: [[0, "asc"]],
                    action: function () {
                      $("#taxRatesList").DataTable().ajax.reload();
                    },
                    fnDrawCallback: function (oSettings) {
                      setTimeout(function () {
                        MakeNegative();
                      }, 100);
                    },
                  })
                  .on("page", function () {
                    setTimeout(function () {
                      MakeNegative();
                    }, 100);
                    let draftRecord = templateObject.taxRates.get();
                    templateObject.taxRates.set(draftRecord);
                  })
                  .on("column-reorder", function () {})
                  .on("length.dt", function (e, settings, len) {
                    setTimeout(function () {
                      MakeNegative();
                    }, 100);
                  });

                // $('#taxRatesList').DataTable().column( 0 ).visible( true );
                $(".fullScreenSpin").css("display", "none");
              }, 0);

              var columns = $("#taxRatesList th");
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
                tableHeaderListTax.push(datatablerecordObj);
              });
              $("div.dataTables_filter input").addClass(
                "form-control form-control-sm"
              );
            })
            .catch(function (err) {
              // Bert.alert('<strong>' + err + '</strong>!', 'danger');
              $(".fullScreenSpin").css("display", "none");
              // Meteor._reload.reload();
            });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.ttaxcodevs1;
          let lineItems = [];
          let lineItemObj = {};
          for (let i = 0; i < useData.length; i++) {
            let taxRate = (useData[i].Rate * 100).toFixed(2) + "%";
            var dataList = {
              id: useData[i].Id || "",
              codename: useData[i].CodeName || "-",
              description: useData[i].Description || "-",
              region: useData[i].RegionName || "-",
              rate: taxRate || "-",
            };

            dataTableListTax.push(dataList);
            //}
          }

          templateObject.taxRates.set(dataTableListTax);

          if (templateObject.taxRates.get()) {
            Meteor.call(
              "readPrefMethod",
              Session.get("mycloudLogonID"),
              "taxRatesList",
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

            setTimeout(function () {
              MakeNegative();
            }, 100);
          }

          $(".fullScreenSpin").css("display", "none");
          setTimeout(function () {
            $("#taxRatesList")
              .DataTable({
                columnDefs: [
                  {
                    type: "date",
                    targets: 0,
                  },
                  {
                    orderable: false,
                    targets: -1,
                  },
                ],
                sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [
                  {
                    extend: "excelHtml5",
                    text: "",
                    download: "open",
                    className: "btntabletocsv hiddenColumn",
                    filename: "taxratelist_" + moment().format(),
                    orientation: "portrait",
                    exportOptions: {
                      columns: ":visible",
                    },
                  },
                  {
                    extend: "print",
                    download: "open",
                    className: "btntabletopdf hiddenColumn",
                    text: "",
                    title: "Tax Rate List",
                    filename: "taxratelist_" + moment().format(),
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
                // bStateSave: true,
                // rowId: 0,
                // pageLength: 25,
                paging: false,
                //          "scrollY": "400px",
                //          "scrollCollapse": true,
                info: true,
                responsive: true,
                order: [[0, "asc"]],
                action: function () {
                  $("#taxRatesList").DataTable().ajax.reload();
                },
                fnDrawCallback: function (oSettings) {
                  setTimeout(function () {
                    MakeNegative();
                  }, 100);
                },
              })
              .on("page", function () {
                setTimeout(function () {
                  MakeNegative();
                }, 100);
                let draftRecord = templateObject.taxRates.get();
                templateObject.taxRates.set(draftRecord);
              })
              .on("column-reorder", function () {})
              .on("length.dt", function (e, settings, len) {
                setTimeout(function () {
                  MakeNegative();
                }, 100);
              });

            // $('#taxRatesList').DataTable().column( 0 ).visible( true );
            $(".fullScreenSpin").css("display", "none");
          }, 0);

          var columns = $("#taxRatesList th");
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
            tableHeaderListTax.push(datatablerecordObj);
          });
          $("div.dataTables_filter input").addClass(
            "form-control form-control-sm"
          );
        }
      })
      .catch(function (err) {
        taxRateService
          .getTaxRateVS1()
          .then(function (data) {
            let lineItems = [];
            let lineItemObj = {};
            for (let i = 0; i < data.ttaxcodevs1.length; i++) {
              let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2) + "%";
              var dataList = {
                id: data.ttaxcodevs1[i].Id || "",
                codename: data.ttaxcodevs1[i].CodeName || "-",
                description: data.ttaxcodevs1[i].Description || "-",
                region: data.ttaxcodevs1[i].RegionName || "-",
                rate: taxRate || "-",
              };

              dataTableListTax.push(dataList);
              //}
            }

            templateObject.taxRates.set(dataTableListTax);

            if (templateObject.taxRates.get()) {
              Meteor.call(
                "readPrefMethod",
                Session.get("mycloudLogonID"),
                "taxRatesList",
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

              setTimeout(function () {
                MakeNegative();
              }, 100);
            }

            $(".fullScreenSpin").css("display", "none");
            setTimeout(function () {
              $("#taxRatesList")
                .DataTable({
                  columnDefs: [
                    {
                      type: "date",
                      targets: 0,
                    },
                    {
                      orderable: false,
                      targets: -1,
                    },
                  ],
                  sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                  buttons: [
                    {
                      extend: "excelHtml5",
                      text: "",
                      download: "open",
                      className: "btntabletocsv hiddenColumn",
                      filename: "taxratelist_" + moment().format(),
                      orientation: "portrait",
                      exportOptions: {
                        columns: ":visible",
                      },
                    },
                    {
                      extend: "print",
                      download: "open",
                      className: "btntabletopdf hiddenColumn",
                      text: "",
                      title: "Tax Rate List",
                      filename: "taxratelist_" + moment().format(),
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
                    $("#taxRatesList").DataTable().ajax.reload();
                  },
                  fnDrawCallback: function (oSettings) {
                    setTimeout(function () {
                      MakeNegative();
                    }, 100);
                  },
                })
                .on("page", function () {
                  setTimeout(function () {
                    MakeNegative();
                  }, 100);
                  let draftRecord = templateObject.taxRates.get();
                  templateObject.taxRates.set(draftRecord);
                })
                .on("column-reorder", function () {})
                .on("length.dt", function (e, settings, len) {
                  setTimeout(function () {
                    MakeNegative();
                  }, 100);
                });

              // $('#taxRatesList').DataTable().column( 0 ).visible( true );
              $(".fullScreenSpin").css("display", "none");
            }, 0);

            var columns = $("#taxRatesList th");
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
              tableHeaderListTax.push(datatablerecordObj);
            });
            $("div.dataTables_filter input").addClass(
              "form-control form-control-sm"
            );
          })
          .catch(function (err) {
            // Bert.alert('<strong>' + err + '</strong>!', 'danger');
            $(".fullScreenSpin").css("display", "none");
            // Meteor._reload.reload();
          });
      });
  };
  templateObject.getTaxRates();

  templateObject.deleteAccount = async () => {
    let result = await swal({
      title: "Delete Account",
      text: "Are you sure you want to Delete Account?",
      type: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });

    if (result.value) {
      LoadingOverlay.show();
      let templateObject = Template.instance();
      let accountService = new AccountService();
      let accountID = $("#edtAccountID").val();

      let data = {
        type: "TAccount",
        fields: {
          ID: accountID,
          Active: false,
        },
      };

      accountService
        .saveAccount(data)
        .then(() => {
          $(".modal.show").modal("hide");
          $(".setup-wizard")
            ? $(".setup-wizard .setup-step-6 .btnRefresh").click()
            : Meteor._reload.reload();
          LoadingOverlay.hide();
        })
        .catch((err) => {
          LoadingOverlay.hide();
          swal({
            title: "Oooops...",
            text: err,
            type: "error",
            showCancelButton: false,
            confirmButtonText: "Try Again",
          });
        });

      // LoadingOverlay.hide();
    }

    // swal({
    //   title: "Delete Account",
    //   text: "Are you sure you want to Delete Account?",
    //   type: "question",
    //   showCancelButton: true,
    //   confirmButtonText: "Yes",
    // }).then((result) => {
    //   if (result.value) {
    //     LoadingOverlay.show();
    //     let templateObject = Template.instance();
    //     let accountService = new AccountService();
    //     let accountID = $("#edtAccountID").val();

    //     if (accountID == "") {
    //       $('.setup-wizard') ? $('.setup-wizard .setup-step-6 .btnRefresh').click() : window.open("/accountsoverview", "_self");
    //     } else {
    //       data = {
    //         type: "TAccount",
    //         fields: {
    //           ID: accountID,
    //           Active: false,
    //         },
    //       };

    //       accountService
    //         .saveAccount(data)
    //         .then(function (data) {
    //           sideBarService
    //             .getAccountListVS1()
    //             .then(function (dataReload) {
    //               addVS1Data("TAccountVS1", JSON.stringify(dataReload))
    //                 .then(function (datareturn) {
    //                   $('.modal.show').modal("hide");
    //                   $('.setup-wizard') ? $('.setup-wizard .setup-step-6 .btnRefresh').click() : window.open("/accountsoverview", "_self");
    //                 })
    //                 .catch(function (err) {
    //                   $('.setup-wizard') ? $('.setup-wizard .setup-step-6 .btnRefresh').click() : window.open("/accountsoverview", "_self");
    //                 });
    //             })
    //             .catch(function (err) {
    //               $('.setup-wizard') ? $('.setup-wizard .setup-step-6 .btnRefresh').click() : window.open("/accountsoverview", "_self");
    //             });
    //         })
    //         .catch(function (err) {
    //           swal({
    //             title: "Oooops...",
    //             text: err,
    //             type: "error",
    //             showCancelButton: false,
    //             confirmButtonText: "Try Again",
    //           }).then((result) => {
    //             if (result.value) {
    //               $('.setup-wizard') ? $('.setup-wizard .setup-step-6 .btnRefresh').click() : Meteor._reload.reload();
    //             } else if (result.dismiss === "cancel") {
    //             }
    //           });
    //           LoadingOverlay.hide();
    //         });
    //     }
    //   } else {
    //   }
    // });
  };

  $(document).ready(function () {
    setTimeout(function () {
      // this.$(".sltTaxCode").editableSelect();
      // this.$(".sltTaxCode")
      //   .editableSelect()
      //   .on("click.editable-select", function (e, li) {
      //     var $earch = $(this);
      //     var taxSelected = "sales";
      //     var offset = $earch.offset();
      //     var taxRateDataName = e.target.value || "";
      //     if (e.pageX > offset.left + $earch.width() - 8) {
      //       // X button 16px wide?
      //       $("#taxRateListModal").modal("toggle");
      //     } else {
      //       if (taxRateDataName.replace(/\s/g, "") !== "") {
      //         $(".taxcodepopheader").text("Edit Tax Rate");

      //         getVS1Data("TTaxcodeVS1")
      //           .then(function (dataObject) {
      //             if (dataObject.length === 0) {
      //               purchaseService
      //                 .getTaxCodesVS1()
      //                 .then(function (data) {
      //                   let lineItems = [];
      //                   let lineItemObj = {};
      //                   for (let i = 0; i < data.ttaxcodevs1.length; i++) {
      //                     if (
      //                       data.ttaxcodevs1[i].CodeName === taxRateDataName
      //                     ) {
      //                       $("#edtTaxNamePop").attr("readonly", true);
      //                       let taxRate = (
      //                         data.ttaxcodevs1[i].Rate * 100
      //                       ).toFixed(2);
      //                       var taxRateID = data.ttaxcodevs1[i].Id || "";
      //                       var taxRateName =
      //                         data.ttaxcodevs1[i].CodeName || "";
      //                       var taxRateDesc =
      //                         data.ttaxcodevs1[i].Description || "";
      //                       $("#edtTaxID").val(taxRateID);
      //                       $("#edtTaxNamePop").val(taxRateName);
      //                       $("#edtTaxRatePop").val(taxRate);
      //                       $("#edtTaxDescPop").val(taxRateDesc);
      //                       setTimeout(function () {
      //                         $("#newTaxRateModal").modal("toggle");
      //                       }, 100);
      //                     }
      //                   }
      //                 })
      //                 .catch(function (err) {
      //                   // Bert.alert('<strong>' + err + '</strong>!', 'danger');
      //                   $(".fullScreenSpin").css("display", "none");
      //                   // Meteor._reload.reload();
      //                 });
      //             } else {
      //               let data = JSON.parse(dataObject[0].data);
      //               let useData = data.ttaxcodevs1;
      //               let lineItems = [];
      //               let lineItemObj = {};
      //               $(".taxcodepopheader").text("Edit Tax Rate");
      //               for (let i = 0; i < useData.length; i++) {
      //                 if (useData[i].CodeName === taxRateDataName) {
      //                   $("#edtTaxNamePop").attr("readonly", true);
      //                   let taxRate = (useData[i].Rate * 100).toFixed(2);
      //                   var taxRateID = useData[i].Id || "";
      //                   var taxRateName = useData[i].CodeName || "";
      //                   var taxRateDesc = useData[i].Description || "";
      //                   $("#edtTaxID").val(taxRateID);
      //                   $("#edtTaxNamePop").val(taxRateName);
      //                   $("#edtTaxRatePop").val(taxRate);
      //                   $("#edtTaxDescPop").val(taxRateDesc);
      //                   // setTimeout(function() {
      //                   $("#newTaxRateModal").modal("toggle");
      //                   // }, 500);
      //                 }
      //               }
      //             }
      //           })
      //           .catch(function (err) {
      //             purchaseService
      //               .getTaxCodesVS1()
      //               .then(function (data) {
      //                 let lineItems = [];
      //                 let lineItemObj = {};
      //                 for (let i = 0; i < data.ttaxcodevs1.length; i++) {
      //                   if (data.ttaxcodevs1[i].CodeName === taxRateDataName) {
      //                     $("#edtTaxNamePop").attr("readonly", true);
      //                     let taxRate = (
      //                       data.ttaxcodevs1[i].Rate * 100
      //                     ).toFixed(2);
      //                     var taxRateID = data.ttaxcodevs1[i].Id || "";
      //                     var taxRateName = data.ttaxcodevs1[i].CodeName || "";
      //                     var taxRateDesc =
      //                       data.ttaxcodevs1[i].Description || "";
      //                     $("#edtTaxID").val(taxRateID);
      //                     $("#edtTaxNamePop").val(taxRateName);
      //                     $("#edtTaxRatePop").val(taxRate);
      //                     $("#edtTaxDescPop").val(taxRateDesc);
      //                     setTimeout(function () {
      //                       $("#newTaxRateModal").modal("toggle");
      //                     }, 100);
      //                   }
      //                 }
      //               })
      //               .catch(function (err) {
      //                 // Bert.alert('<strong>' + err + '</strong>!', 'danger');
      //                 $(".fullScreenSpin").css("display", "none");
      //                 // Meteor._reload.reload();
      //               });
      //           });
      //       } else {
      //         $("#taxRateListModal").modal("toggle");
      //       }
      //     }
      //   });
    }, 1000);

    // $(document).on("click", "#tblTaxRate tbody tr", (e) => {
    //   var table = $(e.currentTarget);
    //   let lineTaxCode = table.find(".taxName").text();
    //   currentElement.$(".sltTaxCode").val(lineTaxCode);
    //   $("#taxRateListModal").modal("toggle");
    // });
  });

    templateObject.getReceiptCategoryList = function(){
        getVS1Data('TReceiptCategory').then(function (dataObject) {
            if(dataObject.length == 0){
                sideBarService.getReceiptCategory().then(function(data){
                    setReceiptCategory(data);
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                setReceiptCategory(data);
            }
        }).catch(function (err) {
            sideBarService.getReceiptCategory().then(function(data){
                setReceiptCategory(data);
            });
        });
    };
    function setReceiptCategory(data) {
        for (let i in data.treceiptcategory){
            if (data.treceiptcategory.hasOwnProperty(i)) {
                if (data.treceiptcategory[i].CategoryName != "") {
                    categories.push(data.treceiptcategory[i].CategoryName);
                }
            }
        }
        $('.fullScreenSpin').css('display','none');
        templateObject.getAllAccounts();
    }
    templateObject.getReceiptCategoryList();

    templateObject.getAllAccounts = function() {
        getVS1Data('TAccountVS1').then(function(dataObject) {
            if (dataObject.length === 0) {
                sideBarService.getAccountListVS1().then(function(data) {
                    getExpenseCategories(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                getExpenseCategories(data);
            }
        }).catch(function(err) {
            sideBarService.getAccountListVS1().then(function(data) {
                getExpenseCategories(data);
            });
        });
    };
    function getExpenseCategories(data) {
        //'Materials', 'Meals & Entertainment', 'Office Supplies', 'Travel', 'Vehicle'
        let usedCategories = [];
        for (let i = 0; i < data.taccountvs1.length; i++) {
            if(data.taccountvs1[i].fields.ReceiptCategory && data.taccountvs1[i].fields.ReceiptCategory != ''){
                usedCategories.push(data.taccountvs1[i].fields.ReceiptCategory);
            }
        }
        usedCategories = [...new Set(usedCategories)];
        let result = categories.filter((item) => !usedCategories.includes(item));
        templateObject.expenseCategories.set(result);
    }

  // tempcode
  // $("#sltBankCodes").editableSelect();
  // $("#sltBankCodes")
  //   .editableSelect()
  //   .on("click.editable-select", function (e, li) {
  //     var $earch = $(this);
  //     var offset = $earch.offset();
  //     var bankName = e.target.value || "";

  //     if (e.pageX > offset.left + $earch.width() - 8) {
  //       // $("#bankCodeModal").modal();
  //       $("#eftBankCodesModal").modal();
  //       $(".fullScreenSpin").css("display", "none");

  //     } else {
  //       if (bankName.replace(/\s/g, "") != "") {
  //         // $("#bankCodeModal").modal("toggle");
  //         $("#eftBankCodesModal").modal("toggle");
  //       } else {
  //         // $("#bankCodeModal").modal();
  //         $("#eftBankCodesModal").modal();
  //       }
  //     }
  //   });

  // $(document).on("click", "#tblBankCode tbody tr", function (e) {
  //   var table = $(this);
  //   let bankCode = table.find(".bankCode").text();
  //   // $('#bankCodeModal').modal('toggle');
  //   $("#eftBankCodesModal").modal("toggle");
  //   $('#sltBankCodes').val(bankCode);
  // });
  // tempcode
});

Template.addAccountModal.events({
  "blur #apcaNo": function (e) {
    let apcaNo = $("#apcaNo").val();
    if(apcaNo) {
      swal({
        title: `Attention!`,
        html: `<p>You need to ensure that any Supplier or Employee you wish to pay via EFT, has the banking details setup.</p> <p>Do you wish to add banking details to a Supplier or Employee now?</p>
              <br>
              <button type="button" class="btn btn-success btn-add-to-employee swl-cstm-btn-yes-sbmt-rqst">Add to Employee</button>
              <button type="button" class="btn btn-success btn-add-to-supplier swl-cstm-btn-no-jst-prceed">Add to Supplier</button>
              <button type="button" class="btn btn-secondary btn-apca-cancel swl-cstm-btn-cancel" ><i class="fa fa-close" style="margin-right: 5px;"></i>Close</button><br><br>`,
        showCancelButton: false,
        showConfirmButton: false,
        type: "warning",
        onBeforeOpen: () => {
            const employee = document.querySelector('.btn-add-to-employee')
            const supplier = document.querySelector('.btn-add-to-supplier')
            const cancel = document.querySelector('.btn-apca-cancel')

            let edtBankName = $('#edtBankName').val();
            let edtBankAccountName = $('#edtBankAccountName').val();
            let edtBSB = $('#edtBSB').val();
            let edtBankAccountNo = $('#edtBankAccountNo').val();
            let swiftCode = $('#swiftCode').val();
            let apcaNo = $('#apcaNo').val();
            let routingNo = $('#routingNo').val();
            let sltBankCodes = $('#sltBankCodes').val();
            let params = 'bank=true&edtBankName='+edtBankName+'&edtBankAccountName='+edtBankAccountName+'&edtBSB='+edtBSB+'&edtBankAccountNo='+edtBankAccountNo+'&swiftCode='+swiftCode+'&apcaNo='+apcaNo+'&routingNo='+routingNo+'&sltBankCodes='+sltBankCodes

            employee.addEventListener('click', () => {
                swal.close();
                $("#addNewAccount").modal("toggle");
                setTimeout(() => {
                  FlowRouter.go('/employeelist?'+params);
                }, 150);
            })

            supplier.addEventListener('click', () => {
                swal.close();
                $("#addNewAccount").modal("toggle");
                setTimeout(() => {
                  FlowRouter.go('/supplierlist?'+params);
                }, 150);
            })

            cancel.addEventListener('click', () => {
                swal.close();
            })
        }
      })
    }
  },

  "click .btnSaveAccount": function () {
    playSaveAudio();
    let templateObject = Template.instance();
    let accountService = new AccountService();
    let organisationService = new OrganisationService();
    setTimeout(function(){
    LoadingOverlay.show();

    let forTransaction = false;
    if ($("#showOnTransactions").is(":checked")) {
      forTransaction = true;
    }
    let accountID = $("#edtAccountID").val();
    var accounttype = $("#sltAccountType").val();
    var accountname = $("#edtAccountName").val();
    var accountno = $("#edtAccountNo").val();
    var taxcode = $("#sltTaxCode").val();
    var accountdesc = $("#txaAccountDescription").val();
    var swiftCode = $("#swiftCode").val();
    var routingNo = $("#routingNo").val();
    // var comments = $('#txaAccountComments').val();
    var bankname = $("#edtBankName").val();
    var bankaccountname = $("#edtBankAccountName").val();
    var bankbsb = $("#edtBSB").val();
    var bankacountno = $("#edtBankAccountNo").val();
    // let isBankAccount = templateObject.isBankAccount.get();

    var expirydateTime = new Date($("#edtExpiryDate").datepicker("getDate"));
    let cardnumber = $("#edtCardNumber").val();
    let cardcvc = $("#edtCvc").val();
    let expiryDate =
      expirydateTime.getFullYear() +
      "-" +
      (expirydateTime.getMonth() + 1) +
      "-" +
      expirydateTime.getDate();

    let companyID = 1;
    let data = "";
    if (accountID == "") {
      accountService
        .getCheckAccountData(accountname)
        .then(function (data) {
          accountID = parseInt(data.taccount[0].Id) || 0;
          data = {
            type: "TAccount",
            fields: {
              ID: accountID,
              // AccountName: accountname|| '',
              AccountNumber: accountno || "",
              // AccountTypeName: accounttype|| '',
              Active: true,
              BankAccountName: bankaccountname || "",
              BankAccountNumber: bankacountno || "",
              BSB: bankbsb || "",
              Description: accountdesc || "",
              TaxCode: taxcode || "",
              PublishOnVS1: true,
              Extra: swiftCode,
              BankNumber: routingNo,
              IsHeader: forTransaction,
              CarNumber: cardnumber || "",
              CVC: cardcvc || "",
              ExpiryDate: expiryDate || "",
            },
          };

          accountService
            .saveAccount(data)
            .then(function (data) {
              if ($("#showOnTransactions").is(":checked")) {
                var objDetails = {
                  type: "TCompanyInfo",
                  fields: {
                    Id: companyID,
                    AccountNo: bankacountno,
                    BankBranch: swiftCode,
                    BankAccountName: bankaccountname,
                    BankName: bankname,
                    Bsb: bankbsb,
                    SiteCode: routingNo,
                    FileReference: accountname,
                  },
                };
                organisationService
                  .saveOrganisationSetting(objDetails)
                  .then(function (data) {
                    var accNo = bankacountno || "";
                    var swiftCode1 = swiftCode || "";
                    var bankAccName = bankaccountname || "";
                    var accountName = accountname || "";
                    var bsb = bankbsb || "";
                    var routingNo = routingNo || "";

                    localStorage.setItem("vs1companyBankName", bankname);
                    localStorage.setItem(
                      "vs1companyBankAccountName",
                      bankAccName
                    );
                    localStorage.setItem("vs1companyBankAccountNo", accNo);
                    localStorage.setItem("vs1companyBankBSB", bsb);
                    localStorage.setItem("vs1companyBankSwiftCode", swiftCode1);
                    localStorage.setItem("vs1companyBankRoutingNo", routingNo);
                    sideBarService
                      .getAccountListVS1()
                      .then(function (dataReload) {
                        addVS1Data("TAccountVS1", JSON.stringify(dataReload))
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
                    sideBarService
                      .getAccountListVS1()
                      .then(function (dataReload) {
                        addVS1Data("TAccountVS1", JSON.stringify(dataReload))
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
                  });
              } else {
                sideBarService
                  .getAccountListVS1()
                  .then(function (dataReload) {
                    addVS1Data("TAccountVS1", JSON.stringify(dataReload))
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
              }
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
                  // Meteor._reload.reload();
                } else if (result.dismiss === "cancel") {
                }
              });
              $(".fullScreenSpin").css("display", "none");
            });
        })
        .catch(function (err) {
          data = {
            type: "TAccount",
            fields: {
              AccountName: accountname || "",
              AccountNumber: accountno || "",
              AccountTypeName: accounttype || "",
              Active: true,
              BankAccountName: bankaccountname || "",
              BankAccountNumber: bankacountno || "",
              BSB: bankbsb || "",
              Description: accountdesc || "",
              TaxCode: taxcode || "",
              Extra: swiftCode,
              BankNumber: routingNo,
              PublishOnVS1: true,
              IsHeader: forTransaction,
              CarNumber: cardnumber || "",
              CVC: cardcvc || "",
              ExpiryDate: expiryDate || "",
            },
          };

          accountService
            .saveAccount(data)
            .then(function (data) {
              if ($("#showOnTransactions").is(":checked")) {
                var objDetails = {
                  type: "TCompanyInfo",
                  fields: {
                    Id: companyID,
                    AccountNo: bankacountno,
                    BankBranch: swiftCode,
                    BankAccountName: bankaccountname,
                    BankName: bankname,
                    Bsb: bankbsb,
                    SiteCode: routingNo,
                    FileReference: accountname,
                  },
                };
                organisationService
                  .saveOrganisationSetting(objDetails)
                  .then(function (data) {
                    var accNo = bankacountno || "";
                    var swiftCode1 = swiftCode || "";
                    var bankName = bankaccountname || "";
                    var accountName = accountname || "";
                    var bsb = bankbsb || "";
                    var routingNo = routingNo || "";
                    localStorage.setItem("vs1companyBankName", bankname);
                    localStorage.setItem(
                      "vs1companyBankAccountName",
                      bankAccName
                    );
                    localStorage.setItem("vs1companyBankAccountNo", accNo);
                    localStorage.setItem("vs1companyBankBSB", bsb);
                    localStorage.setItem("vs1companyBankSwiftCode", swiftCode1);
                    localStorage.setItem("vs1companyBankRoutingNo", routingNo);
                    sideBarService
                      .getAccountListVS1()
                      .then(function (dataReload) {
                        addVS1Data("TAccountVS1", JSON.stringify(dataReload))
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
                    sideBarService
                      .getAccountListVS1()
                      .then(function (dataReload) {
                        addVS1Data("TAccountVS1", JSON.stringify(dataReload))
                          .then(function (datareturn) {
                            //window.open('/addAccountModal', '_self');
                          })
                          .catch(function (err) {
                            Meteor._reload.reload();
                          });
                      })
                      .catch(function (err) {
                        Meteor._reload.reload();
                      });
                  });
              } else {
                sideBarService
                  .getAccountListVS1()
                  .then(function (dataReload) {
                    addVS1Data("TAccountVS1", JSON.stringify(dataReload))
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
              }
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
      data = {
        type: "TAccount",
        fields: {
          ID: accountID,
          AccountName: accountname || "",
          AccountNumber: accountno || "",
          // AccountTypeName: accounttype || '',
          Active: true,
          BankAccountName: bankaccountname || "",
          BankAccountNumber: bankacountno || "",
          BSB: bankbsb || "",
          Description: accountdesc || "",
          TaxCode: taxcode || "",
          Extra: swiftCode,
          BankNumber: routingNo,
          //Level4: bankname,
          PublishOnVS1: true,
          IsHeader: forTransaction,
          CarNumber: cardnumber || "",
          CVC: cardcvc || "",
          ExpiryDate: expiryDate || "",
        },
      };

      accountService
        .saveAccount(data)
        .then(function (data) {
          if ($("#showOnTransactions").is(":checked")) {
            var objDetails = {
              type: "TCompanyInfo",
              fields: {
                Id: companyID,
                AccountNo: bankacountno,
                BankBranch: swiftCode,
                BankAccountName: bankaccountname,
                BankName: bankname,
                Bsb: bankbsb,
                SiteCode: routingNo,
                FileReference: accountname,
              },
            };
            organisationService
              .saveOrganisationSetting(objDetails)
              .then(function (data) {
                var accNo = bankacountno || "";
                var swiftCode1 = swiftCode || "";
                var bankAccName = bankaccountname || "";
                var accountName = accountname || "";
                var bsb = bankbsb || "";
                var routingNo = routingNo || "";
                localStorage.setItem("vs1companyBankName", bankname);
                localStorage.setItem("vs1companyBankAccountName", bankAccName);
                localStorage.setItem("vs1companyBankAccountNo", accNo);
                localStorage.setItem("vs1companyBankBSB", bsb);
                localStorage.setItem("vs1companyBankSwiftCode", swiftCode1);
                localStorage.setItem("vs1companyBankRoutingNo", routingNo);
                sideBarService
                  .getAccountListVS1()
                  .then(function (dataReload) {
                    addVS1Data("TAccountVS1", JSON.stringify(dataReload))
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
                sideBarService
                  .getAccountListVS1()
                  .then(function (dataReload) {
                    addVS1Data("TAccountVS1", JSON.stringify(dataReload))
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
              });
          } else {
            sideBarService
              .getAccountListVS1()
              .then(function (dataReload) {
                addVS1Data("TAccountVS1", JSON.stringify(dataReload))
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
          }
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
    }
  }, delayTimeAfterSound);
  },
  "change #sltAccountType": function (e) {
    let templateObject = Template.instance();
    var accountTypeName = $("#sltAccountType").val();

    if (accountTypeName === "BANK") {
      $(".isBankAccount").removeClass("isNotBankAccount");
      $(".isCreditAccount").addClass("isNotCreditAccount");
    } else if (accountTypeName === "CCARD") {
      $(".isCreditAccount").removeClass("isNotCreditAccount");
      $(".isBankAccount").addClass("isNotBankAccount");
    } else {
      $(".isBankAccount").addClass("isNotBankAccount");
      $(".isCreditAccount").addClass("isNotCreditAccount");
    }
    // $('.file-name').text(filename);
    // let selectedFile = event.target.files[0];
    // templateObj.selectedFile.set(selectedFile);
    // if($('.file-name').text() != ""){
    //   $(".btnImport").removeAttr("disabled");
    // }else{
    //   $(".btnImport").Attr("disabled");
    // }
  },
  "click .btnDeleteAccount": (e, template) => {
    playDeleteAudio();
    setTimeout(function(){
    template.deleteAccount();
  }, delayTimeAfterSound);
  },

  "click #openEftOptionsModal" : (e) => {
    $('#eftOptionsModal').modal();
  },

});

Template.addAccountModal.helpers({
  accountTypes: () => {
    return Template.instance()
      .accountTypes.get()
      .sort(function (a, b) {
        if (a.description === "NA") {
          return 1;
        } else if (b.description === "NA") {
          return -1;
        }
        return a.description.toUpperCase() > b.description.toUpperCase()
          ? 1
          : -1;
      });
  },
  taxraterecords: () => {
    return Template.instance()
      .taxraterecords.get()
      .sort(function (a, b) {
        if (a.description === "NA") {
          return 1;
        } else if (b.description === "NA") {
          return -1;
        }
        return a.description.toUpperCase() > b.description.toUpperCase()
          ? 1
          : -1;
      });
  },
  bsbRegionName: () => {
    let bsbname = "Branch Code";
    if (Session.get("ERPLoggedCountry") === "Australia") {
      bsbname = "BSB";
    }
    return bsbname;
  },
  expenseCategories: () => {
    return Template.instance().expenseCategories.get();
  },
  bankNames: () => {
    return Template.instance()
      .bankNames.get()
      .sort(function (a, b) {
        return a.name > b.name ? 1 : -1;
      });
  },
});
