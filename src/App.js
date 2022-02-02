import React, { useEffect, useState } from "react"
import * as faceapi from 'face-api.js'
import { FaceMatcherComponent } from "./FaceMatcherComponent"


function App() {
  
  const KNOWN_FACES = {
    names: ['Magne'],
    folder: 'training',
    ext: 'png', 
  }

  const [faceMatcher, setFaceMatcher] = useState()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {

    async function initialiseFaceApi() {    
  
      await Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        //faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        //faceapi.nets.ageGenderNet.loadFromUri('/models')
      ]).then(console.log('FaceApi is loaded..'))

      console.log('Start training model with known faces')      
      const faceDescriptors = await trainModelWithKnownFaces(KNOWN_FACES)
      const facMat = new faceapi.FaceMatcher(faceDescriptors, 0.6)
      setFaceMatcher(facMat)
      console.log('Done training model with known faces')

      setIsReady(true)
                
    };
    initialiseFaceApi()
  
  }, [])

  function trainModelWithKnownFaces(personList) {

    return Promise.all(
      personList.names.map(async (name) => {
        
        const faceDescriptors = []        
        let personProcessed = false
        let i = 0
        
        while (!personProcessed) {
          
          i++
          
          console.log(`Learning the face of ${name} version ${i}.`)          
          
          try {

            const image = await faceapi
              .fetchImage(`${personList.folder}/${name}/${i}.${personList.ext}`)

            const detections = await faceapi
              .detectSingleFace(image)
              .withFaceLandmarks()
              .withFaceDescriptor()
            
            if (detections) {

              console.log(detections)              
              faceDescriptors.push(detections.descriptor)              
              console.log(`Loaded image: ${name}/${i}.jpg`)  
            }
            

          } catch (error) {
            personProcessed = true
          }               
        }
  
        // Returnere fra promise med array over detektert ansikt fra alle bildene for en person
        return new faceapi.LabeledFaceDescriptors(name, faceDescriptors)
      })
    )
  }


  return (
    <div>
      {!isReady && <p>Please Wait. Initializing the face api.</p>}      
      {isReady && <FaceMatcherComponent faceMatcher={faceMatcher} />}
    </div>
  );
}

export default App;
