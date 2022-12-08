import { ReactiveVar } from "meteor/reactive-var";


Template.eft_export.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.eftOptionsList = new ReactiveVar([]);
});

Template.eft_export.onRendered(function () {
  let templateObject = Template.instance();

});

Template.eft_export.events({

});

Template.eft_export.helpers({
});
