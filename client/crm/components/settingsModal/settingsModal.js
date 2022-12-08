Template.settingsModal.events({

  "click .feeOnTopInput": function (event) {
    if ($(event.target).is(":checked")) {
      $(".feeInPriceInput").attr("checked", false);
    }
  },
  "click .feeInPriceInput": function (event) {
    if ($(event.target).is(":checked")) {
      $(".feeOnTopInput").attr("checked", false);
    }
  },
  "click .btnTaxRateSettings": function (event) {
    $(".modal-backdrop").css("display", "none");
    FlowRouter.go("/taxratesettings");
  },
  "click .btnTermsSettings": function (event) {
    $(".modal-backdrop").css("display", "none");
    FlowRouter.go("/termsettings");
  },
  "click .btnCurrencySettings": function (event) {
    $(".modal-backdrop").css("display", "none");
    FlowRouter.go("/currenciessettings");
  },
})