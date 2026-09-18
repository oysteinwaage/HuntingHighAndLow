import { useState } from 'react'
import { Group, Stack, Text, Title } from '@mantine/core'
import { Checklist } from '../components/Checklist'
import { YearSelector } from '../components/YearSelector'
import { clampHuntingYear, getCurrentHuntingYear } from '../utils/year'
import { DEFAULT_SHOPPING_ITEMS } from '../data/defaultShoppingItems'

export function HandlelistePage() {
  const [year, setYear] = useState(clampHuntingYear(getCurrentHuntingYear()))

  return (
    <Stack gap="lg" mt="md">
      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>Handleliste</Title>
          <Text c="dimmed">Felles handleliste for jakta.</Text>
        </div>
        <YearSelector year={year} onChange={setYear} />
      </Group>

      <Checklist
        basePath={`shoppingLists/${year}`}
        templatePath="shoppingTemplate"
        itemLabel="vare"
        defaultTemplateItems={DEFAULT_SHOPPING_ITEMS}
      />
    </Stack>
  )
}
