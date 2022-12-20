import { SideBarService } from "../../js/sidebar-service";
import LoadingOverlay from "../../LoadingOverlay";
import "jquery-ui-dist/external/jquery/jquery";
import "jquery-ui-dist/jquery-ui";
import "../../lib/global/indexdbstorage.js";

let sideBarService = new SideBarService();

const TransactionTypeTemplates = {
  sales: [
    {
      name: "Delivery Docket",
      title: "Delivery Docket",
      key: "delivery_docket",
      active: true,
    },
    {
      name: "Sales Orders",
      title: "Sales Orders",
      key: "sales_order",
      active: true,
    },
  ],
  bills: [
    {
      name: "bill",
      title: "Bills",
      key: "bill",
      active: true,
    },
  ],
  cheques: [
    {
      name: "Cheques",
      title: "Cheques",
      key: "cheque",
      active: true,
    },
  ],
  credits: [
    {
      name: "Credits",
      title: "Credits",
      key: "credit",
      active: true,
    },
  ],
  invoices: [
    {
      name: "Invoices",
      title: "Invoices",
      key: "invoice",
      active: true,
    },
    {
      name: "Invoice Back Orders",
      title: "Invoice Back Orders",
      key: "invoice",
      active: false,
    },
    {
      name: "Delivery Docket",
      title: "Delivery Docket",
      key: "delivery_docket",
      active: true,
    },
  ],
  refunds: [
    {
      name: "Refunds",
      title: "Refunds",
      key: "refund",
      active: true,
    },
  ],
  workorders: [
    {
      name: "Delivery Docket",
      title: "Delivery Docket",
      key: "delivery_docket",
      active: true,
    },
    {
      name: "Sales Orders",
      title: "Sales Orders",
      key: "sales_order",
      active: true,
    },
  ],
  supplierpayments: [
    {
      name: "Supplier Payments",
      title: "Supplier Payments",
      key: "supplier_payment",
      active: true,
    },
  ],
  purchaseorders: [
    {
      name: "Purchase Orders",
      title: "Purchase Orders",
      key: "purchase_order",
      active: true,
    },
  ],
  quotes: [
    {
      name: "Quotes",
      title: "Quotes",
      key: "quote",
      active: true,
    },
  ],
};

Template.transaction_print_modal.onCreated(async function () {
  const templateObject = Template.instance();
  const transactionType = templateObject.data.TransactionType;
  const pageData = templateObject.data.data;

  const getTemplates = async () => {
    const vs1Data = await getVS1Data("TTemplateSettings");

    if (vs1Data.length == 0) {
      const templateInfomation = await sideBarService.getTemplateInformation(
        initialBaseDataLoad,
        0
      );

      addVS1Data("TTemplateSettings", JSON.stringify(templateInfomation));

      const templates = TransactionTypeTemplates[transactionType]
        .filter((item) => item.active)
        .map((template) => {
          let templateList = templateInfomation.ttemplatesettings
            .filter((item) => item.fields.SettingName == template.name)
            .sort((a, b) => a.fields.Template - b.fields.Template);

          templateList = ["1", "2", "3"].map((item) => ({
            fields: {
              SettingName: template.name,
              Template: item,
              Description: `Template ${item}`,
            },
            type: "TTemplateSettings",
          }));
          return {
            templateName: template.name,
            templateList,
          };
        });

      console.log("vs1Data.length == 0", templates);

      return templates;
    } else {
      const vs1DataList = JSON.parse(vs1Data[0].data);
      const templates = TransactionTypeTemplates[transactionType]
        .filter((item) => item.active)
        .map((template) => {
          let templateList = vs1DataList.ttemplatesettings
            .filter((item) => item.fields.SettingName == template.name)
            .sort((a, b) => a.fields.Template - b.fields.Template);

          if (templateList.length === 0) {
            templateList = ["1", "2", "3"].map((item) => ({
              fields: {
                SettingName: template.name,
                Template: item,
                Description: `Template ${item}`,
              },
              type: "TTemplateSettings",
            }));
          }
          return {
            templateName: template.name,
            templateList,
          };
        });

      console.log("vs1Data.length != 0", templates);

      return templates;
    }
  };

  const templates = await getTemplates();

  this.templates = new ReactiveVar(templates);
});

Template.transaction_print_modal.onRendered(function () {
  const templateObject = Template.instance();
  const transactionType = templateObject.data.TransactionType;

  $("#printModal").on("show.bs.modal", function (e) {
    $("#printModal").css("z-index", 1049);
    const templates = templateObject.templates.get();
    templates.forEach((templateType) => {
      templateType.templateList.forEach((template) => {
        const templateKey = TransactionTypeTemplates[transactionType].find(
          (transation) => transation.name === template.fields.SettingName
        ).key;
        if (template.fields.Active) {
          // console.log({ template, templateKey })
          $(`#${templateKey}_${template.fields.Template}`).prop(
            "checked",
            true
          );
        }
      });
    });
  });
});

Template.transaction_print_modal.helpers({
  printTypeTemplates: () => {
    return Template.instance().templates
      ? Template.instance().templates.get()
      : null;
  },
  isChecked: (status) => {
    return status ? { checked: "checked" } : null;
  },
  getTemplate: (TransactionType, templateName) => {
    return TransactionTypeTemplates[TransactionType].find(
      (template) => template.name === templateName
    );
  },
  getTemplateTitle: (TransactionType, templateName) => {
    return TransactionTypeTemplates[TransactionType].find(
      (template) => template.name === templateName
    ).title;
  },
  getTemplateKey: (TransactionType, templateName) => {
    return TransactionTypeTemplates[TransactionType].find(
      (template) => template.name === templateName
    ).key;
  },
});

Template.transaction_print_modal.events({
  "click #deliveryDocket": function (event) {
    const checked = event.currentTarget.checked;
  },
  "click #printModal .printConfirm": async function (event) {
    const templateObject = Template.instance();
    playPrintAudio();
    const isCheckedEmail = $("#printModal #emailSend").is(":checked");
    const isCheckedSms = $("#printModal #sms").is(":checked");
    const data = await Template.new_salesorder.__helpers
      .get("printEmailData")
      .call();
    
    console.log({ data });

    if (isCheckedEmail && validateEmail(data.checkEmailData)) {
      LoadingOverlay.show();
      Meteor.call(
        "sendEmail",
        {
          from: "" + data.mailFromName + " <" + data.mailFrom + ">",
          to: data.checkEmailData,
          subject: data.mailSubject,
          text: "",
          html: data.htmlmailBody,
          attachments: data.attachment,
        },
        function (error, result) {
          if (error && error.error === "error") {
            console.log("Send email: ", { error, result })
            if (FlowRouter.current().queryParams.trans) {
              // FlowRouter.go(
              //   "/customerscard?id=" +
              //     FlowRouter.current().queryParams.trans +
              //     "&transTab=active"
              // );
            } else {
              // FlowRouter.go("/salesorderslist?success=true");
            }
          } else {
          }
          LoadingOverlay.hide();
        }
      );
    } else {
      console.log('Check Customer Email.');
    }
  },
});
