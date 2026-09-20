import { push, ref, update } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

// Fan-out create/edit/delete for prep tasks in a personal list
// (`prepLists/{uid}/{year}/items`) that can be assigned to other users too.
// `assignedTo` on the stored item is the *true* assignment (only the people
// actually picked, defaulting to just the creator when left empty) — it can
// leave the creator out entirely. The creator still always gets their own
// copy in `prepLists/{creator}/...` regardless, so they can see and manage
// (edit/remove) what they've assigned even when it's not assigned to them;
// PrepChecklist tells the two apart by checking whether the creator's own
// uid is in `assignedTo`. Each assignee's copy has its own `checked` state,
// toggled independently. Only the creator (`addedBy`) may edit or remove a
// task — enforced here and in database.rules.json.
export function usePrepTaskActions(year) {
  const { user } = useAuth()

  function addTask({ name, dueDate, assignedTo, assignedToName }) {
    const selected = assignedTo && assignedTo.length > 0 ? assignedTo : [user.uid]
    const fanOutTargets = Array.from(new Set([user.uid, ...selected]))
    const id = push(ref(db, 'prepLists')).key
    const payload = {
      name: name.trim(),
      checked: false,
      createdAt: Date.now(),
      addedBy: user.uid,
      addedByName: user.displayName ?? null,
      dueDate,
      assignedTo: selected,
      assignedToName: assignedToName ?? null,
    }
    const updates = {}
    fanOutTargets.forEach((uid) => {
      updates[`prepLists/${uid}/${year}/items/${id}`] = payload
    })
    return update(ref(db), updates)
  }

  // `item` is the existing task (as read from the current user's own list),
  // `values` is the new { name, dueDate, assignedTo, assignedToName }.
  function editTask(item, { name, dueDate, assignedTo, assignedToName }) {
    const selected = assignedTo && assignedTo.length > 0 ? assignedTo : [user.uid]
    // "ALL" is a display-only sentinel meaning "everyone" on a
    // template-imported task, not a real uid to fan out writes to — the item
    // only actually exists in the current user's own list, so it's treated
    // as if they were the one real "old" target.
    const oldAssigned = (Array.isArray(item.assignedTo) ? item.assignedTo : [item.assignedTo].filter(Boolean)).map(
      (uid) => (uid === 'ALL' ? user.uid : uid),
    )
    // Only the creator can reach editTask (see PrepChecklist's canEdit), and
    // they always keep their own copy regardless of whether they're
    // themselves assigned — same as addTask.
    const oldTargets = Array.from(new Set([user.uid, ...oldAssigned]))
    const newTargets = Array.from(new Set([user.uid, ...selected]))
    const updates = {}
    oldTargets.forEach((uid) => {
      if (!newTargets.includes(uid)) updates[`prepLists/${uid}/${year}/items/${item.id}`] = null
    })
    newTargets.forEach((uid) => {
      const base = `prepLists/${uid}/${year}/items/${item.id}`
      if (oldTargets.includes(uid)) {
        // Existing copy: only touch the shared fields, so this assignee's
        // own checked/checkedBy state survives the edit.
        updates[`${base}/name`] = name.trim()
        updates[`${base}/dueDate`] = dueDate ?? null
        updates[`${base}/assignedTo`] = selected
        updates[`${base}/assignedToName`] = assignedToName ?? null
      } else {
        updates[base] = {
          name: name.trim(),
          checked: false,
          createdAt: item.createdAt ?? Date.now(),
          addedBy: item.addedBy ?? user.uid,
          addedByName: item.addedByName ?? null,
          dueDate: dueDate ?? null,
          assignedTo: selected,
          assignedToName: assignedToName ?? null,
        }
      }
    })
    return update(ref(db), updates)
  }

  function removeTask(item) {
    // "ALL" is a display-only sentinel (see editTask) — resolves to the
    // creator's own copy, the only one that actually exists for it.
    const assigned = (Array.isArray(item.assignedTo) ? item.assignedTo : [item.assignedTo].filter(Boolean)).map(
      (uid) => (uid === 'ALL' ? user.uid : uid),
    )
    // The creator always has their own copy too (see addTask), whether or
    // not they're actually assigned to the task.
    const targets = Array.from(new Set([item.addedBy ?? user.uid, ...assigned]))
    const updates = {}
    targets.forEach((uid) => {
      updates[`prepLists/${uid}/${year}/items/${item.id}`] = null
    })
    return update(ref(db), updates)
  }

  return { addTask, editTask, removeTask }
}
