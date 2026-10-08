import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_AUTH } from "../../../config/api";
import { resolveAuthUserId, authJsonHeaders, bearerAuthHeader, getGuestProfile } from "../../../utils/auth";
import { PlanDpRing, PlanCrownWithPrice } from "../Componets/PlanCrown";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./cropImage";

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editNickName, setEditNickName] = useState("");
  const [editAbout, setEditAbout] = useState("");
  const [editCategory, setEditCategory] = useState(""); // Category field
  const [editSex, setEditSex] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [galleryDeleteLoading, setGalleryDeleteLoading] = useState(false);
  const [galleryDeleteIndex, setGalleryDeleteIndex] = useState(null);

  const [cropModal, setCropModal] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropImage(URL.createObjectURL(file));
    setCropModal(true);
  };

  useEffect(() => {
    // Used for debug
    // console.log("cropModal:", cropModal);
  }, [cropModal]);

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(profile.referralCode);
      alert("Referral code copied successfully!");
    } catch (err) {
      // Fallback Method
      const textArea = document.createElement("textarea");
      textArea.value = profile.referralCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      alert("Referral code copied successfully!");
    }
  };

  // Load the user profile and re-sync on demand
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const userId = resolveAuthUserId();
      if (!userId) {
        const guest = getGuestProfile();
        setUser(
          guest
            ? {
                name: guest.name || "Guest",
                nickname: guest.name || "guest",
                sex: guest.gender || "",
                age: guest.age || "",
                city: guest.city || "",
                about: "Browsing ChatProX as a guest. Register to save your profile.",
              }
            : { name: "Guest", nickname: "guest" }
        );
        setError("");
        return;
      }
      const res = await axios.get(`${API_AUTH}/user/me`, { headers: authJsonHeaders() });
      setUser(res.data?.user || null);
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Could not fetch profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Pre-fill the edit modal with user info, including category
  const openEditModal = () => {
    setEditName(user?.name || "");
    setEditNickName(user?.nickname || "");
    setEditSex(user?.sex || "");
    setEditAge(user?.age || "");
    setEditCity(user?.city || "");
    setEditAbout(user?.about || "");
    setEditCategory(user?.category || ""); // Sync the current category
    setEditPhoto(null);
    setEditPhotoUrl(user?.profilePhoto || "");
    setShowEditModal(true);
    setSaveError("");
    setSaveSuccess("");
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditPhoto(null);
    setEditPhotoUrl("");
    setEditCategory(""); // Reset on modal close
    setSaveError("");
    setSaveSuccess("");
  };

  const openPhotoModal = () => {
    setEditPhoto(null);
    setEditPhotoUrl(user?.profilePhoto || "");
    setShowPhotoModal(true);
    setSaveError("");
    setSaveSuccess("");
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setEditPhoto(null);
    setEditPhotoUrl("");
    setSaveError("");
    setSaveSuccess("");
  };

  const handleCropSave = async () => {
    try {
      const croppedFile = await getCroppedImg(
        cropImage,
        croppedAreaPixels
      );
      setEditPhoto(croppedFile);
      setCropModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Save profile - send and save category as well
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      let profilePhotoUrl = user?.profilePhoto || "";

      if (editPhoto) {
        const formData = new FormData();
        formData.append("file", editPhoto);
        const uploadRes = await axios.post(`${API_AUTH}/user/upload-profile-photo`, formData, {
          headers: { ...bearerAuthHeader() },
        });
        profilePhotoUrl = uploadRes.data?.url || profilePhotoUrl;
      }
      // Send and save category with profile update
      const updatedRes = await axios.put(
        `${API_AUTH}/user/update-profile`,
        {
          name: editName,
          sex: editSex,
          nickname: editNickName,
          about: editAbout,
          profilePhoto: profilePhotoUrl,
          category: editCategory,
          age: editAge,
          city: editCity,
        },
        { headers: authJsonHeaders() }
      );

      setUser({
        ...user,
        name: editName,
        profilePhoto: profilePhotoUrl,
        category: editCategory,
        nickname: editNickName,
        sex: editSex,
        about: editAbout,
        age: editAge,
        city: editCity,
      });
      setSaveSuccess("Profile updated!");
      setTimeout(() => {
        closeEditModal();
      }, 1000);
    } catch (err) {
      setSaveError(
        err?.response?.data?.message ||
        "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // upload photo in Gallery
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setGalleryPreview(prev => [...prev, ...previews]);
  };

  const removeGalleryImage = (index) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const formData = new FormData();
      galleryFiles.forEach(file => formData.append('gallery', file));
      await axios.post(
        `${API_AUTH}/user/upload-Gallery-photo`,
        formData,
        {
          headers: {
            ...bearerAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setGalleryFiles([]);
      setGalleryPreview([]);
      closePhotoModal();
      setTimeout(() => {
        closeEditModal();
      }, 1000);
    } catch (err) {
      setSaveError(
        err?.response?.data?.message ||
        "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete?",
      text: "Your profile and account data will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#4b4563",
      background: "#1a1233",
      color: "#fff",
      heightAuto: false,
      allowOutsideClick: false,
      target: document.body,
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_AUTH}/user/profile`, {
        headers: authJsonHeaders(),
      });
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("token");
      await Swal.fire({
        title: "Profile deleted",
        icon: "success",
        confirmButtonColor: "#8c52ff",
        background: "#1a1233",
        color: "#fff",
        heightAuto: false,
        target: document.body,
      });
      window.location.href = "/";
    } catch (err) {
      Swal.fire({
        title: "Could not delete profile",
        text: err?.response?.data?.message || "Please try again.",
        icon: "error",
        confirmButtonColor: "#e11d48",
        background: "#1a1233",
        color: "#fff",
        heightAuto: false,
        target: document.body,
      });
    }
  };

  const handleDeleteGalleryPhoto = async (photoUrl, index) => {
    setGalleryDeleteLoading(true);
    setGalleryDeleteIndex(index);
    setSaveError("");
    setSaveSuccess("");

    try {
      await axios.post(
        `${API_AUTH}/user/delete-Gallery-photo`,
        { photoUrl },
        {
          headers: {
            ...authJsonHeaders(),
            ...bearerAuthHeader(),
          },
        }
      );
      setUser(u => {
        if (!u) return u;
        const nextGallery = Array.isArray(u.gallery)
          ? u.gallery.filter((item, idx) => idx !== index)
          : [];
        return { ...u, gallery: nextGallery };
      });
      setSaveSuccess("Photo deleted from gallery!");
    } catch (err) {
      setSaveError(
        err?.response?.data?.message ||
        "Failed to delete photo."
      );
    } finally {
      setGalleryDeleteLoading(false);
      setGalleryDeleteIndex(null);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#07011b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "22px",
          fontWeight: "700",
        }}
      >
        Loading Profile...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#07011b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ff4d4d",
          fontSize: "20px",
          fontWeight: "700",
        }}
      >
        {error}
      </div>
    );
  }

  const profile = user || {};

  return (
    <div>
      <div className="chatprox-profile-page">
        <div className="container-fluid">

          <div className="prox-live-navbar">
            <div className="prox-live-navbar-left">
              <div className="prox-live-logo">
                <i className="bi bi-person-vcard-fill"></i>
              </div>
              <div>
                <h2 className="prox-live-navbar-title">MLM Profile</h2>
                <p className="prox-live-navbar-subtitle">
                  Manage your account information & activity
                </p>
              </div>
            </div>
            <div className="prox-live-navbar-right">
              <button className="prox-live-gradient-btn" onClick={openEditModal}>
                Edit Profile
              </button>
              <button
                type="button"
                className="prox-live-gradient-btn profile-delete-btn"
                onClick={handleDeleteProfile}
              >
                Delete Profile
              </button>
            </div>
          </div>

          {/* MAIN WRAPPER */}
          <div className="profile-wrapper">
            {/* SIDEBAR */}
            <div className="profile-sidebar">
              <PlanDpRing plan={profile.plan} className="profile-image">
                {
                  profile.profilePhoto || editPhotoUrl ? (
                    <img
                      src={profile?.profilePhoto || editPhotoUrl}
                      alt="Profile"
                    />
                  ) : (
                    (profile.name?.[0] || "A").toUpperCase()
                  )
                }
              </PlanDpRing>
              <h4>
                @{profile.nickname || "member"}
              </h4>
              <p>
                {profile.about || "SalesGrow member"}
              </p>
              {/* STATS */}
              {/* MAIN STATS */}
              <div className="profile-stats">
               

                <div className="stat-box">
                  <h3>{Number(profile.totalEarned || 0).toLocaleString()}</h3>
                  <span>Earned</span>
                </div>
              </div>

              {/* PROFILE INFO (Gender + Category) */}
              <div className="profile-stats secondary-stats">
                <div className="stat-box">
                  <h3>{profile?.sex || "-"}</h3>
                  <span>Gender</span>
                </div>

                

                <div className="stat-box">
                  <h3>{profile?.age || "-"}</h3>
                  <span>Age</span>
                </div>

                <div className="stat-box">
                  <h3>{profile?.city || "-"}</h3>
                  <span>City</span>
                </div>
              </div>
              <div className="profile-status">
                <span />
                {profile.isActive ? "Active User" : "Inactive"}
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="profile-right-content">

              {/* PROFILE DETAILS */}
              <div className="profile-content">

                <div className="profile-grid">

                  <div className="info-card">
                    <label>Full Name</label>
                    <h4>{profile.name || "-"}</h4>
                  </div>

                  <div className="info-card">
                    <label>Email Address</label>
                    <h4>{profile.email || "-"}</h4>
                  </div>

                  <div className="info-card">
                    <label>Phone Number</label>
                    <h4>{profile.phone || "-"}</h4>
                  </div>

                  <div className="info-card">
                    <label>Age</label>
                    <h4>{profile.age || "-"}</h4>
                  </div>

                  <div className="info-card">
                    <label>City</label>
                    <h4>{profile.city || "-"}</h4>
                  </div>

                  <div className="info-card">
                    <label>Active Plan</label>
                    <h4 className="pink-text">
                      <PlanCrownWithPrice plan={profile.plan} />
                    </h4>
                  </div>

                  <div className="info-card">
                    <label>Referral Code</label>
                    <div className="referral-box">
                      <h4>{profile.referralCode || "-"}</h4>
                      <button
                        type="button"
                        onClick={copyReferralCode}
                        disabled={!profile.referralCode}
                      >
                        <i className="bi bi-copy"></i>
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="info-card">
                    <label>Total Referrals</label>
                    <h4>{Number(profile.totalReferrals || 0)}</h4>
                  </div>

                  <div className="info-card">
                    <label>Wallet Balance</label>
                    <h4>
                      {Number(profile.walletBalance || 0).toLocaleString()}
                    </h4>
                  </div>

                  <div className="info-card">
                    <label>Member Since</label>
                    <h4>
                      {
                        profile.createdAt
                          ? (new Date(profile.createdAt)).toLocaleString('default', { month: 'long', year: 'numeric' })
                          : profile.updatedAt
                            ? (new Date(profile.updatedAt)).toLocaleString('default', { month: 'long', year: 'numeric' })
                            : "-"
                      }
                    </h4>
                  </div>

                </div>
              </div>


             
            </div>
          </div>
        </div>
      </div>

      {
        cropModal && (
          <div className="crop-modal-overlay">
            <div className="crop-modal">
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 400,
                }}
              >
                <Cropper
                  image={cropImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleCropSave}
                >
                  Crop & Use
                </button>
                <button
                  type="button"
                  onClick={() => setCropModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {showEditModal && (
        <div className="cp-edit-modal-overlay">
          <div className="cp-edit-modal">
            <button
              className="cp-edit-close"
              aria-label="Close"
              type="button"
              onClick={closeEditModal}
            >
              &times;
            </button>
            <h2 className="cp-edit-title">
              Edit Profile
            </h2>

            <form onSubmit={handleSave} >

              {/* PROFILE PHOTO */}
              <div className="cp-edit-photo-wrap">
                <div className="cp-edit-photo">
                  <img
                    src={
                      editPhoto
                        ? URL.createObjectURL(editPhoto)
                        :
                        editPhotoUrl
                    }
                  />
                </div>
                <label
                  htmlFor="profile-upload"
                  className="cp-upload-btn"
                >
                  Upload Photo
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>

              {/* NAME */}
              <div className="cp-form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) =>
                    setEditName(
                      e.target.value
                    )
                  }
                />
              </div>

              {/* NICKNAME */}
              <div className="cp-form-group">
                <label>Nickname</label>
                <input
                  type="text"
                  value={editNickName}
                  onChange={(e) => setEditNickName(e.target.value)}
                />
              </div>

              {/* CATEGORY */}
<div className="cp-form-group">
  <label>Category</label>

  <select
    value={editCategory}
    onChange={(e) => setEditCategory(e.target.value)}
  >
    <option value="">Select Category</option>
    <option value="XL">XL</option>
    <option value="XXL">XXL</option>
    <option value="XXXL">XXXL</option>
  </select>
</div>



              {/* SEX */}
              <div className="cp-form-group">
                <label>Sex</label>
                <select
                  value={editSex}
                  onChange={(e) => setEditSex(e.target.value)}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>

              {/* AGE */}
              <div className="cp-form-group">
                <label>Age</label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  placeholder="Enter age"
                />
              </div>

              {/* CITY */}
              <div className="cp-form-group">
                <label>City</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="Enter city"
                />
              </div>

              {/* ABOUT */}
              <div className="cp-form-group">
                <label>About
                  <small
                    style={{
                      float: "right"
                    }}
                  >
                    {
                      editAbout.length
                    } / 200
                  </small>
                </label>
                <textarea
                  rows={4}
                  value={editAbout}
                  onChange={(e) =>
                    setEditAbout(
                      e.target.value
                    )
                  }
                />
                {
                  editAbout.length > 0 &&
                  editAbout.length > 200 && (
                    <small
                      style={{
                        color: "red"
                      }}
                    >
                      About must be at least
                      200 characters
                    </small>
                  )
                }
              </div>

              {/* ERROR */}
              {
                saveError && (
                  <p
                    style={{
                      color: "red"
                    }}
                  >
                    {saveError}
                  </p>
                )
              }

              {
                saveSuccess && (
                  <p
                    style={{
                      color: "green"
                    }}
                  >
                    {saveSuccess}
                  </p>
                )
              }

              {/* SAVE BUTTON */}
              <div className="cp-save-wrap">
                <button
                  type="submit"
                  disabled={
                    saving ||
                    (
                      editAbout &&
                      editAbout.length > 200
                    )
                  }
                  className="cp-save-btn"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPhotoModal && (
        <div className="cp-edit-modal-overlay">
          <div className="cp-edit-modal">
            <button
              className="cp-edit-close"
              aria-label="Close"
              type="button"
              onClick={closePhotoModal}
            >
              &times;
            </button>
            <h2 className="cp-edit-title">
              Upload Photos
            </h2>
            <form onSubmit={handleAdd} >
              {/* GALLERY */}
              <div className="cp-form-group">
                <label>Gallery Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={
                    handleGalleryChange
                  }
                />
              </div>
              {/* GALLERY PREVIEW */}
              <div className="cp-gallery-preview">
                {galleryPreview.map((img, index) => (
                  <div className="cp-gallery-preview-item" key={index}>
                    <img
                      src={img}
                      alt=""
                    />
                    <button
                      type="button"
                      className="cp-gallery-remove"
                      onClick={() => removeGalleryImage(index)}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                ))}
              </div>
              {/* SAVE BUTTON */}
              <div className="cp-save-wrap">
                <button
                  type="submit"
                  disabled={saving}
                  className="cp-save-btn"
                >
                  {saving ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
