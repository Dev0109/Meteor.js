import { ProductService } from "../product/product-service";
import { ReactiveVar } from "meteor/reactive-var";
import { CoreService } from "../js/core-service";
import { AccountService } from "../accounts/account-service";
import { UtilityService } from "../utility-service";
import "jquery-editable-select";
import { Random } from "meteor/random";
import { SideBarService } from "../js/sidebar-service";
import "../lib/global/indexdbstorage.js";
import LoadingOverlay from "../LoadingOverlay";
let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.frmappointmentpop.onCreated(() => {});

Template.frmappointmentpop.onRendered(function() {
    const templateObject = Template.instance();
    var appt_id = $("#appID").val();

    templateObject.getAllProductData = function() {
        var productList = [];
        var splashArrayProductServiceList = new Array();
        //  $('#product-list').editableSelect('clear');
        getVS1Data("TProductWeb")
            .then(function(dataObject) {
                if (dataObject.length == 0) {
                    sideBarService
                        .getProductServiceListVS1(initialBaseDataLoad, 0)
                        .then(function(data) {
                            addVS1Data("TProductWeb", JSON.stringify(data));
                            var dataList = {};
                            for (let i = 0; i < data.tproductvs1.length; i++) {
                                dataList = {
                                    id: data.tproductvs1[i].fields.ID || "",
                                    productname: data.tproductvs1[i].fields.ProductName || "",
                                };

                                var prodservicedataList = [
                                    '<div class="custom-control custom-checkbox chkBox chkBoxService pointer" style="width:15px;"><input class="custom-control-input chkBox chkServiceCard pointer" type="checkbox" id="formCheck-' +
                                    data.tproductvs1[i].fields.ID +
                                    '"><label class="custom-control-label chkBox pointer" for="formCheck-' +
                                    data.tproductvs1[i].fields.ID +
                                    '"></label></div>',
                                    data.tproductvs1[i].fields.ProductName || "-",
                                    data.tproductvs1[i].fields.SalesDescription || "",
                                    data.tproductvs1[i].fields.BARCODE || "",
                                    utilityService.modifynegativeCurrencyFormat(
                                        Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) /
                                        100
                                    ),
                                    utilityService.modifynegativeCurrencyFormat(
                                        Math.floor(data.tproductvs1[i].fields.SellQty1Price * 100) /
                                        100
                                    ),
                                    data.tproductvs1[i].fields.TotalQtyInStock,
                                    data.tproductvs1[i].fields.TaxCodeSales || "",
                                    data.tproductvs1[i].fields.ID || "",
                                    JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice) ||
                                    null,

                                    utilityService.modifynegativeCurrencyFormat(
                                        Math.floor(
                                            data.tproductvs1[i].fields.SellQty1PriceInc * 100
                                        ) / 100
                                    ),
                                ];

                                splashArrayProductServiceList.push(prodservicedataList);

                                //if (data.tproductvs1[i].ProductType != 'INV') {
                                // $('#product-list').editableSelect('add', data.tproductvs1[i].ProductName);
                                // $('#product-list').editableSelect('add', function(){
                                //   $(this).text(data.tproductvs1[i].ProductName);
                                //   $(this).attr('id', data.tproductvs1[i].SellQty1Price);
                                // });
                                productList.push(dataList);
                                //  }
                            }

                            if (splashArrayProductServiceList) {
                                // templateObject.allnoninvproducts.set(
                                //     splashArrayProductServiceList
                                // );
                                $("#tblInventoryPayrollService")
                                    .dataTable({
                                        data: splashArrayProductServiceList,

                                        sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",

                                        columnDefs: [{
                                                className: "chkBox pointer hiddenColumn",
                                                orderable: false,
                                                targets: [0],
                                            },
                                            {
                                                className: "productName",
                                                targets: [1],
                                            },
                                            {
                                                className: "productDesc",
                                                targets: [2],
                                            },
                                            {
                                                className: "colBarcode",
                                                targets: [3],
                                            },
                                            {
                                                className: "costPrice text-right",
                                                targets: [4],
                                            },
                                            {
                                                className: "salePrice text-right",
                                                targets: [5],
                                            },
                                            {
                                                className: "prdqty text-right",
                                                targets: [6],
                                            },
                                            {
                                                className: "taxrate",
                                                targets: [7],
                                            },
                                            {
                                                className: "colProuctPOPID hiddenColumn",
                                                targets: [8],
                                            },
                                            {
                                                className: "colExtraSellPrice hiddenColumn",
                                                targets: [9],
                                            },
                                            {
                                                className: "salePriceInc hiddenColumn",
                                                targets: [10],
                                            },
                                        ],
                                        select: true,
                                        destroy: true,
                                        colReorder: true,
                                        pageLength: initialDatatableLoad,
                                        lengthMenu: [
                                            [initialDatatableLoad, -1],
                                            [initialDatatableLoad, "All"],
                                        ],
                                        info: true,
                                        responsive: true,
                                        order: [
                                            [1, "asc"]
                                        ],
                                        fnDrawCallback: function(oSettings) {
                                            $(".paginate_button.page-item").removeClass("disabled");
                                            $("#tblInventoryPayrollService_ellipsis").addClass(
                                                "disabled"
                                            );
                                        },
                                        fnInitComplete: function() {
                                            $(
                                                "<a class='btn btn-primary scanProdServiceBarcodePOP' href='' id='scanProdServiceBarcodePOP' role='button' style='margin-left: 8px; height:32px;padding: 4px 10px;'><i class='fas fa-camera'></i></a>"
                                            ).insertAfter("#tblInventoryPayrollService_filter");
                                            $(
                                                "<button class='btn btn-primary' data-dismiss='modal' data-toggle='modal' data-target='#newProductModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
                                            ).insertAfter("#tblInventoryPayrollService_filter");
                                            $(
                                                "<button class='btn btn-primary btnRefreshProduct' type='button' id='btnRefreshProduct' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                                            ).insertAfter("#tblInventoryPayrollService_filter");
                                        },
                                    })
                                    .on("length.dt", function(e, settings, len) {
                                        $(".fullScreenSpin").css("display", "inline-block");
                                        let dataLenght = settings._iDisplayLength;
                                        // splashArrayProductList = [];
                                        if (dataLenght == -1) {
                                            $(".fullScreenSpin").css("display", "none");
                                        } else {
                                            if (
                                                settings.fnRecordsDisplay() >= settings._iDisplayLength
                                            ) {
                                                $(".fullScreenSpin").css("display", "none");
                                            } else {
                                                $(".fullScreenSpin").css("display", "none");
                                            }
                                        }
                                    });

                                $("div.dataTables_filter input").addClass(
                                    "form-control form-control-sm"
                                );
                            }

                            // templateObject.datatablerecords.set(productList);
                        });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.tproductvs1;
                    var dataList = {};
                    for (let i = 0; i < useData.length; i++) {
                        dataList = {
                            id: useData[i].fields.ID || "",
                            productname: useData[i].fields.ProductName || "",
                        };

                        var prodservicedataList = [
                            '<div class="custom-control custom-checkbox chkBox chkBoxService pointer" style="width:15px;"><input class="custom-control-input chkBox chkServiceCard pointer" type="checkbox" id="formCheck-' +
                            data.tproductvs1[i].fields.ID +
                            '"><label class="custom-control-label chkBox pointer" for="formCheck-' +
                            data.tproductvs1[i].fields.ID +
                            '"></label></div>',
                            data.tproductvs1[i].fields.ProductName || "-",
                            data.tproductvs1[i].fields.SalesDescription || "",
                            data.tproductvs1[i].fields.BARCODE || "",
                            utilityService.modifynegativeCurrencyFormat(
                                Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) / 100
                            ),
                            utilityService.modifynegativeCurrencyFormat(
                                Math.floor(data.tproductvs1[i].fields.SellQty1Price * 100) / 100
                            ),
                            data.tproductvs1[i].fields.TotalQtyInStock,
                            data.tproductvs1[i].fields.TaxCodeSales || "",
                            data.tproductvs1[i].fields.ID || "",
                            JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice) || null,

                            utilityService.modifynegativeCurrencyFormat(
                                Math.floor(data.tproductvs1[i].fields.SellQty1PriceInc * 100) /
                                100
                            ),
                        ];

                        splashArrayProductServiceList.push(prodservicedataList);
                        // $('#product-list').editableSelect('add', useData[i].fields.ProductName);
                        // $('#product-list').editableSelect('add', function(){
                        //   $(this).val(useData[i].fields.ID);
                        //   $(this).text(useData[i].fields.ProductName);
                        //   $(this).attr('id', useData[i].fields.SellQty1Price);
                        // });
                        //if (useData[i].fields.ProductType != 'INV') {
                        productList.push(dataList);
                        //}
                    }

                    if (splashArrayProductServiceList) {
                        // templateObject.allnoninvproducts.set(splashArrayProductServiceList);
                        $("#tblInventoryPayrollService")
                            .dataTable({
                                data: splashArrayProductServiceList,

                                sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",

                                columnDefs: [{
                                        className: "chkBox pointer hiddenColumn",
                                        orderable: false,
                                        targets: [0],
                                    },
                                    {
                                        className: "productName",
                                        targets: [1],
                                    },
                                    {
                                        className: "productDesc",
                                        targets: [2],
                                    },
                                    {
                                        className: "colBarcode",
                                        targets: [3],
                                    },
                                    {
                                        className: "costPrice text-right",
                                        targets: [4],
                                    },
                                    {
                                        className: "salePrice text-right",
                                        targets: [5],
                                    },
                                    {
                                        className: "prdqty text-right",
                                        targets: [6],
                                    },
                                    {
                                        className: "taxrate",
                                        targets: [7],
                                    },
                                    {
                                        className: "colProuctPOPID hiddenColumn",
                                        targets: [8],
                                    },
                                    {
                                        className: "colExtraSellPrice hiddenColumn",
                                        targets: [9],
                                    },
                                    {
                                        className: "salePriceInc hiddenColumn",
                                        targets: [10],
                                    },
                                ],
                                select: true,
                                destroy: true,
                                colReorder: true,
                                pageLength: initialDatatableLoad,
                                lengthMenu: [
                                    [initialDatatableLoad, -1],
                                    [initialDatatableLoad, "All"],
                                ],
                                info: true,
                                responsive: true,
                                order: [
                                    [1, "asc"]
                                ],
                                fnDrawCallback: function(oSettings) {
                                    $(".paginate_button.page-item").removeClass("disabled");
                                    $("#tblInventoryPayrollService_ellipsis").addClass(
                                        "disabled"
                                    );
                                },
                                fnInitComplete: function() {
                                    $(
                                        "<a class='btn btn-primary scanProdServiceBarcodePOP' href='' id='scanProdServiceBarcodePOP' role='button' style='margin-left: 8px; height:32px;padding: 4px 10px;'><i class='fas fa-camera'></i></a>"
                                    ).insertAfter("#tblInventoryPayrollService_filter");
                                    $(
                                        "<button class='btn btn-primary' data-dismiss='modal' data-toggle='modal' data-target='#newProductModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
                                    ).insertAfter("#tblInventoryPayrollService_filter");
                                    $(
                                        "<button class='btn btn-primary btnRefreshProduct' type='button' id='btnRefreshProduct' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                                    ).insertAfter("#tblInventoryPayrollService_filter");
                                },
                            })
                            .on("length.dt", function(e, settings, len) {
                                $(".fullScreenSpin").css("display", "inline-block");
                                let dataLenght = settings._iDisplayLength;
                                // splashArrayProductList = [];
                                if (dataLenght == -1) {
                                    $(".fullScreenSpin").css("display", "none");
                                } else {
                                    if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                                        $(".fullScreenSpin").css("display", "none");
                                    } else {
                                        $(".fullScreenSpin").css("display", "none");
                                    }
                                }
                            });

                        $("div.dataTables_filter input").addClass(
                            "form-control form-control-sm"
                        );
                    }
                    // templateObject.datatablerecords.set(productList);
                }
            })
            .catch(function(err) {
                sideBarService
                    .getProductServiceListVS1(initialBaseDataLoad, 0)
                    .then(function(data) {
                        addVS1Data("TProductWeb", JSON.stringify(data));
                        var dataList = {};
                        for (let i = 0; i < data.tproductvs1.length; i++) {
                            dataList = {
                                id: data.tproductvs1[i].fields.ID || "",
                                productname: data.tproductvs1[i].fields.ProductName || "",
                            };

                            var prodservicedataList = [
                                '<div class="custom-control custom-checkbox chkBox chkBoxService pointer" style="width:15px;"><input class="custom-control-input chkBox chkServiceCard pointer" type="checkbox" id="formCheck-' +
                                data.tproductvs1[i].fields.ID +
                                '"><label class="custom-control-label chkBox pointer" for="formCheck-' +
                                data.tproductvs1[i].fields.ID +
                                '"></label></div>',
                                data.tproductvs1[i].fields.ProductName || "-",
                                data.tproductvs1[i].fields.SalesDescription || "",
                                data.tproductvs1[i].fields.BARCODE || "",
                                utilityService.modifynegativeCurrencyFormat(
                                    Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) / 100
                                ),
                                utilityService.modifynegativeCurrencyFormat(
                                    Math.floor(data.tproductvs1[i].fields.SellQty1Price * 100) /
                                    100
                                ),
                                data.tproductvs1[i].fields.TotalQtyInStock,
                                data.tproductvs1[i].fields.TaxCodeSales || "",
                                data.tproductvs1[i].fields.ID || "",
                                JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice) ||
                                null,

                                utilityService.modifynegativeCurrencyFormat(
                                    Math.floor(
                                        data.tproductvs1[i].fields.SellQty1PriceInc * 100
                                    ) / 100
                                ),
                            ];

                            splashArrayProductServiceList.push(prodservicedataList);

                            //if (data.tproductvs1[i].ProductType != 'INV') {
                            // $('#product-list').editableSelect('add', data.tproductvs1[i].ProductName);
                            // $('#product-list').editableSelect('add', function(){
                            //   $(this).text(data.tproductvs1[i].ProductName);
                            //   $(this).attr('id', data.tproductvs1[i].SellQty1Price);
                            // });
                            productList.push(dataList);
                            //  }
                        }

                        if (splashArrayProductServiceList) {
                            // templateObject.allnoninvproducts.set(
                            //     splashArrayProductServiceList
                            // );
                            $("#tblInventoryPayrollService")
                                .dataTable({
                                    data: splashArrayProductServiceList,

                                    sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",

                                    columnDefs: [{
                                            className: "chkBox pointer hiddenColumn",
                                            orderable: false,
                                            targets: [0],
                                        },
                                        {
                                            className: "productName",
                                            targets: [1],
                                        },
                                        {
                                            className: "productDesc",
                                            targets: [2],
                                        },
                                        {
                                            className: "colBarcode",
                                            targets: [3],
                                        },
                                        {
                                            className: "costPrice text-right",
                                            targets: [4],
                                        },
                                        {
                                            className: "salePrice text-right",
                                            targets: [5],
                                        },
                                        {
                                            className: "prdqty text-right",
                                            targets: [6],
                                        },
                                        {
                                            className: "taxrate",
                                            targets: [7],
                                        },
                                        {
                                            className: "colProuctPOPID hiddenColumn",
                                            targets: [8],
                                        },
                                        {
                                            className: "colExtraSellPrice hiddenColumn",
                                            targets: [9],
                                        },
                                        {
                                            className: "salePriceInc hiddenColumn",
                                            targets: [10],
                                        },
                                    ],
                                    select: true,
                                    destroy: true,
                                    colReorder: true,
                                    pageLength: initialDatatableLoad,
                                    lengthMenu: [
                                        [initialDatatableLoad, -1],
                                        [initialDatatableLoad, "All"],
                                    ],
                                    info: true,
                                    responsive: true,
                                    order: [
                                        [1, "asc"]
                                    ],
                                    fnDrawCallback: function(oSettings) {
                                        $(".paginate_button.page-item").removeClass("disabled");
                                        $("#tblInventoryPayrollService_ellipsis").addClass(
                                            "disabled"
                                        );
                                    },
                                    fnInitComplete: function() {
                                        $(
                                            "<a class='btn btn-primary scanProdServiceBarcodePOP' href='' id='scanProdServiceBarcodePOP' role='button' style='margin-left: 8px; height:32px;padding: 4px 10px;'><i class='fas fa-camera'></i></a>"
                                        ).insertAfter("#tblInventoryPayrollService_filter");
                                        $(
                                            "<button class='btn btn-primary' data-dismiss='modal' data-toggle='modal' data-target='#newProductModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
                                        ).insertAfter("#tblInventoryPayrollService_filter");
                                        $(
                                            "<button class='btn btn-primary btnRefreshProduct' type='button' id='btnRefreshProduct' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                                        ).insertAfter("#tblInventoryPayrollService_filter");
                                    },
                                })
                                .on("length.dt", function(e, settings, len) {
                                    $(".fullScreenSpin").css("display", "inline-block");
                                    let dataLenght = settings._iDisplayLength;
                                    // splashArrayProductList = [];
                                    if (dataLenght == -1) {
                                        $(".fullScreenSpin").css("display", "none");
                                    } else {
                                        if (
                                            settings.fnRecordsDisplay() >= settings._iDisplayLength
                                        ) {
                                            $(".fullScreenSpin").css("display", "none");
                                        } else {
                                            $(".fullScreenSpin").css("display", "none");
                                        }
                                    }
                                });

                            $("div.dataTables_filter input").addClass(
                                "form-control form-control-sm"
                            );
                        }

                        // templateObject.datatablerecords.set(productList);
                    });
            });
    };

    templateObject.getAllProductData();

    $(document).ready(function() {
        $("#customer").editableSelect();
        $("#product-list").editableSelect();
        $("#product-list-1").editableSelect();
    });

    $("#customer")
        .editableSelect()
        .on("click.editable-select", function(e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            $("#edtCustomerPOPID").val("");
            //$('#edtCustomerCompany').attr('readonly', false);
            var customerDataName = e.target.value || "";
            if (e.pageX > offset.left + $earch.width() - 8) {
                // X button 16px wide?
                if (FlowRouter.current().queryParams.leadid) {
                    openAppointModalDirectly(
                        FlowRouter.current().queryParams.leadid,
                        templateObject
                    );
                } else if (FlowRouter.current().queryParams.customerid) {
                    openAppointModalDirectly(
                        FlowRouter.current().queryParams.customerid,
                        templateObject
                    );
                } else if (FlowRouter.current().queryParams.supplierid) {
                    openAppointModalDirectly(
                        FlowRouter.current().queryParams.supplierid,
                        templateObject
                    );
                } else {
                    $("#customerListModal").modal();
                }
                setTimeout(function() {
                    $("#tblCustomerlist_filter .form-control-sm").focus();
                    $("#tblCustomerlist_filter .form-control-sm").val("");
                    $("#tblCustomerlist_filter .form-control-sm").trigger("input");
                    var datatable = $("#tblCustomerlist").DataTable();
                    //datatable.clear();
                    //datatable.rows.add(splashArrayCustomerList);
                    datatable.draw();
                    $("#tblCustomerlist_filter .form-control-sm").trigger("input");
                    //$('#tblCustomerlist').dataTable().fnFilter(' ').draw(false);
                }, 500);
            } else {
                if (customerDataName.replace(/\s/g, "") != "") {
                    //FlowRouter.go('/customerscard?name=' + e.target.value);
                    $("#edtCustomerPOPID").val("");
                    getVS1Data("TCustomerVS1")
                        .then(function(dataObject) {
                            if (dataObject.length == 0) {
                                $(".fullScreenSpin").css("display", "inline-block");
                                sideBarService
                                    .getOneCustomerDataExByName(customerDataName)
                                    .then(function(data) {
                                        $(".fullScreenSpin").css("display", "none");
                                        let lineItems = [];
                                        $("#add-customer-title").text("Edit Customer");
                                        let popCustomerID = data.tcustomer[0].fields.ID || "";
                                        let popCustomerName =
                                            data.tcustomer[0].fields.ClientName || "";
                                        let popCustomerEmail = data.tcustomer[0].fields.Email || "";
                                        let popCustomerTitle = data.tcustomer[0].fields.Title || "";
                                        let popCustomerFirstName =
                                            data.tcustomer[0].fields.FirstName || "";
                                        let popCustomerMiddleName =
                                            data.tcustomer[0].fields.CUSTFLD10 || "";
                                        let popCustomerLastName =
                                            data.tcustomer[0].fields.LastName || "";
                                        let popCustomertfn = "" || "";
                                        let popCustomerPhone = data.tcustomer[0].fields.Phone || "";
                                        let popCustomerMobile =
                                            data.tcustomer[0].fields.Mobile || "";
                                        let popCustomerFaxnumber =
                                            data.tcustomer[0].fields.Faxnumber || "";
                                        let popCustomerSkypeName =
                                            data.tcustomer[0].fields.SkypeName || "";
                                        let popCustomerURL = data.tcustomer[0].fields.URL || "";
                                        let popCustomerStreet =
                                            data.tcustomer[0].fields.Street || "";
                                        let popCustomerStreet2 =
                                            data.tcustomer[0].fields.Street2 || "";
                                        let popCustomerState = data.tcustomer[0].fields.State || "";
                                        let popCustomerPostcode =
                                            data.tcustomer[0].fields.Postcode || "";
                                        let popCustomerCountry =
                                            data.tcustomer[0].fields.Country || LoggedCountry;
                                        let popCustomerbillingaddress =
                                            data.tcustomer[0].fields.BillStreet || "";
                                        let popCustomerbcity =
                                            data.tcustomer[0].fields.BillStreet2 || "";
                                        let popCustomerbstate =
                                            data.tcustomer[0].fields.BillState || "";
                                        let popCustomerbpostalcode =
                                            data.tcustomer[0].fields.BillPostcode || "";
                                        let popCustomerbcountry =
                                            data.tcustomer[0].fields.Billcountry || LoggedCountry;
                                        let popCustomercustfield1 =
                                            data.tcustomer[0].fields.CUSTFLD1 || "";
                                        let popCustomercustfield2 =
                                            data.tcustomer[0].fields.CUSTFLD2 || "";
                                        let popCustomercustfield3 =
                                            data.tcustomer[0].fields.CUSTFLD3 || "";
                                        let popCustomercustfield4 =
                                            data.tcustomer[0].fields.CUSTFLD4 || "";
                                        let popCustomernotes = data.tcustomer[0].fields.Notes || "";
                                        let popCustomerpreferedpayment =
                                            data.tcustomer[0].fields.PaymentMethodName || "";
                                        let popCustomerterms =
                                            data.tcustomer[0].fields.TermsName || "";
                                        let popCustomerdeliverymethod =
                                            data.tcustomer[0].fields.ShippingMethodName || "";
                                        let popCustomeraccountnumber =
                                            data.tcustomer[0].fields.ClientNo || "";
                                        let popCustomerisContractor =
                                            data.tcustomer[0].fields.Contractor || false;
                                        let popCustomerissupplier =
                                            data.tcustomer[0].fields.IsSupplier || false;
                                        let popCustomeriscustomer =
                                            data.tcustomer[0].fields.IsCustomer || false;
                                        let popCustomerTaxCode =
                                            data.tcustomer[0].fields.TaxCodeName || "";
                                        let popCustomerDiscount =
                                            data.tcustomer[0].fields.Discount || 0;
                                        let popCustomerType =
                                            data.tcustomer[0].fields.ClientTypeName || "";
                                        //$('#edtCustomerCompany').attr('readonly', true);
                                        $("#edtCustomerCompany").val(popCustomerName);
                                        $("#edtCustomerPOPID").val(popCustomerID);
                                        $("#edtCustomerPOPEmail").val(popCustomerEmail);
                                        $("#edtTitle").val(popCustomerTitle);
                                        $("#edtFirstName").val(popCustomerFirstName);
                                        $("#edtMiddleName").val(popCustomerMiddleName);
                                        $("#edtLastName").val(popCustomerLastName);
                                        $("#edtCustomerPhone").val(popCustomerPhone);
                                        $("#edtCustomerMobile").val(popCustomerMobile);
                                        $("#edtCustomerFax").val(popCustomerFaxnumber);
                                        $("#edtCustomerSkypeID").val(popCustomerSkypeName);
                                        $("#edtCustomerWebsite").val(popCustomerURL);
                                        $("#edtCustomerShippingAddress").val(popCustomerStreet);
                                        $("#edtCustomerShippingCity").val(popCustomerStreet2);
                                        $("#edtCustomerShippingState").val(popCustomerState);
                                        $("#edtCustomerShippingZIP").val(popCustomerPostcode);
                                        $("#sedtCountry").val(popCustomerCountry);
                                        $("#txaNotes").val(popCustomernotes);
                                        $("#sltPreferedPayment").val(popCustomerpreferedpayment);
                                        $("#sltTermsPOP").val(popCustomerterms);
                                        $("#sltCustomerType").val(popCustomerType);
                                        $("#edtCustomerCardDiscount").val(popCustomerDiscount);
                                        $("#edtCustomeField1").val(popCustomercustfield1);
                                        $("#edtCustomeField2").val(popCustomercustfield2);
                                        $("#edtCustomeField3").val(popCustomercustfield3);
                                        $("#edtCustomeField4").val(popCustomercustfield4);

                                        $("#sltTaxCode").val(popCustomerTaxCode);

                                        if (
                                            data.tcustomer[0].fields.Street ==
                                            data.tcustomer[0].fields.BillStreet &&
                                            data.tcustomer[0].fields.Street2 ==
                                            data.tcustomer[0].fields.BillStreet2 &&
                                            data.tcustomer[0].fields.State ==
                                            data.tcustomer[0].fields.BillState &&
                                            data.tcustomer[0].fields.Postcode ==
                                            data.tcustomer[0].fields.BillPostcode &&
                                            data.tcustomer[0].fields.Country ==
                                            data.tcustomer[0].fields.Billcountry
                                        ) {
                                            $("#chkSameAsShipping2").attr("checked", "checked");
                                        }

                                        if (data.tcustomer[0].fields.IsSupplier == true) {
                                            // $('#isformcontractor')
                                            $("#chkSameAsSupplier").attr("checked", "checked");
                                        } else {
                                            $("#chkSameAsSupplier").removeAttr("checked");
                                        }

                                        setTimeout(function() {
                                            $("#addCustomerModal").modal("show");
                                        }, 200);
                                    })
                                    .catch(function(err) {
                                        $(".fullScreenSpin").css("display", "none");
                                    });
                            } else {
                                let data = JSON.parse(dataObject[0].data);
                                let useData = data.tcustomervs1;

                                var added = false;
                                for (let i = 0; i < data.tcustomervs1.length; i++) {
                                    if (
                                        data.tcustomervs1[i].fields.ClientName === customerDataName
                                    ) {
                                        let lineItems = [];
                                        added = true;
                                        $(".fullScreenSpin").css("display", "none");
                                        $("#add-customer-title").text("Edit Customer");
                                        let popCustomerID = data.tcustomervs1[i].fields.ID || "";
                                        let popCustomerName =
                                            data.tcustomervs1[i].fields.ClientName || "";
                                        let popCustomerEmail =
                                            data.tcustomervs1[i].fields.Email || "";
                                        let popCustomerTitle =
                                            data.tcustomervs1[i].fields.Title || "";
                                        let popCustomerFirstName =
                                            data.tcustomervs1[i].fields.FirstName || "";
                                        let popCustomerMiddleName =
                                            data.tcustomervs1[i].fields.CUSTFLD10 || "";
                                        let popCustomerLastName =
                                            data.tcustomervs1[i].fields.LastName || "";
                                        let popCustomertfn = "" || "";
                                        let popCustomerPhone =
                                            data.tcustomervs1[i].fields.Phone || "";
                                        let popCustomerMobile =
                                            data.tcustomervs1[i].fields.Mobile || "";
                                        let popCustomerFaxnumber =
                                            data.tcustomervs1[i].fields.Faxnumber || "";
                                        let popCustomerSkypeName =
                                            data.tcustomervs1[i].fields.SkypeName || "";
                                        let popCustomerURL = data.tcustomervs1[i].fields.URL || "";
                                        let popCustomerStreet =
                                            data.tcustomervs1[i].fields.Street || "";
                                        let popCustomerStreet2 =
                                            data.tcustomervs1[i].fields.Street2 || "";
                                        let popCustomerState =
                                            data.tcustomervs1[i].fields.State || "";
                                        let popCustomerPostcode =
                                            data.tcustomervs1[i].fields.Postcode || "";
                                        let popCustomerCountry =
                                            data.tcustomervs1[i].fields.Country || LoggedCountry;
                                        let popCustomerbillingaddress =
                                            data.tcustomervs1[i].fields.BillStreet || "";
                                        let popCustomerbcity =
                                            data.tcustomervs1[i].fields.BillStreet2 || "";
                                        let popCustomerbstate =
                                            data.tcustomervs1[i].fields.BillState || "";
                                        let popCustomerbpostalcode =
                                            data.tcustomervs1[i].fields.BillPostcode || "";
                                        let popCustomerbcountry =
                                            data.tcustomervs1[i].fields.Billcountry || LoggedCountry;
                                        let popCustomercustfield1 =
                                            data.tcustomervs1[i].fields.CUSTFLD1 || "";
                                        let popCustomercustfield2 =
                                            data.tcustomervs1[i].fields.CUSTFLD2 || "";
                                        let popCustomercustfield3 =
                                            data.tcustomervs1[i].fields.CUSTFLD3 || "";
                                        let popCustomercustfield4 =
                                            data.tcustomervs1[i].fields.CUSTFLD4 || "";
                                        let popCustomernotes =
                                            data.tcustomervs1[i].fields.Notes || "";
                                        let popCustomerpreferedpayment =
                                            data.tcustomervs1[i].fields.PaymentMethodName || "";
                                        let popCustomerterms =
                                            data.tcustomervs1[i].fields.TermsName || "";
                                        let popCustomerdeliverymethod =
                                            data.tcustomervs1[i].fields.ShippingMethodName || "";
                                        let popCustomeraccountnumber =
                                            data.tcustomervs1[i].fields.ClientNo || "";
                                        let popCustomerisContractor =
                                            data.tcustomervs1[i].fields.Contractor || false;
                                        let popCustomerissupplier =
                                            data.tcustomervs1[i].fields.IsSupplier || false;
                                        let popCustomeriscustomer =
                                            data.tcustomervs1[i].fields.IsCustomer || false;
                                        let popCustomerTaxCode =
                                            data.tcustomervs1[i].fields.TaxCodeName || "";
                                        let popCustomerDiscount =
                                            data.tcustomervs1[i].fields.Discount || 0;
                                        let popCustomerType =
                                            data.tcustomervs1[i].fields.ClientTypeName || "";
                                        //$('#edtCustomerCompany').attr('readonly', true);
                                        $("#edtCustomerCompany").val(popCustomerName);
                                        $("#edtCustomerPOPID").val(popCustomerID);
                                        $("#edtCustomerPOPEmail").val(popCustomerEmail);
                                        $("#edtTitle").val(popCustomerTitle);
                                        $("#edtFirstName").val(popCustomerFirstName);
                                        $("#edtMiddleName").val(popCustomerMiddleName);
                                        $("#edtLastName").val(popCustomerLastName);
                                        $("#edtCustomerPhone").val(popCustomerPhone);
                                        $("#edtCustomerMobile").val(popCustomerMobile);
                                        $("#edtCustomerFax").val(popCustomerFaxnumber);
                                        $("#edtCustomerSkypeID").val(popCustomerSkypeName);
                                        $("#edtCustomerWebsite").val(popCustomerURL);
                                        $("#edtCustomerShippingAddress").val(popCustomerStreet);
                                        $("#edtCustomerShippingCity").val(popCustomerStreet2);
                                        $("#edtCustomerShippingState").val(popCustomerState);
                                        $("#edtCustomerShippingZIP").val(popCustomerPostcode);
                                        $("#sedtCountry").val(popCustomerCountry);
                                        $("#txaNotes").val(popCustomernotes);
                                        $("#sltPreferedPayment").val(popCustomerpreferedpayment);
                                        $("#sltTermsPOP").val(popCustomerterms);
                                        $("#sltCustomerType").val(popCustomerType);
                                        $("#edtCustomerCardDiscount").val(popCustomerDiscount);
                                        $("#edtCustomeField1").val(popCustomercustfield1);
                                        $("#edtCustomeField2").val(popCustomercustfield2);
                                        $("#edtCustomeField3").val(popCustomercustfield3);
                                        $("#edtCustomeField4").val(popCustomercustfield4);

                                        $("#sltTaxCode").val(popCustomerTaxCode);

                                        if (
                                            data.tcustomervs1[i].fields.Street ==
                                            data.tcustomervs1[i].fields.BillStreet &&
                                            data.tcustomervs1[i].fields.Street2 ==
                                            data.tcustomervs1[i].fields.BillStreet2 &&
                                            data.tcustomervs1[i].fields.State ==
                                            data.tcustomervs1[i].fields.BillState &&
                                            data.tcustomervs1[i].fields.Postcode ==
                                            data.tcustomervs1[i].fields.BillPostcode &&
                                            data.tcustomervs1[i].fields.Country ==
                                            data.tcustomervs1[i].fields.Billcountry
                                        ) {
                                            $("#chkSameAsShipping2").attr("checked", "checked");
                                        }

                                        if (data.tcustomervs1[i].fields.IsSupplier == true) {
                                            // $('#isformcontractor')
                                            $("#chkSameAsSupplier").attr("checked", "checked");
                                        } else {
                                            $("#chkSameAsSupplier").removeAttr("checked");
                                        }

                                        setTimeout(function() {
                                            $("#addCustomerModal").modal("show");
                                        }, 200);
                                    }
                                }
                                if (!added) {
                                    $(".fullScreenSpin").css("display", "inline-block");
                                    sideBarService
                                        .getOneCustomerDataExByName(customerDataName)
                                        .then(function(data) {
                                            $(".fullScreenSpin").css("display", "none");
                                            let lineItems = [];
                                            $("#add-customer-title").text("Edit Customer");
                                            let popCustomerID = data.tcustomer[0].fields.ID || "";
                                            let popCustomerName =
                                                data.tcustomer[0].fields.ClientName || "";
                                            let popCustomerEmail =
                                                data.tcustomer[0].fields.Email || "";
                                            let popCustomerTitle =
                                                data.tcustomer[0].fields.Title || "";
                                            let popCustomerFirstName =
                                                data.tcustomer[0].fields.FirstName || "";
                                            let popCustomerMiddleName =
                                                data.tcustomer[0].fields.CUSTFLD10 || "";
                                            let popCustomerLastName =
                                                data.tcustomer[0].fields.LastName || "";
                                            let popCustomertfn = "" || "";
                                            let popCustomerPhone =
                                                data.tcustomer[0].fields.Phone || "";
                                            let popCustomerMobile =
                                                data.tcustomer[0].fields.Mobile || "";
                                            let popCustomerFaxnumber =
                                                data.tcustomer[0].fields.Faxnumber || "";
                                            let popCustomerSkypeName =
                                                data.tcustomer[0].fields.SkypeName || "";
                                            let popCustomerURL = data.tcustomer[0].fields.URL || "";
                                            let popCustomerStreet =
                                                data.tcustomer[0].fields.Street || "";
                                            let popCustomerStreet2 =
                                                data.tcustomer[0].fields.Street2 || "";
                                            let popCustomerState =
                                                data.tcustomer[0].fields.State || "";
                                            let popCustomerPostcode =
                                                data.tcustomer[0].fields.Postcode || "";
                                            let popCustomerCountry =
                                                data.tcustomer[0].fields.Country || LoggedCountry;
                                            let popCustomerbillingaddress =
                                                data.tcustomer[0].fields.BillStreet || "";
                                            let popCustomerbcity =
                                                data.tcustomer[0].fields.BillStreet2 || "";
                                            let popCustomerbstate =
                                                data.tcustomer[0].fields.BillState || "";
                                            let popCustomerbpostalcode =
                                                data.tcustomer[0].fields.BillPostcode || "";
                                            let popCustomerbcountry =
                                                data.tcustomer[0].fields.Billcountry || LoggedCountry;
                                            let popCustomercustfield1 =
                                                data.tcustomer[0].fields.CUSTFLD1 || "";
                                            let popCustomercustfield2 =
                                                data.tcustomer[0].fields.CUSTFLD2 || "";
                                            let popCustomercustfield3 =
                                                data.tcustomer[0].fields.CUSTFLD3 || "";
                                            let popCustomercustfield4 =
                                                data.tcustomer[0].fields.CUSTFLD4 || "";
                                            let popCustomernotes =
                                                data.tcustomer[0].fields.Notes || "";
                                            let popCustomerpreferedpayment =
                                                data.tcustomer[0].fields.PaymentMethodName || "";
                                            let popCustomerterms =
                                                data.tcustomer[0].fields.TermsName || "";
                                            let popCustomerdeliverymethod =
                                                data.tcustomer[0].fields.ShippingMethodName || "";
                                            let popCustomeraccountnumber =
                                                data.tcustomer[0].fields.ClientNo || "";
                                            let popCustomerisContractor =
                                                data.tcustomer[0].fields.Contractor || false;
                                            let popCustomerissupplier =
                                                data.tcustomer[0].fields.IsSupplier || false;
                                            let popCustomeriscustomer =
                                                data.tcustomer[0].fields.IsCustomer || false;
                                            let popCustomerTaxCode =
                                                data.tcustomer[0].fields.TaxCodeName || "";
                                            let popCustomerDiscount =
                                                data.tcustomer[0].fields.Discount || 0;
                                            let popCustomerType =
                                                data.tcustomer[0].fields.ClientTypeName || "";
                                            //$('#edtCustomerCompany').attr('readonly', true);
                                            $("#edtCustomerCompany").val(popCustomerName);
                                            $("#edtCustomerPOPID").val(popCustomerID);
                                            $("#edtCustomerPOPEmail").val(popCustomerEmail);
                                            $("#edtTitle").val(popCustomerTitle);
                                            $("#edtFirstName").val(popCustomerFirstName);
                                            $("#edtMiddleName").val(popCustomerMiddleName);
                                            $("#edtLastName").val(popCustomerLastName);
                                            $("#edtCustomerPhone").val(popCustomerPhone);
                                            $("#edtCustomerMobile").val(popCustomerMobile);
                                            $("#edtCustomerFax").val(popCustomerFaxnumber);
                                            $("#edtCustomerSkypeID").val(popCustomerSkypeName);
                                            $("#edtCustomerWebsite").val(popCustomerURL);
                                            $("#edtCustomerShippingAddress").val(popCustomerStreet);
                                            $("#edtCustomerShippingCity").val(popCustomerStreet2);
                                            $("#edtCustomerShippingState").val(popCustomerState);
                                            $("#edtCustomerShippingZIP").val(popCustomerPostcode);
                                            $("#sedtCountry").val(popCustomerCountry);
                                            $("#txaNotes").val(popCustomernotes);
                                            $("#sltPreferedPayment").val(popCustomerpreferedpayment);
                                            $("#sltTermsPOP").val(popCustomerterms);
                                            $("#sltCustomerType").val(popCustomerType);
                                            $("#edtCustomerCardDiscount").val(popCustomerDiscount);
                                            $("#edtCustomeField1").val(popCustomercustfield1);
                                            $("#edtCustomeField2").val(popCustomercustfield2);
                                            $("#edtCustomeField3").val(popCustomercustfield3);
                                            $("#edtCustomeField4").val(popCustomercustfield4);

                                            $("#sltTaxCode").val(popCustomerTaxCode);

                                            if (
                                                data.tcustomer[0].fields.Street ==
                                                data.tcustomer[0].fields.BillStreet &&
                                                data.tcustomer[0].fields.Street2 ==
                                                data.tcustomer[0].fields.BillStreet2 &&
                                                data.tcustomer[0].fields.State ==
                                                data.tcustomer[0].fields.BillState &&
                                                data.tcustomer[0].fields.Postcode ==
                                                data.tcustomer[0].fields.BillPostcode &&
                                                data.tcustomer[0].fields.Country ==
                                                data.tcustomer[0].fields.Billcountry
                                            ) {
                                                $("#chkSameAsShipping2").attr("checked", "checked");
                                            }

                                            if (data.tcustomer[0].fields.IsSupplier == true) {
                                                // $('#isformcontractor')
                                                $("#chkSameAsSupplier").attr("checked", "checked");
                                            } else {
                                                $("#chkSameAsSupplier").removeAttr("checked");
                                            }

                                            setTimeout(function() {
                                                $("#addCustomerModal").modal("show");
                                            }, 200);
                                        })
                                        .catch(function(err) {
                                            $(".fullScreenSpin").css("display", "none");
                                        });
                                }
                            }
                        })
                        .catch(function(err) {
                            sideBarService
                                .getOneCustomerDataExByName(customerDataName)
                                .then(function(data) {
                                    $(".fullScreenSpin").css("display", "none");
                                    let lineItems = [];
                                    $("#add-customer-title").text("Edit Customer");
                                    let popCustomerID = data.tcustomer[0].fields.ID || "";
                                    let popCustomerName =
                                        data.tcustomer[0].fields.ClientName || "";
                                    let popCustomerEmail = data.tcustomer[0].fields.Email || "";
                                    let popCustomerTitle = data.tcustomer[0].fields.Title || "";
                                    let popCustomerFirstName =
                                        data.tcustomer[0].fields.FirstName || "";
                                    let popCustomerMiddleName =
                                        data.tcustomer[0].fields.CUSTFLD10 || "";
                                    let popCustomerLastName =
                                        data.tcustomer[0].fields.LastName || "";
                                    let popCustomertfn = "" || "";
                                    let popCustomerPhone = data.tcustomer[0].fields.Phone || "";
                                    let popCustomerMobile = data.tcustomer[0].fields.Mobile || "";
                                    let popCustomerFaxnumber =
                                        data.tcustomer[0].fields.Faxnumber || "";
                                    let popCustomerSkypeName =
                                        data.tcustomer[0].fields.SkypeName || "";
                                    let popCustomerURL = data.tcustomer[0].fields.URL || "";
                                    let popCustomerStreet = data.tcustomer[0].fields.Street || "";
                                    let popCustomerStreet2 =
                                        data.tcustomer[0].fields.Street2 || "";
                                    let popCustomerState = data.tcustomer[0].fields.State || "";
                                    let popCustomerPostcode =
                                        data.tcustomer[0].fields.Postcode || "";
                                    let popCustomerCountry =
                                        data.tcustomer[0].fields.Country || LoggedCountry;
                                    let popCustomerbillingaddress =
                                        data.tcustomer[0].fields.BillStreet || "";
                                    let popCustomerbcity =
                                        data.tcustomer[0].fields.BillStreet2 || "";
                                    let popCustomerbstate =
                                        data.tcustomer[0].fields.BillState || "";
                                    let popCustomerbpostalcode =
                                        data.tcustomer[0].fields.BillPostcode || "";
                                    let popCustomerbcountry =
                                        data.tcustomer[0].fields.Billcountry || LoggedCountry;
                                    let popCustomercustfield1 =
                                        data.tcustomer[0].fields.CUSTFLD1 || "";
                                    let popCustomercustfield2 =
                                        data.tcustomer[0].fields.CUSTFLD2 || "";
                                    let popCustomercustfield3 =
                                        data.tcustomer[0].fields.CUSTFLD3 || "";
                                    let popCustomercustfield4 =
                                        data.tcustomer[0].fields.CUSTFLD4 || "";
                                    let popCustomernotes = data.tcustomer[0].fields.Notes || "";
                                    let popCustomerpreferedpayment =
                                        data.tcustomer[0].fields.PaymentMethodName || "";
                                    let popCustomerterms =
                                        data.tcustomer[0].fields.TermsName || "";
                                    let popCustomerdeliverymethod =
                                        data.tcustomer[0].fields.ShippingMethodName || "";
                                    let popCustomeraccountnumber =
                                        data.tcustomer[0].fields.ClientNo || "";
                                    let popCustomerisContractor =
                                        data.tcustomer[0].fields.Contractor || false;
                                    let popCustomerissupplier =
                                        data.tcustomer[0].fields.IsSupplier || false;
                                    let popCustomeriscustomer =
                                        data.tcustomer[0].fields.IsCustomer || false;
                                    let popCustomerTaxCode =
                                        data.tcustomer[0].fields.TaxCodeName || "";
                                    let popCustomerDiscount =
                                        data.tcustomer[0].fields.Discount || 0;
                                    let popCustomerType =
                                        data.tcustomer[0].fields.ClientTypeName || "";
                                    //$('#edtCustomerCompany').attr('readonly', true);
                                    $("#edtCustomerCompany").val(popCustomerName);
                                    $("#edtCustomerPOPID").val(popCustomerID);
                                    $("#edtCustomerPOPEmail").val(popCustomerEmail);
                                    $("#edtTitle").val(popCustomerTitle);
                                    $("#edtFirstName").val(popCustomerFirstName);
                                    $("#edtMiddleName").val(popCustomerMiddleName);
                                    $("#edtLastName").val(popCustomerLastName);
                                    $("#edtCustomerPhone").val(popCustomerPhone);
                                    $("#edtCustomerMobile").val(popCustomerMobile);
                                    $("#edtCustomerFax").val(popCustomerFaxnumber);
                                    $("#edtCustomerSkypeID").val(popCustomerSkypeName);
                                    $("#edtCustomerWebsite").val(popCustomerURL);
                                    $("#edtCustomerShippingAddress").val(popCustomerStreet);
                                    $("#edtCustomerShippingCity").val(popCustomerStreet2);
                                    $("#edtCustomerShippingState").val(popCustomerState);
                                    $("#edtCustomerShippingZIP").val(popCustomerPostcode);
                                    $("#sedtCountry").val(popCustomerCountry);
                                    $("#txaNotes").val(popCustomernotes);
                                    $("#sltPreferedPayment").val(popCustomerpreferedpayment);
                                    $("#sltTermsPOP").val(popCustomerterms);
                                    $("#sltCustomerType").val(popCustomerType);
                                    $("#edtCustomerCardDiscount").val(popCustomerDiscount);
                                    $("#edtCustomeField1").val(popCustomercustfield1);
                                    $("#edtCustomeField2").val(popCustomercustfield2);
                                    $("#edtCustomeField3").val(popCustomercustfield3);
                                    $("#edtCustomeField4").val(popCustomercustfield4);

                                    $("#sltTaxCode").val(popCustomerTaxCode);

                                    if (
                                        data.tcustomer[0].fields.Street ==
                                        data.tcustomer[0].fields.BillStreet &&
                                        data.tcustomer[0].fields.Street2 ==
                                        data.tcustomer[0].fields.BillStreet2 &&
                                        data.tcustomer[0].fields.State ==
                                        data.tcustomer[0].fields.BillState &&
                                        data.tcustomer[0].fields.Postcode ==
                                        data.tcustomer[0].fields.BillPostcode &&
                                        data.tcustomer[0].fields.Country ==
                                        data.tcustomer[0].fields.Billcountry
                                    ) {
                                        $("#chkSameAsShipping2").attr("checked", "checked");
                                    }

                                    if (data.tcustomer[0].fields.IsSupplier == true) {
                                        // $('#isformcontractor')
                                        $("#chkSameAsSupplier").attr("checked", "checked");
                                    } else {
                                        $("#chkSameAsSupplier").removeAttr("checked");
                                    }

                                    setTimeout(function() {
                                        $("#addCustomerModal").modal("show");
                                    }, 200);
                                })
                                .catch(function(err) {
                                    $(".fullScreenSpin").css("display", "none");
                                });
                        });
                } else {
                    if (FlowRouter.current().queryParams.leadid) {
                        openAppointModalDirectly(
                            FlowRouter.current().queryParams.leadid,
                            templateObject
                        );
                    } else if (FlowRouter.current().queryParams.customerid) {
                        openAppointModalDirectly(
                            FlowRouter.current().queryParams.customerid,
                            templateObject
                        );
                    } else if (FlowRouter.current().queryParams.supplierid) {
                        openAppointModalDirectly(
                            FlowRouter.current().queryParams.supplierid,
                            templateObject
                        );
                    } else {
                        $("#customerListModal").modal();
                    }
                    setTimeout(function() {
                        $("#tblCustomerlist_filter .form-control-sm").focus();
                        $("#tblCustomerlist_filter .form-control-sm").val("");
                        $("#tblCustomerlist_filter .form-control-sm").trigger("input");
                        var datatable = $("#tblCustomerlist").DataTable();
                        //datatable.clear();
                        //datatable.rows.add(splashArrayCustomerList);
                        datatable.draw();
                        $("#tblCustomerlist_filter .form-control-sm").trigger("input");
                        //$('#tblCustomerlist').dataTable().fnFilter(' ').draw(false);
                    }, 500);
                }
            }

            //let selectedCustomer = li.text();
            // var custName = li.text();
            // var newJob = clientList.filter(function (customer) {
            //     return customer.customername == custName;
            // });
            //
            // document.getElementById("customer").value = newJob[0].customername || '';
            // document.getElementById("phone").value = newJob[0].phone || '';
            // document.getElementById("mobile").value = newJob[0].phone || '';
            // document.getElementById("state").value = newJob[0].country || '';
            // document.getElementById("address").value = newJob[0].street || '';
            // // document.getElementById("txtNotes").value = $(this).find(".colNotes").text();
            // document.getElementById("suburb").value = newJob[0].suburb || '';
            // document.getElementById("zip").value = newJob[0].statecode || '0';
        });

    $("#product-list, #product-list-1")
        .editableSelect()
        .on("click.editable-select", function(e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            var productDataName = e.target.value || "";
            //var productDataID = el.context.value || '';
            // if(el){
            //   var productCostData = el.context.id || 0;
            //   $('#edtProductCost').val(productCostData);
            // }
            if (event.pageX > offset.left + $earch.width() - 10) {
                // X button 16px wide?
                $("#productListModal").modal("toggle");
                setTimeout(function() {
                    $("#tblInventoryPayrollService_filter .form-control-sm").focus();
                    $("#tblInventoryPayrollService_filter .form-control-sm").val("");
                    $("#tblInventoryPayrollService_filter .form-control-sm").trigger(
                        "input"
                    );

                    var datatable = $("#tblInventoryPayrollService").DataTable();
                    datatable.draw();
                    $("#tblInventoryPayrollService_filter .form-control-sm").trigger(
                        "input"
                    );
                }, 500);
            } else {
                // var productDataID = $(event.target).attr('prodid').replace(/\s/g, '') || '';
                if (productDataName.replace(/\s/g, "") != "") {
                    //FlowRouter.go('/productview?prodname=' + $(event.target).text());
                    let lineExtaSellItems = [];
                    let lineExtaSellObj = {};
                    $(".fullScreenSpin").css("display", "inline-block");
                    getVS1Data("TProductWeb")
                        .then(function(dataObject) {
                            if (dataObject.length == 0) {
                                sideBarService
                                    .getOneProductdatavs1byname(productDataName)
                                    .then(function(data) {
                                        $(".fullScreenSpin").css("display", "none");
                                        let lineItems = [];
                                        let lineItemObj = {};
                                        let currencySymbol = Currency;
                                        let totalquantity = 0;
                                        let productname = data.tproduct[0].fields.ProductName || "";
                                        let productcode = data.tproduct[0].fields.PRODUCTCODE || "";
                                        let productprintName =
                                            data.tproduct[0].fields.ProductPrintName || "";
                                        let assetaccount =
                                            data.tproduct[0].fields.AssetAccount || "";
                                        let buyqty1cost =
                                            utilityService.modifynegativeCurrencyFormat(
                                                data.tproduct[0].fields.BuyQty1Cost
                                            ) || 0;
                                        let cogsaccount = data.tproduct[0].fields.CogsAccount || "";
                                        let taxcodepurchase =
                                            data.tproduct[0].fields.TaxCodePurchase || "";
                                        let purchasedescription =
                                            data.tproduct[0].fields.PurchaseDescription || "";
                                        let sellqty1price =
                                            utilityService.modifynegativeCurrencyFormat(
                                                data.tproduct[0].fields.SellQty1Price
                                            ) || 0;
                                        let incomeaccount =
                                            data.tproduct[0].fields.IncomeAccount || "";
                                        let taxcodesales =
                                            data.tproduct[0].fields.TaxCodeSales || "";
                                        let salesdescription =
                                            data.tproduct[0].fields.SalesDescription || "";
                                        let active = data.tproduct[0].fields.Active;
                                        let lockextrasell =
                                            data.tproduct[0].fields.LockExtraSell || "";
                                        let customfield1 = data.tproduct[0].fields.CUSTFLD1 || "";
                                        let customfield2 = data.tproduct[0].fields.CUSTFLD2 || "";
                                        let barcode = data.tproduct[0].fields.BARCODE || "";
                                        $("#selectProductID")
                                            .val(data.tproduct[0].fields.ID)
                                            .trigger("change");
                                        $("#add-product-title").text("Edit Product");
                                        $("#edtproductname").val(productname);
                                        $("#edtsellqty1price").val(sellqty1price);
                                        $("#txasalesdescription").val(salesdescription);
                                        $("#sltsalesacount").val(incomeaccount);
                                        $("#slttaxcodesales").val(taxcodesales);
                                        $("#edtbarcode").val(barcode);
                                        $("#txapurchasedescription").val(purchasedescription);
                                        $("#sltcogsaccount").val(cogsaccount);
                                        $("#slttaxcodepurchase").val(taxcodepurchase);
                                        $("#edtbuyqty1cost").val(buyqty1cost);

                                        setTimeout(function() {
                                            $("#newProductModal").modal("show");
                                        }, 500);
                                    })
                                    .catch(function(err) {
                                        $(".fullScreenSpin").css("display", "none");
                                    });
                            } else {
                                let data = JSON.parse(dataObject[0].data);
                                let useData = data.tproductvs1;
                                var added = false;

                                for (let i = 0; i < data.tproductvs1.length; i++) {
                                    if (
                                        data.tproductvs1[i].fields.ProductName === productDataName
                                    ) {
                                        added = true;
                                        $(".fullScreenSpin").css("display", "none");
                                        let lineItems = [];
                                        let lineItemObj = {};
                                        let currencySymbol = Currency;
                                        let totalquantity = 0;

                                        let productname =
                                            data.tproductvs1[i].fields.ProductName || "";
                                        let productcode =
                                            data.tproductvs1[i].fields.PRODUCTCODE || "";
                                        let productprintName =
                                            data.tproductvs1[i].fields.ProductPrintName || "";
                                        let assetaccount =
                                            data.tproductvs1[i].fields.AssetAccount || "";
                                        let buyqty1cost =
                                            utilityService.modifynegativeCurrencyFormat(
                                                data.tproductvs1[i].fields.BuyQty1Cost
                                            ) || 0;
                                        let cogsaccount =
                                            data.tproductvs1[i].fields.CogsAccount || "";
                                        let taxcodepurchase =
                                            data.tproductvs1[i].fields.TaxCodePurchase || "";
                                        let purchasedescription =
                                            data.tproductvs1[i].fields.PurchaseDescription || "";
                                        let sellqty1price =
                                            utilityService.modifynegativeCurrencyFormat(
                                                data.tproductvs1[i].fields.SellQty1Price
                                            ) || 0;
                                        let incomeaccount =
                                            data.tproductvs1[i].fields.IncomeAccount || "";
                                        let taxcodesales =
                                            data.tproductvs1[i].fields.TaxCodeSales || "";
                                        let salesdescription =
                                            data.tproductvs1[i].fields.SalesDescription || "";
                                        let active = data.tproductvs1[i].fields.Active;
                                        let lockextrasell =
                                            data.tproductvs1[i].fields.LockExtraSell || "";
                                        let customfield1 =
                                            data.tproductvs1[i].fields.CUSTFLD1 || "";
                                        let customfield2 =
                                            data.tproductvs1[i].fields.CUSTFLD2 || "";
                                        let barcode = data.tproductvs1[i].fields.BARCODE || "";
                                        $("#selectProductID")
                                            .val(data.tproductvs1[i].fields.ID)
                                            .trigger("change");
                                        $("#add-product-title").text("Edit Product");
                                        $("#edtproductname").val(productname);
                                        $("#edtsellqty1price").val(sellqty1price);
                                        $("#txasalesdescription").val(salesdescription);
                                        $("#sltsalesacount").val(incomeaccount);
                                        $("#slttaxcodesales").val(taxcodesales);
                                        $("#edtbarcode").val(barcode);
                                        $("#txapurchasedescription").val(purchasedescription);
                                        $("#sltcogsaccount").val(cogsaccount);
                                        $("#slttaxcodepurchase").val(taxcodepurchase);
                                        $("#edtbuyqty1cost").val(buyqty1cost);

                                        setTimeout(function() {
                                            $("#newProductModal").modal("show");
                                        }, 500);
                                    }
                                }
                                if (!added) {
                                    sideBarService
                                        .getOneProductdatavs1byname(productDataName)
                                        .then(function(data) {
                                            $(".fullScreenSpin").css("display", "none");
                                            let lineItems = [];
                                            let lineItemObj = {};
                                            let currencySymbol = Currency;
                                            let totalquantity = 0;
                                            let productname =
                                                data.tproduct[0].fields.ProductName || "";
                                            let productcode =
                                                data.tproduct[0].fields.PRODUCTCODE || "";
                                            let productprintName =
                                                data.tproduct[0].fields.ProductPrintName || "";
                                            let assetaccount =
                                                data.tproduct[0].fields.AssetAccount || "";
                                            let buyqty1cost =
                                                utilityService.modifynegativeCurrencyFormat(
                                                    data.tproduct[0].fields.BuyQty1Cost
                                                ) || 0;
                                            let cogsaccount =
                                                data.tproduct[0].fields.CogsAccount || "";
                                            let taxcodepurchase =
                                                data.tproduct[0].fields.TaxCodePurchase || "";
                                            let purchasedescription =
                                                data.tproduct[0].fields.PurchaseDescription || "";
                                            let sellqty1price =
                                                utilityService.modifynegativeCurrencyFormat(
                                                    data.tproduct[0].fields.SellQty1Price
                                                ) || 0;
                                            let incomeaccount =
                                                data.tproduct[0].fields.IncomeAccount || "";
                                            let taxcodesales =
                                                data.tproduct[0].fields.TaxCodeSales || "";
                                            let salesdescription =
                                                data.tproduct[0].fields.SalesDescription || "";
                                            let active = data.tproduct[0].fields.Active;
                                            let lockextrasell =
                                                data.tproduct[0].fields.LockExtraSell || "";
                                            let customfield1 = data.tproduct[0].fields.CUSTFLD1 || "";
                                            let customfield2 = data.tproduct[0].fields.CUSTFLD2 || "";
                                            let barcode = data.tproduct[0].fields.BARCODE || "";
                                            $("#selectProductID")
                                                .val(data.tproduct[0].fields.ID)
                                                .trigger("change");
                                            $("#add-product-title").text("Edit Product");
                                            $("#edtproductname").val(productname);
                                            $("#edtsellqty1price").val(sellqty1price);
                                            $("#txasalesdescription").val(salesdescription);
                                            $("#sltsalesacount").val(incomeaccount);
                                            $("#slttaxcodesales").val(taxcodesales);
                                            $("#edtbarcode").val(barcode);
                                            $("#txapurchasedescription").val(purchasedescription);
                                            $("#sltcogsaccount").val(cogsaccount);
                                            $("#slttaxcodepurchase").val(taxcodepurchase);
                                            $("#edtbuyqty1cost").val(buyqty1cost);

                                            setTimeout(function() {
                                                $("#newProductModal").modal("show");
                                            }, 500);
                                        })
                                        .catch(function(err) {
                                            $(".fullScreenSpin").css("display", "none");
                                        });
                                }
                            }
                        })
                        .catch(function(err) {
                            sideBarService
                                .getOneProductdatavs1byname(productDataName)
                                .then(function(data) {
                                    $(".fullScreenSpin").css("display", "none");
                                    let lineItems = [];
                                    let lineItemObj = {};
                                    let currencySymbol = Currency;
                                    let totalquantity = 0;
                                    let productname = data.tproduct[0].fields.ProductName || "";
                                    let productcode = data.tproduct[0].fields.PRODUCTCODE || "";
                                    let productprintName =
                                        data.tproduct[0].fields.ProductPrintName || "";
                                    let assetaccount = data.tproduct[0].fields.AssetAccount || "";
                                    let buyqty1cost =
                                        utilityService.modifynegativeCurrencyFormat(
                                            data.tproduct[0].fields.BuyQty1Cost
                                        ) || 0;
                                    let cogsaccount = data.tproduct[0].fields.CogsAccount || "";
                                    let taxcodepurchase =
                                        data.tproduct[0].fields.TaxCodePurchase || "";
                                    let purchasedescription =
                                        data.tproduct[0].fields.PurchaseDescription || "";
                                    let sellqty1price =
                                        utilityService.modifynegativeCurrencyFormat(
                                            data.tproduct[0].fields.SellQty1Price
                                        ) || 0;
                                    let incomeaccount =
                                        data.tproduct[0].fields.IncomeAccount || "";
                                    let taxcodesales = data.tproduct[0].fields.TaxCodeSales || "";
                                    let salesdescription =
                                        data.tproduct[0].fields.SalesDescription || "";
                                    let active = data.tproduct[0].fields.Active;
                                    let lockextrasell =
                                        data.tproduct[0].fields.LockExtraSell || "";
                                    let customfield1 = data.tproduct[0].fields.CUSTFLD1 || "";
                                    let customfield2 = data.tproduct[0].fields.CUSTFLD2 || "";
                                    let barcode = data.tproduct[0].fields.BARCODE || "";
                                    $("#selectProductID")
                                        .val(data.tproduct[0].fields.ID)
                                        .trigger("change");
                                    $("#add-product-title").text("Edit Product");
                                    $("#edtproductname").val(productname);
                                    $("#edtsellqty1price").val(sellqty1price);
                                    $("#txasalesdescription").val(salesdescription);
                                    $("#sltsalesacount").val(incomeaccount);
                                    $("#slttaxcodesales").val(taxcodesales);
                                    $("#edtbarcode").val(barcode);
                                    $("#txapurchasedescription").val(purchasedescription);
                                    $("#sltcogsaccount").val(cogsaccount);
                                    $("#slttaxcodepurchase").val(taxcodepurchase);
                                    $("#edtbuyqty1cost").val(buyqty1cost);

                                    setTimeout(function() {
                                        $("#newProductModal").modal("show");
                                    }, 500);
                                })
                                .catch(function(err) {
                                    $(".fullScreenSpin").css("display", "none");
                                });
                        });

                    setTimeout(function() {
                        var begin_day_value = $("#event_begin_day").attr("value");
                        $("#dtDateTo")
                            .datepicker({
                                showOn: "button",
                                buttonText: "Show Date",
                                buttonImageOnly: true,
                                buttonImage: "/img/imgCal2.png",
                                constrainInput: false,
                                dateFormat: "d/mm/yy",
                                showOtherMonths: true,
                                selectOtherMonths: true,
                                changeMonth: true,
                                changeYear: true,
                                yearRange: "-90:+10",
                            })
                            .keyup(function(e) {
                                if (e.keyCode == 8 || e.keyCode == 46) {
                                    $("#dtDateTo,#dtDateFrom").val("");
                                }
                            });

                        $("#dtDateFrom")
                            .datepicker({
                                showOn: "button",
                                buttonText: "Show Date",
                                altField: "#dtDateFrom",
                                buttonImageOnly: true,
                                buttonImage: "/img/imgCal2.png",
                                constrainInput: false,
                                dateFormat: "d/mm/yy",
                                showOtherMonths: true,
                                selectOtherMonths: true,
                                changeMonth: true,
                                changeYear: true,
                                yearRange: "-90:+10",
                            })
                            .keyup(function(e) {
                                if (e.keyCode == 8 || e.keyCode == 46) {
                                    $("#dtDateTo,#dtDateFrom").val("");
                                }
                            });

                        $(".ui-datepicker .ui-state-hihglight").removeClass(
                            "ui-state-highlight"
                        );
                    }, 1000);
                    //}

                    templateObject.getProductClassQtyData = function() {
                        productService
                            .getOneProductClassQtyData(currentProductID)
                            .then(function(data) {
                                $(".fullScreenSpin").css("display", "none");
                                let qtylineItems = [];
                                let qtylineItemObj = {};
                                let currencySymbol = Currency;
                                let totaldeptquantity = 0;

                                for (let j in data.tproductclassquantity) {
                                    qtylineItemObj = {
                                        department: data.tproductclassquantity[j].DepartmentName || "",
                                        quantity: data.tproductclassquantity[j].InStockQty || 0,
                                    };
                                    totaldeptquantity += data.tproductclassquantity[j].InStockQty;
                                    qtylineItems.push(qtylineItemObj);
                                }
                                // $('#edttotalqtyinstock').val(totaldeptquantity);
                                templateObject.productqtyrecords.set(qtylineItems);
                                templateObject.totaldeptquantity.set(totaldeptquantity);
                            })
                            .catch(function(err) {
                                $(".fullScreenSpin").css("display", "none");
                            });
                    };

                    //templateObject.getProductClassQtyData();
                    //templateObject.getProductData();
                } else {
                    $("#productListModal").modal("toggle");

                    setTimeout(function() {
                        $("#tblInventoryPayrollService_filter .form-control-sm").focus();
                        $("#tblInventoryPayrollService_filter .form-control-sm").val("");
                        $("#tblInventoryPayrollService_filter .form-control-sm").trigger(
                            "input"
                        );

                        var datatable = $("#tblInventoryPayrollService").DataTable();
                        datatable.draw();
                        $("#tblInventoryPayrollService_filter .form-control-sm").trigger(
                            "input"
                        );
                    }, 500);
                }
            }
        });

    $(document).on("click", "#tblEmployeelist tbody tr", function(e) {
        let employeeName = $(this).find(".colEmployeeName").text() || '';
        let employeeID = $(this).find(".colID").text() || '';
        templateObject.empID.set(employeeID);
        let draggedEmployeeID = templateObject.empID.get();
        let calendarData = templateObject.employeeOptions.get();
        let calendarSet = templateObject.globalSettings.get();
        let employees = templateObject.employeerecords.get();
        let overridesettings = employees.filter((employeeData) => {
            return employeeData.id == parseInt(draggedEmployeeID);
        });

        let empData = calendarData.filter((calendarOpt) => {
            return calendarOpt.EmployeeID == parseInt(draggedEmployeeID);
        });

        document.getElementById("frmAppointment").reset();
        $(".paused").hide();
        $("#btnHold").prop("disabled", false);
        $("#btnStartAppointment").prop("disabled", false);
        $("#btnStopAppointment").prop("disabled", false);
        $("#startTime").prop("disabled", false);
        $("#endTime").prop("disabled", false);
        $("#tActualStartTime").prop("disabled", false);
        $("#tActualEndTime").prop("disabled", false);
        $("#txtActualHoursSpent").prop("disabled", false);

        if (Session.get("CloudAppointmentStartStopAccessLevel") == true) {
            //$("#btnHold").prop("disabled", true);
        }
        if (overridesettings[0].override == "false") {
            document.getElementById("product-list").value =
                calendarSet.defaultProduct || "";
            document.getElementById("product-list-1").value =
                calendarSet.defaultProduct || "";
        } else if (overridesettings[0].override == "true") {
            if (empData.length > 0) {
                document.getElementById("product-list").value =
                    empData[empData.length - 1].DefaultServiceProduct || "";
                document.getElementById("product-list-1").value =
                    empData[empData.length - 1].DefaultServiceProduct || "";
            } else {
                document.getElementById("product-list").value =
                    calendarSet.defaultProduct || "";
                document.getElementById("product-list-1").value =
                    calendarSet.defaultProduct || "";
            }
        } else {
            if (templateObject.empDuration.get() != "") {
                var endTime = moment(startTime, "HH:mm")
                    .add(parseInt(templateObject.empDuration.get()), "hours")
                    .format("HH:mm");
                document.getElementById("endTime").value = endTime;
                let hoursFormattedStartTime =
                    templateObject.timeFormat(templateObject.empDuration.get()) || "";
                document.getElementById("txtBookedHoursSpent").value =
                    hoursFormattedStartTime;
            } else {
                var appointmentHours = moment(
                    event.dateStr.substr(event.dateStr.length - 5),
                    "HH:mm"
                ).format("HH:mm");
                var endTime = moment(startTime, "HH:mm")
                    .add(appointmentHours.substr(0, 2), "hours")
                    .format("HH:mm");
                document.getElementById("endTime").value = endTime;
                var hoursSpent = moment(appointmentHours, "hours").format("HH");
                let hoursFormattedStartTime =
                    templateObject.timeFormat(hoursSpent.replace(/^0+/, "")) || "";
                document.getElementById("txtBookedHoursSpent").value =
                    hoursFormattedStartTime;
            }

            if (empData.length > 0) {
                document.getElementById("product-list").value =
                    empData[empData.length - 1].DefaultServiceProduct || "";
                document.getElementById("product-list-1").value =
                    empData[empData.length - 1].DefaultServiceProduct || "";
                // $('#product-list').prepend('<option value=' + empData[0].Id + ' selected>' + empData[empData.length - 1].DefaultServiceProduct + '</option>');
                // $("#product-list")[0].options[0].selected = true;
            } else {
                document.getElementById("product-list").value =
                    calendarSet.defaultProduct || "";
                document.getElementById("product-list-1").value =
                    calendarSet.defaultProduct || "";
                // $('#product-list').prepend('<option value=' + calendarSet.id + ' selected>' + calendarSet.defaultProduct + '</option>');
                // $("#product-list")[0].options[0].selected = true;
            }
        }

        $('#employee_name').val(employeeName);
        $('#employeeListModal').modal('toggle');
        $("#event-modal").modal();
        setTimeout(() => {
            if (localStorage.getItem("smsCustomerAppt") == "false") {
                $("#chkSMSCustomer").prop("checked", false);
            }
            if (localStorage.getItem("smsUserAppt") == "false") {
                $("#chkSMSUser").prop("checked", false);
            }
            if (localStorage.getItem("emailCustomerAppt") == "false") {
                $("#customerEmail").prop("checked", false);
            }
            if (localStorage.getItem("emailUserAppt") == "false") {
                $("#userEmail").prop("checked", false);
            }
        }, 100);
    });

    $(document).on("click", ".addExtraProduct", function(e) {
        $("#productListModal1").modal("toggle");
        setTimeout(function() {
            $("#tblInventoryCheckbox_filter .form-control-sm").focus();
            $("#tblInventoryCheckbox_filter .form-control-sm").val("");
            $("#tblInventoryCheckbox_filter .form-control-sm").trigger("input");

            var datatable = $("#tblInventoryCheckbox").DataTable();
            datatable.draw();
            $("#tblInventoryCheckbox_filter .form-control-sm").trigger("input");
        }, 500);
    });

    /* On clik Inventory Line */
    $(document).on("click", "#tblInventoryPayrollService tbody tr", function(e) {
        var tableProductService = $(this);

        let lineProductName = tableProductService.find(".productName").text() || "";
        let lineProductDesc = tableProductService.find(".productDesc").text() || "";
        let lineProdCost = tableProductService.find(".costPrice").text() || 0;
        $(".product-list").val(lineProductName);
        $("#tblInventoryPayrollService_filter .form-control-sm").val("");
        $("#productListModal").modal("toggle");

        setTimeout(function() {
            //$('#tblCustomerlist_filter .form-control-sm').focus();
            $(".btnRefreshProduct").trigger("click");
            $(".fullScreenSpin").css("display", "none");
        }, 1000);
    });

    $(document).on("click", "#tblInventory tbody tr", async function(e) {
        $(".colProductName").removeClass("boldtablealertsborder");
        let selectLineID = $("#selectLineID").val();
        let taxcodeList = await templateObject.taxraterecords.get();
        let customers = await templateObject.clientrecords.get();
        let productExtraSell = templateObject.productextrasellrecords.get();
        var table = $(this);
        let utilityService = new UtilityService();
        let $tblrows = $("#tblExtraProducts tbody tr");
        let taxcode1 = "";

        let selectedCust = $("#edtCustomerName").val();
        let getCustDetails = "";
        let lineTaxRate = "";
        let taxRate = "";

        if (selectLineID) {
            let lineProductId = table.find(".colProuctPOPID").text();
            let lineProductName = table.find(".productName").text();
            let lineProductDesc = table.find(".productDesc").text();
            let lineUnitPrice = table.find(".salePrice").text();

            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == lineTaxRate) {
                        $("#" + selectLineID + " .lineTaxRate").text(
                            taxcodeList[i].coderate
                        );
                    }
                }
            }

            $("#" + selectLineID + " .lineProductName").val(lineProductName);
            // $('#' + selectLineID + " .lineProductName").attr("prodid", table.find(".colProuctPOPID").text());
            $("#" + selectLineID + " .lineProductDesc").text(lineProductDesc);
            // $("#" + selectLineID + " .lineOrdered").val(1);
            // $("#" + selectLineID + " .lineQty").val(1);
            $("#" + selectLineID + " .lineSalesPrice").text(lineUnitPrice);
            $("#" + selectLineID).attr("id", lineProductId);

            $("#productCheck-" + selectLineID).prop("checked", false);
            $("#productCheck-" + lineProductId).prop("checked", true);
            $(".addExtraProduct").removeClass("btn-primary").addClass("btn-success");

            $("#productListModal2").modal("toggle");
        }

        $("#tblInventory_filter .form-control-sm").val("");
        setTimeout(function() {
            //$('#tblCustomerlist_filter .form-control-sm').focus();
            $("#btnselProductFees").trigger("click");
            $(".fullScreenSpin").css("display", "none");
        }, 100);
    });

    $(document).on("click", ".appointmentCustomer #tblCustomerlist tbody tr", function(e) {
        //$("#updateID").val("");
        let checkIncludeAllProducts = templateObject.includeAllProducts.get();
        let getAllEmployeeData = templateObject.employeerecords.get() || "";
        let getEmployeeID = templateObject.empID.get() || "";
        document.getElementById("customer").value = $(this)
            .find(".colCompany")
            .text();
        document.getElementById("phone").value = $(this).find(".colPhone").text();
        document.getElementById("mobile").value = $(this)
            .find(".colMobile")
            .text()
            .replace("+", "");
        document.getElementById("state").value = $(this).find(".colState").text();
        document.getElementById("country").value = $(this)
            .find(".colCountry")
            .text();
        document.getElementById("address").value = $(this)
            .find(".colStreetAddress")
            .text()
            .replace(/(?:\r\n|\r|\n)/g, ", ");
        if (Session.get("CloudAppointmentNotes") == true) {
            document.getElementById("txtNotes").value = $(this)
                .find(".colNotes")
                .text();
            document.getElementById("txtNotes-1").value = $(this)
                .find(".colNotes")
                .text();
        }
        document.getElementById("suburb").value = $(this).find(".colCity").text();
        document.getElementById("zip").value = $(this).find(".colZipCode").text();
        if ($("#updateID").val() == "") {
            let appointmentService = new AppointmentService();
            appointmentService.getAllAppointmentListCount().then(function(data) {
                if (data.tappointmentex.length > 0) {
                    let max = 1;
                    for (let i = 0; i < data.tappointmentex.length; i++) {
                        if (data.tappointmentex[i].Id > max) {
                            max = data.tappointmentex[i].Id;
                        }
                    }
                    document.getElementById("appID").value = max + 1;
                } else {
                    document.getElementById("appID").value = 1;
                }
            });
            if (getEmployeeID != "") {
                var filterEmpData = getAllEmployeeData.filter((empdData) => {
                    return empdData.id == getEmployeeID;
                });
                if (filterEmpData) {
                    if (filterEmpData[0].custFld8 == "false") {
                        templateObject.getAllSelectedProducts(getEmployeeID);
                    } else {
                        templateObject.getAllProductData();
                    }
                } else {
                    templateObject.getAllProductData();
                }
            }
            // if(checkIncludeAllProducts ==  true){
            // templateObject.getAllProductData();
            // }else{
            //   if(getEmployeeID != ''){
            //     templateObject.getAllSelectedProducts(getEmployeeID);
            //   }else{
            //     templateObject.getAllProductData();
            //   }
            //
            // }

            //templateObject.getAllProductData();
        }
        $("#customerListModal").modal("hide");
        $("#event-modal").modal();
        setTimeout(() => {
            if (localStorage.getItem("smsCustomerAppt") == "false") {
                $("#chkSMSCustomer").prop("checked", false);
            }
            if (localStorage.getItem("smsUserAppt") == "false") {
                $("#chkSMSUser").prop("checked", false);
            }
            if (localStorage.getItem("emailCustomerAppt") == "false") {
                $("#customerEmail").prop("checked", false);
            }
            if (localStorage.getItem("emailUserAppt") == "false") {
                $("#userEmail").prop("checked", false);
            }
        }, 100);
    });

    getHours = function(start, end) {
        var hour = 0;
        hour = parseInt(start.split(":")[0]) - parseInt(end.split(":")[0]);
        var min = parseInt(start.split(":")[1]) + parseInt(end.split(":")[1]);
        var checkmin = parseInt(start.split(":")[1]) - parseInt(end.split(":")[1]);
        if (parseInt(start.split(":")[1]) > parseInt(end.split(":")[1])) {
            checkmin = parseInt(start.split(":")[1]) - parseInt(end.split(":")[1]);
        } else if (parseInt(end.split(":")[1]) > parseInt(start.split(":")[1])) {
            checkmin = parseInt(end.split(":")[1]) - parseInt(start.split(":")[1]);
        }

        if (checkmin == 0) {
            hour += 1;
        } else if (checkmin > 0) {
            hour += 1;
        } else if (min == 60) {
            hour += 1;
        }
        return hour;
    };
});

