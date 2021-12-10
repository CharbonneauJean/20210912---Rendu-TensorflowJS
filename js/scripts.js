var webcamOn;
var video;
var webcamZone;
var txtWebcamZone;
var model = undefined;
var children;
var lastClassDetected = "";

function preloadObjects() {
    webcamOn = false;
    webcamZone = document.getElementById('webcamZone');
    txtWebcamZone = document.getElementById("txt_Webcam");
    cocoSsd.load().then(function(loadedModel) {
        model = loadedModel;
        addHistoryLine("CocoSsd model loaded !");
    });
    children = [];
}

function toggleWebcam() {
    if (webcamOn == false) {
        webcamZone.innerHTML = '<video autoplay="true" width="640" height="480" id="videoElement"></video>';
        video = document.querySelector("#videoElement");

        startVideo();

        txtWebcamZone.innerHTML = "Webcam ON";
        webcamOn = true;

        addHistoryLine("Webcam turned ON.");

    } else {
        video = document.querySelector("#videoElement");
        stopVideo();
        webcamZone.innerHTML = '<img src="img/webcam_off.png" width="640" height="480" />';

        txtWebcamZone.innerHTML = "Webcam OFF";
        webcamOn = false;
        addHistoryLine("Webcam turned OFF.");
    }
}

function stopVideo() {
    var stream = video.srcObject;
    var tracks = stream.getTracks();

    for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        track.stop();
    }

    video.srcObject = null;
    children = [];
    children.splice(0);
}

function startVideo() {

    if (!model) {
        alert("Model loading failed...");
        return;
    }

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                video.srcObject = stream;
                video.addEventListener('loadeddata', predictWebcam);

            })
            .catch(function(err0r) {
                console.log("Something went wrong!");
            });
    }
}

// Placeholder function for next step.
function predictWebcam() {
    model.detect(video).then(function(predictions) {
        // Remove any highlighting we did previous frame.
        for (let i = 0; i < children.length; i++) {
            webcamZone.removeChild(children[i]);
        }
        children.splice(0);

        // Now lets loop through predictions and draw them to the live view if
        // they have a high confidence score.
        for (let n = 0; n < predictions.length; n++) {
            // If we are over 66% sure we are sure we classified it right, draw it!
            if (predictions[n].score > 0.8) {
                //if (lastClassDetected != predictions[n].class) {
                //    lastClassDetected = predictions[n].class;
                addHistoryLine("Detected (" + predictions[n].class + ") at " + Math.round(parseFloat(predictions[n].score) * 100) + '% confidence.')
                    //}
                const p = document.createElement('p');
                p.innerText = predictions[n].class + ' - with ' +
                    Math.round(parseFloat(predictions[n].score) * 100) +
                    '% confidence.';
                p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: ' +
                    (predictions[n].bbox[1] - 10) + 'px; width: ' +
                    (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

                const highlighter = document.createElement('div');
                highlighter.setAttribute('class', 'highlighter');
                highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: ' +
                    predictions[n].bbox[1] + 'px; width: ' +
                    predictions[n].bbox[2] + 'px; height: ' +
                    predictions[n].bbox[3] + 'px;';

                webcamZone.appendChild(highlighter);
                webcamZone.appendChild(p);
                children.push(highlighter);
                children.push(p);
            }
        }

        // Call this function again to keep predicting when the browser is ready.
        window.requestAnimationFrame(predictWebcam);
    });
}

function addHistoryLine(message) {
    var historySelect = document.getElementById("history");
    var option = document.createElement("option");

    var nowDate = new Date();
    var nowDateStr = nowDate.getHours() + ":" + nowDate.getMinutes() + ":" + nowDate.getSeconds();

    option.text = nowDateStr + " -> " + message;
    historySelect.prepend(option);
}

function deleteHistory() {
    var historySelect = document.getElementById("history");
    removeOptions(historySelect);
}

function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for (i = L; i >= 0; i--) {
        selectElement.remove(i);
    }
}