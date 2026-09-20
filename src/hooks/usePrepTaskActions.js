import { push, ref, update } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

// Fan-out create/edit/delete for prep tasks in a personal list
// (`prepLists/{uid}/{year}/items`) that can be assigned to other users too.
// The logged-in user is always included as an assignee. Each assignee gets
// their own copy of the item (same id, same content) at their own
// `prepLists/{uid}/{year}/items/{id}`, so each can toggle `checked`
// independently. Only the creator (`addedBy`) may edit or remove a task —
// enforced here and in database.rules.json.
export function usePrepTaskActions(year) {
  const { user } = useAuth()

  function addTask({ name, dueDate, assignedTo, assignedToName }) {
    const targets = Array.from(new Set([user.uid, ...(assignedTo || [])]))
    const id = push(ref(db, 'prepLists')).key
    const payload = {
      name: name.trim(),
      checked: false,
      createdAt: Date.now(),
      addedBy: user.uid,
      addedByName: user.displayName ?? null,
      dueDate,
      assignedTo: targets,
      assignedToName: assignedToName ?? null,
    }
    const updates = {}
    targets.forEach((uid) => {
      updates[`prepLists/${uid}/${year}/items/${id}`] = payload
    })
    return update(ref(db), updates)
  }

  // `item` is the existing task (as read from the current user's own list),
  // `values` is the new { name, dueDate, assignedTo, assignedToName }.
  function editTask(item, { name, dueDate, assignedTo, assignedToName }) {
    const oldTargets = Array.isArray(item.assignedTo) ? item.assignedTo : [item.assignedTo].filter(Boolean)
    const newTargets = Array.from(new Set([user.uid, ...(assignedTo || [])]))
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
        updates[`${base}/assignedTo`] = newTargets
        updates[`${base}/assignedToName`] = assignedToName ?? null
      } else {
        updates[base] = {
          name: name.trim(),
          checked: false,
          createdAt: item.createdAt ?? Date.now(),
          addedBy: item.addedBy ?? user.uid,
          addedByName: item.addedByName ?? null,
          dueDate: dueDate ?? null,
          assignedTo: newTargets,
          assignedToName: assignedToName ?? null,
        }
      }
    })
    return update(ref(db), updates)
  }

  function removeTask(item) {
    const targets = Array.isArray(item.assignedTo) ? item.assignedTo : [item.assignedTo].filter(Boolean)
    const updates = {}
    ;(targets.length > 0 ? targets : [user.uid]).forEach((uid) => {
      updates[`prepLists/${uid}/${year}/items/${item.id}`] = null
    })
    return update(ref(db), updates)
  }

  return { addTask, editTask, removeTask }
}
