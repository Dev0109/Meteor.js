import erpObject from "../../lib/global/erp-objects";
import LoadingOverlay from "../../LoadingOverlay";
import PayRun from "../Api/Model/PayRun";
import ObjectManager from "./ObjectManager";

/**
 * @property {PayRun[]} payruns
 */
export default class OvertimeHandler {
  constructor() {
    this.objects = [];

    //this.loadFromLocal();
  }

  /**
     * This will get the data from localindexdb
     * @returns
     */
  async loadFromLocal() {
    let response = await getVS1Data(erpObject.TPayrollSettingOvertimes);
    if (response.length > 0) {
      let objects = JSON.parse(response[0].data);
      this.objects = PayRun.fromList(objects);
    }
    return this.objects;
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
    if (this.objects.length == 0) {
      await this.loadFromLocal();
      if (this.objects.length == 0) {
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

      this.objects.push(object);
      await this.saveToLocal();
    }
  }

  /**
     *
     * @param {PayRun} object
     */
  async update(object) {
    this.objects.forEach((p, index) => {
      if (p.id == object.id) {
        this.objects[index] = object;
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
    // this.objects = this.objects.filter((payrun) => payrun != object);

    // return this.objects;
    const index = this.objects.findIndex(p => p.id == object.id);
    if (index >= 0) 
      this.objects.splice(index, 1);
    }
  
  findOneById(object) {
    return this.objects.find(payrun => payrun.id == object.id);
  }

  findOneByCalendarId(object) {
    return this.objects.find(p => p.calendarId == object.calendarId);
  }

  /**
   * 
   * @param {integer} calendarId 
   * @returns {Promise<PayRun|undefined>}
   */
  async isPayRunCalendarAlreadyDrafted(calendarId) {
    if (this.objects.length == 0) {
      await this.loadFromLocal();
      if (this.objects.length == 0) {
        await this.loadFromRemote();
      }
    }
    return this.objects.find(p => p.calendarId == calendarId && p.stpFilling == PayRun.STPFilling.draft);
  }

  findAll() {
    return this.objects;
  }

  findOneBy(criteries = []) {}

  async saveToLocal() {
    try {
      await addVS1Data(erpObject.TPayRunHistory, JSON.stringify(this.objects));
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
