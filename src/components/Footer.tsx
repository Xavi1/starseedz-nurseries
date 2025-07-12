import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon, FacebookIcon, InstagramIcon, TwitterIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
const Footer = () => {
  return <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Starseedz Nurseries</h3>
            <p className="text-gray-300 mb-4">
              Your trusted source for beautiful plants and expert gardening
              advice since 1998.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <InstagramIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <TwitterIcon className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-300 hover:text-white">
                  Shop All Plants
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Care Guides
                </a>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Plant Care Tips
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-300 hover:text-white">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPinIcon className="h-6 w-6 text-green-500 mr-2" />
                <span className="text-gray-300">
                  123 Garden Street
                  <br />
                  Plantville, PL 12345
                </span>
              </li>
              <li className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-green-500 mr-2" />
                <a href="tel:+11234567890" className="text-gray-300 hover:text-white">
                  (123) 456-7890
                </a>
              </li>
              <li className="flex items-center">
                <MailIcon className="h-5 w-5 text-green-500 mr-2" />
                <a href="mailto:info@starseedz.com" className="text-gray-300 hover:text-white">
                  info@starseedz.com
                </a>
              </li>
              <li className="flex items-start">
                <ClockIcon className="h-5 w-5 text-green-500 mr-2" />
                <div className="text-gray-300">
                  <p>Mon-Fri: 9am - 6pm</p>
                  <p>Sat-Sun: 10am - 4pm</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Starseedz Nurseries. All rights
            reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/cc-badges-ppmcvdam.png" alt="Payment methods" className="h-8" />
          </div>
        </div>
      </div>
    </footer>;
};

export default Footer;