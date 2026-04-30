import { useContext } from "react";
import { MatchContext } from "../context/MatchContext";
import { applyEvent } from "../engine/eventEngine";

export function useMatchEngine() {
  const { match, setMatch } = useContext(MatchContext);

  const addEvent = (event) => {
    const updated = applyEvent(match, event);
    setMatch(updated);
  };

  return {
    match,
    setMatch,
    addEvent,
  };
}