import { useEffect } from 'react';
import { LeafIcon, SunIcon, DropletIcon } from 'lucide-react';
export const AboutSection = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);
  return <section className="py-16 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              About Starseedz Nurseries
            </h2>
            <p className="mt-3 max-w-3xl text-lg text-gray-600">
              I started growing seedlings about 27 years ago doing pimentos, hot peppers,
              pak choi, lettuce, and sweet peppers. 
            </p>
            <div className="mt-8 space-y-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                    <LeafIcon className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Sustainable Practices
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    We're committed to environmentally friendly growing methods
                    and sustainable packaging.
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                    <SunIcon className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Expert Knowledge
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    Our team of horticulture specialists can help you choose the
                    right plants for your space.
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                    <DropletIcon className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Quality Guarantee
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    All our plants are guaranteed to arrive healthy and thriving
                    or we'll replace them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};