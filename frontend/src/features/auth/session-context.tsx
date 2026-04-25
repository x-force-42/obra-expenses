import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

type AuthSession = {
  token: string | null;
  setToken: (token: string | null) => void;
};

const AuthSessionContext = createContext<AuthSession | undefined>(undefined);

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);

  return (
    <AuthSessionContext.Provider
      value={{
        token,
        setToken,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const value = useContext(AuthSessionContext);

  if (!value) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }

  return value;
}
