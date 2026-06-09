import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/sessionService";

export function useAuthGuard(allowedRoles) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!allowedRoles.includes(currentUser.role)) {
      alert("Kein Zugriff");
      navigate("/login");
      return;
    }

    setUser(currentUser);
  }, [allowedRoles, navigate]);

  return user;
}
