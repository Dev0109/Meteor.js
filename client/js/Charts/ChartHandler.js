import DashboardApi from "../Api/DashboardApi";
import Tvs1chart from "../Api/Model/Tvs1Chart";
import Tvs1ChartDashboardPreference from "../Api/Model/Tvs1ChartDashboardPreference";
import Tvs1ChartDashboardPreferenceField from "../Api/Model/Tvs1ChartDashboardPreferenceField";
import ApiService from "../Api/Module/ApiService";
const employeeId = Session.get("mySessionEmployeeLoggedID");
export default class ChartHandler {
  constructor() {}

  static buildPositions() {
    const charts = $(".chart-visibility");

    for (let i = 0; i <= charts.length; i++) {
      $(charts[i]).attr("position", i);
    }
  }

  static calculateWidth( chart ){
      let elementWidth = $(chart).width();
      let elementParentWidth = $('.connectedChartSortable').width();
      let widthPercentage = Math.round(100 * elementWidth / elementParentWidth) + 2;
      if( parseInt( widthPercentage ) < 20 ){
        widthPercentage = 20
      }
      if( parseInt( widthPercentage ) > 100 ){
        widthPercentage = 100
      }
      return widthPercentage;
  }

  static calculateHeight( chart ){
      let elementHeight = $(chart).height();
      let elementParentHeight = document.documentElement.clientHeight;
      let heightPercentage = Math.round(100 * elementHeight / elementParentHeight);
      if( parseInt( heightPercentage ) < 20 ){
        heightPercentage = 20
      }
      if( parseInt( heightPercentage ) > 100 ){
        heightPercentage = 100
      }
      return heightPercentage;
  }

  static buildCardPositions(charts = $(".card-visibility")) {
    for (let i = 0; i <= charts.length; i++) {
      $(charts[i]).attr("position", i);
    }
  }

  static async saveCharts(charts = $(".chart-visibility")) {
       /**
     * Lets load all API colections
     */
    const dashboardApis = new DashboardApi(); // Load all dashboard APIS
    ChartHandler.buildPositions();


    /**
     * @property {Tvs1ChartDashboardPreference[]}
     */
    let chartList = [];

    // now we have to make the post request to save the data in database
    const apiEndpoint = dashboardApis.collection.findByName(
      dashboardApis.collectionNames.Tvs1dashboardpreferences
    );

    Array.prototype.forEach.call(charts, (chart) => {
      if(localStorage.getItem($(chart).attr("chart-slug"))){
        let storeObj = JSON.parse(localStorage.getItem($(chart).attr("chart-slug")))
        localStorage.setItem($(chart).attr("chart-slug"), JSON.stringify({
          position: $(chart).attr("position"),
          width: storeObj.width ? storeObj.width : 0,
          height: storeObj.height ? storeObj.height : 0
        }));
      }else{
        localStorage.setItem($(chart).attr("chart-slug"), JSON.stringify({
          position: $(chart).attr("position"),
          width: 0,
          height: 0
        }));
      }

      chartList.push(
        new Tvs1ChartDashboardPreference({
          type: "Tvs1dashboardpreferences",
          fields: new Tvs1ChartDashboardPreferenceField({
            Active:
              $(chart).find(".on-editor-change-mode").attr("is-hidden") == true ||
              $(chart).find(".on-editor-change-mode").attr("is-hidden") == "true"
                ? false
                : true,
            ChartID: parseInt($(chart).attr("chart-id")),
            ID: parseInt($(chart).attr("pref-id")), // This is empty when it is the first time, but the next times it is filled
            EmployeeID: Session.get("mySessionEmployeeLoggedID"),
            Chartname: $(chart).attr("chart-name"),
            Position: parseInt($(chart).attr("position")),
            ChartGroup: $(chart).attr("chart-group"),
            TabGroup: parseInt($(chart).parents(".charts").attr("data-tabgroup")),
            ChartWidth: ChartHandler.calculateWidth(chart),
            ChartHeight: ChartHandler.calculateHeight(chart),
          }),
        })
      );
    });

    // for (const _chart of chartList) {
    let chartJSON = {
        type: "Tvs1dashboardpreferences",
        objects:chartList
    };

    const ApiResponse = await apiEndpoint.fetch(null, {
      method: "POST",
      headers: ApiService.getPostHeaders(),
      body: JSON.stringify(chartJSON),
    });

    if (ApiResponse.ok == true) {
      const jsonResponse = await ApiResponse.json();
    }
      //});
    // }
  }

