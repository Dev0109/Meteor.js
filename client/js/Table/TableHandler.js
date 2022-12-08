import {SideBarService} from "../../js/sidebar-service";
export default class TableHandler {
  constructor() {
    this.bindEvents();
  }

  async bindEvents() {
    // $(".dataTable").on("DOMSubtreeModified",  () => {
    //   this.refreshDatatableResizable();
    // });
    this.refreshDatatableResizable();

    $(".dataTable thead tr th").on("mousedown", () => {
      this.refreshDatatableResizable();
    });

    $(".dataTable thead tr th").on("mouseover", () => {
      this.refreshDatatableResizable();
    });

    $(".dataTable tbody tr td").on("mouseup", () => {
      this.refreshDatatableResizable();
    });
  }

  /**
     * this will refresh events related to resizing features
     */
  async refreshDatatableResizable() {
    await this.disableDatatableResizable();
    this.enableDatatableResizable();
  }

  /***
     * Then we need to add back the listeners
     *
     * By doing disabling and re-enabling, start fresh events
     * instead of cummulating multiple listeners which is causing issues
     */
  async enableDatatableResizable() {
    $(".dataTable").colResizable({
      liveDrag: true,
      gripInnerHtml: "<div class='grip JCLRgrips'></div>",
      draggingClass: "dragging",
      resizeMode: "overflow",
      onResize: e => {
        var table = $(e.currentTarget); //reference to the resized table
        let tableName = table.attr("id");
        if ((tableName != "tblBasReturnList") && (tableName != "tblInvoiceLine")) {
          this.saveTableColumns(tableName);
        }
        let tableWidth = [];
        // $("#tblcontactoverview th").each(function () {
        //   tableWidth.push($(this).outerWidth());
        //   tableWidth.push($(this).index());
        // });
      }
      // disabledColumns: [2]
    });
  }

  /**
     * We first need to disable all previous events listeners related
     */
  disableDatatableResizable() {
    $(".dataTable").colResizable({disable: true});
  }

  async saveTableColumns(tableName) {
    let lineItems = [];
    //$(".fullScreenSpin").css("display", "inline-block");
    $(`#${tableName} thead tr th`).each(function (index) {
      var $tblrow = $(this);
      var fieldID = $tblrow.attr("data-col-index") || 0;
      var colTitle = $tblrow.text().replace(/^\s+|\s+$/g, "") || "";
      var colWidth = $tblrow.width() || 0;
      var colthClass = $tblrow.attr("data-class") || "";
      var colHidden = false;
      if ($tblrow.attr("data-col-active") == "true") {
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
    // lineItems.sort((a,b) => a.index - b.index);
    try {
      let erpGet = erpDb();
      let employeeId = parseInt(Session.get("mySessionEmployeeLoggedID")) || 0;
      let sideBarService = new SideBarService();
      let added = await sideBarService.saveNewCustomFields(erpGet, tableName, employeeId, lineItems);
      //$(".fullScreenSpin").css("display", "none");
      if (added) {
        sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get("mySessionEmployeeLoggedID")), "").then(function (dataCustomize) {
          addVS1Data("VS1_Customize", JSON.stringify(dataCustomize));
        }).catch(function (err) {});
        // swal({title: "SUCCESS", text: "Display settings is updated!", type: "success", showCancelButton: false, confirmButtonText: "OK"}).then(result => {
        //   if (result.value) {
        //     //$(".fullScreenSpin").css("display", "none");
        //   }
        // });
      } else {
        // swal("Something went wrong!", "", "error");
      }
    } catch (error) {
      $(".fullScreenSpin").css("display", "none");
      swal("Something went wrong!", "", "error");
    }
  }
  static getDefaultTableConfiguration(selector = null, options = {
    pageLength: 25,
    initialReportDatatableLoad,
    showPlusButton: true,
    showSearchButton: true,
    info: true,
    responsive: true,
    select: true,
    destroy: true,
    colReorder: true,
  }) {
    return {
      sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
      pageLength: options.pageLength || 25,
      paging: true,
      colReorder: {
        fixedColumnsLeft: 1
      },
      // lengthChange: false,
      // lengthMenu: [
      //   [
      //     initialReportDatatableLoad, -1
      //   ],
      //   [
      //     initialReportDatatableLoad, "All"
      //   ]
      // ],
      info: options.info || true,
      responsive: options.responsive || true,
      select: options.select || true,
      destroy: options.destroy || true,
      colReorder: options.colReorder || true,
      language: {search: "",searchPlaceholder: "Search List..."},
      fnInitComplete: function () {
        if (options.showSearchButton)
          $(`<button class='btn btn-primary refresh-${selector}' type='button' id='refresh-${selector}' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>`).insertAfter(`#${selector}_filter`);
        if (options.showPlusButton)
          $(`<button class='btn btn-primary add-${selector}' data-dismiss='modal' data-toggle='modal' data-target='#add-${selector}_modal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>`).insertAfter(`#${selector}_filter`);
        }
      };
  }
}
