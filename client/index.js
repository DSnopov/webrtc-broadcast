const socket = io();
const peerConnections = {};
const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};
let localStreamPromise;

function gotStream(stream) {
  document.querySelector('video').srcObject = stream;
  return stream;
}

function getLocalStream() {
  localStreamPromise = navigator
    .mediaDevices
    .getUserMedia({
      audio: true,
      video: true
    })
    .then(gotStream)
    .catch(function(e) {
      alert('getUserMedia() error: ' + e.name);
    });
}

if (config.isOwner) {
  getLocalStream();
}

function signal(data) {
  socket.emit('signal', data);
}

function createPeerConnection(id) {
  const pc = new RTCPeerConnection(); // don't forget to specify your STUN/TURN servers here

  pc.onicecandidate = function(e) {
    if (e.candidate) {
      signal({
        type: 'new-ice-candidate',
        to: id,
        candidate: e.candidate
      });
    }
  };

  pc.onnegotiationneeded = function() {
    console.warn('neg needed');
    pc.createOffer(offerOptions)
      .then(offer => pc.setLocalDescription(offer))
      .then(() => {
        signal({
          type: 'offer',
          to: id,
          sdp: pc.localDescription
        });
      });
  };

  pc.onaddstream = function(e) {
    console.log('got stream');
    document.querySelector('video').srcObject = e.stream;
  };

  return peerConnections[id] = pc;
}

function invite(id) {
  const pc = createPeerConnection(id);
  localStreamPromise
    .then(stream => pc.addStream(stream));
}

function handleOffer(data) {
  const pc = createPeerConnection(data.from);

  pc.setRemoteDescription(data.sdp)
    .then(() => pc.createAnswer())
    .then(answer => pc.setLocalDescription(answer))
    .then(() => {
      signal({
        type: 'answer',
        to: data.from,
        sdp: pc.localDescription
      });
    });
}

function handleAnswer(data) {
  peerConnections[data.from].setRemoteDescription(data.sdp);
}

function handleNewICECandidate(data) {
  peerConnections[data.from].addIceCandidate(data.candidate);
}

socket.emit('join room', config.roomId);

socket.on('joined room', (id) => {
  if (config.isOwner) {
    invite(id);
  }
});

socket.on('signal', (data) => {
  switch(data.type) {

    case 'offer':
      debugger;
      handleOffer(data);
      break;

    case 'answer':
      handleAnswer(data);
      break;

    case 'new-ice-candidate':
      handleNewICECandidate(data);
      break;
  }
});