import { ReactiveVar } from "meteor/reactive-var";
import { FixedAssetService } from "../../fixedasset-service";
import { SideBarService } from "../../../js/sidebar-service";
import { UtilityService } from "../../../utility-service";
import "../../../lib/global/indexdbstorage.js";
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let fixedAssetService = new FixedAssetService();

Template.fixedassetlisttable.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);
});

Template.fixedassetlisttable.onRendered(function () {
  // $(".fullScreenSpin").css("display", "inline-block");
  let templateObject = Template.instance();

  // set initial table rest_data
  templateObject.init_reset_data = function () {
    let reset_data = [
      { index: 0, label: 'ID', class: 'FixedID', active: false, display: false, width: "0" },
      { index: 1, label: 'Asset Name', class: 'AssetName', active: true, display: true, width: "" },
      { index: 2, label: 'Colour', class: 'Color', active: true, display: true, width: "" },
      { index: 3, label: 'Brand Name', class: 'BrandName', active: true, display: true, width: "" },
      { index: 4, label: 'Manufacture', class: 'Manufacture', active: true, display: true, width: "" },
      { index: 5, label: 'Model', class: 'Model', active: true, display: true, width: "" },
      { index: 6, label: 'Asset Code', class: 'AssetCode', active: true, display: true, width: "" },
      { index: 7, label: 'Asset Type', class: 'AssetType', active: true, display: true, width: "" },
      { index: 8, label: 'Department', class: 'Department', active: true, display: true, width: "" },
      { index: 9, label: 'Purch Date', class: 'PurchDate', active: true, display: true, width: "" },
      { index: 10, label: 'Purch Cost', class: 'PurchCost', active: true, display: true, width: "" },
      { index: 11, label: 'Serial', class: 'Serial', active: false, display: true, width: "" },
      { index: 12, label: 'Qty', class: 'Qty', active: true, display: true, width: "" },
      { index: 13, label: 'Asset Condition', class: 'AssetCondition', active: true, display: true, width: "" },
      { index: 14, label: 'Location Description', class: 'LocationDescription', active: false, display: true, width: "" },
      { index: 15, label: 'Notes', class: 'Notes', active: false, display: true, width: "" },
      { index: 16, label: 'Size', class: 'Size', active: true, display: true, width: "" },
      { index: 17, label: 'Shape', class: 'Shape', active: true, display: true, width: "" },
      { index: 18, label: 'Status', class: 'Status', active: true, display: true, width: "" },
      { index: 19, label: 'Business Use(%)', class: 'BusinessUse', active: true, display: true, width: "" },
      { index: 20, label: 'Estimated Value', class: 'EstimatedValue', active: true, display: true, width: "" },
      { index: 21, label: 'Replacement Cost', class: 'ReplacementCost', active: true, display: true, width: "" },
      { index: 22, label: 'Warranty Type', class: 'WarrantyType', active: false, display: true, width: "" },
      { index: 23, label: 'Warranty Expires Date', class: 'WarrantyExpiresDate', active: false, display: true, width: "" },
      { index: 24, label: 'Insured By', class: 'InsuredBy', active: false, display: true, width: "" },
      { index: 25, label: 'Insurance Policy', class: 'InsurancePolicy', active: false, display: true, width: "" },
      { index: 26, label: 'Insured Until', class: 'InsuredUntil', active: false, display: true, width: "" },
      { index: 27, label: 'Active', class: 'Active', active: true, display: true, width: "" },
    ];

    let templateObject = Template.instance();
    templateObject.reset_data.set(reset_data);
  }
  templateObject.init_reset_data();
  // set initial table rest_data

  // custom field displaysettings
  templateObject.initCustomFieldDisplaySettings = function (listType) {
    let reset_data = templateObject.reset_data.get();
    showCustomFieldDisplaySettings(reset_data);

    try {
      getVS1Data("VS1_Customize").then(function (dataObject) {
        if (dataObject.length == 0) {
          sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')), listType).then(function (data) {
            reset_data = data.ProcessLog.Obj.CustomLayout[0].Columns;
            showCustomFieldDisplaySettings(reset_data);
          }).catch(function (err) {
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          if (data.ProcessLog.Obj.CustomLayout.length > 0) {
            for (let i = 0; i < data.ProcessLog.Obj.CustomLayout.length; i++) {
              if (data.ProcessLog.Obj.CustomLayout[i].TableName == listType) {
                reset_data = data.ProcessLog.Obj.CustomLayout[i].Columns;
                showCustomFieldDisplaySettings(reset_data);
              }
            }
          };
          // handle process here
        }
      });
    } catch (error) {
    }
    return;
  }

  function showCustomFieldDisplaySettings(reset_data) {
    let custFields = [];
    let customData = {};
    let customFieldCount = reset_data.length;

    for (let r = 0; r < customFieldCount; r++) {
      customData = {
        active: reset_data[r].active,
        id: reset_data[r].index,
        custfieldlabel: reset_data[r].label,
        class: reset_data[r].class,
        display: reset_data[r].display,
        width: reset_data[r].width ? reset_data[r].width : ''
      };
      custFields.push(customData);
    }
    templateObject.displayfields.set(custFields);
  }

  templateObject.initCustomFieldDisplaySettings("tblFixedAssetsOverview");
  // set initial table rest_data  //

  templateObject.getFixedAssetsList = function () {
    getVS1Data("TFixedAssets").then(function (dataObject) {
      if (dataObject.length == 0) {
        fixedAssetService.getTFixedAssetsList().then(function (data) {
          setFixedAssetsList(data);
        }).catch(function (err) {
          $(".fullScreenSpin").css("display", "none");
        });
      } else {
        let data = JSON.parse(dataObject[0].data);
        setFixedAssetsList(data);
      }
    }).catch(function (err) {
      fixedAssetService.getTFixedAssetsList().then(function (data) {
        setFixedAssetsList(data);
      }).catch(function (err) {
        $(".fullScreenSpin").css("display", "none");
      });
    });
  };

  $(".fullScreenSpin").css("display", "inline-block");
  templateObject.getFixedAssetsList();

  function setFixedAssetsList(data) {
    addVS1Data('TFixedAssets', JSON.stringify(data));
    const dataTableList = [];

    for (const asset of data.tfixedassets) {
      const dataList = {
        id: asset.fields.ID || "",
        assetname: asset.fields.AssetName || "",
        color: asset.fields.Colour || "",
        brandname: asset.fields.BrandName || "",
        manufacture: asset.fields.Manufacture || "",
        model: asset.fields.Model || "",
        assetcode: asset.fields.AssetCode || "",
        assettype: asset.fields.AssetType || "",
        department: asset.fields.Department || "",   // tempcode how to get department
        purchdate: asset.fields.PurchDate ? moment(asset.fields.PurchDate).format("DD/MM/YYYY") : "",
        purchcost: utilityService.modifynegativeCurrencyFormat(asset.fields.PurchCost) || 0.0,
        serial: asset.fields.Serial || "",
        qty: asset.fields.Qty || 0,
        assetcondition: asset.fields.AssetCondition || "",
        locationdescription: asset.fields.LocationDescription || "",
        notes: asset.fields.Notes || "",
        size: asset.fields.Size || "",
        shape: asset.fields.Shape || "",
        status: asset.fields.Status || "",
        businessuse: asset.fields.BusinessUsePercent || 0.0,
        businessuse2: asset.fields.BusinessUsePercent2 || 0.0,
        estimatedvalue: utilityService.modifynegativeCurrencyFormat(asset.fields.EstimatedValue) || 0.0,
        replacementcost: utilityService.modifynegativeCurrencyFormat(asset.fields.ReplacementCost) || 0.0,
        warrantytype: asset.fields.WarrantyType || "",
        warrantyexpiresDate: asset.fields.WarrantyExpiresDate ? moment(asset.fields.WarrantyExpiresDate).format("DD/MM/YYYY") : "",
        insuredby: asset.fields.InsuredBy || "",
        insurancepolicy: asset.fields.InsurancePolicy || "",
        insureduntil: asset.fields.InsuredUntil ? moment(asset.fields.InsuredUntil).format("DD/MM/YYYY") : "",
        active: asset.fields.Active || false
      };
      dataTableList.push(dataList);
    }

    templateObject.datatablerecords.set(dataTableList);

    $(".fullScreenSpin").css("display", "none");
    setTimeout(function () {
      $("#tblFixedAssetsOverview").DataTable({
        columnDefs: [
        ],
        select: true,
        destroy: true,
        colReorder: true,
        sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        buttons: [{
          extend: "csvHtml5",
          text: "",
          download: "open",
          className: "btntabletocsv hiddenColumn",
          filename: "FixedAssetsOverview__" + moment().format(),
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
          title: "Accounts Overview",
          filename: "Accounts Overview_" + moment().format(),
          exportOptions: {
            columns: ":visible",
          },
        },
        {
          extend: "excelHtml5",
          title: "",
          download: "open",
          className: "btntabletoexcel hiddenColumn",
          filename: "FixedAssetsOverview__" + moment().format(),
          orientation: "portrait",
          exportOptions: {
            columns: ":visible",
          },
        },
        ],
        pageLength: initialDatatableLoad,
        lengthMenu: [
          [initialDatatableLoad, -1],
          [initialDatatableLoad, "All"],
        ],
        info: true,
        responsive: true,
        order: [
          [0, "asc"]
        ],
        // "aaSorting": [[1,'desc']],
        action: function () {
          $("#tblFixedAssetsOverview").DataTable().ajax.reload();
        },
        language: { search: "", searchPlaceholder: "Search List..." },
        fnDrawCallback: function (oSettings) {
        },
        fnInitComplete: function () {
          $(
            "<button class='btn btn-primary btnSearchFixedAccount' type='button' id='btnSearchFixedAccount' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
          ).insertAfter("#tblFixedAssetsOverview_filter");
        },
      })
        .on("page", function () {
          let draftRecord = templateObject.datatablerecords.get();
          templateObject.datatablerecords.set(draftRecord);
        })
        .on("column-reorder", function () { })
        .on("length.dt", function (e, settings, len) {
        });
    }, 10);
  }
  tableResize();
});

