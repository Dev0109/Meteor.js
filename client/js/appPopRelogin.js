Template.appAlertPage.onCreated(function(){


});

Template.appAlertPage.onRendered(function(){
  $("#resubmitLogin").click(function(e){
    var password = $("#erppassword").val();
    var entpassword = CryptoJS.MD5(password).toString().toUpperCase();
    var userPassword = Session.get('myerpPassword').replace('%20', " ").replace('%21', '!').replace('%22', '"')
        .replace('%23', "#").replace('%24', "$").replace('%25', "%").replace('%26', "&").replace('%27', "'")
        .replace('%28', "(").replace('%29', ")").replace('%2A', "*").replace('%2B', "+")
        .replace('%2C', ",").replace('%2D', "-").replace('%2E', ".").replace('%2F', "/") || '';
    if(password.toUpperCase() == userPassword.toUpperCase()){
      document.getElementById('apptimer').style.display='none';
    }else{

      swal('Invalid VS1 Password', 'The entered user password is not correct, please re-enter your password and try again!', 'error');
      $("#erppassword").focus();
    }
    e.preventDefault();
  });

  $("#erppassword").keyup(function (e) {
      if (e.keyCode == 13) {
          $("#resubmitLogin").trigger("click");
      }
  });

  $(".btnLogOut").click(function(e){
    window.open('/', '_self');
  });

});
