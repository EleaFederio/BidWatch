import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, FormSelect } from "react-bootstrap";
import introTrack from '../../sounds/announcement_sounds/Intro.wav';
import outroTrack from '../../sounds/announcement_sounds/Outro.wav';

const pickDefaultVoice = (voices) => (
  voices.find((availableVoice) => availableVoice.name === 'Microsoft Rosa Online (Natural) - Filipino (Philippines)') ||
  voices.find((availableVoice) => availableVoice.name.includes('Rosa') && availableVoice.name.includes('Philippines')) ||
  voices.find((availableVoice) => availableVoice.lang === 'fil-PH') ||
  voices.find((availableVoice) => availableVoice.lang === 'en-PH') ||
  voices[0] ||
  null
);

const TextToSpeech = ({ text }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [voice, setVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const intro = useMemo(() => new Audio(introTrack), []);
  const outro = useMemo(() => new Audio(outroTrack), []);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      setVoice((currentVoice) => currentVoice || pickDefaultVoice(availableVoices));
    };

    loadVoices();
    synth.addEventListener('voiceschanged', loadVoices);

    return () => {
      synth.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const speechUtterance = new SpeechSynthesisUtterance(text);
    speechUtterance.voice = voice;
    setUtterance(speechUtterance);

    return () => {
      synth.cancel();
    };
  }, [text, voice]);

  const handlePlay = () => {
    const synth = window.speechSynthesis;

    if (!utterance) {
      return;
    }

    if (isPaused) {
      synth.resume();
    } else {
      utterance.voice = voice;
      intro.volume = 0.3;
      outro.volume = 0.3;
      intro.play();
      utterance.onend = () => {
        outro.play();
      };
      intro.onended = () => {
        synth.speak(utterance);
      };
    }

    setIsPaused(false);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPaused(false);
  };

  const handleVoiceChange = (event) => {
    setVoice(voices.find((availableVoice) => availableVoice.name === event.target.value) || null);
  };

  return (
    <div>
      <Col className="mt-3">
        <FormSelect value={voice?.name || ''} onChange={handleVoiceChange}>
          {voices.map((availableVoice) => (
            <option key={`${availableVoice.name}-${availableVoice.lang}`} value={availableVoice.name}>
              {availableVoice.name}
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
