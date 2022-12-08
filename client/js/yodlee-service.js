export class YodleeService {
    constructor() {

    }

    getAccessToken(loginName, clientID, secretKey) {
        return new Promise(function (resolve, reject) {
            Meteor.call("getYodleeAccessToken", loginName, clientID, secretKey, function (error, results) {
                if (error) {
                    reject(error);
                } else {
                    if (results) {
                        resolve(JSON.parse(results));
                    } else {
                        reject(results);
                    }
                }
            });
        });
    }

    getTransactionData(token, fromDate) {
        return new Promise(function (resolve, reject) {
            Meteor.call("getYodleeTransactionData", token, fromDate, function (error, results) {
                if (error) {
                    reject(error);
                } else {
                    if (results) {
                        resolve(JSON.parse(results));
                    } else {
                        reject(results);
                    }
                }
            });
        });
    }

    getAccountData(token, accountId) {
        return new Promise(function (resolve, reject) {
            Meteor.call("getYodleeAccountData", token, accountId, function (error, results) {
                if (error) {
                    reject(error);
                } else {
                    if (results) {
                        resolve(JSON.parse(results));
                    } else {
                        reject(results);
                    }
                }
            });
        });
    }
}
