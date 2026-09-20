import { useState } from 'react'
import { ActionIcon, Avatar, Badge, Button, Group, Modal, Paper, Stack, Table, Text, Title } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
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
          <Table.ScrollContainer minWidth={640}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Bruker</Table.Th>
                  <Table.Th>Rolle</Table.Th>
                  <Table.Th>Opprettet</Table.Th>
                  <Table.Th>Siste innlogging</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((u) => (
                  <Table.Tr key={u.uid}>
                    <Table.Td>
                      <Group gap="sm" wrap="nowrap">
                        <Avatar src={u.photoURL} radius="xl" size="sm">
                          {u.displayName?.[0]}
                        </Avatar>
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>
                            {u.displayName || 'Ukjent navn'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {u.email || 'Ukjent e-post'}
                          </Text>
                        </Stack>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="wrap">
                        {(u.roles || []).map((role) => (
                          <Badge key={role} color={role === 'ADMIN' ? 'red' : 'forest'} variant="light" size="sm">
                            {role}
                          </Badge>
                        ))}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDate(u.createdAt)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDate(u.lastLogin)}</Text>
                    </Table.Td>
                    <Table.Td>
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
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
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
