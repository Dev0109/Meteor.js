import { ReactiveVar } from "meteor/reactive-var";
import "../lib/global/erp-objects";
import "../lib/global/indexdbstorage.js";
import "jquery-editable-select";
import { bankNameList } from "../lib/global/bank-names";
import { AccountService } from "../accounts/account-service";
import LoadingOverlay from "../LoadingOverlay";

let accountService = new AccountService();

const successSaveCb = () => {
    // LoadingOverlay.hide();
    playSaveAudio();
    swal({
        title: "Bank Rule Successfully Saved",
        text: "",
        type: "success",
        showCancelButton: false,
        confirmButtonText: "OK",
    });
}

const errorSaveCb = (err) => {
    // console.log(err);
    // LoadingOverlay.hide();
    swal("Something went wrong", "", "error");
}

function openBankAccountListModal() {
  $("#bankAccountListModal").modal();
  setTimeout(function () {
    $("#tblAccount_filter .form-control-sm").focus();
    $("#tblAccount_filter .form-control-sm").val("");
    $("#tblAccount_filter .form-control-sm").trigger("input");
    const datatable = $("#tblAccountlist").DataTable();
    datatable.draw();
    $("#tblAccountlist_filter .form-control-sm").trigger("input");
  }, 500);
}

function setOneAccountByName(accountDataName) {
  accountService
    .getOneAccountByName(accountDataName)
    .then(function (data) {
      setBankAccountData(data);
    })
    .catch(function (err) {
      $(".fullScreenSpin").css("display", "none");
    });
}

function setBankAccountData(data, i = 0) {
  let fullAccountTypeName = "";
  $("#add-account-title").text("Edit Account Details");
  $("#edtAccountName").attr("readonly", true);
  $("#sltAccountType").attr("readonly", true);
  $("#sltAccountType").attr("disabled", "disabled");
  const accountid = data.taccountvs1[i].fields.ID || "";
  const accounttype =
    fullAccountTypeName || data.taccountvs1[i].fields.AccountTypeName;
  const accountname = data.taccountvs1[i].fields.AccountName || "";
  const accountno = data.taccountvs1[i].fields.AccountNumber || "";
  const taxcode = data.taccountvs1[i].fields.TaxCode || "";
  const accountdesc = data.taccountvs1[i].fields.Description || "";
  const bankaccountname = data.taccountvs1[i].fields.BankAccountName || "";
  const bankbsb = data.taccountvs1[i].fields.BSB || "";
  const bankacountno = data.taccountvs1[i].fields.BankAccountNumber || "";
  const swiftCode = data.taccountvs1[i].fields.Extra || "";
  const routingNo = data.taccountvs1[i].fields.BankCode || "";
  const showTrans = data.taccountvs1[i].fields.IsHeader || false;
  const cardnumber = data.taccountvs1[i].fields.CarNumber || "";
  const cardcvc = data.taccountvs1[i].fields.CVC || "";
  const cardexpiry = data.taccountvs1[i].fields.ExpiryDate || "";

  if (accounttype == "BANK") {
    $(".isBankAccount").removeClass("isNotBankAccount");
    $(".isCreditAccount").addClass("isNotCreditAccount");
  } else if (accounttype == "CCARD") {
    $(".isCreditAccount").removeClass("isNotCreditAccount");
    $(".isBankAccount").addClass("isNotBankAccount");
  } else {
    $(".isBankAccount").addClass("isNotBankAccount");
    $(".isCreditAccount").addClass("isNotCreditAccount");
  }

  $("#edtAccountID").val(accountid);
  $("#sltAccountType").val(accounttype);
  $("#sltAccountType").append(
    '<option value="' +
      accounttype +
      '" selected="selected">' +
      accounttype +
      "</option>"
  );
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
  $("#edtExpiryDate").val(
    cardexpiry ? moment(cardexpiry).format("DD/MM/YYYY") : ""
  );
  $("#edtCvc").val(cardcvc);

  if (showTrans == "true") {
    $(".showOnTransactions").prop("checked", true);
  } else {
    $(".showOnTransactions").prop("checked", false);
  }

  setTimeout(function () {
    $("#addNewAccount").modal("show");
  }, 500);
}

