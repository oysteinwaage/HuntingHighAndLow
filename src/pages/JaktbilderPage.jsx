import { useEffect, useMemo, useState } from 'react'
import {
  ActionIcon,
  Button,
  FileInput,
  Group,
  Image,
  Modal,
  NativeSelect,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconPhoto, IconTrash, IconUpload } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { useTeamPhotos } from '../hooks/useTeamPhotos'
import { MIN_TEAM_PHOTO_YEAR, getTeamPhotoYearOptions } from '../utils/teamPhotoYear'

function UploadModal({ opened, onClose, availableYears, onUpload }) {
  const [year, setYear] = useState(String(availableYears[0]))
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (opened) setYear(String(availableYears[0]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened])

  function handleClose() {
    if (uploading) return
    setFile(null)
    setError(null)
    onClose()
  }

  async function handleSubmit() {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      await onUpload(Number(year), file)
      setFile(null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke laste opp bildet.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Last opp jaktbilde">
      <Stack gap="sm">
        {availableYears.length === 0 ? (
          <Text c="dimmed" size="sm">
            Alle år har allerede et lagbilde. Slett et eksisterende bilde for å laste opp et nytt
            for det året.
          </Text>
        ) : (
          <>
            <NativeSelect
              label="År"
              value={year}
              onChange={(event) => setYear(event.currentTarget.value)}
              data={availableYears.map(String)}
            />
            <FileInput label="Bilde" placeholder="Velg bilde" accept="image/*" value={file} onChange={setFile} />
          </>
        )}
        {error && (
          <Text c="red" size="sm">
            {error}
          </Text>
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose} disabled={uploading}>
            Avbryt
          </Button>
          <Button
            color="forest"
            onClick={handleSubmit}
            loading={uploading}
            disabled={!file || availableYears.length === 0}
          >
            Last opp
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export function JaktbilderPage() {
  const { isAdmin } = useAuth()
  const { photosByYear, loading, error, uploadPhoto, deletePhoto } = useTeamPhotos()
  const yearOptions = useMemo(() => getTeamPhotoYearOptions(), [])

  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDeleteYear, setConfirmDeleteYear] = useState(null)
  const [deletingYear, setDeletingYear] = useState(null)

  const years = Object.keys(photosByYear)
    .map(Number)
    .sort((a, b) => b - a)

  const availableYears = yearOptions.filter((y) => !photosByYear[y])

  async function handleConfirmDelete() {
    const year = confirmDeleteYear
    setConfirmDeleteYear(null)
    setDeletingYear(year)
    try {
      await deletePhoto(year)
    } finally {
      setDeletingYear(null)
    }
  }

  return (
    <Stack gap="lg" mt="md">
      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>Jaktbilder</Title>
          <Text c="dimmed">Lagbilde for hvert år, fra {MIN_TEAM_PHOTO_YEAR} og frem til i dag.</Text>
        </div>
        {isAdmin && (
          <Button leftSection={<IconUpload size={16} />} color="forest" onClick={() => setModalOpen(true)}>
            Last opp bilde
          </Button>
        )}
      </Group>

      {loading ? (
        <Text c="dimmed" size="sm">
          Laster...
        </Text>
      ) : error ? (
        <Text c="red" size="sm">
          Klarte ikke å laste jaktbildene. Sjekk Firebase-oppsettet (se README).
        </Text>
      ) : years.length === 0 ? (
        <Stack align="center" gap={4} py="xl">
          <IconPhoto size={40} stroke={1.5} color="var(--mantine-color-gray-5)" />
          <Text c="dimmed" size="sm">
            Ingen jaktbilder lastet opp enda.
          </Text>
        </Stack>
      ) : (
        <ScrollArea.Autosize mah="70vh" type="auto">
          <Stack gap="lg" pr="sm">
            {years.map((year) => {
              const photo = photosByYear[year]
              return (
                <Paper key={year} withBorder radius="md" p="md">
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Title order={3}>{year}</Title>
                      {isAdmin && (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => setConfirmDeleteYear(year)}
                          loading={deletingYear === year}
                          aria-label={`Slett bilde for ${year}`}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      )}
                    </Group>
                    <Image src={photo.photoUrl} radius="md" mah={480} fit="contain" alt={`Lagbilde ${year}`} />
                    <Text size="xs" c="dimmed">
                      Lastet opp av {photo.uploadedByName ?? 'Ukjent'}
                    </Text>
                  </Stack>
                </Paper>
              )
            })}
          </Stack>
        </ScrollArea.Autosize>
      )}

      <UploadModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        availableYears={availableYears}
        onUpload={uploadPhoto}
      />

      <Modal
        opened={confirmDeleteYear !== null}
        onClose={() => setConfirmDeleteYear(null)}
        title="Slette jaktbilde?"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">Er du sikker på at du vil slette lagbildet for {confirmDeleteYear}?</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirmDeleteYear(null)}>
              Avbryt
            </Button>
            <Button color="red" onClick={handleConfirmDelete}>
              Slett
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
