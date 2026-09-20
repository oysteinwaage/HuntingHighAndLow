import { useState } from 'react'
import { Button, Group, Modal, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import {
  IconBackpack,
  IconChecklist,
  IconChevronLeft,
  IconChevronRight,
  IconMessage2,
  IconMusic,
  IconNotebook,
  IconPhoto,
  IconShoppingCart,
  IconSparkles,
} from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import hunterIcon from '../assets/hunter-icon.png'
import { OnboardingCelebration } from './OnboardingCelebration'
import classes from './OnboardingModal.module.scss'

const STEPS = 3

const FEATURES = [
  { icon: IconNotebook, title: 'Erfaringer', description: 'Hva funket bra og dårlig i årets jakt.' },
  { icon: IconShoppingCart, title: 'Handleliste', description: 'Felles handleliste for årets jakt.' },
  { icon: IconBackpack, title: 'Pakkeliste', description: 'Din personlige pakkeliste.' },
  { icon: IconChecklist, title: 'Forberedelser', description: 'Det som må huskes i tide før jakta.' },
  { icon: IconPhoto, title: 'Jaktbilder', description: 'Bilder fra jaktturene, år for år.' },
  { icon: IconMusic, title: 'Sanger', description: 'Alle jaktsangene, samlet på ett sted.' },
]

export function OnboardingModal() {
  const { user, onboardingCompleted, isNewUser, completeOnboarding } = useAuth()
  const [step, setStep] = useState(1)
  const [completing, setCompleting] = useState(false)
  const [celebrating, setCelebrating] = useState(false)

  const opened = !!user && onboardingCompleted === false && !celebrating

  function handleComplete() {
    if (completing) return
    setCompleting(true)
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      completeOnboarding().finally(() => setCompleting(false))
    } else {
      setCelebrating(true)
    }
  }

  async function handleCelebrationDone() {
    await completeOnboarding()
    setCelebrating(false)
    setCompleting(false)
  }

  const firstName = user?.displayName?.split(' ')[0]
  const step1Title = isNewUser ? `Velkommen, ${firstName || 'jeger'}!` : 'Nytt i appen'
  const step3Title = isNewUser ? 'Du er klar!' : 'Klar til å ta den i bruk!'

  return (
    <>
    <Modal
      opened={opened}
      onClose={() => {}}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      centered
      size="md"
      radius="lg"
      padding={0}
      classNames={{ content: classes.content, body: classes.modalBody }}
    >
      <div className={classes.header}>
        <Group gap="sm" mb="sm">
          <img src={hunterIcon} alt="" height={32} />
          <Text size="sm" fw={600} className={classes.eyebrow}>
            {isNewUser ? 'Kom i gang' : 'Oppdatering'}
          </Text>
        </Group>
        <Title order={3} c="white">
          {step === 1 && step1Title}
          {step === 2 && 'Dette finner du i appen'}
          {step === 3 && step3Title}
        </Title>
        <Group gap={6} mt="md">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} className={i + 1 <= step ? classes.dotActive : classes.dot} />
          ))}
        </Group>
      </div>

      <div className={classes.body}>
        {step === 1 && (
          <Text size="sm" c="dimmed">
            {isNewUser
              ? 'Hunting High & Low samler alt til jakta på ett sted: erfaringer, handleliste, pakkeliste, forberedelser, bilder og sanger.'
              : 'Appen har fått samlet alt som hører til jakta på ett sted. Her er en rask oversikt over hva du finner.'}
          </Text>
        )}

        {step === 2 && (
          <SimpleGrid cols={2} spacing="sm">
            {FEATURES.map((feature) => (
              <Paper key={feature.title} withBorder radius="md" p="sm">
                <Stack gap={4}>
                  <ThemeIcon size={32} radius="md" color="forest" variant="light">
                    <feature.icon size={18} stroke={1.75} />
                  </ThemeIcon>
                  <Text size="sm" fw={600}>
                    {feature.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {feature.description}
                  </Text>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        )}

        {step === 3 && (
          <Stack align="center" gap="sm" py="sm">
            <ThemeIcon size={56} radius="xl" color="forest" variant="light">
              <IconSparkles size={28} stroke={1.75} />
            </ThemeIcon>
            <Text size="sm" c="dimmed" ta="center">
              Du finner alt i menyen, og du kan sende oss tilbakemelding med{' '}
              <IconMessage2 size={14} stroke={2} className={classes.inlineIcon} />-knappen når som helst.
              Lykke til på jakta! 🦌
            </Text>
          </Stack>
        )}
      </div>

      <Group justify="space-between" p="md" className={classes.footer}>
        {step > 1 ? (
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconChevronLeft size={16} />}
            onClick={() => setStep((s) => s - 1)}
          >
            Tilbake
          </Button>
        ) : (
          <div />
        )}

        {step < STEPS ? (
          <Button color="forest" rightSection={<IconChevronRight size={16} />} onClick={() => setStep((s) => s + 1)}>
            Neste
          </Button>
        ) : (
          <Button color="forest" loading={completing} onClick={handleComplete}>
            Sett i gang
          </Button>
        )}
      </Group>
    </Modal>
    {celebrating && <OnboardingCelebration onDone={handleCelebrationDone} />}
    </>
  )
}
