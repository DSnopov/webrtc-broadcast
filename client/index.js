function gotStream(stream) {
  console.warn(stream);
  document.getElementById('localVideo').srcObject = stream;
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