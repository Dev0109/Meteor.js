import { ReactiveVar } from "meteor/reactive-var";
import { TaxRateService } from "../settings-service";
import "../../lib/global/indexdbstorage.js";
import LoadingOverlay from "../../LoadingOverlay";
import CachedHttp from "../../lib/global/CachedHttp";
import erpObject from "../../lib/global/erp-objects";

const settingService = new TaxRateService();
const settingFields = ["VS1XECLIENTID", "VS1XEAPIKEY"];
const specialSearchKey = "vs1xecurrencysettings";

Template.xecurrencies.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.settingDetails = new ReactiveVar([]);
});

Template.xecurrencies.onRendered(function () {
  const templateObject = Template.instance();

  templateObject.getSettingsList = async function () {
    LoadingOverlay.show();
    let data = [];
    let details = [];
    let dataObject = await getVS1Data("TERPPreference");
    if (dataObject.length > 0) {
      data = JSON.parse(dataObject[0].data);
      details = data.terppreference.filter(function (item) {
        if (settingFields.includes(item.PrefName)) {
          return item;
        }
      });
    }
    if (details.length == 0) {
      prefSettings = await settingService.getPreferenceSettings(settingFields);
      details = prefSettings.terppreference;
      data.terppreference.push(...details);
      await addVS1Data("TERPPreference", JSON.stringify(data));
    }

    if (details.length > 0) {
      templateObject.settingDetails.set(details);
      for (const item of details) {
        $("#" + item.PrefName).val(item.Fieldvalue);
      }
    }
    $(".fullScreenSpin").css("display", "none");
  };

  templateObject.getSettingsList();
});

Template.xecurrencies.events({
  "click #xeCurrenciesSignUp": function () {
    window.open(
      "https://accounts.xe.com/signup?client_id=hoqkluj0h25d805a6ru8n3t4n&redirect_uri=https%3A%2F%2Fxecd-account-api.xe.com%2Foauth2%2Fidpresponse&response_type=code&scope=openid%20email&state=s%2BUkvTCXxsFy2c4nox%2BRaqhKQ%2Bdhnb9msxB3N7RJhJKgtzXrY4A%2FKBNW3BFUqc3I5%2BYljo14kJcAsrd%2Bwq4FnTgSsNDFjh4wwbIIY7WJRgfd3bjdVk6TJITt7A6EZJ7ugtEO6KsrR1QznOA2A9niWnvO8xGSCwbwIv8UvxaXKrSz%2FC%2FR07LPAbvv5MZurqrUJJYsIoBiibeebgFe8Q%3D%3D"
    );
  },
  "click #saveXeCurrencySettings": async function (event) {
    playSaveAudio();
    let templateObject = Template.instance();
    setTimeout(async function () {
      $(".fullScreenSpin").css("display", "block");
      let settingObject = [];

      let settingDetails = templateObject.settingDetails.get();
      if (settingDetails.length > 0) {
        for (const item of settingDetails) {
          if (settingFields.includes(item.PrefName) == true) {
            let FieldValue = $("#" + item.PrefName).val();
            settingObject.push({
              type: "TERPPreference",
              fields: {
                Id: item.Id,
                Fieldvalue: FieldValue,
              },
            });
          }
        }
      } else {
        for (const PrefName of settingFields) {
          let FieldValue = $("#" + PrefName).val();
          settingObject.push({
            type: "TERPPreference",
            fields: {
              FieldType: "ftString",
              FieldValue: FieldValue,
              KeyValue: specialSearchKey,
              PrefName: PrefName,
              PrefType: "ptCompany",
              RefType: "None",
            },
          });
        }
      }
      if (settingObject.length) {
        let settingJSON = {
          type: "TERPPreference",
          objects: settingObject,
        };

        try {
          // Saving data
          let ApiResponse = await settingService.savePreferenceSettings(
            settingJSON
          );
          if (ApiResponse.result == "Success") {
            let data = await settingService.getPreferenceSettings(
              settingFields
            );
            let dataObject = await getVS1Data("TERPPreference");
            let details = [];
            if (dataObject.length > 0) {
              dataObj = JSON.parse(dataObject[0].data);
              details = dataObj.terppreference.filter(function (item) {
                if (settingFields.includes(item.PrefName) == false) {
                  return item;
                }
              });
              templateObject.settingDetails.set(data.terppreference);
              data.terppreference.push(...details);
              await addVS1Data("TERPPreference", JSON.stringify(data));
              $(".fullScreenSpin").css("display", "none");
            }
            swal({
              title: "XE Currency settings successfully updated!",
              text: "",
              type: "success",
              showCancelButton: false,
              confirmButtonText: "OK",
            });
          } else {
            $(".fullScreenSpin").css("display", "none");
            swal({
              title: "Oooops...",
              text: "Error in updation",
              type: "error",
              showCancelButton: false,
              confirmButtonText: "Try Again",
            });
          }
        } catch (error) {
          $(".fullScreenSpin").css("display", "none");
          swal({
            title: "Oooops...",
            text: error,
            type: "error",
            showCancelButton: false,
            confirmButtonText: "Try Again",
          });
        }
      }
    }, delayTimeAfterSound);
  },
});

export const getXeCurrencyKeys = async () => {
  let data = await CachedHttp.get(
    erpObject.TERPPreference,
    async () => {
      return await settingService.getPreferenceSettings(settingFields);
    },
    {
      validate: (cachedResponse) => {
        return true;
      },
    }
  );

  let response = data.response;

  let prefs = response.terppreference.filter((pref) =>
    settingFields.includes(pref.PrefName)
  );

  if (
    prefs.find((pref) => settingFields[0]) == undefined ||
    prefs.find((pref) => settingFields[1]) == undefined
  ) {
    // If there is no Xe Account in the database, it will ask a question to add or not
    LoadingOverlay.hide(0);
    const result = await swal({
      title: "No XE Currency account found",
      text: "Do you wish to add an account ?",
      type: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (result.value) {
      const url =
        "https://accounts.xe.com/login?client_id=hoqkluj0h25d805a6ru8n3t4n&redirect_uri=https%3A%2F%2Fxecd-account-api.xe.com%2Foauth2%2Fidpresponse&response_type=code&scope=openid%20email&state=s%2BUkvTCXxsFy2c4nox%2BRaqhKQ%2Bdhnb9msxB3N7RJhJKgtzXrY4A%2FKBNW3BFUqc3I5%2BYljo14kJcAsrd%2Bwq4FnTgSsNDFjh4wwbIIY7WJRgfd3bjdVk6TJITt7A6EZJ7ugtEO6KsrR1QznOA2A9niWnvO8xGSCwbwIv8UvxaXKrSz%2FC%2FR07LPAbvv5MZurqrUJJYsIoBiibeebgFe8Q%3D%3D";
      window.open(url);
      return false;
    } else if (result.dismiss === "cancel") {
      return false;
    }
  }

  return {
    ApiClientId: prefs.find((pref) => settingFields[0]),
    ApiSecretKey: prefs.find((pref) => settingFields[1]),
  };
};
