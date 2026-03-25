export function initSidebar(): void {
  document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tabId = `tab-${btn.dataset.tab}`;
      document.getElementById(tabId)?.classList.add('active');
    });
  });
}

export function openSidebar(): void {
  document.getElementById('sidebar')!.classList.add('open');
}

export function updateAlertBanner(distKm: number, zoneLabel: string): void {
  document.getElementById('alert-sub')!.textContent =
    `You are ${distKm.toFixed(1)}km from the blast. ${zoneLabel}`;
}
