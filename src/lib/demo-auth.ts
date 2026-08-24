import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Firestore, doc, setDoc, getDoc, collection, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { 
  DEMO_CREDENTIALS, 
  DEMO_USERS_DATA, 
  DEMO_SEEKER_PROFILES, 
  DEMO_JOBS_LIST, 
  DEMO_APPLICATIONS_LIST, 
  DEMO_DESIGNATIONS_LIST 
} from './mock-data';

export type DemoRoleKey = keyof typeof DEMO_CREDENTIALS;

export async function seedFirestoreMockData(db: Firestore, currentUids?: { employerUid?: string; workerUid?: string; staffUid?: string }) {
  try {
    console.log("[Demo Seeder] Initializing Firestore mock dataset...");
    const batch = writeBatch(db);

    // 1. Seed Master Designations
    for (const des of DEMO_DESIGNATIONS_LIST) {
      const desRef = doc(db, "Designations", des.name.replace(/[^a-zA-Z0-9]/g, '_'));
      batch.set(desRef, { ...des, updatedAt: serverTimestamp() }, { merge: true });
    }

    // 2. Seed Demo Jobs
    const empUid = currentUids?.employerUid || 'demo_employer_id';
    for (const job of DEMO_JOBS_LIST) {
      const jobDocRef = doc(db, "Jobs", job.jobId!);
      batch.set(jobDocRef, {
        ...job,
        employerId: job.companyName?.includes('Royal Exports') ? empUid : 'other_employer_id',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    // 3. Seed Demo Applications
    const workerUid = currentUids?.workerUid || 'demo_worker_id';
    const staffUid = currentUids?.staffUid || 'demo_staff_id';

    for (const app of DEMO_APPLICATIONS_LIST) {
      const appDocRef = doc(db, "Applications", app.applicationId!);
      const seekerId = app.jobCategory === 'Worker' ? workerUid : staffUid;
      batch.set(appDocRef, {
        ...app,
        jobSeekerId: seekerId,
        employerId: empUid,
        appliedAt: serverTimestamp(),
      }, { merge: true });
    }

    await batch.commit();
    console.log("[Demo Seeder] Successfully seeded Jobs, Designations, and Applications into Firestore.");
  } catch (error) {
    console.error("[Demo Seeder Error]", error);
  }
}

export async function loginAsDemoUser(
  roleKey: DemoRoleKey, 
  auth: Auth, 
  db: Firestore
): Promise<{ success: boolean; redirectUrl: string; userRole: string; message?: string }> {
  const creds = DEMO_CREDENTIALS[roleKey];
  const userData = DEMO_USERS_DATA[roleKey];

  if (!creds || !userData) {
    throw new Error(`Invalid demo role key: ${roleKey}`);
  }

  let firebaseUser: any = null;

  try {
    // 1. Attempt login with pre-configured email & password
    const userCred = await signInWithEmailAndPassword(auth, creds.email, creds.password);
    firebaseUser = userCred.user;
  } catch (authError: any) {
    console.log(`[Demo Auth] Sign-in failed (${authError.code}). Attempting account creation...`);
    
    // 2. If user doesn't exist, create user automatically
    if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential' || authError.code === 'auth/invalid-email') {
      try {
        const newCred = await createUserWithEmailAndPassword(auth, creds.email, creds.password);
        firebaseUser = newCred.user;
      } catch (createError: any) {
        console.error("[Demo Auth Creation Error]", createError);
        throw new Error(`Failed to create demo account: ${createError.message}`);
      }
    } else {
      throw authError;
    }
  }

  if (!firebaseUser) {
    throw new Error("Failed to authenticate demo user.");
  }

  // 3. Sync User Profile in Firestore `Users` collection
  const uid = firebaseUser.uid;
  const userRef = doc(db, "Users", uid);

  const fullUserData = {
    ...userData,
    uid: uid,
    email: creds.email,
    phone: creds.formattedPhone,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, fullUserData, { merge: true });

  // 4. Create JobSeekerProfiles if Seeker
  if (userData.role === 'job_seeker') {
    const seekerType = roleKey === 'worker' ? 'worker' : 'staff';
    const profileData = DEMO_SEEKER_PROFILES[seekerType];
    const profileRef = doc(db, "JobSeekerProfiles", uid);
    await setDoc(profileRef, {
      ...profileData,
      userId: uid,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  // 5. Seed general mock data (Jobs, Designations, Applications) into Firestore
  const uidsMapping: any = {};
  if (roleKey === 'employer') uidsMapping.employerUid = uid;
  if (roleKey === 'worker') uidsMapping.workerUid = uid;
  if (roleKey === 'staff') uidsMapping.staffUid = uid;

  await seedFirestoreMockData(db, uidsMapping);

  // 6. Set local storage demo simulation states
  localStorage.setItem('sim_is_logged_in', 'true');
  localStorage.setItem('sim_user_role', userData.role!);

  // 7. Compute destination route
  let redirectUrl = '/seeker/dashboard';
  if (userData.role === 'admin') {
    redirectUrl = '/admin/dashboard';
  } else if (userData.role === 'employer') {
    redirectUrl = '/employer/dashboard';
  } else {
    redirectUrl = '/seeker/dashboard';
  }

  return {
    success: true,
    redirectUrl,
    userRole: userData.role!,
    message: `Logged in as Demo ${roleKey.toUpperCase()}`
  };
}
