import { startVoice } from "../hooks/useVoice";
import { parseCommand } from "../engine/parser";
import { applyRally } from "../engine/volleyballEngine";
import { useMatch } from "../context/MatchContext";

export default function VoiceInput() {
  const { match, setMatch } = useMatch();

  const handle = (text) => {
    const parsed = parseCommand(text);

    if (parsed.evaluation === "+") {
      const updated = applyRally(match, {
        ...parsed,
        text,
      });
      setMatch(updated);
    }
  };

  return (
    <button
      onClick={() => startVoice(handle)}
      className="bg-purple-500 text-white px-4 py-2 rounded"
    >
      🎙 Voice
    </button>
  );
}