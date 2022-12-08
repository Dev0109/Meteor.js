import { _ERP_BASE_API, _IPADDRESS, _PORT } from "../../../lib/global/erpconnection";

export default class ApiService {
  constructor() {
    this.erpGet = erpDb();
    this.ERPObjects = ERPObjects();
  }

  /**
   * @param {string} endpoint my-endpoint
   * @returns {URL}
   */
   static getBaseUrl({ endpoint = null, isUrl = true}) {
    let _url = `${URLRequest}${_IPADDRESS}:${_PORT}/${_ERP_BASE_API}/`;
    if(endpoint != null) {
      _url = `${URLRequest}${_IPADDRESS}:${_PORT}/${_ERP_BASE_API}/${endpoint}`;
    }

    if(isUrl == true) return new URL(_url);
    return _url;
  }

  /**
   *
   * @returns {HeadersInit}
   */
  static getHeaders() {
    var headers = {
      database: erpDb().ERPDatabase,
      username: erpDb().ERPUsername,
      password: erpDb().ERPPassword,
    };
    return headers;
  }

  /**
   *
   * @returns {HeadersInit}
   */
  static getPostHeaders() {
    postHeaders = {
      database: erpDb().ERPDatabase,
      username: erpDb().ERPUsername,
      password: erpDb().ERPPassword,
    };

    return postHeaders;
  }
}
