import React, { useRef } from "react";
import * as faceapi from 'face-api.js';

export const FaceMatcherComponent = (props) => {

    console.log("facematchercomp")

    const imageRef = useRef();
    const canvasRef = useRef(null);
  
    const faceMatcher = props.faceMatcher
  
    const imageOnChange = async (event) => {
  
     
        let image = await faceapi.bufferToImage(event.target.files[0])
        imageRef.current.src = image.src

        let canvas = canvasRef.current
        canvasRef.current = faceapi.createCanvasFromMedia(image)
  
        const displaySize = { width: image.width, height: image.height }
        faceapi.matchDimensions(canvas, displaySize) 
        canvasRef.current = canvas
  
        const detections = await faceapi
            .detectAllFaces(image)
            .withFaceLandmarks()
            //.withAgeAndGender()
            //.withFaceDescriptors()
        
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const results = resizedDetections
            .map(d => faceMatcher.findBestMatch(d.descriptor))
      
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box
            const drawBox = new faceapi
                .draw.DrawBox(box, { label: result.toString() })
            drawBox.draw(canvas)
        })        
    }

    return (
        <>
            <div>
                <input type="file" onChange={(event) => imageOnChange(event)} />
            </div>
            <div>
                <img
                    id="imageUpload"                     
                    ref={imageRef}
                    style={{ position: "absolute", top: 50, left: 0 }}
                />
                <canvas
                    ref={canvasRef}
                    style={{ position: "absolute", top: 50, left: 0 }}     
                />
      
            </div>
        </>
    )
}