Template.frmappointmentpop.helpers({
    addNotes: () => {
        return Session.get("CloudAppointmentNotes") || false;
    },
    addAttachment: () => {
        return Session.get("CloudAppointmentAddAttachment") || false;
    },
    accessStartStopOnly: () => {
        return Session.get("CloudAppointmentStartStopAccessLevel") || false;
    },
});

Template.frmappointmentpop.events({
    "submit #frmAppointment": async function(event) {
        $(".fullScreenSpin").css("display", "inline-block");
        event.preventDefault();

        $("#btnselProductFees").trigger("click");

        var frmAppointment = $("#frmAppointment")[0];
        templateObject = Template.instance();
        let appointmentService = new AppointmentService();
        let contactService = new ContactService();
        var appointmentData = templateObject.appointmentrecords.get();
        let updateID = $("#updateID").val() || 0;
        let paused = "";
        let result = [];

        var formData = new FormData(frmAppointment);
        let aStartDate = "";
        let aEndDate = "";
        let savedStartDate =
            $("#aStartDate").val() || moment().format("YYYY-MM-DD");
        let clientname = formData.get("customer") || "";
        // const itl = templateObject.itl.get();
        let clientmobile = $("#mobile").val() ? $("#mobile").val() : "0";
        // let clientmobile = formData.get('mobile') || '0';
        let contact = formData.get("phone") || "0";
        let startTime = $("#startTime").val() + ":00" || "";
        let endTime = $("#endTime").val() + ":00" || "";
        let aStartTime = $("#tActualStartTime").val() || "";
        let aEndTime = $("#tActualEndTime").val() || "";
        let state = formData.get("state") || "";
        let country = formData.get("country") || "";
        let street = formData.get("address") || "";
        let zip = formData.get("zip") || "";
        let suburb = formData.get("suburb") || "";
        var startdateGet = new Date($("#dtSODate").datepicker("getDate"));
        var endDateGet = new Date($("#dtSODate2").datepicker("getDate"));
        let startDate =
            startdateGet.getFullYear() +
            "-" +
            ("0" + (startdateGet.getMonth() + 1)).slice(-2) +
            "-" +
            ("0" + startdateGet.getDate()).slice(-2);
        let endDate =
            endDateGet.getFullYear() +
            "-" +
            ("0" + (endDateGet.getMonth() + 1)).slice(-2) +
            "-" +
            ("0" + endDateGet.getDate()).slice(-2);
        let employeeName = formData.get("employee_name").trim() || "";
        let id = formData.get("updateID") || "0";
        let notes = formData.get("txtNotes") || " ";
        // let selectedProduct = [];
        // let isAnySelected = $("input[name='appointment-products-checks']")
        //   .map(function () {
        //     return this.checked;
        //   })
        //   .toArray()
        //   .some((value) => value === true);
        // if (isAnySelected) {
        //   const selectedProducts = $(
        //     "input[name='appointment-products-checks']:checked"
        //   )
        //     .map(function () {
        //       return $(this).attr("id");
        //     })
        //     .toArray();
        //   if (selectedProducts.length !== 0) {
        //     selectedProduct.push($("#product-list").val());
        //     selectedProducts.map((item) => {
        //       selectedProduct.push(item.split("x")[1]);
        //     });
        //   }
        // } else {
        //   selectedProduct.push($("#product-list").val());
        // }
        let selectedProduct = $("#product-list").val() || "";
        let selectedExtraProduct = templateObject.productFees.get() || "";
        let hourlyRate = "";
        let status = "Not Converted";
        let uploadedItems = templateObject.uploadedFiles.get();
        $(".fullScreenSpin").css("display", "inline-block");
        if (aStartTime != "") {
            aStartDate = savedStartDate + " " + aStartTime;
        } else {
            aStartDate = "";
        }

        if (aEndTime != "") {
            aEndDate = moment().format("YYYY-MM-DD") + " " + aEndTime;
        } else {
            aEndDate = "";
        }
        // if (aStartTime != "" && aEndDate == "") {
        //     aEndDate = aStartDate;
        // }
        let obj = {};
        let date = new Date();
        if (updateID) {
            // result = appointmentData.filter((apmt) => {
            //     return apmt.id == $("#updateID").val();
            // });
            result = await appointmentService.getOneAppointmentdataEx(updateID);

            hourlyRate = result[0].rate;

            if (result[0].aStartTime == "" && $("#tActualStartTime").val() != "") {
                obj = {
                    type: "TAppointmentsTimeLog",
                    fields: {
                        appointID: updateID,
                        StartDatetime: aStartDate,
                        EndDatetime: "",
                        Description: "Job Started",
                    },
                };
            } else if (
                result[0].aStartTime != "" &&
                result[0].aEndTime == "" &&
                $("#tActualEndTime").val() != ""
            ) {
                let startTime1 =
                    date.getFullYear() +
                    "-" +
                    ("0" + (date.getMonth() + 1)).slice(-2) +
                    "-" +
                    ("0" + date.getDate()).slice(-2) +
                    " " +
                    ("0" + date.getHours()).slice(-2) +
                    ":" +
                    ("0" + date.getMinutes()).slice(-2);
                obj = {
                    type: "TAppointmentsTimeLog",
                    fields: {
                        appointID: updateID,
                        StartDatetime: aStartDate,
                        EndDatetime: aEndDate,
                        Description: "Job Completed",
                    },
                };
            } else if (result[0].aEndTime != "") {
                aEndDate = moment().format("YYYY-MM-DD") + " " + aEndTime;
            }
        } else {
            if (
                $("#tActualStartTime").val() != "" &&
                $("#tActualEndTime").val() != ""
            ) {
                obj = {
                    type: "TAppointmentsTimeLog",
                    fields: {
                        appointID: "",
                        StartDatetime: aStartDate,
                        EndDatetime: aEndDate,
                        Description: "Job Completed",
                    },
                };
            } else if ($("#tActualStartTime").val() != "") {
                obj = {
                    type: "TAppointmentsTimeLog",
                    fields: {
                        appointID: "",
                        StartDatetime: aStartDate,
                        EndDatetime: "",
                        Description: "Job Started",
                    },
                };
            }
        }

        let objectData = "";

        const messageSid = localStorage.getItem("smsId") || "";
        if (createAppointment == false) {
            if (id == "0") {
                $(".modal-backdrop").css("display", "none");
                $(".fullScreenSpin").css("display", "none");
                swal({
                    title: "Oops...",
                    text: "You don't have access to create a new Appointment",
                    type: "error",
                    showCancelButton: false,
                    confirmButtonText: "OK",
                }).then((result) => {
                    if (result.value) {} else if (result.dismiss === "cancel") {}
                });
                return false;
            } else {
                objectData = {
                    type: "TAppointmentEx",
                    fields: {
                        Id: parseInt(id),
                        ClientName: clientname,
                        Mobile: clientmobile,
                        Phone: contact,
                        StartTime: startDate + " " + startTime,
                        EndTime: endDate + " " + endTime,
                        FeedbackNotes: notes,
                        Street: street,
                        Suburb: suburb,
                        State: state,
                        Postcode: zip,
                        Country: country,
                        Actual_StartTime: aStartDate,
                        Actual_EndTime: aEndDate,
                        // TrainerName: employeeName,
                        Notes: notes,
                        ProductDesc: selectedProduct,
                        ExtraProducts: selectedExtraProduct,
                        Attachments: uploadedItems,
                        Status: status,
                        CUSTFLD12: messageSid || "",
                        CUSTFLD13: !!messageSid ? "Yes" : "No",

                        //   CustomerEmail: customerEmail,
                        //   UserEmail: userEmail
                    },
                };

                appointmentService
                    .saveAppointment(objectData)
                    .then(function(data) {
                        let id = data.fields.ID;
                        let toUpdateID = "";
                        let updateData = "";
                        if (Object.keys(obj).length > 0) {
                            obj.fields.appointID = id;
                            appointmentService
                                .saveTimeLog(obj)
                                .then(function(data1) {
                                    if (obj.fields.Description == "Job Completed") {
                                        let endTime1 =
                                            date.getFullYear() +
                                            "-" +
                                            ("0" + (date.getMonth() + 1)).slice(-2) +
                                            "-" +
                                            ("0" + date.getDate()).slice(-2) +
                                            " " +
                                            ("0" + date.getHours()).slice(-2) +
                                            ":" +
                                            ("0" + date.getMinutes()).slice(-2);
                                        if (result.length > 0) {
                                            if (
                                                Array.isArray(result[0].timelog) &&
                                                result[0].timelog != ""
                                            ) {
                                                toUpdateID =
                                                    result[0].timelog[result[0].timelog.length - 1].fields
                                                    .ID;
                                            } else if (result[0].timelog != "") {
                                                toUpdateID = result[0].timelog.fields.ID;
                                            }
                                        }

                                        if (toUpdateID != "") {
                                            updateData = {
                                                type: "TAppointmentsTimeLog",
                                                fields: {
                                                    ID: toUpdateID,
                                                    EndDatetime: endTime1,
                                                },
                                            };
                                        }

                                        if (Object.keys(updateData).length > 0) {
                                            appointmentService
                                                .saveTimeLog(updateData)
                                                .then(function(data) {
                                                    sideBarService
                                                        .getAllAppointmentList(initialDataLoad, 0)
                                                        .then(function(data) {
                                                            addVS1Data("TAppointment", JSON.stringify(data))
                                                                .then(function(datareturn) {
                                                                    let data = "";
                                                                    data = {
                                                                        type: "TTimeSheetEntry",
                                                                        fields: {
                                                                            // "EntryDate":"2020-10-12 12:39:14",
                                                                            TimeSheet: [{
                                                                                type: "TTimeSheet",
                                                                                fields: {
                                                                                    EmployeeName: employeeName || "",
                                                                                    // HourlyRate:50,
                                                                                    LabourCost: parseFloat(hourlyRate) || 1,
                                                                                    HourlyRate: parseFloat(hourlyRate) || 1,
                                                                                    ServiceName: selectedProduct || "",
                                                                                    Job: clientname || "",
                                                                                    InvoiceNotes: "completed",
                                                                                    Allowedit: true,
                                                                                    // ChargeRate: 100,
                                                                                    Hours: parseFloat(
                                                                                        $("#txtActualHoursSpent").val()
                                                                                    ) || 1,
                                                                                    // OverheadRate: 90,
                                                                                    Job: clientname || "",
                                                                                    StartTime: aStartDate,
                                                                                    EndTime: aEndDate,
                                                                                    // ServiceName: "Test"|| '',

                                                                                    TimeSheetClassName: "Default" || "",
                                                                                    Notes: notes || "",
                                                                                    // EntryDate: accountdesc|| ''
                                                                                },
                                                                            }, ],
                                                                            TypeName: "Payroll",
                                                                            WhoEntered: Session.get("mySessionEmployee") || "",
                                                                        },
                                                                    };
                                                                    contactService
                                                                        .saveTimeSheet(data)
                                                                        .then(function(dataObj) {
                                                                            sideBarService
                                                                                .getAllTimeSheetList()
                                                                                .then(function(data) {
                                                                                    addVS1Data(
                                                                                        "TTimeSheet",
                                                                                        JSON.stringify(data)
                                                                                    );
                                                                                    setTimeout(function() {
                                                                                        window.open(
                                                                                            "/appointments",
                                                                                            "_self"
                                                                                        );
                                                                                    }, 500);
                                                                                });
                                                                        })
                                                                        .catch(function(err) {
                                                                            if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                                window.open(localStorage.getItem("appt_historypage"), "_self");
                                                                            } else {
                                                                                window.open("/appointments", "_self");
                                                                            }
                                                                        });
                                                                })
                                                                .catch(function(err) {
                                                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                                                    } else {
                                                                        window.open("/appointments", "_self");
                                                                    }
                                                                });
                                                        })
                                                        .catch(function(err) {
                                                            if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                window.open(localStorage.getItem("appt_historypage"), "_self");
                                                            } else {
                                                                window.open("/appointments", "_self");
                                                            }
                                                        });
                                                })
                                                .catch(function(err) {
                                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                                    } else {
                                                        window.open("/appointments", "_self");
                                                    }
                                                });
                                        } else {
                                            sideBarService
                                                .getAllAppointmentList(initialDataLoad, 0)
                                                .then(function(data) {
                                                    addVS1Data("TAppointment", JSON.stringify(data))
                                                        .then(function(datareturn) {
                                                            let data = "";
                                                            data = {
                                                                type: "TTimeSheetEntry",
                                                                fields: {
                                                                    // "EntryDate":"2020-10-12 12:39:14",
                                                                    TimeSheet: [{
                                                                        type: "TTimeSheet",
                                                                        fields: {
                                                                            EmployeeName: employeeName || "",
                                                                            // HourlyRate:50,
                                                                            LabourCost: parseFloat(hourlyRate) || 1,
                                                                            HourlyRate: parseFloat(hourlyRate) || 1,
                                                                            ServiceName: selectedProduct || "",
                                                                            Job: clientname || "",
                                                                            Allowedit: true,
                                                                            InvoiceNotes: "completed",
                                                                            // ChargeRate: 100,
                                                                            Hours: parseFloat(
                                                                                $("#txtActualHoursSpent").val()
                                                                            ) || 1,
                                                                            // OverheadRate: 90,
                                                                            Job: clientname || "",
                                                                            StartTime: aStartDate,
                                                                            EndTime: aEndDate,
                                                                            // ServiceName: "Test"|| '',
                                                                            TimeSheetClassName: "Default" || "",
                                                                            Notes: notes || "",
                                                                            // EntryDate: accountdesc|| ''
                                                                        },
                                                                    }, ],
                                                                    TypeName: "Payroll",
                                                                    WhoEntered: Session.get("mySessionEmployee") || "",
                                                                },
                                                            };
                                                            contactService
                                                                .saveTimeSheet(data)
                                                                .then(function(dataObj) {
                                                                    sideBarService
                                                                        .getAllTimeSheetList()
                                                                        .then(function(data) {
                                                                            addVS1Data(
                                                                                "TTimeSheet",
                                                                                JSON.stringify(data)
                                                                            );
                                                                            setTimeout(function() {
                                                                                if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                                    window.open(localStorage.getItem("appt_historypage"), "_self");
                                                                                } else {
                                                                                    window.open("/appointments", "_self");
                                                                                }
                                                                            }, 500);
                                                                        });
                                                                })
                                                                .catch(function(err) {
                                                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                                                    } else {
                                                                        window.open("/appointments", "_self");
                                                                    }
                                                                });
                                                        })
                                                        .catch(function(err) {
                                                            if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                window.open(localStorage.getItem("appt_historypage"), "_self");
                                                            } else {
                                                                window.open("/appointments", "_self");
                                                            }
                                                        });
                                                })
                                                .catch(function(err) {
                                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                                    } else {
                                                        window.open("/appointments", "_self");
                                                    }
                                                });
                                        }
                                    } else {
                                        sideBarService
                                            .getAllAppointmentList(initialDataLoad, 0)
                                            .then(function(data) {
                                                addVS1Data("TAppointment", JSON.stringify(data))
                                                    .then(function(datareturn) {
                                                        setTimeout(function() {
                                                            if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                window.open(localStorage.getItem("appt_historypage"), "_self");
                                                            } else {
                                                                window.open("/appointments", "_self");
                                                            }
                                                        }, 500);
                                                    })
                                                    .catch(function(err) {
                                                        if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                            window.open(localStorage.getItem("appt_historypage"), "_self");
                                                        } else {
                                                            window.open("/appointments", "_self");
                                                        }
                                                    });
                                            })
                                            .catch(function(err) {
                                                if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                    window.open(localStorage.getItem("appt_historypage"), "_self");
                                                } else {
                                                    window.open("/appointments", "_self");
                                                }
                                            });
                                    }
                                })
                                .catch(function(err) {
                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                    } else {
                                        window.open("/appointments", "_self");
                                    }
                                });
                        } else {
                            //return false;
                            sideBarService
                                .getAllAppointmentList(initialDataLoad, 0)
                                .then(function(data) {
                                    addVS1Data("TAppointment", JSON.stringify(data))
                                        .then(function(datareturn) {
                                            setTimeout(function() {
                                                if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                    window.open(localStorage.getItem("appt_historypage"), "_self");
                                                } else {
                                                    window.open("/appointments", "_self");
                                                }
                                            }, 500);
                                        })
                                        .catch(function(err) {
                                            if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                window.open(localStorage.getItem("appt_historypage"), "_self");
                                            } else {
                                                window.open("/appointments", "_self");
                                            }
                                        });
                                })
                                .catch(function(err) {
                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                    } else {
                                        window.open("/appointments", "_self");
                                    }
                                });
                        }
                    })
                    .catch(function(err) {
                        $(".fullScreenSpin").css("display", "none");
                        swal({
                            title: "Oops...",
                            text: err,
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        });
                    });
            }
        } else {
            if (id == "0") {
                objectData = {
                    type: "TAppointmentEx",
                    fields: {
                        ClientName: clientname,
                        Mobile: clientmobile,
                        Phone: contact,
                        StartTime: startDate + " " + startTime,
                        EndTime: endDate + " " + endTime,
                        Street: street,
                        Suburb: suburb,
                        State: state,
                        Postcode: zip,
                        Country: country,
                        Actual_StartTime: aStartDate,
                        Actual_EndTime: aEndDate,
                        TrainerName: employeeName,
                        Notes: notes,
                        ProductDesc: selectedProduct,
                        ExtraProducts: selectedExtraProduct,
                        Attachments: uploadedItems,
                        Status: status,
                        CUSTFLD12: messageSid || "",
                        CUSTFLD13: !!messageSid ? "Yes" : "No",
                    },
                };
            } else {
                objectData = {
                    type: "TAppointmentEx",
                    fields: {
                        Id: parseInt(id),
                        ClientName: clientname,
                        Mobile: clientmobile,
                        Phone: contact,
                        StartTime: startDate + " " + startTime,
                        EndTime: endDate + " " + endTime,
                        FeedbackNotes: notes,
                        Street: street,
                        Suburb: suburb,
                        State: state,
                        Postcode: zip,
                        Country: country,
                        Actual_StartTime: aStartDate,
                        Actual_EndTime: aEndDate,
                        TrainerName: employeeName,
                        Notes: notes,
                        ProductDesc: selectedProduct,
                        ExtraProducts: selectedExtraProduct,
                        Attachments: uploadedItems,
                        Status: status,
                        CUSTFLD12: messageSid || "",
                        CUSTFLD13: !!messageSid ? "Yes" : "No",
                    },
                };
            }

            let url = new URL(window.location.href);
            let logid = url.searchParams.get("logid");

            if (logid != null && logid > 0) {
                obj = {
                    type: "TAppointmentsTimeLog",
                    fields: {
                        appointID: updateID,
                        ID: logid,
                        StartDatetime: aStartDate,
                        EndDatetime: aEndDate
                    },
                };

                if (
                    $("#tActualStartTime").val() != "" &&
                    $("#tActualEndTime").val() != ""
                ) {
                    obj.fields.Description = "Job Completed";
                } else {
                    obj.fields.Description = "Job Started";
                }

                appointmentService
                    .saveTimeLog(obj)
                    .then(function(data) {
                        sideBarService
                            .getAllAppointmentList(initialDataLoad, 0)
                            .then(function(data) {
                                addVS1Data("TAppointment", JSON.stringify(data))
                                    .then(function(datareturn) {
                                        if (obj.fields.Description == "Job Completed") {
                                            let data = "";
                                            data = {
                                                type: "TTimeSheetEntry",
                                                fields: {
                                                    // "EntryDate":"2020-10-12 12:39:14",
                                                    TimeSheet: [{
                                                        type: "TTimeSheet",
                                                        fields: {
                                                            EmployeeName: employeeName || "",
                                                            // HourlyRate:50,
                                                            LabourCost: parseFloat(hourlyRate) || 1,
                                                            HourlyRate: parseFloat(hourlyRate) || 1,
                                                            ServiceName: selectedProduct || "",
                                                            Job: clientname || "",
                                                            InvoiceNotes: "completed",
                                                            Allowedit: true,
                                                            // ChargeRate: 100,
                                                            Hours: parseFloat(
                                                                $("#txtActualHoursSpent").val()
                                                            ) || 1,
                                                            // OverheadRate: 90,
                                                            Job: clientname || "",
                                                            StartTime: aStartDate,
                                                            EndTime: aEndDate,
                                                            // ServiceName: "Test"|| '',

                                                            TimeSheetClassName: "Default" || "",
                                                            Notes: notes || "",
                                                            // EntryDate: accountdesc|| ''
                                                        },
                                                    }, ],
                                                    TypeName: "Payroll",
                                                    WhoEntered: Session.get("mySessionEmployee") || "",
                                                },
                                            };
                                            contactService
                                                .saveTimeSheet(data)
                                                .then(function(dataObj) {
                                                    sideBarService
                                                        .getAllTimeSheetList()
                                                        .then(function(data) {
                                                            addVS1Data(
                                                                "TTimeSheet",
                                                                JSON.stringify(data)
                                                            );
                                                            setTimeout(function() {
                                                                if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                    window.open(localStorage.getItem("appt_historypage"), "_self");
                                                                } else {
                                                                    window.open("/appointments", "_self");
                                                                }
                                                            }, 500);
                                                        });
                                                })
                                                .catch(function(err) {
                                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                                    } else {
                                                        window.open("/appointments", "_self");
                                                    }
                                                });
                                        } else {
                                            if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                window.open(localStorage.getItem("appt_historypage"), "_self");
                                            } else {
                                                window.open("/appointments", "_self");
                                            }
                                        }
                                    })
                                    .catch(function(err) {
                                        if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                            window.open(localStorage.getItem("appt_historypage"), "_self");
                                        } else {
                                            window.open("/appointments", "_self");
                                        }
                                    });
                            })
                            .catch(function(err) {
                                if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                    window.open(localStorage.getItem("appt_historypage"), "_self");
                                } else {
                                    window.open("/appointments", "_self");
                                }
                            });
                    })
                    .catch(function(err) {
                        if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                            window.open(localStorage.getItem("appt_historypage"), "_self");
                        } else {
                            window.open("/appointments", "_self");
                        }
                    });
            } else {
                appointmentService
                    .saveAppointment(objectData)
                    .then(function(data) {
                        let id = data.fields.ID;
                        let toUpdateID = "";
                        let updateData = "";
                        if (Object.keys(obj).length > 0) {
                            obj.fields.appointID = id;
                            appointmentService
                                .saveTimeLog(obj)
                                .then(function(data1) {
                                    if (obj.fields.Description == "Job Completed") {
                                        let endTime1 =
                                            date.getFullYear() +
                                            "-" +
                                            ("0" + (date.getMonth() + 1)).slice(-2) +
                                            "-" +
                                            ("0" + date.getDate()).slice(-2) +
                                            " " +
                                            ("0" + date.getHours()).slice(-2) +
                                            ":" +
                                            ("0" + date.getMinutes()).slice(-2);
                                        if (result.length > 0) {
                                            if (
                                                Array.isArray(result[0].timelog) &&
                                                result[0].timelog != ""
                                            ) {
                                                toUpdateID =
                                                    result[0].timelog[result[0].timelog.length - 1].fields
                                                    .ID;
                                            } else if (result[0].timelog != "") {
                                                toUpdateID = result[0].timelog.fields.ID;
                                            }
                                        }

                                        if (toUpdateID != "") {
                                            updateData = {
                                                type: "TAppointmentsTimeLog",
                                                fields: {
                                                    ID: toUpdateID,
                                                    EndDatetime: endTime1,
                                                },
                                            };
                                        }

                                        if (Object.keys(updateData).length > 0) {
                                            appointmentService
                                                .saveTimeLog(updateData)
                                                .then(function(data) {
                                                    sideBarService
                                                        .getAllAppointmentList(initialDataLoad, 0)
                                                        .then(function(data) {
                                                            addVS1Data("TAppointment", JSON.stringify(data))
                                                                .then(function(datareturn) {
                                                                    let data = "";
                                                                    data = {
                                                                        type: "TTimeSheetEntry",
                                                                        fields: {
                                                                            // "EntryDate":"2020-10-12 12:39:14",
                                                                            TimeSheet: [{
                                                                                type: "TTimeSheet",
                                                                                fields: {
                                                                                    EmployeeName: employeeName || "",
                                                                                    // HourlyRate:50,
                                                                                    LabourCost: parseFloat(hourlyRate) || 1,
                                                                                    HourlyRate: parseFloat(hourlyRate) || 1,
                                                                                    ServiceName: selectedProduct || "",
                                                                                    Job: clientname || "",
                                                                                    InvoiceNotes: "completed",
                                                                                    Allowedit: true,
                                                                                    // ChargeRate: 100,
                                                                                    Hours: parseFloat(
                                                                                        $("#txtActualHoursSpent").val()
                                                                                    ) || 1,
                                                                                    // OverheadRate: 90,
                                                                                    Job: clientname || "",
                                                                                    StartTime: aStartDate,
                                                                                    EndTime: aEndDate,
                                                                                    // ServiceName: "Test"|| '',

                                                                                    TimeSheetClassName: "Default" || "",
                                                                                    Notes: notes || "",
                                                                                    // EntryDate: accountdesc|| ''
                                                                                },
                                                                            }, ],
                                                                            TypeName: "Payroll",
                                                                            WhoEntered: Session.get("mySessionEmployee") || "",
                                                                        },
                                                                    };
                                                                    contactService
                                                                        .saveTimeSheet(data)
                                                                        .then(function(dataObj) {
                                                                            sideBarService
                                                                                .getAllTimeSheetList()
                                                                                .then(function(data) {
                                                                                    addVS1Data(
                                                                                        "TTimeSheet",
                                                                                        JSON.stringify(data)
                                                                                    );
                                                                                    setTimeout(function() {
                                                                                        if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                                            window.open(localStorage.getItem("appt_historypage"), "_self");
                                                                                        } else {
                                                                                            window.open("/appointments", "_self");
                                                                                        }
                                                                                    }, 500);
                                                                                });
                                                                        })
                                                                        .catch(function(err) {
                                                                            if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                                window.open(localStorage.getItem("appt_historypage"), "_self");
                                                                            } else {
                                                                                window.open("/appointments", "_self");
                                                                            }
                                                                        });
                                                                })
                                                                .catch(function(err) {
                                                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                                                    } else {
                                                                        window.open("/appointments", "_self");
                                                                    }
                                                                });
                                                        })
                                                        .catch(function(err) {
                                                            if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                window.open(localStorage.getItem("appt_historypage"), "_self");
                                                            } else {
                                                                window.open("/appointments", "_self");
                                                            }
                                                        });
                                                })
                                                .catch(function(err) {
                                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                                    } else {
                                                        window.open("/appointments", "_self");
                                                    }
                                                });
                                        } else {
                                            sideBarService
                                                .getAllAppointmentList(initialDataLoad, 0)
                                                .then(function(data) {
                                                    addVS1Data("TAppointment", JSON.stringify(data))
                                                        .then(function(datareturn) {
                                                            let data = "";
                                                            data = {
                                                                type: "TTimeSheetEntry",
                                                                fields: {
                                                                    // "EntryDate":"2020-10-12 12:39:14",
                                                                    TimeSheet: [{
                                                                        type: "TTimeSheet",
                                                                        fields: {
                                                                            EmployeeName: employeeName || "",
                                                                            // HourlyRate:50,
                                                                            LabourCost: parseFloat(hourlyRate) || 1,
                                                                            HourlyRate: parseFloat(hourlyRate) || 1,
                                                                            ServiceName: selectedProduct || "",
                                                                            Job: clientname || "",
                                                                            Allowedit: true,
                                                                            InvoiceNotes: "completed",
                                                                            // ChargeRate: 100,
                                                                            Hours: parseFloat(
                                                                                $("#txtActualHoursSpent").val()
                                                                            ) || 1,
                                                                            // OverheadRate: 90,
                                                                            Job: clientname || "",
                                                                            StartTime: aStartDate,
                                                                            EndTime: aEndDate,
                                                                            // ServiceName: "Test"|| '',
                                                                            TimeSheetClassName: "Default" || "",
                                                                            Notes: notes || "",
                                                                            // EntryDate: accountdesc|| ''
                                                                        },
                                                                    }, ],
                                                                    TypeName: "Payroll",
                                                                    WhoEntered: Session.get("mySessionEmployee") || "",
                                                                },
                                                            };
                                                            contactService
                                                                .saveTimeSheet(data)
                                                                .then(function(dataObj) {
                                                                    sideBarService
                                                                        .getAllTimeSheetList()
                                                                        .then(function(data) {
                                                                            addVS1Data(
                                                                                "TTimeSheet",
                                                                                JSON.stringify(data)
                                                                            );
                                                                            setTimeout(function() {
                                                                                if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                                    window.open(localStorage.getItem("appt_historypage"), "_self");
                                                                                } else {
                                                                                    window.open("/appointments", "_self");
                                                                                }
                                                                            }, 500);
                                                                        });
                                                                })
                                                                .catch(function(err) {
                                                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                                                    } else {
                                                                        window.open("/appointments", "_self");
                                                                    }
                                                                });
                                                        })
                                                        .catch(function(err) {
                                                            if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                window.open(localStorage.getItem("appt_historypage"), "_self");
                                                            } else {
                                                                window.open("/appointments", "_self");
                                                            }
                                                        });
                                                })
                                                .catch(function(err) {
                                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                                    } else {
                                                        window.open("/appointments", "_self");
                                                    }
                                                });
                                        }
                                    } else {
                                        sideBarService
                                            .getAllAppointmentList(initialDataLoad, 0)
                                            .then(function(data) {
                                                addVS1Data("TAppointment", JSON.stringify(data))
                                                    .then(function(datareturn) {
                                                        setTimeout(function() {
                                                            if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                                window.open(localStorage.getItem("appt_historypage"), "_self");
                                                            } else {
                                                                window.open("/appointments", "_self");
                                                            }
                                                        }, 500);
                                                    })
                                                    .catch(function(err) {
                                                        if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                            window.open(localStorage.getItem("appt_historypage"), "_self");
                                                        } else {
                                                            window.open("/appointments", "_self");
                                                        }
                                                    });
                                            })
                                            .catch(function(err) {
                                                if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                    window.open(localStorage.getItem("appt_historypage"), "_self");
                                                } else {
                                                    window.open("/appointments", "_self");
                                                }
                                            });
                                    }
                                })
                                .catch(function(err) {
                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                    } else {
                                        window.open("/appointments", "_self");
                                    }
                                });
                        } else {
                            //return false;
                            sideBarService
                                .getAllAppointmentList(initialDataLoad, 0)
                                .then(function(data) {
                                    // addVS1Data('TAppointmentList', JSON.stringify(data));
                                    addVS1Data("TAppointment", JSON.stringify(data))
                                        .then(function(datareturn) {
                                            setTimeout(function() {
                                                if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                    window.open(localStorage.getItem("appt_historypage"), "_self");
                                                } else {
                                                    window.open("/appointments", "_self");
                                                }
                                            }, 500);
                                        })
                                        .catch(function(err) {
                                            if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                                window.open(localStorage.getItem("appt_historypage"), "_self");
                                            } else {
                                                window.open("/appointments", "_self");
                                            }
                                        });
                                })
                                .catch(function(err) {
                                    if (localStorage.getItem("appt_historypage") != undefined && localStorage.getItem("appt_historypage") != "") {
                                        window.open(localStorage.getItem("appt_historypage"), "_self");
                                    } else {
                                        window.open("/appointments", "_self");
                                    }
                                });
                        }
                    })
                    .catch(function(err) {
                        $(".fullScreenSpin").css("display", "none");
                        swal({
                            title: "Oops...",
                            text: err,
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        });
                    });
            }
        }
    },
    'click #btnselProductFees': function(event) {
        templateObject = Template.instance();

        const productFees = "";
        const productCards = $(".chkServiceCard");
        Array.prototype.forEach.call(productCards, (product) => {
            if ($(product).prop('checked') == true) {
                let productFeesID = $(product).attr('id').split("-")[1];
                if (productFees == "") {
                    productFees = productFeesID;
                } else {
                    productFees += ":" + productFeesID;
                }
            }
        });

        if (productFees != "") {
            $(".addExtraProduct").removeClass("btn-primary").addClass("btn-success");
        } else {
            $(".addExtraProduct").removeClass("btn-success").addClass("btn-primary");
        }

        templateObject.productFees.set(productFees);
    },
    "click .btnRemove": function(event) {
        var targetID = $(event.target).closest("tr").attr("id");
        // if ($("#tblExtraProducts tbody>tr").length > 1) {
        $(event.target).closest("tr").remove();
        $("#productCheck-" + targetID).prop("checked", false);
        event.preventDefault();
        // }
        setTimeout(function() {
            $("#btnselProductFees").trigger("click");
        }, 100);
    },
    "click #addRow": (e, ui) => {
        let tokenid = Random.id();
        // $(".lineProductName", rowData).val("");
        var rowData = `<tr class="dnd-moved" id="${tokenid}">
          <td class="thProductName">
              <input class="es-input highlightSelect lineProductName" type="search">
          </td>
          <td class="lineProductDesc colDescription"></td>
          <td class="thCostPrice hiddenColumn" style="text-align: left!important;"></td>
          <td class="thSalesPrice lineSalesPrice" style="text-align: left!important;"></td>
          <td class="thQty hiddenColumn">Quantity</td>
          <td class="thTax hiddenColumn" style="text-align: left!important;">Tax Rate</td>
          <td>
              <span class="table-remove btnRemove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 "><i
              class="fa fa-remove"></i></button></span>
          </td>
          <td class="thExtraSellPrice hiddenColumn">Prouct ID</td>
      </tr>`;

        // rowData.attr("id", tokenid);
        $("#tblExtraProducts tbody").append(rowData);
        setTimeout(function() {
            $("#" + tokenid + " .lineProductName").trigger("click");
        }, 200);
    },
    "click .lineProductName, keydown .lineProductName": function(event) {
        var $earch = $(event.currentTarget);
        var offset = $earch.offset();
        // $("#selectProductID").val("");
        var productDataName = $(event.target).val() || "";
        if (event.pageX > offset.left + $earch.width() - 10) {
            // X button 16px wide?
            $("#productListModal2").modal("toggle");
            var targetID = $(event.target).closest("tr").attr("id");
            $("#selectLineID").val(targetID);
            setTimeout(function() {
                $("#tblInventory_filter .form-control-sm").focus();
                $("#tblInventory_filter .form-control-sm").val("");
                $("#tblInventory_filter .form-control-sm").trigger("input");

                var datatable = $("#tblInventory").DataTable();
                datatable.draw();
                $("#tblInventory_filter .form-control-sm").trigger("input");
            }, 500);
        } else {
            if (productDataName.replace(/\s/g, "") != "") {
                var itemId = $(event.target).attr("itemid");
                window.open("/productview?id=" + itemId, "_self");
            } else {
                $("#productListModal2").modal("toggle");
                var targetID = $(event.target).closest("tr").attr("id");
                $("#selectLineID").val(targetID);
            }
        }
    },
});

