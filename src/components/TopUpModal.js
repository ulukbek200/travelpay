// src/components/TopUpModal.js
import React, { useState } from 'react';

const TopUpModal = ({ show, onClose, onTopUp }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      alert('Введите корректную сумму');
      return;
    }
    onTopUp(numericAmount);
    setAmount('');
    onClose();
  };

  return (
    <div style={{ ...styles.overlay, display: show ? 'flex' : 'none' }}>
      <div style={{ ...styles.modal, transform: show ? 'scale(1)' : 'scale(0.9)', opacity: show ? 1 : 0 }}>
        <h3 style={styles.title}>Пополнить баланс</h3>
        <input
          type="number"
          placeholder="Введите сумму"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
        />
        <div style={styles.buttons}>
          <button style={styles.cancel} onClick={onClose}>Отмена</button>
          <button style={styles.confirm} onClick={handleSubmit}>Пополнить</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    transition: 'opacity 0.3s ease',
  },
  modal: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  title: {
    marginBottom: '20px',
    fontSize: '20px',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    marginBottom: '20px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  },
  cancel: {
    padding: '10px 20px',
    backgroundColor: '#ccc',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  confirm: {
    padding: '10px 20px',
    backgroundColor: '#2a9d8f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default TopUpModal;
