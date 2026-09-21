import { useState } from 'react'
import { Link, NavLink as RouterNavLink, Outlet, useLocation } from 'react-router-dom'
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
  IconCrosshair,
  IconHome,
  IconInbox,
  IconLogout,
  IconMessage2,
  IconMusic,
  IconNotebook,
  IconPhoto,
  IconShoppingCart,
  IconTarget,
  IconUsers,
} from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { useFeedbackList } from '../hooks/useFeedback'
import hunterIcon from '../assets/hunter-icon.png'
import { FeedbackDialog } from './FeedbackDialog'
import { IosInstallBanner } from './IosInstallBanner'
import { OnboardingModal } from './OnboardingModal'
import { OnboardingCelebration } from './OnboardingCelebration'
import classes from './Layout.module.scss'

const NAV_ITEMS = [
  { to: '/', label: 'Hjem', icon: IconHome, end: true },
  { to: '/erfaringer', label: 'Erfaringer', icon: IconNotebook },
  { to: '/handleliste', label: 'Handleliste', icon: IconShoppingCart },
  { to: '/pakkeliste', label: 'Pakkeliste', icon: IconBackpack },
  { to: '/forberedelser', label: 'Forberedelser', icon: IconChecklist },
  { to: '/jaktbilder', label: 'Jaktbilder', icon: IconPhoto },
  { to: '/fangstrapporter', label: 'Fangstrapporter', icon: IconTarget },
  { to: '/sanger', label: 'Sanger', icon: IconMusic },
]

export function Layout() {
  const [opened, { toggle, close }] = useDisclosure(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
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
            <Text
              component={Link}
              to="/"
              fw={700}
              size="lg"
              c="forest.7"
              style={{ textDecoration: 'none' }}
            >
              Hunting High &amp; Low
            </Text>
            <UnstyledButton onClick={() => setCelebrating(true)} aria-label="Skyt rypen">
              <img src={hunterIcon} alt="" height={28} style={{ display: 'block' }} />
            </UnstyledButton>
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
        <ScrollArea style={{ flex: 1 }}>
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
        </ScrollArea>

        <div className={classes.navFooter}>
          {isAdmin && (
            <NavLink
              component={RouterNavLink}
              to="/admin"
              label="Admin"
              leftSection={<IconUsers size={18} stroke={1.75} />}
              active={location.pathname.startsWith('/admin')}
              onClick={close}
              className={classes.navLink}
              variant="filled"
              color="forest"
            />
          )}

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

          {!isAdmin && (
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
          )}

          <NavLink
            label="Skyt rypen"
            leftSection={<IconCrosshair size={18} stroke={1.75} />}
            onClick={() => {
              setCelebrating(true)
              close()
            }}
            className={classes.navLink}
            variant="filled"
            color="forest"
          />
        </div>
      </AppShell.Navbar>

      <AppShell.Main className={classes.main}>
        <Outlet />
      </AppShell.Main>

      <IosInstallBanner />
      <FeedbackDialog opened={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <OnboardingModal />
      {celebrating && <OnboardingCelebration onDone={() => setCelebrating(false)} />}
    </AppShell>
  )
}
