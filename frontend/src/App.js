import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/").then((res) => {
      setMessage(res.data);
    }).catch((error) => {
      console.error("Erreur de connexion :", error);
    });
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Bienvenue sur NextRH 🎓</h1>
      <p>Message du serveur backend :</p>
      <strong style={{ color: "green" }}>{message}</strong>
    </div>
  );
}

export default App;
