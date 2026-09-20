import { useState } from 'react'
import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
} from '@mantine/core'
import { IconCalendarEvent, IconDownload, IconPencil, IconPlus, IconTrash, IconUser } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { useChecklist } from '../hooks/useChecklist'
import { useItemList } from '../hooks/useItemList'
import { usePrepTaskActions } from '../hooks/usePrepTaskActions'
import { useUsers } from '../hooks/useUsers'

const MONTHS = [
  { value: '01', label: 'Januar' },
  { value: '02', label: 'Februar' },
  { value: '03', label: 'Mars' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
]

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function monthName(m) {
  return (MONTHS.find((month) => month.value === m)?.label ?? m).toLowerCase()
}

// dueDate is either "MM-DD" (template, no year) or "YYYY-MM-DD" (yearly list).
function formatDate(dateStr) {
  const parts = dateStr.split('-')
  if (parts.length === 2) {
    const [m, d] = parts
    return `${d}. ${monthName(m)}`
  }
  const [y, m, d] = parts
  return `${d}. ${monthName(m)} ${y}`
}

// Undone items first (soonest deadline first, undated last), then done items.
function sortPrepItems(items) {
  return [...items].sort((a, b) => {
    if (Boolean(a.checked) !== Boolean(b.checked)) return a.checked ? 1 : -1
    const aDate = a.dueDate || '9999-99-99'
    const bDate = b.dueDate || '9999-99-99'
    if (aDate !== bDate) return aDate < bDate ? -1 : 1
    return (a.createdAt || 0) - (b.createdAt || 0)
  })
}

// "YYYY-MM-DD" or "MM-DD" -> { day: number, month: "MM" } for pre-filling
// the edit form.
function parseDueDate(dueDate) {
  if (!dueDate) return { day: '', month: '' }
  const parts = dueDate.split('-')
  const [m, d] = parts.length === 2 ? parts : parts.slice(1)
  return { day: Number(d), month: m }
}

// `mode` is "template" (day/month only, no year) or "list" (day/month, but
// combined with `year` into a full date before it's saved). In "list" mode
// the item is always assigned to the current user too (handled by the
// caller), so an empty selection here just means "only me" rather than
// "everyone" the way it does for the shared template.
function AddPrepItemModal({ opened, onClose, onAdd, itemLabel, users, mode, year, initialValues, editing }) {
  const [text, setText] = useState(initialValues?.name ?? '')
  const [day, setDay] = useState(initialValues?.day ?? '')
  const [month, setMonth] = useState(initialValues?.month ?? '')
  const [assignedTo, setAssignedTo] = useState(initialValues?.assignedTo ?? [])

  function handleClose() {
    setText('')
    setDay('')
    setMonth('')
    setAssignedTo([])
    onClose()
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!text.trim() || !day || !month) return
    const dayMonth = `${month}-${String(day).padStart(2, '0')}`
    const dueDate = mode === 'template' ? dayMonth : `${year}-${dayMonth}`
    const selectedUsers = users.filter((u) => assignedTo.includes(u.uid))
    if (mode === 'template') {
      onAdd({
        name: text.trim(),
        dueDate,
        assignedTo: selectedUsers.length > 0 ? selectedUsers.map((u) => u.uid) : ['ALL'],
        assignedToName: selectedUsers.length > 0 ? selectedUsers.map((u) => u.displayName).join(', ') : 'Alle',
      })
    } else {
      onAdd({
        name: text.trim(),
        dueDate,
        assignedTo: selectedUsers.map((u) => u.uid),
        assignedToName: selectedUsers.length > 0 ? selectedUsers.map((u) => u.displayName).join(', ') : undefined,
      })
    }
    handleClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`${editing ? 'Rediger' : 'Legg til'} ${itemLabel}`}
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <Textarea
            label="Hva skal gjøres"
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
            autosize
            minRows={2}
            required
            data-autofocus
          />
          <Group grow align="flex-start">
            <NumberInput label="Dag" placeholder="Dag" min={1} max={31} value={day} onChange={setDay} required />
            <Select
              label="Måned"
              placeholder="Måned"
              data={MONTHS}
              value={month}
              onChange={(value) => setMonth(value ?? '')}
              required
            />
          </Group>
          <MultiSelect
            label="Tildel til"
            description={
              mode === 'template'
                ? 'La stå tom for å tildele til Alle'
                : 'Oppgaven tildeles automatisk deg selv. Velg andre for å dele den med dem også.'
            }
            placeholder="Velg en eller flere brukere"
            data={users.map((u) => ({ value: u.uid, label: u.displayName }))}
            value={assignedTo}
            onChange={setAssignedTo}
            clearable
            searchable
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={handleClose}>
              Avbryt
            </Button>
            <Button type="submit" color="forest">
              {editing ? 'Lagre' : 'Legg til'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

function PrepItemCard({
  item,
  currentUserUid,
  onToggle,
  onRemove,
  onEdit,
  canRemove,
  canEdit,
  showChecked = true,
  confirmRemove = false,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const overdue = showChecked && !item.checked && item.dueDate && item.dueDate < todayIso()
  const createdByOther = item.addedBy && currentUserUid && item.addedBy !== currentUserUid

  function handleRemoveClick() {
    if (confirmRemove) {
      setConfirmOpen(true)
    } else {
      onRemove(item)
    }
  }

  return (
    <>
      <Paper withBorder radius="md" p="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="sm" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
            {showChecked && (
              <Checkbox
                mt={3}
                checked={Boolean(item.checked)}
                onChange={(event) => onToggle(item.id, event.currentTarget.checked)}
                color="forest"
              />
            )}
            <Stack gap={6} style={{ minWidth: 0 }}>
              <Text
                style={{ whiteSpace: 'pre-wrap' }}
                td={item.checked && showChecked ? 'line-through' : undefined}
                c={item.checked && showChecked ? 'dimmed' : undefined}
              >
                {item.name}
              </Text>
              {(item.dueDate || item.assignedToName || createdByOther) && (
                <Group gap="xs" wrap="wrap">
                  {item.dueDate && (
                    <Badge
                      color={overdue ? 'red' : 'gray'}
                      variant="light"
                      leftSection={<IconCalendarEvent size={12} />}
                    >
                      {formatDate(item.dueDate)}
                    </Badge>
                  )}
                  {item.assignedToName && (
                    <Badge color="forest" variant="outline" leftSection={<IconUser size={12} />}>
                      {item.assignedToName}
                    </Badge>
                  )}
                  {createdByOther && (
                    <Badge color="grape" variant="outline" leftSection={<IconUser size={12} />}>
                      Opprettet av {item.addedByName || 'ukjent'}
                    </Badge>
                  )}
                </Group>
              )}
            </Stack>
          </Group>
          <Group gap={4} wrap="nowrap">
            {canEdit && (
              <ActionIcon variant="subtle" color="forest" size="sm" onClick={() => onEdit(item)} aria-label="Rediger">
                <IconPencil size={16} />
              </ActionIcon>
            )}
            {canRemove && (
              <ActionIcon variant="subtle" color="red" size="sm" onClick={handleRemoveClick} aria-label="Fjern">
                <IconTrash size={16} />
              </ActionIcon>
            )}
          </Group>
        </Group>
      </Paper>

      {confirmRemove && (
        <Modal
          opened={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Fjerne fra standardlisten?"
          centered
          size="sm"
        >
          <Stack gap="md">
            <Text size="sm">
              Standardlisten deles av alle jegere. Er du sikker på at du vil fjerne «{item.name}»? Dette
              fjerner den for alle.
            </Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setConfirmOpen(false)}>
                Avbryt
              </Button>
              <Button
                color="red"
                onClick={() => {
                  onRemove(item)
                  setConfirmOpen(false)
                }}
              >
                Fjern
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </>
  )
}

// Card-based checklist for prep tasks, with a deadline and optional assignee
// per item. Mirrors Checklist's "shared list + shared template" structure,
// used for Forberedelser.
export function PrepChecklist({ basePath, templatePath, itemLabel = 'oppgave', listLabel = 'Liste', year }) {
  const { user: currentUser } = useAuth()
  const list = useChecklist(basePath, templatePath, { dueDateYear: year, filterAssignee: true })
  const template = useItemList(templatePath)
  const taskActions = usePrepTaskActions(year)
  const { users } = useUsers()
  const [modalTarget, setModalTarget] = useState(null)
  const [editingItem, setEditingItem] = useState(null)

  // Tasks you created and shared with someone else besides yourself are
  // pulled out into their own "Assignet til andre" section for management,
  // instead of being duplicated in the main list.
  const sharedByMeItems = list.items.filter(
    (item) => item.addedBy === currentUser.uid && Array.isArray(item.assignedTo) && item.assignedTo.length > 1,
  )
  const mainItems = list.items.filter((item) => !sharedByMeItems.includes(item))

  function handleAdd(values) {
    if (modalTarget === 'standard') {
      template.addItem(values.name, {
        dueDate: values.dueDate,
        assignedTo: values.assignedTo,
        assignedToName: values.assignedToName,
      })
    } else if (editingItem) {
      taskActions.editTask(editingItem, values)
    } else {
      taskActions.addTask(values)
    }
    setModalTarget(null)
    setEditingItem(null)
  }

  function handleModalClose() {
    setModalTarget(null)
    setEditingItem(null)
  }

  function handleEdit(item) {
    setEditingItem(item)
    setModalTarget('liste')
  }

  return (
    <Tabs defaultValue="liste" keepMounted={false}>
      <Tabs.List mb="md">
        <Tabs.Tab value="liste">{listLabel}</Tabs.Tab>
        <Tabs.Tab value="standard">Standardliste</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="liste">
        <Stack gap="md">
          {!list.loading && (!list.templateImported || list.items.length === 0) && (
            <Paper withBorder p="sm" radius="md" bg="forest.0">
              <Group justify="space-between" wrap="wrap">
                <Text size="sm">
                  Importer oppgaver fra standardlisten som er tildelt deg eller Alle, for å komme i gang.
                </Text>
                <Button
                  size="xs"
                  leftSection={<IconDownload size={14} />}
                  loading={list.importing}
                  onClick={list.importFromTemplate}
                  color="forest"
                >
                  Importer fra standardliste
                </Button>
              </Group>
            </Paper>
          )}

          <Group justify="flex-end">
            <Button leftSection={<IconPlus size={16} />} color="forest" onClick={() => setModalTarget('liste')}>
              Legg til {itemLabel}
            </Button>
          </Group>

          {list.loading ? (
            <Text c="dimmed" size="sm">
              Laster...
            </Text>
          ) : list.error ? (
            <Text c="red" size="sm">
              Klarte ikke å laste listen. Sjekk Firebase-oppsettet (se README).
            </Text>
          ) : mainItems.length === 0 ? (
            <Text c="dimmed" size="sm">
              Ingen oppgaver lagt til enda.
            </Text>
          ) : (
            <Stack gap="xs">
              {sortPrepItems(mainItems).map((item) => {
                const canManage = item.addedBy === currentUser.uid
                return (
                  <PrepItemCard
                    key={item.id}
                    item={item}
                    currentUserUid={currentUser.uid}
                    onToggle={list.toggleItem}
                    onRemove={taskActions.removeTask}
                    onEdit={handleEdit}
                    canRemove={canManage}
                    canEdit={canManage}
                  />
                )
              })}
            </Stack>
          )}

          {sharedByMeItems.length > 0 && (
            <Stack gap="xs" mt="md">
              <Text fw={600} size="sm">
                Assignet til andre
              </Text>
              {sortPrepItems(sharedByMeItems).map((item) => (
                <PrepItemCard
                  key={item.id}
                  item={item}
                  currentUserUid={currentUser.uid}
                  onToggle={list.toggleItem}
                  onRemove={taskActions.removeTask}
                  onEdit={handleEdit}
                  canRemove
                  canEdit
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="standard">
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Dette er standardlisten alle kan importere fra og denne er felles og deles mellom alle jegerne.
            Endringer her påvirker ikke lister som allerede er importert, men påvirker standardlisten hos
            alle jegere.
          </Text>

          <Group justify="flex-end">
            <Button
              leftSection={<IconPlus size={16} />}
              color="forest"
              onClick={() => setModalTarget('standard')}
            >
              Legg til {itemLabel}
            </Button>
          </Group>

          {template.loading ? (
            <Text c="dimmed" size="sm">
              Laster...
            </Text>
          ) : template.error ? (
            <Text c="red" size="sm">
              Klarte ikke å laste standardlisten. Sjekk Firebase-oppsettet (se README).
            </Text>
          ) : template.items.length === 0 ? (
            <Text c="dimmed" size="sm">
              Standardlisten er tom.
            </Text>
          ) : (
            <Stack gap="xs">
              {sortPrepItems(template.items).map((item) => (
                <PrepItemCard
                  key={item.id}
                  item={item}
                  showChecked={false}
                  onRemove={(removedItem) => template.removeItem(removedItem.id)}
                  canRemove
                  confirmRemove
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Tabs.Panel>

      <AddPrepItemModal
        key={editingItem?.id ?? modalTarget ?? 'closed'}
        opened={modalTarget != null}
        onClose={handleModalClose}
        onAdd={handleAdd}
        itemLabel={itemLabel}
        users={modalTarget === 'standard' ? users : users.filter((u) => u.uid !== currentUser.uid)}
        mode={modalTarget === 'standard' ? 'template' : 'list'}
        year={year}
        editing={Boolean(editingItem)}
        initialValues={
          editingItem
            ? {
                name: editingItem.name,
                ...parseDueDate(editingItem.dueDate),
                assignedTo: (Array.isArray(editingItem.assignedTo) ? editingItem.assignedTo : []).filter(
                  (uid) => uid !== currentUser.uid && uid !== 'ALL',
                ),
              }
            : null
        }
      />
    </Tabs>
  )
}
