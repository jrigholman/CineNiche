import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="privacy-page">
      <h1>Privacy Policy</h1>
      
      <section className="privacy-section">
        <h2>Introduction</h2>
        <p>At CineNiche, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
      </section>
      
      <section className="privacy-section">
        <h2>The Data We Collect</h2>
        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
        <ul>
          <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data</strong> includes email address.</li>
          <li><strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
          <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
          <li><strong>Profile Data</strong> includes your username and password, your interests, preferences, feedback and survey responses.</li>
        </ul>
      </section>
      
      <section className="privacy-section">
        <h2>How We Use Your Data</h2>
        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
        <ul>
          <li>To register you as a new customer.</li>
          <li>To process and deliver your orders.</li>
          <li>To manage our relationship with you.</li>
          <li>To improve our website, products/services, marketing or customer relationships.</li>
          <li>To recommend products or services that may be of interest to you.</li>
        </ul>
      </section>
      
      <section className="privacy-section">
        <h2>Data Security</h2>
        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
      </section>
      
      <section className="privacy-section">
        <h2>Your Legal Rights</h2>
        <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
        <ul>
          <li>Request access to your personal data.</li>
          <li>Request correction of your personal data.</li>
          <li>Request erasure of your personal data.</li>
          <li>Object to processing of your personal data.</li>
          <li>Request restriction of processing your personal data.</li>
          <li>Request transfer of your personal data.</li>
          <li>Right to withdraw consent.</li>
        </ul>
      </section>
      
      <section className="privacy-section">
        <h2>Contact Us</h2>
        <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
        <p>Email: privacy@cineniche.com</p>
        <p>Postal address: 123 Movie Lane, Cinema City, CA 90210</p>
      </section>
      
      <section className="privacy-section">
        <h2>Changes to the Privacy Policy</h2>
        <p>We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date below.</p>
        <p>This privacy policy was last updated on June 10, 2023.</p>
      </section>
    </div>
  );
};

export default PrivacyPage; 