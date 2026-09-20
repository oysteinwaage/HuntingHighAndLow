import { useEffect, useState } from 'react'
import { get, onValue, ref, update } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useItemList } from './useItemList'

// A checklist for a given year/user, with the ability to import a starting
// set of items from a shared template list once.
//
// `dueDateYear`, if given, is used to turn a template item's day/month-only
// `dueDate` (e.g. "09-18") into a full date (e.g. "2026-09-18") on import,
// since the template has no year of its own but items in a yearly list do.
//
// `filterAssignee`, if true, only imports template items assigned to the
// current user or to "ALL" (everyone) — used for personal lists like
// Forberedelser where the shared template can target specific people.
// `assignedTo` on an item is an array of uids (or ["ALL"]); a bare string is
// also accepted for items saved before assignment supported multiple users.
function isAssignedTo(item, uid) {
  const assignedTo = item.assignedTo
  if (assignedTo == null) return false
  const list = Array.isArray(assignedTo) ? assignedTo : [assignedTo]
  return list.includes('ALL') || list.includes(uid)
}

export function useChecklist(basePath, templatePath, { dueDateYear, filterAssignee } = {}) {
  const { user } = useAuth()
  const list = useItemList(basePath)
  const [templateImported, setTemplateImported] = useState(false)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    if (!basePath) return
    const metaRef = ref(db, `${basePath}/meta/templateImported`)
    return onValue(metaRef, (snapshot) => {
      setTemplateImported(Boolean(snapshot.val()))
    })
  }, [basePath])

  async function importFromTemplate() {
    setImporting(true)
    try {
      const templateSnapshot = await get(ref(db, `${templatePath}/items`))
      const templateItems = templateSnapshot.val() || {}
      // Imported items are written under the template item's own id, so a
      // template item already present in the list (previously imported, or
      // just never removed) is skipped instead of being re-imported on top
      // of itself.
      const alreadyImportedIds = new Set(list.items.map((item) => item.id))
      const updates = {}
      Object.entries(templateItems).forEach(([id, item]) => {
        if (alreadyImportedIds.has(id)) return
        if (filterAssignee && !isAssignedTo(item, user?.uid)) return
        let dueDate = item.dueDate
        if (dueDate !== undefined && dueDateYear && /^\d{2}-\d{2}$/.test(dueDate)) {
          dueDate = `${dueDateYear}-${dueDate}`
        }
        updates[`${basePath}/items/${id}`] = {
          name: item.name,
          checked: false,
          createdAt: Date.now(),
          // Owned by the importing user in their own list, not the
          // template's original author, so they can edit/remove their copy
          // (e.g. of an "Alle" task) like anything else in their own list.
          addedBy: user?.uid ?? null,
          addedByName: user?.displayName ?? null,
          fromTemplate: true,
          ...(dueDate !== undefined ? { dueDate } : {}),
          ...(item.assignedTo !== undefined
            ? { assignedTo: item.assignedTo, assignedToName: item.assignedToName ?? null }
            : {}),
        }
      })
      updates[`${basePath}/meta/templateImported`] = true
      await update(ref(db), updates)
    } finally {
      setImporting(false)
    }
  }

  return { ...list, templateImported, importing, importFromTemplate }
}
