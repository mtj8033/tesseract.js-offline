import { TesseractWorker } from "tesseract.js";

import hljs from "highlight.js";

import { ImageCapture } from 'image-capture';

export function setupTesseract() {

    const results = document.getElementById("results");
    const timings = document.getElementById("timing");

    const worker = new TesseractWorker({
        workerPath: require.resolve("worker.min.js"),
        langPath: require.resolve("lang-data"),
        // corePath: require.resolve("tesseract-core.js"),
    });
    let start = window.performance.now();
    worker
        .recognize("images/rcc.jpg", "mcr")
        .progress((info) => {
            console.log(info);
        })
        .then((result) => {
            console.log(result);
            let end = window.performance.now();
            let time = end - start;
            const getCircularReplacer = () => {
                const seen = new WeakSet();
                return (key, value) => {
                    if (typeof value === "object" && value !== null) {
                        if (seen.has(value)) {
                            return;
                        }
                        seen.add(value);
                    }
                    return value;
                };
            };
            // debugger;
            results.innerHTML = result.text;//JSON.stringify(result, getCircularReplacer());
            // hljs.highlightBlock(results);
            timings.innerHTML = "Took: " + time + "ms";
        });


    let interval;
    const canvas = document.getElementById('frame');

    const photo = document.getElementById('photo');
    photo.addEventListener('load', function () {
        // After the image loads, discard the image object to release the memory
        window.URL.revokeObjectURL(photo.src);
    });

    let videoDevice;
    document.getElementById('stop').addEventListener('click', stopFunction);

    // Use navigator.mediaDevices.getUserMedia instead of navigator.getUserMedia, per
    // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia and https://webrtc.org/web-apis/interop/
    // For cross-platform compatibility, we'll use the WebRTC adapter.js library
    if (navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia) {
            let constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
            constraints.video = true;
        navigator.mediaDevices.getUserMedia(constraints).then(gotMedia).catch(failedToGetMedia);
    } else {
        alert("getUserMedia() is not supported by your browser");
    }
    /**
     * We have a video capture device. Exercise various capturing modes.
     * @param {MediaStream} mediaStream
     */
    function gotMedia(mediaStream) {
        // Extract video track.
        videoDevice = mediaStream.getVideoTracks()[0];
        console.log('Using camera', videoDevice.label);

        const captureDevice = new ImageCapture(videoDevice, mediaStream);
        interval = setInterval(function () {
            captureDevice.grabFrame().then(processFrame).catch(error => {
                console.error((new Date()).toISOString(), 'Error while grabbing frame:', error);
            });

            captureDevice.takePhoto().then(processPhoto).catch(error => {
                console.error((new Date()).toISOString(), 'Error while taking photo:', error);
            });
        }, 300);
    }

    /**
     * Draw the imageBitmap returned by grabFrame() onto a canvas
     * @param {ImageBitmap} imageBitmap
     */
    function processFrame(imageBitmap) {
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        canvas.getContext('2d').drawImage(imageBitmap, 0, 0);
    }

    /**
     * Set the source of the 'photo' <img> to the blob returned by takePhoto()
     * @param {Blob} blob
     */
    function processPhoto(blob) {
        photo.src = window.URL.createObjectURL(blob);
    }

    /**
     * Stop frame grabbing and video capture
     */
    function stopFunction() {
        if (interval) clearInterval(interval);  // stop frame grabbing
        if (videoDevice) videoDevice.stop();  // turn off the camera
    }

    /**
     * Handle errors
     * @param {Error} error
     */
    function failedToGetMedia(error) {
        console.error('getUserMedia failed:', error);
        stopFunction();
    }
}