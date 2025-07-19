import React, { useEffect, useState } from "react";

const IMAGE_MAP: Record<string, string> = {
  "Bakery & Desserts": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSVPJxvuHN4YthdlWyDta8xjlqJ09nhoLo6h-AMy7xQfmVBP5iA0RTXWiAHw_nm",
  "Beverages & Water": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRgfyq5gsBmtAKWdd9d2O_JcWk9INFIpJoBxUCHP6pi5slVK_cM5Bl1n-4FYI2k",
  "Breakfast": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcS9JieTA-svEkXa2DqvJH406KAOiMHjLXJ7BAjtVCSNgUTTuN8w8cdzPRFKTRVn",
  "Candy": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQifIxRmb5S16O2t0YQailSGQcPXbdPdIMm1z7OXuPb8bk1RmRA5dLRXFRinx7s",
  "Cleaning Supplies": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQe6HHxqm5bAON8y5A9pztzpQOouvh-mHG4WtVGQuS2pEC4HqY3WCE_xhNwUKsA",
  "Coffee": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcR1TE6d1wI-TT2pzbd3ktDc-LR6A6H7xU0ZNbDqWrryo2fK0TZZ2Fi11Z0dNKA8",
  "Deli": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTPM7iZgho723k2D3Z2ZTE82PeLimsaKrW4MKNL0CYhS8BGovq7zyBw6vPmkxwC",
  "Floral": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPITTWvmHRkhty-vLhhW3lKpWTuRglmcGCjadrQd_8iUvXCSd-YX33oChrVr2d",
  "Gift Baskets": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgEf2iMlN4V1wQ-oRH-tlvFbwykTTewntUuetVjz_sbX7JXkVWVActOW-CESPe",
  "Household": "https://hips.hearstapps.com/hmg-prod/images/gettyimages-510693044-1550590816.jpg",
  "Kirkland Signature Grocery": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSZijgfMJaZdv_QgZ05RTz2gSSC4tB5GskWcbc8UMh2af3BL_kxZv6BCITDtFWC",
  "Laundry Detergent & Supplies": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSc0BK6-OEQkWMDaAxgGdVycQlGw8jiLrdtYZXccmHcpM7Ddju0t4mRD0h231sg",
  "Meat & Seafood": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcR3VZn96goYxEPJO8C-DZNfuBmA2fbZf6CIjh7-ULwoxb61ND0soIj66jqyNYFV",
  "Organic": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcS1_Aem5dC332tH1mg7aH8A_mzYzHbw6RHny_vKBZrEttFIOI6sLbcRYcnfQLDk",
  "Pantry & Dry Goods": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRZciS7VrnQ2bsU1hLyq-Decb1lYQbr0iNbbfri_yBW0i_Ib4SjavEBsyu7Zz3W",
  "Paper & Plastic Products": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRbcfbVOxLNtwOg-JdJpJEwfo--oetAKtH2bkAFnl6v8yK6geZvdnqb4QqMNAMX",
  "Poultry": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRQElbR13PwrLeQv2SM0QMFKeGQL2fV0o-fSYeGW9HyjC0JhRnKISLirt9JYKhw",
  "Seafood": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRpa8BmBY7qyUguTFxQ5GJ7FqgoDSEOV6o9IgTcMWtZ2JN60GApmwLdwrYHyXHQ",
  "Snacks": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQ0sF3lIJ3yquD1BHSD852rgVHqvnNOqfquNs78p78yyvXMbbHI1woGendy_vRL"
};

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : (data.categories || [])));
  }, []);

  // Example: assign grid spans for mosaic effect
  const mosaicSpans: Record<string, { col: number; row: number }> = {
    "Bakery & Desserts": { col: 2, row: 2 },
    "Beverages & Water": { col: 1, row: 1 },
    "Breakfast": { col: 1, row: 2 },
    "Candy": { col: 2, row: 1 },
    "Cleaning Supplies": { col: 1, row: 1 },
    "Coffee": { col: 1, row: 1 },
    "Deli": { col: 2, row: 1 },
    "Floral": { col: 1, row: 2 },
    "Gift Baskets": { col: 1, row: 1 },
    "Household": { col: 2, row: 1 },
    "Kirkland Signature Grocery": { col: 1, row: 1 },
    "Laundry Detergent & Supplies": { col: 1, row: 2 },
    "Meat & Seafood": { col: 2, row: 1 },
    "Organic": { col: 1, row: 1 },
    "Pantry & Dry Goods": { col: 1, row: 1 },
    "Paper & Plastic Products": { col: 2, row: 1 },
    "Poultry": { col: 1, row: 2 },
    "Seafood": { col: 1, row: 1 },
    "Snacks": { col: 2, row: 1 }
  };

  return (
    <div style={{ width: "100%", background: "#FFF6F0", padding: "2rem 0 2.5rem 0" }}>
      <h2 className="categories-title">Categories</h2>
      <div className="category-grid">
        {categories.map(cat => {
          const imageUrl = IMAGE_MAP[cat.name];
          const description = "Shop our selection of " + cat.name.toLowerCase() + ".";
          const span = mosaicSpans[cat.name] || { col: 1, row: 1 };
          
          return (
            <a
              key={cat.id || cat.name}
              href={"/category/" + encodeURIComponent(cat.name)}
              className="category-item"
              style={{
                gridColumn: `span ${span.col}`,
                gridRow: `span ${span.row}`,
                background: imageUrl ? `url(${imageUrl}) center/cover no-repeat` : "#E67E22",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 6px 24px 0 rgba(0,0,0,0.18)";
                e.currentTarget.style.filter = "brightness(1.08)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "0 2px 8px 0 rgba(0,0,0,0.08)";
                e.currentTarget.style.filter = "none";
              }}
            >
              {/* Dark overlay */}
              <div className="category-overlay" />
              <div className="category-content">
                <span className="category-name">{cat.name}</span>
                <span className="category-description">{description}</span>
              </div>
            </a>
          );
        })}
      </div>
      {/* Responsive styles and title styles */}
      <style>{`
        .categories-title {
          font-size: 2.7rem;
          font-weight: 900;
          letter-spacing: 2px;
          margin: 0 0 2.5rem 0;
          text-align: center;
          position: relative;
          padding-bottom: 0.7rem;
          background: linear-gradient(90deg, #E67E22 0%, #F4C542 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          filter: drop-shadow(0 2px 8px rgba(230,126,34,0.10));
        }
        .categories-title::after {
          content: "";
          display: block;
          margin: 0.5rem auto 0 auto;
          width: 160px;
          height: 14px;
          border-radius: 7px;
          background: linear-gradient(90deg, #E67E22 0%, #F4C542 100%);
          box-shadow: 0 6px 24px 0 rgba(230,126,34,0.15);
        }
        .category-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          grid-auto-rows: 120px;
          gap: 16px;
          grid-auto-flow: dense;
        }
        .category-item {
          display: block;
          color: #fff;
          border-radius: 0px;
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.18s cubic-bezier(.4,2,.3,1), filter 0.18s cubic-bezier(.4,2,.3,1);
          text-decoration: none;
        }
        .category-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.45);
          border-radius: 0px;
          z-index: 1;
        }
        .category-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 1.1rem 1rem 1rem 1.1rem;
        }
        .category-name {
          font-size: 1.08rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 0.4rem;
        }
        .category-description {
          font-size: 0.98rem;
          font-weight: 400;
          opacity: 0.92;
        }

        @media (max-width: 900px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 600px) {
          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
