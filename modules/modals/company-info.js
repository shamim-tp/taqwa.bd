// ============================================================
// 🏢 COMPANY INFO MODAL MODULE
// IMS ERP V5
// Company Vision, Mission, Values and Information
// Fully Responsive - Mobile & PC Optimized
// ============================================================

import { openModal, closeModal } from './modals.js';


// ============================================================
// 🎨 COMPANY INFO STYLES
// ============================================================

const companyInfoStyles = `
  <style>
    /* Company Info Container */
    .company-info-container {
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(135deg, #ffffff, #f8fafc);
      border-radius: 30px;
      overflow: hidden;
      box-shadow: 0 30px 60px rgba(0,0,0,0.1);
    }

    /* Header Section */
    .company-header {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .company-header::before {
      content: '🏢';
      position: absolute;
      right: -20px;
      bottom: -20px;
      font-size: 120px;
      opacity: 0.1;
      transform: rotate(-15deg);
    }

    .company-header h1 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 1;
    }

    .company-header p {
      font-size: 16px;
      opacity: 0.9;
      position: relative;
      z-index: 1;
    }

    .company-logo {
      width: 80px;
      height: 80px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      border: 3px solid rgba(255,255,255,0.3);
    }

    /* Content Section */
    .company-content {
      padding: 40px;
    }

    /* Section Styles */
    .info-section {
      margin-bottom: 35px;
      background: white;
      border-radius: 24px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      border: 1px solid rgba(0,0,0,0.05);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #1e3c72;
    }

    .section-icon {
      font-size: 28px;
      background: linear-gradient(135deg, #1e3c72, #2a5298);
      width: 50px;
      height: 50px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .section-title h2 {
      color: #1e3c72;
      font-size: 24px;
      font-weight: 800;
      margin: 0;
    }

    .section-title h3 {
      color: #1e3c72;
      font-size: 20px;
      font-weight: 700;
      margin: 0;
    }

    /* Vision/Mission Text */
    .vision-text {
      font-size: 16px;
      line-height: 1.8;
      color: #334155;
      text-align: justify;
      padding: 0 10px;
    }

    /* Mission List */
    .mission-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .mission-item {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      padding: 15px;
      margin-bottom: 12px;
      background: #f8fafc;
      border-radius: 16px;
      transition: all 0.3s;
      border: 1px solid #e2e8f0;
    }

    .mission-item:hover {
      transform: translateX(5px);
      background: #eef2ff;
      border-color: #1e3c72;
    }

    .mission-number {
      width: 30px;
      height: 30px;
      background: linear-gradient(135deg, #1e3c72, #2a5298);
      color: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .mission-text {
      flex: 1;
      color: #334155;
      font-size: 15px;
      line-height: 1.6;
    }

    /* Values Grid */
    .values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }

    .value-card {
      background: linear-gradient(135deg, #f8fafc, #ffffff);
      padding: 20px;
      border-radius: 16px;
      text-align: center;
      border: 2px solid #e2e8f0;
      transition: all 0.3s;
    }

    .value-card:hover {
      transform: translateY(-5px);
      border-color: #1e3c72;
      box-shadow: 0 10px 25px rgba(30,60,114,0.1);
    }

    .value-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }

    .value-title {
      font-weight: 700;
      color: #1e3c72;
      font-size: 16px;
      margin-bottom: 8px;
    }

    .value-desc {
      font-size: 13px;
      color: #64748b;
      line-height: 1.5;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin: 25px 0;
    }

    .stat-item {
      text-align: center;
      padding: 20px;
      background: linear-gradient(135deg, #1e3c72, #2a5298);
      color: white;
      border-radius: 20px;
      box-shadow: 0 10px 20px rgba(30,60,114,0.2);
    }

    .stat-value {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 13px;
      opacity: 0.9;
    }

    /* Contact Info */
    .contact-info {
      background: linear-gradient(135deg, #f8fafc, #ffffff);
      border-radius: 20px;
      padding: 25px;
      margin-top: 25px;
      border: 1px solid #e2e8f0;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .contact-icon {
      width: 45px;
      height: 45px;
      background: linear-gradient(135deg, #1e3c72, #2a5298);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 22px;
    }

    .contact-text {
      flex: 1;
    }

    .contact-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 4px;
    }

    .contact-value {
      font-weight: 600;
      color: #1e3c72;
      font-size: 14px;
    }

    /* Milestone Timeline */
    .timeline {
      position: relative;
      padding: 20px 0;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 20px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(180deg, #1e3c72, #2a5298);
    }

    .timeline-item {
      position: relative;
      padding-left: 50px;
      margin-bottom: 25px;
    }

    .timeline-dot {
      position: absolute;
      left: 10px;
      width: 20px;
      height: 20px;
      background: white;
      border: 3px solid #1e3c72;
      border-radius: 50%;
      z-index: 1;
    }

    .timeline-year {
      font-weight: 700;
      color: #1e3c72;
      font-size: 18px;
      margin-bottom: 5px;
    }

    .timeline-desc {
      color: #334155;
      font-size: 14px;
    }

    /* Footer */
    .company-footer {
      background: #1e293b;
      color: white;
      padding: 20px 30px;
      text-align: center;
      font-size: 13px;
      opacity: 0.8;
    }

    /* Mobile Optimizations */
    @media (max-width: 640px) {
      .company-header h1 {
        font-size: 24px;
      }

      .company-content {
        padding: 20px;
      }

      .section-title h2 {
        font-size: 20px;
      }

      .values-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .contact-grid {
        grid-template-columns: 1fr;
      }

      .timeline::before {
        left: 15px;
      }

      .timeline-item {
        padding-left: 40px;
      }
    }

    /* Print Styles */
    @media print {
      .company-header {
        background: #1e3c72;
        color: white;
      }
      
      .closeX {
        display: none;
      }
    }
  </style>
`;


