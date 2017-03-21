import $ from 'jquery';

function gotStream(stream) {
  const $video = $('video');

  if ($video.length) {
    $video[0].srcObject = stream;
  }
}

navigator
  .mediaDevices
  .getUserMedia({
    audio: false,
    video: true
  })
  .then(gotStream)
  .catch(function(e) {
    alert('getUserMedia() error: ' + e.name);
  });