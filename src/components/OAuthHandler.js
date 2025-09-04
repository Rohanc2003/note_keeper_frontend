import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OAuthHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");

    if (token && email) {
      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
      localStorage.setItem("email", email);

      // ✅ Redirect straight to dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [location, navigate]);

  return null; // nothing to render
}
