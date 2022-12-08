import {ReactiveVar} from 'meteor/reactive-var';
import { SideBarService } from '../../js/sidebar-service';
import '../../lib/global/indexdbstorage.js';

let sideBarService = new SideBarService();

Template.ediintegrations.onCreated(() => {
  const templateObject = Template.instance();
  
});

Template.ediintegrations.onRendered(function () {


});

Template.ediintegrations.helpers({
  checkModulePurchased: async ( moduleName ) => {
      return await isAdditionalModulePurchased( moduleName );
  }
});
