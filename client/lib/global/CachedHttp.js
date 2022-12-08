import GlobalFunctions from "../../GlobalFunctions.js";
import "../global/indexdbstorage.js";
import {Meteor} from 'meteor/meteor';

/**
 *
 * The  here are only for debug purpose, wont work on production
 */
class CachedHttp {
  constructor(options = {
    limit: 1,
    endpointPrefix: "cached_http/",
    debug: false
  }) {
    this.limit = options.limit;
    this.endpointPrefix = options.endpointPrefix;
    this.debug = options.debug;
  }

  logger(message, ...optionalParams) {
    const prefix = "CachedHttp | ";

    if (this.debug) {
    }
  }

  logSeparator() {
    const separator = '===================================';
    this.logger(separator);
  }

  findParamByKey(key, params = {}) {
    if (params[key]) {
      return params[key];
    }
    return false;
  }

  /**
   *
   * @param {String} endpoint
   * @param {CallableFunction} onRemoteCall it should return {response: ReponseObject}
   * @returns
   */
  async get(endpoint, onRemoteCall = async () => {}, options = {
    date: new Date(),
    forceOverride: false,
    useIndexDb: true,
    useLocalStorage: false,
    fallBackToLocal: true,
    requestParams: {},
    validate: cachedResponse => {
      // this function should return true if the request is using any previously used params
      // else if any params has been changed, it should return false
      // this will validate or not the local request

      // If return false, it wont load from local stored data
      // If return true, it will load from local stored data
      if (GlobalFunctions.isSameDay(cachedResponse.response.Params.DateFrom, dateFrom) && GlobalFunctions.isSameDay(cachedResponse.response.Params.DateTo, dateTo) && cachedResponse.response.Params.IgnoreDates == ignoreDate) {
        return true;
      }
      return false;
    }
  }) {
    this.logSeparator();
    this.logger('You see this because you are in dev mode');

    // Init empty vars
    if(options.date == undefined) options.date = new Date();
    if(options.useIndexDb == undefined) options.useIndexDb = true;
    if(options.useLocalStorage == undefined) options.useLocalStorage = false;
    if(options.validate == undefined) options.validate = (c) => true;
    if(options.fallBackToLocal == undefined) options.fallBackToLocal = true;
    if(options.forceOverride == undefined) options.forceOverride = false;


    const endPointName = this.endpointPrefix + endpoint;

    const getFromLocalStorage = endpoint => {
      this.logger("Loading from localStorage ----");

      try {
        const _data = JSON.parse(localStorage.getItem(endpoint));
        this.logger("Loaded from local storage: ", _data);
        return;
      } catch (e) {
        // handled error
        this.logger(e);
      }
    };

    const saveToLocalStorage = jsonData => {
      try {
        const _data = JSON.stringify(jsonData);
        this.logger("Saving to localStorage: ", _data);
        return localStorage.setItem(endPointName, _data);
      } catch (e) {
        // handle error
        this.logger(e);
      }
    };

    const saveToLocalIndexDb = async (endpoint, data) => {
      data.requestDate = new Date();
      this.logger(`Saving ${endpoint} to local IndexDb: `, data);

      try {
        return await addVS1Data(endpoint, JSON.stringify(data));
      } catch (e) {
        // Handle error
        this.logger(e);
      }
    };

    const getFromLocalIndexDb = async (endpoint, onError = async () => {}) => {
      this.logger("Loading from local indexdb ----");

      try {
        let _data = await getVS1Data(endpoint);

        this.logger("Loaded from indexDB: ", _data);

        _data = JSON.parse(_data[0].data);

        const _response = {
          requestDate: new Date(_data.requestDate),
          response: _data,
          fromLocalIndex: true
        };

        this.logger("Index DB data sanitized: ", _response);

        return _response;
      } catch (e) {
        // Handle error
        this.logger(e);
        return await onError();
      }
    };

    const getFromRemote = async () => {
      this.logger("Loading from remote ----");
      const response = await onRemoteCall();

      let cachedResponse = {
        requestDate: new Date(),
        response: response,
        fromRemote: true,
      };

      if (options.useLocalStorage) {
        saveToLocalStorage(cachedResponse);
      }

      if (options.useIndexDb) {
        await saveToLocalIndexDb(endpoint, response);
      }

      this.logger("Loaded from remote: ", cachedResponse);

      return cachedResponse;
    };

    const cachedData = options.useLocalStorage == true
      ? getFromLocalStorage(endPointName)
      : await getFromLocalIndexDb(endpoint);

    if (options.forceOverride) {
      this.logger("Forced from remote ----");
      const _data = await getFromRemote();
      this.logSeparator();
      return _data;
    }

    if (cachedData) {
      this.logger("NOTICE: Cached data is available: ", cachedData);

      // cachedData = await getFromLocalIndexDb(endpoint, async () => {
      //   return getFromLocalStorage(endPointName);
      // });

      if (options.validate(cachedData) == true) {
        // if no params has been changed

        // if the data already cached
        const hours = Math.abs(options.date - cachedData.requestDate) / 36e5;
        this.logger('hours', hours, this.limit, options.date, cachedData.requestDate);

        if (hours > this.limit) {
          this.logger("NOTICE: Cached data is expired");
          const _data = await getFromRemote();
          this.logSeparator();
          return _data;
        } else {
          this.logger("NOTICE: Loading from cache, the last request is recent");

          const _data = await getFromLocalIndexDb(endpoint, async () => {
            return getFromLocalStorage(endPointName);
          });
          this.logSeparator();
          return _data;
          // return JSON.parse(localStorage.getItem(endPointName));
        }
      } else {
        this.logger("NOTICE: No cached data is found with these params (mismatch): ", options.requestParams);
        this.logger("NOTICE: Found from cache: ", cachedData.response.Params);

        // the requested params has changed, to we need to make a new request for this time
        const _data = await getFromRemote();
        this.logSeparator();
        return _data;
      }
    } else {
       const _data = await getFromRemote();
       if(options.fallBackToLocal == true) {
        if(!_data) {
          return getFromLocalIndexDb();
        }
       }
       this.logSeparator();
       return _data;
    }
  }
}


export default CachedHttp = new CachedHttp({
  limit: 1,
  debug: Meteor.isDevelopment,
  endpointPrefix: Meteor.isDevelopment ? "cached_http/dev/" : "cached_http/",
});
