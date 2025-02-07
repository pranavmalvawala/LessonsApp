import React from "react"
import { useRouter } from "next/router"
import { Layout } from "@/components";
import { Register } from "@/appBase/pageComponents/components/Register";
import { ApiHelper, UserHelper } from "@/appBase/helpers"
import { ErrorMessages } from "@/components";

export default function RegisterPage() {
  const router = useRouter()
  const [errors, setErrors] = React.useState([]);

  if (ApiHelper.isAuthenticated && UserHelper.currentUserChurch) { router.push("/") }

  return (
    <Layout withoutNavbar withoutFooter>
      <div style={{ maxWidth: 350, marginLeft: "auto", marginRight: "auto" }}>
        <img src="/images/logo.png" alt="Church Lessons" style={{ width: "100%", marginTop: 100, marginBottom: 60 }} />
        <ErrorMessages errors={errors} />

        <div id="loginBox" style={{ backgroundColor: "#FFF", border: "1px solid #CCC", borderRadius: 5, padding: 20 }}>
          <h2>Create an Account</h2>

          <Register updateErrors={setErrors} appName="Lessons.church" appUrl="https://lessons.church/" />
        </div>
      </div>
    </Layout>
  );
}
