$(document).ready(function(){
    $( document ).on( 'focus', ':input', function(){
        $( this ).attr( 'autocomplete', 'off' );
    });
    $( document ).on( 'focus', ':password', function(){
        $( this ).attr( 'autocomplete', 'off' );
    });
    $( document ).on( 'focus', ':password', function(){
        $( this ).attr( 'autocomplete', 'new-password' );
    });
    $( document ).on( 'click', '.close', function(){
      let videos = document.querySelectorAll("video");
        videos.forEach((video) => {
            // video.muted = true;
            video.pause();
        });
    });

    $( document ).on( 'click', '.closeAdd', function(){
      let videos = document.querySelectorAll("video");
        videos.forEach((video) => {
            // video.muted = true;
            video.pause();
        });
    });

    $( document ).on( 'click', '.helpModal', function(){
      $('#supportModal').modal('toggle');
      $('.modal-backdrop').css('display', 'none');
      var vidPlay = document.getElementById("myVideo");
      vidPlay.play();
    });

    $( document ).on( 'click', '.helpModalAdd', function(){
      $('#supportModal').modal('toggle');
      $('.modal-backdrop').css('display', 'none');
      var vidClassPlay = document.getElementById("myVideoAdd");
      vidClassPlay.play();
    });
});
