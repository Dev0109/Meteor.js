RegisterUser = new Mongo.Collection('registerUser');
RegisterAccount = new Mongo.Collection('registerAccount');
CloudDatabase = new Mongo.Collection("cloudDatabase");
CloudUser = new Mongo.Collection("cloudUser");
ForgotPassword = new Mongo.Collection("forgotPassword");
CloudPreference = new Mongo.Collection("cloudPreference");
import { Mongo } from 'meteor/mongo';
// CloudUser._ensureIndex({cloudEmail: 1}, {unique: 1});
// colCloudUsers.join(colCloudDatabases, "cdclouddbid", "UserDatabase", ["cdserver","cddatabase","cdusername","cdpassword","cdport"]);
if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('CloudDatabases', function CloudDatabasePublication() {
    return CloudDatabase.find();
  });
  Meteor.publish('CloudUsers', function CloudUserPublication() {
    return CloudUser.find();
  });

  Meteor.publish('RegisterUsers', function RegisterUserPublication() {
    return RegisterUser.find();
  });
  Meteor.publish('RegisterAccounts', function RegisterAccountPublication() {
    return RegisterAccount.find();
  });
  Meteor.publish('ForgotPasswords', function ForgotPasswordPublication() {
    return ForgotPassword.find();
  });

  Meteor.publish('CloudPreferences', function CloudPreferencePublication() {
    return CloudPreference.find();
  });

}
Meteor.methods({
  readMethod: function (useremail) {
    var documentUser = CloudUser.findOne({ cloudEmail: useremail });
    if (!documentUser) {
    } else {

    }
    return documentUser;
  },
  readMethodLog: function (useremail, userLoginPassword, userHashPassword) {
    var documentUser = CloudUser.find({ cloudEmail: useremail, cloudHashPassword: userLoginPassword }).fetch();
    if (!documentUser) {
    } else {
    }
    return documentUser;
  },
  readPrefMethod: function (enterid, enterPrefName) {
    var documentPref = CloudPreference.findOne({ userid: enterid, PrefName: enterPrefName });
    if (!documentPref) {
    } else {
    }
    return documentPref;
  }
});
