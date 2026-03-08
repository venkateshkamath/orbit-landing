import { useState } from "react";
import "./HowItWorks.css";

const steps = [
  {
    label: "Choose Date",
    title: "Date details",
    desc: "Select your preferred travel dates."
  },
  {
    label: "Choose Campsite",
    title: "Campsite details",
    desc: "Choose your campsite location."
  },
  {
    label: "Choose RV",
    title: "RV details",
    desc: "Pick the RV that fits your needs."
  },
  {
    label: "Booking Check",
    title: "Booking review",
    desc: "Confirm everything before booking."
  }
];

export default function HowItWorks(){

  const [step,setStep] = useState(2);

  const progressWidth = (step/(steps.length-1))*100;

  return(
    <section className="how">

      <div className="progress-wrapper">

        {/* grey background line */}
        <div className="progress-line"></div>

        {/* green progress */}
        <div
          className="progress-fill"
          style={{width:`${progressWidth}%`}}
        ></div>

        {/* steps */}
        <div className="steps">

  {steps.map((s,i)=>{

    const completed = i < step;
    const active = i === step;

    return(
      <div
        key={i}
        className="step"
        onClick={()=>setStep(i)}
      >

        <div className={`circle
        ${completed ? "completed":""}
        ${active ? "active":""}`}>
          {completed ? "✓" : i+1}
        </div>

        <span
          className={`label ${active ? "label-active":""}`}
        >
          {s.label}
        </span>

      </div>
    )
  })}

</div>

      </div>


      {/* cards */}

      <div className="cards">

        {steps.map((s,i)=>(
          <div
            key={i}
            className={`card ${i===step ? "visible":""}`}
          >
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}

      </div>

    </section>
  )
}