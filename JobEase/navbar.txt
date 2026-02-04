import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false)
    }, [location])

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Stay & Amenities', path: '/stay' },
        { name: 'Pool & Activities', path: '/activities' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'Contact', path: '/contact' },
    ]

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${isScrolled ? 'bg-gray-900/40 backdrop-blur-xl shadow-md py-4 border-b border-white/10' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-2xl font-heading font-bold text-primary tracking-wider">
                    AD Royal <span className="text-primary-light font-normal text-lg">Private Villa</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-xs font-semibold uppercase tracking-widest transition-all duration-300 hover:text-accent ${location.pathname === link.path ? 'text-primary' : 'text-text/80'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <a
                        href="https://wa.me/91XXXXXXXXXX" // TODO: Update with real number
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary text-[#F9F9F4] px-8 py-3 rounded-full font-medium hover:bg-primary-light transition-all shadow-md hover:shadow-lg uppercase text-[10px] tracking-[0.2em]"
                    >
                        Book Now
                    </a>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-text text-2xl"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden flex flex-col items-center py-8 space-y-6"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-lg font-medium text-text hover:text-primary transition-colors font-heading"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <a
                            href="https://wa.me/91XXXXXXXXXX"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary text-white px-8 py-3 rounded-full font-medium uppercase tracking-widest text-sm"
                        >
                            Book Now
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar
