import { db, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "../firebase";
import { StopSmokingLog } from "../types";

export const logSmokingEvent = async (uid: string, intensity: number, nrtUsed: boolean) => {
  return await addDoc(collection(db, "stopSmokingLogs"), {
    uid,
    intensity,
    nrtUsed,
    timestamp: serverTimestamp(),
  });
};

export const subscribeSmokingLogs = (uid: string, callback: (logs: any[]) => void, onError: (error: any) => void) => {
  const logsQuery = query(
    collection(db, "stopSmokingLogs"),
    where("uid", "==", uid),
    orderBy("timestamp", "desc")
  );

  return onSnapshot(logsQuery, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(logs);
  }, onError);
};
