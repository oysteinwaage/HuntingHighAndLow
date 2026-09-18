import { Group, ActionIcon, Text } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

export function YearSelector({ year, onChange }) {
  return (
    <Group gap="xs" align="center">
      <ActionIcon variant="light" color="forest" onClick={() => onChange(year - 1)} aria-label="Forrige år">
        <IconChevronLeft size={18} />
      </ActionIcon>
      <Text fw={700} size="lg" miw={64} ta="center">
        {year}
      </Text>
      <ActionIcon variant="light" color="forest" onClick={() => onChange(year + 1)} aria-label="Neste år">
        <IconChevronRight size={18} />
      </ActionIcon>
    </Group>
  )
}
