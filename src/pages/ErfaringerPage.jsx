import { useState } from 'react'
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  NativeSelect,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { useExperiences } from '../hooks/useExperiences'
import { clampHuntingYear, getCurrentHuntingYear, getYearOptions } from '../utils/year'

function NewEntryForm({ onSubmit }) {
  const [text, setText] = useState('')
  const [type, setType] = useState('bra')
  const [year, setYear] = useState(String(clampHuntingYear(getCurrentHuntingYear())))

  function handleSubmit(event) {
    event.preventDefault()
    if (!text.trim()) return
    onSubmit(Number(year), text, type)
    setText('')
  }

  return (
    <Paper withBorder radius="md" p="md" component="form" onSubmit={handleSubmit}>
      <Stack gap="sm">
        <Group justify="space-between" wrap="wrap">
          <SegmentedControl
            value={type}
            onChange={setType}
            color={type === 'bra' ? 'forest' : 'red'}
            data={[
              { label: 'Bra', value: 'bra' },
              { label: 'Dårlig', value: 'darlig' },
            ]}
          />
          <YearDropdown value={year} onChange={setYear} />
        </Group>
        <Textarea
          value={text}
          onChange={(event) => setText(event.currentTarget.value)}
          placeholder="Hva skjedde, og hva bør vi huske til neste år?"
          autosize
          minRows={2}
        />
        <Group justify="flex-end">
          <Button type="submit" color="forest" leftSection={<IconPlus size={16} />}>
            Legg til erfaring
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}

function YearDropdown({ value, onChange }) {
  const options = getYearOptions().map((y) => String(y))

  return (
    <Group gap={6} align="center">
      <Text size="sm" c="dimmed">
        For år:
      </Text>
      <NativeSelect
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        data={options}
        w={100}
        size="sm"
      />
    </Group>
  )
}

export function ErfaringerPage() {
  const { user, isAdmin } = useAuth()
  const { entriesByYear, loading, error, addEntry, removeEntry } = useExperiences()

  return (
    <Stack gap="lg" mt="md">
      <div>
        <Title order={2}>Erfaringer</Title>
        <Text c="dimmed">Hva funket bra og hva funket dårlig – til neste år.</Text>
      </div>

      <NewEntryForm onSubmit={addEntry} />

      {loading ? (
        <Text c="dimmed" size="sm">
          Laster...
        </Text>
      ) : error ? (
        <Text c="red" size="sm">
          Klarte ikke å laste erfaringene. Sjekk Firebase-oppsettet (se README).
        </Text>
      ) : entriesByYear.length === 0 ? (
        <Text c="dimmed" size="sm">
          Ingen erfaringer registrert enda.
        </Text>
      ) : (
        <Stack gap="xl">
          {entriesByYear.map(({ year, entries }) => (
            <Stack key={year} gap="sm">
              <Title order={3}>{year}</Title>
              <Stack gap="xs">
                {entries.map((entry) => (
                  <Paper key={entry.id} withBorder radius="md" p="sm">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Group gap="sm" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
                        <Badge
                          color={entry.type === 'bra' ? 'forest' : 'red'}
                          variant="light"
                          miw={84}
                          style={{ flexShrink: 0 }}
                        >
                          {entry.type === 'bra' ? 'Bra' : 'Dårlig'}
                        </Badge>
                        <Stack gap={2} style={{ minWidth: 0 }}>
                          <Text style={{ whiteSpace: 'pre-wrap' }}>{entry.text}</Text>
                          <Text size="xs" c="dimmed">
                            {entry.authorName ?? 'Ukjent'}
                          </Text>
                        </Stack>
                      </Group>
                      {(entry.authorUid === user?.uid || isAdmin) && (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          onClick={() => removeEntry(year, entry.id)}
                          aria-label="Slett"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
