import { ShelterFeature } from './types';

export function renderWalkingDirections(shelter: ShelterFeature): void {
  const props = shelter.properties;
  const steps = [
    'Head toward the nearest street and follow shelter signs',
    'Continue straight — stay on the sidewalk, avoid open areas',
    `Arrive at <strong>${props.name}</strong>`,
    'Enter immediately — do not stop or go back for belongings',
    `Move to the lowest level — <strong>${props.depthLevels} levels underground</strong>`,
    'Stay away from windows and outer walls',
    'Wait for official all-clear before leaving the shelter',
  ];

  const container = document.getElementById('directions-container')!;
  const list = document.getElementById('directions-list')!;

  container.classList.remove('hidden');
  list.innerHTML = steps
    .map((s, i) => `<li class="${i === 5 ? 'danger' : ''}">${s}</li>`)
    .join('');
}
