import { useState } from 'react'
import { ActionIcon, Avatar, Badge, Button, Divider, Group, Modal, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { IconCrosshair, IconTrash } from '@tabler/icons-react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAdminUsers } from '../hooks/useAdminUsers'

function formatDate(timestamp) {
  if (!timestamp) return 'Ukjent'
  return new Date(timestamp).toLocaleString('no-NO')
}

function UsersModule() {
  const { user: currentUser } = useAuth()
  const { users, loading, deleteUser } = useAdminUsers()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteUser(deleteTarget)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="sm">
        <Title order={3}>Brukere ({users.length})</Title>

        {loading ? (
          <Text c="dimmed" size="sm">
            Laster...
          </Text>
        ) : users.length === 0 ? (
          <Text c="dimmed" size="sm">
            Ingen brukere registrert enda.
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {users.map((u) => (
              <Paper key={u.uid} withBorder radius="md" p="sm">
                <Stack gap="xs">
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                      <Avatar src={u.photoURL} radius="xl">
                        {u.displayName?.[0]}
                      </Avatar>
                      <div style={{ minWidth: 0 }}>
                        <Text size="sm" fw={600} truncate>
                          {u.displayName || 'Ukjent navn'}
                        </Text>
                        <Text size="xs" c="dimmed" truncate>
                          {u.email || 'Ukjent e-post'}
                        </Text>
                      </div>
                    </Group>
                    {u.uid !== currentUser.uid && (
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => setDeleteTarget(u)}
                        aria-label="Slett bruker"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Group>

                  {(u.roles || []).length > 0 && (
                    <Group gap={4} wrap="wrap">
                      {u.roles.map((role) => (
                        <Badge key={role} color={role === 'ADMIN' ? 'red' : 'forest'} variant="light" size="sm">
                          {role}
                        </Badge>
                      ))}
                    </Group>
                  )}

                  <Divider />

                  <Group justify="space-between" wrap="nowrap">
                    <Text size="xs" c="dimmed">
                      Skutte ryper
                    </Text>
                    <Group gap={4} wrap="nowrap">
                      <IconCrosshair size={14} color="var(--mantine-color-forest-7)" />
                      <Text size="sm" fw={500}>
                        {u.rypeCount || 0}
                      </Text>
                    </Group>
                  </Group>
                  <Group justify="space-between" wrap="nowrap">
                    <Text size="xs" c="dimmed">
                      Siste innlogging
                    </Text>
                    <Text size="sm">{formatDate(u.lastLogin)}</Text>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        )}
      </Stack>

      <Modal
        opened={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        title={`Slette ${deleteTarget?.displayName || 'brukeren'}?`}
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Dette fjerner brukerens profil, personlige lister (forberedelser og pakkeliste) og fjerner
            brukeren som tildelt på oppgaver andre har delt med dem. Handlingen kan ikke angres.
          </Text>
          <Text size="xs" c="dimmed">
            Merk: dette sletter kun data i appen. Selve Google-innloggingen fjernes ikke, så brukeren kan
            logge inn igjen senere og få en ny, tom profil.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Avbryt
            </Button>
            <Button color="red" onClick={handleConfirmDelete} loading={deleting}>
              Slett brukeren
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  )
}

export function AdminPage() {
  const { isAdmin } = useAuth()

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <Stack gap="lg" mt="md">
      <div>
        <Title order={2}>Admin</Title>
        <Text c="dimmed">Administrasjon av appen.</Text>
      </div>

      <UsersModule />
    </Stack>
  )
}
