const ip = document.getElementById("ip-address");

const ipLocalStorage = localStorage.getItem("ip");

if (ipLocalStorage) {
	ip.value = ipLocalStorage;
}

document.getElementById("connectBtn").addEventListener("click", connectBtn);

function connectBtn() {
  localStorage.setItem("ip", ip.value);
  var peer = new Peer({ host: ip.value, port: 9000, path: "/myapp" });
  peer.on("open", function(id) {
		console.log("My peer ID is: " + id);
		document.getElementById("get-id").innerHTML = "my id: " + id;
  });
  peer.on("connection", function(c) {
    console.log("connected");

    peer.on("call", function(call) {
      console.log(call);
      // Answer the call, providing our mediaStream
      call.answer();
      call.on("stream", function(stream) {
        document.querySelector("video").srcObject = stream;
      });
    });

    c.on("data", data => {
      console.log(data);
    });
  });
}
