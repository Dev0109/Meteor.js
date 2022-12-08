import erpObject from "../../lib/global/erp-objects";
import LoadingOverlay from "../../LoadingOverlay";
import PayRun from "../Api/Model/PayRun";
import ObjectManager from "./ObjectManager";

/**
 * @property {PayRun[]} payruns
 */
export default class PayRunHandler {
  constructor() {
    this.payruns = [];

    //this.loadFromLocal();
  }

  /**
     * This will get the data from localindexdb
     * @returns
     */
  async loadFromLocal() {
    let response = await getVS1Data(erpObject.TPayRunHistory);
    if (response.length > 0) {
      let objects = JSON.parse(response[0].data);
      this.payruns = PayRun.fromList(objects);
    }
    return this.payruns;
  }

  /**
     * This will get the data from remote server
     */
  async loadFromRemote() {}

  /**
     *
     * @param {PayRun} object
     * @param {boolean} override
     * @returns
     */
  async add(object, override = false) {
    if (this.payruns.length == 0) {
      await this.loadFromLocal();
      if (this.payruns.length == 0) {
        await this.loadFromRemote();
      }
    }

    if (this.findOneById(object) != undefined && override == false) {
      LoadingOverlay.hide(0);
      const result = await swal({
        title: "Couldn't add PayRun", text: "Cannot save duplicate ID.", type: "error", showCancelButton: false, confirmButtonText: "Ok"
        // cancelButtonText: "Override"
      });

      //   if (result.value) {
      //     return;
      //   }
    } else {
      if (override == true) {
        return this.replace(object);
      }

      this.payruns.push(object);
      await this.saveToLocal();
    }
  }

  /**
     *
     * @param {PayRun} object
     */
  async update(object) {
    this.payruns.forEach((p, index) => {
      if (p.id == object.id) {
        this.payruns[index] = object;
      }
    });
    // await this.saveToLocal();
  }

  /**
     *
     * @param {PayRun[]} objects
     * @param {boolean} override
     */
  set(objects = [], override = false) {
    objects.forEach(object => {
      this.add(object, override);
    });
  }

  /**
     *
     * @param {PayRun} object
     * @returns
     */
  async remove(object) {
    // this.payruns = this.payruns.filter((payrun) => payrun != object);

    // return this.payruns;
    const index = this.payruns.findIndex(p => p.id == object.id);
    if (index >= 0) 
      this.payruns.splice(index, 1);
    }
  
  findOneById(object) {
    return this.payruns.find(payrun => payrun.id == object.id);
  }

  findOneByCalendarId(object) {
    return this.payruns.find(p => p.calendarId == object.calendarId);
  }

  /**
   * 
   * @param {integer} calendarId 
   * @returns {Promise<PayRun|undefined>}
   */
  async isPayRunCalendarAlreadyDrafted(calendarId) {
    if (this.payruns.length == 0) {
      await this.loadFromLocal();
      if (this.payruns.length == 0) {
        await this.loadFromRemote();
      }
    }
    return this.payruns.find(p => p.calendarId == calendarId && p.stpFilling == PayRun.STPFilling.draft);
  }

  findAll() {
    return this.payruns;
  }

  findOneBy(criteries = []) {}

  async saveToLocal() {
    try {
      await addVS1Data(erpObject.TPayRunHistory, JSON.stringify(this.payruns));
    } catch (e) {
      LoadingOverlay.hide(0);
      const result = await swal({
        title: "Couldn't save PayRun History",
        //text: "Cannot save duplicate ID.",
        type: "error",
        showCancelButton: true,
        confirmButtonText: "Retry"
      });

      if (result.value) {
        await this.saveToLocal();
      }
    }
  }

  /**
     * This will sync with remote server
     */
  async sync() {}
}
