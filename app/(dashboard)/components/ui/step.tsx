import React, { useState, useEffect } from "react";

const steps = [
  {
    title: "STEP 1",
    description: "Currate your list.",
    icon: (
      <path d="M4 6h16M4 12h16M4 18h16" />
    ),
    img: "https://dummyimage.com/1200x500/000/fff&text=Step+1",
  },
  {
    title: "STEP 2",
    description: "Add dates & notes.",
    icon: (
      <>
        <path d="M8 7V3H4a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2V7H8z" />
        <path d="M18 2l4 4" />
      </>
    ),
    img: "https://dummyimage.com/1200x500/111/fff&text=Step+2",
  },
  {
    title: "STEP 3",
    description: "Receive currated cards by mail",
    icon: (
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z" />
    ),
    img: "https://dummyimage.com/1200x500/222/fff&text=Step+3",
  },
  {
    title: "STEP 4",
    description: "Sign and Drop it in the mailbox",
    icon: (
      <>
        <path d="M4 4h16v16H4z" />
        <path d="M22 4L12 14.01 2 4" />
      </>
    ),
    img: "https://dummyimage.com/1200x500/333/fff&text=Step+4",
  },
  {
    title: "Thoughtfulness without the mental load",
    description: "Never forget a birthday, anniversary, or holiday again!",
    icon: (
      <>
        <path d="M12 20l9-5-9-5-9 5 9 5z" />
        <path d="M12 12l9-5-9-5-9 5 9 5z" />
      </>
    ),
    img: "https://dummyimage.com/1200x500/444/fff&text=Finish",
  },
];

const Step = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % steps.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [paused]);

  const handleClick = (index: number) => {
    setCurrent(index);
    setPaused(true);
    setTimeout(() => setPaused(false), 10000);
  };

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto flex flex-wrap">
        <div className="flex flex-wrap w-full">
          <div className="lg:w-2/5 md:w-1/2 md:pr-10 md:py-6">
            {steps.map((step, i) => (
              <div key={i} className="flex relative cursor-pointer pb-12" onClick={() => handleClick(i)}>
                {i !== steps.length - 1 && (
                  <div className="h-full w-10 absolute inset-0 flex items-center justify-center">
                    <div className={`h-full w-1 ${current === i ? "bg-blue-700" : "bg-gray-200"} pointer-events-none`}></div>
                  </div>
                )}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${
                  current === i ? "bg-blue-700" : "bg-blue-500"
                } inline-flex items-center justify-center text-white relative z-10`}>
                  <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                    {step.icon}
                  </svg>
                </div>
                <div className="flex-grow pl-4">
                  <h2 className="font-medium title-font text-sm text-gray-900 mb-1 tracking-wider">{step.title}</h2>
                  <p className="leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <img
            className="lg:w-3/5 md:w-1/2 object-cover object-center rounded-lg md:mt-0 mt-12 transition duration-500"
            src={steps[current].img}
            alt={`step-${current}`}
          />
        </div>
      </div>
    </section>
  );
};

export default Step;