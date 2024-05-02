import React, { useState, useEffect } from "react";
import { Button, Col, FormSelect } from "react-bootstrap";
import introTrack from '../../sounds/announcement_sounds/Intro.wav';
import outroTrack from '../../sounds/announcement_sounds/Outro.wav';

const TextToSpeech = ({ text }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [voice, setVoice] = useState(null);
  const intro = new Audio(introTrack);
  const outro = new Audio(outroTrack);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();

    setUtterance(u);
    setVoice(voices[102]);

    return () => {
      synth.cancel();
    };
  }, [text]);

  const handlePlay = () => {
    const synth = window.speechSynthesis;

    if (isPaused) {
      synth.resume();
    }else{
        utterance.voice = voice;
    }
    intro.volume = 0.3;
    intro.play();
    utterance.onend = function(event){
      outro.volume = 0.3;
      outro.play();
    }
    intro.onended = () => {
      synth.speak(utterance);
    }


    setIsPaused(false);
  };

  const handlePause = () => {
    const synth = window.speechSynthesis;

    synth.pause();

    setIsPaused(true);
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;

    synth.cancel();

    setIsPaused(false);
  };

  const handleVoiceChange = (event) => {
    const voices = window.speechSynthesis.getVoices();
    setVoice(voices.find((v) => v.name === event.target.value));
  };

  return (
    <div>
        <Col className="mt-3">
            <FormSelect value={voice?.name} onChange={handleVoiceChange}>
            {window.speechSynthesis.getVoices().map((voice) => (
                <option key={voice.name} value={voice.name}>
                {voice.name}
                </option>
            ))}
            </FormSelect>
        </Col>
        <Col className="mt-3">
            <Button size="lg" onClick={handlePlay}>{isPaused ? "Resume" : "Announce"}</Button>
            <Button size="lg" variant="info" onClick={handlePause}>Pause</Button>
            <Button size="lg" variant="danger" onClick={handleStop}>Stop</Button>
        </Col>
    </div>
  );
};

export default TextToSpeech;
