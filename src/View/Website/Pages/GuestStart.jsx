import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { enterAsGuest, isLoggedIn, isGuest } from "../../../utils/auth";

const RANDOM_NAMES = [
  "Rohan",
  "Sofia",
  "Neha",
  "Arjun",
  "Maya",
  "Kabir",
  "Ananya",
  "Vihaan",
  "Isha",
  "Aarav",
  "Priya",
  "Dev",
];

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Jaipur",
  "Ahmedabad",
  "Lucknow",
  "Chandigarh",
  "Indore",
];

export default function GuestStart() {
  const navigate = useNavigate();
  const ages = useMemo(
    () => Array.from({ length: 63 }, (_, i) => String(i + 18)),
    [],
  );
  const [form, setForm] = useState({
    name: "",
    gender: "",
    age: "",
    city: "",
    human: true,
    adult: false,
  });
  const [error, setError] = useState("");
  const [cityOpen, setCityOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn() || isGuest()) {
      navigate("/live", { replace: true });
    }
  }, [navigate]);

  const filteredCities = CITIES.filter((c) =>
    c.toLowerCase().includes(form.city.trim().toLowerCase()),
  );

  const pickRandomName = () => {
    const next = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setForm((prev) => ({ ...prev, name: next }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Please enter a display name.");
      return;
    }
    if (!form.gender) {
      setError("Please select your gender.");
      return;
    }
    if (!form.age) {
      setError("Please select your age.");
      return;
    }
    if (!form.city.trim()) {
      setError("Please enter your city.");
      return;
    }
    if (!form.human || !form.adult) {
      setError("Please confirm both checkboxes to continue.");
      return;
    }
    enterAsGuest({
      name: form.name.trim(),
      gender: form.gender,
      age: form.age,
      city: form.city.trim(),
    });
    navigate("/live", { replace: true });
  };

  return (
    <div className="guest-start">
      <header className="intro-topbar">
        <div className="intro-brand">
          <strong>MLM Project</strong>
        </div>
        <div className="intro-live-now">
          <span className="intro-live-dot"></span>
          Live Now
        </div>
      </header>

      <form className="guest-card" onSubmit={handleSubmit}>
        <h1>Before you start</h1>
        <p className="guest-card-sub">Create your guest profile to continue</p>

        <label className="guest-label">
          Your display name <span>*</span>
        </label>
        <div className="guest-name-row">
          <input
            type="text"
            placeholder="Enter your display name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <button type="button" className="guest-random-btn" onClick={pickRandomName}>
            <i className="bi bi-shuffle"></i>
            Random name
          </button>
        </div>

        <label className="guest-label">
          Your gender <span>*</span>
        </label>
        <div className="guest-gender-grid">
          {[
            { id: "male", icon: "bi-gender-male", label: "Male" },
            { id: "female", icon: "bi-gender-female", label: "Female" },
            { id: "other", icon: "bi-gender-ambiguous", label: "Other" },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              className={`guest-gender ${form.gender === g.id ? "is-active" : ""}`}
              onClick={() => setForm({ ...form, gender: g.id })}
            >
              <i className={`bi ${g.icon}`}></i>
              {g.label}
            </button>
          ))}
        </div>

        <div className="guest-two-col">
          <div>
            <label className="guest-label">
              Your age <span>*</span>
            </label>
            <select
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            >
              <option value="">Select age</option>
              {ages.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </div>
          <div className="guest-city-wrap">
            <label className="guest-label">
              Your city <span>*</span>
            </label>
            <input
              type="text"
              placeholder="Search city"
              value={form.city}
              onFocus={() => setCityOpen(true)}
              onBlur={() => setTimeout(() => setCityOpen(false), 150)}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            {cityOpen && filteredCities.length > 0 && (
              <ul className="guest-city-list">
                {filteredCities.map((city) => (
                  <li key={city}>
                    <button
                      type="button"
                      onMouseDown={() => setForm({ ...form, city })}
                    >
                      {city}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <label className="guest-check">
          <input
            type="checkbox"
            checked={form.human}
            onChange={(e) => setForm({ ...form, human: e.target.checked })}
          />
          I’m human not robot
        </label>
        <label className="guest-check">
          <input
            type="checkbox"
            checked={form.adult}
            onChange={(e) => setForm({ ...form, adult: e.target.checked })}
          />
          I’m at least 18 years old and agree to the Terms of Service and Privacy Policy
        </label>

        {error && <div className="app-alert error-alert">{error}</div>}

        <button type="submit" className="guest-submit">
          I Agree, Chat Now
          <i className="bi bi-arrow-right"></i>
        </button>

        <p className="guest-signin">
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
