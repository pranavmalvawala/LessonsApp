import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Layout, Venue } from "@/components";
import { ApiHelper, ClassroomInterface, CustomizationInterface, ExternalVideoInterface, LessonInterface, ResourceInterface, ScheduleInterface, VenueInterface } from "@/utils";
import Link from "next/link";
import { Container, Grid, Tab, Tabs } from "@mui/material";
import { DateHelper } from "@/appBase/helpers";

export default function B1Venue() {
  const [venue, setVenue] = useState<VenueInterface>(null);
  const [lesson, setLesson] = useState<LessonInterface>(null);
  const [externalVideos, setExternalVideos] = useState<ExternalVideoInterface[]>([]);
  const [resources, setResources] = useState<ResourceInterface[]>([]);
  const [classroom, setClassroom] = useState<ClassroomInterface>(null);
  const [customizations, setCustomizations] = useState<CustomizationInterface[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleInterface>(null);
  const [prevSchedule, setPrevSchedule] = useState<ScheduleInterface>(null);
  const [nextSchedule, setNextSchedule] = useState<ScheduleInterface>(null);

  const [selectedTab, setSelectedTab] = useState<string>("");
  const router = useRouter();
  const id = router.query.id;

  useEffect(() => { loadData(); }, [id]);


  const loadData = async () => {
    if (id) {
      const v: VenueInterface = await ApiHelper.get("/venues/public/" + id, "LessonsApi");
      setVenue(v);
      setSelectedTab(v.sections[0].id)

      const lessonData = await ApiHelper.get("/lessons/public/" + v.lessonId, "LessonsApi")
      /*
      const study: StudyInterface = lessonData.study;
      const program: ProgramInterface = lessonData.program;
      const venues: VenueInterface[] = lessonData.venues;
      const bundles: BundleInterface[] = lessonData.bundles;
      const resources: ResourceInterface[] = lessonData.resources;

      */
      setResources(lessonData.resources);

      setExternalVideos(lessonData.externalVideos);
      setLesson(lessonData.lesson);


      let search = new URLSearchParams(process.browser ? window.location.search : "");
      const classroomId = search.get("classroomId");
      ApiHelper.get("/classrooms/" + classroomId, "LessonsApi").then((c: ClassroomInterface) => {
        setClassroom(c);
        ApiHelper.get("/customizations/public/venue/" + v.id + "/" + c.churchId, "LessonsApi").then(cust => setCustomizations(cust));
      });
      ApiHelper.get("/schedules/public/classroom/" + classroomId, "LessonsApi").then((data: ScheduleInterface[]) => {
        let currentIndex = -1;
        for (let i = 0; i < data.length; i++) {
          if (data[i].venueId === v.id) currentIndex = i;
        }
        if (currentIndex > -1) {
          setCurrentSchedule(data[currentIndex])
          if (currentIndex > 0) setPrevSchedule(data[currentIndex - 1]); else setPrevSchedule(null);
          if (currentIndex < data.length - 1) setNextSchedule(data[currentIndex + 1]); else setNextSchedule(null);
        }
      });
    }
  }

  const getVenue = () => {
    if (venue) {
      return <Venue useAccordion={true} venue={venue} resources={resources} externalVideos={externalVideos} bundles={null} hidePrint={true} customizations={customizations} print={0} />
    }
  }

  const getTabs = () => {
    const result: JSX.Element[] = [];
    venue?.sections?.forEach(s => {
      if (s.roles.length>0) result.push(<Tab label={s.name} value={s.id} />)

    })
    return result;
  }

  const handleChange = (newValue: string) => {
    setSelectedTab(newValue);
    const scrollTop = document.getElementById("section-" + newValue).offsetTop - 50;
    window.scrollTo({top: scrollTop, behavior: "smooth"});
  };

  const handleHighlight = () => {
    const elements = document.getElementsByClassName("sectionCard");
    let maxTop=0;
    let result = "";
    for (let i=0;i<elements.length;i++) {
      const el:any = elements[i];
      if (window.scrollY>=el.offsetTop - 60 && el.offsetTop>0) {
        if (el.offsetTop > maxTop) {
          maxTop = el.offsetTop;
          result=el.id.replace("section-", "");
        }
      }
    }

    if (result !== selectedTab) setSelectedTab(result);
  }

  useEffect(() => {
    window.addEventListener('scroll', handleHighlight);

    return () => {
      window.removeEventListener('scroll', handleHighlight);
    };
  }, []);

  return (
    <Layout withoutNavbar={true} withoutFooter={true}>
      <div id="b1Tabs">
        <Tabs value={selectedTab} onChange={(e, newVal) => { handleChange(newVal) } } variant="scrollable" scrollButtons="auto" aria-label="scrollable auto tabs example">
          {getTabs()}
        </Tabs>
      </div>
      <div style={{height:50}}></div>
      <Link href={"/b1/" + classroom?.churchId}>Go back</Link>
      <Grid container columnSpacing={2}>
        <Grid item xs={4}>
          {prevSchedule && (
            <Link href={"/b1/venue/" + prevSchedule?.venueId + "?classroomId=" + classroom?.id}>{DateHelper.prettyDate(DateHelper.toDate(prevSchedule.scheduledDate))}</Link>
          )}
        </Grid>
        <Grid item xs={4} style={{ textAlign: "center" }}>
          {currentSchedule && (
            <b>{DateHelper.prettyDate(DateHelper.toDate(currentSchedule.scheduledDate))}</b>
          )}
        </Grid>
        <Grid item xs={4} style={{ textAlign: "right" }}>
          {nextSchedule && (
            <Link href={"/b1/venue/" + nextSchedule?.venueId + "?classroomId=" + classroom?.id}>{DateHelper.prettyDate(DateHelper.toDate(nextSchedule.scheduledDate))}</Link>
          )}
        </Grid>
      </Grid>

      <Container fixed>
        <h1>{lesson?.title}</h1>
      </Container>
      <div className="b1">
        {getVenue()}
      </div>
      <br />
    </Layout>
  );
}
