import type { ReactNode } from "react";
import { Badge } from "@template/ui/primitives/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@template/ui/primitives/card";

/**
 * The card every checklist entry renders as, plus its two status badges.
 * Shared by the three section files.
 */
function Covered() {
  return (
    <Badge variant="success" className="font-normal">
      Covered
    </Badge>
  );
}

function Gap() {
  return (
    <Badge variant="secondary" className="font-normal">
      Not covered yet
    </Badge>
  );
}

export function Item({
  id,
  title,
  why,
  covers,
  gaps,
  extra,
  covered = true,
}: {
  id: string;
  title: string;
  why: string;
  covers: string[];
  gaps: string;
  extra?: ReactNode;
  covered?: boolean;
}) {
  return (
    <Card id={id} className="scroll-mt-24">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {covered ? <Covered /> : <Gap />}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{why}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {covers.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold mb-2">How geoaeo covers it</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground leading-relaxed">
              {covers.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {extra}
        <div>
          <h3 className="text-sm font-semibold mb-2">Not covered yet</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{gaps}</p>
        </div>
      </CardContent>
    </Card>
  );
}
