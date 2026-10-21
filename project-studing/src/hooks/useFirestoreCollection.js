import { useEffect, useState } from 'react'
import { collection, onSnapshot, query as buildQuery } from 'firebase/firestore'
import { db } from '../firebase.js'

const EMPTY_CONSTRAINTS = []

export default function useFirestoreCollection(collectionName, fallback = [], useFallbackWhenEmpty = false, enabled = true, constraints = EMPTY_CONSTRAINTS) {
  const [snapshotState, setSnapshotState] = useState({
    collectionName: null,
    documents: fallback,
    error: null,
    loaded: false,
  })

  useEffect(() => {
    if (!enabled) return undefined

    const loadTimeout = setTimeout(() => {
      console.error(`Timed out while loading Firestore collection "${collectionName}".`)
      setSnapshotState((current) => current.collectionName === collectionName && current.loaded
        ? current
        : {
            collectionName,
            documents: [],
            error: new Error(`Timed out while loading Firestore collection "${collectionName}".`),
            loaded: true,
          })
    }, 10000)
    const source = constraints.length
      ? buildQuery(collection(db, collectionName), ...constraints)
      : collection(db, collectionName)
    const unsubscribe = onSnapshot(
      source,
      (snapshot) => {
        clearTimeout(loadTimeout)
        const nextDocuments = snapshot.docs.map((document) => ({
          ...document.data(),
          id: document.id,
        }))
        setSnapshotState({
          collectionName,
          documents: nextDocuments.length === 0 && useFallbackWhenEmpty ? fallback : nextDocuments,
          error: null,
          loaded: true,
        })
      },
      (snapshotError) => {
        clearTimeout(loadTimeout)
        console.error(`Could not load Firestore collection "${collectionName}".`, snapshotError)
        setSnapshotState({
          collectionName,
          documents: useFallbackWhenEmpty ? fallback : [],
          error: snapshotError,
          loaded: true,
        })
      },
    )

    return () => {
      clearTimeout(loadTimeout)
      unsubscribe()
    }
  }, [collectionName, constraints, enabled, fallback, useFallbackWhenEmpty])

  const isCurrentCollection = snapshotState.collectionName === collectionName

  return {
    documents: enabled && isCurrentCollection ? snapshotState.documents : fallback,
    error: enabled && isCurrentCollection ? snapshotState.error : null,
    loading: enabled && (!isCurrentCollection || !snapshotState.loaded),
  }
}
