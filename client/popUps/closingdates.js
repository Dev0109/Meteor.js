import "jQuery.print/jQuery.print.js";
import { ReactiveVar } from "meteor/reactive-var";
import { SideBarService } from "../js/sidebar-service";
import { Random } from "meteor/random";
import { OrganisationService } from "../js/organisation-service";
import { PurchaseBoardService } from "../js/purchase-service";
import { SalesBoardService } from '../js/sales-service';
import { ContactService } from "../contacts/contact-service";
import { ProductService } from "../product/product-service";


let sideBarService = new SideBarService();
let salesService = new SalesBoardService();
let contactService = new ContactService();
let productService = new ProductService();
let isDropdown = false;
let clickedInput = "";

Template.closingdates.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.custfields = new ReactiveVar([]);
});

Template.closingdates.onRendered(() => {
  const templateObject = Template.instance();

  // const custField = [];
  // let count = 1;

  $("#sltCustomOne1").editableSelect();
  $("#sltCustomOne2").editableSelect();
  $("#sltCustomOne3").editableSelect();
  var splashArrayClientTypeList1 = new Array();

  $(document).ready(function () {
    $("#formCheck-customOne").click(function (event) {
      if ($(event.target).is(":checked")) {
        $(".checkbox1div").css("display", "block");
      } else {
        $(".checkbox1div").css("display", "none");
      }
    });

    $("#formCheck-customTwo").click(function (event) {
      if ($(event.target).is(":checked")) {
        $(".checkbox2div").css("display", "block");
      } else {
        $(".checkbox2div").css("display", "none");
      }
    });

    $("#formCheck-customThree").click(function (event) {
      if ($(event.target).is(":checked")) {
        $(".checkbox3div").css("display", "block");
      } else {
        $(".checkbox3div").css("display", "none");
      }
    });

    // add to custom field
    $(document).on("click", "#customFieldDropdownTable1 tbody tr", function (e) {
      $("#edtSaleCustField1").val($(this).find(".colFieldName").text());
      $("#customFieldDropdownListModal1").modal("toggle");
    });

    // add to custom field
    $(document).on("click", "#customFieldDropdownTable2 tbody tr", function (e) {
      $("#edtSaleCustField2").val($(this).find(".colFieldName").text());
      $("#customFieldDropdownListModal2").modal("toggle");
    });

    // add to custom field
    $(document).on("click", "#customFieldDropdownTable3 tbody tr", function (e) {
      $("#edtSaleCustField3").val($(this).find(".colFieldName").text());
      $("#customFieldDropdownListModal3").modal("toggle");
    });

    // add to custom field
    $(document).on("click", ".btnRefreshCustomField", function (e) {

      data_id = e.target.dataset.id;
      $(".fullScreenSpin").css("display", "inline-block");

      $(".fullScreenSpin").css("display", "inline-block");

      let dataSearchName = $("#customFieldDropdownTable" + data_id + "_filter input").val();

      if (dataSearchName.replace(/\s/g, "") != "") {
        sideBarService.getCustomFieldsDropDownByNameOrID(dataSearchName).then(function (fieldsData) {
          $(".btnRefreshCustomField").removeClass("btnSearchAlert");

          let data = fieldsData.tcustomfieldlistdropdown
          splashArrayClientTypeList1 = [];

          $("#isdropDown" + data_id).val(true);
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              var dataList = [
                data[i].fields.ID || "",
                data[i].fields.Text || "",
              ];
              splashArrayClientTypeList1.push(dataList);
            }
          }

          $(".fullScreenSpin").css("display", "none");
          setTimeout(function () {
            $("#customFieldDropdownTable" + data_id)
              .DataTable({
                data: splashArrayClientTypeList1,
                sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                paging: true,
                aaSorting: [],
                orderMulti: true,
                columnDefs: [
                  {
                    orderable: false,
                    targets: -1,
                  },
                  {
                    className: "colCustField",
                    targets: [0],
                  },
                  {
                    className: "colFieldName pointer",
                    targets: [1],
                  },
                ],
                select: true,
                destroy: true,
                colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [
                  [initialDatatableLoad, -1],
                  [initialDatatableLoad, "All"],
                ],
                info: true,
                responsive: true,
                fnInitComplete: function () {
                  $("<button class='btn btn-primary btnAddNewCustField' data-id='" + data_id + "' type='button' style='padding: 4px 10px; font-size: 14px; margin-left:  8px !important;'><i class='fas fa-plus' data-id='" + data_id + "'></i></button>"
                  ).insertAfter("#customFieldDropdownTable" + data_id + "_filter");

                  $("<button class='btn btn-primary btnRefreshCustomField' type='button' data-id='" + data_id + "' style='padding: 4px 10px; font-size: 14px;  margin-left: 8px !important;'><i class='fas fa-search-plus' data-id='" + data_id + "' style='margin-right: 5px'></i>Search</button>").insertAfter("#customFieldDropdownTable" + data_id + "_filter");
                },
              })
              .on("page", function () {
                setTimeout(function () {
                  // MakeNegative();
                }, 100);
                // let draftRecord = templateObject.datatablerecords.get();
                // templateObject.datatablerecords.set(draftRecord);
              })
              .on("column-reorder", function () { })
              .on("length.dt", function (e, settings, len) {
                setTimeout(function () {
                  // MakeNegative();
                }, 100);
              });
            $(".fullScreenSpin").css("display", "none");
          }, 10);

          $(".fullScreenSpin").css("display", "none");
        })
          .catch(function (err) {
            $(".fullScreenSpin").css("display", "none");
          });
      } else {
        $(".fullScreenSpin").css("display", "none");
      }

    });

    // add to custom field
    $(document).on("click", ".btnAddNewCustField", function (e) {

      let data_id = e.target.dataset.id;
      let custfieldarr = templateObject.custfields.get();

      custfieldarr[data_id - 1].datatype = "ftString";
      custfieldarr[data_id - 1].isCombo = true;

      templateObject.custfields.set(custfieldarr);

      let selected_data = custfieldarr[data_id - 1];
      isDropdown = true;
      $("#isdropDown" + data_id).val(isDropdown);
      $("#statusId" + data_id).val(selected_data.id || "");
      $(".custField" + data_id + "Text").css("display", "none");
      $(".custField" + data_id + "Date").css("display", "none");
      $(".custField" + data_id + "Dropdown").css("display", "block");
      $("#currentCustomField").val(data_id);

      if (data_id == 1) {
        clickedInput = "one";
      } else if (data_id == 2) {
        clickedInput = "two";
      } else {
        clickedInput = "three";
      }
      $("#clickedControl").val(clickedInput);

      $("#customFieldText" + data_id).attr("datatype", "ftString");

      if (Array.isArray(selected_data.dropdown)) {
        $(".btnAddNewTextBox").nextAll().remove();
        for (let x = 0; x < selected_data.dropdown.length; x++) {
          $(".dropDownSection").append(
            '<div class="row textBoxSection" id="textBoxSection" style="padding:5px">' +
            '<div class="col-10">' +
            '<input type="text" style="" name="customText" class="form-control customText" token="' +
            selected_data.dropdown[x].fields.ID +
            '" value="' +
            selected_data.dropdown[x].fields.Text +
            '" autocomplete="off">' +
            "</div>" +
            '<div class="col-2">' +
            '<button type="button" class="btn btn-danger btn-rounded btnRemoveDropOptions" autocomplete="off"><i class="fa fa-remove"></i></button>' +
            "</div>" +
            "</div>"
          );
        }
      } else if (selected_data.dropdown && !Array.isArray(selected_data.dropdown) && Object.keys(selected_data.dropdown).length > 0) {
        $(".btnAddNewTextBox").nextAll().remove();
        $(".dropDownSection").append(
          '<div class="row textBoxSection" id="textBoxSection" style="padding:5px">' +
          '<div class="col-10">' +
          '<input type="text" style="" name="customText" class="form-control customText" token="' +
          selected_data.dropdown.fields.ID +
          '" value="' +
          selected_data.dropdown.fields.Text +
          '" autocomplete="off">' +
          "</div>" +
          '<div class="col-2">' +
          '<button type="button" class="btn btn-danger btn-rounded btnRemoveDropOptions" autocomplete="off"><i class="fa fa-remove"></i></button>' +
          "</div>" +
          "</div>"
        );
      }
      $(".dropDownSection").show();
      $("#newStatus" + data_id).val($("#customFieldText" + data_id).val());
      $("#newCustomFieldPop").modal("toggle");
      // templateObject.drawDropDownListTable(data_id);

    });

  });

  templateObject.drawDropDownListTable = function (data_id) {
    let fieldsData = templateObject.custfields.get();
    splashArrayClientTypeList1 = [];

    $("#isdropDown" + data_id).val(true);
    if (fieldsData.length > 0) {
      for (let i = 0; i < fieldsData.length; i++) {
        if (Array.isArray(fieldsData[i].dropdown)) {
          if (data_id - 1 == i) {
            for (let x = 0; x < fieldsData[i].dropdown.length; x++) {
              var dataList = [
                fieldsData[i].dropdown[x].fields.ID || "",
                fieldsData[i].dropdown[x].fields.Text || "",
              ];
              splashArrayClientTypeList1.push(dataList);
            }
          }
        } else if (
          fieldsData[i].dropdown &&
          !Array.isArray(fieldsData[i].dropdown) &&
          Object.keys(fieldsData[i].dropdown).length > 0
        ) {
          if (data_id - 1 == i) {
            var dataList = [
              fieldsData[i].dropdown.fields.ID || "",
              fieldsData[i].dropdown.fields.Text || "",
            ];
            splashArrayClientTypeList1.push(dataList);
          }
        }
      }
    }

    $(".fullScreenSpin").css("display", "none");
    setTimeout(function () {
      $("#customFieldDropdownTable" + data_id).DataTable({
        data: splashArrayClientTypeList1,
        sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        paging: true,
        aaSorting: [],
        orderMulti: true,
        columnDefs: [
          {
            orderable: false,
            targets: -1,
          },
          {
            className: "colCustField",
            targets: [0],
          },
          {
            className: "colFieldName pointer",
            targets: [1],
          },
        ],
        select: true,
        destroy: true,
        colReorder: true,
        pageLength: initialDatatableLoad,
        lengthMenu: [
          [initialDatatableLoad, -1],
          [initialDatatableLoad, "All"],
        ],
        info: true,
        responsive: true,
        fnInitComplete: function () {
          $("<button class='btn btn-primary btnAddNewCustField' data-id='" + data_id + "' type='button' style='padding: 4px 10px; font-size: 14px; margin-left:  8px !important;'><i class='fas fa-plus' data-id='" + data_id + "'></i></button>"
          ).insertAfter("#customFieldDropdownTable" + data_id + "_filter");

          $("<button class='btn btn-primary btnRefreshCustomField' type='button' data-id='" + data_id + "' style='padding: 4px 10px; font-size: 14px;  margin-left: 8px !important;'><i class='fas fa-search-plus' data-id='" + data_id + "' style='margin-right: 5px'></i>Search</button>").insertAfter("#customFieldDropdownTable" + data_id + "_filter");
        },
      }).on("page", function () {
        setTimeout(function () {
          // MakeNegative();
        }, 100);
        let draftRecord = templateObject.datatablerecords.get();
        templateObject.datatablerecords.set(draftRecord);
      }).on("column-reorder", function () { })
        .on("length.dt", function (e, settings, len) {
          setTimeout(function () {
            // MakeNegative();
          }, 100);
        });
      $(".fullScreenSpin").css("display", "none");
    }, 10);

    setTimeout(() => {
      let custFieldNo = data_id;
      let custField = fieldsData[data_id - 1];
      $("#edtSaleCustField" + custFieldNo).editableSelect();
      $("#edtSaleCustField" + custFieldNo).editableSelect().on("click.editable-select", function (e, li) {
        var $earch = $(this);
        var offset = $earch.offset();
        var fieldDataName = e.target.value || "";
        var fieldDataID =
          $("#edtSaleCustField" + custFieldNo).attr("custfieldid") || "";
        $("#selectCustFieldID").val(fieldDataID);
        $('#customFieldDropdownListTitle' + custFieldNo).html(custField.custfieldlabel);

        if (e.pageX > offset.left + $earch.width() - 8) {
          // X button 16px wide?
          $("#customFieldDropdownListModal" + custFieldNo).modal("toggle");
        } else {
          if (fieldDataName.replace(/\s/g, "") != "") {
            $("#newStatusHeader" + custFieldNo).text(
              "Edit " + custField.custfieldlabel
            );
            getVS1Data("TCustomFieldList").then(function (dataObject) {
              //edit to test indexdb
              if (dataObject.length == 0) {
                $(".fullScreenSpin").css("display", "inline-block");
                sideBarService.getAllCustomFields().then(function (data) {
                  for (let i in data.tcustomfieldlist) {
                    if (data.tcustomfieldlist[i].fields.Description === fieldDataName) {
                      $("#statusId").val(data.tcustomfieldlist[i].fields.ID);
                      $("#newStatus").val(data.tcustomfieldlist[i].fields.Description);
                    }
                  }
                  // setTimeout(function () {
                  $(".fullScreenSpin").css("display", "none");
                  $("#newCustomFieldPop").modal("toggle");
                  // }, 200);
                });
              } else {
                let data = JSON.parse(dataObject[0].data);
                for (let i in data.tcustomfieldlist) {
                  if (data.tcustomfieldlist[i].fields.Description === fieldDataName) {
                    $("#statusId").val(data.tcustomfieldlist[i].fields.ID);
                    $("#newStatus").val(data.tcustomfieldlist[i].fields.Description);
                  }
                }
                // setTimeout(function () {
                $(".fullScreenSpin").css("display", "none");
                $("#newCustomFieldPop").modal("toggle");
                // }, 200);
              }
            })
              .catch(function (err) {
                $(".fullScreenSpin").css("display", "inline-block");
                sideBarService.getAllCustomFields().then(function (data) {
                  for (let i in data.tcustomfieldlist) {
                    if (data.tcustomfieldlist[i].fields.Description === fieldDataName) {
                      $("#statusId" + custFieldNo).val(data.tcustomfieldlist[i].fields.ID);
                      $("#newStatus" + custFieldNo).val(data.tcustomfieldlist[i].fields.Description);
                    }
                  }
                  // setTimeout(function () {
                  $(".fullScreenSpin").css("display", "none");
                  $("#newCustomFieldPop").modal("toggle");
                  // }, 200);
                });
              });
          } else {
            $("#customFieldDropdownListModal").modal();
          }
        }
      });
    }, 500);
  };


  /////////
  // add to custom field
  templateObject.getCustomFieldsList = function (type = 'init') {
    var url = FlowRouter.current().path;

    let custFields = [];
    let listType = "";
    if (
      url.includes("/invoicecard") ||
      url.includes("/salesordercard") ||
      url.includes("/quotecard") ||
      url.includes("/refundcard")
    ) {
      listType = "ltSales";
    } else if (url.includes("/customerscard")) {
      listType = "ltCustomer";
    } else if (url.includes("/supplierscard")) {
      listType = "ltSupplier";
    } else if (url.includes("/employeescard")) {
      listType = "ltContact";
    } else if (url.includes("/leadscard")) {
      listType = "ltLeads";
    } else if (url.includes("/productview")) {
      listType = "ltProducts";
    } else if (
      url.includes("/purchaseordercard") ||
      url.includes("/billcard") ||
      url.includes("/creditcard") ||
      url.includes("/chequecard") ||
      url.includes("/depositcard")) {
      // customfield tempcode
      listType = "ltOrderLines";
    }

    let customFieldCount = 3; // customfield tempcode
    let customData = {};

    sideBarService.getAllCustomFields().then(function (data) {
      for (let x = 0; x < data.tcustomfieldlist.length; x++) {
        if (data.tcustomfieldlist[x].fields.ListType == listType) {
          customData = {
            active: data.tcustomfieldlist[x].fields.Active || false,
            id: parseInt(data.tcustomfieldlist[x].fields.ID) || 0,
            custfieldlabel: data.tcustomfieldlist[x].fields.Description || "",
            datatype: data.tcustomfieldlist[x].fields.DataType || "",
            isempty: data.tcustomfieldlist[x].fields.ISEmpty || false,
            iscombo: data.tcustomfieldlist[x].fields.IsCombo || false,
            dropdown: data.tcustomfieldlist[x].fields.Dropdown || null,
          };
          custFields.push(customData);
        }
      }

      if (custFields.length < customFieldCount) {
        let remainder = customFieldCount - custFields.length;
        let getRemCustomFields = parseInt(custFields.length);
        // count = count + remainder;
        for (let r = 0; r < remainder; r++) {
          getRemCustomFields++;
          customData = {
            active: false,
            id: "",
            custfieldlabel: "Custom Field " + getRemCustomFields,
            datatype: "",
            isempty: true,
            iscombo: false,
          };
          // count++;
          custFields.push(customData);
        }
      }

      templateObject.custfields.set(custFields);
      if (type == 'init') {
        templateObject.initCustomFieldsList(custFields);
      } else {
        templateObject.drawDropDownListTable(type)
      }
    })
  }

  templateObject.initCustomFieldsList = function (custFields) {

    if (custFields) {
      // if (templateObject.custfields.get()) {
      //   let custFields = templateObject.custfields.get();
      //Custom Field 1
      if (custFields[0].active) {
        $(".checkbox1div").css("display", "block");
        $("#formCheck-customOne").prop("checked", true);
      }

      if (custFields[1].active) {
        $(".checkbox2div").css("display", "block");
        $("#formCheck-customTwo").prop("checked", true);
      }
      if (custFields[2].active) {
        $(".checkbox3div").css("display", "block");
        $("#formCheck-customThree").prop("checked", true);
      }
      $("#customFieldText1").val(custFields[0].custfieldlabel);
      $("#customFieldText2").val(custFields[1].custfieldlabel);
      $("#customFieldText3").val(custFields[2].custfieldlabel);

      $("#isdropDown1").val(custFields[0].iscombo);
      $("#isdropDown2").val(custFields[1].iscombo);
      $("#isdropDown3").val(custFields[2].iscombo);

      let custFieldNo = 0;
      let customFieldCount = 3; // customfield tempcode

      for (
        let customfield_number = 0;
        customfield_number < customFieldCount;
        customfield_number++
      ) {
        const custField = custFields[customfield_number];
        custFieldNo++;

        // Textfield
        if (custField.datatype == "ftString" && custField.iscombo == false) {
          $(".custField" + custFieldNo + "Text").css("display", "block");
          $(".custField" + custFieldNo + "Date").css("display", "none");
          $(".custField" + custFieldNo + "Dropdown").css("display", "none");

          $(".checkbox" + custFieldNo + "div").empty();
          $(".checkbox" + custFieldNo + "div").append(
            '<div class="form-group"><label class="lblCustomField' +
            custFieldNo +
            '">' +
            custField.custfieldlabel +
            "</label>" +
            '<input class="form-control form-control" type="text" id="edtSaleCustField' +
            custFieldNo +
            '" name="edtSaleCustField' +
            custFieldNo +
            '" value="" custfieldid=' +
            custField.id +
            "> </div>"
          );
          $("#edtSaleCustField" + custFieldNo).attr("datatype", "ftString");
        } // Datetime
        else if (custField.datatype == "ftDateTime") {
          $(".custField" + custFieldNo + "Text").css("display", "none");
          $(".custField" + custFieldNo + "Date").css("display", "block");
          $(".custField" + custFieldNo + "Dropdown").css("display", "none");
          $("#customFieldText" + custFieldNo).attr("datatype", "ftDateTime");

          $(".checkbox" + custFieldNo + "div").empty();
          $(".checkbox" + custFieldNo + "div").append(
            '<div class="form-group" data-placement="bottom" title="Date format: DD/MM/YYYY"><label class="lblCustomField' +
            custFieldNo +
            '">' +
            custField.custfieldlabel +
            "<br></label>" +
            '<div class="input-group date" style="cursor: pointer;"><input type="text" class="form-control customField' +
            custFieldNo +
            '" style="width: 86% !important; display: inline-flex;" id="edtSaleCustField' +
            custFieldNo +
            '" name="edtSaleCustField' +
            custFieldNo +
            '" value="" custfieldid=' +
            custField.id +
            ">" +
            '<div class="input-group-addon" style=""><span class="glyphicon glyphicon-th" style="cursor: pointer;"></span>' +
            "</div> </div></div>"
          );
          $("#edtSaleCustField" + custFieldNo).attr("datatype", "ftDateTime");

          let edtSaleCustFieldName = "#edtSaleCustField" + custFieldNo;
          setTimeout(function () {
            $(edtSaleCustFieldName).datepicker({
              showOn: "button",
              buttonText: "Show Date",
              buttonImageOnly: true,
              buttonImage: "/img/imgCal2.png",
              constrainInput: false,
              dateFormat: "d/mm/yy",
              showOtherMonths: true,
              selectOtherMonths: true,
              changeMonth: true,
              changeYear: true,
              yearRange: "-90:+10",
            });
          }, 1500);
          // should set init value
          $("#edtSaleCustField" + custFieldNo).val(
            moment().format("DD/MM/YYYY")
          );
        } // Dropdown
        else if (
          custField.datatype == "ftString" &&
          custField.iscombo == true
        ) {
          // Dropdown
          $(".custField" + custFieldNo + "Text").css("display", "none");
          $(".custField" + custFieldNo + "Date").css("display", "none");
          $(".custField" + custFieldNo + "Dropdown").css("display", "block");

          $(".checkbox" + custFieldNo + "div").empty();
          $(".checkbox" + custFieldNo + "div").append(
            '<div class="form-group"><label class="lblCustomField' +
            custFieldNo +
            '">' +
            custField.custfieldlabel +
            "<br></label>" +
            ' <select type="search" class="form-control pointer customField' +
            custFieldNo +
            '" id="edtSaleCustField' +
            custFieldNo +
            '" name="edtSaleCustField' +
            custFieldNo +
            '" style="background-color:rgb(255, 255, 255); border-top-left-radius: 0.35rem; border-bottom-left-radius: 0.35rem;" custfieldid=' +
            custField.id +
            "></select></div>"
          );
          $("#edtSaleCustField" + custFieldNo).attr("datatype", "ftString");
        }
      }

      setTimeout(function () {
        custFieldNo = 0;
        for (let customfield_number = 0; customfield_number < customFieldCount; customfield_number++) {
          const custField = custFields[customfield_number];
          custFieldNo++;
          if (custField.datatype == "ftString" && custField.iscombo == true) {
            // Dropdown
            $(".custField" + custFieldNo + "Text").css("display", "none");
            $(".custField" + custFieldNo + "Date").css("display", "none");
            $(".custField" + custFieldNo + "Dropdown").css("display", "block");

            $(".checkbox" + custFieldNo + "div").empty();
            $(".checkbox" + custFieldNo + "div").append(
              '<div class="form-group"><label class="lblCustomField' +
              custFieldNo +
              '">' +
              custField.custfieldlabel +
              "<br></label>" +
              ' <select type="search" class="form-control pointer customField' +
              custFieldNo +
              '" id="edtSaleCustField' +
              custFieldNo +
              '" name="edtSaleCustField' +
              custFieldNo +
              '" style="background-color:rgb(255, 255, 255); border-top-left-radius: 0.35rem; border-bottom-left-radius: 0.35rem;" custfieldid=' +
              custField.id +
              "></select></div>"
            );
            $("#edtSaleCustField" + custFieldNo).attr("datatype", "ftString");
            var splashArrayCustomFieldList = new Array();
            if (custField.dropdown != null) {
              if (Array.isArray(custField.dropdown)) {
                for (let x = 0; x < custField.dropdown.length; x++) {
                  var dataList = [
                    custField.dropdown[x].fields.ID || "",
                    custField.dropdown[x].fields.Text || "",
                  ];

                  splashArrayCustomFieldList.push(dataList);
                }
              } else {
                var dataList = [
                  custField.dropdown.fields.ID || "",
                  custField.dropdown.fields.Text || "",
                ];

                splashArrayCustomFieldList.push(dataList);
              }
            } else {
              var dataList = ["", ""];
              splashArrayCustomFieldList.push(dataList);
            }

            // init customfielddropdowntable
            $("#customFieldDropdownTable" + custFieldNo).DataTable({
              data: splashArrayCustomFieldList,
              sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
              paging: true,
              aaSorting: [],
              orderMulti: true,
              columnDefs: [
                {
                  orderable: false,
                  targets: -1,
                },
                {
                  className: "colCustField",
                  targets: [0],
                },
                {
                  className: "colFieldName pointer",
                  targets: [1],
                },
              ],
              select: true,
              destroy: true,
              colReorder: true,
              pageLength: initialDatatableLoad,
              lengthMenu: [
                [initialDatatableLoad, -1],
                [initialDatatableLoad, "All"],
              ],
              info: true,
              responsive: true,

              fnInitComplete: function () {
                $("<button class='btn btn-primary btnAddNewCustField' data-id='" + custFieldNo + "' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus' data-id='" + custFieldNo + "'></i></button>"
                ).insertAfter("#customFieldDropdownTable" + custFieldNo + "_filter");
                $("<button class='btn btn-primary btnRefreshCustomField' type='button' data-id='" + custFieldNo + "' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' data-id='" + custFieldNo + "' style='margin-right: 5px'></i>Search</button>").insertAfter("#customFieldDropdownTable" + custFieldNo + "_filter");
              },

            }).on("page", function () {
              setTimeout(function () {
                MakeNegative();
              }, 100);
              let draftRecord = templateObject.datatablerecords.get();
              templateObject.datatablerecords.set(draftRecord);
            }).on("column-reorder", function () { })
              .on("length.dt", function (e, settings, len) {
                setTimeout(function () {
                  MakeNegative();
                }, 100);
              });
            // init customfielddropdowntable
          }
        }

        // initialize custom field dropdown list/////////////////
        custFieldNo = 0;
        if (
          custFields[0].datatype == "ftString" &&
          custFields[0].iscombo == true
        ) {
          // Dropdown
          $(".custField1Text").css("display", "none");
          $(".custField1Date").css("display", "none");
          $(".custField1Dropdown").css("display", "block");

          $(".checkbox1div").empty();
          $(".checkbox1div").append(
            '<div class="form-group"><label class="lblCustomField1">' +
            custFields[0].custfieldlabel +
            "<br></label>" +
            ' <select type="search" class="form-control pointer customField1" id="edtSaleCustField1" name="edtSaleCustField1" style="background-color:rgb(255, 255, 255); border-top-left-radius: 0.35rem; border-bottom-left-radius: 0.35rem;" custfieldid=' +
            custFields[0].id +
            "></select></div>"
          );
          $("#edtSaleCustField1").attr("datatype", "ftString");
          var splashArrayCustomFieldList = new Array();
          if (custFields[0].dropdown != null) {
            if (Array.isArray(custFields[0].dropdown)) {
              for (let x = 0; x < custFields[0].dropdown.length; x++) {
                var dataList = [
                  custFields[0].dropdown[x].fields.ID || "",
                  custFields[0].dropdown[x].fields.Text || "",
                ];

                splashArrayCustomFieldList.push(dataList);
              }
            } else {
              var dataList = [
                custFields[0].dropdown.fields.ID || "",
                custFields[0].dropdown.fields.Text || "",
              ];

              splashArrayCustomFieldList.push(dataList);
            }
          } else {
            var dataList = ["", ""];
            splashArrayCustomFieldList.push(dataList);
          }

          $("#edtSaleCustField1").editableSelect();
          $("#edtSaleCustField1").editableSelect().on("click.editable-select", function (e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            var fieldDataName = e.target.value || "";
            var fieldDataID = $("#edtSaleCustField1").attr("custfieldid") || "";
            $("#selectCustFieldID").val(fieldDataID);
            $("#selectCustFieldNumber").val(1);

            $('#customFieldDropdownListTitle1').html(custFields[0].custfieldlabel);
            if (e.pageX > offset.left + $earch.width() - 8) {
              // X button 16px wide?
              $("#customFieldDropdownListModal1").modal("toggle");
            } else {
              if (fieldDataName.replace(/\s/g, "") != "") {

                $("#newCustomFieldDropdownHeader").text("Edit " + custFields[0].custfieldlabel);

                $("#customFieldDropdownId").val('');
                $("#newCustomFieldDropdownName").val(fieldDataName);

                if (custFields[0].dropdown) {
                  for (let i in custFields[0].dropdown) {
                    if (custFields[0].dropdown[i].fields.Text === fieldDataName) {
                      $("#customFieldDropdownId").val(custFields[0].dropdown[i].fields.ID);
                      $("#newCustomFieldDropdownName").val(custFields[0].dropdown[i].fields.Text);
                    }
                  }
                  setTimeout(function () {
                    $(".fullScreenSpin").css("display", "none");
                    $("#newCustomFieldDropdownModal").modal("toggle");
                  }, 200);
                } else {
                  // $("#customFieldDropdownId").val(fieldDataID);
                  // $("#newCustomFieldDropdownName").val(fieldDataName);

                  setTimeout(function () {
                    $(".fullScreenSpin").css("display", "none");
                    $("#newCustomFieldDropdownModal").modal("toggle");
                  }, 200);
                }
              } else {
                $("#customFieldDropdownListModal1").modal();
              }
            }
          });
        }

        if (
          custFields[1].datatype == "ftString" &&
          custFields[1].iscombo == true
        ) {
          // Dropdown
          $(".custField2Text").css("display", "none");
          $(".custField2Date").css("display", "none");
          $(".custField2Dropdown").css("display", "block");

          $(".checkbox2div").empty();
          $(".checkbox2div").append(
            '<div class="form-group"><label class="lblCustomField2">' +
            custFields[1].custfieldlabel +
            "<br></label>" +
            ' <select type="search" class="form-control pointer customField2" id="edtSaleCustField2" name="edtSaleCustField2" style="background-color:rgb(255, 255, 255); border-top-left-radius: 0.35rem; border-bottom-left-radius: 0.35rem;" custfieldid=' +
            custFields[1].id +
            "></select></div>"
          );
          $("#edtSaleCustField2").attr("datatype", "ftString");
          var splashArrayCustomFieldList = new Array();
          if (custFields[1].dropdown != null) {
            if (Array.isArray(custFields[1].dropdown)) {
              for (let x = 0; x < custFields[1].dropdown.length; x++) {
                var dataList = [
                  custFields[1].dropdown[x].fields.ID || "",
                  custFields[1].dropdown[x].fields.Text || "",
                ];

                splashArrayCustomFieldList.push(dataList);
              }
            } else {
              var dataList = [
                custFields[1].dropdown.fields.ID || "",
                custFields[1].dropdown.fields.Text || "",
              ];

              splashArrayCustomFieldList.push(dataList);
            }
          } else {
            var dataList = ["", ""];
            splashArrayCustomFieldList.push(dataList);
          }

          $("#edtSaleCustField2").editableSelect();
          $("#edtSaleCustField2").editableSelect().on("click.editable-select", function (e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            var fieldDataName = e.target.value || "";

            var fieldDataID = $("#edtSaleCustField2").attr("custfieldid") || "";
            $("#selectCustFieldID").val(fieldDataID);
            $("#selectCustFieldNumber").val(2);

            $('#customFieldDropdownListTitle2').html(custFields[1].custfieldlabel);
            if (e.pageX > offset.left + $earch.width() - 8) {
              // X button 16px wide?
              $("#customFieldDropdownListModal2").modal("toggle");
            } else {
              if (fieldDataName.replace(/\s/g, "") != "") {

                $("#newCustomFieldDropdownHeader").text("Edit " + custFields[1].custfieldlabel);
                $("#customFieldDropdownId").val('');
                $("#newCustomFieldDropdownName").val(fieldDataName);

                if (custFields[1].dropdown) {
                  for (let i in custFields[1].dropdown) {
                    if (custFields[1].dropdown[i].fields.Text === fieldDataName) {
                      $("#customFieldDropdownId").val(custFields[1].dropdown[i].fields.ID);
                      $("#newCustomFieldDropdownName").val(custFields[1].dropdown[i].fields.Text);
                    }
                  }
                  setTimeout(function () {
                    $(".fullScreenSpin").css("display", "none");
                    $("#newCustomFieldDropdownModal").modal("toggle");
                  }, 200);
                } else {
                  // $("#customFieldDropdownId").val(fieldDataID);
                  // $("#newCustomFieldDropdownName").val(fieldDataName);

                  setTimeout(function () {
                    $(".fullScreenSpin").css("display", "none");
                    $("#newCustomFieldDropdownModal").modal("toggle");
                  }, 200);
                }
              } else {
                $("#customFieldDropdownListModal2").modal();
              }
            }
          });
        }

        if (
          custFields[2].datatype == "ftString" &&
          custFields[2].iscombo == true
        ) {
          // Dropdown
          $(".custField3Text").css("display", "none");
          $(".custField3Date").css("display", "none");
          $(".custField3Dropdown").css("display", "block");

          $(".checkbox3div").empty();
          $(".checkbox3div").append(
            '<div class="form-group"><label class="lblCustomField3">' +
            custFields[2].custfieldlabel +
            "<br></label>" +
            ' <select type="search" class="form-control pointer customField3" id="edtSaleCustField3" name="edtSaleCustField3" style="background-color:rgb(255, 255, 255); border-top-left-radius: 0.35rem; border-bottom-left-radius: 0.35rem;" custfieldid=' +
            custFields[2].id +
            "></select></div>"
          );
          $("#edtSaleCustField3").attr("datatype", "ftString");
          var splashArrayCustomFieldList = new Array();
          if (custFields[2].dropdown != null) {
            if (Array.isArray(custFields[2].dropdown)) {
              for (let x = 0; x < custFields[2].dropdown.length; x++) {
                var dataList = [
                  custFields[2].dropdown[x].fields.ID || "",
                  custFields[2].dropdown[x].fields.Text || "",
                ];

                splashArrayCustomFieldList.push(dataList);
              }
            } else {
              var dataList = [
                custFields[2].dropdown.fields.ID || "",
                custFields[2].dropdown.fields.Text || "",
              ];

              splashArrayCustomFieldList.push(dataList);
            }
          } else {
            var dataList = ["", ""];
            splashArrayCustomFieldList.push(dataList);
          }

          $("#edtSaleCustField3").editableSelect();
          $("#edtSaleCustField3").editableSelect().on("click.editable-select", function (e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            var fieldDataName = e.target.value || "";
            var fieldDataID = $("#edtSaleCustField3").attr("custfieldid") || "";
            $("#selectCustFieldID").val(fieldDataID);
            $("#selectCustFieldNumber").val(3);

            $('#customFieldDropdownListTitle3').html(custFields[2].custfieldlabel);

            if (e.pageX > offset.left + $earch.width() - 8) {
              // X button 16px wide?
              $("#customFieldDropdownListModal3").modal("toggle");
            } else {
              if (fieldDataName.replace(/\s/g, "") != "") {

                $("#newCustomFieldDropdownHeader").text("Edit " + custFields[2].custfieldlabel);

                $("#customFieldDropdownId").val('');
                $("#newCustomFieldDropdownName").val(fieldDataName);

                if (custFields[2].dropdown) {
                  for (let i in custFields[2].dropdown) {
                    if (custFields[2].dropdown[i].fields.Text === fieldDataName) {
                      $("#customFieldDropdownId").val(custFields[2].dropdown[i].fields.ID);
                      $("#newCustomFieldDropdownName").val(custFields[2].dropdown[i].fields.Text);
                    }
                  }
                  setTimeout(function () {
                    $(".fullScreenSpin").css("display", "none");
                    $("#newCustomFieldDropdownModal").modal("toggle");
                  }, 200);
                } else {

                  setTimeout(function () {
                    $(".fullScreenSpin").css("display", "none");
                    $("#newCustomFieldDropdownModal").modal("toggle");
                  }, 200);
                }
              } else {
                $("#customFieldDropdownListModal3").modal();
              }
            }
          });
        }

        var url = FlowRouter.current().path;
        let getso_id = url.split("?id=");
        let currentID = getso_id[getso_id.length - 1];
        currentID = parseInt(currentID);

        if (url.includes("/invoicecard")) {
          listType = "ltSales";
          if (!isNaN(currentID)) {
          templateObject.getTInvoiceExData(currentID);
          }
        } else if (url.includes("/salesordercard")) {
          listType = "ltSales";
          if (!isNaN(currentID)) {
          templateObject.getTSalesOrderExData(currentID);
          }
        } else if (url.includes("/quotecard")) {
          listType = "ltSales";
            if (!isNaN(currentID)) {
          templateObject.getTQuoteExData(currentID);
          }
        } else if (url.includes("/refundcard")) {
          listType = "ltSales";
            if (!isNaN(currentID)) {
          templateObject.getTRefundSaleData(currentID);
            }
        } else if (url.includes("/customerscard")) {
          // how to handle job???
          // getso_id = url.split("?jobid=");
          // currentID = getso_id[getso_id.length - 1];
          // currentID = parseInt(currentID);

          listType = "ltCustomer";
          if (!isNaN(currentID)) {
          templateObject.getTCustomerExData(currentID);
          }
        } else if (url.includes("/supplierscard")) {
          listType = "ltSupplier";
            if (!isNaN(currentID)) {
          templateObject.getTSupplierExData(currentID);
          }
        } else if (url.includes("/employeescard")) {
          listType = "ltContact";
          if (!isNaN(currentID)) {
          templateObject.getTEmployeeExData(currentID);
         }
        } else if (url.includes("/leadscard")) {
          listType = "ltLeads";
          if (!isNaN(currentID)) {
          templateObject.getTLeadExData(currentID);
          }
        } else if (url.includes("/productview")) {
          listType = "ltProducts";
          if (!isNaN(currentID)) {
          templateObject.getTProductExData(currentID);
          }
        } else if (
          url.includes("/purchaseordercard") || // TPurchaseOrderEx needs customFields except for Lines's customfields
          url.includes("/billcard") ||          // TBillEx needs customFields except for Lines's customfields
          url.includes("/creditcard") ||        // TCredit needs customFields except for Lines's customfields
          url.includes("/chequecard") ||        // TChequeEx needs customFields except for Lines's customfields
          url.includes("/depositcard")) {       // TVS1BankDeposit needs customFields except for Lines's customfields
          // customfield tempcode
          listType = "ltOrderLines";
          if (!isNaN(currentID)) {
          //templateObject.getChequeData(currentID);
          }
        }

      }, 1500);
      ////////////////////
    }
  };

  templateObject.getTInvoiceExData = function (currentID) {
    salesService.getOneInvoicedataEx(currentID).then(function (data) {
      $('#edtSaleCustField1').val(data.fields.SaleCustField1);
      $('#edtSaleCustField2').val(data.fields.SaleCustField2);
      $('#edtSaleCustField3').val(data.fields.SaleCustField3);
    })
    // tempcode disable until resolve save delay issue
    // getVS1Data('TInvoiceEx').then(function (dataObject) {
    //   if (dataObject.length == 0) {
    //     salesService.getOneInvoicedataEx(currentID).then(function (data) {
    //       $('#edtSaleCustField1').val(data.fields.SaleCustField1);
    //       $('#edtSaleCustField2').val(data.fields.SaleCustField2);
    //       $('#edtSaleCustField3').val(data.fields.SaleCustField3);
    //     })
    //   } else {
    //     let data = JSON.parse(dataObject[0].data);
    //     let useData = data.tinvoiceex;
    //     for (let d = 0; d < useData.length; d++) {
    //       if (parseInt(useData[d].fields.ID) === currentID) {
    //         $('#edtSaleCustField1').val(useData[d].fields.SaleCustField1);
    //         $('#edtSaleCustField2').val(useData[d].fields.SaleCustField2);
    //         $('#edtSaleCustField3').val(useData[d].fields.SaleCustField3);
    //       }
    //     }

    //   }
    // }).catch(function (err) {
    // });
  };

  templateObject.getTSalesOrderExData = function (currentID) {
    salesService.getOneSalesOrderdataEx(currentID).then(function (data) {
      $('#edtSaleCustField1').val(data.fields.SaleCustField1);
      $('#edtSaleCustField2').val(data.fields.SaleCustField2);
      $('#edtSaleCustField3').val(data.fields.SaleCustField3);
    })
  };

  templateObject.getTQuoteExData = function (currentID) {
    salesService.getOneQuotedataEx(currentID).then(function (data) {
      $('#edtSaleCustField1').val(data.fields.SaleCustField1);
      $('#edtSaleCustField2').val(data.fields.SaleCustField2);
      $('#edtSaleCustField3').val(data.fields.SaleCustField3);
    })
  };

  templateObject.getTRefundSaleData = function (currentID) {
    salesService.getRefundSales(currentID).then(function (data) {
      $('#edtSaleCustField1').val(data.fields.SaleCustField1);
      $('#edtSaleCustField2').val(data.fields.SaleCustField2);
      $('#edtSaleCustField3').val(data.fields.SaleCustField3);
    })
  };

  templateObject.getTSupplierExData = function (currentID) {
    contactService.getOneSupplierDataEx(currentID).then(function (data) {
      $('#edtSaleCustField1').val(data.fields.CUSTFLD1);
      $('#edtSaleCustField2').val(data.fields.CUSTFLD2);
      $('#edtSaleCustField3').val(data.fields.CUSTFLD3);
    });
  };

  templateObject.getTCustomerExData = function (currentID) {
    contactService.getOneCustomerDataEx(currentID).then(function (data) {
      $('#edtSaleCustField1').val(data.fields.CUSTFLD1);
      $('#edtSaleCustField2').val(data.fields.CUSTFLD2);
      $('#edtSaleCustField3').val(data.fields.CUSTFLD3);
    });
  };

  templateObject.getTEmployeeExData = function (currentID) {
    contactService.getOneEmployeeDataEx(currentID).then(function (data) {
      $('#edtSaleCustField1').val(data.fields.CustFld1);
      $('#edtSaleCustField2').val(data.fields.CustFld2);
      $('#edtSaleCustField3').val(data.fields.CustFld3);
    });
  };

  templateObject.getTLeadExData = function (currentID) {
    contactService.getOneLeadDataEx(currentID).then(function (data) {
      $('#edtSaleCustField1').val(data.fields.CUSTFLD1);
      $('#edtSaleCustField2').val(data.fields.CUSTFLD2);
      $('#edtSaleCustField3').val(data.fields.CUSTFLD3);
    });

  };

  templateObject.getTProductExData = function (currentID) {
    productService.getOneProductdatavs1(currentID).then(function (data) {
      $('#edtSaleCustField1').val(data.fields.CUSTFLD1);
      $('#edtSaleCustField2').val(data.fields.CUSTFLD2);
      $('#edtSaleCustField3').val(data.fields.CUSTFLD3);
    });

  };

  // tempcode ltOrder type is not ready on backend
  templateObject.getChequeData = function (currentCheque) {

    let purchaseService = new PurchaseBoardService();
    let lines = {};

    getVS1Data("TCheque").then(function (dataObject) {
      if (dataObject.length == 0) {
        purchaseService.getOneChequeDataEx(currentCheque).then(function (data) {

          if (data.fields.Lines != null) {
            if (data.fields.Lines) {
              if (data.fields.Lines.length) {
                lines = data.fields.Lines[0].fields;
              } else {
                lines = data.fields.Lines.fields;
              }
            }
            $("#edtSaleCustField1").val(lines.CustomField1);
            $("#edtSaleCustField2").val(lines.CustomField2);
            $("#edtSaleCustField3").val(lines.CustomField3);
          }
        }).catch(function (err) { });
      } else {
        let data = JSON.parse(dataObject[0].data);

        let useData = data.tchequeex;
        lines = useData.filter(ud => ud.fields.ID == currentCheque)

        if (lines[0].fields.Lines != null) {
          if (lines[0].fields.Lines) {
            if (lines[0].fields.Lines.length) {
              lines = lines[0].fields.Lines[0].fields;
            } else {
              lines = lines[0].fields.Lines.fields;
            }
          }
          $("#edtSaleCustField1").val(lines.CustomField1);
          $("#edtSaleCustField2").val(lines.CustomField2);
          $("#edtSaleCustField3").val(lines.CustomField3);
        }

      }
    }).catch(function (err) {
      purchaseService.getOneChequeDataEx(currentCheque).then(function (data) {
        if (data.fields.Lines != null) {
          if (data.fields.Lines) {
            if (data.fields.Lines.length) {
              lines = data.fields.Lines[0].fields;
            } else {
              lines = data.fields.Lines.fields;
            }
          }
          $("#edtSaleCustField1").val(lines.CustomField1);
          $("#edtSaleCustField2").val(lines.CustomField2);
          $("#edtSaleCustField3").val(lines.CustomField3);
        }
      }).catch(function (err) { });
    });
  };

  setTimeout(function () {
    templateObject.getCustomFieldsList('init');
  }, 500);

  ///////
});

