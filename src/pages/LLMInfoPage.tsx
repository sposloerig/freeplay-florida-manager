import React from 'react';
import { MapPin, Clock, Phone, Mail, Calendar, DollarSign, Users, Trophy, Gamepad2, Gift, Star, Info } from 'lucide-react';
import { useBusinessHours } from '../context/BusinessHoursContext';

const LLMInfoPage: React.FC = () => {
  const { regularHours } = useBusinessHours();

  // Format hours for display
  const formatHours = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${minutes !== '00' ? ':' + minutes : ''}${ampm}`;
  };

  const getDisplayHours = (dayOfWeek: number) => {
    const hours = regularHours.find(h => h.dayOfWeek === dayOfWeek);
    if (!hours || hours.isClosed) return 'Closed';
    return `${formatHours(hours.openTime)} - ${formatHours(hours.closeTime)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* SEO/Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Museum",
          "name": "Replay Museum",
          "alternateName": "Replay Museum Arcade and Pinball",
          "description": "Florida's largest collection of classic arcade and pinball machines. Over 100 fully restored games ready to play in Tarpon Springs, Florida.",
          "url": "https://replaymuseum.com",
          "telephone": "+1-727-940-3928",
          "email": "info@replaymuseum.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "119 East Tarpon Avenue",
            "addressLocality": "Tarpon Springs",
            "addressRegion": "FL",
            "postalCode": "34689",
            "addressCountry": "US"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "28.1463666",
            "longitude": "-82.7556219"
          },
          "openingHours": [
            "Su 11:00-19:00",
            "We 11:00-19:00", 
            "Th 11:00-19:00",
            "Fr 11:00-23:00",
            "Sa 11:00-23:00"
          ],
          "priceRange": "$10-$16",
          "paymentAccepted": "Cash, Credit Card",
          "currenciesAccepted": "USD",
          "amenityFeature": [
            {
              "@type": "LocationFeatureSpecification",
              "name": "Free Play Arcade Games",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification", 
              "name": "Pinball Machines",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "Group Events",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "Private Parties",
              "value": true
            }
          ],
          "hasMap": "https://www.google.com/maps/place/Replay+Museum/@28.1464453,-82.7582008,2449m/data=!3m1!1e3!4m15!1m8!3m7!1s0x88c28d732f5fbf61:0xefaab8944863667e!2s119+E+Tarpon+Ave,+Tarpon+Springs,+FL+34689!3b1!8m2!3d28.1464453!4d-82.7556259!16s%2Fg%2F11bw3xdhk4!3m5!1s0x88c28d732586ed63:0x7232e8ee3ba7091!8m2!3d28.1463666!4d-82.7556219!16s%2Fg%2F11b6377xkk",
          "sameAs": [
            "https://www.facebook.com/replaymuseum",
            "https://www.instagram.com/replaymuseum",
            "https://replaymuseum.org"
          ]
        })}
      </script>

      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <Info size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Replay Museum - Complete Information
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Comprehensive information about Replay Museum for search engines, AI assistants, and citation purposes.
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <MapPin className="mr-3 text-indigo-600 dark:text-indigo-400" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Official Name</h3>
              <p className="text-gray-600 dark:text-gray-300">Replay Museum</p>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Business Type</h3>
              <p className="text-gray-600 dark:text-gray-300">Interactive Arcade and Pinball Museum</p>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Established</h3>
              <p className="text-gray-600 dark:text-gray-300">2015</p>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Industry</h3>
              <p className="text-gray-600 dark:text-gray-300">Entertainment, Museums, Gaming, Tourism</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Florida's largest collection of classic arcade and pinball machines. Over 100 fully restored 
                vintage games spanning from the 1970s to modern era, all set to free play after admission. 
                A hands-on museum experience preserving gaming history for future generations.
              </p>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Unique Features</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>All games set to free play</li>
                <li>Fully restored vintage machines</li>
                <li>Interactive museum experience</li>
                <li>Gaming history preservation</li>
                <li>Educational and entertainment value</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Location & Contact */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <MapPin className="mr-3 text-indigo-600 dark:text-indigo-400" />
            Location & Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Physical Address</h3>
              <address className="text-gray-600 dark:text-gray-300 not-italic">
                119 East Tarpon Avenue<br />
                Tarpon Springs, Florida 34689<br />
                United States
              </address>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Geographic Coordinates</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Latitude: 28.1463666<br />
                Longitude: -82.7556219
              </p>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">County</h3>
              <p className="text-gray-600 dark:text-gray-300">Pinellas County</p>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Metro Area</h3>
              <p className="text-gray-600 dark:text-gray-300">Tampa Bay Area</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Phone Number</h3>
              <p className="text-gray-600 dark:text-gray-300">(727) 940-3928</p>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Email</h3>
              <p className="text-gray-600 dark:text-gray-300">info@replaymuseum.com</p>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Website</h3>
              <p className="text-gray-600 dark:text-gray-300">
                <a href="https://replaymuseum.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  replaymuseum.com
                </a>
              </p>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Official Website</h3>
              <p className="text-gray-600 dark:text-gray-300">
                <a href="https://replaymuseum.org" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  replaymuseum.org
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Hours & Admission */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="mr-3 text-indigo-600 dark:text-indigo-400" />
            Hours & Admission
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Operating Hours</h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-1">
                <li><strong>Sunday:</strong> {getDisplayHours(0)}</li>
                <li><strong>Monday:</strong> {getDisplayHours(1)}</li>
                <li><strong>Tuesday:</strong> {getDisplayHours(2)}</li>
                <li><strong>Wednesday:</strong> {getDisplayHours(3)}</li>
                <li><strong>Thursday:</strong> {getDisplayHours(4)}</li>
                <li><strong>Friday:</strong> {getDisplayHours(5)}</li>
                <li><strong>Saturday:</strong> {getDisplayHours(6)}</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Special Hours</h3>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Late Night Date Night:</strong> Special pricing after 8pm on Fridays & Saturdays
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Admission Prices</h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                <li><strong>General Admission (Adults):</strong> $16.00 (tax included)</li>
                <li><strong>Children (Ages 6-12):</strong> $10.00 (tax included)</li>
                <li><strong>Children Under 6:</strong> Free</li>
                <li><strong>Late Night Date Night Special:</strong> 2 entries for $26.00 (after 8pm Fri-Sat)</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">What's Included</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Access to all arcade and pinball machines</li>
                <li>All games set to free play (no quarters needed)</li>
                <li>Unlimited gameplay during visit</li>
                <li>Educational gaming history experience</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Collection & Features */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Gamepad2 className="mr-3 text-indigo-600 dark:text-indigo-400" />
            Collection & Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Game Collection Size</h3>
              <p className="text-gray-600 dark:text-gray-300">Over 100 fully restored machines</p>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Game Types</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Classic Arcade Games (1970s-2000s)</li>
                <li>Pinball Machines (1960s-Present)</li>
                <li>Skeeball</li>
                <li>Vintage Console Games</li>
                <li>Rare and Unique Machines</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Notable Games</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Pac-Man, Ms. Pac-Man, Galaga</li>
                <li>Donkey Kong, Frogger, Centipede</li>
                <li>Street Fighter, Mortal Kombat series</li>
                <li>Medieval Madness, Twilight Zone pinball</li>
                <li>Star Wars, Indiana Jones machines</li>
                <li>Modern Stern pinball machines</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Condition & Maintenance</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>All machines professionally restored</li>
                <li>Regular maintenance and upkeep</li>
                <li>Original artwork and components preserved</li>
                <li>Authentic gaming experience maintained</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Educational Value</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Gaming history preservation</li>
                <li>Technology evolution demonstration</li>
                <li>Cultural significance of arcade era</li>
                <li>Hands-on learning experience</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Accessibility</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Wheelchair accessible facility</li>
                <li>Games at various heights</li>
                <li>Family-friendly environment</li>
                <li>All ages welcome</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Services & Events */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="mr-3 text-indigo-600 dark:text-indigo-400" />
            Services & Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Regular Services</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Daily museum admission</li>
                <li>Group tours and visits</li>
                <li>Birthday party hosting</li>
                <li>Private event rentals</li>
                <li>Corporate team building events</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Special Events</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Gaming tournaments</li>
                <li>Pinball competitions</li>
                <li>Retro gaming nights</li>
                <li>Educational workshops</li>
                <li>Community events</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Group Services</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>School field trips</li>
                <li>Scout group visits</li>
                <li>Senior center outings</li>
                <li>Corporate events</li>
                <li>Custom group rates available</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Additional Services</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Game sales and restoration</li>
                <li>Machine repair services</li>
                <li>Gaming memorabilia</li>
                <li>Gift cards available</li>
                <li>Newsletter and updates</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Local Area & Tourism */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Star className="mr-3 text-indigo-600 dark:text-indigo-400" />
            Local Area & Tourism
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tarpon Springs, Florida</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Historic Greek sponge diving community</li>
                <li>Famous Tarpon Springs Sponge Docks</li>
                <li>Authentic Greek restaurants and shops</li>
                <li>Cultural heritage and festivals</li>
                <li>Scenic waterfront and nature areas</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Nearby Attractions</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Tarpon Springs Sponge Docks (0.5 miles)</li>
                <li>Anclote River Park (2 miles)</li>
                <li>Dunedin Marina (8 miles)</li>
                <li>Clearwater Beach (15 miles)</li>
                <li>Tampa Bay area attractions (30 miles)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Transportation & Parking</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Free on-site parking available</li>
                <li>Street parking nearby</li>
                <li>Accessible by car from major highways</li>
                <li>Public transportation options</li>
                <li>Walking distance to downtown Tarpon Springs</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Tourism Recognition</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Florida's largest arcade collection</li>
                <li>Unique tourist destination</li>
                <li>Family-friendly attraction</li>
                <li>Educational tourism value</li>
                <li>Retro gaming destination</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Keywords & Categories */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Keywords & Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Primary Keywords</h3>
              <p className="text-gray-600 dark:text-gray-300">
                arcade museum, pinball museum, retro gaming, vintage arcade, classic games, 
                Tarpon Springs attractions, Florida museums, interactive museum, gaming history, 
                family entertainment, Tampa Bay attractions
              </p>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Business Categories</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Museums</li>
                <li>Entertainment Venues</li>
                <li>Tourist Attractions</li>
                <li>Family Entertainment Centers</li>
                <li>Gaming Centers</li>
                <li>Educational Facilities</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Industry Classifications</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>NAICS 712110 - Museums</li>
                <li>NAICS 713120 - Amusement Arcades</li>
                <li>SIC 8412 - Museums and Art Galleries</li>
                <li>SIC 7993 - Coin-Operated Amusement Devices</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Target Audience</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Families with children</li>
                <li>Gaming enthusiasts</li>
                <li>Tourists and visitors</li>
                <li>Retro gaming fans</li>
                <li>Educational groups</li>
                <li>Corporate event planners</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Social Media & Online Presence */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Online Presence & Social Media
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Official Websites</h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-1">
                <li><a href="https://replaymuseum.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">replaymuseum.com</a> (Primary)</li>
                <li><a href="https://replaymuseum.org" className="text-indigo-600 dark:text-indigo-400 hover:underline">replaymuseum.org</a> (Official)</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Social Media Profiles</h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-1">
                <li><a href="https://www.facebook.com/replaymuseum" className="text-indigo-600 dark:text-indigo-400 hover:underline">Facebook: @replaymuseum</a></li>
                <li><a href="https://www.instagram.com/replaymuseum" className="text-indigo-600 dark:text-indigo-400 hover:underline">Instagram: @replaymuseum</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Online Reviews & Listings</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Google My Business listing</li>
                <li>TripAdvisor reviews</li>
                <li>Yelp business profile</li>
                <li>Facebook reviews and ratings</li>
                <li>Tourism website listings</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Digital Services</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Online event information</li>
                <li>Newsletter subscription</li>
                <li>Contact forms</li>
                <li>Group booking inquiries</li>
                <li>Gift card sales</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Citation Information */}
        <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Citation Information
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Proper Business Citation Format</h3>
              <div className="bg-white dark:bg-gray-800 p-4 rounded border font-mono text-sm">
                Replay Museum<br />
                119 East Tarpon Avenue<br />
                Tarpon Springs, FL 34689<br />
                Phone: (727) 940-3928<br />
                Website: replaymuseum.com
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Last Updated</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Data Accuracy</h3>
              <p className="text-gray-600 dark:text-gray-300">
                This information is maintained by Replay Museum and updated regularly to ensure accuracy 
                for search engines, AI assistants, and business directory listings.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LLMInfoPage;