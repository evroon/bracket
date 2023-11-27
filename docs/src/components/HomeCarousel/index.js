import { Container, Image } from "@mantine/core";
import React from "react";
import { Carousel } from "@mantine/carousel";

export function HomeCarousel() {
  return (
    <Container width={"100%"} mb="md">
      <Carousel
        withIndicators
        slideSize={"100%"}
        slideGap="md"
        loop
        align="center"
        slidesToScroll={1}
      >
        <Carousel.Slide>
          <Image
            src={require("@site/static/img/builder_preview.png").default}
          />
        </Carousel.Slide>
        <Carousel.Slide>
          <Image
            src={require("@site/static/img/planning_preview.png").default}
          />
        </Carousel.Slide>
        <Carousel.Slide>
          <Image
            src={require("@site/static/img/schedule_preview.png").default}
          />
        </Carousel.Slide>
        <Carousel.Slide>
          <Image src={require("@site/static/img/courts_preview.png").default} />
        </Carousel.Slide>
        <Carousel.Slide>
          <Image
            src={require("@site/static/img/standings_preview.png").default}
          />
        </Carousel.Slide>
      </Carousel>
    </Container>
  );
}
