import { CRMService } from '../../crm-service';
let crmService = new CRMService();

Template.taskDetailModal.onCreated(function() {});

Template.taskDetailModal.onRendered(function() {
    $("#taskmodalDuedate").datepicker({
        showOn: 'button',
        buttonText: 'Show Date',
        buttonImageOnly: true,
        buttonImage: '/img/imgCal2.png',
        constrainInput: false,
        dateFormat: 'd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
    });

    $(".crmSelectLeadList").editableSelect();
    $(".crmSelectLeadList").editableSelect().on("click.editable-select", function(e, li) {
        $("#customerListCrmModal").modal();
    });
    $(".crmSelectEmployeeList").editableSelect();
    $(".crmSelectEmployeeList").editableSelect().on("click.editable-select", function(e, li) {
        $("#employeeListCRMModal").modal();
    });
    $(".taskDetailModalCategoryLabel").editableSelect();
    $(".taskDetailModalCategoryLabel").editableSelect().on("click.editable-select", function(e, li) {
        $("#projectListModal").modal();
    });

    $(document).on("click", "#customerListCrmModal #tblContactlist tbody tr", function(e) {
        var table = $(this);
        let colClientName = table.find(".colClientName").text();
        let colID = table.find(".colID").text();
        let colType = table.find(".colType").text();

        let colPhone = table.find(".colPhone").text();
        let colEmail = table.find(".colEmail").text();

        //if (colType != 'Prospect' && colType != 'Customer') {
        colType = colType == 'Customer / Supplier' ? 'Supplier' : colType;
        colType = colType == 'Customer / Prospect / Supplier' ? 'Supplier' : colType;
        $('#customerListCrmModal').modal('toggle');

        // for add modal
        $('#add_contact_name').val(colClientName);
        // for edit modal
        $('#crmEditSelectLeadList').val(colClientName);

        $('#contactID').val(colID)
        $('#contactType').val(colType)

        $('#contactEmailClient').val(colEmail);
        $('#contactPhoneClient').val(colPhone);
        //} else {
        //  swal("Please select valid type of contact", "", "error");
        //  return false;
        //}

    });
    $(document).on("click", "#employeeListCRMModal #tblEmployeelist tbody tr", function(e) {
        var table = $(this);
        let colEmployeeName = table.find(".colEmployeeName").text();
        let colID = table.find(".colID").text();

        let colPhone = table.find(".colPhone").text();
        let colEmail = table.find(".colEmail").text();

        $('#employeeListCRMModal').modal('toggle');

        // for add modal
        $('#add_assigned_name').val(colEmployeeName);
        // for edit modal
        $('#crmEditSelectEmployeeList').val(colEmployeeName);

        $('#assignedID').val(colID)

        $('#contactEmailUser').val(colEmail);
        $('#contactPhoneUser').val(colPhone);
    });
    $(document).on("click", "#tblProjectsDatatablePop tbody tr", function(e) {
        var table = $(this);
        let colProjectName = table.find(".colProjectName").text();
        let colID = parseInt(table.attr("data-id"));

        $('#projectListModal').modal('toggle');

        $("#addProjectID").val(colID);
        $("#taskDetailModalCategoryLabel").val(colProjectName);
    });
});

Template.taskDetailModal.events({

});

Template.taskDetailModal.helpers({});