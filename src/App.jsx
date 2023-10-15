import "./styles.css";
import { useEffect, useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import { load } from "@tensorflow-models/toxicity";

let id = 3;

const initialMessages = [
  { id: 1, msg: "hi" },
  { id: 2, msg: "What's up?" },
];

export default function App() {
  const [messages, setMessages] = useState(initialMessages);
  const [toxicity, setToxicity] = useState({ isToxic: false, labels: [] });
  const [isClassifying, setIsClassifying] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const hasMessages = messages.length > 0;
  const model = useRef(null);

  const sendMessage = async (event) => {
    event.preventDefault();
    const form = event.target;
    const msg = form.message.value;

    setIsClassifying(true);
    const predictions = await model.current.classify([msg]);
    setIsClassifying(false);

    const isToxic = predictions[6].results[0].match;
    let z = 1;
    if (isToxic) {
      const labels = [];
      predictions.forEach((p) => {
        if (p.results[0].match) {
          labels.push({
            label: p.label,
            prob: Math.round(p.results[0].probabilities[1] * 100) + "%"
          });
        }
      });
      setToxicity({ isToxic: true, labels });
    } else {
      setMessages([...messages, { id: ++id, msg: msg }]);
      setToxicity({ isToxic: false, labels: [] });
      form.reset();
    }

    if (msg == "Jamal") {
      z = 0;
    }

    if (z == 0) {
      alert(" dont worry being jamal is legal here");
    }
  };
  useEffect(() => {
    async function loadModel() {
      const threshold = 0.9;
      model.current = await load(threshold);
      setHasLoaded(true);
      console.log("Model loaded");
    }
    loadModel();
  }, []);

  return (
    <>
      <h1>Explict Chat Detector by Surya</h1>
      {hasMessages && (
        <ul>
          {messages.map((message) => {
            return <li key={message.id}>{message.msg}</li>;
          })}
        </ul>
      )}
      {hasLoaded && (
        <form onSubmit={sendMessage}>
          <input type="text" name="message" placeholder="Enter message" />
          <button>{isClassifying ? " ️‍️‍🕵 " : "Send"}</button>
          <span>{toxicity.isToxic && " 🤐"}</span>
          <span>{}</span>
          {toxicity.labels.map((l) => ` ${l.label} ${l.prob}`)}
        </form>
      )}
    </>
  );
}
