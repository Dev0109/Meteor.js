import { SalesBoardService } from './sales-service';
import {PurchaseBoardService} from './purchase-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { UtilityService } from "../utility-service";
import { ProductService } from "../product/product-service";
import { OrganisationService } from '../js/organisation-service';
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import { Random } from 'meteor/random';
import { jsPDF } from 'jspdf';
import 'jQuery.print/jQuery.print.js';
import 'jquery-editable-select';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import {ContactService} from "../contacts/contact-service";
import { TaxRateService } from "../settings/settings-service";
import {ManufacturingService} from "../manufacture/manufacturing-service";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let manufacturingService = new ManufacturingService()


Template.new_process.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.processrecord = new ReactiveVar([]);
    templateObject.selectedAccount = new ReactiveVar('cogs');
});

Template.new_process.onRendered(() => {
    const templateObject = Template.instance();
    // $('#edtCOGS').select();
    // $('#edtCOGS').editableSelect();
    // $('#edtExpenseAccount').editableSelect();
    // $('#edtOverheadCOGS').editableSelect();
    // $('#edtOverheadExpenseAccount').editableSelect();
    // $('#edtWastage').editableSelect();
    var currentID = FlowRouter.current().queryParams.id;
    templateObject.getProcessDetail  = function() {
        $('.fullScreenSpin').css('display', 'inline-block')
        // getVS1Data('TProcessStep').then()
        let objDetail = {}

        if(FlowRouter.current().queryParams.id) {
            let id=FlowRouter.current().queryParams.id
            getVS1Data('TProcessStep').then(function(dataObject){
                if(dataObject.length == 0) {
                    manufacturingService.getOneProcessDataByID(id).then(function(data){
                        objDetail = data.fields
                        templateObject.processrecord.set(objDetail); 
                        $('.fullScreenSpin').css('display', 'none');
                    })
                }else {
                    let data = JSON.parse(dataObject[0].data)
                    let useData = data.tprocessstep;
                    for(let i = 0; i< useData.length; i++) {
                        if(useData[i].fields.ID == id) {
                           objDetail = useData[i].fields;
                           $('.fullScreenSpin').css('display', 'none');
                        }
                    }
                    templateObject.processrecord.set(objDetail); 
                }
            }).catch(function(error) {
                manufacturingService.getOneProcessDataByID(id).then(function(data){
                    objDetail = data.fields;
                    templateObject.processrecord.set(objDetail); 
                    $('.fullScreenSpin').css('display', 'none');
                }).catch(function(err) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal("Something went wrong!", "", "error");
                })
            })
        } else {
             objDetail = {
                        KeyValue: '',
                        DailyHours: '',
                        Description: '',
                        HourlyLabourCost: '',
                        COGS: '',
                        ExpenseAccount: '',
                        OHourlyCost: '',
                        OCOGS: '',
                        OExpense: '',
                        TotalHourlyCost: '',
                        Wastage: ''
                    }

                    templateObject.processrecord.set(objDetail); 
                    $('.fullScreenSpin').css('display', 'none')
        }
    }

    templateObject.getProcessDetail();

   
    setTimeout(()=>{
        $('#edtCOGS').editableSelect();
        $('#edtExpenseAccount').editableSelect();
        $('#edtOverheadCOGS').editableSelect();
        $('#edtOverheadExpenseAccount').editableSelect();
        $('#edtWastage').editableSelect();
    }, 500)
            // templateObject.selectedInventoryAssetAccount.set('Inventory Asset Wastage')
  
});



Template.new_process.helpers({
   processrecord: ()=>{
    return Template.instance().processrecord.get();
   }
});

