const { desktopCapturer } = require("electron");
var PeerServer = require("peer").PeerServer;
var server = PeerServer({ port: 9000, path: "/myapp" });

let mediaStream;
let id;
let call;
let connected = false;

var peer = new Peer({ host: "localhost", port: 9000, path: "/myapp" });

document.getElementById("connectBtn").addEventListener("click", () => {
  if (!mediaStream) {
    document.getElementById("connection-status").innerHTML =
      "Choose a window before sharing!";
    return;
  }
  id = document.getElementById("id").value;
  connect(id);
});

function connect(id) {
  var conn = peer.connect(id);

  conn.on("open", () => {
    connected = true;
    let tempStream = mediaStream;
    if (mediaStream) {
      call = peer.call(id, mediaStream);
    }
    setInterval(() => {
      if (mediaStream) {
        if (tempStream !== mediaStream) {
          call.close();
          tempStream = mediaStream;
          call = peer.call(id, mediaStream);
        }
      }
    }, 1000);

    document.getElementById("connection-status").innerHTML = "Connected.";
    conn.send("owo");
  });
}

const sourcesDiv = document.getElementById("sources");

showSources();
setInterval(() => {
  showSources();
}, 2000);

function showSources() {
  desktopCapturer.getSources({ types: ["window", "screen", "audio"] }, function(
    error,
    sources
  ) {
    sourcesDiv.innerHTML = "";
    for (let source of sources) {
      addSource(source);
    }
  });
}

function addSource(source) {
  const newEl = document.createElement("div");
  newEl.classList.add("source-container");
  const newImgEl = document.createElement("img");
  newImgEl.src = source.thumbnail.toDataURL();
  newEl.innerHTML = newImgEl.outerHTML;
  const newElName = document.createElement("div");
  newElName.classList.add("title");
  newElName.innerHTML = source.name;
  newEl.innerHTML += newElName.outerHTML;
  sourcesDiv.append(newEl);
  newEl.id = source.id;
}

sourcesDiv.addEventListener("click", async event => {
  if (!event.target.closest(".source-container")) return;
  const id = event.target.closest(".source-container").id;
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSourceId: id,
        chromeMediaSource: "desktop",
      }
    },
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: id,
        maxFrameRate: 60
      }
    }
  });
  mediaStream = stream;
  document.querySelector("video").srcObject = stream;
});
