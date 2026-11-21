import Image from "next/image";
import type { ProjectSite } from "@/explorer/types";
import { fillSite, siteHost } from "./format";

/** Screenshots are captured at 1440×900 and stored at 1280×800 (16:10). */
const PREVIEW_WIDTH_PX = 1280;
const PREVIEW_HEIGHT_PX = 800;

interface Props {
  site: ProjectSite;
  /** Dictionary template with a "{site}" placeholder, used as the image's alt text. */
  altTemplate: string;
  /** Responsive `sizes` for the layout the preview sits in. */
  sizes: string;
}

/** A live site's screenshot inside a minimal browser window. Purely visual: the caller makes it clickable. */
export function SitePreview({ site, altTemplate, sizes }: Props) {
  const host = siteHost(site.href);
  return (
    <span className="block overflow-hidden rounded-xl border border-rule bg-surface shadow-[0_18px_40px_-24px_rgb(0_0_0/0.6)] transition duration-300 group-hover:-translate-y-1 group-hover:border-muted group-focus-visible:-translate-y-1">
      <span className="flex items-center gap-1.5 border-b border-rule bg-raised px-3 py-2" aria-hidden="true">
        <i className="size-2 rounded-full bg-rule" />
        <i className="size-2 rounded-full bg-rule" />
        <i className="size-2 rounded-full bg-rule" />
        <span className="ml-2 truncate text-xs text-muted">{host}</span>
      </span>
      <Image
        src={site.preview}
        width={PREVIEW_WIDTH_PX}
        height={PREVIEW_HEIGHT_PX}
        alt={fillSite(altTemplate, host)}
        sizes={sizes}
        className="block aspect-[16/10] w-full object-cover object-top"
      />
    </span>
  );
}
