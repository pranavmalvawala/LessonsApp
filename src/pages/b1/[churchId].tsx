import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components";
import { ApiHelper, ChurchInterface, ClassroomInterface } from "@/utils";
import Link from "next/link";
import { Container } from "@mui/material";


export default function Venue() {
  //const [church, setChurch] = useState<ChurchInterface>(null);
  const [classrooms, setClassrooms] = useState<ClassroomInterface[]>([]);
  const router = useRouter();
  const churchId = router.query.churchId;


  useEffect(() => { loadData(); }, [churchId]);


  const loadData = () => {
    if (churchId) {
      ApiHelper.get("/classrooms/public/church/" + churchId, "LessonsApi").then((v: ClassroomInterface[]) => { setClassrooms(v); });
    }
  }

  const getRows = () => {
    const result: JSX.Element[] = [];
    classrooms?.forEach(c => {
      result.push(<Link href={"/b1/classroom/" + c.id} className="bigLink">{c.name}</Link>)
    })
    return result;
  }



  if (classrooms?.length === 1) window.location.href = "/b1/classroom/" + classrooms[0].id;
  else {
    return (
      <Layout withoutNavbar={true} withoutFooter={true}>
        <Container fixed>
          <h1>Select a Room</h1>
        </Container>
        {getRows()}
        <br />
      </Layout>
    );
  }
}
