import { EmployeePayrollService } from '../js/employeepayroll-service';

Template.assignLeaveTypePop.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.custdatatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.leaveTypesList = new ReactiveVar([]);

    templateObject.selectedFile = new ReactiveVar();
});

Template.assignLeaveTypePop.onRendered(function () {
    const templateObject = Template.instance();
    templateObject.currentDrpDownID = new ReactiveVar();


    templateObject.getTLeaveTypes = async() => {
        try { 
            let data = [];
            let dataObject = await getVS1Data('TAssignLeaveType')
            data = JSON.parse(dataObject[0].data);  
            if (data.tassignleavetype.length > 0) { 
                let useData = data.tassignleavetype;
                templateObject.leaveTypesList.set(useData);
            }
        } catch (err) {  
        } 
    } 

    templateObject.getTLeaveTypes();
});

Template.assignLeaveTypePop.events({
    'click #tblAssignLeaveTypes > tbody > tr': async function(event) {
        $(".colALTypeID").html();
        $(".leave-type-name").html(); 
        
         
    },

});


Template.assignLeaveTypePop.onCreated(function () {
    const templateObject = Template.instance();
    setTimeout(function () {
        $("#dtStartingDate,#dtDOB,#dtTermninationDate,#dtAsOf,#edtLeaveStartDate,#edtLeaveEndDate,#edtPeriodPaymentDate,#paymentDate").datepicker({
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
        $('#edtLeavePayPeriod').editableSelect('add','Weekly');
        $('#edtLeavePayPeriod').editableSelect('add','Fortnightly');
        $('#edtLeavePayPeriod').editableSelect('add','Twice Monthly');
        $('#edtLeavePayPeriod').editableSelect('add','Four Weekly');
        $('#edtLeavePayPeriod').editableSelect('add','Monthly');
        $('#edtLeavePayPeriod').editableSelect('add','Quarterly');
        $('#edtLeavePayStatus').editableSelect('add','Awaiting');
        $('#edtLeavePayStatus').editableSelect('add','Approved');
        $('#edtLeavePayStatus').editableSelect('add','Denied');
        $('#edtLeavePayStatus').editableSelect('add','Deleted');

        $('#period').editableSelect('add','Weekly');
        $('#period').editableSelect('add','Fortnightly');
        $('#period').editableSelect('add','Twice Monthly');
        $('#period').editableSelect('add','Four Weekly');
        $('#period').editableSelect('add','Monthly');
        $('#period').editableSelect('add','Quarterly');
        
        $('#edtTfnExemption').editableSelect('add', function(item){
            $(this).val(item.id);
            $(this).text(item.name);
        });
        $('#edtTfnExemption').editableSelect().on('blur.editable-select', async function (e, li) {
            $("#edtTaxFileNumber").val("");
        });
        $('#edtEmploymentBasis').editableSelect('add', function(item){
            $(this).val(item.id);
            $(this).text(item.name);
        });
        $('#edtResidencyStatus').editableSelect('add', function(item){
            $(this).val(item.id);
            $(this).text(item.name);
        });
        $('#leaveCalcMethodSelect').editableSelect('add', function(item){
            $(this).val(item.id);
            $(this).text(item.name);
        });
        $('#onTerminationUnusedBalance').editableSelect('add', function(item){
            $(this).val(item.id);
            $(this).text(item.name);
        });
        $('#onTerminationUnusedBalance').editableSelect().on('blur.editable-select', async function (e, li) {
            let onTerminationUnusedBalance = $('#onTerminationUnusedBalance').val();
            if( onTerminationUnusedBalance == '1' || onTerminationUnusedBalance == 'Paid Out'){
                $('.eftLeaveTypeCont').removeClass('hideelement')
                $("#eftLeaveType").attr('checked', false)
            }else{
                $('.eftLeaveTypeCont').addClass('hideelement')
                $('.superannuationGuaranteeCont').addClass('hideelement')
            }
        });
        $('#superannuationTypeSelect').editableSelect('add', function(item){
            $(this).val(item.id);
            $(this).text(item.name);
        });
        $('#paymentFrequency').editableSelect('add', function(item){
            $(this).val(item.id);
            $(this).text(item.name);
        });
        $('#leaveCalcMethodSelect').editableSelect();
        $('#leaveCalcMethodSelect').editableSelect().on('blur.editable-select', async function (e, li) {
            let leaveCalcMethod = e.target.value || '';
            switch(leaveCalcMethod){
                case 'Manually Recorded Rate':
                    $('#hoursLeave').val('');
                    $('.handleLeaveTypeOption').addClass('hideelement')
                    $('.manuallyRecordedRate').removeClass('hideelement')
                break;
                case 'No Calculation Required':
                    $('.handleLeaveTypeOption').addClass('hideelement')
                break;
                case 'Based on Ordinary Earnings':
                    $('#hoursAccruedAnnuallyFullTimeEmp').val('');
                    $('#hoursFullTimeEmpFortnightlyPay').val('');
                    $('.handleLeaveTypeOption').addClass('hideelement')
                    $('.basedonOrdinaryEarnings').removeClass('hideelement')
                break;
                default:
                    $('#hoursAccruedAnnually').val('');
                    $('.handleLeaveTypeOption').addClass('hideelement')
                    $('.fixedAmountEachPeriodOption').removeClass('hideelement')
                break;
            }
        });
        $('#edtLeaveTypeofRequest').editableSelect();
        $('#edtLeaveTypeofRequest').editableSelect()
            .on('click.editable-select', async function (e, li) {
                let $search = $(this);
                let dropDownID = $search.attr('id')
                templateObject.currentDrpDownID.set(dropDownID);
                let offset = $search.offset();
                let searchName = e.target.value || '';
                if (e.pageX > offset.left + $search.width() - 8) { // X button 16px wide?
                    $('#assignLeaveTypeSettingsModal').modal('show');
                } else {
                    if (searchName.replace(/\s/g, '') == '') {
                        $('#assignLeaveTypeSettingsModal').modal('show');
                        return false
                    }
                    let dataObject = await getVS1Data('TAssignLeaveType');
                    if ( dataObject.length > 0) {
                        data = JSON.parse(dataObject[0].data);
                        let tAssignteavetype = data.tassignleavetype.filter((item) => {
                            if( item.fields.LeaveType == searchName ){
                                return item;
                            }
                        });

                        if( tAssignteavetype.length > 0 ){

                            let leaveCalcMethod = tAssignteavetype[0].fields.LeaveCalcMethod || '';

                            $('#leaveCalcMethodSelect').val(leaveCalcMethod)
                            switch(leaveCalcMethod){
                                case 'Manually Recorded Rate':
                                    $('#hoursLeave').val('');
                                    $('.handleLeaveTypeOption').addClass('hideelement');
                                    $('.manuallyRecordedRate').removeClass('hideelement');
                                    $('#hoursLeave').val(tAssignteavetype[0].fields.HoursLeave);
                                break;
                                case 'No Calculation Required':
                                    $('.handleLeaveTypeOption').addClass('hideelement')
                                break;
                                case 'Based on Ordinary Earnings':
                                    $('#hoursAccruedAnnuallyFullTimeEmp').val('');
                                    $('#hoursFullTimeEmpFortnightlyPay').val('');
                                    $('.handleLeaveTypeOption').addClass('hideelement');
                                    $('.basedonOrdinaryEarnings').removeClass('hideelement');
                                    $('#hoursAccruedAnnuallyFullTimeEmp').val(tAssignteavetype[0].fields.HoursAccruedAnnuallyFullTimeEmp);
                                    $('#hoursFullTimeEmpFortnightlyPay').val(tAssignteavetype[0].fields.HoursFullTimeEmpFortnightlyPay);
                                break;
                                default:
                                    $('#hoursAccruedAnnually').val('');
                                    $('.handleLeaveTypeOption').addClass('hideelement');
                                    $('.fixedAmountEachPeriodOption').removeClass('hideelement');
                                    $('#hoursAccruedAnnually').val(tAssignteavetype[0].fields.HoursAccruedAnnually);
                                break;
                            }

                            $('#leaveTypeSelect').val(tAssignteavetype[0].fields.LeaveType || '');
                            $('#leaveCalcMethodSelect').val(tAssignteavetype[0].fields.LeaveCalcMethod);
                            
                            $('#openingBalance').val(tAssignteavetype[0].fields.OpeningBalance);
                            $('#onTerminationUnusedBalance').prop("checked", tAssignteavetype[0].fields.OnTerminationUnusedBalance);
                            $("#eftLeaveType").prop('checked', tAssignteavetype[0].fields.EFTLeaveType)
                            $("#superannuationGuarantee").prop('checked', tAssignteavetype[0].fields.SuperannuationGuarantee)

                            $('#assignteavetypeID').val(tAssignteavetype[0].fields.ID) || 0 ;
                        }
                        $('#assignLeaveTypeModal').modal('show');
                    }
                }
            });
    }, 1000);

    $(document).on("click", "#tblAssignLeaveTypes tbody tr .colALType", function (e) {
        var table = $(this);
        let name = table.parent().find(".colALTypeLeave").text()||'';
        let ID = table.parent().find(".colALTypeID").text()||'';
        let Hours = table.parent().find(".colALTypeOpeningBalance").text()||'';
        let searchFilterID = templateObject.currentDrpDownID.get()
        $('#' + searchFilterID).val(name);
        $('#' + searchFilterID + 'ID').val(ID);
        $('#edtLeaveHours').val(Hours);
        
        $('#assignLeaveTypeSettingsModal').modal('toggle');
    });

});

Template.assignLeaveTypePop.helpers({
    terminationBalance: (t) => {
        return t ?  'Paid Out': 'Not Paid Out';
    },
    leaveTypesList: () => { 
        return Template.instance().leaveTypesList.get();
    },

    
})
