import { useEffect, useState } from 'react'
import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Paper,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core'
import { IconDownload, IconPlus, IconTrash } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { useChecklist } from '../hooks/useChecklist'
import { useItemList } from '../hooks/useItemList'
import styles from './Checklist.module.scss'

function AddItemForm({ onAdd, placeholder }) {
  const [value, setValue] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!value.trim()) return
    onAdd(value)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <Group gap="xs">
        <TextInput
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          placeholder={placeholder}
          style={{ flex: 1 }}
        />
        <ActionIcon type="submit" color="forest" variant="filled" size="lg" aria-label="Legg til">
          <IconPlus size={18} />
        </ActionIcon>
      </Group>
    </form>
  )
}

function ItemRow({ item, onToggle, onRemove, canRemove, showChecked = true }) {
  return (
    <Group justify="space-between" py={6} px={6} className={styles.itemRow} wrap="nowrap">
      <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
        {showChecked && (
          <Checkbox
            checked={Boolean(item.checked)}
            onChange={(event) => onToggle(item.id, event.currentTarget.checked)}
            color="forest"
          />
        )}
        <Text
          truncate
          td={item.checked && showChecked ? 'line-through' : undefined}
          c={item.checked && showChecked ? 'dimmed' : undefined}
        >
          {item.name}
        </Text>
      </Group>
      {canRemove && (
        <ActionIcon
          variant="subtle"
          color="red"
          size="sm"
          onClick={() => onRemove(item.id)}
          aria-label="Fjern"
        >
          <IconTrash size={16} />
        </ActionIcon>
      )}
    </Group>
  )
}

// Reusable "shared or personal checklist with a default template" view,
// used for Handleliste, Pakkeliste and Forberedelser.
export function Checklist({ basePath, templatePath, itemLabel = 'ting', defaultTemplateItems }) {
  const { user } = useAuth()
  const list = useChecklist(basePath, templatePath)
  const template = useItemList(templatePath)

  useEffect(() => {
    if (defaultTemplateItems?.length) {
      template.seedIfEmpty(defaultTemplateItems)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templatePath])

  return (
    <Tabs defaultValue="liste" keepMounted={false}>
      <Tabs.List mb="md">
        <Tabs.Tab value="liste">Liste</Tabs.Tab>
        <Tabs.Tab value="standard">Standardliste</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="liste">
        <Stack gap="md">
          {!list.loading && (!list.templateImported || list.items.length === 0) && (
            <Paper withBorder p="sm" radius="md" bg="forest.0">
              <Group justify="space-between" wrap="wrap">
                <Text size="sm">Importer standardlisten for å komme i gang.</Text>
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

          <AddItemForm onAdd={(name) => list.addItem(name)} placeholder={`Legg til ${itemLabel}...`} />

          <Paper withBorder radius="md" p="sm">
            {list.loading ? (
              <Text c="dimmed" size="sm">
                Laster...
              </Text>
            ) : list.error ? (
              <Text c="red" size="sm">
                Klarte ikke å laste listen. Sjekk Firebase-oppsettet (se README).
              </Text>
            ) : list.items.length === 0 ? (
              <Text c="dimmed" size="sm">
                Ingen {itemLabel} lagt til enda.
              </Text>
            ) : (
              <Stack gap={0}>
                {list.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onToggle={list.toggleItem}
                    onRemove={list.removeItem}
                    canRemove={!item.addedBy || item.addedBy === user?.uid}
                  />
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="standard">
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Dette er standardlisten alle kan importere fra. Endringer her påvirker ikke lister som
            allerede er importert.
          </Text>
          <AddItemForm
            onAdd={(name) => template.addItem(name)}
            placeholder={`Legg til ${itemLabel} i standardlisten...`}
          />
          <Paper withBorder radius="md" p="sm">
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
              <Stack gap={0}>
                {template.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    showChecked={false}
                    onRemove={template.removeItem}
                    canRemove
                  />
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Tabs.Panel>
    </Tabs>
  )
}
