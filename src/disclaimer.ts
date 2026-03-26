/** Persisted when the user accepts the pre-app disclaimer (this device only). */
export const DISCLAIMER_STORAGE_KEY = 'nuclear-force-disclaimer-accepted';

export function isDisclaimerAccepted(): boolean {
  try {
    return localStorage.getItem(DISCLAIMER_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Shows a blocking modal until the user accepts, unless already accepted in localStorage.
 */
export function initDisclaimerModal(onAccept?: () => void): void {
  if (isDisclaimerAccepted()) {
    onAccept?.();
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'disclaimer-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'disclaimer-title');

  overlay.innerHTML = `
    <div class="disclaimer-modal">
      <div class="disclaimer-modal-header">
        <h2 id="disclaimer-title" class="disclaimer-modal-title">
          <span class="disclaimer-modal-icon" aria-hidden="true">⚠️</span>
          Important disclaimer — please read
        </h2>
        <p class="disclaimer-modal-sub">You must acknowledge these terms before using this application.</p>
      </div>
      <div class="disclaimer-modal-body">
        <div class="disclaimer-callout disclaimer-callout--yellow">
          <p class="disclaimer-callout-title">For educational and preparedness planning only</p>
          <p class="disclaimer-callout-text">
            Nuclear Force is a simulation and educational tool for general awareness and emergency preparedness planning.
            It is not an official emergency management system and is not endorsed by any government agency.
          </p>
        </div>

        <div class="disclaimer-block">
          <p class="disclaimer-block-title">No liability for decisions</p>
          <p class="disclaimer-block-text">
            The developers, contributors, and operators of this application accept no responsibility or liability for any
            decisions made, actions taken, or harm resulting from the use of or reliance on the information provided by this tool.
            Never use this application as your sole source of guidance during an actual emergency.
          </p>
        </div>

        <div class="disclaimer-block">
          <p class="disclaimer-block-title">Third-party data — no accuracy guarantee</p>
          <p class="disclaimer-block-text">
            This application uses data from third-party sources including
            <strong>OpenStreetMap</strong> map tiles,
            <strong>Nominatim</strong> (OpenStreetMap) for address geocoding, and your browser’s
            <strong>GPS</strong> when you choose that option.
            The accuracy, completeness, timeliness, or fitness for purpose of this data is not guaranteed.
            Geocoded addresses and positions may be delayed, incorrect, or unavailable at any given time.
            We make no representations about the accuracy of blast radius estimates, shelter information, or any other data displayed.
          </p>
        </div>

        <div class="disclaimer-block">
          <p class="disclaimer-block-title">Simulated data and approximations</p>
          <p class="disclaimer-block-text">
            Wind direction used for fallout visualization is a configurable default, not live weather data.
            Blast radius calculations are simplified approximations based on publicly available models and are not derived from
            classified or official government sources. Shelter information, capacity figures, and depth ratings are approximations
            and may not reflect current conditions. Routes shown on the map are straight-line paths for illustration and do not
            represent turn-by-turn navigation, road closures, real-time conditions, infrastructure damage, or official evacuation orders.
          </p>
        </div>

        <div class="disclaimer-callout disclaimer-callout--red">
          <p class="disclaimer-callout-title">In a real emergency</p>
          <ul class="disclaimer-emergency-list">
            <li>
              Follow instructions from <strong>NYC Office of Emergency Management (NYC OEM)</strong> at
              <a href="https://www.nyc.gov/site/emergency/index.page" target="_blank" rel="noopener noreferrer">nyc.gov/emergency</a>
            </li>
            <li>
              Follow guidance from <strong>FEMA</strong> at
              <a href="https://www.ready.gov" target="_blank" rel="noopener noreferrer">ready.gov</a> and on official emergency broadcast channels
            </li>
            <li>Tune to AM radio, TV, or Wireless Emergency Alerts (WEA) on your phone for official instructions</li>
            <li>
              Call <strong>911</strong> only for life-threatening emergencies — do not call to ask for evacuation advice
            </li>
          </ul>
        </div>

        <div class="disclaimer-block">
          <p class="disclaimer-block-title">NYC emergency law context</p>
          <p class="disclaimer-block-text">
            New York City has specific emergency laws and protocols governing public response to radiological, nuclear, and other
            mass casualty events. During a declared emergency, you may be required to follow orders issued by the Mayor of New York City,
            the Governor of New York, or designated emergency management officials. This application does not override, supplement,
            or replace any such official order.
          </p>
        </div>

        <div class="disclaimer-block">
          <p class="disclaimer-block-title">No warranties</p>
          <p class="disclaimer-block-text">
            This application is provided “as is” without warranty of any kind, express or implied. Use of this application is entirely at your own risk.
          </p>
        </div>

        <p class="disclaimer-version">Disclaimer version 1.0 — Last updated March 2026.</p>
      </div>
      <div class="disclaimer-modal-footer">
        <button type="button" class="disclaimer-accept-btn" id="disclaimer-accept-btn">
          I understand &amp; accept — continue to app
        </button>
        <p class="disclaimer-footer-note">
          By clicking above you confirm you have read and understood this disclaimer.
          Your acceptance is stored locally and you will not be shown this again on this device.
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const acceptBtn = overlay.querySelector('#disclaimer-accept-btn') as HTMLButtonElement;
  acceptBtn.addEventListener('click', () => {
    try {
      localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
    } catch {
      /* ignore quota / private mode */
    }
    overlay.remove();
    onAccept?.();
  });
}
