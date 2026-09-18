import { SimpleGrid, Paper, Stack, Text, Title, ThemeIcon } from '@mantine/core'
import { Link } from 'react-router-dom'
import {
  IconBackpack,
  IconChecklist,
  IconNotebook,
  IconShoppingCart,
} from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'

const CARDS = [
  {
    to: '/erfaringer',
    icon: IconNotebook,
    title: 'Erfaringer',
    description: 'Hva funket bra og dårlig i årets jakt.',
  },
  {
    to: '/handleliste',
    icon: IconShoppingCart,
    title: 'Handleliste',
    description: 'Felles handleliste for årets jakt.',
  },
  {
    to: '/pakkeliste',
    icon: IconBackpack,
    title: 'Pakkeliste',
    description: 'Din personlige pakkeliste.',
  },
  {
    to: '/forberedelser',
    icon: IconChecklist,
    title: 'Forberedelser',
    description: 'Det som må huskes i tide før jakta.',
  },
]

export function HomePage() {
  const { user } = useAuth()
  const firstName = user?.displayName?.split(' ')[0]

  return (
    <Stack gap="lg" mt="md">
      <div>
        <Title order={2}>{firstName ? `Hei, ${firstName}!` : 'Hei!'}</Title>
        <Text c="dimmed">Velg hva du vil se på.</Text>
      </div>

      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
        {CARDS.map((card) => (
          <Paper
            key={card.to}
            component={Link}
            to={card.to}
            withBorder
            radius="lg"
            p="lg"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Stack gap="sm">
              <ThemeIcon size={42} radius="md" color="forest" variant="light">
                <card.icon size={22} stroke={1.75} />
              </ThemeIcon>
              <Title order={4}>{card.title}</Title>
              <Text size="sm" c="dimmed">
                {card.description}
              </Text>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