Template.closingdates.events({
  "click .btnSaveCustomFieldDropdown": function (e) {
    playSaveAudio();
    const templateObject = Template.instance();
    let organisationService = new OrganisationService();
    setTimeout(function(){
    let customFieldDropdownId = $("#customFieldDropdownId").val() ? parseInt($("#customFieldDropdownId").val()) : 0;
    let newCustomFieldDropdownName = $("#newCustomFieldDropdownName").val();

    if (!customFieldDropdownId) {
      swal({
        title: "Alert",
        text: "Please select the item in the list first",
        type: "info",
        showCancelButton: false,
        // confirmButtonText: "Try Again",
      }).then((result) => {
        if (result.value) {
        } else if (result.dismiss === "cancel") {
        }
      });
      $("#newCustomFieldDropdownModal").modal("hide");
      return;
    }

    $(".fullScreenSpin").css("display", "inline-block");

    objDetails1 = {
      type: "TCustomFieldListDropDown",
      fields: {
        ID: customFieldDropdownId,
        Text: newCustomFieldDropdownName,
      },
    };

    organisationService.saveCustomFieldDropDown(objDetails1).then(function (objDetails) {
      // reset VS1 here
      let selectCustFieldNumber = $("#selectCustFieldNumber").val();

      $("#edtSaleCustField" + selectCustFieldNumber).val(newCustomFieldDropdownName);

      $("#newCustomFieldDropdownModal").modal("hide");
      $(".fullScreenSpin").css("display", "none");

      // should be determined
      var url = FlowRouter.current().path;
      let target_vs1 = "";
      if (
        url.includes("/invoicecard") ||
        url.includes("/salesordercard") ||
        url.includes("/quotecard") ||
        url.includes("/refundcard")
      ) {
        target_vs1 = "";
      } else if (url.includes("/chequecard")) {
        target_vs1 = "TCheque";
      }

      templateObject.getCustomFieldsList(selectCustFieldNumber);
    }).catch(function (err) {
      swal({
        title: "Oooops...",
        text: err,
        type: "error",
        showCancelButton: false,
        confirmButtonText: "Try Again",
      }).then((result) => {
        if (result.value) {
          $(".fullScreenSpin").css("display", "none");
        } else if (result.dismiss === "cancel") {
        }
      });
      $("#newCustomFieldDropdownModal").modal("hide");
      $(".fullScreenSpin").css("display", "none");
    });
  }, delayTimeAfterSound);
  },

  "click .btnSaveCustomField": function () {
    playSaveAudio();
    const templateObject = Template.instance();
    let organisationService = new OrganisationService();
    setTimeout(function(){
    let data_id = $("#currentCustomField").val();
    var url = FlowRouter.current().path;
    let fieldID = parseInt($("#statusId" + data_id).val()) || "";
    let termsName = $("#customFieldText" + data_id).val() || "";
    // $("#customFieldText2").val(custFields[1].custfieldlabel);

    let clickedInput = $("#clickedControl").val();
    let dropDownStatus = $("#isdropDown" + data_id).val();
    let dropDownData = [];
    let dropObj = "";
    let listType = "";
    let objDetails1 = "";

    $(".fullScreenSpin").css("display", "inline-block");
    if (
      url.includes("/invoicecard") ||
      url.includes("/salesordercard") ||
      url.includes("/quotecard") ||
      url.includes("/refundcard")
    ) {
      listType = "ltSales";
    } else if (url.includes("/customerscard")) {
      listType = "ltCustomer";
    } else if (url.includes("/supplierscard")) {
      listType = "ltSupplier";
    } else if (url.includes("/employeescard")) {
      listType = "ltContact";
    } else if (url.includes("/leadscard")) {
      listType = "ltLeads";
    } else if (url.includes("/productview")) {
      listType = "ltProducts";
    } else if (url.includes("/supplierscard")) {
      listType = "ltSupplier";
    } else if (
      url.includes("/purchaseordercard") ||
      url.includes("/billcard") ||
      url.includes("/creditcard") ||
      url.includes("/chequecard") ||
      url.includes("/depositcard")) {
      // customfield tempcode
      listType = "ltOrderLines";
    }

    if (fieldID == "") {
      if (dropDownStatus == "true") {
        let countCustom = 0;
        $(".customText").each(function () {
          countCustom++;
          if ($(this).val()) {
            dropObj = {
              type: "TCustomFieldListDropDown",
              fields: {
                //Recno: parseInt(countCustom) || 0,
                Text: $(this).val(),
              },
            };
            dropDownData.push(dropObj);
          }
        });

        if (termsName !== "") {
          objDetails1 = {
            type: "TCustomFieldList",
            fields: {
              Active: true,
              DataType: "ftString",
              Description: termsName,
              Dropdown: dropDownData,
              IsCombo: true,
              ListType: listType,
            },
          };
        } else {
          objDetails1 = {
            type: "TCustomFieldList",
            fields: {
              Active: true,
              DataType: "ftString",
              //Description: termsName,
              Dropdown: dropDownData,
              IsCombo: true,
              ListType: listType,
            },
          };
        }
      } else {
        objDetails1 = {
          type: "TCustomFieldList",
          fields: {
            DataType: "ftString",
            Description: termsName,
            Dropdown: null,
            IsCombo: false,
            ListType: listType,
          },
        };
      }
      organisationService.saveCustomField(objDetails1).then(function (objDetails) {
        if (clickedInput == "one") {
          $(".lblCustomField1").text(termsName);
          $("#customFieldText1").val(termsName);
        } else if (clickedInput == "two") {
          $(".lblCustomField2").text(termsName);
          $("#customFieldText2").val(termsName);
        } else if (clickedInput == "three") {
          $(".lblCustomField3").text(termsName);
          $("#customFieldText3").val(termsName);
        }
        $("#newCustomFieldPop").modal("toggle");
        // $("#myModal4").modal("toggle");  // tempcode
        $(".fullScreenSpin").css("display", "none");


        sideBarService.getAllCustomFields().then(function (data) {
          addVS1Data("TCustomFieldList", JSON.stringify(data));
        });
        templateObject.getCustomFieldsList(data_id);
        templateObject.drawDropDownListTable(data_id);

      }).catch(function (err) {
        swal({
          title: "Oooops...",
          text: err,
          type: "error",
          showCancelButton: false,
          confirmButtonText: "Try Again",
        }).then((result) => {
          if (result.value) {
            $(".fullScreenSpin").css("display", "none");
          } else if (result.dismiss === "cancel") {
          }
        });
        $(".fullScreenSpin").css("display", "none");
      });
    } else {
      if (dropDownStatus == "true") {
        let countCustom = 0;
        $(".customText").each(function () {
          countCustom++;
          if ($(this).val()) {
            dropObj = {
              type: "TCustomFieldListDropDown",
              fields: {
                ID: parseInt($(this).attr("token")) || 0,
                Text: $(this).val() || "",
              },
            };
            dropDownData.push(dropObj);
          }
        });

        if (termsName !== "") {
          objDetails1 = {
            type: "TCustomFieldList",
            fields: {
              DataType: "ftString",
              Description: termsName,
              Dropdown: dropDownData,
              ID: parseInt(fieldID),
              IsCombo: true,
              ListType: listType,
            },
          };
        } else {
          objDetails1 = {
            type: "TCustomFieldList",
            fields: {
              DataType: "ftString",
              //Description: termsName,
              Dropdown: dropDownData,
              ID: parseInt(fieldID),
              IsCombo: true,
              ListType: listType,
            },
          };
        }
      } else {
        objDetails1 = {
          type: "TCustomFieldList",
          fields: {
            DataType: "ftString",
            Description: termsName,
            ID: parseInt(fieldID),
            Dropdown: null,
            IsCombo: false,
            ListType: listType,
          },
        };
      }

      organisationService.saveCustomField(objDetails1).then(function (objDetails) {
        sideBarService.getAllCustomFields().then(function (data) {
          addVS1Data("TCustomFieldList", JSON.stringify(data));
        });
        if (clickedInput == "one") {
          $(".lblCustomField1").text(termsName);
          $("#customFieldText1").val(termsName);
        } else if (clickedInput == "two") {
          $(".lblCustomField2").text(termsName);
          $("#customFieldText2").val(termsName);
        } else if (clickedInput == "three") {
          $(".lblCustomField3").text(termsName);
          $("#customFieldText3").val(termsName);
        }

        sideBarService.getAllCustomFields().then(function (data) {
          addVS1Data("TCustomFieldList", JSON.stringify(data));
        });
        templateObject.getCustomFieldsList(data_id);
        templateObject.drawDropDownListTable(data_id);

        $("#newCustomFieldPop").modal("toggle");
        // $("#myModal4").modal("toggle"); // tempcode
        $(".fullScreenSpin").css("display", "none");
      }).catch(function (err) {
        swal({
          title: "Oooops...",
          text: err,
          type: "error",
          showCancelButton: false,
          confirmButtonText: "Try Again",
        }).then((result) => {
          if (result.value) {
            $(".fullScreenSpin").css("display", "none");
          } else if (result.dismiss === "cancel") {
          }
        });
        $(".fullScreenSpin").css("display", "none");
      });
    }
  }, delayTimeAfterSound);
  },

  "click .btnCustomFieldToggleText": function (e) {
    const templateObject = Template.instance();
    let data_id = e.target.dataset.id;
    $("#isdropDown" + data_id).val(false);

    let custfieldarr = templateObject.custfields.get();
    let selected_data = custfieldarr[data_id - 1];
    if (data_id == 1) {
      clickedInput = "one";
    } else if (data_id == 2) {
      clickedInput = "two";
    } else {
      clickedInput = "three";
    }
    $("#clickedControl").val(clickedInput);
    $("#currentCustomField").val(data_id);

    isDropdown = false;
    $("#customFieldText" + data_id).attr("datatype", "ftString");
    $("#isdropDown" + data_id).val(isDropdown);
    var url = FlowRouter.current().path;
    let custfield1 = "";
    if (
      url.includes("/invoicecard") ||
      url.includes("/salesordercard") ||
      url.includes("/quotecard") ||
      url.includes("/refundcard")
    ) {
      custfield1 = selected_data.custfieldlabel || "Custom Field " + data_id;
    } else if (url.includes("/chequecard")) {
      custfield1 = selected_data.custfieldlabel || "Custom Field " + data_id;
    } else {
      custfield1 = "Custom Field " + data_id;
    }
    $(".custField" + data_id + "Text").css("display", "block");
    $(".custField" + data_id + "Date").css("display", "none");
    $(".custField" + data_id + "Dropdown").css("display", "none");

    $("#statusId" + data_id).val(selected_data.id);

    $(".checkbox" + data_id + "div").empty();
    $(".checkbox" + data_id + "div").append(
      '<div class="form-group"><label class="lblCustomField' +
      data_id +
      '">' +
      custfield1 +
      "</label>" +
      '<input class="form-control form-control" type="text" id="edtSaleCustField' +
      data_id +
      '" name="edtSaleCustField' +
      data_id +
      '" value=""> </div>'
    );
    $("#edtSaleCustField" + data_id).attr("datatype", "ftString");
  },

  "click .btnCustomFieldToggleDate": function (e) {
    const templateObject = Template.instance();
    let data_id = e.target.dataset.id;
    $("#isdropDown" + data_id).val(false);

    let custfieldarr = templateObject.custfields.get();
    let selected_data = custfieldarr[data_id - 1];
    $("#currentCustomField").val(data_id);

    isDropdown = false;
    $("#isdropDown" + data_id).val(isDropdown);
    $("#statusId" + data_id).val(selected_data.id || "");
    if (data_id == 1) {
      clickedInput = "one";
    } else if (data_id == 2) {
      clickedInput = "two";
    } else {
      clickedInput = "three";
    }
    $("#clickedControl").val(clickedInput);
    var url = FlowRouter.current().path;
    let custfield1 = "";
    if (
      url.includes("/invoicecard") ||
      url.includes("/salesordercard") ||
      url.includes("/quotecard") ||
      url.includes("/refundcard")
    ) {
      custfield1 = selected_data.custfieldlabel || "Custom Field " + data_id;
    } else if (url.includes("/chequecard")) {
      custfield1 = selected_data.custfieldlabel || "Custom Field " + data_id;
    } else {
      custfield1 = "Custom Field " + data_id;
    }

    $(".custField" + data_id + "Text").css("display", "none");
    $(".custField" + data_id + "Date").css("display", "block");
    $(".custField" + data_id + "Dropdown").css("display", "none");
    $("#customFieldText" + data_id).attr("datatype", "ftDateTime");

    $(".checkbox" + data_id + "div").empty();
    $(".checkbox" + data_id + "div").append(
      '<div class="form-group" data-placement="bottom" title="Date format: DD/MM/YYYY"><label class="lblCustomField' +
      data_id +
      '">' +
      custfield1 +
      "<br></label>" +
      '<div class="input-group date" style="cursor: pointer;"><input type="text" class="form-control customField' +
      data_id +
      '" style="width: 86% !important; display: inline-flex;" id="edtSaleCustField' +
      data_id +
      '" name="edtSaleCustField' +
      data_id +
      '" value="">' +
      '<div class="input-group-addon" style=""><span class="glyphicon glyphicon-th" style="cursor: pointer;"></span>' +
      "</div> </div></div>"
    );
    $("#edtSaleCustField" + data_id).attr("datatype", "ftDateTime");

    setTimeout(function () {
      $("#edtSaleCustField" + data_id).datepicker({
        showOn: "button",
        buttonText: "Show Date",
        buttonImageOnly: true,
        buttonImage: "/img/imgCal2.png",
        constrainInput: false,
        dateFormat: "d/mm/yy",
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
      });

      var currentDate = new Date();
      var begunDate = moment(currentDate).format("DD/MM/YYYY");
      $("#edtSaleCustField" + data_id).val(begunDate);
    }, 1500);
  },

  "click .btnCustomFieldToggleDrop": function (e) {
    const templateObject = Template.instance();
    let data_id = e.target.dataset.id;
    let custfieldarr = templateObject.custfields.get();

    custfieldarr[data_id - 1].datatype = "ftString";
    custfieldarr[data_id - 1].isCombo = true;

    templateObject.custfields.set(custfieldarr);

    let selected_data = custfieldarr[data_id - 1];
    isDropdown = true;
    $("#isdropDown" + data_id).val(isDropdown);
    $("#statusId" + data_id).val(selected_data.id || "");
    $(".custField" + data_id + "Text").css("display", "none");
    $(".custField" + data_id + "Date").css("display", "none");
    $(".custField" + data_id + "Dropdown").css("display", "block");
    $("#currentCustomField").val(data_id);

    let tokenid = Random.id();

    if (data_id == 1) {
      clickedInput = "one";
    } else if (data_id == 2) {
      clickedInput = "two";
    } else {
      clickedInput = "three";
    }
    $("#clickedControl").val(clickedInput);
    var url = FlowRouter.current().path;
    let custfield1 = "";
    if (
      url.includes("/invoicecard") ||
      url.includes("/salesordercard") ||
      url.includes("/quotecard") ||
      url.includes("/refundcard")
    ) {
      custfield1 = selected_data.custfieldlabel || "Custom Field " + data_id;
    } else if (url.includes("/chequecard")) {
      custfield1 = selected_data.custfieldlabel || "Custom Field " + data_id;
    } else {
      custfield1 = "Custom Field " + data_id;
    }
    $("#customFieldText" + data_id).attr("datatype", "ftString");
    $(".checkbox" + data_id + "div").empty();
    if (Array.isArray(selected_data.dropdown)) {
      $(".btnAddNewTextBox").nextAll().remove();
      for (let x = 0; x < selected_data.dropdown.length; x++) {
        $(".dropDownSection").append(
          '<div class="row textBoxSection" id="textBoxSection" style="padding:5px">' +
          '<div class="col-10">' +
          '<input type="text" style="" name="customText" class="form-control customText" token="' +
          selected_data.dropdown[x].fields.ID +
          '" value="' +
          selected_data.dropdown[x].fields.Text +
          '" autocomplete="off">' +
          "</div>" +
          '<div class="col-2">' +
          '<button type="button" class="btn btn-danger btn-rounded btnRemoveDropOptions" autocomplete="off"><i class="fa fa-remove"></i></button>' +
          "</div>" +
          "</div>"
        );
      }
    } else if (selected_data.dropdown && !Array.isArray(selected_data.dropdown) && Object.keys(selected_data.dropdown).length > 0) {
      $(".btnAddNewTextBox").nextAll().remove();
      $(".dropDownSection").append(
        '<div class="row textBoxSection" id="textBoxSection" style="padding:5px">' +
        '<div class="col-10">' +
        '<input type="text" style="" name="customText" class="form-control customText" token="' +
        selected_data.dropdown.fields.ID +
        '" value="' +
        selected_data.dropdown.fields.Text +
        '" autocomplete="off">' +
        "</div>" +
        '<div class="col-2">' +
        '<button type="button" class="btn btn-danger btn-rounded btnRemoveDropOptions" autocomplete="off"><i class="fa fa-remove"></i></button>' +
        "</div>" +
        "</div>"
      );
    }
    $(".dropDownSection").show();
    $("#newStatus" + data_id).val($("#customFieldText" + data_id).val());
    $("#newCustomFieldPop").modal("toggle");
    templateObject.drawDropDownListTable(data_id);

    $(".checkbox" + data_id + "div").append(
      '<div class="form-group"><label class="lblCustomField' +
      data_id +
      '">' +
      custfield1 +
      "<br></label>" +
      ' <select type="search" class="form-control pointer customField' +
      data_id +
      '" id="edtSaleCustField' +
      data_id +
      '" name="edtSaleCustField' +
      data_id +
      '" style="background-color:rgb(255, 255, 255); border-top-left-radius: 0.35rem; border-bottom-left-radius: 0.35rem;"></select></div>'
    );
    $("#edtSaleCustField" + data_id).attr("datatype", "ftString");
    setTimeout(function () {
      $("#edtSaleCustField" + data_id).editableSelect();
      $("#edtSaleCustField" + data_id).editableSelect().on("click.editable-select", function (e, li) {
        var $earch = $(this);
        var offset = $earch.offset();
        var fieldDataName = e.target.value || "";
        if (e.pageX > offset.left + $earch.width() - 8) {
          // X button 16px wide?
          $("#customFieldList").modal("toggle");
        } else {
          if (fieldDataName.replace(/\s/g, "") != "") {
            $("#newStatusHeader" + data_id).text("Edit Custom Field");
            getVS1Data("TCustomFieldList").then(function (dataObject) {
              //edit to test indexdb
              if (dataObject.length == 0) {
                $(".fullScreenSpin").css("display", "inline-block");
                sideBarService.getAllCustomFields().then(function (data) {
                  for (let i in data.tcustomfieldlist) {
                    if (data.tcustomfieldlist[i].fields.Description === fieldDataName) {
                      $("#statusId" + data_id).val(data.tcustomfieldlist[i].fields.ID);
                      $("#newStatus" + data_id).val(data.tcustomfieldlist[i].fields.Description);
                    }
                  }
                  setTimeout(function () {
                    $(".fullScreenSpin").css("display", "none");
                    $("#newCustomFieldPop").modal("toggle");
                  }, 200);
                });
              } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcustomfieldlist;
                for (let i in useData) {
                  if (data.tcustomfieldlist[i].fields.Description === fieldDataName) {
                    $("#statusId" + data_id).val(useData[i].fields.ID);
                    $("#newStatus" + data_id).val(useData[i].fields.Description);
                  }
                }
                setTimeout(function () {
                  $(".fullScreenSpin").css("display", "none");
                  $("#newCustomFieldPop").modal("toggle");
                }, 200);
              }
            }).catch(function (err) {
              $(".fullScreenSpin").css("display", "inline-block");
              sideBarService.getAllCustomFields().then(function (data) {
                for (let i in data.tcustomfieldlist) {
                  if (data.tcustomfieldlist[i].fields.Description === fieldDataName) {
                    $("#statusId" + data_id).val(data.tcustomfieldlist[i].fields.ID);
                    $("#newStatus" + data_id).val(data.tcustomfieldlist[i].fields.Description);
                  }
                }
                setTimeout(function () {
                  $(".fullScreenSpin").css("display", "none");
                  $("#newCustomFieldPop").modal("toggle");
                }, 200);
              });
            });
          } else {
            $("#customFieldList").modal("toggle");
          }
        }
      });
    }, 1500);
  },

  "click .btnCustomFieldResetSettings": function (event) {
    var url = FlowRouter.current().path;
    let organisationService = new OrganisationService();
    var url = FlowRouter.current().path;
    let fieldData = [];
    let checkChckBox = false;

    $("#formCheck-customOne").prop("checked", false);
    $(".checkbox1div").css("display", "none");
    $("#formCheck-customTwo").prop("checked", false);
    $(".checkbox2div").css("display", "none");
    $("#formCheck-customThree").prop("checked", false);
    $(".checkbox3div").css("display", "none");

    $(".custField1Text").css("display", "block");
    $(".custField1Date").css("display", "none");
    $(".custField1Dropdown").css("display", "none");

    $(".custField2Text").css("display", "block");
    $(".custField2Date").css("display", "none");
    $(".custField2Dropdown").css("display", "none");

    $(".custField3Text").css("display", "block");
    $(".custField3Date").css("display", "none");
    $(".custField3Dropdown").css("display", "none");

    let field_no = 1;
    $(".customfieldcommon").each(function () {
      dropObj = {
        active: checkChckBox,
        id: $(this).attr("custid") || "",
        name: "Custom Field" + field_no,
        datatype: "ftString",
      };
      fieldData.push(dropObj);
      field_no++;
    });

    let listType = "";
    let objDetails1 = "";
    $(".fullScreenSpin").css("display", "inline-block");
    if (
      url.includes("/invoicecard") ||
      url.includes("/salesordercard") ||
      url.includes("/quotecard") ||
      url.includes("/refundcard")
    ) {
      listType = "ltSales";
    } else if (url.includes("/customerscard")) {
      listType = "ltCustomer";
    } else if (url.includes("/supplierscard")) {
      listType = "ltSupplier";
    } else if (url.includes("/employeescard")) {
      listType = "ltContact";
    } else if (url.includes("/leadscard")) {
      listType = "ltLeads";
    } else if (url.includes("/productview")) {
      listType = "ltProducts";
    } else if (url.includes("/supplierscard")) {
      listType = "ltSupplier";
    } else if (
      url.includes("/purchaseordercard") ||
      url.includes("/billcard") ||
      url.includes("/creditcard") ||
      url.includes("/chequecard") ||
      url.includes("/depositcard")) {
      // customfield tempcode
      listType = "ltOrderLines";
    }

    for (let i = 0; i < fieldData.length; i++) {
      let fieldID = fieldData[i].id || 0;
      let name = fieldData[i].name || "";

      if (fieldID == "") {
        if (i == 0) {
          $(".lblCustomField1").text("Text Field");
          $("#customFieldText1").val("Custom Field1");
        }

        if (i == 1) {
          $(".lblCustomField2").text("Text Field");
          $("#customFieldText2").val("Custom Field2");
        }

        if (i == 2) {
          $(".lblCustomField3").text("Text Field");
          $("#customFieldText3").val("Custom Field3");
          $("#myModal4").modal("toggle");
          $(".fullScreenSpin").css("display", "none");
        }
      } else {
        objDetails1 = {
          type: "TCustomFieldList",
          fields: {
            Active: false,
            ID: parseInt(fieldID),
            DataType: "ftString",
            Description: name,
            ListType: listType,
            IsCombo: "false",
          },
        };

        organisationService.saveCustomField(objDetails1).then(function (objDetails) {
          if (i == 0) {
            $(".lblCustomField1").text("Text Field");
            $("#customFieldText1").val(fieldData[i].name);
          }

          if (i == 1) {
            $(".lblCustomField2").text("Text Field");
            $("#customFieldText2").val(fieldData[i].name);
          }

          if (i == 2) {
            $(".lblCustomField3").text("Text Field");
            $("#customFieldText3").val(fieldData[i].name);
            $("#myModal4").modal("toggle");
            $(".fullScreenSpin").css("display", "none");
          }
        }).catch(function (err) {
          swal({
            title: "Oooops...",
            text: err,
            type: "error",
            showCancelButton: false,
            confirmButtonText: "Try Again",
          }).then((result) => {
            if (result.value) {
              $(".fullScreenSpin").css("display", "none");
            } else if (result.dismiss === "cancel") {
            }
          });
          $(".fullScreenSpin").css("display", "none");
        });
      }
    }

    setTimeout(function () {
      sideBarService.getAllCustomFields().then(function (data) {
        addVS1Data("TCustomFieldList", JSON.stringify(data));
      });
    }, 1500);
  },

  "click .btnCustomFieldSaveSettings": function (event) {
    const templateObject = Template.instance();

    var url = FlowRouter.current().path;
    let organisationService = new OrganisationService();
    var url = FlowRouter.current().path;
    let fieldData = [];
    let checkChckBox = false;
    $(".customfieldcommon").each(function () {
      if (
        $(this).closest(".custom-switch").find("[type=checkbox]").is(":checked")
      ) {
        checkChckBox = true;
      } else {
        checkChckBox = false;
      }
      dropObj = {
        active: checkChckBox,
        id: $(this).attr("custid") || "",
        name: $(this).val() || "",
        datatype: $(this).attr("datatype") || "",
      };
      fieldData.push(dropObj);
    });

    let listType = "";
    let objDetails1 = "";
    $(".fullScreenSpin").css("display", "inline-block");
    if (
      url.includes("/invoicecard") ||
      url.includes("/salesordercard") ||
      url.includes("/quotecard") ||
      url.includes("/refundcard")
    ) {
      listType = "ltSales";
    } else if (url.includes("/customerscard")) {
      listType = "ltCustomer";
    } else if (url.includes("/supplierscard")) {
      listType = "ltSupplier";
    } else if (url.includes("/employeescard")) {
      listType = "ltContact";
    } else if (url.includes("/leadscard")) {
      listType = "ltLeads";
    } else if (url.includes("/productview")) {
      listType = "ltProducts";
    } else if (url.includes("/supplierscard")) {
      listType = "ltSupplier";
    } else if (
      url.includes("/purchaseordercard") ||
      url.includes("/billcard") ||
      url.includes("/creditcard") ||
      url.includes("/chequecard") ||
      url.includes("/depositcard")) {
      // customfield tempcode
      listType = "ltOrderLines";
    }

    let selectCustFieldNumber = 1;
    for (let i = 0; i < fieldData.length; i++) {
      let fieldID = fieldData[i].id || 0;
      let name = fieldData[i].name || "";
      let dataType = fieldData[i].datatype || "";
      let isdropDown = $("#isdropDown" + (1 + parseInt(i))).val() || false;
      if (isdropDown) {
        selectCustFieldNumber = 1 + parseInt(i);
      }
      if (fieldID == "") {
        if (dataType == "ftDateTime") {
          objDetails1 = {
            type: "TCustomFieldList",
            fields: {
              Active: fieldData[i].active || false,
              DataType: "ftDateTime",
              Description: name,
              ListType: listType,
              IsCombo: false,
            },
          };
        } else {
          objDetails1 = {
            type: "TCustomFieldList",
            fields: {
              Active: fieldData[i].active || false,
              DataType: "ftString",
              Description: name,
              ListType: listType,
              IsCombo: isdropDown,
            },
          };
        }

        organisationService.saveCustomField(objDetails1).then(function (objDetails) {
          if (i == 0) {
            $(".lblCustomField1").text(fieldData[i].name);
            $("#customFieldText1").val(fieldData[i].name);
          }

          if (i == 1) {
            $(".lblCustomField2").text(fieldData[i].name);
            $("#customFieldText2").val(fieldData[i].name);
          }

          if (i == 2) {
            $(".lblCustomField3").text(fieldData[i].name);
            $("#customFieldText3").val(fieldData[i].name);
            $("#myModal4").modal("toggle");
            $(".fullScreenSpin").css("display", "none");
          }
          // templateObject.getCustomFieldsList(parseInt(i) + 1);
        }).catch(function (err) {
          swal({
            title: "Oooops...",
            text: err,
            type: "error",
            showCancelButton: false,
            confirmButtonText: "Try Again",
          }).then((result) => {
            if (result.value) {
              $(".fullScreenSpin").css("display", "none");
            } else if (result.dismiss === "cancel") {
            }
          });
          $(".fullScreenSpin").css("display", "none");
        });
      } else {
        if (dataType == "ftDateTime") {
          objDetails1 = {
            type: "TCustomFieldList",
            fields: {
              Active: fieldData[i].active || false,
              ID: parseInt(fieldID),
              DataType: "ftDateTime",
              Description: name,
              ListType: listType,
              IsCombo: false,
            },
          };
        } else {
          objDetails1 = {
            type: "TCustomFieldList",
            fields: {
              Active: fieldData[i].active || false,
              ID: parseInt(fieldID),
              DataType: "ftString",
              Description: name,
              ListType: listType,
              IsCombo: isdropDown,
            },
          };
        }

        organisationService.saveCustomField(objDetails1).then(function (objDetails) {
          if (i == 0) {
            $(".lblCustomField1").text(fieldData[i].name);
            $("#customFieldText1").val(fieldData[i].name);
          }

          if (i == 1) {
            $(".lblCustomField2").text(fieldData[i].name);
            $("#customFieldText2").val(fieldData[i].name);
          }

          if (i == 2) {
            $(".lblCustomField3").text(fieldData[i].name);
            $("#customFieldText3").val(fieldData[i].name);
            $("#myModal4").modal("toggle");
            $(".fullScreenSpin").css("display", "none");
          }

          // templateObject.getCustomFieldsList(parseInt(i) + 1);
        }).catch(function (err) {
          swal({
            title: "Oooops...",
            text: err,
            type: "error",
            showCancelButton: false,
            confirmButtonText: "Try Again",
          }).then((result) => {
            if (result.value) {
              $(".fullScreenSpin").css("display", "none");
            } else if (result.dismiss === "cancel") {
            }
          });
          $(".fullScreenSpin").css("display", "none");
        });
      }
    }

    setTimeout(function () {
      sideBarService.getAllCustomFields().then(function (data) {
        addVS1Data("TCustomFieldList", JSON.stringify(data));
      });
    }, 1500);
  },

  "click .btnAddNewTextBox": function (event) {
    var textBoxData = $("#textBoxSection:last").clone(true);
    let tokenid = Random.id();
    textBoxData.find("input:text").val("");
    textBoxData.find("input:text").attr("token", "0");
    $(".dropDownSection").append(textBoxData);
  },

  "click .btnRemoveDropOptions": function (event) {
    if ($(".textBoxSection").length > 1) {
      $(event.target).closest(".textBoxSection").remove();
    } else {
      $("input[name='customText']").val("");
    }
  },

  // search labels table
  "keyup .dataTables_filter input": function (event) {
    if ($(event.target).val() != "") {
      $(".btnRefreshCustomField").addClass("btnSearchAlert");
    } else {
      $(".btnRefreshCustomField").removeClass("btnSearchAlert");
    }
    if (event.keyCode == 13) {
      $(".btnRefreshCustomField").trigger("click");
    }
  },

});

