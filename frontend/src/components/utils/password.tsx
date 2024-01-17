import { Group, PasswordInput, Progress, Stack, Text } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
  return (
    <Text c={meets ? 'teal' : 'red'} pt="0rem" size="sm">
      {meets ? <IconCheck size={12} stroke={1.5} /> : <IconX size={12} stroke={1.5} />} {label}
    </Text>
  );
}

export function PasswordStrength({ form }: { form: any }) {
  const { t } = useTranslation();

  const requirements = [
    { re: /[0-9]/, label: t('number_required') },
    { re: /[a-z]/, label: t('lowercase_required') },
    { re: /[A-Z]/, label: t('uppercase_required') },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: t('special_character_required') },
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
        placeholder={t('password_input_placeholder')}
        label={t('password_input_label')}
        mt="1.0rem"
        {...form.getInputProps('password')}
      />

      <Group gap={5} grow mt="xs" mb="md">
        {bars}
      </Group>

      <Stack gap="xs">
        <PasswordRequirement
          label={t('8_characters_required')}
          meets={form.values.password.length >= 8}
        />
        {checks}
      </Stack>
    </div>
  );
}