  static async saveChart(chart) {
    /**
     * Lets load all API colections
     */
    const dashboardApis = new DashboardApi(); // Load all dashboard APIS

    // now we have to make the post request to save the data in database
    const apiEndpoint = dashboardApis.collection.findByName(
      dashboardApis.collectionNames.Tvs1dashboardpreferences
    );

    let pref = new Tvs1ChartDashboardPreference({
      type: "Tvs1dashboardpreferences",
      fields: new Tvs1ChartDashboardPreferenceField({
        Active:
          $(chart).find(".on-editor-change-mode").attr("is-hidden") == true ||
          $(chart).find(".on-editor-change-mode").attr("is-hidden") == "true"
            ? false
            : true,
        ChartID: $(chart).attr("chart-id"),
        ID: $(chart).attr("pref-id"), // This is empty when it is the first time, but the next times it is filled
        EmployeeID: Session.get("mySessionEmployeeLoggedID"),
        Chartname: $(chart).attr("chart-name"),
        Position: parseInt($(chart).attr("position")),
        ChartGroup: $(chart).attr("chart-group"),
        TabGroup: $(chart).parents(".charts").attr("data-tabgroup"),
        ChartWidth: ChartHandler.calculateWidth(chart),
        ChartHeight: ChartHandler.calculateHeight(chart),
      }),
    });
    const ApiResponse = await apiEndpoint.fetch(null, {
      method: "POST",
      headers: ApiService.getPostHeaders(),
      body: JSON.stringify(pref),
    });
    await ChartHandler.saveChartsInLocalDB();
  }

  static async saveChartsInLocalDB() {
    // Load all the dashboard API
    const dashboardApis = new DashboardApi();

    const dashboardPreferencesEndpoint = dashboardApis.collection.findByName(
      dashboardApis.collectionNames.Tvs1dashboardpreferences
    );

    dashboardPreferencesEndpoint.url.searchParams.append(
      "ListType",
      "'Detail'"
    );

    dashboardPreferencesEndpoint.url.searchParams.append(
      "select",
      `[employeeID]=${employeeId}`
    );

    const dashboardPreferencesEndpointResponse = await dashboardPreferencesEndpoint.fetch(); // here i should get from database all charts to be displayed
    let dashboardPreferencesEndpointJsonResponse = {};
    if (dashboardPreferencesEndpointResponse.ok == true) {
      dashboardPreferencesEndpointJsonResponse = await dashboardPreferencesEndpointResponse.json();
    }

    await addVS1Data('Tvs1dashboardpreferences', JSON.stringify(dashboardPreferencesEndpointJsonResponse))
    return true
  }

  static async getLocalChartPreferences( _tabGroup ) {
    let tvs1ChartDashboardPreference = [];
    let Tvs1dashboardpreferences = await getVS1Data('Tvs1dashboardpreferences')

    if( Tvs1dashboardpreferences.length ){
      let Tvs1ChartData = await JSON.parse(Tvs1dashboardpreferences[0].data)
      if( Tvs1ChartData ){
        tvs1ChartDashboardPreference = Tvs1ChartDashboardPreference.fromList(
          Tvs1ChartData.tvs1dashboardpreferences
        ).filter((chart) => {
          if (chart.fields.TabGroup == _tabGroup) {
            return chart;
          }
        });
      }
    }
    return tvs1ChartDashboardPreference;
  }

