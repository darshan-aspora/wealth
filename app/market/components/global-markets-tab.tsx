"use client";

import { useState } from "react";
import { MarketTable, ChangeCell, type TableColumn } from "./market-table";
import { SubTabs } from "./sub-tabs";
import { SectionHeader, SectionDivider } from "./section-header";
import { NewsAccordion } from "./news-accordion";
import { GLOBAL_INDICES, COMMODITIES, CURRENCIES, GLOBAL_NEWS, type GlobalRow } from "../data";

// ---- Global table columns (Name+subtitle, Last, Change, Change%, DayRange) ----
function makeGlobalColumns(nameLabel: string): TableColumn<GlobalRow>[] {
  return [
    {
      key: "name", label: nameLabel, align: "left", frozen: true, minWidth: 160,
      render: (r) => (
        <div>
          <div className="text-[14px] font-semibold text-foreground">{r.name}</div>
          <div className="text-[12px] text-muted-foreground">{r.subtitle}</div>
        </div>
      ),
    },
    { key: "last", label: "Last", align: "right", render: (r) => <span className="font-mono tabular-nums font-semibold text-foreground">{r.last}</span> },
    { key: "change", label: "Change", align: "right", render: (r) => <ChangeCell value={r.change} isUp={r.isUp} /> },
    { key: "changePct", label: "Change %", align: "right", render: (r) => <ChangeCell value={r.changePct} isUp={r.isUp} /> },
    { key: "dayRange", label: "Day Range", align: "right", render: (r) => <span className="text-[12px] font-mono tabular-nums text-muted-foreground">{r.dayRange}</span> },
  ];
}

// Crypto has Market Cap instead of Day Range
const cryptoColumns: TableColumn<GlobalRow>[] = [
  {
    key: "name", label: "Name", align: "left", frozen: true, minWidth: 150,
    render: (r) => (
      <div>
        <div className="text-[14px] font-semibold text-foreground">{r.name}</div>
        <div className="text-[12px] text-muted-foreground">{r.subtitle}</div>
      </div>
    ),
  },
  { key: "last", label: "Price", align: "right", render: (r) => <span className="font-mono tabular-nums font-semibold text-foreground">{r.last}</span> },
  { key: "change", label: "Change", align: "right", render: (r) => <ChangeCell value={r.change} isUp={r.isUp} /> },
  { key: "changePct", label: "Change %", align: "right", render: (r) => <ChangeCell value={r.changePct} isUp={r.isUp} /> },
  { key: "mktcap", label: "Mkt Cap", align: "right", render: (r) => <span className="font-mono tabular-nums text-muted-foreground">{r.marketCap || r.dayRange}</span> },
];

const INDEX_TABS = Object.keys(GLOBAL_INDICES);
const COMMODITY_TABS = Object.keys(COMMODITIES);
const CURRENCY_TABS = Object.keys(CURRENCIES);

const indicesColumns = makeGlobalColumns("Name");
const commodityColumns = makeGlobalColumns("Name");
const currencyColumns = makeGlobalColumns("Pair");

export function GlobalMarketsTab() {
  const [idxTab, setIdxTab] = useState(INDEX_TABS[0]);
  const [commTab, setCommTab] = useState(COMMODITY_TABS[0]);
  const [currTab, setCurrTab] = useState(CURRENCY_TABS[0]);

  const isCrypto = currTab === "Crypto";

  return (
    <div className="pb-8">
      {/* Global Indices */}
      <div className="px-5 pt-5">
        <SectionHeader
          title="Global Indices"
          subtitle="Track major indices across world markets"
        />
        <SubTabs tabs={INDEX_TABS} activeTab={idxTab} onTabChange={setIdxTab} layoutId="global-idx" />
        <MarketTable columns={indicesColumns} data={GLOBAL_INDICES[idxTab]} />
      </div>

      <SectionDivider />

      {/* Commodities */}
      <div className="px-5">
        <SectionHeader
          title="Commodities"
          subtitle="Precious metals, energy & industrial commodities"
        />
        <SubTabs tabs={COMMODITY_TABS} activeTab={commTab} onTabChange={setCommTab} layoutId="global-comm" />
        <MarketTable columns={commodityColumns} data={COMMODITIES[commTab]} />
      </div>

      <SectionDivider />

      {/* Currencies */}
      <div className="px-5">
        <SectionHeader
          title="Currencies"
          subtitle="Foreign exchange rates & cryptocurrency prices"
        />
        <SubTabs tabs={CURRENCY_TABS} activeTab={currTab} onTabChange={setCurrTab} layoutId="global-curr" />
        <MarketTable
          columns={isCrypto ? cryptoColumns : currencyColumns}
          data={CURRENCIES[currTab]}
        />
      </div>

      <SectionDivider />

      {/* Global Market Summary */}
      <div className="px-5">
        <NewsAccordion
          title="Market Summary"
          subtitle="AI-curated global headlines with expandable summaries"
          items={GLOBAL_NEWS}
          sourceCount={38}
        />
      </div>
    </div>
  );
}
