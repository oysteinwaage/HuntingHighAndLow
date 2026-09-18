import { Navigate } from 'react-router-dom'
import { ActionIcon, Badge, Checkbox, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { FEEDBACK_TYPE_LABELS, FEEDBACK_TYPES, useFeedbackList } from '../hooks/useFeedback'

export function TilbakemeldingerPage() {
  const { isAdmin } = useAuth()
  const { feedbackList, loading, markRead, removeFeedback } = useFeedbackList(isAdmin)

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <Stack gap="lg" mt="md">
      <div>
        <Title order={2}>Tilbakemeldinger</Title>
        <Text c="dimmed">Feil, forslag og annet som er sendt inn fra appen.</Text>
      </div>

      {loading ? (
        <Text c="dimmed" size="sm">
          Laster...
        </Text>
      ) : feedbackList.length === 0 ? (
        <Text c="dimmed" size="sm">
          Ingen tilbakemeldinger enda.
        </Text>
      ) : (
        <Stack gap="xs">
          {feedbackList.map((entry) => (
            <Paper key={entry.id} withBorder radius="md" p="sm">
              <Stack gap={6}>
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Badge
                    color={entry.type === FEEDBACK_TYPES.FEIL ? 'red' : 'forest'}
                    variant="light"
                    style={{ flexShrink: 0 }}
                  >
                    {FEEDBACK_TYPE_LABELS[entry.type] ?? entry.type}
                  </Badge>
                  <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
                    <Checkbox
                      label="Lest"
                      checked={Boolean(entry.read)}
                      onChange={() => markRead(entry.id, !entry.read)}
                    />
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => removeFeedback(entry.id)}
                      aria-label="Slett"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
                <Text style={{ whiteSpace: 'pre-wrap' }}>{entry.message}</Text>
                <Text size="xs" c="dimmed">
                  {entry.userName ?? 'Ukjent bruker'} ·{' '}
                  {entry.createdAt ? new Date(entry.createdAt).toLocaleString('no-NO') : ''}
                  {!entry.read && ' · Ny'}
                </Text>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
