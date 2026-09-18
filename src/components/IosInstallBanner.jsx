import { useEffect, useRef, useState } from 'react'
import { ActionIcon, Text } from '@mantine/core'
import { IconShare2, IconSquarePlus, IconX } from '@tabler/icons-react'
import classes from './IosInstallBanner.module.scss'

const STORAGE_KEY = 'ios-install-banner-count'
const MAX_SHOW_COUNT = 5

function isIosInSafari() {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
  if (!isIOS) return false
  const standalone = window.navigator.standalone
  return standalone !== true
}

function getShowCount() {
  return parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10)
}

function incrementShowCount() {
  localStorage.setItem(STORAGE_KEY, String(getShowCount() + 1))
}

export function IosInstallBanner() {
  const [dismissed, setDismissed] = useState(false)
  const hasIncremented = useRef(false)

  const shouldShow = isIosInSafari() && getShowCount() < MAX_SHOW_COUNT

  useEffect(() => {
    if (shouldShow && !hasIncremented.current) {
      hasIncremented.current = true
      incrementShowCount()
    }
  }, [shouldShow])

  if (!shouldShow || dismissed) return null

  return (
    <div className={classes.wrapper}>
      <div className={classes.banner}>
        <img src="/icon-192.png" alt="" className={classes.icon} />

        <div className={classes.body}>
          <Text size="sm" fw={600} c="forest.9" className={classes.title}>
            iPhone-tips: Legg til som app på Hjem-skjerm
          </Text>
          <ol className={classes.steps}>
            <li>
              <span className={classes.step}>1.</span> Trykk <span className={classes.step}>«···»</span> nederst til
              høyre i Safari
            </li>
            <li>
              <span className={classes.step}>2.</span> Velg <span className={classes.step}>Del</span>{' '}
              <IconShare2 size={12} stroke={2.5} className={classes.inlineIcon} />
            </li>
            <li>
              <span className={classes.step}>3.</span> Scroll ned og trykk{' '}
              <IconSquarePlus size={12} stroke={2.5} className={classes.inlineIcon} />{' '}
              <span className={classes.step}>«Legg til på Hjem-skjerm»</span>
            </li>
          </ol>
        </div>

        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={() => setDismissed(true)}
          aria-label="Lukk"
          className={classes.close}
        >
          <IconX size={16} />
        </ActionIcon>
      </div>
    </div>
  )
}
