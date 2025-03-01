import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import builder from "../content/img/builder_preview.png";
import Image from "next/image";
import { ReactElement } from "react";
import { MdDashboard } from "react-icons/md";
import { IoBuildOutline } from "react-icons/io5";
import { RiDragDropLine } from "react-icons/ri";

interface ServiceProps {
  title: string;
  description: string;
  icon: ReactElement;
}

const serviceList: ServiceProps[] = [
  {
    title: "Public Dashboard",
    description: "Show the schedule and rankings to the public.",
    icon: <MdDashboard size={48} />,
  },
  {
    title: "Flexible Tournament Builder",
    description:
      "Add multiple swiss, single elimination and round-robin elements to the tournament.",
    icon: <IoBuildOutline size={48} />,
  },
  {
    title: "Drag & Drop Interface",
    description:
      "Drag-and-drop matches to different courts or reschedule them to another start time.",
    icon: <RiDragDropLine size={48} />,
  },
];

export const Features = () => {
  return (
    <section className="container py-16">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-8 place-items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">Features</h2>

          <p className="text-muted-foreground text-xl mt-4 mb-8 ">
            Bracket is flexible, yet feature-rich.
          </p>

          <div className="flex flex-col gap-8">
            {serviceList.map(({ icon, title, description }: ServiceProps) => (
              <Card key={title}>
                <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
                  <div className="mt-1 bg-primary/50 p-1 rounded-2xl">
                    {icon}
                  </div>
                  <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="text-md mt-2">
                      {description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <Image
          width={200}
          height={200}
          src={builder.src}
          className="w-[500px] md:w-[600px] lg:w-[700px] pt-15 lg:pt-25 object-contain"
          alt="About services"
        />
      </div>
    </section>
  );
};
