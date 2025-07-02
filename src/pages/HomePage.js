// // src/pages/HomePage.js
// import React, { startTransition, useEffect } from 'react';
// import AOS from 'aos';
// import 'aos/dist/aos.css';

// import heroImage from '../images/hero.jpg';

// const HomePage = () => {
//   useEffect(() => {
//     AOS.init({ duration: 1000, once: true });
//   }, []);

//   return (
//     <div style={styles.page}>
//       {/* Header */}
//       <header style={styles.header} data-aos="fade-down">
//         <h1 style={styles.logo}>TravelPay</h1>
//         <nav style={styles.nav}>
//           <a href="#about" style={styles.navLink}>О нас</a>
//           <a href="#destinations" style={styles.navLink}>Направления</a>
//           <a href="#reviews" style={styles.navLink}>Отзывы</a>
//           <a href="#faq" style={styles.navLink}>FAQ</a>
//           <a href="#contact" style={styles.navLink}>Контакты</a>
//         </nav>
//       </header>

//       {/* Hero Section */}
//       <section style={{ ...styles.hero, backgroundImage: `url(${heroImage})` }} data-aos="zoom-in">
//         <div style={styles.heroContent}>
//           <h2>Открой мир с TravelPay</h2>
//           <p>Легкое и надежное бронирование туров по всему миру</p>
//           <button style={styles.button}>Узнать больше</button>
//         </div>
//       </section>

//       {/* About Section */}
//       <section id="about" style={styles.about} data-aos="fade-up">
//         <h3>О нас</h3>
//         <p>
//           TravelPay предлагает уникальные путешествия, комфортные перелёты и полный пакет услуг, включая страховку и поддержку. Мы заботимся о каждом клиенте и делаем отдых доступным.
//         </p>
//       </section>

//       {/* Destinations */}
//       <section id="destinations" style={styles.destinations} data-aos="fade-right">
//         <h3>Популярные направления</h3>
//         <div style={styles.cardsRow}>
//           {['Турция', 'Франция', 'Япония', 'Мальдивы'].map((country, index) => (
//             <div key={index} style={styles.card}>
//               <span style={{ fontSize: '40px' }}>🌍</span>
//               <h4>{country}</h4>
//               <p>Путешествуй по {country} с максимальным комфортом.</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Reviews */}
//       <section id="reviews" style={styles.reviews} data-aos="fade-left">
//         <h3>Отзывы наших клиентов</h3>
//         <div style={styles.cardsRow}>
//           {[
//             { name: "Алина", text: "Невероятный отдых! Всё организовано на высшем уровне." },
//             { name: "Игорь", text: "Просто, удобно и очень выгодно. Спасибо TravelPay!" },
//           ].map((review, idx) => (
//             <div key={idx} style={styles.reviewCard}>
//               <p>"{review.text}"</p>
//               <strong>— {review.name}</strong>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* FAQ */}
//       <section id="faq" style={styles.faq} data-aos="fade-up">
//         <h3>Часто задаваемые вопросы</h3>
//         <div>
//           <p><strong>❓ Как оплатить тур?</strong><br />💬 Мы принимаем карты, переводы и оплату через приложение.</p>
//           <p><strong>❓ Как отменить поездку?</strong><br />💬 Свяжитесь с нами не менее чем за 7 дней до вылета.</p>
//         </div>
//       </section>

//       {/* Contact */}
//       <section id="contact" style={styles.contact} data-aos="fade-up">
//         <h3>Связаться с нами</h3>
//         <form style={styles.form}>
//           <input type="text" placeholder="Ваше имя" required />
//           <input type="email" placeholder="Email" required />
//           <textarea placeholder="Сообщение" rows={4}></textarea>
//           <button type="submit">Отправить</button>
//         </form>
//       </section>

//       {/* Footer */}
//       <footer style={styles.footer} data-aos="fade-in">
//         <p>© 2025 TravelPay | Все права защищены</p>
//       </footer>
//     </div>
//   );
// };

// // ✅ Стили (можно вынести в CSS или Tailwind позже)
// const styles = {
//   page: { fontFamily: 'sans-serif', scrollBehavior: 'smooth' },
//   header: {
//     backgroundColor: '#1d3557',
//     color: 'white',
//     padding: '20px 40px',
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     position: 'sticky',
//     top: 0, zIndex: 1000
//   },
//   logo: { margin: 0 },
//   nav: { display: 'flex', gap: '20px' },
//   navLink: { color: 'white', textDecoration: 'none' },

//   hero: {
//     height: '90vh',
//     backgroundSize: 'cover',
//     backgroundPosition: 'center',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     color: 'white',
//     textAlign: 'center',
//     padding: '0 20px'
//   },
//   heroContent: {
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     padding: '40px',
//     borderRadius: '10px',
//     maxWidth: '600px'
//   },
//   button: {
//     padding: '10px 30px',
//     fontSize: '16px',
//     backgroundColor: '#fca311',
//     color: '#fff',
//     border: 'none',
//     borderRadius: '8px',
//     marginTop: '20px',
//     cursor: 'pointer',
//   },

//   about: { padding: '60px 20px', textAlign: 'center', backgroundColor: '#f1faee' },
//   destinations: { padding: '60px 20px', textAlign: 'center', backgroundColor: '#e0f7fa' },
//   reviews: { padding: '60px 20px', textAlign: 'center', backgroundColor: '#fff3e0' },
//   faq: { padding: '60px 20px', textAlign: 'left', maxWidth: '800px', margin: '0 auto' },
//   contact: { padding: '60px 20px', backgroundColor: '#f1f1f1', textAlign: 'center' },

//   cardsRow: {
//     display: 'flex',
//     gap: '20px',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//     marginTop: '20px'
//   },
//   card: {
//     width: '200px',
//     padding: '20px',
//     backgroundColor: '#fff',
//     borderRadius: '10px',
//     boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
//     textAlign: 'center'
//   },
//   reviewCard: {
//     backgroundColor: '#ffffff',
//     padding: '20px',
//     borderRadius: '10px',
//     width: '300px',
//     boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
//     fontStyle: 'italic'
//   },
//   form: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '15px',
//     maxWidth: '400px',
//     margin: '0 auto'
//   },
//   footer: {
//     backgroundColor: '#1d3557',
//     color: '#fff',
//     padding: '20px',
//     textAlign: 'center',
//   }
// };

// export default HomePage;
// pages/HomePage.js
import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import HowItWorksSection from '../components/HowItWorksSection';

import Destinations from '../components/Destinations';
import Reviews from '../components/Reviews';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import PromoBlocks from '../components/PromoBlocks';
import JoinTravelPay from '../components/JoinTravelPay';




const HomePage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <>
      <Header />
      <Hero />
      <PromoBlocks />

      <About />
      <HowItWorksSection />

      <Destinations />
      <JoinTravelPay />
      <Reviews />
      <FAQ />
      
      <Footer />
    </>
  );
};

export default HomePage;