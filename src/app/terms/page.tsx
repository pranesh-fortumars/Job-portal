"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  ShieldCheck, 
  Scale, 
  ArrowLeft, 
  Building2, 
  Zap, 
  Ban, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock,
  Gavel,
  CreditCard,
  Navigation,
  Languages,
  AlertCircle,
  CheckCircle2,
  User,
  RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

export default function TermsOfServicePage() {
  const { language, t } = useLanguage();
  const router = useRouter();

  const content = {
    English: {
      title: "Terms of Service",
      effectiveDate: "Effective June 2026",
      intro: {
        title: "Introduction",
        desc: "By registering or using NexTirupur.in, you agree to these Terms. If you disagree, please do not use the Platform."
      },
      sections: [
        {
          id: "1",
          title: "The Platform",
          desc: "NexTirupur.in is a trilingual (English, Tamil, Hindi) job portal connecting employers and workers in Tirupur's garment and knitwear industry.",
          features: ["Verified listings", "GPS radius matching", "Auto-broadcast job alerts", "Tamil-language interface"],
          warning: "NexTirupur.in is a communication and matching platform only — not a recruitment agency or party to any employment contract."
        },
        {
          id: "2",
          title: "Eligibility and Registration",
          points: [
            "You must be 18 or older and legally permitted to work or operate a business in India.",
            "Employers must hold valid business registration and relevant licences. GST registration details must be accurate where applicable.",
            "You must provide truthful information at registration and keep it current. One account per person or entity.",
            "Manual registration assistance may be provided for eligible users; users remain responsible for accuracy of information provided.",
            "NexTirupur.in may verify eligibility at any time and suspend accounts that do not comply."
          ]
        },
        {
          id: "3",
          title: "Employer Responsibilities",
          points: [
            "Listings must accurately describe role, salary/wages, location, hours, and requirements. Misrepresentation is grounds for immediate removal.",
            "All listings must comply with Indian labour law including Factories Act 1948, Minimum Wages Act 1948, and applicable state amendments.",
            "Discrimination based on caste, religion, gender, disability, or other protected characteristics is prohibited.",
            "Employers must not charge workers any fee, deposit, or commission for employment obtained through the Platform.",
            "Worker data shared through the Platform may only be used for genuine recruitment."
          ]
        },
        {
          id: "4",
          title: "Worker Responsibilities",
          points: [
            "Worker profiles must contain truthful information including skills, experience, and availability.",
            "No false certifications or fabricated references.",
            "When workers apply or respond to broadcast alerts, profiles may be shared with relevant employers.",
            "Workers must not misrepresent themselves during interviews or hiring process.",
            "Workers must not solicit payments from employers."
          ]
        },
        {
          id: "5",
          title: "Subscription Plans and Payments",
          table: [
            { name: "Single", price: "₹400", features: "1 listing • 15 days active • All Premium Features" },
            { name: "Starter", price: "₹999", features: "3 listings • 15 days active • All Premium Features" },
            { name: "Growth", price: "₹1,499", features: "5 listings • 15 days active • All Premium Features" },
            { name: "Volume", price: "₹2,499", features: "10 listings • 15 days active • All Premium Features" }
          ],
          paymentRules: [
            "All prices are exclusive of GST and GST is added at the prevailing rate.",
            "Payments are due fully in advance.",
            "Features activate after successful payment.",
            "Plans do not auto-renew.",
            "Expiry reminders will be provided."
          ],
          refundRules: [
            "Fees are non-refundable once listing is published or paid feature is activated.",
            "Refunds are considered only for duplicate payments or complete technical failure.",
            "Refund requests must be submitted within 5 business days to nextirupur@gmail.com.",
            "Approved refunds are processed within 7–10 business days."
          ]
        },
        {
          id: "6",
          title: "Auto-Broadcast and GPS Features",
          broadcast: {
            title: "Broadcast Alerts",
            points: [
              "Auto-broadcast sends listings to matching workers through WhatsApp or in-app notifications.",
              "Reach or response rates are not guaranteed.",
              "Workers receive broadcasts only if they opted in during registration.",
              "Workers can opt out anytime through notification settings or by texting STOP."
            ]
          },
          gps: {
            title: "GPS Matching",
            points: [
              "GPS radius matching uses device location or registered address.",
              "Accuracy depends on device and network conditions.",
              "Location data is used only for matching purposes.",
              "Location data is not sold to third parties."
            ]
          }
        },
        {
          id: "7",
          title: "Prohibited Activities",
          intro: "The following are strictly prohibited:",
          points: [
            "False, fraudulent, or misleading job listings or worker profiles.",
            "Forced labour, bonded labour, child labour, or human trafficking.",
            "Scraping, harvesting, or misuse of user personal data.",
            "Impersonation of any person, business, or organisation.",
            "Using bots, scripts, or automated tools to access platform data.",
            "Spam, phishing, malware, or illegal content."
          ],
          warning: "NexTirupur.in may remove violating content without notice and report serious violations to industrial law enforcement."
        },
        {
          id: "8",
          title: "Intellectual Property and Content",
          points: [
            "All Platform IP — design, software, logo, brand name “NexTirupur.in” — belongs to NexTirupur Services. You may not copy, reproduce, or create derivative works without prior written consent.",
            "By submitting content, you grant us a non-exclusive, royalty-free licence to use and display it for Platform operation and marketing purposes."
          ],
          ownership: "You confirm that content you post is your own or that you have the right to post it and that it infringes no third-party rights."
        },
        {
          id: "9",
          title: "Privacy and Data Protection",
          points: [
            "NexTirupur collects personal data only to operate the Platform.",
            "Compliance with DPDP Act 2023 and IT Rules 2011.",
            "NexTirupur does not sell user data."
          ]
        },
        {
          id: "10",
          title: "Liability and Disclaimers",
          warning: "The Platform is provided “as is” without warranties of any kind. We do not warrant uninterrupted availability, the genuineness of any listing, or that any employment will result.",
          limitations: [
            "Our total aggregate liability for any claim shall not exceed the Subscription Fees you paid in the three months before the incident.",
            "We are not liable for indirect, consequential, or punitive damages, including loss of profit or data.",
            "We are not responsible for conduct of employers or workers, employment decisions, or disputes arising from hires made through the Platform."
          ],
          legalNote: "Nothing here limits liability for fraud or gross negligence, or any liability that cannot be limited under Indian law."
        },
        {
          id: "11",
          title: "Termination",
          points: [
            "You may close your account at any time by contacting us.",
            "We may suspend or terminate accounts immediately for violation of these Terms.",
            "On termination, active listings are removed.",
            "Sections 8, 9, 10, and 12 survive termination."
          ]
        },
        {
          id: "12",
          title: "Governing Law and Disputes",
          points: [
            "These Terms are governed by Indian law.",
            "Courts in Tirupur, Tamil Nadu have exclusive jurisdiction.",
            "Disputes are subject to negotiation, then arbitration in Tirupur.",
            "We may amend these Terms with 15 days' prior notice.",
            "English version prevails in case of any inconsistency."
          ]
        },
        {
          id: "13",
          title: "Contact and Grievances",
          ack: "Acknowledgment: Within 24 Hours",
          res: "Resolution Time: Within 30 days"
        }
      ]
    },
    Tamil: {
      title: "சேவை விதிமுறைகள்",
      effectiveDate: "ஜூன் 2026 முதல் நடைமுறைக்கு வருகிறது",
      intro: {
        title: "அறிமுகம்",
        desc: "NexTirupur.in இல் பதிவு செய்வதன் மூலம் அல்லது பயன்படுத்துவதன் மூலம், இந்த விதிமுறைகளை நீங்கள் ஏற்றுக்கொள்கிறீர்கள். உங்களுக்கு உடன்பாடு இல்லை என்றால், தயவுசெய்து இந்தத் தளத்தைப் பயன்படுத்த வேண்டாம்."
      },
      sections: [
        {
          id: "1",
          title: "இந்த தளம்",
          desc: "NexTirupur.in என்பது திருப்பூரின் ஆடை மற்றும் பின்னலாடைத் தொழிலில் முதலாளிகளையும் தொழிலாளர்களையும் இணைக்கும் ஒரு முமொழி (ஆங்கிலம், தமிழ், இந்தி) வேலைவாய்ப்பு போர்டல் ஆகும்.",
          features: ["சரிபார்க்கப்பட்ட பட்டியல்கள்", "ஜிபிஎஸ் தொலைவு பொருத்தம்", "தானியங்கி வாட்ஸ்அப் அறிவிப்புகள்", "தமிழ் மொழி இடைமுகம்"],
          warning: "NexTirupur.in என்பது ஒரு தகவல் தொடர்பு மற்றும் பொருத்தத் தளம் மட்டுமே - இது ஒரு வேலைவாய்ப்பு முகமை அல்ல."
        },
        {
          id: "2",
          title: "தகுதி மற்றும் பதிவு",
          points: [
            "நீங்கள் 18 வயது அல்லது அதற்கு மேற்பட்டவராக இருக்க வேண்டும் மற்றும் இந்தியாவில் பணிபுரிய சட்டப்பூர்வ அனுமதி பெற்றிருக்க வேண்டும்.",
            "முதலாளிகள் முறையான வணிகப் பதிவு மற்றும் உரிமங்களைக் கொண்டிருக்க வேண்டும். ஜிஎஸ்டி விவரங்கள் துல்லியமாக இருக்க வேண்டும்.",
            "பதிவு செய்யும் போது உண்மையான தகவல்களை வழங்க வேண்டும். ஒருவருக்கு ஒரு கணக்கு மட்டுமே அனுமதிக்கப்படும்.",
            "தகுதியுள்ள பயனர்களுக்கு பதிவு செய்ய உதவி வழங்கப்படும்; ஆனால் தகவலின் துல்லியத்திற்கு பயனர்களே பொறுப்பு.",
            "நெக்ஸ்டிருப்பூர் எந்த நேரத்திலும் தகுதியைச் சரிபார்க்கலாம் மற்றும் விதிகளுக்கு உட்படாத கணக்குகளை முடக்கலாம்."
          ]
        },
        {
          id: "3",
          title: "முதலாளிகளின் பொறுப்புகள்",
          points: [
            "பட்டியல்கள் வேலை, சம்பளம், இருப்பிடம் மற்றும் நேரத்தை துல்லியமாக விவரிக்க வேண்டும். தவறான தகவல் உடனடியாக நீக்கப்படும்.",
            "அனைத்து பட்டியல்களும் இந்திய தொழிலாளர் சட்டங்களுக்கு (Factories Act 1948 போன்றவை) உட்பட்டிருக்க வேண்டும்.",
            "சாதி, மதம், பாலினம் அல்லது ஊனம் அடிப்படையில் பாகுபாடு காட்டுவது தடைசெய்யப்பட்டுள்ளது.",
            "முதலாளிகள் தொழிலாளர்களிடமிருந்து வேலைக்காக எந்தவொரு பணமோ அல்லது கமிஷனோ வசூலிக்கக்கூடாது.",
            "பகிரப்படும் தொழிலாளர் தரவு உண்மையான ஆட்சேர்ப்புக்கு மட்டுமே பயன்படுத்தப்பட வேண்டும்."
          ]
        },
        {
          id: "4",
          title: "தொழிலாளர்களின் பொறுப்புகள்",
          points: [
            "தொழிலாளர் சுயவிவரங்கள் திறன்கள் மற்றும் அனுபவம் குறித்த உண்மையான தகவல்களைக் கொண்டிருக்க வேண்டும்.",
            "போலி சான்றிதழ்கள் அல்லது தவறான குறிப்புகள் இருக்கக்கூடாது.",
            "தொழிலாளர்கள் விண்ணப்பிக்கும்போது, அவர்களின் விவரங்கள் சம்பந்தப்பட்ட முதலாளிகளுடன் பகிரப்படும்.",
            "நேர்முகத் தேர்வின் போது தொழிலாளர்கள் தங்களை தவறாகச் சித்தரிக்கக் கூடாது.",
            "தொழிலாளர்கள் முதலாளிகளிடமிருந்து எந்தவொரு பணத்தையும் கோரக்கூடாது."
          ]
        },
        {
          id: "5",
          title: "சந்தா திட்டங்கள் மற்றும் கட்டணங்கள்",
          table: [
            { name: "Single", price: "₹400", features: "1 பதிவு • 15 நாட்கள் • அனைத்து பிரீமியம் வசதிகள்" },
            { name: "Starter", price: "₹999", features: "3 பதிவுகள் • 15 நாட்கள் • அனைத்து பிரீமியம் வசதிகள்" },
            { name: "Growth", price: "₹1,499", features: "5 பதிவுகள் • 15 நாட்கள் • அனைத்து பிரீமியம் வசதிகள்" },
            { name: "Volume", price: "₹2,499", features: "10 பதிவுகள் • 15 நாட்கள் • அனைத்து பிரீமியம் வசதிகள்" }
          ],
          paymentRules: [
            "அனைத்து விலைகளும் ஜிஎஸ்டி நீங்கலாக; ஜிஎஸ்டி கூடுதலாக வசூலிக்கப்படும்.",
            "கட்டணம் முழுமையாக முன்னதாகவே செலுத்தப்பட வேண்டும்.",
            "வெற்றிகரமான கட்டணத்திற்குப் பிறகு வசதிகள் செயல்படும்.",
            "திட்டங்கள் தானாக புதுப்பிக்கப்படாது.",
            "காலாவதி நினைவூட்டல்கள் வழங்கப்படும்."
          ],
          refundRules: [
            "வேலை பதிவு வெளியிடப்பட்ட பிறகு கட்டணம் திரும்பப் பெறப்படாது.",
            "இரட்டைப் பணம் செலுத்துதல் அல்லது தொழில்நுட்பக் கோளாறு ஏற்பட்டால் மட்டுமே ரீஃபண்ட் பரிசீலிக்கப்படும்.",
            "கோரிக்கைகளை 5 வேலை நாட்களுக்குள் nextirupur@gmail.com க்கு அனுப்ப வேண்டும்.",
            "அனுமதிக்கப்பட்ட ரீஃபண்ட் 7–10 வேலை நாட்களுக்குள் வழங்கப்படும்."
          ]
        },
        {
          id: "6",
          title: "தானியங்கி அறிவிப்பு மற்றும் ஜிபிஎஸ் வசதிகள்",
          broadcast: {
            title: "ஒளிபரப்பு அறிவிப்புகள்",
            points: [
              "வாட்ஸ்அப் அல்லது ஆப்ஸ் அறிவிப்புகள் மூலம் தொழிலாளர்களுக்கு வேலைகள் அனுப்பப்படும்.",
              "பதிலளிப்பு விகிதங்களுக்கு உத்தரவாதம் இல்லை.",
              "பதிவின் போது ஒப்புதல் அளித்தவர்களுக்கு மட்டுமே அறிவிப்புகள் வரும்.",
              "பயனர்கள் எப்போது வேண்டுமானாலும் STOP என்று அனுப்பி விலகலாம்."
            ]
          },
          gps: {
            title: "ஜிபிஎஸ் பொருத்தம்",
            points: [
              "இருப்பிடம் சாதனத்தின் ஜிபிஎஸ் அல்லது பதிவு செய்யப்பட்ட முகவரியைப் பயன்படுத்தும்.",
              "துல்லியம் சாதனம் மற்றும் நெட்வொர்க்கைப் பொறுத்தது.",
              "இருப்பிடத் தரவு பொருத்தத்திற்கு மட்டுமே பயன்படுத்தப்படுகிறது.",
              "தரவு மூன்றாம் தரப்பினருக்கு விற்கப்படாது."
            ]
          }
        },
        {
          id: "7",
          title: "தடைசெய்யப்பட்ட செயல்பாடுகள்",
          intro: "பின்வருபவை கண்டிப்பாக தடைசெய்யப்பட்டுள்ளன:",
          points: [
            "தவறான அல்லது மோசடியான வேலைப் பதிவுகள் அல்லது சுயவிவரங்கள்.",
            "கட்டாய உழைப்பு, குழந்தை தொழிலாளர் அல்லது மனித கடத்தல்.",
            "பயனர் தரவை தவறாகப் பயன்படுத்துதல்.",
            "மற்றவரைப் போல ஆள்மாறாட்டம் செய்தல்.",
            "தானியங்கி கருவிகள் (Bots) மூலம் தரவை எடுத்தல்.",
            "ஸ்பேம், ஃபிஷிங் அல்லது சட்டவிரோத உள்ளடக்கங்கள்."
          ],
          warning: "விதிமீறல் இருந்தால் முன்னறிவிப்பின்றி கணக்கு நீக்கப்படும் மற்றும் சட்ட நடவடிக்கை எடுக்கப்படும்."
        },
        {
          id: "8",
          title: "அறிவுசார் சொத்து",
          points: [
            "தளத்தின் வடிவமைப்பு, மென்பொருள், லோகோ மற்றும் “NexTirupur.in” என்ற பெயர் எங்களின் சொத்து. முன் அனுமதியின்றி நகலெடுக்கக் கூடாது.",
            "நீங்கள் சமர்ப்பிக்கும் உள்ளடக்கத்தை சந்தைப்படுத்துதலுக்குப் பயன்படுத்த எங்களுக்கு உரிமை உண்டு."
          ],
          ownership: "நீங்கள் பதிவிடும் உள்ளடக்கம் உங்களுடையது அல்லது அதைப் பயன்படுத்த உங்களுக்கு உரிமை உண்டு என்பதை உறுதிப்படுத்துகிறீர்கள்."
        },
        {
          id: "9",
          title: "தனியுரிமை மற்றும் தரவு பாதுகாப்பு",
          points: [
            "தளம் செயல்பட மட்டுமே தனிப்பட்ட தரவு சேகரிக்கப்படுகிறது.",
            "DPDP சட்டம் 2023 மற்றும் IT விதிகள் 2011 ஆகியவற்றின் படி செயல்படுகிறோம்.",
            "நாங்கள் பயனர் தரவை விற்க மாட்டோம்."
          ]
        },
        {
          id: "10",
          title: "பொறுப்புத் துறப்புகள்",
          warning: "தளம் “உள்ளவாறு” வழங்கப்படுகிறது. வேலை கிடைப்பதற்கு அல்லது தளம் எப்போதும் தடையில்லாமல் கிடைப்பதற்கு உத்தரவாதம் இல்லை.",
          limitations: [
            "எங்கள் பொறுப்பு நீங்கள் கடந்த 3 மாதங்களில் செலுத்திய சந்தா கட்டணத்திற்கு உட்பட்டது.",
            "மறைமுக சேதங்கள் அல்லது லாப இழப்பிற்கு நாங்கள் பொறுப்பல்ல.",
            "முதலாளிகள் அல்லது தொழிலாளர்களின் நடத்தைகளுக்கு நாங்கள் பொறுப்பேற்க மாட்டோம்."
          ],
          legalNote: "இந்திய சட்டத்தின் கீழ் தவிர்க்க முடியாத பொறுப்புகளுக்கு இது பொருந்தாது."
        },
        {
          id: "11",
          title: "கணக்கு நீக்கம்",
          points: [
            "எங்களைத் தொடர்புகொண்டு எப்போது வேண்டுமானாலும் கணக்கை மூடலாம்.",
            "விதிமீறல் இருந்தால் நாங்கள் உடனடியாக கணக்கை முடக்கலாம்.",
            "கணக்கு நீக்கப்படும் போது, செயலில் உள்ள வேலைகள் அகற்றப்படும்.",
            "சில பிரிவுகள் கணக்கு நீக்கப்பட்ட பிறகும் தொடரும்."
          ]
        },
        {
          id: "12",
          title: "சட்டம் மற்றும் தீர்ப்பாயம்",
          points: [
            "இந்த விதிமுறைகள் இந்திய சட்டத்திற்கு உட்பட்டவை.",
            "திருப்பூர் நீதிமன்றங்கள் மட்டுமே பிரத்தியேக அதிகார வரம்பைக் கொண்டுள்ளன.",
            "சச்சரவுகள் முதலில் பேச்சுவார்த்தை மூலமும், பிறகு திருப்பூரில் உள்ள நடுவர் மன்றம் மூலமும் தீர்க்கப்படும்.",
            "நாங்கள் 15 நாட்களுக்கு முன் அறிவிப்புடன் விதிமுறைகளை மாற்றலாம்.",
            "ஏதேனும் முண்பாடு இருந்தால் ஆங்கில பதிப்பே இறுதியானது."
          ]
        },
        {
          id: "13",
          title: "தொடர்பு மற்றும் குறைகள்",
          ack: "ஒப்புகை: 24 மணி நேரத்திற்குள்",
          res: "தீர்வு நேரம்: 30 நாட்களுக்குள்"
        }
      ]
    },
    Hindi: {
      title: "सेवा की शर्तें",
      effectiveDate: "जून 2026 से प्रभावी",
      intro: {
        title: "परिचय",
        desc: "NexTirupur.in पर पंजीकरण या उपयोग करके, आप इन शर्तों से सहमत होते हैं। यदि आप असहमत हैं, तो कृपया प्लेटफॉर्म का उपयोग न करें।"
      },
      sections: [
        {
          id: "1",
          title: "प्लेटफॉर्म",
          desc: "NexTirupur.in एक त्रिभाषी (अंग्रेजी, तमिल, हिंदी) जॉब पोर्टल है जो तिरुपूर के परिधान और होजरी उद्योग में नियोक्ताओं और श्रमिकों को जोड़ता है।",
          features: ["सत्यापित सूचियाँ", "जीपीएस रेडियस मैचिंग", "स्वचालित व्हाट्सएप अलर्ट", "तमिल भाषा इंटरफेस"],
          warning: "NexTirupur.in केवल एक संचार और मैचिंग प्लेटफॉर्म है - यह कोई भर्ती एजेंसी नहीं है।"
        },
        {
          id: "2",
          title: "पात्रता और पंजीकरण",
          points: [
            "आपकी आयु 18 वर्ष या उससे अधिक होनी चाहिए और भारत में काम करने की कानूनी अनुमति होनी चाहिए।",
            "नियोक्ताओं के पास वैध व्यवसाय पंजीकरण और लाइसेंस होने चाहिए। जीएसटी विवरण सटीक होने चाहिए।",
            "पंजीकरण के समय सही जानकारी प्रदान करें। प्रति व्यक्ति केवल एक खाता मान्य है।",
            "पात्र उपयोगकर्ताओं को पंजीकरण में सहायता दी जा सकती है; लेकिन जानकारी की सटीकता के लिए उपयोगकर्ता स्वयं जिम्मेदार हैं।",
            "NexTirupur किसी भी समय पात्रता की जांच कर सकता है और नियमों का उल्लंघन करने वाले खातों को निलंबित कर सकता।"
          ]
        },
        {
          id: "3",
          title: "नियोक्ता की जिम्मेदारियां",
          points: [
            "नौकरी की जानकारी, वेतन, स्थान और समय का सटीक वर्णन होना चाहिए। गलत जानकारी देने पर सूची हटा दी जाएगी।",
            "सभी सूचियाँ भारतीय श्रम कानूनों (जैसे Factories Act 1948) का पालन करनी चाहिए।",
            "जाति, धर्म, लिंग या विकलांगता के आधार पर भेदभाव प्रतिबंधित है।",
            "नियोक्ता श्रमिकों से नौकरी के लिए कोई शुल्क या कमीशन नहीं मांग सकते।",
            "साझा किया गया श्रमिक डेटा केवल वास्तविक भर्ती के लिए उपयोग किया जाना चाहिए।"
          ]
        },
        {
          id: "4",
          title: "श्रमिकों की जिम्मेदारियां",
          points: [
            "श्रमिक प्रोफाइल में कौशल और अनुभव की सही जानकारी होनी चाहिए।",
            "कोई भी फर्जी प्रमाण पत्र या गलत संदर्भ नहीं होना चाहिए।",
            "जब श्रमिक आवेदन करते हैं, तो उनकी प्रोफाइल संबंधित नियोक्ताओं के साथ साझा की जाएगी।",
            "साक्षात्कार के दौरान श्रमिक अपनी गलत छवि पेश न करें।",
            "श्रमिक नियोक्ताओं से किसी भी प्रकार के भुगतान की मांग न करें।"
          ]
        },
        {
          id: "5",
          title: "सदस्यता योजनाएं और भुगतान",
          table: [
            { name: "Single", price: "₹400", features: "1 सूची • 15 दिन • सभी प्रीमियम सुविधाएं" },
            { name: "Starter", price: "₹999", features: "3 सूचियां • 15 दिन • सभी प्रीमियम सुविधाएं" },
            { name: "Growth", price: "₹1,499", features: "5 सूचियां • 15 दिन • सभी प्रीमियम सुविधाएं" },
            { name: "Volume", price: "₹2,499", features: "10 सूचियां • 15 दिन • सभी प्रीमियम सुविधाएं" }
          ],
          paymentRules: [
            "सभी कीमतें जीएसटी के बिना हैं; जीएसटी अतिरिक्त देय होगा।",
            "भुगतान पूर्ण रूप से अग्रिम देय है।",
            "सफल भुगतान के बाद सुविधाएं सक्रिय होंगी।",
            "योजनाएं स्वतः नवीनीकृत नहीं होती हैं।",
            "समाप्ति की सूचना दी जाएगी।"
          ],
          refundRules: [
            "नौकरी प्रकाशित होने के बाद शुल्क वापस नहीं किया जाएगा।",
            "केवल तकनीकी खराबी या दोहरे भुगतान के मामले में ही रिफंड पर विचार किया जाएगा।",
            "अनुरोध 5 कार्य दिवसों के भीतर nextirupur@gmail.com पर भेजें।",
            "स्वीकृत रिफंड 7-10 कार्य दिवसों में संसाधित किया जाएगा।"
          ]
        },
        {
          id: "6",
          title: "स्वचालित प्रसारण और जीपीएस सुविधाएं",
          broadcast: {
            title: "प्रसारण अलर्ट",
            points: [
              "व्हाट्सएप या इन-ऐप नोटिफिकेशन के माध्यम से श्रमिकों को अलर्ट भेजे जाएंगे।",
              "प्रतिक्रिया दर की गारंटी नहीं है।",
              "पंजीकरण के समय सहमति देने वालों को ही अलर्ट मिलेंगे।",
              "उपयोगकर्ता किसी भी समय STOP भेजकर इसे बंद कर सकते हैं।"
            ]
          },
          gps: {
            title: "जीपीएस मैचिंग",
            points: [
              "जीपीएस मिलान डिवाइस के स्थान या पंजीकृत पते का उपयोग करता है।",
              "सटीकता डिवाइस और नेटवर्क पर निर्भर करती है।",
              "स्थान डेटा का उपयोग केवल मिलान के लिए किया जाता है।",
              "डेटा किसी तीसरे पक्ष को नहीं बेचा जाता है।"
            ]
          }
        },
        {
          id: "7",
          title: "प्रतिबंधित गतिविधियां",
          intro: "निम्नलिखित गतिविधियां सख्त वर्जित हैं:",
          points: [
            "फर्जी या भ्रामक नौकरी विज्ञापन या प्रोफाइल।",
            "जबरन श्रम, बाल श्रम या मानव तस्करी।",
            "उपयोगकर्ता डेटा का दुरुपयोग करना।",
            "किसी अन्य व्यक्ति या संगठन का भेष बदलना।",
            "स्वचालित उपकरणों (Bots) के माध्यम से डेटा एकत्र करना।",
            "स्पैम, फ़िशिंग या अवैध सामग्री।"
          ],
          warning: "उल्लंघन होने पर बिना सूचना के खाता हटाया जा सकता है और कानूनी कार्रवाई की जा सकती है।"
        },
        {
          id: "8",
          title: "बौद्धिक संपदा",
          points: [
            "प्लेटफॉर्म का डिज़ाइन, सॉफ्टवेयर, लोगो और “NexTirupur.in” नाम हमारी संपत्ति है। बिना अनुमति के नकल न करें।",
            "आपके द्वारा सबमिट की गई सामग्री का उपयोग हम मार्केटिंग के लिए कर सकते हैं।"
          ],
          ownership: "आप पुष्टि करते हैं कि आपकी पोस्ट की गई सामग्री आपकी अपनी है या आपको इसे पोस्ट करने का अधिकार है।"
        },
        {
          id: "9",
          title: "गोपनीयता और डेटा सुरक्षा",
          points: [
            "व्यक्तिगत डेटा केवल प्लेटफॉर्म के संचालन के लिए एकत्र किया जाता है।",
            "हम DPDP अधिनियम 2023 और आईटी नियम 2011 का पालन करते हैं।",
            "हम उपयोगकर्ता डेटा नहीं बेचते हैं।"
          ]
        },
        {
          id: "10",
          title: "देयता और अस्वीकरण",
          warning: "प्लेटफॉर्म “जैसा है” वैसा ही प्रदान किया जाता है। नौकरी मिलने या प्लेटफॉर्म की निरंतर उपलब्धता की कोई गारंटी नहीं है।",
          limitations: [
            "हमारी अधिकतम देयता आपके द्वारा भुगतान किए गए पिछले 3 महीनों के शुल्क तक सीमित है।",
            "हम अप्रत्यक्ष नुकसान या लाभ की हानि के लिए उत्तरदायी नहीं हैं।",
            "नियोक्ताओं या श्रमिकों के आचरण के लिए हम जिम्मेदार नहीं हैं।"
          ],
          legalNote: "भारतीय कानून के तहत अनिवार्य देयता पर यह लागू नहीं होता है।"
        },
        {
          id: "11",
          title: "खाता समाप्ति",
          points: [
            "आप हमसे संपर्क करके कभी भी अपना खाता बंद कर सकते हैं।",
            "नियमों के उल्लंघन पर हम तुरंत खाता निलंबित कर सकते हैं।",
            "खाता बंद होने पर सक्रिय सूचियाँ हटा दी जाएंगी।",
            "कुछ धाराएं खाता बंद होने के बाद भी प्रभावी रहेंगी।"
          ]
        },
        {
          id: "12",
          title: "कानून और विवाद",
          points: [
            "ये शर्तें भारतीय कानून द्वारा शासित हैं।",
            "तिरुपूर की अदालतों का विशेष क्षेत्राधिकार होगा।",
            "विवादों का समाधान पहले बातचीत और फिर तिरुपूर में मध्यस्थता के माध्यम से होगा।",
            "हम 15 दिनों के नोटिस के साथ इन शर्तों को बदल सकते हैं।",
            "किसी भी विसंगति के मामले में अंग्रेजी संस्करण ही मान्य होगा।"
          ]
        },
        {
          id: "13",
          title: "संपर्क और शिकायतें",
          ack: "पावती: 24 घंटे के भीतर",
          res: "समाधान समय: 30 दिनों के भीतर"
        }
      ]
    }
  };

  const currentContent = (content[language as keyof typeof content] || content.English) as any;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-12 max-w-5xl mx-auto w-full space-y-12">
        {/* Navigation & Header */}
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => router.back()} className="font-bold text-primary gap-2 hover:bg-primary/5 rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" /> {t.backToPrev}
          </Button>
          
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
              <FileText className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tight uppercase">
              {currentContent.title}
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em]">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {currentContent.effectiveDate}</span>
              <span className="hidden md:inline text-primary/20">•</span>
              <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> NexTirupur Services, Tirupur</span>
            </div>
          </div>
        </div>

        {/* Introduction Banner */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
           <CardContent className="p-8 md:p-12 relative z-10 text-center md:text-left space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight">{currentContent.intro.title}</h2>
              <p className="text-lg md:text-xl font-medium leading-relaxed opacity-90">
                {currentContent.intro.desc}
              </p>
              <div className="pt-4 flex flex-wrap gap-3">
                 <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-black uppercase text-[9px] tracking-widest px-3 py-1">Web</Badge>
                 <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-black uppercase text-[9px] tracking-widest px-3 py-1">Mobile</Badge>
                 <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-black uppercase text-[9px] tracking-widest px-3 py-1">WhatsApp Services</Badge>
              </div>
           </CardContent>
        </Card>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 gap-10">
          
          {/* SECTION 1 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b-4 border-primary/10 pb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">1</div>
              <h2 className="text-2xl md:text-3xl font-black font-headline text-primary uppercase tracking-tight">{currentContent.sections[0].title}</h2>
            </div>
            <div className="p-8 bg-white rounded-[2.5rem] shadow-lg space-y-6">
              <p className="text-lg font-medium text-muted-foreground leading-relaxed">
                {currentContent.sections[0].desc}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {currentContent.sections[0].features.map((text: any, i: number) => (
                   <div key={i} className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-dashed">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      <span className="font-bold text-sm">{text}</span>
                   </div>
                 ))}
              </div>
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                 <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                 <p className="text-sm font-bold text-amber-900 leading-relaxed italic">
                   {currentContent.sections[0].warning}
                 </p>
              </div>
            </div>
          </section>

          {/* SECTION 2 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b-4 border-primary/10 pb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">2</div>
              <h2 className="text-2xl md:text-3xl font-black font-headline text-primary uppercase tracking-tight">{currentContent.sections[1].title}</h2>
            </div>
            <div className="p-8 bg-white rounded-[2.5rem] shadow-lg space-y-6">
              <ul className="space-y-6">
                {currentContent.sections[1].points.map((point: any, i: number) => (
                  <li key={i} className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                    <p className="text-base font-medium text-muted-foreground leading-relaxed">{point}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* SECTION 3 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b-4 border-primary/10 pb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">3</div>
              <h2 className="text-2xl md:text-3xl font-black font-headline text-primary uppercase tracking-tight">{currentContent.sections[2].title}</h2>
            </div>
            <div className="p-8 bg-white rounded-[2.5rem] shadow-lg space-y-6">
               <ul className="space-y-6">
                 {currentContent.sections[2].points.map((point: any, i: number) => (
                   <li key={i} className="flex gap-4">
                     <Building2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                     <p className="text-base font-medium text-muted-foreground leading-relaxed">{point}</p>
                   </li>
                 ))}
               </ul>
            </div>
          </section>

          {/* SECTION 4 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b-4 border-primary/10 pb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">4</div>
              <h2 className="text-2xl md:text-3xl font-black font-headline text-primary uppercase tracking-tight">{currentContent.sections[3].title}</h2>
            </div>
            <div className="p-8 bg-white rounded-[2.5rem] shadow-lg space-y-6">
               <ul className="space-y-6">
                 {currentContent.sections[3].points.map((point: any, i: number) => (
                   <li key={i} className="flex gap-4">
                     <User className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                     <p className="text-base font-medium text-muted-foreground leading-relaxed">{point}</p>
                   </li>
                 ))}
               </ul>
            </div>
          </section>

          {/* SECTION 5 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b-4 border-primary/10 pb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">5</div>
              <h2 className="text-2xl md:text-3xl font-black font-headline text-primary uppercase tracking-tight">{currentContent.sections[4].title}</h2>
            </div>
            <div className="p-8 bg-white rounded-[2.5rem] shadow-lg space-y-10">
               <div className="rounded-3xl border-2 overflow-hidden shadow-inner bg-muted/20">
                 <Table>
                   <TableHeader className="bg-primary text-white">
                     <TableRow className="hover:bg-primary border-none text-white">
                       <TableHead className="text-white font-black uppercase text-xs pl-8">Plan</TableHead>
                       <TableHead className="text-white font-black uppercase text-xs">Price (+ GST)</TableHead>
                       <TableHead className="text-white font-black uppercase text-xs pr-8">Key Features</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {currentContent.sections[4].table.map((plan: any, i: number) => (
                       <TableRow key={i} className="hover:bg-primary/5 transition-colors">
                         <TableCell className="font-black text-primary text-lg pl-8 py-6">{plan.name}</TableCell>
                         <TableCell className="font-black text-foreground text-lg">{plan.price}</TableCell>
                         <TableCell className="font-bold text-muted-foreground pr-8">{plan.features}</TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <h3 className="text-xl font-black uppercase tracking-tight text-primary flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment Rules</h3>
                     <ul className="space-y-4">
                        {currentContent.sections[4].paymentRules.map((p: any, i: number) => (
                          <li key={i} className="flex gap-3 text-sm font-medium text-muted-foreground leading-relaxed">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1.5" />
                            {p}
                          </li>
                        ))}
                     </ul>
                  </div>
                  <div className="space-y-6">
                     <h3 className="text-xl font-black uppercase tracking-tight text-primary flex items-center gap-2"><RefreshCw className="w-5 h-5" /> Refund Policy</h3>
                     <ul className="space-y-4">
                        {currentContent.sections[4].refundRules.map((p: any, i: number) => (
                          <li key={i} className="flex gap-3 text-sm font-medium text-muted-foreground leading-relaxed">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1.5" />
                            {p}
                          </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>
          </section>

          {/* SECTION 6 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b-4 border-primary/10 pb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">6</div>
              <h2 className="text-2xl md:text-3xl font-black font-headline text-primary uppercase tracking-tight">{currentContent.sections[5].title}</h2>
            </div>
            <div className="p-8 bg-white rounded-[2.5rem] shadow-lg grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <h3 className="font-black text-primary text-sm uppercase tracking-widest border-l-4 border-primary pl-3">{currentContent.sections[5].broadcast.title}</h3>
                  <ul className="space-y-3 text-sm font-medium text-muted-foreground leading-relaxed">
                     {currentContent.sections[5].broadcast.points.map((p: any, i: number) => <li key={i}>• {p}</li>)}
                  </ul>
               </div>
               <div className="space-y-4">
                  <h3 className="font-black text-accent text-sm uppercase tracking-widest border-l-4 border-accent pl-3">{currentContent.sections[5].gps.title}</h3>
                  <ul className="space-y-3 text-sm font-medium text-muted-foreground leading-relaxed">
                     {currentContent.sections[5].gps.points.map((p: any, i: number) => <li key={i}>• {p}</li>)}
                  </ul>
               </div>
            </div>
          </section>

          {/* SECTION 7 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b-4 border-primary/10 pb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">7</div>
              <h2 className="text-2xl md:text-3xl font-black font-headline text-primary uppercase tracking-tight">{currentContent.sections[6].title}</h2>
            </div>
            <div className="p-8 bg-red-50 rounded-[2.5rem] shadow-lg space-y-6 border border-red-100">
               <p className="text-lg font-black text-red-900 uppercase tracking-tight">{currentContent.sections[6].intro}</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {currentContent.sections[6].points.map((p: any, i: number) => (
                    <div key={i} className="flex gap-3">
                       <Ban className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                       <p className="text-sm font-bold text-red-800 leading-relaxed">{p}</p>
                    </div>
                  ))}
               </div>
               <div className="pt-6 border-t border-red-200">
                  <p className="text-xs font-black text-red-700 uppercase tracking-widest leading-relaxed">
                    {currentContent.sections[6].warning}
                  </p>
               </div>
            </div>
          </section>

          {/* SECTION 8 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b-4 border-primary/10 pb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">8</div>
              <h2 className="text-2xl md:text-3xl font-black font-headline text-primary uppercase tracking-tight">{currentContent.sections[7].title}</h2>
            </div>
            <div className="p-8 bg-white rounded-[2.5rem] shadow-lg space-y-6">
              {currentContent.sections[7].points.map((p: any, i: number) => (
                <p key={i} className="text-base font-medium text-muted-foreground leading-relaxed">{p}</p>
              ))}
              <div className="p-5 bg-primary/5 rounded-2xl border border-dashed border-primary/20 flex items-start gap-4">
                 <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-1" />
                 <p className="text-sm font-bold text-primary leading-relaxed">
                   {currentContent.sections[7].ownership}
                 </p>
              </div>
            </div>
          </section>

          {/* SECTION 9 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b-4 border-primary/10 pb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">9</div>
              <h2 className="text-2xl md:text-3xl font-black font-headline text-primary uppercase tracking-tight">{currentContent.sections[8].title}</h2>
            </div>
            <div className="p-8 bg-white rounded-[2.5rem] shadow-lg space-y-4">
              {currentContent.sections[8].points.map((p: any, i: number) => (
                <p key={i} className={cn("text-base leading-relaxed", i === 2 ? "font-black text-foreground" : "font-medium text-muted-foreground")}>
                  {p}
                </p>
              ))}
              <p className="text-sm font-medium text-muted-foreground italic">Full details are available in the <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.</p>
            </div>
          </section>

          {/* SECTION 10 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b-4 border-primary/10 pb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">10</div>
              <h2 className="text-2xl md:text-3xl font-black font-headline text-primary uppercase tracking-tight">{currentContent.sections[9].title}</h2>
            </div>
            <div className="p-8 bg-white rounded-[2.5rem] shadow-lg space-y-6">
              <p className="text-base font-bold text-foreground italic border-l-4 border-amber-400 pl-4 bg-amber-50 py-4 rounded-r-2xl">
                {currentContent.sections[9].warning}
              </p>
              <div className="space-y-6">
                 <h3 className="font-black text-sm uppercase text-primary tracking-widest">Specific Limitations:</h3>
                 <ul className="space-y-4">
                    {currentContent.sections[9].limitations.map((point: any, i: number) => (
                      <li key={i} className="flex gap-4">
                        <Scale className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-base font-medium text-muted-foreground leading-relaxed">{point}</p>
                      </li>
                    ))}
                 </ul>
              </div>
              <p className="text-sm font-bold text-muted-foreground pt-4 border-t border-dashed">
                {currentContent.sections[9].legalNote}
              </p>
            </div>
          </section>

          {/* SECTION 11 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b-4 border-primary/10 pb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">11</div>
              <h2 className="text-2xl md:text-3xl font-black font-headline text-primary uppercase tracking-tight">{currentContent.sections[10].title}</h2>
            </div>
            <div className="p-8 bg-white rounded-[2.5rem] shadow-lg space-y-6">
              <ul className="space-y-6">
                {currentContent.sections[10].points.map((point: any, i: number) => (
                  <li key={i} className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <p className="text-base font-medium text-muted-foreground leading-relaxed">{point}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* SECTION 12 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b-4 border-primary/10 pb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">12</div>
              <h2 className="text-2xl md:text-3xl font-black font-headline text-primary uppercase tracking-tight">{currentContent.sections[11].title}</h2>
            </div>
            <div className="p-8 bg-muted/20 rounded-[2.5rem] shadow-inner space-y-6 border">
               <ul className="space-y-6">
                 {currentContent.sections[11].points.map((point: any, i: number) => (
                   <li key={i} className="flex gap-4">
                     <Gavel className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                     <p className="text-base font-medium text-muted-foreground leading-relaxed">{point}</p>
                   </li>
                 ))}
               </ul>
            </div>
          </section>

          {/* SECTION 13 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b-4 border-primary/10 pb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">13</div>
              <h2 className="text-2xl md:text-3xl font-black font-headline text-primary uppercase tracking-tight">{currentContent.sections[12].title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="rounded-[2rem] border-none shadow-lg overflow-hidden flex flex-col group">
                  <div className="p-6 bg-muted/50 border-b flex items-center justify-center">
                     <Mail className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <CardContent className="p-6 text-center space-y-2 flex-grow">
                     <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Official Email</p>
                     <p className="text-lg font-black text-primary break-all">nextirupur@gmail.com</p>
                  </CardContent>
               </Card>

               <Card className="rounded-[2rem] border-none shadow-lg overflow-hidden flex flex-col group">
                  <div className="p-6 bg-muted/50 border-b flex items-center justify-center">
                     <MessageCircle className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <CardContent className="p-6 text-center space-y-2 flex-grow">
                     <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">WhatsApp Support</p>
                     <p className="text-lg font-black text-primary">917305505311</p>
                     <p className="text-[9px] font-bold text-muted-foreground uppercase">(Mon–Sat, 9 AM – 6 PM IST)</p>
                  </CardContent>
               </Card>

               <Card className="rounded-[2rem] border-none shadow-lg overflow-hidden flex flex-col group">
                  <div className="p-6 bg-muted/50 border-b flex items-center justify-center">
                     <MapPin className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <CardContent className="p-6 text-center space-y-2 flex-grow">
                     <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Physical Address</p>
                     <p className="text-sm font-black leading-snug">NexTirupur Services, Tirupur, Tamil Nadu.</p>
                  </CardContent>
               </Card>
            </div>
            
            <div className="bg-primary/5 p-6 rounded-3xl border border-dashed border-primary/20 flex flex-wrap justify-center gap-10 md:gap-20 text-center">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Acknowledgment</p>
                  <p className="text-sm font-black text-primary">{currentContent.sections[12].ack}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Resolution Time</p>
                  <p className="text-sm font-black text-primary">{currentContent.sections[12].res}</p>
               </div>
            </div>
          </section>

        </div>

        {/* Legal Footer */}
        <div className="pt-20 pb-10 text-center space-y-6">
           <Separator className="bg-primary/10 max-w-sm mx-auto" />
           <div className="space-y-2">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">
                © 2025 NexTirupur Services. All Rights Reserved.
              </p>
              <h3 className="text-lg font-bold font-headline text-primary">NexTirupur.in – Tirupur's Own Job Platform</h3>
           </div>
        </div>
      </main>
    </div>
  );
}

