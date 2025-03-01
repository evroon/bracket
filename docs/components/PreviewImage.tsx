import Image from "next/image";
import preview from "../content/img/bracket-screenshot-design.png";

export const PreviewImage = () => {
  return (
    <section className="container place-items-center py-20">
      <Image
        alt="Design of the Bracket dashboard"
        src={preview.src}
        width={1000}
        height={1000}
      />
    </section>
  );
};
