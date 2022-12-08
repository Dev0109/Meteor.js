import {ReactiveVar} from 'meteor/reactive-var';
let _ = require('lodash');
Template.vs1_databasepopup.onRendered(function(){
  var erpGet = erpDb();
  var oReq = new XMLHttpRequest();
  let loggedEmailID = "sales@vs1cloud.com";
  oReq.open("GET",URLRequest + licenceIPAddress + ':' + checkSSLPorts + '/' + 'erpapi' + '/' + 'VS1_GetDatabases?EmailID="'+loggedEmailID+'"', true);
  //oReq.open("GET",URLRequest + licenceIPAddress + ':' + checkSSLPorts + '/' + 'erpapi/TVS1_ClientUsers?PropertyList="EmailId,Password"&select=[EmailId]="'+mailTo+'"', true);
  oReq.setRequestHeader("database",vs1loggedDatatbase);
  oReq.setRequestHeader("username",'VS1_Cloud_Admin');
  oReq.setRequestHeader("password",'DptfGw83mFl1j&9');
  //oReq.send();
  oReq.onreadystatechange = function() {
  if(oReq.readyState == 4 && oReq.status == 200) {
     var vs1Data = JSON.parse(oReq.responseText);
     if(vs1Data.ProcessLog.Error){
       // $('.accountantDatabases').css('display','none');
     }else{

     }
  }
  }

});
Template.vs1_databasepopup.events({

});

Template.vs1_databasepopup.helpers({

});
