import React from "react";
import Layout from "@theme/Layout";
import {
  Center,
  Container,
  createTheme,
  Image,
  MantineProvider,
  Title,
} from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import { HeroTitle } from "../components/HeroTitle";
import { HomeCarousel } from "../components/HomeCarousel";
import classes from "./index.module.css";
import FeaturesCards from "../components/feature_cards";

const theme = createTheme({});

export default function Home() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Layout
        title={""}
        description="Description will go into a meta tag in <head />"
      >
        <HeroTitle />
        <main>
          <Center>
            <Container mt="lg" px="0px" mx="1rem">
              <Image
                src={
                  require("@site/static/img/bracket-screenshot-design.png")
                    .default
                }
              />
            </Container>
          </Center>
          <Title order={2} className={classes.title} ta="center" mt="lg">
            Features
          </Title>
          <FeaturesCards />
          <Container mt="lg" px="0px">
            <Title order={2} className={classes.title} ta="center" my="lg">
              Screenshots
            </Title>
            <HomeCarousel />
          </Container>
        </main>
      </Layout>
    </MantineProvider>
  );
}
