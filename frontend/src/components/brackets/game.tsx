import { Grid, createStyles } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  root: {
    maxWidth: 250,
    width: '100%',
    marginTop: '20px',
  },
  divider: {
    backgroundColor: 'darkgray',
    height: '1px',
  },
  top: {
    // subscribe to color scheme changes right in your styles
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2],
    paddingLeft: '15px',
    paddingTop: '6px',
    paddingBottom: '6px',
    borderRadius: '8px 8px 0px 0px',
  },
  bottom: {
    // subscribe to color scheme changes right in your styles
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2],
    paddingLeft: '15px',
    paddingTop: '6px',
    paddingBottom: '6px',
    borderRadius: '0px 0px 8px 8px',
  },
}));
export default function Game() {
  const { classes } = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.top}>
        <Grid grow>
          <Grid.Col span={10}>Team 1</Grid.Col>
          <Grid.Col span={2}>3</Grid.Col>
        </Grid>
      </div>
      <div className={classes.divider} />
      <div className={classes.bottom}>
        <Grid grow>
          <Grid.Col span={10}>Team 2</Grid.Col>
          <Grid.Col span={2}>1</Grid.Col>
        </Grid>
      </div>
    </div>
  );
}
