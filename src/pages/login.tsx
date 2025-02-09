import { useRouter } from "next/router"
import { useCookies } from "react-cookie"
import { Layout } from "@/components";
import { LoginPage } from "@/appBase/pageComponents/LoginPage";
import { ApiHelper, UserHelper } from "@/appBase/helpers"

export default function Login() {
  const router = useRouter()
  const [cookies] = useCookies()

  if (ApiHelper.isAuthenticated && UserHelper.currentUserChurch) { router.push("/portal") }

  const loginSuccess = () => {
    router.push("/portal");
  }

  const appUrl = (process.browser) ? window.location.href : "";
  let jwt: string = "", auth: string = "";
  if (!ApiHelper.isAuthenticated) {
    auth = router.query.auth as string
    let search = new URLSearchParams(process.browser ? window.location.search : "");
    jwt = search.get("jwt") || cookies.jwt
  }

  return (
    <Layout withoutNavbar withoutFooter>
      <LoginPage auth={auth} context={null} jwt={jwt} appName="Lessons.church" loginSuccessOverride={loginSuccess} appUrl={appUrl} />
    </Layout>
  );
}
