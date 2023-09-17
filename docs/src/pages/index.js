import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
          <div className={styles.heroRow}>
              <div className={clsx(styles.heroColumn, styles.heroColumn4)}>
                  <h1 className="hero__title">{siteConfig.title}</h1>
                  <p className="hero__subtitle">{siteConfig.tagline}</p>
                  <div className={styles.buttons}>
                      <Link
                          className="button button--secondary button--lg"
                          to="/docs/intro">
                          Get Started
                      </Link>
                  </div>
              </div>
              <div className={clsx(styles.heroColumn, styles.heroColumn6)}>
                  <div className="text--center">
                      <img alt="Preview of the web interface"
                           src={require('@site/static/img/schedule_preview.png').default}
                           width="100%"/>
                  </div>
              </div>
          </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={''}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
