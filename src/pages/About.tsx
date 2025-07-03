import React from 'react';
// Remove Header and Footer imports
import { LeafIcon, HeartIcon, UsersIcon, AwardIcon, ThumbsUpIcon, CalendarIcon, GlobeIcon, CheckCircleIcon } from 'lucide-react';
export const About = () => {
  // Team members data
  const teamMembers = [{
    name: 'Sarah Johnson',
    role: 'Founder & Head Horticulturist',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    bio: 'With over 25 years of experience in horticulture, Sarah founded GreenThumb Nursery with a vision to share her passion for plants with the community.'
  }, {
    name: 'Michael Chen',
    role: 'Garden Design Specialist',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    bio: 'Michael brings 15 years of landscape design experience to help customers create beautiful, sustainable outdoor spaces that thrive in local conditions.'
  }, {
    name: 'Priya Patel',
    role: 'Plant Care Expert',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    bio: 'Priya specializes in indoor plants and has a talent for diagnosing plant problems and providing easy-to-follow care advice for plant parents of all levels.'
  }, {
    name: 'James Wilson',
    role: 'Organic Growing Specialist',
    image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    bio: 'James is passionate about organic gardening methods and helps maintain our commitment to sustainable, earth-friendly growing practices.'
  }];
  // Testimonials data
  const testimonials = [{
    quote: 'GreenThumb Nursery has transformed our backyard into a beautiful oasis. Their plant recommendations were perfect for our space and climate.',
    author: 'Emily R.',
    location: 'Plantville'
  }, {
    quote: "I've been shopping here for years and the quality of their plants is consistently excellent. The staff is incredibly knowledgeable and helpful.",
    author: 'David M.',
    location: 'Garden Heights'
  }, {
    quote: "As a beginner gardener, I appreciate how patient and educational the team is. They've helped me gain confidence in my plant care abilities.",
    author: 'Lisa T.',
    location: 'Bloomfield'
  }];
  // Timeline data
  const timeline = [{
    year: '1998',
    title: 'Humble Beginnings',
    description: 'GreenThumb Nursery was founded with just a small greenhouse and a big dream.'
  }, {
    year: '2005',
    title: 'Expansion',
    description: 'We expanded our facilities to include 5 acres of growing space and a dedicated garden center.'
  }, {
    year: '2010',
    title: 'Sustainability Commitment',
    description: 'We implemented 100% organic growing practices and sustainable packaging solutions.'
  }, {
    year: '2015',
    title: 'Community Education',
    description: 'Launched our gardening workshop series to share knowledge with our community.'
  }, {
    year: '2020',
    title: 'Online Growth',
    description: 'Expanded to e-commerce to bring our plants and expertise to customers nationwide.'
  }, {
    year: 'Today',
    title: 'Continuing Our Mission',
    description: 'Continuing to grow while staying true to our roots and commitment to quality.'
  }];
  return <div className="min-h-screen bg-white">
      <main>
        {/* Hero Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-green-900 opacity-70"></div>
          <div className="relative h-96 flex items-center justify-center bg-cover bg-center" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80')"
        }}>
            <div className="text-center px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Our Story
              </h1>
              <p className="mt-6 text-xl text-white max-w-3xl mx-auto">
                Rooted in passion, growing with purpose since 1998
              </p>
            </div>
          </div>
        </div>
        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Our Mission & Values
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
                At GreenThumb Nursery, we're guided by a deep love for plants
                and a commitment to helping our community create beautiful,
                sustainable spaces.
              </p>
            </div>
            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-green-50 rounded-lg p-8 text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                    <LeafIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">
                    Environmental Stewardship
                  </h3>
                  <p className="mt-4 text-base text-gray-600">
                    We're committed to sustainable growing practices that
                    protect our planet for future generations of plant lovers.
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-8 text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                    <HeartIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">
                    Plant Passion
                  </h3>
                  <p className="mt-4 text-base text-gray-600">
                    We believe in the power of plants to improve wellbeing,
                    beautify spaces, and connect people with nature.
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-8 text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                    <UsersIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">
                    Community Focus
                  </h3>
                  <p className="mt-4 text-base text-gray-600">
                    We're dedicated to educating and supporting our community
                    through quality products and expert knowledge.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* History Timeline */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Our Journey
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
                From a small greenhouse to a beloved community institution
              </p>
            </div>
            <div className="relative">
              {/* Timeline line */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-green-200"></div>
              <div className="space-y-16">
                {timeline.map((item, index) => <div key={index} className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="md:w-1/2"></div>
                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full border-4 border-green-200 bg-white text-green-600">
                        <CalendarIcon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="relative md:w-1/2 md:pl-8 md:pr-12 md:py-4">
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <span className="inline-block py-1 px-2 rounded bg-green-100 text-green-800 text-xs font-semibold mb-2">
                          {item.year}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
        </section>
        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Meet Our Team
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
                Our passionate experts are here to help you with all your plant
                needs
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member, index) => <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg">
                  <img src={member.image} alt={member.name} className="w-full h-64 object-cover object-center" />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {member.name}
                    </h3>
                    <p className="text-sm text-green-600 mb-3">{member.role}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </div>)}
            </div>
          </div>
        </section>
        {/* Achievements Section */}
        <section className="py-16 bg-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Our Achievements
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
                Recognition for our commitment to quality and sustainability
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <AwardIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Best Local Nursery
                </h3>
                <p className="mt-2 text-gray-600">
                  Community Choice Awards 2022
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <GlobeIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Sustainability Excellence
                </h3>
                <p className="mt-2 text-gray-600">
                  Green Business Association 2021
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Organic Certification
                </h3>
                <p className="mt-2 text-gray-600">
                  Certified Organic Grower since 2010
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Testimonials */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                What Our Customers Say
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
                Don't just take our word for it
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => <div key={index} className="bg-green-50 p-8 rounded-lg shadow-md relative">
                  <div className="absolute -top-4 -left-4 bg-green-600 rounded-full p-2">
                    <ThumbsUpIcon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-gray-600 italic mb-6">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center">
                    <div>
                      <p className="text-gray-900 font-semibold">
                        {testimonial.author}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>)}
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="bg-green-700 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Visit Us Today
              </h2>
              <p className="mt-4 text-xl text-green-100">
                Come experience our nursery in person and let us help you find
                the perfect plants for your space.
              </p>
              <div className="mt-8">
                <a href="/shop" className="inline-block bg-white text-green-700 border border-transparent rounded-md py-3 px-8 font-medium hover:bg-green-50">
                  Shop Our Collection
                </a>
                <a href="#" className="inline-block ml-4 bg-transparent text-white border border-white rounded-md py-3 px-8 font-medium hover:bg-green-800">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>;
};