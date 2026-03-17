import { notFound } from "next/navigation";

import VirtueDetail from "@/components/VirtueDetail";
import { getVirtueById, getVirtueFocusForWeek } from "@/lib/db/queries";
import { getCurrentWeekStart } from "@/lib/utils/dates";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function parseVirtueId(value: string): number | null {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > 13) {
    return null;
  }

  return parsedValue;
}

export default async function VirtuePage({ params }: PageProps) {
  const { id } = await params;
  const virtueId = parseVirtueId(id);

  if (!virtueId) {
    notFound();
  }

  const [virtue, focusVirtue] = await Promise.all([
    getVirtueById(virtueId),
    getVirtueFocusForWeek(getCurrentWeekStart()),
  ]);

  if (!virtue) {
    notFound();
  }

  return (
    <VirtueDetail
      virtue={virtue}
      isCurrentFocus={focusVirtue.id === virtue.id}
    />
  );
}
