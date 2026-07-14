import { useState } from "react";
import { useNavigate } from "react-router";
import { AuthAPI } from "~/features/auth/api";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();

    try {
      await AuthAPI.login({
        username,
        password,
      });

      const me = await AuthAPI.me();

      console.log(me.data);

      navigate("/admin");
    } catch (err) {
      alert("Username atau password salah");
    }
  }

  return (
    <form onSubmit={login}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button>Login</button>
    </form>
  );
}
