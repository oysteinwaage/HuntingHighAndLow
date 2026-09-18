import { useState } from 'react'
import { NavLink as RouterNavLink, Outlet, useLocation } from 'react-router-dom'
import {
  AppShell,
  Avatar,
  Badge,
  Burger,
  Group,
  Indicator,
  NavLink,
  ScrollArea,
  Text,
  Menu,
  UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconBackpack,
  IconChecklist,
  IconHome,
  IconInbox,
  IconLogout,
  IconMessage2,
  IconNotebook,
  IconShoppingCart,
} from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { useFeedbackList } from '../hooks/useFeedback'
import hunterIcon from '../assets/hunter-icon.png'
import { FeedbackDialog } from './FeedbackDialog'
import { IosInstallBanner } from './IosInstallBanner'
import classes from './Layout.module.scss'

const NAV_ITEMS = [
  { to: '/', label: 'Hjem', icon: IconHome, end: true },
  { to: '/erfaringer', label: 'Erfaringer', icon: IconNotebook },
  { to: '/handleliste', label: 'Handleliste', icon: IconShoppingCart },
  { to: '/pakkeliste', label: 'Pakkeliste', icon: IconBackpack },
  { to: '/forberedelser', label: 'Forberedelser', icon: IconChecklist },
]

export function Layout() {
  const [opened, { toggle, close }] = useDisclosure(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const { user, isAdmin, signOut } = useAuth()
  const { unreadCount } = useFeedbackList(isAdmin)
  const location = useLocation()

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header className={classes.header}>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Indicator
              label={unreadCount}
              color="red"
              size={16}
              offset={4}
              disabled={!isAdmin || unreadCount === 0}
              hiddenFrom="sm"
            >
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            </Indicator>
            <Text fw={700} size="lg" c="forest.7">
              Hunting High &amp; Low
            </Text>
            <img src={hunterIcon} alt="" height={28} style={{ display: 'block' }} />
          </Group>
          {user && (
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Avatar src={user.photoURL} radius="xl" size="sm">
                      {user.displayName?.[0]}
                    </Avatar>
                    <Text size="sm" visibleFrom="xs">
                      {user.displayName}
                    </Text>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconLogout size={16} />} onClick={signOut}>
                  Logg ut
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className={classes.navbar} p="sm">
        <ScrollArea>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              component={RouterNavLink}
              to={item.to}
              end={item.end}
              label={item.label}
              leftSection={<item.icon size={18} stroke={1.75} />}
              active={
                item.end
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to)
              }
              onClick={close}
              className={classes.navLink}
              variant="filled"
              color="forest"
            />
          ))}

          {isAdmin && (
            <NavLink
              component={RouterNavLink}
              to="/tilbakemeldinger"
              label="Tilbakemeldinger"
              leftSection={<IconInbox size={18} stroke={1.75} />}
              rightSection={
                unreadCount > 0 ? (
                  <Badge color="red" size="sm" circle>
                    {unreadCount}
                  </Badge>
                ) : null
              }
              active={location.pathname.startsWith('/tilbakemeldinger')}
              onClick={close}
              className={classes.navLink}
              variant="filled"
              color="forest"
            />
          )}

          <NavLink
            label="Send tilbakemelding"
            leftSection={<IconMessage2 size={18} stroke={1.75} />}
            onClick={() => {
              setFeedbackOpen(true)
              close()
            }}
            className={classes.navLink}
            variant="filled"
            color="forest"
          />
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main className={classes.main}>
        <Outlet />
      </AppShell.Main>

      <IosInstallBanner />
      <FeedbackDialog opened={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </AppShell>
  )
}
