import { FixedAssetService } from '../../fixedasset-service'
let fixedAssetService = new FixedAssetService();

Template.fixedassettypelistpop.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);
});

Template.fixedassettypelistpop.onRendered(function () {
  let templateObject = Template.instance();

  templateObject.getAllFixedAssetTypeList = function () {
    getVS1Data("TFixedAssetType").then(function (dataObject) {
      if (dataObject.length === 0) {
        fixedAssetService.getFixedAssetTypes().then(function (data) {
          return data;
        });
      } else {
        let data = JSON.parse(dataObject[0].data);
        let useData = data.tfixedassettype;

      }
    }).catch(function (err) {
      fixedAssetService.getFixedAssetTypes().then(function (data) {
        return data;
      });
    });
  }
  templateObject.getAllFixedAssetTypeList();

  function initFixedAssetTypeTable(data) {
    let splashArrayTaskList = data;
    $("#tblSubtaskDatatable").DataTable({
      data: splashArrayTaskList,
      columnDefs: [
        {
          orderable: false,
          targets: 0,
          className: "colAssetTypeName",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).closest("tr").attr("data-id", rowData[0]);
            $(td).attr("data-id", rowData[3]);
          },
          width: "",
        },
        {
          orderable: false,
          targets: 1,
          className: "colAssetTypeCode",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[3]);
          },
          width: "",
        },
        {
          orderable: false,
          targets: 2,
          className: "colAssetTypeNote",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[3]);
          },
          width: "",
        },
      ],
      colReorder: {
        fixedColumnsLeft: 0,
      },
      sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
      select: true,
      destroy: true,
      // colReorder: true,
      pageLength: initialDatatableLoad,
      lengthMenu: [
        [initialDatatableLoad, -1],
        [initialDatatableLoad, "All"],
      ],
      info: true,
      responsive: true,
      order: [
        [1, "desc"],
      ],
      action: function () {
        $("#tblSubtaskDatatable").DataTable().ajax.reload();
      },
    });
  }

});
