import { Meteor } from "meteor/meteor";
import { loadStripe } from "@stripe/stripe-js";

const stripe = loadStripe(
  "pk_test_51H019EDvlF0UkKE2KE9etEOQmp7Ujth0Zzuhxp8y7rrrj5NwowQDWqKZVCZTIlQGOWd3RH8ANsAaYqEg57ODSW6D00TNGazZJU"
);
const braintree = require("braintree");
const yodlee = require("yodlee");
const request = require("request");
const Magento2 = require("node-magento2");
("use strict");

let apiIndex = 0;
const apiKeys = ["1f168b12a87398f309f7cf273ded064d", "ab54565999a9098243e68a73b15a43a0"]; //"2fa825302bd84988871ff138483a86fb", 

Meteor.startup(() => {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
  /* Connection to Braintree Paymentent Gateway */
  let env = braintree.Environment.Sandbox;

  var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: "2mh4gq43myk73yby",
    publicKey: "k2j8pjckdvk94yck",
    privateKey: "cdd3badd1bddcc1388198d78b6da5652",
  });

  const options = {
    url: "https://www.payments.vs1cloud.com",
    store: "default",
    authentication: {
      integration: {
        access_token: "v5qr02ewd2wemjotpujb9fatembkgm47",
      },
    },
  };

  const mageClient = new Magento2("https://www.payments.vs1cloud.com", options);

  mageClient.init();
  let $json = {
    search_criteria: {
      filter_groups: [
        {
          filters: [
            {
              field: "sku",
              value: "%",
              condition_type: "like",
            },
          ],
        },
      ],
    },
  };
  let $jsonProfile = {
    search_criteria: {
      filter_groups: [
        {
          filters: [
            {
              field: "status",
              value: "active",
              condition_type: "eq",
            },
          ],
        },
      ],
    },
  };
  let $jsonStripe = {
    search_criteria: {
      filter_groups: [
        {
          filters: [
            {
              field: "customer_email",
              value: "%",
              condition_type: "like",
            },
          ],
        },
      ],
    },
  };

  yodlee
    .getAccessToken({
      clientId: "KESAGIh3yF3Z220TwoYeMDJKgsRXSSk4",
      secret: "TqDOhdMCOYHJq1se",
    })
    .then(function (accessToken) {})
    .catch(function (error) {});

  callYodleeApi = function (loginName, clientID, secretKey, cb) {
    const options = {
      method: "POST",
      url: "https://sandbox.api.yodlee.com/ysl/auth/token",
      headers: {
        "Api-Version": "1.1",
        loginName: loginName,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      form: {
        clientId: clientID,
        secret: secretKey,
      },
    };
    request(options, function (error, response) {
      if (error) {
        cb(error, null);
      } else {
        cb(null, response.body);
      }
    });
  };

  callYodleeTransaction = function (token, fromDate, cb) {
    const options = {
      method: "GET",
      url:
        "https://sandbox.api.yodlee.com/ysl/transactions?fromDate=" + fromDate,
      headers: {
        "Api-Version": "1.1",
        Authorization: "Bearer " + token,
        "Content-Type": "application/vnd.yodlee+json",
      },
    };
    request(options, function (error, response) {
      if (error) {
        cb(error, null);
      } else {
        cb(null, response.body);
      }
    });
  };

  callYodleeAccount = function (token, accountId, cb) {
    const options = {
      method: "GET",
      url: "https://sandbox.api.yodlee.com/ysl/accounts?accountId=" + accountId,
      headers: {
        "Api-Version": "1.1",
        Authorization: "Bearer " + token,
        "Content-Type": "application/vnd.yodlee+json",
      },
    };
    request(options, function (error, response) {
      if (error) {
        cb(error, null);
      } else {
        cb(null, response.body);
      }
    });
  };

  (callVeryfiApi = function (imageData, fileName, cb) {

    apiIndex ++;
    if (apiIndex >= apiKeys.length) {
      apiIndex = 0;
    }
    const key = apiKeys[apiIndex];
    const options = {
      method: "GET",
      url: "https://api.mindee.net/v1/products/mindee/expense_receipts/v4/predict",
      headers: {
        Authorization: "Token " + key,
        "Content-Type": "multipart/form-data",
      },
      formData: {
        document: imageData, // the image file
      },
    };

    request.post(options, function (error, response, body) {
      if (error) {
        cb(null, error);
      } else {
        cb(null, body);
      }
    });
  }),
    Meteor.methods({
      getYodleeAccessToken: function (loginName, clientID, secretKey) {
        let getResponse = "";
        this.unblock();
        return Meteor.wrapAsync(callYodleeApi)(loginName, clientID, secretKey);
      },
      getYodleeTransactionData: function (token, fromDate) {
        let getResponse = "";
        this.unblock();
        return Meteor.wrapAsync(callYodleeTransaction)(token, fromDate);
      },
      getYodleeAccountData: function (token, accountId) {
        let getResponse = "";
        this.unblock();
        return Meteor.wrapAsync(callYodleeAccount)(token, accountId);
      },
      getOcrResultFromVerifi: async function (imageData, fileName) {
        this.unblock();
        const generateOcrResult = await Meteor.wrapAsync(callVeryfiApi)(
          imageData,
          fileName
        );
        return generateOcrResult;
        //Meteor.wrapAsync(callVeryfiApi)(imageData, fileName);
      },
      magentoAWSProfileRenewal: function () {
        return mageClient
          .get("/V1/awSarp2/profile/search?", $jsonProfile)
          .then(function (option) {
            return option;
          })
          .catch(function (error) {});
      },
      magentoAWSProfileLoggedUser: function (useremail) {
        let $jsonOneProfile = {
          search_criteria: {
            filter_groups: [
              {
                filters: [
                  {
                    field: "customer_email",
                    value: useremail,
                    condition_type: "eq",
                  },
                  {
                    field: "status",
                    value: "active",
                    condition_type: "eq",
                  },
                ],
              },
            ],
          },
        };
        return mageClient
          .get("/V1/awSarp2/profile/search?", $jsonOneProfile)
          .then(function (option) {
            return option;
          })
          .catch(function (error) {});
      },
      magentoSKUProductsDetail: function (productSKU) {
        let $jsonOneProfile = {
          search_criteria: {
            filter_groups: [
              {
                filters: [
                  {
                    field: "sku",
                    value: productSKU,
                    condition_type: "eq",
                  },
                  {
                    field: "status",
                    value: "active",
                    condition_type: "eq",
                  },
                ],
              },
            ],
          },
        };
        return mageClient
          .get("/V1/products", $jsonOneProfile)
          .then(function (option) {
            return option;
          })
          .catch(function (error) {});
      },
      braintreeChargeCard: function (stripeToken, amountCharged) {
        gateway.customer.search(
          (search) => {
            search.email().is(stripeToken);
          },
          (err, response) => {
            let customerID = response.ids[0];
            if (customerID) {
              gateway.transaction
                .sale({
                  amount: amountCharged,
                  customerId: customerID,
                  paymentMethodNonce: "nonce-from-the-client",
                  options: {
                    submitForSettlement: true,
                  },
                })
                .then(function (result) {
                  if (result.success) {
                  } else {
                  }
                })
                .catch(function (err) {});
            } else {
              gateway.transaction
                .sale({
                  amount: amountCharged,
                  paymentMethodNonce: "nonce-from-the-client",
                  options: {
                    submitForSettlement: true,
                  },
                })
                .then(function (result) {
                  if (result.success) {
                  } else {
                  }
                })
                .catch(function (err) {});
            }
          }
        );
      },
      StripeChargeCard: function (useradminEmail, amountCharged) {
        var Stripe = StripeAPI(
          "sk_test_51H019EDvlF0UkKE2l7GVsQ58NhZPtpyE9HdNWtuVRGKvwAxJulgpqEdRLhf7itv8jilNMRmsIlMhp0FIrRC9ynkk00yipso3BO"
        );
        const customer = Stripe.customers.create(
          {
            source: "tok_mastercard",
            email: useradminEmail,
          },
          function (err, charge) {
            Stripe.charges.create(
              {
                amount: amountCharged,
                currency: "usd",
                customer: charge.id,
              },
              function (errData, chargeData) {
                if (errData) {
                } else {
                }
              }
            );
          }
        );
      },
      StripeTestChargeCard: function () {
        var Stripe = StripeAPI(
          "sk_test_51H019EDvlF0UkKE2l7GVsQ58NhZPtpyE9HdNWtuVRGKvwAxJulgpqEdRLhf7itv8jilNMRmsIlMhp0FIrRC9ynkk00yipso3BO"
        );
        return Stripe.customers.create(
          {
            source: "tok_mastercard",
            email: "adeola@vs1cloud.com",
          },
          function (err, charge) {
            if (err) {
              return err;
            } else {
              return charge;
            }
          }
        );
      },
      getClientToken: (clientId) => {
        const generateToken = Meteor.wrapAsync(
          gateway.clientToken.generate,
          gateway.clientToken
        );
        const options = {};
        if (clientId) {
          options.clientId = clientId;
        }
        const response = generateToken(options);
        return response.clientToken;
      },
      subscribeToPlan(nonce, plan) {
        const customer = Meteor.wrapAsync(
          gateway.customer.create,
          gateway.customer
        );
        const subscription = Meteor.wrapAsync(
          gateway.subscription.create,
          gateway.subscription
        );
        const plans = Meteor.wrapAsync(gateway.plan.all, gateway.plan);
        const plansResult = plans().plans;

        const planId = plansResult.find((planObject) => {
          return planObject.name === plan;
        }).id;
        const email = Meteor.user().emails[0].address;
        const customerResult = customer({
          email,
          paymentMethodNonce: nonce,
        });
        if (customerResult.success) {
          const token = customerResult.customer.paymentMethods[0].token;
          const subscriptionResult = subscription({
            paymentMethodToken: token,
            planId,
          });
          if (subscriptionResult.success) {
            const currentRoles = Roles.getRolesForUser(Meteor.userId());
            currentRoles.forEach((role) => {
              if (role === plan) {
                throw new Meteor.Error(
                  "400",
                  "User already subscribed to this plan"
                );
              } else {
                if (
                  role === "free" ||
                  role === "developer" ||
                  role === "professional"
                ) {
                  Roles.removeUsersFromRoles(Meteor.userId(), role);
                }
              }
            });
            Roles.addUsersToRoles(Meteor.userId(), plan);
            return true;
          }
        }
      },
      sendSMS: async (authSid, authToken, from, to, body) => {
        const smsClient = require("twilio")(authSid, authToken);
        try {
          const message = await smsClient.messages.create({
            from,
            body,
            to,
          });
          return { success: true, sid: message.sid };
        } catch (error) {
          return { success: false, message: error.message };
        }
      },
      getSMSLogs: async (authSid, authToken) => {
        const smsClient = require("twilio")(authSid, authToken);
        try {
          return smsClient.messages.list().then((messages) => {
            return { success: true, messages };
          });
        } catch (error) {
          return { success: false, message: error.message };
        }
      },
    });
});
