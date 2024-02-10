import React from "react";
import Layout from "@theme/Layout";
import {
  Center,
  Container,
  createTheme,
  Image,
  MantineProvider,
  Paper,
  rem,
  ThemeIcon,
  Text,
  Title,
  Stack,
} from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import { HeroTitle } from "../components/HeroTitle";
import { HomeCarousel } from "../components/HomeCarousel";
import classes from "./index.module.css";
import FeaturesCards from "../components/feature_cards";
import { IconBrandGithub, IconColorSwatch } from "@tabler/icons-react";

const theme = createTheme({});

function CardGradient() {
  return (
    <Center mx="1rem" mt="2rem">
      <Paper
        radius="md"
        className={classes.social_card}
        onClick={() => {
          open("https://github.com/evroon/bracket");
        }}
      >
        <Center inline>
          <ThemeIcon
            size="xl"
            radius="md"
            variant="filled"
            color="black"
            mr="1rem"
          >
            <IconBrandGithub
              style={{ width: rem(38), height: rem(38) }}
              stroke={1.5}
            />
          </ThemeIcon>
          <Text size="xl" fw={500} inline>
            GitHub
          </Text>
        </Center>
        <Text size="sm" mt="sm" c="dimmed">
          Go to the GitHub repository to star or fork Bracket, create issues/PRs
          or start discussions.
        </Text>
      </Paper>
    </Center>
  );
}

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

          <CardGradient />

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
