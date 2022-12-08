import '../../lib/global/indexdbstorage.js';
import {SideBarService} from '../../js/sidebar-service';
import { UtilityService } from "../../utility-service";
import EmployeePayrollApi from '../../js/Api/EmployeePayrollApi'
import ApiService from "../../js/Api/Module/ApiService";
import { EmployeePayrollService } from '../../js/employeepayroll-service';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let employeePayrollService = new EmployeePayrollService();

Template.superannuationSettings.onCreated(function() {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.datatableallowancerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.countryData = new ReactiveVar();
  templateObject.Ratetypes = new ReactiveVar([]);
  templateObject.imageFileData=new ReactiveVar();
  templateObject.currentDrpDownID = new ReactiveVar();
  // templateObject.Accounts = new ReactiveVar([]);
});

Template.superannuationSettings.onRendered(function() {
    $('#edtFundType').editableSelect('add', function(item){
        $(this).val(item.id);
        $(this).text(item.name);
    });
  const templateObject = Template.instance();
  var splashArraySuperannuationList = new Array();

  function MakeNegative() {
    $('td').each(function() {
        if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
    });
  };

  templateObject.saveDataLocalDB = async function(){
    const employeePayrolApis = new EmployeePayrollApi();
    // now we have to make the post request to save the data in database
    const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
        employeePayrolApis.collectionNames.TSuperannuation
    );

    employeePayrolEndpoint.url.searchParams.append(
        "ListType",
        "'Detail'"
    );

    const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed

    if (employeePayrolEndpointResponse.ok == true) {
        employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
        if( employeePayrolEndpointJsonResponse.tsuperannuation.length ){
            await addVS1Data('Tsuperannuation', JSON.stringify(employeePayrolEndpointJsonResponse))
        }
        return employeePayrolEndpointJsonResponse
    }
    return '';
};

templateObject.getSuperannuationData = async function(){
    // try {
        let data = {};
        let splashArraySuperannuationList = new Array();
        let dataObject = await getVS1Data('Tsuperannuation')
        if ( dataObject.length == 0) {
            data = await templateObject.saveDataLocalDB();
        }else{
            data = JSON.parse(dataObject[0].data);
        }
        for (let i = 0; i < data.tsuperannuation.length; i++) {

            var dataListAllowance = [
                data.tsuperannuation[i].fields.ID || '',
                data.tsuperannuation[i].fields.Superfund || '',
                data.tsuperannuation[i].fields.Supertypeid || '',
                data.tsuperannuation[i].fields.Employeeid || '',
                data.tsuperannuation[i].fields.ABN || '',
                data.tsuperannuation[i].fields.ElectronicsServiceAddressAlias || '',
                data.tsuperannuation[i].fields.BSB || '',
                data.tsuperannuation[i].fields.Accountno || '',
                data.tsuperannuation[i].fields.AccountName || ''
            ];

            splashArraySuperannuationList.push(dataListAllowance);
        }

          function MakeNegative() {
              $('td').each(function () {
                  if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
              });
          };


          setTimeout(function () {
              MakeNegative();
          }, 100);
        templateObject.datatablerecords.set(splashArraySuperannuationList);
        $('.fullScreenSpin').css('display', 'none');
        setTimeout(function () {
            $('#tblSuperannuation').DataTable({
                data: splashArraySuperannuationList,
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                columnDefs: [
                    {
                      className: "colSuperannuationID hiddenColumn",
                      "targets": [0]
                    },
                    {
                       className: "colSuperannuationName",
                       "targets": [1]
                    },
                    {
                       className: "colSuperannuationType",
                       "targets": [2]
                    },
                    {
                        className: "colEmployerNum",
                        "targets": [3]
                    },
                    {
                        className: "colabn",
                        "targets": [4]
                    },
                    {
                        className: "colservicealias",
                        "targets": [5]
                    },
                    {
                        className: "colbsb",
                        "targets": [6]
                    },
                    {
                        className: "colaccountnumber",
                        "targets": [7]
                    },
                    {
                        className: "colaccountname",
                        "targets": [8]
                    },
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
                    $('#tblSuperannuation').DataTable().ajax.reload();
                },
                "fnDrawCallback": function (oSettings) {
                    $('.paginate_button.page-item').removeClass('disabled');
                    $('#tblSuperannuation_ellipsis').addClass('disabled');
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
                            var splashArraySuperannuationListDupp = new Array();
                            let dataLenght = oSettings._iDisplayLength;
                            let customerSearch = $('#tblSuperannuation_filter input').val();

                            sideBarService.getSuperannuation(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (data) {

                                for (let i = 0; i < data.tsuperannuation.length; i++) {

                                    var dataListAllowance = [
                                        data.tsuperannuation[i].fields.ID || '',
                                        data.tsuperannuation[i].fields.Superfund || '',
                                        data.tsuperannuation[i].fields.Supertypeid || '',
                                        data.tsuperannuation[i].fields.Employeeid || '',
                                        data.tsuperannuation[i].fields.ABN || '',
                                        data.tsuperannuation[i].fields.ElectronicsServiceAddressAlias || '',
                                        data.tsuperannuation[i].fields.BSB || '',
                                        data.tsuperannuation[i].fields.Accountno || '',
                                        data.tsuperannuation[i].fields.AccountName || ''
                                    ];

                                    splashArraySuperannuationList.push(dataListAllowance);
                                }

                                let uniqueChars = [...new Set(splashArraySuperannuationList)];
                                var datatable = $('#tblSuperannuation').DataTable();
                                datatable.clear();
                                datatable.rows.add(uniqueChars);
                                datatable.draw(false);
                                setTimeout(function () {
                                    $("#tblSuperannuation").dataTable().fnPageChange('last');
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
                    $("<button class='btn btn-primary btnAddordinaryTimeSuperannuation' data-dismiss='modal' data-toggle='modal' data-target='#newSuperannuationFundModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblSuperannuation_filter");
                    $("<button class='btn btn-primary btnRefreshSuperannuation type='button' id='btnRefreshSuperannuation' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblSuperannuation_filter");
                }

            }).on('page', function () {
                setTimeout(function () {
                    MakeNegative();
                }, 100);

            }).on('column-reorder', function () {

            }).on('length.dt', function (e, settings, len) {
                //$('.fullScreenSpin').css('display', 'inline-block');
                let dataLenght = settings._iDisplayLength;
                splashArraySuperannuationList = [];
                if (dataLenght == -1) {
                $('.fullScreenSpin').css('display', 'none');

                } else {
                    if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                        $('.fullScreenSpin').css('display', 'none');
                    } else {
                        sideBarService.getSuperannuation(dataLenght, 0).then(function (dataNonBo) {

                            addVS1Data('Tsuperannuation', JSON.stringify(dataNonBo)).then(function (datareturn) {
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
    // } catch (error) {
    //     $('.fullScreenSpin').css('display', 'none');
    // }
};

templateObject.getSuperannuationData();

$('.superannuationDropDown').editableSelect();
$('.superannuationDropDown').editableSelect()
    .on('click.editable-select', async function (e, li) {
        let $search = $(this);
        let dropDownID = $search.attr('id')
        $('#edtSuperAnnuationDropDownID').val(dropDownID);
        templateObject.currentDrpDownID.set(dropDownID);
        let offset = $search.offset();
        let searchName = e.target.value || '';
        if (e.pageX > offset.left + $search.width() - 8) { // X button 16px wide?
            $('#superannuationSettingsModal').modal('show');
        } else {
            if (searchName.replace(/\s/g, '') == '') {
                $('#superannuationSettingsModal').modal('show');
                return false
            }
            let dataObject = await getVS1Data('Tsuperannuation');
            if ( dataObject.length == 0) {
                data = await templateObject.saveDataLocalDB();
            }else{
                data = JSON.parse(dataObject[0].data);
            }
            if( data.tsuperannuation.length > 0 ){
                let tSuperannuation = data.tsuperannuation.filter((item) => {
                    if( item.fields.Superfund == searchName ){
                        return item;
                    }
                });
                $('#superannuationRateForm')[0].reset();
                $('#newSuperannuationFundLabel').text('Edit Superannuation Fund')
                $('#superannuationSettingsModal').modal('hide');  

                if( tSuperannuation.length > 0 ){
                    if( tsuperannuation[0].fields.Supertypeid == 'Self-Managed Superannuation Fund')
                    {
                        $('#acountabmandelectronic').css('display','block');
                        $('#accountbsb').css('display','block');
                        $('#account_name').css('display','block');
                    }else{
                        $('#acountabmandelectronic').css('display','none');
                        $('#accountbsb').css('display','none');
                        $('#account_name').css('display','none');
                    }

                    $('#newSuperannuationFundId').val(tSuperannuation[0].fields.ID);
                    $('#edtFundType').val(tSuperannuation[0].fields.Supertypeid);
                    $('#edtFundName').val(tSuperannuation[0].fields.Superfund);
                    $('#edtelectronicsalias').val(tSuperannuation[0].fields.ElectronicsServiceAddressAlias);
                    $('#edtEmployerNumber').val(tSuperannuation[0].fields.Employeeid);
                    $('#edtaccountnumber').val(tSuperannuation[0].fields.Accountno);
                    $('#edtbsb').val(tSuperannuation[0].fields.BSB);
                    $('#edtaccountname').val(tSuperannuation[0].fields.AccountName);
                }
                $('#superannuationSettingsModal').modal('hide');
                $('#newSuperannuationFundModal').modal('show');
            }
        }
    });

    //On Click Superannuation List
    $(document).on("click", "#tblSuperannuation tbody tr", function (e) {
        var table = $(this);
        let name = table.find(".colSuperannuationName").text()||'';
        let ID = table.find(".colSuperannuationID").text()||'';
        let account = table.find(".colaccountname").text()||'';
        let searchFilterID = templateObject.currentDrpDownID.get()
        $('#' + searchFilterID).val(name);
        $('#' + searchFilterID + 'ID').val(ID);
        if( searchFilterID == 'superannuationFund'){
            $('#expenseSuperannuationAccount').val(account)
        }
        $('#superannuationSettingsModal').modal('toggle');
    });

})

Template.superannuationSettings.events({
    'keyup #tblSuperannuation_filter input': function (event) {
        if($(event.target).val() != ''){
          $(".btnRefreshSuperannuation").addClass('btnSearchAlert');
        }else{
          $(".btnRefreshSuperannuation").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
           $(".btnRefreshSuperannuation").trigger("click");
        }
    },
    'click .btnAddordinaryTimeSuperannuation':function(event){
        $('#superannuationRateForm')[0].reset();
        $('#newSuperannuationFundLabel').text('Add New Superannuation Fund')
        $('#newSuperannuationFundModal').modal('hide');
    },
    'click .btnRefreshSuperannuation':function(event){
        let templateObject = Template.instance();
        var splashArraySuperannuationList = new Array();
        const lineExtaSellItems = [];
        $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblSuperannuation_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            employeePayrollService.getSuperAnnuationByName(dataSearchName).then(function (data) {
                $(".btnRefreshSuperannuation").removeClass('btnSearchAlert');
                let lineItems = [];
                if (data.tsuperannuation.length > 0) {
                    for (let i = 0; i < data.tsuperannuation.length; i++) {
                        var dataListAllowance = [
                            data.tsuperannuation[i].fields.ID || '',
                            data.tsuperannuation[i].fields.Superfund || '',
                            data.tsuperannuation[i].fields.Supertypeid || '',
                            data.tsuperannuation[i].fields.Employeeid || '',
                            data.tsuperannuation[i].fields.ABN || '',
                            data.tsuperannuation[i].fields.ElectronicsServiceAddressAlias || '',
                            data.tsuperannuation[i].fields.BSB || '',
                            data.tsuperannuation[i].fields.Accountno || '',
                            data.tsuperannuation[i].fields.AccountName || ''
                        ];
                        splashArraySuperannuationList.push(dataListAllowance);
                    }
                    let uniqueChars = [...new Set(splashArraySuperannuationList)];
                    var datatable = $('#tblSuperannuation').DataTable();
                    datatable.clear();
                    datatable.rows.add(uniqueChars);
                    datatable.draw(false);
                    setTimeout(function () {
                        $("#tblSuperannuation").dataTable().fnPageChange('last');
                    }, 400);

                    $('.fullScreenSpin').css('display', 'none');

                } else {
                    $('.fullScreenSpin').css('display', 'none');

                    swal({
                        title: 'Question',
                        text: "Superannuation Rate does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            $('#superannuationRateForm')[0].reset();
                            $('#edtFundName').val(dataSearchName)
                            $('#superannuationSettingsModal').modal('hide');
                            $('#newSuperannuationFundModal').modal('show');
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
    'click .saveSuperannuation': async function (event) {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');

        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const apiEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TSuperannuation
        );

        let id  = $('#newSuperannuationFundId').val() || 0;
        let fundType = $('#edtFundType').val() || '';
        let fundName = $('#edtFundName').val() || '';
        let abn  = $('#edtabn').val() || '';
        let edtelectronicsalias = $('#edtelectronicsalias').val() || '';
        let employeNumber = $('#edtEmployerNumber').val() || '';
        let edtbsb = $('#edtbsb').val() || '';
        let edtaccountnumber = $('#edtaccountnumber').val() || '';
        let edtaccountname = $('#edtaccountname').val() || '';
        let fundtypeid = $('#fundtypeid').val();

        if(fundName == ''){
            handleValidationError('Please select Superannuation Name!', 'edtFundName');
            return false;
        }

        /**
         * Saving Earning Object in localDB
        */

        let superannuationRateSettings = {
            type: "Tsuperannuation",
            fields: {
                ID: parseInt(id),
                Superfund:fundName,
                Employeeid:parseInt(employeNumber),
                Supertypeid:fundType,
                ABN:abn,
                AccountName:edtaccountname,
                Accountno:edtaccountnumber,
                ElectronicsServiceAddressAlias:edtelectronicsalias,
                BSB:edtbsb,
                Clientid:Session.get('mySessionEmployeeLoggedID'),
                Amount:1,
                DepartmentName:defaultDept,
                Allclasses:true,
            }
        };
        try {
            const ApiResponse = await apiEndpoint.fetch(null, {
                method: "POST",
                headers: ApiService.getPostHeaders(),
                body: JSON.stringify(superannuationRateSettings),
            });
            if (ApiResponse.ok == true) {
                const jsonResponse = await ApiResponse.json();
                $('#superannuationRateForm')[0].reset();
                await templateObject.saveDataLocalDB();
                await templateObject.getSuperannuationData();
                let drpDownID = $('#edtSuperAnnuationDropDownID').val();
                $('#' + drpDownID).val(fundName);
                $('#newSuperannuationFundModal').modal('hide');
                $('.fullScreenSpin').css('display', 'none');            
                swal({
                    title: 'Superannuation has been saved',
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

Template.superannuationSettings.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get();
    }
});