Template.newbankrule.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.bankRuleData = new ReactiveVar([]);
  templateObject.bankNames = new ReactiveVar([]);
  templateObject.importData = new ReactiveVar([])
});

Template.newbankrule.onRendered(function () {
  const templateObject = Template.instance();
  templateObject.bankNames.set(bankNameList);
  templateObject.bankRuleData.set([]);
  $("#sltBankAccount").editableSelect();
  $("#sltBankAccount")
    .editableSelect()
    .on("click.editable-select", function (e, li) {
      const $each = $(this);
      const offset = $each.offset();
      let accountDataName = e.target.value || "";
      if (e.pageX > offset.left + $each.width() - 8) {
        // X button 16px wide?
        openBankAccountListModal();
      } else {
        if (accountDataName.replace(/\s/g, "") != "") {
          getVS1Data("TAccountVS1")
            .then(function (dataObject) {
              if (dataObject.length == 0) {
                setOneAccountByName(accountDataName);
              } else {
                let data = JSON.parse(dataObject[0].data);
                let added = false;
                for (let a = 0; a < data.taccountvs1.length; a++) {
                  if (
                    data.taccountvs1[a].fields.AccountName == accountDataName
                  ) {
                    added = true;
                    setBankAccountData(data, a);
                  }
                }
                if (!added) {
                  setOneAccountByName(accountDataName);
                }
              }
            })
            .catch(function (err) {
              setOneAccountByName(accountDataName);
            });
          $("#addAccountModal").modal("toggle");
        } else {
          openBankAccountListModal();
        }
      }
    });

    if (FlowRouter.current().queryParams.bankaccountid) {
      let accountname = FlowRouter.current().queryParams.bankaccountname;
      let accountId = FlowRouter.current().queryParams.bankaccountid;
      $("#sltBankAccount").val(accountname);
      $("#sltBankAccountID").val(accountId);
      getVS1Data("VS1_BankRule")
        .then(function (dataObject) {
          if (dataObject.length) {
            let data = JSON.parse(dataObject[0].data);
            templateObject.bankRuleData.set(data[accountId] ? data[accountId] : []);
          }
        })
        .catch(function (err) {
            errorSaveCb(err)
        });
    }

    if (FlowRouter.current().queryParams.preview && FlowRouter.current().queryParams.bankaccountid === $("#sltBankAccountID").val()) {
      let tmp = localStorage.getItem('BankStatement')
      if (tmp)
        templateObject.importData.set(JSON.parse(tmp))
    }

  $(document).on("click", ".newbankrule #tblAccount tbody tr", function (e) {
    $(".colAccountName").removeClass("boldtablealertsborder");
    $(".colAccount").removeClass("boldtablealertsborder");
    const table = $(this);
    let accountname = table.find(".productName").text();
    let accountId = table.find(".colAccountID").text();
    $("#bankAccountListModal").modal("toggle");
    $("#sltBankAccount").val(accountname);
    $("#sltBankAccountID").val(accountId);
    $("#tblAccount_filter .form-control-sm").val("");
    if (FlowRouter.current().queryParams.preview && FlowRouter.current().queryParams.bankaccountid === $("#sltBankAccountID").val()) {
      let tmp = localStorage.getItem('BankStatement')
      if (tmp)
        templateObject.importData.set(JSON.parse(tmp))
      else
        templateObject.importData.set([])
    } else {
      templateObject.importData.set([])
    }
    getVS1Data("VS1_BankRule")
        .then(function (dataObject) {
          if (dataObject.length) {
            let data = JSON.parse(dataObject[0].data);
            templateObject.bankRuleData.set(data[accountId] ? data[accountId] : []);
          }
        })
        .catch(function (err) {
            errorSaveCb(err)
        });
  });
});

