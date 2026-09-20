import { Center, Group, Loader, Stack, Text, Title } from '@mantine/core'
import { Checklist } from '../components/Checklist'
import { YearSelector } from '../components/YearSelector'
import { useDefaultHuntYear } from '../hooks/useDefaultHuntYear'
import { DEFAULT_SHOPPING_ITEMS } from '../data/defaultShoppingItems'

export function HandlelistePage() {
  const { year, onChange, ready } = useDefaultHuntYear()

  if (!ready) {
    return (
      <Center h={200}>
        <Loader color="forest" />
      </Center>
    )
  }

  return (
    <Stack gap="lg" mt="md">
      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>Handleliste</Title>
          <Text c="dimmed">Felles handleliste for jakta.</Text>
        </div>
        <YearSelector year={year} onChange={onChange} />
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
