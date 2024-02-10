import { Container, Text, Button, Group, Center } from "@mantine/core";
import { GithubIcon } from "@mantinex/dev-icons";
import classes from "./styles.module.css";
import React from "react";
import {
  IconBracketsContainStart,
  IconLibrary,
  IconLivePhoto,
  IconLiveView,
  IconPlayCard,
  IconPlayerPlay,
  IconRocket,
  IconRun,
  IconStar,
} from "@tabler/icons-react";

export function HeroTitle() {
  return (
    <div className={classes.wrapper}>
      <Container maxSize={"400px"} className={classes.inner}>
        <h1 className={classes.title}>
          Free and open source{" "}
          <Text
            component="span"
            variant="gradient"
            gradient={{ from: "indigo", to: "#674ad6" }}
            inherit
          >
            tournament scheduling
          </Text>{" "}
          system
        </h1>

        <Text className={classes.description} color="dimmed">
          Build tournament setups, add teams, schedule matches, keep track of
          scores and present ranking live to the public.
        </Text>

        <Group className={classes.controls}>
          <Button
            size="xl"
            className={classes.control}
            variant="gradient"
            gradient={{ from: "indigo", to: "#674ad6" }}
            onClick={() => {
              open("https://www.bracketapp.nl/demo", "_self");
            }}
          >
            <Center inline>
              <IconRocket size="32px" style={{ marginRight: "0.5rem" }} />
              Demo
            </Center>
          </Button>
          <Button
            size="xl"
            className={classes.control}
            variant="default"
            onClick={() => {
              open("docs/running-bracket/quickstart", "_self");
            }}
          >
            <Center inline>
              <IconLibrary size="32px" style={{ marginRight: "0.5rem" }} />
              Get started
            </Center>
          </Button>
        </Group>
      </Container>
    </div>
  );
}
