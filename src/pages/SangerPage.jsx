import { useState } from 'react'
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconMusic, IconPlus, IconTrash } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { useSongs } from '../hooks/useSongs'
import { getSunoSongPageUrl } from '../utils/songUrl'

function AddSongModal({ opened, onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function handleClose() {
    if (saving) return
    setTitle('')
    setUrl('')
    setError(null)
    onClose()
  }

  async function handleSubmit() {
    if (!title.trim() || !url.trim()) return
    setSaving(true)
    setError(null)
    try {
      await onAdd(title, url)
      setTitle('')
      setUrl('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke legge til sang.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Legg til sang">
      <Stack gap="sm">
        <TextInput
          label="Tittel"
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          disabled={saving}
        />
        <TextInput
          label="Lenke fra suno.com"
          placeholder="https://suno.com/song/..."
          value={url}
          onChange={(event) => setUrl(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSubmit()
          }}
          disabled={saving}
        />
        {error && (
          <Text c="red" size="sm">
            {error}
          </Text>
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose} disabled={saving}>
            Avbryt
          </Button>
          <Button
            color="forest"
            leftSection={<IconPlus size={16} />}
            onClick={handleSubmit}
            loading={saving}
            disabled={!title.trim() || !url.trim()}
          >
            Legg til
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export function SangerPage() {
  const { isAdmin } = useAuth()
  const { songs, loading, error, addSong, removeSong } = useSongs()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDeleteSong, setConfirmDeleteSong] = useState(null)

  return (
    <Stack gap="lg" mt="md">
      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>Sanger</Title>
          <Text c="dimmed">Jaktlagets sanger fra Suno 🎶</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} color="forest" onClick={() => setModalOpen(true)}>
          Legg til sang
        </Button>
      </Group>

      {loading ? (
        <Text c="dimmed" size="sm">
          Laster...
        </Text>
      ) : error ? (
        <Text c="red" size="sm">
          Klarte ikke å laste sangene. Sjekk Firebase-oppsettet (se README).
        </Text>
      ) : songs.length === 0 ? (
        <Stack align="center" gap={4} py="xl">
          <IconMusic size={40} stroke={1.5} color="var(--mantine-color-gray-5)" />
          <Text c="dimmed" size="sm">
            Ingen sanger lagt til enda.
          </Text>
        </Stack>
      ) : (
        <Stack gap="xs">
          {songs.map((song) => {
            const songPageUrl = getSunoSongPageUrl(song.url)
            return (
              <Paper
                key={song.id}
                withBorder
                radius="md"
                p="sm"
                component="a"
                href={songPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Group gap="sm" align="center" wrap="nowrap" style={{ minWidth: 0 }}>
                    <IconMusic size={20} stroke={1.75} color="var(--mantine-color-forest-6)" />
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text fw={500} truncate>
                        {song.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {song.addedByName ?? 'Ukjent'}
                      </Text>
                    </Stack>
                  </Group>
                  {isAdmin && (
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      style={{ flexShrink: 0 }}
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setConfirmDeleteSong(song)
                      }}
                      aria-label="Slett sang"
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  )}
                </Group>
              </Paper>
            )
          })}
        </Stack>
      )}

      <AddSongModal opened={modalOpen} onClose={() => setModalOpen(false)} onAdd={addSong} />

      <Modal
        opened={confirmDeleteSong !== null}
        onClose={() => setConfirmDeleteSong(null)}
        title="Slette sang?"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">Er du sikker på at du vil slette «{confirmDeleteSong?.title}»?</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirmDeleteSong(null)}>
              Avbryt
            </Button>
            <Button
              color="red"
              onClick={() => {
                removeSong(confirmDeleteSong.id)
                setConfirmDeleteSong(null)
              }}
            >
              Slett
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
