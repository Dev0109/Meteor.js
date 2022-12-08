import { ReactiveVar } from "meteor/reactive-var";
// import { isNumber } from "underscore";
import { Random } from "meteor/random";
import { AccountService } from "../../accounts/account-service";
import { EftService } from "../eft-service"


Template.eftExportModal.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.eftOptionsList = new ReactiveVar([]);
  templateObject.accountTypes = new ReactiveVar([]);
  templateObject.transactionDescriptions = new ReactiveVar([]);
  templateObject.bankNames = new ReactiveVar([]);
  templateObject.eftRowId = new ReactiveVar(null);
  templateObject.tabadescriptiverecordList = new ReactiveVar([]);
  templateObject.tabadetailrecordList = new ReactiveVar([]);
});

Template.eftExportModal.onRendered(function () {
  let templateObject = Template.instance();
  let accountService = new AccountService();
  let eftService = new EftService();

  // tempcode
  templateObject.eftRowId.set(Random.id());

  templateObject.transactionDescriptions.set([
    {
      value: 'payroll',
      label: 'Payroll'
    }, {
      value: 'supplier',
      label: 'Supplier'
    }, {
      value: 'insurance',
      label: 'Insurance'
    }
  ]);

  templateObject.bankNames.set([
    {
      value: 'None',
      label: ''
    }
  ]);

  setTimeout(() => {
    $(".eftProcessingDate").datepicker({
      showOn: "button",
      buttonText: "Show Date",
      buttonImageOnly: true,
      buttonImage: "/img/imgCal2.png",
      constrainInput: false,
      dateFormat: "yy/mm/dd",
      showOtherMonths: true,
      selectOtherMonths: true,
      changeMonth: true,
      changeYear: true,
      yearRange: "-90:+10",
      onSelect: function (dateText, inst) {
        // $(".lblAddTaskSchedule").html(moment(dateText).format("YYYY-MM-DD"));
      },
    });
  }, 100);

  templateObject.loadAccountTypes = () => {
    let accountTypeList = [];
    getVS1Data("TAccountType")
      .then(function (dataObject) {
        if (dataObject.length === 0) {
          accountService.getAccountTypeCheck().then(function (data) {
            for (let i = 0; i < data.taccounttype.length; i++) {
              let accounttyperecordObj = {
                accounttypename: data.taccounttype[i].AccountTypeName || " ",
                description: data.taccounttype[i].OriginalDescription || " ",
              };
              accountTypeList.push(accounttyperecordObj);
            }
            templateObject.accountTypes.set(accountTypeList);
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.taccounttype;

          for (let i = 0; i < useData.length; i++) {
            let accounttyperecordObj = {
              accounttypename: useData[i].AccountTypeName || " ",
              description: useData[i].OriginalDescription || " ",
            };
            accountTypeList.push(accounttyperecordObj);
          }
          templateObject.accountTypes.set(accountTypeList);
        }
      })
      .catch(function (err) {
        accountService.getAccountTypeCheck().then(function (data) {
          for (let i = 0; i < data.taccounttype.length; i++) {
            let accounttyperecordObj = {
              accounttypename: data.taccounttype[i].AccountTypeName || " ",
              description: data.taccounttype[i].OriginalDescription || " ",
            };
            accountTypeList.push(accounttyperecordObj);
          }
          templateObject.accountTypes.set(accountTypeList);
        });
      });
  };
  templateObject.loadAccountTypes();

  templateObject.loadTabaDescriptiveRecord = () => {
    let descriptiveList = [];
    getVS1Data("TABADescriptiveRecord")
      .then(function (dataObject) {
        if (dataObject.length === 0) {
          eftService.getTABADescriptiveRecord().then(function (data) {
            for (let i = 0; i < data.tabadescriptiverecord.length; i++) {
              descriptiveList.push(data.tabadescriptiverecord[i].fields);
            }
            templateObject.tabadescriptiverecordList.set(descriptiveList);

          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          for (let i = 0; i < data.tabadescriptiverecord.length; i++) {
            descriptiveList.push(data.tabadescriptiverecord[i].fields);
          }
          templateObject.tabadescriptiverecordList.set(descriptiveList);
        }
      })
      .catch(function (err) {
        eftService.getTABADescriptiveRecord().then(function (data) {
          for (let i = 0; i < data.tabadescriptiverecord.length; i++) {
            descriptiveList.push(data.tabadescriptiverecord[i].fields);
          }
          templateObject.tabadescriptiverecordList.set(descriptiveList);
        });
      });
  }
  // templateObject.loadTabaDescriptiveRecord();

  templateObject.loadTABADetailRecord = () => {
    let descriptiveList = [];
    getVS1Data("TABADetailRecord")
      .then(function (dataObject) {
        if (dataObject.length === 0) {
          eftService.getTABADetailRecord().then(function (data) {
            for (let i = 0; i < data.tabadetailrecord.length; i++) {
              descriptiveList.push(data.tabadetailrecord[i].fields);
            }
            templateObject.tabadetailrecordList.set(descriptiveList);

          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          for (let i = 0; i < data.tabadetailrecord.length; i++) {
            descriptiveList.push(data.tabadetailrecord[i].fields);
          }
          templateObject.tabadetailrecordList.set(descriptiveList);
        }
      })
      .catch(function (err) {
        eftService.getTABADetailRecord().then(function (data) {
          for (let i = 0; i < data.tabadetailrecord.length; i++) {
            descriptiveList.push(data.tabadetailrecord[i].fields);
          }
          templateObject.tabadetailrecordList.set(descriptiveList);
        });
      });
  }
  // templateObject.loadTABADetailRecord();


  templateObject.loadTabaDescriptiveRecordById = (accountId) => {
    let descriptiveList = [];
    try {
      eftService.getTABADescriptiveRecordById(accountId).then(function (data) {
        for (let i = 0; i < data.tabadescriptiverecord.length; i++) {
          descriptiveList.push(data.tabadescriptiverecord[i].fields);
        }
        templateObject.tabadescriptiverecordList.set(descriptiveList);
        if (descriptiveList.length) {
          $('#sltBankName').val(descriptiveList[0].UserBankName);
          $('#eftProcessingDate').val(descriptiveList[0].ProcessingDate);
          $('#eftUserName').val(descriptiveList[0].DirectEntryUserName);
          $('#eftNumberUser').val(descriptiveList[0].DirectEntryUserID);
          $('#sltTransactionDescription').val(descriptiveList[0].TransactionDescription);
        }
        $(".fullScreenSpin").css("display", "none");
      });
    } catch (error) {
      $(".fullScreenSpin").css("display", "none");
    }
  }

  templateObject.loadTABADetailRecordById = (accountId) => {
    let descriptiveList = [];
    try {
      eftService.getTABADetailRecordById(accountId).then(function (data) {
        for (let i = 0; i < data.tabadetailrecord.length; i++) {
          descriptiveList.push(data.tabadetailrecord[i].fields);
        }
        templateObject.tabadetailrecordList.set(descriptiveList);
        $(".fullScreenSpin").css("display", "none");
      });
    } catch (error) {
      $(".fullScreenSpin").css("display", "none");
    }
  }

  $("#sltBankAccountName").editableSelect();

  $("#sltBankAccountName")
    .editableSelect()
    .on("click.editable-select", function (e, li) {
      var $earch = $(this);
      var offset = $earch.offset();
      let accountService = new AccountService();
      const accountTypeList = [];
      var accountDataName = e.target.value || "";
      if (e.pageX > offset.left + $earch.width() - 8) {
        $("#accountListModal").modal();
        $(".fullScreenSpin").css("display", "none");

      } else {
        if (accountDataName.replace(/\s/g, "") != "") {
          getVS1Data("TAccountVS1")
            .then(function (dataObject) {
              if (dataObject.length == 0) {
                accountService
                  .getOneAccountByName(accountDataName)
                  .then(function (data) {
                    setTimeout(function () {
                      $("#addNewAccount").modal("show");
                    }, 500);
                  })
                  .catch(function (err) {
                    $(".fullScreenSpin").css("display", "none");
                  });
              } else {
                let data = JSON.parse(dataObject[0].data);
                var added = false;
                let fullAccountTypeName = "";

                for (let a = 0; a < data.taccountvs1.length; a++) {
                  if (
                    data.taccountvs1[a].fields.AccountName === accountDataName
                  ) {
                    setTimeout(function () {
                      $("#addNewAccount").modal("show");
                    }, 500);
                  }
                }
                if (!added) {
                  accountService
                    .getOneAccountByName(accountDataName)
                    .then(function (data) {
                      setTimeout(function () {
                        $("#addNewAccount").modal("show");
                      }, 500);
                    })
                    .catch(function (err) {
                      $(".fullScreenSpin").css("display", "none");
                    });
                }
              }
            })
            .catch(function (err) {
              accountService
                .getOneAccountByName(accountDataName)
                .then(function (data) {
                  setTimeout(function () {
                    $("#addNewAccount").modal("show");
                  }, 500);
                })
                .catch(function (err) {
                  $(".fullScreenSpin").css("display", "none");
                });
            });
          $("#addAccountModal").modal("toggle");
        } else {
          $("#accountListModal").modal();
        }
      }
    });

  $(document).on("click", "#tblAccount tbody tr", function (e) {
    $(".colAccount").removeClass('boldtablealertsborder');
    var table = $(this);
    let colAccountID = table.find(".colAccountID").text();
    if (colAccountID) {
      $(".fullScreenSpin").css("display", "inline-block");

      templateObject.loadTABADetailRecordById(colAccountID);
      templateObject.loadTabaDescriptiveRecordById(colAccountID);
    }

    let lineProductName = table.find(".productName").text();
    let lineProductDesc = table.find(".productDesc").text();
    let lineAccoutNo = table.find(".accountnumber").text();
    $('#accountListModal').modal('toggle');
    $('#sltBankAccountName').val(lineProductName);
  });

  $("#sltBankName").editableSelect();
  $("#sltBankName")
    .editableSelect()
    .on("click.editable-select", function (e, li) {
      var $earch = $(this);
      var offset = $earch.offset();
      var bankName = e.target.value || "";

      if (e.pageX > offset.left + $earch.width() - 8) {
        $("#bankNameModal").modal();
        $(".fullScreenSpin").css("display", "none");

      } else {
        if (bankName.replace(/\s/g, "") != "") {
          $("#bankNameModal").modal("toggle");
        } else {
          $("#bankNameModal").modal();
        }
      }
    });

  $(document).on("click", "#tblBankName tbody tr", function (e) {
    var table = $(this);
    let BankName = table.find(".bankName").text();
    $('#bankNameModal').modal('toggle');
    $('#sltBankName').val(BankName);
  });


  $("#sltTransactionDescription").editableSelect();
  $("#sltTransactionDescription")
    .editableSelect()
    .on("click.editable-select", function (e, li) {
      var $earch = $(this);
      var offset = $earch.offset();
      var bankName = e.target.value || "";

      if (e.pageX > offset.left + $earch.width() - 8) {
        $("#transactionDescriptionModal").modal();
        $(".fullScreenSpin").css("display", "none");

      } else {
        if (bankName.replace(/\s/g, "") != "") {
          $("#transactionDescriptionModal").modal("toggle");
        } else {
          $("#transactionDescriptionModal").modal();
        }
      }
    });

  $(document).on("click", "#tblTransactionDescription tbody tr", function (e) {
    var table = $(this);
    let transactionDescription = table.find(".transactionDescription").text();
    $('#transactionDescriptionModal').modal('toggle');
    $('#sltTransactionDescription').val(transactionDescription);
  });


  $("#sltTransactionCode").editableSelect();
  $("#sltTransactionCode")
    .editableSelect()
    .on("click.editable-select", function (e, li) {
      var $earch = $(this);
      var offset = $earch.offset();
      var bankName = e.target.value || "";

      if (e.pageX > offset.left + $earch.width() - 8) {
        // $("#transactionCodeModal").modal();
        $(".fullScreenSpin").css("display", "none");

      } else {
        if (bankName.replace(/\s/g, "") != "") {
          // $("#transactionCodeModal").modal("toggle");
        } else {
          // $("#transactionCodeModal").modal();
        }
      }
    });

  $(document).on("click", "#tblTransactionCode tbody tr", function (e) {
    var table = $(this);
    let transactionDescription = table.find(".transactionDescription").text();
    $('#transactionCodeModal').modal('toggle');
    $('#sltTransactionCode').val(transactionDescription);
  });
});

Template.eftExportModal.events({

  "click .btnOptionsEft": () => {
    $('#eftOptionsModal').modal('toggle');
  },

  "click .btnSelectAllEft": () => {
    $('.isApply').prop('checked', true);
  },

  "click .btnCancelEftExport": (e) => {
    playCancelAudio();
    setTimeout(function () {
      $('#eftExportModal').modal('hide');
    }, delayTimeAfterSound);
  },

  "click .addNewEftRow": (e) => {
    e.preventDefault();
    let tokenid = Random.id();

    let transactionCodes = `
      <select class="form-control pointer sltTranslactionCode">
        <option value=""></option>
        <option value="">Debit Items</option>
        <option value="">Credit Items</option>
      </select>
    `;
    $('#eftExportTableBody').append(`
      <tr id="${tokenid}">
        <td class="colApply">
          <input type="checkbox" class="isApply" />
        </td>
        <td class="colAccountName">
          <input type="text" class="form-control eftInput eftInputAccountName" />
        </td>
        <td class="colBsb">
          <input type="text" class="form-control eftInput eftInputBsb" placeholder="___-___" />
        </td>
        <td class="colAccountNo">
          <input type="text" class="form-control eftInput eftInputAccountNo" />
        </td>
        <td class="colTransactionCode">
          ${transactionCodes}
        </td>
        <td class="colLodgement">
          <input type="text" class="form-control eftInput eftInputTransactionCode" />
        </td>
        <td class="colAmount">
          <input type="text" class="form-control eftInput eftInputAmount text-right" />
        </td>
        <td class="colFromBsb">
          <input type="text" class="form-control eftInput eftInputFromBsb" placeholder="___-___" />
        </td>
        <td class="colFromAccountNo">
          <input type="text" class="form-control eftInput eftInputFromAccountNo" />
        </td>
        <td class="colIdx addNewRow" style="width: 25px">
          <span class="table-remove btnEftRemove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>
        </td>
      </tr>
    `);
  },


  "click .btnEftRemove": function (event) {

    try {

      var targetID = $(event.target).closest("tr").attr("id");
      $(event.target).closest("tr").remove();
      $("#eftExportTable #" + targetID).remove();
    } catch (error) {

    }

  },

  "keypress .eftInputAmount": (e) => {
    if (e.which === 13) {
    }
  },

  "change .eftInputAmount": function (e) {
    let sum = 0;
    $('.eftInputAmount').each(function () {
      let val = parseFloat($(this).val())
      if (isNaN(val)) {
        $(this).val('');
        val = 0;
      }
      sum += val;
    });
    $('#totalAmount').html(sum.toFixed(2))
  },

  "click .btnDoEftExport": (e) => {
    playSaveAudio();
    setTimeout(function () {
      let sltAccountType = $('#sltAccountType').val();
      let sltBankName = $('#sltBankName').val();
      let eftProcessingDate = $('#eftProcessingDate').val();
      let eftUserName = $('#eftUserName').val();
      let eftNumberUser = $('#eftNumberUser').val();
      let sltTransactionDescription = $('#sltTransactionDescription').val();

      if (!sltAccountType) {
        swal("Please input Account Name", "", "error");
        return false;
      } else if (!sltBankName) {
        swal("Please input Bank Name", "", "error");
        return false;
      } else if (!eftProcessingDate) {
        swal("Please input Processing Date", "", "error");
        return false;
      } else if (!eftUserName) {
        swal("Please input User Name", "", "error");
        return false;
      } else if (!eftNumberUser) {
        swal("Please input Number of User", "", "error");
        return false;
      } else if (!sltTransactionDescription) {
        swal("Please input Transaction Description", "", "error");
        return false;
      }



      var arrData = [];
      var eftData = '';
      $("#eftExportTableBody tr").each(function () {
        var currentRow = $(this);
        var accountName = '';
        var colBsb = '';
        var colAccountNo = '';
        var colTransactionCode = '';
        var colLodgement = '';
        var colAmount = '';
        var colFromBsb = '';
        var colFromAccountNo = '';

        currentRow.find("td:eq(0)").find("input").each(function () {
          if (this.checked) {
            currentRow.find("td:eq(1)").find("input").each(function () {
              accountName = this.value
            });

            currentRow.find("td:eq(2)").find("input").each(function () {
              colBsb = this.value
            });

            currentRow.find("td:eq(3)").find("input").each(function () {
              colAccountNo = this.value
            });

            currentRow.find("td:eq(4)").find("select").each(function () {
              colTransactionCode = this.value
            });

            currentRow.find("td:eq(5)").find("input").each(function () {
              colLodgement = this.value
            });

            currentRow.find("td:eq(6)").find("input").each(function () {
              colAmount = this.value
            });

            currentRow.find("td:eq(7)").find("input").each(function () {
              colFromBsb = this.value
            });

            currentRow.find("td:eq(8)").find("input").each(function () {
              colFromAccountNo = this.value
            });

            eftData += colBsb + ' ' + colAccountNo + ' ' + accountName + ' ' + colLodgement + colFromBsb + ' ' + colFromAccountNo + '\n'

            var obj = {};
            obj.accountName = accountName;
            obj.bsb = colBsb;
            obj.accountNo = colAccountNo;
            obj.transactionCode = colTransactionCode;
            obj.lodgement = colLodgement;
            obj.amount = colAmount;
            obj.fromBsb = colFromBsb;
            obj.fromAccountNo = colFromAccountNo;

            arrData.push(obj);
          }
        });
      });

      $(".fullScreenSpin").css("display", "inline-block");
      const link = document.createElement("a");
      const content = sltAccountType + sltBankName + moment(eftProcessingDate).format("DDMMYY") + eftUserName + eftNumberUser + sltTransactionDescription + '\n' + eftData;
      const file = new Blob([content], { type: 'text/plain' });
      link.href = URL.createObjectURL(file);
      link.download = "eft" + (new Date()).getTime() + ".aba";
      link.click();
      URL.revokeObjectURL(link.href);
      $(".fullScreenSpin").css("display", "none");

      return true;
    }, delayTimeAfterSound);
  },

});

Template.eftExportModal.helpers({
  accountTypes: () => {
    return Template.instance()
      .accountTypes.get()
      .sort(function (a, b) {
        if (a.description === "NA") {
          return 1;
        } else if (b.description === "NA") {
          return -1;
        }
        return a.description.toUpperCase() > b.description.toUpperCase() ? 1 : -1;
      });
  },

  transactionDescriptions: () => {
    return Template.instance().transactionDescriptions.get();
  },

  eftRowId: () => {
    return Template.instance().eftRowId.get();
  },

  tabadescriptiverecordList: () => {
    return Template.instance().tabadescriptiverecordList.get();
  },

  tabadetailrecordList: () => {
    return Template.instance().tabadetailrecordList.get();
  }


});
