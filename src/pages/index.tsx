import Head from "next/head";
import { GetStaticProps } from "next";
import { Container, Row, Col, Button } from "react-bootstrap";
import { HomeAbout, HomeConnect, Layout, Programs } from "@/components";
import { ApiHelper, ProgramInterface, ProviderInterface } from "@/utils";

type Props = {
  programs: ProgramInterface[];
  providers: ProviderInterface[];
};

export default function Home({ programs, providers }: Props) {
  return (
    <Layout metaDescription="Church budgets prohibit teaching the word of God in the most effective way possible. We provide high quality content to churches completely free of charge, thanks to our generous partners.">
      <div id="hero">
        <Container>
          <Row>
            <Col lg={{ span: 8, offset: 2 }} className="text-center">
              <h1>
                Completely <span>Free Curriculum</span> for Churches
              </h1>
              <p>
                We believe that limited church budgets should never stand in the
                way of teaching both children and adults the word of God in the
                most effective way possible. By partnering with generous
                creators willing to donate their work for other churches to use
                we are able to provide this content for your church completely
                free of charge.
              </p>
              <div>
                <Button variant="success" size="lg" href="/login">
                  Get Started for Free
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <HomeAbout />
      <Programs programs={programs} providers={providers} />
      <HomeConnect />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const programs: ProgramInterface[] = await ApiHelper.getAnonymous(
    "/programs/public",
    "LessonsApi"
  );
  const providers: ProviderInterface[] = await ApiHelper.getAnonymous(
    "/providers/public",
    "LessonsApi"
  );

  return {
    props: {
      programs,
      providers,
    },
    revalidate: 30,
  };
};
