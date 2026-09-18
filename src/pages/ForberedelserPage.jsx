import { useState } from 'react'
import { Group, Stack, Text, Title } from '@mantine/core'
import { Checklist } from '../components/Checklist'
import { YearSelector } from '../components/YearSelector'
import { clampHuntingYear, getCurrentHuntingYear } from '../utils/year'

export function ForberedelserPage() {
  const [year, setYear] = useState(clampHuntingYear(getCurrentHuntingYear()))

  return (
    <Stack gap="lg" mt="md">
      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>Forberedelser</Title>
          <Text c="dimmed">Det som må huskes å gjøres i tide før jakta.</Text>
        </div>
        <YearSelector year={year} onChange={setYear} />
      </Group>

      <Checklist basePath={`prepLists/${year}`} templatePath="prepTemplate" itemLabel="oppgave" />
    </Stack>
  )
}
