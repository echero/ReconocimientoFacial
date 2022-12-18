const video = document.getElementById('video')

function startVideo() {
    navigator.getUserMedia = (navigator.getUserMedia || 
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia)
    navigator.getUserMedia(
        {video: {}},
        stream => video.srcObject = stream,
        err => console.log(err)
    )   
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('ReconocimientoFacial/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('ReconocimientoFacial/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('ReconocimientoFacial/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('ReconocimientoFacial/models'),
    faceapi.nets.ageGenderNet.loadFromUri('ReconocimientoFacial/models')
]).then(startVideo)

video.addEventListener('play', () =>{
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender()

        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

        resizedDetections.forEach(detection => {
            const box = detection.detection.box
            new faceapi.draw.DrawBox(box, {
                label: Math.round(detection.age) + ' años ' +detection.gender
            }).draw(canvas)
        })
    }, 100)
})
