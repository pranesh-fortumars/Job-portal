"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  MessageCircle, 
  ArrowLeft, 
  Zap, 
  Briefcase, 
  ExternalLink,
  Building2,
  Users,
  ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function CommunitiesPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const staffChannels = [
    { name: "Fabric Jobs", link: "https://whatsapp.com/channel/0029Vb7ugkA1t90YQTfvzl0Q", desc: "Fabric follow-up, management & quality roles." },
    { name: "Print & Embroidery Jobs", link: "https://whatsapp.com/channel/0029VbCd6MY6rsQtkAR1ek0L", desc: "Screen printing and machine embroidery staff roles." },
    { name: "Production Jobs", link: "https://whatsapp.com/channel/0029Vb7seZqDjiOdJ1NEoX0U", desc: "Floor incharges, supervisors & production managers." },
    { name: "Quality Jobs", link: "https://whatsapp.com/channel/0029VbDJLoWI7BeL8fYI6I0D", desc: "Quality control, AQL & finishing management." },
    { name: "HR & Admin Jobs", link: "https://whatsapp.com/channel/0029VbD4ETE1NCrVGoXiGP35", desc: "Human resources, recruitment & office admin roles." },
    { name: "Accounts & Documentation Jobs", link: "https://whatsapp.com/channel/0029VbC9xmg1Hsq5OhdJDB2H", desc: "Tally, documentation & export billing roles." },
    { name: "CAD & Sampling Jobs", link: "https://whatsapp.com/channel/0029Vb8RD1z3LdQaAh1BmN3K", desc: "Pattern masters, CAD designers & sampling heads." },
    { name: "ERP & EDP Jobs", link: "https://whatsapp.com/channel/0029VbDLB5h7j6gCpQXAww2q", desc: "ERP operators, data entry & IT support." },
    { name: "Store Jobs", link: "https://whatsapp.com/channel/0029VbCkh7eF6sn3XS3RL22P", desc: "Fabric store, trims store & inventory management." },
    { name: "Uncategorised Jobs", link: "https://whatsapp.com/channel/0029VbD1Fwj4IBhIhhoBIW3T", desc: "General staff requirements and miscellaneous roles." },
  ];

  const workerChannels = [
    { name: "Stitching Works", link: "https://whatsapp.com/channel/0029Vb7yRn5AYlULaDAaPC31", desc: "Overlock, Flatlock & Singer machine operators." },
    { name: "Cutting Works", link: "https://whatsapp.com/channel/0029Vb875q6CxoAze16Mib1t", desc: "Cutting masters, helpers & spreader operators." },
    { name: "Checking Works", link: "https://whatsapp.com/channel/0029Vb7IoOxL7UVUaurhpB0i", desc: "Trimmers, checkers & final inspection workers." },
    { name: "Ironing & Packing Works", link: "https://whatsapp.com/channel/0029Vb87MOC6BIEirEg2vR0K", desc: "Ironing masters, packers & needle detection staff." },
    { name: "Knitting Works", link: "https://whatsapp.com/channel/0029Vb8QDpr4SpkEnMs6FA20", desc: "Circular knitting & flat knitting machine operators." },
    { name: "Dyeing Works", link: "https://whatsapp.com/channel/0029VbCsPg4Dp2QGx9L2oz3u", desc: "Dyeing operators & winch/soft-flow helpers." },
    { name: "Compacting Works", link: "https://whatsapp.com/channel/0029VbD3RUfHwXbE7TODGD2j", desc: "Compacting and drying machine operators." },
    { name: "Print & Embroidery Works", link: "https://whatsapp.com/channel/0029Vb8FGokAe5VtKU7xYo1x", desc: "MHM printers, table printers & embroidery framers." },
    { name: "Uncategorised Works", link: "https://whatsapp.com/channel/0029VbDEe013WHTW0niebX1k", desc: "Miscellaneous worker roles and general factory help." },
  ];

  const ChannelGrid = ({ title, channels, icon: Icon }: { title: string, channels: any[], icon: any }) => (
    <div className="space-y-8">
      <div className="flex items-center gap-4 px-2">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
          <Icon className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-black font-headline tracking-tight">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((ch, idx) => (
          <Card key={idx} className="rounded-[2rem] overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col h-full bg-white">
            <CardHeader className="p-6 md:p-8 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">Channel</span>
              </div>
              <CardTitle className="text-xl font-black font-headline text-primary mb-2 line-clamp-2 leading-tight">NexTirupur {ch.name}</CardTitle>
              <CardDescription className="text-sm font-medium leading-relaxed italic text-muted-foreground/80 line-clamp-2">
                "{ch.desc}"
              </CardDescription>
            </CardHeader>
            <CardFooter className="p-6 md:p-8 pt-0">
              <Button 
                onClick={() => window.open(ch.link, '_blank')}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-black text-sm rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" /> {t.joinNow} <ExternalLink className="w-3.5 h-3.5 opacity-50" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-12 max-w-7xl mx-auto w-full space-y-16">
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.push('/')} className="font-bold text-primary gap-2 hover:bg-primary/5 rounded-xl">
            <ArrowLeft className="w-4 h-4" /> {t.backToPrev}
          </Button>
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner">
              <MessageCircle className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tight">
              {t.whatsappCommunity}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium">
              Join Tirupur's biggest industrial network. Choose specialized feeds for instant job alerts matching your skills.
            </p>
          </div>
        </div>

        <ChannelGrid title="Staff Job Channels" channels={staffChannels} icon={Briefcase} />
        <ChannelGrid title="Worker Job Channels" channels={workerChannels} icon={Users} />

        <div className="bg-primary/5 p-10 md:p-16 rounded-[3rem] text-center space-y-6 border border-dashed border-primary/20">
          <ShieldCheck className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-2xl font-bold font-headline">Community Guidelines</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
            Our channels are strictly for industrial recruitment and news. Official feeds are 100% free. Any request for money from third-party links should be reported immediately.
          </p>
        </div>
      </main>

      <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground/30 text-[10px] uppercase tracking-widest font-bold pb-12">
        © {new Date().getFullYear()} NexTirupur.in Official Channels.
      </div>
    </div>
  );
}
