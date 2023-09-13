import { Tabs, TabsProps, rem } from '@mantine/core';
import { BiCircle } from '@react-icons/all-files/bi/BiCircle';
import { MdPlayCircleFilled } from '@react-icons/all-files/md/MdPlayCircleFilled';

import { StageWithRounds } from '../../interfaces/stage';
import { responseIsValid } from './util';

function StyledTabs(props: TabsProps & { setSelectedStageId: any }) {
  return (
    <Tabs
      unstyled
      onTabChange={(value) => props.setSelectedStageId(value)}
      mb="1rem"
      styles={(theme) => ({
        tab: {
          ...theme.fn.focusStyles(),
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
          color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[9],
          border: `${rem(1)} solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[4]
          }`,
          padding: `${theme.spacing.xs} ${theme.spacing.md}`,
          cursor: 'pointer',
          fontSize: theme.fontSizes.sm,
          display: 'flex',
          alignItems: 'center',

          '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
          },

          '&:not(:first-of-type)': {
            borderLeft: 0,
          },

          '&:first-of-type': {
            borderTopLeftRadius: theme.radius.md,
            borderBottomLeftRadius: theme.radius.md,
          },

          '&:last-of-type': {
            borderTopRightRadius: theme.radius.md,
            borderBottomRightRadius: theme.radius.md,
          },

          '&[data-active]': {
            backgroundColor: theme.colors.blue[7],
            borderColor: theme.colors.blue[7],
            color: theme.white,
          },
        },

        tabIcon: {
          marginRight: theme.spacing.xs,
          display: 'flex',
          alignItems: 'center',
        },

        tabsList: {
          display: 'flex',
        },
      })}
      {...props}
    />
  );
}

export default function StagesTab({ swrStagesResponse, selectedStageId, setSelectedStageId }: any) {
  if (!responseIsValid(swrStagesResponse)) {
    return <></>;
  }
  const items = swrStagesResponse.data.data.map((item: StageWithRounds) => (
    <Tabs.Tab
      value={item.id.toString()}
      key={item.id.toString()}
      icon={item.is_active ? <MdPlayCircleFilled size="1rem" /> : <BiCircle size="1rem" />}
    >
      {item.type_name}
    </Tabs.Tab>
  ));
  return (
    <>
      <StyledTabs value={selectedStageId} setSelectedStageId={setSelectedStageId}>
        <Tabs.List>{items}</Tabs.List>
      </StyledTabs>
    </>
  );
}
