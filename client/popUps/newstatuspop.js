import { SalesBoardService } from '../js/sales-service';
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
Template.newstatuspop.onCreated(() => {});
Template.newstatuspop.onRendered(() => {});
Template.newstatuspop.helpers({});
Template.newstatuspop.events({
    'click .btnSaveStatus': function() {
        playSaveAudio();
        let clientService = new SalesBoardService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display', 'inline-block');
        
        let statusName = $('#newStatus').val();
        let statusId = $('#statusId').val();
        let statusDesc = $('#description').val();
        let statusEQPM = $('#quantity').val();
        statusEQPM = Number(statusEQPM.replace(/[^0-9.-]+/g, "")) || 1.0
        statusEQPM = statusEQPM.toString();
        let leadData = '';
        if (statusId == "") {
            leadData = {
                type: 'TLeadStatusType',
                fields: {
                    TypeName: statusName,
                    Description: statusDesc,
                    EQPM: statusEQPM,
                    Active: true
                }
            };
        } else {
            leadData = {
                type: 'TLeadStatusType',
                fields: {
                    ID: parseInt(statusId),
                    TypeName: statusName,
                    Description: statusDesc,
                    EQPM: statusEQPM,
                    Active: true
                }
            };
        }

        if (statusName != "") {
            clientService.saveLeadStatus(leadData).then(function(objDetails) {
                sideBarService.getAllLeadStatus().then(function(dataUpdate) {
                    $('#sltStatus').val(statusName);
                    $('#newStatusPopModal').modal('toggle');
                    $('.fullScreenSpin').css('display', 'none');
                    addVS1Data('TLeadStatusType', JSON.stringify(dataUpdate)).then(function(datareturn) {
                        $('.fullScreenSpin').css('display', 'none');
                    }).catch(function(err) {});
                }).catch(function(err) {
                    $('#newStatusPopModal').modal('toggle');
                    $('.fullScreenSpin').css('display', 'none');
                });
            }).catch(function(err) {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {if(err === checkResponseError){window.open('/', '_self');}}
                    else if (result.dismiss === 'cancel') {}
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Please Enter Status',
                text: "Status field cannot be empty",
                type: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {}
                else if (result.dismiss === 'cancel') {}
            });
        }
    }, delayTimeAfterSound);
    },
    'keydown #quantity': function (event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) != -1 ||
            (event.keyCode == 65 && (event.ctrlKey == true || event.metaKey == true)) ||
            (event.keyCode >= 35 && event.keyCode <= 40)) {
            return;
        }
        if (event.shiftKey == true) {
            event.preventDefault();
        }
        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
            (event.keyCode >= 96 && event.keyCode <= 105) ||
            event.keyCode == 8 || event.keyCode == 9 ||
            event.keyCode == 37 || event.keyCode == 39 ||
            event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 189 || event.keyCode == 109) {

        }
        else {
            event.preventDefault();
        }
    },
});
