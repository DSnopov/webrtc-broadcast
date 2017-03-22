import $ from 'jquery';

function gotStream(stream) {
  $video[0].srcObject = stream;
}

const $video = $('video');

if ($video.length) {
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
}