// ============================================================
// 🏗️ INITIALIZE MODAL
// ============================================================

export function initializeModal() {
  const container = document.getElementById('modalsContainer');
  if (!container) return;

  // Add styles
  const styleEl = document.createElement('style');
  styleEl.textContent = companyInfoStyles;
  document.head.appendChild(styleEl);

  const html = `
    <div class="modalWrap" id="modalCompanyInfo">
      <div class="modal large">
        <div class="modalHead">
          <div>
            <h2>🏢 TAQWA PROPERTIES BD</h2>
            <p>Company Vision, Mission & Core Values</p>
          </div>
          <button class="closeX">✕</button>
        </div>
        
        <div class="modalBody" style="padding: 0;">
          <!-- Company Info Content -->
          <div class="company-info-container">
            
            <!-- Header -->
            <div class="company-header">
              <div class="company-logo">🏢</div>
              <h1>TAQWA PROPERTIES BD</h1>
              <p>Trust & Excellence • Since 2020</p>
            </div>

            <!-- Content -->
            <div class="company-content">
              
              <!-- Quick Stats -->
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value">5+</div>
                  <div class="stat-label">Years of Excellence</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">1000+</div>
                  <div class="stat-label">Happy Members</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">50+</div>
                  <div class="stat-label">Investment Projects</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">100%</div>
                  <div class="stat-label">Transparency</div>
                </div>
              </div>

              <!-- Vision Section -->
              <div class="info-section">
                <div class="section-title">
                  <div class="section-icon">👁️</div>
                  <h2>Our Vision</h2>
                </div>
                <div class="vision-text">
                  To become the leading investment management company in the region, 
                  providing innovative financial solutions and creating sustainable value 
                  for our members and stakeholders through transparent operations and 
                  ethical business practices.
                </div>
              </div>

              <!-- Mission Section -->
              <div class="info-section">
                <div class="section-title">
                  <div class="section-icon">🎯</div>
                  <h2>Our Mission</h2>
                </div>
                <div class="mission-list">
                  <div class="mission-item">
                    <div class="mission-number">1</div>
                    <div class="mission-text">To provide secure and profitable investment opportunities for our members</div>
                  </div>
                  <div class="mission-item">
                    <div class="mission-number">2</div>
                    <div class="mission-text">To maintain 100% transparency in all financial transactions</div>
                  </div>
                  <div class="mission-item">
                    <div class="mission-number">3</div>
                    <div class="mission-text">To ensure timely profit distribution to all shareholders</div>
                  </div>
                  <div class="mission-item">
                    <div class="mission-number">4</div>
                    <div class="mission-text">To foster long-term relationships with members through excellent service</div>
                  </div>
                  <div class="mission-item">
                    <div class="mission-number">5</div>
                    <div class="mission-text">To contribute to economic growth through responsible investments</div>
                  </div>
                </div>
              </div>

              <!-- Core Values -->
              <div class="info-section">
                <div class="section-title">
                  <div class="section-icon">💎</div>
                  <h2>Core Values</h2>
                </div>
                <div class="values-grid">
                  <div class="value-card">
                    <div class="value-icon">🔍</div>
                    <div class="value-title">Transparency</div>
                    <div class="value-desc">Complete openness in all operations</div>
                  </div>
                  <div class="value-card">
                    <div class="value-icon">🤝</div>
                    <div class="value-title">Accountability</div>
                    <div class="value-desc">Taking responsibility for all actions</div>
                  </div>
                  <div class="value-card">
                    <div class="value-icon">⭐</div>
                    <div class="value-title">Excellence</div>
                    <div class="value-desc">Striving for the highest quality</div>
                  </div>
                  <div class="value-card">
                    <div class="value-icon">💡</div>
                    <div class="value-title">Innovation</div>
                    <div class="value-desc">Embracing new ideas and solutions</div>
                  </div>
                  <div class="value-card">
                    <div class="value-icon">🤲</div>
                    <div class="value-title">Integrity</div>
                    <div class="value-desc">Doing the right thing always</div>
                  </div>
                  <div class="value-card">
                    <div class="value-icon">🌱</div>
                    <div class="value-title">Growth</div>
                    <div class="value-desc">Continuous improvement and development</div>
                  </div>
                </div>
              </div>

              <!-- Milestones -->
              <div class="info-section">
                <div class="section-title">
                  <div class="section-icon">📅</div>
                  <h2>Our Journey</h2>
                </div>
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-year">2020</div>
                    <div class="timeline-desc">Company founded with 50 founding members</div>
                  </div>
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-year">2021</div>
                    <div class="timeline-desc">Expanded to 200+ members, first investment project launched</div>
                  </div>
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-year">2022</div>
                    <div class="timeline-desc">Reached 500+ members, 5 successful projects</div>
                  </div>
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-year">2023</div>
                    <div class="timeline-desc">Crossed 800 members, 15+ projects, digital transformation</div>
                  </div>
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-year">2024</div>
                    <div class="timeline-desc">1000+ members, 25+ projects, regional expansion</div>
                  </div>
                </div>
              </div>

              <!-- Contact Information -->
              <div class="contact-info">
                <h3 style="color: #1e3c72; margin-bottom: 20px;">📞 Contact Us</h3>
                <div class="contact-grid">
                  <div class="contact-item">
                    <div class="contact-icon">📍</div>
                    <div class="contact-text">
                      <div class="contact-label">Address</div>
                      <div class="contact-value">House 12, Road 5, Block C<br>Dhaka 1230, Bangladesh</div>
                    </div>
                  </div>
                  <div class="contact-item">
                    <div class="contact-icon">📞</div>
                    <div class="contact-text">
                      <div class="contact-label">Phone</div>
                      <div class="contact-value">+880 1344-119333<br>+880 2-1234567</div>
                    </div>
                  </div>
                  <div class="contact-item">
                    <div class="contact-icon">✉️</div>
                    <div class="contact-text">
                      <div class="contact-label">Email</div>
                      <div class="contact-value">info@taqwaproperties.com<br>support@taqwaproperties.com</div>
                    </div>
                  </div>
                  <div class="contact-item">
                    <div class="contact-icon">🌐</div>
                    <div class="contact-text">
                      <div class="contact-label">Website</div>
                      <div class="contact-value">www.taqwaproperties.com</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Footer -->
            <div class="company-footer">
              © ${new Date().getFullYear()} TAQWA PROPERTIES BD. All rights reserved.
            </div>
          </div>
        </div>

        <div class="modalFooter">
          <button class="btn btn-secondary" id="closeCompanyInfoBtn">Close</button>
        </div>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', html);

  // Close button listeners
  document.querySelector('#modalCompanyInfo .closeX')?.addEventListener('click', () => closeModal('modalCompanyInfo'));
  document.getElementById('closeCompanyInfoBtn')?.addEventListener('click', () => closeModal('modalCompanyInfo'));

  console.log('✅ Company Info modal initialized');
}


// ============================================================
// 🚪 OPEN COMPANY INFO MODAL
// ============================================================

export function openCompanyInfoModal() {
  openModal('modalCompanyInfo');
}


// ============================================================
// 📤 EXPORTS
// ============================================================

export default {
  initializeModal,
  openCompanyInfoModal
};
