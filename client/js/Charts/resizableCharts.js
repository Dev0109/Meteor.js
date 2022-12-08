import _ from "lodash";
import ChartHandler from "./ChartHandler";
const highCharts = require('highcharts');
require('highcharts/modules/exporting')(highCharts);
require('highcharts/highcharts-more')(highCharts);
export default class resizableCharts {
  static enable(timeOut = 200) {
    setTimeout(() => {
      $(".portlet").resizable({
        disabled: false,
        minHeight: 200,
        minWidth: 250,
        // aspectRatio: 1.5 / 1
        handles: "e,s",
        stop: async (event, ui) => {

          // add custom class to manage spacing


          /**
           * Build the positions of the widgets
           */
          if( $(ui.element[0]).parents(".sortable-chart-widget-js").hasClass("editCharts") == false ){
            ChartHandler.buildPositions();
            await ChartHandler.saveChart(
              $(ui.element[0]).parents(".sortable-chart-widget-js")
            );
          }
        },
        resize: function (event, ui) {
          let chartHeight = ui.size.height;
          let chartWidth = ui.size.width;

          $(ui.element[0])
            .parents(".sortable-chart-widget-js")
            .removeClass("col-md-6 col-md-8 col-md-4"); // when you'll star resizing, it will remove its size
          // if ($(ui.element[0]).parents(".sortable-chart-widget-js").attr("key") != "purchases__expenses_breakdown") {
            $(ui.element[0])
            .parents(".sortable-chart-widget-js")
            .addClass("resizeAfterChart");
            // Restrict width more than 100
            if ( ChartHandler.calculateWidth(ui.element[0]) >= 100) {
                $(this).resizable("option", "maxWidth", ui.size.width);
            }
            // Resctrict height screen size.
            if ( ChartHandler.calculateHeight(ui.element[0]) >= 100) {
                $(this).resizable("option", "maxHeight", ui.size.height);
            }

            // resize all highcharts
            try {
              const allHighCharts = $('.ds-highcharts');
              _.each(allHighCharts, chartElement => {
                const index = $(chartElement).data('highcharts-chart');
                let highChart = highCharts.charts[index];
                if(highChart) {
                  highChart.reflow();
                }
              });
            }catch(e) {

            }

            // will not apply on Expenses breakdown
            $(ui.element[0]).parents(".sortable-chart-widget-js").css("width", chartWidth);
            $(ui.element[0]).parents(".sortable-chart-widget-js").css("height", chartHeight);

            if(localStorage.getItem($(ui.element[0]).parents(".sortable-chart-widget-js").attr('chart-slug'))){
              let storeObj = JSON.parse(localStorage.getItem($(ui.element[0]).parents(".sortable-chart-widget-js").attr('chart-slug')))
              localStorage.setItem($(ui.element[0]).parents(".sortable-chart-widget-js").attr('chart-slug'), JSON.stringify({
                position: storeObj.position,
                width: chartWidth,
                height: chartHeight
              }));
            }else{
              localStorage.setItem($(ui.element[0]).parents(".sortable-chart-widget-js").attr('chart-slug'), JSON.stringify({
                position: $(ui.element[0]).parents(".sortable-chart-widget-js").attr("position"),
                width: chartWidth,
                height: chartHeight
              }));
            }
        },
      });
    }, timeOut);
  }

  static disable() {
    $(".portlet").resizable({
      disabled: true,
      minHeight: 200,
      minWidth: 250,
      // aspectRatio: 1.5 / 1
      handles: "e",
    });
  }
}
