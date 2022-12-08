import {ReactiveVar} from "meteor/reactive-var";

Template.dashboardmy.onCreated(function () {
    this.loggedDb = new ReactiveVar("");
    const templateObject = Template.instance();
    templateObject.includeDashboard = new ReactiveVar();
    templateObject.includeDashboard.set(false);
});

Template.dashboardmy.onRendered(function () {
    let templateObject = Template.instance();
    let isDashboard = Session.get("CloudDashboardModule");
    if (isDashboard) {
        templateObject.includeDashboard.set(true);
    }
});

Template.dashboardmy.helpers({
    includeDashboard: () => {
        return Template.instance().includeDashboard.get();
    },
    loggedDb: function () {
        return Template.instance().loggedDb.get();
    },
    loggedCompany: () => {
        return localStorage.getItem("mySession") || "";
    },
});

// Listen to event to update reactive variable
Template.dashboardmy.events({

});