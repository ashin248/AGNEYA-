// src/User/components/ProductSkeleton.jsx
import React from 'react';
import '../style/ProductSkeleton.css';

const ProductSkeleton = () => {
    return (
        <div className="product-skeleton-card">
            <div className="skeleton-img"></div>
            <div className="skeleton-info">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line price"></div>
                <div className="skeleton-line badge"></div>
                <div className="skeleton-btn"></div>
            </div>
        </div>
    );
};

export const SkeletonGrid = ({ count = 8 }) => {
    return (
        <div className="product-grid">
            {Array(count).fill(0).map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    );
};

export default ProductSkeleton;
