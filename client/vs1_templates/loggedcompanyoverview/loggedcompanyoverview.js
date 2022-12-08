import { ReactiveVar } from 'meteor/reactive-var';


Template.loggedcompanyoverview.helpers({
  vs1TradingName: () => {
      return localStorage.getItem('vs1TradingName') || '';
  },
  firstName: () => {
      let loggedEmployeedName = localStorage.getItem('vs1LoggedEmployeeName').split(" ") || '';
      return loggedEmployeedName[0] || '';
  },
  loggedEmpID: () => {
      return localStorage.getItem('vs1LoggedEmployeeID') || '';
  }
});
