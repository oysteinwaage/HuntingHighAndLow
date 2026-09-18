import { NavLink as RouterNavLink, Outlet, useLocation } from 'react-router-dom'
import {
  AppShell,
  Avatar,
  Burger,
  Group,
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
  IconLogout,
  IconNotebook,
  IconShoppingCart,
} from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import hunterIcon from '../assets/hunter-icon.png'
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
  const { user, signOut } = useAuth()
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
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <img src={hunterIcon} alt="" height={28} style={{ display: 'block' }} />
            <Text fw={700} size="lg" c="forest.7">
              Hunting High &amp; Low
            </Text>
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
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main className={classes.main}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
