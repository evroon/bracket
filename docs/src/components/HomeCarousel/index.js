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
            alt="preview image of the tournament builder page in Bracket"
            src={require("@site/static/img/builder_preview.png").default}
          />
        </Carousel.Slide>
        <Carousel.Slide>
          <Image
            alt="preview image of the tournament planning page in Bracket"
            src={require("@site/static/img/planning_preview.png").default}
          />
        </Carousel.Slide>
        <Carousel.Slide>
          <Image
            alt="preview image of the tournament scheduling page in Bracket"
            src={require("@site/static/img/schedule_preview.png").default}
          />
        </Carousel.Slide>
        <Carousel.Slide>
          <Image
            alt="preview image of the courts page in Bracket"
            src={require("@site/static/img/courts_preview.png").default}
          />
        </Carousel.Slide>
        <Carousel.Slide>
          <Image
            alt="preview image of the standings page in Bracket"
            src={require("@site/static/img/standings_preview.png").default}
          />
        </Carousel.Slide>
      </Carousel>
    </Container>
  );
}
