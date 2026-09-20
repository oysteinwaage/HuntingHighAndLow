import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import hunterIcon from '../assets/hunter-icon.png'
import classes from './OnboardingCelebration.module.scss'

// Matches the overlayFade keyframes' total duration in OnboardingCelebration.module.scss.
const ANIMATION_DURATION_MS = 4500

// Plays once, e.g. when onboarding is completed, the "Skyt rypen" menu item
// is used, or the header icon is clicked: the ptarmigan from the header icon
// flies in and hovers, the hunter (same icon) walks into frame and raises the
// gun to take aim, and once he fires, the bird falls to the ground while he
// lowers the gun again. Also bumps the user's shot-ptarmigan counter and
// shows the new total once the bird falls. Calls onDone when the sequence
// has finished.
export function OnboardingCelebration({ onDone }) {
  const { incrementRypeCount } = useAuth()
  const [rypeCount, setRypeCount] = useState(null)
  const onDoneRef = useRef(onDone)
  const incrementRef = useRef(incrementRypeCount)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    incrementRef.current = incrementRypeCount
  }, [incrementRypeCount])

  useEffect(() => {
    incrementRef.current().then(setRypeCount)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => onDoneRef.current?.(), ANIMATION_DURATION_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={classes.overlay} role="presentation" aria-hidden="true">
      <div className={classes.scene}>
        <div className={classes.bird} style={{ backgroundImage: `url(${hunterIcon})` }} />
        <div className={classes.hunter} style={{ backgroundImage: `url(${hunterIcon})` }}>
          <div className={classes.muzzleFlash} />
        </div>
        <div className={classes.congrats}>
          {rypeCount != null && (
            <>
              <span className={classes.congratsEmoji}>🎉</span>
              Gratulerer! Du har nå skutt {rypeCount} {rypeCount === 1 ? 'rype' : 'ryper'}!
            </>
          )}
        </div>
      </div>
    </div>
  )
}
