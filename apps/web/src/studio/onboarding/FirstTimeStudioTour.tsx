import { useEffect, useState } from 'react';
import { StudioButton, StudioCard } from '../design-system/StudioDesignSystem';

const storageKey = 'redios.studio.onboarding.completed';
const tourSteps = [
  'Create your business application',
  'Define the information you manage',
  'Design how users interact',
  'Add business rules',
  'Launch',
];

export function FirstTimeStudioTour() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(storageKey) !== 'true');
  }, []);

  function completeTour() {
    window.localStorage.setItem(storageKey, 'true');
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <StudioCard>
      <div className="studio-onboarding-tour">
        <div>
          <span className="studio-kicker">Welcome</span>
          <h3>Welcome to RediOS Studio</h3>
          <p>Build a business application by describing what you manage, how people use it, and when it should go live.</p>
        </div>
        <ol>
          {tourSteps.map((tourStep) => (
            <li key={tourStep}>{tourStep}</li>
          ))}
        </ol>
        <StudioButton onClick={completeTour}>Start Building</StudioButton>
      </div>
    </StudioCard>
  );
}
