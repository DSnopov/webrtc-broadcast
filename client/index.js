import $ from 'jquery';

function gotStream(stream) {
  $video[0].srcObject = stream;
}

function getLocalStream() {
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

const $video = $('video');

const socket = io();

socket.emit('join room', roomId);

socket.on('joined room', isOwner => {
  if (isOwner) {
    getLocalStream();
  }
});