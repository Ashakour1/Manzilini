import { DEVELOPMENT_API_URL } from "@/lib/api";

const Login = async (email: string, password: string) => {
  const response = await fetch(`${DEVELOPMENT_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to login");
  }

  return response.json();
};

export default Login;


