import { openModal, closeModal } from './modals.js';

export function initializeModal() {
  const container = document.getElementById('modalsContainer');
  if (!container) return;
  const html = `
    <div class="modalWrap" id="modalCompanyInfo">
      <div class="modal">
        <div class="modalHead">
          <div><h2>Company Vision & Mission</h2><p>Our company goals and objectives</p></div>
          <button class="closeX">✕</button>
        </div>
        <div class="companyMission">
          <h3>Our Vision</h3>
          <p>To become the leading investment management company in the region, providing innovative financial solutions and creating sustainable value for our members and stakeholders through transparent operations and ethical business practices.</p>
          <h3>Our Mission</h3>
          <p>1. To provide secure and profitable investment opportunities for our members</p>
          <p>2. To maintain 100% transparency in all financial transactions</p>
          <p>3. To ensure timely profit distribution to all shareholders</p>
          <p>4. To foster long-term relationships with members through excellent service</p>
          <p>5. To contribute to economic growth through responsible investments</p>
          <h3>Core Values</h3>
          <p>• Transparency & Accountability</p>
          <p>• Member Satisfaction</p>
          <p>• Financial Integrity</p>
          <p>• Innovation & Growth</p>
          <p>• Social Responsibility</p>
        </div>
        <div class="hr"></div>
        <div class="row"><button class="btn" id="closeCompanyInfoBtn">Close</button></div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
  
  document.querySelector('#modalCompanyInfo .closeX')?.addEventListener('click', () => closeModal('modalCompanyInfo'));
  document.getElementById('closeCompanyInfoBtn')?.addEventListener('click', () => closeModal('modalCompanyInfo'));
}

export function openCompanyInfoModal() {
  openModal('modalCompanyInfo');
}