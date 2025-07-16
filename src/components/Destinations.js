// import React, { useRef, useState } from 'react';
// import Slider from 'react-slick';

// import italy from '../images/italy.jpg';
// import spain from '../images/spain.jpg';
// import greece from '../images/greece.jpg';
// import france from '../images/france.jpg';
// import kyrgyz from '../images/kyrgyz.jpg';

// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

// const destinations = [
//   {
//     name: 'Италия',
//     image: italy,
//     description: 'Город искусства и вкусной еды.',
//     rating: 5,
//     price: 'от $399',
//     type: 'Групповой тур',
//     label: 'Хит продаж',
//     duration: '7 дней',
//     availability: 'Осталось 3 места',
//   },
//   {
//     name: 'Испания',
//     image: spain,
//     description: 'Страна солнца и фламенко.',
//     rating: 4,
//     price: 'от $350',
//     type: 'Пляжный тур',
//     label: 'Новинка',
//     duration: '10 дней',
//     availability: 'Доступно',
//   },
//   {
//     name: 'Греция',
//     image: greece,
//     description: 'Исторические руины и пляжи.',
//     rating: 4,
//     price: 'от $320',
//     type: 'Культурный тур',
//     duration: '6 дней',
//     availability: 'Осталось 1 место',
//   },
//   {
//     name: 'Франция',
//     image: france,
//     description: 'Романтика Парижа и винные туры.',
//     rating: 5,
//     price: 'от $450',
//     type: 'Экскурсионный тур',
//     duration: '8 дней',
//     availability: 'Осталось 2 места',
//   },
//   {
//     name: 'Кыргызстан',
//     image: kyrgyz,
//     description: 'Горы, озёра и природа.',
//     rating: 5,
//     price: 'от $200',
//     type: 'Природный тур',
//     duration: '5 дней',
//     availability: 'Места есть',
//   },
// ];

// const PopularDestinations = () => {
//   const sliderRef = useRef(null);
//   const [hoveredNavBtn, setHoveredNavBtn] = useState(null);

//   const settings = {
//     dots: false,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 3,
//     slidesToScroll: 1,
//     arrows: false,
//     centerMode: true,
//     centerPadding: '40px',
//     responsive: [
//       {
//         breakpoint: 1024,
//         settings: {
//           slidesToShow: 2,
//           centerPadding: '20px',
//         },
//       },
//       {
//         breakpoint: 768,
//         settings: {
//           slidesToShow: 1,
//           centerPadding: '0px',
//         },
//       },
//     ],
//   };

//   const renderStars = (count) => '★'.repeat(count) + '☆'.repeat(5 - count);

//   return (
//     <section style={styles.section} id="destinations">
//       <h2 style={styles.title}>Популярные направления</h2>
//       <p style={styles.subtitle}>Выбери лучшее место для твоего отпуска</p>

//       <div style={styles.sliderContainer}>
//         <Slider ref={sliderRef} {...settings}>
//           {destinations.map((dest) => (
//             <div key={dest.name} style={styles.cardWrapper}>
//               <div style={styles.card}>
//                 {dest.label && <div style={styles.label}>{dest.label}</div>}
//                 <img src={dest.image} alt={dest.name} style={styles.image} />
//                 <div style={styles.cardContent}>
//                   <h3 style={styles.name}>{dest.name}</h3>
//                   <p style={styles.type}>{dest.type}</p>
//                   <p style={styles.description}>{dest.description}</p>
//                   <p style={styles.duration}>Длительность: {dest.duration}</p>
//                   <p style={styles.availability}>{dest.availability}</p>
//                   <p style={styles.price}>{dest.price}</p>
//                   <div style={styles.rating}>{renderStars(dest.rating)}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </Slider>
//       </div>

//       <div style={styles.buttons}>
//         <button
//           style={{
//             ...styles.navButton,
//             ...(hoveredNavBtn === 'prev' ? styles.navButtonHover : {}),
//           }}
//           onMouseEnter={() => setHoveredNavBtn('prev')}
//           onMouseLeave={() => setHoveredNavBtn(null)}
//           onClick={() => sliderRef.current.slickPrev()}
//         >
//           ←
//         </button>
//         <button
//           style={{
//             ...styles.navButton,
//             ...(hoveredNavBtn === 'next' ? styles.navButtonHover : {}),
//           }}
//           onMouseEnter={() => setHoveredNavBtn('next')}
//           onMouseLeave={() => setHoveredNavBtn(null)}
//           onClick={() => sliderRef.current.slickNext()}
//         >
//           →
//         </button>
//       </div>
//     </section>
//   );
// };

// const styles = {
//   section: {
//     padding: '80px 20px',
//     backgroundColor: '#f9f9f9',
//     textAlign: 'center',
//     fontFamily: "'Poppins', sans-serif",
//     marginLeft:'60px',  
//   },
//   title: {
//     fontSize: '36px',
//     color: '#1d3557',
//     marginBottom: '10px',
//   },
//   subtitle: {
//     fontSize: '18px',
//     color: '#555',
//     marginBottom: '50px',
//   },
//   sliderContainer: {
//     maxWidth: '1200px',
//     margin: '0 auto',
//   },
//   cardWrapper: {
//     padding: '0 10px',
//   },
//   card: {
//     position: 'relative',
//     borderRadius: '16px',
//     overflow: 'hidden',
//     boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
//     backgroundColor: '#fff',
//     cursor: 'pointer',
//     transition: 'transform 0.3s ease',
//   },
//   label: {
//     position: 'absolute',
//     top: '16px',
//     left: '16px',
//     backgroundColor: '#fca311',
//     color: '#fff',
//     padding: '6px 12px',
//     fontSize: '12px',
//     fontWeight: 'bold',
//     borderRadius: '8px',
//   },
//   image: {
//     width: '100%',
//     height: '240px',
//     objectFit: 'cover',
//   },
//   cardContent: {
//     padding: '20px',
//     textAlign: 'left',
//   },
//   name: {
//     fontSize: '22px',
//     color: '#1d3557',
//     margin: '0 0 8px 0',
//   },
//   type: {
//     fontSize: '14px',
//     color: '#fca311',
//     fontWeight: 'bold',
//     marginBottom: '8px',
//   },
//   description: {
//     fontSize: '16px',
//     color: '#333',
//     marginBottom: '10px',
//   },
//   duration: {
//     fontSize: '14px',
//     color: '#444',
//     marginBottom: '4px',
//   },
//   availability: {
//     fontSize: '14px',
//     color: '#e63946',
//     marginBottom: '4px',
//   },
//   price: {
//     fontSize: '16px',
//     fontWeight: '600',
//     color: '#1d3557',
//     marginBottom: '8px',
//   },
//   rating: {
//     fontSize: '18px',
//     color: '#FFD700',
//   },
//   buttons: {
//     marginTop: '50px',
//     display: 'flex',
//     justifyContent: 'center',
//     gap: '20px',
//   },
//   navButton: {
//     width: '50px',
//     height: '50px',
//     border: '2px solid #1d3557',
//     borderRadius: '50%',
//     background: 'transparent',
//     color: '#1d3557',
//     fontSize: '22px',
//     cursor: 'pointer',
//     marginTop:'-30px',
//     transition: 'all 0.3s ease',
//   },
//   navButtonHover: {
//     background: '#1d3557',
//     color: '#fff',
//   },
// };

// export default PopularDestinations;
