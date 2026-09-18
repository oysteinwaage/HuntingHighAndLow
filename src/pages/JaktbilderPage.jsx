import { useMemo, useState } from 'react'
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

function UploadModal({ opened, onClose, yearOptions, canUploadYear, onUpload }) {
  const [year, setYear] = useState(String(yearOptions[0]))
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const allowed = canUploadYear(Number(year))

  function handleClose() {
    if (uploading) return
    setFile(null)
    setError(null)
    onClose()
  }

  async function handleSubmit() {
    if (!file || !allowed) return
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
        <NativeSelect
          label="År"
          value={year}
          onChange={(event) => setYear(event.currentTarget.value)}
          data={yearOptions.map(String)}
        />
        {!allowed && (
          <Text c="red" size="sm">
            Bildet for {year} er lastet opp av en annen bruker. Bare den brukeren eller admin kan
            erstatte det.
          </Text>
        )}
        <FileInput
          label="Bilde"
          placeholder="Velg bilde"
          accept="image/*"
          value={file}
          onChange={setFile}
          disabled={!allowed}
        />
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
            disabled={!file || !allowed}
          >
            Last opp
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export function JaktbilderPage() {
  const { user, isAdmin } = useAuth()
  const { photosByYear, loading, error, uploadPhoto, deletePhoto } = useTeamPhotos()
  const yearOptions = useMemo(() => getTeamPhotoYearOptions(), [])

  const [modalOpen, setModalOpen] = useState(false)
  const [deletingYear, setDeletingYear] = useState(null)

  const years = Object.keys(photosByYear)
    .map(Number)
    .sort((a, b) => b - a)

  function canUploadYear(year) {
    const photo = photosByYear[year]
    return !photo || photo.uploadedByUid === user?.uid || isAdmin
  }

  async function handleDelete(year) {
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
        <Button leftSection={<IconUpload size={16} />} color="forest" onClick={() => setModalOpen(true)}>
          Last opp bilde
        </Button>
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
              const canManage = photo.uploadedByUid === user?.uid || isAdmin
              return (
                <Paper key={year} withBorder radius="md" p="md">
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Title order={3}>{year}</Title>
                      {canManage && (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(year)}
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
        yearOptions={yearOptions}
        canUploadYear={canUploadYear}
        onUpload={uploadPhoto}
      />
    </Stack>
  )
}
