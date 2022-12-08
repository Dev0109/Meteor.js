
Template.mailchimpCampaignList.onRendered(function () {
  const templateObject = Template.instance();

  templateObject.getInitAllCampaignReports = function () {
    $(".fullScreenSpin").css("display", "inline-block");
    try {
      getVS1Data("TCorrespendenceList").then(function (dataObject) {
        if (dataObject.length == 0) {
          templateObject.getAllCampaignReports();
          $(".fullScreenSpin").css("display", "none");
        } else {
          let result = JSON.parse(dataObject[0].data);
          initDatatable(result);
          $(".fullScreenSpin").css("display", "none");
        }
      })
    } catch (error) {
      templateObject.getAllCampaignReports();
      $(".fullScreenSpin").css("display", "none");
    }
  }
  templateObject.getInitAllCampaignReports();

  templateObject.getAllCampaignReports = function() {
    $(".fullScreenSpin").css("display", "inline-block");
    try {
      var erpGet = erpDb();
      Meteor.call('getAllCampaignReports', erpGet, function (error, result) {
        if (error !== undefined) {
          swal("Something went wrong!", "", "error");
        } else {
          addVS1Data("TCorrespendenceList", JSON.stringify(result));
          initDatatable(result);
        }
        $(".fullScreenSpin").css("display", "none");
      });
    } catch (error) {
      swal("Something went wrong!", "", "error");
      $(".fullScreenSpin").css("display", "none");
    }
  }
  // getAllCampaignReports();

  function initDatatable(data) {
    var reportArray = templateObject.makeEmailTableRows(data);
    $("#tblCampaignList").DataTable({
      data: reportArray,
      columnDefs: [],
      sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
      buttons: [
        {
          extend: "excelHtml5",
          text: "",
          download: "open",
          className: "btntabletocsv hiddenColumn",
          filename: "Campaign Report List" + moment().format(),
          title: "Campaign Report",
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
          title: "Campaign Report List",
          filename: "Campaign Report List" + moment().format(),
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
        $("#tblCampaignList").DataTable().ajax.reload();
      },
      language: { search: "",searchPlaceholder: "Search List..." },
      fnInitComplete: function () {
        $(
          "<button class='btn btn-primary btnSearchCrm btnSearchLabelsDatatable' type='button' id='btnRefreshLabels' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
        ).insertAfter("#tblCampaignList_filter");
      },
    });
  }

  templateObject.makeEmailTableRows = function (data) {
    let taskRows = new Array();
    let td0 = (td1 = td2 = "");

    data.forEach((item) => {
      td0 = item.send_time ? moment(item.send_time).format("DD/MM/YYYY HH:mm:ss") : '-';
      td1 = item.opens.unique_opens + " (" + (item.opens.open_rate * 100).toFixed(2) + "%)";
      td2 = item.clicks.unique_clicks + " (" + (item.clicks.click_rate * 100).toFixed(2) + "%)";
      taskRows.push([item.list_name, item.subject_line, item.emails_sent, td0, td1, td2, item.list_id]);
    });
    return taskRows;
  };
})


Template.mailchimpCampaignList.events({
  "click .btnRefresh": function (e) {
    // Meteor._reload.reload();
    const templateObject = Template.instance();
    templateObject.getAllCampaignReports();
  },

  "click .printConfirm": function (event) {
    playPrintAudio();
    setTimeout(function(){
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblCampaignList_wrapper .dt-buttons .btntabletopdf").click();

    $(".fullScreenSpin").css("display", "none");
  }, delayTimeAfterSound);
  },

  "click #exportbtn": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblCampaignList_wrapper .dt-buttons .btntabletocsv").click();

    $(".fullScreenSpin").css("display", "none");
  },

})
