window.addEventListener('message', event => {
    // alert("got message from origin " + event.origin + " with data " + event.data.Category + ", " + event.data.Item);
    // IMPORTANT: check the origin of the data!
    console.log("NODE received message from " + event.origin + " with data " + event.data);
    // Getting message from flask
    // event.origin should normally be globalIP (This is the ip address of the iframe from chat.html)
    var ethernetIP = 'http://172.31.19.250'
    var localhost = 'http://localhost'
    var localhostIP = 'http://127.0.0.1'
    var globalhost = 'https://sapien.coach'
    var wwwglobalhost = 'https://www.sapien.coach'
    var globalIP = 'http://35.174.24.171'

    // You directly opened the UE stream. It does not get a message.
    // The mh to display is unspecified // Should remove from if statement while not testing
    var ethernetIP81 = 'http://172.31.19.250:81'
    var localhost81 = 'http://localhost:81'
    var localhostIP81 = 'http://127.0.0.1:81'
    var globalhost81 = 'https://sapien.coach:81'
    var wwwglobalhost81 = 'https://www.sapien.coach:81'
    var globalIP81 = 'http://35.174.24.171:81'

    var acceptableIPs = [ethernetIP, localhost, localhostIP, globalhost, wwwglobalhost, globalIP]
    var acceptableIPs81 = [ethernetIP81, localhost81, localhostIP81, globalhost81, wwwglobalhost81, globalIP81]

    if (acceptableIPs.includes(event.origin) || acceptableIPs81.includes(event.origin)) {
        // The data was sent from your site.
        // Data sent with postMessage is stored in event.data:
        console.log("valid source! sending data: " + event.data.Category + ", " + event.data.Item);
        sendBPEvent(event.data);
    } else {
        console.log("IP mismacth");
        // sendBPEvent(event.data);
        // The data was NOT sent from your site!
        // Be careful! Do not use it. This else branch is
        // here just for clarity, you usually shouldn't need it.
        return;
    }
});

function sendBPEvent(data) {
    console.log("Sending BP Event: " + data.Category + ", " + data.Item);
    emitUIInteraction(data);
    console.log("Sent BP Event: " + data.Category + ", " + data.Item);
}

