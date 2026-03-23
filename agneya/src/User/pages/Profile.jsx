import React, { useState, useEffect } from "react";
import API from "../../shared/utils/api";
import "../style/Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [newAddress, setNewAddress] = useState({
    addressLine: "",
    city: "",
    landmark: "",
    pincode: "",
    state: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/user/profile");
      if (res.data.success) {
        setUser(res.data.user);
        setAddresses(res.data.user.addresses || []);
        setDesigns(res.data.user.designHistory || []);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const updatedAddresses = [...addresses, newAddress];
    try {
      const res = await API.put("/user/addresses", { addresses: updatedAddresses });
      if (res.data.success) {
        setAddresses(res.data.addresses);
        setNewAddress({ addressLine: "", city: "", landmark: "", pincode: "", state: "" });
      }
    } catch (err) {
      console.error("Error adding address:", err);
    }
  };

  const removeAddress = async (idx) => {
    const updatedAddresses = addresses.filter((_, i) => i !== idx);
    try {
      const res = await API.put("/user/addresses", { addresses: updatedAddresses });
      if (res.data.success) {
        setAddresses(res.data.addresses);
      }
    } catch (err) {
      console.error("Error removing address:", err);
    }
  };

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      {user && (
        <div className="profile-info">
          <p><strong>Name:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Loyalty Points:</strong> <span className="points">{user.loyaltyPoints}</span></p>
        </div>
      )}

      <div className="profile-sections">
        <section className="address-section">
          <h2>Delivery Addresses</h2>
          <div className="address-list">
            {addresses.map((addr, idx) => (
              <div key={idx} className="address-card">
                <p>{addr.addressLine}, {addr.city}</p>
                <p>{addr.landmark}, {addr.pincode}, {addr.state}</p>
                <button onClick={() => removeAddress(idx)} className="remove-btn">Remove</button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddAddress} className="address-form">
            <h3>Add New Address</h3>
            <input type="text" placeholder="Address Line" value={newAddress.addressLine} onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })} required />
            <input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} required />
            <input type="text" placeholder="Landmark" value={newAddress.landmark} onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })} required />
            <div className="row">
              <input type="text" placeholder="Pincode" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
              <input type="text" placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} required />
            </div>
            <button type="submit">Add Address</button>
          </form>
        </section>

        <section className="designs-section">
          <h2>Design History</h2>
          <div className="design-grid">
            {designs.length > 0 ? (
              designs.map((design, idx) => (
                <div key={idx} className="design-card">
                  <img src={design.previewUrl} alt={design.name} />
                  <p>{design.name}</p>
                  <small>{new Date(design.createdAt).toLocaleDateString()}</small>
                </div>
              ))
            ) : (
              <p>No designs saved yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
