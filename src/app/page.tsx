'use client'

import { motion, useScroll, useTransform, useSpring, useMotionValue, useAnimation, useDragControls } from 'framer-motion'
import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'

// Add this at the top level of your component
const gradientTextStyles = `
  bg-gradient-to-r from-scarlet via-crimson to-scarlet
  bg-clip-text text-transparent
  bg-[length:200%_auto]
  animate-gradient
  transition-colors
`

// Add type definition before the FloatingOrb component
interface FloatingOrbProps {
  color: string;
  delay: number;
}

// Add a custom hook for detecting touch devices
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);
  
  return isTouch;
}

// Optimize the InteractiveBackground by reducing orbs and using useMemo
function InteractiveBackground() {
  const orbs = useMemo(() => [
    { color: "#FF2400", delay: 0 },    // Scarlet
    { color: "#800000", delay: 0.5 },  // Maroon
  ], []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, index) => (
        <FloatingOrb key={index} color={orb.color} delay={orb.delay} />
      ))}
    </div>
  );
}

// Optimize the FloatingOrb component
function FloatingOrb({ color, delay }: FloatingOrbProps) {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const isTouch = useIsTouchDevice();
  
  // Reduce animation complexity on mobile
  const animationSettings = useMemo(() => ({
    duration: isTouch ? 25 : 20,
    stiffness: isTouch ? 3 : 5,
    damping: isTouch ? 35 : 30,
  }), [isTouch]);

  useEffect(() => {
    // Initialize position on client-side
    x.set(Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000));
    y.set(Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800));
    
    let mounted = true;
    
    const animate = async () => {
      while (mounted) {
        await controls.start({
          x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
          y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          transition: {
            ...animationSettings,
            delay
          }
        });
      }
    };
    
    animate();
    return () => { mounted = false };
  }, [controls, delay, x, y, animationSettings]);

  // Add window resize handler
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      x.set(Math.random() * window.innerWidth);
      y.set(Math.random() * window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [x, y]);

  return (
    <motion.div
      style={{ x, y }}
      animate={controls}
      drag
      dragControls={dragControls}
      dragMomentum={true}
      dragElastic={0.1}
      dragTransition={{ bounceStiffness: 100, bounceDamping: 10 }}
      className="absolute w-[40vw] h-[40vw] max-w-3xl max-h-3xl rounded-full opacity-10 mix-blend-screen blur-3xl"
      initial={false}
    >
      <div
        className="w-full h-full rounded-full"
        style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
      />
    </motion.div>
  );
}

// Add type definitions
interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

// Add interfaces for component props
interface MemberCardProps {
  name: string;
  role: string;
  image: string;
  delay: number;
}

interface DragEndInfo {
  offset: {
    x: number;
    y: number;
  };
  velocity: {
    x: number;
    y: number;
  };
}

