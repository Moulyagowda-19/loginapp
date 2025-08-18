import React, { useState } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  const login = async () => {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) setToken(data.token);
  };

  const signup = async () => {
    const res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    await res.json();
    alert("User registered! Now you can login.");
  };

  return (
    <div style={{ margin: "50px" }}>
      <h2>Login / Signup</h2>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <br />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <br />
      <button onClick={signup}>Signup</button>
      <button onClick={login}>Login</button>
      {token && <p>✅ Logged in! Token: {token}</p>}
    </div>
  );
}

export default App;

