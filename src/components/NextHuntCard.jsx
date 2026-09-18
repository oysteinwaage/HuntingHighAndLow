import { useState } from 'react'
import { ActionIcon, Button, Group, Modal, Paper, Stack, Text } from '@mantine/core'
import { IconCalendarEvent, IconPencil } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { useNextHunt } from '../hooks/useNextHunt'
import { formatDateRange, toDateString } from '../utils/huntDates'

function DateField({ label, value, onChange }) {
  return (
    <Stack gap={4}>
      <Text size="sm" fw={500}>
        {label}
      </Text>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid #ced4da',
          fontSize: 14,
          fontFamily: 'inherit',
        }}
      />
    </Stack>
  )
}

function EditHuntModal({ opened, onClose, hunt, setDates, resetDates }) {
  const [start, setStart] = useState(() => toDateString(hunt.start))
  const [end, setEnd] = useState(() => toDateString(hunt.end))
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await setDates(hunt.year, new Date(start), new Date(end))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setSaving(true)
    try {
      await resetDates(hunt.year)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title={`Rediger jakttur ${hunt.year}`} centered size="sm">
      <Stack gap="md">
        <DateField label="Fra og med" value={start} onChange={setStart} />
        <DateField label="Til og med" value={end} onChange={setEnd} />
        <Group justify="space-between">
          <Button variant="subtle" color="red" onClick={handleReset} loading={saving}>
            Tilbakestill til standard
          </Button>
          <Group gap="xs">
            <Button variant="default" onClick={onClose}>
              Avbryt
            </Button>
            <Button color="forest" onClick={handleSave} loading={saving}>
              Lagre
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  )
}

export function NextHuntCard() {
  const { isAdmin } = useAuth()
  const { hunt, loading, setDates, resetDates } = useNextHunt()
  const [editOpen, setEditOpen] = useState(false)

  if (loading) return null

  return (
    <>
      <Paper withBorder radius="lg" p="sm" bg="forest.0">
        <Group gap="sm" wrap="nowrap">
          <IconCalendarEvent size={22} color="var(--mantine-color-forest-7)" />
          <Stack gap={0}>
            <Text size="xs" c="dimmed">
              Neste jakt
            </Text>
            <Text size="sm" fw={600}>
              {formatDateRange(hunt.start, hunt.end)}
            </Text>
          </Stack>
          {isAdmin && (
            <ActionIcon variant="subtle" color="forest" onClick={() => setEditOpen(true)} aria-label="Rediger jakttur">
              <IconPencil size={16} />
            </ActionIcon>
          )}
        </Group>
      </Paper>

      {isAdmin && (
        <EditHuntModal
          opened={editOpen}
          onClose={() => setEditOpen(false)}
          hunt={hunt}
          setDates={setDates}
          resetDates={resetDates}
        />
      )}
    </>
  )
}
