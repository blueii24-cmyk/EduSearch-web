import React from 'react'
import Navbar from '../navigation/Navbar'
import Footer from './Footer'

export default function Layout({ profile, children }) {
  return <><Navbar profile={profile} /><main>{children}</main><Footer /></>
}
