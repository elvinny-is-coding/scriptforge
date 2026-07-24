// components/projects/ProjectCard.tsx
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatDistanceToNow } from "@/lib/utils/format";

interface ProjectCardProps {
  id: string;
  title: string;
  updatedAt: string;
}

export function ProjectCard({ id, title, updatedAt }: ProjectCardProps) {
  return (
    <Link href={`/project/${id}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>
            Updated {formatDistanceToNow(updatedAt)}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
