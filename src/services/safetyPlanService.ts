import { db, doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "../firebase";
import { SafetyPlan } from "../types";
import { cryptoService } from "./cryptoService";

const COLLECTION_NAME = "safetyPlans";

export const saveSafetyPlan = async (uid: string, plan: Omit<SafetyPlan, 'uid' | 'lastUpdated'>) => {
  const planRef = doc(db, COLLECTION_NAME, uid);
  
  // Encrypt sensitive fields before saving
  const encryptedPlan = {
    ...plan,
    warningSigns: cryptoService.encrypt(JSON.stringify(plan.warningSigns)),
    copingStrategies: cryptoService.encrypt(JSON.stringify(plan.copingStrategies)),
    supportContacts: cryptoService.encrypt(JSON.stringify(plan.supportContacts)),
    environmentSafety: cryptoService.encrypt(plan.environmentSafety),
    lastUpdated: serverTimestamp(),
  };

  await setDoc(planRef, encryptedPlan, { merge: true });
};

export const getSafetyPlan = async (uid: string): Promise<SafetyPlan | null> => {
  const planRef = doc(db, COLLECTION_NAME, uid);
  const docSnapshot = await getDoc(planRef);

  if (!docSnapshot.exists()) return null;

  const data = docSnapshot.data();
  
  // Decrypt sensitive fields
  return {
    uid,
    warningSigns: data.warningSigns ? JSON.parse(cryptoService.decrypt(data.warningSigns)) : [],
    copingStrategies: data.copingStrategies ? JSON.parse(cryptoService.decrypt(data.copingStrategies)) : [],
    supportContacts: data.supportContacts ? JSON.parse(cryptoService.decrypt(data.supportContacts)) : [],
    environmentSafety: data.environmentSafety ? cryptoService.decrypt(data.environmentSafety) : "",
    lastUpdated: data.lastUpdated ? data.lastUpdated.toDate() : new Date(),
    sharedWithCaseManager: data.sharedWithCaseManager || false,
  };
};

export const subscribeSafetyPlan = (uid: string, callback: (plan: SafetyPlan | null) => void, onError: (error: any) => void) => {
  const planRef = doc(db, COLLECTION_NAME, uid);
  return onSnapshot(planRef, (docSnapshot) => {
    if (!docSnapshot.exists()) {
      callback(null);
      return;
    }
    const data = docSnapshot.data();
    // Decrypt sensitive fields
    try {
      const plan: SafetyPlan = {
        uid,
        warningSigns: data.warningSigns ? JSON.parse(cryptoService.decrypt(data.warningSigns)) : [],
        copingStrategies: data.copingStrategies ? JSON.parse(cryptoService.decrypt(data.copingStrategies)) : [],
        supportContacts: data.supportContacts ? JSON.parse(cryptoService.decrypt(data.supportContacts)) : [],
        environmentSafety: data.environmentSafety ? cryptoService.decrypt(data.environmentSafety) : "",
        lastUpdated: data.lastUpdated ? data.lastUpdated.toDate() : new Date(),
        sharedWithCaseManager: data.sharedWithCaseManager || false,
      };
      callback(plan);
    } catch (e) {
      onError(e);
    }
  }, onError);
};
