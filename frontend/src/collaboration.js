import { IndexeddbPersistence } from 'y-indexeddb'
import * as Y from 'yjs'

const workspaceName = 'crdt-spreadsheet-workspace-v1'

export function openWorkspace() {
  const doc = new Y.Doc()
  const persistence = new IndexeddbPersistence(workspaceName, doc)
  const channel =
    typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(workspaceName)

  function broadcast(update, origin) {
    if (origin !== channel && origin !== persistence) {
      channel?.postMessage({ update })
    }
  }

  if (channel) {
    channel.onmessage = ({ data }) => {
      if (data.vector instanceof Uint8Array) {
        channel.postMessage({ update: Y.encodeStateAsUpdate(doc, data.vector) })
      } else if (data.update instanceof Uint8Array) {
        Y.applyUpdate(doc, data.update, channel)
      }
    }
    doc.on('update', broadcast)
  }

  let timeout
  const storageTimeout = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error('IndexedDB unavailable')), 8000)
  })
  const ready = Promise.race([persistence.whenSynced, storageTimeout])
    .then(() => {
      channel?.postMessage({ vector: Y.encodeStateVector(doc) })
    })
    .finally(() => clearTimeout(timeout))

  return {
    doc,
    ready,
    close() {
      clearTimeout(timeout)
      channel?.close()
      doc.off('update', broadcast)
      doc.destroy()
    },
  }
}
