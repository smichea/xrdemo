console.log("usbtest");

async function getDevices(){
    let devices = await navigator.usb.getDevices();
    devices.forEach(device => {
      console.log(device)
    });
}

function deviceConnected(event){
    console.log("device connected "+JSON.stringify(event));
}

function deviceDisconnected(event){
    console.log("device disconnected "+JSON.stringify(event));
}

if(typeof navigator.usb === 'undefined'){
    alert("your browser does not allow using USB, please try on chrome or edge latest version.")
} else {
    document.addEventListener('DOMContentLoaded', getDevices);
    navigator.usb.addEventListener('connect', deviceConnected);
    navigator.usb.addEventListener('disconnect', deviceDisconnected);
}