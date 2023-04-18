import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Self-hosted',
    description: (
      <>
        Bracket is fully open source and you are free to host it yourself.
      </>
    ),
  },
  {
    title: 'Flexible',
    description: (
      <>
        Bracket supports multiple tournament types (ladder and swiss), teams can be added/changed
          during the tournament and new matches can be scheduled while the last round has not yet
          finished.
      </>
    ),
  },
  {
    title: 'Easy to use',
    description: (
      <>
        The UI is meant to be easy to use while providing maximum flexibility.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
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
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
