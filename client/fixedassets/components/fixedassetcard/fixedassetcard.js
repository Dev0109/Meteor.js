import { SideBarService } from '../../../js/sidebar-service'
let sideBarService = new SideBarService();

Template.fixedassetcard.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);
});

Template.fixedassetcard.onRendered(function () {
  $('#edtAssetType').editableSelect();
  $('#edtAssetType').editableSelect().on('click.editable-select', function (e, li) {
    $('#selectLineID').val('sltJobTerms');
    const $each = $(this);
    const offset = $each.offset();
    const assetTypeName = e.target.value || '';
    editableAssetType(e, $each, offset, assetTypeName);
  });

  $('#edtBoughtFrom').editableSelect();
  $('#edtDepartment').editableSelect();
  $('#edtDepreciationType').editableSelect();
  $('#edtCostAssetAccount').editableSelect();
  $('#editBankAccount').editableSelect();
  $('#edtDepreciationAssetAccount').editableSelect();
  $('#edtDepreciationExpenseAccount').editableSelect();
  $('#edtSalvageValueType').editableSelect();

  $("#date-input,#edtDateofPurchase, #edtDateRegisterRenewal, #edtDateRenewal, #edtDescriptionStartDate, #edtNextTimeDate, #edtLastTimeDate").datepicker({
    showOn: 'button',
    buttonText: 'Show Date',
    buttonImageOnly: true,
    buttonImage: '/img/imgCal2.png',
    dateFormat: 'dd/mm/yy',
    showOtherMonths: true,
    selectOtherMonths: true,
    changeMonth: true,
    changeYear: true,
    yearRange: "-90:+10",
  });

  function editableAssetType(e, $each, offset, assetTypeName) {
    $('#fixedAssetTypeListModal').modal('toggle');
  }
});
