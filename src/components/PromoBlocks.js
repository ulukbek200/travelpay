import React from 'react';

const PromoBlocks = () => {
  const blocks = [
    {
      image: 'https://www.abrisburo.ru/housevilla/housevilla1.jpg',
      text: 'Никогда больше не платите розничную цену за туризм',
    },
    {
      image:
        'https://media.inmobalia.com/imgV1/B98Le8~d7M9k3DegigWkzHXQlgzMFGqGJJp6ZRUcpX033lqadFBp2i4GGW4X2J1jIJ9Pwc6GsJX5cPSaC8Y5L~JfyHdt9V6jJdxik6wYjPX7TJyQF6mDMODR2tVB~j510qFM~Lj3ya0FqJrNvB9Wk23j25akcd6mhLRLQ8NAk88J3eD25nQnCYzzLN_9orPR13f8nMhU8_Pcv5MJak3Z4hijl4Vl4imsiiQ6dRg9izgz7Pu7CmnytcXY0lVPYi~XnsrRzNSBAGnkV6gwLOth6HeEdOemi0D0AxPKrfcTVQUD5YkgjKjROlGUB8f1_Gde9w--.jpg',
      text: 'Живите в квартирах по всему миру как местный',
    },
    {
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      text: 'Путешествуйте с комфортом и выгодой',
    },
    {
      image: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg',
      text: 'Сделайте свою жизнь насыщенной',
    },
  ];

  return (
    <section style={styles.container}>
      {blocks.map((block, index) => (
        <div
          key={index}
          style={{ ...styles.block, backgroundImage: `url(${block.image})` }}
        >
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
    flexWrap: 'wrap',
    marginLeft: '70px',
    padding: 20,
  },
  block: {
    flex: '1 1 30%',
    height: 200,
    position: 'relative',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    minWidth: 280,
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    transition: 'transform 0.3s ease',
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
    justifyContent: 'center',
    padding: 10,
  },
  text: {
    color: 'white',
    fontSize: '22px',
    fontWeight: '600',
    textAlign: 'center',
    padding: '0 20px',
    fontFamily: "'Poppins', sans-serif",
    lineHeight: 1.3,
  },
};

export default PromoBlocks;