Template.newbankrule.events({
  "change .lineColumn": function (event) {
    let dataId = $(event.currentTarget).data("id");
    let tmp = Template.instance().bankRuleData.get();
    tmp[dataId].column = $(event.currentTarget).val();
    Template.instance().bankRuleData.set(tmp);
  },
  "blur .lineOrder": function (event) {
    let dataId = $(event.currentTarget).data("id");
    let tmp = Template.instance().bankRuleData.get();
    let tmpValue = $(event.currentTarget).val();
    if (tmpValue > 0 && tmpValue <= tmp.length) {
      for (let index = 0; index < tmp.length; index++) {
        if (tmp[index].order == tmpValue) {
          tmp[index].order = tmp[dataId].order;
          tmp[dataId].order = tmpValue;
          break;
        }
      }
      tmp[dataId].order = tmpValue;
    } else {
      $(event.currentTarget).val(tmp[dataId].order);
    }
    Template.instance().bankRuleData.set(tmp);
  },
  "click .btnRemove": function (event) {
    event.preventDefault();
    let dataId = $(event.currentTarget).data("id");
    let tmp = Template.instance().bankRuleData.get();
    tmp.splice(dataId, 1);
    Template.instance().bankRuleData.set(tmp);
  },
  "click #addLineColumn": function () {
    let noDataLine = null;
    noDataLine = $("#tblBankRule tbody #noData");
    if (noDataLine != null) {
      noDataLine.remove();
    }
    let tmp = Template.instance().bankRuleData.get();
    tmp.push({ order: tmp.length + 1, column: "" });
    Template.instance().bankRuleData.set(tmp);
  },

  "click .btnSave": function (event) {
    let tmp = Template.instance().bankRuleData.get();
    if (tmp.length === 0) {
      swal("Please add columns", "", "error");
    } else if ($("#sltBankAccountID").val() === "") {
      swal("Please select bank account", "", "error");
    } else {
      // LoadingOverlay.show();
      let accountId = $("#sltBankAccountID").val();
      let saveData = {
        [accountId]: Template.instance().bankRuleData.get(),
      };
      getVS1Data("VS1_BankRule")
        .then(function (dataObject) {
          if (dataObject.length == 0) {
            addVS1Data("VS1_BankRule", JSON.stringify(saveData)).then(function (datareturn) {
                successSaveCb()
            }).catch(function (err) {
                errorSaveCb(err)
            });
          } else {
            let data = JSON.parse(dataObject[0].data);
            data[accountId] = saveData[accountId];
            addVS1Data("VS1_BankRule", JSON.stringify(data)).then(function (datareturn) {
                successSaveCb()
            }).catch(function (err) {
                errorSaveCb(err)
            });
          }
        })
        .catch(function (err) {
            errorSaveCb(err)
        });
    }
  },
});

Template.newbankrule.helpers({
  bankRuleData: () => {
    return Template.instance().bankRuleData.get();
  },
  bankNames: () => {
    return Template.instance()
      .bankNames.get()
      .sort(function (a, b) {
        return a.name > b.name ? 1 : -1;
      });
  },
  previewColumn: () => [...Template.instance()
    .bankRuleData.get()]
    .sort((a,b) => a.order > b.order ? 1 : -1),
  previewData: () => {
    let tmpCol = [...Template.instance()
      .bankRuleData.get()]
      .sort((a,b) => a.order > b.order ? 1 : -1)
    let tmpData = []
    let tmpImport = Template.instance().importData.get()
    for (let rowIndex = 1; rowIndex < tmpImport.length; rowIndex++) {
      let tmpRow = []
      for (let colIndex = 0; colIndex < tmpCol.length; colIndex++) {
        let matchIndex = tmpImport[0].indexOf(tmpCol[colIndex].column)
        tmpRow.push(matchIndex === -1 ? null : tmpImport[rowIndex][matchIndex])
      }
      tmpData.push(tmpRow)
    }
    return tmpData
  },
});
