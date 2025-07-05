import React from "react";

const Recorder = () => {
    const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext({ sampleRate: 16000 }); // GCS2T推奨
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      
      source.connect(processor);
      processor.connect(context.destination);
  
      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        // Float32Array から 16bit PCMに変換して送る（後日実装）
        console.log(input);
      };
    };
  
    return <button onClick={startRecording}>録音開始</button>;
  };
  
  export default Recorder;
  