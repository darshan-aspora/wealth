"use client";

import { NewsAccordion } from "./news-accordion";
import { US_NEWS } from "../data";

export function NewsTab() {
  return (
    <div className="px-5 pb-8 pt-5">
      <NewsAccordion
        title="Market News"
        items={US_NEWS}
        sourceCount={47}
      />
    </div>
  );
}
