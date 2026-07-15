import React from 'react';

const HowItWorksSteps = ({ steps }) => (
  <div className="about-steps" aria-label="Как работает TravelPay">
    {steps.map((step, index) => (
      <article className="about-step" key={step.title} style={{ '--step-delay': `${index * 80}ms` }}>
        <span className="about-step__number">{String(index + 1).padStart(2, '0')}</span>
        <div>
          <h4>{step.title}</h4>
          <p>{step.text}</p>
        </div>
      </article>
    ))}
  </div>
);

export default HowItWorksSteps;
