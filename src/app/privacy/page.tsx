"use client";

import { Header } from "@/components/layout/Header";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, MessageCircle, AlertCircle, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function PrivacyPolicyPage() {
  const { language, t } = useLanguage();
  const router = useRouter();

  const content = {
    English: {
      title: "NexTirupur.in — Privacy Policy",
      intro: "At NexTirupur.in, your privacy is our top priority. We built this platform to connect the Tirupur garment industry safely, and that means protecting your data from spam, agents, and misuse.",
      sections: [
        {
          id: "1",
          title: "What We Collect",
          workerTitle: "From Workers:",
          workerDesc: "We collect your mobile number, age, current area in Tirupur, work experience, and job preferences.",
          employerTitle: "From Employers:",
          employerDesc: "We collect your GST registration, factory address, GPS location, and official contact number to verify your business."
        },
        {
          id: "2",
          title: "Why We Collect It (The Purpose)",
          desc1: "We use this data for one reason only: to help factory owners hire staff, and to help staff find jobs.",
          desc2: "We use your mobile number to send you automated WhatsApp updates about your job applications or candidate matches."
        },
        {
          id: "3",
          title: "Who Sees Your Data",
          banner: "We DO NOT sell your data.",
          bannerSub: "We will never sell your mobile number to telemarketers, loan agents, or third-party brokers.",
          workerPrivacy: "Worker Privacy",
          workerPrivacyDesc: "Your mobile number is hidden from the public. A verified employer can only see your contact details if you apply for their job or if you match their specific hiring filters.",
          employerPrivacy: "Employer Privacy",
          employerPrivacyDesc: "Your official contact number is hidden from public job listings to prevent spam calls. Workers will contact you exclusively through the NexTirupur platform or automated system."
        },
        {
          id: "4",
          title: "Your Right to Delete (The \"Erasure\" Rule)",
          boldText: "You have total control over your profile.",
          desc1: "If you find a permanent job, or if you hire the staff you need, you can delete your profile at any time.",
          desc2: "Simply log into your dashboard, click \"Delete My Account\", and your data and mobile number will be permanently removed from our active system."
        },
        {
          id: "5",
          title: "Employer Responsibility",
          desc1: "NexTirupur is a digital matching platform.",
          warning: "We do not digitally collect or store physical government IDs (like Aadhaar, PAN, or Voter IDs) of workers.",
          boldText: "Employers are solely responsible for physically verifying a worker's original government ID and age proof during the face-to-face interview."
        },
        {
          id: "6",
          title: "Contact Us",
          desc: "If you have any questions about your data, or if you want to report a fake profile, please contact our support team immediately:"
        }
      ]
    },
    Tamil: {
      title: "NexTirupur.in — தனியுரிமைக் கொள்கை",
      intro: "NexTirupur.in இல், உங்கள் தனியுரிமை எங்களின் முதன்மையான முன்னுரிமையாகும். திருப்பூர் ஆடைத் தொழிலை பாதுகாப்பாக இணைக்க இந்தத் தளத்தை உருவாக்கியுள்ளோம், அதாவது ஸ்பேம், ஏஜெண்டுகள் மற்றும் தவறான பயன்பாட்டிலிருந்து உங்கள் தரவைப் பாதுகாப்பதாகும்.",
      sections: [
        {
          id: "1",
          title: "நாங்கள் எதைச் சேகரிக்கிறோம்",
          workerTitle: "தொழிலாளர்களிடமிருந்து:",
          workerDesc: "உங்கள் மொபைல் எண், வயது, திருப்பூரில் தற்போது வசிக்கும் பகுதி, பணி அனுபவம் மற்றும் வேலை விருப்பங்களை நாங்கள் சேகரிக்கிறோம்.",
          employerTitle: "முதலாளிகளிடமிருந்து:",
          employerDesc: "உங்கள் வணிகத்தைச் சரிபார்க்க உங்கள் ஜிஎஸ்டி பதிவு, தொழிற்சாலை முகவரி, ஜிபிஎஸ் இருப்பிடம் மற்றும் அதிகாரப்பூர்வ தொடர்பு எண் ஆகியவற்றை நாங்கள் சேகரிக்கிறோம்."
        },
        {
          id: "2",
          title: "ஏன் இதைச் சேகரிக்கிறோம் (நோக்கம்)",
          desc1: "நாங்கள் இந்தத் தரவை ஒரே ஒரு காரணத்திற்காக மட்டுமே பயன்படுத்துகிறோம்: தொழிற்சாலை உரிமையாளர்களுக்கு ஊழியர்களை நியமிக்க உதவவும், ஊழியர்களுக்கு வேலை தேட உதவவும்.",
          desc2: "உங்கள் வேலை விண்ணப்பங்கள் அல்லது வேட்பாளர் பொருத்தங்கள் பற்றிய தானியங்கி வாட்ஸ்அப் அறிவிப்புகளை அனுப்ப உங்கள் மொபைல் எண்ணைப் பயன்படுத்துகிறோம்."
        },
        {
          id: "3",
          title: "உங்கள் தரவை யார் பார்க்கிறார்கள்",
          banner: "நாங்கள் உங்கள் தரவை விற்க மாட்டோம்.",
          bannerSub: "டெலிமார்க்கெட்டர்கள், கடன் முகவர்கள் அல்லது மூன்றாம் தரப்பு தரகர்களுக்கு உங்கள் மொபைல் எண்ணை நாங்கள் ஒருபோதும் விற்க மாட்டோம்.",
          workerPrivacy: "தொழிலாளர் தனியுரிமை",
          workerPrivacyDesc: "உங்கள் மொபைல் எண் பொதுமக்களிடமிருந்து மறைக்கப்பட்டுள்ளது. நீங்கள் ஒரு வேலைக்கு விண்ணப்பித்தால் அல்லது அவர்களின் குறிப்பிட்ட தேடல் வடிகட்டிகளுடன் பொருந்தினால் மட்டுமே சரிபார்க்கப்பட்ட முதலாளி உங்கள் தொடர்பு விவரங்களைக் காண முடியும்.",
          employerPrivacy: "முதலாளி தனியுரிமை",
          employerPrivacyDesc: "ஸ்பேம் அழைப்புகளைத் தடுக்க உங்கள் அதிகாரப்பூர்வ தொடர்பு எண் பொது வேலைப் பட்டியலிலிருந்து மறைக்கப்பட்டுள்ளது. தொழிலாளர்கள் நெக்ஸ்டிருப்பூர் தளம் அல்லது தானியங்கி அமைப்பு மூலம் மட்டுமே உங்களைத் தொடர்புகொள்வார்கள்."
        },
        {
          id: "4",
          title: "அழிப்பதற்கான உங்கள் உரிமை",
          boldText: "உங்கள் சுயவிவரத்தின் மீது உங்களுக்கு முழு கட்டுப்பாடு உள்ளது.",
          desc1: "நீங்கள் நிரந்தர வேலை கண்டால் அல்லது தேவையான ஊழியர்களை நியமித்துவிட்டால், எந்த நேரத்திலும் உங்கள் சுயவிவரத்தை நீக்கலாம்.",
          desc2: "உங்கள் டாஷ்போர்டில் உள்நுழைந்து, \"எனது கணக்கை நீக்கு\" என்பதைக் கிளிக் செய்தால் போதும், உங்கள் தரவு மற்றும் மொபைல் எண் எங்கள் செயலில் உள்ள அமைப்பிலிருந்து நிரந்தரமாக அகற்றப்படும்."
        },
        {
          id: "5",
          title: "முதலாளியின் பொறுப்பு",
          desc1: "நெக்ஸ்டிருப்பூர் ஒரு டிஜிட்டல் பொருத்தத் தளமாகும்.",
          warning: "நாங்கள் தொழிலாளர்களின் அசல் அடையாள அட்டைகளை (ஆதார், பான் அல்லது வாக்காளர் அடையாள அட்டை போன்றவை) டிஜிட்டல் முறையில் சேகரிக்கவோ சேமிக்கவோ மாட்டோம்.",
          boldText: "நேர்முகத் தேர்வின் போது தொழிலாளியின் அசல் அரசு அடையாள அட்டை மற்றும் வயதுச் சான்றை நேரில் சரிபார்க்க முதலாளிகளே முழுப் பொறுப்பு."
        },
        {
          id: "6",
          title: "எங்களைத் தொடர்பு கொள்ள",
          desc: "உங்கள் தரவு பற்றி ஏதேனும் கேள்வ இருந்தால் அல்லது போலி சுயவிவரத்தைப் புகாரளிக்க விரும்பினால், உடனடியாக எங்கள் ஆதரவுக் குழுவைத் தொடர்பு கொள்ளவும்:"
        }
      ]
    },
    Hindi: {
      title: "NexTirupur.in — गोपनीयता नीति",
      intro: "NexTirupur.in पर, आपकी गोपनीयता हमारी सर्वोच्च प्राथमिकता है। हमने तिरुपूर परिधान उद्योग को सुरक्षित रूप से जोड़ने के लिए इस प्लेटफॉर्म का निर्माण किया है, और इसका अर्थ है आपके डेटा को स्पैम, एजेंटों और दुरुपयोग से बचाना।",
      sections: [
        {
          id: "1",
          title: "हम क्या एकत्र करते हैं",
          workerTitle: "श्रमिकों से:",
          workerDesc: "हम आपका मोबाइल नंबर, आयु, तिरुपूर में वर्तमान क्षेत्र, कार्य अनुभव और नौकरी की प्राथमिकताएं एकत्र करते हैं।",
          employerTitle: "नियोक्ताओं से:",
          employerDesc: "हम आपके व्यवसाय को सत्यापित करने के लिए आपका जीएसटी पंजीकरण, फैक्ट्री का पता, जीपीएस स्थान और आधिकारिक संपर्क नंबर एकत्र करते हैं।"
        },
        {
          id: "2",
          title: "हम इसे क्यों एकत्र करते हैं (उद्देश्य)",
          desc1: "हम इस डेटा का उपयोग केवल एक ही कारण से करते हैं: फैक्ट्री मालिकों को स्टाफ नियुक्त करने में मदद करने के लिए, और स्टाफ को नौकरी खोजने में मदद करने के लिए।",
          desc2: "हम आपके नौकरी आवेदनों या उम्मीदवार मिलानों के बारे में स्वचालित व्हाट्सएप अपडेट भेजने के लिए आपके मोबाइल नंबर का उपयोग करते हैं।"
        },
        {
          id: "3",
          title: "आपका डेटा कौन देखता है",
          banner: "हम आपका डेटा नहीं बेचते हैं।",
          bannerSub: "हम आपका मोबाइल नंबर टेलीमार्केटर्स, लोन एजेंटों या तीसरे पक्ष के दलालों को कभी नहीं बेचेंगे।",
          workerPrivacy: "श्रमिक गोपनीयता",
          workerPrivacyDesc: "आपका मोबाइल नंबर जनता से छिपा हुआ है। एक सत्यापित नियोक्ता केवल तभी आपके संपर्क विवरण देख सकता है जब आप उनकी नौकरी के लिए आवेदन करते हैं या यदि आप उनके विशिष्ट भर्ती फिल्टर से मेल खाते हैं।",
          employerPrivacy: "नियोक्ता गोपनीयता",
          employerPrivacyDesc: "स्पैम कॉल को रोकने के लिए आपका आधिकारिक संपर्क नंबर सार्वजनिक नौकरी सूचियों से छिपा हुआ है। श्रमिक आपसे विशेष रूप से नेक्सतिरुपूर प्लेटफॉर्म या स्वचालित प्रणाली के माध्यम से संपर्क करेंगे।"
        },
        {
          id: "4",
          title: "हटाने का आपका अधिकार",
          boldText: "आपकी अपनी प्रोफाइल पर पूरा नियंत्रण है।",
          desc1: "यदि आपको स्थायी नौकरी मिल जाती है, या यदि आप आवश्यक स्टाफ नियुक्त कर लेते हैं, तो आप किसी भी समय अपनी प्रोफाइल हटा सकते हैं।",
          desc2: "बस अपने डैशबोर्ड में लॉग इन करें, \"मेरा खाता हटाएं\" पर क्लिक करें, और आपका डेटा और मोबाइल नंबर हमारे सक्रिय सिस्टम से स्थायी रूप से हटा दिया जाएगा।"
        },
        {
          id: "5",
          title: "नियोक्ता की जिम्मेदारी",
          desc1: "नेक्सतिरुपूर एक डिजिटल मैचिंग प्लेटफॉर्म है।",
          warning: "हम श्रमिकों के भौतिक सरकारी आईडी (जैसे आधार, पैन या वोटर आईडी) को डिजिटल रूप से एकत्र या संग्रहीत नहीं करते हैं।",
          boldText: "आमने-सामने साक्षात्कार के दौरान श्रमिक के मूल सरकारी आईडी और आयु प्रमाण को भौतिक रूप से सत्यापित करने के लिए नियोक्ता पूरी तरह जिम्मेदार हैं।"
        },
        {
          id: "6",
          title: "संपर्क करें",
          desc: "यदि आपके पास अपने डेटा के बारे में कोई प्रश्न है, या यदि आप किसी फर्जी प्रोफाइल की रिपोर्ट करना चाहते हैं, तो कृपया तुरंत हमारी सहायता टीम से संपर्क करें:"
        }
      ]
    }
  };

  const currentContent = content[language as keyof typeof content] || content.English;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-12 max-w-4xl mx-auto w-full space-y-12">
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.back()} className="font-bold text-primary gap-2 hover:bg-primary/5 rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" /> {t.backToPrev}
          </Button>
          
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tight">{currentContent.title}</h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
              {currentContent.intro}
            </p>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <CardContent className="p-8 md:p-16 space-y-12 text-foreground">
            
            {/* Section 1 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black">1</div>
                <h2 className="text-2xl font-black font-headline uppercase tracking-tight">{currentContent.sections[0].title}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4 border-l-4 border-primary/10">
                <div className="space-y-2">
                  <h3 className="font-black text-primary text-sm uppercase tracking-widest">{currentContent.sections[0].workerTitle}</h3>
                  <p className="font-medium text-muted-foreground leading-relaxed">
                    {currentContent.sections[0].workerDesc}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-primary text-sm uppercase tracking-widest">{currentContent.sections[0].employerTitle}</h3>
                  <p className="font-medium text-muted-foreground leading-relaxed">
                    {currentContent.sections[0].employerDesc}
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black">2</div>
                <h2 className="text-2xl font-black font-headline uppercase tracking-tight">{currentContent.sections[1].title}</h2>
              </div>
              <div className="space-y-4 pl-4 border-l-4 border-primary/10">
                <p className="font-medium text-muted-foreground leading-relaxed">
                  {currentContent.sections[1].desc1}
                </p>
                <p className="font-medium text-muted-foreground leading-relaxed">
                  {currentContent.sections[1].desc2}
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black">3</div>
                <h2 className="text-2xl font-black font-headline uppercase tracking-tight">{currentContent.sections[2].title}</h2>
              </div>
              <div className="space-y-6 pl-4 border-l-4 border-primary/10">
                <div className="bg-primary/5 p-6 rounded-2xl border border-dashed border-primary/20">
                  <h3 className="font-black text-primary text-lg mb-2">{currentContent.sections[2].banner}</h3>
                  <p className="font-medium text-muted-foreground">
                    {currentContent.sections[2].bannerSub}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <h3 className="font-black text-foreground text-sm uppercase tracking-widest">{currentContent.sections[2].workerPrivacy}</h3>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      {currentContent.sections[2].workerPrivacyDesc}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-foreground text-sm uppercase tracking-widest">{currentContent.sections[2].employerPrivacy}</h3>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      {currentContent.sections[2].employerPrivacyDesc}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black">4</div>
                <h2 className="text-2xl font-black font-headline uppercase tracking-tight">{currentContent.sections[3].title}</h2>
              </div>
              <div className="space-y-4 pl-4 border-l-4 border-primary/10">
                <p className="font-black text-foreground">{currentContent.sections[3].boldText}</p>
                <p className="font-medium text-muted-foreground leading-relaxed">
                  {currentContent.sections[3].desc1}
                </p>
                <p className="font-medium text-muted-foreground leading-relaxed">
                  {currentContent.sections[3].desc2}
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black">5</div>
                <h2 className="text-2xl font-black font-headline uppercase tracking-tight">{currentContent.sections[4].title}</h2>
              </div>
              <div className="space-y-4 pl-4 border-l-4 border-primary/10">
                <p className="font-medium text-muted-foreground leading-relaxed">
                  {currentContent.sections[4].desc1}
                </p>
                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                  <p className="text-sm font-bold text-amber-900 leading-relaxed italic">
                    {currentContent.sections[4].warning}
                  </p>
                </div>
                <p className="font-black text-foreground leading-relaxed">
                  {currentContent.sections[4].boldText}
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black">6</div>
                <h2 className="text-2xl font-black font-headline uppercase tracking-tight">{currentContent.sections[5].title}</h2>
              </div>
              <div className="space-y-6 pl-4 border-l-4 border-primary/10">
                <p className="font-medium text-muted-foreground">
                  {currentContent.sections[5].desc}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 bg-muted/30 p-5 rounded-2xl flex items-center gap-4 border border-dashed cursor-pointer" onClick={() => window.open('https://wa.me/917305505311')}>
                    <MessageCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">WhatsApp Support</p>
                      <p className="text-xl font-black text-primary">917305505311</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-muted/30 p-5 rounded-2xl flex items-center gap-4 border border-dashed cursor-pointer" onClick={() => router.push('/support')}>
                    <ShieldAlert className="w-8 h-8 text-red-600" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Report a Problem</p>
                      <p className="text-xl font-black text-primary">nextirupur.in/support</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </CardContent>
        </Card>

        <div className="text-center py-8">
           <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em]">
             © {new Date().getFullYear()} NexTirupur.in Legal Division
           </p>
        </div>
      </main>
    </div>
  );
}