Template.new_process.events({
    'click #btnSaveProcess': function(event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentID = FlowRouter.current().queryParams.id;
        // let tempArray = localStorage.getItem('TProcesses');
        // let processes = tempArray?JSON.parse(tempArray):[];
        let processName = $('#edtProcessName').val() || '';
        let processDescription = $('#edtDescription').val()|| '';
        let dailyHours = $('#edtDailyHours').val()|| '';
        let hourlyCost = $('#edtHourlyCost').val()|| '';
        let cogs = $('#edtCOGS').val() || '';
        let expenseAccount = $('#edtExpenseAccount').val() || '';
        let overheadHourlyCost = $('#edtHourlyOverheadCost').val() || '';
        let overheadCOGS = $('#edtOverheadCOGS').val() || '';
        let overheadExpenseAcc = $('#edtOverheadExpenseAccount').val() || '';
        let totalHourCost = $('#edtTotalHourlyCosts').val() || '';
        let wastage = $('#edtWastage').val() || '';

        if(processName == '') {
            swal('Please provide the process name !', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            e.preventDefault();
            return false;
        }

        if(dailyHours == '') {
            swal('Please input daily hours !', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            e.preventDefault();
            return false;
        }


        if(hourlyCost == '') {
            swal('Please input hourly cost', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            e.preventDefault();
            return false;
        }

        if(cogs == '') {
            swal('Please provide Cost of goods sold', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            e.preventDefault();
            return false;
        }

        if(expenseAccount == '') {
            swal('Please provide expense account', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            e.preventDefault();
            return false;
        }

        if(overheadHourlyCost != '' && overheadCOGS == '') {
            swal('Please provide cost of goods sold', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            e.preventDefault();
            return false;
        }

        if(overheadHourlyCost != '' && overheadExpenseAcc == '') {
            swal('Please provide cost of expense account', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            e.preventDefault();
            return false;
        }
      
        let objDetail = {
            type: 'TProcessStep',
            fields: {
                KeyValue: processName,
                Description: processDescription,
                DailyHours:  dailyHours,
                HourlyLabourCost: parseInt(hourlyCost.replace(Currency, '')),
                COGS: cogs,
                ExpenseAccount: expenseAccount,
                OHourlyCost: parseInt(overheadHourlyCost.replace(Currency, '')),
                OCogs: overheadCOGS,
                OExpense: overheadExpenseAcc,
                TotalHourlyCost: parseInt(totalHourCost.replace(Currency, '')),
                Wastage: wastage
            }
        }
        if(currentID) {
            objDetail.fields.ID = currentID
        }


        manufacturingService.saveProcessData(objDetail).then(function(){
            manufacturingService.getAllProcessData(initialBaseDataLoad, 0).then(function(datareturn) {
                addVS1Data('TProcessStep', JSON.stringify(datareturn)).then(function(){
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Success',
                        text: 'Process has been saved successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Continue',
                    }).then ((result)=>{
                        FlowRouter.go('/processlist')
                    })
                }).catch(function(err){
                    swal('Ooops, Something went wrong', '', 'warning');
                    $('.fullScreenSpin').css('display', 'none');
                })
            })
        }).catch(function(err) {
            swal("Something went wrong!", "", "error");
            $('.fullScreenSpin').css('display', 'none');
        })

        // processes.push(objDetail);
        // localStorage.setItem('TProcesses', JSON.stringify(processes))
        // $('.fullScreenSpin').css('display', 'none');
        
    },

    'click #btnCancel': function(event) {
        FlowRouter.go('/processlist')
    },

    'click #edtCOGS': function (event) {
        $('#edtCOGS').select();
        $('#edtCOGS').editableSelect()
    },

    'click #edtExpenseAccount': function(event) {
        $('#edtExpenseAccount').select();
        $('#edtExpenseAccount').editableSelect()
    },

    'click #edtOverheadCOGS': function(event) {
        $('#edtOverheadCOGS').select();
        $('#edtOverheadCOGS').editableSelect();
    },

    'click #edtOverheadExpenseAccount': function (event) {
        $('#edtOverheadExpenseAccount').select();
        $('#edtOverheadExpenseAccount').editableSelect();
    },

    'click #edtWastage': function(event) {
        $('#edtWastage').select();
        $('#edtWastage').editableSelect();
    },


    'click #edtCOGS': function(e) {
        let templateObject = Template.instance();
        $('#accountListModal').modal();
        templateObject.selectedAccount.set('cogs');
    },
    'click #edtExpenseAccount': function (e) {
        let templateObject = Template.instance();
        $('#expenseAccountListModal').modal();
        templateObject.selectedAccount.set('expenseAccount');
    },
    'click #edtOverheadCOGS': function(e) {
        let templateObject = Template.instance();
        $('#accountListModal').modal();
        templateObject.selectedAccount.set('overheadCOGS');
    },
    'click #edtOverheadExpenseAccount': function (e) {
        let templateObject = Template.instance();
        $('#expenseAccountListModal').modal();
        templateObject.selectedAccount.set('overheadExpenseAccount');
    },

    'click #edtWastage': function(e){
        $('#assetAccountListModal').modal();
    },
    
    'click #accountListModal table tbody tr': function(e) {
        let templateObject = Template.instance();
        let columnDataValue = $(e.target).closest('tr').find('.productName').text();
        switch(templateObject.selectedAccount.get()) {
            case 'cogs':
                $('#edtCOGS').val(columnDataValue);
                break;
           
            case 'overheadCOGS':
                $('#edtOverheadCOGS').val(columnDataValue);
                break;
           
            default:
                break;
        }
        $('#accountListModal').modal('toggle');
    },
    'click #expenseAccountListModal table tr': function(e){
        let templateObject = Template.instance();
        let columnDataValue = $(e.target).closest('tr').find('.productName').text();
        switch(templateObject.selectedAccount.get()) {
            case 'expenseAccount':
                $('#edtExpenseAccount').val(columnDataValue);
                break;
            case 'overheadExpenseAccount':
                $('#edtOverheadExpenseAccount').val(columnDataValue);
                break;
            default:
                break;
        }
        $('#expenseAccountListModal').modal('toggle');
    }, 

    'click #assetAccountListModal table tr': function(e) {
        let columnDataValue = $(e.target).closest('tr').find('.productName').text();
        $('#edtWastage').val(columnDataValue);
        $('#assetAccountListModal').modal('toggle');
    },
    'blur .edtHourlyCost': function(e) {
        if($('#edtHourlyCost').val() != '' &&  $('#edtHourlyOverheadCost').val() == '') {
            $('#edtTotalHourlyCosts').val($('#edtHourlyCost').val())
        } else if ($('#edtHourlyCost').val() == '' &&  $('#edtHourlyOverheadCost').val() != '') {
            $('#edtTotalHourlyCosts').val($('#edtHourlyOverheadCost').val())
        } else if ($('#edtHourlyCost').val() != '' &&  $('#edtHourlyOverheadCost').val() != '') {
            $('#edtTotalHourlyCosts').val(Currency + (parseFloat($('#edtHourlyCost').val().replace('$', '')) + parseFloat($('#edtHourlyOverheadCost').val().replace('$', ''))).toFixed(2))
        }
    },

    'blur #edtHourlyCost': function(e){
        e.preventDefault();
        e.stopPropagation();
        $('#edtHourlyCost').val(Currency +parseFloat( $('#edtHourlyCost').val()).toFixed(2)) 
    },

    'focus #edtHourlyCost': function(e){
        e.preventDefault();
        e.stopPropagation();
        $('#edtHourlyCost').val($('#edtHourlyCost').val().replace('$', ''));
    },

    'blur #edtHourlyOverheadCost': function(e){
        e.preventDefault();
        e.stopPropagation();
        $('#edtHourlyOverheadCost').val(Currency +parseFloat( $('#edtHourlyOverheadCost').val()).toFixed(2)) 
    },

    'focus #edtHourlyOverheadCost': function(e){
        e.preventDefault();
        e.stopPropagation();
        $('#edtHourlyOverheadCost').val($('#edtHourlyOverheadCost').val().replace('$', ''));
    },
    // 'click #edtCOGS': function (e) {
      
    // }
});



