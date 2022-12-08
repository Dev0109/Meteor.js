
Template.mailchimpList.onRendered(function () {
  const templateObject = Template.instance();

  templateObject.getInitCampaignOpenReports = function () {
    $(".fullScreenSpin").css("display", "inline-block");
    try {
      getVS1Data("TCampaignList").then(function (dataObject) {
        if (dataObject.length == 0) {
          templateObject.getCampaignOpenReports();
          $(".fullScreenSpin").css("display", "none");
        } else {
          let result = JSON.parse(dataObject[0].data);
          initDatatable(result);
          $(".fullScreenSpin").css("display", "none");
        }
      })
    } catch (error) {
      templateObject.getCampaignOpenReports();
      $(".fullScreenSpin").css("display", "none");
    }
  }
  templateObject.getInitCampaignOpenReports();

  templateObject.getCampaignOpenReports = function () {
    $(".fullScreenSpin").css("display", "inline-block");
    try {
      var erpGet = erpDb();
      Meteor.call('getCampaignOpenReports', erpGet, function (error, result) {
        if (error !== undefined) {
          swal("Something went wrong!", "", "error");
        } else {
          addVS1Data("TCampaignList", JSON.stringify(result));
          initDatatable(result);
        }
        $(".fullScreenSpin").css("display", "none");
      });
    } catch (error) {
      swal("Something went wrong!", "", "error");
      $(".fullScreenSpin").css("display", "none");
    }
  }

  function initDatatable(data) {
    var reportArray = templateObject.makeEmailTableRows(data);
    $("#tblEmailList").DataTable({
      data: reportArray,
      columnDefs: [
      ],
      sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
      buttons: [
        {
          extend: "excelHtml5",
          text: "",
          download: "open",
          className: "btntabletocsv hiddenColumn",
          filename: "Correspondence List" + moment().format(),
          title: "Correspondence",
          orientation: "portrait",
          exportOptions: {
            // columns: function (idx, data, node) {
            //   if (idx == 2) {
            //     return false;
            //   }
            //   return true;
            // },
          },
        },
        {
          extend: "print",
          download: "open",
          className: "btntabletopdf hiddenColumn",
          text: "",
          title: "Correspondence List",
          filename: "Correspondence List" + moment().format(),
          exportOptions: {
            // columns: function (idx, data, node) {
            //   if (idx == 2) {
            //     return false;
            //   }
            //   return true;
            // },
            stripHtml: false,
          },
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
      order: [[1, "desc"]],
      action: function () {
        $("#tblEmailList").DataTable().ajax.reload();
      },
      language: { search: "",searchPlaceholder: "Search List..." },
      fnInitComplete: function () {
        $(
          "<button class='btn btn-primary btnSearchCrm btnSearchLabelsDatatable' type='button' id='btnRefreshLabels' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
        ).insertAfter("#tblEmailList_filter");
      },
    });
  }

  templateObject.makeEmailTableRows = function (data) {
    let taskRows = new Array();
    let td0 = (td1 = td2 = "");

    data.forEach((lists) => {
      lists.opens.forEach(reports => {
        td0 = reports.opens.length ? moment(reports.opens[reports.opens.length - 1].timestamp).format("DD/MM/YYYY HH:mm:ss") : '-';
        td1 = reports.contact_status;
        td2 = reports.opens_count;
        taskRows.push([lists.campaign_name, lists.subject, reports.email_address, td0, td1, td2]);
      });
    });
    return taskRows;
  };
})

Template.mailchimpList.events({
  "click .btnRefresh": function (e) {
    const templateObject = Template.instance();
    templateObject.getCampaignOpenReports();
    // Meteor._reload.reload();
  },

  "click .printConfirm": function (event) {
    playPrintAudio();
    setTimeout(function(){
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblEmailList_wrapper .dt-buttons .btntabletopdf").click();

    $(".fullScreenSpin").css("display", "none");
  }, delayTimeAfterSound);
  },

  "click #exportbtn": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblEmailList_wrapper .dt-buttons .btntabletocsv").click();

    $(".fullScreenSpin").css("display", "none");
  },

})
