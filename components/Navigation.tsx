"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";
import Brand from "./Brand";
import { motion, AnimatePresence, Variants } from "framer-motion";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    href: string
  ) => {
    e.preventDefault();
    const targetId = href.replace(/.*#/, "");
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({
        behavior: "smooth",
      });
      // Close mobile menu on link click
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    }
  };

  const mobileMenuVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
  };

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="mr-3">
              <Logo className="w-12 h-10" />
            </div>
            <h1 className="text-2xl font-poppins font-bold">
              <Brand />
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a
                href="#features"
                onClick={(e) => handleScroll(e, "#features")}
                className="text-foreground/80 hover:text-accent transition-colors font-inter"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => handleScroll(e, "#how-it-works")}
                className="text-foreground/80 hover:text-accent transition-colors font-inter"
              >
                How It Works
              </a>
              <a
                href="#mentorship"
                onClick={(e) => handleScroll(e, "#mentorship")}
                className="text-foreground/80 hover:text-accent transition-colors font-inter"
              >
                Mentorship
              </a>
              <a
                href="#pricing"
                onClick={(e) => handleScroll(e, "#pricing")}
                className="text-foreground/80 hover:text-accent transition-colors font-inter"
              >
                Pricing
              </a>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="relative p-2 hover:bg-accent/10 transition-colors"
              aria-label={`Switch to ${
                theme === "dark" ? "light" : "dark"
              } mode`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme === "dark" ? "moon" : "sun"}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "dark" ? (
                    <Moon className="h-5 w-5 text-accent" />
                  ) : (
                    <Sun className="h-5 w-5 text-accent" />
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>
            <Button className="btn-hero">
              <Link href="/signin">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden overflow-hidden"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border border-border rounded-lg mt-2 mb-4">
                <a
                  href="#features"
                  onClick={(e) => handleScroll(e, "#features")}
                  className="block px-3 py-2 text-foreground/80 hover:text-accent transition-colors font-inter"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleScroll(e, "#how-it-works")}
                  className="block px-3 py-2 text-foreground/80 hover:text-accent transition-colors font-inter"
                >
                  How It Works
                </a>
                <a
                  href="#mentorship"
                  onClick={(e) => handleScroll(e, "#mentorship")}
                  className="block px-3 py-2 text-foreground/80 hover:text-accent transition-colors font-inter"
                >
                  Mentorship
                </a>
                <a
                  href="#pricing"
                  onClick={(e) => handleScroll(e, "#pricing")}
                  className="block px-3 py-2 text-foreground/80 hover:text-accent transition-colors font-inter"
                >
                  Pricing
                </a>
                <div className="pt-4 space-y-2">
                  <Button className="w-full btn-hero">
                    <Link href="/signin">Get Started</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