  static async getTvs1charts(){
    let Tvs1ChartData = [];
    let Tvs1dashboardpreferences = await getVS1Data('Tvs1charts')
    if( Tvs1dashboardpreferences.length ){
      let allChartsJsonResponse = await JSON.parse(Tvs1dashboardpreferences[0].data);
      // allChartsJsonResponse.tvs1charts.push({
      //   type: "Tvs1charts",
      //   fields: {
      //     Active: true,
      //     ChartGroup: "DashboardExe",
      //     ChartName: "Cash",
      //     GlobalRef: "DEF20",
      //     ID: 20,
      //     ISEmpty: false,
      //     KeyStringFieldName: "Chartname",
      //     KeyValue: "",
      //     MsTimeStamp: "2022-10-01 15:19:59",
      //     MsUpdateSiteCode: "DEF",
      //     Recno: 20,
      //     _chartSlug: "dashboardexe___cash"
      //   }
      // });
      // allChartsJsonResponse.tvs1charts.push({
      //   type: "Tvs1charts",
      //   fields: {
      //     Active: true,
      //     ChartGroup: "DashboardExe",
      //     ChartName: "Profitability",
      //     GlobalRef: "DEF21",
      //     ID: 21,
      //     ISEmpty: false,
      //     KeyStringFieldName: "Chartname",
      //     KeyValue: "",
      //     MsTimeStamp: "2022-10-01 15:19:59",
      //     MsUpdateSiteCode: "DEF",
      //     Recno: 21,
      //     _chartSlug: "dashboardexe___profitability"
      //   }
      // });
      // allChartsJsonResponse.tvs1charts.push({
      //   type: "Tvs1charts",
      //   fields: {
      //     Active: true,
      //     ChartGroup: "DashboardExe",
      //     ChartName: "Performance",
      //     GlobalRef: "DEF22",
      //     ID: 22,
      //     ISEmpty: false,
      //     KeyStringFieldName: "Chartname",
      //     KeyValue: "",
      //     MsTimeStamp: "2022-10-01 15:19:59",
      //     MsUpdateSiteCode: "DEF",
      //     Recno: 22,
      //     _chartSlug: "dashboardexe___performance"
      //   }
      // });
      // allChartsJsonResponse.tvs1charts.push({
      //   type: "Tvs1charts",
      //   fields: {
      //     Active: true,
      //     ChartGroup: "DashboardExe",
      //     ChartName: "Balance Sheet",
      //     GlobalRef: "DEF23",
      //     ID: 23,
      //     ISEmpty: false,
      //     KeyStringFieldName: "Chartname",
      //     KeyValue: "",
      //     MsTimeStamp: "2022-10-01 15:19:59",
      //     MsUpdateSiteCode: "DEF",
      //     Recno: 23,
      //     _chartSlug: "dashboardexe___balance_sheet"
      //   }
      // });
      // allChartsJsonResponse.tvs1charts.push({
      //   type: "Tvs1charts",
      //   fields: {
      //     Active: true,
      //     ChartGroup: "DashboardExe",
      //     ChartName: "Income",
      //     GlobalRef: "DEF24",
      //     ID: 24,
      //     ISEmpty: false,
      //     KeyStringFieldName: "Chartname",
      //     KeyValue: "",
      //     MsTimeStamp: "2022-10-01 15:19:59",
      //     MsUpdateSiteCode: "DEF",
      //     Recno: 24,
      //     _chartSlug: "dashboardexe___income"
      //   }
      // });
      // allChartsJsonResponse.tvs1charts.push({
      //   type: "Tvs1charts",
      //   fields: {
      //     Active: true,
      //     ChartGroup: "DashboardExe",
      //     ChartName: "Position",
      //     GlobalRef: "DEF25",
      //     ID: 25,
      //     ISEmpty: false,
      //     KeyStringFieldName: "Chartname",
      //     KeyValue: "",
      //     MsTimeStamp: "2022-10-01 15:19:59",
      //     MsUpdateSiteCode: "DEF",
      //     Recno: 25,
      //     _chartSlug: "dashboardexe___position"
      //   }
      // });
      Tvs1ChartData = Tvs1chart.fromList(allChartsJsonResponse.tvs1charts);
    }
    return Tvs1ChartData;
  }

