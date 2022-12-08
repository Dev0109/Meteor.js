class LoadingOverlay {
  /**
   *
   * @param {number} timeout
   */
  show(timeout = 0) {
    setTimeout(() => {
      $(".fullScreenSpin").css("display", "");
    }, timeout);
  }

  /**
   *
   * @param {number} timeout 
   */
  hide(timeout = 1000) {
    setTimeout(() => {
      $(".fullScreenSpin").css("display", "none");
    }, timeout);
  }
}

export default LoadingOverlay = new LoadingOverlay();
