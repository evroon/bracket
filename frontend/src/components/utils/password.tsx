import { Box, Center, Group, PasswordInput, Progress, Text } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
  return (
    <Text c={meets ? 'teal' : 'red'} mt={5} size="sm">
      <Center inline>
        {meets ? <IconCheck size={14} stroke={1.5} /> : <IconX size={14} stroke={1.5} />}
        <Box ml={7}>{label}</Box>
      </Center>
    </Text>
  );
}

const requirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password: string) {
  let multiplier = password.length > 5 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

export function PasswordStrength({ form }: { form: any }) {
  const strength = getStrength(form.values.password);
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(form.values.password)}
    />
  ));
  const bars = Array(4)
    .fill(0)
    .map((_, index) => (
      <Progress
        value={
          form.values.password.length > 0 && index === 0
            ? 100
            : strength >= ((index + 1) / 4) * 100
            ? 100
            : 0
        }
        c={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'}
        key={index}
        size={4}
      />
    ));

  return (
    <div style={{ marginBottom: '1.0rem' }}>
      <PasswordInput
        value={form.values.password}
        placeholder="Your password"
        label="Password"
        mt="1.0rem"
        {...form.getInputProps('password')}
      />

      <Group gap={5} grow mt="xs" mb="md">
        {bars}
      </Group>

      <PasswordRequirement
        label="Has at least 8 characters"
        meets={form.values.password.length >= 8}
      />
      {checks}
    </div>
  );
}