  static async getTvs1Execharts() {
    let Tvs1ExeChartData = [];
    Tvs1ExeChartData.push(new Tvs1chart({
      type: "Tvs1charts",
      fields: {
        Active: true,
        ChartGroup: "DashboardExe",
        ChartName: "Cash",
        GlobalRef: "DEF20",
        ID: 20,
        ISEmpty: false,
        KeyStringFieldName: "Chartname",
        KeyValue: "",
        MsTimeStamp: "2022-10-01 15:19:59",
        MsUpdateSiteCode: "DEF",
        Recno: 20,
        _chartSlug: "dashboardexe__cash"
      }
    }));
    Tvs1ExeChartData.push(new Tvs1chart({
      type: "Tvs1charts",
      fields: {
        Active: true,
        ChartGroup: "DashboardExe",
        ChartName: "Profitability",
        GlobalRef: "DEF21",
        ID: 21,
        ISEmpty: false,
        KeyStringFieldName: "Chartname",
        KeyValue: "",
        MsTimeStamp: "2022-10-01 15:19:59",
        MsUpdateSiteCode: "DEF",
        Recno: 21,
        _chartSlug: "dashboardexe__profitability"
      }
    }));
    Tvs1ExeChartData.push(new Tvs1chart({
      type: "Tvs1charts",
      fields: {
        Active: true,
        ChartGroup: "DashboardExe",
        ChartName: "Performance",
        GlobalRef: "DEF22",
        ID: 22,
        ISEmpty: false,
        KeyStringFieldName: "Chartname",
        KeyValue: "",
        MsTimeStamp: "2022-10-01 15:19:59",
        MsUpdateSiteCode: "DEF",
        Recno: 22,
        _chartSlug: "dashboardexe__performance"
      }
    }));
    Tvs1ExeChartData.push(new Tvs1chart({
      type: "Tvs1charts",
      fields: {
        Active: true,
        ChartGroup: "DashboardExe",
        ChartName: "Balance Sheet",
        GlobalRef: "DEF23",
        ID: 23,
        ISEmpty: false,
        KeyStringFieldName: "Chartname",
        KeyValue: "",
        MsTimeStamp: "2022-10-01 15:19:59",
        MsUpdateSiteCode: "DEF",
        Recno: 23,
        _chartSlug: "dashboardexe__balance_sheet"
      }
    }));
    Tvs1ExeChartData.push(new Tvs1chart({
      type: "Tvs1charts",
      fields: {
        Active: true,
        ChartGroup: "DashboardExe",
        ChartName: "Income",
        GlobalRef: "DEF24",
        ID: 24,
        ISEmpty: false,
        KeyStringFieldName: "Chartname",
        KeyValue: "",
        MsTimeStamp: "2022-10-01 15:19:59",
        MsUpdateSiteCode: "DEF",
        Recno: 24,
        _chartSlug: "dashboardexe__income"
      }
    }));
    Tvs1ExeChartData.push(new Tvs1chart({
      type: "Tvs1charts",
      fields: {
        Active: true,
        ChartGroup: "DashboardExe",
        ChartName: "Position",
        GlobalRef: "DEF25",
        ID: 25,
        ISEmpty: false,
        KeyStringFieldName: "Chartname",
        KeyValue: "",
        MsTimeStamp: "2022-10-01 15:19:59",
        MsUpdateSiteCode: "DEF",
        Recno: 25,
        _chartSlug: "dashboardexe__position"
      }
    }));
    return Tvs1ExeChartData;
  }
}
