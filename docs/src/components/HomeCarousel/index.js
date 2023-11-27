import {Center, Image} from '@mantine/core';
import React from 'react';
import {Carousel} from "@mantine/carousel";

export function HomeCarousel() {
  return (
    <Center>
        <Carousel
          withIndicators
          height={380}
          slideSize="50%"
          slideGap="md"
          loop
          align="center"
          slidesToScroll={2}
        >
          <Carousel.Slide><Image src={require('@site/static/img/builder_preview.png').default} /></Carousel.Slide>
          <Carousel.Slide><Image src={require('@site/static/img/planning_preview.png').default} /></Carousel.Slide>
          <Carousel.Slide><Image src={require('@site/static/img/schedule_preview.png').default} /></Carousel.Slide>
          <Carousel.Slide><Image src={require('@site/static/img/courts_preview.png').default} /></Carousel.Slide>
          <Carousel.Slide><Image src={require('@site/static/img/standings_preview.png').default} /></Carousel.Slide>
        </Carousel>
    </Center>
  );
}
