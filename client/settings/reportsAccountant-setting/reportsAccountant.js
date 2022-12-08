import { OrganisationService } from "../../js/organisation-service";
import { CountryService } from "../../js/country-service";
import { ReactiveVar } from "meteor/reactive-var";
import { SideBarService } from "../../js/sidebar-service";
import "../../lib/global/indexdbstorage.js";
import LoadingOverlay from "../../LoadingOverlay";
let sideBarService = new SideBarService();
let organisationService = new OrganisationService();

Template.reportsAccountantSettings.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.showSkype = new ReactiveVar();
  templateObject.showMob = new ReactiveVar();
  templateObject.showFax = new ReactiveVar();
  templateObject.showLinkedIn = new ReactiveVar();
  templateObject.countryList = new ReactiveVar([]);
  templateObject.showPoAddress = new ReactiveVar();
  templateObject.phCity = new ReactiveVar();
  templateObject.samePhysicalAddress1 = new ReactiveVar();
  templateObject.samePhysicalAddress2 = new ReactiveVar();
  templateObject.samePhysicalAddress3 = new ReactiveVar();
  templateObject.phState = new ReactiveVar();
  templateObject.phCountry = new ReactiveVar();
  templateObject.phCode = new ReactiveVar();
  templateObject.phAttention = new ReactiveVar();
  templateObject.countryData = new ReactiveVar();
  templateObject.hideCreateField = new ReactiveVar();
  templateObject.paAddress1 = new ReactiveVar();
  templateObject.paAddress2 = new ReactiveVar();
  templateObject.paAddress3 = new ReactiveVar();
  templateObject.phAddress1 = new ReactiveVar();
  templateObject.phAddress2 = new ReactiveVar();
  templateObject.phAddress3 = new ReactiveVar();
  templateObject.fieldLength = new ReactiveVar();
  templateObject.completePoAddress = new ReactiveVar();
  templateObject.completePhAddress = new ReactiveVar();
  templateObject.imageFileData = new ReactiveVar();

  templateObject.isSameAddress = new ReactiveVar();
  templateObject.isSameAddress.set(false);

  templateObject.iscompanyemail = new ReactiveVar();
  templateObject.iscompanyemail.set(false);

  templateObject.isChkUSRegionTax = new ReactiveVar();
  templateObject.isChkUSRegionTax.set(false);
});

Template.reportsAccountantSettings.onRendered(function () {
  $(".fullScreenSpin").css("display", "inline-block");
  const templateObject = Template.instance();
  let countries = [];

  var countryService = new CountryService();
  templateObject.getCountryData = function () {
    getVS1Data("TCountries")
      .then(function (dataObject) {
        if (dataObject.length == 0) {
          countryService.getCountry().then((data) => {
            for (let i = 0; i < data.tcountries.length; i++) {
              countries.push(data.tcountries[i].Country);
            }
            countries.sort((a, b) => a.localeCompare(b));
            templateObject.countryData.set(countries);
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.tcountries;
          for (let i = 0; i < useData.length; i++) {
            countries.push(useData[i].Country);
          }
          countries.sort((a, b) => a.localeCompare(b));
          templateObject.countryData.set(countries);
        }
      })
      .catch(function (err) {
        countryService.getCountry().then((data) => {
          for (let i = 0; i < data.tcountries.length; i++) {
            countries.push(data.tcountries[i].Country);
          }
          countries.sort((a, b) => a.localeCompare(b));
          templateObject.countryData.set(countries);
        });
      });
  };
  templateObject.getCountryData();

  templateObject.getDropDown = function (id, country) {
    $("#" + id)
      .autocomplete({
        source: country,
        minLength: 0,
      })
      .focus(function () {
        $(this).autocomplete("search", "");
      });
    $("#" + id)
      .autocomplete("widget")
      .addClass("countries-dropdown");
  };

  templateObject.getAccountantDetails = async () => {
    LoadingOverlay.show();

    getVS1Data('TReportsAccountantsCategory').then(function (dataObject) {
      let data = JSON.parse(dataObject[0].data);
      var dataInfo = {
          id: data.Id || '',
          firstname: data.FirstName || '-',
          lastname: data.LastName || '-',
          companyname: data.CompanyName || '-',
          address: data.Address || '-',
          towncity: data.TownCity || '-',
          postalzip: data.PostalZip || '-',
          stateregion: data.StateRegion || '-',
          country: data.Country || '-',
      };

      $("#edtFirstName").val(dataInfo.firstname);
      $("#edtLastName").val(dataInfo.lastname);
      $("#edtCompanyName").val(dataInfo.companyname);
      $("#edtAddress").val(dataInfo.address);
      $("#edtTownCity").val(dataInfo.towncity);
      $("#edtPostalZip").val(dataInfo.postalzip);
      $("#edtStateRegion").val(dataInfo.stateregion);
      $("#edtCountry").val(dataInfo.country);
    });

    LoadingOverlay.hide();
  };
  templateObject.getAccountantDetails();
});

Template.reportsAccountantSettings.helpers({
  countryList: () => {
    return Template.instance().countryData.get();
  },
});

Template.reportsAccountantSettings.events({
  "click #saveAccountantInfo": function (event) {
    playSaveAudio();
    let templateObject = Template.instance();
    setTimeout(function(){
    $(".fullScreenSpin").css("display", "inline-block");
    
    let accountantID = 1;
    let firstName = $('#edtFirstName').val();
    let lastName = $('#edtLastName').val();
    let companyName = $('#edtCompanyName').val();
    let address = $('#edtAddress').val();
    let townCity = $('#edtTownCity').val();
    let postalZip = $('#edtPostalZip').val();
    let stateRegion = $('#edtStateRegion').val();
    let country = $('#edtCountry').val();

    var objDetails = {
        type: "TReportsAccountantsCategory",
        fields: {
            Id: accountantID,
            FirstName: firstName,
            LastName: lastName,
            CompanyName: companyName,
            Address: address,
            TownCity: townCity,
            PostalZip: postalZip,
            StateRegion: stateRegion,
            Country: country
        }
    };

    addVS1Data('TReportsAccountantsCategory',JSON.stringify(objDetails.fields)).then(function (datareturn) {
        location.reload(true);
    }).catch(function (err) {
        location.reload(true);
    });
  }, delayTimeAfterSound);
  },
  "click .btnBack": function (event) {
    playCancelAudio();
    event.preventDefault();
    setTimeout(function(){
    history.back(1);
    }, delayTimeAfterSound);
    //FlowRouter.go('/settings');
    //window.open('/invoicelist','_self');
  },
});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});
