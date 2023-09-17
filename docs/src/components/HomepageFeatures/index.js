import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Open-source and free',
    Svg: require('@site/static/img/availability-svgrepo-com.svg').default,
    description: (
      <>
        Bracket is fully open source and free to use, licensed under the MIT license.
      </>
    ),
  },
  {
    title: 'Flexible',
    Svg: require('@site/static/img/system-settings-svgrepo-com.svg').default,
    description: (
      <>
        Bracket supports the standard tournament types, teams can be added/changed
        during the tournament and new matches can be scheduled dynamically.
      </>
    ),
  },
  {
    title: 'Easy to use',
    Svg: require('@site/static/img/interface-control-svgrepo-com.svg').default,
    description: (
      <>
        The UI is meant to be easy to use while providing maximum flexibility.
      </>
    ),
  },
  {
    title: 'Selfhosted',
    Svg: require('@site/static/img/host-record-svgrepo-com.svg').default,
    description: (
      <>
        You are free to host it yourself. Setup is easy; either run it in Docker or run it the
        natively on the host. The only external dependency is a PostgreSQL database.
      </>
    ),
  },
  {
    title: 'Modern codebase',
    Svg: require('@site/static/img/multiple-defenses-svgrepo-com.svg').default,
    description: (
      <>
        Bracket has a frontend build with Next.js and Mantine. The backend is written in async
        Python using FastAPI.
      </>
    ),
  }
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row" style={{justifyContent: "center"}}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
