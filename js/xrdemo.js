// Polyfill makes it possible to run WebXR on devices that support only WebVR.
//import WebXRPolyfill from "https://cdn.jsdelivr.net/npm/webxr-polyfill@latest/build/webxr-polyfill.module.js";
//const polyfill = new WebXRPolyfill();

let xrButton = document.getElementById("xr-button");
let xrSession = null;
let xrRefSpace = null;
let canvas = null;

function onButtonClicked() { // this function specifies what our button will do when clicked
	if(!xrSession) { // if our session is null - if it wasn't created
		initWebXR(); // request it
	} else { // if our session was started already
		xrSession.end(); // request our session to end
	}
}

function onResize() { // this function resizes our canvas in a way, that makes it fit the entire screen perfectly!
	canvas.width = canvas.clientWidth * window.devicePixelRatio;
	canvas.height = canvas.clientHeight * window.devicePixelRatio;
}

function initWebGL2(attributes) {
	canvas = document.createElement("canvas"); // creates a new canvas element ( <canvas></canvas> )
    gl = canvas.getContext("webgl2", attributes || {alpha: false}); // creates a WebGL2 context, using the canvas
    if(!gl) { // if the context DIDN'T create properly
		alert("This browser does not support WebGL 2."); // alert the user about it
		return; // go out of the function; stop this function
	}
    canvas.style = "position: absolute; width: 100%; height: 100%; left: 0; top: 0; right: 0; bottom: 0; margin: 0; z-index: -1"; // we add a simple style to our canvas
    document.body.appendChild(canvas); // appends/adds the canvas element to the document's body
	onResize(); // resizes the canvas (it needs to be done, because otherwise it will not resize until you resize your window)
    
}

function onSessionStarted(_session) { // this function defines what happens when the session is started
    
    console.log("onSessionStarted:{}",_session);
    
	xrSession = _session; // we set our session to be the session our request created
	xrSession.addEventListener("end", onSessionEnded); // we set what happenes when our session is ended

	initWebGL2({xrCompatible: true}); // we initialize WebGL2, in a way that makes it compatible with WebXR

	xrSession.updateRenderState({baseLayer: new XRWebGLLayer(xrSession, gl)}); // this line simply sets our session's WebGL context to our WebGL2 context
	
    const renderer = new ezgfx.Renderer();
    const triangleMesh = new ezgfx.Mesh();
    triangleMesh.loadFromData(ezgfxGlobals.triangle);
    
    const triangleMaterial = new ezgfx.Material();
    const identityMatrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
    const triangleModelMatrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, -3.0, 1.0 // the first element of this row is for x position, the second for y and the third for z, which means we just offset it by negative three on the z axis
    ]);
    
    triangleMaterial.setProjection(identityMatrix);
    triangleMaterial.setView(identityMatrix);
    triangleMaterial.setModel(triangleModelMatrix);
    
    xrSession.requestReferenceSpace("local").then((refSpace) => { // we request our referance space - an object that defines where the center of our space lies. Here we request a local referance space - that one defines the center of the world to be where player's head is at the start of our application.
		xrRefSpace = refSpace; // we set our referance space to be the one returned by this function
		xrSession.requestAnimationFrame(onSessionFrame); // at this point everything has been set up, so we can finally request an animation frame, on a function with the name of onSessionFrame
	});

	function onSessionEnded() { // this function defines what happens when the session has ended
		xrSession = null; // we set our xrSession to be null, so that our button will be able to reinitialize it when we click it the next time
	}

    function onSessionFrame(t, frame) { // this function will happen every frame
        console.log("onSessionFrame");
        const session = frame.session; // frame is a frame handling object - it's used to get frame sessions, frame WebGL layers and some more things
        session.requestAnimationFrame(onSessionFrame); // we simply set our animation frame function to be this function again
        let pose = frame.getViewerPose(xrRefSpace); // gets the pose of the headset, relative to the previously gotten referance space
    
        if(pose) { // if the pose was possible to get (if the headset responds)
            let glLayer = session.renderState.baseLayer; // get the WebGL layer (it contains some important information we need)
    
            gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer); // sets the framebuffer (drawing target of WebGL) to be our WebXR display's framebuffer
            renderer.clear([0.3, 1.0, 0.4, 1.0]);
            for(let view of pose.views) { // we go through every single view out of our camera's views
                let viewport = glLayer.getViewport(view); // we get the viewport of our view (the place on the screen where things will be drawn)
                gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height); // we set our viewport appropriately
                triangleMaterial.setProjection(view.projectionMatrix);
                triangleMaterial.setView(view.transform.inverse.matrix);
                renderer.draw(triangleMesh, triangleMaterial);
            }
        }
    }
}




function log(message){
    let con = document.getElementById("console");
    con.innerHTML=con.innerHTML+"<br/>\n"+message;
}

async function initWebXR(){
    let xr=navigator.xr;
    log("initWebXR navigator.xr="+navigator.xr);
    let immersive = await xr.isSessionSupported('immersive-vr');

    console.log("immersive-vr xrSessionSupported:{}",  immersive );
    log("immersive-vr xrSessionSupported:"+immersive);
    if(!immersive){
        let inline = await xr.isSessionSupported('inline');
        if(!inline){
            alert('No inline session supported');
            return;
        }
    }
    if(immersive){
        xrSession = await navigator.xr.requestSession("immersive-vr");
        console.log("xrSession:{}",xrSession);
        xrButton.disabled = false; // enable the button (makes it possible to click it)
        xrButton.textContent = "Enter VR"; // change text on the button
        xrButton.addEventListener("click", onButtonClicked); // add a new event to the button, which will run the onButtonClicked function
        onSessionStarted(xrSession);
    } else {
        xrSession = await navigator.xr.requestSession("inline");
        console.log("xrSession:{}",xrSession);
        xrButton.textContent = "VR not supported"; // change text on the button
        xrSession.onend=(e)=>{alert("session ended after "+Math.round(e.timeStamp/1000)+ "sec."); console.log(e)}
    }
}

initWebXR();
