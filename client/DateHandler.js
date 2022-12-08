import moment from "moment";

export default class Datehandler {
  static defaultFormat = "DD/MM/YYYY";

  static domDateFromUpdate(date, format = "DD/MM/YYYY", templateObject = null) {
    $("#dateFrom").val(moment(date).format(format));
    $("#dateFrom").trigger("change");
    if (templateObject != null) {
      templateObject.dateAsAt.set(moment(date).format("DD/MM/YYYY"));
    }
  }

  static domDateToUpdate(date, format = "DD/MM/YYYY") {
    $("#dateTo").val(moment(date).format(format));
    // $("#dateTo").trigger("change");
  }

  static initOneMonth() {
    const currentDate = new Date();

    /**
         * This will init dates
         */
    let begunDate = moment(currentDate).format("DD/MM/YYYY");

    let fromDateMonth = currentDate.getMonth() + 1;
    let fromDateDay = currentDate.getDate();
    if (currentDate.getMonth() + 1 < 10) {
      fromDateMonth = "0" + (
      currentDate.getMonth() + 1);
    }

    let prevMonth = moment().subtract(1, "months").format("MM");

    if (currentDate.getDate() < 10) {
      fromDateDay = "0" + currentDate.getDate();
    }
    // let getDateFrom = currentDate2.getFullYear() + "-" + (currentDate2.getMonth()) + "-" + ;
    var fromDate = fromDateDay + "/" + prevMonth + "/" + currentDate.getFullYear();

    $("#date-input,#dateTo,#dateFrom").datepicker({
      showOn: "button",
      buttonText: "Show Date",
      buttonImageOnly: true,
      buttonImage: "/img/imgCal2.png",
      dateFormat: "dd/mm/yy",
      showOtherMonths: true,
      selectOtherMonths: true,
      changeMonth: true,
      changeYear: true,
      yearRange: "-90:+10",
      onChangeMonthYear: function (year, month, inst) {
        // Set date to picker
        $(this).datepicker("setDate", new Date(year, inst.selectedMonth, inst.selectedDay));
        // Hide (close) the picker
        // $(this).datepicker('hide');
        //  Change ttrigger the on change function
        // $(this).trigger('change');
      }
    });

    $("#dateFrom").val(fromDate);
    $("#dateTo").val(begunDate);

    // $("#dateTo").trigger("change");
  }

  static todayDate( format = "DD/MM/YYYY", templateObject = null ){
    let dateFrom = moment().format("YYYY-MM-DD");
    let dateTo = moment().format("YYYY-MM-DD");

    this.domDateFromUpdate(dateFrom, format, templateObject);
    this.domDateToUpdate(dateTo, format);
  }

  static currentWeek( format = "DD/MM/YYYY", templateObject = null ){
    let dateFrom = moment().startOf('week').format("YYYY-MM-DD");
    let dateTo = moment().endOf('week').format("YYYY-MM-DD");

    this.domDateFromUpdate(dateFrom, format, templateObject);
    this.domDateToUpdate(dateTo, format);
  }

  static lastMonth(format = "DD/MM/YYYY", templateObject = null) {
    let dateFrom = moment().subtract(1, "months").startOf("month").format("YYYY-MM-DD");
    let dateTo = moment().subtract(1, "months").endOf("month").format("YYYY-MM-DD");

    this.domDateFromUpdate(dateFrom, format, templateObject);
    this.domDateToUpdate(dateTo, format);
  }

  static lastQuarter(format = "DD/MM/YYYY", templateObject = null) {
    let dateFrom = moment().subtract(1, "Q").startOf("Q").format("YYYY-MM-DD");
    let dateTo = moment().subtract(1, "Q").endOf("Q").format("YYYY-MM-DD");

    this.domDateFromUpdate(dateFrom, format, templateObject);
    this.domDateToUpdate(dateTo, format);
  }

