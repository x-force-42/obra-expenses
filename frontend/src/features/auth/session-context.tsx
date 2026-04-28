import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import {
  authenticateWithGoogle,
  getAuthenticatedSession,
  type CurrentConstruction,
  type UserSummary,
} from "@/features/auth/api/authApi";

export const AUTH_TOKEN_STORAGE_KEY = "obra-expenses.access-token";

type AuthSession = {
  accessToken: string | null;
  user: UserSummary | null;
  currentConstruction: CurrentConstruction | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  loginWithGoogleCredential: (credential: string) => Promise<void>;
  logout: () => void;
};

const AuthSessionContext = createContext<AuthSession | undefined>(undefined);

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserSummary | null>(null);
  const [currentConstruction, setCurrentConstruction] =
    useState<CurrentConstruction | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function restoreSession() {
      const storedToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

      if (!storedToken) {
        if (!ignore) {
          setIsHydrated(true);
        }
        return;
      }

      try {
        const session = await getAuthenticatedSession(storedToken);

        if (!ignore) {
          setAccessToken(storedToken);
          setUser(session.user);
          setCurrentConstruction(session.currentConstruction);
          setIsHydrated(true);
        }
      } catch {
        window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);

        if (!ignore) {
          setAccessToken(null);
          setUser(null);
          setCurrentConstruction(null);
          setIsHydrated(true);
        }
      }
    }

    void restoreSession();

    return () => {
      ignore = true;
    };
  }, []);

  async function loginWithGoogleCredential(credential: string) {
    const session = await authenticateWithGoogle(credential);

    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, session.accessToken);
    setAccessToken(session.accessToken);
    setUser(session.user);
    setCurrentConstruction(session.currentConstruction);
    setIsHydrated(true);
  }

  function logout() {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setAccessToken(null);
    setUser(null);
    setCurrentConstruction(null);
    setIsHydrated(true);
  }

  const value = useMemo(
    () => ({
      accessToken,
      user,
      currentConstruction,
      isAuthenticated: Boolean(accessToken),
      isHydrated,
      loginWithGoogleCredential,
      logout,
    }),
    [accessToken, currentConstruction, isHydrated, user],
  );

  return (
    <AuthSessionContext.Provider value={value}>
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
