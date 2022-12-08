import {VS1ChartService} from "../vs1charts-service";
import 'jQuery.print/jQuery.print.js';
import {UtilityService} from "../../utility-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../../js/core-service';
import { AccountService } from "../../accounts/account-service";
import { SideBarService } from "../../js/sidebar-service";
import { OrganisationService } from "../../js/organisation-service";
import { ProductService } from "../../product/product-service";
import "../../lib/global/indexdbstorage.js";
import XLSX from "xlsx";
import { ReceiptService } from "../../receipts/receipt-service";
let _ = require('lodash');
let vs1chartService = new VS1ChartService();
let utilityService = new UtilityService();
let receiptService = new ReceiptService();
let sideBarService = new SideBarService();
Template.accountslistchart.onCreated(()=>{
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.accountTypes = new ReactiveVar([]);
  templateObject.taxraterecords = new ReactiveVar([]);
  templateObject.selectedFile = new ReactiveVar();
  templateObject.isBankAccount = new ReactiveVar();
  templateObject.isBankAccount.set(false);
});

Template.accountslistchart.onRendered(()=>{

  const templateObject = Template.instance();

  let topTenData1 = [];
  let topTenSuppData1 = [];
  let topData = this;

  function chartClickEvent() {
    FlowRouter.go("/accountsoverview");
  };


  let accountService = new AccountService();
  let productService = new ProductService();
  const accountTypeList = [];
  const taxCodesList = [];
  const splashArrayTaxRateList = [];
  const dataTableList = [];
  const tableHeaderList = [];
  let categories = [];
  let usedCategories = [];
  let categoryAccountList = [];
  let needAddMaterials = true;
  let needAddMealsEntertainment = true;
  let needAddOfficeSupplies = true;
  let needAddTravel = true;
  let needAddVehicle = true;

  templateObject.getReceiptCategoryList = function() {
      getVS1Data('TReceiptCategory').then(function(dataObject) {
          if (dataObject.length == 0) {
              sideBarService.getReceiptCategory().then(function(data) {
                  setReceiptCategory(data);
              }).catch(function(err) {
                templateObject.getAccountLists();
              });
          } else {
              let data = JSON.parse(dataObject[0].data);
              setReceiptCategory(data);
          }
      }).catch(function(err) {
          sideBarService.getReceiptCategory().then(function(data) {
              setReceiptCategory(data);
          }).catch(function(err) {
            templateObject.getAccountLists();
          });
      });
  };

  function setReceiptCategory(data) {
      addVS1Data('TReceiptCategory', JSON.stringify(data));
      for (let i in data.treceiptcategory) {
          if (data.treceiptcategory.hasOwnProperty(i)) {
              if (data.treceiptcategory[i].CategoryName != "") {
                  categories.push(data.treceiptcategory[i].CategoryName);
              }
              if (data.treceiptcategory[i].CategoryName == "Materials") {
                  needAddMaterials = false;
              }
              if (data.treceiptcategory[i].CategoryName == "Meals & Entertainment") {
                  needAddMealsEntertainment = false;
              }
              if (data.treceiptcategory[i].CategoryName == "Office Supplies") {
                  needAddOfficeSupplies = false;
              }
              if (data.treceiptcategory[i].CategoryName == "Travel") {
                  needAddTravel = false;
              }
              if (data.treceiptcategory[i].CategoryName == "Vehicle") {
                  needAddVehicle = false;
              }
          }
      }
      addDefaultCategoryValue();
      templateObject.getAccountLists();
  }
  function addDefaultCategoryValue() {
      let needAddDefault = true;
      if (!needAddMaterials && !needAddMealsEntertainment && !needAddOfficeSupplies && !needAddTravel && !needAddVehicle ) {
          needAddDefault = false;
      }
      if (needAddDefault) {
          let isSaved = false;
          if (needAddMaterials) {
              receiptService.getOneReceiptCategoryDataExByName("Materials").then(function (receiptCategory) {
                  let objMaterials;
                  if (receiptCategory.treceiptcategory.length == 0) {
                      objMaterials = {
                          type: "TReceiptCategory",
                          fields: {
                              Active: true,
                              CategoryName: "Materials",
                              CategoryDesc: "Default Value"
                          }
                      }
                  } else {
                      let categoryID = receiptCategory.treceiptcategory[0].fields.ID;
                      objMaterials = {
                          type: "TReceiptCategory",
                          fields: {
                              Id: categoryID,
                              Active: true
                          }
                      }
                  }
                  receiptService.saveReceiptCategory(objMaterials).then(function (result) {
                      isSaved = true;
                  }).catch(function (err) {
                  });
              })
          }
          if (needAddMealsEntertainment) {
              receiptService.getOneReceiptCategoryDataExByName("Meals & Entertainment").then(function (receiptCategory) {
                  let objMealsEntertainment;
                  if (receiptCategory.treceiptcategory.length == 0) {
                      objMealsEntertainment = {
                          type: "TReceiptCategory",
                          fields: {
                              Active: true,
                              CategoryName: "Meals & Entertainment",
                              CategoryDesc: "Default Value"
                          }
                      }
                  } else {
                      let categoryID = receiptCategory.treceiptcategory[0].fields.ID;
                      objMealsEntertainment = {
                          type: "TReceiptCategory",
                          fields: {
                              Id: categoryID,
                              Active: true
                          }
                      }
                  }
                  receiptService.saveReceiptCategory(objMealsEntertainment).then(function (result) {
                      isSaved = true;
                  }).catch(function (err) {
                  });
              })
          }
          if (needAddOfficeSupplies) {
              receiptService.getOneReceiptCategoryDataExByName("Office Supplies").then(function (receiptCategory) {
                  let objOfficeSupplies;
                  if (receiptCategory.treceiptcategory.length == 0) {
                      objOfficeSupplies = {
                          type: "TReceiptCategory",
                          fields: {
                              Active: true,
                              CategoryName: "Office Supplies",
                              CategoryDesc: "Default Value"
                          }
                      }
                  } else {
                      let categoryID = receiptCategory.treceiptcategory[0].fields.ID;
                      objOfficeSupplies = {
                          type: "TReceiptCategory",
                          fields: {
                              Id: categoryID,
                              Active: true
                          }
                      }
                  }
                  receiptService.saveReceiptCategory(objOfficeSupplies).then(function (result) {
                      isSaved = true;
                  }).catch(function (err) {
                  });
              })
          }
          if (needAddTravel) {
              receiptService.getOneReceiptCategoryDataExByName("Travel").then(function (receiptCategory) {
                  let objTravel;
                  if (receiptCategory.treceiptcategory.length == 0) {
                      objTravel = {
                          type: "TReceiptCategory",
                          fields: {
                              Active: true,
                              CategoryName: "Travel",
                              CategoryDesc: "Default Value"
                          }
                      }
                  } else {
                      let categoryID = receiptCategory.treceiptcategory[0].fields.ID;
                      objTravel = {
                          type: "TReceiptCategory",
                          fields: {
                              Id: categoryID,
                              Active: true
                          }
                      }
                  }
                  receiptService.saveReceiptCategory(objTravel).then(function (result) {
                      isSaved = true;
                  }).catch(function (err) {
                  });
              })
          }
          if (needAddVehicle) {
              receiptService.getOneReceiptCategoryDataExByName("Vehicle").then(function (receiptCategory) {
                  let objVehicle;
                  if (receiptCategory.treceiptcategory.length == 0) {
                      objVehicle = {
                          type: "TReceiptCategory",
                          fields: {
                              Active: true,
                              CategoryName: "Vehicle",
                              CategoryDesc: "Default Value"
                          }
                      }
                  } else {
                      let categoryID = receiptCategory.treceiptcategory[0].fields.ID;
                      objVehicle = {
                          type: "TReceiptCategory",
                          fields: {
                              Id: categoryID,
                              Active: true
                          }
                      }
                  }
                  receiptService.saveReceiptCategory(objVehicle).then(function (result) {
                      isSaved = true;
                  }).catch(function (err) {
                  });
              })
          }
          setTimeout(function () {
              if (isSaved) {
                  receiptService.getAllReceiptCategorys().then(function (dataReload) {
                      addVS1Data('TReceiptCategory', JSON.stringify(dataReload)).then(function (datareturn) {
                          Meteor._reload.reload();
                      }).catch(function (err) {
                          Meteor._reload.reload();
                      });
                  }).catch(function (err) {
                      Meteor._reload.reload();
                  });
              }
          }, 5000);
      }
  }
  templateObject.getReceiptCategoryList();

  $("#edtExpiryDate").datepicker({
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
  });

  templateObject.getAllTaxCodes = function() {
      getVS1Data("TTaxcodeVS1").then(function(dataObject) {
          if (dataObject.length === 0) {
              productService.getTaxCodesVS1().then(function(data) {
                  let records = [];
                  let inventoryData = [];
                  for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                      let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                      var dataList = [
                          data.ttaxcodevs1[i].Id || "",
                          data.ttaxcodevs1[i].CodeName || "",
                          data.ttaxcodevs1[i].Description || "-",
                          taxRate || 0,
                      ];

                      let taxcoderecordObj = {
                          codename: data.ttaxcodevs1[i].CodeName || " ",
                          coderate: taxRate || " ",
                      };

                      taxCodesList.push(taxcoderecordObj);

                      splashArrayTaxRateList.push(dataList);
                  }
                  templateObject.taxraterecords.set(taxCodesList);

                  if (splashArrayTaxRateList) {
                      $(".tblDashboardTaxRate").DataTable({
                          data: splashArrayTaxRateList,
                          sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                          columnDefs: [{
                                  orderable: false,
                                  targets: 0,
                              },
                              {
                                  className: "taxName",
                                  targets: [1],
                              },
                              {
                                  className: "taxDesc",
                                  targets: [2],
                              },
                              {
                                  className: "taxRate text-right",
                                  targets: [3],
                              },
                          ],
                          // colReorder: true,

                          pageLength: initialDatatableLoad,
                          lengthMenu: [
                              [initialDatatableLoad, -1],
                              [initialDatatableLoad, "All"],
                          ],
                          select: true,
                          destroy: true,
                          colReorder: true,
                          info: true,
                          responsive: true,
                          fnDrawCallback: function(oSettings) {
                              // $('.dataTables_paginate').css('display', 'none');
                          },
                          language: { search: "",searchPlaceholder: "Search List..." },
                          fnInitComplete: function() {
                              $(
                                  "<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
                              ).insertAfter(".tblDashboardTaxRate_filter");
                              $(
                                  "<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                              ).insertAfter(".tblDashboardTaxRate_filter");
                          },
                      });
                  }
              });
          } else {
              let data = JSON.parse(dataObject[0].data);
              let useData = data.ttaxcodevs1;
              let records = [];
              let inventoryData = [];
              for (let i = 0; i < useData.length; i++) {
                  let taxRate = (useData[i].Rate * 100).toFixed(2);
                  var dataList = [
                      useData[i].Id || "",
                      useData[i].CodeName || "",
                      useData[i].Description || "-",
                      taxRate || 0,
                  ];

                  let taxcoderecordObj = {
                      codename: useData[i].CodeName || " ",
                      coderate: taxRate || " ",
                  };

                  taxCodesList.push(taxcoderecordObj);

                  splashArrayTaxRateList.push(dataList);
              }
              templateObject.taxraterecords.set(taxCodesList);
              if (splashArrayTaxRateList) {
                  $(".tblDashboardTaxRate").DataTable({
                      data: splashArrayTaxRateList,
                      sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",

                      columnDefs: [{
                              orderable: false,
                              targets: 0,
                          },
                          {
                              className: "taxName",
                              targets: [1],
                          },
                          {
                              className: "taxDesc",
                              targets: [2],
                          },
                          {
                              className: "taxRate text-right",
                              targets: [3],
                          },
                      ],
                      // colReorder: true,

                      pageLength: initialDatatableLoad,
                      lengthMenu: [
                          [initialDatatableLoad, -1],
                          [initialDatatableLoad, "All"],
                      ],
                      select: true,
                      destroy: true,
                      colReorder: true,
                      info: true,
                      responsive: true,
                      fnDrawCallback: function(oSettings) {
                          // $('.dataTables_paginate').css('display', 'none');
                      },
                      language: { search: "",searchPlaceholder: "Search List..." },
                      fnInitComplete: function() {
                          $(
                              "<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
                          ).insertAfter(".tblDashboardTaxRate_filter");
                          $(
                              "<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                          ).insertAfter(".tblDashboardTaxRate_filter");
                      },
                  });
              }
          }
      }).catch(function(err) {
          productService.getTaxCodesVS1().then(function(data) {
              let records = [];
              let inventoryData = [];
              for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                  let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                  var dataList = [
                      data.ttaxcodevs1[i].Id || "",
                      data.ttaxcodevs1[i].CodeName || "",
                      data.ttaxcodevs1[i].Description || "-",
                      taxRate || 0,
                  ];

                  let taxcoderecordObj = {
                      codename: data.ttaxcodevs1[i].CodeName || " ",
                      coderate: taxRate || " ",
                  };

                  taxCodesList.push(taxcoderecordObj);

                  splashArrayTaxRateList.push(dataList);
              }
              templateObject.taxraterecords.set(taxCodesList);

              if (splashArrayTaxRateList) {
                  $(".tblDashboardTaxRate").DataTable({
                      data: splashArrayTaxRateList,
                      sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",

                      columnDefs: [{
                              orderable: false,
                              targets: 0,
                          },
                          {
                              className: "taxName",
                              targets: [1],
                          },
                          {
                              className: "taxDesc",
                              targets: [2],
                          },
                          {
                              className: "taxRate text-right",
                              targets: [3],
                          },
                      ],
                      // colReorder: true,

                      pageLength: initialDatatableLoad,
                      lengthMenu: [
                          [initialDatatableLoad, -1],
                          [initialDatatableLoad, "All"],
                      ],
                      info: true,
                      select: true,
                      destroy: true,
                      colReorder: true,
                      responsive: true,
                      fnDrawCallback: function(oSettings) {
                          // $('.dataTables_paginate').css('display', 'none');
                      },
                      language: { search: "",searchPlaceholder: "Search List..." },
                      fnInitComplete: function() {
                          $(
                              "<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
                          ).insertAfter(".tblDashboardTaxRate_filter");
                          $(
                              "<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                          ).insertAfter(".tblDashboardTaxRate_filter");
                      },
                  });
              }
          });
      });
  };

  setTimeout(function() {
      templateObject.getAllTaxCodes();

      $(".accountslistchart .portlet").removeClass("ui-widget ui-widget-content");
  }, 500);

  function MakeNegative() {
      $('td').each(function () {
          if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
      });
  }

  function setAccountModal(data) {
      var fullAccountTypeName = "";
      if (accountTypeList) {
          for (var h = 0; h < accountTypeList.length; h++) {
              if (
                  data.fields.AccountTypeName ===
                  accountTypeList[h].accounttypename
              ) {
                  fullAccountTypeName = accountTypeList[h].description || "";
              }
          }
      }

      var accountid = data.fields.ID || "";
      var accounttype =
          fullAccountTypeName || data.fields.AccountTypeName;
      var accountname = data.fields.AccountName || "";
      var accountno = data.fields.AccountNumber || "";
      var taxcode = data.fields.TaxCode || "";
      var accountdesc = data.fields.Description || "";
      var bankaccountname = data.fields.BankAccountName || "";
      var bankbsb = data.fields.BSB || "";
      var bankacountno = data.fields.BankAccountNumber || "";

      var swiftCode = data.fields.Extra || "";
      var routingNo = data.fields.BankCode || "";

      var showTrans = data.fields.Required || false;
      let isHeader = data.fields.IsHeader || false;
      var cardnumber = data.fields.CarNumber || "";
      var cardcvc = data.fields.CVC || "";
      var cardexpiry = data.fields.ExpiryDate || "";
      let useReceiptClaim = data.fields.AllowExpenseClaim || false;
      let expenseCategory = data.fields.ReceiptCategory;

      if (accounttype === "BANK") {
          $(".isBankAccount").removeClass("isNotBankAccount");
          $(".isCreditAccount").addClass("isNotCreditAccount");
      } else if (accounttype === "CCARD") {
          $(".isCreditAccount").removeClass("isNotCreditAccount");
          $(".isBankAccount").addClass("isNotBankAccount");
      } else {
          $(".isBankAccount").addClass("isNotBankAccount");
          $(".isCreditAccount").addClass("isNotCreditAccount");
      }

      $("#edtAccountID").val(accountid);
      $("#sltAccountType").val(accounttype);
      $("#sltAccountType").append('<option value="' + accounttype + '" selected="selected">' + accounttype + "</option>");
      $("#edtAccountName").val(accountname);
      $("#edtAccountNo").val(accountno);
      $("#sltTaxCode").val(taxcode);
      $("#txaAccountDescription").val(accountdesc);
      $("#edtBankAccountName").val(bankaccountname);
      $("#edtBSB").val(bankbsb);
      $("#edtBankAccountNo").val(bankacountno);
      $("#swiftCode").val(swiftCode);
      $("#routingNo").val(routingNo);
      $("#edtBankName").val(localStorage.getItem("vs1companyBankName") || "");

      $("#edtCardNumber").val(cardnumber);
      $("#edtExpiryDate").val(cardexpiry ? moment(cardexpiry).format("DD/MM/YYYY") : "");
      $("#edtCvc").val(cardcvc);

      if (showTrans == "true") {
          $(".showOnTransactions").prop("checked", true);
      } else {
          $(".showOnTransactions").prop("checked", false);
      }
      if (useReceiptClaim == "true") {
          $(".useReceiptClaim").prop("checked", true);
      } else {
          $(".useReceiptClaim").prop("checked", false);
      }

      if (isHeader == "true") {
          $(".accountIsHeader").prop("checked", true);
      } else {
          $(".accountIsHeader").prop("checked", false);
      }

      $(".expenseCategory").append('<option value="' + expenseCategory + '" selected="selected">' + expenseCategory + "</option>");
      $(".expenseCategory").val(expenseCategory);

      setTimeout(function() {
          $(".addNewAccount").modal("show");
      }, 500);
  }

  templateObject.getAccountLists = function() {
      getVS1Data("TAccountVS1").then(function(dataObject) {
          if (dataObject.length == 0) {
              accountService.getAccountListVS1().then(function(data) {
                  setAccountListVS1(data);
              }).catch(function(err) {
                  // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                  $(".fullScreenSpin").css("display", "none");
                  // Meteor._reload.reload();
              });
          } else {
              let data = JSON.parse(dataObject[0].data);
              setAccountListVS1(data, true);
          }
      }).catch(function(err) {
          accountService.getAccountListVS1().then(function(data) {
              setAccountListVS1(data);
          }).catch(function(err) {
              // Bert.alert('<strong>' + err + '</strong>!', 'danger');
              $(".fullScreenSpin").css("display", "none");
              // Meteor._reload.reload();
          });
      });
  };

  function setAccountListVS1(data, isField = false) {
      addVS1Data('TAccountVS1', JSON.stringify(data));
      let lineItems = [];
      let lineItemObj = {};
      let fullAccountTypeName = "";
      let accBalance = "";

      for (let i = 0; i < data.taccountvs1.length; i++) {
          let lineData = data.taccountvs1[i];
          if (isField) {
              lineData = data.taccountvs1[i].fields;
          }
          if (accountTypeList) {
              for (let j = 0; j < accountTypeList.length; j++) {
                  if (lineData.AccountTypeName === accountTypeList[j].accounttypename) {
                      fullAccountTypeName = accountTypeList[j].description || "";
                  }
              }
          }
          if (!isNaN(lineData.Balance)) {
              accBalance = utilityService.modifynegativeCurrencyFormat(lineData.Balance) || 0.0;
          } else {
              accBalance = Currency + "0.00";
          }
          if (data.taccountvs1[i].fields.ReceiptCategory && data.taccountvs1[i].fields.ReceiptCategory != '') {
              usedCategories.push(data.taccountvs1[i].fields);
          }

          const dataList = {
              id: lineData.ID || "",
              accountname: lineData.AccountName || "",
              description: lineData.Description || "",
              accountnumber: lineData.AccountNumber || "",
              accounttypename: fullAccountTypeName || lineData.AccountTypeName,
              accounttypeshort: lineData.AccountTypeName || "",
              taxcode: lineData.TaxCode || "",
              bankaccountname: lineData.BankAccountName || "",
              bankname: lineData.BankName || "",
              bsb: lineData.BSB || "",
              bankaccountnumber: lineData.BankAccountNumber || "",
              swiftcode: lineData.Extra || "",
              routingNo: lineData.BankCode || "",
              apcanumber: lineData.BankNumber || "",
              balance: accBalance || 0.0,
              forTransaction: lineData.Required || false,
              isheader: lineData.IsHeader || false,
              cardnumber: lineData.CarNumber || "",
              expirydate: lineData.ExpiryDate || "",
              cvc: lineData.CVC || "",
              useReceiptClaim: lineData.AllowExpenseClaim || false,
              expenseCategory: lineData.ReceiptCategory || ""
          };
          dataTableList.push(dataList);
      }
      usedCategories = [...new Set(usedCategories)];
      templateObject.datatablerecords.set(dataTableList);
      categories.forEach((citem, j) => {
          let cdataList = null;
          let match = usedCategories.filter((item) => (item.ReceiptCategory == citem));
          if (match.length > 0) {
              let temp = match[0];
              cdataList = [
                  citem,
                  temp.AccountName || '',
                  temp.Description || '',
                  temp.AccountNumber || '',
                  temp.TaxCode || '',
                  temp.ID || ''
              ];
          } else {
              cdataList = [
                  citem,
                  '',
                  '',
                  '',
                  '',
                  ''
              ];
          }
          categoryAccountList.push(cdataList);
      });

      if (templateObject.datatablerecords.get()) {
          setTimeout(function() {
              MakeNegative();
          }, 100);
      }

      setTimeout(function() {
          $('#tblDashboardCategory').dataTable({
              data: categoryAccountList,
              "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
              paging: true,
              "aaSorting": [],
              "orderMulti": true,
              columnDefs: [
                  { className: "colReceiptCategory", "targets": [0] },
                  { className: "colAccountName", "targets": [1] },
                  { className: "colAccountDesc", "targets": [2] },
                  { className: "colAccountNumber", "targets": [3] },
                  { className: "colTaxCode", "targets": [4] },
                  { className: "colAccountID hiddenColumn", "targets": [5] }
              ],
              "order": [
                  [0, "asc"]
              ],
              pageLength: initialDatatableLoad,
              lengthMenu: [
                  [initialDatatableLoad, -1],
                  [initialDatatableLoad, "All"]
              ],
              info: true,
              select: true,
              destroy: true,
              colReorder: true,
              responsive: true,
              "fnInitComplete": function() {
                  $("<button class='btn btn-primary btnAddNewReceiptCategory' data-dismiss='modal' data-toggle='modal' data-target='#addReceiptCategoryModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblDashboardCategory_filter");
                  $("<button class='btn btn-primary btnRefreshCategoryAccount' type='button' id='btnRefreshCategoryAccount' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblDashboardCategory_filter");
              }
          });
          // //$.fn.dataTable.moment('DD/MM/YY');
      }, 10);

      templateObject.tableheaderrecords.set(tableHeaderList);
      $("div.dataTables_filter input").addClass(
          "form-control form-control-sm"
      );
  }


  $('.expenseCategory').on('click', function(e, li) {
      templateObject.setCategoryAccountList(e);
  });
  templateObject.setCategoryAccountList = function(e) {
      const $each = $(e.target);
      const offset = $each.offset();
      $('#edtReceiptCategoryID').val('');
      const searchDataName = e.target.value || '';
      if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
          $each.attr('data-id', '');
          $('#categoryListModal').modal('toggle');
          setTimeout(function() {
              $('#tblDashboardCategory_filter .form-control-sm').focus();
              $('#tblDashboardCategory_filter .form-control-sm').val('');
              $('#tblDashboardCategory_filter .form-control-sm').trigger("input");
              const datatable = $('#tblDashboardCategory').DataTable();
              datatable.draw();
              $('#tblDashboardCategory_filter .form-control-sm').trigger("input");
          }, 200);
      } else {
          if (searchDataName.replace(/\s/g, '') != '') {
              getVS1Data('TReceiptCategory').then(function(dataObject) {
                  if (dataObject.length == 0) {
                      sideBarService.getReceiptCategoryByName(searchDataName).then(function(data) {
                          showEditReceiptCategoryView(data.treceiptcategory[0]);
                      }).catch(function(err) {

                      });
                  } else {
                      let data = JSON.parse(dataObject[0].data);
                      let added = false;
                      for (let i = 0; i < data.treceiptcategory.length; i++) {
                          if ((data.treceiptcategory[i].CategoryName) === searchDataName) {
                              added = true;
                              showEditReceiptCategoryView(data.treceiptcategory[i]);
                          }
                      }
                      if (!added) {

                          sideBarService.getReceiptCategoryByName(searchDataName).then(function(data) {
                              showEditReceiptCategoryView(data.treceiptcategory[0]);
                          }).catch(function(err) {

                          });
                      }
                  }
              }).catch(function(err) {
                  sideBarService.getReceiptCategoryByName(searchDataName).then(function(data) {
                      showEditReceiptCategoryView(data.treceiptcategory[0]);
                  }).catch(function(err) {

                  });
              });
          } else {
              $('#categoryListModal').modal('toggle');
              setTimeout(function() {
                  $('#tblDashboardCategory_filter .form-control-sm').focus();
                  $('#tblDashboardCategory_filter .form-control-sm').val('');
                  $('#tblDashboardCategory_filter .form-control-sm').trigger("input");
                  const datatable = $('#tblDashboardCategory').DataTable();
                  datatable.draw();
                  $('#tblDashboardCategory_filter .form-control-sm').trigger("input");
              }, 200);
          }
      }
  };

  function showEditReceiptCategoryView(data) {
      $("#add-receiptcategory-title").text("Edit Receipt Category");
      $('#edtReceiptCategoryID').val(data.Id);
      $('#edtReceiptCategoryName').val(data.CategoryName);
      $('#edtReceiptCategoryDesc').val(data.CategoryDesc);
      setTimeout(function() {
          $('#addReceiptCategoryModal').modal('show');
      }, 200);
  }

  $("#tblDashboardAccountChartList tbody").on("click","tr .colAccountName, tr .colAccountName, tr .colDescription, tr .colAccountNo, tr .colType, tr .colTaxCode, tr .colBankAccountName, tr .colBSB, tr .colBankAccountNo, tr .colExtra, tr .colAPCANumber",function() {
          var listData = $(this).closest("tr").attr("id");
          var tabletaxtcode = $(event.target).closest("tr").find(".colTaxCode").text();
          var accountName = $(event.target).closest("tr").find(".colAccountName").text();
          let columnBalClass = $(event.target).attr("class");
          // let accountService = new AccountService();

          // if(columnBalClass.indexOf("colBalance") != -1){
          //     window.open('/balancetransactionlist?accountName=' + accountName+ '&isTabItem='+false,'_self');
          // }else{

          if (listData) {
              $("#add-account-title").text("Edit Account Details");
              $("#edtAccountName").attr("readonly", true);
              $("#sltAccountType").attr("readonly", true);
              $("#sltAccountType").attr("disabled", "disabled");
              if (listData !== "") {
                  listData = Number(listData);
                  //accountService.getOneAccount(listData).then(function (data) {

                  var accountid = listData || "";
                  var accounttype = $(event.target).closest("tr").find(".colType").attr("accounttype") || "";
                  var accountname = $(event.target).closest("tr").find(".colAccountName").text() || "";
                  var accountno = $(event.target).closest("tr").find(".colAccountNo").text() || "";
                  var taxcode = $(event.target).closest("tr").find(".colTaxCode").text() || "";
                  var accountdesc = $(event.target).closest("tr").find(".colDescription").text() || "";
                  var bankaccountname = $(event.target).closest("tr").find(".colBankAccountName").text() || "";
                  var bankname = localStorage.getItem("vs1companyBankName") || $(event.target).closest("tr").find(".colBankName").text() || "";
                  var bankbsb = $(event.target).closest("tr").find(".colBSB").text() || "";
                  var bankacountno = $(event.target).closest("tr").find(".colBankAccountNo").text() || "";

                  var swiftCode = $(event.target).closest("tr").find(".colExtra").text() || "";
                  var routingNo = $(event.target).closest("tr").find(".colAPCANumber").text() || "";

                  var showTrans = $(event.target).closest("tr").find(".colAPCANumber").attr("checkheader") || false;

                  var cardnumber = $(event.target).closest("tr").find(".colCardNumber").text() || "";
                  var cardexpiry = $(event.target).closest("tr").find(".colExpiryDate").text() || "";
                  var cardcvc = $(event.target).closest("tr").find(".colCVC").text() || "";

                  if (accounttype === "BANK") {
                      $(".isBankAccount").removeClass("isNotBankAccount");
                      $(".isCreditAccount").addClass("isNotCreditAccount");
                  } else if (accounttype === "CCARD") {
                      $(".isCreditAccount").removeClass("isNotCreditAccount");
                      $(".isBankAccount").addClass("isNotBankAccount");
                  } else {
                      $(".isBankAccount").addClass("isNotBankAccount");
                      $(".isCreditAccount").addClass("isNotCreditAccount");
                  }

                  $("#edtAccountID").val(accountid);
                  $("#sltAccountType").val(accounttype);
                  $("#edtAccountName").val(accountname);
                  $("#edtAccountNo").val(accountno);
                  $("#sltTaxCode").val(taxcode);
                  $("#txaAccountDescription").val(accountdesc);
                  $("#edtBankAccountName").val(bankaccountname);
                  $("#edtBSB").val(bankbsb);
                  $("#edtBankAccountNo").val(bankacountno);
                  $("#swiftCode").val(swiftCode);
                  $("#routingNo").val(routingNo);
                  $("#edtBankName").val(bankname);

                  $("#edtCardNumber").val(cardnumber);
                  $("#edtExpiryDate").val(
                      cardexpiry ? moment(cardexpiry).format("DD/MM/YYYY") : ""
                  );
                  $("#edtCvc").val(cardcvc);

                  if (showTrans == "true") {
                      $(".showOnTransactions").prop("checked", true);
                  } else {
                      $(".showOnTransactions").prop("checked", false);
                  }
                  let useReceiptClaim = $(event.target).closest("tr").find(".colUseReceiptClaim").attr("checkheader") || false;
                  if (useReceiptClaim == "true") {
                      $(".useReceiptClaim").prop("checked", true);
                  } else {
                      $(".useReceiptClaim").prop("checked", false);
                  }
                  let category = $(event.target).closest("tr").find(".colExpenseCategory").attr("category") || "";
                  $(".expenseCategory").val(category);

                  $(this).closest("tr").attr("data-target", ".addNewAccount");
                  $(this).closest("tr").attr("data-toggle", "modal");
              }

              // window.open('/invoicecard?id=' + listData,'_self');
          }
    });

  $("#tblDashboardAccountChartList tbody").on("click", "tr .colBalance", async function() {
      var listData = $(this).closest("tr").attr("id");
      var accountName = $(event.target).closest("tr").find(".colAccountName").text();
      let columnBalClass = $(event.target).attr("class");
      let accountService = new AccountService();
      await clearData('TAccountRunningBalanceReport');
      FlowRouter.go("/balancetransactionlist?accountName=" + accountName + "&isTabItem=" + false);
      //window.open('/balancetransactionlist?accountName=' + accountName+ '&isTabItem='+false,'_self');
  });
  tableResize();
  });

 Template.accountslistchart.events({
   "click .accountslistchart #btnJournalEntries": function(event) {
       FlowRouter.go("/journalentrylist");
   },
   "click .accountslistchart #btnNewJournalEntry": function(event) {
       FlowRouter.go("/journalentrycard");
   },
   "click .accountslistchart .exportbtn": function() {
       $(".fullScreenSpin").css("display", "inline-block");
       jQuery("#tblDashboardAccountChartList_wrapper .dt-buttons .btntabletocsv").click();
       $(".fullScreenSpin").css("display", "none");
   },
   "click .accountslistchart .exportbtnExcel": function() {
       $(".fullScreenSpin").css("display", "inline-block");
       jQuery("#tblDashboardAccountChartList_wrapper .dt-buttons .btntabletoexcel").click();
       $(".fullScreenSpin").css("display", "none");
   },
   "click .accountslistchart .btnRefresh": function() {
       $(".fullScreenSpin").css("display", "inline-block");
       let templateObject = Template.instance();

       sideBarService.getAccountListVS1().then(function(data) {
               addVS1Data("TAccountVS1", JSON.stringify(data)).then(function(datareturn) {
                 sideBarService.getAllTAccountVS1List(initialBaseDataLoad, 0,false).then(function(dataAccount) {
                         addVS1Data("TAccountVS1List", JSON.stringify(dataAccount)).then(function(datareturn) {
                                 window.open("/accountsoverview", "_self");
                             }).catch(function(err) {
                                 window.open("/accountsoverview", "_self");
                             });
                     }).catch(function(err) {
                         window.open("/accountsoverview", "_self");
                     });
                   }).catch(function(err) {
                       window.open("/accountsoverview", "_self");
                   });
           }).catch(function(err) {
               window.open("/accountsoverview", "_self");
           });
   },
   "click .accountslistchart .btnSaveAccount": function() {
        playSaveAudio();
        let templateObject = Template.instance();
       let accountService = new AccountService();
       let organisationService = new OrganisationService();
        setTimeout(function(){
       $(".fullScreenSpin").css("display", "inline-block");

       let forTransaction = false;
       let isHeader = false;
       let useReceiptClaim = false;

       if ($("#showOnTransactions").is(":checked")) {
           forTransaction = true;
       }
       if ($("#useReceiptClaim").is(":checked")) {
           useReceiptClaim = true;
       }
       if ($("#accountIsHeader").is(":checked")) {
           isHeader = true;
       }
       let accountID = $("#edtAccountID").val();
       const accounttype = $("#sltAccountType").val();
       const accountname = $("#edtAccountName").val();
       const accountno = $("#edtAccountNo").val();
       const taxcode = $("#sltTaxCode").val();
       const accountdesc = $("#txaAccountDescription").val();
       const swiftCode = $("#swiftCode").val();
       const routingNo = $("#routingNo").val();
       // var comments = $('#txaAccountComments').val();
       const bankname = $("#edtBankName").val();
       const bankaccountname = $("#edtBankAccountName").val();
       const bankbsb = $("#edtBSB").val();
       const bankacountno = $("#edtBankAccountNo").val();
       const isBankAccount = templateObject.isBankAccount.get();
       const expenseCategory = $(".expenseCategory").val();
       const categoryAccountID = $("#categoryAccountID").val();
       const categoryAccountName = $("#categoryAccountName").val();
       const expirydateTime = new Date($("#edtExpiryDate").datepicker("getDate"));
       const cardnumber = $("#edtCardNumber").val();
       const cardcvc = $("#edtCvc").val();
       const expiryDate =
           expirydateTime.getFullYear() +
           "-" +
           (expirydateTime.getMonth() + 1) +
           "-" +
           expirydateTime.getDate();

       let companyID = 1;
       let data = "";
       if (categoryAccountID != "" && categoryAccountID != accountID) {
           data = {
               type: "TAccount",
               fields: {
                   ID: categoryAccountID,
                   ReceiptCategory: ""
               },
           };
           accountService.saveAccount(data).then(function(data2) {
               doBeforeSave(accountID);
           }).catch(function(err) {
               swal({
                   title: "Oooops...",
                   text: err,
                   type: "error",
                   showCancelButton: false,
                   confirmButtonText: "Try Again",
               }).then((result) => {
                   if (result.value) {} else if (result.dismiss === "cancel") {}
               });
               return false;
           })
       } else {
           doBeforeSave(accountID);
       }
    }, delayTimeAfterSound);
       function doBeforeSave(accountID) {
           if (accountID == "") {
               accountService.getCheckAccountData(accountname).then(function (data) {
                   accountID = parseInt(data.taccount[0].Id) || 0;
                   doSaveAccount(accountID);
               }).catch(function (err) {
                   doSaveAccount(0);
               });
           } else {
               doSaveAccount(accountID);
           }
       }
       function doSaveAccount(accountID) {
           data = {
               type: "TAccount",
               fields: {
                   ID: accountID,
                   // AccountName: accountname|| '',
                   AccountNumber: accountno || "",
                   // AccountTypeName: accounttype|| '',
                   ReceiptCategory: expenseCategory || "",
                   Active: true,
                   BankAccountName: bankaccountname || "",
                   BankAccountNumber: bankacountno || "",
                   BSB: bankbsb || "",
                   Description: accountdesc || "",
                   TaxCode: taxcode || "",
                   PublishOnVS1: true,
                   Extra: swiftCode,
                   BankNumber: routingNo,
                   IsHeader: isHeader,
                   AllowExpenseClaim: useReceiptClaim,
                   Required: forTransaction,
                   CarNumber: cardnumber || "",
                   CVC: cardcvc || "",
                   ExpiryDate: expiryDate || "",
               },
           };
           accountService.saveAccount(data).then(function(data) {
               if ($("#showOnTransactions").is(":checked")) {
                   const objDetails = {
                       type: "TCompanyInfo",
                       fields: {
                           Id: companyID,
                           AccountNo: bankacountno,
                           BankBranch: swiftCode,
                           BankAccountName: bankaccountname,
                           BankName: bankname,
                           Bsb: bankbsb,
                           SiteCode: routingNo,
                           FileReference: accountname,
                       },
                   };
                   organisationService.saveOrganisationSetting(objDetails).then(function(data) {
                       const accNo = bankacountno || "";
                       const swiftCode1 = swiftCode || "";
                       const bankAccName = bankaccountname || "";
                       const accountName = accountname || "";
                       const bsb = bankbsb || "";
                       const routingNo = routingNo || "";

                       localStorage.setItem("vs1companyBankName", bankname);
                       localStorage.setItem(
                           "vs1companyBankAccountName",
                           bankAccName
                       );
                       localStorage.setItem("vs1companyBankAccountNo", accNo);
                       localStorage.setItem("vs1companyBankBSB", bsb);
                       localStorage.setItem("vs1companyBankSwiftCode", swiftCode1);
                       localStorage.setItem("vs1companyBankRoutingNo", routingNo);
                       doAfterSave(accountID);
                   }).catch(function(err) {
                       doAfterSave(accountID);
                   });
               } else {
                   doAfterSave(accountID);
               }
           }).catch(function(err) {
               swal({
                   title: "Oooops...",
                   text: err,
                   type: "error",
                   showCancelButton: false,
                   confirmButtonText: "Try Again",
               }).then((result) => {
                   if (result.value) {
                       Meteor._reload.reload();
                   } else if (result.dismiss === "cancel") {}
               });
               $(".fullScreenSpin").css("display", "none");
           });
       }
       function doAfterSave(accountID) {
           sideBarService.getAccountListVS1().then(function(dataReload) {
               addVS1Data("TAccountVS1", JSON.stringify(dataReload)).then(function(datareturn) {
                   successSaveEvent(accountID);
               }).catch(function(err) {
                   window.open("/accountsoverview", "_self");
               });
           }).catch(function(err) {
               window.open("/accountsoverview", "_self");
           });
       }
       function successSaveEvent(accountID) {
           let successTxt = "";
           if (accountID == "") {
               successTxt = "Account successfully created";
           } else {
               successTxt = "Account successfully updated";
           }
           swal({
               title: "Success",
               text: successTxt,
               type: "success",
               showCancelButton: false,
               confirmButtonText: "Try Again",
           }).then((result) => {
               if (result.value) {} else if (result.dismiss === "cancel") {}
           });
           $(".fullScreenSpin").css("display", "none");
           setTimeout(function() {
               window.open("/accountsoverview", "_self");
           }, 100);
       }
    },
   "click .accountslistchart .btnAddNewAccounts": function() {
       $("#add-account-title").text("Add New Account");
       $("#edtAccountID").val("");
       $("#sltAccountType").val("");
       $("#sltAccountType").removeAttr("readonly", true);
       $("#sltAccountType").removeAttr("disabled", "disabled");
       $("#edtAccountName").val("");
       $("#edtAccountName").attr("readonly", false);
       $("#edtAccountNo").val("");
       $("#sltTaxCode").val("NT" || "");
       $("#txaAccountDescription").val("");
       $("#edtBankAccountName").val("");
       $("#edtBSB").val("");
       $("#edtBankAccountNo").val("");
       $("#routingNo").val("");
       $("#edtBankName").val("");
       $("#swiftCode").val("");
       $(".showOnTransactions").prop("checked", false);
       $(".useReceiptClaim").prop("checked", false);
       $(".expenseCategory").val("");
       // let availableCategories = Template.instance().availableCategories.get();
       // let cateogoryHtml = "";
       // availableCategories.forEach(function(item) {
       //     cateogoryHtml += '<option value="' + item + '">' + item + '</option>';
       // });
       // $(".expenseCategory").empty();
       // $(".expenseCategory").append(cateogoryHtml);
       // if (cateogoryHtml == "") {
       //     $(".expenseCategory").attr("readonly", true);
       //     $(".expenseCategory").attr("disabled", "disabled");
       // } else {
       //     $(".expenseCategory").removeAttr("readonly", true);
       //     $(".expenseCategory").removeAttr("disabled", "disabled");
       // }
       $(".isBankAccount").addClass("isNotBankAccount");
       $(".isCreditAccount").addClass("isNotCreditAccount");
   },
   "click .accountslistchart .printConfirm": function(event) {
    playPrintAudio();
    setTimeout(function(){
       $(".fullScreenSpin").css("display", "inline-block");
       jQuery("#tblDashboardAccountChartList_wrapper .dt-buttons .btntabletopdf").click();
       $(".fullScreenSpin").css("display", "none");
    }, delayTimeAfterSound);
   },
   "click .accountslistchart .templateDownload": function() {
       let utilityService = new UtilityService();
       let rows = [];
       const filename = "SampleAccounts" + ".csv";
       rows[0] = [
           "Account Name",
           "Description",
           "Account No",
           "Type",
           "Balance",
           "Tax Code",
           "Bank Acc Name",
           "BSB",
           "Bank Acc No",
       ];
       rows[1] = [
           "Test Act",
           "Description 1",
           "12345",
           "AP",
           "0.00",
           "NT",
           "",
           "",
           "",
       ];
       rows[2] = [
           "Test Act 2",
           "Description 2",
           "5678",
           "AR",
           "0.00",
           "NT",
           "",
           "",
           "",
       ];
       rows[3] = [
           "Test Act 3 ",
           "Description 3",
           "6754",
           "EQUITY",
           "0.00",
           "NT",
           "",
           "",
           "",
       ];
       rows[4] = [
           "Test Act 4",
           "Description 4",
           "34567",
           "BANK",
           "0.00",
           "NT",
           "",
           "",
           "",
       ];
       rows[5] = [
           "Test Act 5",
           "Description 5",
           "8954",
           "COGS",
           "0.00",
           "NT",
           "",
           "",
           "",
       ];
       rows[6] = [
           "Test Act 6",
           "Description 6",
           "2346",
           "CCARD",
           "0.00",
           "NT",
           "",
           "",
           "",
       ];
       rows[7] = [
           "Test Act 7",
           "Description 7",
           "985454",
           "EXP",
           "0.00",
           "NT",
           "",
           "",
           "",
       ];
       rows[8] = [
           "Test Act 8",
           "Description 8",
           "34567",
           "FIXASSET",
           "0.00",
           "NT",
           "",
           "",
           "",
       ];
       rows[9] = [
           "Test Act 9",
           "Description 9",
           "9755",
           "INC",
           "0.00",
           "NT",
           "",
           "",
           "",
       ];
       rows[10] = [
           "Test Act 10",
           "Description 10",
           "8765",
           "LTLIAB",
           "0.00",
           "NT",
           "",
           "",
           "",
       ];
       rows[11] = [
           "Test Act 11",
           "Description 11",
           "7658",
           "OASSET",
           "0.00",
           "NT",
           "",
           "",
           "",
       ];
       rows[12] = [
           "Test Act 12",
           "Description 12",
           "6548",
           "OCASSET",
           "0.00",
           "NT",
           "",
           "",
           "",
       ];
       rows[13] = [
           "Test Act 13",
           "Description 13",
           "5678",
           "OCLIAB",
           "0.00",
           "NT",
           "",
           "",
           "",
       ];
       rows[14] = [
           "Test Act 14",
           "Description 14",
           "4761",
           "EXEXP",
           "0.00",
           "NT",
           "",
           "",
           "",
       ];
       rows[15] = [
           "Test Act 15",
           "Description 15",
           "3456",
           "EXINC",
           "0.00",
           "NT",
           "",
           "",
           "",
       ];
       utilityService.exportToCsv(rows, filename, "csv");
   },
   "click .accountslistchart .templateDownloadXLSX": function(e) {
       e.preventDefault(); //stop the browser from following
       window.location.href = "sample_imports/SampleAccounts.xlsx";
   },
   "click .accountslistchart .btnUploadFile": function(event) {
       $("#attachment-upload").val("");
       $(".file-name").text("");
       // $(".btnImport").removeAttr("disabled");
       $("#attachment-upload").trigger("click");
   },
   "change .accountslistchart #attachment-upload": function(e) {
       let templateObj = Template.instance();
       var filename = $("#attachment-upload")[0].files[0]["name"];
       var fileExtension = filename.split(".").pop().toLowerCase();
       var validExtensions = ["csv", "txt", "xlsx"];
       var validCSVExtensions = ["csv", "txt"];
       var validExcelExtensions = ["xlsx", "xls"];

       if (validExtensions.indexOf(fileExtension) == -1) {
           swal(
               "Invalid Format",
               "formats allowed are :" + validExtensions.join(", "),
               "error"
           );
           $(".file-name").text("");
           $(".btnImport").Attr("disabled");
       } else if (validCSVExtensions.indexOf(fileExtension) != -1) {
           $(".file-name").text(filename);
           let selectedFile = event.target.files[0];

           templateObj.selectedFile.set(selectedFile);
           if ($(".file-name").text() != "") {
               $(".btnImport").removeAttr("disabled");
           } else {
               $(".btnImport").Attr("disabled");
           }
       } else if (fileExtension == "xlsx") {
           $(".file-name").text(filename);
           let selectedFile = event.target.files[0];
           var oFileIn;
           var oFile = selectedFile;
           var sFilename = oFile.name;
           // Create A File Reader HTML5
           var reader = new FileReader();

           // Ready The Event For When A File Gets Selected
           reader.onload = function(e) {
               var data = e.target.result;
               data = new Uint8Array(data);
               var workbook = XLSX.read(data, {
                   type: "array",
               });

               var result = {};
               workbook.SheetNames.forEach(function(sheetName) {
                   var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                       header: 1,
                   });
                   var sCSV = XLSX.utils.make_csv(workbook.Sheets[sheetName]);
                   templateObj.selectedFile.set(sCSV);

                   if (roa.length) result[sheetName] = roa;
               });
               // see the result, caution: it works after reader event is done.
           };
           reader.readAsArrayBuffer(oFile);

           if ($(".file-name").text() != "") {
               $(".btnImport").removeAttr("disabled");
           } else {
               $(".btnImport").Attr("disabled");
           }
       }
   },
   "click .accountslistchart .btnImport": function() {
       $(".fullScreenSpin").css("display", "inline-block");
       let templateObject = Template.instance();
       let accountService = new AccountService();
       let objDetails;
       var filename = $("#attachment-upload")[0].files[0]["name"];
       var fileType = filename.split(".").pop().toLowerCase();

       if (fileType == "csv" || fileType == "txt" || fileType == "xlsx") {
           Papa.parse(templateObject.selectedFile.get(), {
               complete: function(results) {
                   if (results.data.length > 0) {
                       if (
                           results.data[0][0] == "Account Name" &&
                           results.data[0][1] == "Description" &&
                           results.data[0][2] == "Account No" &&
                           results.data[0][3] == "Type" &&
                           results.data[0][4] == "Balance" &&
                           results.data[0][5] == "Tax Code" &&
                           results.data[0][6] == "Bank Acc Name" &&
                           results.data[0][7] == "BSB" &&
                           results.data[0][8] == "Bank Acc No"
                       ) {
                           let dataLength = results.data.length * 500;
                           setTimeout(function() {
                               // $('#importModal').modal('toggle');
                               //Meteor._reload.reload();
                               sideBarService
                                   .getAccountListVS1()
                                   .then(function(dataReload) {
                                       addVS1Data("TAccountVS1", JSON.stringify(dataReload))
                                           .then(function(datareturn) {
                                               window.open("/accountsoverview", "_self");
                                           })
                                           .catch(function(err) {
                                               window.open("/accountsoverview", "_self");
                                           });
                                   })
                                   .catch(function(err) {
                                       window.open("/accountsoverview", "_self");
                                   });
                           }, parseInt(dataLength));
                           for (let i = 0; i < results.data.length - 1; i++) {
                               objDetails = {
                                   type: "TAccount",
                                   fields: {
                                       Active: true,
                                       AccountName: results.data[i + 1][0],
                                       Description: results.data[i + 1][1],
                                       AccountNumber: results.data[i + 1][2],
                                       AccountTypeName: results.data[i + 1][3],
                                       Balance: Number(
                                           results.data[i + 1][4].replace(/[^0-9.-]+/g, "")
                                       ) || 0,
                                       TaxCode: results.data[i + 1][5],
                                       BankAccountName: results.data[i + 1][6],
                                       BSB: results.data[i + 1][7],
                                       BankAccountNumber: results.data[i + 1][8],
                                       PublishOnVS1: true,
                                   },
                               };
                               if (results.data[i + 1][1]) {
                                   if (results.data[i + 1][1] !== "") {
                                       accountService
                                           .saveAccount(objDetails)
                                           .then(function(data) {})
                                           .catch(function(err) {
                                               swal({
                                                   title: "Oooops...",
                                                   text: err,
                                                   type: "error",
                                                   showCancelButton: false,
                                                   confirmButtonText: "Try Again",
                                               }).then((result) => {
                                                   if (result.value) {
                                                       Meteor._reload.reload();
                                                   } else if (result.dismiss === "cancel") {}
                                               });
                                           });
                                   }
                               }
                           }
                       } else {
                           $(".fullScreenSpin").css("display", "none");
                           swal(
                               "Invalid Data Mapping fields ",
                               "Please check that you are importing the correct file with the correct column headers.",
                               "error"
                           );
                       }
                   } else {
                       $(".fullScreenSpin").css("display", "none");
                       swal(
                           "Invalid Data Mapping fields ",
                           "Please check that you are importing the correct file with the correct column headers.",
                           "error"
                       );
                   }
               },
           });
       } else {}
   },
   "change .accountslistchart #sltAccountType": function(e) {
       let templateObject = Template.instance();
       var accountTypeName = $("#sltAccountType").val();

       if (accountTypeName === "BANK") {
           $(".isBankAccount").removeClass("isNotBankAccount");
           $(".isCreditAccount").addClass("isNotCreditAccount");
       } else if (accountTypeName === "CCARD") {
           $(".isCreditAccount").removeClass("isNotCreditAccount");
           $(".isBankAccount").addClass("isNotBankAccount");
       } else {
           $(".isBankAccount").addClass("isNotBankAccount");
           $(".isCreditAccount").addClass("isNotCreditAccount");
       }
       // $('.file-name').text(filename);
       // let selectedFile = event.target.files[0];
       // templateObj.selectedFile.set(selectedFile);
       // if($('.file-name').text() != ""){
       //   $(".btnImport").removeAttr("disabled");
       // }else{
       //   $(".btnImport").Attr("disabled");
       // }
   },
   "click .accountslistchart .btnDeleteAccount": function() {
       playDeleteAudio();
       let templateObject = Template.instance();
       let accountService = new AccountService();
       setTimeout(function(){
       swal({
           title: "Delete Account",
           text: "Are you sure you want to Delete Account?",
           type: "question",
           showCancelButton: true,
           confirmButtonText: "Yes",
       }).then((result) => {
           if (result.value) {
               $(".fullScreenSpin").css("display", "inline-block");

               let accountID = $("#edtAccountID").val();
               if (accountID === "") {
                   window.open("/accountsoverview", "_self");
               } else {
                   let data = {
                       type: "TAccount",
                       fields: {
                           ID: accountID,
                           Active: false,
                       },
                   };

                   accountService
                       .saveAccount(data)
                       .then(function(data) {
                           sideBarService
                               .getAccountListVS1()
                               .then(function(dataReload) {
                                   addVS1Data("TAccountVS1", JSON.stringify(dataReload))
                                       .then(function(datareturn) {
                                           window.open("/accountsoverview", "_self");
                                       })
                                       .catch(function(err) {
                                           window.open("/accountsoverview", "_self");
                                       });
                               })
                               .catch(function(err) {
                                   window.open("/accountsoverview", "_self");
                               });
                       })
                       .catch(function(err) {
                           swal({
                               title: "Oooops...",
                               text: err,
                               type: "error",
                               showCancelButton: false,
                               confirmButtonText: "Try Again",
                           }).then((result) => {
                               if (result.value) {
                                   Meteor._reload.reload();
                               } else if (result.dismiss === "cancel") {}
                           });
                           $(".fullScreenSpin").css("display", "none");
                       });
               }
           } else {}
       });
    }, delayTimeAfterSound);
   },
   'click .accountslistchart #tblDashboardCategory tbody tr': function(e) {
       let category = $(e.target).closest('tr').find(".colReceiptCategory").text() || '';
       let accountName = $(e.target).closest('tr').find(".colAccountName").text() || '';
       let accountID = $(e.target).closest('tr').find(".colAccountID").text() || '';

       $('.expenseCategory').val(category);
       $('#categoryAccountID').val(accountID);
       $('#categoryAccountName').val(accountName);

       $('#categoryListModal').modal('toggle');
   },
   'click .accountslistchart .btnAddNewReceiptCategory': function(event) {
       $('#add-receiptcategory-title').text('Add New Receipt Category');
       $('#edtReceiptCategoryID').val('');
       $('#edtReceiptCategoryName').val('');
       $('#edtReceiptCategoryDesc').val('');
   },
   'click .accountslistchart .btnRefreshCategoryAccount': function(event) {
       $('.fullScreenSpin').css('display', 'inline-block');
       const splashArrayAccountList = [];
       let receiptService = new ReceiptService();
       let sideBarService = new SideBarService();
       let dataSearchName = $('#tblDashboardCategory_filter input').val();
       let categories = [];
       if (dataSearchName.replace(/\s/g, '') !== '') {
           receiptService.getSearchReceiptCategoryByName(dataSearchName).then(function(data) {
               if (data.treceiptcategory.length > 0) {
                   for (let i in data.treceiptcategory) {
                       if (data.treceiptcategory.hasOwnProperty(i)) {
                           categories.push(data.treceiptcategory[i].fields.CategoryName);
                       }
                   }
                   let usedCategories = [];
                   sideBarService.getAccountListVS1().then(function(data) {
                       if (data.taccountvs1.length > 0) {
                           for (let i = 0; i < data.taccountvs1.length; i++) {
                               if (data.taccountvs1[i].fields.ReceiptCategory && data.taccountvs1[i].fields.ReceiptCategory != '') {
                                   usedCategories.push(data.taccountvs1[i].fields);
                               }
                           }
                           usedCategories = [...new Set(usedCategories)];
                           categories.forEach((citem, j) => {
                               let cdataList = null;
                               let match = usedCategories.filter((item) => (item.ReceiptCategory == citem));
                               if (match.length > 0) {
                                   let temp = match[0];
                                   cdataList = [
                                       citem,
                                       temp.AccountName || '',
                                       temp.Description || '',
                                       temp.AccountNumber || '',
                                       temp.TaxCode || '',
                                       temp.ID || ''
                                   ];
                               } else {
                                   cdataList = [
                                       citem,
                                       '',
                                       '',
                                       '',
                                       '',
                                       ''
                                   ];
                               }
                               splashArrayAccountList.push(cdataList);
                           });
                           const datatable = $('#tblDashboardCategory').DataTable();
                           datatable.clear();
                           datatable.rows.add(splashArrayAccountList);
                           datatable.draw(false);
                       }

                   }).catch(function(err) {

                   })
               } else {

                   $('#categoryListModal').modal('toggle');
                   swal({
                       title: 'Question',
                       text: "Category does not exist, would you like to create it?",
                       type: 'question',
                       showCancelButton: true,
                       confirmButtonText: 'Yes',
                       cancelButtonText: 'No'
                   }).then((result) => {
                       if (result.value) {
                           $('#addReceiptCategoryModal').modal('toggle');
                           $('#edtReceiptCategoryName').val(dataSearchName);
                       } else if (result.dismiss === 'cancel') {
                           $('#categoryListModal').modal('toggle');
                       }
                   });
               }
           }).catch(function(err) {

           });
       } else {
           sideBarService.getReceiptCategory().then(function(data) {
               if (data.treceiptcategory.length > 0) {
                   for (let i in data.treceiptcategory) {
                       if (data.treceiptcategory.hasOwnProperty(i)) {
                           categories.push(data.treceiptcategory[i].CategoryName);
                       }
                   }
                   let usedCategories = [];
                   sideBarService.getAccountListVS1().then(function(data) {
                       if (data.taccountvs1.length > 0) {
                           for (let i = 0; i < data.taccountvs1.length; i++) {
                               if (data.taccountvs1[i].fields.ReceiptCategory && data.taccountvs1[i].fields.ReceiptCategory != '') {
                                   usedCategories.push(data.taccountvs1[i].fields);
                               }
                           }
                           usedCategories = [...new Set(usedCategories)];
                           categories.forEach((citem, j) => {
                               let cdataList = null;
                               let match = usedCategories.filter((item) => (item.ReceiptCategory == citem));
                               if (match.length > 0) {
                                   let temp = match[0];
                                   cdataList = [
                                       citem,
                                       temp.AccountName || '',
                                       temp.Description || '',
                                       temp.AccountNumber || '',
                                       temp.TaxCode || '',
                                       temp.ID || ''
                                   ];
                               } else {
                                   cdataList = [
                                       citem,
                                       '',
                                       '',
                                       '',
                                       '',
                                       ''
                                   ];
                               }
                               splashArrayAccountList.push(cdataList);
                           });
                           const datatable = $('#tblDashboardCategory').DataTable();
                           datatable.clear();
                           datatable.rows.add(splashArrayAccountList);
                           datatable.draw(false);
;
                       }
                   }).catch(function(err) {

                   })
               }

           }).catch(function(err) {

           });
       }
   },
   'keyup .accountslistchart #tblDashboardCategory_filter input': function(event) {
       if (event.keyCode === 13) {
           $(".btnRefreshCategoryAccount").trigger("click");
       }
   },
   'click .accountslistchart #addReceiptCategoryModal .btnSave': function(event) {
        playSaveAudio();
        let receiptService = new ReceiptService();
        setTimeout(function(){
       $('.fullScreenSpin').css('display', 'inline-block');

       let receiptCategoryID = $('#edtReceiptCategoryID').val();
       let receiptCategoryName = $('#edtReceiptCategoryName').val();
       if (receiptCategoryName == '') {
           swal('Receipt Category name cannot be blank!', '', 'warning');
           $('.fullScreenSpin').css('display', 'none');
           return false;
       }
       let receiptCategoryDesc = $('#edtReceiptCategoryDesc').val();
       let objDetails = '';
       if (receiptCategoryID == "") {
           receiptService.getOneReceiptCategoryDataExByName(receiptCategoryName).then(function(data) {
               if (data.treceiptcategory.length > 0) {
                   swal('Category name duplicated.', '', 'warning');
                   $('.fullScreenSpin').css('display', 'none');
                   return false;
               } else {
                   objDetails = {
                       type: "TReceiptCategory",
                       fields: {
                           ID: parseInt(receiptCategoryID) || 0,
                           Active: true,
                           CategoryName: receiptCategoryName,
                           CategoryDesc: receiptCategoryDesc
                       }
                   };
                   doSaveReceiptCategory(objDetails);
               }
           }).catch(function(err) {
               objDetails = {
                   type: "TReceiptCategory",
                   fields: {
                       Active: true,
                       CategoryName: receiptCategoryName,
                       CategoryDesc: receiptCategoryDesc
                   }
               };
               // doSaveReceiptCategory(objDetails);
           });
       } else {
           objDetails = {
               type: "TReceiptCategory",
               fields: {
                   ID: parseInt(receiptCategoryID),
                   Active: true,
                   CategoryName: receiptCategoryName,
                   CategoryDesc: receiptCategoryDesc
               }
           };
           doSaveReceiptCategory(objDetails);
       }
    }, delayTimeAfterSound);
       function doSaveReceiptCategory(objDetails) {
           receiptService.saveReceiptCategory(objDetails).then(function(objDetails) {
               sideBarService.getReceiptCategory().then(function(dataReload) {
                   addVS1Data('TReceiptCategory', JSON.stringify(dataReload)).then(function(datareturn) {
                       location.reload(true);
                   }).catch(function(err) {
                       location.reload(true);
                   });
               }).catch(function(err) {
                   location.reload(true);
               });
           }).catch(function(err) {
               swal({
                   title: 'Oooops...',
                   text: err,
                   type: 'error',
                   showCancelButton: false,
                   confirmButtonText: 'Try Again'
               }).then((result) => {
                   if (result.value) {
                       // Meteor._reload.reload();
                   } else if (result.dismiss === 'cancel') {

                   }
               });
               $('.fullScreenSpin').css('display', 'none');
           });
       }

   },
 });
  Template.accountslistchart.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function(a, b) {
            if (a.accountname === "NA") {
                return 1;
            } else if (b.accountname === "NA") {
                return -1;
            }
            return a.accountname.toUpperCase() > b.accountname.toUpperCase() ? 1 : -1;
        });
    },
    bsbRegionName: () => {
        let bsbname = "Branch Code";
        if (Session.get("ERPLoggedCountry") === "Australia") {
            bsbname = "BSB";
        }
        return bsbname;
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get("mycloudLogonID"),
            PrefName: "tblDashboardAccountChartList",
        });
    },
    taxraterecords: () => {
        return Template.instance().taxraterecords.get().sort(function(a, b) {
            if (a.description === "NA") {
                return 1;
            } else if (b.description === "NA") {
                return -1;
            }
            return a.description.toUpperCase() > b.description.toUpperCase() ? 1 : -1;
        });
    },
    isBankAccount: () => {
        return Template.instance().isBankAccount.get();
    },
    loggedCompany: () => {
        return localStorage.getItem("mySession") || "";
    },
    lastBatchUpdate: () => {
        let transactionTableLastUpdated = "";
        var currentDate = new Date();
        if (localStorage.getItem('VS1TransTableUpdate')) {
            transactionTableLastUpdated = moment(localStorage.getItem('VS1TransTableUpdate')).format("ddd MMM D, YYYY, hh:mm A");
        } else {
            transactionTableLastUpdated = moment(currentDate).format("ddd MMM D, YYYY, hh:mm A");
        }
        return transactionTableLastUpdated;
    },
  });
  Template.registerHelper('equals', function (a, b) {
      return a === b;
  });

  Template.registerHelper('notEquals', function (a, b) {
      return a != b;
  });

  Template.registerHelper('containsequals', function (a, b) {
      return (a.indexOf(b) >= 0 );
  });
