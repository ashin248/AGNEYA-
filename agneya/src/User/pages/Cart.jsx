// src/User/pages/Cart.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { removeFromCart, updateQuantity } from '../../store/cartSlice';
import { getImageUrl } from '../../shared/utils/api';
import '../style/Cart.css';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector((state) => state.cart.items);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        // For simplicity, we navigate to the first item for purchase or handle bulk checkout
        // Given existing purchase flow, we might need to adapt it for multi-item or single select.
        // For now, let's navigate to purchase with cart state.
        navigate('/purchase', { state: { cartItems, total: subtotal } });
    };

    return (
        <div className="cart-page-container">
            <div className="cart-header">
                <h1>Your <span>Shopping Bag</span></h1>
                <p>{cartItems.length} items in your bag</p>
            </div>

            <div className="cart-content-layout">
                <div className="cart-items-section">
                    <AnimatePresence>
                        {cartItems.length === 0 ? (
                            <motion.div 
                                className="empty-cart-state"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="empty-icon">🛍️</div>
                                <h2>Your bag is empty</h2>
                                <p>Looks like you haven't added anything yet.</p>
                                <Link to="/shop" className="continue-shopping">Explore Collection</Link>
                            </motion.div>
                        ) : (
                            cartItems.map((item) => (
                                <motion.div 
                                    key={item.productId}
                                    className="cart-item-card"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    layout
                                >
                                    <div className="item-img">
                                        <img src={getImageUrl(item.imageUrl)} alt={item.name} />
                                    </div>
                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        <p className="item-price">₹{(item.price || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="item-quantity-controls">
                                        <button onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}>+</button>
                                    </div>
                                    <div className="item-total">
                                        <p>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                    <button className="remove-item" onClick={() => dispatch(removeFromCart(item.productId))}>
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {cartItems.length > 0 && (
                    <div className="cart-summary-section">
                        <div className="summary-card glass">
                            <h3>Order Summary</h3>
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className="free">FREE</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <button className="checkout-btn" onClick={handleCheckout}>
                                Proceed to Checkout
                            </button>
                            <p className="secure-text"><i className="bi bi-shield-check"></i> 100% Secure Checkout</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
