import "jQuery.print/jQuery.print.js";
import { ReactiveVar } from "meteor/reactive-var";
import { ContactService } from "../../contacts/contact-service";
import User from "./User";
let _ = require("lodash");

Template.activeEmployees.onCreated(() => {
  const templateObject = Template.instance();

  templateObject.loggeduserdata = new ReactiveVar([]);
});

Template.activeEmployees.onRendered(() => {
  const templateObject = Template.instance();
  let contactService = new ContactService();
  let loggedUserList = []; // List of logged users


  templateObject.getLoggedUserData = function () {
        getVS1Data('TAppUser').then(function (dataObject) {
            if(dataObject.length == 0){
                contactService.getCurrentLoggedUser().then(function (data) {
                  addVS1Data('TAppUser', JSON.stringify(data));
                  let dataListloggedUser = {};
                  let vs1EmployeeImage = Session.get("vs1EmployeeImages");

                  let encoded = "";
                  for (let i = 0; i < data.tappuser.length; i++) {
                    let employeeUser =
                      data.tappuser[i].FirstName + " " + data.tappuser[i].LastName;
                    if (parseInt(data.tappuser[i].EmployeeID) == parseInt(Session.get("mySessionEmployeeLoggedID"))) {
                      employeeUser = Session.get("mySessionEmployee");
                    }
                    loggedUserList.push(
                      new User({
                        id: data.tappuser[i].EmployeeID || "",
                        employeeName: employeeUser || "- -",
                        avatar: "img/avatar.png", // Here we should get the avatar dynamically
                        lastLogin: data.tappuser[i].LastTime || "",
                      })
                    );
                  }
                  templateObject.loggeduserdata.set(loggedUserList);
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                let dataListloggedUser = {};
                let vs1EmployeeImage = Session.get("vs1EmployeeImages");

                let encoded = "";
                for (let i = 0; i < data.tappuser.length; i++) {
                  let employeeUser =
                    data.tappuser[i].FirstName + " " + data.tappuser[i].LastName;
                  if (parseInt(data.tappuser[i].EmployeeID) == parseInt(Session.get("mySessionEmployeeLoggedID"))) {
                    employeeUser = Session.get("mySessionEmployee");
                  }
                  loggedUserList.push(
                    new User({
                      id: data.tappuser[i].EmployeeID || "",
                      employeeName: employeeUser || "- -",
                      avatar: "img/avatar.png", // Here we should get the avatar dynamically
                      lastLogin: data.tappuser[i].LastTime || "",
                    })
                  );
                }
                templateObject.loggeduserdata.set(loggedUserList);

            }
        }).catch(function (err) {
            contactService.getCurrentLoggedUser().then(function (data) {
              addVS1Data('TAppUser', JSON.stringify(data));
              let dataListloggedUser = {};
              let vs1EmployeeImage = Session.get("vs1EmployeeImages");

              let encoded = "";
              for (let i = 0; i < data.tappuser.length; i++) {
                let employeeUser =
                  data.tappuser[i].FirstName + " " + data.tappuser[i].LastName;
                if (parseInt(data.tappuser[i].EmployeeID) == parseInt(Session.get("mySessionEmployeeLoggedID"))) {
                  employeeUser = Session.get("mySessionEmployee");
                }
                loggedUserList.push(
                  new User({
                    id: data.tappuser[i].EmployeeID || "",
                    employeeName: employeeUser || "- -",
                    avatar: "img/avatar.png", // Here we should get the avatar dynamically
                    lastLogin: data.tappuser[i].LastTime || "",
                  })
                );
              }
              templateObject.loggeduserdata.set(loggedUserList);
            });
        });

  };
  templateObject.getLoggedUserData();
});

Template.activeEmployees.events({});

Template.activeEmployees.helpers({
  loggeduserdata: () => {
    return Template.instance().loggeduserdata.get().sort(function (a, b) {
        if (a.employeeName == "NA") {
          return 1;
        } else if (b.employeeName == "NA") {
          return -1;
        }
        return a.employeeName.toUpperCase() > b.employeeName.toUpperCase()
          ? 1
          : -1;
      });
  },
});
