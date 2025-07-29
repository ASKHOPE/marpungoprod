
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Marpu Info */}
          <div>
            <h3 className="text-lg font-headline font-semibold text-secondary-foreground mb-4">Marpu</h3>
            <p className="text-sm text-secondary-foreground/90">
              Driving positive change and empowering communities. Join us in making a difference.
            </p>
          </div>

          {/* Column 2: Follow Us */}
          <div>
            <h3 className="text-md font-headline font-semibold text-secondary-foreground mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com/yourngo" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-secondary-foreground/80 hover:text-accent transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com/yourngo" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-secondary-foreground/80 hover:text-accent transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com/yourngo" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-secondary-foreground/80 hover:text-accent transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com/company/yourngo" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-secondary-foreground/80 hover:text-accent transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h3 className="text-md font-headline font-semibold text-secondary-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-secondary-foreground/90 hover:text-accent hover:underline transition-colors">About Us</Link></li>
              <li><Link href="/events" className="text-secondary-foreground/90 hover:text-accent hover:underline transition-colors">Events</Link></li>
              <li><Link href="/donate" className="text-secondary-foreground/90 hover:text-accent hover:underline transition-colors">Donate</Link></li>
              <li><Link href="/volunteer" className="text-secondary-foreground/90 hover:text-accent hover:underline transition-colors">Volunteer</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-md font-headline font-semibold text-secondary-foreground mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="text-secondary-foreground/90 hover:text-accent hover:underline transition-colors">Contact Us</Link></li>
              <li><Link href="/terms" className="text-secondary-foreground/90 hover:text-accent hover:underline transition-colors">Terms and Conditions</Link></li>
              <li><Link href="/legal" className="text-secondary-foreground/90 hover:text-accent hover:underline transition-colors">Legal Compliance</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-secondary-foreground/70">
            &copy; {new Date().getFullYear()} Marpu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
