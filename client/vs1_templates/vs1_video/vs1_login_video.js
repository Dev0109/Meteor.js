Template.vs1_login_video.onRendered(function () {
  const instance = this
  const parent = instance.find('#video-parent')
  instance.video = document.createElement('video')
  instance.video.classList.add('rounded-lg')
  instance.video.classList.add('img-fluid')
  instance.video.classList.add('myVS1Video')
  instance.video.id = 'myVS1Video';
  instance.video.controls = false;
  instance.video.preload = 'none';
  instance.video.playsinline = '';
  instance.video.src = instance.data.src ? instance.data.src : ''
  instance.video.addEventListener('canplaythrough', () => {
    instance.video.controls = false
    //Meteor.setTimeout(()=>{
    //  instance.video.play()
    //}, 500)
  })
  parent.append(instance.video)
})
Template.vs1_login_video.onDestroyed(function () {
  const instance = this
  instance.video.pause()
  instance.video.remove()
})
