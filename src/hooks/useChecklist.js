import { useEffect, useState } from 'react'
import { get, onValue, ref, update } from 'firebase/database'
import { db } from '../firebase'
import { useItemList } from './useItemList'

// A checklist for a given year/user, with the ability to import a starting
// set of items from a shared template list once.
export function useChecklist(basePath, templatePath) {
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
      const updates = {}
      Object.entries(templateItems).forEach(([id, item]) => {
        updates[`${basePath}/items/${id}`] = {
          name: item.name,
          checked: false,
          createdAt: Date.now(),
          addedBy: item.addedBy ?? null,
          addedByName: item.addedByName ?? null,
          fromTemplate: true,
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
