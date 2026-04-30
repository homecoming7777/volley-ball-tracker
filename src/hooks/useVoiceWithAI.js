import { useState, useRef } from "react";
import { parseVoiceCommand } from "../utils/voiceParser";
import { correctVoiceText } from "../utils/aiVoiceCorrector";

export default function useVoiceWithAI(onCommand) {
  const recognitionRef = useRef(null);
  const teamRef = useRef("A");

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      let text = event.results[0][0].transcript;

      // 🔥 STEP 1: normalize
      text = text.toLowerCase().trim();

      // 🔥 STEP 2: AI correction
      text = correctVoiceText(text);

      setTranscript(text);

      // 🔥 STEP 3: parse
      const parsed = parseVoiceCommand(text, teamRef);

      console.log("FINAL PARSED:", parsed);

      // 🔥 STEP 4: send to app
      onCommand(parsed);
    };

    recognition.onend = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  return {
    listening,
    transcript,
    startListening,
  };
}