Template.closingdates.helpers({
  custfield1: () => {
    let url = FlowRouter.current().path;
    if (url.includes("/salesordercard")) {
      return localStorage.getItem("custfield1salesorder") || "Custom Field 1";
    } else if (url.includes("/invoicecard")) {
      return localStorage.getItem("custfield1invoice") || "Custom Field 1";
    } else if (url.includes("/quotecard")) {
      return localStorage.getItem("custfield1quote") || "Custom Field 1";
    } else if (url.includes("/refundcard")) {
      return localStorage.getItem("custfield1refund") || "Custom Field 1";
    } else if (url.includes("/chequecard")) {
      return localStorage.getItem("custfield1cheque") || "Custom Field 1";
    }
  },
  custfield2: () => {
    let url = FlowRouter.current().path;
    if (url.includes("/salesordercard")) {
      return localStorage.getItem("custfield2salesorder") || "Custom Field 2";
    } else if (url.includes("/invoicecard")) {
      return localStorage.getItem("custfield2invoice") || "Custom Field 2";
    } else if (url.includes("/quotecard")) {
      return localStorage.getItem("custfield2quote") || "Custom Field 2";
    } else if (url.includes("/refundcard")) {
      return localStorage.getItem("custfield2refund") || "Custom Field 2";
    } else if (url.includes("/chequecard")) {
      return localStorage.getItem("custfield2cheque") || "Custom Field 2";
    }
  },
  custfield3: () => {
    let url = FlowRouter.current().path;
    if (url.includes("/salesordercard")) {
      return localStorage.getItem("custfield3salesorder") || "Custom Field 3";
    } else if (url.includes("/invoicecard")) {
      return localStorage.getItem("custfield3invoice") || "Custom Field 3";
    } else if (url.includes("/quotecard")) {
      return localStorage.getItem("custfield3quote") || "Custom Field 3";
    } else if (url.includes("/refundcard")) {
      return localStorage.getItem("custfield3refund") || "Custom Field 3";
    } else if (url.includes("/chequecard")) {
      return localStorage.getItem("custfield3cheque") || "Custom Field 3";
    }
  },
  custfields: () => {
    return Template.instance().custfields.get();
  },
});