  static last12Months(format = "DD/MM/YYYY", templateObject = null) {
    const dateTo = moment(new Date()).format("YYYY-MM-DD");
    const dateFrom = moment(dateTo).subtract(1, "year");

    this.domDateFromUpdate(dateFrom, format, templateObject);
    this.domDateToUpdate(dateTo, format);
  }

  static finYearToDate(format = "DD/MM/YYYY", templateObject = null) {
    const dateFrom = moment().month("january").startOf("month").format("YYYY-MM-DD");
    const dateTo = moment().format("YYYY-MM-DD");

    this.domDateFromUpdate(dateFrom, format, templateObject);
    this.domDateToUpdate(dateTo, format);
  }

  static previousWeek(format = "DD/MM/YYYY", templateObject = null){
    const dateFrom =  moment().subtract(1, "week").startOf('week').format("YYYY-MM-DD");
    const dateTo = moment().subtract(1, "week").endOf('week').format("YYYY-MM-DD");

    this.domDateFromUpdate(dateFrom, format, templateObject);
    this.domDateToUpdate(dateTo, format);
  }

  static previousMonth( format = "DD/MM/YYYY", templateObject = null ){
    const dateFrom =  moment().subtract(1, "month").startOf('month').format("YYYY-MM-DD");
    const dateTo = moment().subtract(1, "month").endOf('month').format("YYYY-MM-DD");

    this.domDateFromUpdate(dateFrom, format, templateObject);
    this.domDateToUpdate(dateTo, format);
  }

  
  static previousQuarter( format = "DD/MM/YYYY", templateObject = null ){
    const dateFrom =  moment().subtract(1, "Q").startOf("Q").format("YYYY-MM-DD");
    const dateTo = moment().subtract(1, "Q").endOf("Q").format("YYYY-MM-DD");

    this.domDateFromUpdate(dateFrom, format, templateObject);
    this.domDateToUpdate(dateTo, format);
  }

  static quaterToDate(format = "DD/MM/YYYY", templateObject = null) {
    const dateFrom = moment().startOf("Q").format("YYYY-MM-DD");
    const dateTo = moment().format("YYYY-MM-DD");

    this.domDateFromUpdate(dateFrom, format, templateObject);
    this.domDateToUpdate(dateTo, format);
  }

  static monthToDate(format = "DD/MM/YYYY", templateObject = null) {
    const dateFrom = moment().startOf("M").format("YYYY-MM-DD");
    const dateTo = moment().format("YYYY-MM-DD");

    this.domDateFromUpdate(dateFrom, format, templateObject);
    this.domDateToUpdate(dateTo, format);
  }

  static lastFinYear(format = "DD/MM/YYYY", templateObject = null) {
    let dateFrom = null;
    let dateTo = null;
    if (moment().quarter() == 4) {
      dateFrom = moment().subtract(1, "year").month("July").startOf("month").format("YYYY-MM-DD");
      dateTo = moment().month("June").endOf("month").format("YYYY-MM-DD");
    } else {
      dateFrom = moment().subtract(2, "year").month("July").startOf("month").format("YYYY-MM-DD");
      dateTo = moment().subtract(1, "year").month("June").endOf("month").format("YYYY-MM-DD");
    }

    this.domDateFromUpdate(dateFrom, format, templateObject);
    this.domDateToUpdate(dateTo, format);
  }

  static thisFinYear(format = "DD/MM/YYYY", templateObject = null) {
    let dateFrom = null;
    let dateTo = null;
    if (moment().quarter() == 4) {
      dateFrom = moment().month("July").startOf("month").format("YYYY-MM-DD");
      dateTo = moment().add(1, "year").month("June").endOf("month").format("YYYY-MM-DD");
    } else {
      dateFrom = moment().subtract(1, "year").month("July").startOf("month").format("YYYY-MM-DD");
      dateTo = moment().month("June").endOf("month").format("YYYY-MM-DD");
    }

    this.domDateFromUpdate(dateFrom, format, templateObject);
    this.domDateToUpdate(dateTo, format);
  }

