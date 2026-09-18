import { useState } from 'react'
import { Button, Group, Modal, NativeSelect, Stack, Textarea } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { FEEDBACK_TYPES, FEEDBACK_TYPE_LABELS, useSubmitFeedback } from '../hooks/useFeedback'

const TYPE_OPTIONS = Object.entries(FEEDBACK_TYPE_LABELS).map(([value, label]) => ({ value, label }))

export function FeedbackDialog({ opened, onClose }) {
  const submitFeedback = useSubmitFeedback()
  const [type, setType] = useState(FEEDBACK_TYPES.FORSLAG)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleClose() {
    if (submitting) return
    setType(FEEDBACK_TYPES.FORSLAG)
    setMessage('')
    onClose()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!message.trim()) return

    setSubmitting(true)
    try {
      await submitFeedback(type, message)
      notifications.show({
        color: 'forest',
        title: 'Takk for tilbakemeldingen!',
        message: 'Den er sendt inn.',
      })
      handleClose()
    } catch {
      notifications.show({
        color: 'red',
        title: 'Noe gikk galt',
        message: 'Kunne ikke sende tilbakemeldingen. Prøv igjen.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Send tilbakemelding" centered>
      <Stack gap="sm" component="form" onSubmit={handleSubmit}>
        <NativeSelect
          label="Type"
          value={type}
          onChange={(event) => setType(event.currentTarget.value)}
          data={TYPE_OPTIONS}
        />
        <Textarea
          label="Melding"
          placeholder="Hva vil du fortelle oss?"
          value={message}
          onChange={(event) => setMessage(event.currentTarget.value)}
          autosize
          minRows={4}
          required
        />
        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" color="gray" onClick={handleClose} disabled={submitting}>
            Avbryt
          </Button>
          <Button type="submit" color="forest" loading={submitting} disabled={!message.trim()}>
            Send
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
