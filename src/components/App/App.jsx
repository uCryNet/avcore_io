import React, {useEffect, useRef, useState} from 'react'

export const App = () => {
  const video = useRef() // сам video
  const [played, setPlayed] = useState(false) // меняем цвет кнопки
  const [volume, setVolume] = useState(0)

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    }).then((stream) => {
      video.current.srcObject = stream;
      video.current.play();

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);

      javascriptNode.addEventListener('audioprocess', () => {
        let values = 0;
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);

        for (let i = 0; i < array.length; i++) {
          values += (array[i]);
        }

        const average = values / array.length;

        if (average >= 5) {
          setPlayed(true)
        } else {
          setPlayed(false)
        }
        setVolume(average)
      })
    }).catch((error) => {
      console.log("Ошибка: ", error);
    });
  }, [])

  return (
    <div className={'app'}>
      <video width={400} height={'auto'} ref={video}/>
      <div className={'play ' + (played ? 'play--yes' : 'play--no')}>
        Громкость {volume}
      </div>
    </div>
  )
}

export default App
