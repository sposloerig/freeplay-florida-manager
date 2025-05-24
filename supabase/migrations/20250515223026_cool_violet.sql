/*
  # Add FAQ placeholder data

  1. Changes
    - Inserts initial FAQ data into the faqs table
    - Includes common questions about:
      - Admission
      - Gameplay
      - Events
      - General Information
    - Each FAQ has a category and order number for proper sorting
*/

-- Insert placeholder FAQs
INSERT INTO faqs (question, answer, category, order_number) VALUES
-- Admission FAQs
('How much does it cost to visit?', 'General admission is $16 for adults and $10 for children ages 6-12. Children under 6 are free with a paying adult. All games are set to free play after admission - no quarters needed!', 'Admission', 10),

('Do you offer group rates?', 'Yes! We offer special rates for groups of 10 or more. Please contact us at (727) 940-3928 or info@replaymuseum.org for group pricing and reservations.', 'Admission', 20),

('Can I leave and come back on the same day?', 'Yes! Your admission is good for the entire day. Just make sure to get a hand stamp before you leave.', 'Admission', 30),

-- Gameplay FAQs
('Do I need quarters or tokens?', 'No! All games are set to free play after admission. You can play as much as you want!', 'Gameplay', 40),

('What happens if a game isn''t working?', 'Please notify our staff immediately if you encounter any issues with a game. We have technicians on site who can help resolve most problems quickly.', 'Gameplay', 50),

('Are there age restrictions for certain games?', 'While there are no strict age restrictions, some games may require a certain height or ability level to play safely and effectively. Our staff can help recommend age-appropriate games.', 'Gameplay', 60),

-- Events FAQs
('Do you host birthday parties?', 'Yes! We offer special birthday party packages that include admission for your group, a private party area, and optional add-ons like cake and decorations. Contact us for details and booking.', 'Events', 70),

('Can I rent the museum for private events?', 'Absolutely! The museum is available for private events, corporate functions, and special occasions. We can accommodate groups of various sizes and customize the experience to your needs.', 'Events', 80),

('How do I sign up for tournaments?', 'Tournament registration is available online through our website or in person at the museum. Space is limited, so we recommend registering early!', 'Events', 90),

-- General FAQs
('Is there food available?', 'We have a selection of snacks and beverages available for purchase. Outside food and drinks are not permitted, but there are many restaurants within walking distance.', 'General', 100),

('Is parking available?', 'Yes, we have free parking available in our lot behind the building, as well as street parking on Tarpon Avenue.', 'General', 110),

('Are you wheelchair accessible?', 'Yes, our facility is fully wheelchair accessible with ramps and wide aisles between games. We also have accessible restrooms.', 'General', 120);