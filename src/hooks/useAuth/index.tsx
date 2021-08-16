import * as React from "react";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { AuthContext, initialAuthData } from "./context";
import { IAuth, LoginPayload } from "./types";
import { login } from "@/services/authService";
import {
  ApiHelper,
  LoginResponseInterface,
  UserHelper,
  ChurchInterface,
} from "@/utils";

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

type Props = {
  children: React.ReactNode;
};

const APP_NAME = "Lessons";

const protectedRoutes = ["/admin"];

export function AuthProvider({ children }: Props) {
  const [state, setState] = React.useState<IAuth>(initialAuthData);
  const [cookies, setCookie, removeCookie] = useCookies(["jwt", "email"]);
  const router = useRouter();

  // auto-login when user refreshes the page
  React.useEffect(() => {
    if (cookies.jwt) {
      const mutatedState = {
        user: {
          email: cookies.email,
        },
        isRelogin: true,
      };
      performLogin({ jwt: cookies.jwt }, mutatedState);
    }
  }, []);

  async function performLogin(data: LoginPayload, stateUpdates?: any) {
    try {
      setState({ ...state, loading: true, error: null, ...stateUpdates });
      const { user, churches }: LoginResponseInterface = await login(data);

      const LessonChurches: ChurchInterface[] = [];
      churches.forEach((church) => {
        if (church.apps.some((c) => c.appName === APP_NAME)) {
          churches.push(church);
        }
      });
      UserHelper.churches = LessonChurches;
      setCookie("email", user.email, { path: "/" });
      UserHelper.selectChurch();

      setState({
        ...state,
        user: user,
        loading: false,
        error: null,
        isRelogin: false,
      });

      // setChurches(churches);
    } catch (error) {
      setState({
        ...state,
        error,
        loading: false,
        isRelogin: false,
      });
    }
  }

  const contextValue: IAuth = {
    ...state,
    login: performLogin,
    logout: () => {
      removeCookie("jwt");
      removeCookie("email");

      ApiHelper.clearPermissions();

      if (protectedRoutes.includes(router.pathname)) {
        router.push("/");
      }
    },
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
