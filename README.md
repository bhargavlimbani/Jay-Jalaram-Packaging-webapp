# Jay Jalaram Packaging

A modern, 3D-interactive e-commerce platform for corrugated packaging solutions built with React, Node.js, and CSS 3D transforms.

**Live Demo:** https://jay-jalaram-packaging-webapp.vercel.app/

---

## ✨ Features

### Design & Interaction
- **3D Carton Visualizations** — Real CSS 3D transforms of corrugated boxes with kraft paper texture and realistic lighting
- **Pointer-Tracked Tilt** — Cards and panels respond to cursor position with smooth 3D rotations (disabled on touch devices)
- **Scroll-Triggered Reveals** — Elements animate in with 3D perspective transforms as they scroll into view
- **Ambient Carton Field** — A subtle background of floating boxes at page edges (depth-layered with blur and opacity)
- **Hero Cluster** — Focal spinning carton surrounded by 7 drifting satellite boxes in the hero section
- **Kraft Paper Aesthetic** — Custom CSS ground layer with die-cut template grid, warm key light from top-left

### Performance
- No full-viewport backdrop-filter (caused scroll recompositing) — glass effect only on navbar
- will-change: transform applied on hover only, not always-on
- Static cartons use fixed CSS transforms instead of animations
- contain: strict on ambient field for layout containment

### Accessibility
- WCAG AA contrast compliance on all text
- Touch-aware interactions (tilt disabled on coarse pointers)
- Semantic HTML with proper ARIA labels

---

## 🛠️ Tech Stack

**Frontend**
- React 18 with Context API
- Tailwind CSS 3 + custom 3D animations
- React Router v6
- Axios for API

**Backend**
- Node.js + Express
- MySQL for data
- JWT authentication
- Nodemailer/Brevo for email

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: MySQL on Render

---

## 🚀 Quick Start

### Setup
```bash
# Clone
git clone https://github.com/bhargavlimbani/Jay-Jalaram-Packaging-webapp.git
cd Jay-Jalaram-Packaging

# Install
npm install && cd client && npm install && cd ..

# Configure
cp server/.env.example server/.env
cp client/.env.example client/.env

# Run
npm run server          # Terminal 1: Backend on :5000
cd client && npm start  # Terminal 2: Frontend on :3000
```

---

## 📦 Key Components

### BoxCube3D
```jsx
<BoxCube3D 
  size={196}
  w={3} h={3} d={3}
  spin={true}
  branded={false}
/>
```

### BoxCluster
Focal spinning carton + 7 drifting satellites
```jsx
<BoxCluster size={196} />
```

### Tilt3D
Pointer-tracked card tilt with glare
```jsx
<Tilt3D max={12} lift={6} scale={1.04}>
  Content
</Tilt3D>
```

### Reveal
Scroll-triggered 3D entrance
```jsx
<Reveal delay={100}>
  <div>Content reveals on scroll</div>
</Reveal>
```

---

## 🎨 Design System

### Layers (z-index)
- `-4`: Kraft paper + warm light
- `-3`: Die-cut grid pattern
- `-2`: Ambient 12-box field
- `auto`: Content

### Colors
```
--paper-hi: #fdfaf3  (lightest)
--paper: #f7f2e7     (base)
--paper-lo: #efe8d9  (darkest)
--kraft: #c8894a     (box color)
--brand-primary: #ffd43b
```

### Animations
- `brand-drift`: 8–15s vertical float
- `brand-cube-spin`: 22s Y-axis rotation
- `brand-reveal`: Scroll-triggered 3D reveal

---

## 🔐 Authentication
- Email + 10-digit phone registration
- JWT login tokens
- OTP password reset
- Role-based access (customer/admin)

---

## 📊 Features
- Custom quote builder with live 3D preview
- Admin analytics dashboard
- Multi-step order management
- Invoice generation
- Reorder tracking

---

## 🌐 Deployment

**Frontend (Vercel)**
```bash
git push origin main  # Auto-deploys
# Live: https://jay-jalaram-packaging-webapp.vercel.app
```

**Backend (Render)**
- Connect GitHub repo
- Set env vars in dashboard
- Deploys on push to main
- Live: https://jay-jalaram-packaging-webapp.onrender.com

---

## 📝 Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## 🤝 Contributing
1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit: `git commit -m "feat: description"`
3. Push: `git push origin feature/your-feature`
4. Open PR

---

## 📄 License
Proprietary — All rights reserved to Jay Jalaram Packaging

---

## 📞 Support
- Email: limbanibhargavmaheshbhai@gmail.com
- GitHub Issues: [Open an issue](https://github.com/bhargavlimbani/Jay-Jalaram-Packaging-webapp/issues)

---

**Built with ❤️ using React, CSS 3D, and Node.js**
