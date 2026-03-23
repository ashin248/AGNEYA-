import React, { useState } from "react";
import { FaStar, FaCamera } from "react-icons/fa";
import "../style/ProductReviews.css";

const ProductReviews = ({ productId }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Review submitted for product ${productId}! (Rating: ${rating})`);
    // API call would go here
  };

  return (
    <div className="reviews-container">
      <h3>Customer Reviews</h3>
      <form onSubmit={handleSubmit} className="review-form">
        <div className="star-rating">
          {[...Array(5)].map((star, i) => {
            const ratingValue = i + 1;
            return (
              <label key={i}>
                <input
                  type="radio"
                  name="rating"
                  value={ratingValue}
                  onClick={() => setRating(ratingValue)}
                />
                <FaStar
                  className="star"
                  color={ratingValue <= (hover || rating) ? "var(--color-primary)" : "rgba(255, 255, 255, 0.1)"}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                />
              </label>
            );
          })}
        </div>
        <textarea
          placeholder="Write your review here..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        ></textarea>
        
        <div className="upload-section">
          <label className="image-upload-label">
            <FaCamera /> Add Photos
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} hidden />
          </label>
          <div className="preview-images">
            {images.map((img, idx) => (
              <img key={idx} src={URL.createObjectURL(img)} alt="preview" />
            ))}
          </div>
        </div>
        
        <button type="submit" className="submit-review">Submit Review</button>
      </form>
    </div>
  );
};

export default ProductReviews;
