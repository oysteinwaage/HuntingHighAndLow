import { useState } from 'react'
import { Group, Stack, Text, Title } from '@mantine/core'
import { PrepChecklist } from '../components/PrepChecklist'
import { YearSelector } from '../components/YearSelector'
import { useAuth } from '../contexts/AuthContext'
import { clampHuntingYear, getCurrentHuntingYear } from '../utils/year'

export function ForberedelserPage() {
  const { user } = useAuth()
  const [year, setYear] = useState(clampHuntingYear(getCurrentHuntingYear()))

  return (
    <Stack gap="lg" mt="md">
      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>Forberedelser</Title>
          <Text c="dimmed">Din personlige liste – kun synlig for deg.</Text>
        </div>
        <YearSelector year={year} onChange={setYear} />
      </Group>

      <PrepChecklist
        basePath={`prepLists/${user.uid}/${year}`}
        templatePath="prepTemplate"
        itemLabel="oppgave"
        year={year}
        listLabel="Din personlige liste"
      />
    </Stack>
  )
}