Template.fixedassetlisttable.events({
  "mouseover .card-header": (e) => {
    $(e.currentTarget).parent(".card").addClass("hovered");
  },
  "mouseleave .card-header": (e) => {
    $(e.currentTarget).parent(".card").removeClass("hovered");
  },
  // custom field displaysettings
  "click .resetTable": async function (event) {
    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    reset_data = reset_data.filter(redata => redata.display);

    $(".customDisplaySettings").each(function (index) {
      let $tblrow = $(this);
      $tblrow.find(".divcolumn").text(reset_data[index].label);
      $tblrow
        .find(".custom-control-input")
        .prop("checked", reset_data[index].active);

      let title = $("#tblQuoteLine").find("th").eq(index);
      if (reset_data[index].class === 'AmountEx' || reset_data[index].class === 'UnitPriceEx') {
        $(title).html(reset_data[index].label + `<i class="fas fa-random fa-trans"></i>`);
      } else if (reset_data[index].class === 'AmountInc' || reset_data[index].class === 'UnitPriceInc') {
        $(title).html(reset_data[index].label + `<i class="fas fa-random"></i>`);
      } else {
        $(title).html(reset_data[index].label);
      }


      if (reset_data[index].active) {
        $('.col' + reset_data[index].class).addClass('showColumn');
        $('.col' + reset_data[index].class).removeClass('hiddenColumn');
      } else {
        $('.col' + reset_data[index].class).addClass('hiddenColumn');
        $('.col' + reset_data[index].class).removeClass('showColumn');
      }
      $(".rngRange" + reset_data[index].class).val(reset_data[index].width);
    });
  },
  "click .saveTable": async function (event) {
    let lineItems = [];
    $(".fullScreenSpin").css("display", "inline-block");

    $(".customDisplaySettings").each(function (index) {
      var $tblrow = $(this);
      var fieldID = $tblrow.attr("custid") || 0;
      var colTitle = $tblrow.find(".divcolumn").text() || "";
      var colWidth = $tblrow.find(".custom-range").val() || 0;
      var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || "";
      var colHidden = false;
      if ($tblrow.find(".custom-control-input").is(":checked")) {
        colHidden = true;
      } else {
        colHidden = false;
      }
      let lineItemObj = {
        index: parseInt(fieldID),
        label: colTitle,
        active: colHidden,
        width: parseInt(colWidth),
        class: colthClass,
        display: true
      };

      lineItems.push(lineItemObj);
    });

    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    reset_data = reset_data.filter(redata => redata.display == false);
    lineItems.push(...reset_data);
    lineItems.sort((a, b) => a.index - b.index);

    try {
      let erpGet = erpDb();
      let tableName = "tblFixedAssetsOverview";
      let employeeId = parseInt(Session.get('mySessionEmployeeLoggedID')) || 0;
      let added = await sideBarService.saveNewCustomFields(erpGet, tableName, employeeId, lineItems);
      $(".fullScreenSpin").css("display", "none");
      if (added) {
        sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')), '').then(function (dataCustomize) {
          addVS1Data('VS1_Customize', JSON.stringify(dataCustomize));
        });
        swal({
          title: 'SUCCESS',
          text: "Display settings is updated!",
          type: 'success',
          showCancelButton: false,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $('#displaySettingsModal2').modal('hide');
          }
        });
      } else {
        swal("Something went wrong!", "", "error");
      }
    } catch (error) {
      $(".fullScreenSpin").css("display", "none");
      swal("Something went wrong!", "", "error");
    }
  },

  'change .custom-range': function (event) {
    let range = $(event.target).val();
    let colClassName = $(event.target).attr("valueclass");
    $('.col' + colClassName).css('width', range);
  },
  'click .custom-control-input': function (event) {
    let colClassName = $(event.target).attr("id");
    if ($(event.target).is(':checked')) {
      $('.col' + colClassName).addClass('showColumn');
      $('.col' + colClassName).removeClass('hiddenColumn');
    } else {
      $('.col' + colClassName).addClass('hiddenColumn');
      $('.col' + colClassName).removeClass('showColumn');
    }
  },
  "click .btnRefresh": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    fixedAssetService.getTFixedAssetsList().then(function (data) {
      addVS1Data("TFixedAssets", JSON.stringify(data))
        .then(function (datareturn) {
          Meteor._reload.reload();
        })
        .catch(function (err) {
          Meteor._reload.reload();
        });
    }).catch(function (err) {
      Meteor._reload.reload();
    });
  },

  "click #btnNewFixedAsset": function () {
    FlowRouter.go('/fixedassetcard');
  },

  "click #btnAssetCostReport": function () {
    FlowRouter.go('/assetcostreport');
  },

  "click #btnAssetRegister": function () {
    FlowRouter.go('/assetregisteroverview');
  }

});

Template.fixedassetlisttable.helpers({
  datatablerecords: () => {
    return Template.instance().datatablerecords.get().sort(function (a, b) {
      if (a.assetname === "NA") {
        return 1;
      } else if (b.assetname === "NA") {
        return -1;
      }
      return a.assetname.toUpperCase() > b.assetname.toUpperCase() ? 1 : -1;
    });
  },
  // custom fields displaysettings
  displayfields: () => {
    return Template.instance().displayfields.get();
  },
});
