export default class FxSettingsEditor {
  constructor({ onEditEnabled, onEditDisabled, onSaved, onCanceled}) {
    this.onEditDisabled = onEditDisabled;
    this.onEditEnabled = onEditEnabled;
    this.onSaved = onSaved;
    this.onCanceled = onCanceled;

    this.editMode = false;

    this.bindEvents();
  }

  bindEvents() {
    if (this.editMode == true) {
      this.enableEditMode();
    } else {
      this.disableEditMode();
    }
  }

  enableEditMode() {
    this.editMode = true;
    this.onEditEnabled();
  }

  disableEditMode() {
    this.editMode = false;
    this.onEditDisabled();
  }

  save() {
    this.disableEditMode();
    this.onSaved();
  }

  cancel() {
      this.disableEditMode();
      this.onCanceled();
  }
}
