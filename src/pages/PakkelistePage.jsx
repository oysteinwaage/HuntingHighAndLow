import { Stack, Text, Title } from '@mantine/core'
import { Checklist } from '../components/Checklist'
import { useAuth } from '../contexts/AuthContext'

export function PakkelistePage() {
  const { user } = useAuth()

  return (
    <Stack gap="lg" mt="md">
      <div>
        <Title order={2}>Pakkeliste</Title>
        <Text c="dimmed">Din personlige pakkeliste – kun synlig for deg.</Text>
      </div>

      <Checklist basePath={`packingLists/${user.uid}`} templatePath="packingTemplate" itemLabel="ting" />
    </Stack>
  )
}