  static thisMonth(format = "DD/MM/YYYY", templateObject = null) {
    let dateFrom = moment().startOf("month").format("YYYY-MM-DD");
    let dateTo = moment().endOf("month").format("YYYY-MM-DD");

    this.domDateFromUpdate(dateFrom, format, templateObject);
    this.domDateToUpdate(dateTo, format);
  }

  static thisQuarter(format = "DD/MM/YYYY", templateObject = null) {
    let dateFrom = moment().startOf("Q").format("YYYY-MM-DD");
    let dateTo = moment().endOf("Q").format("YYYY-MM-DD");

    this.domDateFromUpdate(dateFrom, format, templateObject);
    this.domDateToUpdate(dateTo, format);
  }

  /**
     * Use this to avoid copy pasting a lot of codes
     *
     */
  static getDateRangeEvents() {
    return {
      "click #today": (e, templateObject) => {
        Datehandler.todayDate(Datehandler.defaultFormat, templateObject);
      },
      "click #thisweek": (e, templateObject) => {
        Datehandler.currentWeek(Datehandler.defaultFormat, templateObject);
      },      
      "click #last12Months": (e, templateObject) => {
        Datehandler.last12Months(Datehandler.defaultFormat, templateObject);
      },
      "click #thisMonth": (e, templateObject) => {
        Datehandler.thisMonth(Datehandler.defaultFormat, templateObject);
      },
      "click #thisQuarter": (e, templateObject) => {
        Datehandler.thisQuarter(Datehandler.defaultFormat, templateObject);
      },
      "click #thisfinancialyear": (e, templateObject) => {
        Datehandler.thisFinYear(Datehandler.defaultFormat, templateObject);
      },
      "click #previousweek": (e, templateObject) => {
        Datehandler.previousWeek(Datehandler.defaultFormat, templateObject);
      },
      "click #previousmonth": (e, templateObject) => {
        Datehandler.previousMonth(Datehandler.defaultFormat, templateObject);
      },   
      "click #previousquarter": (e, templateObject) => {
        Datehandler.previousQuarter(Datehandler.defaultFormat, templateObject);
      },
      "click #previousfinancialyear": (e, templateObject) => {        
        Datehandler.lastFinYear(Datehandler.defaultFormat, templateObject);
      },
      "click #lastMonth": (e, templateObject) => {
        Datehandler.lastMonth(Datehandler.defaultFormat, templateObject);
      },
      "click #lastQuarter": (e, templateObject) => {
        Datehandler.lastQuarter(Datehandler.defaultFormat, templateObject);
      },
      "click #lastFinYear": (e, templateObject) => {
        Datehandler.lastFinYear(Datehandler.defaultFormat, templateObject);
      },
      "click #monthToDate": (e, templateObject) => {
        Datehandler.monthToDate(Datehandler.defaultFormat, templateObject);
      },
      "click #quarterToDate": (e, templateObject) => {
        Datehandler.quaterToDate(Datehandler.defaultFormat, templateObject);
      },
      "click #finYearToDate": (e, templateObject) => {
        Datehandler.finYearToDate(Datehandler.defaultFormat, templateObject);
      }
    };
  }

  static defaultDatePicker(selector = ".formClassDate") {
    $(selector).datepicker({
      showOn: "button",
      buttonText: "Show Date",
      buttonImageOnly: true,
      buttonImage: "/img/imgCal2.png",
      dateFormat: "dd/mm/yy",
      showOtherMonths: true,
      selectOtherMonths: true,
      changeMonth: true,
      changeYear: true,
      yearRange: "-90:+10",
      onChangeMonthYear: function (year, month, inst) {
        // Set date to picker
        $(this).datepicker("setDate", new Date(year, inst.selectedMonth, inst.selectedDay));
        // Hide (close) the picker
        // $(this).datepicker('hide');
        //  Change ttrigger the on change function
        // $(this).trigger('change');
      }
    });
  }
}
