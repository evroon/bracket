import { Tabs } from '@mantine/core';
import { BiCircle } from '@react-icons/all-files/bi/BiCircle';
import { MdPlayCircleFilled } from '@react-icons/all-files/md/MdPlayCircleFilled';

import { StageWithStageItems } from '../../interfaces/stage';
import { responseIsValid } from './util';

export default function StagesTab({ swrStagesResponse, selectedStageId, setSelectedStageId }: any) {
  if (!responseIsValid(swrStagesResponse)) {
    return <></>;
  }
  const items = swrStagesResponse.data.data.map((item: StageWithStageItems) => (
    <Tabs.Tab
      value={item.id.toString()}
      key={item.id.toString()}
      leftSection={item.is_active ? <MdPlayCircleFilled size="1rem" /> : <BiCircle size="1rem" />}
    >
      {item.name}
    </Tabs.Tab>
  ));
  return (
    <Tabs
      variant="pills"
      onChange={(value) => setSelectedStageId(value)}
      mb="1rem"
      value={selectedStageId}
    >
      <Tabs.List>{items}</Tabs.List>
    </Tabs>
  );
}
