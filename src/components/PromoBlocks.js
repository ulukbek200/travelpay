// src/components/PromoBlocks.js
import React from 'react';

const PromoBlocks = () => {
  const blocks = [
    {
      image: 'https://www.abrisburo.ru/housevilla/housevilla1.jpg',
      text: 'Никогда больше не платите розничную цену за туризм'
    },
    {
      image: 'https://media.inmobalia.com/imgV1/B98Le8~d7M9k3DegigWkzHXQlgzMFGqGJJp6ZRUcpX033lqadFBp2i4GGW4X2J1jIJ9Pwc6GsJX5cPSaC8Y5L~JfyHdt9V6jJdxik6wYjPX7TJyQF6mDMODR2tVB~j510qFM~Lj3ya0FqJrNvB9Wk23j25akcd6mhLRLQ8NAk88J3eD25nQnCYzzLN_9orPR13f8nMhU8_Pcv5MJak3Z4hijl4Vl4imsiiQ6dRg9izgz7Pu7CmnytcXY0lVPYi~XnsrRzNSBAGnkV6gwLOth6HeEdOemi0D0AxPKrfcTVQUD5YkgjKjROlGUB8f1_Gde9w--.jpg',
      text: 'Живите в квартирах по всему миру как местный'
    },
    {
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      text: 'Путешествуйте с комфортом и выгодой'
    },
    {
        image: 'https://media.istockphoto.com/id/1173935107/ru/%D1%84%D0%BE%D1%82%D0%BE/%D0%B4%D0%BB%D0%B8%D0%BD%D0%BD%D0%B0%D1%8F-%D0%B2%D0%BE%D0%BB%D0%BD%D0%B0-%D0%BD%D0%B0-%D0%BF%D0%BE%D0%B1%D0%B5%D1%80%D0%B5%D0%B6%D1%8C%D0%B5-%D1%80%D0%B0%D1%81%D1%81%D0%B2%D0%B5%D1%82-%D0%BD%D0%B0-%D0%BC%D0%BE%D1%80%D0%B5-%D1%82%D1%83%D0%BD%D0%B8%D1%81.jpg?s=612x612&w=0&k=20&c=I80CZJh9KxDMq2SHAI2hc56GxNJ7CoD4w6pSzZFspcg=',
        text: 'Сделайте свою жизнь насыщенной'
      }
  ];

  return (
    <section style={styles.container}>
      {blocks.map((block, index) => (
        <div key={index} style={{ ...styles.block, backgroundImage: `url(${block.image})` }}>
          <div style={styles.overlay}>
            <h2 style={styles.text}>{block.text}</h2>
          </div>
        </div>
      ))}
    </section>
  );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
        flexWrap: 'wrap', // позволяет переходить на новую строку при узком экране
        padding: 20,
      },
      
      block: {
        flex: '1 1 30%', // блок занимает до 30% ширины, но может сжиматься
        height: 200,
        position: 'relative',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 10,
        overflow: 'hidden',
        minWidth: 280, // чтобы не сжимались слишком сильно
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      },
      
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: 'white',
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: '0 20px'
  }
};

export default PromoBlocks;
