import React from 'react';
import { IconAlertCircle } from '@tabler/icons';
import { Group, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import { AiOutlineTeam } from '@react-icons/all-files/ai/AiOutlineTeam';
import { BsFillPersonFill } from '@react-icons/all-files/bs/BsFillPersonFill';

interface MainLinkProps {
  icon: React.ReactNode;
  color: string;
  label: string;
}

function MainLink({ icon, color, label }: MainLinkProps) {
  return (
    <UnstyledButton
      sx={(theme) => ({
        display: 'block',
        width: '100%',
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

        '&:hover': {
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        },
      })}
    >
      <Group>
        <ThemeIcon color={color} variant="light">
          {icon}
        </ThemeIcon>

        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
}

const data = [
  { icon: <IconAlertCircle size={16} />, color: 'teal', label: 'Tournaments' },
  { icon: <BsFillPersonFill size={16} />, color: 'violet', label: 'Players' },
  { icon: <AiOutlineTeam size={16} />, color: 'grape', label: 'Teams' },
];

export function MainLinks() {
  const links = data.map((link) => <MainLink {...link} key={link.label} />);
  return <div>{links}</div>;
}
