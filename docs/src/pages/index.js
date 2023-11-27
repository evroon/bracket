import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import {Container, createTheme, MantineProvider, Title} from "@mantine/core";
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import {HeroTitle} from "../components/HeroTitle";
import {HomeCarousel} from "../components/HomeCarousel";
import classes from "./index.module.css";
import FeaturesCards from "../components/feature_cards";


const theme = createTheme({});


export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
        <Layout
          title={''}
          description="Description will go into a meta tag in <head />">
            <HeroTitle/>
          <main>
              <Title order={2} className={classes.title} ta="center" mt="lg">
                Features
              </Title>
              <FeaturesCards/>
              <Container size='50%' mt="lg">
                  <Title order={2} className={classes.title} ta="center" my="lg">
                      Preview
                  </Title>
                  <HomeCarousel/>
              </Container>
          </main>
        </Layout>
    </MantineProvider>
  );
}
