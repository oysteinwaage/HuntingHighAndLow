import { useEffect, useMemo, useState } from 'react'
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  NativeSelect,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  TagsInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconPencil, IconPlus, IconTarget, IconTrash } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { useCatchReports } from '../hooks/useCatchReports'
import { useUsers } from '../hooks/useUsers'
import { formatFullDate, getDatesInRange, getDefaultHuntDates, parseDateString, toDateString } from '../utils/huntDates'
import { MIN_CATCH_REPORT_YEAR, getCatchReportYearOptions } from '../utils/catchReportYear'

const SPECIES_OPTIONS = [
  { value: 'rype', label: 'Rype' },
  { value: 'hare', label: 'Hare' },
  { value: 'and', label: 'And' },
]

function speciesLabel(value) {
  return SPECIES_OPTIONS.find((s) => s.value === value)?.label ?? value
}

const EXTERNAL_PARTICIPANT_PREFIX = 'ext-'

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Participant names are matched against registered users (so their uid is
// reused, e.g. for future profile links), but anyone not found gets a
// synthetic id — hunts often include guests who never made an app account.
// The id is freshly generated every time (see useCatchSummary for how these
// guests are still merged together by name across years/reports).
function buildParticipantMap(names, users) {
  const map = {}
  for (const rawName of names) {
    const name = rawName.trim()
    if (!name) continue
    const matchedUser = users.find((u) => u.displayName.toLowerCase() === name.toLowerCase())
    const id = matchedUser ? matchedUser.uid : `${EXTERNAL_PARTICIPANT_PREFIX}${generateId()}`
    map[id] = matchedUser ? matchedUser.displayName : name
  }
  return map
}

function defaultHuntDateStrings(year) {
  const { start, end } = getDefaultHuntDates(Number(year))
  return { start: toDateString(start), end: toDateString(end) }
}

function NewReportModal({ opened, onClose, availableYears, users, onCreate }) {
  const [year, setYear] = useState(String(availableYears[0]))
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startDateTouched, setStartDateTouched] = useState(false)
  const [endDateTouched, setEndDateTouched] = useState(false)
  const [participantNames, setParticipantNames] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (opened) {
      const initialYear = String(availableYears[0])
      setYear(initialYear)
      // Defaults the date pickers to the Thursday–Sunday of the first Friday
      // on or after 10. september (the earliest huntable Friday) for the
      // selected year — the same default hunt period used elsewhere in the app.
      const defaults = defaultHuntDateStrings(initialYear)
      setStartDate(defaults.start)
      setEndDate(defaults.end)
      setStartDateTouched(false)
      setEndDateTouched(false)
      setParticipantNames([])
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened])

  function handleYearChange(event) {
    const newYear = event.currentTarget.value
    setYear(newYear)
    const defaults = defaultHuntDateStrings(newYear)
    if (!startDateTouched) setStartDate(defaults.start)
    if (!endDateTouched) setEndDate(defaults.end)
  }

  function handleClose() {
    if (saving) return
    onClose()
  }

  async function handleSubmit() {
    if (!startDate || !endDate || participantNames.length === 0) return
    if (endDate < startDate) {
      setError('Til-dato kan ikke være før fra-dato.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const participantMap = buildParticipantMap(participantNames, users)
      await onCreate(Number(year), { startDate, endDate, participants: participantMap })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke lagre fangstrapporten.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Legg til fangstrapport" centered>
      <Stack gap="sm">
        {availableYears.length === 0 ? (
          <Text c="dimmed" size="sm">
            Alle år har allerede en fangstrapport.
          </Text>
        ) : (
          <>
            <NativeSelect label="År" value={year} onChange={handleYearChange} data={availableYears.map(String)} />
            <Group grow>
              <TextInput
                type="date"
                label="Fra dato"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.currentTarget.value)
                  setStartDateTouched(true)
                }}
              />
              <TextInput
                type="date"
                label="Til dato"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.currentTarget.value)
                  setEndDateTouched(true)
                }}
              />
            </Group>
            <TagsInput
              label="Deltakere"
              description="Velg blant registrerte brukere, eller skriv inn navnet på noen uten bruker i appen og trykk Enter"
              placeholder="Skriv navn og trykk Enter"
              data={users.map((u) => u.displayName)}
              value={participantNames}
              onChange={setParticipantNames}
            />
          </>
        )}
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
            onClick={handleSubmit}
            loading={saving}
            disabled={availableYears.length === 0 || !startDate || !endDate || participantNames.length === 0}
          >
            Legg til
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function AddHuntDayModal({ opened, onClose, days, onAdd }) {
  const [date, setDate] = useState('')
  const [area, setArea] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (opened) {
      setDate(days[0] ? toDateString(days[0]) : '')
      setArea('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened])

  function handleClose() {
    if (saving) return
    onClose()
  }

  async function handleSubmit() {
    if (!date || !area.trim()) return
    setSaving(true)
    try {
      await onAdd({ date, area: area.trim() })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Legg til jaktdag" centered size="sm">
      <Stack gap="sm">
        <NativeSelect
          label="Jaktdag"
          value={date}
          onChange={(event) => setDate(event.currentTarget.value)}
          data={days.map((d) => ({ value: toDateString(d), label: formatFullDate(d) }))}
        />
        <TextInput
          label="Jaktområde"
          placeholder="F.eks. Nordre Åsen"
          value={area}
          onChange={(event) => setArea(event.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose} disabled={saving}>
            Avbryt
          </Button>
          <Button color="forest" onClick={handleSubmit} loading={saving} disabled={!date || !area.trim()}>
            Legg til
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function AddCatchModal({ opened, onClose, participants, onAdd }) {
  const [participantUid, setParticipantUid] = useState(participants[0]?.[0] ?? '')
  const [species, setSpecies] = useState('rype')
  const [count, setCount] = useState(1)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (opened) {
      setParticipantUid(participants[0]?.[0] ?? '')
      setSpecies('rype')
      setCount(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened])

  function handleClose() {
    if (saving) return
    onClose()
  }

  async function handleSubmit() {
    if (!participantUid || !count) return
    setSaving(true)
    try {
      await onAdd({ participantUid, species, count: Number(count) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Legg til fangst" centered size="sm">
      <Stack gap="sm">
        <Select
          label="Deltaker som fikk fangst"
          data={participants.map(([uid, name]) => ({ value: uid, label: name }))}
          value={participantUid}
          onChange={(value) => setParticipantUid(value ?? '')}
        />
        <Select
          label="Hva ble skutt"
          data={SPECIES_OPTIONS}
          value={species}
          onChange={(value) => setSpecies(value ?? 'rype')}
        />
        <NumberInput label="Antall" min={1} value={count} onChange={setCount} />
        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose} disabled={saving}>
            Avbryt
          </Button>
          <Button color="forest" onClick={handleSubmit} loading={saving} disabled={!participantUid || !count}>
            Legg til
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function HuntDayCard({ day, isAdmin, onAddCatch, onRemoveDay, onRemoveCatch }) {
  const catches = Object.entries(day.catches || {}).map(([id, c]) => ({ id, ...c }))

  return (
    <Paper withBorder radius="sm" p="sm" bg="gray.0">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <Text fw={600} size="sm">
              {formatFullDate(parseDateString(day.date))}
            </Text>
            <Text size="sm" c="dimmed">
              {day.area}
            </Text>
          </div>
          {isAdmin && (
            <ActionIcon variant="subtle" color="red" size="sm" onClick={onRemoveDay} aria-label="Slett jaktdag">
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Group>

        {catches.length > 0 && (
          <Stack gap={4}>
            {catches.map((c) => (
              <Group key={c.id} justify="space-between" wrap="nowrap">
                <Text size="sm">
                  {c.participantName} – {c.count}x {speciesLabel(c.species)}
                </Text>
                {isAdmin && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={() => onRemoveCatch(c.id)}
                    aria-label="Slett fangst"
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                )}
              </Group>
            ))}
          </Stack>
        )}

        {isAdmin && (
          <Group justify="flex-end">
            <Button size="compact-xs" variant="subtle" color="forest" leftSection={<IconPlus size={12} />} onClick={onAddCatch}>
              Legg til fangst
            </Button>
          </Group>
        )}
      </Stack>
    </Paper>
  )
}

function EditParticipantsModal({ opened, onClose, year, report, users, onSave }) {
  const [participantNames, setParticipantNames] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (opened) {
      setParticipantNames(Object.values(report.participants || {}))
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened])

  function handleClose() {
    if (saving) return
    onClose()
  }

  async function handleSubmit() {
    if (participantNames.length === 0) {
      setError('Fangstrapporten må ha minst én deltaker.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const participantMap = buildParticipantMap(participantNames, users)
      await onSave(participantMap)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke lagre deltakerne.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title={`Rediger deltakere ${year}`} centered size="sm">
      <Stack gap="sm">
        <TagsInput
          label="Deltakere"
          description="Velg blant registrerte brukere, eller skriv inn navnet på noen uten bruker i appen og trykk Enter. Fjern noen ved å klikke bort chip'en deres."
          placeholder="Skriv navn og trykk Enter"
          data={users.map((u) => u.displayName)}
          value={participantNames}
          onChange={setParticipantNames}
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
          <Button color="forest" onClick={handleSubmit} loading={saving}>
            Lagre
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function YearReportCard({ year, report, isAdmin, users, actions }) {
  const start = parseDateString(report.startDate)
  const end = parseDateString(report.endDate)
  const daysInPeriod = useMemo(() => getDatesInRange(start, end), [start, end])
  const participantEntries = Object.entries(report.participants || {})

  const [dayModalOpen, setDayModalOpen] = useState(false)
  const [catchModalDay, setCatchModalDay] = useState(null)
  const [editParticipantsOpen, setEditParticipantsOpen] = useState(false)
  const [confirmDeleteReport, setConfirmDeleteReport] = useState(false)

  const huntDays = Object.entries(report.huntDays || {})
    .map(([id, day]) => ({ id, ...day }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={3}>{year}</Title>
            <Text size="sm" c="dimmed">
              {formatFullDate(start)} – {formatFullDate(end)}
            </Text>
          </div>
          {isAdmin && (
            <Group gap={4}>
              <ActionIcon
                variant="subtle"
                color="forest"
                onClick={() => setEditParticipantsOpen(true)}
                aria-label={`Rediger deltakere for ${year}`}
              >
                <IconPencil size={18} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => setConfirmDeleteReport(true)}
                aria-label={`Slett fangstrapport for ${year}`}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Group>
          )}
        </Group>

        {participantEntries.length > 0 && (
          <Group gap="xs" wrap="wrap">
            {participantEntries.map(([uid, name]) => (
              <Badge key={uid} variant="light" color="forest">
                {name}
              </Badge>
            ))}
          </Group>
        )}

        <Stack gap="sm">
          {huntDays.length === 0 ? (
            <Text c="dimmed" size="sm">
              Ingen jaktdager registrert enda.
            </Text>
          ) : (
            huntDays.map((day) => (
              <HuntDayCard
                key={day.id}
                day={day}
                isAdmin={isAdmin}
                onAddCatch={() => setCatchModalDay(day.id)}
                onRemoveDay={() => actions.removeHuntDay(year, day.id)}
                onRemoveCatch={(catchId) => actions.removeCatch(year, day.id, catchId)}
              />
            ))
          )}

          {isAdmin && (
            <Group justify="flex-end">
              <Button
                size="xs"
                variant="light"
                color="forest"
                leftSection={<IconPlus size={14} />}
                onClick={() => setDayModalOpen(true)}
              >
                Legg til jaktdag
              </Button>
            </Group>
          )}
        </Stack>
      </Stack>

      <AddHuntDayModal
        opened={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        days={daysInPeriod}
        onAdd={async ({ date, area }) => {
          await actions.addHuntDay(year, { date, area })
          setDayModalOpen(false)
        }}
      />

      <AddCatchModal
        opened={catchModalDay !== null}
        onClose={() => setCatchModalDay(null)}
        participants={participantEntries}
        onAdd={async ({ participantUid, species, count }) => {
          const participantName = report.participants[participantUid]
          await actions.addCatch(year, catchModalDay, { participantUid, participantName, species, count })
          setCatchModalDay(null)
        }}
      />

      <EditParticipantsModal
        opened={editParticipantsOpen}
        onClose={() => setEditParticipantsOpen(false)}
        year={year}
        report={report}
        users={users}
        onSave={(participantMap) => actions.updateParticipants(year, participantMap)}
      />

      <Modal
        opened={confirmDeleteReport}
        onClose={() => setConfirmDeleteReport(false)}
        title="Slette fangstrapport?"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Er du sikker på at du vil slette hele fangstrapporten for {year}? Dette sletter alle jaktdager og
            fangster som er registrert for året.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirmDeleteReport(false)}>
              Avbryt
            </Button>
            <Button
              color="red"
              onClick={() => {
                actions.removeReport(year)
                setConfirmDeleteReport(false)
              }}
            >
              Slett
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  )
}

// Totals across all years, per participant and per hunting area, each broken
// down by species — the raw numbers behind future statistics.
function useCatchSummary(reportsByYear) {
  return useMemo(() => {
    const byParticipant = new Map()
    const byArea = new Map()

    function addCount(map, key, label, species, count) {
      const entry = map.get(key) ?? { key, label, total: 0, bySpecies: {} }
      entry.total += count
      entry.bySpecies[species] = (entry.bySpecies[species] || 0) + count
      map.set(key, entry)
    }

    for (const report of Object.values(reportsByYear || {})) {
      for (const day of Object.values(report.huntDays || {})) {
        const area = day.area?.trim() || 'Ukjent område'
        for (const c of Object.values(day.catches || {})) {
          const count = Number(c.count) || 0
          if (count <= 0) continue
          const name = c.participantName || 'Ukjent'
          // Guests without an app account get a freshly generated id every
          // time they're added as a participant (see buildParticipantMap),
          // so the same guest across years only merges into one row when
          // grouped by name instead of by that id.
          const participantKey = c.participantUid?.startsWith(EXTERNAL_PARTICIPANT_PREFIX)
            ? `name:${name.trim().toLowerCase()}`
            : c.participantUid
          addCount(byParticipant, participantKey, name, c.species, count)
          addCount(byArea, area, area, c.species, count)
        }
      }
    }

    const bySortedTotal = (map) =>
      Array.from(map.values()).sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, 'no'))

    return { byParticipant: bySortedTotal(byParticipant), byArea: bySortedTotal(byArea) }
  }, [reportsByYear])
}

function CatchSummaryTable({ title, rows, emptyLabel }) {
  return (
    <Paper withBorder radius="md" p="md" style={{ flex: '1 1 320px' }}>
      <Title order={4} mb="sm">
        {title}
      </Title>
      {rows.length === 0 ? (
        <Text c="dimmed" size="sm">
          {emptyLabel}
        </Text>
      ) : (
        <Table.ScrollContainer minWidth={320}>
          <Table verticalSpacing="xs" fz="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th></Table.Th>
                {SPECIES_OPTIONS.map((s) => (
                  <Table.Th key={s.value} ta="right">
                    {s.label}
                  </Table.Th>
                ))}
                <Table.Th ta="right">Totalt</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => (
                <Table.Tr key={row.key}>
                  <Table.Td>{row.label}</Table.Td>
                  {SPECIES_OPTIONS.map((s) => (
                    <Table.Td key={s.value} ta="right">
                      {row.bySpecies[s.value] || 0}
                    </Table.Td>
                  ))}
                  <Table.Td ta="right" fw={600}>
                    {row.total}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Paper>
  )
}

function CatchSummary({ reportsByYear }) {
  const { byParticipant, byArea } = useCatchSummary(reportsByYear)

  if (byParticipant.length === 0 && byArea.length === 0) return null

  return (
    <Stack gap="sm">
      <Title order={3}>Totalfangst</Title>
      <Group align="flex-start" wrap="wrap" gap="md">
        <CatchSummaryTable title="Pr deltaker" rows={byParticipant} emptyLabel="Ingen fangst registrert enda." />
        <CatchSummaryTable title="Pr jaktområde" rows={byArea} emptyLabel="Ingen fangst registrert enda." />
      </Group>
    </Stack>
  )
}

export function FangstrapporterPage() {
  const { isAdmin } = useAuth()
  const {
    reportsByYear,
    loading,
    error,
    addReport,
    updateParticipants,
    removeReport,
    addHuntDay,
    removeHuntDay,
    addCatch,
    removeCatch,
  } = useCatchReports()
  const { users } = useUsers()
  const [modalOpen, setModalOpen] = useState(false)

  const years = Object.keys(reportsByYear)
    .map(Number)
    .sort((a, b) => b - a)

  const availableYears = useMemo(
    () => getCatchReportYearOptions().filter((y) => !reportsByYear[y]),
    [reportsByYear],
  )

  const actions = { updateParticipants, removeReport, addHuntDay, removeHuntDay, addCatch, removeCatch }

  return (
    <Stack gap="lg" mt="md">
      <Group justify="space-between" wrap="wrap">
        <div>
          <Title order={2}>Fangstrapporter</Title>
          <Text c="dimmed">Fangst for hvert år, fra {MIN_CATCH_REPORT_YEAR} og frem til i dag.</Text>
        </div>
        {isAdmin && availableYears.length > 0 && (
          <Button leftSection={<IconPlus size={16} />} color="forest" onClick={() => setModalOpen(true)}>
            Legg til fangstrapport
          </Button>
        )}
      </Group>

      {!loading && !error && <CatchSummary reportsByYear={reportsByYear} />}

      {loading ? (
        <Text c="dimmed" size="sm">
          Laster...
        </Text>
      ) : error ? (
        <Text c="red" size="sm">
          Klarte ikke å laste fangstrapportene. Sjekk Firebase-oppsettet (se README).
        </Text>
      ) : years.length === 0 ? (
        <Stack align="center" gap={4} py="xl">
          <IconTarget size={40} stroke={1.5} color="var(--mantine-color-gray-5)" />
          <Text c="dimmed" size="sm">
            Ingen fangstrapporter registrert enda.
          </Text>
        </Stack>
      ) : (
        <Stack gap="lg">
          {years.map((year) => (
            <YearReportCard
              key={year}
              year={year}
              report={reportsByYear[year]}
              isAdmin={isAdmin}
              users={users}
              actions={actions}
            />
          ))}
        </Stack>
      )}

      <NewReportModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        availableYears={availableYears}
        users={users}
        onCreate={addReport}
      />
    </Stack>
  )
}