// Add mobile-friendly styles
const mobileStyles = `
  @media (max-width: 768px) {
    .group-hover\\:scale-105 {
      transition-duration: 300ms;
    }
    
    .group-hover\\:opacity-100 {
      transition-duration: 300ms;
    }
    
    .touch-action-none {
      touch-action: none;
    }
    
    .active\\:scale-95:active {
      transform: scale(0.95);
    }
    
    .active\\:text-scarlet:active {
      color: #FF2400;
    }
  }
  
  @media (hover: none) {
    .group:active .group-hover\\:scale-105 {
      transform: scale(1.05);
    }
    
    .group:active .group-hover\\:opacity-100 {
      opacity: 1;
    }
  }
`;

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  // Optimize scroll animation without throttle
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.01
  })

  // Memoize common animation variants
  const fadeInVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }), []);

  // Update image loader with proper types
  const imageLoader = ({ src, width, quality }: ImageLoaderProps) => {
    return `${src}?w=${width}&q=${quality || 75}`
  }

  return (
    <main className="min-h-screen">
      <InteractiveBackground />

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-scarlet z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Update image components with loading optimization */}
      <Image
        src="/images/hero.jpg"
        alt="Scarlet Reverie band"
        fill
        className="object-cover object-center"
        priority
        quality={75}  // Reduced quality for better performance
        loading="eager"
        sizes="100vw"  // Optimize image sizing
      />

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-darkPurple/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-2xl font-bold ${gradientTextStyles}`}
            >
              Scarlet Reverie
            </motion.div>
            <div className="hidden md:flex space-x-8">
              <NavLink href="#about">About</NavLink>
              <NavLink href="#epk">EPK</NavLink>
              <NavLink href="#music">Music</NavLink>
              <NavLink href="#tour">Tour</NavLink>
              <NavLink href="#contact">Contact</NavLink>
            </div>
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden mt-4 space-y-4"
            >
              <MobileNavLink href="#about">About</MobileNavLink>
              <MobileNavLink href="#epk">EPK</MobileNavLink>
              <MobileNavLink href="#music">Music</MobileNavLink>
              <MobileNavLink href="#tour">Tour</MobileNavLink>
              <MobileNavLink href="#contact">Contact</MobileNavLink>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center relative overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          {/* Desktop Hero Image */}
          <Image
            src="/images/hero.jpg"
            alt="Scarlet Reverie band"
            fill
            className="hidden md:block object-cover object-center"
            priority
            quality={75}
            loading="eager"
            sizes="100vw"
          />
          {/* Mobile Hero Image */}
          <Image
            src="/images/hero-mobile.jpg"
            alt="Scarlet Reverie band"
            fill
            className="block md:hidden object-cover object-center"
            priority
            quality={75}
            loading="eager"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-darkPurple/70 via-darkPurple/50 to-darkPurple z-10" />
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          whileInView="visible"
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative z-20 text-center px-4"
        >
          <motion.h1 
            className={`text-5xl md:text-7xl font-bold mb-6 ${gradientTextStyles}`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Scarlet Reverie
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            Female-fronted progressive rock
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-scarlet text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-scarlet/90 transition-colors relative overflow-hidden group"
          >
            <span className="relative z-10">Listen Now</span>
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.5 }}
            />
          </motion.button>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="section-padding relative">
        <div className="container backdrop-blur-sm bg-darkPurple/30 rounded-lg p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className={`heading ${gradientTextStyles}`}>About Us</h2>
              <p className="text-gray-300 mb-6">
                Based in Toronto, Scarlet Reverie brings nostalgic embellishments of the 90s era to their music. Their sound emotes both strength and softness yet is ever present with ferocity and passion.
              </p>
              <p className="text-gray-300">
                When it comes to their writing, they like to push the envelope and within it you'll find the spirit of the underdog.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
            >
              <Image
                src="/images/about.jpg"
                alt="Scarlet Reverie band members"
                fill
                className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                quality={100}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-scarlet/20 to-crimson/20 group-hover:from-scarlet/40 group-hover:to-crimson/40 transition-all duration-700 ease-out" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-darkPurple via-transparent to-transparent transition-opacity duration-700" />
              <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out">
                <h3 className={`text-2xl md:text-3xl font-bold text-center ${gradientTextStyles}`}>
                  The Scarlet Reverie Jam Space
                </h3>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Band Members Section */}
      <section id="members" className="section-padding relative">
        <div className="container backdrop-blur-sm">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`text-4xl md:text-5xl font-bold text-center mb-16 ${gradientTextStyles}`}
          >
            Meet the Band
          </motion.h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto">
            {/* Lead Vocals */}
            <MemberCard
              key="lead-vocals"
              name="Nidhi"
              role="Lead Vocals"
              image="/images/member-vocals.jpg"
              delay={0.1}
            />

            {/* Lead Guitar */}
            <MemberCard
              key="lead-guitar"
              name="Josh"
              role="Lead Guitar"
              image="/images/member-guitar.jpg"
              delay={0.2}
            />

            {/* Bass */}
            <MemberCard
              key="bass"
              name="Ben"
              role="Bass"
              image="/images/member-bass.jpg"
              delay={0.3}
            />

            {/* Drums */}
            <MemberCard
              key="drums"
              name="Jay"
              role="Drums"
              image="/images/member-drums.jpg"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Music Section */}
      <section id="music" className="section-padding relative">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`heading ${gradientTextStyles}`}>Latest Releases</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-darkPurple/30 rounded-lg p-12 text-center"
          >
            <h3 className="text-2xl font-bold mb-4 text-scarlet">Coming Soon!</h3>
            <p className="text-gray-300">
              Our first release is currently in production. Stay tuned for updates!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tour Section */}
      <section id="tour" className="section-padding relative">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`heading ${gradientTextStyles}`}>Tour Dates</h2>
            <p className="subheading text-gray-300">
              Catch us live on stage
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-darkPurple/30 backdrop-blur-sm rounded-lg p-12 text-center max-w-3xl mx-auto"
          >
            <h3 className="text-2xl font-bold mb-4 text-scarlet">No Tours Scheduled</h3>
            <p className="text-gray-300">
              We're currently working on scheduling our first tour. Follow us on social media to be the first to know when shows are announced!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding relative">
        <div className="container backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`heading ${gradientTextStyles}`}>Get in Touch</h2>
            <p className="subheading text-gray-300">
              Connect with us on social media or drop us an email
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="flex justify-center space-x-8 mb-8">
              <SocialLink href="https://www.instagram.com/scarletreverie.band" target="_blank" rel="noopener noreferrer" label="Instagram" className="text-4xl">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </SocialLink>
              <SocialLink href="https://www.tiktok.com/@scarletreveriie" target="_blank" rel="noopener noreferrer" label="TikTok" className="text-4xl">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 00-1-.08A6.34 6.34 0 003 15.66a6.34 6.34 0 0010.86 4.48V12.5a8.32 8.32 0 005.73 2.15V11.2a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 00-1-.08A6.34 6.34 0 003 15.66a6.34 6.34 0 0010.86 4.48V12.5a8.32 8.32 0 005.73 2.15V11.2a4.83 4.83 0 01-3.77-4.25"/>
                </svg>
              </SocialLink>
            </div>
            <div className="text-gray-300">
              <p className="text-xl mb-2">Email us at:</p>
              <a href="mailto:scarletreverieband@gmail.com" className="text-scarlet hover:text-scarlet/80 transition-colors">
                scarletreverieband@gmail.com
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* EPK Section */}
      <section id="epk" className="section-padding relative">
        <div className="container backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`heading ${gradientTextStyles}`}>Electronic Press Kit</h2>
            <p className="subheading text-gray-300">
              Media resources and band information
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Press Release */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-darkPurple/30 rounded-lg p-8"
            >
              <h3 className="text-2xl font-bold mb-6 text-scarlet">Latest Press</h3>
              <div className="mb-8">
                <a 
                  href="https://canvasrebel.com/conversations-with-nidhi-arya/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-scarlet hover:text-scarlet/80 transition-colors text-lg inline-flex items-center"
                >
                  <span>Conversations with Nidhi Arya - Canvas Rebel</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <h3 className="text-2xl font-bold mb-6 text-scarlet">About the Band</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 mb-4">
                  Scarlet Reverie emerges from Toronto's vibrant music scene as a progressive rock powerhouse. The band's unique sound bridges the gap between modern progressive complexity and nostalgic 90s rock energy.
                </p>
                <p className="text-gray-300 mb-4">
                  Drawing inspiration from both classic and contemporary prog rock, Scarlet Reverie crafts intricate compositions that showcase technical prowess while maintaining emotional depth and accessibility.
                </p>
                <p className="text-gray-300">
                  The band is currently working on their debut release, which promises to deliver a fresh perspective on progressive rock while paying homage to their influences.
                </p>
              </div>
            </motion.div>

            {/* Photo Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold mb-6 text-scarlet">Press Photos</h3>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((num) => (
                  <div 
                    key={num}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage(`/images/press${num}.jpg`)}
                  >
                    <Image
                      src={`/images/press${num}.jpg`}
                      alt={`Scarlet Reverie press photo ${num}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Download Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.a
              href="/epk/scarlet-reverie-epk.zip"
              download
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-2 bg-scarlet text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-scarlet/90 transition-colors"
            >
              <span>Download Complete EPK</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </motion.a>
            <p className="text-sm text-gray-400 mt-4">
              Includes high-resolution photos, band bio, and technical requirements
            </p>
          </motion.div>
        </div>
      </section>

      {/* Image Modal */}
      <ImageModal
        src={selectedImage || ''}
        alt="Scarlet Reverie press photo"
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      {/* Footer */}
      <footer className="bg-darkPurple/80 py-16 border-t border-gray-800">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
            {/* Brand Section */}
            <div>
              <h3 className="text-xl font-bold text-scarlet mb-4">Scarlet Reverie</h3>
              <p className="text-gray-400 mb-4">
                Toronto Progressive Rock
              </p>
              <p className="text-gray-400">Toronto, ON</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <NavLink href="#about">About</NavLink>
                </li>
                <li>
                  <NavLink href="#music">Music</NavLink>
                </li>
                <li>
                  <NavLink href="#tour">Tour</NavLink>
                </li>
                <li>
                  <NavLink href="#epk">EPK</NavLink>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
              <div className="space-y-2">
                <a 
                  href="mailto:scarletreverieband@gmail.com" 
                  className="text-gray-400 hover:text-scarlet transition-colors block"
                >
                  scarletreverieband@gmail.com
                </a>
                <div className="flex space-x-4 mt-4">
                  <SocialLink href="https://www.instagram.com/scarletreverie.band" target="_blank" rel="noopener noreferrer" label="Instagram">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </SocialLink>
                  <SocialLink href="https://www.tiktok.com/@scarletreveriie" target="_blank" rel="noopener noreferrer" label="TikTok">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 00-1-.08A6.34 6.34 0 003 15.66a6.34 6.34 0 0010.86 4.48V12.5a8.32 8.32 0 005.73 2.15V11.2a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 00-1-.08A6.34 6.34 0 003 15.66a6.34 6.34 0 0010.86 4.48V12.5a8.32 8.32 0 005.73 2.15V11.2a4.83 4.83 0 01-3.77-4.25"/>
                    </svg>
                  </SocialLink>
                </div>
              </div>
            </div>

            {/* Press */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Press</h4>
              <div className="space-y-2">
                <a 
                  href="/epk/scarlet-reverie-epk.zip" 
                  className="text-gray-400 hover:text-scarlet transition-colors block"
                  download
                >
                  Download EPK
                </a>
                <a 
                  href="https://canvasrebel.com/conversations-with-nidhi-arya/" 
                  className="text-gray-400 hover:text-scarlet transition-colors block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Latest Interview
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 mt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Scarlet Reverie. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Combine all styles into one style tag */}
      <style jsx global>{`
        ${mobileStyles}
        
        .group:hover .group-hover\\:scale-105 {
          transform: scale(1.05);
          will-change: transform;
        }
        
        .group:hover .group-hover\\:opacity-100 {
          opacity: 1;
          will-change: opacity;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .group-hover\\:scale-105,
          .group-hover\\:opacity-100,
          .transition-all,
          .transition-transform,
          .transition-opacity {
            transition: none !important;
          }
        }
      `}</style>
    </main>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-gray-300 hover:text-scarlet transition-colors"
    >
      {children}
    </a>
  )
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="block text-gray-300 hover:text-scarlet transition-colors py-2"
    >
      {children}
    </a>
  )
}

