import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ReactElement } from "react";
import { RiTeamFill } from "react-icons/ri";
import { PiTreeStructure } from "react-icons/pi";
import { BsCalendar4Week } from "react-icons/bs";
import { MdOutlineScoreboard } from "react-icons/md";

interface FeatureProps {
  icon: ReactElement;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <RiTeamFill fill={"#a581e9"} size={64} />,
    title: "Add teams",
    description:
      "Register teams (and optionally players). You can upload a CSV file with all teams and players at once.",
  },
  {
    icon: <PiTreeStructure fill={"#a581e9"} size={64} />,
    title: "Choose format",
    description:
      "Add swiss, elimination or round-robing items to the tournament. Multiple stages are supported.",
  },
  {
    icon: <BsCalendar4Week fill={"#a581e9"} size={64} />,
    title: "Schedule matches",
    description:
      "Use the drag&drop interface to choose the courts and start times of the matches.",
  },
  {
    icon: <MdOutlineScoreboard fill={"#a581e9"} size={64} />,
    title: "Track scores & publish",
    description:
      "Enter the scores, customize the ranking and show it to the world on a dashboard.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="howItWorks" className="container text-center py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold ">
        How It{" "}
        <span className="bg-linear-to-b from-primary/70 to-primary text-transparent bg-clip-text">
          Works{" "}
        </span>
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground"></p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card key={title} className="bg-muted/50">
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
