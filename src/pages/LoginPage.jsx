import { Navigate } from 'react-router-dom'
import { Button, Center, Paper, Stack, Text, Title } from '@mantine/core'
import { IconBrandGoogle } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth()

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  async function handleSignIn() {
    try {
      await signInWithGoogle()
    } catch {
      notifications.show({
        color: 'red',
        title: 'Innlogging feilet',
        message: 'Prøv igjen om litt.',
      })
    }
  }

  return (
    <Center h="100svh" p="md">
      <Paper withBorder shadow="md" radius="lg" p="xl" w={380} maw="100%">
        <Stack align="center" gap="md">
          <Text size="48px">🐦</Text>
          <Title order={2} ta="center">
            Hunting High &amp; Low
          </Title>
          <Text c="dimmed" ta="center" size="sm">
            Erfaringer, handleliste, pakkeliste og forberedelser til jakta – samlet på ett sted.
          </Text>
          <Button
            fullWidth
            size="md"
            color="forest"
            leftSection={<IconBrandGoogle size={18} />}
            onClick={handleSignIn}
          >
            Logg inn med Google
          </Button>
        </Stack>
      </Paper>
    </Center>
  )
}
