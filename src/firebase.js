import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getFirestore,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
];

export const firebaseEnabled = requiredKeys.every(Boolean);

export const app = firebaseEnabled ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

const googleProvider = auth ? new GoogleAuthProvider() : null;
const travelPlansCollection = db ? collection(db, "travelPlans") : null;

if (app && typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch(() => null);
}

function snapshotToPlan(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

function mergePlanLists(ownerPlans, editorPlans) {
  const merged = new Map();

  [...ownerPlans, ...editorPlans].forEach((plan) => {
    merged.set(plan.id, plan);
  });

  return [...merged.values()].sort((a, b) => {
    const aTime = a.updatedAt?.seconds || 0;
    const bTime = b.updatedAt?.seconds || 0;
    return bTime - aTime;
  });
}

export function subscribeToAuthState(onChange) {
  if (!auth) {
    onChange(null);
    return () => {};
  }

  return onAuthStateChanged(auth, onChange);
}

export function signInWithGoogle() {
  if (!auth || !googleProvider) {
    return Promise.reject(new Error("Firebase Auth is not configured"));
  }

  return signInWithPopup(auth, googleProvider);
}

export function signInWithEmail(email, password) {
  if (!auth) {
    return Promise.reject(new Error("Firebase Auth is not configured"));
  }

  return signInWithEmailAndPassword(auth, email, password);
}

export function signUpWithEmail(email, password) {
  if (!auth) {
    return Promise.reject(new Error("Firebase Auth is not configured"));
  }

  return createUserWithEmailAndPassword(auth, email, password);
}

export function resetPassword(email) {
  if (!auth) {
    return Promise.reject(new Error("Firebase Auth is not configured"));
  }

  return sendPasswordResetEmail(auth, email);
}

export function signOutUser() {
  if (!auth) {
    return Promise.reject(new Error("Firebase Auth is not configured"));
  }

  return signOut(auth);
}

export function subscribeToEditablePlans(uid, email, onData, onError) {
  if (!travelPlansCollection || !uid) {
    onData([]);
    return () => {};
  }

  const ownerQuery = query(travelPlansCollection, where("ownerUid", "==", uid));
  const editorQuery = email
    ? query(travelPlansCollection, where("editorEmails", "array-contains", email))
    : null;

  let ownerPlans = [];
  let editorPlans = [];

  const emit = () => {
    onData(mergePlanLists(ownerPlans, editorPlans));
  };

  const unsubscribeOwner = onSnapshot(
    ownerQuery,
    (snapshot) => {
      ownerPlans = snapshot.docs.map(snapshotToPlan);
      emit();
    },
    onError,
  );

  const unsubscribeEditor = editorQuery
    ? onSnapshot(
        editorQuery,
        (snapshot) => {
          editorPlans = snapshot.docs.map(snapshotToPlan);
          emit();
        },
        onError,
      )
    : () => {};

  return () => {
    unsubscribeOwner();
    unsubscribeEditor();
  };
}

export function subscribeToPlans(uid, email, onData, onError) {
  return subscribeToEditablePlans(uid, email, onData, onError);
}

export function subscribeToPublicPlanByShareId(shareId, onData, onError) {
  if (!travelPlansCollection || !shareId) {
    onData(null);
    return () => {};
  }

  const sharedQuery = query(
    travelPlansCollection,
    where("shareId", "==", shareId),
    where("published", "==", true),
    limit(1),
  );

  return onSnapshot(
    sharedQuery,
    (snapshot) => {
      const first = snapshot.docs[0];
      onData(first ? snapshotToPlan(first) : null);
    },
    onError,
  );
}

export function buildShareId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function createTravelPlan(uid, plan) {
  if (!travelPlansCollection || !uid) {
    throw new Error("Firebase Firestore is not configured");
  }

  const planRef = doc(travelPlansCollection);
  const shareId = plan.shareId || buildShareId();

  await setDoc(planRef, {
    ...plan,
    ownerUid: uid,
    ownerEmail: plan.ownerEmail || "",
    editorEmails: Array.isArray(plan.editorEmails) ? [...new Set(plan.editorEmails)] : [],
    published: plan.published ?? true,
    shareId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return planRef.id;
}

export async function savePlan(planId, plan) {
  if (!db || !planId) {
    throw new Error("Firebase Firestore is not configured");
  }

  await setDoc(
    doc(db, "travelPlans", planId),
    {
      ...plan,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function savePlans(uid, plans) {
  if (!uid || !Array.isArray(plans)) {
    return;
  }

  await Promise.all(
    plans.map((plan) => {
      const normalized = {
        ...plan,
        ownerUid: plan.ownerUid || uid,
        ownerEmail: plan.ownerEmail || "",
        editorEmails: Array.isArray(plan.editorEmails) ? [...new Set(plan.editorEmails)] : [],
        published: plan.published ?? true,
        shareId: plan.shareId || buildShareId(),
      };

      return savePlan(normalized.id, normalized);
    }),
  );
}
