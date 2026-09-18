import { useState } from 'react'
import { Group, Stack, Text, Title } from '@mantine/core'
import { Checklist } from '../components/Checklist'
import { YearSelector } from '../components/YearSelector'
import { useAuth } from '../contexts/AuthContext'
import { clampHuntingYear, getCurrentHuntingYear } from '../utils/year'

export function PakkelistePage() {
  const { user } = useAuth()
  const [year, setYear] = useState(clampHuntingYear(getCurrentHuntingYear()))

  return (
    <Stack gap="lg" mt="md">
      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>Pakkeliste</Title>
          <Text c="dimmed">Din personlige pakkeliste – kun synlig for deg.</Text>
        </div>
        <YearSelector year={year} onChange={setYear} />
      </Group>

      <Checklist
        basePath={`packingLists/${user.uid}/${year}`}
        templatePath="packingTemplate"
        itemLabel="ting"
        listLabel="Din personlige liste"
      />
    </Stack>
  )
}
