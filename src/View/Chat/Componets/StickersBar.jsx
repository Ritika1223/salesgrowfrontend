import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

function getApiOrigin(apiBaseUrl) {
  const raw = String(apiBaseUrl || "").trim();
  return raw.replace(/\/api\/?$/, "");
}

function toAbsoluteUrl(maybeRelativeUrl, baseUrl) {
  const raw = String(maybeRelativeUrl || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `${window.location.protocol}${raw}`;
  const base = String(baseUrl || "").replace(/\/+$/, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return base ? `${base}${path}` : path;
}

export default function StickersBar({ apiBaseUrl, onSelectSticker }) {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiOrigin = useMemo(() => getApiOrigin(apiBaseUrl), [apiBaseUrl]);

  useEffect(() => {
    if (!apiBaseUrl) {
      setStickers([]);
      return;
    }

    const stickersUrl = `${String(apiBaseUrl).replace(/\/+$/, "")}/stickers`;
    setLoading(true);
    axios
      .get(stickersUrl)
      .then((res) => {
        const data = res?.data;
        const list = Array.isArray(data) ? data : data?.stickers;
        setStickers(Array.isArray(list) ? list : []);
      })
      .catch(() => setStickers([]))
      .finally(() => setLoading(false));
  }, [apiBaseUrl]);

  return (
    <div className="cp-stickers-bar">
      {loading ? (
        <div className="cp-sticker-hint cp-sticker-hint--sm">
          Loading stickers…
        </div>
      ) : stickers.length === 0 ? (
        <div className="cp-sticker-hint cp-sticker-hint--sm">No stickers</div>
      ) : (
        stickers.map((sticker) => (
          <div
            key={sticker._id || sticker.slug || sticker.name}
            className="cp-sticker-item"
            onClick={() => onSelectSticker?.(sticker)}
          >
            <img
              src={toAbsoluteUrl(sticker.imageUrl, apiOrigin)}
              alt={sticker.name || "Sticker"}
              className="cp-sticker-img"
              loading="lazy"
            />
            {sticker.cost} 🪙
          </div>
        ))
      )}
    </div>
  );
}