Template.registerHelper("equals", function(a, b) {
    return a === b;
});

openAppointModalDirectly = (leadid, templateObject, auto = false) => {
    let contactService = new ContactService();
    $("#frmAppointment")[0].reset();
    // templateObject.getAllProductData();
    $(".paused").hide();
    if (FlowRouter.current().queryParams.leadid) {
        contactService.getOneLeadDataEx(leadid).then(function(data) {
            // return;
            //$("#updateID").val("");
            let checkIncludeAllProducts = templateObject.includeAllProducts.get();
            let getAllEmployeeData = templateObject.employeerecords.get() || "";
            let getEmployeeID = templateObject.empID.get() || "";
            document.getElementById("employee_name").value =
                Session.get("mySessionEmployee");
            document.getElementById("customer").value = data.fields.ClientName;
            document.getElementById("phone").value = data.fields.Phone;
            document.getElementById("mobile").value = data.fields.Mobile;
            document.getElementById("state").value = data.fields.State;
            document.getElementById("country").value = data.fields.Country;
            document.getElementById("address").value = data.fields.Street.replace(
                /(?:\r\n|\r|\n)/g,
                ", "
            );
            if (Session.get("CloudAppointmentNotes") == true) {
                document.getElementById("txtNotes").value = data.fields.Notes;
                document.getElementById("txtNotes-1").value = data.fields.Notes;
            }
            document.getElementById("suburb").value = data.fields.Suburb;
            document.getElementById("zip").value = data.fields.Postcode;
            if (auto == true) {
                let dateStart = getRegalTime();
                let dateEnd = new Date(dateStart.getTime() + 2 * 3600 * 1000);
                let startTime =
                    ("0" + dateStart.getHours()).toString().slice(-2) +
                    ":" +
                    ("0" + dateStart.getMinutes()).toString().slice(-2);
                let endTime =
                    ("0" + dateEnd.getHours()).toString().slice(-2) +
                    ":" +
                    ("0" + dateStart.getMinutes()).toString().slice(-2);
                document.getElementById("startTime").value = startTime;
                document.getElementById("endTime").value = endTime;
            }
            if ($("#updateID").val() == "") {
                let appointmentService = new AppointmentService();
                appointmentService
                    .getAllAppointmentListCount()
                    .then(function(dataObj) {
                        if (dataObj.tappointmentex.length > 0) {
                            let max = 1;
                            for (let i = 0; i < dataObj.tappointmentex.length; i++) {
                                if (dataObj.tappointmentex[i].Id > max) {
                                    max = dataObj.tappointmentex[i].Id;
                                }
                            }
                            document.getElementById("appID").value = max + 1;
                        } else {
                            document.getElementById("appID").value = 1;
                        }
                    });
                if (getEmployeeID != "") {
                    var filterEmpData = getAllEmployeeData.filter((empdData) => {
                        return empdData.id == getEmployeeID;
                    });
                    if (filterEmpData) {
                        if (filterEmpData[0].custFld8 == "false") {
                            templateObject.getAllSelectedProducts(getEmployeeID);
                        } else {
                            templateObject.getAllProductData();
                        }
                    } else {
                        templateObject.getAllProductData();
                    }
                }
                // if(checkIncludeAllProducts ==  true){
                // templateObject.getAllProductData();
                // }else{
                //   if(getEmployeeID != ''){
                //     templateObject.getAllSelectedProducts(getEmployeeID);
                //   }else{
                //     templateObject.getAllProductData();
                //   }
                //
                // }

                //templateObject.getAllProductData();
            }
            $("#customerListModal").modal("hide");
            $("#event-modal").modal();
            setTimeout(() => {
                if (localStorage.getItem("smsCustomerAppt") == "false") {
                    $("#chkSMSCustomer").prop("checked", false);
                }
                if (localStorage.getItem("smsUserAppt") == "false") {
                    $("#chkSMSUser").prop("checked", false);
                }
                if (localStorage.getItem("emailCustomerAppt") == "false") {
                    $("#customerEmail").prop("checked", false);
                }
                if (localStorage.getItem("emailUserAppt") == "false") {
                    $("#userEmail").prop("checked", false);
                }
            }, 100);
        });
    } else if (FlowRouter.current().queryParams.customerid) {
        contactService.getOneCustomerDataEx(leadid).then((data) => {
            let checkIncludeAllProducts = templateObject.includeAllProducts.get();
            let getAllEmployeeData = templateObject.employeerecords.get() || "";
            let getEmployeeID = templateObject.empID.get() || "";
            document.getElementById("employee_name").value =
                Session.get("mySessionEmployee");
            document.getElementById("customer").value = data.fields.ClientName;
            document.getElementById("phone").value = data.fields.Phone;
            document.getElementById("mobile").value = data.fields.Mobile;
            document.getElementById("state").value = data.fields.State;
            document.getElementById("country").value = data.fields.Country;
            document.getElementById("address").value = data.fields.Street.replace(
                /(?:\r\n|\r|\n)/g,
                ", "
            );
            if (Session.get("CloudAppointmentNotes") == true) {
                document.getElementById("txtNotes").value = data.fields.Notes;
                document.getElementById("txtNotes-1").value = data.fields.Notes;
            }
            document.getElementById("suburb").value = data.fields.Suburb;
            document.getElementById("zip").value = data.fields.Postcode;
            if (auto == true) {
                let dateStart = getRegalTime();
                let dateEnd = new Date(dateStart.getTime() + 2 * 3600 * 1000);
                let startTime =
                    ("0" + dateStart.getHours()).toString().slice(-2) +
                    ":" +
                    ("0" + dateStart.getMinutes()).toString().slice(-2);
                let endTime =
                    ("0" + dateEnd.getHours()).toString().slice(-2) +
                    ":" +
                    ("0" + dateStart.getMinutes()).toString().slice(-2);
                document.getElementById("startTime").value = startTime;
                document.getElementById("endTime").value = endTime;
            }
            if ($("#updateID").val() == "") {
                let appointmentService = new AppointmentService();
                appointmentService
                    .getAllAppointmentListCount()
                    .then(function(dataObj) {
                        if (dataObj.tappointmentex.length > 0) {
                            let max = 1;
                            for (let i = 0; i < dataObj.tappointmentex.length; i++) {
                                if (dataObj.tappointmentex[i].Id > max) {
                                    max = dataObj.tappointmentex[i].Id;
                                }
                            }
                            document.getElementById("appID").value = max + 1;
                        } else {
                            document.getElementById("appID").value = 1;
                        }
                    });
                if (getEmployeeID != "") {
                    var filterEmpData = getAllEmployeeData.filter((empdData) => {
                        return empdData.id == getEmployeeID;
                    });
                    if (filterEmpData) {
                        if (filterEmpData[0].custFld8 == "false") {
                            templateObject.getAllSelectedProducts(getEmployeeID);
                        } else {
                            templateObject.getAllProductData();
                        }
                    } else {
                        templateObject.getAllProductData();
                    }
                }
                // if(checkIncludeAllProducts ==  true){
                // templateObject.getAllProductData();
                // }else{
                //   if(getEmployeeID != ''){
                //     templateObject.getAllSelectedProducts(getEmployeeID);
                //   }else{
                //     templateObject.getAllProductData();
                //   }
                //
                // }

                //templateObject.getAllProductData();
            }
            $("#customerListModal").modal("hide");
            $("#event-modal").modal();
            setTimeout(() => {
                if (localStorage.getItem("smsCustomerAppt") == "false") {
                    $("#chkSMSCustomer").prop("checked", false);
                }
                if (localStorage.getItem("smsUserAppt") == "false") {
                    $("#chkSMSUser").prop("checked", false);
                }
                if (localStorage.getItem("emailCustomerAppt") == "false") {
                    $("#customerEmail").prop("checked", false);
                }
                if (localStorage.getItem("emailUserAppt") == "false") {
                    $("#userEmail").prop("checked", false);
                }
            }, 100);
        });
    } else if (FlowRouter.current().queryParams.supplierid) {
        contactService.getOneSupplierDataEx(leadid).then((data) => {
            let checkIncludeAllProducts = templateObject.includeAllProducts.get();
            let getAllEmployeeData = templateObject.employeerecords.get() || "";
            let getEmployeeID = templateObject.empID.get() || "";
            document.getElementById("employee_name").value =
                Session.get("mySessionEmployee");
            document.getElementById("customer").value = data.fields.ClientName;
            document.getElementById("phone").value = data.fields.Phone;
            document.getElementById("mobile").value = data.fields.Mobile;
            document.getElementById("state").value = data.fields.State;
            document.getElementById("country").value = data.fields.Country;
            document.getElementById("address").value = data.fields.Street.replace(
                /(?:\r\n|\r|\n)/g,
                ", "
            );
            if (Session.get("CloudAppointmentNotes") == true) {
                document.getElementById("txtNotes").value = data.fields.Notes;
                document.getElementById("txtNotes-1").value = data.fields.Notes;
            }
            document.getElementById("suburb").value = data.fields.Suburb;
            document.getElementById("zip").value = data.fields.Postcode;
            if (auto == true) {
                let dateStart = getRegalTime();
                let dateEnd = new Date(dateStart.getTime() + 2 * 3600 * 1000);
                let startTime =
                    ("0" + dateStart.getHours()).toString().slice(-2) +
                    ":" +
                    ("0" + dateStart.getMinutes()).toString().slice(-2);
                let endTime =
                    ("0" + dateEnd.getHours()).toString().slice(-2) +
                    ":" +
                    ("0" + dateStart.getMinutes()).toString().slice(-2);
                document.getElementById("startTime").value = startTime;
                document.getElementById("endTime").value = endTime;
            }
            if ($("#updateID").val() == "") {
                let appointmentService = new AppointmentService();
                appointmentService
                    .getAllAppointmentListCount()
                    .then(function(dataObj) {
                        if (dataObj.tappointmentex.length > 0) {
                            let max = 1;
                            for (let i = 0; i < dataObj.tappointmentex.length; i++) {
                                if (dataObj.tappointmentex[i].Id > max) {
                                    max = dataObj.tappointmentex[i].Id;
                                }
                            }
                            document.getElementById("appID").value = max + 1;
                        } else {
                            document.getElementById("appID").value = 1;
                        }
                    });
                if (getEmployeeID != "") {
                    var filterEmpData = getAllEmployeeData.filter((empdData) => {
                        return empdData.id == getEmployeeID;
                    });
                    if (filterEmpData) {
                        if (filterEmpData[0].custFld8 == "false") {
                            templateObject.getAllSelectedProducts(getEmployeeID);
                        } else {
                            templateObject.getAllProductData();
                        }
                    } else {
                        templateObject.getAllProductData();
                    }
                }
                // if(checkIncludeAllProducts ==  true){
                // templateObject.getAllProductData();
                // }else{
                //   if(getEmployeeID != ''){
                //     templateObject.getAllSelectedProducts(getEmployeeID);
                //   }else{
                //     templateObject.getAllProductData();
                //   }
                //
                // }

                //templateObject.getAllProductData();
            }
            $("#customerListModal").modal("hide");
            $("#event-modal").modal();
            setTimeout(() => {
                if (localStorage.getItem("smsCustomerAppt") == "false") {
                    $("#chkSMSCustomer").prop("checked", false);
                }
                if (localStorage.getItem("smsUserAppt") == "false") {
                    $("#chkSMSUser").prop("checked", false);
                }
                if (localStorage.getItem("emailCustomerAppt") == "false") {
                    $("#customerEmail").prop("checked", false);
                }
                if (localStorage.getItem("emailUserAppt") == "false") {
                    $("#userEmail").prop("checked", false);
                }
            }, 100);
        });
    }
};