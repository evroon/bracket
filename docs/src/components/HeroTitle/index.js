import { Container, Text, Button, Group } from "@mantine/core";
import { GithubIcon } from "@mantinex/dev-icons";
import classes from "./styles.module.css";
import React from "react";

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
              open("docs/getting-started/quickstart", "_self");
            }}
          >
            Get started
          </Button>

          <Button
            component="a"
            href="https://github.com/evroon/bracket"
            size="xl"
            variant="default"
            className={classes.control}
            leftSection={<GithubIcon size={20} />}
          >
            GitHub
          </Button>
        </Group>
      </Container>
    </div>
  );
}
