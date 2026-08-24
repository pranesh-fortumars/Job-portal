import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, increment, serverTimestamp } from "firebase/firestore";

export interface HeroBanner {
  id?: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  targetUrl: string;
  actionText?: string;
  active: boolean;
  order?: number;
  views?: number;
  clicks?: number;
  createdAt?: any;
  updatedAt?: any;
}

export const DEFAULT_BANNERS: HeroBanner[] = [
  {
    id: 'banner_1',
    title: 'Top MNC & Corporate Jobs Across India',
    subtitle: 'Apply for IT, Sales, Finance, HR & Software positions with 1-click',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    targetUrl: '/jobs',
    actionText: 'Explore Corporate Jobs',
    active: true,
    order: 1,
    views: 1240,
    clicks: 185
  },
  {
    id: 'banner_2',
    title: 'Retail Shop & Store Staff Vacancies',
    subtitle: 'Cashier, Sales Executives & Store Managers wanted in top retail brands',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
    targetUrl: '/jobs?category=retail',
    actionText: 'Find Retail Jobs',
    active: true,
    order: 2,
    views: 980,
    clicks: 142
  },
  {
    id: 'banner_3',
    title: 'Skilled Factory & Daily Wage Opportunities',
    subtitle: 'Machine Operators, Technicians, Logistics & Artisans across India',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
    targetUrl: '/jobs?category=Worker',
    actionText: 'Browse Worker Jobs',
    active: true,
    order: 3,
    views: 1530,
    clicks: 230
  }
];

export async function fetchAllBanners(db: Firestore): Promise<HeroBanner[]> {
  try {
    const bannersRef = collection(db, "Banners");
    const q = query(bannersRef, orderBy("order", "asc"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as HeroBanner));
    }
  } catch (error) {
    console.warn("[Slider Service] Firestore fetch error, returning default banners:", error);
  }
  return DEFAULT_BANNERS;
}

export async function createBanner(db: Firestore, banner: Omit<HeroBanner, 'id'>): Promise<string> {
  const bannersRef = collection(db, "Banners");
  const docRef = await addDoc(bannersRef, {
    ...banner,
    views: 0,
    clicks: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateBanner(db: Firestore, bannerId: string, banner: Partial<HeroBanner>): Promise<void> {
  const bannerRef = doc(db, "Banners", bannerId);
  await updateDoc(bannerRef, {
    ...banner,
    updatedAt: serverTimestamp()
  });
}

export async function deleteBanner(db: Firestore, bannerId: string): Promise<void> {
  const bannerRef = doc(db, "Banners", bannerId);
  await deleteDoc(bannerRef);
}

export async function recordBannerView(db: Firestore, bannerId: string): Promise<void> {
  if (!bannerId || bannerId.startsWith('banner_')) return;
  try {
    const bannerRef = doc(db, "Banners", bannerId);
    await updateDoc(bannerRef, { views: increment(1) });
  } catch (e) {
    // Silent catch if offline or permission restriction
  }
}

export async function recordBannerClick(db: Firestore, bannerId: string): Promise<void> {
  if (!bannerId || bannerId.startsWith('banner_')) return;
  try {
    const bannerRef = doc(db, "Banners", bannerId);
    await updateDoc(bannerRef, { clicks: increment(1) });
  } catch (e) {
    // Silent catch if offline or permission restriction
  }
}