function SocialLink({ href, label, children, className = '', target = '_blank', rel = 'noopener noreferrer' }: { href: string; label: string; children: React.ReactNode; className?: string; target?: string; rel?: string }) {
  const isTouch = useIsTouchDevice();
  
  return (
    <motion.a
      href={href}
      aria-label={label}
      className={`text-gray-400 hover:text-scarlet active:text-scarlet transition-colors ${className}`}
      whileHover={isTouch ? undefined : { scale: 1.2, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      target={target}
      rel={rel}
    >
      {children}
    </motion.a>
  )
}

function ImageModal({ 
  src, 
  alt, 
  isOpen, 
  onClose 
}: { 
  src: string; 
  alt: string; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();
  const dragControls = useDragControls();
  const y = useMotionValue(0);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: DragEndInfo) => {
    if (Math.abs(info.offset.y) > 50) {
      onClose();
    } else {
      y.set(0);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      ref={modalRef}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 touch-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="relative max-w-7xl w-full"
        drag={isTouch ? "y" : false}
        dragControls={dragControls}
        dragConstraints={modalRef}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute -top-12 right-0 text-white hover:text-scarlet active:text-scarlet transition-colors p-4"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="relative aspect-[3/2] w-full">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            quality={75}
            loading="lazy"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Update the MemberCard component with proper types
function MemberCard({ name, role, image, delay }: MemberCardProps) {
  const isTouch = useIsTouchDevice();
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      key={name}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true, margin: "-50px" }}
      className="relative group cursor-pointer"
      whileHover={isTouch ? undefined : { y: -10 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative overflow-hidden rounded-lg aspect-[3/4] lg:aspect-square">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transform group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, 25vw"
          quality={75}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-darkPurple via-darkPurple/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 text-center transform transition-transform duration-300">
          <h3 className={`text-xl lg:text-2xl font-bold ${gradientTextStyles}`}>{name}</h3>
          <p className="text-lg lg:text-xl text-scarlet">{role}</p>
        </div>
      </div>
    </motion.div>
  );
} 