"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AboutSectionProps {
  symbol: string;
  name: string;
}

const COMPANY_DESCRIPTIONS: Record<string, string> = {
  AAPL: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables including Apple Watch and AirPods. It also provides AppleCare support, cloud services, and operates platforms including the App Store, Apple Music, Apple TV+, Apple Arcade, Apple Fitness+, and Apple Pay. Apple was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in 1976 and is headquartered in Cupertino, California. The company is widely regarded as one of the most valuable and influential technology companies in the world.",
  MSFT: "Microsoft Corporation develops and supports software, services, devices, and solutions worldwide. The company operates through Intelligent Cloud, Productivity and Business Processes, and More Personal Computing segments. It offers Office 365, LinkedIn, Dynamics 365, Azure cloud platform, Windows, Xbox, and Surface devices. Microsoft also provides GitHub, Visual Studio, and enterprise consulting services. Founded by Bill Gates and Paul Allen in 1975, the company is headquartered in Redmond, Washington and has grown into one of the largest software makers globally.",
  GOOGL: "Alphabet Inc. is a holding company that provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. The company operates through Google Services, Google Cloud, and Other Bets segments. It offers Search, YouTube, Android, Chrome, Gmail, Google Maps, Google Play, and hardware products including Pixel phones and Nest smart home devices. Alphabet was founded in 1998 by Larry Page and Sergey Brin while they were Ph.D. students at Stanford University. The company is headquartered in Mountain View, California.",
  AMZN: "Amazon.com, Inc. engages in the retail sale of consumer products, advertising, and subscription services through online and physical stores worldwide. The company operates through North America, International, and Amazon Web Services segments. It sells merchandise and content purchased for resale, as well as products offered by third-party sellers. Amazon also provides AWS cloud computing, storage, and database services, along with Alexa voice assistant, Prime Video, Kindle, and Ring home security products. The company was founded by Jeff Bezos in 1994 and is headquartered in Seattle, Washington.",
  NVDA: "NVIDIA Corporation provides graphics and compute and networking solutions in the United States, Taiwan, China, Hong Kong, and internationally. The company operates through two segments: Graphics and Compute & Networking. It offers GeForce GPUs for gaming, Quadro for enterprise design, and data center GPUs for AI training and inference including the H100 and A100 accelerators. NVIDIA also provides CUDA, TensorRT, and networking solutions through Mellanox. Founded by Jensen Huang, Chris Malachowsky, and Curtis Priem in 1993, the company is headquartered in Santa Clara, California and has become the leading provider of AI computing infrastructure.",
  META: "Meta Platforms, Inc. develops products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide. The company operates in two segments: Family of Apps and Reality Labs. It offers Facebook, Instagram, Messenger, WhatsApp, and Threads social platforms, as well as Meta Quest VR headsets and Ray-Ban Meta smart glasses. Meta is investing heavily in the metaverse and artificial intelligence. The company was founded by Mark Zuckerberg in 2004 and is headquartered in Menlo Park, California.",
  TSLA: "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally. The company operates through Automotive, Energy Generation and Storage, and Services and Other segments. It produces the Model 3, Model Y, Model S, Model X, Cybertruck, and Semi vehicles. Tesla also manufactures solar panels, Solar Roof tiles, and Powerwall batteries. The company builds and operates Supercharger stations and develops full self-driving autonomous technology. Founded by Elon Musk, Martin Eberhard, Marc Tarpenning, JB Straubel, and Ian Wright in 2003, Tesla is headquartered in Austin, Texas.",
  AMD: "Advanced Micro Devices, Inc. operates as a semiconductor company worldwide. The company operates through Data Center, Client, Gaming, and Embedded segments. It offers server microprocessors (EPYC), GPUs and accelerators (Instinct), desktop and notebook processors (Ryzen), and semi-custom game console chips. AMD also provides adaptive computing products through Xilinx, including FPGAs and adaptive SoCs. The company competes directly with Intel in CPUs and NVIDIA in GPUs for data center AI workloads. Founded in 1969 by Jerry Sanders, AMD is headquartered in Santa Clara, California.",
  JPM: "JPMorgan Chase & Co. operates as a financial services company worldwide. The company operates through four segments: Consumer & Community Banking, Corporate & Investment Bank, Commercial Banking, and Asset & Wealth Management. It offers deposit, investment, lending, payments, and card products to consumers and small businesses. JPMorgan also provides corporate advisory, equity and debt underwriting, trading, treasury services, and wealth management. It is the largest bank in the United States by total assets. The company was formed through the merger of J.P. Morgan & Co. and Chase Manhattan Corporation in 2000 and is headquartered in New York City.",
  NFLX: "Netflix, Inc. provides entertainment services worldwide. The company offers TV series, documentaries, feature films, and games across a wide variety of genres and languages through a subscription-based streaming model. Members can watch content on internet-connected devices including TVs, computers, and mobile devices. Netflix produces original content through Netflix Studios and acquires programming from third-party creators. The company has expanded into live events, gaming, and advertising-supported tiers. Founded by Reed Hastings and Marc Randolph in 1997, Netflix is headquartered in Los Gatos, California and serves over 260 million paid subscribers globally.",
  QQQ: "Invesco QQQ Trust is an exchange-traded fund that tracks the NASDAQ-100 Index, providing exposure to 100 of the largest non-financial companies listed on the NASDAQ exchange. The fund is heavily weighted toward technology and communication services companies, making it a popular vehicle for investors seeking growth-oriented large-cap US equity exposure. Managed by Invesco, QQQ is one of the most actively traded ETFs globally and is widely used for both long-term investing and short-term tactical positioning.",
  SPY: "SPDR S&P 500 ETF Trust is an exchange-traded fund designed to track the performance of the S&P 500 Index, offering broad exposure to large-cap US equities across multiple sectors. Managed by State Street Global Advisors, SPY is the oldest US-listed ETF and remains one of the largest and most liquid ETFs in the world. It is commonly used by institutions and retail investors alike as a core portfolio holding and a benchmark for the US equity market.",
  IWM: "iShares Russell 2000 ETF is an exchange-traded fund that seeks to track the Russell 2000 Index, representing 2,000 small-cap US companies. Managed by BlackRock, IWM is widely used as a proxy for the domestic small-cap segment and is often viewed as a gauge of US economic sensitivity and risk appetite. The fund offers diversified access to smaller businesses across sectors, with higher volatility than broad large-cap ETFs.",
  GLD: "SPDR Gold Shares is an exchange-traded fund that holds physical gold bullion and aims to reflect the performance of the price of gold, less expenses. Managed by State Street, GLD is one of the most recognized gold-backed ETFs in the world and provides investors with convenient exposure to gold without the need to store or insure physical bars or coins. It is commonly used as a hedge against inflation, currency weakness, and geopolitical risk.",
  VTI: "Vanguard Total Stock Market ETF is an exchange-traded fund that tracks the CRSP US Total Market Index, providing exposure to nearly the entire investable US stock market including large-, mid-, small-, and micro-cap companies. Managed by Vanguard, VTI is known for its extremely low expense ratio and is frequently used as a foundational holding in long-term diversified portfolios. The fund offers broad market coverage with a structure optimized for low-cost passive investing.",
};

export default function AboutSection({ symbol, name }: AboutSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const description = COMPANY_DESCRIPTIONS[symbol];

  if (!description) {
    return (
      <div className="px-5 py-4">
        <h2 className="mb-3 text-[17px] font-semibold text-foreground">
          About {name}
        </h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground italic">
          Company description not available.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <h2 className="mb-3 text-[17px] font-semibold text-foreground">
        About {name}
      </h2>

      <div className="relative">
        <motion.div
          initial={false}
          animate={{ height: expanded ? "auto" : "7.5rem" }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="overflow-hidden"
        >
          <p className="text-[15px] leading-[1.65] text-foreground/80">
            {description}
          </p>
        </motion.div>

        <AnimatePresence>
          {!expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent"
            />
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-1.5 flex items-center gap-1 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {expanded ? "Show less" : "Read more"}
        <ChevronDown
          size={14}
          className={cn(
            "transition-transform duration-300",
            expanded && "rotate-180"
          )}
        />
      </button>
    </div>
  );
}
