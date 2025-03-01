export const About = () => {
  return (
    <section id="about" className="container py-16">
      <div className="bg-muted/50 border border-border rounded-lg py-12">
        <div className="px-6 flex flex-col-reverse md:flex-row gap-8 md:gap-12">
          {/*<Image*/}
          {/*  width={100}*/}
          {/*  height={100}*/}
          {/*  src={logo.src}*/}
          {/*  alt=""*/}
          {/*  className="w-[200px] object-contain rounded-lg"*/}
          {/*/>*/}
          <div className="bg-green-0 flex flex-col justify-between">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-linear-to-b from-primary/70 to-primary text-transparent bg-clip-text">
                About{" "}
              </span>
              Bracket
            </h2>
            <p className="text-xl text-muted-foreground mt-4">
              There are many tournament management systems available online.
              However, only few (if any) are open-source and free to use, while
              still being feature-rich. Bracket aims to fill this gap. Bracket
              enables you to set up a tournament with as much flexibility as
              possible, while still being easy to use.
            </p>

            {/*<Statistics />*/}
          </div>
        </div>
      </div>
    </section>
  );
};
