import React from 'react';

const AudienceSwitcher = ({ activeAudience, audiences, onChange }) => {
  const activeIndex = audiences.findIndex((audience) => audience.id === activeAudience);

  const focusTab = (id) => {
    window.requestAnimationFrame(() => {
      document.getElementById(`${id}-tab`)?.focus();
    });
  };

  const handleKeyDown = (event) => {
    const lastIndex = audiences.length - 1;
    let nextIndex = activeIndex;

    if (event.key === 'ArrowRight') {
      nextIndex = activeIndex === lastIndex ? 0 : activeIndex + 1;
    }

    if (event.key === 'ArrowLeft') {
      nextIndex = activeIndex === 0 ? lastIndex : activeIndex - 1;
    }

    if (event.key === 'Home') {
      nextIndex = 0;
    }

    if (event.key === 'End') {
      nextIndex = lastIndex;
    }

    if (nextIndex !== activeIndex) {
      event.preventDefault();
      onChange(audiences[nextIndex].id);
      focusTab(audiences[nextIndex].id);
    }
  };

  return (
    <div
      className="about-audience-switcher"
      role="tablist"
      aria-label="Выберите сценарий использования TravelPay"
      onKeyDown={handleKeyDown}
    >
      {audiences.map((audience) => {
        const isActive = activeAudience === audience.id;

        return (
          <button
            aria-controls={`${audience.id}-panel`}
            aria-selected={isActive}
            className={`about-audience-switcher__button${isActive ? ' is-active' : ''}`}
            id={`${audience.id}-tab`}
            key={audience.id}
            onClick={() => onChange(audience.id)}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            <span>{audience.kicker}</span>
            {audience.label}
          </button>
        );
      })}
    </div>
  );
};

export default AudienceSwitcher;
