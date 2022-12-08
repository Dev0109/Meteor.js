import moment from "moment";
Template.daterangefromto_trans.inheritsHooksFrom('daterangedropdownoption');
Template.daterangefromto_trans.inheritsHelpersFrom('daterangedropdownoption');
Template.daterangefromto_trans.inheritsEventsFrom('daterangedropdownoption');
Template.daterangefromto_trans.inheritsHooksFrom('daterangedropdownoption');
Template.daterangefromto_trans.onCreated(function(){
});

Template.daterangefromto_trans.onRendered(function() {
  var today = moment().format("DD/MM/YYYY");
  var currentDate = new Date();
  var begunDate = moment(currentDate).format("DD/MM/YYYY");
  let fromDateMonth = currentDate.getMonth() + 1;
  let fromDateDay = currentDate.getDate();
  if (currentDate.getMonth() + 1 < 10) {
    fromDateMonth = "0" + (currentDate.getMonth() + 1);
  }

  let prevMonth = moment().subtract(1, 'months').format('MM')
  if (currentDate.getDate() < 10) {
    fromDateDay = "0" + currentDate.getDate();
  }
  var fromDate = fromDateDay + "/" + prevMonth + "/" + currentDate.getFullYear();
  $(".dateTo,.dateFrom").datepicker({
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
      $(this).datepicker("setDate",
        new Date(year, inst.selectedMonth, inst.selectedDay)
      );
    },
  });

  $(".dateFrom").val(fromDate);
  $(".dateTo").val(begunDate);
});

Template.daterangefromto_trans.events({

});

Template.daterangefromto_trans.helpers({
});
