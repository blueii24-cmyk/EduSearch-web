import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { MapPin, Menu, X } from 'lucide-react'
import Logo from '../common/Logo'

export default function Navbar({ profile, user, onLogout }) {
  const [open, setOpen] = useState(false)
  const links = [['/dashboard', 'Dashboard'], ['/explore', 'Explore'], ['/colleges', 'Colleges'], ['/jobs', 'Jobs'], ['/internships', 'Internships'], ['/paths', 'Paths']]
  return <header className="navbar"><div className="nav-inner container"><Link className="brand" to="/" onClick={() => setOpen(false)}><span className="brand-mark"><Logo size={17} /></span><span>Edu<span>Search</span></span></Link><nav className={`nav-links ${open ? 'is-open' : ''}`} aria-label="Main navigation">{links.map(([path, label]) => <NavLink key={path} to={path} onClick={() => setOpen(false)}>{label}</NavLink>)}<div className="mobile-nav-actions"><NavLink to="/profile" onClick={() => setOpen(false)}>Your profile</NavLink>{user && <button onClick={onLogout}>Log out</button>}</div></nav><div className="nav-actions"><button className="location-button" type="button"><MapPin size={15} /> {profile.location || 'Set location'}</button>{user ? <><Link className="profile-link" to="/profile"><span className="avatar">{user.email?.slice(0, 2).toUpperCase() || 'ES'}</span><span className="profile-label">Profile</span></Link><button className="nav-logout" onClick={onLogout}>Log out</button></> : <Link className="profile-link" to="/login"><span className="profile-label">Log in</span></Link>}</div><button className="menu-button" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>{open ? <X size={22} /> : <Menu size={22} />}</button></div></header>
}
