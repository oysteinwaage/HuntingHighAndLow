import { Center, Group, Loader, Stack, Text, Title } from '@mantine/core'
import { PrepChecklist } from '../components/PrepChecklist'
import { YearSelector } from '../components/YearSelector'
import { useAuth } from '../contexts/AuthContext'
import { useDefaultHuntYear } from '../hooks/useDefaultHuntYear'

export function ForberedelserPage() {
  const { user } = useAuth()
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
          <Title order={2}>Forberedelser</Title>
          <Text c="dimmed">Din personlige liste. Oppgaver du oppretter kan tildeles og deles med andre.</Text>
        </div>
        <YearSelector year={year} onChange={onChange} />
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
