import {
  Card,
  Container,
  rem,
  SimpleGrid,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  IconBrandOpenSource,
  IconCloud,
  IconTool,
  IconUser,
} from "@tabler/icons-react";
import classes from "../pages/index.module.css";
import React from "react";

const cardData = [
  {
    title: "Open-source and free",
    description:
      "Bracket is fully open source and free to use, licensed under the AGPL-3.0 license.",
    icon: IconBrandOpenSource,
  },
  {
    title: "Flexible",
    description:
      "Bracket supports the standard tournament types, teams can be added/changed\n" +
      "        during the tournament and new matches can be scheduled dynamically.",
    icon: IconTool,
  },
  {
    title: "Easy to use",
    description:
      "The UI is meant to be easy to use while providing maximum flexibility.",
    icon: IconUser,
  },
  {
    title: "Self-hosted",
    description:
      "You are free to host it yourself. Setup is easy; either run it in Docker or run it the\n" +
      "        natively on the host. The only external dependency is a PostgreSQL database.",
    icon: IconCloud,
  },
];

export default function FeaturesCards() {
  const features = cardData.map((feature) => (
    <Card
      key={feature.title}
      shadow="md"
      radius="md"
      className={classes.card}
      padding="xl"
    >
      <feature.icon
        style={{ width: rem(50), height: rem(50) }}
        stroke={2}
        color={"#674ad6"}
      />
      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

  return (
    <Container size="lg" py="xl">
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={0}>
        {features}
      </SimpleGrid>
    </Container>
  );
}
