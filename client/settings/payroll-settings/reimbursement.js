import '../../lib/global/indexdbstorage.js';
import {SideBarService} from '../../js/sidebar-service';
import { UtilityService } from "../../utility-service";
import EmployeePayrollApi from '../../js/Api/EmployeePayrollApi'
import ApiService from "../../js/Api/Module/ApiService";
import { EmployeePayrollService } from '../../js/employeepayroll-service';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let employeePayrollService = new EmployeePayrollService();

Template.reimbursementSettings.onCreated(function() {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.datatableReimbursementrecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.countryData = new ReactiveVar();
  templateObject.Ratetypes = new ReactiveVar([]);
  templateObject.imageFileData=new ReactiveVar();
  templateObject.currentDrpDownID = new ReactiveVar();
  // templateObject.Accounts = new ReactiveVar([]);   
});

Template.reimbursementSettings.onRendered(function() {

  const templateObject = Template.instance();
  var splashArrayReisument = new Array();
  
  function MakeNegative() {
    $('td').each(function() {
        if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
    });
  };

    templateObject.saveDataLocalDB = async function(){
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TReimbursement
        );

        employeePayrolEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );                
        
        const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed

        if (employeePayrolEndpointResponse.ok == true) {
            employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
            if( employeePayrolEndpointJsonResponse.treimbursement.length ){
                await addVS1Data('TReimbursement', JSON.stringify(employeePayrolEndpointJsonResponse))
            }
            return employeePayrolEndpointJsonResponse
        }  
        return '';
    };

  templateObject.getReimbursement = async function(){
    try {
        let data = {};
        let splashArrayReisument = new Array();
        let dataObject = await getVS1Data('TReimbursement')  
        if ( dataObject.length == 0) {
            data = await templateObject.saveDataLocalDB();
        }else{
            data = JSON.parse(dataObject[0].data);
        }
        for (let i = 0; i < data.treimbursement.length; i++) {                
            var dataListReimbursement = [
                data.treimbursement[i].fields.ID || '',
                data.treimbursement[i].fields.ReimbursementName || 0,
                data.treimbursement[i].fields.ReimbursementAccount || 0,
            ];

            splashArrayReisument.push(dataListReimbursement);
        }

        function MakeNegative() {
            $('td').each(function () {
                if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
            });
        };

        setTimeout(function () {
            MakeNegative();
        }, 100);
        templateObject.datatablerecords.set(splashArrayReisument);
        $('.fullScreenSpin').css('display', 'none');
        setTimeout(function () {
            $('#tblReimbursements').DataTable({  
                data: splashArrayReisument,
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                columnDefs: [
                    {
                        className: "colReimbursementID hiddenColumn",
                        "targets": [0]
                    },
                    {
                        className: "colReimbursementName",
                        "targets": [1]
                    },  
                    {
                        className: "colReimbursementAccount",
                        "targets": [2]
                    }
                ],
                select: true,
                destroy: true,
                colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                info: true,
                responsive: true,
                "order": [[0, "asc"]],
                action: function () {
                    $('#tblReimbursements').DataTable().ajax.reload();
                },
                "fnDrawCallback": function (oSettings) {
                    $('.paginate_button.page-item').removeClass('disabled');
                    $('#tblReimbursements_ellipsis').addClass('disabled');
                    if (oSettings._iDisplayLength == -1) {
                        if (oSettings.fnRecordsDisplay() > 150) {

                        }
                    } else {

                    }
                    if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                        $('.paginate_button.page-item.next').addClass('disabled');
                    }

                    $('.paginate_button.next:not(.disabled)', this.api().table().container())
                        .on('click', function () {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            var splashArrayReisumentDupp = new Array();
                            let dataLenght = oSettings._iDisplayLength;
                            let customerSearch = $('#tblReimbursements_filter input').val();

                            sideBarService.getReimbursement(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (data) {

                                for (let i = 0; i < data.treimbursement.length; i++) {                
                                    var dataListReimbursement = [
                                        data.treimbursement[i].fields.ID || '',
                                        data.treimbursement[i].fields.ReimbursementName || 0,
                                        data.treimbursement[i].fields.ReimbursementAccount || 0,
                                    ];

                                    splashArrayReisument.push(dataListReimbursement);
                                }

                                let uniqueChars = [...new Set(splashArrayReisument)];
                                var datatable = $('#tblReimbursements').DataTable();
                                datatable.clear();
                                datatable.rows.add(uniqueChars);
                                datatable.draw(false);
                                setTimeout(function () {
                                    $("#tblReimbursements").dataTable().fnPageChange('last');
                                }, 400);

                                $('.fullScreenSpin').css('display', 'none');


                            }).catch(function (err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });

                        });
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                },
                "fnInitComplete": function () {
                    $("<button class='btn btn-primary newReimbursementModal' data-dismiss='modal' data-toggle='modal' data-target='#newReimbursementModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblReimbursements_filter");
                    $("<button class='btn btn-primary btnRefreshReimbursement type='button' id='btnRefreshReimbursement' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblReimbursements_filter");
                }

            }).on('page', function () {
                setTimeout(function () {
                    MakeNegative();
                }, 100);

            }).on('column-reorder', function () {

            }).on('length.dt', function (e, settings, len) {
                //$('.fullScreenSpin').css('display', 'inline-block');
                let dataLenght = settings._iDisplayLength;
                splashArrayReisument = [];
                if (dataLenght == -1) {
                $('.fullScreenSpin').css('display', 'none');

                } else {
                    if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                        $('.fullScreenSpin').css('display', 'none');
                    } else {
                        sideBarService.getReimbursement(dataLenght, 0).then(function (dataNonBo) {

                            addVS1Data('TReimbursement', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                // templateObject.resetData(dataNonBo);
                                $('.fullScreenSpin').css('display', 'none');
                            }).catch(function (err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        }).catch(function (err) {
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    }
                }
                setTimeout(function () {
                    MakeNegative();
                }, 100);
            });
        }, 1000);
    } catch (error) {
        $('.fullScreenSpin').css('display', 'none');
    } 
};

templateObject.getReimbursement();

$('.reimbursementDropDown').editableSelect();
$('.reimbursementDropDown').editableSelect()
    .on('click.editable-select', async function (e, li) {
        let $search = $(this);
        let dropDownID = $search.attr('id')
        $('#edtReimbursementDropDownID').val(dropDownID);
        templateObject.currentDrpDownID.set(dropDownID);
        let offset = $search.offset();
        let searchName = e.target.value || '';
        if (e.pageX > offset.left + $search.width() - 8) { // X button 16px wide?
            $('#reimbursementSettingsModal').modal('show');
        } else {
            if (searchName.replace(/\s/g, '') == '') {               
                $('#reimbursementSettingsModal').modal('show');
                return false
            }
            let dataObject = await getVS1Data('TReimbursement');   
            if ( dataObject.length == 0) {
                data = await templateObject.saveDataLocalDB();
            }else{
                data = JSON.parse(dataObject[0].data);
            }
            if( data.treimbursement.length > 0 ){
                let tReimbursement = data.treimbursement.filter((item) => {
                    if( item.fields.ReimbursementName == searchName ){
                        return item;
                    }
                });

                $('#reimbursementRateForm')[0].reset();
                $('#newReimbursementLabel').text('Edit Reiumbursement');
                $('#reimbursementSettingsModal').modal('hide');
                
                if( tReimbursement.length > 0 ){
                    $('#res_id').val(tReimbursement[0].fields.ID) || 0 ;
                    $('#edtReimbursementName').val(tReimbursement[0].fields.ReimbursementName) || '';
                    $('#edtReimbursementAccount').val(tReimbursement[0].fields.ReimbursementAccount) || '';
                }
                $('#reimbursementSettingsModal').modal('hide');
                $('#newReimbursementModal').modal('show');
            }
        }
    });

    //On Click Reimbursement List
    $(document).on("click", "#tblReimbursements tbody tr", function (e) {
        var table = $(this);
        let name = table.find(".colReimbursementName").text()||'';
        let ID = table.find(".colReimbursementID").text()||'';
        let account = table.find(".colReimbursementAccount").text()||'';
        let searchFilterID = templateObject.currentDrpDownID.get()
        $('#' + searchFilterID).val(name);
        $('#' + searchFilterID + 'ID').val(ID);
        if( searchFilterID == 'reimbursementTypeSelect'){
            $('#controlExpenseAccount').val(account)
        }
        $('#reimbursementSettingsModal').modal('toggle');
    });

});
Template.reimbursementSettings.events({
    'keyup #tblReimbursements_filter input': function (event) {
        if($(event.target).val() != ''){
          $(".btnRefreshReimbursement").addClass('btnSearchAlert');
        }else{
          $(".btnRefreshReimbursement").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
           $(".btnRefreshReimbursement").trigger("click");
        }
    },
    'click .btnAddordinaryTimeReimbursement':function(event){
        $('#reimbursementRateForm')[0].reset();
        $('#newReimbursementLabel').text('Add New Reiumbursement Fund');
        $('#newReimbursementModal').modal('hide');
    },
    'click .btnRefreshReimbursement':function(event){      
        let templateObject = Template.instance();
        var splashArrayReisument = new Array();
        const lineExtaSellItems = [];
        $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblReimbursements_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            employeePayrollService.getReimbursementByName(dataSearchName).then(function (data) {
                $(".btnRefreshReimbursement").removeClass('btnSearchAlert');
                let lineItems = [];
                if (data.treimbursement.length > 0) {
                    for (let i = 0; i < data.treimbursement.length; i++) {                
                        var dataListReimbursement = [
                            data.treimbursement[i].fields.ID || '',
                            data.treimbursement[i].fields.ReimbursementName || 0,
                            data.treimbursement[i].fields.ReimbursementAccount || 0,
                        ];

                        splashArrayReisument.push(dataListReimbursement);
                    }
                    let uniqueChars = [...new Set(splashArrayReisument)];
                    var datatable = $('#tblReimbursements').DataTable();
                    datatable.clear();
                    datatable.rows.add(uniqueChars);
                    datatable.draw(false);
                    setTimeout(function () {
                        $("#tblReimbursements").dataTable().fnPageChange('last');
                    }, 400);

                    $('.fullScreenSpin').css('display', 'none');
    
                } else {
                    $('.fullScreenSpin').css('display', 'none');
    
                    swal({
                        title: 'Question',
                        text: "Reimbursement Rate does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            $('#reimbursementRateForm')[0].reset();
                            $('#edtReimbursementName').val(dataSearchName)
                            $('#reimbursementSettingsModal').modal('hide');
                            $('#newReimbursementModal').modal('show');
                        }
                    });
                }
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
    
          $(".btnRefresh").trigger("click");
        }

    },
    'click .newreiumbursement': async function (event) {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const apiEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TReimbursement
        );

        let oldres_id = $('#res_id').val() || 0 ;
        let reimbursementname = $('#edtReimbursementName').val() || '';
        let account = $('#edtReimbursementAccount').val() || '';

        if(reimbursementname == ''){
            handleValidationError('Please select Reimbursement Name!', 'edtReimbursementName');
            return false;
        }

        if(account == ''){
            swal({
                title: "Warning",
                text: "Please select Account",
                type: 'warning',
            })
            return false;
        }
        /**
         * Saving Earning Object in localDB
        */
        
        let reimbursementRateSettings = {
            type: "TReimbursement",
            fields: {
                ID: parseInt(oldres_id),
                ReimbursementName:reimbursementname,
                ReimbursementAccount:account,
                ReimbursementActive:true,
            }
        };

        try {
            const ApiResponse = await apiEndpoint.fetch(null, {
                method: "POST",
                headers: ApiService.getPostHeaders(),
                body: JSON.stringify(reimbursementRateSettings),
            });
    
        
            if (ApiResponse.ok == true) {
                const jsonResponse = await ApiResponse.json();
                $('#reimbursementRateForm')[0].reset();
                await templateObject.saveDataLocalDB();
                await templateObject.getReimbursement();
                let drpDownID = $('#edtReimbursementDropDownID').val();
                $('#' + drpDownID).val(reimbursementname);
                $('#newReimbursementModal').modal('hide');
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Reimbursement added successfully',
                    text: '',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        if (result.value) { }
                    } 
                });
            }else{
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: ApiResponse.headers.get('errormessage'),
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {}
                });  
            }
        } catch (error) {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Oooops...',
                text: error,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {}
            });
        }        
    },
});

Template.reimbursementSettings.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get();
    }
});

